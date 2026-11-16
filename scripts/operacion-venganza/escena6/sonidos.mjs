// Los sonidos de la escena 6 (src/lib/escena6.js), toma por toma
// (../sonidos.mjs). Solo efectos: los diálogos van sin voz.
//
//   node --env-file=.env.local scripts/operacion-venganza/escena6/sonidos.mjs [nombre…]

import { escribirSonidos } from '../sonidos.mjs'
import { TOMAS } from '../../../src/lib/escena6.js'

// Cada caza suena con su motor, y juntos suenan los dos: llegan del
// horizonte, acercándose toda la toma, y cada uno queda cerca cuando la
// cámara se le acerca, con el otro más atrás. Cada uno habla desde su cabina,
// que suena como su caza. Duke no lleva destellos.
const DE_MOBY = ['monstruo', 'mejor', 'graben', 'pato']
const DE_DUKE = ['sensores', 'camaras', 'humo', 'gira', 'presenta', 'destellos', 'indescriptible', 'acelera']
const MOTORES = { moby: 'motor-a10', duke: 'motor-hornet' }
const motores = (toma, lejos = {}, entra, tono) => Object.entries(MOTORES).map(([quien, nombre]) => ({ toma, nombre, lejos: lejos[quien], entra, tono }))
const DEL_HORIZONTE = [[0, 1], [16, 0.75], [32, 0.4]]

export const SONIDOS = [
  { tomas: ['horizonte', 'moby', 'duke', 'juntos', 'objetivo'], nombre: 'cielo' },
  ...motores('horizonte', { moby: DEL_HORIZONTE, duke: DEL_HORIZONTE }, 1.5, [[0, 1.05], [32, 1]]),
  ...motores('moby', { duke: 0.5 }, 2),
  ...motores('duke', { moby: 0.5 }, 2),
  ...motores('juntos', {}, 0.5),
  { tomas: DE_MOBY, nombre: 'cabina-moby' },
  { tomas: DE_DUKE, nombre: 'cabina-duke' },
  // Su cámara empieza a grabar cuando se gira hacia ella: el «REC».
  {
    toma: 'gira',
    nombre: 'graba',
    nivel: 'medio',
    segundos: 0.7,
    texto: 'Starting right away: two short, clear, high-pitched electronic beeps, like a camcorder starting to record',
  },
  { toma: 'destellos', nivel: 'medio', bucle: true, texto: 'Continuous magical glitter shimmer with twinkling chimes' },
  // Moby lo adelanta desde atrás, por estribor y cada vez más rápido (PASA en
  // tomas.mjs): a 53 m, pasa a 17 m de la cabina de duke en el 15,5 y se va
  // a 72 m, con su Doppler. Después sube contra quien juega y se aleja de la
  // cámara, de 22 a 233 m.
  {
    toma: 'acelera',
    nombre: 'motor-a10',
    lejos: [[0, 0.65], [9.6, 0.45], [13.2, 0.2], [15.5, 0.05], [18, 0.25], [21, 0.55], [24, 0.7]],
    tono: [[0, 1], [9.6, 1.07], [13.2, 1.07], [15.5, 1], [18, 0.91], [21, 0.86], [24, 0.84]],
  },
  { toma: 'objetivo', nombre: 'motor-a10', lejos: [[0, 0.2], [12, 0.5], [24, 0.9]], tono: [[0, 0.9], [12, 0.85], [24, 0.78]] },
]

if (import.meta.main) await escribirSonidos(6, TOMAS, SONIDOS)
