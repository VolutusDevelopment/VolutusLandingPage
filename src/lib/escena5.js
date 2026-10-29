/**
 * Operación Venganza, escena 5: «Regreso». El guion que reproduce
 * src/operacion-venganza.js en /operacion-venganza/escena-5, con la forma del
 * de la escena 1 (lib/escena1.js), de donde salen también las medidas de las
 * tiras: `ms` por cuadro, `cuadros` si no son los de siempre, `unaVez` si la
 * tira corre una sola vez, y sus líneas. Las tiras las escribe
 * scripts/operacion-venganza/escena5/sprites.mjs, desde las tomas en 3D.
 *
 * Pasa en la cubierta del Sitting Ducks, al atardecer. duck-one escribe como
 * habla: sus faltas de ortografía son suyas y van tal cual. Cada toma tiene a
 * lo más quien hable, y solo a él se le mueve el pico.
 */

const DUCK_ONE = 'Duck-One'
const MOBY = 'Moby-Duck'
const DUKE = 'Duke SkyDucker'

export const TOMAS = [
  // El caza llega por la popa, visto desde atrás: abre las alas y baja el tren y el gancho…
  { id: 'aproximacion', ms: 100, cuadros: 30, unaVez: true, lineas: [] },
  // …y aterriza visto desde la cabeza de duck-one: se ladea de lado a lado, golpea
  // la cubierta y frena entre los marinos, que se apartan corriendo.
  {
    id: 'aterrizaje',
    ms: 100,
    cuadros: 44,
    unaVez: true,
    lineas: [{ texto: 'Duck-One aterriza, casi atropellando a los marinos de cubierta, que deben correr del caza.' }],
  },
  { id: 'pose', ms: 150, cuadros: 18, unaVez: true, lineas: [{ texto: 'Sale del avión con una pose heroica.' }] },
  { id: 'ybien', ms: 150, lineas: [{ quien: MOBY, texto: '¿Y bien?' }] },
  {
    id: 'estimasiones',
    ms: 150,
    lineas: [{ quien: DUCK_ONE, texto: 'El enemigo ha demostrado una capacidad de supervivencia superior a las estimasiones iniciales.' }],
  },
  { id: 'lediste', ms: 150, lineas: [{ quien: MOBY, texto: '¿Le diste?' }] },
  { id: 'concluyente', ms: 150, lineas: [{ quien: DUCK_ONE, texto: 'No de forma concluyente.' }] },
  { id: 'inservibles', ms: 150, lineas: [{ quien: MOBY, texto: 'Tus estimaciones son inservibles.' }] },
  {
    id: 'datos',
    ms: 150,
    lineas: [
      { quien: DUCK_ONE, texto: 'La diferencia entre tú y yo, Moby,' },
      { quien: DUCK_ONE, texto: 'es que yo comprendo la importancia de la recopilación de datos.' },
    ],
  },
  { id: 'recopilaste', ms: 150, lineas: [{ quien: DUKE, texto: '¿Qué datos recopilaste?' }] },
  { id: 'bastante', ms: 150, lineas: [{ quien: DUCK_ONE, texto: 'Que se mueve bastante.' }] },
  {
    id: 'marcha',
    ms: 150,
    cuadros: 24,
    unaVez: true,
    lineas: [{ texto: 'Duck-One se marcha con la cabeza alta.' }],
  },
  { id: 'salta', ms: 150, cuadros: 25, unaVez: true, lineas: [{ texto: 'Mirando al horizonte, salta levantando la mano con el dedo índice.' }] },
  { id: 'fase', ms: 150, lineas: [{ quien: DUCK_ONE, texto: '¡Preparad la siguiente fase de la operasión benganza!' }] },
]

export const rutaDeToma = ({ id }) => `/operacion-venganza/escena5/${id}.png`
