/**
 * Las nubes y el mar: la trama del logotipo, viva.
 *
 * Este archivo es solo la mitad de la página. El dibujo —el shader, WebGL, el
 * bucle de fotogramas— vive en un Web Worker (`nubes-lienzo.js`) con un
 * OffscreenCanvas, así que el hilo principal nunca espera a la GPU. Aquí solo
 * se mide, se leen los colores y se avisa de lo que cambia.
 *
 * Cada `canvas.nubes` dice qué mira con `data-vista`: `cielo` (las nubes) o
 * `mar` (el agua bajo ellas). El cielo dice además desde dónde se mira la
 * nube, con `data-perspectiva`: la cámara de su página en lib/volutus.js
 * (`aire` si no lo dice). El color lo toma de `--nubes-luz`, `--nubes-sombra`,
 * `--nubes-alfa` y, en el mar, `--nubes-borde`, que el CSS resuelve según la
 * zona. Tienen que ser hex: aquí se leen tal cual. El lado de la celda de la
 * trama, en px CSS, lo da `--nubes-celda` (ver `rejilla`).
 *
 * En la portada el cielo queda fijo detrás de la página hasta que lo tapa la
 * sección que dice `data-recorrido`, y al bajar hacia ella la cámara baja con
 * el scroll (ver `recorrer`).
 *
 * El cielo escucha al cursor, o al dedo: le cuenta al pintor por dónde pasa
 * sobre su sección, y el pintor lo vuelve viento. Lo mismo con lo que la
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
 *   - Nada que no vaya a verse. Cada lienzo se monta cuando está a una pantalla
 *     de asomar, y el pintor nace con el primero: si nadie baja hasta el pie,
 *     el mar no se compila, y en un artículo el pintor ni se descarga.
 *   - Nada en vivo sin GPU de verdad. Si el pintor dibuja por software, o con
 *     una GPU igual de lenta, deja la escena quieta, como con movimiento
 *     reducido (`software`, ver `conectar` en nubes-lienzo.js). Sin WebGL, sin
 *     OffscreenCanvas o sin pintor, el lienzo queda transparente y se deja de
 *     escucharlo (`sin-gl`). En todos esos casos, si la escena está grabada,
 *     encima va su video (ver `grabado`), y la página sigue entera.
 *   - Nada fuera de pantalla. Se para al salir del viewport, al quedar tapado
 *     (la nube fija de la portada) y con la pestaña oculta.
 *   - Nada interactivo con movimiento reducido. Pinta un solo fotograma,
 *     quieto, el cursor no lo mueve y el pato no sale; donde la escena está
 *     grabada, encima va su video.
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

// Cuánto tarda la cámara de la portada en alcanzar al scroll, en ms (ver
// `recorrer`).
const INERCIA = 600

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
  return asomo
}

// Monta un lienzo en el pintor y devuelve con qué soltarlo: si el pintor no lo
// va a pintar (`sin-gl`), se dejan de escuchar el cursor, su tamaño y su
// visibilidad, y nadie le vuelve a escribir.
function montar(pintor, lienzo, id) {
  const mar = lienzo.dataset.vista === 'mar'
  // La sección que tapa la nube fija de la portada.
  const tapa = lienzo.dataset.recorrido && document.querySelector(lienzo.dataset.recorrido)
  const control = new AbortController()
  const { signal } = control
  const observadores = []
  let visible = false
  // Píxeles del pintor por píxel CSS (ver `medir`).
  let escala = 1

  // El cielo va con su `rejilla`, y el mar, a la densidad de siempre.
  function medir() {
    const dpr = Math.min(devicePixelRatio, DPR_MAXIMO)
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

  // `--nubes-borde` es del mar: la nube no tiene borde.
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
    const pasivo = { passive: true, signal }
    zona.addEventListener('pointermove', (evento) => evento.pointerType !== 'touch' && seguir(evento), pasivo)
    zona.addEventListener('touchmove', (evento) => seguir(evento.touches[0]), pasivo)
    zona.addEventListener('pointerleave', soltar, { signal })
    zona.addEventListener('touchend', soltar, pasivo)
  }

  // La portada: mientras se baja hasta la sección que la tapa, la cámara baja
  // con el scroll. Aquí solo se mide cuánto se bajó (de 0 a 1); la cámara la
  // pone el pintor (`bajar`, lib/volutus.js). No salta con el scroll: lo sigue
  // con inercia, como el brazo pesado de una grúa. Con movimiento reducido se
  // queda en la portada.
  function recorrer() {
    if (quieto()) return
    const objetivo = () => Math.min(1, Math.max(0, scrollY / tapa.offsetTop))
    let actual = objetivo()
    let antes = 0
    let andando = false
    const enviar = () => pintor.postMessage({ tipo: 'bajada', id, t: actual })
    const mover = (ahora) => {
      const meta = objetivo()
      actual += (meta - actual) * (1 - Math.exp(-(ahora - (antes || ahora)) / INERCIA))
      antes = ahora
      if (Math.abs(meta - actual) < 1e-4) {
        actual = meta
        andando = false
        antes = 0
      } else {
        requestAnimationFrame(mover)
      }
      enviar()
    }
    addEventListener(
      'scroll',
      () => {
        if (!andando) requestAnimationFrame(mover)
        andando = true
      },
      { passive: true, signal },
    )
    enviar()
  }

  const offscreen = lienzo.transferControlToOffscreen()
  const { perspectiva } = lienzo.dataset
  // `juego`: los cúmulos del juego de la 404 solo se compilan donde se juega.
  const juego = 'juego' in lienzo.dataset
  pintor.postMessage({ tipo: 'montar', id, lienzo: offscreen, mar, perspectiva, juego }, [offscreen])
  colorear()
  medir()
  if (mar) {
    // El pato sale a flote cuando el mar asoma: así se le ve salir.
    observadores.push(
      alAsomar(lienzo, () => {
        if (!quieto()) soltarPato(pintor, lienzo, id)
      }),
    )
  } else {
    seguirCursor()
    if (tapa) recorrer()
    lienzo.addEventListener(
      'soplo',
      ({ detail: { x, y, fuera } }) => {
        if (fuera) {
          if (ajeno) ceder(false)
          return
        }
        if (!ajeno) ceder(true)
        apuntar(x, y)
      },
      { signal },
    )
    lienzo.addEventListener('forma', ({ detail }) => pintor.postMessage({ tipo: 'forma', id, ...detail }), { signal })
  }

  const tamano = new ResizeObserver(medir)
  tamano.observe(lienzo)
  // Se pinta mientras se ve. La nube fija de la portada está siempre en
  // pantalla: lo que dice si se ve son las secciones que la dejan ver, de la
  // suya a la anterior a la que la tapa, con una pantalla de margen arriba para
  // el borde fundido de esa (Portada.css).
  const vistas = new Set()
  const enPantalla = new IntersectionObserver(
    (entradas) => {
      for (const { target, isIntersecting } of entradas) {
        if (isIntersecting) vistas.add(target)
        else vistas.delete(target)
      }
      visible = vistas.size > 0
      activar()
    },
    tapa ? { rootMargin: '100% 0px 0px 0px' } : {},
  )
  for (const visto of tapa ? dejanVer(lienzo.closest('section'), tapa) : [lienzo]) enPantalla.observe(visto)
  observadores.push(tamano, enPantalla)
  document.addEventListener('visibilitychange', activar, { signal })

  return () => {
    control.abort()
    observadores.forEach((observador) => observador.disconnect())
  }
}

// Las secciones desde `desde` hasta la anterior a `tapa`.
function dejanVer(desde, tapa) {
  const secciones = []
  for (let seccion = desde; seccion && seccion !== tapa; seccion = seccion.nextElementSibling) secciones.push(seccion)
  return secciones
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

// Donde el pintor no puede mover una escena, y con movimiento reducido, encima
// va la misma escena grabada: un video en bucle, que decodificar cuesta mucho
// menos que pintarla y no responde al cursor. Hay del mar y de la nube de la
// portada; los cielos con otra cámara quedan quietos, o transparentes sin
// WebGL. El video se pide recién aquí: con GPU y sin movimiento reducido no
// se descarga, y con ahorro de datos tampoco. El navegador lo pausa fuera de
// pantalla. Ojo: su primer fotograma cuenta para el LCP, así que tiene que
// llegar pronto. Safari lo pide por partes: lo sirve el Worker (`porPartes`,
// worker/index.js).
const GRABADOS = { mar: '/grabados/mar-sin-gpu.mp4', cielo: '/grabados/nube-sin-gpu.mp4' }
const grabados = new Map()

function grabado(lienzo) {
  const src = GRABADOS[lienzo.dataset.vista]
  if (!src || lienzo.dataset.perspectiva || grabados.has(lienzo) || navigator.connection?.saveData) return
  const video = document.createElement('video')
  video.className = 'nubes grabado'
  video.src = src
  video.muted = video.loop = video.autoplay = video.playsInline = true
  video.setAttribute('aria-hidden', 'true')
  video.addEventListener('playing', () => video.classList.add('vivo'), { once: true })
  grabados.set(lienzo, video)
  lienzo.after(video)
}

function quitarGrabado(lienzo) {
  grabados.get(lienzo)?.remove()
  grabados.delete(lienzo)
}

export default function initNubes() {
  const lienzos = [...document.querySelectorAll('canvas.nubes')]
  if (!lienzos.length) return

  let pintor = null
  // Sin OffscreenCanvas no hay pintor, y sin WebGL (`sin-gpu`) no vale la pena
  // montar otro lienzo: los que asoman van directo a su grabación.
  let sinPintor = !('transferControlToOffscreen' in HTMLCanvasElement.prototype)
  // Los lienzos que faltan por montar, con qué se suelta cada uno montado y los
  // que el pintor deja quietos por software.
  const pendientes = new Set(lienzos)
  const montados = new Map()
  const porSoftware = new Set()

  // Cada lienzo se monta cuando está a una pantalla de asomar.
  const cerca = new IntersectionObserver(
    (entradas) => {
      for (const { target, isIntersecting } of entradas) {
        if (!isIntersecting) continue
        cerca.unobserve(target)
        pendientes.delete(target)
        if (sinPintor) {
          grabado(target)
          continue
        }
        pintor ??= contratar()
        const id = lienzos.indexOf(target)
        montados.set(id, montar(pintor, target, id))
        if (quieto()) grabado(target)
      }
    },
    { rootMargin: '100% 0px' },
  )

  // Si el movimiento reducido cambia con la página abierta, la grabación va y
  // viene en los lienzos que el pintor mueve en vivo; donde pinta por software
  // se queda.
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
    for (const id of montados.keys()) {
      if (quieto()) grabado(lienzos[id])
      else if (!porSoftware.has(id)) quitarGrabado(lienzos[id])
    }
  })

  // Un lienzo que el pintor no va a pintar se suelta y queda su grabación. Si es
  // por el equipo (`sin-gpu`), los que faltan tampoco se montan; sin nada que
  // pintar, el pintor termina.
  function soltar(id, motivo) {
    montados.get(id)?.()
    montados.delete(id)
    patos.get(id)?.remove()
    patos.delete(id)
    grabado(lienzos[id])
    if (motivo === 'sin-gpu') sinPintor = true
    if (pintor && !montados.size && (sinPintor || !pendientes.size)) {
      pintor.terminate()
      pintor = null
    }
  }

  function contratar() {
    const nuevo = new Worker(new URL('./nubes-lienzo.js', import.meta.url), { type: 'module' })
    let hablo = false
    nuevo.onmessage = ({ data }) => {
      hablo = true
      if (data.tipo === 'sin-gl') return soltar(data.id, data.motivo)
      if (data.tipo === 'software') {
        porSoftware.add(data.id)
        return grabado(lienzos[data.id])
      }
      if (data.tipo === 'pato') {
        const enlace = patos.get(data.id)
        return enlace && seguirPato(enlace, data)
      }
      lienzos[data.id].classList.add('vivo')
      lienzos[data.id].dispatchEvent(new Event('vivo'))
    }
    // Si el pintor no llega a cargar (la red, una extensión que lo bloquea), no
    // hay quién pinte: los lienzos quedan como sin GPU.
    nuevo.onerror = () => {
      if (hablo) return
      ;[...montados.keys()].forEach((id) => soltar(id, 'sin-gpu'))
    }
    const avisarQuieto = () => nuevo.postMessage({ tipo: 'quieto', valor: quieto() })
    avisarQuieto()
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', avisarQuieto)
    return nuevo
  }

  const empezar = () => lienzos.forEach((lienzo) => cerca.observe(lienzo))
  const ocioso = window.requestIdleCallback ?? ((f) => setTimeout(f, 1))
  if (document.readyState === 'complete') ocioso(empezar)
  else addEventListener('load', () => ocioso(empezar), { once: true })
}
