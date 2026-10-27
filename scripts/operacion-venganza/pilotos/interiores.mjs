// Las cabinas de los cuatro cazas por dentro: tablero, consolas, asiento y
// mandos, a escala dentro del modelo real del caza, que tiene abierta la
// cabina bajo la cúpula. Las usan las láminas de las cabinas (cabinas.mjs) y
// la escena 3, con el caza de duck-one en la cubierta del Sitting Ducks.
//
// El interior y el piloto van en unidades del piloto; aCaza() y escalar() los
// llevan a los metros del caza.

import { el, placa, transformar, tubo } from './tres.mjs'
import * as M from './modelos.mjs'
import { RAMPAS as C, hueso, disco, ambos } from './modelos.mjs'
import { cabina } from './cuerpos.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const esc = (a, k) => a.map((v) => v * k)
const uni = (a) => esc(a, 1 / Math.hypot(...a))

// ── Medidas comunes (unidades del piloto) ────────────────────────────────

const BASE = -1.3 // tapa de las consolas y arranque de la cúpula
export const PALANCA = [1.15, -0.55, 0.1]
export const ACELERADOR = [0.1, -0.5, -1.6]
const PANEL = { abajo: [1.6, -1.8], arriba: [2.0, -1.05] }
const TANGENTE = uni([PANEL.arriba[0] - PANEL.abajo[0], PANEL.arriba[1] - PANEL.abajo[1]])
export const NORMAL = [-TANGENTE[1], TANGENTE[0], 0]

const caja = (x0, x1, ancho, alto, yc, zc, rampa, o) => tubo([[x0, ancho, alto, yc, 8, zc], [x1, ancho, alto, yc, 8, zc]], rampa, o)
export const enPanel = (s, z) => [PANEL.abajo[0] + (PANEL.arriba[0] - PANEL.abajo[0]) * s, PANEL.abajo[1] + (PANEL.arriba[1] - PANEL.abajo[1]) * s, z]

// Panel inclinado hacia el piloto; pinta(s, z) da el color: s va de 0 (abajo) a 1 (arriba).
const panelInclinado = (z0, z1, pinta) =>
  placa([[PANEL.abajo[0], PANEL.abajo[1], z0], [PANEL.abajo[0], PANEL.abajo[1], z1], [PANEL.arriba[0], PANEL.arriba[1], z1], [PANEL.arriba[0], PANEL.arriba[1], z0]], 0.05, C.oscuro, { pinta: ([, y, z]) => pinta((y - PANEL.abajo[1]) / (PANEL.arriba[1] - PANEL.abajo[1]), z) })

// Reloj redondo con su aguja, apoyado en el panel.
const reloj = (s, z, r, ang) => {
  const c = sum(enPanel(s, z), esc(NORMAL, 0.04))
  return disco(c, NORMAL, r, 0.03, C.nube, {
    pinta: (p) => {
      const u = p[2] - c[2]
      const w = (p[0] - c[0]) * TANGENTE[0] + (p[1] - c[1]) * TANGENTE[1]
      if (Math.hypot(u, w) > r * 0.88) return '#16181c'
      const a = u * Math.cos(ang) + w * Math.sin(ang)
      const b = Math.abs(-u * Math.sin(ang) + w * Math.cos(ang))
      return a > -0.02 && a < r * 0.8 && b < 0.025 ? '#d8282c' : '#f4f4ec'
    },
  })
}

// Pantallas de un tablero moderno: bordes oscuros, divisiones y un horizonte artificial al medio.
const pantallas = (z0, z1, { borde, fondo, linea, columnas }) => (s, z) => {
  const u = (z - z0) / (z1 - z0)
  const k = Math.min(columnas - 1, Math.floor(u * columnas))
  const uu = u * columnas - k
  if (u < 0 || u > 1 || s < 0.06 || s > 0.94 || uu < 0.03 || uu > 0.97) return borde
  if (columnas === 3 && k === 1) return s > 0.5 ? (Math.abs(s - 0.5) < 0.03 ? '#ffffff' : '#3d7be0') : '#7a5428'
  return Math.floor(s * 9) % 2 === 0 ? fondo : Math.floor(uu * 9) % 3 === 0 ? linea : '#14281f'
}

