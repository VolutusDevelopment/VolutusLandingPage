/**
 * Las nubes y el mar: la trama del logotipo, viva.
 *
 * Este archivo es solo la mitad de la página. El dibujo —el shader, WebGL, el
 * bucle de fotogramas— vive en un Web Worker (`nubes-lienzo.js`) con un
 * OffscreenCanvas, así que el hilo principal nunca espera a la GPU. Aquí solo
 * se mide, se leen los colores y se avisa de lo que cambia.
 *
 * Cada `canvas.nubes` dice qué mira con `data-vista`: `cielo` (las nubes),
 * `mar` (el agua bajo ellas) u `ola` (la ola del logotipo, en el plano de la
 * marca de /nosotros). La ola trae su trama en el SVG que la sigue, que es lo
 * que se ve hasta que el lienzo pinta, y dice en `data-celdas` cuántos puntos
 * mide de lado. El cielo dice además desde dónde se mira la nube, con
 * `data-perspectiva`: la cámara de su página en lib/volutus.js (`aire` si no
 * lo dice). El color lo toma de `--nubes-luz`, `--nubes-sombra`, `--nubes-alfa`
 * y, en el mar y la ola, `--nubes-borde`, que el CSS resuelve según la zona.
 * Tienen que ser hex: aquí se leen tal cual. El lado de la celda de la trama,
 * en px CSS, lo da `--nubes-celda` (ver `rejilla`).
 *
 * El cielo y la ola escuchan al cursor, o al dedo: le cuentan al pintor por
 * dónde pasa sobre su sección, y el pintor lo vuelve viento. La ola, además,
 * se dibuja cuando asoma a medias. Lo mismo con lo que la
 * página haga pasar por la nube —los patos de la 404—, que lo avisa con un
 * evento `soplo` en el lienzo. Y el juego de la 404 cambia la forma de la nube
 * con un evento `forma`, que aquí solo se reenvía al pintor (ver patos.js).
 * Cuando un lienzo ya pinta, recibe la clase y el evento `vivo`: el juego de
 * /patos lo espera para empezar.
 *
 * Y el mar tiene un pato. Sale a nadar en cuanto el mar asoma —lo pinta y lo
 * mueve el pintor, con la física del agua— y es un enlace a /patos, que aquí
 * sigue al pato que se ve.
 *
 * Qué NO hace, a propósito:
 *
 *   - Nada antes del LCP. Arranca después de `load`, cuando el navegador está
 *     ocioso, y el lienzo aparece con un fundido cuando ya tiene fotograma.
 *     Sin OffscreenCanvas o sin GPU, el lienzo queda transparente y la página
 *     sigue entera.
 *   - Nada fuera de pantalla. Se para al salir del viewport y con la pestaña
 *     oculta.
 *   - Nada con movimiento reducido. Pinta un solo fotograma, quieto, el cursor
 *     no lo mueve y el pato no sale.
 */

import { quieto } from './lib/movimiento.js'

// Tope de densidad de píxeles del mar: por encima de 1.5 sus puntos no se ven
// mejor y el costo sigue creciendo.
const DPR_MAXIMO = 1.5

// La rejilla del cielo: el lado del punto en px CSS (`lado`, de
// `--nubes-celda`), cuántos px del lienzo mide (`celda`) y cuántos px del
// lienzo hay por px CSS (`densidad`). El lienzo se pinta a la densidad real de
// la pantalla, hasta 3, un píxel del lienzo por píxel del aparato: a 1.5, el
// teléfono lo estiraba y la trama se veía borrosa. La celda es un número
// entero de esos píxeles, así que el punto mide `lado` px CSS, redondeado al
// píxel del aparato, y nunca menos de 3: con 2, en una pantalla común, cada
// punto llenaba su celda sin hueco y la trama desaparecía. Los patos de la
// 404 (patos.js) caen en la misma rejilla.
export function rejilla(lienzo) {
  const lado = parseFloat(getComputedStyle(lienzo).getPropertyValue('--nubes-celda'))
  const densidad = Math.min(devicePixelRatio, 3)
  return { lado, celda: Math.max(3, Math.round(lado * densidad)), densidad }
}

