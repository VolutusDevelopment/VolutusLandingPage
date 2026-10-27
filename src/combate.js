/**
 * El combate de Operación Venganza (paginas/OperacionVenganza.jsx, `Nivel`):
 * el guion del nivel que diga `data-nivel` (lib/nivel1.js) contra quien
 * juega, que es el cursor o, con el dedo, una huella. Al terminar, la página
 * sigue a `data-sigue`, las escenas que vienen.
 *
 * El cielo es un mundo en 3D pintado pixel a pixel en un lienzo chico que el
 * CSS agranda sin suavizar: las franjas del atardecer, el sol medio hundido,
 * el mar con sus olas y las nubes, y la cámara vuela hacia +x a `V` m/s. El
 * caza es el de las escenas, desde su hoja (lib/cazas.js): se elige el cuadro
 * según desde dónde se lo ve y se gira según hacia dónde se ladea. Las balas
 * y quien juega viven en el plano de la pantalla, como en un combate por
 * turnos: cada vista del guion mueve la cámara y cambia los patrones, y entre
 * una y otra se habla. El texto avanza solo, al ritmo de lo que tarda leerlo.
 *
 * Quien juega va justo donde está el ratón, o se arrastra 1:1 con el dedo
 * desde cualquier parte, o con las flechas; solo las ráfagas lo corren.
 */

import * as nivel1 from './lib/nivel1.js'
import { ALTURAS, GIROS, LADO, LLENADO, RADIO, rutaDeCaza } from './lib/cazas.js'
import { quieto } from './lib/movimiento.js'

const NIVELES = { 1: nivel1 }

const V = 150 // m/s, la velocidad de la cámara
const ALT = 300 // m sobre el mar, como duky en la escena 11
const TAN = 0.62 // medio campo de visión, en el lado corto de la pantalla
const PIXELES_POR_METRO = (LADO * LLENADO) / (2 * RADIO) // en la hoja del caza
const PV_MAX = 100
const DANO = 5
const RAD = Math.PI / 180
const leer = (texto) => Math.max(1.1, 0.5 + texto.length * 0.04)

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

let raiz, lienzo, ctx, guion, VISTAS, hoja
let w = 0, h = 0, escala = 2, k = 1, imagen, pix

function ajustar() {
  const antes = [w, h]
  escala = Math.max(2, Math.ceil(Math.sqrt((raiz.clientWidth * raiz.clientHeight) / 62000)))
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
  vaiven: { x: 0, v: 0 }, // el giro que trae cada vista
  viento: { x: 0, v: 0 }, // lo que la inclinan las ráfagas
  sacudida: 0,
}

function camaraHacia(vista, dur = 2.6) {
  camara.desde = angulos()
  camara.hacia = enRadianes(vista.camara)
  camara.t = 0
  camara.dur = dur
}

function angulos() {
  const q = suave(Math.min(1, camara.t / camara.dur))
  const { desde: a, hacia: b } = camara
  const dy = Math.atan2(Math.sin(b.yaw - a.yaw), Math.cos(b.yaw - a.yaw))
  return { yaw: a.yaw + dy * q, pitch: lerp(a.pitch, b.pitch, q), roll: lerp(a.roll, b.roll, q) }
}

// La estable, para poner el caza; la que se ve suma la turbulencia y el viento.
let estable, vista
function moverCamara(dt) {
  camara.t += dt
  camara.x += V * dt
  const actual = VISTAS[vistaActual]
  resorte(camara.vaiven, actual.vaiven ? actual.vaiven(reloj) : 0, 1.2, dt)
  resorte(camara.viento, quieto() ? 0 : -viento.x * 0.14, 3, dt)
  camara.sacudida = Math.max(0, camara.sacudida - dt * 3)
  const a = angulos()
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
  const v = res(p, [camara.x, ALT, 0])
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
      const t = ALT / -dy
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
  const desdeAbajo = Math.abs(n.p[1] - ALT) / largo(res(n.p, [camara.x, ALT, 0]))
  const ry = Math.min(rx * 0.9, rx * 0.3 * (1 + desdeAbajo * 2))
  // Las nubes van planas en el mundo: en la pantalla se inclinan con la cámara.
  const llano = uni([vista.R[0], 0, vista.R[2]])
  const ang = Math.atan2(-pto(llano, vista.U), pto(llano, vista.R))
  const s = Math.sin(ang), c = Math.cos(ang)
  if (rx > 5) elipse(x, y, rx + 0.8, ry + 0.8, ang, '#9aa7dc')
  elipse(x, y, rx, ry, ang, '#c3cbf2')
  elipse(x + s * ry * 0.22, y - c * ry * 0.22, rx * 0.92, ry * 0.78, ang, '#f5f7ff')
}