const mira = (c, n, r, marco, cristal) => [disco(c, n, r + 0.05, 0.03, marco), disco(sum(c, esc(n, 0.05)), n, r, 0.02, cristal)]

// ── Piezas comunes de cabina ─────────────────────────────────────────────

const asiento = (x, rampa) => [
  placa([[x, -2.3, -0.9], [x, -2.3, 0.9], [x, 0.5, 0.7], [x, 0.5, -0.7]], 0.3, rampa),
  el([x + 0.05, 0.95, 0], [0.22, 0.5, 0.55], rampa),
  placa([[x, -1.8, -0.85], [x + 1.9, -1.8, -0.85], [x + 1.9, -1.8, 0.85], [x, -1.8, 0.85]], 0.25, rampa),
  el([0.85, -1.7, 0], [0.06, 0.12, 0.25], C.rayas),
]

const piernas = (cadera, rampa) =>
  ambos((s) => [
    hueso([0.05, cadera, s * 0.42], [0.95, cadera - 0.05, s * 0.45], 0.1, rampa, { brilla: true }),
    hueso([0.95, cadera - 0.05, s * 0.45], [1.25, -2.4, s * 0.45], 0.09, rampa, { brilla: true }),
    el([1.4, -2.55, s * 0.45], [0.3, 0.07, 0.2], rampa, { brilla: true }),
  ]).flat()

// Mandos que se mueven con la mano: la palanca al centro y el acelerador a la izquierda.
const mandos = (palanca, acelerador) => [
  hueso([1.15, -1.5, 0.05], palanca, 0.06, C.oscuro),
  el(palanca, [0.1, 0.1, 0.1], C.oscuro),
  el(sum(palanca, [0.07, 0.03, 0.04]), [0.03, 0.03, 0.03], C.boca, { flat: '#d8282c' }),
  hueso([0.45, BASE, -1.72], acelerador, 0.05, C.oscuro),
  el(acelerador, [0.09, 0.09, 0.09], C.oscuro),
]

// ── Las cuatro cabinas ───────────────────────────────────────────────────

