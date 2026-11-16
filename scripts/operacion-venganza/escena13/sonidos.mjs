// Los sonidos de la escena 13 (src/lib/escena13.js), toma por toma
// (../sonidos.mjs). Solo efectos: los diálogos van sin voz.
//
//   node --env-file=.env.local scripts/operacion-venganza/escena13/sonidos.mjs [nombre…]

import { CAZAS, pasosDe, escribirSonidos } from '../sonidos.mjs'
import { TOMAS } from '../../../src/lib/escena13.js'

const EN_LA_SALA = ['monitores', 'pasando', 'metodologia', 'futuro', 'antes', 'mira', 'reflejo', 'nomegusta']

const paso = pasosDe(13)

export const SONIDOS = [
  { tomas: EN_LA_SALA, nombre: 'sala-de-mando' },
  {
    tomas: ['monitores', 'mira'],
    nombre: 'combate-en-pantalla',
    nivel: 'suave',
    bucle: true,
    fondo: true,
    texto: 'A distant aerial dogfight heard through a small monitor speaker: muffled jet roar and laser zaps',
  },
  { tomas: ['vuela', 'ataca', 'esquiva'], nombre: 'cabina-duky' },
  { toma: 'ataca', nombre: 'disparos' },
  // Feliz, duky rebota en el asiento y se mece de lado a lado: cuatro veces
  // por tira (dukyFeliz en tomas.mjs), y chilla un poco en cada una.
  ...[
    ['vuela', [0, 3, 6, 9]],
    ['ataca', [0, 3, 6, 9]],
    ['esquiva', [0, 6, 12, 18]],
  ].map(([toma, cuadros]) => ({
    toma,
    nombre: 'rebote',
    nivel: 'susurro',
    cuadros,
    segundos: 0.5,
    texto: 'Starting right away: a rubber duck toy bounces once on a padded seat, one small soft squeak of rubber',
  })),
  // Quien juega se le viene encima y duky da un tonel completo del 7 al 19.
  {
    toma: 'esquiva',
    nivel: 'alto',
    cuadro: 5,
    segundos: 3.5,
    entra: 0.2,
    texto: `Inside the cockpit of ${CAZAS.f22} in flight: the pilot snaps the jet into a fast full aileron roll, the engines surging, the wind roar over the canopy rising and swirling around, the airframe creaking under the load, then leveling out smoothly`,
  },
  paso('reflejo', 'moby', 'paso-moby'),
  { toma: 'reflejo', nombre: 'apagado', nivel: 'suave', texto: 'A CRT monitor switching off with a soft electric pop and a fading whine' },
]

if (import.meta.main) await escribirSonidos(13, TOMAS, SONIDOS)
