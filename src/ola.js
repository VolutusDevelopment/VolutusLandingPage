// La ola de /nosotros (Nosotros.jsx), trazándose.
//
// Al asomar, las tres líneas de la ola (lib/logotipo.js) corren desde la cola y
// se enrollan en voluta. Cada una lleva en la punta el color de un servicio —el
// mar hondo, el atardecer y el coral de las cards— y deja una estela que se
// destiñe hacia el blanco a medida que avanza. Sale primero la más larga y
// llegan las tres a la vez; ahí lo que queda de color se apaga y la ola termina
// blanca, igual al SVG, que vuelve a mostrarse. Con el ratón encima se traza
// otra vez.
//
// Es un canvas 2D porque la estela es un degradado a lo largo del trazo, que
// SVG no sabe pintar. Sin JavaScript, con movimiento reducido o al imprimir
// queda el SVG: la ola entera y quieta.

import { OLA } from './lib/logotipo.js'
import { PALETA } from './lib/paleta.js'
import { quieto } from './lib/movimiento.js'

// Las tres llegan a los `LLEGA` ms; después la estela se apaga en `APAGA` ms.
const LLEGA = 1500
const APAGA = 700
// Lo que tarda la estela en volverse blanca detrás de la punta, en unidades de
// la rejilla de 64, y el largo de cada tramo con que se pinta.
const ESTELA = 30
const TRAMO = 0.6
// De la línea de afuera a la de adentro.
const COLORES = [PALETA[0], PALETA[3], PALETA[2]]

const [CX, CY] = OLA.centro
const RECTA = CX - OLA.cola

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

// Cada línea tarda según su largo y sale antes la más larga: así terminan juntas.
const LARGO_MAYOR = RECTA + OLA.radios[0] * OLA.giro
const LINEAS = OLA.radios.map((r, i) => {
  const largo = RECTA + r * OLA.giro
  const dura = LLEGA * (0.55 + (0.45 * largo) / LARGO_MAYOR)
  return { r, largo, dura, sale: LLEGA - dura, color: rgb(COLORES[i]) }
})

// La curva de movimiento del sitio, cubic-bezier(0.77, 0, 0.175, 1): arranca
// lenta y se posa despacio en la voluta. `x` se invierte por bisección.
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

// La línea de radio `r` entre los largos `desde` y `hasta`: la recta y después
// el arco, que en el canvas gira al revés que el reloj desde abajo del centro.
function trazar(ctx, r, desde, hasta) {
  ctx.beginPath()
  if (desde < RECTA) {
    ctx.moveTo(OLA.cola + desde, CY + r)
    ctx.lineTo(OLA.cola + Math.min(hasta, RECTA), CY + r)
  }
  if (hasta > RECTA) {
    const angulo = (s) => Math.PI / 2 - (Math.max(s, RECTA) - RECTA) / r
    ctx.arc(CX, CY, r, angulo(desde), angulo(hasta), true)
  }
  ctx.stroke()
}

const mezcla = (color, cuanto) => `rgb(${color.map((c) => 255 + (c - 255) * cuanto).join(' ')})`

function pintar(ctx, t) {
  // Cuánto color le queda a la estela: todo hasta que llegan, y se apaga.
  const viva = (1 - Math.min(Math.max((t - LLEGA) / APAGA, 0), 1)) ** 2
  for (const { r, largo, dura, sale, color } of LINEAS) {
    const avance = Math.min(Math.max((t - sale) / dura, 0), 1)
    if (!avance) continue
    const punta = largo * mover(avance)
    const estela = Math.max(0, punta - ESTELA)
    ctx.strokeStyle = '#fff'
    if (estela) trazar(ctx, r, 0, estela)
    for (let s = estela; s < punta; s += TRAMO) {
      const hasta = Math.min(s + TRAMO, punta)
      ctx.strokeStyle = mezcla(color, viva * (1 - (punta - hasta) / ESTELA) ** 2)
      trazar(ctx, r, s, hasta)
    }
  }
}

export default function initOla() {
  const ola = document.querySelector('.ola')
  const lienzo = ola?.querySelector('canvas')
  const ctx = lienzo?.getContext('2d')
  if (!ctx || quieto()) return
  const caja = ola.querySelector('svg').viewBox.baseVal
  let corriendo = false

  // Hasta que asoma, la ola espera escondida: así se la ve nacer.
  ola.classList.add('trazando')

  function terminar() {
    corriendo = false
    ola.classList.remove('trazando')
    ctx.clearRect(caja.x, caja.y, caja.width, caja.height)
  }

  function empezar() {
    if (corriendo) return
    if (quieto()) return terminar()
    corriendo = true
    ola.classList.add('trazando')
    const densidad = Math.min(devicePixelRatio, 2)
    lienzo.width = Math.round(lienzo.clientWidth * densidad)
    lienzo.height = lienzo.width
    const k = lienzo.width / caja.width
    ctx.setTransform(k, 0, 0, k, -caja.x * k, -caja.y * k)
    ctx.lineWidth = OLA.grosor
    ctx.lineCap = 'round'
    const inicio = performance.now()
    const cuadro = (ahora) => {
      const t = ahora - inicio
      ctx.clearRect(caja.x, caja.y, caja.width, caja.height)
      if (t >= LLEGA + APAGA) return terminar()
      pintar(ctx, t)
      requestAnimationFrame(cuadro)
    }
    requestAnimationFrame(cuadro)
  }

  const asomo = new IntersectionObserver(
    ([entrada]) => {
      if (!entrada.isIntersecting) return
      asomo.disconnect()
      empezar()
    },
    { threshold: 0.5 },
  )
  asomo.observe(ola)
  ola.addEventListener('pointerenter', ({ pointerType }) => pointerType === 'mouse' && empezar())
}