// ── El caza ───────────────────────────────────────────────────────────────
// Se mueve en la pantalla (x, y) y en profundidad (a, en metros) con
// resortes; su orientación sale de cómo se mueve por el mundo, y se ladea
// hacia donde gira, como un avión de verdad.
const caza = {
  x: { x: 0, v: 0 },
  y: { x: 0, v: 0 },
  a: { x: 140, v: 0 },
  meta: [0, 0, 140],
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
  fogonazo: 0,
  visible: false,
}

function cazaA(x, y, a, firmeza = caza.firmeza) {
  caza.meta = [x, y, a]
  caza.firmeza = firmeza
}

// Aparece ahí de golpe (fuera de la pantalla), ya volando a `vx` px/s.
function cazaSalta(x, y, a, vx = 0) {
  caza.x = { x, v: vx }
  caza.y = { x: y, v: 0 }
  caza.a = { x: a, v: 0 }
  caza.meta = [x, y, a]
  caza.P = null
}

// El caza en un punto del mundo, a `d` metros de la cámara (x adelante, y arriba).
function cazaEnMundo(d, firmeza) {
  const a = Math.max(5, pto(d, estable.F))
  cazaA(w / 2 + (pto(d, estable.R) / a) * k, h / 2 - (pto(d, estable.U) / a) * k, a, firmeza)
}

// Pasadas de lado a lado, una hacia cada lado: vira fuera de la pantalla.
// `desde` corre la primera para que salga de donde quedó tras el diálogo.
function pasada(t, periodo, desde, s, y, a) {
  const tt = t + desde * periodo
  const n = Math.floor(tt / periodo), u = (tt % periodo) / periodo
  const lado = n % 2 ? -1 : 1
  const x = w / 2 + lado * w * (1.24 * u - 0.62)
  if (s.pasada != null && s.pasada !== n) cazaSalta(x, y, a, (lado * w * 1.24) / periodo)
  s.pasada = n
  cazaA(x, y, a, 5)
  return n
}

