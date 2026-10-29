// Las cabinas de los cuatro cazas por dentro: tablero, consolas, asiento y
// mandos, a escala dentro del modelo real del caza, que tiene abierta la
// cabina bajo la cúpula. Las usan las láminas de las cabinas (cabinas.mjs) y
// la escena 3, con el caza de duck-one en la cubierta del Sitting Ducks.
//
// El interior y el piloto van en unidades del piloto; aCaza() y escalar() los
// llevan a los metros del caza.

import { el, placa, transformar, tubo } from './tres.mjs'
import * as M from './modelos.mjs'
import { RAMPAS as C, hueso, disco, ambos, enEstrella } from './modelos.mjs'
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

// El tablero del Hornet de duke: arriba, las dos pantallas DDI con sus
// botones en el bisel y, al medio, el teclado del UFC; abajo al centro, la
// pantalla MPCD, con un corazón. Todo en rosa sobre un tablero perla.
const ROSA_TABLERO = { bisel: '#7a2848', fondo: '#d8629a', linea: '#fff0f6', tablero: '#f4e6ee' }
const corazon = (u, v) => (u * u + v * v - 1) ** 3 - u * u * v ** 3 < 0
const tableroHornet = (s, z) => {
  const { bisel, fondo, linea, tablero } = ROSA_TABLERO
  for (const zc of [-0.85, 0.85]) {
    const [du, ds] = [Math.abs(z - zc), Math.abs(s - 0.64)]
    if (du > 0.4 || ds > 0.32) continue
    if (du > 0.32 || ds > 0.25) return Math.floor((z + s) * 14) % 3 === 0 ? linea : bisel
    return Math.floor(s * 12) % 3 === 0 ? linea : fondo
  }
  if (Math.abs(z) < 0.36 && s > 0.04 && s < 0.56) return Math.abs(z) > 0.3 || s < 0.09 || s > 0.51 ? bisel : corazon(z / 0.2, (s - 0.3) / 0.17) ? linea : fondo
  if (Math.abs(z) < 0.3 && s > 0.64 && s < 0.96) return (Math.floor(z * 12) + Math.floor(s * 14)) % 2 ? linea : bisel
  return tablero
}
const VIDRIO_ROSA = ['#ffe0ee', '#f8b0d0', '#d880aa', '#a05078']

// La pantalla panorámica del F-35 de duky, de `-ANCHO_F35` a `ANCHO_F35`: dos
// mitades de vidrio negro con el bisel gris. En la izquierda, el radar en
// anillos verdes con su barrido; en la derecha, el caza visto desde arriba en
// cian, con sus sistemas en cuadros; arriba, una franja de avisos.
const ANCHO_F35 = 1.3
const tableroF35 = (s, z) => {
  if (Math.abs(z) > ANCHO_F35 - 0.06 || s < 0.08 || s > 0.94 || Math.abs(z) < 0.04) return '#3a424c'
  if (s > 0.84) return Math.floor((z + 2) * 6) % 3 === 0 ? '#f8cc1c' : Math.floor((z + 2) * 6) % 3 === 1 ? '#c84ae0' : '#0a0e14'
  if (z < 0) {
    const r = Math.hypot((z + 0.65) / 0.55, (s - 0.45) / 0.36)
    if (r < 1) return Math.abs(((r * 3) % 1) - 0.5) < 0.12 || Math.abs(z + 0.65 - (s - 0.45) * 0.8) < 0.03 ? '#3aff7a' : '#0a1e14'
    return Math.floor(s * 10) % 2 && Math.abs(z + 0.65) > 0.6 ? '#2a9a5a' : '#0a1e14'
  }
  const [u, v] = [(z - 0.65) / 0.3, (s - 0.45) / 0.3]
  if (Math.abs(u) < 0.12 || (Math.abs(v + 0.1) < 0.12 && Math.abs(u) < 0.9) || (Math.abs(v - 0.7) < 0.08 && Math.abs(u) < 0.4)) return '#5ae0ff'
  return Math.abs(z - 0.65) > 0.45 && Math.floor(s * 8) % 2 ? '#1a5a8a' : '#0a1420'
}

