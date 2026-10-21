// La estela de color de la ola: en la barra, en el pie y en /nosotros.
//
// Cada `canvas.ola-lienzo` va sobre el SVG de su caja y vuelve a trazar su ola
// (`.ola-trazo`): las tres líneas corren desde la cola y se enrollan en voluta,
// cada una con el color de un servicio en la punta —el mar hondo, el atardecer
// y el coral de las cards—. El color es el del movimiento: la estela se alarga
// y se tiñe cuanto más rápido va la punta, y se acorta y vuelve al color de la
// ola a medida que frena. Las puntas se posan despacio en la voluta, así que
// cuando dejan de moverse ya no queda color. Sale primero la línea más larga y
// llegan las tres a la vez; ahí el lienzo se limpia y vuelve el SVG, que es la
// ola quieta.
//
// Se traza al asomar —la barra, apenas carga—. Con el ratón encima no se borra:
// retrocede rápido por el mismo camino, sin color, la línea de adentro primero,
// y desde el comienzo vuelve a trazarse. `data-ola="logotipo"` dice que es la ola del logotipo y no la suelta, y
// `data-retraso`, cuántos ms espera desde que asoma: en el pie, a que caigan
// las letras. Hasta que asoma, la caja lleva `espera`.
//
// Cada línea se pinta de un solo trazo, del color de la ola quieta, y la estela
// se tiñe encima (`source-atop`): los tramos de color no engruesan el borde, y
// el último cuadro calza con el SVG que lo reemplaza.
//
// Es un canvas 2D porque la estela es un degradado a lo largo del trazo, que SVG
// no sabe pintar. Sin JavaScript, con movimiento reducido o al imprimir queda el
// SVG.

import { OLA, OLA_DEL_LOGOTIPO } from './lib/logotipo.js'
import { PALETA } from './lib/paleta.js'
import { quieto } from './lib/movimiento.js'

// Las tres líneas llegan juntas a los `LLEGA` ms, y al retroceder recorren el
// mismo camino al revés en `RETROCEDE` ms.
const LLEGA = 2000
const RETROCEDE = 450
// La estela cuando la punta va más rápido, y el largo de cada tramo con que se
// tiñe, en unidades de la rejilla de 64: en el logotipo crecen con la ola.
const ESTELA = 55
const TRAMO = 0.6
// De la línea de afuera a la de adentro.
const COLORES = [PALETA[0], PALETA[3], PALETA[2]].map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)))

// La curva de movimiento del sitio, cubic-bezier(0.77, 0, 0.175, 1): arranca y
// se posa con rapidez cero. `x` se invierte por bisección.
const bezier = (a, b) => (u) => 3 * (1 - u) ** 2 * u * a + 3 * (1 - u) * u ** 2 * b + u ** 3
const X = bezier(0.77, 0.175)
const Y = bezier(0, 1)

function mover(t) {
  let [desde, hasta] = [0, 1]
  for (let i = 0; i < 20; i++) {
    const u = (desde + hasta) / 2
    if (X(u) < t) desde = u
    else hasta = u
  }
  return Y((desde + hasta) / 2)
}

// La rapidez de la punta en cada momento, que se lleva a 0–1 con la mayor.
const H = 0.002
const pendiente = (t) => (mover(Math.min(t + H, 1)) - mover(Math.max(t - H, 0))) / (Math.min(t + H, 1) - Math.max(t - H, 0))
const PENDIENTE_MAYOR = Math.max(...Array.from({ length: 101 }, (_, i) => pendiente(i / 100)))

// Cada línea tarda según su largo y sale antes la más larga: así terminan juntas.
function lineasDe({ cola, centro, radios, giro }) {
  const recta = centro[0] - cola
  const mayor = recta + radios[0] * giro
  return radios.map((r, i) => {
    const largo = recta + r * giro
    const dura = LLEGA * (0.55 + (0.45 * largo) / mayor)
    return { r, recta, largo, dura, sale: LLEGA - dura, color: COLORES[i] }
  })
}

// La línea entre los largos `desde` y `hasta`: la recta y después el arco, que
// en el canvas gira al revés que el reloj desde abajo del centro.
function trazar(ctx, { cola, centro: [cx, cy] }, { r, recta }, desde, hasta) {
  ctx.beginPath()
  if (desde < recta) {
    ctx.moveTo(cola + desde, cy + r)
    ctx.lineTo(cola + Math.min(hasta, recta), cy + r)
  }
  if (hasta > recta) {
    const angulo = (s) => Math.PI / 2 - (Math.max(s, recta) - recta) / r
    ctx.arc(cx, cy, r, angulo(desde), angulo(hasta), true)
  }
  ctx.stroke()
}

const mezcla = (color, base, cuanto) => `rgb(${base.map((b, i) => b + (color[i] - b) * cuanto).join(' ')})`
const colorDe = (trazo) => getComputedStyle(trazo).stroke.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number)