export const CABINAS = {
  'duck-one': {
    caza: M.CAZA_DUCK_ONE, cabeza: [5.0, 0.95], cabezaU: [0.15, 0.6], k: 0.28, alto: 1.1, arcos: [6.0], frente: 1.58,
    ancho: 2.4, marco: C.oscuro,
    consola: C.grisOscuro, tablero: C.grisOscuro, asiento: C.asiento, xAsiento: -1.05, pata: C.naranja, cadera: -1.45,
    panel: [-1.3, 1.3, { borde: '#0a0e14', fondo: '#1f4b3a', linea: '#7dffa0', columnas: 3 }],
    // Dos retrovisores en el arco delantero y una medalla colgando de él.
    delante: () => [
      ...ambos((s) => mira([3.7, 1.15, s * 0.75], uni([-0.9, -0.3, -s * 0.2]), 0.2, C.oscuro, C.vidrio)).flat(),
      hueso([3.7, 1.4, 0.3], [3.7, 0.9, 0.3], 0.02, C.blanco),
      el([3.7, 0.8, 0.3], [0.12, 0.12, 0.04], C.oro),
    ],
  },
  duke: {
    caza: M.CAZA_DUKE, cabeza: [5.0, 0.95], cabezaU: [0.15, 0.6], k: 0.28, alto: 1.1, arcos: [6.0], frente: 1.58,
    ancho: 2.4, marco: C.oro,
    consola: C.rosa, tablero: C.perla, asiento: C.rosa, xAsiento: -1.05, pata: C.pico, cadera: -1.45,
    panel: [-1.3, 1.3, { borde: '#7a2848', fondo: '#d8629a', linea: '#fff0f6', columnas: 3 }],
    // Un espejo de belleza con bombillas, de lado sobre el tablero, para mirarse.
    delante: () => [
      ...mira([3.7, 0.85, 0.75], uni([-1, -0.2, -0.35]), 0.36, C.oro, C.vidrio),
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => el([3.67, 0.85 + 0.44 * Math.sin((i / 8) * Math.PI * 2), 0.75 + 0.44 * Math.cos((i / 8) * Math.PI * 2)], [0.035, 0.035, 0.035], C.blanco, { flat: '#fff8d0', brilla: true })),
    ],
  },
  'moby-duck': {
    caza: M.CAZA_MOBY, cabeza: [4.9, 0.95], cabecita: [5.2, 0.95], izquierda: [0.3, 0.95, -1.5], cabezaU: [0.32, 0.28], k: 0.25, alto: 1.1, arcos: [5.6, 4.1], frente: 1.9,
    ancho: 2.8, marco: C.negro,
    consola: C.negro, tablero: C.negro, asiento: C.negro, xAsiento: -1.05, pata: C.naranja, cadera: -1.75,
    panel: [-1.9, 1.9, { borde: '#0a0a0c', fondo: '#26262c', linea: '#d8282c', columnas: 2 }],
    // Relojes de aguja y un cenicero con colillas. Su cámara izquierda va más atrás: el humo del puro sale por ese lado.
    delante: () => [
      ...[-1.55, -1.05, -0.55].flatMap((z, i) => [reloj(0.28, z, 0.2, 0.6 + i), reloj(0.72, z, 0.2, 2 + i)]),
      ...[0.55, 1.05, 1.55].flatMap((z, i) => [reloj(0.28, z, 0.2, 1.2 + i), reloj(0.72, z, 0.2, 3.4 + i)]),
      el([2.1, -0.95, -1.5], [0.28, 0.05, 0.22], C.negro),
      hueso([2.0, -0.9, -1.55], [2.2, -0.85, -1.4], 0.04, C.puro),
      hueso([2.15, -0.9, -1.35], [2.0, -0.85, -1.5], 0.04, C.puro),
      el([2.1, -0.82, -1.45], [0.06, 0.06, 0.06], C.naranja, { flat: '#ff7a2a', brilla: true }),
    ],
  },
  duky: {
    caza: M.CAZA_DUKY, cabeza: [4.3, 0.8], cabezaU: [0.35, 0.2], k: 0.28, alto: 0.88, arcos: [5.3], frente: 1.55,
    ancho: 2.4, marco: C.oscuro,
    consola: C.oscuro, tablero: C.oscuro, asiento: null, xAsiento: -1.35, pata: C.naranja, cadera: -1.8,
    panel: [-1.35, 1.35, { borde: '#0a0e14', fondo: '#1a2a4a', linea: '#f8cc1c', columnas: 1 }],
    // Una sola pantalla panorámica: el F-35 no lleva visor, lo proyecta el casco.
    // Su asiento eyectable va aparte: fuera de la cabina, Duky no lo lleva.
    delante: () => M.DUKY_ASIENTO,
  },
}

// Interior de la cabina, en unidades del piloto: consolas, tablero, asiento y
// piernas, si tiene de qué color (`pata`).
const interior = (cfg) => {
  const a = cfg.ancho
  const [z0, z1, estilo] = cfg.panel
  return [
    ...ambos((s) => caja(-1.0, 1.9, 0.45, BASE + 2.7, (BASE - 2.7) / 2, s * (a - 0.23), cfg.consola)),
    caja(1.6, 3.0, 2 * (a - 0.46), 1.2, -2.4, 0, cfg.tablero),
    caja(2.0, 3.0, 2 * (a - 0.46), 0.8, -1.4, 0, cfg.tablero),
    placa([[2.0, -1.05, -a + 0.46], [3.0, -1.0, -a + 0.46], [3.0, -1.0, a - 0.46], [2.0, -1.05, a - 0.46]], 0.1, cfg.tablero),
    panelInclinado(z0, z1, pantallas(z0, z1, estilo)),
    ...(cfg.asiento ? asiento(cfg.xAsiento, cfg.asiento) : []),
    ...(cfg.pata ? piernas(cfg.cadera, cfg.pata) : []),
    ...cfg.delante(),
  ]
}

