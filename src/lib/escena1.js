/**
 * Operación Venganza, escena 1: «El portaaviones». El guion que reproduce
 * src/operacion-venganza.js, toma por toma.
 *
 * Cada toma es una tira de `CUADROS` cuadros (o los suyos, `cuadros`) de
 * `LADO` px de lado, pintados
 * con el motor de las láminas (scripts/operacion-venganza/escena1/sprites.mjs
 * los escribe en `public/`). `ms` es lo que dura cada cuadro; `unaVez`, que
 * la tira corre una sola vez y se queda en el último (la flota que llega, la
 * cámara que sube); si no, da vueltas mientras duran sus líneas. Una toma
 * dura lo que sus líneas, y nunca menos que su tira.
 *
 * Desde la toma del atacante, la pantalla de la sala muestra lo que usa quien
 * juega: un cursor o una huella. Esas tomas (`segunModo`) tienen una tira por
 * modo, y sus líneas, `{ cursor, huella }`.
 *
 * Una línea es lo que dice alguien (`quien`) o, sin `quien`, una acotación:
 * lo que se oye o pasa, como en los subtítulos para sordos.
 */

export const CUADROS = 12
export const LADO = 144
// Lo que se ve de cada cuadro: la franja del medio, en 4:3.
export const ALTO = (LADO * 3) / 4

// La pantalla de carga: duck-one caminando, de tres cuartos.
export const CARGA = { cuadros: 8, lado: 72, ruta: '/operacion-venganza/carga.png' }

export const MODOS = ['cursor', 'huella']

const ALMIRANTE = 'Almirante'
const OFICIAL = 'Oficial de inteligencia'

export const TOMAS = [
  {
    id: 'llegada',
    ms: 250,
    cuadros: 24,
    unaVez: true,
    lineas: [{ texto: 'El mar, vacío. Se oye un ruido lejano de motores.' }, { texto: 'Aparece un portaaviones. Después otro. Y otro más.' }],
  },
  // Panorámica por el costado del barco, hasta su nombre.
  {
    id: 'nombre',
    ms: 200,
    cuadros: 24,
    unaVez: true,
    lineas: [{ texto: 'El más cercano, el Sitting Ducks, se aproxima lentamente.' }],
  },
  {
    id: 'cubierta',
    ms: 300,
    lineas: [{ texto: 'Suenan las alarmas. Los marineros corren de un lado a otro y un avión de mantenimiento bloquea la pista.' }],
  },
  { id: 'subida', ms: 150, unaVez: true, lineas: [] },
  {
    id: 'sala',
    ms: 300,
    lineas: [
      { quien: ALMIRANTE, texto: '¿Cuántas bajas tenemos?' },
      { quien: OFICIAL, texto: 'Quince, señor.' },
    ],
  },
  {
    id: 'pantalla',
    ms: 300,
    lineas: [
      { quien: ALMIRANTE, texto: '¿Quince patos?' },
      { quien: OFICIAL, texto: 'Quince, señor.' },
      { quien: ALMIRANTE, texto: '¿Y cuál fue la justificación del ataque?' },
    ],
  },
  {
    id: 'oficial',
    ms: 150,
    lineas: [{ quien: OFICIAL, texto: 'Ninguna. El responsable parece haberlo hecho por diversión.' }],
  },
  {
    id: 'gafas',
    ms: 200,
    unaVez: true,
    lineas: [
      { texto: 'El almirante se quita lentamente las gafas.' },
      { quien: ALMIRANTE, texto: '¿Por diversión?' },
    ],
  },
  // La cámara recorre la pantalla, foto por foto, y gira hasta el oficial que
  // señala. Lleva el doble de cuadros: un paneo a saltos se lee como cortes.
  {
    id: 'caidos',
    ms: 225,
    cuadros: 24,
    unaVez: true,
    lineas: [
      { quien: OFICIAL, texto: 'Sí, señor.' },
      { quien: ALMIRANTE, texto: 'Quiero a los responsables de esta situación.' },
      { quien: OFICIAL, texto: 'Tenemos una fotografía del atacante.' },
    ],
  },
  {
    id: 'atacante',
    ms: 150,
    segunModo: true,
    lineas: [
      { quien: ALMIRANTE, texto: { cursor: '¿Eso es un cursor?', huella: '¿Eso es un dedo?' } },
      { quien: OFICIAL, texto: 'Sí, señor.' },
      { quien: ALMIRANTE, texto: { cursor: '¿Un cursor ha matado a quince patos?', huella: '¿Un dedo ha matado a quince patos?' } },
      { quien: OFICIAL, texto: { cursor: 'Un cursor de computador, señor.', huella: 'Un dedo humano, señor.' } },
      { quien: ALMIRANTE, texto: 'No mejora la situación.' },
    ],
  },
  {
    id: 'levanta',
    ms: 150,
    unaVez: true,
    segunModo: true,
    lineas: [{ texto: 'El almirante se levanta.' }],
  },
  // Del sillón a la ventana, despacio: lleva más cuadros para que los pasos se lean.
  {
    id: 'ventana',
    ms: 150,
    cuadros: 40,
    unaVez: true,
    segunModo: true,
    lineas: [{ texto: 'Camina despacio hasta la ventana.' }],
  },
  {
    id: 'atardecer',
    ms: 300,
    lineas: [{ texto: 'Se queda mirando el atardecer.' }, { quien: ALMIRANTE, texto: 'Llamen al escuadrón Patoon-4.' }],
  },
  {
    id: 'cuatro',
    ms: 150,
    segunModo: true,
    lineas: [
      { quien: OFICIAL, texto: '¿A los cuatro mejores pilotos de la armada?' },
      { quien: ALMIRANTE, texto: 'A los cuatro que están disponibles.' },
    ],
  },
  { id: 'silencio', ms: 150, unaVez: true, segunModo: true, lineas: [{ quien: OFICIAL, texto: '…' }] },
]

export const cuadrosDe = (toma) => toma.cuadros ?? CUADROS

export const rutaDeToma = ({ id, segunModo }, modo) => `/operacion-venganza/escena1/${id}${segunModo ? `-${modo}` : ''}.png`

export const textoDe = ({ texto }, modo) => (typeof texto === 'string' ? texto : texto[modo])
