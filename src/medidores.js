/**
 * Los medidores, bajo el puntero.
 *
 * El primer llenado va con el scroll y no se toca. A partir de ahí el anillo
 * responde, y el número dice cuánto hay lleno en ese momento. Al soltarlo
 * vuelve solo a su valor de verdad.
 *
 * **El número y el arco salen de la misma fracción.** No son dos cosas que se
 * sincronizan: `pintar()` recibe un solo valor y de ahí saca el recorte del
 * trazo y la cifra. Así no existe el estado en el que el anillo va por medio y
 * el número dice cien.
 *
 * **Con ratón se sigue el puntero; con el dedo, no.**
 *
 * Con ratón o lápiz la punta del arco se queda donde está el puntero, como la
 * aguja de un dial: el recorrido de un círculo ES la vuelta, así que el ángulo
 * manda. Entrar por el lado izquierdo del anillo es entrar por el 75 % de la
 * vuelta, y saltar de cien a setenta y cinco de golpe se lee como un fallo, así
 * que el arco viaja hasta el puntero en un cuarto de segundo y a partir de ahí
 * lo sigue al milímetro.
 *
 * Con el dedo eso no se puede hacer, y no por falta de ganas. Recorrer un
 * círculo es moverse también en vertical, y en vertical manda el scroll: el
 * navegador se queda el gesto y cancela el nuestro a la primera. La única
 * manera de ganarle es `touch-action: none`, que en móvil convertiría los
 * cuatro anillos —media pantalla— en cuatro sitios donde la página no baja.
 * No merece la pena. Ahí el toque hace lo otro que el medidor sabe hacer:
 * vaciarse y volver a llenarse contando, que es la misma información contada
 * con el tiempo en vez de con la posición.
 *
 * Nada de información vive detrás del gesto: el estado por defecto es el
 * anillo lleno con su puntuación real, y quien no interactúe —o quien haya
 * pedido menos movimiento— nunca lo verá de otra manera.
 */

// Lo que tarda el arco en alcanzar al puntero al entrar, y en recorrer el
// camino de vuelta a su valor. La vuelta es más larga porque es un remate, no
// una respuesta.
const ENGANCHE = 260
const VUELTA = 900

/** Aproximación en JavaScript de `--ease-out`, la curva del resto del sitio. */
const suave = (p) => 1 - (1 - p) ** 4

export default function initMedidores() {
  const medidores = [...document.querySelectorAll('.medidor')]
  if (!medidores.length) return

  const quieto = () =>
    document.documentElement.dataset.movimiento === 'reducido' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches

  for (const medidor of medidores) {
    const anillo = medidor.querySelector('.medidor-anillo')
    const relleno = medidor.querySelector('.medidor-relleno')
    const cifra = medidor.querySelector('.medidor-valor')
    if (!anillo || !relleno || !cifra) continue

    // El largo de la circunferencia lo pone el componente en una variable de
    // CSS; el valor y su tope, en atributos. Nada se vuelve a calcular aquí.
    const largo = parseFloat(getComputedStyle(relleno).getPropertyValue('--vuelta'))
    const tope = Number(medidor.dataset.tope)
    const real = Number(medidor.dataset.valor) / tope
    if (!largo || !tope || Number.isNaN(real)) continue

    let marco = 0
    let pintada = real
    let destino = real
    let enganchado = false

    /** Pinta el medidor en la fracción `f`: el arco y la cifra, del mismo dato. */
    function pintar(f) {
      pintada = f
      relleno.style.strokeDashoffset = largo * (1 - f)
      cifra.textContent = Math.round(f * tope)
    }

    /** Dónde está el puntero en la vuelta: 0 arriba, creciendo a la derecha. */
    function vueltaHasta(evento) {
      const caja = anillo.getBoundingClientRect()
      const x = evento.clientX - (caja.left + caja.width / 2)
      const y = evento.clientY - (caja.top + caja.height / 2)
      const angulo = Math.atan2(x, -y)
      return (angulo < 0 ? angulo + 2 * Math.PI : angulo) / (2 * Math.PI)
    }

    /**
     * Lleva el arco hasta `destino` en `ms`.
     *
     * El destino se lee en cada fotograma a propósito: mientras el arco va de
     * camino el puntero sigue moviéndose, y si se congelara el valor de salida
     * el arco aterrizaría donde el puntero ya no está.
     */
    function viajar(ms, alLlegar) {
      cancelAnimationFrame(marco)
      const desde = pintada
      const t0 = performance.now()

      marco = requestAnimationFrame(function paso(t) {
        const p = Math.min(1, (t - t0) / ms)
        pintar(desde + (destino - desde) * suave(p))
        if (p < 1) {
          marco = requestAnimationFrame(paso)
        } else {
          marco = 0
          alLlegar?.()
        }
      })
    }

    /** Toma el mando: sin esto la animación del scroll ganaría al estilo en línea. */
    function tomarElMando() {
      medidor.classList.add('medidor-manual')
    }

    /** Devuelve el anillo a su puntuación y le suelta el mando al CSS. */
    function soltar() {
      if (!enganchado && !marco) return
      enganchado = false
      destino = real
      viajar(VUELTA, () => {
        medidor.classList.remove('medidor-manual')
        relleno.style.strokeDashoffset = ''
        cifra.textContent = Math.round(real * tope)
      })
    }

    // ---- con ratón o lápiz: el arco se queda donde está el puntero ----

    anillo.addEventListener('pointerenter', (evento) => {
      if (quieto() || evento.pointerType === 'touch') return
      tomarElMando()
      destino = vueltaHasta(evento)
      viajar(ENGANCHE, () => {
        enganchado = true
      })
    })

    anillo.addEventListener('pointermove', (evento) => {
      if (quieto() || evento.pointerType === 'touch') return
      destino = vueltaHasta(evento)
      // Mientras el arco va de camino manda el viaje, que para eso relee el
      // destino en cada fotograma. Una vez alcanzado, se pinta sin suavizar:
      // cualquier retardo aquí se siente como que el arco va detrás del ratón.
      if (!enganchado) return
      cancelAnimationFrame(marco)
      marco = 0
      pintar(destino)
    })

    anillo.addEventListener('pointerleave', soltar)

    // ---- con el dedo: se vacía y se vuelve a llenar contando ----

    anillo.addEventListener('pointerdown', (evento) => {
      if (quieto() || evento.pointerType !== 'touch' || marco) return
      tomarElMando()
      pintar(0)
      destino = real
      viajar(VUELTA, () => {
        medidor.classList.remove('medidor-manual')
        relleno.style.strokeDashoffset = ''
        cifra.textContent = Math.round(real * tope)
      })
    })
  }
}
