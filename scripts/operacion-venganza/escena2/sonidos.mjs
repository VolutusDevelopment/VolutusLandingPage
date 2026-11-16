// Los sonidos de la escena 2 (src/lib/escena2.js), toma por toma
// (../sonidos.mjs). Solo efectos: los diálogos van sin voz.
//
//   node --env-file=.env.local scripts/operacion-venganza/escena2/sonidos.mjs [nombre…]

import { caminataDe, pasosDe, escribirSonidos } from '../sonidos.mjs'
import { TOMAS } from '../../../src/lib/escena2.js'

// Los cuadros salen de tomas.mjs: la puerta se abre del 6 al 20 (su golpe
// final suena 1,8 s después de empezar), el marinero se inclina sobre el
// sillón del 15 al 20,6 y deja a duky en el 20,6, cada foto se asienta en el 2,5,
// el 12,5 y el 22,5, el palo toca la pantalla en el 1,7 y el 7,5 de cada
// vuelta, duky se desinfla del 2 al 10 y la carpeta se cierra en el 5. Los
// que se van se paran de sus sillones: moby en el 0 y duke en el 2.
const paso = pasosDe(2)
const caminata = caminataDe(2)

// Los que hablan con las manos levantan el brazo del 0 al 3,6 de cada vuelta
// y lo bajan del 9,4 al 12 (curva en pilotos/cuerpos.mjs): les suena la
// ropa, más fuerte donde el brazo va más rápido, a mitad de cada tramo, y a
// los sentados, el sillón. Duck-One tiene sus propios sonidos, con medallas:
// el brazo, el giro y el pecho.
const DE_PIE = {
  ropa: ['reunion', 'proporcional', 'objetivo', 'fantasma', 'porfin'],
  'duck-one-brazo': ['casas', 'desbentaja', 'exposicion', 'diapositivas', 'nadie'],
}
const SENTADOS = { ropa: ['lagartijas', 'sesion', 'motores', 'perfil'], 'duck-one-brazo': ['autobiografias', 'ocho'] }
const gesto = (nombre, toma, cuadros = [1.8, 10.7]) => ({ toma, nombre, cuadros })
const MOVIMIENTOS = [
  ...Object.entries(DE_PIE).flatMap(([nombre, tomas]) => tomas.map((toma) => gesto(nombre, toma))),
  ...Object.entries(SENTADOS).flatMap(([nombre, tomas]) => tomas.flatMap((toma) => [gesto(nombre, toma), gesto('silla-cruje', toma, [1.8])])),
  // El almirante levanta el palo en cada vuelta; duck-one señala sus puestos
  // en una vuelta de 24 cuadros.
  gesto('ropa', 'palo', [1.8]),
  gesto('duck-one-brazo', 'puestos', [3.6, 21.4]),
  // Se gira hacia duky (del 1 al 5,7) y, tras cerrar la carpeta, hacia el
  // almirante (del 6 al 12); la guarda, se gira (del 3 al 12,7) y saca pecho.
  gesto('duck-one-gira', 'miran', [3.4]),
  gesto('duck-one-gira', 'carpeta', [9]),
  gesto('duck-one-brazo', 'gira', [1.5]),
  gesto('duck-one-gira', 'gira', [7.8]),
  gesto('duck-one-pecho', 'gira', [14.3]),
  gesto('ropa', 'duky', [17.7]),
  { toma: 'solo', nombre: 'silla' },
  { toma: 'solo', nombre: 'silla-gira', cuadro: 2 },
]

// Las tres fotos caen en la misma mesa de madera, cada una a su manera.
const EN_LA_MESA = 'Starting right away: a stiff polaroid photo tossed onto a bare wooden table, a crisp flat slap of the card on the wood'

