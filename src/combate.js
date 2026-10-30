/**
 * El combate de Operación Venganza (paginas/OperacionVenganza.jsx, `Nivel`):
 * el guion del nivel que diga `data-nivel` (lib/nivel1.js, nivel2.js o
 * nivel3.js) contra quien juega, que es el cursor o, con el dedo, una huella.
 * Lo corre el juego (src/operacion-venganza.js) en la misma página que las
 * escenas, uno tras otro: cada nivel empieza de cero, y al terminar suelta lo
 * que escuchaba, para su lienzo y le avisa al juego, que sigue con las escenas.
 *
 * El cielo es un mundo en 3D pintado pixel a pixel en un lienzo chico que el
 * CSS agranda sin suavizar: las franjas del atardecer, el sol medio hundido,
 * el mar con sus olas y las nubes, y la cámara vuela hacia +x a `V` m/s. Los
 * cazas son los de las escenas, desde sus hojas (lib/cazas.js): se elige el
 * cuadro según desde dónde se lo ve y se gira según hacia dónde se ladea. Las balas
 * y quien juega viven en el plano de la pantalla, como en un combate por
 * turnos: cada vista del guion mueve la cámara y cambia los patrones, y entre
 * una y otra se habla. El texto avanza solo, al ritmo de lo que tarda leerlo.
 *
 * Quien juega va justo donde está el ratón, o se arrastra 1:1 con el dedo
 * desde cualquier parte, o con las flechas; solo las ráfagas lo corren.
 */

import { NIVELES } from './lib/juego.js'
import { ALTURAS, GIROS, LADO, LLENADO, RADIO, RETRATOS, rutaDeCaza } from './lib/cazas.js'
import { quieto } from './lib/movimiento.js'
import { BORDE, FLECHA, HUELLA, escalaDe } from './lib/flecha.js'

const V = 150 // m/s, la velocidad de la cámara, si la vista no dice otra (`velocidad`)
const ALT = 300 // m sobre el mar, como duky en la escena 11: la de las nubes y la de la cámara si la vista no dice otra (`altura`)
const TAN = 0.62 // medio campo de visión, en el lado corto de la pantalla
const PIXELES_POR_METRO = (LADO * LLENADO) / (2 * RADIO) // en la hoja del caza
const PV_MAX = 100
const DANO = 5 // lo que quita cada golpe, si el guion no dice otro (`DANO`)
const RAD = Math.PI / 180
// El diálogo se escribe rápido y cada línea queda lo justo para terminar de leerla.
const LETRAS_POR_SEGUNDO = 75
const leer = (texto) => Math.max(0.9, 0.35 + texto.length * 0.022)

// ── Vectores ──────────────────────────────────────────────────────────────
const sum = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const res = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const esc = (a, k) => [a[0] * k, a[1] * k, a[2] * k]
const pto = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const largo = (a) => Math.hypot(a[0], a[1], a[2])
const uni = (a) => esc(a, 1 / (largo(a) || 1))
const lerp = (a, b, q) => a + (b - a) * q
const limitar = (v, a, b) => Math.min(b, Math.max(a, v))
const suave = (q) => q * q * q * (q * (q * 6 - 15) + 10)

// Resorte críticamente amortiguado, exacto para cualquier dt: llega sin pasarse.
function resorte(s, objetivo, w, dt) {
  const x = s.x - objetivo
  const e = Math.exp(-w * dt)
  const t = (s.v + w * x) * dt
  s.x = objetivo + (x + t) * e
  s.v = (s.v - w * t) * e
}

const rgba = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return (0xff000000 | ((n & 0xff) << 16) | (n & 0xff00) | (n >> 16)) >>> 0
}

let raiz, lienzo, ctx, guion, VISTAS
let w = 0, h = 0, escala = 2, k = 1, imagen, pix

function ajustar() {
  const antes = [w, h]
  escala = escalaDe(raiz.clientWidth, raiz.clientHeight)
  w = Math.ceil(raiz.clientWidth / escala)
  h = Math.ceil(raiz.clientHeight / escala)
  lienzo.width = w
  lienzo.height = h
  lienzo.style.width = `${w * escala}px`
  lienzo.style.height = `${h * escala}px`
  ctx.imageSmoothingEnabled = false
  imagen = ctx.createImageData(w, h)
  pix = new Uint32Array(imagen.data.buffer)
  k = Math.min(w, h) / 2 / TAN
  if (!antes[0]) return
  const fx = w / antes[0], fy = h / antes[1]
  objetivo.x *= fx
  objetivo.y *= fy
  for (const b of balas) {
    b.x *= fx
    b.y *= fy
    if (b.tx == null) continue
    b.tx *= fx
    b.ty *= fy
    if (b.x0 == null) continue
    b.x0 *= fx
    b.y0 *= fy
  }
}

// ── La cámara ─────────────────────────────────────────────────────────────
function base(yaw, pitch, roll) {
  const cp = Math.cos(pitch)
  const F = [cp * Math.cos(yaw), Math.sin(pitch), cp * Math.sin(yaw)]
  const R0 = uni(cruz(F, [0, 1, 0]))
  const U0 = cruz(R0, F)
  const cr = Math.cos(roll), sr = Math.sin(roll)
  return { F, R: sum(esc(R0, cr), esc(U0, sr)), U: res(esc(U0, cr), esc(R0, sr)) }
}

const enRadianes = ({ yaw, pitch, roll }) => ({ yaw: yaw * RAD, pitch: pitch * RAD, roll: roll * RAD })

const camara = {
  desde: null,
  hacia: null,
  t: 1,
  dur: 1,
  x: 0,
  alt: ALT,
  v: V,
  vaiven: { x: 0, v: 0 }, // el giro que trae cada vista
  viento: { x: 0, v: 0 }, // lo que la inclinan las ráfagas
  sacudida: 0,
}

// Cada vista lleva la cámara a sus ángulos, a su altura sobre el mar y a su velocidad.
const poseDe = (vista) => ({ ...enRadianes(vista.camara), alt: vista.altura ?? ALT, v: vista.velocidad ?? V })

function camaraHacia(vista, dur = 2.6) {
  camara.desde = angulos()
  camara.hacia = poseDe(vista)
  camara.t = 0
  camara.dur = dur
}

function angulos() {
  const q = suave(Math.min(1, camara.t / camara.dur))
  const { desde: a, hacia: b } = camara
  const dy = Math.atan2(Math.sin(b.yaw - a.yaw), Math.cos(b.yaw - a.yaw))
  return { yaw: a.yaw + dy * q, pitch: lerp(a.pitch, b.pitch, q), roll: lerp(a.roll, b.roll, q), alt: lerp(a.alt, b.alt, q), v: lerp(a.v, b.v, q) }
}

const ojo = () => [camara.x, camara.alt, 0]

// La estable, para poner los cazas; la que se ve suma la turbulencia y el
// viento. El vaivén de cada vista corre desde que empieza.
let estable, vista
function moverCamara(dt) {
  camara.t += dt
  const a = angulos()
  camara.alt = a.alt
  camara.v = a.v
  camara.x += camara.v * dt
  const actual = VISTAS[vistaActual]
  resorte(camara.vaiven, actual.vaiven && !quieto() ? actual.vaiven(tVista) : 0, 1.2, dt)
  resorte(camara.viento, quieto() ? 0 : -viento.x * 0.14, 3, dt)
  camara.sacudida = Math.max(0, camara.sacudida - dt * 3)
  estable = base(a.yaw, a.pitch, a.roll + camara.vaiven.x)
  const calma = quieto() ? 0 : 1
  const aire = calma * (0.5 + Math.abs(viento.x) * 1.4)
  const temblor = calma * camara.sacudida * 0.02
  vista = base(
    a.yaw + calma * 0.004 * Math.sin(reloj * 0.37),
    a.pitch + RAD * aire * (0.5 * Math.sin(reloj * 0.71) + 0.25 * Math.sin(reloj * 2.3)) + temblor * Math.sin(reloj * 61),
    a.roll + camara.vaiven.x + camara.viento.x + RAD * aire * 0.8 * Math.sin(reloj * 0.53) + temblor * Math.sin(reloj * 47),
  )
}