function moverCaza(dt) {
  const [mx, my, ma] = caza.meta
  resorte(caza.x, mx, caza.firmeza, dt)
  resorte(caza.y, my, caza.firmeza, dt)
  resorte(caza.a, ma, caza.firmeza, dt)
  const a = caza.a.x
  const b = ((caza.x.x - w / 2) * a) / k
  const c = ((h / 2 - caza.y.x) * a) / k
  const P = sum([camara.x, ALT, 0], sum(esc(estable.F, a), sum(esc(estable.R, b), esc(estable.U, c))))
  if (caza.P && dt > 0) {
    // Mira hacia donde se mueve en la pantalla, más la parte de la velocidad
    // de la cámara que conserva su vista, y un poco hacia el fondo, para
    // virar alejándose y no pasar de nariz por el suelo.
    const { avance = 0.35, fondo = 45 } = VISTAS[vistaActual]
    const lejos = uni([estable.F[0], 0, estable.F[2]])
    const vel = sum(res(esc(res(P, caza.P), 1 / dt), [V * (1 - avance), 0, 0]), esc(lejos, fondo))
    const q = 1 - Math.exp(-dt * 4)
    const acel = esc(res(vel, caza.vel), 1 / dt)
    caza.acel = sum(caza.acel, esc(res(acel, caza.acel), 1 - Math.exp(-dt * 4)))
    if (caza.girar) caza.vel = vel
    caza.vel = sum(caza.vel, esc(res(vel, caza.vel), q))
    if (largo(caza.vel) > 8) caza.Fw = uni(sum(caza.Fw, esc(res(uni(caza.vel), caza.Fw), q)))
    // Se ladea hacia donde gira, hasta 40°.
    const lateral = res(caza.acel, esc(caza.Fw, pto(caza.acel, caza.Fw)))
    const ladeo = esc(lateral, Math.min(0.035, (9.8 * 0.84) / (largo(lateral) || 1)))
    const sustentacion = sum([0, 9.8, 0], ladeo)
    const arriba = res(sustentacion, esc(caza.Fw, pto(sustentacion, caza.Fw)))
    if (largo(arriba) > 0.5) caza.Uw = uni(sum(caza.Uw, esc(res(uni(arriba), caza.Uw), q)))
    caza.Uw = uni(res(caza.Uw, esc(caza.Fw, pto(caza.Uw, caza.Fw))))
  }
  // Tras aparecer de golpe, mira de una vez hacia donde vuela.
  if (caza.P === null) caza.girar = true
  else if (caza.girar) {
    caza.Fw = uni(caza.vel)
    caza.girar = false
  }
  caza.P = P
  const sp = proyectar(P)
  caza.visible = Boolean(sp)
  if (sp) {
    caza.svx = (sp[0] - caza.sx) / (dt || 1)
    caza.sx = sp[0]
    caza.sy = sp[1]
  }
  caza.fogonazo = Math.max(0, caza.fogonazo - dt)
}

const enPantalla = (m = 0) => caza.visible && caza.sx > m && caza.sx < w - m && caza.sy > m && caza.sy < h - m

// El cuadro de la hoja según desde dónde se lo ve, girado según su ladeo.
function pintarCaza([sx, sy, a]) {
  if (!hoja.complete || !hoja.naturalWidth) return
  const v = uni(res([camara.x, ALT, 0], caza.P))
  const Rw = cruz(caza.Fw, caza.Uw)
  const giro = Math.atan2(pto(v, Rw), pto(v, caza.Fw)) / RAD
  const altura = Math.asin(limitar(pto(v, caza.Uw), -1, 1)) / RAD
  const paso = 360 / GIROS
  const col = ((Math.round(giro / paso) % GIROS) + GIROS) % GIROS
  const fila = limitar(Math.round((altura - ALTURAS[0]) / (ALTURAS[1] - ALTURAS[0])), 0, ALTURAS.length - 1)
  let derecha = cruz(esc(v, -1), caza.Uw)
  if (largo(derecha) < 0.05) derecha = Rw
  const rho = Math.atan2(-pto(derecha, vista.U), pto(derecha, vista.R))
  const s = k / a / PIXELES_POR_METRO
  const x = Math.round(sx), y = Math.round(sy)
  ctx.setTransform(Math.cos(rho) * s, Math.sin(rho) * s, -Math.sin(rho) * s, Math.cos(rho) * s, x, y)
  ctx.drawImage(hoja, col * LADO, fila * LADO, LADO, LADO, -LADO / 2, -LADO / 2, LADO, LADO)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  if (caza.fogonazo <= 0) return
  ctx.fillStyle = '#fff1a8'
  ctx.fillRect(x - 1, y - 1, 3, 3)
  ctx.fillStyle = '#ffb347'
  ctx.fillRect(x - 2, y, 5, 1)
  ctx.fillRect(x, y - 2, 1, 5)
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
// Le pega lo que toque la cabeza de la flecha o el centro de la huella.
const FLECHA = ['X', 'XX', 'XWX', 'XWWX', 'XWWWX', 'XWWWWX', 'XWWWWWX', 'XWWWWWWX', 'XWWWXXXX', 'XWXWWX', 'XX XWWX', 'X   XWWX', '     XX']
const HUELLA = ['  XXXXX  ', ' XWWWWWX ', 'XWWXXXWWX', 'XWXWWWXWX', 'XWXWXWXWX', 'XWXWXWXWX', 'XWXWXWXWX', 'XWWWXWWWX', ' XWWWWWX ', '  XXXXX  ']
const FORMAS = {
  cursor: { mapa: FLECHA, ox: 0, oy: 0, hx: 2, hy: 4, r: 2 },
  huella: { mapa: HUELLA, ox: 4, oy: 5, hx: 0, hy: 0, r: 3 },
}

let modo = matchMedia('(hover: hover) and (pointer: fine)').matches ? 'cursor' : 'huella'
const jugador = { x: 0, y: 0, pv: PV_MAX, inmune: 0, golpe: 0 }
const objetivo = { x: 0, y: 0 }
const teclas = new Set()

function moverJugador(dt) {
  const rapidez = 130
  if (teclas.has('ArrowLeft')) objetivo.x -= rapidez * dt
  if (teclas.has('ArrowRight')) objetivo.x += rapidez * dt
  if (teclas.has('ArrowUp')) objetivo.y -= rapidez * dt
  if (teclas.has('ArrowDown')) objetivo.y += rapidez * dt
  objetivo.x = limitar(objetivo.x, 3, w - 3)
  objetivo.y = limitar(objetivo.y, 3, h - 3)
  // Va justo donde está la mano; solo la ráfaga lo corre, y hay que compensar.
  jugador.x = limitar(objetivo.x + viento.x * 18, 2, w - 2)
  jugador.y = limitar(objetivo.y + viento.y * 18, 2, h - 2)
  jugador.inmune = Math.max(0, jugador.inmune - dt)
  jugador.golpe = Math.max(0, jugador.golpe - dt)
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
        pincel.fillStyle = fila[x] === 'X' ? '#0a1a2a' : blanco
        pincel.fillRect(x, y, 1, 1)
      }
    })
  }
  figura.style.width = `${figura.width * escala}px`
  figura.style.translate = `${(Math.round(jugador.x) - f.ox) * escala}px ${(Math.round(jugador.y) - f.oy) * escala}px`
}

