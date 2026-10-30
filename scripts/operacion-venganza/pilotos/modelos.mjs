// Los cuatro pilotos y sus cazas en 3D. Los cazas van en metros, con las
// medidas reales: el morro hacia +x, arriba +y y el ala derecha hacia +z.
// Los patos miran también hacia +x.

import { el, forro, placa, tubo, transformar } from './tres.mjs'

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

// Gafas de aviador clásicas: un óvalo de marco dorado por lado, ladeado como
// una gota, con el cristal verde y un reflejo.
const LENTE_AVIADOR = ['#7a9a84', '#2e4436', '#1e2e24', '#0e1812']
const aviador = (s) => {
  const n = [0.75, 0.1, s * 0.65]
  const rot = [s * 14, (Math.atan2(-n[2], n[0]) * 180) / Math.PI, (Math.asin(n[1]) * 180) / Math.PI]
  const brillo = ([, y, z]) => (Math.abs(y - 0.7 + (Math.abs(z) - 0.44) * 0.9) < 0.03 ? '#dfeee4' : null)
  const ovalo = (c, [alto, ancho], rampa, o) => el(c, [0.012, alto, ancho], rampa, { rot, ...o })
  const c = [0.88, 0.62, s * 0.42]
  return [
    ovalo(c, [0.27, 0.23], C.oro),
    ovalo(c.map((v, i) => v + n[i] * 0.03), [0.235, 0.195], LENTE_AVIADOR, { pinta: brillo }),
    hueso([0.7, 0.72, s * 0.6], [0.0, 0.74, s * 0.69], 0.022, C.oro),
  ]
}

// duck-one: el mentón arriba, gafas de aviador y una ceja alzada por sobre
// el marco. Sin gorro se le ve el resorte que lo espera debajo (gorro.mjs).
// El torso y las gafas van aparte: en la escena 3 baja la cabeza y se
// acomoda las gafas.
// Lleva todas sus medallas: el pecho entero, en filas corridas, cada una con
// su cinta.
const CINTAS = ['#d83a2c', '#2c4cb0', '#22a04a', '#f2c440', '#8a3ab8']
const medallero = ([x, y, z]) => {
  if (x < 0) return null
  const fila = Math.round((y + 0.4) / -0.19)
  if (fila < 0 || fila > 4) return null
  const corrida = (fila % 2) * 0.105
  const columna = Math.round((z - corrida) / 0.21)
  const [my, mz] = [-0.4 - 0.19 * fila, corrida + 0.21 * columna]
  if (Math.hypot(y - my, z - mz) < 0.065) return (fila + columna) % 3 ? C.oro : C.gris
  if (Math.abs(z - mz) < 0.055 && y > my + 0.05 && y < my + 0.14) return Math.abs(z - mz) < 0.018 ? '#f2f2f2' : CINTAS[(((fila * 3 + columna) % 5) + 5) % 5]
  return null
}
export const DUCK_ONE_TORSO = [
  el([0, -0.85, 0], [0.9, 0.7, 1.1], C.oliva, { pinta: medallero }),
  el([0.1, 0, 0], [0.5, 0.52, 0.52], C.verde),
  el([0.1, -0.15, 0], [0.56, 0.12, 0.58], C.blanco),
]
export const GAFAS_DUCK_ONE = cabecear(
  [...[1, -1].flatMap(aviador), hueso([1.0, 0.78, -0.28], [1.0, 0.78, 0.28], 0.025, C.oro)],
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
// Lo que esconde el gorro: un rizo de resorte que sube `alto` desde la
// coronilla, ladeado `ladeo` grados.
export const rizo = (alto, ladeo) => {
  const R = transformar([ladeo, 0, -0.6 * ladeo])
  const punto = (k, r) => sum([0.08, 1.2, 0.1], R.punto([r * Math.cos(k * 9 * Math.PI), k * alto, r * Math.sin(k * 9 * Math.PI)]))
  return CABEZA.formas([...Array.from({ length: 32 }, (_, i) => el(punto(i / 31, 0.16), [0.07, 0.07, 0.07], C.verdinegro)), el(punto(1, 0), [0.09, 0.08, 0.09], C.verdinegro)])
}

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
// hilo por la mejilla a chorros en arco hacia los lados (en 0, nada). `apagado`:
// el puro en el pico, sin brasa ni humo; sin `humea`, prendido y sin humo.
export const mobyCabeza = ({ t = 0, abre = 0, pena = 0, llanto = 0.4, puroEnPico = true, apagado = false, humea = true } = {}) => {
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
      if (a >= 2.4 * llanto) continue
      formas.push(el(sum(enCabeza([0.72, 0.1, s * 0.55]), [0.2 * a, 0.32 * a - 0.16 * a * a, s * 0.5 * a]), [0.08, 0.1, 0.08], C.vidrio, { flat: LAGRIMA }))
    }
  if (puroEnPico) {
    const brasa = enCabeza([1.28, -0.6, -0.89])
    formas.push(hueso(enCabeza([0.83, -0.26, -0.3]), enCabeza([1.25, -0.58, -0.85]), 0.12, C.puro), hueso(enCabeza([0.89, -0.3, -0.38]), enCabeza([0.93, -0.33, -0.43]), 0.135, C.oro))
    if (!apagado) formas.push(el(brasa, [0.08, 0.08, 0.08], C.naranja, { flat: '#ff7a2a', brilla: true }), ...(humea ? humareda(brasa, t / 8) : []))
  }
  return formas
}