// La ola en el momento `t` de su recorrido; `tinta` dice si lleva estela.
function pintar(ctx, ola, lineas, base, t, tinta) {
  const escala = ola.grosor / OLA.grosor
  const estelas = []
  ctx.globalCompositeOperation = 'source-over'
  ctx.strokeStyle = `rgb(${base.join(' ')})`
  for (const linea of lineas) {
    const avance = Math.min(Math.max((t - linea.sale) / linea.dura, 0), 1)
    if (!avance) continue
    const punta = linea.largo * mover(avance)
    trazar(ctx, ola, linea, 0, punta)
    // La raíz deja el color a la vista más tiempo y llega igual a cero.
    const fuerza = tinta && avance < 1 ? Math.sqrt(pendiente(avance) / PENDIENTE_MAYOR) : 0
    if (fuerza) estelas.push({ linea, punta, fuerza })
  }
  ctx.globalCompositeOperation = 'source-atop'
  for (const { linea, punta, fuerza } of estelas) {
    const largo = ESTELA * escala * fuerza
    for (let s = Math.max(0, punta - largo); s < punta; s += TRAMO * escala) {
      const hasta = Math.min(s + TRAMO * escala, punta)
      ctx.strokeStyle = mezcla(linea.color, base, fuerza * (1 - (punta - hasta) / largo) ** 1.3)
      trazar(ctx, ola, linea, s, hasta)
    }
  }
}

function montar(lienzo) {
  const ctx = lienzo.getContext('2d')
  if (!ctx) return
  const caja = lienzo.parentElement
  const svg = caja.querySelector('svg')
  const trazo = svg.querySelector('.ola-trazo')
  const vista = svg.viewBox.baseVal
  const ola = lienzo.dataset.ola === 'logotipo' ? OLA_DEL_LOGOTIPO : OLA
  const lineas = lineasDe(ola)
  // Dónde va la ola en su recorrido, de 0 a `LLEGA` ms, y hacia dónde.
  let t = 0
  let retrocede = false
  let corriendo = false
  let trazada = false

  // Hasta que asoma, la ola espera escondida: así se la ve nacer.
  caja.classList.add('espera', 'trazando')

  // Del viewBox a los píxeles del lienzo: el SVG lo encaja centrado
  // (`xMidYMid meet`) en su caja, que se mide tal como se pinta.
  function medir() {
    const densidad = Math.min(devicePixelRatio, 3)
    const marco = lienzo.getBoundingClientRect()
    const dibujo = svg.getBoundingClientRect()
    lienzo.width = Math.round(marco.width * densidad)
    lienzo.height = Math.round(marco.height * densidad)
    const [sx, sy] = [lienzo.width / marco.width, lienzo.height / marco.height]
    const s = Math.min(dibujo.width / vista.width, dibujo.height / vista.height)
    const x = dibujo.left - marco.left + (dibujo.width - vista.width * s) / 2 - vista.x * s
    const y = dibujo.top - marco.top + (dibujo.height - vista.height * s) / 2 - vista.y * s
    ctx.lineWidth = ola.grosor
    ctx.lineCap = 'round'
    return [s * sx, 0, 0, s * sy, x * sx, y * sy]
  }

  function limpiar() {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, lienzo.width, lienzo.height)
  }

  function terminar() {
    corriendo = false
    trazada = true
    caja.classList.remove('trazando')
    limpiar()
  }

  function correr() {
    if (corriendo) return
    if (quieto()) return terminar()
    corriendo = true
    caja.classList.add('trazando')
    const matriz = medir()
    let antes = performance.now()
    const cuadro = (ahora) => {
      const paso = Math.max(ahora - antes, 0)
      antes = ahora
      t = retrocede ? t - (paso * LLEGA) / RETROCEDE : t + paso
      if (t <= 0) {
        t = 0
        retrocede = false
      }
      limpiar()
      if (t >= LLEGA) return terminar()
      ctx.setTransform(...matriz)
      // El color de la ola quieta, que puede cambiar con la zona bajo la barra.
      pintar(ctx, ola, lineas, colorDe(trazo), t, !retrocede)
      requestAnimationFrame(cuadro)
    }
    requestAnimationFrame(cuadro)
  }

  // Con el ratón encima, desde donde esté: entera si ya terminó, o a medio
  // camino si todavía se traza. La primera vez no, que aún no ha llegado.
  function repetir() {
    if (!trazada || retrocede) return
    if (!corriendo) t = LLEGA
    retrocede = true
    correr()
  }

  const asomo = new IntersectionObserver(
    ([entrada]) => {
      if (!entrada.isIntersecting) return
      asomo.disconnect()
      caja.classList.remove('espera')
      setTimeout(correr, Number(lienzo.dataset.retraso ?? 0))
    },
    { threshold: 0.5 },
  )
  asomo.observe(caja)
  caja.addEventListener('pointerenter', ({ pointerType }) => pointerType === 'mouse' && repetir())
}

export default function initOla() {
  if (quieto()) return
  document.querySelectorAll('canvas.ola-lienzo').forEach(montar)
}
