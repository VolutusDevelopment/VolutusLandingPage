// El F-22 de duky (pilotos/interiores.mjs), el caza experimental de la
// escena 11, con su tren de aterrizaje, sus armas y la cúpula que se abre.
// El hangar donde espera es el del Sitting Ducks (escena1/lugares.mjs).
//
// El caza va en sus metros (morro hacia +x, ruedas en `SUELO`) y duky, en
// unidades de pato a la escala `K` de la cabina.

import { el } from '../pilotos/tres.mjs'
import { RAMPAS as C, ambos, hueso } from '../pilotos/modelos.mjs'
import { CABINAS, aCaza, avion, cabinaCon, conCupula } from '../pilotos/interiores.mjs'

const CFG = { ...CABINAS.duky }
CFG.avion = avion(CFG)
export const K = CFG.k
export const enCabina = (p) => aCaza(CFG, p)

// Bajo las ruedas, en metros del caza: con ellas, mide 5,08 m hasta la punta de las derivas.
export const SUELO = -1.9

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

// Rueda de proa bajo la cabina y las dos principales bajo las tomas de aire.
const TREN = [
  hueso([5.25, -0.6, 0], [5.25, SUELO + 0.3, 0], 0.07, C.grisOscuro),
  el([5.25, SUELO + 0.3, 0], [0.3, 0.3, 0.12], C.negro),
  ...ambos((s) => [hueso([-1.75, -0.8, s * 1.35], [-1.75, SUELO + 0.42, s * 1.6], 0.09, C.grisOscuro), el([-1.75, SUELO + 0.42, s * 1.7], [0.42, 0.42, 0.16], C.negro)]).flat(),
]

// Bajo las alas, cargado hasta el último soporte: bombas, misiles de a tres
// y uno en cada punta. Cada uno cuelga de su soporte, a 40 % de la cuerda
// del ala en diamante, que cae hacia la punta.
const bajoElAla = (z) => -0.08 - ((Math.abs(z) - 1.2) * 0.32) / 5.58
const ALA = (z) => {
  const ataque = 2.0 - 0.964 * (z - 1.2)
  const fuga = -6.85 + 0.455 * (z - 1.2)
  return ataque - (ataque - fuga) * 0.4
}
const soporte = (x, z, alto) => hueso([x, bajoElAla(z), z], [x, bajoElAla(z) - alto, z], 0.05, C.grisOscuro)
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
  const estacion = (z, alto) => [ALA(z), z * s, alto, bajoElAla(z)]
  const [b1, m3, b2, m2] = [estacion(2.6, 0.25), estacion(3.6, 0.15), estacion(4.6, 0.25), estacion(5.5, 0.15)]
  const punta = [ALA(6.7) - 0.2, bajoElAla(6.7) - 0.1, 6.85 * s]
  return [
    ...[b1, m3, b2, m2].map(([x, z, alto]) => soporte(x, z, alto)),
    ...bomba(b1[0], b1[3] - 0.5, b1[1]),
    ...bomba(b2[0], b2[3] - 0.5, b2[1]),
    // Los de a tres: uno abajo y dos a los lados, en su riel.
    ...[[0, -0.42], [0.2, -0.24], [-0.2, -0.24]].flatMap(([dz, y]) => misil(m3[0], m3[3] + y, m3[1] + dz)),
    ...[[0.14, -0.3], [-0.14, -0.3]].flatMap(([dz, y]) => misil(m2[0], m2[3] + y, m2[1] + dz, 1.1)),
    ...misil(...punta, 1.0),
  ]
}).flat()

// El caza en sus metros, sin duky, que va aparte con sus patas: la cúpula
// abierta `cupula` grados, el cinturón tirado `cinturon` (suelto, si no),
// sin `motor`, con la tobera apagada (las estelas son las formas con luz
// propia), y sin `armas` cuando ya las gastó contra quien juega.
export const caza = ({ cupula = 0, cinturon: tira = 0, motor = false, tren = true, armas = true } = {}) => [
  ...cabinaCon(conCupula(CFG, cupula), []).filter((f) => motor || !f.luz),
  ...cinturon(tira),
  ...(armas ? ARMAS : []),
  ...(tren ? TREN : []),
]
