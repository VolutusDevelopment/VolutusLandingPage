/**
 * Las nubes y el mar: la trama del logotipo, viva.
 *
 * Este archivo es solo la mitad de la página. El dibujo —el shader, WebGL, el
 * bucle de fotogramas— vive en un Web Worker (`nubes-lienzo.js`) con un
 * OffscreenCanvas, así que el hilo principal nunca espera a la GPU. Aquí solo
 * se mide, se leen los colores y se avisa de lo que cambia.
 *
 * Cada `canvas.nubes` dice qué mira con `data-vista`: `cielo` (las nubes),
 * `mar` (el agua bajo ellas) o `atardecer` (el sol que se pone en el mar, en
 * /nosotros). El cielo dice además desde dónde se mira la nube, con
 * `data-perspectiva`: la cámara de su página en lib/volutus.js (`aire` si no
 * lo dice). El color lo toma de `--nubes-luz`, `--nubes-sombra`,
 * `--nubes-alfa` y, en el mar, `--nubes-borde`, que el CSS resuelve según la
 * zona. Tienen que ser hex: aquí se leen tal cual. El atardecer lleva su
 * paleta en su shader (lib/atardecer.js). El lado de la celda de la trama, en
 * px CSS, lo da `--nubes-celda` (ver `rejilla`).
 *
 * En la portada el cielo queda fijo detrás de la página hasta que lo tapa la
 * sección que dice `data-recorrido`, y al bajar hacia ella la cámara baja con
 * el scroll (ver `recorrer`). En /nosotros el atardecer queda fijo detrás de
 * su sección y el sol se pone con el scroll hasta la mitad (ver `ponerSol`).
 *
 * El cielo escucha al cursor, o al dedo: le cuenta al pintor por dónde pasa
 * sobre su sección, y el pintor lo vuelve viento. El que dice `data-calma` (la
 * portada) no: su aire no se simula. Lo mismo con lo que la página haga pasar
 * por la nube —los patos de la 404—, que lo avisa con un evento `soplo` en el
 * lienzo. Y el juego de la 404 cambia la forma de la nube con un evento
 * `forma`, que aquí solo se reenvía al pintor (ver patos.js).
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
 *   - Nada que trabe la página. Cada escena tiene un presupuesto: si un
 *     fotograma suyo pasa de 11 ms (un teléfono), el pintor deja de calcularla.
 *     La grabada la pinta desde su campo grabado, un video que esta página le
 *     pasa cuadro a cuadro (`grabarCampo`); las demás quedan quietas
 *     (`PRESUPUESTO` en nubes-lienzo.js).
 *   - Nada fuera de pantalla. Se para al salir del viewport, al quedar tapado
 *     (la nube fija de la portada) y con la pestaña oculta.
 *   - Nada interactivo con movimiento reducido. Pinta un solo fotograma,
 *     quieto, el cursor no lo mueve y el pato no sale; donde la escena está
 *     grabada, encima va su video.
 */

import { CAMPOS, campoPara } from './lib/campos.js'
import { quieto } from './lib/movimiento.js'

// Tope de densidad de píxeles del mar: por encima de 1.5 sus puntos no se ven
// mejor y el costo sigue creciendo.
const DPR_MAXIMO = 1.5

// Dónde va el horizonte del atardecer, en altos del telón: el `HORIZONTE` de
// lib/atardecer.js, que no se importa aquí para no traer sus shaders.
const HORIZONTE = 0.62

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