// Dónde cae un punto del mundo en la pantalla: [x, y, distancia] o null.
function proyectar(p) {
  const v = res(p, ojo())
  const a = pto(v, vista.F)
  if (a < 4) return null
  return [w / 2 + (pto(v, vista.R) / a) * k, h / 2 - (pto(v, vista.U) / a) * k, a]
}

// ── El cielo y el mar, pixel a pixel ──────────────────────────────────────
// Franjas del atardecer por la tangente de la elevación, como en las tiras,
// onduladas según hacia dónde se mire; arriba, el azul se oscurece en anillos.
const CIELO = [
  [0.022, rgba('#fbc46e')],
  [0.065, rgba('#f3a07a')],
  [0.125, rgba('#dc9a98')],
  [0.2, rgba('#bd9bbd')],
  [0.32, rgba('#a09fd6')],
  [0.52, rgba('#839de0')],
  [0.85, rgba('#6f96e2')],
  [1.4, rgba('#6089dc')],
  [2.6, rgba('#557dd4')],
  [Infinity, rgba('#4b72cc')],
]
// El mar, por lo hondo que se mira: su color y el de sus olas.
const MAR = [
  [0.018, rgba('#c495a8'), rgba('#ecc0c0')],
  [0.045, rgba('#9a86b6'), rgba('#c2acd6')],
  [0.1, rgba('#7470ac'), rgba('#a09ad6')],
  [Infinity, rgba('#5c5b9e'), rgba('#8584cc')],
]
const SOL = rgba('#fff0b8'), HALO = rgba('#ffd98c'), BRILLO = rgba('#ffd59a')
const SOL_AZ = -1.15, SOL_EL = 0.028, SOL_R = 0.05

const azar = (a, b, c) => {
  let n = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 1274126177)) | 0
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296
}

function pintarCielo() {
  const { F, R, U } = vista
  const deriva = reloj * 2.5
  let p = 0
  for (let j = 0; j < h; j++) {
    const sy = (h / 2 - j - 0.5) / k
    const bx = F[0] + U[0] * sy, by = F[1] + U[1] * sy, bz = F[2] + U[2] * sy
    for (let i = 0; i < w; i++, p++) {
      const sx = (i + 0.5 - w / 2) / k
      const dx = bx + R[0] * sx, dy = by + R[1] * sx, dz = bz + R[2] * sx
      const hor = Math.sqrt(dx * dx + dz * dz)
      const e = dy / hor
      const az = Math.atan2(dz, dx)
      let daz = az - SOL_AZ
      if (daz > Math.PI) daz -= 2 * Math.PI
      else if (daz < -Math.PI) daz += 2 * Math.PI
      if (e >= 0) {
        const de = e - SOL_EL
        const d2 = daz * daz + de * de
        if (d2 < SOL_R * SOL_R) pix[p] = SOL
        else if (d2 < SOL_R * SOL_R * 2.2) pix[p] = HALO
        else {
          const ondulada = e + 0.009 * Math.sin(az * 6 + 1.3) + 0.005 * Math.sin(az * 13)
          let b = 0
          while (ondulada > CIELO[b][0]) b++
          pix[p] = CIELO[b][1]
        }
        continue
      }
      // Donde el rayo toca el agua, olas cortas fijas en el mundo; más grandes
      // a lo lejos, para que no titilen, y doradas bajo el sol.
      const ne = -e
      let b = 0
      while (ne > MAR[b][0]) b++
      let color = MAR[b][1]
      const t = camara.alt / -dy
      const lejos = t * hor
      if (lejos < 3600) {
        const nivel = lejos < 320 ? 0 : lejos < 700 ? 1 : lejos < 1500 ? 2 : 3
        const tam = 1 << nivel
        const fz = (dz * t + deriva * 0.4) / (3.2 * tam)
        const iz = Math.floor(fz)
        const fx = (camara.x + dx * t + deriva + azar(iz, 7, nivel) * 40) / (9 * tam)
        const ix = Math.floor(fx)
        const cx = fx - ix, cz = fz - iz
        const sol = Math.abs(daz) < 0.045 + ne * 0.12
        if (cz > 0.35 && cz < 0.62 && cx > 0.12 && cx < 0.72 && azar(ix, iz, nivel) < (sol ? 0.5 : 0.2)) color = sol ? BRILLO : MAR[b][2]
      }
      pix[p] = color
    }
  }
  ctx.putImageData(imagen, 0, 0)
}

// ── Las nubes ─────────────────────────────────────────────────────────────
// Óvalos en el mundo, alrededor de la cámara; las que quedan atrás vuelven a
// salir adelante. Ninguna en el camino de la cámara.
const nubes = []
function nuevaNube(cualquiera) {
  const ancho = 60 + Math.random() * 130
  const z = (Math.random() * 2 - 1) * 1700
  let y = ALT - 150 + Math.random() * 440
  if (Math.abs(z) < 200 && Math.abs(y - ALT) < 80) y += 160
  const x = camara.x + (cualquiera ? (Math.random() * 2 - 1) * 1700 : 1700 + Math.random() * 300)
  return { p: [x, y, z], ancho }
}

// El viento las corre de lado en la pantalla, a ras del mundo.
function moverNubes(dt) {
  const lado = uni([estable.R[0], 0, estable.R[2]])
  const empuje = viento.x * 90 * dt
  nubes.forEach((n, i) => {
    n.p[0] += lado[0] * empuje
    n.p[2] += lado[2] * empuje
    if (n.p[0] < camara.x - 1800) nubes[i] = nuevaNube(false)
    else if (n.p[2] > 1800) n.p[2] -= 3600
    else if (n.p[2] < -1800) n.p[2] += 3600
  })
}

// Una elipse girada, fila por fila, sin bordes suaves.
function elipse(cx, cy, rx, ry, ang, color) {
  if (rx < 0.6 || ry < 0.4) return
  const c = Math.cos(ang), s = Math.sin(ang)
  const A = (c * c) / (rx * rx) + (s * s) / (ry * ry)
  const B = 2 * s * c * (1 / (rx * rx) - 1 / (ry * ry))
  const C = (s * s) / (rx * rx) + (c * c) / (ry * ry)
  const ey = Math.sqrt(rx * rx * s * s + ry * ry * c * c)
  ctx.fillStyle = color
  for (let y = Math.max(0, Math.floor(cy - ey)); y <= Math.min(h - 1, Math.ceil(cy + ey)); y++) {
    const yy = y + 0.5 - cy
    const b = B * yy, d = b * b - 4 * A * (C * yy * yy - 1)
    if (d < 0) continue
    const r = Math.sqrt(d)
    const x0 = Math.max(0, Math.round((-b - r) / (2 * A) + cx))
    const x1 = Math.min(w, Math.round((-b + r) / (2 * A) + cx))
    if (x1 > x0) ctx.fillRect(x0, y, x1 - x0, 1)
  }
}

// Blanca con el borde de abajo lila; vista desde abajo, más redonda.
function pintarNube(n, [x, y, a]) {
  const rx = (n.ancho / 2 / a) * k
  if (x + rx < -4 || x - rx > w + 4) return
  const desdeAbajo = Math.abs(n.p[1] - camara.alt) / largo(res(n.p, ojo()))
  const ry = Math.min(rx * 0.9, rx * 0.3 * (1 + desdeAbajo * 2))
  // Las nubes van planas en el mundo: en la pantalla se inclinan con la cámara.
  const llano = uni([vista.R[0], 0, vista.R[2]])
  const ang = Math.atan2(-pto(llano, vista.U), pto(llano, vista.R))
  const s = Math.sin(ang), c = Math.cos(ang)
  if (rx > 5) elipse(x, y, rx + 0.8, ry + 0.8, ang, '#9aa7dc')
  elipse(x, y, rx, ry, ang, '#c3cbf2')
  elipse(x + s * ry * 0.22, y - c * ry * 0.22, rx * 0.92, ry * 0.78, ang, '#f5f7ff')
}

// ── Los cazas ─────────────────────────────────────────────────────────────
// Cada caza del guion (`CAZAS`) se mueve en la pantalla (x, y) y en
// profundidad (a, en metros) con resortes; su orientación sale de cómo se
// mueve por el mundo, y se ladea hacia donde gira, como un avión de verdad.
// El guion lo mueve y dispara con sus métodos (`METODOS`). Uno con
// `destellos` lleva brillos alrededor, y uno con `torpeza` (de 0 a 1) vuela
// como quien recién aprende: el ala le sube y le baja sin querer y, cada
// tanto, da un tirón de mandos y vuelve a su sitio corrigiendo.
const cazas = {}