// La mira del caza: corchetes rojos sobre quien juega, como en las escenas.
function pintarMira() {
  const f = FORMAS[modo]
  const cx = Math.round(jugador.x - f.ox + (modo === 'cursor' ? 4 : f.mapa[0].length / 2))
  const cy = Math.round(jugador.y - f.oy + f.mapa.length / 2)
  corchetes(cx, cy, 10 + Math.sin(reloj * 5) * 1.5, '#ff4a36')
}

function corchetes(cx, cy, r, color) {
  r = Math.round(r)
  ctx.fillStyle = color
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const x = cx + sx * r, y = cy + sy * r
    ctx.fillRect(sx < 0 ? x : x - 2, y, 3, 1)
    ctx.fillRect(x, sy < 0 ? y : y - 2, 1, 3)
  }
}

// ── Las balas ─────────────────────────────────────────────────────────────
// Planas: cruzan la pantalla y el viento las curva. Hondas (con `tx`): vienen
// desde el fondo a un punto marcado y solo pegan al llegar.
let balas = []
const chispas = []

function disparo(x, y, vx, vy, extra = {}) {
  balas.push({ x, y, vx, vy, ay: 0, ...extra })
}

// `n` balas desde el caza, abiertas `abre` radianes alrededor de `centro`
// (hacia quien juega, si no lo dice), a `rapidez` px/s.
function abanico(n, abre, rapidez, centro = Math.atan2(jugador.y - caza.sy, jugador.x - caza.sx)) {
  for (let i = 0; i < n; i++) {
    const ang = centro + (n > 1 ? (i / (n - 1) - 0.5) * abre : 0)
    disparo(caza.sx, caza.sy, Math.cos(ang) * rapidez, Math.sin(ang) * rapidez)
  }
  caza.fogonazo = 0.07
}

