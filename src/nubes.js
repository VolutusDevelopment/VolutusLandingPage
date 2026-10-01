/**
 * Las nubes y el mar: la trama del logotipo, viva.
 *
 * Este archivo es solo la mitad de la página. El dibujo —el shader, WebGL, el
 * bucle de fotogramas— vive en un Web Worker (`nubes-lienzo.js`) con un
 * OffscreenCanvas, así que el hilo principal nunca espera a la GPU. Aquí solo
 * se mide, se leen los colores y se avisa de lo que cambia.
 *
 * Cada `canvas.nubes` dice qué mira con `data-vista`: `cielo` (las nubes) o
 * `mar` (el agua bajo ellas). El color lo toma de `--nubes-luz`,
 * `--nubes-sombra`, `--nubes-borde` y `--nubes-alfa`, que el CSS resuelve
 * según la zona. Tienen que ser hex: aquí se leen tal cual. El lado de la celda
 * de la trama, en px CSS, lo da `--nubes-celda`.
 *
 * El cielo además escucha al cursor: le cuenta al pintor por dónde pasa sobre
 * su sección, y el pintor lo vuelve viento. Lo mismo con lo que la página haga
 * pasar por la nube —los patos de la 404—, que lo avisa con un evento `soplo`
 * en el lienzo. Y el juego de la 404 cambia la forma de la nube con un evento
 * `forma`, que aquí solo se reenvía al pintor (ver patos.js).
 *
 * Qué NO hace, a propósito:
 *
 *   - Nada antes del LCP. Arranca después de `load`, cuando el navegador está
 *     ocioso, y el lienzo aparece con un fundido cuando ya tiene fotograma.
 *     Sin OffscreenCanvas o sin GPU, el lienzo queda transparente y la página
 *     sigue entera.
 *   - Nada fuera de pantalla. Se para al salir del viewport y con la pestaña
 *     oculta.
 *   - Nada con movimiento reducido. Pinta un solo fotograma, quieto, y el
 *     cursor no lo mueve.
 */

import { quieto } from './lib/movimiento.js'

// Tope de densidad de píxeles: por encima de 1.5 los puntos no se ven mejor y
// el costo sigue creciendo. Los patos (patos.js) lo usan para caer en la misma
// rejilla de puntos.
export const DPR_MAXIMO = 1.5

