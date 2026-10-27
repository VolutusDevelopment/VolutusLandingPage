/**
 * Operación Venganza, escena 13: «La sala de mando». El guion que reproduce
 * src/operacion-venganza.js en /operacion-venganza/escena-13, con la forma
 * del de la escena 1 (lib/escena1.js), de donde salen también las medidas de
 * las tiras: `ms` por cuadro, `cuadros` si no son los de siempre, `unaVez` si
 * la tira corre una sola vez, y sus líneas. Las tiras las escribe
 * scripts/operacion-venganza/escena13/sprites.mjs, desde las tomas en 3D.
 *
 * Duck-One, Moby y Duke miran en la pantalla lo que graba la cabina de Duky,
 * como en una película de naves, y ahí está quien juega: las tomas donde se
 * ve van `segunModo`. duck-one escribe como habla: sus faltas de ortografía
 * son suyas y van tal cual.
 */

const DUCK_ONE = 'Duck-One'
const MOBY = 'Moby-Duck'
const DUKE = 'Duke SkyDucker'

export const TOMAS = [
  { id: 'monitores', ms: 150, segunModo: true, lineas: [{ texto: 'En la sala de mando, Duck-One, Moby y Duke observan los monitores.' }] },
  // Lo que graba la cabina de duky.
  { id: 'vuela', ms: 150, segunModo: true, lineas: [{ texto: 'En la pantalla, el Fantasma Amarillo vuela…' }] },
  { id: 'ataca', ms: 150, segunModo: true, lineas: [{ texto: '…ataca…' }] },
  {
    id: 'esquiva',
    ms: 150,
    cuadros: 24,
    unaVez: true,
    segunModo: true,
    lineas: [{ texto: { cursor: '…y esquiva al cursor.', huella: '…y esquiva al dedo.' } }],
  },

  { id: 'pasando', ms: 150, lineas: [{ quien: MOBY, texto: '¿Qué demonios está pasando?' }] },
  {
    id: 'metodologia',
    ms: 150,
    lineas: [
      { quien: DUCK_ONE, texto: 'Parece que Duky está desarrollando una metodología de ataque no conbencional' },
      { quien: DUCK_ONE, texto: 'que hase que el hadbersario no pueda desarrollar un pensamiento.' },
    ],
  },
  { id: 'futuro', ms: 150, lineas: [{ quien: MOBY, texto: '¡ESTÁ DISPARANDO COMO SI PUDIERA VER EL FUTURO!' }] },
  { id: 'antes', ms: 150, lineas: [{ quien: DUKE, texto: 'O como si supiera dónde va a moverse el enemigo antes de que lo haga.' }] },

  { id: 'mira', ms: 150, segunModo: true, lineas: [{ texto: 'Moby mira a Duky en el monitor.' }] },
  // La pantalla se apaga y moby se ve en ella.
  { id: 'reflejo', ms: 150, cuadros: 16, unaVez: true, segunModo: true, lineas: [{ texto: 'Después mira su propio reflejo en la pantalla apagada.' }] },
  { id: 'nomegusta', ms: 150, lineas: [{ quien: MOBY, texto: 'No me gusta ese pato.' }] },
]

export const rutaDeToma = ({ id, segunModo }, modo) => `/operacion-venganza/escena13/${id}${segunModo ? `-${modo}` : ''}.png`
