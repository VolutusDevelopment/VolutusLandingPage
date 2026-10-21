// La estela de color de la ola: en la barra, en el pie y en /nosotros.
//
// Cada `canvas.ola-lienzo` va sobre el SVG de su caja y vuelve a trazar su ola
// (`.ola-trazo`): las tres líneas corren desde la cola y se enrollan en voluta,
// cada una con el color de un servicio en la punta —el mar hondo, el atardecer
// y el coral de las cards—. El color es el del movimiento: la estela se alarga
// y se tiñe cuanto más rápido va la punta, y se acorta y se destiñe hacia el
// color de la ola a medida que frena. Las puntas se posan despacio en la
// voluta, así que cuando dejan de moverse ya no queda color. Sale primero la
// línea más larga y llegan las tres a la vez; ahí el lienzo se limpia y vuelve
// el SVG, que es la ola quieta.
//
// Se traza al asomar —la barra, apenas carga; el pie, cuando terminó de entrar—
// y otra vez con el ratón encima.
// `data-ola="logotipo"` dice que es la ola del logotipo y no la suelta.
//
// Es un canvas 2D porque la estela es un degradado a lo largo del trazo, que SVG
// no sabe pintar. Sin JavaScript, con movimiento reducido o al imprimir queda el
// SVG.

import { OLA, OLA_DEL_LOGOTIPO } from './lib/logotipo.js'
import { PALETA } from './lib/paleta.js'
import { quieto } from './lib/movimiento.js'

// Las tres líneas llegan juntas a los `LLEGA` ms.
const LLEGA = 1500
// La estela cuando la punta va más rápido, y el largo de cada tramo con que se
// pinta, en unidades de la rejilla de 64: en el logotipo crecen con la ola.
const ESTELA = 30
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

function pintar(ctx, ola, lineas, base, t) {
  const escala = ola.grosor / OLA.grosor
  for (const linea of lineas) {
    const avance = Math.min(Math.max((t - linea.sale) / linea.dura, 0), 1)
    if (!avance) continue
    const punta = linea.largo * mover(avance)
    const rapidez = avance < 1 ? pendiente(avance) / PENDIENTE_MAYOR : 0
    const estela = ESTELA * escala * rapidez
    const tinta = Math.max(0, punta - estela)
    ctx.strokeStyle = `rgb(${base.join(' ')})`
    if (tinta) trazar(ctx, ola, linea, 0, tinta)
    for (let s = tinta; s < punta; s += TRAMO * escala) {
      const hasta = Math.min(s + TRAMO * escala, punta)
      ctx.strokeStyle = mezcla(linea.color, base, rapidez * (1 - (punta - hasta) / estela) ** 2)
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
  let corriendo = false

  // Hasta que asoma, la ola espera escondida: así se la ve nacer.
  caja.classList.add('trazando')

  function terminar() {
    corriendo = false
    caja.classList.remove('trazando')
    ctx.clearRect(vista.x, vista.y, vista.width, vista.height)
  }

  function empezar() {
    if (corriendo) return
    if (quieto()) return terminar()
    corriendo = true
    caja.classList.add('trazando')
    const densidad = Math.min(devicePixelRatio, 2)
    lienzo.width = Math.round(lienzo.clientWidth * densidad)
    lienzo.height = Math.round(lienzo.clientHeight * densidad)
    const k = lienzo.width / vista.width
    ctx.setTransform(k, 0, 0, k, -vista.x * k, -vista.y * k)
    ctx.lineWidth = ola.grosor
    ctx.lineCap = 'round'
    // El color de la ola quieta, el que la estela recupera al frenar.
    const base = getComputedStyle(trazo).stroke.match(/\d+/g).slice(0, 3).map(Number)
    const inicio = performance.now()
    const cuadro = (ahora) => {
      const t = ahora - inicio
      ctx.clearRect(vista.x, vista.y, vista.width, vista.height)
      if (t >= LLEGA) return terminar()
      pintar(ctx, ola, lineas, base, t)
      requestAnimationFrame(cuadro)
    }
    requestAnimationFrame(cuadro)
  }

  // En el pie, la ola espera a que el pie termine de entrar, que es cuando sus
  // letras terminan de caer (Pie.css): el pie entero a la vista, o su borde de
  // arriba en el de la pantalla si es más alto que ella.
  const pie = lienzo.closest('footer')
  const asomo = new IntersectionObserver(
    ([entrada]) => {
      if (!entrada.isIntersecting) return
      asomo.disconnect()
      empezar()
    },
    { threshold: pie ? Math.min(1, innerHeight / pie.offsetHeight) * 0.98 : 0.5 },
  )
  asomo.observe(pie ?? caja)
  caja.addEventListener('pointerenter', ({ pointerType }) => pointerType === 'mouse' && empezar())
}

export default function initOla() {
  if (quieto()) return
  document.querySelectorAll('canvas.ola-lienzo').forEach(montar)
}