function nuevoCaza({ hoja, destellos = false, torpeza = 0 }) {
  const c = {
    hoja: Object.assign(new Image(), { src: rutaDeCaza(hoja) }),
    destellos,
    torpeza,
    tiron: 1,
    titubeo: 0,
    tonel: null,
    x: { x: -w, v: 0 },
    y: { x: -h, v: 0 },
    a: { x: 600, v: 0 },
    meta: [-w, -h, 600],
    firmeza: 4,
    P: null,
    girar: true,
    vel: [V, 0, 0],
    acel: [0, 0, 0],
    Fw: [1, 0, 0],
    Uw: [0, 1, 0],
    sx: 0,
    sy: 0,
    svx: 0,
    cola: null,
    fogonazo: 0,
    soplo: 0,
    visible: false,
    presente: false,
  }
  for (const [nombre, metodo] of Object.entries(METODOS)) c[nombre] = (...args) => metodo(c, ...args)
  return c
}

function ir(c, x, y, a, firmeza = c.firmeza) {
  c.meta = [x, y, a]
  c.firmeza = firmeza
}

// Aparece ahí de golpe (fuera de la pantalla), ya volando a `vx` px/s.
function saltar(c, x, y, a, vx = 0) {
  c.x = { x, v: vx }
  c.y = { x: y, v: 0 }
  c.a = { x: a, v: 0 }
  c.meta = [x, y, a]
  c.P = null
}

// A un punto del mundo, a `d` metros de la cámara (x adelante, y arriba).
function enMundo(c, d, firmeza) {
  const a = Math.max(5, pto(d, estable.F))
  ir(c, w / 2 + (pto(d, estable.R) / a) * k, h / 2 - (pto(d, estable.U) / a) * k, a, firmeza)
}

// Medio lado, en px de la pantalla, de un caza a `a` metros.
const medioLado = (a) => ((LADO / 2) * k) / a / PIXELES_POR_METRO

// Un circuito, como el de un caza de verdad: cruza la pantalla a `a` m hasta
// salir entero por el borde, vira alejándose con las alas inclinadas, la
// vuelve a cruzar más lejos, al revés, y vira de vuelta hacia la cámara. Sin
// saltos: el viraje lejano se ve en la pantalla y el cercano cae fuera. Cada
// `periodo` s, un cruce y un viraje; `desde` corre el primero para que salga
// de donde quedó tras el diálogo, e `y` es su altura en la pantalla en el
// cruce cercano. Devuelve el número del cruce: los pares, cerca y hacia la derecha.
function pasada(c, t, periodo, desde, y, a) {
  const tt = t + desde * periodo
  const n = Math.floor(tt / periodo)
  const B = ((w / 2 + medioLado(a) + 2) * a) / k
  const R = a * 0.3
  const z = ((h / 2 - y) * a) / k
  const recta = 2 * B
  const s = (tt / periodo - n) * (recta + Math.PI * R)
  const lejos = n % 2
  let b, d
  if (s < recta) {
    b = -B + s
    d = lejos ? a + 2 * R : a
  } else {
    const giro = (s - recta) / R
    b = B + R * Math.sin(giro)
    d = a + R + (lejos ? R : -R) * Math.cos(giro)
  }
  if (lejos) b = -b
  ir(c, w / 2 + (b * k) / d, h / 2 - (z * k) / d, d, 10)
  return n
}

// Un tonel: una vuelta entera sobre su eje en `dur` s, hacia `lado`.
function tonel(c, lado = 1, dur = 0.9) {
  c.tonel ??= { t: 0, dur, lado }
}

const enPantalla = (c, m = 0) => c.presente && c.visible && c.sx > m && c.sx < w - m && c.sy > m && c.sy < h - m

// Se va por arriba, lejos; ya no dispara.
function irse(c) {
  c.presente = false
  ir(c, w * 1.4, -h * 0.5, 700, 1.6)
}

function moverCaza(c, dt) {
  const [mx, my, ma] = c.meta
  resorte(c.x, mx, c.firmeza, dt)
  resorte(c.y, my, c.firmeza, dt)
  resorte(c.a, ma, c.firmeza, dt)
  const a = c.a.x
  const b = ((c.x.x - w / 2) * a) / k
  const z = ((h / 2 - c.y.x) * a) / k
  const P = sum(ojo(), sum(esc(estable.F, a), sum(esc(estable.R, b), esc(estable.U, z))))
  if (c.P && dt > 0) {
    // Mira hacia donde se mueve en la pantalla, más la parte de la velocidad
    // de la cámara que conserva su vista, y un poco hacia el fondo, para
    // virar alejándose y no pasar de nariz por el suelo.
    const { avance = 0.35, fondo = 45 } = VISTAS[vistaActual]
    const lejos = uni([estable.F[0], 0, estable.F[2]])
    const vel = sum(res(esc(res(P, c.P), 1 / dt), [camara.v * (1 - avance), 0, 0]), esc(lejos, fondo))
    const q = 1 - Math.exp(-dt * 4)
    const acel = esc(res(vel, c.vel), 1 / dt)
    c.acel = sum(c.acel, esc(res(acel, c.acel), 1 - Math.exp(-dt * 4)))
    if (c.girar) c.vel = vel
    c.vel = sum(c.vel, esc(res(vel, c.vel), q))
    if (largo(c.vel) > 8) c.Fw = uni(sum(c.Fw, esc(res(uni(c.vel), c.Fw), q)))
    // Se ladea hacia donde gira, hasta 70° en los virajes cerrados.
    const lateral = res(c.acel, esc(c.Fw, pto(c.acel, c.Fw)))
    const ladeo = esc(lateral, Math.min(0.07, (9.8 * 2.75) / (largo(lateral) || 1)))
    const sustentacion = sum([0, 9.8, 0], ladeo)
    const arriba = res(sustentacion, esc(c.Fw, pto(sustentacion, c.Fw)))
    if (largo(arriba) > 0.5) c.Uw = uni(sum(c.Uw, esc(res(uni(arriba), c.Uw), q)))
    c.Uw = uni(res(c.Uw, esc(c.Fw, pto(c.Uw, c.Fw))))
  }
  // Tras aparecer de golpe, mira de una vez hacia donde vuela.
  if (c.P === null) c.girar = true
  else if (c.girar) {
    c.Fw = uni(c.vel)
    c.girar = false
  }
  c.P = P
  const sp = proyectar(P)
  c.visible = Boolean(sp)
  if (sp) {
    c.svx = (sp[0] - c.sx) / (dt || 1)
    c.sx = sp[0]
    c.sy = sp[1]
  }
  c.fogonazo = Math.max(0, c.fogonazo - dt)
  if (c.tonel && (c.tonel.t += dt) >= c.tonel.dur) c.tonel = null
  if (c.torpeza) torpe(c, dt)
  // Los brillos alrededor, mientras se lo ve.
  if (!c.visible || !c.destellos || (c.soplo -= dt) > 0) return
  c.soplo = 0.22
  const lado = (12 * k) / a
  brillos.push({ x: c.sx + (Math.random() - 0.5) * lado, y: c.sy + (Math.random() - 0.5) * lado * 0.6, t: 0.5 })
}

// Corrige tarde y de más: el ala le baja y le sube sola y, cada uno o dos
// segundos, un tirón de mandos lo saca de su línea.
function torpe(c, dt) {
  if (quieto()) return
  c.titubeo = c.torpeza * (0.5 * Math.sin(reloj * 4.3) * Math.sin(reloj * 0.9 + 1) + 0.15 * Math.sin(reloj * 11))
  if ((c.tiron -= dt) > 0) return
  c.tiron = 0.8 + Math.random() * 1.6
  c.x.v += (Math.random() - 0.5) * w * 1.3 * c.torpeza
  c.y.v += (Math.random() - 0.5) * h * 1.1 * c.torpeza
}

// Lo que gira sobre su eje, además del ladeo: el tonel y el titubeo.
function alabeo(c) {
  if (!c.tonel) return c.titubeo
  const { t, dur, lado } = c.tonel
  return c.titubeo + lado * 2 * Math.PI * suave(Math.min(1, t / dur))
}