function hondo(tx, ty, T = 1.2) {
  balas.push({ x0: caza.sx, y0: caza.sy, tx: limitar(tx, 4, w - 4), ty: limitar(ty, 4, h - 4), t: 0, T, x: caza.sx, y: caza.sy })
  caza.fogonazo = 0.07
}

function moverBalas(dt) {
  const f = FORMAS[modo]
  const px = jugador.x + f.hx, py = jugador.y + f.hy
  for (let i = balas.length - 1; i >= 0; i--) {
    const b = balas[i]
    if (b.tx != null) {
      b.t += dt
      const q = Math.min(1, b.t / b.T)
      b.z = 7 - 6 * q
      const avance = (1 / b.z - 1 / 7) / (1 - 1 / 7)
      b.x = lerp(b.x0, b.tx, avance)
      b.y = lerp(b.y0, b.ty, avance)
      if (q < 1) continue
      if (Math.hypot(b.tx - px, b.ty - py) < f.r + 3) herir()
      chispas.push({ x: b.tx, y: b.ty, t: 0.18 })
      balas.splice(i, 1)
      continue
    }
    b.vx += viento.x * 46 * dt
    b.vy += (b.ay + viento.y * 46) * dt
    b.x += b.vx * dt
    b.y += b.vy * dt
    if (b.x < -24 || b.x > w + 24 || b.y < -24 || b.y > h + 24) balas.splice(i, 1)
    else if (Math.hypot(b.x - px, b.y - py) < f.r + 1) {
      herir()
      balas.splice(i, 1)
    }
  }
  for (let i = chispas.length - 1; i >= 0; i--) if ((chispas[i].t -= dt) <= 0) chispas.splice(i, 1)
}

function pintarBalas() {
  for (const b of balas) {
    const x = Math.round(b.x), y = Math.round(b.y)
    if (b.tx != null) {
      const q = b.t / b.T
      corchetes(Math.round(b.tx), Math.round(b.ty), 3 + 9 * (1 - q), q > 0.75 && Math.floor(reloj * 16) % 2 ? '#ffffff' : '#ff4a36')
      const r = Math.max(1, Math.round(3.4 / b.z))
      ctx.fillStyle = '#e8402a'
      ctx.fillRect(x - r, y - r + 1, r * 2 + 1, r * 2 - 1)
      ctx.fillRect(x - r + 1, y - r, r * 2 - 1, r * 2 + 1)
      ctx.fillStyle = '#fff3c4'
      ctx.fillRect(x - r + 1, y - r + 1, r * 2 - 1, r * 2 - 1)
      continue
    }
    const rapidez = Math.hypot(b.vx, b.vy) || 1
    ctx.fillStyle = '#c23a2a'
    ctx.fillRect(Math.round(b.x - (b.vx / rapidez) * 3), Math.round(b.y - (b.vy / rapidez) * 3), 1, 1)
    ctx.fillStyle = '#e8402a'
    ctx.fillRect(x - 1, y, 3, 1)
    ctx.fillRect(x, y - 1, 1, 3)
    ctx.fillStyle = '#fff3c4'
    ctx.fillRect(x, y, 1, 1)
  }
  ctx.fillStyle = '#fff1a8'
  for (const c of chispas) {
    const r = Math.round((0.18 - c.t) * 30), x = Math.round(c.x), y = Math.round(c.y)
    ctx.fillRect(x - r, y, 1, 1)
    ctx.fillRect(x + r, y, 1, 1)
    ctx.fillRect(x, y - r, 1, 1)
    ctx.fillRect(x, y + r, 1, 1)
  }
}

function herir() {
  if (jugador.inmune > 0 || estado !== 'ataque') return
  jugador.pv = Math.max(0, jugador.pv - DANO)
  jugador.inmune = 1.1
  jugador.golpe = 0.25
  camara.sacudida = 1
  pintarPV()
  if (jugador.pv === 0) perder()
}

// ── Lo que el combate le presta al guion ──────────────────────────────────
// Cada `t` desde el primero, `periodo` s: cierto una vez por periodo.
function cada(s, clave, periodo, t) {
  s[clave] ??= t
  if (t < s[clave]) return false
  s[clave] += periodo
  return true
}

