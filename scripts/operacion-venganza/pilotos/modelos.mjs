// Los cuatro pilotos y sus cazas en 3D. Los cazas van en metros, con las
// medidas reales: el morro hacia +x, arriba +y y el ala derecha hacia +z.
// Los patos miran también hacia +x.

import { el, placa, tubo, transformar } from './tres.mjs'

export const RAMPAS = {
  verde: ['#6fe08a', '#22a04a', '#14703c', '#0b4026'],
  blanco: ['#ffffff', '#eef0f6', '#c6cbe0', '#8d93b2'],
  oliva: ['#b4c070', '#76853c', '#535f29', '#313818'],
  azul: ['#6a8ae4', '#2c4cb0', '#1c337c', '#101c48'],
  pico: ['#ffe48e', '#f6b23a', '#c9801a', '#7a4a0c'],
  pardo: ['#b49a80', '#82684f', '#5a4532', '#33271a'],
  negro: ['#6c7078', '#3a3d45', '#25272d', '#131418'],
  puro: ['#a87048', '#6e4426', '#4a2c16', '#26160a'],
  humo: ['#ffffff', '#d6dae0', '#a4aab4', '#6e7480'],
  oro: ['#fff2a4', '#f2c440', '#c08a18', '#7a520a'],
  rosa: ['#ffc8de', '#f47aa8', '#c84a7c', '#82284e'],
  hule: ['#fff8b0', '#ffd62a', '#e2a400', '#9a6a00'],
  picoHule: ['#ff9a6a', '#f0502a', '#b8341a', '#6a1a0a'],
  naranja: ['#ffb474', '#ff7a1a', '#cc5200', '#7a2e00'],
  asiento: ['#8a92a0', '#5a616c', '#3d434c', '#22262c'],
  gris: ['#dde3ea', '#a6b1bc', '#76828e', '#48525c'],
  perla: ['#ffffff', '#eef1f6', '#c4cad8', '#868ea6'],
  oscuro: ['#5a626c', '#30353c', '#1e2228', '#0e1014'],
  vidrio: ['#e0f6ff', '#82cdf0', '#3c8abc', '#1c4a6c'],
  nube: ['#ffffff', '#f3f6fc', '#cfd8ec', '#a2b2d2'],
  grisEX: ['#d6dce3', '#a9b3bd', '#7e8994', '#4f5861'],
  grisOscuro: ['#9aa4ae', '#6e7882', '#4f5862', '#30373e'],
  boca: ['#ff8a7a', '#d8382c', '#9a2018', '#5a0c08'],
  verdinegro: ['#4c6a5c', '#26362f', '#18221e', '#0c1210'],
  cuero: ['#6a5448', '#3e302a', '#2a201c', '#161010'],
  corona: ['#6a9a7a', '#2e5a52', '#24384a', '#141c2a'],
  crema: ['#fffaf0', '#f4e6cc', '#d4bc98', '#9a8060'],
  bermellon: ['#ff9a8a', '#e0302a', '#a81c18', '#5a0c0a'],
  vidrioOro: ['#fff2c0', '#d8b860', '#9a7a30', '#5a4418'],
  rayas: ['#fff4a0', '#f8cc1c', '#d29a00', '#8a5e00'],
}
const C = RAMPAS

// Estrella de cinco puntas en un plano (u, v): ¿cae dentro?
const enEstrella = (u, v, radio) => {
  const r = Math.hypot(u, v)
  if (r > radio) return false
  const a = Math.atan2(v, u) + Math.PI / 2
  const sector = ((a % ((2 * Math.PI) / 5)) + (2 * Math.PI) / 5) % ((2 * Math.PI) / 5)
  const k = Math.abs(sector - Math.PI / 5) / (Math.PI / 5)
  return r < radio * (0.42 + 0.58 * k ** 2.2)
}

const ambos = (hacer) => [hacer(1), hacer(-1)]

// ── Pilotos ──────────────────────────────────────────────────────────────

// Un hueso: elipsoide estirado de a hasta b (brazos, puros, mangos).
const hueso = (a, b, grosor, rampa, o = {}) => {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const largo = Math.hypot(...d)
  const n = d.map((v) => v / largo)
  const giroZ = (Math.asin(n[1]) * 180) / Math.PI
  const giroY = (Math.atan2(-n[2], n[0]) * 180) / Math.PI
  return el([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], [largo / 2 + grosor * 0.3, grosor, grosor], rampa, { rot: [0, giroY, giroZ], ...o })
}

// Disco delgado mirando hacia `n` (el espejo de Duke).
const disco = (c, n, radio, grueso, rampa, o = {}) => hueso(c.map((v, i) => v - n[i] * grueso), c.map((v, i) => v + n[i] * grueso), radio, rampa, o)

