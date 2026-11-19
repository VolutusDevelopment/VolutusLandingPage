// Los sonidos de la escena 12 (src/lib/operacion-venganza/escena12.js), toma
// por toma (../sonidos.mjs). Solo efectos: los diálogos van sin voz.
//
//   node --env-file=.env.local scripts/operacion-venganza/escena12/sonidos.mjs [nombre…]

import { pasosDe, escribirSonidos } from '../sonidos.mjs'
import { TODAS } from '../../../src/lib/operacion-venganza/escena12.js'

const paso = pasosDe(12)

// En `ataque` el cursor llega al portaaviones en el cuadro 13 (GOLPE en
// tomas.mjs), y desde ahí lo parte en dos.
export const SONIDOS = [
  { tomas: ['llega', 'aire', 'mira', 'espalda', 'harari', 'vuelve', 'dios', 'retira', 'lagrima'], nombre: 'mar-desde-cubierta' },
  { tomas: ['caza', 'persigue', 'huye'], nombre: 'cubierta' },
  { tomas: ['ataque', 'hundimiento', 'alejan'], nombre: 'mar' },
  ...['llega', 'espalda', 'vuelve', 'retira'].map((toma) => paso(toma, 'almirante', 'paso-almirante-cubierta')),
  paso('persigue', 'almirante', 'carrera-almirante'),
  // Corre la cámara, y detrás, el almirante.
  { toma: 'huye', nivel: 'alto', texto: 'First-person running away: fast footsteps, a handheld camera rattling, wind rushing past' },
  paso('huye', 'almirante', 'carrera-almirante'),
  // La alarma es solo la alarma: los pasos son de los marinos que corren.
  { tomas: ['caos', 'lagrima'], nombre: 'alarma' },
  {
    tomas: ['caos', 'lagrima'],
    nombre: 'corren',
    nivel: 'alto',
    bucle: true,
    fondo: true,
    segundos: 6,
    texto: 'Many sailors running frantically in all directions across the rough non-skid surface of an aircraft carrier flight deck: hurried footsteps, scuffs and stumbles, gear rattling, no voices, no alarm, steady and even',
  },
  { toma: 'lagrima', nivel: 'susurro', texto: 'A single soft melancholic piano note and a quiet water droplet' },
  { toma: 'ataque', nombre: 'clic', nivel: 'alto', cuadro: 12, segundos: 0.5, texto: 'A single crisp computer mouse click' },
  { toma: 'ataque', nivel: 'estruendo', cuadro: 13, segundos: 3.8, texto: 'A massive explosion splitting a huge steel ship in two: a deep boom, tearing and groaning metal' },
  { toma: 'hundimiento', nivel: 'fuerte', texto: 'A giant ship sinking: deep groaning metal, rushing and bubbling water, heavy waves' },
  {
    toma: 'hundimiento',
    nombre: 'patos-lejos',
    nivel: 'medio',
    segundos: 9,
    texto: 'Far away across the open sea, a large crowd of ducks quacking and shrieking in panic, fighting for their lives, distant and echoing',
  },
  {
    toma: 'alejan',
    nivel: 'medio',
    texto: 'Several huge aircraft carriers sailing away across the open ocean: the deep throbbing rumble of their engines and the churning wash of their wakes, slowly fading into the distance, no shore',
  },
]

if (import.meta.main) await escribirSonidos(12, TODAS, SONIDOS)