// El cuadro de la hoja según desde dónde se lo ve, girado según su ladeo.
function pintarCaza(c, [sx, sy, a]) {
  if (!c.hoja.complete || !c.hoja.naturalWidth) return
  const v = uni(res(ojo(), c.P))
  const giroPropio = alabeo(c)
  const Uw = giroPropio ? sum(esc(c.Uw, Math.cos(giroPropio)), esc(cruz(c.Fw, c.Uw), Math.sin(giroPropio))) : c.Uw
  const Rw = cruz(c.Fw, Uw)
  const giro = Math.atan2(pto(v, Rw), pto(v, c.Fw)) / RAD
  const altura = Math.asin(limitar(pto(v, Uw), -1, 1)) / RAD
  const paso = 360 / GIROS
  const col = ((Math.round(giro / paso) % GIROS) + GIROS) % GIROS
  const fila = limitar(Math.round((altura - ALTURAS[0]) / (ALTURAS[1] - ALTURAS[0])), 0, ALTURAS.length - 1)
  let derecha = cruz(esc(v, -1), Uw)
  if (largo(derecha) < 0.05) derecha = Rw
  const rho = Math.atan2(-pto(derecha, vista.U), pto(derecha, vista.R))
  const s = k / a / PIXELES_POR_METRO
  const x = Math.round(sx), y = Math.round(sy)
  ctx.setTransform(Math.cos(rho) * s, Math.sin(rho) * s, -Math.sin(rho) * s, Math.cos(rho) * s, x, y)
  ctx.drawImage(c.hoja, col * LADO, fila * LADO, LADO, LADO, -LADO / 2, -LADO / 2, LADO, LADO)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  if (c.fogonazo <= 0) return
  ctx.fillStyle = '#fff1a8'
  ctx.fillRect(x - 1, y - 1, 3, 3)
  ctx.fillStyle = '#ffb347'
  ctx.fillRect(x - 2, y, 5, 1)
  ctx.fillRect(x, y - 2, 1, 5)
}

// ── Humo y brillos ────────────────────────────────────────────────────────
// El humo de los misiles crece, se aclara y se lo lleva el viento; las
// salpicaduras de un caza a ras del mar, igual, y además caen con el agua
// (`cae`, px/s). Todo va detrás de los cazas y de las balas. Los brillos de
// Duke parpadean.
const humos = []
const brillos = []

function moverHumo(dt) {
  for (let i = humos.length - 1; i >= 0; i--) {
    const p = humos[i]
    p.t += dt
    p.r += p.crece * dt
    p.x += viento.x * 40 * dt
    p.y += (viento.y * 40 - 4 + (p.cae ?? 0)) * dt
    if (p.t > p.vida) humos.splice(i, 1)
  }
  if (humos.length > 220) humos.splice(0, humos.length - 220)
  for (let i = brillos.length - 1; i >= 0; i--) if ((brillos[i].t -= dt) <= 0) brillos.splice(i, 1)
}

function pintarHumo() {
  for (const p of humos) elipse(p.x, p.y, p.r, p.r, 0, `rgb(${p.color} / ${(p.alfa * (1 - p.t / p.vida)).toFixed(2)})`)
}

function pintarBrillos() {
  ctx.fillStyle = '#fff6c2'
  for (const b of brillos) {
    const r = b.t > 0.25 ? 2 : 1, x = Math.round(b.x), y = Math.round(b.y)
    ctx.fillRect(x - r, y, r * 2 + 1, 1)
    ctx.fillRect(x, y - r, 1, r * 2 + 1)
  }
}

// ── El viento ─────────────────────────────────────────────────────────────
// Cada ráfaga sube y baja en `dur` s; corre a quien juega, curva las balas,
// inclina la cámara, empuja las nubes y deja estelas de aire.
const rafagas = []
const viento = { x: 0, y: 0 }
const estelas = []

function soplar(lado, fuerza = 1, dur = 2.2) {
  rafagas.push({ lado, sube: (Math.random() - 0.5) * 0.5, fuerza, t: 0, dur })
}

function moverViento(dt) {
  viento.x = 0
  viento.y = 0
  for (let i = rafagas.length - 1; i >= 0; i--) {
    const r = rafagas[i]
    r.t += dt
    if (r.t >= r.dur) {
      rafagas.splice(i, 1)
      continue
    }
    const fuerza = Math.sin((Math.PI * r.t) / r.dur) ** 2 * r.fuerza
    viento.x += r.lado * fuerza
    viento.y += r.sube * fuerza
  }
  const fuerza = Math.abs(viento.x)
  if (fuerza > 0.12) {
    const n = fuerza * (quieto() ? 14 : 55) * dt * (w / 200)
    for (let i = 0; i < n; i++) {
      estelas.push({ x: viento.x > 0 ? -20 : w + 20, y: Math.random() * h, l: 5 + Math.random() * 14, v: 160 + Math.random() * 140 })
    }
  }
  for (let i = estelas.length - 1; i >= 0; i--) {
    const e = estelas[i]
    e.x += Math.sign(viento.x || 1) * e.v * dt * (0.4 + fuerza)
    e.y += viento.y * 30 * dt
    if (e.x < -40 || e.x > w + 40 || fuerza < 0.05) estelas.splice(i, 1)
  }
}

function pintarEstelas() {
  ctx.fillStyle = 'rgb(255 248 240 / 0.55)'
  for (const e of estelas) ctx.fillRect(Math.round(e.x), Math.round(e.y), Math.round(e.l), 1)
}

// ── Quien juega ───────────────────────────────────────────────────────────
// La flecha, con la punta en el ratón, o la huella, centrada en el dedo. Le
// pega lo que toque cualquiera de sus pixeles, la cola también, y siempre se
// ve entera: no sale de la pantalla.
const forma = (mapa, ox, oy) => ({
  mapa,
  ox,
  oy,
  ancho: Math.max(...mapa.map((fila) => fila.length)),
  alto: mapa.length,
  pixeles: mapa.flatMap((fila, y) => [...fila].flatMap((c, x) => (c === ' ' ? [] : [[x, y]]))),
})
const FORMAS = { cursor: forma(FLECHA, 0, 0), huella: forma(HUELLA, 4, 5) }

let modo = matchMedia('(hover: hover) and (pointer: fine)').matches ? 'cursor' : 'huella'
// `vx` y `vy`: cómo se viene moviendo, para quien dispara adonde va a estar.
const jugador = { x: 0, y: 0, vx: 0, vy: 0, pv: PV_MAX, inmune: 0, golpe: 0 }
const objetivo = { x: 0, y: 0 }
const teclas = new Set()

function moverJugador(dt) {
  const rapidez = 130
  if (teclas.has('ArrowLeft')) objetivo.x -= rapidez * dt
  if (teclas.has('ArrowRight')) objetivo.x += rapidez * dt
  if (teclas.has('ArrowUp')) objetivo.y -= rapidez * dt
  if (teclas.has('ArrowDown')) objetivo.y += rapidez * dt
  const f = FORMAS[modo]
  const enPantallaX = (x) => limitar(x, f.ox, w - f.ancho + f.ox)
  const enPantallaY = (y) => limitar(y, f.oy, h - f.alto + f.oy)
  objetivo.x = enPantallaX(objetivo.x)
  objetivo.y = enPantallaY(objetivo.y)
  // Va justo donde está la mano; solo la ráfaga lo corre, y hay que compensar.
  const x = enPantallaX(objetivo.x + viento.x * 18)
  const y = enPantallaY(objetivo.y + viento.y * 18)
  if (dt > 0) {
    const q = 1 - Math.exp(-dt * 6)
    jugador.vx += ((x - jugador.x) / dt - jugador.vx) * q
    jugador.vy += ((y - jugador.y) / dt - jugador.vy) * q
  }
  jugador.x = x
  jugador.y = y
  jugador.inmune = Math.max(0, jugador.inmune - dt)
  jugador.golpe = Math.max(0, jugador.golpe - dt)
}

// Dónde va a estar en `s` segundos si sigue como viene.
const futuro = (s) => [limitar(jugador.x + jugador.vx * s, 4, w - 4), limitar(jugador.y + jugador.vy * s, 4, h - 4)]

// La esquina de su figura, como se pinta.
const esquina = (f) => [Math.round(jugador.x) - f.ox, Math.round(jugador.y) - f.oy]