// Gira un grupo (la cabeza) en torno al cuello, también su pintura.
const cabecear = (formas, grados, [px, py] = [0.1, 0.1]) => {
  const a = (grados * Math.PI) / 180
  const ida = ([x, y, z], s) => [px + (x - px) * Math.cos(s * a) - (y - py) * Math.sin(s * a), py + (x - px) * Math.sin(s * a) + (y - py) * Math.cos(s * a), z]
  return formas.map((f) => {
    const g = { ...f, c: ida(f.c, 1), M: [[Math.cos(a), -Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0], [0, 0, 1]].map((fila) => [0, 1, 2].map((j) => fila[0] * f.M[0][j] + fila[1] * f.M[1][j] + fila[2] * f.M[2][j])) }
    if (f.pinta) g.pinta = (p, n) => f.pinta(ida(p, -1), n)
    return g
  })
}

const guante = (muneca, dedo) => [el(muneca, [0.15, 0.13, 0.13], C.blanco), ...(dedo ? [hueso(muneca, dedo, 0.05, C.blanco)] : [])]

// Gafas de aviador clásicas: gota de marco dorado, cristal verde y un reflejo.
const LENTE_AVIADOR = ['#7a9a84', '#2e4436', '#1e2e24', '#0e1812']
const aviador = (s) => {
  const n = [0.75, 0.1, s * 0.65]
  const brillo = ([, y, z]) => (Math.abs(y - 0.7 + (Math.abs(z) - 0.44) * 0.9) < 0.03 ? '#dfeee4' : null)
  const gota = (c, r) => [disco(c, n, r + 0.035, 0.012, C.oro), disco(c.map((v, i) => v + n[i] * 0.03), n, r, 0.01, LENTE_AVIADOR, { pinta: brillo })]
  return [
    ...gota([0.86, 0.66, s * 0.44], 0.21),
    ...gota([0.9, 0.55, s * 0.38], 0.15),
    hueso([0.7, 0.72, s * 0.6], [0.0, 0.74, s * 0.69], 0.022, C.oro),
  ]
}

// duck-one: el mentón arriba, gafas de aviador y una ceja alzada por sobre
// el marco. Sin gorro se le ve el resorte que lo espera debajo (gorro.mjs).
// El torso y las gafas van aparte: en la escena 3 baja la cabeza y se
// acomoda las gafas.
export const DUCK_ONE_TORSO = [
  el([0, -0.85, 0], [0.9, 0.7, 1.1], C.oliva, {
    pinta: ([x, y, z]) => {
      if (x < 0.2) return null
      const medallas = [[-0.38, -0.6], [-0.48, -0.2], [-0.36, 0.2], [-0.45, 0.56], [-0.72, -0.4], [-0.7, 0.32]]
      for (const [my, mz] of medallas) {
        if (Math.hypot(y - my, z - mz) < 0.1) return C.oro
        if (Math.abs(z - mz) < 0.07 && y > my + 0.07 && y < my + 0.24) return Math.abs(z - mz) < 0.025 ? '#f2f2f2' : mz > 0 ? '#2c4cb0' : '#d83a2c'
      }
      return null
    },
  }),
  el([0.1, 0, 0], [0.5, 0.52, 0.52], C.verde),
  el([0.1, -0.15, 0], [0.56, 0.12, 0.58], C.blanco),
]
export const GAFAS_DUCK_ONE = cabecear(
  [...[1, -1].flatMap(aviador), hueso([1.0, 0.8, -0.28], [1.0, 0.8, 0.28], 0.025, C.oro), hueso([1.02, 0.72, -0.24], [1.02, 0.72, 0.24], 0.02, C.oro)],
  16,
)
export const DUCK_ONE_SIN_GORRO = [
  ...DUCK_ONE_TORSO,
  ...cabecear(
    [
      el([0.15, 0.6, 0], [0.72, 0.66, 0.66], C.verde),
      el([0.98, 0.45, 0], [0.62, 0.15, 0.34], C.pico, { rot: [0, 0, -8] }),
      el([0.9, 0.32, 0], [0.5, 0.09, 0.28], C.pico, { rot: [0, 0, -5] }),
      el([0.74, 0.98, -0.4], [0.07, 0.045, 0.18], C.oscuro, { flat: '#0b2414', rot: [-25, 0, 0] }),
      el([0.78, 0.92, 0.4], [0.07, 0.04, 0.17], C.oscuro, { flat: '#0b2414' }),
    ],
    16,
  ),
  ...GAFAS_DUCK_ONE,
]

// Su gorro cuartelero: dos mitades que suben en las puntas, el pliegue al
// medio, el vivo dorado del borde y la piocha al lado izquierdo. Más oscuro
// que el uniforme, para que se lea sobre la cabeza verde.
const OLIVA_OSCURO = ['#9aa45a', '#5c6a2c', '#3e481e', '#20260f']
const G = 1.25 // su tamaño, respecto del primer gorro
export const GORRO = [
  ...[1, -1].map((s) =>
    el([s * 0.15 * G, 0, 0], [0.25 * G, 0.14 * G, 0.18 * G], OLIVA_OSCURO, {
      rot: [0, 0, s * 12],
      pinta: ([, y, z]) => (y > 0.08 * G && Math.abs(z) < 0.03 * G ? OLIVA_OSCURO[3] : y > -0.06 * G && y < 0 ? C.oro : null),
    }),
  ),
  el([0.22 * G, 0.03 * G, -0.175 * G], [0.05 * G, 0.05 * G, 0.03 * G], C.oro),
]

