// Los sonidos de la escena 11 (src/lib/escena11.js), toma por toma
// (../sonidos.mjs). Solo efectos: los diálogos van sin voz.
//
//   node --env-file=.env.local scripts/operacion-venganza/escena11/sonidos.mjs [nombre…]

import { CAZAS, pasosDe, escribirSonidos } from '../sonidos.mjs'
import { TOMAS } from '../../../src/lib/escena11.js'

// Los cuadros salen de tomas.mjs: duky choca en el 10 (CHOCA), la plataforma
// llega a la cubierta al final de `deposita`, el marinero tira del cinturón
// en el 3 y el 9 de cada vuelta, y la catapulta lanza a los 0,36 s
// (PISTA.lanza).
const EN_LA_TORRE = ['radio', 'pitido', 'termina', 'otroPitido']

const paso = pasosDe(11)

export const SONIDOS = [
  { tomas: ['recoge', 'choca'], nombre: 'sala-de-mando' },
  // La cubierta abierta se oye desde el hangar, lejos, y cada vez más cerca
  // mientras la plataforma sube hasta ella.
  { toma: 'hangar', nombre: 'cubierta', lejos: 0.8 },
  { toma: 'sube', nombre: 'cubierta', lejos: [[0, 0.8], [40, 0.45]] },
  { toma: 'deposita', nombre: 'cubierta', lejos: [[0, 0.45], [40, 0]] },
  { tomas: ['cinturon', 'encoge'], nombre: 'cubierta' },
  // El marinero entra, toma a duky en el cuadro 16 y se lo lleva.
  paso('recoge', 'marinero', 'paso-marinero'),
  { toma: 'recoge', nivel: 'suave', cuadro: 16, segundos: 1, texto: 'Starting right away: a rubber duck toy squeezed with one short squeak as it is grabbed and lifted' },
  paso('choca', 'marinero', 'paso-marinero'),
  {
    toma: 'choca',
    nivel: 'medio',
    cuadro: 9.7,
    segundos: 1.5,
    texto: 'A rubber duck toy bonks hard against a metal door frame: a hollow thud and a loud pained squeal',
  },
  paso('hangar', 'marinero', 'paso-marinero-cubierta'),
  // Cada pisada en la escalerilla es un peldaño de aluminio.
  {
    ...paso('sube', 'marinero', 'peldano'),
    nivel: 'suave',
    segundos: 0.5,
    texto: 'Starting right away: one boot stepping onto an aluminum ladder rung, a single hollow metallic clank',
  },
  // La plataforma arranca con un golpe al comienzo de `sube` y sube con sus
  // motores hasta trabarse en la cubierta, al final de `deposita`: en cada
  // toma acelera y frena suave (enElAscensor en tomas.mjs). Los motores
  // suben de tono con ella, y bajan al trabarse.
  {
    toma: 'sube',
    nombre: 'ascensor-arranca',
    nivel: 'alto',
    segundos: 2,
    texto: 'Starting right away: a massive steel aircraft carrier elevator platform lurches into motion, a heavy metallic clunk of the locks releasing and big hydraulic pump motors whining up to speed',
  },
  {
    toma: 'sube',
    nombre: 'ascensor',
    tono: [[0, 0.8], [10, 0.95], [40, 1.02]],
    nivel: 'alto',
    bucle: true,
    fondo: true,
    segundos: 6,
    entra: 1.2,
    texto: "A huge aircraft carrier deck-edge elevator platform rising, heard standing on it: the loud steady whine of its hydraulic pump motors, the deep rumble and rattle of the massive steel platform, cables humming and steel guide rails creaking, steady and even, with no distinct events",
  },
  { toma: 'deposita', nombre: 'ascensor', tono: [[0, 1.02], [30, 1.1], [38, 0.85]], lejos: [[36, 0], [40, 0.5]] },
  // Lo pasa sobre el borde de la cabina y lo baja; duky toca el asiento entre
  // los cuadros 28 y 32 (bajando, tomas.mjs), y su chillido llega 0,97 s
  // después de empezar.
  {
    toma: 'deposita',
    nivel: 'suave',
    cuadro: 4,
    segundos: 3.5,
    texto: "A sailor's uniform fabric rustling as he leans over the edge of a fighter jet cockpit and carefully lowers something inside, his boots shifting on a metal ladder",
  },
  {
    toma: 'deposita',
    nombre: 'duky-al-asiento',
    nivel: 'medio',
    cuadro: 23.5,
    segundos: 1.5,
    texto: "A rubber duck toy pressed down into a fighter jet's ejection seat: one soft rubbery squeak, and the seat harness straps and metal buckles jingle softly",
  },
  {
    toma: 'deposita',
    nombre: 'ascensor-llega',
    nivel: 'alto',
    cuadro: 38,
    segundos: 1.5,
    texto: 'A massive aircraft carrier elevator platform locks into place at deck level with a deep heavy metallic clunk',
  },
  {
    toma: 'cinturon',
    nombre: 'hebilla',
    nivel: 'medio',
    cuadro: 3,
    cada: 0.9,
    segundos: 0.5,
    texto: 'A seat belt buckle tongue jabbed against the latch and failing to click in: a short metallic clack and the strap pulled tight',
  },
  {
    toma: 'encoge',
    nivel: 'medio',
    texto: 'One last failed seat belt click, then a fighter jet canopy lowers with a hydraulic whine and shuts with a heavy airtight thunk',
  },
  { tomas: ['despegue', 'silencio', 'calla'], nombre: 'cabina-duky' },
  // Desde la cabina, como se oye de verdad: los motores ya a toda potencia en
  // la catapulta, toda la toma; el disparo de la catapulta, que lo sacude
  // desde PISTA.lanza (0,36 s) hasta que deja la proa (1,86 s); el tren que
  // sube en el 24, y duky, que jadea de la emoción desde el 39.
  {
    toma: 'despegue',
    nombre: 'acelera-duky',
    nivel: 'fuerte',
    segundos: 7.4,
    entra: 0.3,
    texto: `Inside the cockpit of ${CAZAS.f22}, heard through the closed canopy: full afterburner on an aircraft carrier catapult, the roar shaking the airframe, then the jet accelerating hard and climbing with the engines roaring steadily and the wind rushing over the canopy`,
  },
  {
    toma: 'despegue',
    nombre: 'catapulta',
    nivel: 'fuerte',
    cuadros: [3.6],
    segundos: 2.5,
    texto: "Starting right away: an aircraft carrier catapult launch felt from inside the fighter's cockpit, a violent bang as the shuttle fires, the airframe shaking and rattling hard, the nose wheel thumping over deck seams faster and faster for one and a half seconds, then the sudden smooth release as the jet leaves the bow",
  },
  {
    toma: 'despegue',
    nombre: 'tren',
    nivel: 'medio',
    cuadros: [24],
    segundos: 2,
    texto: 'Starting right away: inside a fighter jet cockpit in flight, the landing gear retracting, a short hydraulic whine and two solid thunks as the wheels lock up',
  },
  {
    toma: 'despegue',
    nombre: 'despegue-feliz',
    nivel: 'alto',
    cuadro: 39,
    texto: 'A rubber squeaky toy squeezed very fast over and over: quick high-pitched rubber squeaks in and out with little puffs of air, bouncy and giddy, a toy, not a person, no laughter',
  },
  { tomas: EN_LA_TORRE, nombre: 'sala' },
  {
    tomas: ['pitido', 'termina', 'otroPitido'],
    nombre: 'radar',
    nivel: 'medio',
    cada: 1.2,
    texto: 'A single clear radar contact beep from a military radar console, then a quiet electronic hum',
  },
]

if (import.meta.main) await escribirSonidos(11, TOMAS, SONIDOS)