// Si un círculo de radio `r` en (x, y) toca algún pixel de quien juega.
function toca(x, y, r) {
  const f = FORMAS[modo]
  const [x0, y0] = esquina(f)
  if (x + r < x0 || x - r > x0 + f.ancho || y + r < y0 || y - r > y0 + f.alto) return false
  return f.pixeles.some(([px, py]) => {
    const dx = Math.max(x0 + px - x, 0, x - x0 - px - 1)
    const dy = Math.max(y0 + py - y, 0, y - y0 - py - 1)
    return dx * dx + dy * dy < r * r
  })
}

// Si un rayo desde (x, y) hacia `ang`, de `ancho` px, toca alguno.
function tocaRayo(x, y, ang, ancho) {
  const f = FORMAS[modo]
  const [x0, y0] = esquina(f)
  const c = Math.cos(ang), s = Math.sin(ang)
  return f.pixeles.some(([px, py]) => {
    const dx = x0 + px + 0.5 - x, dy = y0 + py + 0.5 - y
    return dx * c + dy * s > 0 && Math.abs(dy * c - dx * s) < ancho / 2 + 0.5
  })
}

// El centro de la figura: adonde van los misiles.
function centroDeQuienJuega() {
  const f = FORMAS[modo]
  const [x0, y0] = esquina(f)
  return { x: x0 + f.ancho / 2, y: y0 + f.alto / 2 }
}

// Va en su propio lienzo, encima del diálogo y de los botones, para que
// nada lo tape: se pinta solo cuando cambia y se mueve entero.
let figura, pincel, pintada = ''
function pintarJugador(visible) {
  const f = FORMAS[modo]
  const parpadea = jugador.inmune > 0 && Math.floor(jugador.inmune * 12) % 2
  figura.hidden = !visible || Boolean(parpadea)
  if (figura.hidden) return
  const blanco = jugador.golpe > 0 ? '#ffb0a0' : '#ffffff'
  if (pintada !== modo + blanco) {
    pintada = modo + blanco
    pincel.clearRect(0, 0, figura.width, figura.height)
    f.mapa.forEach((fila, y) => {
      for (let x = 0; x < fila.length; x++) {
        if (fila[x] === ' ') continue
        pincel.fillStyle = fila[x] === 'X' ? BORDE : blanco
        pincel.fillRect(x, y, 1, 1)
      }
    })
  }
  figura.style.width = `${figura.width * escala}px`
  figura.style.translate = `${(Math.round(jugador.x) - f.ox) * escala}px ${(Math.round(jugador.y) - f.oy) * escala}px`
}

// La mira: corchetes rojos alrededor de quien juega, como en las escenas,
// justo fuera de lo que le pega; con un misil guiado detrás, se cierran y
// parpadean.
function pintarMira() {
  const f = FORMAS[modo]
  const { x, y } = centroDeQuienJuega()
  const fijado = balas.some((b) => b.tipo === 'misil' && b.t < b.guia)
  const holgura = fijado ? 2 : 4 + Math.sin(reloj * 5) * 1.5
  corchetes(Math.floor(x), Math.floor(y), f.ancho / 2 + holgura, fijado && Math.floor(reloj * 10) % 2 ? '#ffffff' : '#ff4a36', f.alto / 2 + holgura)
}

function corchetes(cx, cy, rx, color, ry = rx) {
  rx = Math.round(rx)
  ry = Math.round(ry)
  ctx.fillStyle = color
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const x = cx + sx * rx, y = cy + sy * ry
    ctx.fillRect(sx < 0 ? x : x - 2, y, 3, 1)
    ctx.fillRect(x, sy < 0 ? y : y - 2, 1, 3)
  }
}

// ── Las balas ─────────────────────────────────────────────────────────────
// Cada `tipo` se mueve (y dice si se acaba) y se pinta a su manera:
//   plana   cruza la pantalla; el viento la curva, y `curva` (rad/s) también.
//           Su `forma`: punta, gruesa (Moby), estrella (Duke) o violeta (Duky).
//   honda   viene desde el fondo a un punto marcado y solo pega al llegar.
//   misil   persigue a quien juega `guia` s, girando hasta `giro` rad/s; sin
//           guía es un cohete, que sale derecho y no dobla.
//   rayo    nace en el caza y lo sigue: apunta `carga` s con una línea fina
//           al punto que le dieron y quema `dura` s; con `barre` (rad/s)
//           recorre un abanico alrededor de ese punto, que se marca mientras
//           carga.
// Cada una quita lo que diga su `dano` o, si no, lo del guion.
let balas = []
const chispas = []
const RADIOS = { punta: 1, gruesa: 2, estrella: 1.5, violeta: 1 }

function disparo(x, y, vx, vy, extra = {}) {
  balas.push({ tipo: 'plana', forma: 'punta', x, y, vx, vy, ay: 0, curva: 0, ...extra })
}

// `n` balas desde el caza, abiertas `abre` radianes alrededor de `centro`
// (hacia quien juega, si no lo dice), a `rapidez` px/s.
function abanico(c, n, abre, rapidez, centro = Math.atan2(jugador.y - c.sy, jugador.x - c.sx), extra = {}) {
  for (let i = 0; i < n; i++) {
    const ang = centro + (n > 1 ? (i / (n - 1) - 0.5) * abre : 0)
    disparo(c.sx, c.sy, Math.cos(ang) * rapidez, Math.sin(ang) * rapidez, extra)
  }
  c.fogonazo = 0.07
}

function hondo(c, tx, ty, T = 1.2) {
  balas.push({ tipo: 'honda', x0: c.sx, y0: c.sy, tx: limitar(tx, 4, w - 4), ty: limitar(ty, 4, h - 4), t: 0, T, x: c.sx, y: c.sy })
  c.fogonazo = 0.07
}

// Sale hacia quien juega, abierto al azar hasta `abre` radianes.
function misil(c, { rapidez = 70, giro = 2.2, guia = 3, abre = 1.6 } = {}) {
  const ang = Math.atan2(jugador.y - c.sy, jugador.x - c.sx) + (Math.random() - 0.5) * abre
  balas.push({ tipo: 'misil', x: c.sx, y: c.sy, ang, v: 20, rapidez, giro, guia, t: 0, humo: 0 })
  c.fogonazo = 0.07
}

// Desde el caza `c` hacia (tx, ty); si barre, cruza ese punto a media quemada.
function rayo(c, tx, ty, { carga = 0.7, dura = 0.25, barre = 0, ancho = 3, dano } = {}) {
  const b = { tipo: 'rayo', c, tx, ty, carga, dura, barre, ancho, dano, t: 0 }
  apuntar(b)
  balas.push(b)
}

// Desde donde va el caza, hacia su punto, corrido lo que lleva barrido.
function apuntar(b) {
  b.x = b.c.sx
  b.y = b.c.sy
  b.ang = Math.atan2(b.ty - b.y, b.tx - b.x) + b.barre * (limitar(b.t - b.carga, 0, b.dura) - b.dura / 2)
}

const METODOS = { ir, saltar, enMundo, pasada, tonel, enPantalla, abanico, hondo, misil, rayo }

const afuera = (b, m = 24) => b.x < -m || b.x > w + m || b.y < -m || b.y > h + m

