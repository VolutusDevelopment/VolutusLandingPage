// Los sonidos de la escena 3 (src/lib/operacion-venganza/escena3.js), toma por
// toma (../sonidos.mjs). Solo efectos: los diálogos van sin voz.
//
//   node --env-file=.env.local scripts/operacion-venganza/escena3/sonidos.mjs [nombre…]

import { caminataDe, pasosDe, escribirSonidos } from '../sonidos.mjs'
import { TOMAS } from '../../../src/lib/operacion-venganza/escena3.js'

const paso = pasosDe(3)
const caminata = caminataDe(3)

export const SONIDOS = [
  { toma: 'cubierta', nombre: 'cubierta' },
  paso('cubierta', 'duckOne', 'paso-duck-one-cubierta'),
  // Las medallas se mueven desde que camina hasta que las revisa.
  { toma: 'cubierta', nombre: 'medallas', cuadro: caminata('cubierta', 'duckOne').cuadro },
  { toma: 'medallas', nombre: 'medallas' },
  // Al subir a la cabina arranca el motor, y su marcha entra con él. Una
  // subida lenta sale con el nombre de biblioteca: «jet engine spool up».
  {
    toma: 'cabina',
    nombre: 'arranque',
    nivel: 'alto',
    segundos: 3.6,
    texto: 'Jet engine start-up, heard from the cockpit of an F-14 Tomcat: a slow spool up from silence, the starter whine winding up higher and higher, the turbine lighting with a rumble, crescendo into a loud idle',
  },
  { toma: 'cabina', nombre: 'cabina-en-cubierta', entra: 3 },
  { tomas: TOMAS.slice(2, -1).map((t) => t.id), nombre: 'cabina-en-cubierta' },
  // Se sube las gafas con el índice en el 5,4 (ajustaGafas en tomas.mjs).
  {
    toma: 'gafas',
    nombre: 'sube-gafas',
    nivel: 'medio',
    cuadros: [5.4],
    segundos: 0.8,
    texto: 'Starting right away: aviator sunglasses pushed back up the bridge of the nose with one gloved fingertip, a small plastic frame slide and a soft click, a faint leather glove creak',
  },
  { toma: 'boton', nivel: 'medio', texto: 'A chunky cockpit button click, then a small electric motor whirring on' },
  { toma: 'limpiaparabrisas', nivel: 'medio', bucle: true, texto: 'A windshield wiper squeaking back and forth across dry glass' },
  // Con la prueba hecha, los motores suben a toda su potencia en la catapulta.
  {
    toma: 'excelente',
    nombre: 'potencia',
    nivel: 'alto',
    segundos: 3,
    entra: 0.3,
    texto: 'Jet engine spool up to full power, heard from the cockpit of an F-14 Tomcat on a carrier catapult: from idle, the turbofans wind up, rising whine and swelling roar, crescendo to a thundering full power',
  },
  // Dura más que la toma: el caza se pierde a lo lejos después del corte.
  {
    toma: 'despegue',
    nombre: 'despegue-duck-one',
    nivel: 'fuerte',
    segundos: 7.5,
    texto: 'A fighter jet launches off an aircraft carrier, seen from behind: engines at full power, the steam catapult slams, a huge afterburner roar as the jet speeds off the bow and climbs away, the roar slowly fading into the far distance',
  },
]

if (import.meta.main) await escribirSonidos(3, TOMAS, SONIDOS)
