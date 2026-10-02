/**
 * Los medidores: se construyen, y después se dejan manejar.
 *
 * **Lo que enseña la interacción.** «100» no dice nada por sí solo: quien no
 * conoce Lighthouse no sabe si es notable o si lo saca cualquiera. Google
 * publica los tramos con los que reparte esa nota —0 a 49, 50 a 89, 90 a 100—
 * y aquí el arco toma el color del tramo en el que está mientras se mueve. Se
 * ve la cifra subir por «deficiente» y por «necesita mejorar» antes de
 * asentarse arriba, y se puede arrastrar de vuelta para sentir dónde están las
 * rayas. La nota bajo el anillo dice el tramo con todas las letras: el color
 * nunca va solo.
 *
 * **Por qué la construcción ya no va con el scroll.** Iba con
 * `animation-timeline: view()`, y ahí la velocidad no se elige: la pone el
 * scroll de quien mira, así que a poco que se baje rápido los cuatro anillos
 * aparecen llenos de golpe. Con un tiempo propio la construcción dura lo mismo
 * siempre y da tiempo a mirarla. Lo que se pierde —una animación sin nada de
 * JavaScript— se recupera en el estado por defecto: sin este archivo, o con
 * movimiento reducido, los anillos salen llenos con su puntuación de verdad,
 * que es la información completa.
 *
 * **La primera construcción no se interrumpe.** Mismo trato que la marca de la
 * portada: es una secuencia que cuenta algo y basta rozarla con el ratón para
 * deshacerla antes de que nadie la haya visto. Cada anillo empieza a responder
 * cuando termina el suyo.
 *
 * **El número y el arco salen de la misma fracción.** `pintar()` recibe un
 * valor y de ahí saca el recorte del trazo, la cifra y el tramo. No existe el
 * estado en el que el anillo va por medio y el número dice cien.
 *
 * **Con el dedo se mantiene pulsado.** Seguir al puntero no se puede: recorrer
 * un círculo es moverse también en vertical, y en vertical manda el scroll, así
 * que el navegador se queda el gesto y cancela el nuestro a la primera.
 * Ganarle exige `touch-action: none`, que convertiría los cuatro anillos
 * —media pantalla en móvil— en cuatro sitios donde la página no baja. Lo que sí
 * se puede es cambiar la posición por el tiempo: mantener el dedo apretado baja
 * la nota, cruzando los tramos al revés, y soltarlo la devuelve arriba. Es el
 * mismo control con la otra mano.
 */

// La construcción, y lo que separa la salida de un anillo de la del siguiente.
// Cuatro arrancando a la vez se leen como una imagen que aparece, no como
// cuatro medidas que se toman.
const CONSTRUCCION = 2200
const ESCALON = 260

// La respuesta al puntero: lo que tarda el arco en alcanzarlo al entrar, y en
// volver a su valor al salir. La vuelta es más larga porque es un remate.
const ENGANCHE = 260
const VUELTA = 900

// Lo que tarda en vaciarse del todo manteniendo el dedo apretado. Más rápido,
// un toque sin querer lo dejaría en nada; más lento, no daría tiempo a ver la
// cifra bajar antes de que se canse el pulgar.
const VACIADO = 1600

/**
 * Los tramos de Lighthouse, tal y como los publica Google. No son nuestros y
 * no se redondean a conveniencia: son la vara con la que se mide la página.
 *
 * El rango lleva espacios duros: la nota cabe en dos líneas justas y sin ellos
 * partía por dentro, dejando un «89» solo en la segunda.
 */
const TRAMOS = [
  { hasta: 49, clase: 'tramo-malo', nombre: 'Deficiente · 0 a 49' },
  { hasta: 89, clase: 'tramo-medio', nombre: 'Necesita mejorar · 50 a 89' },
  { hasta: Infinity, clase: 'tramo-bueno', nombre: 'Bueno · 90 a 100' },
]

const tramoDe = (n) => TRAMOS.find((t) => n <= t.hasta)

/** Arranca despacio y frena: la curva de algo que se construye. */
const asentado = (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2)

/** Frena al llegar: la curva de algo que responde. Es `--ease-out` en JS. */
const suave = (p) => 1 - (1 - p) ** 4

/** A ritmo constante: la curva de algo que se maneja y hay que poder medir. */
const seguido = (p) => p

