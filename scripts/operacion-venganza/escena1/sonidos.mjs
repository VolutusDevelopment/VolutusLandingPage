// Los sonidos de la escena 1 (src/lib/escena1.js), toma por toma
// (../sonidos.mjs). Solo efectos: los diálogos van sin voz.
//
//   node --env-file=.env.local scripts/operacion-venganza/escena1/sonidos.mjs [nombre…]

import { pasosDe, escribirSonidos } from '../sonidos.mjs'
import { TOMAS } from '../../../src/lib/escena1.js'

const paso = pasosDe(1)

export const SONIDOS = [
  {
    toma: 'llegada',
    nivel: 'suave',
    texto: 'The open ocean at sunset far from any coast: deep rolling swells and wind over the water, and the faint distant rumble of big ship engines slowly growing',
  },
  { toma: 'orbita', nivel: 'medio', texto: 'A huge aircraft carrier slowly approaching: deep engine rumble, the bow cutting through waves, sea wind' },
  // La alarma ya suena en el portaaviones que llega: lejos sobre el mar,
  // creciendo toda la vuelta, y en la cubierta, tal cual. Los marinos corren
  // con ella hasta la sala, y al subir la cámara se oye solo la alarma.
  { toma: 'orbita', nombre: 'alarma', lejos: 0.8, entra: 6 },
  {
    toma: 'cubierta',
    nombre: 'alarma-cubierta',
    nivel: 'medio',
    texto: 'Sailors running in all directions across an aircraft carrier flight deck, hurried footsteps on the rough deck, a small propeller plane idling, strong sea wind, no alarm, no voices',
  },
  { toma: 'cubierta', nombre: 'alarma', entra: 0.3 },
  { toma: 'subida', nombre: 'alarma', lejos: 0.4, entra: 2 },
  { toma: 'subida', nombre: 'cubierta' },
  { tomas: TOMAS.slice(4).map((t) => t.id), nombre: 'sala-de-mando' },
  { toma: 'gafas', cuadro: 10 },
  { toma: 'levanta', nombre: 'silla' },
  paso('ventana', 'almirante', 'paso-almirante'),
]

if (import.meta.main) await escribirSonidos(1, TOMAS, SONIDOS)
