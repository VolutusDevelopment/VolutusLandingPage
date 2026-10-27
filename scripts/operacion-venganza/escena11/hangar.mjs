// Los lugares de la escena 11: el hangar del Sitting Ducks, bajo la cubierta,
// y el F-35 de duky (pilotos/interiores.mjs), el caza experimental, con su
// tren de aterrizaje y la cúpula que se abre. En metros, como el barco:
// proa hacia +x, arriba +y, estribor hacia +z.
//
// El caza va en sus metros (morro hacia +x, ruedas en `SUELO`) y duky, en
// unidades de pato a la escala `K` de la cabina.

import { el, placa } from '../pilotos/tres.mjs'
import { RAMPAS as C, ambos, hueso } from '../pilotos/modelos.mjs'
import { CABINAS, aCaza, avion, cabinaCon, conCupula } from '../pilotos/interiores.mjs'
import { MAR } from '../escena1/lugares.mjs'

// La cúpula del modelo mide 4 m y la cabina por dentro, 1,2: duky quedaba en
// la punta, con un hueco vacío detrás del asiento. Aquí la cúpula se acorta y
// la cabina se corre bajo ella, centrada; el arco va sobre el tablero.
const CUPULA = el([4.1, 0.85, 0], [1.15, 0.5, 0.48], C.vidrioOro, { vidrio: true })
const CFG = { ...CABINAS.duky, caza: CABINAS.duky.caza.map((f) => (f.vidrio ? CUPULA : f)), cabeza: [4.0, 0.8], cabecita: CABINAS.duky.cabeza, arcos: [4.75] }
CFG.avion = avion(CFG)
export const K = CFG.k
export const enCabina = (p) => aCaza(CFG, p)

// Bajo las ruedas, en metros del caza.
export const SUELO = -2.0

// Rueda de proa bajo la cabina y las dos principales bajo las alas.
const TREN = [
  hueso([5.6, -0.4, 0], [5.6, -1.7, 0], 0.07, C.grisOscuro),
  el([5.6, -1.7, 0], [0.3, 0.3, 0.12], C.negro),
  ...ambos((s) => [hueso([-1.0, -0.4, s * 1.4], [-1.0, -1.55, s * 1.7], 0.09, C.grisOscuro), el([-1.0, -1.55, s * 1.8], [0.45, 0.45, 0.17], C.negro)]).flat(),
]

// Bajo las alas, cargado hasta el último soporte: bombas, misiles de a tres
// y uno en cada punta. Cada uno cuelga de su soporte, a lo largo del ala.
const BAJO_EL_ALA = 0.05
const ALA = (z) => {
  const k = (z - 1.45) / 3.9
  const delante = 0.6 - 4.2 * k
  return delante - (delante + 4.6 + 0.3 * k) / 2.6
}
const soporte = (x, z, alto) => hueso([x, BAJO_EL_ALA, z], [x, BAJO_EL_ALA - alto, z], 0.05, C.grisOscuro)
const misil = (x, y, z, largo = 1.3) => [
  hueso([x - largo, y, z], [x + largo, y, z], 0.08, C.blanco),
  el([x + largo, y, z], [0.18, 0.08, 0.08], C.boca),
  ...[[0, 1], [0, -1], [1, 0], [-1, 0]].map(([dy, dz]) => hueso([x - largo + 0.15, y, z], [x - largo + 0.05, y + dy * 0.18, z + dz * 0.18], 0.025, C.gris)),
]
const bomba = (x, y, z) => [
  el([x, y, z], [1.0, 0.24, 0.24], C.oliva),
  el([x + 0.75, y, z], [0.12, 0.17, 0.17], C.oro),
  ...[[0, 1], [0, -1], [1, 0], [-1, 0]].map(([dy, dz]) => hueso([x - 0.85, y, z], [x - 1.15, y + dy * 0.28, z + dz * 0.28], 0.03, C.oliva)),
]
const ARMAS = ambos((s) => {
  const estacion = (z, alto) => [ALA(z), z * s, alto]
  const [b1, m3, b2, m2] = [estacion(2.2, 0.25), estacion(3.0, 0.15), estacion(3.8, 0.25), estacion(4.6, 0.15)]
  const punta = [ALA(5.2) - 0.2, BAJO_EL_ALA - 0.05, 5.4 * s]
  return [
    ...[b1, m3, b2, m2].map(([x, z, alto]) => soporte(x, z, alto)),
    ...bomba(b1[0], -0.45, b1[1]),
    ...bomba(b2[0], -0.45, b2[1]),
    // Los de a tres: uno abajo y dos a los lados, en su riel.
    ...[[0, -0.42], [0.2, -0.24], [-0.2, -0.24]].flatMap(([dz, y]) => misil(m3[0], y, m3[1] + dz)),
    ...[[0.14, -0.3], [-0.14, -0.3]].flatMap(([dz, y]) => misil(m2[0], y, m2[1] + dz, 1.1)),
    ...misil(...punta, 1.0),
  ]
}).flat()

