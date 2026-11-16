// Los sonidos de la escena 10 (src/lib/escena10.js), toma por toma
// (../sonidos.mjs). Solo efectos: los diálogos van sin voz.
//
//   node --env-file=.env.local scripts/operacion-venganza/escena10/sonidos.mjs [nombre…]

import { pasosDe, escribirSonidos } from '../sonidos.mjs'
import { TOMAS } from '../../../src/lib/escena10.js'

const paso = pasosDe(10)

// Moby enciende el puro al comienzo de `tos` (pilotos/calada.mjs). En `miran`
// los sillones giran desde el comienzo, y en `noot` duky resopla cuatro
// veces, cada 5 cuadros desde el 13 (duky.resopla, escena2/patoon.mjs).
export const SONIDOS = [
  { tomas: TOMAS.map((t) => t.id), nombre: 'sala-de-mando' },
  // Moby entra pisando fuerte, sin puerta que se cierre; duke, con su paso.
  paso('furioso', 'moby', 'paso-moby'),
  paso('reflejo', 'duke', 'paso-duke'),
  { toma: 'maldita', nombre: 'golpe-mesa', nivel: 'alto', texto: 'A heavy fist slams down on a wooden table and cups rattle' },
  { toma: 'tos', nombre: 'encendedor' },
  { toma: 'miran', nombre: 'sillas-giran' },
  // Duck-One se gira hacia duky con la carpeta, del 3,5 al 8,3.
  { toma: 'miran', nombre: 'duck-one-gira', cuadros: [5.9] },
  {
    toma: 'noot',
    nombre: 'resoplido',
    nivel: 'alto',
    cuadro: 13,
    cada: 0.756,
    hasta: 30,
    segundos: 0.6,
    texto: 'A rubber duck toy gives one quick excited squeaky puff, a short high squeak in and out',
  },
]

if (import.meta.main) await escribirSonidos(10, TOMAS, SONIDOS)
