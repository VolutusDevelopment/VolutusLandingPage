// Los sonidos de la escena 11 (src/lib/operacion-venganza/escena11.js), toma
// por toma (../sonidos.mjs). Solo efectos: los diálogos van sin voz.
//
//   node --env-file=.env.local scripts/operacion-venganza/escena11/sonidos.mjs [nombre…]

import { caminataDe, pasosDe, escribirSonidos } from '../sonidos.mjs'
import { TOMAS } from '../../../src/lib/operacion-venganza/escena11.js'

// Los cuadros salen de tomas.mjs: el caza de duky toca la cubierta en el 7,2
// (enPista, escena6/tomas.mjs); la cinta se pega del 1 al 19 y el sticker
// aparece en el 25, y el marinero salta por la borda en el 16 y cae al agua
// en el 26 (CAIDA).
const EN_CUBIERTA = ['aterriza', 'saca', 'cubierta', 'acercan', 'recoge', 'caja', 'cinta', 'almirante', 'destino', 'myanmar', 'porque', 'clasificada', 'proteccion', 'patea', 'tiembla', 'corre']
const EN_LA_BORDA = ['borde', 'lejos', 'atardecer', 'manos', 'bonito']

const paso = pasosDe(11)
const caminata = caminataDe(11)

export const SONIDOS = [
  { tomas: EN_CUBIERTA, nombre: 'cubierta' },
  { tomas: EN_LA_BORDA, nombre: 'mar-desde-cubierta' },
  { toma: 'flota', nombre: 'mar' },
  // Como los demás, el caza de duky suena con su motor: llega de 184 m, toca
  // en el 7,2 y se detiene a 27 m de la cámara (enPista); sigue en marcha
  // mientras sacan a duky y se apaga despacio mientras se lo llevan.
  {
    toma: 'aterriza',
    nombre: 'motor-f22',
    entra: 0.4,
    lejos: [[0, 0.78], [7.2, 0.6], [13, 0.43], [20, 0.26], [24, 0.23]],
    tono: [[0, 1.08], [7.2, 1.05], [16, 0.95], [24, 0.85], [32, 0.8]],
  },
  {
    toma: 'aterriza',
    nombre: 'chirrido-duky',
    nivel: 'fuerte',
    cuadros: [7.2],
    segundos: 3,
    texto: 'Starting right away with the impact: the main wheels of a heavy stealth fighter slam onto an aircraft carrier deck, a hard thump and a sharp screech of rubber tires, the arresting wire snapping taut with a metallic twang, then a rolling rumble fading out, no engine',
  },
  { toma: 'saca', nombre: 'motor-f22', lejos: 0.15, tono: 0.8, entra: 0.3 },
  { toma: 'cubierta', nombre: 'motor-f22', lejos: [[0, 0.3], [24, 0.7]], tono: [[0, 0.8], [24, 0.55]], entra: 0.3 },
  { toma: 'borde', nombre: 'motor-f22', lejos: [[0, 0.7], [32, 1]], tono: [[0, 0.55], [32, 0.35]], entra: 0.3 },
  { toma: 'saca', nivel: 'medio', texto: 'A cockpit canopy opens with a hydraulic hiss, and a rubber duck toy squeaks as it is lifted out' },
  paso('cubierta', 'marinero', 'paso-marinero-cubierta'),
  // Lo deja en el borde en el cuadro 17,6 y se vuelve.
  { toma: 'borde', nivel: 'suave', cuadro: 15.1, segundos: 1, texto: 'Starting right away: a rubber duck toy gives one soft squeak as it is set down on a metal ledge' },
  paso('borde', 'marinero', 'paso-marinero-cubierta'),
  paso('acercan', 'moby', 'paso-moby-cubierta'),
  paso('acercan', 'duckOne', 'paso-duck-one-cubierta'),
  { ...caminata('acercan', 'duckOne'), nombre: 'medallas' },
  paso('acercan', 'duke', 'paso-duke-cubierta'),
  // Se toman de las manos todos a la vez, en el cuadro 19 (tramo(u, 0.15, 0.8));
  // el sonido se aprieta 1 s después de empezar.
  {
    toma: 'manos',
    nivel: 'suave',
    cuadro: 12.5,
    segundos: 1.5,
    texto: 'Several hands reaching out and clasping together at the same moment: a soft rustle of sleeves, then a few soft overlapping hand clasps, no music',
  },
  // Llega caminando y lo levanta del borde en el cuadro 14.
  paso('recoge', 'marinero', 'paso-marinero-cubierta'),
  { toma: 'recoge', nivel: 'suave', cuadro: 12.6, segundos: 1, texto: 'Starting right away: a rubber duck toy gives one short squeak as it is picked up' },
  // Lo baja hasta el fondo de la caja (cuadro 17,6) y cierra la tapa (28,8):
  // sus golpes llegan 0,5 y 1,07 s después de empezar.
  paso('caja', 'marinero', 'paso-marinero-cubierta'),
  {
    toma: 'caja',
    nombre: 'en-la-caja',
    nivel: 'medio',
    cuadro: 14.3,
    segundos: 1,
    texto: 'Starting right away: a rubber duck toy set down on the bottom of a wooden crate, a soft hollow wooden knock and one short rubbery squeak',
  },
  {
    toma: 'caja',
    nombre: 'tapa',
    nivel: 'alto',
    cuadro: 21.7,
    segundos: 1.5,
    texto: 'A wooden crate lid lowered and closed: a short creak of the wood, then a solid hollow wooden thud as it shuts',
  },
  { toma: 'cinta', nivel: 'medio', cuadro: 1, segundos: 2.7, texto: 'Packing tape ripped off a roll in three long pulls and pressed over a wooden crate' },
  { toma: 'cinta', nombre: 'sticker', nivel: 'medio', cuadro: 25, segundos: 0.5, texto: 'A big vinyl sticker slapped onto a wooden crate with the flat of a hand' },
  paso('almirante', 'almirante', 'paso-almirante-cubierta'),
  // Patea dos veces, en los cuadros 9,2 y 17,6 (GOLPES).
  ...[9.2, 17.6].map((cuadro, i) => ({
    toma: 'patea',
    nombre: 'patada',
    cuadro,
    ...(i === 0 && { nivel: 'alto', segundos: 1, texto: 'A boot kicks a wooden crate hard: one loud hollow wooden thump and a muffled rubber squeak inside' }),
  })),
  paso('corre', 'marinero', 'carrera-marinero'),
  { toma: 'corre', nombre: 'caida', nivel: 'medio', cuadro: 16, segundos: 1.5, texto: 'A person falling through the air from a great height: a short descending cartoon whistle' },
  { toma: 'corre', nombre: 'chapuzon', nivel: 'alto', cuadro: 25.5, segundos: 2, texto: 'A big deep splash as a person plunges into the sea far below, water churning' },
]

if (import.meta.main) await escribirSonidos(11, TOMAS, SONIDOS)