// Los mandos del F-35: la palanca corta sobre la consola derecha y el
// acelerador sobre la izquierda, los dos con empuñadura roja. Entre las
// piernas, el pedestal con su pantallita.
const mandosF35 = () => [
  ...ambos((s) => [hueso([0.5, BASE, s * 2.15], [0.62, BASE + 0.4, s * 2.15], 0.05, C.oscuro), el([0.64, BASE + 0.52, s * 2.15], [0.13, 0.16, 0.11], C.boca)]).flat(),
  caja(1.15, 1.6, 0.4, 1.0, -2.2, 0, C.oscuro, { pinta: ([x, y]) => (x < 1.2 && y > -2.0 && y < -1.8 ? '#5ae0ff' : null) }),
]

// ── Piezas comunes de cabina ─────────────────────────────────────────────

// El asiento eyectable de cada uno, macizo como el de Duky: respaldo ancho,
// apoyacabezas, cojín con sus laterales y la manilla amarilla y negra.
// cabecera(v, u) pinta la cara del apoyacabezas desde su centro (v hacia
// arriba, u de lado); remate va encima.
const asiento = (x, { rampa, cabecera, remate = [] }) => [
  placa([[x, -2.3, -1.0], [x, -2.3, 1.0], [x, 0.7, 1.0], [x, 0.7, -1.0]], 0.5, rampa),
  el([x + 0.05, 1.0, 0], [0.28, 0.45, 0.8], rampa, { pinta: cabecera && (([px, y, z]) => (px > x + 0.1 ? cabecera(y - 1.0, z) : null)) }),
  placa([[x, -1.8, -1.0], [x + 1.9, -1.8, -1.0], [x + 1.9, -1.8, 1.0], [x, -1.8, 1.0]], 0.4, rampa),
  ...ambos((s) => placa([[x, -1.7, s * 0.95], [x + 1.7, -1.7, s * 0.95], [x + 1.5, -1.25, s * 0.95], [x, -0.9, s * 0.95]], 0.22, rampa)),
  el([0.85, -1.7, 0], [0.06, 0.12, 0.25], C.rayas),
  ...remate.map(([c, r, rampa]) => el([x + c[0], c[1], c[2]], r, rampa)),
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
    caza: M.CAZA_DUCK_ONE, cabeza: [5.0, 0.95], cabezaU: [0.15, 0.6], k: 0.28, alto: 1.1, arcos: [6.0, 4.5], lomo: 4.5, frente: 1.58,
    ancho: 2.4, marco: C.oscuro,
    consola: C.grisOscuro, tablero: C.grisOscuro, xAsiento: -1.05, pata: C.naranja, cadera: -1.45,
    panel: [-1.3, 1.3, { borde: '#0a0e14', fondo: '#1f4b3a', linea: '#7dffa0', columnas: 3 }],
    // Su asiento, verde oliva como el uniforme, con la estrella del líder.
    asiento: { rampa: C.oliva, cabecera: (v, u) => (enEstrella(u, v, 0.32) ? C.oro : null) },
    // Dos retrovisores en el arco delantero y una medalla colgando de él.
    delante: () => [
      ...ambos((s) => mira([3.7, 1.15, s * 0.75], uni([-0.9, -0.3, -s * 0.2]), 0.2, C.oscuro, C.vidrio)).flat(),
      hueso([3.7, 1.4, 0.3], [3.7, 0.9, 0.3], 0.02, C.blanco),
      el([3.7, 0.8, 0.3], [0.12, 0.12, 0.04], C.oro),
    ],
  },
  duke: {
    caza: M.CAZA_DUKE, cabeza: [5.0, 0.95], cabezaU: [0.15, 0.6], k: 0.28, alto: 1.1, arcos: [5.75, 4.5], lomo: 4.5, frente: 1.58,
    ancho: 2.4, marco: C.rosa,
    consola: C.rosa, tablero: C.perla, xAsiento: -1.05, pata: C.pico, cadera: -1.45,
    panel: [-1.3, 1.3, tableroHornet],
    // Su asiento es un trono: capitoné rosa con ribete de oro y una corona encima.
    asiento: {
      rampa: C.rosa,
      cabecera: (v, u) => (Math.hypot(v / 0.45, u / 0.8) > 0.8 ? C.oro : Math.hypot(((v + 0.6) % 0.24) - 0.12, ((u + 0.6) % 0.24) - 0.12) < 0.03 ? C.blanco : null),
      remate: [[[0.05, 1.5, 0], [0.14, 0.08, 0.34], C.oro], ...[-0.25, 0, 0.25].map((z) => [[0.05, 1.63, z], [0.06, 0.11, 0.06], C.oro]), [[0.14, 1.5, 0], [0.07, 0.06, 0.07], C.boca]],
    },
    // El HUD con el cristal rosa y, colgado del arco del parabrisas, un
    // espejo de belleza con bombillas, de lado sobre el tablero, para mirarse.
    delante: () => [
      placa([[2.3, -1.0, -0.34], [2.3, -1.0, 0.34], [2.15, -0.4, 0.34], [2.15, -0.4, -0.34]], 0.02, VIDRIO_ROSA, { vidrio: true }),
      ...ambos((s) => hueso([2.3, -1.0, s * 0.37], [2.15, -0.4, s * 0.37], 0.03, C.oro)),
      ...mira([3.7, 0.4, 0.55], uni([-1, -0.2, -0.35]), 0.28, C.oro, C.vidrio),
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => el([3.67, 0.4 + 0.36 * Math.sin((i / 8) * Math.PI * 2), 0.55 + 0.36 * Math.cos((i / 8) * Math.PI * 2)], [0.035, 0.035, 0.035], C.blanco, { flat: '#fff8d0', brilla: true })),
    ],
  },
  'moby-duck': {
    caza: M.CAZA_MOBY, cabeza: [4.9, 0.95], cabecita: [5.2, 0.95], izquierda: [0.3, 0.95, -1.5], cabezaU: [0.32, 0.28], k: 0.25, alto: 1.1, arcos: [5.6, 4.1], frente: 1.9,
    ancho: 2.8, marco: C.negro,
    consola: C.negro, tablero: C.negro, xAsiento: -1.05, pata: C.naranja, cadera: -1.75,
    panel: [-1.9, 1.9, { borde: '#0a0a0c', fondo: '#26262c', linea: '#d8282c', columnas: 2 }],
    // Su asiento de cuero gastado, con el apoyacabezas parchado con cinta en cruz.
    asiento: { rampa: C.cuero, cabecera: (v, u) => (Math.abs(Math.abs(v) - Math.abs(u) * 0.8) < 0.07 ? C.gris : null) },
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
    // Una sola pantalla panorámica: el F-35 no lleva visor, lo proyecta el
    // casco. Su asiento eyectable va aparte: fuera de la cabina, Duky no lo
    // lleva. La cúpula se abre hacia arriba desde adelante.
    panel: [-ANCHO_F35, ANCHO_F35, tableroF35],
    mandos: mandosF35,
    bisagra: 'delante',
    delante: () => M.DUKY_ASIENTO,
  },
}