// La cabeza va con el mentón 16° arriba, como la gira cabecear().
export const CABEZA = transformar([0, 0, 16], [0.1, 0.1, 0])
// Puesto en la coronilla, ladeado a la derecha; al crecer sube lo que engorda.
export const GORRO_PUESTO = { c: CABEZA.punto([0.12, 1.3 + 0.14 * (G - 1), 0.1]), rot: [12, 0, 16] }
export const ponerGorro = ({ c, rot }) => transformar(rot, [0, 0, 0], c).formas(GORRO)

export const DUCK_ONE = [...DUCK_ONE_SIN_GORRO, ...ponerGorro(GORRO_PUESTO)]

// Moby, el comando: el más grande del escuadrón y el más pesado. Espalda en
// V, trapecios que le tragan el cuello y la cabeza chica hundida entre los
// hombros. Musculosa oliva que le cubre el pecho entero, placas al cuello,
// pretina a rayas y un pañuelo rojo con dos colas largas. Fuma para parecer
// duro: el puro le hace toser y llorar a chorros.
const LAGRIMA = '#4aa8ec'
const CAMISETA = ['#8a9460', '#5a6438', '#3e4626', '#22280f']
const sum = (a, b) => a.map((v, i) => v + b[i])
const res = (a, b) => a.map((v, i) => v - b[i])
const esc = (a, k) => a.map((v) => v * k)

// Centro de la cabeza, más bajo que el de los otros: va hundida en los trapecios.
export const MOBY_H = [0.32, 0.28, 0]
const enCabeza = (d) => sum(MOBY_H, d)

// El torso: pecho y trapecios bajo la musculosa; los hombros, al aire.
export const MOBY_TORSO = [
  el([0, -1.3, 0], [0.78, 0.58, 0.98], CAMISETA),
  el([0.08, -0.62, 0], [0.82, 0.7, 1.25], CAMISETA),
  ...ambos((s) => el([-0.05, -0.05, s * 0.64], [0.5, 0.4, 0.56], CAMISETA, { rot: [s * -25, 0, 0] })),
  ...ambos((s) => el([0.68, -0.45, s * 0.46], [0.34, 0.32, 0.46], CAMISETA, { rot: [s * 10, 0, -10] })),
  ...ambos((s) => el([0.05, -0.4, s * 1.3], [0.48, 0.46, 0.44], C.pardo)),
  hueso([0.65, -0.17, -0.42], [1.0, -0.62, 0], 0.02, C.gris, { flat: '#c8ccd2' }),
  hueso([1.0, -0.62, 0], [0.65, -0.17, 0.42], 0.02, C.gris, { flat: '#c8ccd2' }),
  el([1.03, -0.74, 0.03], [0.03, 0.12, 0.08], C.gris),
  el([0, -1.66, 0], [0.8, 0.14, 1.0], C.blanco, { pinta: ([x, , z]) => (Math.floor(((Math.atan2(z, x) + Math.PI) / Math.PI) * 9) % 2 ? C.bermellon : null) }),
]

// Tres bocanadas que suben de la brasa y se deshacen; u da la vuelta en un bucle.
export const humareda = (brasa, u) =>
  [0, 1, 2].map((i) => {
    const k = (u + i / 3) % 1
    return el(sum(brasa, [-0.3 * k, 0.15 + 1.0 * k, -0.2 - 0.4 * k]), esc([0.2, 0.16, 0.18], 1 - 0.45 * k), C.humo)
  })

// Pañuelo con dos colas largas que flamean; t en cuadros, una vuelta cada 8.
const panuelo = (t) => {
  const ola = (i, s) => 0.14 * Math.sin((t / 8) * Math.PI * 4 + i * 1.3 + (s > 0 ? 0 : 1.6))
  const cola = (s) => {
    const pts = [enCabeza([-0.55, 0.42, s * 0.1])]
    for (let i = 1; i <= 4; i++) pts.push(sum(pts[i - 1], [-0.3, -0.1 + ola(i, s), s * 0.1]))
    return pts.slice(1).map((q, i) => hueso(pts[i], q, 0.075 - i * 0.008, C.boca))
  }
  return [el(enCabeza([-0.03, 0.42, 0]), [0.78, 0.13, 0.72], C.boca), el(enCabeza([-0.62, 0.42, 0]), [0.1, 0.1, 0.12], C.boca), ...cola(1), ...cola(-1)]
}

