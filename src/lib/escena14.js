/**
 * Operación Venganza, escena 14: «Último ataque». El guion que reproduce
 * src/operacion-venganza.js en /operacion-venganza/escena-14, con la forma del
 * de la escena 1 (lib/escena1.js), de donde salen también las medidas de las
 * tiras: `ms` por cuadro, `cuadros` si no son los de siempre, `unaVez` si la
 * tira corre una sola vez, y sus líneas. Las tiras las escribe
 * scripts/operacion-venganza/escena14/sprites.mjs, desde las tomas en 3D.
 *
 * Desde la cabina de duky, con el indicador de munición, que baja de toma en
 * toma hasta cero; después, la sala de mando. Las líneas que nombran a quien
 * juega dicen cursor o dedo, según el modo, y las tomas que lo muestran van
 * `segunModo`. duck-one escribe como habla: sus faltas de ortografía son
 * suyas y van tal cual.
 */

const DUCK_ONE = 'Duck-One'
const DUKE = 'Duke SkyDucker'

// Una línea que nombra a quien juega: `el` cursor o dedo, en `frase`.
const segunQuien = (frase) => ({ cursor: frase('cursor'), huella: frase('dedo') })

export const TOMAS = [
  // La cabina de duky, cortada con tomas de afuera. Cada tira dura lo que se
  // tarda en leer su línea: el ataque no se detiene.
  { id: 'patrones', segunModo: true, ms: 100, cuadros: 37, unaVez: true, lineas: [{ texto: segunQuien((el) => `El ${el} esquiva una sucesión de patrones cada vez más complejos.`) }] },
  { id: 'frente', ms: 90, cuadros: 14, unaVez: true, lineas: [] },
  { id: 'lluvia', segunModo: true, ms: 100, cuadros: 34, unaVez: true, lineas: [{ texto: 'La pantalla se llena de proyectiles y de munición derrochada.' }] },
  { id: 'costado', segunModo: true, ms: 90, cuadros: 14, unaVez: true, lineas: [] },
  { id: 'secuencia', segunModo: true, ms: 100, cuadros: 25, unaVez: true, lineas: [{ texto: 'Duky ejecuta una última secuencia, precisa…' }] },
  { id: 'cola', segunModo: true, ms: 100, cuadros: 30, unaVez: true, lineas: [{ texto: segunQuien((el) => `…que obliga al ${el} a moverse sin descanso.`) }] },
  { id: 'cero', segunModo: true, ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'Finalmente, el indicador de munición llega a cero.' }] },
  { id: 'silencio', segunModo: true, ms: 150, lineas: [{ texto: 'Silencio.' }] },

  // Desde el tablero, y desde afuera. Sin balas, vuelve a ser un pato de hule.
  {
    id: 'chillido',
    ms: 100,
    cuadros: 24,
    lineas: [{ texto: 'Duky se descontrola: es su primera misión fallida y no lo puede soportar.' }, { texto: 'Se retira con un chillido de guerra y de rabia.' }],
  },
  { id: 'retirada', ms: 150, cuadros: 32, unaVez: true, lineas: [{ texto: 'Su caza se da la vuelta rápidamente y se dirige al portaaviones.' }] },
  {
    id: 'respira',
    ms: 150,
    cuadros: 40,
    unaVez: true,
    lineas: [{ texto: 'Como es un pato de hule, primero exhala…' }, { texto: '…y después inhala. Se calma.' }],
  },
  { id: 'vacio', segunModo: true, ms: 150, lineas: [{ texto: 'Silencio.' }] },

  // En la sala de mando, la cámara de duky ya no transmite.
  { id: 'torre', ms: 150, lineas: [{ texto: 'En la torre de mando, todos han seguido las maniobras de Duky.' }] },
  {
    id: 'llora',
    ms: 150,
    lineas: [{ texto: 'Moby se pone a llorar: la misión no se ha completado,' }, { texto: segunQuien((el) => `y el ${el} podría destruir el portaaviones con todos dentro.`) }],
  },
  { id: 'sabe', ms: 150, lineas: [{ quien: DUKE, texto: segunQuien((el) => `¿Crees que el ${el} sabe que estamos aquí?`) }] },
  { id: 'naturalmente', ms: 150, lineas: [{ quien: DUCK_ONE, texto: 'Naturalmente.' }] },
  { id: 'pausa', ms: 150, lineas: [{ texto: 'Pausa.' }] },
  { id: 'moral', ms: 150, lineas: [{ quien: DUCK_ONE, texto: segunQuien((el) => `Creo que si le atacamos con la moral y la hética, el ${el} nos dejará.`) }] },

  // La cámara sigue a cada uno a lo suyo y termina en una esquina de la sala.
  // En `gorro` y `sala` se ve quien juega, a lo lejos por el ventanal.
  { id: 'gorro', segunModo: true, ms: 150, cuadros: 40, unaVez: true, lineas: [{ texto: 'Duck-One camina hacia el ventanal. Por el camino se le cae el gorro y deja ver su pelo.' }] },
  { id: 'circulos', ms: 150, cuadros: 24, lineas: [{ texto: 'Duke empieza a caminar en círculos, mirando su reflejo.' }] },
  { id: 'lagrimas', ms: 150, cuadros: 40, unaVez: true, lineas: [{ texto: 'Moby se sienta y se rompe en lágrimas.' }] },
  { id: 'sala', segunModo: true, ms: 150, cuadros: 32, lineas: [] },
]

export const rutaDeToma = ({ id, segunModo }, modo) => `/operacion-venganza/escena14/${id}${segunModo ? `-${modo}` : ''}.png`
