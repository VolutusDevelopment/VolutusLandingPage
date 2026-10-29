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
  { id: 'recoge', ms: 150, cuadros: 40, unaVez: true, lineas: [{ texto: 'Un marinero entra en la sala y recoge a Duky.' }] },
  { id: 'choca', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'Intenta pasar, pero choca con la pared de la puerta.' }] },
  // La primera vez que se ve el caza de duky: con la cabina cerrada.
  { id: 'hangar', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'Lo lleva al hangar…' }] },
  { id: 'sube', ms: 150, cuadros: 40, unaVez: true, lineas: [{ texto: '…y sube con él a un caza experimental, mientras la plataforma se eleva…' }] },
  { id: 'deposita', ms: 150, cuadros: 40, unaVez: true, lineas: [{ texto: '…hasta dejarlo en la cabina.' }] },
  { id: 'cinturon', ms: 150, lineas: [{ texto: 'El marinero intenta ponerle el cinturón, pero Duky es medio gordito y no le cierra.' }] },
  {
    id: 'encoge',
    ms: 150,
    cuadros: 33,
    unaVez: true,
    lineas: [{ texto: 'Lo intenta una vez más, se rinde y cierra la cabina. Duky se queda sin cinturón.' }],
  },
  // Desde el comienzo de la pista hasta que deja el portaaviones, en 3 s, con
  // la cámara siempre en duky: pegado al asiento y, ya en el aire, feliz.
  { id: 'despegue', ms: 100, cuadros: 30, unaVez: true, lineas: [{ texto: 'El avión despega.' }] },
  { id: 'emocion', ms: 150, lineas: [{ texto: 'Duky se pone feliz: exhala e inhala rápidamente, de la emoción.' }] },

  // La radio: la torre, desde la consola de radar, y duky en su cabina.
  { id: 'radio', ms: 150, lineas: [{ quien: TORRE, texto: 'Torre de control, aquí torre de control, ¿me recibe?' }] },
  { id: 'silencio', ms: 150, lineas: [{ texto: 'Silencio.' }] },
  { id: 'pitido', ms: 150, lineas: [{ texto: 'El radar emite un pitido.' }] },
  { id: 'termina', ms: 150, lineas: [{ quien: TORRE, texto: 'Bien, Fantasma Amarillo, termina con ese maldito.' }] },
  { id: 'calla', ms: 150, lineas: [{ texto: 'Silencio.' }] },
  { id: 'otroPitido', ms: 150, lineas: [{ texto: 'El radar emite un pitido.' }] },
]

export const rutaDeToma = ({ id }) => `/operacion-venganza/escena11/${id}.png`
