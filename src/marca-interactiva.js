/**
 * La construcción de la marca, bajo el dedo.
 *
 * Después de que la secuencia de entrada termina sola, el dibujo queda
 * disponible para arrastrar: la posición horizontal del puntero decide cuánto
 * de la construcción se ve, desde el lienzo vacío hasta la onda terminada.
 *
 * **Responde al puntero sin tener que agarrarlo.** La primera versión exigía
 * mantener pulsado, y eso la hacía invisible: casi nadie prueba a arrastrar un
 * dibujo. Ahora basta mover el puntero por encima, y la respuesta es inmediata
 * — que es lo único que hace que algo se sienta interactivo de verdad.
 *
 * El riesgo de cruzar el ratón por accidente y deshacer la marca se resuelve
 * al salir: vuelve entera sola. Y en táctil, donde no hay puntero que pasar,
 * sigue funcionando el arrastre, así que nada queda detrás de un gesto que el
 * dedo no tenga.
 *
 * Nada de información vive aquí dentro: el estado por defecto es el dibujo
 * completo y quien no interactúe nunca lo verá de otra manera. Es una mejora,
 * no un control.
 *
 * El reparto de tramos es EL MISMO que el de la animación de entrada en
 * `Portada.css`. Si allí cambian los tiempos, aquí cambian las fracciones, o
 * el dibujo se construirá en un orden al arrastrarlo y en otro al cargar.
 */

// Longitudes de trazo: las circunferencias reales (2πr) y el largo de la onda.
// Si cambian los radios en ConstruccionDeLaOnda.jsx, cambian aquí.
const LARGO = { mayor: 47.12, menor: 23.56, trazo: 45 }

// Cada pieza entra en su tramo del recorrido, solapándose como en la entrada.
const TRAMOS = {
  guias: [0, 0.16],
  mayor: [0.1, 0.46],
  menor: [0.36, 0.62],
  centros: [0.56, 0.68],
  trazo: [0.6, 0.95],
  cotas: [0.9, 1],
}

/** Cuánto ha avanzado `p` dentro del tramo [a, b], acotado entre 0 y 1. */
function avance(p, [a, b]) {
  return Math.min(1, Math.max(0, (p - a) / (b - a)))
}

export default function initMarcaInteractiva() {
  const svg = document.querySelector('.portada-construccion')
  if (!svg) return

  // Quien pidió menos movimiento no quiere que el dibujo se deshaga al rozarlo.
  const quieto = () =>
    document.documentElement.dataset.movimiento === 'reducido' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches

  const guias = svg.querySelector('.onda-guias')
  const mayor = svg.querySelector('.onda-circulo-mayor')
  const menor = svg.querySelector('.onda-circulo-menor')
  const centros = [...svg.querySelectorAll('.onda-centros circle')]
  const cotas = [...svg.querySelectorAll('.onda-cota')]
  const trazo = svg.querySelector('.onda-trazo')
  if (!guias || !mayor || !menor || !trazo) return

  /** Pinta el dibujo en el punto `p` del recorrido, de 0 a 1. */
  function pintar(p) {
    guias.style.opacity = avance(p, TRAMOS.guias)

    for (const [el, largo, tramo] of [
      [mayor, LARGO.mayor, TRAMOS.mayor],
      [menor, LARGO.menor, TRAMOS.menor],
      [trazo, LARGO.trazo, TRAMOS.trazo],
    ]) {
      el.style.strokeDasharray = largo
      el.style.strokeDashoffset = largo * (1 - avance(p, tramo))
    }

    // Los dos centros entran uno detrás del otro dentro de su propio tramo.
    const c = avance(p, TRAMOS.centros)
    centros.forEach((el, i) => {
      const suyo = Math.min(1, Math.max(0, (c - i * 0.35) / 0.65))
      el.style.opacity = suyo
      el.style.transform = `scale(${0.2 + 0.8 * suyo})`
    })

    const o = avance(p, TRAMOS.cotas)
    for (const el of cotas) el.style.opacity = o
  }

  /** Devuelve el dibujo a su estado completo, con una transición corta. */
  function soltar() {
    svg.classList.add('construccion-soltando')
    pintar(1)
  }

  let arrastrando = false

  /** Toma el mando del dibujo y lo pinta según dónde esté el puntero. */
  function seguir(evento) {
    // Corta la animación de entrada: sin esto, el CSS y este código pelearían
    // por las mismas propiedades. Al ser la secuencia de 7 s, lo normal es que
    // todavía esté corriendo cuando alguien llega con el ratón.
    svg.classList.add('construccion-manual')
    svg.classList.remove('construccion-soltando')

    const { left, width } = svg.getBoundingClientRect()
    pintar((evento.clientX - left) / width)
  }

  svg.addEventListener('pointermove', (evento) => {
    if (quieto()) return

    // Con ratón o lápiz basta pasar por encima. Con el dedo no hay «encima»:
    // ahí solo manda mientras se arrastra.
    if (evento.pointerType === 'touch' && !arrastrando) return

    if (arrastrando) evento.preventDefault()
    seguir(evento)
  })

  svg.addEventListener('pointerdown', (evento) => {
    if (quieto()) return
    arrastrando = true
    svg.setPointerCapture(evento.pointerId)
    seguir(evento)
  })

  for (const fin of ['pointerup', 'pointercancel', 'pointerleave']) {
    svg.addEventListener(fin, () => {
      arrastrando = false
      soltar()
    })
  }
}