// Cierto cuando `valor`, que sube, vuelve a empezar.
function cruza(s, clave, valor) {
  const antes = s[clave]
  s[clave] = valor
  return antes != null && valor < antes
}

const prestar = {
  get w() {
    return w
  },
  get h() {
    return h
  },
  jugador,
  caza,
  cazaA,
  cazaSalta,
  cazaEnMundo,
  pasada,
  enPantalla,
  disparo,
  abanico,
  hondo,
  soplar,
  cada,
  cruza,
}

// ── El diálogo ────────────────────────────────────────────────────────────
// Letra a letra en una caja de alto fijo; cada línea queda lo que tarda
// leerla y pasa sola. Un clic, un toque o Enter la adelantan.
let caja, quien, texto, dicho, falta, leido
let cola = [], alTerminar = null, linea = '', letras = 0, espera = 0

function decir(lineas, despues) {
  cola = [...lineas]
  alTerminar = despues
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
  quien.textContent = l.quien ?? ''
  texto.classList.toggle('acotacion', !l.quien)
  linea = typeof l.texto === 'string' ? l.texto : l.texto[modo]
  letras = quieto() ? linea.length : 0
  espera = leer(linea)
  leido.textContent = `${l.quien ? `${l.quien}: ` : ''}${linea}`
  escribir()
}

function escribir() {
  const n = Math.floor(letras)
  dicho.textContent = linea.slice(0, n)
  falta.textContent = linea.slice(n)
}

function avanzar() {
  if (caja.hidden) return
  if (letras < linea.length) {
    letras = linea.length
    escribir()
  } else siguiente()
}

// ── El juego ──────────────────────────────────────────────────────────────
let estado = 'portada' // portada · dialogo · ataque · final · derrota
let pausado = false
let vistaActual = 0, tAtaque = 0, memoria = {}, reloj = 0, rotuloHasta = 0
const panel = (nombre) => raiz.querySelector(`.nivel-${nombre}`)

