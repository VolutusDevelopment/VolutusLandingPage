// duck-one y su gorro cuartelero (lámina v16, gorro.mjs): saluda con tanto
// brío que se lo bota de un manotazo, se queda en saludo mientras cae, se
// agacha a recogerlo y se lo vuelve a poner. Debajo esconde un rizo de
// resorte. `recoge(u)` da sus formas en el instante u ∈ [0, 1) de los
// `CUADROS` de la escena; sin `saluda`, el gorro salta solo.

import { rotacion, transformar } from './tres.mjs'
import * as M from './modelos.mjs'
import { GORRO_PUESTO as PUESTO, ponerGorro as gorro, rizo } from './modelos.mjs'
import { figura, pDuckOne } from './cuerpos.mjs'

export const CUADROS = 24 // 150 ms cada uno, el ritmo de los gestos

const sum = (a, b) => a.map((v, i) => v + b[i])
const res = (a, b) => a.map((v, i) => v - b[i])
const esc = (a, k) => a.map((v) => v * k)
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const suave = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k))
const tramo = (t, a, b) => suave((t - a) / (b - a))
// Curva de Bézier de a a c, tirada hacia b.
const bezier = (a, b, c, k) => sum(sum(esc(a, (1 - k) ** 2), esc(b, 2 * k * (1 - k))), esc(c, k * k))
const aplicar = (R, v) => R.map((f) => f[0] * v[0] + f[1] * v[1] + f[2] * v[2])
const trasp = (R) => [0, 1, 2].map((j) => [R[0][j], R[1][j], R[2][j]])

// Resorte amortiguado: sale de 0, se pasa, vuelve y se asienta en 1.
const rebote = (τ) => (τ <= 0 ? 0 : 1 - Math.exp(-0.35 * τ) * Math.cos((Math.PI * τ) / 2))

// ── El cuerpo gira en la cadera ──────────────────────────────────────────

const cuerpo = ({ inclina, agacha }) => transformar([0, 0, inclina], pDuckOne.pivote, [0, -agacha, 0])
const desdeMundo = ({ inclina, agacha }, p) => sum(aplicar(trasp(rotacion([0, 0, inclina])), res(sum(p, [0, agacha, 0]), pDuckOne.pivote)), pDuckOne.pivote)

// ── El gorro ─────────────────────────────────────────────────────────────

// Una pose del gorro es su centro y su giro [x, 0, z]: con y = 0, pasar del
// cuerpo al mundo solo suma la inclinación al giro en z.
const alMundo = (pose, { c, rot }) => ({ c: cuerpo(pose).punto(c), rot: [rot[0], 0, rot[2] + pose.inclina] })

const EN_EL_SUELO = { c: [0.85, -2.125, -1.0], rot: [0, 0, 0] }
// Del manotazo sale por arriba y cae por la izquierda, contra el cielo.
const VUELO = [0.5, 4.0, -1.4]
// La mano lo toma por arriba.
const AGARRE = 0.2125
const arribaDe = ({ c, rot }) => sum(c, aplicar(rotacion(rot), [0, AGARRE, 0]))
const colgado = (mano, rot) => ({ c: res(mano, aplicar(rotacion(rot), [0, AGARRE, 0])), rot })

// ── La escena, en cuadros de 0 a 24 ──────────────────────────────────────

const MANOTAZO = 2.6
const TOCA_SUELO = 8
const LANZA = 16.4 // con los brazos cortos no alcanza la cabeza: se lo tira encima
const APRIETA = 18 // el gorro cae en la cabeza y aplasta el peinado
const PUESTO_OTRA_VEZ = 19
const SALUDO = [0.5, 1.02, 0.66]
const PECHO = [0.85, -0.35, -0.75]
const IMPULSO = [0.75, 0.1, -0.6]

const cuerpoEn = (t) => {
  const saludo = tramo(t, 1, MANOTAZO) * (1 - tramo(t, 6, TOCA_SUELO))
  const baja = tramo(t, 8.5, 12) * (1 - tramo(t, 13, 16))
  return { saludo, inclina: 3 * saludo - 42 * baja, agacha: 0.42 * baja }
}