// El video del campo grabado de cada lienzo que lo pinta (ver `grabarCampo`),
// y la cámara y la densidad de cada lienzo, que lo eligen (`medir`).
const campos = new Map()
const densidades = new Map()

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
  const atardecer = lienzo.dataset.vista === 'atardecer'
  // La sección que tapa la nube fija de la portada.
  const tapa = lienzo.dataset.recorrido && document.querySelector(lienzo.dataset.recorrido)
  // Un cielo en calma no escucha al cursor, y el pintor no le arma el aire.
  const calma = 'calma' in lienzo.dataset
  const control = new AbortController()
  const { signal } = control
  const observadores = []
  let visible = false
  // Píxeles del pintor por píxel CSS (ver `medir`).
  let escala = 1

  // El cielo va con su `rejilla`, y el mar y el atardecer, a la densidad de
  // siempre.
  function medir() {
    const dpr = Math.min(devicePixelRatio, DPR_MAXIMO)
    let { lado, celda, densidad } = rejilla(lienzo)
    if (mar || atardecer) {
      celda = Math.round(lado * dpr)
      densidad = dpr
    }
    escala = densidad
    const ancho = Math.round(lienzo.clientWidth * densidad)
    const alto = Math.round(lienzo.clientHeight * densidad)
    pintor.postMessage({ tipo: 'medir', id, ancho, alto, celda, lado, densidad })
    // La cámara y la densidad del lienzo dicen qué campo grabado se ve como él
    // (lib/campos.js): al girar el teléfono, la nube cambia de cámara.
    const camara = mar ? 'mar' : ancho > alto ? 'apaisado' : 'vertical'
    densidades.set(id, { camara, filas: Math.max(alto, ancho / CAMPOS[camara].proporcion) / celda })
    if (campos.has(id)) elegirCampo(pintor, id)
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

  // /nosotros: el sol baja del día mientras pasan los socios y toca el mar
  // cuando lo que dice `data-ocaso` (la pausa tras el último) llega arriba,
  // con la escena sola. Después, mientras la sección siguiente empieza a
  // subir, se pone hasta la mitad, y ahí se queda: no baja mientras la escena
  // se recorta en la lámina que queda sobre su título (`recortar`), ni cuando
  // la lámina se va con el texto. Al volver, sale con la escena mientras deja
  // de recortarse: si esperara a que quede sola, subiría cuando el scroll ya
  // frena y llegaría tarde. Aquí solo se mide cuánto pasó, de 0 a 2 (ver
  // `sol` en lib/atardecer.js); el pintor lo lleva tras el scroll con su
  // resorte. Con movimiento reducido el sol no se mueve, tocando el mar; el
  // recorte sí, porque va con el scroll, como la sección que sube.
  function ponerSol() {
    const seccion = lienzo.closest('section')
    const pausa = seccion.querySelector(lienzo.dataset.ocaso)
    const hoja = seccion.nextElementSibling
    const entre = (valor) => Math.min(1, Math.max(0, valor))
    let antes = 0
    let subiendo = false
    const enviar = () => {
      const arriba = seccion.getBoundingClientRect().top
      const bajado = -arriba
      const sola = pausa.getBoundingClientRect().top - arriba
      const desde = sola + 0.3 * innerHeight
      const toca = hoja.getBoundingClientRect().top - arriba
      const lamina = entre((bajado - desde) / (toca - desde))
      if (bajado !== antes) [subiendo, antes] = [bajado < antes, bajado]
      const puesta = subiendo ? lamina : entre((bajado - sola) / (desde - sola))
      pintor.postMessage({ tipo: 'ocaso', id, sol: quieto() ? 1 : bajado < sola ? entre(bajado / sola) : 1 + puesta })
      recortar(hoja, lamina)
    }
    addEventListener('scroll', enviar, { passive: true, signal })
    addEventListener('resize', enviar, { signal })
    enviar()
  }

  // La lámina: el telón se recorta a una franja del alto del hueco que la
  // espera en la sección siguiente (`.lamina`), 55 % cielo y 45 % mar, como
  // la parvada (`--cielo-de-la-lamina` en Nosotros.css), y sube hasta él. Con
  // `k` en 1 la sección toca arriba y la franja está en el hueco, con su ancho
  // y su radio: desde ahí el telón se suelta y se va con ella. Sin escalar,
  // para que los puntos sigan nítidos.
  let recorte
  function recortar(hoja, k) {
    const telon = lienzo.parentElement
    const hueco = hoja.querySelector('.lamina')
    const caja = telon.getBoundingClientRect()
    const lugar = hueco.getBoundingClientRect()
    const alto = telon.offsetHeight
    const medida = `${k} ${caja.width} ${alto} ${lugar.left} ${lugar.width} ${lugar.height}`
    if (medida === recorte) return
    recorte = medida
    telon.classList.toggle('recortado', k > 0)
    if (!k) {
      telon.style.transform = telon.style.clipPath = ''
      return
    }
    const franja = Math.round(HORIZONTE * alto - 0.55 * lugar.height)
    const destino = lugar.top - hoja.getBoundingClientRect().top
    const radio = parseFloat(getComputedStyle(hueco).borderTopLeftRadius)
    const lados = [franja, caja.right - lugar.right, alto - franja - lugar.height, lugar.left - caja.left]
    telon.style.transform = `translateY(${Math.round((destino - franja) * k)}px)`
    telon.style.clipPath = `inset(${lados.map((lado) => `${lado * k}px`).join(' ')} round ${radio * k}px)`
  }

  // El video del campo grabado se reproduce solo mientras la escena se pinta.
  function activar() {
    const activa = visible && !document.hidden
    pintor.postMessage({ tipo: 'activa', id, valor: activa })
    reproducir(campos.get(id), activa && !quieto())
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
  // Se escucha en su sección, no en el lienzo, que no recibe el puntero.
  function seguirCursor() {
    const zona = lienzo.closest('section')
    let cursor = null
    const apuntarCursor = () => {
      if (cursor && !ajeno) apuntar(cursor.x, cursor.y)
      cursor = null
    }
    const seguir = ({ clientX, clientY }) => {
      if (!cursor) requestAnimationFrame(apuntarCursor)
      cursor = { x: clientX, y: clientY }
    }
    // Al soltar se descarta el punto que esperaba su fotograma: llegaría
    // después del aviso y el pintor lo uniría con el primero del gesto
    // siguiente, en una ráfaga de uno al otro.
    const soltar = () => {
      cursor = null
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
  // pone el pintor, que la lleva tras el scroll como un cuerpo con masa, sin
  // frenazos (`bajar` y `arrastrar`, lib/volutus.js).
  // El navegador da como mucho un `scroll` por fotograma. Con movimiento
  // reducido se queda en la portada.
  function recorrer() {
    if (quieto()) return
    const enviar = () =>
      pintor.postMessage({ tipo: 'bajada', id, t: Math.min(1, Math.max(0, scrollY / tapa.offsetTop)) })
    addEventListener('scroll', enviar, { passive: true, signal })
    enviar()
  }

  const offscreen = lienzo.transferControlToOffscreen()
  const { perspectiva } = lienzo.dataset
  // `juego`: los cúmulos del juego de la 404 solo se compilan donde se juega.
  const juego = 'juego' in lienzo.dataset
  // `campo`: tiene grabación y esta página puede pasarle su campo grabado (ver
  // `grabarCampo`).
  const campo = Boolean(grabacion(lienzo)) && 'requestVideoFrameCallback' in HTMLVideoElement.prototype
  pintor.postMessage({ tipo: 'montar', id, lienzo: offscreen, mar, atardecer, perspectiva, juego, calma, campo }, [offscreen])
  if (!atardecer) colorear()
  medir()
  if (mar) {
    // El pato sale a flote cuando el mar asoma: así se le ve salir.
    observadores.push(
      alAsomar(lienzo, () => {
        if (!quieto()) soltarPato(pintor, lienzo, id)
      }),
    )
  } else {
    if (!calma) seguirCursor()
    if (tapa) recorrer()
    if (atardecer) ponerSol()
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
  // Se pinta mientras se ve. La nube pegada de la portada está siempre en
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
  for (const visto of tapa ? dejanVer(lienzo.parentElement.nextElementSibling, tapa) : [lienzo]) enPantalla.observe(visto)
  observadores.push(tamano, enPantalla)
  document.addEventListener('visibilitychange', activar, { signal })
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', activar, { signal })

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

// Donde el pintor no puede mover una escena —sin GPU, o ni grabada cabe en su
// presupuesto— y con movimiento reducido, encima va la misma escena grabada:
// un video en bucle, que decodificar cuesta mucho menos que pintarla y no
// responde al cursor. Hay del mar y de la nube de la portada; los cielos con
// otra cámara quedan quietos, o transparentes sin WebGL. El video se pide
// recién aquí: con GPU y sin movimiento reducido no se descarga, y con ahorro
// de datos tampoco. El navegador lo pausa fuera de pantalla. Ojo: su primer
// fotograma cuenta para el LCP, así que tiene que llegar pronto. Safari lo
// pide por partes: lo sirve el Worker (`porPartes`, worker/index.js).
const GRABADOS = { mar: '/grabados/mar-sin-gpu.mp4', cielo: '/grabados/nube-sin-gpu.mp4' }
const grabados = new Map()

// El video de un lienzo, si tiene y se puede pedir.
const grabacion = (lienzo) =>
  !lienzo.dataset.perspectiva && !navigator.connection?.saveData && GRABADOS[lienzo.dataset.vista]

function grabado(lienzo) {
  const src = grabacion(lienzo)
  if (!src || grabados.has(lienzo)) return
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

// La escena que en vivo no cabe en su presupuesto pasa a su campo grabado
// (`lenta`, ver `aliviar` en nubes-lienzo.js): un video gris con el tono y la
// cobertura de cada celda, que el pintor vuelve puntos a la medida de esta
// pantalla (lib/campos.js). Aquí solo se reproduce y se le pasa cada cuadro.
// Va en la página, de 1 px y transparente: iOS no reproduce un video oculto,
// y así no compite por el LCP. Si no se puede reproducir, la escena queda
// quieta con su grabación (`sin-campo`).
function grabarCampo(pintor, lienzo, id) {
  const video = document.createElement('video')
  video.className = 'campo-grabado'
  video.muted = video.loop = video.autoplay = video.playsInline = true
  video.setAttribute('aria-hidden', 'true')
  const enviar = () => {
    if (campos.get(id) !== video) return
    createImageBitmap(video).then(
      (cuadro) => (campos.get(id) === video ? pintor.postMessage({ tipo: 'campo', id, cuadro }, [cuadro]) : cuadro.close()),
      () => {},
    )
    video.requestVideoFrameCallback(enviar)
  }
  video.requestVideoFrameCallback(enviar)
  video.addEventListener('error', () => pintor.postMessage({ tipo: 'sin-campo', id }), { once: true })
  campos.set(id, video)
  lienzo.after(video)
  elegirCampo(pintor, id)
}

// El campo de la cámara y la densidad del lienzo. Si ninguno se ve como él,
// la escena queda quieta con su grabación (`sin-campo`). La rapidez la dice el
// pintor (`rapidez`).
function elegirCampo(pintor, id) {
  const { camara, filas } = densidades.get(id)
  const src = campoPara(camara, filas)
  const video = campos.get(id)
  if (!src) pintor.postMessage({ tipo: 'sin-campo', id })
  else if (video.getAttribute('src') !== src) video.src = src
}

function quitarCampo(id) {
  campos.get(id)?.remove()
  campos.delete(id)
}

const reproducir = (video, si) => video && (si ? video.play().catch(() => {}) : video.pause())

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
    quitarCampo(id)
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
        quitarCampo(data.id)
        return grabado(lienzos[data.id])
      }
      if (data.tipo === 'lenta') return grabarCampo(nuevo, lienzos[data.id], data.id)
      if (data.tipo === 'rapidez') {
        const video = campos.get(data.id)
        if (video) video.defaultPlaybackRate = video.playbackRate = data.valor
        return
      }
      if (data.tipo === 'pato') {
        const enlace = patos.get(data.id)
        return enlace && seguirPato(enlace, data)
      }
      if (data.tipo === 'arriba') return document.documentElement.style.setProperty('--fondo-de-arriba', data.color)
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
