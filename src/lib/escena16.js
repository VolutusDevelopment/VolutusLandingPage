/**
 * Operación Venganza, escena 16: «Desolación». El guion que reproduce
 * src/operacion-venganza.js en /operacion-venganza/escena-16, con la forma del
 * de la escena 1 (lib/escena1.js), de donde salen también las medidas de las
 * tiras: `ms` por cuadro, `cuadros` si no son los de siempre, `unaVez` si la
 * tira corre una sola vez, y sus líneas. Las tiras las escribe
 * scripts/operacion-venganza/escena16/sprites.mjs, desde las tomas en 3D.
 *
 * El almirante le habla a quien juega, y al final quien juega elige: cada
 * final (`FINALES`) es un botón y sus tomas. La elección queda en la sesión,
 * con la clave `FINAL`, y /nosotros la muestra en su atardecer (src/flota.js):
 * el portaaviones partido en dos, o el mar sin barcos.
 */

const ALMIRANTE = 'Almirante'

// Una línea que nombra a quien juega: `el` cursor o dedo, en `frase`.
const segunQuien = (frase) => ({ cursor: frase('cursor'), huella: frase('dedo') })

export { FINAL } from './final.js'

export const TOMAS = [
  { id: 'llega', ms: 150, cuadros: 40, unaVez: true, lineas: [{ texto: 'El almirante se acerca, solitario, a la proa del portaaviones.' }] },
  {
    id: 'aire',
    ms: 150,
    cuadros: 24,
    lineas: [
      { quien: ALMIRANTE, texto: 'Tú, quien está detrás de este plano dimensional, lograste tu objetivo.' },
      { quien: ALMIRANTE, texto: 'Mataste 15 patos porque querías, nos dejaste en ridículo y ahora estamos sin defensa alguna.' },
    ],
  },
  {
    id: 'mira',
    ms: 150,
    cuadros: 40,
    unaVez: true,
    lineas: [{ texto: 'Pausa. El almirante respira y vuelve a mirar al cielo…' }, { texto: '…pero ahora gira lentamente hacia la cámara y la mira fijamente.' }],
  },
  {
    id: 'espalda',
    ms: 150,
    cuadros: 40,
    unaVez: true,
    lineas: [{ texto: 'La cámara cambia de lugar: ahora lo ve de espaldas, frente al atardecer.' }, { texto: 'Él espera unos segundos, se da la vuelta y camina directo hacia la cámara.' }],
  },
  {
    id: 'caza',
    ms: 150,
    cuadros: 40,
    unaVez: true,
    lineas: [{ texto: 'A mitad de camino, la cámara cambia otra vez: lo mira desde detrás de un caza.' }, { texto: 'Desconcertado, el almirante mira a todos lados… y descubre que la cámara estaba oculta ahí.' }],
  },
  { id: 'persigue', ms: 100, cuadros: 16, unaVez: true, lineas: [{ texto: 'Ahora corre directo hacia la cámara…' }] },
  { id: 'huye', ms: 100, cuadros: 32, unaVez: true, lineas: [{ texto: '…y la cámara, esta vez en primera persona, también se pone a correr.' }] },
  {
    id: 'harari',
    ms: 150,
    cuadros: 24,
    lineas: [
      { quien: ALMIRANTE, texto: 'Como dijo una vez Yuval Noah Harari…' },
      { quien: ALMIRANTE, texto: '¿Hay algo más peligroso que unos dioses insatisfechos e irresponsables que no saben lo que quieren?' },
    ],
  },
  { id: 'vuelve', ms: 150, cuadros: 40, unaVez: true, lineas: [{ texto: 'Vuelve a la proa, pensativo.' }] },
  { id: 'dios', ms: 150, cuadros: 24, lineas: [{ quien: ALMIRANTE, texto: 'Que sea lo que Dios quiera.' }] },
  { id: 'retira', ms: 150, cuadros: 32, unaVez: true, lineas: [{ texto: 'El almirante se retira. La cámara se queda quieta.' }] },
  { id: 'destino', ms: 200, cuadros: 2, lineas: [{ texto: 'Queda en tus manos el destino del portaaviones «Sitting Ducks». Piensa en sus familias.' }] },
]

export const FINALES = {
  hundir: {
    boton: 'Hundir el «Sitting Ducks»',
    tomas: [
      { id: 'caos', ms: 100, cuadros: 24, lineas: [{ texto: 'Todo es un caos: todos corren por sus vidas con las manos en el aire.' }] },
      { id: 'lagrima', ms: 150, cuadros: 32, unaVez: true, lineas: [{ texto: 'El único que no se mueve es el almirante. Una lágrima le cae por la cara.' }] },
      { id: 'ataque', segunModo: true, ms: 120, cuadros: 32, unaVez: true, lineas: [{ texto: segunQuien((el) => `El ${el} ataca el portaaviones y lo parte en dos…`) }] },
      { id: 'hundimiento', ms: 200, cuadros: 48, unaVez: true, lineas: [{ texto: '…y las dos mitades se hunden, como el Titanic.' }] },
    ],
  },
  vivir: {
    boton: 'Dejarlos vivir',
    tomas: [{ id: 'alejan', ms: 200, cuadros: 48, unaVez: true, lineas: [{ texto: 'Todos los portaaviones se alejan por el horizonte.' }] }],
  },
}

// Todas las tomas, las de los dos finales también: se cargan juntas.
export const TODAS = [...TOMAS, ...Object.values(FINALES).flatMap(({ tomas }) => tomas)]

export const rutaDeToma = ({ id, segunModo }, modo) => `/operacion-venganza/escena16/${id}${segunModo ? `-${modo}` : ''}.png`