/** Prepara un medidor. Devuelve su mando, o `null` si le falta alguna pieza. */
function prepararMedidor(medidor) {
  const anillo = medidor.querySelector('.medidor-anillo')
  const relleno = medidor.querySelector('.medidor-relleno')
  const cifra = medidor.querySelector('.medidor-valor')
  const nota = medidor.querySelector('.medidor-nota')
  if (!anillo || !relleno || !cifra || !nota) return null

  // El largo de la circunferencia lo pone el componente en una variable de
  // CSS; el valor y su tope, en atributos. Nada se vuelve a calcular aquí.
  // Se lee del `style` en línea: `getComputedStyle` obligaría a calcular los
  // estilos de la página entera para leer un número que está escrito ahí.
  const largo = parseFloat(relleno.style.getPropertyValue('--vuelta'))
  const tope = Number(medidor.dataset.tope)
  const real = Number(medidor.dataset.valor) / tope
  if (!largo || !tope || Number.isNaN(real)) return null

  const suya = nota.textContent

  const quieto = () =>
    document.documentElement.dataset.movimiento === 'reducido' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches

  let marco = 0
  let pintada = real
  let destino = real
  let tramo = null
  let etiquetando = false
  // `mandando`: el puntero tiene el anillo. `enganchado`: además el arco ya lo
  // alcanzó y lo sigue al milímetro.
  let mandando = false
  let enganchado = false
  let listo = false

  /** Pone el tramo en el que cae `n`, y su nombre si hay que explicarlo. */
  function ponerTramo(n) {
    const cual = tramoDe(n)
    if (cual === tramo) return
    if (tramo) medidor.classList.remove(tramo.clase)
    medidor.classList.add(cual.clase)
    tramo = cual
    if (etiquetando) nota.textContent = cual.nombre
  }

  /** Pinta el medidor en la fracción `f`: arco, cifra y tramo, del mismo dato. */
  function pintar(f) {
    pintada = f
    relleno.style.strokeDashoffset = largo * (1 - f)
    const n = Math.round(f * tope)
    cifra.textContent = n
    ponerTramo(n)
  }

  /**
   * Devuelve el anillo al CSS: color de marca, valor de verdad y su propia
   * explicación debajo. Todo lo que escribió este archivo se borra, para que
   * lo que se imprima o se lea salga de la hoja de estilos.
   */
  function asentar() {
    if (tramo) medidor.classList.remove(tramo.clase)
    tramo = null
    etiquetando = false
    mandando = false
    enganchado = false
    medidor.classList.remove('medidor-manual')
    relleno.style.strokeDashoffset = ''
    cifra.textContent = Math.round(real * tope)
    nota.textContent = suya
  }

  /**
   * Lleva el arco hasta `destino` en `ms`.
   *
   * El destino se lee en cada fotograma a propósito: mientras el arco va de
   * camino el puntero sigue moviéndose, y si se congelara el valor de salida
   * el arco aterrizaría donde el puntero ya no está.
   */
  function viajar(ms, curva, alLlegar) {
    cancelAnimationFrame(marco)
    const desde = pintada
    const t0 = performance.now()

    marco = requestAnimationFrame(function paso(t) {
      const p = Math.min(1, (t - t0) / ms)
      pintar(desde + (destino - desde) * curva(p))
      if (p < 1) {
        marco = requestAnimationFrame(paso)
      } else {
        marco = 0
        alLlegar?.()
      }
    })
  }

  /** Toma el mando: sin esto la hoja de estilos ganaría al estilo en línea. */
  function tomarElMando() {
    medidor.classList.add('medidor-manual')
  }

  /**
   * Corta por lo sano: para lo que haya en marcha y deja el anillo en su
   * puntuación, listo para responder.
   *
   * Cancelar el fotograma es lo que hace falta y `asentar()` no hace: mientras
   * el viaje siga vivo volverá a pintar encima en el siguiente fotograma y lo
   * limpiado no durará nada. Y como cancelarlo se lleva por delante el aviso
   * de «he llegado», el permiso para responder se da aquí a mano.
   */
  function rendir() {
    cancelAnimationFrame(marco)
    marco = 0
    listo = true
    asentar()
  }

  /** La construcción: de cero a su puntuación, subiendo por los tramos. */
  function construir() {
    if (quieto()) {
      listo = true
      return
    }
    tomarElMando()
    pintar(0)
    destino = real
    viajar(CONSTRUCCION, asentado, () => {
      asentar()
      listo = true
    })
  }

  /** Dónde está el puntero en la vuelta: 0 arriba, creciendo a la derecha. */
  function vueltaHasta(evento) {
    const caja = anillo.getBoundingClientRect()
    const x = evento.clientX - (caja.left + caja.width / 2)
    const y = evento.clientY - (caja.top + caja.height / 2)
    const angulo = Math.atan2(x, -y)
    return (angulo < 0 ? angulo + 2 * Math.PI : angulo) / (2 * Math.PI)
  }

  // ---- con ratón o lápiz: el arco se queda donde está el puntero ----

  /** El puntero toma el anillo: el arco viaja hasta él y luego lo sigue. */
  function tomar(evento) {
    mandando = true
    tomarElMando()
    etiquetando = true
    destino = vueltaHasta(evento)
    viajar(ENGANCHE, suave, () => {
      enganchado = true
    })
  }

  const conRaton = (evento) => listo && !quieto() && evento.pointerType !== 'touch'

  anillo.addEventListener('pointerenter', (evento) => {
    if (!conRaton(evento) || mandando) return
    tomar(evento)
  })

  anillo.addEventListener('pointermove', (evento) => {
    if (!conRaton(evento)) return

    // `pointerenter` puede haberse perdido: si el ratón ya estaba encima
    // cuando terminó la construcción, ese evento ya pasó y se rechazó por no
    // estar listo. Sin esto el anillo se quedaría muerto hasta salir y volver
    // a entrar, que es justo lo que nadie hace.
    if (!mandando) {
      tomar(evento)
      return
    }

    destino = vueltaHasta(evento)
    // Mientras el arco va de camino manda el viaje, que para eso relee el
    // destino en cada fotograma. Una vez alcanzado, se pinta sin suavizar:
    // cualquier retardo aquí se siente como que el arco va detrás del ratón.
    if (!enganchado) return
    cancelAnimationFrame(marco)
    marco = 0
    pintar(destino)
  })

  /** Suelta el anillo: sube de vuelta a su puntuación y se asienta. */
  function soltar() {
    if (!mandando) return
    mandando = false
    enganchado = false
    destino = real
    viajar(VUELTA, suave, asentar)
  }

  anillo.addEventListener('pointerleave', soltar)

  // ---- con el dedo: se mantiene pulsado y se vacía ----

  /**
   * Mantener el dedo baja la nota; soltarlo la devuelve.
   *
   * Es el mismo trato que con el ratón, con el tiempo de pulsación en lugar de
   * la posición: cuanto más se aguante, más abajo llega, y el recorrido cruza
   * los tramos al revés —verde, ámbar, rojo— hasta donde se quiera parar. Un
   * toque corto apenas hunde la aguja y la deja volver, que es justo la
   * invitación a mantenerlo apretado.
   *
   * El vaciado va a ritmo constante a propósito. Con una curva, el mismo
   * segundo de pulsación valdría distinto según cuándo cayera, y esto es un
   * control: hay que poder aprender cuánto baja por segundo. La vuelta sí
   * frena al llegar, porque no es un control sino un remate.
   *
   * `setPointerCapture` aguanta el temblor del pulgar sin dar la pulsación por
   * terminada. Si el dedo se pone a desplazar la página gana el navegador, que
   * cancela el gesto, y el anillo vuelve a su nota: exactamente lo que pasa al
   * soltar, así que no hay nada que arreglar ahí.
   */
  anillo.addEventListener('pointerdown', (evento) => {
    if (!listo || quieto() || evento.pointerType !== 'touch') return
    mandando = true
    tomarElMando()
    etiquetando = true
    anillo.setPointerCapture(evento.pointerId)
    destino = 0
    viajar(VACIADO, seguido)
  })

  for (const fin of ['pointerup', 'pointercancel']) {
    anillo.addEventListener(fin, (evento) => {
      if (evento.pointerType !== 'touch') return
      soltar()
    })
  }

  return { construir, rendir }
}