// Del piloto en unidades a metros del caza: escala k y origen en la cabina.
const origen = (cfg) => [cfg.cabeza[0] - cfg.cabezaU[0] * cfg.k, cfg.alto - cfg.cabezaU[1] * cfg.k, 0]
export const aCaza = (cfg, p) => sum(origen(cfg), esc(p, cfg.k))
const escalar = (cfg, formas) => {
  const o = origen(cfg)
  const ida = (p) => aCaza(cfg, p)
  const vuelta = (p) => esc(p.map((v, i) => v - o[i]), 1 / cfg.k)
  return formas.map((f) => {
    const g =
      f.k === 'e'
        ? { ...f, c: ida(f.c), r: esc(f.r, cfg.k) }
        : { ...f, centro: ida(f.centro), radio: f.radio * cfg.k, tris: f.tris.map((tri) => ({ ...tri, a: ida(tri.a), b: ida(tri.b), c: ida(tri.c) })) }
    if (f.pinta) g.pinta = (p, n) => f.pinta(vuelta(p), n)
    return g
  })
}

// El caza sin la cabecita de piloto que traía (cabecita, si no está donde va el piloto), con los arcos de su cúpula.
export const avion = (cfg) => {
  const cupula = cfg.caza.find((f) => f.vidrio)
  const [hx, hy] = cfg.cabecita ?? cfg.cabeza
  const arcoDe = (x) => {
    const s = Math.sqrt(Math.max(0, 1 - ((x - cupula.c[0]) / cupula.r[0]) ** 2))
    const p = (t) => [x, cupula.c[1] + cupula.r[1] * s * Math.sin(t), cupula.r[2] * s * Math.cos(t)]
    return Array.from({ length: 12 }, (_, i) => hueso(p((i * Math.PI) / 12), p(((i + 1) * Math.PI) / 12), 0.035, cfg.marco))
  }
  // La cabina es una abertura en el fuselaje, del tamaño de la cúpula vista desde arriba.
  const hueco = ([x, y, z]) => y > cupula.c[1] - 0.25 && ((x - cupula.c[0]) / cupula.r[0]) ** 2 + (z / cupula.r[2]) ** 2 < 0.92
  const sinCabecita = cfg.caza.filter((f) => f.vidrio || f.k !== 'e' || Math.hypot(f.c[0] - hx, f.c[1] - hy) > 0.5 || Math.abs(f.c[2]) > 0.3)
  return [...sinCabecita.map((f) => (f.k === 'm' && !f.luz ? { ...f, hueco } : f)), ...cfg.arcos.flatMap(arcoDe)]
}

// La cúpula se abre de la bisagra de atrás, con sus arcos, `abre` grados.
export const conCupula = (cfg, abre) => {
  if (!abre) return cfg
  const cupula = cfg.caza.find((f) => f.vidrio)
  const arcos = cfg.avion.slice(-cfg.arcos.length * 12)
  const sube = transformar([0, 0, abre], [cupula.c[0] - cupula.r[0], cupula.c[1], 0])
  return { ...cfg, avion: [...cfg.avion.filter((f) => f !== cupula && !arcos.includes(f)), ...sube.formas([cupula, ...arcos])] }
}

// El caza con el piloto sentado y los mandos donde los deje su mano.
export const cabinaCon = (cfg, piloto, palanca = PALANCA, acelerador = ACELERADOR) => [...cfg.avion, ...escalar(cfg, [...interior(cfg), ...piloto.filter((f) => !f.pata), ...mandos(palanca, acelerador)])]

// Las poses de cuerpos.mjs dejan las manos en reposo: en la cabina, en la palanca y el acelerador.
export const enCabina = (pose) => {
  cabina.reposo = (s) => (s > 0 ? PALANCA : ACELERADOR)
  const figura = pose()
  cabina.reposo = null
  return figura
}
