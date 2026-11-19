// Los sonidos de los niveles
// (src/comportamiento/operacion-venganza/combate.js): todo lo que pasa en la
// pelea, por quién lo hace, con `cuando` suena y su `nivel` (../sonidos.mjs).
// El cielo y los motores son el fondo y se repiten; lo demás son efectos. Los
// que traen `ruta` son de las escenas: un caza que pasa o se va suena igual en
// las dos partes del juego.
//
//   node --env-file=.env.local scripts/operacion-venganza/combate/sonidos.mjs [nombre…]

import { COMUNES, escribir, rutaDeSonido, rutaDeSonidoDeCombate } from '../sonidos.mjs'

export const GRUPOS = ['El cielo', 'Todos los cazas', 'Duck-One', 'Moby-Duck', 'Duke SkyDucker', 'Duky', 'Quien juega', 'Las ventanas']

export const SONIDOS = {
  cielo: { grupo: 'El cielo', cuando: 'De fondo, en los tres niveles.', ...COMUNES.cielo },
  rafaga: {
    grupo: 'El cielo',
    nivel: 'medio',
    cuando: 'Cada ráfaga de viento, que corre a quien juega y curva las balas.',
    segundos: 2.2,
    texto: 'A strong gust of wind whooshing past and fading away',
  },

  entra: {
    grupo: 'Todos los cazas',
    nivel: 'medio',
    cuando: 'Un caza que llega desde lejos.',
    segundos: 6.4,
    texto: 'Two jet fighters approaching from far away, the engine roar slowly rising over a calm sea',
  },
  pasada: {
    grupo: 'Todos los cazas',
    nivel: 'fuerte',
    cuando: 'Cada pasada cerca de la cámara.',
    segundos: 3.6,
    texto: 'Two jet fighters fly past overhead, engines roaring with a doppler sweep',
  },
  tonel: {
    grupo: 'Todos los cazas',
    nivel: 'alto',
    cuando: 'Los toneles de Duck-One y Duky en las embestidas, y la barrena de Duky.',
    segundos: 1.2,
    texto: 'A fighter jet doing a fast barrel roll: a swirling whoosh of air and engine roar panning across',
  },
  embestida: { grupo: 'Todos los cazas', nivel: 'fuerte', cuando: 'El caza se lanza contra quien juega.', ruta: rutaDeSonido(5, 'acelera') },
  impacto: {
    grupo: 'Todos los cazas',
    nivel: 'alto',
    cuando: 'Un misil o una bomba que revienta.',
    segundos: 0.8,
    texto: 'A small mid-air explosion pop with a crackle of debris',
  },
  'se-va': { grupo: 'Todos los cazas', nivel: 'alto', cuando: 'Al ganar, los cazas se van.', ruta: rutaDeSonido(10, 'retirada') },

  'motor-duck-one': {
    grupo: 'Duck-One',
    nivel: 'suave',
    fondo: true,
    bucle: true,
    cuando: 'Su motor, mientras está en pantalla.',
    segundos: 3,
    texto: 'A fighter jet engine sputtering and coughing unevenly, a wobbly clumsy flight with a rattling airframe',
  },
  ametralladora: {
    grupo: 'Duck-One',
    nivel: 'alto',
    cuando: 'Sus ráfagas, mal apuntadas.',
    segundos: 0.8,
    texto: 'A short burst from a fighter jet machine gun, rapid crisp shots',
  },
  bomba: {
    grupo: 'Duck-One',
    nivel: 'alto',
    cuando: 'Las bombas que caen desde la pantalla («Desde abajo»); Moby también las tira.',
    segundos: 1.4,
    texto: 'A falling bomb whistle descending, ending in a small muffled explosion',
  },
  torpe: {
    grupo: 'Duck-One',
    nivel: 'medio',
    cuando: 'Se le va el ala y da tirones de mandos.',
    segundos: 1.2,
    texto: 'A clumsy jet lurching: a control stick jerk, an engine stutter and a wobbling wing creak',
  },
  rasante: {
    grupo: 'Duck-One',
    nivel: 'medio',
    bucle: true,
    cuando: 'Mientras huye a ras del mar («Huida»), salpicando.',
    segundos: 3,
    texto: 'Sea water spraying and hissing as a jet skims just above the waves, rushing wind',
  },

  'motor-moby': {
    grupo: 'Moby-Duck',
    nivel: 'suave',
    fondo: true,
    bucle: true,
    cuando: 'Su A-10, mientras está en pantalla.',
    segundos: 3,
    texto: 'The distinctive high-pitched whine of A-10 Warthog turbofan engines flying close, heavy and rumbling',
  },
  'canon-gordo': {
    grupo: 'Moby-Duck',
    nivel: 'fuerte',
    cuando: 'Cada ráfaga del cañón de siete tubos; en «Cañón», en bucle, sin soltar el gatillo.',
    segundos: 1.5,
    texto: 'A heavy rotary cannon firing a long brrrt burst, deep and powerful',
  },
  'canon-enfria': {
    grupo: 'Moby-Duck',
    nivel: 'medio',
    cuando: 'Mientras el cañón se enfría, antes de los cohetes.',
    segundos: 1.5,
    texto: 'A rotary cannon spinning down after firing, a whirring wind-down with metallic ticks',
  },
  cohete: {
    grupo: 'Moby-Duck',
    nivel: 'alto',
    cuando: 'Cada cohete sin guía de sus salvas.',
    segundos: 0.9,
    texto: 'A single unguided rocket firing from a pod, a sharp fiery whoosh',
  },

  'motor-duke': {
    grupo: 'Duke SkyDucker',
    nivel: 'suave',
    fondo: true,
    bucle: true,
    cuando: 'Su caza, mientras está en pantalla.',
    segundos: 3,
    texto: 'A smooth refined fighter jet engine hum, clean and steady',
  },
  estrellas: {
    grupo: 'Duke SkyDucker',
    nivel: 'medio',
    cuando: 'Sus flores de estrellas, que giran.',
    segundos: 0.8,
    texto: 'A playful sparkly magic shot, a bright twinkling zap',
  },
  destello: { grupo: 'Duke SkyDucker', cuando: 'Los destellos que lo rodean mientras posa.', ...COMUNES.destello },

  'motor-duky': {
    grupo: 'Duky',
    nivel: 'suave',
    fondo: true,
    bucle: true,
    cuando: 'Su F-22 experimental, mientras está en pantalla.',
    segundos: 3,
    texto: 'A powerful stealth fighter engine roar with an eerie pulsing energy hum underneath',
  },
  laser: {
    grupo: 'Duky',
    nivel: 'alto',
    cuando: 'Sus balas de luz violeta, adonde vas a estar.',
    segundos: 0.6,
    texto: 'A quick futuristic violet laser blaster shot, sharp energy zap',
  },
  anillo: {
    grupo: 'Duky',
    nivel: 'alto',
    cuando: 'Sus anillos de balas.',
    segundos: 0.9,
    texto: 'A burst of many energy shots fired at once in a ring, a radiating sci-fi zap',
  },
  misil: {
    grupo: 'Duky',
    nivel: 'alto',
    cuando: 'Cada misil de seguimiento que lanza.',
    segundos: 1.2,
    texto: 'A missile launching with a fiery whoosh and a hissing rocket trail',
  },
  fijado: {
    grupo: 'Duky',
    nivel: 'medio',
    bucle: true,
    cuando: 'Mientras un misil te sigue (la mira roja).',
    segundos: 1.2,
    texto: 'A fighter jet missile lock-on warning tone, fast urgent beeping',
  },
  'rayo-carga': {
    grupo: 'Duky',
    nivel: 'alto',
    cuando: 'El rayo, mientras apunta.',
    segundos: 0.8,
    texto: 'An energy weapon charging up, a rising electric whine',
  },
  rayo: {
    grupo: 'Duky',
    nivel: 'fuerte',
    cuando: 'El rayo, al quemar: tiembla la pantalla.',
    segundos: 0.6,
    texto: 'A powerful energy beam firing, a deep crackling blast',
  },

  golpe: {
    grupo: 'Quien juega',
    nivel: 'alto',
    cuando: 'Cada golpe: 5 PV, o 7 en el nivel 3.',
    segundos: 0.5,
    texto: 'A retro 8-bit video game hurt sound, a short harsh crunchy hit',
  },
  'golpe-fuerte': {
    grupo: 'Quien juega',
    nivel: 'fuerte',
    cuando: 'El rayo de Duky (15 PV), o un caza que te choca.',
    segundos: 0.8,
    texto: 'A heavy crunchy retro video game damage hit with a low boom',
  },
  pausa: {
    grupo: 'Quien juega',
    nivel: 'medio',
    cuando: 'Al pausar, o al levantar el dedo.',
    segundos: 0.6,
    texto: 'A retro 8-bit game pause sound, two short descending blips',
  },
  derrota: {
    grupo: 'Quien juega',
    nivel: 'alto',
    cuando: 'Al quedarse sin PV.',
    segundos: 2.5,
    texto: 'A short sad retro 8-bit video game over jingle, descending notes',
  },
  victoria: {
    grupo: 'Quien juega',
    nivel: 'alto',
    cuando: 'Al sobrevivir la última vista.',
    segundos: 2.5,
    texto: 'A short triumphant retro 8-bit video game victory jingle',
  },

  radio: {
    grupo: 'Las ventanas',
    nivel: 'medio',
    cuando: 'Cuando se abre el cuadro de comunicaciones o cambia quien habla.',
    segundos: 0.5,
    texto: 'A short military radio squelch click, the start of a radio transmission',
  },
  letra: {
    grupo: 'Las ventanas',
    nivel: 'susurro',
    cuando: 'Mientras se escribe el texto.',
    segundos: 0.5,
    texto: 'A tiny soft retro 8-bit text blip, a single short beep',
  },
  vista: {
    grupo: 'Las ventanas',
    nivel: 'medio',
    cuando: 'El rótulo de cada vista, al empezar el ataque.',
    segundos: 1,
    texto: 'A short retro 8-bit alert chime, two rising notes, ready to fight',
  },
  elegir: {
    grupo: 'Las ventanas',
    nivel: 'suave',
    cuando: 'Al moverse por un menú.',
    segundos: 0.5,
    texto: 'A tiny retro 8-bit menu cursor move blip',
  },
  aceptar: {
    grupo: 'Las ventanas',
    nivel: 'medio',
    cuando: 'Al elegir en un menú: «Jugar», «Reintentar», un final.',
    segundos: 0.6,
    texto: 'A short retro 8-bit menu confirm sound, a bright two-note select',
  },
}

// Los nuevos van primero los más necesarios, por si se acaban los créditos.
const ORDEN = ['cohete', 'tonel', 'torpe', 'golpe-fuerte', 'fijado', 'anillo', 'rasante', 'impacto', 'canon-enfria', 'motor-moby', 'motor-duky', 'motor-duck-one', 'motor-duke', 'pausa']
const posicion = (nombre) => (ORDEN.includes(nombre) ? ORDEN.indexOf(nombre) : -1)

if (import.meta.main)
  await escribir(
    Object.entries(SONIDOS)
      .sort(([a], [b]) => posicion(a) - posicion(b))
      .map(([nombre, sonido]) => ({ nombre, bucle: false, ...sonido, ruta: sonido.ruta ?? rutaDeSonidoDeCombate(nombre) })),
  )
