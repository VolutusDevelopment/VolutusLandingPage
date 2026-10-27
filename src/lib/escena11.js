/**
 * Operación Venganza, escena 11: «Preparativos», la primera del nivel 3,
 * «El fantasma amarillo». El guion que reproduce src/operacion-venganza.js en
 * /operacion-venganza/escena-11, con la forma del de la escena 1
 * (lib/escena1.js), de donde salen también las medidas de las tiras: `ms` por
 * cuadro, `cuadros` si no son los de siempre, `unaVez` si la tira corre una
 * sola vez, y sus líneas. Las tiras las escribe
 * scripts/operacion-venganza/escena11/sprites.mjs, desde las tomas en 3D.
 *
 * Duky no habla. La torre de control le habla por radio y nadie contesta.
 */

const TORRE = 'Torre de control'

export const TOMAS = [
  // El caza de duky, solo en el hangar.
  { id: 'nivel', ms: 200, cuadros: 24, unaVez: true, lineas: [{ texto: 'NIVEL 3 — DUKY.' }, { texto: '«El fantasma amarillo».' }] },
  { id: 'recoge', ms: 150, cuadros: 40, unaVez: true, lineas: [{ texto: 'Un marinero entra en la sala y recoge a Duky.' }] },
  { id: 'hangar', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'Lo lleva al hangar…' }] },
  { id: 'deposita', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: '…y lo deposita en la cabina de un caza experimental.' }] },
  { id: 'cinturon', ms: 150, lineas: [{ texto: 'El cinturón no encaja.' }] },
  {
    id: 'encoge',
    ms: 150,
    cuadros: 24,
    unaVez: true,
    lineas: [{ texto: 'El marinero lo intenta una vez más, se encoge de hombros y cierra la cabina.' }],
  },
  // Desde el tablero, de frente: jadea de la emoción y lo lanza la catapulta.
  {
    id: 'emocion',
    ms: 150,
    cuadros: 40,
    unaVez: true,
    lineas: [{ texto: 'Duky empieza a inhalar y exhalar rápidamente, de la emoción.' }, { texto: 'El caza acelera a toda velocidad.' }],
  },
  { id: 'despega', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'El avión despega.' }] },
  { id: 'combate', ms: 300, lineas: [{ texto: 'DUKY SE HA UNIDO AL COMBATE.' }] },

  // La radio: la torre, desde la consola de radar, y duky en su cabina.
  { id: 'radio', ms: 150, lineas: [{ quien: TORRE, texto: 'Torre de control, aquí torre de control, ¿me recibe?' }] },
  { id: 'silencio', ms: 150, lineas: [{ texto: 'Silencio.' }] },
  { id: 'pitido', ms: 150, lineas: [{ texto: 'El radar emite un pitido.' }] },
  { id: 'termina', ms: 150, lineas: [{ quien: TORRE, texto: 'Bien, Fantasma Amarillo, termina con ese maldito.' }] },
  { id: 'calla', ms: 150, lineas: [{ texto: 'Silencio.' }] },
  { id: 'otroPitido', ms: 150, lineas: [{ texto: 'El radar emite un pitido.' }] },
]

export const rutaDeToma = ({ id }) => `/operacion-venganza/escena11/${id}.png`
