/**
 * Operación Venganza, escena 9: «Retirada». El guion que reproduce
 * src/operacion-venganza.js en /operacion-venganza/escena-9, con la forma del
 * de la escena 1 (lib/escena1.js), de donde salen también las medidas de las
 * tiras: `ms` por cuadro, `cuadros` si no son los de siempre, `unaVez` si la
 * tira corre una sola vez, y sus líneas. Las tiras las escribe
 * scripts/operacion-venganza/escena9/sprites.mjs, desde las tomas en 3D.
 *
 * Moby y Duke, en vuelo, y la torre que les habla por radio desde la consola
 * de radar de la sala de mando. Después, la cubierta del Sitting Ducks. Cada
 * toma tiene a lo más quien hable, y solo a él se le mueve el pico.
 */

const TORRE = 'Torre de control'
const MOBY = 'Moby-Duck'
const DUKE = 'Duke SkyDucker'

export const TOMAS = [
  { id: 'alarma', ms: 150, lineas: [{ texto: 'Una alarma de combustible suena en ambos cazas.' }] },
  {
    id: 'regresen',
    ms: 150,
    lineas: [
      { quien: TORRE, texto: 'Patoon-4, regresen inmediatamente al portaaviones.' },
      { quien: TORRE, texto: 'Combustible insuficiente para continuar el enfrentamiento.' },
    ],
  },
  { id: 'tengo', ms: 150, lineas: [{ quien: MOBY, texto: '¡TENGO COMBUSTIBLE!' }] },
  { id: 'presupuesto', ms: 150, lineas: [{ quien: TORRE, texto: 'El suyo sí. El del presupuesto no.' }] },
  { id: 'significa', ms: 150, lineas: [{ quien: MOBY, texto: '¡¿QUÉ SIGNIFICA ESO?!' }] },
  { id: 'recortado', ms: 150, lineas: [{ quien: DUKE, texto: 'Que alguien ha recortado la financiación.' }] },
  { id: 'contabilidad', ms: 150, lineas: [{ quien: MOBY, texto: '¡VOY A DESTRUIR EL DEPARTAMENTO DE CONTABILIDAD!' }] },
  { id: 'adicional', ms: 150, lineas: [{ quien: DUKE, texto: 'Eso requeriría presupuesto adicional.' }] },

  { id: 'regresan', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'Los dos cazas regresan al portaaviones.' }] },
  { id: 'aterrizan', ms: 150, cuadros: 32, unaVez: true, lineas: [{ texto: 'Ambos aterrizan en el Sitting Ducks.' }] },
  { id: 'saltito', ms: 150, unaVez: true, lineas: [{ texto: 'Duke sale de un saltito…' }] },
  { id: 'fuselaje', ms: 150, lineas: [{ texto: '…y aprovecha de mirarse en el fuselaje.' }] },
  {
    id: 'abolladura',
    ms: 150,
    cuadros: 24,
    unaVez: true,
    lineas: [{ texto: 'Moby le pega a su avión, descontrolado.' }, { texto: 'Le deja una abolladura.' }],
  },
  // A ras de cubierta, la cámara sube despacio por la isla hasta el último piso.
  { id: 'torre', ms: 200, cuadros: 40, unaVez: true, lineas: [{ texto: 'Los dos caminan hacia la torre de control.' }] },
]

export const rutaDeToma = ({ id }) => `/operacion-venganza/escena9/${id}.png`