export default function initMedidores() {
  const fila = document.querySelector('.promesas')
  if (!fila) return

  const mandos = [...fila.querySelectorAll('.medidor')].map(prepararMedidor).filter(Boolean)
  if (!mandos.length) return

  // Al imprimir no vale lo que haya escrito este archivo: en el papel tiene
  // que salir el anillo lleno con su puntuación. Una regla `@media print` no
  // puede arreglarlo —ni gana a un estilo en línea, ni toca el texto de la
  // cifra—, así que se para la construcción y se limpia aquí.
  //
  // Por los dos caminos a propósito: `beforeprint` no llega en todos los
  // navegadores, y la consulta de medios `print` tampoco. Rendirse dos veces
  // no cuesta nada; salir a imprimir con los anillos a medias, sí.
  const aPapel = () => {
    for (const mando of mandos) mando.rendir()
  }

  addEventListener('beforeprint', aPapel)
  matchMedia('print').addEventListener('change', (m) => {
    if (m.matches) aPapel()
  })

  // La fila se construye cuando entra en pantalla, no al cargar: la sección
  // está muy abajo y la construcción existe para verse.
  const mirando = new IntersectionObserver(
    (entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return
      mirando.disconnect()
      mandos.forEach((mando, i) => setTimeout(mando.construir, i * ESCALON))
    },
    { threshold: 0.25 }
  )

  mirando.observe(fila)
}