// Cada uno devuelve si la bala se acaba; `p`, el centro de quien juega, es
// adonde van los misiles.
const MOVER = {
  plana(b, dt) {
    if (b.curva) {
      const c = Math.cos(b.curva * dt), s = Math.sin(b.curva * dt)
      ;[b.vx, b.vy] = [b.vx * c - b.vy * s, b.vx * s + b.vy * c]
    }
    b.vx += viento.x * 46 * dt
    b.vy += (b.ay + viento.y * 46) * dt
    b.x += b.vx * dt
    b.y += b.vy * dt
    if (afuera(b)) return true
    if (!toca(b.x, b.y, RADIOS[b.forma])) return false
    herir(b.dano)
    return true
  },
  honda(b, dt) {
    b.t += dt
    const q = Math.min(1, b.t / b.T)
    b.z = 7 - 6 * q
    const avance = (1 / b.z - 1 / 7) / (1 - 1 / 7)
    b.x = lerp(b.x0, b.tx, avance)
    b.y = lerp(b.y0, b.ty, avance)
    if (q < 1) return false
    if (toca(b.tx, b.ty, 3)) herir(b.dano)
    chispas.push({ x: b.tx, y: b.ty, t: 0.18 })
    return true
  },
  misil(b, dt, p) {
    b.t += dt
    if (b.t < b.guia) {
      const d = Math.atan2(p.y - b.y, p.x - b.x) - b.ang
      b.ang += limitar(Math.atan2(Math.sin(d), Math.cos(d)), -b.giro * dt, b.giro * dt)
    }
    b.v = Math.min(b.rapidez, b.v + 120 * dt)
    b.x += Math.cos(b.ang) * b.v * dt + viento.x * 12 * dt
    b.y += Math.sin(b.ang) * b.v * dt
    if ((b.humo -= dt) <= 0) {
      b.humo = 0.04
      humos.push({ x: b.x, y: b.y, r: 0.8, crece: 3, t: 0, vida: 0.7, color: '240 240 248', alfa: 0.7 })
    }
    if ((b.t > b.guia && afuera(b, 30)) || b.t > 8) return true
    if (!toca(b.x, b.y, 1.5)) return false
    herir(b.dano)
    chispas.push({ x: b.x, y: b.y, t: 0.18 })
    return true
  },
  rayo(b, dt) {
    const antes = b.t
    b.t += dt
    apuntar(b)
    if (b.t <= b.carga) return false
    // Al encenderse, la pantalla tiembla y salta un fogonazo donde nace.
    if (antes <= b.carga) {
      camara.sacudida = Math.max(camara.sacudida, 0.7)
      chispas.push({ x: b.x, y: b.y, t: 0.18 })
    }
    if (tocaRayo(b.x, b.y, b.ang, b.ancho)) herir(b.dano)
    return b.t > b.carga + b.dura
  },
}

function moverBalas(dt) {
  const p = centroDeQuienJuega()
  for (let i = balas.length - 1; i >= 0; i--) if (MOVER[balas[i].tipo](balas[i], dt, p)) balas.splice(i, 1)
  for (let i = chispas.length - 1; i >= 0; i--) if ((chispas[i].t -= dt) <= 0) chispas.splice(i, 1)
}

// Las formas de las planas: [borde, centro] y cuánto se extienden.
const COLORES = { punta: ['#e8402a', '#fff3c4'], gruesa: ['#e8402a', '#ffb347'], estrella: ['#f2c440', '#ffffff'], violeta: ['#9a6cff', '#efe6ff'] }

function cruzPixel(x, y, r, borde, centro) {
  ctx.fillStyle = borde
  ctx.fillRect(x - r, y, r * 2 + 1, 1)
  ctx.fillRect(x, y - r, 1, r * 2 + 1)
  if (r > 1) ctx.fillRect(x - r + 1, y - r + 1, r * 2 - 1, r * 2 - 1)
  ctx.fillStyle = centro
  ctx.fillRect(x, y, 1, 1)
}

// Una línea de pixeles desde (x, y) hacia `ang`, en lo que caiga dentro de
// la pantalla, aunque nazca fuera; con `trazos`, punteada.
function linea(x, y, ang, grueso, color, trazos = 1) {
  ctx.fillStyle = color
  const dx = Math.cos(ang), dy = Math.sin(ang)
  let entro = false
  for (let d = 0; d < 3 * (w + h); d++) {
    const px = Math.round(x + dx * d), py = Math.round(y + dy * d)
    const dentro = px >= -2 && px <= w + 2 && py >= -2 && py <= h + 2
    if (!dentro && entro) break
    entro ||= dentro
    if (!dentro || (trazos > 1 && d % trazos >= trazos / 2)) continue
    ctx.fillRect(px - (grueso >> 1), py - (grueso >> 1), grueso, grueso)
  }
}

const PINTAR = {
  plana(b) {
    const x = Math.round(b.x), y = Math.round(b.y)
    const [borde, centro] = COLORES[b.forma]
    if (b.forma === 'gruesa') return cruzPixel(x, y, 2, borde, centro)
    if (b.forma === 'estrella') return cruzPixel(x, y, Math.floor(reloj * 8 + x) % 2 ? 2 : 1, borde, centro)
    const rapidez = Math.hypot(b.vx, b.vy) || 1
    ctx.fillStyle = borde
    ctx.fillRect(Math.round(b.x - (b.vx / rapidez) * 3), Math.round(b.y - (b.vy / rapidez) * 3), 1, 1)
    cruzPixel(x, y, 1, borde, centro)
  },
  honda(b) {
    const q = b.t / b.T
    corchetes(Math.round(b.tx), Math.round(b.ty), 3 + 9 * (1 - q), q > 0.75 && Math.floor(reloj * 16) % 2 ? '#ffffff' : '#ff4a36')
    const r = Math.max(1, Math.round(3.4 / b.z)), x = Math.round(b.x), y = Math.round(b.y)
    ctx.fillStyle = '#e8402a'
    ctx.fillRect(x - r, y - r + 1, r * 2 + 1, r * 2 - 1)
    ctx.fillRect(x - r + 1, y - r, r * 2 - 1, r * 2 + 1)
    ctx.fillStyle = '#fff3c4'
    ctx.fillRect(x - r + 1, y - r + 1, r * 2 - 1, r * 2 - 1)
  },
  misil(b) {
    const x = Math.round(b.x), y = Math.round(b.y), dx = Math.cos(b.ang), dy = Math.sin(b.ang)
    ctx.fillStyle = '#d9dce8'
    for (let d = -3; d <= 0; d++) ctx.fillRect(Math.round(x + dx * d), Math.round(y + dy * d), 1, 1)
    ctx.fillStyle = '#ff4a36'
    ctx.fillRect(Math.round(x + dx), Math.round(y + dy), 1, 1)
    ctx.fillStyle = '#ffd59a'
    ctx.fillRect(Math.round(x - dx * 4), Math.round(y - dy * 4), 1, 1)
  },
  // Cargando, una línea punteada que parpadea (dos, en los bordes de lo que
  // va a barrer) y un brillo que crece donde nace; quemando, el haz violeta
  // con el centro blanco.
  rayo(b) {
    if (b.t < b.carga) {
      const color = Math.floor(reloj * 12) % 2 ? '#c9b5ff' : '#9a6cff'
      linea(b.x, b.y, b.ang, 1, color, 4)
      if (b.barre) linea(b.x, b.y, b.ang + b.barre * b.dura, 1, color, 4)
      const r = Math.round(1 + (3 * b.t) / b.carga)
      cruzPixel(Math.round(b.x), Math.round(b.y), r, '#9a6cff', '#ffffff')
      return
    }
    linea(b.x, b.y, b.ang, b.ancho, '#9a6cff')
    linea(b.x, b.y, b.ang, Math.max(1, b.ancho - 2), '#efe6ff')
  },
}

function pintarBalas() {
  for (const b of balas) PINTAR[b.tipo](b)
  ctx.fillStyle = '#fff1a8'
  for (const c of chispas) {
    const r = Math.round((0.18 - c.t) * 30), x = Math.round(c.x), y = Math.round(c.y)
    ctx.fillRect(x - r, y, 1, 1)
    ctx.fillRect(x + r, y, 1, 1)
    ctx.fillRect(x, y - r, 1, 1)
    ctx.fillRect(x, y + r, 1, 1)
  }
}

function herir(dano = guion.DANO ?? DANO) {
  if (jugador.inmune > 0 || estado !== 'ataque') return
  jugador.pv = Math.max(0, jugador.pv - dano)
  jugador.inmune = 1.1
  jugador.golpe = 0.25
  camara.sacudida = dano > 10 ? 2 : 1
  pintarPV()
  if (jugador.pv === 0) perder()
}

// ── Lo que el combate le presta al guion ──────────────────────────────────
// Cierto una vez cada `periodo` s, la primera en `desde`. Si no se preguntó
// por un rato (el caza estaba fuera), sigue desde ahora, sin ponerse al día.
function cada(s, clave, periodo, t, desde = 0) {
  s[clave] ??= desde
  if (t < s[clave]) return false
  s[clave] = Math.max(s[clave], t - periodo) + periodo
  return true
}

// Cierto cuando `valor`, que sube, vuelve a empezar.
function cruza(s, clave, valor) {
  const antes = s[clave]
  s[clave] = valor
  return antes != null && valor < antes
}

// La pantalla tiembla con el cañón que no para.
const sacudir = (fuerza) => (camara.sacudida = Math.max(camara.sacudida, fuerza))

