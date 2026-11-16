// Los sonidos de la escena 5 (src/lib/escena5.js), toma por toma
// (../sonidos.mjs). Solo efectos: los diálogos van sin voz.
//
//   node --env-file=.env.local scripts/operacion-venganza/escena5/sonidos.mjs [nombre…]

import { caminataDe, pasosDe, escribirSonidos } from '../sonidos.mjs'
import { TOMAS } from '../../../src/lib/escena5.js'

const paso = pasosDe(5)
const caminata = caminataDe(5)

// Toca la cubierta en u = 0,58 de su tira (POV.toca en tomas.mjs), el cuadro
// 25; el chirrido del aterrizaje empieza 0,2 s después del suyo.
export const SONIDOS = [
  { toma: 'aproximacion', nivel: 'alto', texto: 'A jet fighter approaches an aircraft carrier to land, the engine roar growing louder over the sea' },
  { toma: 'aproximacion', nombre: 'mar' },
  { toma: 'aterrizaje', nombre: 'cabina' },
  {
    toma: 'aterrizaje',
    nivel: 'fuerte',
    cuadro: 23.5,
    segundos: 3,
    texto: "Starting right away with the impact: a fighter jet's tires screech loudly as they hit an aircraft carrier deck, the arresting wire snaps taut and the jet lurches to a stop, panicked sailors' footsteps scatter",
  },
  // Cuando duck-one se baja, el motor se apaga despacio y suena mientras
  // hablan en la cubierta, hasta enfriarse del todo.
  {
    toma: 'pose',
    nombre: 'revoluciones',
    nivel: 'alto',
    segundos: 14,
    texto: 'Jet engine shutdown spool down, heard on an aircraft carrier deck right next to a parked F-14 Tomcat: the turbine whine winding down slowly, lower and lower over fourteen seconds, the rumble fading, a long decrescendo into silence with a few faint ticks of hot metal cooling',
  },
  { tomas: TOMAS.slice(2).map((t) => t.id), nombre: 'cubierta' },
  // La cúpula ya está abierta: duck-one baja del ala, toca la cubierta en el
  // 9,6 y se pone en jarras, sacando pecho, del 9,6 al 12 (pose en tomas.mjs).
  { toma: 'pose', nivel: 'medio', segundos: 1.5, texto: 'A fighter jet cockpit canopy finishes opening with a short pneumatic hiss and a soft clunk' },
  { toma: 'pose', nombre: 'cae-de-pie', cuadros: [9.6] },
  { toma: 'pose', nombre: 'duck-one-pecho', cuadros: [10.8] },
  paso('marcha', 'duckOne', 'paso-duck-one-cubierta'),
  { ...caminata('marcha', 'duckOne'), nombre: 'medallas' },
  // Salta en el 3,2 y cae en el 17,6 (saltaYSeñala en tomas.mjs), y las
  // medallas se le mueven mientras levanta la mano y está en el aire.
  {
    toma: 'salta',
    nombre: 'impulso',
    nivel: 'medio',
    cuadros: [3.2],
    segundos: 0.8,
    texto: 'Starting right away: a man in military boots springs up into a jump from the rough non-skid surface of an aircraft carrier deck, a quick gritty scuff of both soles pushing off and a whoosh of his uniform',
  },
  {
    toma: 'salta',
    nombre: 'cae-de-pie',
    nivel: 'medio',
    cuadros: [17.6],
    segundos: 0.8,
    texto: 'Starting right away: a man in military boots lands on both feet on the rough non-skid surface of an aircraft carrier deck after a jump, one firm gritty thud, no metal',
  },
  { toma: 'salta', nombre: 'medallas', cuadro: 1.6, hasta: 19 },
]

if (import.meta.main) await escribirSonidos(5, TOMAS, SONIDOS)