// La mano izquierda y el gorro: vuela, cae, la mano baja, lo toma, lo lanza y
// le cae puesto. `salto` es lo que el peinado lo empuja de vuelta al caer.
const manoYGorro = (t, pose, salto) => {
  const reposo = pDuckOne.reposo(-1)
  if (t < MANOTAZO) return { mano: reposo, gorro: alMundo(pose, PUESTO) }
  if (t < TOCA_SUELO) {
    const k = (t - MANOTAZO) / (TOCA_SUELO - MANOTAZO)
    const desde = alMundo(cuerpoEn(MANOTAZO), PUESTO)
    return { mano: reposo, gorro: { c: bezier(desde.c, VUELO, EN_EL_SUELO.c, k), rot: [12 - 372 * k, 0, desde.rot[2] * (1 - k)] } }
  }
  if (t < 13) return { mano: lerp(reposo, desdeMundo(pose, arribaDe(EN_EL_SUELO)), tramo(t, 9, 12.5)), gorro: EN_EL_SUELO }
  const tomado = desdeMundo(cuerpoEn(13), arribaDe(EN_EL_SUELO))
  const mano = t < 16 ? lerp(tomado, PECHO, tramo(t, 13.5, 16)) : t < LANZA ? lerp(PECHO, IMPULSO, tramo(t, 16, LANZA)) : lerp(IMPULSO, reposo, tramo(t, LANZA, 19.5))
  // En la mano, nivelado mientras se endereza.
  if (t < LANZA) return { mano, gorro: alMundo(pose, colgado(mano, [0, 0, -pose.inclina])) }
  if (t < PUESTO_OTRA_VEZ) {
    const k = (t - LANZA) / (PUESTO_OTRA_VEZ - LANZA)
    const desde = alMundo(cuerpoEn(LANZA), colgado(IMPULSO, [0, 0, 0]))
    const c = sum(lerp(desde.c, alMundo(pose, PUESTO).c, k), [0, 3.2 * k * (1 - k), 0])
    return { mano, gorro: { c, rot: [(12 - 360) * k, 0, PUESTO.rot[2] * k] } }
  }
  const c = sum(PUESTO.c, aplicar(rotacion(PUESTO.rot), [0, salto, 0]))
  return { mano, gorro: alMundo(pose, { c, rot: PUESTO.rot }) }
}

// ── El resorte ───────────────────────────────────────────────────────────

// Suelto desde el manotazo hasta que el gorro lo aplasta de nuevo.
const suelto = (t) => t >= MANOTAZO && t < PUESTO_OTRA_VEZ
const apretado = (t) => 1 - tramo(t, APRIETA, PUESTO_OTRA_VEZ)

// Un rizo enrollado que salta al quedar libre y se bambolea.
const resorte = (t) => {
  if (!suelto(t)) return []
  const τ = t - MANOTAZO
  const alto = 0.8 * rebote(τ) * (0.12 + 0.88 * apretado(t))
  const ladeo = 24 * Math.exp(-0.3 * τ) * Math.sin((Math.PI * τ) / 2 + 0.6) + (t > 13.5 ? 14 * Math.exp(-0.4 * (t - 13.5)) * Math.sin((Math.PI * (t - 13.5)) / 2) : 0)
  return rizo(alto, ladeo)
}
// Lo que el resorte empuja el gorro de vuelta al caerle encima.
const SALTO = 0.14

export const recoge = (u, { tronco = M.DUCK_ONE_SIN_GORRO, saluda = true } = {}) => {
  const t = u * CUADROS
  const pose = cuerpoEn(t)
  const salto = SALTO * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - PUESTO_OTRA_VEZ) / 2)))
  const { mano, gorro: g } = manoYGorro(t, pose, salto)
  return [
    ...figura(pDuckOne, { tronco: [...tronco, ...resorte(t)], manos: { 1: lerp(pDuckOne.reposo(1), SALUDO, saluda ? pose.saludo : 0), [-1]: mano }, inclina: pose.inclina, agacha: pose.agacha }),
    ...gorro(g),
  ]
}