// El enlace de cada pato del mar, por lienzo.
const patos = new Map()

const rgb = (hex) => {
  const n = parseInt(hex.trim().slice(1), 16)
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

// Una sola vez, cuando el lienzo asoma a medias: así se ve lo que pasa.
function alAsomar(lienzo, hacer) {
  const asomo = new IntersectionObserver(
    ([entrada]) => {
      if (!entrada.isIntersecting) return
      asomo.disconnect()
      hacer()
    },
    { threshold: 0.5 },
  )
  asomo.observe(lienzo)
}

// La trama de la ola sale del SVG que el lienzo reemplaza: el mismo dibujo,
// sin traerlo dos veces.
function tramaDeLaOla(lienzo) {
  const svg = lienzo.nextElementSibling
  return {
    puntos: svg.querySelector('path').getAttribute('d'),
    caja: svg.getAttribute('viewBox').split(' ').map(Number),
    celdas: Number(lienzo.dataset.celdas),
  }
}

function montar(pintor, lienzo, id) {
  const { vista } = lienzo.dataset
  const mar = vista === 'mar'
  const ola = vista === 'ola'
  let visible = false
  // Píxeles del pintor por píxel CSS (ver `medir`).
  let escala = 1

  // La ola mide `data-celdas` de lado, una celda por punto del logotipo: la
  // celda sale del ancho y el lienzo mide justo esas celdas, así la rejilla
  // del pintor calza con la trama. El cielo va con su `rejilla`, y el mar, a
  // la densidad de siempre.
  function medir() {
    const dpr = Math.min(devicePixelRatio, DPR_MAXIMO)
    if (ola) {
      const celdas = Number(lienzo.dataset.celdas)
      const celda = Math.max(1, Math.round((lienzo.clientWidth * dpr) / celdas))
      escala = (celda * celdas) / (lienzo.clientWidth || 1)
      pintor.postMessage({ tipo: 'medir', id, ancho: celda * celdas, alto: celda * celdas, celda })
      return
    }
    let { lado, celda, densidad } = rejilla(lienzo)
    if (mar) {
      celda = Math.round(lado * dpr)
      densidad = dpr
    }
    escala = densidad
    pintor.postMessage({
      tipo: 'medir',
      id,
      ancho: Math.round(lienzo.clientWidth * densidad),
      alto: Math.round(lienzo.clientHeight * densidad),
      celda,
      lado,
      densidad,
    })
  }

  // `--nubes-borde` es del mar y de la ola: la nube no tiene borde.
  function colorear() {
    const estilo = getComputedStyle(lienzo)
    const valor = (nombre) => estilo.getPropertyValue(nombre)
    pintor.postMessage({
      tipo: 'colores',
      id,
      luz: rgb(valor('--nubes-luz')),
      sombra: rgb(valor('--nubes-sombra')),
      borde: valor('--nubes-borde') && rgb(valor('--nubes-borde')),
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
    pintor.postMessage({ tipo: 'cursor', id, fuera: true })
  }

  // Un punto del cursor, en coordenadas de la ventana: el pintor lo quiere en
  // píxeles de su lienzo.
  function apuntar(x, y) {
    if (!visible || quieto() || performance.now() < callado) return
    const caja = lienzo.getBoundingClientRect()
    pintor.postMessage({ tipo: 'cursor', id, x: (x - caja.left) * escala, y: (y - caja.top) * escala })
  }

  // Ratón y lápiz por `pointermove`; el dedo por `touchmove`, que sigue
  // llegando mientras la página se desplaza (`pointermove` se cancela en
  // cuanto empieza el scroll). Nada impide desplazar. Como mucho un aviso por
  // fotograma, y la caja del lienzo se lee en ese fotograma, no en cada evento.
  // La zona es la sección del cielo: el lienzo no recibe el puntero.
  function seguirCursor() {
    const zona = lienzo.closest('section')
    let cursor = null
    const apuntarCursor = () => {
      if (!ajeno) apuntar(cursor.x, cursor.y)
      cursor = null
    }
    const seguir = ({ clientX, clientY }) => {
      if (!cursor) requestAnimationFrame(apuntarCursor)
      cursor = { x: clientX, y: clientY }
    }
    const soltar = () => {
      if (!ajeno) pintor.postMessage({ tipo: 'cursor', id, fuera: true })
    }
    const pasivo = { passive: true }
    zona.addEventListener('pointermove', (evento) => evento.pointerType !== 'touch' && seguir(evento), pasivo)
    zona.addEventListener('touchmove', (evento) => seguir(evento.touches[0]), pasivo)
    zona.addEventListener('pointerleave', soltar)
    zona.addEventListener('touchend', soltar, pasivo)
  }

  const offscreen = lienzo.transferControlToOffscreen()
  const { perspectiva } = lienzo.dataset
  const trama = ola ? tramaDeLaOla(lienzo) : null
  pintor.postMessage({ tipo: 'montar', id, lienzo: offscreen, mar, perspectiva, ola: trama }, [offscreen])
  colorear()
  medir()
  if (ola) alAsomar(lienzo, () => pintor.postMessage({ tipo: 'nace', id }))
  if (mar) {
    // El pato sale a flote cuando el mar asoma: así se le ve salir.
    alAsomar(lienzo, () => {
      if (!quieto()) soltarPato(pintor, lienzo, id)
    })
  } else {
    seguirCursor()
    lienzo.addEventListener('soplo', ({ detail: { x, y, fuera } }) => {
      if (fuera) {
        if (ajeno) ceder(false)
        return
      }
      if (!ajeno) ceder(true)
      apuntar(x, y)
    })
    lienzo.addEventListener('forma', ({ detail }) => pintor.postMessage({ tipo: 'forma', id, ...detail }))
  }

  new ResizeObserver(medir).observe(lienzo)
  new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting
    activar()
  }).observe(lienzo)
  document.addEventListener('visibilitychange', activar)
}

// El pato del mar es del pintor, que lo hace nadar y salir a flote; aquí va su
// enlace a /patos, que llega oculto y lo sigue (`seguirPato`).
function soltarPato(pintor, lienzo, id) {
  const enlace = document.createElement('a')
  enlace.className = 'pato-del-mar'
  enlace.href = '/patos'
  enlace.setAttribute('aria-label', 'Seguir al pato')
  enlace.hidden = true
  lienzo.after(enlace)
  patos.set(id, enlace)
  pintor.postMessage({ tipo: 'pato', id })
}

// El pintor avisa dónde pintó al pato, en px de su lienzo, y si ya salió a
// flote: solo entonces se puede seguir.
function seguirPato(enlace, { x, y, visible }) {
  const dpr = Math.min(devicePixelRatio, DPR_MAXIMO)
  enlace.style.transform = `translate(${x / dpr}px, ${y / dpr}px)`
  if (enlace.hidden === visible) enlace.hidden = !visible
}

export default function initNubes() {
  const lienzos = document.querySelectorAll('canvas.nubes')
  if (!lienzos.length || !('transferControlToOffscreen' in HTMLCanvasElement.prototype)) return

  function arrancar() {
    const pintor = new Worker(new URL('./nubes-lienzo.js', import.meta.url), { type: 'module' })
    pintor.onmessage = ({ data }) => {
      if (data.tipo === 'pato') return seguirPato(patos.get(data.id), data)
      lienzos[data.id].classList.add('vivo')
      lienzos[data.id].dispatchEvent(new Event('vivo'))
    }

    const avisarQuieto = () => pintor.postMessage({ tipo: 'quieto', valor: quieto() })
    avisarQuieto()
    lienzos.forEach((lienzo, id) => montar(pintor, lienzo, id))
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', avisarQuieto)
  }

  const ocioso = window.requestIdleCallback ?? ((f) => setTimeout(f, 1))
  if (document.readyState === 'complete') ocioso(arrancar)
  else addEventListener('load', () => ocioso(arrancar), { once: true })
}