// La cabeza en un instante t (cuadros). `abre` baja el pico; `pena` da vuelta
// el ceño, de 0 (furia) a 1 (las cejas suben al centro); `llanto` va de un
// hilo por la mejilla a chorros en arco hacia los lados.
export const mobyCabeza = ({ t = 0, abre = 0, pena = 0, llanto = 0.4, puroEnPico = true } = {}) => {
  const [abajo] = transformar([0, 0, -34 * abre], enCabeza([0.4, -0.3, 0])).formas([el(enCabeza([0.83, -0.3, 0]), [0.5, 0.09, 0.34], C.pico)])
  const formas = [
    el(MOBY_H, [0.72, 0.64, 0.68], C.pardo, {
      pinta: (p) => {
        const [x, y, z] = res(p, MOBY_H)
        return llanto > 0.3 && x > 0.17 && y < 0.1 && y > -0.62 && Math.abs(Math.abs(z) - 0.48) < 0.08 ? LAGRIMA : null
      },
    }),
    el(enCabeza([0.95, -0.14, 0]), [0.62, 0.17, 0.4], C.pico, { rot: [0, 0, -6] }),
    abajo,
    ...(abre > 0.15 ? [el(enCabeza([0.8, -0.26 - 0.1 * abre, 0]), [0.36, 0.03 + 0.09 * abre, 0.27], C.boca)] : []),
    ...ambos((s) => el(enCabeza([0.69, 0.16, s * 0.44]), [0.09, 0.035, 0.13], C.oscuro, { flat: '#14161e', rot: [s * (15 - 35 * pena), 0, 0] })),
    ...ambos((s) => el(enCabeza([0.61, 0.3 + 0.05 * pena, s * 0.38]), [0.34, 0.085, 0.2], C.oscuro, { flat: '#14100c', rot: [s * (62 * pena - 30), 0, -8] })),
    ...panuelo(t),
  ]
  // Gotas en arco hacia afuera, una cada 0,4 cuadros; con más llanto llegan más lejos.
  for (const s of [1, -1])
    for (let j = 0; j < 6; j++) {
      const a = (t % 0.4) + j * 0.4
      if (a > 2.4 * llanto) continue
      formas.push(el(sum(enCabeza([0.72, 0.1, s * 0.55]), [0.2 * a, 0.32 * a - 0.16 * a * a, s * 0.5 * a]), [0.08, 0.1, 0.08], C.vidrio, { flat: LAGRIMA }))
    }
  if (puroEnPico) {
    const brasa = enCabeza([1.28, -0.6, -0.89])
    formas.push(hueso(enCabeza([0.83, -0.26, -0.3]), enCabeza([1.25, -0.58, -0.85]), 0.12, C.puro), hueso(enCabeza([0.89, -0.3, -0.38]), enCabeza([0.93, -0.33, -0.43]), 0.135, C.oro), el(brasa, [0.08, 0.08, 0.08], C.naranja, { flat: '#ff7a2a', brilla: true }), ...humareda(brasa, t / 8))
  }
  return formas
}

// El busto de las tomas: de brazos cruzados sobre la musculosa.
const brazoCruzado = (hombro, codo, puno) => [hueso(hombro, codo, 0.3, C.pardo), el(sum(hombro, esc(res(codo, hombro), 0.5)), [0.36, 0.32, 0.32], C.pardo), hueso(codo, puno, 0.28, C.pardo), el(puno, [0.25, 0.22, 0.22], C.pardo)]
export const MOBY = [
  ...MOBY_TORSO,
  ...mobyCabeza(),
  ...brazoCruzado([0.1, -0.5, -1.45], [0.85, -1.0, -1.25], [1.25, -0.7, 0.6]),
  ...brazoCruzado([0.1, -0.5, 1.45], [0.9, -1.05, 1.25], [1.28, -0.88, -0.6]),
]

// Duke: genuinamente bello y nada más. Plumaje marfil impecable, copete
// rubio, ojos azules con pestañas largas y uniforme blanco de gala.
const IRIS = '#2a72d8'
// El plumaje es marfil y el uniforme blanco frío, para que se distingan.
const MARFIL = ['#fffcf2', '#f6eedb', '#dccfae', '#a29272']
const dukeBase = (pose, extra) => [
  el([0, -0.85, 0], [0.9, 0.7, 1.05], C.blanco, {
    pinta: ([x, y, z]) => {
      if (x < 0.3) return null
      for (const by of [-0.38, -0.58, -0.78]) for (const bz of [-0.2, 0.2]) if (Math.hypot(y - by, z - bz) < 0.055) return C.oro
      return Math.abs(z) < 0.022 ? C.oro : null
    },
  }),
  ...ambos((s) => el([-0.02, -0.4, s * 0.86], [0.42, 0.11, 0.3], C.oro)),
  ...ambos((s) => [-0.24, -0.12, 0, 0.12, 0.24].map((dx) => hueso([dx, -0.44, s * 1.1], [dx, -0.66, s * 1.13], 0.025, C.oro))).flat(),
  hueso([0.1, -0.42, 0.9], [0.62, -0.62, 0.5], 0.03, C.oro),
  hueso([0.62, -0.62, 0.5], [0.72, -0.6, 0.1], 0.03, C.oro),
  el([0.1, 0, 0], [0.48, 0.5, 0.5], MARFIL),
  el([0.12, -0.2, 0], [0.56, 0.14, 0.58], C.blanco),
  el([0.12, -0.1, 0], [0.58, 0.035, 0.6], C.oro),
  ...cabecear(
    [
      el([0.15, 0.6, 0], [0.7, 0.64, 0.64], MARFIL),
      el([0.4, 1.12, 0], [0.55, 0.26, 0.42], C.oro, { rot: [0, 0, 28] }),
      el([-0.05, 1.1, 0], [0.6, 0.3, 0.52], C.oro, { rot: [0, 0, 8] }),
      el([-0.48, 0.88, 0], [0.42, 0.3, 0.46], C.oro, { rot: [0, 0, -22] }),
      el([0.95, 0.45, 0], [0.52, 0.12, 0.22], C.pico, { rot: [0, 0, -12] }),
      el([0.88, 0.35, 0], [0.42, 0.07, 0.18], C.pico, { rot: [0, 0, -10] }),
      ...pose.ojos,
    ],
    pose.menton,
  ),
  ...extra,
]