function empezarVista(i, conDialogo = true) {
  vistaActual = i
  tAtaque = 0
  memoria = {}
  balas = []
  camaraHacia(VISTAS[i])
  VISTAS[i].presenta(prestar)
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

// El caza se va y, tras sus líneas, siguen las escenas.
function ganar() {
  estado = 'final'
  cazaA(w * 1.5, -h * 0.4, 420, 1.6)
  decir(guion.FINAL, () => location.assign(raiz.dataset.sigue))
}

function pintarPV() {
  raiz.querySelector('.nivel-pv-lleno').style.width = `${(jugador.pv / PV_MAX) * 100}%`
  raiz.querySelector('.nivel-pv-numero').textContent = `${jugador.pv} / ${PV_MAX}`
}

function rotular(texto) {
  panel('rotulo').textContent = texto
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
  moverViento(dt)
  moverCamara(dt)
  const v = VISTAS[vistaActual]
  if (estado === 'ataque') {
    tAtaque += dt
    v.mover(tAtaque, memoria, prestar)
    if (tAtaque < v.dur) v.disparar(tAtaque, memoria, prestar)
    else if (!balas.length || tAtaque > v.dur + 2.5) {
      if (vistaActual + 1 < VISTAS.length) empezarVista(vistaActual + 1)
      else ganar()
    }
  } else if (estado === 'portada') v.mover(reloj, memoria, prestar)
  moverCaza(dt)
  moverNubes(dt)
  if (estado !== 'portada') moverJugador(dt)
  moverBalas(dt)
  if (!caja.hidden) {
    if (letras < linea.length) {
      letras += dt * 42
      escribir()
    } else if ((espera -= dt) <= 0) siguiente()
  }
  if (rotuloHasta && reloj > rotuloHasta) {
    panel('rotulo').classList.remove('visible')
    rotuloHasta = 0
  }
}

// Nubes y caza de lejos a cerca; encima, las balas y quien juega.
function dibujar() {
  pintarCielo()
  const cosas = []
  for (const n of nubes) {
    const sp = proyectar(n.p)
    if (sp) cosas.push([sp[2], () => pintarNube(n, sp)])
  }
  const sc = caza.P && proyectar(caza.P)
  if (sc) cosas.push([sc[2], () => pintarCaza(sc)])
  cosas.sort((a, b) => b[0] - a[0]).forEach(([, pintar]) => pintar())
  pintarEstelas()
  pintarBalas()
  if (estado === 'ataque' && !pausado) pintarMira()
  pintarJugador(jugable() && !pausado)
}

// ── Las manos ─────────────────────────────────────────────────────────────
function escuchar() {
  let arrastre = null
  const punto = (e) => {
    const caja = lienzo.getBoundingClientRect()
    return [(e.clientX - caja.left) / escala, (e.clientY - caja.top) / escala]
  }
  lienzo.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') {
      modo = 'huella'
      arrastre = { x: e.clientX, y: e.clientY, t: performance.now(), movido: 0 }
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
  raiz.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return
    modo = 'cursor'
    ;[objetivo.x, objetivo.y] = punto(e)
  })
  raiz.addEventListener('pointerleave', (e) => e.pointerType !== 'touch' && jugable() && !pausado && pausar(true))
  lienzo.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'touch' || !arrastre) return
    const dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y
    arrastre.x = e.clientX
    arrastre.y = e.clientY
    arrastre.movido += Math.abs(dx) + Math.abs(dy)
    if (!jugable()) return
    objetivo.x += dx / escala
    objetivo.y += dy / escala
  })
  // Un toque corto, sin arrastrar, adelanta el diálogo.
  lienzo.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'touch' || !arrastre) return
    if (arrastre.movido < 8 && performance.now() - arrastre.t < 350 && (estado === 'dialogo' || estado === 'final')) avanzar()
    arrastre = null
  })
  lienzo.addEventListener('pointercancel', () => (arrastre = null))

  const FLECHAS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
  addEventListener('keydown', (e) => {
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
  addEventListener('keyup', (e) => teclas.delete(e.key))

  caja.addEventListener('click', avanzar)
  panel('jugar').addEventListener('click', () => jugar())
  panel('reintentar').addEventListener('click', () => jugar(vistaActual, false))
  panel('principio').addEventListener('click', () => jugar())
  panel('pausa').addEventListener('click', () => jugable() && pausar(!pausado))
  panel('seguir').addEventListener('click', () => pausar(false))
  document.addEventListener('visibilitychange', () => document.hidden && jugable() && pausar(true))
  new ResizeObserver(ajustar).observe(raiz)
}

export default function iniciar(elemento) {
  raiz = elemento
  guion = NIVELES[raiz.dataset.nivel]
  VISTAS = guion.VISTAS
  lienzo = raiz.querySelector('.nivel-cielo')
  ctx = lienzo.getContext('2d')
  caja = panel('dialogo')
  quien = raiz.querySelector('.nivel-quien')
  texto = raiz.querySelector('.nivel-texto')
  dicho = raiz.querySelector('.nivel-dicho')
  falta = raiz.querySelector('.nivel-falta')
  leido = raiz.querySelector('.nivel-leido')
  figura = raiz.querySelector('.nivel-jugador')
  pincel = figura.getContext('2d')
  hoja = Object.assign(new Image(), { src: rutaDeCaza(guion.CAZA) })

  ajustar()
  camara.desde = camara.hacia = enRadianes(VISTAS[0].camara)
  moverCamara(0)
  for (let i = 0; i < 34; i++) nubes.push(nuevaNube(true))
  cazaSalta(-w * 0.2, h * 0.24, 120)
  escuchar()

  let ultimo = performance.now()
  const bucle = (ahora) => {
    const dt = Math.min(0.05, (ahora - ultimo) / 1000)
    ultimo = ahora
    if (!pausado) actualizar(dt)
    dibujar()
    requestAnimationFrame(bucle)
  }
  requestAnimationFrame(bucle)
}
