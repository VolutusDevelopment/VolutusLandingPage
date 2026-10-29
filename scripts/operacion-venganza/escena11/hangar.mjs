// El F-35 de duky (pilotos/interiores.mjs), el caza experimental de la
// escena 11, con su tren de aterrizaje, sus armas y la cúpula que se abre.
// El hangar donde espera es el del Sitting Ducks (escena1/lugares.mjs).
//
// El caza va en sus metros (morro hacia +x, ruedas en `SUELO`) y duky, en
// unidades de pato a la escala `K` de la cabina.

import { el } from '../pilotos/tres.mjs'
import { RAMPAS as C, ambos, hueso } from '../pilotos/modelos.mjs'
import { CABINAS, aCaza, avion, cabinaCon, conCupula } from '../pilotos/interiores.mjs'

// La cúpula del modelo mide 4 m y la cabina por dentro, 1,2: duky quedaba en
// la punta, con un hueco vacío detrás del asiento. Aquí la cúpula, larga y
// baja como la de un F-35, va sobre la cabina, con su único arco sobre la
// cabeza de duky. La cabina es una bañera cerrada hasta media cúpula, con un
// carenado tras el asiento (`lomo`): desde dentro no se ve el caza por fuera.
// El vidrio es polarizado: por fuera, dorado; por dentro apenas tiñe.
const CUPULA = el([3.95, 0.82, 0], [1.6, 0.45, 0.5], C.vidrioOro, { vidrio: true, dentro: 0.15 })
const CFG = { ...CABINAS.duky, caza: CABINAS.duky.caza.map((f) => (f.vidrio ? CUPULA : f)), cabeza: [4.0, 0.8], cabecita: CABINAS.duky.cabeza, arcos: [3.95], lomo: 3.3 }
CFG.avion = avion(CFG)
export const K = CFG.k
export const enCabina = (p) => aCaza(CFG, p)

// Bajo las ruedas, en metros del caza.
export const SUELO = -2.0

// El cinturón del asiento: una correa a cada lado, del respaldo a la hebilla,
// en unidades de la cabina. Con `tira`, de 0 a 1, alguien acerca las puntas
// por delante; sueltas (0), cuelgan a los lados del asiento. No le dan la
// vuelta a duky, que es medio gordito: a él nunca le cierra.
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const HOMBRO = (s) => [-1.25, 0.65, s * 0.6]
const COSTADO = (s) => [0.5, -0.45, s * 1.05]
const SUELTA = (s) => [-0.2, -1.3, s * 1.1]
const CASI = (s) => [1.45, -0.85, s * 0.42]
export const puntaDelCinturon = (s, tira) => enCabina(lerp(SUELTA(s), CASI(s), tira))
const cinturon = (tira) =>
  [1, -1].flatMap((s) => {
    const [hombro, costado, punta] = [enCabina(HOMBRO(s)), enCabina(COSTADO(s)), puntaDelCinturon(s, tira)]
    return [hueso(hombro, costado, 0.06 * K, C.grisOscuro), hueso(costado, punta, 0.06 * K, C.grisOscuro), el(punta, [0.03, 0.035, 0.035], C.gris)]
  })

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

// El caza en sus metros, sin duky, que va aparte con sus patas: la cúpula
// abierta `cupula` grados, el cinturón tirado `cinturon` (suelto, si no) y
// sin `motor`, con la tobera apagada (las estelas son las formas con luz propia).
export const caza = ({ cupula = 0, cinturon: tira = 0, motor = false, tren = true } = {}) => [
  ...cabinaCon(conCupula(CFG, cupula), []).filter((f) => motor || !f.luz),
  ...cinturon(tira),
  ...ARMAS,
  ...(tren ? TREN : []),
]