const ojosAbiertos = [
  ...ambos((s) => el([0.74, 0.63, s * 0.34], [0.11, 0.12, 0.12], C.blanco, { flat: '#ffffff' })),
  ...ambos((s) => el([0.81, 0.61, s * 0.36], [0.06, 0.085, 0.085], C.blanco, { flat: IRIS })),
  ...ambos((s) => el([0.85, 0.6, s * 0.37], [0.03, 0.04, 0.04], C.blanco, { flat: '#0c1020' })),
  ...ambos((s) => el([0.77, 0.71, s * 0.34], [0.12, 0.055, 0.15], MARFIL)),
  ...ambos((s) => el([0.82, 0.675, s * 0.4], [0.035, 0.022, 0.13], C.blanco, { flat: '#14161e', rot: [s * -12, 0, 0] })),
  ...ambos((s) => el([0.78, 0.7, s * 0.5], [0.025, 0.02, 0.08], C.blanco, { flat: '#14161e', rot: [s * -35, 0, 0] })),
]

const ojosCerrados = [
  ...ambos((s) => el([0.8, 0.63, s * 0.36], [0.04, 0.025, 0.14], C.blanco, { flat: '#14161e', rot: [s * 10, 0, -10] })),
  ...ambos((s) => el([0.78, 0.6, s * 0.48], [0.025, 0.02, 0.08], C.blanco, { flat: '#14161e', rot: [s * 35, 0, 0] })),
]

const destello = (c) => [el(c, [0.02, 0.17, 0.02], C.blanco, { flat: '#ffffff', brilla: true }), el(c, [0.15, 0.02, 0.02], C.blanco, { flat: '#ffffff', brilla: true, rot: [0, 40, 0] })]

// B · El peinado: mentón arriba, ojos cerrados de gusto, pasándose un peine
// de oro por el copete.
export const DUKE_B = dukeBase({ ojos: ojosCerrados, menton: 14 }, [
  hueso([0.05, -0.45, 0.85], [0.35, -0.2, 1.05], 0.18, C.blanco),
  hueso([0.35, -0.2, 1.05], [0.3, 1.0, 0.7], 0.16, C.blanco),
  el([0.31, 0.92, 0.72], [0.05, 0.16, 0.16], C.oro, { rot: [0, 0, 80] }),
  ...guante([0.3, 1.08, 0.66]),
  hueso([0.05, 1.3, 0.5], [0.6, 1.45, 0.42], 0.06, C.negro),
  ...[0, 1, 2, 3, 4, 5, 6].map((i) => hueso([0.1 + i * 0.08, 1.31 + i * 0.022, 0.48], [0.1 + i * 0.08, 1.18 + i * 0.022, 0.44], 0.02, C.negro)),
  ...destello([0.75, 1.6, -0.2]),
  ...destello([-0.4, 1.4, -0.5]),
])

// Duky es el pato de hule gigante de Hofman: cuerpo ancho y bajo, pecho
// que sube a una cabeza grande, cola alzada, alas ovaladas en relieve, pico
// rojo anaranjado y ojos negros redondos. No hace nada.
export const DUKY = [
  el([-0.1, -1.15, 0], [1.3, 0.72, 1.0], C.hule),
  el([0.5, -0.9, 0], [0.75, 0.66, 0.84], C.hule),
  el([-1.1, -0.62, 0], [0.48, 0.3, 0.42], C.hule, { rot: [0, 0, 40] }),
  el([0.3, -0.35, 0], [0.55, 0.5, 0.55], C.hule),
  ...ambos((s) => el([-0.25, -0.85, s * 0.8], [0.6, 0.4, 0.16], C.hule, { rot: [0, 0, -12] })),
  el([0.35, 0.2, 0], [0.7, 0.68, 0.66], C.hule),
  el([1.02, 0.1, 0], [0.36, 0.14, 0.32], C.picoHule, { rot: [0, 0, 6] }),
  ...ambos((s) => el([0.9, 0.38, s * 0.36], [0.07, 0.12, 0.11], C.oscuro, { flat: '#14161e' })),
  ...ambos((s) => el([0.96, 0.43, s * 0.36], [0.02, 0.035, 0.03], C.blanco, { flat: '#ffffff' })),
]