// Agua que salta detrás de un caza a ras del mar y se queda atrás.
const salpicar = (x, y) => humos.push({ x, y, r: 1, crece: 10, t: 0, vida: 0.5, color: '240 248 255', alfa: 0.8, cae: h * 1.4 })

const prestar = {
  get w() {
    return w
  },
  get h() {
    return h
  },
  jugador,
  cazas,
  futuro,
  disparo,
  soplar,
  sacudir,
  salpicar,
  cada,
  cruza,
}

// ── El diálogo ────────────────────────────────────────────────────────────
// Un cuadro de comunicaciones: el retrato de quien habla, que mueve el pico
// mientras se escribe su línea, su nombre y el texto, letra a letra y rápido,
// en una caja de alto fijo. Cada línea queda lo justo para leerla y pasa
// sola; un clic, un toque o Enter la adelantan. Cuando en la batalla hay más
// de uno, cada cual habla desde su esquina de abajo (`LADOS` del guion); si
// no, y en las acotaciones, que no tienen retrato, desde el medio.
const FILAS = Object.fromEntries(RETRATOS.map(({ quien }, fila) => [quien, fila]))
let caja, retrato, quien, texto, dicho, falta, leido
let cola = [], alTerminar = null, frase = '', letras = 0, espera = 0, hablaba

function decir(lineas, despues) {
  cola = [...lineas]
  alTerminar = despues
  hablaba = undefined
  caja.hidden = false
  caja.focus({ preventScroll: true })
  siguiente()
}

function siguiente() {
  if (!cola.length) {
    caja.hidden = true
    const despues = alTerminar
    alTerminar = null
    despues?.()
    return
  }
  const l = cola.shift()
  // Cada vez que cambia quien habla, el cuadro se abre de nuevo en su lugar.
  if (l.quien !== hablaba) {
    caja.classList.remove('abre')
    void caja.offsetWidth
    caja.classList.add('abre')
  }
  hablaba = l.quien
  const fila = FILAS[l.quien]
  caja.dataset.lado = (l.quien && guion.LADOS?.[l.quien]) || 'centro'
  caja.classList.toggle('con-retrato', fila !== undefined)
  retrato.style.setProperty('--fila', fila ?? 0)
  quien.textContent = l.quien ?? ''
  texto.classList.toggle('acotacion', !l.quien)
  frase = typeof l.texto === 'string' ? l.texto : l.texto[modo]
  letras = quieto() ? frase.length : 0
  espera = leer(frase)
  leido.textContent = `${l.quien ? `${l.quien}: ` : ''}${frase}`
  escribir()
}

function escribir() {
  const n = Math.floor(letras)
  dicho.textContent = frase.slice(0, n)
  falta.textContent = frase.slice(n)
  caja.classList.toggle('escribiendo', n < frase.length)
}

function avanzar() {
  if (caja.hidden) return
  if (letras < frase.length) {
    letras = frase.length
    escribir()
  } else siguiente()
}

// ── El juego ──────────────────────────────────────────────────────────────
let estado = 'portada' // portada · dialogo · ataque · final · derrota
let pausado = false
let vistaActual = 0, tAtaque = 0, tVista = 0, memoria = {}, reloj = 0, rotuloHasta = 0
const panel = (nombre) => raiz.querySelector(`.nivel-${nombre}`)

// Los cazas de la vista (`cazas`, o todos): los que faltan entran desde
// fuera de la pantalla y los que sobran se van.
function presentar(v) {
  const presentes = v.cazas ?? Object.keys(cazas)
  for (const [nombre, c] of Object.entries(cazas)) {
    if (!presentes.includes(nombre)) {
      if (c.presente) irse(c)
      continue
    }
    if (!c.presente) saltar(c, w * 1.3, h * 0.15, 500)
    c.presente = true
  }
  v.presenta(prestar)
}

function empezarVista(i, conDialogo = true) {
  vistaActual = i
  tAtaque = 0
  tVista = 0
  memoria = {}
  balas = []
  camara.vaiven.x = Math.atan2(Math.sin(camara.vaiven.x), Math.cos(camara.vaiven.x))
  camaraHacia(VISTAS[i])
  presentar(VISTAS[i])
  const atacar = () => {
    estado = 'ataque'
    rotular(`Vista ${i + 1} de ${VISTAS.length} · ${VISTAS[i].nombre}`)
  }
  if (!conDialogo) return atacar()
  estado = 'dialogo'
  decir(VISTAS[i].lineas, atacar)
}

function jugar(desde = 0, conDialogo = true) {
  panel('portada').hidden = true
  panel('derrota').hidden = true
  jugador.pv = PV_MAX
  jugador.inmune = 0
  pintarPV()
  panel('pv').hidden = false
  raiz.classList.add('jugando')
  if (!objetivo.x) {
    objetivo.x = w / 2
    objetivo.y = h * 0.7
  }
  empezarVista(desde, conDialogo)
}

function perder() {
  estado = 'derrota'
  caja.hidden = true
  raiz.classList.remove('jugando')
  raiz.querySelector('.nivel-derrota-vista').textContent = VISTAS[vistaActual].nombre
  panel('derrota').hidden = false
  panel('derrota').querySelector('button').focus()
}

// Los cazas se van y, tras las últimas líneas, siguen las escenas.
function ganar() {
  estado = 'final'
  for (const c of Object.values(cazas)) if (c.presente) ir(c, w * 1.5, -h * 0.4, 420, 1.6)
  decir(guion.FINAL, salir)
}

// Vuelven las bandas negras de las escenas y, cuando llegan, siguen ellas.
function salir() {
  const sigue = () => {
    parar.abort()
    alSalir()
  }
  if (quieto()) return sigue()
  raiz.querySelector('.banda').addEventListener('transitionend', sigue, { once: true, signal: parar.signal })
  raiz.classList.remove('sin-bandas')
}

function pintarPV() {
  raiz.querySelector('.nivel-pv-lleno').style.width = `${(jugador.pv / PV_MAX) * 100}%`
  raiz.querySelector('.nivel-pv-numero').textContent = `${jugador.pv} / ${PV_MAX}`
}

function rotular(rotulo) {
  panel('rotulo').textContent = rotulo
  panel('rotulo').classList.add('visible')
  rotuloHasta = reloj + 1.8
}

const jugable = () => estado === 'ataque' || estado === 'dialogo' || estado === 'final'

function pausar(si) {
  pausado = si
  panel('pausado').hidden = !si
  panel('pausa').setAttribute('aria-pressed', String(si))
  raiz.classList.toggle('jugando', !si && jugable())
  if (si) panel('pausado').querySelector('button').focus()
}

function actualizar(dt) {
  reloj += dt
  tVista += dt
  moverViento(dt)
  moverCamara(dt)
  const v = VISTAS[vistaActual]
  if (estado === 'ataque') {
    tAtaque += dt
    v.mover(tAtaque, memoria, prestar)
    if (v.choque) chocar()
    if (tAtaque < v.dur) v.disparar(tAtaque, memoria, prestar)
    else if (!balas.length || tAtaque > v.dur + 2.5) {
      if (vistaActual + 1 < VISTAS.length) empezarVista(vistaActual + 1)
      else ganar()
    }
  } else if (estado === 'portada') v.mover(reloj, memoria, prestar)
  for (const c of Object.values(cazas)) moverCaza(c, dt)
  moverHumo(dt)
  moverNubes(dt)
  if (estado !== 'portada') moverJugador(dt)
  moverBalas(dt)
  if (!caja.hidden) {
    if (letras < frase.length) {
      letras += dt * LETRAS_POR_SEGUNDO
      escribir()
    } else if ((espera -= dt) <= 0) siguiente()
  }
  if (rotuloHasta && reloj > rotuloHasta) {
    panel('rotulo').classList.remove('visible')
    rotuloHasta = 0
  }
}

// En una vista con `choque`, el caza mismo pega: hay que esquivar el avión,
// no solo sus balas. Le pega su cuerpo, sin la punta de las alas.
function chocar() {
  for (const c of Object.values(cazas)) if (c.presente && c.visible && toca(c.sx, c.sy, medioLado(c.a.x) * 0.4)) herir()
}

