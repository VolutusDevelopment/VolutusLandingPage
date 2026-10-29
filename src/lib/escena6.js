/**
 * Operación Venganza, escena 6: «Entrada», la primera del nivel 2, «La rabia
 * y la belleza». El guion que reproduce src/operacion-venganza.js en
 * /operacion-venganza/escena-6, con la forma del de la escena 1
 * (lib/escena1.js), de donde salen también las medidas de las tiras: `ms` por
 * cuadro, `cuadros` si no son los de siempre, `unaVez` si la tira corre una
 * sola vez, y sus líneas. Las tiras las escribe
 * scripts/operacion-venganza/escena6/sprites.mjs, desde las tomas en 3D.
 *
 * Moby y Duke llegan volando con el sol a la espalda. Duke lleva una cámara en
 * la cabina, y lo que graba se ve con su visor. Al final, Moby se lanza contra
 * quien juega, marcado en el cielo: la última toma va `segunModo`.
 */

const MOBY = 'Moby-Duck'
const DUKE = 'Duke SkyDucker'

export const TOMAS = [
  // Desde el aire, mirando al sol: los dos cazas salen de sus costados.
  {
    id: 'horizonte',
    ms: 200,
    cuadros: 32,
    unaVez: true,
    lineas: [{ texto: 'Los compañeros aparecen en el horizonte, con el sol a la espalda.' }],
  },
  { id: 'moby', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'El avión de Moby es oscuro, pesado y está cubierto de marcas de combate.' }] },
  { id: 'duke', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'El de Duke brilla bajo el sol y parece recién salido de una exhibición.' }] },
  { id: 'juntos', ms: 150, cuadros: 24, unaVez: true, lineas: [] },

  // Desde el tablero de Moby, con el caza de Duke a la derecha.
  {
    id: 'monstruo',
    ms: 150,
    lineas: [
      { quien: MOBY, texto: '¡MUY BIEN, HIJO DE PATA! ¡AHORA VAS A SABER LO QUE ES ENFRENTARTE A UN VERDADERO MONSTRUO!' },
      { quien: MOBY, texto: '¡JAJAJAJAJAJA!' },
    ],
  },
  { id: 'sensores', ms: 150, lineas: [{ quien: DUKE, texto: 'Moby, afectas mis sensores internos.' }] },
  { id: 'mejor', ms: 150, lineas: [{ quien: MOBY, texto: '¡MEJOR!' }] },
  { id: 'camaras', ms: 150, lineas: [{ quien: DUKE, texto: 'Solo quería informarte de que tengo cámaras grabando.' }] },
  { id: 'graben', ms: 150, lineas: [{ quien: MOBY, texto: '¡QUE GRABEN CÓMO LO DESTRUYO!' }] },
  { id: 'humo', ms: 150, lineas: [{ quien: DUKE, texto: 'Perfecto. Intenta no taparme con humo.' }] },

  // Lo que graba la cámara de la cabina de Duke, de frente y por su izquierda.
  { id: 'gira', ms: 150, cuadros: 16, unaVez: true, lineas: [{ texto: 'Duke se gira hacia la cámara de su cabina y le muestra su mejor perfil y sus increíbles ojos azules.' }] },
  {
    id: 'presenta',
    ms: 150,
    lineas: [
      { quien: DUKE, texto: 'Para los espectadores que no me conozcan, soy Duke SkyDucker.' },
      { quien: DUKE, texto: 'Piloto, icono y referente estético de la aviación contemporánea.' },
    ],
  },
  { id: 'destellos', ms: 150, lineas: [{ texto: 'Unos destellos rodean a Duke.' }] },
  { id: 'pato', ms: 150, lineas: [{ quien: MOBY, texto: '¡ERES UN PATO CON UN AVIÓN!' }] },
  { id: 'indescriptible', ms: 150, lineas: [{ quien: DUKE, texto: 'Nah ah, soy indescriptibleee.' }] },

  // Duke lo sigue con la cabeza, y Moby se va contra quien juega.
  { id: 'acelera', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'Duke sigue con la cabeza a Moby, que acelera…' }] },
  {
    id: 'objetivo',
    ms: 150,
    cuadros: 24,
    unaVez: true,
    segunModo: true,
    lineas: [{ texto: { cursor: '…y se lanza contra el cursor, marcado en el cielo.', huella: '…y se lanza contra el dedo, marcado en el cielo.' } }],
  },
]

export const rutaDeToma = ({ id, segunModo }, modo) => `/operacion-venganza/escena6/${id}${segunModo ? `-${modo}` : ''}.png`