// Su asiento eyectable, solo en la cabina. En el apoyacabezas, las rayas de
// sus victorias.
export const DUKY_ASIENTO = [
  placa([[-1.35, -1.9, -0.95], [-1.35, -1.9, 0.95], [-1.35, 0.9, 0.95], [-1.35, 0.9, -0.95]], 0.3, C.asiento),
  el([-1.3, 1.05, 0], [0.22, 0.42, 0.75], C.asiento, {
    pinta: ([x, y, z]) => {
      if (x < -1.2 || y < 0.85 || y > 1.3 || Math.abs(z) > 0.62) return null
      const u = (z + 0.62) / 0.124
      const grupo = Math.floor(u / 5)
      const k = Math.floor(u) % 5
      if (k === 4) return Math.abs((u % 5) - 2.5 - (y - 1.07) * 9) < 0.6 ? '#f2f2f2' : null
      return u % 1 < 0.45 && grupo < 2 ? '#f2f2f2' : null
    },
  }),
  placa([[-1.35, -1.9, -0.95], [-1.35, -1.9, 0.95], [0.9, -1.9, 0.95], [0.9, -1.9, -0.95]], 0.25, C.asiento),
  el([0.95, -1.75, 0], [0.06, 0.18, 0.24], C.rayas, { pinta: ([, y]) => (Math.floor((y + 2) * 14) % 2 ? '#1a1a1a' : null) }),
]

// ── Cazas ────────────────────────────────────────────────────────────────

const cabezaPiloto = (x, y, rampa, extra = []) => [el([x, y, 0], [0.32, 0.3, 0.28], rampa), el([x + 0.3, y - 0.05, 0], [0.18, 0.06, 0.12], C.pico), ...extra]

// Estelas de los motores: translúcidas y con luz propia (ver tres.mjs).
const estela = (x, y, z, largo, ancho, color, alfa, nivel = 1) =>
  tubo(
    [
      [x, ancho, ancho, y, 2, z],
      [x - largo * 0.15, ancho * 0.92, ancho * 0.92, y, 2, z],
      [x - largo * 0.6, ancho * 0.55, ancho * 0.55, y, 2, z],
      [x - largo, 0.04, 0.04, y, 2, z],
    ],
    null,
    { luz: { color, alfa, nivel } },
  )
const destelloMotor = (c, r, color, alfa, nivel) => el(c, r, null, { luz: { color, alfa, nivel } })

// Propulsión común: llama corta naranja con el centro claro.
const llama = (x, y, z, largo, ancho) => [estela(x, y, z, largo, ancho, '#ff8a20', 0.75), estela(x, y, z, largo * 0.45, ancho * 0.55, '#fff0b0', 0.9, 2)]

// Boeing F-15EX Eagle II: 19,4 m de largo, 13 m de envergadura. Dos plazas,
// tomas de aire rectangulares a los lados de la cabina, ala en flecha de 45°
// con puntas cortadas, dos derivas verticales y dos toberas.
const f15 = ({ cuerpo, colas, piloto, pintaAla, pintaCuerpo, pintaCola }) => [
  tubo(
    [
      [9.7, 0.05, 0.05, 0.15],
      [8.9, 0.6, 0.6, 0.15],
      [7.6, 1.15, 1.1, 0.2],
      [5.8, 1.45, 1.45, 0.3],
      [3.8, 1.55, 1.6, 0.35],
      [1.5, 1.6, 1.4, 0.3, 2.6],
      [-2, 1.5, 1.1, 0.35, 2.6],
      [-6, 1.3, 0.9, 0.35, 2.6],
      [-8.6, 0.9, 0.6, 0.4],
    ],
    cuerpo,
    { pinta: pintaCuerpo },
  ),
  ...ambos((s) =>
    tubo(
      [
        [3.6, 1.15, 1.35, 0.05, 6, s * 1.35],
        [2.5, 1.25, 1.45, 0.05, 6, s * 1.4],
        [-2, 1.35, 1.3, 0.1, 4, s * 1.35],
        [-6.5, 1.25, 1.15, 0.15, 3, s * 0.95],
        [-9.0, 1.05, 1.05, 0.2, 2, s * 0.62],
      ],
      cuerpo,
      { pinta: pintaCuerpo },
    ),
  ),
  ...ambos((s) => el([3.62, 0.05, s * 1.35], [0.06, 0.62, 0.5], C.oscuro)),
  ...ambos((s) => el([-9.1, 0.2, s * 0.62], [0.35, 0.48, 0.48], C.grisOscuro)),
  ...ambos((s) => llama(-9.4, 0.2, s * 0.62, 3.6, 0.85)).flat(),
  ...ambos((s) =>
    placa([[1.8, 0.25, s * 1.9], [-3.3, 0.15, s * 6.5], [-4.7, 0.15, s * 6.5], [-4.6, 0.25, s * 1.9]].map((p) => p), 0.22, cuerpo, { pinta: pintaAla }),
  ),
  ...ambos((s) => placa([[-6.3, 0.15, s * 1.6], [-8.4, 0.1, s * 4.3], [-9.6, 0.1, s * 4.3], [-9.4, 0.15, s * 1.6]], 0.16, cuerpo)),
  ...ambos((s) => placa([[-5.4, 0.7, s * 1.45], [-7.9, 3.4, s * 1.45], [-9.2, 3.4, s * 1.45], [-9.3, 0.7, s * 1.45]], 0.18, colas, { pinta: pintaCola })),
  el([4.2, 0.95, 0], [2.5, 0.62, 0.58], C.vidrio, { vidrio: true }),
  ...cabezaPiloto(5.0, 0.95, piloto[0], piloto[1]),
]

