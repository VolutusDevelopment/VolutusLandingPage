/**
 * La construcción de la marca, bajo el dedo.
 *
 * La secuencia de entrada se ve entera, sin que nadie pueda cortarla. Cuando
 * termina, el dibujo queda vivo: la posición horizontal del puntero decide
 * cuánto de la construcción se ve, desde el lienzo vacío hasta la onda
 * terminada.
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

// Cada pieza entra en su tramo del recorrido, solapándose como en la entrada.
// Los cuadrados y los centros se reparten el suyo por orden, igual que su
// `animation-delay` en el CSS.
const TRAMOS = {
  guias: [0, 0.14],
  cuadro: (i) => [0.08 + i * 0.085, 0.24 + i * 0.085],
  centro: (i) => [0.44 + i * 0.02, 0.52 + i * 0.02],
  trazo: [0.54, 0.91],
  cotas: [0.87, 1],
}

/** Cuánto ha avanzado `p` dentro del tramo [a, b], acotado entre 0 y 1. */
function avance(p, [a, b]) {
  return Math.min(1, Math.max(0, (p - a) / (b - a)))
}

/** Trazo parcial: la longitud la trae cada pieza en su `--largo`. */
function trazar(el, fraccion) {
  const largo = parseFloat(el.style.getPropertyValue('--largo'))
  el.style.strokeDasharray = largo
  el.style.strokeDashoffset = largo * (1 - fraccion)
}

export default function initMarcaInteractiva() {
  const svg = document.querySelector('.portada-construccion')
  if (!svg) return

  // Quien pidió menos movimiento no quiere que el dibujo se deshaga al rozarlo.
  const quieto = () =>
    document.documentElement.dataset.movimiento === 'reducido' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches

  const guias = svg.querySelector('.onda-guias')
  const cuadros = [...svg.querySelectorAll('.onda-cuadro')]
  const centros = [...svg.querySelectorAll('.onda-centros circle')]
  const cotas = [...svg.querySelectorAll('.onda-cota')]
  const trazo = svg.querySelector('.onda-trazo')
  if (!guias || !trazo) return

  /** Pinta el dibujo en el punto `p` del recorrido, de 0 a 1. */
  function pintar(p) {
    guias.style.opacity = avance(p, TRAMOS.guias)
    cuadros.forEach((el, i) => trazar(el, avance(p, TRAMOS.cuadro(i))))
    trazar(trazo, avance(p, TRAMOS.trazo))

    centros.forEach((el, i) => {
      const suyo = avance(p, TRAMOS.centro(i))
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

  /**
   * La primera construcción no se interrumpe.
   *
   * Es una secuencia de siete segundos que cuenta algo, y basta que el ratón
   * pase por encima sin querer para deshacerla antes de que nadie la haya
   * visto. Hasta que termina sola, el dibujo no responde; después, sí.
   *
   * El final se detecta por `animationend` de las cotas, que son lo último en
   * entrar. El temporizador es el respaldo para cuando ese evento no llega: si
   * la pestaña está en segundo plano el navegador no corre la animación, y sin
   * él el dibujo se quedaría inerte para siempre.
   */
  let listo = false

  function habilitar() {
    if (listo) return
    listo = true
    svg.classList.add('construccion-lista')
  }

  const ultima = svg.querySelector('.onda-cota')
  if (quieto() || !ultima) {
    habilitar()
  } else {
    ultima.addEventListener('animationend', habilitar, { once: true })
    setTimeout(habilitar, 9000)
  }

  /** Toma el mando del dibujo y lo pinta según dónde esté el puntero. */
  function seguir(evento) {
    // Deja fuera de juego lo que quede de la animación: sin esto, el CSS y
    // este código pelearían por las mismas propiedades.
    svg.classList.add('construccion-manual')
    svg.classList.remove('construccion-soltando')

    const { left, width } = svg.getBoundingClientRect()
    pintar((evento.clientX - left) / width)
  }

  svg.addEventListener('pointermove', (evento) => {
    if (!listo || quieto()) return

    // Con ratón o lápiz basta pasar por encima. Con el dedo no hay «encima»:
    // ahí solo manda mientras se arrastra.
    if (evento.pointerType === 'touch' && !arrastrando) return

    if (arrastrando) evento.preventDefault()
    seguir(evento)
  })

  svg.addEventListener('pointerdown', (evento) => {
    if (!listo || quieto()) return
    arrastrando = true
    svg.setPointerCapture(evento.pointerId)
    seguir(evento)
  })

  for (const fin of ['pointerup', 'pointercancel', 'pointerleave']) {
    svg.addEventListener(fin, () => {
      if (!listo) return
      arrastrando = false
      soltar()
    })
  }
}
