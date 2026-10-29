// El caza de duck-one en la cubierta del Sitting Ducks, para las escenas 3 y
// 5: su F-14 con la cabina por dentro (pilotos/interiores.mjs), el tren de
// aterrizaje, la barra de la catapulta, el gancho, el botón que no es el de
// las armas y un limpiaparabrisas que ningún F-14 tiene. Espera en la
// catapulta de babor, mirando a proa.
//
// El caza va en sus metros (morro hacia +x) y el piloto en sus unidades;
// enCaza() y enPiloto() los llevan a los metros del barco (escena1/lugares.mjs).

import { el } from '../pilotos/tres.mjs'
import { ALAS_TOMCAT, RAMPAS as C, ambos, barrerAlas, disco, hueso } from '../pilotos/modelos.mjs'
import { CABINAS, NORMAL, aCaza, avion, cabinaCon, conCupula, enPanel } from '../pilotos/interiores.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const esc = (a, k) => a.map((v) => v * k)

const CFG = { ...CABINAS['duck-one'] }
CFG.avion = avion(CFG)

// La escala del piloto en el caza: con ella camina también por la cubierta.
export const ESCALA = CFG.k

// Bajo las ruedas, en metros del caza; la cubierta del barco está a 20,8 m.
export const SUELO = -2.2
export const EN_CATAPULTA = [70, 20.8 - SUELO, -6]

export const enCaza = (p) => sum(p, EN_CATAPULTA)
export const enPiloto = (p) => enCaza(aCaza(CFG, p))
// De las unidades del piloto a los metros del caza.
export const enCabina = (p) => aCaza(CFG, p)

// Las dos ruedas de proa bajo la cabina y las principales, que bajan del
// guante, abiertas 5 m entre sí.
export const RUEDAS = { proa: [4.25, SUELO + 0.3, 0], principal: (s) => [-2.75, SUELO + 0.46, s * 2.5] }
const TREN = [
  hueso([4.25, -0.75, 0], RUEDAS.proa, 0.07, C.grisOscuro),
  ...ambos((s) => el(sum(RUEDAS.proa, [0, 0, s * 0.17]), [0.3, 0.3, 0.1], C.negro)),
  ...ambos((s) => [hueso([-2.4, 0.1, s * 2.3], RUEDAS.principal(s), 0.09, C.grisOscuro), el(RUEDAS.principal(s), [0.46, 0.46, 0.17], C.negro)]).flat(),
]
// La barra de lanzamiento: de la rueda de proa a la lanzadera de la catapulta.
const BARRA = hueso([4.25, -1.55, 0], [5.0, SUELO + 0.05, 0], 0.05, C.grisOscuro)
// El gancho, bajo la cola: recogido (0) va junto al lomo; bajado (1), roza la cubierta.
const gancho = (k) => {
  const a = (-5 - 40 * k) * (Math.PI / 180)
  const punta = sum([-5.95, -0.55, 0], [2.3 * -Math.cos(a), 2.3 * Math.sin(a), 0])
  return [hueso([-5.95, -0.55, 0], punta, 0.05, C.grisOscuro), el(punta, [0.12, 0.08, 0.1], C.rayas)]
}

// Un brazo negro pegado al parabrisas, con el eje abajo al medio; `angulo`
// en grados, 0 hacia la cúpula. Quieto, descansa de lado.
const CUPULA = CFG.caza.find((f) => f.vidrio)
const sobreElVidrio = (x, z) => {
  const { c, r } = CUPULA
  const k = 1 - ((x - c[0]) / r[0]) ** 2 - (z / r[2]) ** 2
  return [x, c[1] + r[1] * Math.sqrt(Math.max(0, k)) + 0.04, z]
}
const LIMPIA_QUIETO = -40
// Su eje, al pie del parabrisas.
const PIE_DEL_LIMPIA = 6.2
const limpiaparabrisas = (angulo) => {
  const a = (angulo * Math.PI) / 180
  const puntos = [0, 1, 2, 3, 4].map((i) => sobreElVidrio(PIE_DEL_LIMPIA - 0.125 * i * Math.cos(a), 0.125 * i * Math.sin(a)))
  return puntos.slice(1).map((p, i) => hueso(puntos[i], p, 0.05, C.negro))
}

// El botón, en unidades del piloto: rojo con su aro amarillo, abajo a la
// izquierda del tablero. Pulsado, se hunde y se enciende.
export const BOTON = sum(enPanel(0.2, -0.95), esc(NORMAL, 0.06))
const boton = (pulsado) => [
  disco(BOTON, NORMAL, 0.13, 0.02, C.rayas),
  el(sum(BOTON, esc(NORMAL, pulsado ? 0.01 : 0.05)), [0.08, 0.08, 0.08], C.boca, pulsado ? { flat: '#ff5a3a', brilla: true } : {}),
]

// El caza en sus metros: `piloto` es la figura de duck-one sentado, o nada;
// `cupula`, los grados que tiene abierta la cúpula (escena 5); `alas`, los
// grados de su barrido; `barra`, si está enganchado a la catapulta;
// `gancho`, de 0 a 1, cuánto lo baja, y `medalla`, los grados que se
// balancea la del espejo.
export const caza = ({ piloto = [], palanca, acelerador, limpia = LIMPIA_QUIETO, pulsado = false, tren = true, cupula = 0, alas = ALAS_TOMCAT.abiertas, barra = false, gancho: baja = 0, medalla = 0 } = {}) =>
  barrerAlas(
    [
      ...cabinaCon({ ...conCupula(CFG, cupula), medalla }, [...piloto, ...boton(pulsado)], palanca, acelerador),
      ...limpiaparabrisas(limpia),
      ...(tren ? TREN : []),
      ...(tren && barra ? [BARRA] : []),
      ...gancho(baja),
    ],
    alas,
  )
