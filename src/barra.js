/**
 * La barra toma la zona y la hora del día de lo que tiene debajo, y marca la
 * sección que se está leyendo.
 *
 * El vidrio es translúcido, pero no basta: sobre la zona de plano un vidrio
 * claro se lee como una mancha blanca. Aquí solo se decide QUÉ zona hay
 * debajo; el color lo resuelven los tokens de `.zona-cielo`, `.zona-plano` y
 * `.hora-*`, así que la barra no conoce ningún color.
 *
 * Tres preguntas, cada una con su franja:
 *
 * - **La barra**, una franja fina a la altura de la cápsula y a todo lo ancho:
 *   la sección que pasa por debajo da el tono al velo.
 * - **El logo y la cápsula**, cada uno lo que tiene detrás: una línea de 1 px
 *   en su canto de arriba y otra en el de abajo, solo a su ancho. Dentro de
 *   una sección clara pasan tarjetas oscuras, y cada pieza tiene que
 *   reaccionar a su propio fondo, no a la sección. Manda el canto por el que
 *   entra el fondo nuevo —el de abajo al bajar, el de arriba al subir—, así
 *   que el color empieza a cambiar en cuanto el fondo asoma, y a mitad de la
 *   transición (Barra.css) el fondo ya cubre media pieza.
 * - **La sección actual**, a un tercio de la pantalla, para `aria-current`.
 *   Detrás del vidrio no sirve: al saltar a un ancla, `scroll-padding` deja
 *   el final de la sección anterior bajo la barra y se marcaría el enlace
 *   equivocado. El lector de pantalla anuncia el enlace como la ubicación
 *   actual y el indicador de la cápsula (Barra.css) descansa sobre él.
 */

// Recuerda TODOS los elementos dentro de la franja, también los que salen:
// bajando despacio el scroll retrocede a veces unos píxeles, y si solo se
// atendiera a los que entran, se quedaría con uno que ya se fue. El Set guarda
// el orden de entrada, así que el último es el que acaba de asomar (y una
// tarjeta entra después que la sección que la contiene).
function vigilarFranja(elementos, rootMargin, alCambiar) {
  const enLaFranja = new Set()
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) enLaFranja.add(target)
        else enLaFranja.delete(target)
      })
      alCambiar([...enLaFranja].at(-1))
    },
    { rootMargin }
  )
  elementos.forEach((elemento) => observador.observe(elemento))
  return observador
}

// Copia la zona y la hora de lo que hay detrás. Una tarjeta no lleva hora
// propia: la hereda de su sección.
function tomarZona(destino, debajo) {
  if (!debajo) return
  const plano = debajo.classList.contains('zona-plano')
  destino.classList.toggle('zona-plano', plano)
  destino.classList.toggle('zona-cielo', !plano)
  const esHora = (clase) => clase.startsWith('hora-')
  destino.classList.remove(...[...destino.classList].filter(esHora))
  const hora = [...(debajo.closest('.seccion, .pie')?.classList ?? [])].find(esHora)
  if (hora) destino.classList.add(hora)
}

// Hacia dónde va el scroll: decide qué canto de cada pieza manda.
let bajando = true
let ultimoY = 0
addEventListener(
  'scroll',
  () => {
    bajando = scrollY >= ultimoY
    ultimoY = scrollY
  },
  { passive: true }
)

// El margen negativo recorta la pantalla hasta dejar una línea de 1 px a la
// altura `y` y del ancho de la pieza. La barra es fija arriba, así que las
// líneas solo se mueven al cambiar el tamaño de la ventana; una pieza oculta
// (la cápsula en S) no mide nada y no se vigila.
function vigilarDetras(pieza, fondos) {
  const detras = { arriba: undefined, abajo: undefined }
  const decidir = () => tomarZona(pieza, bajando ? detras.abajo : detras.arriba)
  let observadores = []
  const medir = () => {
    observadores.forEach((observador) => observador.disconnect())
    const caja = pieza.getBoundingClientRect()
    if (!caja.width) return
    const { clientWidth: ancho, clientHeight: alto } = document.documentElement
    const linea = (y) =>
      [y, ancho - caja.right, alto - y - 1, caja.left].map((px) => `${-Math.round(px)}px`).join(' ')
    observadores = ['arriba', 'abajo'].map((canto) =>
      vigilarFranja(fondos, linea(canto === 'arriba' ? caja.top : caja.bottom - 1), (debajo) => {
        detras[canto] = debajo
        decidir()
      })
    )
  }
  medir()
  addEventListener('resize', medir)
}

export default function initBarra() {
  const barra = document.querySelector('.barra')
  const zonas = document.querySelectorAll('main > .seccion, .pie')
  if (!barra || !zonas.length) return

  // La lente (Barra.jsx) va en `backdrop-filter`, y un filtro SVG ahí solo lo
  // pinta Chromium. CSS no puede preguntarlo —`@supports` dice que sí también
  // donde no se pinta— y `userAgentData` solo existe en Chromium.
  if (navigator.userAgentData) barra.classList.add('barra-refracta')

  vigilarFranja(zonas, '-4% 0px -95% 0px', (debajo) => tomarZona(barra, debajo))

  const fondos = document.querySelectorAll('main > .seccion, main .zona-plano, .pie')
  barra.querySelectorAll('.barra-marca, .barra-capsula').forEach((pieza) => vigilarDetras(pieza, fondos))

  // Solo las secciones que tienen enlace: fuera de ellas no se marca ninguno.
  const enlaces = [...barra.querySelectorAll('.barra-enlaces a')]
  const destinos = enlaces.map((enlace) => document.getElementById(enlace.hash.slice(1)))
  vigilarFranja(destinos.filter(Boolean), '-33% 0px -66% 0px', (actual) => {
    enlaces.forEach((enlace, i) => {
      if (destinos[i] && destinos[i] === actual) enlace.setAttribute('aria-current', 'location')
      else enlace.removeAttribute('aria-current')
    })
  })
}
