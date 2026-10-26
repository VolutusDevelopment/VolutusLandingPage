// El caza de duck-one en la cubierta del Sitting Ducks, para la escena 3: su
// F-15EX con la cabina por dentro (pilotos/interiores.mjs), el tren de
// aterrizaje, el botón que no es el de las armas y un limpiaparabrisas que
// ningún F-15 tiene. Espera en la catapulta de babor, mirando a proa.
//
// El caza va en sus metros (morro hacia +x) y el piloto en sus unidades;
// enCaza() y enPiloto() los llevan a los metros del barco (escena1/lugares.mjs).

import { el, transformar } from '../pilotos/tres.mjs'
import { RAMPAS as C, ambos, disco, hueso } from '../pilotos/modelos.mjs'
import { CABINAS, NORMAL, aCaza, avion, cabinaCon, enPanel } from '../pilotos/interiores.mjs'

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

// Rueda de proa bajo la cabina y las dos principales bajo las tomas de aire.
const TREN = [
  hueso([6.4, -0.3, 0], [6.4, -1.9, 0], 0.07, C.grisOscuro),
  el([6.4, -1.9, 0], [0.3, 0.3, 0.12], C.negro),
  ...ambos((s) => [hueso([-1.4, -0.5, s * 1.5], [-1.4, -1.75, s * 1.85], 0.09, C.grisOscuro), el([-1.4, -1.75, s * 1.95], [0.45, 0.45, 0.17], C.negro)]).flat(),
]

// Un brazo negro pegado al parabrisas, con el eje abajo al medio; `angulo`
// en grados, 0 hacia la cúpula. Quieto, descansa de lado.
const CUPULA = CFG.caza.find((f) => f.vidrio)
const sobreElVidrio = (x, z) => {
  const { c, r } = CUPULA
  const k = 1 - ((x - c[0]) / r[0]) ** 2 - (z / r[2]) ** 2
  return [x, c[1] + r[1] * Math.sqrt(Math.max(0, k)) + 0.04, z]
}
const LIMPIA_QUIETO = -40
const limpiaparabrisas = (angulo) => {
  const a = (angulo * Math.PI) / 180
  const puntos = [0, 1, 2, 3, 4].map((i) => sobreElVidrio(6.6 - 0.125 * i * Math.cos(a), 0.125 * i * Math.sin(a)))
  return puntos.slice(1).map((p, i) => hueso(puntos[i], p, 0.05, C.negro))
}

// El botón, en unidades del piloto: rojo con su aro amarillo, sobre la
// pantalla izquierda del tablero. Pulsado, se hunde y se enciende.
export const BOTON = sum(enPanel(0.2, -0.95), esc(NORMAL, 0.06))
const boton = (pulsado) => [
  disco(BOTON, NORMAL, 0.13, 0.02, C.rayas),
  el(sum(BOTON, esc(NORMAL, pulsado ? 0.01 : 0.05)), [0.08, 0.08, 0.08], C.boca, pulsado ? { flat: '#ff5a3a', brilla: true } : {}),
]

// La cúpula se abre de la bisagra de atrás, con sus arcos, `abre` grados (escena 5).
const ARCOS = CFG.avion.slice(-CFG.arcos.length * 12)
const conCupula = (abre) => {
  if (!abre) return CFG
  const sube = transformar([0, 0, abre], [CUPULA.c[0] - CUPULA.r[0], CUPULA.c[1], 0])
  return { ...CFG, avion: [...CFG.avion.filter((f) => f !== CUPULA && !ARCOS.includes(f)), ...sube.formas([CUPULA, ...ARCOS])] }
}

// El caza en sus metros: `piloto` es la figura de duck-one sentado, o nada.
export const caza = ({ piloto = [], palanca, acelerador, limpia = LIMPIA_QUIETO, pulsado = false, tren = true, cupula = 0 } = {}) => [
  ...cabinaCon(conCupula(cupula), [...piloto, ...boton(pulsado)], palanca, acelerador),
  ...limpiaparabrisas(limpia),
  ...(tren ? TREN : []),
]