// El busto de las tomas: de brazos cruzados sobre la musculosa.
const brazoCruzado = (hombro, codo, puno) => [hueso(hombro, codo, 0.3, C.pardo), el(sum(hombro, esc(res(codo, hombro), 0.5)), [0.36, 0.32, 0.32], C.pardo), hueso(codo, puno, 0.28, C.pardo), el(puno, [0.25, 0.22, 0.22], C.pardo)]
export const MOBY_BRAZOS_CRUZADOS = [
  ...brazoCruzado([0.1, -0.5, -1.45], [0.85, -1.0, -1.25], [1.25, -0.7, 0.6]),
  ...brazoCruzado([0.1, -0.5, 1.45], [0.9, -1.05, 1.25], [1.28, -0.88, -0.6]),
]
export const MOBY = [...MOBY_TORSO, ...mobyCabeza(), ...MOBY_BRAZOS_CRUZADOS]

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

// Su asiento eyectable, un ACES II, solo en la cabina: detrás, los rieles de
// la catapulta y la botella verde de oxígeno; sobre el apoyacabezas, los
// rompecúpulas, y en él, las rayas de sus victorias.
export const DUKY_ASIENTO = [
  ...ambos((s) => hueso([-1.62, -1.9, s * 0.7], [-1.62, 1.45, s * 0.7], 0.06, C.grisOscuro)),
  ...ambos((s) => hueso([-1.3, 1.42, s * 0.45], [-1.15, 1.62, s * 0.45], 0.035, C.grisOscuro)),
  hueso([-1.75, -1.2, -0.95], [-1.75, -0.35, -0.95], 0.14, C.verde),
  el([-1.75, -0.3, -0.95], [0.06, 0.06, 0.06], C.gris),
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

// Estelas de los motores: translúcidas y con luz propia (ver tres.mjs). Las
// de toberas planas salen con su `alto` y el exponente `e` de la boca.
const estela = (x, y, z, largo, ancho, color, alfa, nivel = 1, alto = ancho, e = 2) =>
  tubo(
    [
      [x, ancho, alto, y, e, z],
      [x - largo * 0.15, ancho * 0.92, alto * 0.92, y, e, z],
      [x - largo * 0.6, ancho * 0.55, alto * 0.55, y, 2, z],
      [x - largo, 0.04, 0.04, y, 2, z],
    ],
    null,
    { luz: { color, alfa, nivel } },
  )
const destelloMotor = (c, r, color, alfa, nivel) => el(c, r, null, { luz: { color, alfa, nivel } })

// Propulsión común: llama corta naranja con el centro claro.
const llama = (x, y, z, largo, ancho) => [estela(x, y, z, largo, ancho, '#ff8a20', 0.75), estela(x, y, z, largo * 0.45, ancho * 0.55, '#fff0b0', 0.9, 2)]

// Los planos de los cazas van en metros desde la punta del morro (X); enX
// los lleva al eje del caza.
const enX = (X) => 9.45 - X

// Grumman F-14 Tomcat: 19,1 m de largo y 4,9 m de alto, calcado de un plano
// de tres vistas. Morro largo y redondo, la cabina alta bajo una cúpula
// larga, las tomas de aire rectangulares bajo el guante fijo del ala, los
// motores separados con el lomo plano entre ellos, la cola de castor, dos
// estabilizadores y dos derivas abiertas 5°. Las alas giran en un pivote
// del guante (barrerAlas): 19,5 m de envergadura abiertas a 20°, para
// despegar y aterrizar, 12 m barridas a 68° y menos en la cubierta, a 75°.
//
// El real es de dos plazas y el de duck-one, de una: la cúpula es la misma
// y bajo ella un carenado ocupa el puesto de atrás (interiores.mjs). Gris de
// la marina, con sus estrellas de líder en las alas y las derivas.
const GRIS_TOMCAT = C.grisEX
const ESTRELLA = C.oro[1]

// El fuselaje, de la punta del morro a la cola: [X, ancho, alto, centro, exponente].
const FUSELAJE_TOMCAT = [
  [0, 0.04, 0.04, -0.33],
  [0.5, 0.5, 0.46, -0.31],
  [1.2, 0.9, 0.84, -0.26],
  [2.0, 1.2, 1.16, -0.17, 2.1],
  [3.0, 1.44, 1.46, -0.05, 2.3],
  [4.0, 1.64, 1.68, 0.04, 2.5],
  [5.0, 1.74, 1.73, 0.065, 2.6],
  [6.4, 1.8, 1.85, 0.125, 2.6],
  [7.6, 1.86, 1.92, 0.21, 2.6],
  [8.6, 1.9, 1.8, 0.2, 2.7],
  [9.6, 1.92, 1.52, 0.11, 2.8],
  [11, 2.0, 1.17, 0.035, 3],
  [13, 2.0, 0.92, 0.04, 3.5],
  [15.5, 1.8, 0.76, 0.04, 3.5],
  [17.6, 1.1, 0.5, 0, 3],
]
// Delante del parabrisas, el antirreflejo.
const antirreflejo = ([x], n) => (x < enX(1.7) && x > enX(3.1) && n[1] > 0.55 ? C.grisOscuro : null)

// Los motores, de la toma de aire a la tobera: [X, ancho, alto, centro, exponente].
const MOTOR = [
  [6.4, 1.0, 1.3, -0.4, 6],
  [7.5, 1.1, 1.45, -0.42, 5],
  [10, 1.25, 1.5, -0.45, 3.5],
  [13, 1.3, 1.4, -0.45, 2.4],
  [16, 1.2, 1.2, -0.4, 2.2],
  [17.6, 1.05, 1.05, -0.35, 2],
]
const Z_MOTOR = 1.45
// Un anillo del motor, como los de tubo(), con la boca inclinada: arriba va
// `inclina` m más adelante y abajo, más atrás.
const anilloMotor = ([X, ancho, alto, y, e], s, inclina = 0) =>
  Array.from({ length: 24 }, (_, k) => {
    const a = (k / 24) * Math.PI * 2
    const f = (v) => Math.sign(v) * Math.abs(v) ** (2 / e)
    return [enX(X - inclina * f(Math.sin(a))), y + (alto / 2) * f(Math.sin(a)), s * (Z_MOTOR + (ancho / 2) * f(Math.cos(a)))]
  })
const TOBERA_TOMCAT = { x: enX(19.0), y: -0.35 }

// El guante, el ala abierta y el estabilizador del lado derecho, cada punto
// [X, Z]; la deriva, [X, y], abierta 5° hacia afuera desde el lomo del motor.
const GUANTE = [[6.5, 0.95], [6.5, 1.95], [11.6, 3.6], [13.6, 2.4], [13.6, 0.95]]
const ALA_TOMCAT = [[10.6, 2.3], [13.25, 9.6], [14.3, 9.4], [13.8, 2.3]]
const ESTABILIZADOR_TOMCAT = [[15.0, 1.9], [18.2, 4.98], [19.0, 4.8], [18.0, 1.9]]
const DERIVA_TOMCAT = [[15.0, 0.35], [17.8, 2.68], [19.05, 2.68], [18.4, 0.35]]
const abierta = (y) => Z_MOTOR + (y - 0.35) * Math.tan((5 * Math.PI) / 180)
const enPlanta = (puntos, y, s) => puntos.map(([X, Z]) => [enX(X), y, s * Z])

// Una estrella de líder en cada ala y en cada deriva.
const estrellaEnAla = ([x, , z]) => (enEstrella(Math.abs(z) - 6.3, x - enX(13.1), 0.75) ? ESTRELLA : null)
const estrellaEnDeriva = ([x, y]) => (enEstrella(x - enX(17.55), y - 1.5, 0.5) ? ESTRELLA : null)

// Las alas giran en el pivote, dentro del guante, de abiertas a `grados`;
// `barre` dice de qué lado son.
export const ALAS_TOMCAT = { abiertas: 20, barridas: 68, estacionadas: 75 }
const PIVOTE = { x: enX(11.6), z: 2.6 }
export const barrerAlas = (formas, grados) =>
  formas.map((f) => (f.barre ? transformar([0, -f.barre * (grados - ALAS_TOMCAT.abiertas), 0], [PIVOTE.x, 0, f.barre * PIVOTE.z]).formas([f])[0] : f))

export const CAZA_DUCK_ONE = [
  tubo(FUSELAJE_TOMCAT.map(([X, ...seccion]) => [enX(X), ...seccion]), GRIS_TOMCAT, { pinta: antirreflejo }),
  hueso([enX(0), -0.33, 0], [enX(-0.45), -0.33, 0], 0.025, C.grisOscuro),
  ...ambos((s) => [
    // De frente, la boca de la toma es un hueco oscuro.
    forro(MOTOR.map((seccion, i) => anilloMotor(seccion, s, i ? 0 : 0.5)), GRIS_TOMCAT, { pinta: ([x], n) => (n[0] > 0.55 && x > enX(7.0) ? C.oscuro : null) }),
    tubo([[enX(17.5), 1.06, 1.06, TOBERA_TOMCAT.y, 2, s * Z_MOTOR], [TOBERA_TOMCAT.x, 0.94, 0.94, TOBERA_TOMCAT.y, 2, s * Z_MOTOR]], C.grisOscuro),
    el([TOBERA_TOMCAT.x - 0.02, TOBERA_TOMCAT.y, s * Z_MOTOR], [0.04, 0.4, 0.4], C.oscuro, { flat: '#1a1d22' }),
    placa(enPlanta(GUANTE, 0.3, s), 0.32, GRIS_TOMCAT),
    placa(enPlanta(ALA_TOMCAT, 0.3, s), 0.16, GRIS_TOMCAT, { pinta: estrellaEnAla, barre: s }),
    placa(enPlanta(ESTABILIZADOR_TOMCAT, -0.3, s), 0.14, GRIS_TOMCAT),
    placa(DERIVA_TOMCAT.map(([X, y]) => [enX(X), y, s * abierta(y)]), 0.14, GRIS_TOMCAT, { pinta: estrellaEnDeriva }),
    // Las aletas ventrales, bajo los motores.
    placa([[enX(14.2), -0.9, s * 1.65], [enX(15.0), -1.35, s * 1.75], [enX(15.9), -1.35, s * 1.75], [enX(15.9), -0.9, s * 1.65]], 0.08, GRIS_TOMCAT),
    ...llama(TOBERA_TOMCAT.x, TOBERA_TOMCAT.y, s * Z_MOTOR, 3.6, 0.85),
  ]).flat(),
  // La cola de castor, entre los motores.
  placa([[enX(17.0), -0.05, -0.5], [enX(17.0), -0.05, 0.5], [enX(19.4), -0.05, 0.36], [enX(19.4), -0.05, -0.36]], 0.14, GRIS_TOMCAT),
  el([enX(5.5), 0.9, 0], [2.5, 0.58, 0.62], C.vidrio, { vidrio: true }),
  ...cabezaPiloto(enX(4.75), 0.95, C.verde),
]

// La postcombustión de sus dos TF30, para la catapulta: larga, naranja y
// rosada, con el centro claro y los diamantes de choque.
export const POSTCOMBUSTION_TOMCAT = ambos((s) => {
  const { x, y } = TOBERA_TOMCAT
  const z = s * Z_MOTOR
  return [
    estela(x, y, z, 7, 0.95, '#ff9a7a', 0.45, 0),
    estela(x, y, z, 4.6, 0.8, '#ff8a2a', 0.75, 1),
    estela(x, y, z, 2.2, 0.55, '#fff0c0', 0.9, 2),
    ...[0, 1, 2].map((i) => destelloMotor([x - 1.3 - i * 1.1, y, z], [0.26, 0.24 * (1 - i * 0.2), 0.24 * (1 - i * 0.2)], '#fff2e6', 0.9, 3)),
  ]
}).flat()

// McDonnell Douglas F/A-18C Hornet: 17,1 m de largo, 12,3 m de envergadura
// y 4,7 m de alto. Una plaza bajo una cúpula de burbuja, las extensiones del
// borde de ataque (LEX) que nacen junto a la cabina, las tomas de aire bajo
// ellas, ala trapezoidal, dos derivas inclinadas 20° hacia afuera y dos
// toberas juntas.
//
// El de duke va pintado como los de los Blue Angels, pero blanco donde ellos
// son azules y rosa donde son dorados: una franja que nace en el morro y se
// ensancha hasta las LEX, los bordes de ataque, el remate de las derivas y
// las alas rosa por debajo.
const ataque = (z) => 0.6 - (Math.abs(z) - 0.95) * 0.503
const bordeLex = (x) => (x > 2.2 ? 0.55 + (6.2 - x) / 4 : 1.55 + ((2.2 - x) / 2.05) * 0.3)
const franja = ([x, y], n) => {
  if (x > 8.35) return C.rosa
  const t = (8.2 - x) / 7
  return t > 0 && t < 1 && Math.abs(n[2]) > 0.45 && y < 0.25 + 0.2 * t && y > 0.15 - 0.35 * t ? C.rosa : null
}
const alaRosa = ([x, , z], n) => (n[1] < -0.5 || ataque(z) - x < 0.3 ? C.rosa : null)
const TOBERA_HORNET = { x: -8.0, y: 0.25, z: 0.5 }

// Las puntas de las alas se pliegan hacia arriba por una bisagra a 4,1 m del
// eje, como en la cubierta de un portaaviones; `plegable` dice de qué lado son.
const BISAGRA = { y: 0.45, z: 4.1 }
export const plegarAlas = (formas, grados) =>
  grados ? formas.map((f) => (f.plegable ? transformar([-f.plegable * grados, 0, 0], [0, BISAGRA.y, f.plegable * BISAGRA.z]).formas([f])[0] : f)) : formas

export const CAZA_DUKE = [
  tubo(
    [
      [9.0, 0.05, 0.05, 0.2],
      [8.4, 0.5, 0.5, 0.2],
      [7.4, 0.9, 0.9, 0.22],
      [6.4, 1.15, 1.2, 0.3],
      [5.2, 1.25, 1.45, 0.3],
      [3.5, 1.4, 1.5, 0.3],
      [1.5, 1.7, 1.45, 0.3, 2.4],
      [-1.5, 1.9, 1.4, 0.3, 2.6],
      [-4.5, 2.0, 1.25, 0.3, 2.6],
      [-6.8, 1.9, 1.0, 0.25, 2.6],
      [-7.5, 1.75, 0.85, 0.25],
    ],
    C.blanco,
    { pinta: franja },
  ),
  ...ambos((s) => tubo([[1.35, 0.75, 1.0, -0.05, 3, s * 1.0], [0, 0.8, 1.05, -0.05, 3, s * 1.0], [-2.6, 0.6, 0.8, 0.0, 3, s * 0.8]], C.blanco)),
  ...ambos((s) => el([1.37, -0.05, s * 1.0], [0.05, 0.42, 0.3], C.oscuro)),
  ...ambos((s) => placa([[6.2, 0.5, s * 0.55], [2.2, 0.5, s * 1.55], [0.15, 0.5, s * 1.85], [-0.1, 0.5, s * 0.6]], 0.12, C.blanco, { pinta: ([x, , z]) => (bordeLex(x) - Math.abs(z) < 0.22 ? C.rosa : null) })),
  ...ambos((s) => placa([[ataque(0.95), 0.45, s * 0.95], [ataque(4.1), 0.45, s * 4.1], [-3.47, 0.45, s * 4.1], [-3.5, 0.45, s * 0.95]], 0.2, C.blanco, { pinta: alaRosa })),
  ...ambos((s) => placa([[ataque(4.1), 0.45, s * 4.1], [ataque(5.7), 0.45, s * 5.7], [-3.2, 0.45, s * 5.7], [-3.47, 0.45, s * 4.1]], 0.14, C.blanco, { pinta: alaRosa, plegable: s })),
  ...ambos((s) => placa([[-5.4, 0.25, s * 0.95], [-7.3, 0.25, s * 3.29], [-8.15, 0.25, s * 3.29], [-8.0, 0.25, s * 0.95]], 0.14, C.blanco, { pinta: ([x, , z]) => (x > -5.4 - (Math.abs(z) - 0.95) * 0.81 - 0.3 ? C.rosa : null) })),
  ...ambos((s) => placa([[-2.3, 0.6, s * 0.85], [-3.9, 2.66, s * 1.6], [-5.6, 2.66, s * 1.6], [-6.0, 0.6, s * 0.85]], 0.14, C.blanco, { pinta: ([, y]) => (y > 2.15 ? C.rosa : null) })),
  ...ambos((s) => el([-7.75, 0.25, s * 0.5], [0.3, 0.42, 0.42], C.grisOscuro)),
  ...ambos((s) => llama(TOBERA_HORNET.x, TOBERA_HORNET.y, s * TOBERA_HORNET.z, 3.4, 0.8)).flat(),
  el([4.3, 0.95, 0], [2.0, 0.62, 0.58], C.vidrio, { vidrio: true }),
  ...cabezaPiloto(5.0, 0.95, C.crema, [el([4.75, 1.18, 0], [0.24, 0.16, 0.18], C.corona)]),
]

// La postcombustión de sus dos F404, para las pasadas de /patos: como la del
// Tomcat, algo más corta.
export const POSTCOMBUSTION_HORNET = ambos((s) => {
  const { x, y } = TOBERA_HORNET
  const z = s * TOBERA_HORNET.z
  return [
    estela(x, y, z, 6.5, 0.8, '#ff9a7a', 0.45, 0),
    estela(x, y, z, 4.3, 0.67, '#ff8a2a', 0.75, 1),
    estela(x, y, z, 2.1, 0.46, '#fff0c0', 0.9, 2),
    ...[0, 1, 2].map((i) => destelloMotor([x - 1.2 - i * 1.05, y, z], [0.24, 0.19 * (1 - i * 0.2), 0.19 * (1 - i * 0.2)], '#fff2e6', 0.9, 3)),
  ]
}).flat()

// Fairchild Republic A-10 Thunderbolt II: 16,3 m de largo, 17,5 m de
// envergadura, calcado de un plano de tres vistas. Ala recta y baja, con
// diedro desde las góndolas del tren; dos motores altos en góndolas
// cilíndricas sobre el fuselaje trasero, con la boca abierta y el cono del
// fan; derivas en las puntas del estabilizador y el cañón GAU-8 asomando
// bajo el morro.

// El fuselaje, de la punta del morro a la cola: [x, ancho, alto, y].
const FUSELAJE_A10 = [
  [8.1, 0.1, 0.1, 0.05],
  [7.6, 0.9, 0.85, 0.1],
  [6.2, 1.5, 1.6, 0.15],
  [4.2, 1.7, 1.9, 0.2],
  [1, 1.6, 1.75, 0.1],
  [-2, 1.25, 1.35, 0.15],
  [-5, 0.85, 0.85, 0.3],
  [-7.6, 0.5, 0.5, 0.4],
  [-8.1, 0.25, 0.25, 0.4],
]
// Un punto de su piel en la cuaderna `x`, a la altura `y`, del lado `s`, y su
// normal: ahí van pegados los parches y las marcas de moby (escena6/tomas.mjs).
export const pielDelA10 = (x, y, s) => {
  const i = FUSELAJE_A10.findIndex(([xi]) => xi < x)
  const [a, b] = [FUSELAJE_A10[i - 1], FUSELAJE_A10[i]]
  const [, ancho, alto, centro] = a.map((v, j) => v + ((b[j] - v) * (a[0] - x)) / (a[0] - b[0]))
  const [semiAncho, semiAlto] = [ancho / 2, alto / 2]
  const dy = (y - centro) / semiAlto
  const dz = Math.sqrt(Math.max(0, 1 - dy * dy))
  const n = [0, dy / semiAlto, (s * dz) / semiAncho]
  return { p: [x, y, s * semiAncho * dz], n: esc(n, 1 / Math.hypot(...n)) }
}
// El ala, de grosor parejo: recta y plana hasta las góndolas del tren y,
// desde ahí, con diedro hasta la punta. `alaDelA10(z)` da su altura.
const ALA_A10 = { y: -0.55, quiebre: 3.4, punta: 8.75, sube: 0.65, grosor: 0.3 }
export const alaDelA10 = (z) => ALA_A10.y + (ALA_A10.sube * Math.max(0, Math.abs(z) - ALA_A10.quiebre)) / (ALA_A10.punta - ALA_A10.quiebre) + ALA_A10.grosor / 2
// Las góndolas de los TF34, cilíndricas: adelante, la boca oscura con el cono
// del fan; atrás, la tobera, de donde sale la llama.
const MOTOR_A10 = { y: 1.25, z: 1.3, boca: -1.3, tobera: -5.0 }
const gondola = (s) => {
  const { y, boca, tobera } = MOTOR_A10
  const z = s * MOTOR_A10.z
  return tubo(
    [[boca, 1.2, 1.2], [boca - 0.2, 1.36, 1.36], [-3.7, 1.36, 1.36], [-4.7, 1.02, 1.02], [tobera, 0.78, 0.78]].map(([x, w, h]) => [x, w, h, y, 2, z]),
    C.negro,
    { pinta: ([, py, pz], n) => (Math.abs(n[0]) < 0.9 ? null : n[0] > 0 && Math.hypot(py - y, pz - z) < 0.17 ? C.grisOscuro : '#0c0e12') },
  )
}

export const CAZA_MOBY = [
  tubo(
    FUSELAJE_A10,
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
  hueso([7.4, -0.45, 0], [8.65, -0.45, 0], 0.12, C.grisOscuro),
  el([4.8, 0.95, 0], [1.3, 0.62, 0.55], C.vidrio, { vidrio: true }),
  ...cabezaPiloto(5.2, 0.95, ['#d8925e', '#a05a30', '#723c1e', '#40200e'], [el([5.15, 1.12, 0], [0.3, 0.16, 0.27], C.negro)]),
  ...ambos((s) => {
    const { y, quiebre, punta, sube, grosor } = ALA_A10
    return [
      placa([[1.7, y, s * 0.8], [1.6, y, s * quiebre], [-1.5, y, s * quiebre], [-1.6, y, s * 0.8]], grosor, C.negro),
      placa([[1.6, y, s * quiebre], [0.9, y + sube, s * punta], [-0.6, y + sube, s * punta], [-1.5, y, s * quiebre]], grosor, C.negro),
    ]
  }).flat(),
  ...ambos((s) => el([1.2, -0.85, s * 2.9], [1.4, 0.35, 0.35], C.negro)),
  ...ambos(gondola),
  ...ambos((s) => llama(MOTOR_A10.tobera, MOTOR_A10.y, s * MOTOR_A10.z, 1.4, 0.75)).flat(),
  ...ambos((s) => placa([[-2.6, 0.5, s * 0.6], [-2.6, 1.0, s * 1.0], [-4.0, 1.0, s * 1.0], [-4.0, 0.5, s * 0.6]], 0.2, C.negro)),
  placa([[-5.6, 0.4, -3.1], [-5.6, 0.4, 3.1], [-7.5, 0.4, 3.1], [-7.5, 0.4, -3.1]], 0.2, C.negro),
  ...ambos((s) => placa([[-5.3, -0.4, s * 3.1], [-5.6, 2.6, s * 3.1], [-6.4, 3.0, s * 3.1], [-7.3, 2.9, s * 3.1], [-7.7, -0.4, s * 3.1]], 0.2, C.negro)),
]

// El F-22 de Duky lleva pintura de guerra: negro entero, con la cúpula
// dorada del real y, a cada costado, un contador de bajas en amarillo que
// va de la cabina a la cola. Su postcombustión es la de dos F119: violeta
// por fuera, naranja y el centro claro, con los diamantes de choque.
const FURTIVO = ['#5c636c', '#2e333a', '#1d2026', '#0c0d10']
const BOCA = '#0c0e12'

// Lockheed Martin F-22A Raptor: 18,9 m de largo, 13,56 m de envergadura y
// 5,08 m de alto, calcado de un plano de tres vistas. Morro con aristas,
// tomas de aire de caret a los lados de la cabina, ala en diamante (borde de
// ataque a 42°, el de fuga hacia adelante, 3° de caída), estabilizadores de
// una pieza con la punta en flecha, derivas abiertas 28° y dos toberas
// planas.

// El contador: dos renglones de palotes de a cinco, los cuatro y el que los
// cruza, a lo largo de las tomas de aire y hasta las toberas.
const PALOTE = 0.24
const RENGLONES = [[-0.3, -0.16], [-0.52, -0.38]]
const contador = ([x, y, z], n) => {
  if (x > enX(5.9) || x < enX(16) || Math.abs(z) < 1 || Math.abs(n[2]) < 0.35) return null
  const renglon = RENGLONES.find(([a, b]) => y > a && y < b)
  if (!renglon) return null
  const u = (enX(5.9) - x) / PALOTE
  const cual = Math.floor(u) % 6
  const cruza = cual < 4 && Math.abs((u % 6) / 4 - (y - renglon[0]) / (renglon[1] - renglon[0])) < 0.1
  return (cual < 4 && u % 1 < 0.42) || cruza ? '#f8cc1c' : null
}

// El fuselaje por secciones: el lomo al centro, el hombro, la arista (lo más
// ancho), el bajo y la quilla, del lado derecho, en [z, y]; el izquierdo es su
// espejo. Cada tramo se parte en cuatro, para que el sombreado siga las caras.
const anillo = (X, arriba, hombro, arista, bajo, abajo) => {
  const derecho = [[0, arriba], hombro, arista, bajo, [0, abajo]]
  const vuelta = [...derecho, ...derecho.slice(1, -1).reverse().map(([z, y]) => [-z, y])]
  return vuelta.flatMap(([z, y], i) => {
    const [z1, y1] = vuelta[(i + 1) % vuelta.length]
    return [0, 1, 2, 3].map((k) => [enX(X), y + ((y1 - y) * k) / 4, z + ((z1 - z) * k) / 4])
  })
}
// El morro: [X, ancho de la arista, lomo, quilla, alto de la arista].
const morro = ([X, w, arriba, abajo, y = 0]) => anillo(X, arriba, [0.6 * w, y + 0.78 * (arriba - y)], [w, y], [0.66 * w, y + 0.72 * (abajo - y)], abajo)
const FUSELAJE = [
  ...[[0, 0.01, 0.01, -0.01], [0.25, 0.16, 0.1, -0.1], [0.6, 0.34, 0.23, -0.23], [1.2, 0.53, 0.41, -0.38], [1.8, 0.62, 0.51, -0.45, 0.01], [2.4, 0.69, 0.6, -0.53, 0.02], [3.2, 0.78, 0.66, -0.63, 0.03], [4.0, 0.84, 0.68, -0.72, 0.04], [4.7, 0.87, 0.7, -0.77, 0.05]].map(morro),
  // Tras la cúpula, el lomo sube y baja hasta el dorso ancho y plano.
  anillo(5.5, 0.86, [0.5, 0.74], [0.86, 0.06], [0.7, -0.6], -0.8),
  anillo(6.4, 1.13, [0.42, 1.0], [0.84, 0.08], [0.68, -0.62], -0.84),
  anillo(7.2, 1.0, [0.5, 0.9], [0.86, 0.1], [0.7, -0.64], -0.88),
  anillo(8.2, 0.87, [0.62, 0.8], [0.92, 0.1], [0.75, -0.66], -0.9),
  anillo(10, 0.82, [0.76, 0.74], [1.0, 0.1], [0.82, -0.66], -0.9),
  anillo(12, 0.77, [0.86, 0.7], [1.2, 0.1], [0.95, -0.66], -0.86),
  // Los dos motores, con las derivas encima, hasta las toberas.
  anillo(13.5, 0.62, [0.96, 0.62], [1.42, 0.1], [1.1, -0.55], -0.66),
  anillo(15, 0.5, [0.92, 0.53], [1.36, 0.08], [1.02, -0.45], -0.48),
  anillo(16, 0.42, [0.88, 0.45], [1.22, 0.08], [0.92, -0.33], -0.34),
  anillo(16.4, 0.38, [0.84, 0.41], [1.14, 0.08], [0.88, -0.29], -0.3),
]

// Las tomas de aire: cada anillo va de adentro arriba a afuera arriba (la
// arista que sigue hasta el borde de ataque del ala), afuera abajo y adentro
// abajo, cada esquina [X, z, y]. La boca se inclina: arriba va más adelante.
const TOMA = [
  [[5.0, 0.74, 0.28], [4.95, 1.88, -0.02], [5.65, 1.6, -0.86], [5.7, 0.74, -0.88]],
  [[6.5, 0.74, 0.34], [6.5, 1.98, 0.0], [6.5, 1.66, -0.9], [6.5, 0.74, -0.9]],
  [[8.4, 0.78, 0.4], [8.4, 2.19, 0.02], [8.4, 1.7, -0.9], [8.4, 0.78, -0.9]],
  [[10.5, 0.85, 0.42], [10.5, 2.05, 0.02], [10.5, 1.6, -0.88], [10.5, 0.85, -0.88]],
  [[12.5, 0.9, 0.4], [12.5, 1.7, 0.05], [12.5, 1.45, -0.8], [12.5, 0.9, -0.82]],
  [[13.8, 0.9, 0.35], [13.8, 1.45, 0.05], [13.8, 1.25, -0.6], [13.8, 0.9, -0.6]],
]
const tomaDeAire = (s) =>
  forro(
    TOMA.map((esquinas) =>
      esquinas.flatMap(([X, z, y], i) => {
        const [X1, z1, y1] = esquinas[(i + 1) % 4]
        return [0, 1, 2, 3].map((k) => [enX(X + ((X1 - X) * k) / 4), y + ((y1 - y) * k) / 4, s * (z + ((z1 - z) * k) / 4)])
      }),
    ),
    FURTIVO,
    // De frente, la boca es un hueco oscuro.
    { pinta: (p, n) => (n[0] > 0.55 && p[0] > enX(5.9) ? BOCA : contador(p, n)) },
  )

// Ala, estabilizador y deriva del lado derecho, cada punto [X, y, z].
const ALA = [[7.45, 0, 1.2], [12.83, -0.32, 6.78], [13.76, -0.32, 6.78], [16.3, 0, 1.2]]
const ESTABILIZADOR = [[14.2, -0.12, 1.17], [17.08, -0.12, 4.49], [18.31, -0.12, 4.49], [18.95, -0.12, 2.9], [17.43, -0.12, 1.17]]
const DERIVA = [[13.0, 0.55, 1.15], [14.3, 3.15, 2.53], [15.6, 3.15, 2.53], [16.9, 0.55, 1.15]]
const delLado = (puntos, s) => puntos.map(([X, y, z]) => [enX(X), y, s * z])

const TOBERA = { x: enX(16.75), y: 0.06, z: 0.7, ancho: 0.82, alto: 0.6 }
const POSTCOMBUSTION = ambos((s) => {
  const { x, y } = TOBERA
  const z = s * TOBERA.z
  return [
    estela(x, y, z, 8, 0.85, '#b87ae8', 0.4, 0, 0.66, 4),
    estela(x, y, z, 5.5, 0.72, '#ff8a2a', 0.75, 1, 0.52, 4),
    estela(x, y, z, 2.6, 0.5, '#fff0c0', 0.9, 2, 0.36, 4),
    ...[0, 1, 2].map((i) => destelloMotor([x - 1.6 - i * 1.3, y, z], [0.3, 0.2 * (1 - i * 0.2), 0.26 * (1 - i * 0.2)], '#ffe6f6', 0.9, 3)),
  ]
}).flat()

// La cúpula de una pieza, sin arcos, calcada del perfil: el parabrisas muy
// tendido y la cola larga que se mete bajo el lomo. Bajo el marco no hay
// vidrio: abierta, se ve solo el casco de arriba.
const MARCO = 0.5

export const CAZA_DUKY = [
  forro(FUSELAJE, FURTIVO, { pinta: contador }),
  ...ambos(tomaDeAire),
  ...ambos((s) => placa(delLado(ALA, s), 0.16, FURTIVO)),
  ...ambos((s) => placa(delLado(ESTABILIZADOR, s), 0.1, FURTIVO)),
  ...ambos((s) => placa(delLado(DERIVA, s), 0.12, FURTIVO)),
  el([enX(4.6), 0.45, 0], [2.05, 1.0, 0.56], C.vidrioOro, { vidrio: true, dentro: 0.15, hueco: ([, y]) => y < MARCO }),
  ...cabezaPiloto(enX(4.8), 0.95, C.hule),
  ...ambos((s) => [
    tubo([[enX(15.9), TOBERA.ancho + 0.1, TOBERA.alto + 0.12, TOBERA.y, 5, s * TOBERA.z], [TOBERA.x, TOBERA.ancho, TOBERA.alto, TOBERA.y, 5, s * TOBERA.z]], C.grisOscuro),
    el([TOBERA.x + 0.02, TOBERA.y, s * TOBERA.z], [0.04, TOBERA.alto * 0.42, TOBERA.ancho * 0.42], C.oscuro, { flat: BOCA }),
    // La luz roja en la punta del ala.
    el([enX(13.3), -0.32, s * 6.8], [0.08, 0.05, 0.05], C.boca, { flat: '#ff2a1a', brilla: true }),
  ]).flat(),
  // La cola de castor, entre las toberas.
  placa([[enX(15.6), 0.08, -0.28], [enX(15.6), 0.08, 0.28], [enX(17.45), 0.08, 0.2], [enX(17.45), 0.08, -0.2]], 0.16, FURTIVO),
  ...POSTCOMBUSTION,
]

export { hueso, ambos, guante, disco, dukeBase, ojosAbiertos, ojosCerrados, destello, enEstrella }
