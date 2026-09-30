/**
 * Las nubes y sus sombras: la trama del logotipo, viva.
 *
 * Este archivo es solo la mitad de la página. El dibujo —el shader, WebGL, el
 * bucle de fotogramas— vive en un Web Worker (`nubes-lienzo.js`) con un
 * OffscreenCanvas, así que el hilo principal nunca espera a la GPU. Aquí solo
 * se mide, se leen los colores y se avisa de lo que cambia.
 *
 * Cada `canvas.nubes` dice qué cara mira con `data-vista`: `cielo` (las nubes)
 * o `suelo` (sus sombras). El color lo toma de `--nubes-cerca`,
 * `--nubes-lejos` y `--nubes-alfa`, que el CSS resuelve según la zona.
 *
 * Qué NO hace, a propósito:
 *
 *   - Nada antes del LCP. Arranca después de `load`, cuando el navegador está
 *     ocioso, y el lienzo aparece con un fundido cuando ya tiene fotograma.
 *     Sin OffscreenCanvas o sin GPU, el lienzo queda transparente y la página
 *     sigue entera.
 *   - Nada fuera de pantalla. Se para al salir del viewport y con la pestaña
 *     oculta.
 *   - Nada con movimiento reducido. Pinta un solo fotograma, quieto.
 */

import { quieto } from './lib/movimiento.js'

// Lado de la celda de la trama, en px CSS, y el tope de densidad de píxeles:
// por encima de 1.5 los puntos no se ven mejor y el costo sigue creciendo.
const CELDA = 9
const DPR_MAXIMO = 1.5

const rgb = (hex) => {
  const n = parseInt(hex.trim().slice(1), 16)
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function montar(pintor, lienzo, id) {
  let visible = false

  function medir() {
    const dpr = Math.min(devicePixelRatio, DPR_MAXIMO)
    pintor.postMessage({
      tipo: 'medir',
      id,
      ancho: Math.round(lienzo.clientWidth * dpr),
      alto: Math.round(lienzo.clientHeight * dpr),
      celda: Math.round(CELDA * dpr),
    })
  }

  function colorear() {
    const estilo = getComputedStyle(lienzo)
    const valor = (nombre) => estilo.getPropertyValue(nombre)
    pintor.postMessage({
      tipo: 'colores',
      id,
      cerca: rgb(valor('--nubes-cerca')),
      lejos: rgb(valor('--nubes-lejos')),
      alfa: parseFloat(valor('--nubes-alfa')),
    })
  }

  function activar() {
    pintor.postMessage({ tipo: 'activa', id, valor: visible && !document.hidden })
  }

  const offscreen = lienzo.transferControlToOffscreen()
  const cielo = lienzo.dataset.vista === 'cielo'
  pintor.postMessage({ tipo: 'montar', id, lienzo: offscreen, cielo }, [offscreen])
  colorear()
  medir()

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