const estrellasEnAla = ([x, , z]) => {
  const az = Math.abs(z)
  for (const [ex, ez] of [[-1.6, 3.6], [-3.2, 5.4], [-0.2, 2.6]]) if (enEstrella(az - ez, x - ex, 0.75)) return '#f2c440'
  return null
}

export const CAZA_DUCK_ONE = f15({
  cuerpo: C.grisEX,
  colas: C.grisEX,
  piloto: [C.verde, []],
  pintaAla: estrellasEnAla,
  pintaCola: ([x, y]) => (enEstrella(x + 8.2, y - 2.5, 0.55) ? '#f2c440' : null),
})

export const CAZA_DUKE = f15({
  cuerpo: C.perla,
  colas: C.rosa,
  piloto: [C.crema, [el([4.75, 1.18, 0], [0.24, 0.16, 0.18], C.corona)]],
  pintaCuerpo: ([x, y]) => (Math.abs(y - 0.05) < 0.1 && x < 8 ? C.oro : null),
  pintaAla: ([x, , z]) => (Math.abs(x - (1.8 - (Math.abs(z) - 1.9) * 1.1)) < 0.28 ? C.oro : null),
  pintaCola: ([, y]) => (Math.abs(y - 3.0) < 0.14 ? C.oro : null),
})

// Fairchild Republic A-10 Thunderbolt II: 16,3 m de largo, 17,5 m de
// envergadura. Ala recta y baja con góndolas del tren, dos motores altos
// sobre el fuselaje trasero, derivas en las puntas del estabilizador y el
// cañón GAU-8 asomando bajo el morro.
export const CAZA_MOBY = [
  tubo(
    [
      [8.1, 0.1, 0.1, 0.05],
      [7.6, 0.9, 0.85, 0.1],
      [6.2, 1.5, 1.6, 0.15],
      [4.2, 1.7, 1.9, 0.2],
      [1, 1.6, 1.75, 0.1],
      [-2, 1.25, 1.35, 0.15],
      [-5, 0.85, 0.85, 0.3],
      [-7.6, 0.5, 0.5, 0.4],
      [-8.1, 0.25, 0.25, 0.4],
    ],
    C.negro,
    {
      pinta: ([x, y]) => {
        if (x < 5.4 || x > 7.9) return null
        const borde = -0.25 - (x - 5.4) * 0.12
        const diente = Math.abs(((x * 3) % 1) - 0.5) * 0.3
        if (y < borde && y > borde - 0.35) return y > borde - 0.08 - diente ? '#f4f4f4' : C.boca
        return null
      },
    },
  ),
  el([8.5, -0.45, 0], [0.75, 0.1, 0.1], C.grisOscuro),
  el([4.8, 0.95, 0], [1.3, 0.62, 0.55], C.vidrio, { vidrio: true }),
  ...cabezaPiloto(5.2, 0.95, ['#d8925e', '#a05a30', '#723c1e', '#40200e'], [el([5.15, 1.12, 0], [0.3, 0.16, 0.27], C.negro)]),
  ...ambos((s) => placa([[1.7, -0.55, s * 0.8], [1.6, -0.55, s * 3.4], [-1.5, -0.55, s * 3.4], [-1.6, -0.55, s * 0.8]], 0.35, C.negro)),
  ...ambos((s) => placa([[1.6, -0.55, s * 3.4], [0.9, 0.1, s * 8.75], [-0.6, 0.1, s * 8.75], [-1.5, -0.55, s * 3.4]], 0.25, C.negro)),
  ...ambos((s) => el([1.2, -0.85, s * 2.9], [1.4, 0.35, 0.35], C.negro)),
  ...ambos((s) => el([-3.2, 1.25, s * 1.3], [1.9, 0.68, 0.68], C.negro)),
  ...ambos((s) => el([-1.32, 1.25, s * 1.3], [0.06, 0.55, 0.55], C.grisOscuro)),
  ...ambos((s) => llama(-5.05, 1.25, s * 1.3, 1.4, 0.75)).flat(),
  ...ambos((s) => placa([[-2.6, 0.5, s * 0.6], [-2.6, 1.0, s * 1.0], [-4.0, 1.0, s * 1.0], [-4.0, 0.5, s * 0.6]], 0.2, C.negro)),
  placa([[-5.6, 0.4, -3.1], [-5.6, 0.4, 3.1], [-7.5, 0.4, 3.1], [-7.5, 0.4, -3.1]], 0.2, C.negro),
  ...ambos((s) => placa([[-5.3, -0.4, s * 3.1], [-5.6, 2.6, s * 3.1], [-6.4, 3.0, s * 3.1], [-7.3, 2.9, s * 3.1], [-7.7, -0.4, s * 3.1]], 0.2, C.negro)),
  el([-5.4, 1.6, 1.4], [0.4, 0.32, 0.36], C.humo),
  el([-6.8, 2.3, 1.6], [0.32, 0.26, 0.3], C.humo),
  el([-8.0, 2.9, 1.7], [0.24, 0.2, 0.22], C.humo),
]