const rgb = (hex) => {
  const n = parseInt(hex.trim().slice(1), 16)
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function montar(pintor, lienzo, id) {
  let visible = false

  function medir() {
    const dpr = Math.min(devicePixelRatio, DPR_MAXIMO)
    const celda = parseFloat(getComputedStyle(lienzo).getPropertyValue('--nubes-celda'))
    pintor.postMessage({
      tipo: 'medir',
      id,
      ancho: Math.round(lienzo.clientWidth * dpr),
      alto: Math.round(lienzo.clientHeight * dpr),
      celda: Math.round(celda * dpr),
    })
  }

  function colorear() {
    const estilo = getComputedStyle(lienzo)
    const valor = (nombre) => estilo.getPropertyValue(nombre)
    pintor.postMessage({
      tipo: 'colores',
      id,
      luz: rgb(valor('--nubes-luz')),
      sombra: rgb(valor('--nubes-sombra')),
      borde: rgb(valor('--nubes-borde')),
      alfa: parseFloat(valor('--nubes-alfa')),
    })
  }

  function activar() {
    pintor.postMessage({ tipo: 'activa', id, valor: visible && !document.hidden })
  }

  // El pintor lleva un solo trazo de viento, y no solo lo sopla el cursor: un
  // pato de la 404 que cae también, con un evento `soplo` en el lienzo. Mientras
  // cae, el viento es suyo y el cursor calla; si no, el pintor uniría los
  // puntos de los dos en una ráfaga de uno al otro. Al cambiar de dueño se
  // corta el trazo y se calla 50 ms, lo que tarda el pintor (a 30 fps) en
  // llevarse lo que quedaba del anterior.
  let ajeno = false
  let callado = 0

  function ceder(aAjeno) {
    ajeno = aAjeno
    callado = performance.now() + 50
    pintor.postMessage({ tipo: 'viento', id, fuera: true })
  }

  // Un punto del viento, en coordenadas de la ventana: el pintor lo quiere en
  // píxeles de su lienzo.
  function soplar(x, y) {
    if (!visible || quieto() || performance.now() < callado) return
    const caja = lienzo.getBoundingClientRect()
    const dpr = Math.min(devicePixelRatio, DPR_MAXIMO)
    pintor.postMessage({ tipo: 'viento', id, x: (x - caja.left) * dpr, y: (y - caja.top) * dpr })
  }

  // Ratón y lápiz por `pointermove`; el dedo por `touchmove`, que sigue
  // llegando mientras la página se desplaza (`pointermove` se cancela en
  // cuanto empieza el scroll). Nada impide desplazar. Como mucho un aviso por
  // fotograma, y la caja del lienzo se lee en ese fotograma, no en cada evento.
  function seguirCursor() {
    const seccion = lienzo.closest('section')
    let cursor = null
    const soplarCursor = () => {
      if (!ajeno) soplar(cursor.x, cursor.y)
      cursor = null
    }
    const seguir = ({ clientX, clientY }) => {
      if (!cursor) requestAnimationFrame(soplarCursor)
      cursor = { x: clientX, y: clientY }
    }
    const soltar = () => {
      if (!ajeno) pintor.postMessage({ tipo: 'viento', id, fuera: true })
    }
    const pasivo = { passive: true }
    seccion.addEventListener('pointermove', (evento) => evento.pointerType !== 'touch' && seguir(evento), pasivo)
    seccion.addEventListener('touchmove', (evento) => seguir(evento.touches[0]), pasivo)
    seccion.addEventListener('pointerleave', soltar)
    seccion.addEventListener('touchend', soltar, pasivo)
  }

  const offscreen = lienzo.transferControlToOffscreen()
  const mar = lienzo.dataset.vista === 'mar'
  pintor.postMessage({ tipo: 'montar', id, lienzo: offscreen, mar }, [offscreen])
  colorear()
  medir()
  if (!mar) {
    seguirCursor()
    lienzo.addEventListener('soplo', ({ detail: { x, y, fuera } }) => {
      if (fuera) {
        if (ajeno) ceder(false)
        return
      }
      if (!ajeno) ceder(true)
      soplar(x, y)
    })
    lienzo.addEventListener('forma', ({ detail }) => pintor.postMessage({ tipo: 'forma', id, ...detail }))
  }

  new ResizeObserver(medir).observe(lienzo)
  new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting
    activar()
  }).observe(lienzo)
  document.addEventListener('visibilitychange', activar)

  return colorear
}

export default function initNubes() {
  const lienzos = document.querySelectorAll('canvas.nubes')
  if (!lienzos.length || !('transferControlToOffscreen' in HTMLCanvasElement.prototype)) return

  function arrancar() {
    const pintor = new Worker(new URL('./nubes-lienzo.js', import.meta.url), { type: 'module' })
    pintor.onmessage = ({ data }) => lienzos[data.id].classList.add('vivo')

    const avisarQuieto = () => pintor.postMessage({ tipo: 'quieto', valor: quieto() })
    avisarQuieto()
    const recolorear = [...lienzos].map((lienzo, id) => montar(pintor, lienzo, id))

    // El panel de accesibilidad puede cambiar el tema o el movimiento con la
    // página abierta: los dos cambian lo que se pinta.
    new MutationObserver(() => {
      recolorear.forEach((colorear) => colorear())
      avisarQuieto()
    }).observe(document.documentElement, { attributeFilter: ['data-tema', 'data-movimiento'] })
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', avisarQuieto)
  }

  const ocioso = window.requestIdleCallback ?? ((f) => setTimeout(f, 1))
  if (document.readyState === 'complete') ocioso(arrancar)
  else addEventListener('load', () => ocioso(arrancar), { once: true })
}