// Interior de la cabina, en unidades del piloto: consolas, tablero, asiento y
// lo que lleve delante.
const interior = (cfg) => {
  const a = cfg.ancho
  const [z0, z1, estilo] = cfg.panel
  return [
    ...ambos((s) => caja(-1.0, 1.9, 0.45, BASE + 2.7, (BASE - 2.7) / 2, s * (a - 0.23), cfg.consola)),
    caja(1.6, 3.0, 2 * (a - 0.46), 1.2, -2.4, 0, cfg.tablero),
    caja(2.0, 3.0, 2 * (a - 0.46), 0.8, -1.4, 0, cfg.tablero),
    placa([[2.0, -1.05, -a + 0.46], [3.0, -1.0, -a + 0.46], [3.0, -1.0, a - 0.46], [2.0, -1.05, a - 0.46]], 0.1, cfg.tablero),
    panelInclinado(z0, z1, typeof estilo === 'function' ? estilo : pantallas(z0, z1, estilo)),
    ...(cfg.asiento ? asiento(cfg.xAsiento, cfg.asiento) : []),
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
  // La cúpula del F-15EX es de dos plazas y en estos cazas va uno solo (la del
  // Hornet, de una, se cierra igual). Como en
  // el F-35, la cabina es una bañera del color del caza por fuera y de las
  // consolas por dentro, con el borde a media cúpula; tras el asiento, desde el
  // arco `lomo`, el vidrio cubre un carenado a la altura del apoyacabezas.
  const cerrada = () => {
    const [cx, cy] = cupula.c
    const ancho = (x) => Math.sqrt(Math.max(0, 1 - ((x - cx) / cupula.r[0]) ** 2))
    const tramo = (x0, x1, seccion) => [0, 0.2, 0.5, 0.8, 1].map((t) => seccion(x0 + (x1 - x0) * t, ancho(x0 + (x1 - x0) * t)))
    const adentro = (y0) => ([, y, z], n) => (n[0] > 0.7 || n[1] * (y - y0) + n[2] * z < 0 ? cfg.consola : null)
    const yBanera = cy - 0.4
    const banera = tubo(tramo(cx + cupula.r[0], cfg.lomo, (x, s) => [x, 2.1 * cupula.r[2] * s, 1.5, yBanera, 4]), cfg.caza[0].rampa, { pinta: adentro(yBanera), hueco: ([, y]) => y > cy })
    const lomo = tubo(tramo(cfg.lomo, cx - cupula.r[0], (x, s) => [x, 1.9 * cupula.r[2] * s, 1.55 * cupula.r[1] * s, cy - 0.225 * cupula.r[1] * s]), cfg.caza[0].rampa, { pinta: (p, n) => (n[0] > 0.7 ? cfg.consola : null) })
    return [banera, lomo]
  }
  return [...sinCabecita.map((f) => (f.k === 'm' && !f.luz ? { ...f, hueco } : f)), ...(cfg.lomo ? cerrada() : []), ...cfg.arcos.flatMap(arcoDe)]
}

// La cúpula se abre `abre` grados con sus arcos, de la bisagra de atrás o,
// si el caza la tiene ahí (`bisagra`), de la de adelante.
export const conCupula = (cfg, abre) => {
  if (!abre) return cfg
  const cupula = cfg.caza.find((f) => f.vidrio)
  const arcos = cfg.avion.slice(-cfg.arcos.length * 12)
  const lado = cfg.bisagra === 'delante' ? -1 : 1
  const sube = transformar([0, 0, lado * abre], [cupula.c[0] - lado * cupula.r[0], cupula.c[1], 0])
  return { ...cfg, avion: [...cfg.avion.filter((f) => f !== cupula && !arcos.includes(f)), ...sube.formas([cupula, ...arcos])] }
}

// El caza con el piloto sentado y los mandos donde los deje su mano.
// El caza y el piloto son modelos aparte: las piernas que llegan a los
// pedales (`pata`, su color) son del piloto, en vez de las suyas (las formas
// `pata`), y van solo si hay uno sentado. Vacía, la cabina no tiene piernas.
export const cabinaCon = (cfg, piloto, palanca = PALANCA, acelerador = ACELERADOR) => {
  const sentado = cfg.pata && piloto.some((f) => f.pata)
  return [...cfg.avion, ...escalar(cfg, [...interior(cfg), ...piloto.filter((f) => !f.pata), ...(sentado ? piernas(cfg.cadera, cfg.pata) : []), ...(cfg.mandos ?? mandos)(palanca, acelerador)])]
}

// Las poses de cuerpos.mjs dejan las manos en reposo: en la cabina, en la palanca y el acelerador.
export const enCabina = (pose) => {
  cabina.reposo = (s) => (s > 0 ? PALANCA : ACELERADOR)
  const figura = pose()
  cabina.reposo = null
  return figura
}