// El F-35 de Duky es negro furtivo, con la cabina dorada del real y las
// marcas de victorias en amarillo, lo único amarillo que le queda. Su estela
// es la de un F135 real: azul violeta con diamantes de choque.
const FURTIVO = ['#5c636c', '#2e333a', '#1d2026', '#0c0d10']

// Lockheed Martin F-35A Lightning II: 15,7 m de largo, 10,7 m de
// envergadura. Cuerpo ancho con aristas, tomas de aire laterales tras la
// cabina, ala trapezoidal, derivas inclinadas hacia afuera y una sola tobera.
export const CAZA_DUKY = [
  tubo(
    [
      [7.85, 0.05, 0.05, 0.05],
      [6.9, 0.85, 0.55, 0.05, 1.6],
      [5.2, 2.0, 1.05, 0.1, 1.6],
      [3.2, 3.0, 1.35, 0.15, 1.7],
      [0.5, 3.1, 1.4, 0.1, 1.8],
      [-3, 3.0, 1.3, 0.1, 1.8],
      [-5.8, 2.1, 1.1, 0.15, 2],
      [-7.2, 1.3, 1.0, 0.15, 2],
    ],
    FURTIVO,
    {
      pinta: ([x, y, z]) => {
        if (x > 1.8 && x < 4.6 && y > -0.05 && y < 0.38 && Math.abs(z) > 0.5) {
          const fila = Math.floor((y + 0.05) / 0.22)
          return (x * 4.5) % 1 < 0.45 && ((y + 0.05) % 0.22) < 0.13 && fila < 2 ? '#f8cc1c' : null
        }
        return null
      },
    },
  ),
  ...ambos((s) => el([2.1, 0.35, s * 1.25], [0.08, 0.38, 0.32], C.oscuro)),
  ...ambos((s) => el([1.6, 0.35, s * 1.25], [0.8, 0.42, 0.36], FURTIVO)),
  el([3.9, 0.85, 0], [2.1, 0.6, 0.52], C.vidrioOro, { vidrio: true }),
  ...cabezaPiloto(4.3, 0.8, C.hule),
  ...ambos((s) => placa([[0.6, 0.15, s * 1.45], [-3.6, 0.15, s * 5.35], [-4.9, 0.15, s * 5.35], [-4.6, 0.15, s * 1.45]], 0.2, FURTIVO)),
  ...ambos((s) => placa([[-5.0, 0.1, s * 1.1], [-7.0, 0.1, s * 3.4], [-7.9, 0.1, s * 3.4], [-7.6, 0.1, s * 1.1]], 0.16, FURTIVO)),
  ...ambos((s) => placa([[-3.9, 0.6, s * 1.1], [-6.3, 2.75, s * 1.85], [-7.3, 2.75, s * 1.85], [-7.2, 0.6, s * 1.1]], 0.16, FURTIVO)),
  el([-7.4, 0.15, 0], [0.45, 0.58, 0.58], C.grisOscuro),
  estela(-7.75, 0.15, 0, 9, 2.0, '#7a7cff', 0.45, 0),
  estela(-7.75, 0.15, 0, 7.5, 1.35, '#9a6cff', 0.75, 1),
  ...[0, 1, 2, 3].map((i) => destelloMotor([-8.7 - i * 1.25, 0.15, 0], [0.48, 0.45 * (1 - i * 0.16), 0.45 * (1 - i * 0.16)], '#ffc8ff', 0.95, 2)),
  destelloMotor([-7.95, 0.15, 0], [0.35, 0.5, 0.5], '#fff0ff', 0.95, 3),
]

export { hueso, ambos, guante, disco, dukeBase, ojosAbiertos, ojosCerrados, destello }