// El humo, debajo; nubes y cazas de lejos a cerca; encima, las balas.
function dibujar() {
  pintarCielo()
  pintarHumo()
  const cosas = []
  for (const n of nubes) {
    const sp = proyectar(n.p)
    // La que pasa casi encima de la cámara, cuando baja o sube, no tapa la vista.
    if (sp && sp[2] > 60) cosas.push([sp[2], () => pintarNube(n, sp)])
  }
  for (const c of Object.values(cazas)) {
    const sp = c.P && proyectar(c.P)
    if (sp) cosas.push([sp[2], () => pintarCaza(c, sp)])
  }
  cosas.sort((a, b) => b[0] - a[0]).forEach(([, pintar]) => pintar())
  pintarBrillos()
  pintarEstelas()
  pintarBalas()
  if (estado === 'ataque' && !pausado) pintarMira()
  pintarJugador(jugable() && !pausado)
}

// ── Las manos ─────────────────────────────────────────────────────────────
// Todo lo que escucha un nivel se suelta al terminarlo, con `parar`.
let parar, alSalir
const oir = (blanco, tipo, accion) => blanco.addEventListener(tipo, accion, { signal: parar.signal })
function escuchar() {
  let arrastre = null
  const punto = (e) => {
    const caja = lienzo.getBoundingClientRect()
    return [(e.clientX - caja.left) / escala, (e.clientY - caja.top) / escala]
  }
  oir(lienzo, 'pointerdown', (e) => {
    if (e.pointerType === 'touch') {
      modo = 'huella'
      arrastre = { x: e.clientX, y: e.clientY, t: performance.now(), movido: 0 }
      // En pausa, volver a apoyar el dedo sigue el juego.
      if (pausado) pausar(false)
      lienzo.setPointerCapture(e.pointerId)
      return
    }
    modo = 'cursor'
    ;[objetivo.x, objetivo.y] = punto(e)
    if (estado === 'dialogo' || estado === 'final') avanzar()
  })
  // El ratón se sigue en todo el nivel, también sobre el diálogo y los
  // botones (el CSS esconde ahí el cursor del sistema), y si sale de la
  // página el juego se pausa: nunca se ven dos cursores.
  oir(raiz, 'pointermove', (e) => {
    if (e.pointerType === 'touch') return
    modo = 'cursor'
    ;[objetivo.x, objetivo.y] = punto(e)
  })
  oir(raiz, 'pointerleave', (e) => e.pointerType !== 'touch' && jugable() && !pausado && pausar(true))
  oir(lienzo, 'pointermove', (e) => {
    if (e.pointerType !== 'touch' || !arrastre) return
    const dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y
    arrastre.x = e.clientX
    arrastre.y = e.clientY
    arrastre.movido += Math.abs(dx) + Math.abs(dy)
    if (!jugable()) return
    objetivo.x += dx / escala
    objetivo.y += dy / escala
  })
  // Un toque corto, sin arrastrar, adelanta el diálogo; soltar el dedo
  // mientras atacan pausa el juego.
  const soltar = (e) => {
    if (e.pointerType !== 'touch' || !arrastre) return
    if (arrastre.movido < 8 && performance.now() - arrastre.t < 350 && (estado === 'dialogo' || estado === 'final')) avanzar()
    arrastre = null
    if (estado === 'ataque' && !pausado) pausar(true)
  }
  oir(lienzo, 'pointerup', soltar)
  oir(lienzo, 'pointercancel', soltar)

  const FLECHAS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
  oir(window, 'keydown', (e) => {
    if (FLECHAS.includes(e.key) && jugable()) {
      teclas.add(e.key)
      e.preventDefault()
    }
    if ((e.key === 'Enter' || e.key === ' ') && !caja.hidden && document.activeElement !== caja) {
      avanzar()
      e.preventDefault()
    }
    if (e.key === 'Escape' && jugable()) pausar(!pausado)
  })
  oir(window, 'keyup', (e) => teclas.delete(e.key))

  oir(caja, 'click', avanzar)
  if (panel('reglas'))
    oir(panel('entendido'), 'click', () => {
      panel('reglas').hidden = true
      panel('portada').hidden = false
      panel('jugar').focus({ preventScroll: true })
    })
  oir(panel('jugar'), 'click', () => jugar())
  oir(panel('reintentar'), 'click', () => jugar(vistaActual, false))
  oir(panel('principio'), 'click', () => jugar())
  oir(panel('pausa'), 'click', () => jugable() && pausar(!pausado))
  oir(panel('seguir'), 'click', () => pausar(false))
  oir(document, 'visibilitychange', () => document.hidden && jugable() && pausar(true))
  const observador = new ResizeObserver(ajustar)
  observador.observe(raiz)
  parar.signal.addEventListener('abort', () => observador.disconnect(), { once: true })
}

// Todo como empieza un nivel: los cazas, las nubes, las balas, la cámara,
// quien juega y el diálogo.
function reiniciar() {
  w = h = 0
  for (const nombre of Object.keys(cazas)) delete cazas[nombre]
  for (const lista of [nubes, humos, brillos, rafagas, estelas, chispas]) lista.length = 0
  balas = []
  teclas.clear()
  Object.assign(camara, { t: 1, dur: 1, x: 0, alt: ALT, v: V, sacudida: 0, vaiven: { x: 0, v: 0 }, viento: { x: 0, v: 0 } })
  Object.assign(viento, { x: 0, y: 0 })
  Object.assign(jugador, { x: 0, y: 0, vx: 0, vy: 0, pv: PV_MAX, inmune: 0, golpe: 0 })
  Object.assign(objetivo, { x: 0, y: 0 })
  pintada = ''
  cola = []
  alTerminar = null
  frase = ''
  hablaba = undefined
  letras = espera = 0
  estado = 'portada'
  pausado = false
  vistaActual = tAtaque = tVista = reloj = rotuloHasta = 0
  memoria = {}
}

// Corre el nivel de `elemento` (su sección, con su `data-nivel`) y, al
// terminarlo o saltarlo, llama a `despues`.
export default function iniciar(elemento, despues) {
  reiniciar()
  parar = new AbortController()
  alSalir = despues
  raiz = elemento
  guion = NIVELES[raiz.dataset.nivel]
  VISTAS = guion.VISTAS
  lienzo = raiz.querySelector('.nivel-cielo')
  ctx = lienzo.getContext('2d')
  caja = panel('dialogo')
  retrato = raiz.querySelector('.nivel-retrato')
  quien = raiz.querySelector('.nivel-quien')
  texto = raiz.querySelector('.nivel-texto')
  dicho = raiz.querySelector('.nivel-dicho')
  falta = raiz.querySelector('.nivel-falta')
  leido = raiz.querySelector('.nivel-leido')
  figura = raiz.querySelector('.nivel-jugador')
  pincel = figura.getContext('2d')

  // Se van las bandas con que llega de las escenas; «Saltar nivel» las trae de vuelta.
  raiz.getBoundingClientRect()
  raiz.classList.add('sin-bandas')
  oir(raiz, 'click', (e) => {
    if (!e.target.closest('a.nivel-saltar')) return
    e.preventDefault()
    salir()
  })

  ajustar()
  camara.desde = camara.hacia = poseDe(VISTAS[0])
  moverCamara(0)
  for (let i = 0; i < 34; i++) nubes.push(nuevaNube(true))
  // En la portada vuelan los de la primera vista, desde la izquierda.
  for (const [nombre, datos] of Object.entries(guion.CAZAS)) cazas[nombre] = nuevoCaza(datos)
  for (const nombre of VISTAS[0].cazas ?? Object.keys(cazas)) {
    saltar(cazas[nombre], -w * 0.2, h * 0.24, 120)
    cazas[nombre].presente = true
  }
  escuchar()
  // Antes de jugar, las reglas, si el nivel las trae, y quién es cada piloto.
  const reglas = panel('reglas')
  if (reglas) reglas.hidden = false
  panel('portada').hidden = Boolean(reglas)
  panel(reglas ? 'entendido' : 'jugar').focus({ preventScroll: true })

  // El primer cuadro va antes de que se vea la sección: nunca queda en negro.
  dibujar()
  let ultimo = performance.now()
  const bucle = (ahora) => {
    if (parar.signal.aborted) return
    const dt = Math.min(0.05, (ahora - ultimo) / 1000)
    ultimo = ahora
    if (!pausado) actualizar(dt)
    dibujar()
    requestAnimationFrame(bucle)
  }
  requestAnimationFrame(bucle)
}
