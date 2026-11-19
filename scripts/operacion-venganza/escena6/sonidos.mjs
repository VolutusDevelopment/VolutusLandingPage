// Los sonidos de la escena 6 (src/lib/operacion-venganza/escena6.js), toma por
// toma (../sonidos.mjs). Solo efectos: los diálogos van sin voz.
//
//   node --env-file=.env.local scripts/operacion-venganza/escena6/sonidos.mjs [nombre…]

import { pasosDe, escribirSonidos } from '../sonidos.mjs'
import { TOMAS } from '../../../src/lib/operacion-venganza/escena6.js'

const DE_MOBY = ['tengo', 'significa', 'contabilidad']
const DE_DUKE = ['recortado', 'adicional']
const EN_CUBIERTA = ['aterrizan', 'saltito', 'fuselaje', 'abolladura', 'torre']

const paso = pasosDe(6)

// Los cuadros salen de tomas.mjs. En `aterrizan` duke llega a 120 m de la
// cámara, toca la cubierta en el 3,6, pasa a 18 m en el 5,5 y se detiene a
// 53 m; moby viene de 490 m, toca en el 16,8 y pasa a 18 m en el 21,5. Los
// dos suenan con su motor (enPista): su distancia, cuadro a cuadro, y un
// Doppler de verdad, que baja al pasar. Duke salta en el 3,6 de `saltito` y
// su Hornet pliega las alas del 8,4 al 21,6 con el motor en marcha, que se
// apaga bajando de tono cuando la cámara va a moby, cuyo A-10 ya se apaga en
// `saltito`. Moby pega un puñetazo por cuadro hasta el 17.
export const SONIDOS = [
  // Vuelan juntos: suenan sus dos motores, como en la escena 5, y al
  // regresar la cámara va más atrás.
  ...['motor-a10', 'motor-hornet'].flatMap((nombre) => [
    { toma: 'alarma', nombre, lejos: 0.2 },
    { toma: 'regresan', nombre, lejos: 0.45, entra: 1 },
  ]),
  {
    tomas: ['alarma', ...DE_MOBY, ...DE_DUKE],
    nombre: 'alarma-combustible',
    nivel: 'alto',
    bucle: true,
    texto: 'A fighter jet cockpit low fuel warning: urgent repeating electronic beeps',
  },
  { tomas: DE_MOBY, nombre: 'cabina-moby' },
  { tomas: DE_DUKE, nombre: 'cabina-duke' },
  { tomas: ['regresen', 'presupuesto'], nombre: 'sala' },
  { toma: 'regresan', nombre: 'cielo' },
  { tomas: EN_CUBIERTA, nombre: 'cubierta' },
  // Cada uno aterriza con su motor, y sus ruedas chirrían a su manera: las
  // del Hornet, livianas; las del A-10, pesadas. El chirrido empieza a fondo
  // antes de su golpe (0,1 s el de duke y 0,5 s el de moby): va corrido para
  // que empiece al tocar.
  {
    toma: 'aterrizan',
    nombre: 'motor-hornet',
    entra: 0.3,
    lejos: [[0, 0.66], [2, 0.5], [3.6, 0.33], [4.5, 0.2], [5.5, 0.12], [6.5, 0.19], [8, 0.31], [10, 0.4], [12, 0.42]],
    tono: [[0, 1.1], [4.5, 1.08], [5.5, 1], [6.5, 0.92], [8, 0.9], [12, 0.85], [32, 0.8]],
  },
  {
    toma: 'aterrizan',
    nombre: 'motor-a10',
    entra: 0.3,
    lejos: [[0, 1], [10, 0.84], [14, 0.66], [16.8, 0.48], [18, 0.38], [20, 0.19], [21.5, 0.12], [23, 0.17], [25, 0.22], [28, 0.23]],
    tono: [[0, 1.1], [20, 1.08], [21.5, 1], [23, 0.92], [25, 0.88], [32, 0.82]],
  },
  {
    toma: 'aterrizan',
    nombre: 'chirrido-duke',
    nivel: 'fuerte',
    cuadros: [4.4],
    segundos: 2.5,
    texto: 'Starting right away with the impact: the main wheels of a light fighter jet hit an aircraft carrier deck, a sharp double chirp of rubber tires screeching and smoking, then the tires rumbling as they roll and fading out, no clack',
  },
  {
    toma: 'aterrizan',
    nombre: 'chirrido-moby',
    nivel: 'fuerte',
    cuadros: [20.1],
    segundos: 3,
    texto: 'Starting right away with the impact: the heavy landing gear of a big attack jet slams onto an aircraft carrier deck, a deep heavy thump and a long loud squeal of burning rubber tires skidding, then a rolling rumble fading out, no clack',
  },
  { toma: 'saltito', nivel: 'suave', texto: 'A light cartoon hop and a soft tap landing on the rough surface of an aircraft carrier deck' },
  { toma: 'saltito', nombre: 'motor-hornet', lejos: 0.1, tono: 0.8, entra: 0.3 },
  { toma: 'saltito', nombre: 'motor-a10', lejos: [[0, 0.4], [24, 0.85]], tono: [[0, 0.82], [24, 0.45]], entra: 0.3 },
  { toma: 'fuselaje', nombre: 'motor-hornet', lejos: 0.05, tono: 0.8, entra: 0.3 },
  {
    toma: 'saltito',
    nombre: 'alas',
    nivel: 'medio',
    cuadro: 8.4,
    segundos: 2.6,
    texto: 'Starting right away: hydraulic actuators whirring steadily for two seconds as a parked fighter jet folds its wingtips up, then a soft solid clunk as they lock, and silence',
  },
  { toma: 'abolladura', nombre: 'motor-hornet', lejos: [[0, 0.3], [31, 1]], tono: [[0, 0.8], [31, 0.35]], entra: 0.3 },
  {
    toma: 'abolladura',
    nombre: 'punetazo',
    nivel: 'alto',
    cada: 0.15,
    hasta: 17,
    segundos: 0.5,
    texto: 'Starting right away: a hard punch of a bare fist on a thin sheet metal panel, one loud metallic bang with a short tinny ring, then silence',
  },
  {
    toma: 'abolladura',
    nivel: 'alto',
    cuadros: [9],
    segundos: 1,
    texto: 'Starting right away: a thin aluminum aircraft panel crunches and dents inward under a hard fist blow, a short metallic crumple, then silence',
  },
  paso('abolladura', 'moby', 'paso-moby-cubierta'),
  paso('torre', 'moby', 'paso-moby-cubierta'),
  paso('torre', 'duke', 'paso-duke-cubierta'),
]

if (import.meta.main) await escribirSonidos(6, TOMAS, SONIDOS)