export const SONIDOS = [
  { tomas: TOMAS.slice(0, -1).map((t) => t.id), nombre: 'sala-de-mando' },
  {
    toma: 'puerta',
    nivel: 'alto',
    cuadro: 10,
    segundos: 3.5,
    texto: 'A heavy steel bulkhead door on a warship: a latch handle clanks, the massive door swings slowly open on stiff hinges with a deep low groan, and stops with a heavy solid thud',
  },
  // Cada uno pisa con su paso, y a duck-one se le mueven las medallas.
  paso('medallas', 'duckOne', 'paso-duck-one'),
  { ...caminata('medallas', 'duckOne'), nombre: 'medallas' },
  paso('puro', 'moby', 'paso-moby'),
  paso('reflejo', 'duke', 'paso-duke'),
  paso('duky', 'marinero', 'paso-marinero'),
  {
    toma: 'duky',
    nombre: 'duky-en-la-silla',
    nivel: 'apenas',
    cuadros: [20.6],
    segundos: 0.8,
    texto: 'Starting right away: a small rubber duck toy gently set down on a leather chair seat, a barely audible soft dull rubbery touch against the leather, no squeak',
  },
  ...[
    `${EN_LA_MESA}, then it slides a little with a short smooth swish`,
    `${EN_LA_MESA}, landing first on one edge with a tiny double tap before it lies flat`,
    `${EN_LA_MESA}, landing on top of two other photos, then a short brush of card against card`,
  ].map((texto, i) => ({ toma: 'fotos', nombre: `foto-${i + 1}`, nivel: 'suave', cuadros: [[2.5, 12.5, 22.5][i]], segundos: 1.2, texto })),
  {
    toma: 'palo',
    nombre: 'toque-palo',
    nivel: 'suave',
    cuadros: [1.7, 7.5],
    segundos: 0.5,
    texto: 'Starting right away: a single sharp knock of a wooden pointer stick tapping hard on a glass screen, then silence',
  },
  paso('cautela', 'duckOne', 'paso-duck-one'),
  { ...caminata('cautela', 'duckOne'), nombre: 'medallas' },
  {
    toma: 'despegamos',
    nombre: 'se-inclina',
    nivel: 'medio',
    segundos: 1.2,
    texto: 'A heavy man leans forward over a wooden meeting table: both fists pressed down on the tabletop with a dull thud, the table creaks, his leather chair squeaks',
  },
  { toma: 'mirada', nombre: 'silla-gira' },
  { toma: 'levanta', nombre: 'silla' },
  // Se sienta (su golpe llega a los 0,4 s) y enciende el puro mientras brilla.
  { toma: 'tos', nombre: 'se-sienta' },
  { toma: 'tos', nombre: 'encendedor', cuadro: 3 },
  { toma: 'expediente', nivel: 'suave', texto: 'Quickly flipping through paper pages in a folder' },
  { toma: 'miran', nombre: 'sillas-giran' },
  {
    toma: 'desinfla',
    nivel: 'medio',
    cuadro: 2,
    segundos: 1.5,
    texto: 'A rubber duck toy slowly deflating: a steady squeaky whistle of escaping air for one second, then a soft rubbery wobble',
  },
  { toma: 'alarma', nombre: 'alarma', adentro: true },
  { toma: 'alarma', nombre: 'reinfla', nivel: 'medio', segundos: 1, texto: 'A rubber duck toy suddenly reinflates with a quick rising squeaky whoosh of air and a little bounce' },
  { toma: 'carpeta', nivel: 'alto', cuadro: 3.5, segundos: 0.5, texto: 'A thick cardboard folder snapped shut with one quick sharp slap' },
  { toma: 'porfin', nombre: 'silla' },
  // Se van todos, cada uno con su paso; la puerta queda abierta.
  ...[
    ['moby', 'paso-moby'],
    ['duke', 'paso-duke'],
    ['duckOne', 'paso-duck-one'],
    ['almirante', 'paso-almirante'],
  ].map(([quien, nombre]) => paso('solo', quien, nombre)),
  { ...caminata('solo', 'duckOne'), nombre: 'medallas' },
  ...MOVIMIENTOS,
  // Un ping de sonar cada vez que se enciende «INICIADA» en la pantalla.
  { toma: 'iniciada', nivel: 'alto', cada: 1.8, segundos: 1.8, texto: 'A single deep submarine sonar ping echoing through the water, with a long fading echo' },
]

if (import.meta.main) await escribirSonidos(2, TOMAS, SONIDOS)