// El caza en sus metros: la cúpula abierta `cupula` grados; sin `motor`, con
// la tobera apagada (las estelas son las formas con luz propia).
export const caza = ({ cupula = 0, motor = false, tren = true } = {}) => [
  ...cabinaCon(conCupula(CFG, cupula), []).filter((f) => motor || !f.luz),
  ...ARMAS,
  ...(tren ? TREN : []),
]

// ── El hangar ────────────────────────────────────────────────────────────

// Una nave de 50 × 24 m y 7,5 de alto, a 12 m sobre el mar. Al medio de
// estribor, el portalón del ascensor está abierto: se ve el atardecer.
export const PISO = 12
const ALTO = 7.5
const PARED = ['#a8b0b8', '#7e8894', '#5e6874', '#363e48']
const PISO_GRIS = ['#8a949e', '#646e7a', '#4a525c', '#2c3238']
const AMARILLO = '#f2c440'
const PORTALON = { x0: -7, x1: 7 }

const y = (v) => PISO + v
const conCostillas = ([x]) => (Math.abs(((x + 100) % 4) - 2) < 0.15 ? PARED[2] : null)

export const hangar = [
  MAR,
  placa([[-25, y(0), -12], [-25, y(0), 12], [25, y(0), 12], [25, y(0), -12]], 0.2, PISO_GRIS, {
    pinta: ([x, , z]) => (Math.abs(z - 5) < 0.08 || Math.abs(z + 9) < 0.08 ? AMARILLO : Math.hypot(((x + 100) % 3) - 1.5, ((z + 100) % 3) - 1.5) < 0.1 ? PISO_GRIS[3] : null),
  }),
  placa([[-25, y(ALTO), -12], [-25, y(ALTO), 12], [25, y(ALTO), 12], [25, y(ALTO), -12]], 0.2, PARED, { pinta: ([x, , z]) => (Math.abs(z) < 8 && Math.abs(((x + 100) % 6) - 3) < 0.25 ? '#fbfcf4' : null) }),
  placa([[-25, y(0), -12], [25, y(0), -12], [25, y(ALTO), -12], [-25, y(ALTO), -12]], 0.2, PARED, { pinta: conCostillas }),
  ...ambos((s) => placa([[s * 25, y(0), -12], [s * 25, y(0), 12], [s * 25, y(ALTO), 12], [s * 25, y(ALTO), -12]], 0.2, PARED)),
  // Estribor, con el portalón: a cada lado y encima.
  placa([[-25, y(0), 12], [PORTALON.x0, y(0), 12], [PORTALON.x0, y(ALTO), 12], [-25, y(ALTO), 12]], 0.2, PARED, { pinta: conCostillas }),
  placa([[PORTALON.x1, y(0), 12], [25, y(0), 12], [25, y(ALTO), 12], [PORTALON.x1, y(ALTO), 12]], 0.2, PARED, { pinta: conCostillas }),
  placa([[PORTALON.x0, y(6.5), 12], [PORTALON.x1, y(6.5), 12], [PORTALON.x1, y(ALTO), 12], [PORTALON.x0, y(ALTO), 12]], 0.2, PARED, { pinta: () => AMARILLO }),
]

// ── El andamio ───────────────────────────────────────────────────────────

// Amarillo, de cuatro patas, con la tarima en `en` (su centro, arriba).
const PINTURA = ['#fff09a', '#f8d020', '#c89a00', '#7a5c00']
export const andamio = ([x, alto, z], suelo) => [
  placa([[x - 0.35, alto, z - 0.35], [x - 0.35, alto, z + 0.35], [x + 0.35, alto, z + 0.35], [x + 0.35, alto, z - 0.35]], 0.06, PINTURA),
  ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => hueso([x + a * 0.32, suelo, z + b * 0.32], [x + a * 0.32, alto, z + b * 0.32], 0.035, PINTURA)),
]
