/**
 * Operación Venganza, escena 3: «Despegue». El guion que reproduce
 * src/operacion-venganza.js en /operacion-venganza/escena-3, con la forma del
 * de la escena 1 (lib/escena1.js), de donde salen también las medidas de las
 * tiras: `ms` por cuadro, `cuadros` si no son los de siempre, `unaVez` si la
 * tira corre una sola vez, `segunModo` si lleva el cursor o la huella de quien
 * juega (una tira por modo, como en la escena 1), y sus líneas. Las tiras las
 * escribe scripts/operacion-venganza/escena3/sprites.mjs, desde las tomas en 3D.
 *
 * duck-one le habla al atacante, que es quien juega. Las frases largas van en
 * dos líneas, para que cada una quepa en el alto fijo del subtítulo.
 */

const DUCK_ONE = 'Duck-One'

export const TOMAS = [
  // La cámara acompaña a duck-one por la cubierta hasta su caza…
  { id: 'cubierta', ms: 150, cuadros: 24, unaVez: true, lineas: [] },
  // …y se mete en la cabina, por el costado de la cúpula.
  { id: 'cabina', ms: 150, cuadros: 24, unaVez: true, lineas: [] },
  { id: 'gafas', ms: 150, unaVez: true, lineas: [{ texto: 'Duck-One ajusta sus gafas de sol.' }] },
  { id: 'medallas', ms: 150, lineas: [{ texto: 'Comprueba que sus medallas estén correctamente colocadas.' }] },
  {
    id: 'presentacion',
    ms: 150,
    lineas: [
      { quien: DUCK_ONE, texto: 'Aquí el comandante autoritario Duck-One, máxima autoridad de las fuerzas aeronavales' },
      { quien: DUCK_ONE, texto: 'y especialista en procedimientos de superioridad tactico-operativa.' },
    ],
  },
  {
    id: 'advertencia',
    ms: 150,
    lineas: [
      { quien: DUCK_ONE, texto: 'Te recomiendo que abandones inmediatamente el espacio aéreo.' },
      { quien: DUCK_ONE, texto: 'No quisiera verme obligado a recurrir a medidas de una complegidad balística superior.' },
    ],
  },
  {
    id: 'instrumentos',
    ms: 150,
    lineas: [{ texto: 'Observa los instrumentos.' }, { quien: DUCK_ONE, texto: '¿Dónde está el botón de las armas?' }],
  },
  { id: 'boton', ms: 150, unaVez: true, lineas: [{ texto: 'Pulsa un botón.' }] },
  { id: 'limpiaparabrisas', ms: 150, lineas: [{ texto: 'Se activa el limpiaparabrisas de la cabina.' }] },
  { id: 'excelente', ms: 150, lineas: [{ quien: DUCK_ONE, texto: 'Excelente. Prueba de sistemas completada.' }] },
  { id: 'despegue', ms: 150, cuadros: 24, unaVez: true, segunModo: true, lineas: [{ texto: 'Su caza despega del Sitting Ducks…' }, { texto: { cursor: '…y se lanza contra el cursor, marcado en el cielo.', huella: '…y se lanza contra el dedo, marcado en el cielo.' } }] },
]

export const rutaDeToma = ({ id, segunModo }, modo) => `/operacion-venganza/escena3/${id}${segunModo ? `-${modo}` : ''}.png`
