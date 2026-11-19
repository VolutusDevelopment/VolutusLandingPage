// Los sonidos de la escena 10 (src/lib/operacion-venganza/escena10.js), toma
// por toma (../sonidos.mjs). Solo efectos: los diálogos van sin voz.
//
//   node --env-file=.env.local scripts/operacion-venganza/escena10/sonidos.mjs [nombre…]

import { caminataDe, pasosDe, escribirSonidos } from '../sonidos.mjs'
import { TOMAS } from '../../../src/lib/operacion-venganza/escena10.js'

const EN_EL_AIRE = ['patrones', 'frente', 'lluvia', 'costado', 'secuencia', 'cola', 'cero', 'silencio', 'chillido', 'retirada', 'respira', 'vacio']
const EN_LA_TORRE = TOMAS.slice(EN_EL_AIRE.length).map((t) => t.id)
// Lo que se oye depende de dónde está la cámara: en la cabina, su cabina y
// sus cañones desde adentro; afuera, su motor y sus cañones desde donde se
// los ve: de frente (desde quien juega), de costado y desde atrás, lejos.
const AFUERA = ['frente', 'costado', 'cola', 'retirada']
const EN_CABINA = EN_EL_AIRE.filter((id) => !AFUERA.includes(id))

const paso = pasosDe(10)
const caminata = caminataDe(10)

// Más cuadros de tomas.mjs: los misiles salen de a pares en el 6, 11, 16 y 21
// de `lluvia` y en el 1,1 y 4,4 de `costado` (DERROCHE), y los racimos en el
// 13 y 25, que revientan 0,45 s después. Duky se aprieta cada 3 cuadros en
// `chillido`, hasta que grita en su segunda línea (4,36 s); exhala desde el 3
// e inhala desde el 24 (respira), a duck-one se le cae el gorro en el 12 y
// sigue caminando en el 30 (RECOGE), y moby gira el sillón y cae en él en el
// 16 (SE_SIENTA).
export const SONIDOS = [
  { tomas: EN_CABINA, nombre: 'cabina-duky' },
  { tomas: ['frente', 'costado'], nombre: 'motor-f22' },
  { toma: 'cola', nombre: 'motor-f22', lejos: 0.5 },
  // Dispara sin parar de `patrones` a `cero`, donde el último tiro sale en el
  // cuadro 7 (rafaga, hasta: 0.3, en tomas.mjs).
  { tomas: ['patrones', 'lluvia', 'secuencia'], nombre: 'disparos' },
  { toma: 'cero', nombre: 'disparos', hasta: 7.5 },
  {
    toma: 'frente',
    nombre: 'disparos-de-frente',
    nivel: 'alto',
    bucle: true,
    segundos: 4,
    tramo: [0.2, 2.2],
    texto: "Standing in front of a fighter jet that is firing its cannon straight at you: a constant ripping roar of rapid gunfire from ahead, bullets cracking and whizzing past very close, from the very first instant to the very last, no silence, no pauses, no build-up, realistic",
  },
  {
    toma: 'costado',
    nombre: 'disparos-afuera',
    nivel: 'alto',
    bucle: true,
    segundos: 4,
    tramo: [0.2, 2.2],
    texto: "Outside, next to a fighter jet in flight firing its rotary cannon: a constant, loud, raw tearing roar of gunfire in the open air over the jet engines, from the very first instant to the very last, no silence, no pauses, no build-up, realistic",
  },
  { toma: 'cola', nombre: 'disparos-afuera', lejos: 0.4 },
  {
    toma: 'lluvia',
    nombre: 'misil',
    nivel: 'fuerte',
    cuadros: [6, 11, 16, 21],
    segundos: 2,
    texto: 'Starting right away: a pair of missiles launching off the rails of a fighter jet, a sharp ignition crack and a fierce rocket roar whooshing away fast into the distance',
  },
  { toma: 'costado', nombre: 'misil', cuadros: [1.1, 4.4] },
  {
    toma: 'lluvia',
    nombre: 'racimo',
    nivel: 'alto',
    cuadros: [13, 25],
    segundos: 1,
    texto: 'Starting right away: a prototype energy weapon fires a glowing plasma ball from the nose of a fighter jet, a deep electric thump and a crackling whoosh flying away',
  },
  {
    toma: 'lluvia',
    nombre: 'revienta',
    nivel: 'medio',
    cuadros: [17.5, 29.5],
    segundos: 1.2,
    texto: 'Starting right away: a plasma ball bursts in the distance into a ring of energy bolts, a sharp electric crackle and a quick spreading zap',
  },
  // Sin munición, el cañón sigue girando en vacío desde el último tiro: gira,
  // traquetea y se detiene despacio, hasta el silencio.
  {
    toma: 'cero',
    nombre: 'canon-vacio',
    nivel: 'alto',
    cuadro: 7.5,
    segundos: 4.5,
    texto: "Starting right away: a fighter jet's rotary cannon runs out of ammunition, its barrels keep spinning on empty with a mechanical whirring and rattling while the trigger clicks dry again and again, then the spin slowly winds down to a stop, and one low ammo warning beep",
  },
  // Se descontrola: se aprieta de golpe y se vuelve a inflar, una y otra vez,
  // en cada apretón (chilla, en tomas.mjs), con versiones que se turnan.
  // Después, su grito de guerra.
  {
    toma: 'chillido',
    nombre: 'aprieta',
    nivel: 'alto',
    cuadros: [1.5, 4.5, 7.5, 10.5, 13.5, 16.5, 19.5, 22.5],
    hasta: 43.6,
    segundos: 0.5,
    variantes: 4,
    texto: 'Starting right away: an angry rubber duck toy squeezed hard and fast, one sharp squeaky honk of air rushing out, then a quick whistle as it sucks the air back in',
  },
  {
    toma: 'chillido',
    nombre: 'grito-de-guerra',
    nivel: 'fuerte',
    cuadro: 43.6,
    segundos: 3,
    texto: 'A rubber squeaky toy squeezed hard and held: one long, loud, shrill squeal of rubber and rushing air, then the air runs out with a sputter, a toy, not a person',
  },
  { toma: 'retirada', nivel: 'fuerte', texto: 'A fighter jet banks sharply and roars away into the distance' },
  {
    toma: 'respira',
    nombre: 'exhala',
    nivel: 'medio',
    cuadro: 3,
    segundos: 2,
    texto: 'A rubber duck toy slowly deflates with a long, soft, relieved squeaky sigh of escaping air',
  },
  { toma: 'respira', nombre: 'inhala', nivel: 'medio', cuadro: 24, segundos: 1.8, texto: 'A rubber duck toy slowly reinflates with a gentle rising squeak, calm and steady' },
  { tomas: EN_LA_TORRE, nombre: 'sala-de-mando' },
  {
    tomas: EN_LA_TORRE,
    nombre: 'estatica',
    nivel: 'susurro',
    bucle: true,
    fondo: true,
    segundos: 8,
    texto: 'Soft white noise static hissing from several monitors in a room',
  },
  paso('gorro', 'duckOne', 'paso-duck-one'),
  { ...caminata('gorro', 'duckOne'), nombre: 'medallas' },
  { toma: 'gorro', nivel: 'suave', cuadro: 12, segundos: 0.6, texto: 'A soft cloth military cap falls to the floor with a muffled light flop, no clatter' },
  paso('circulos', 'duke', 'paso-duke'),
  paso('lagrimas', 'moby', 'paso-moby'),
  paso('lagrimas', 'duke', 'paso-duke'),
  paso('sala', 'duke', 'paso-duke'),
  { toma: 'lagrimas', nombre: 'silla-gira' },
  {
    toma: 'lagrimas',
    nombre: 'cae-en-el-sillon',
    nivel: 'fuerte',
    cuadros: [16],
    segundos: 1.5,
    texto: 'Starting right away: a big heavy man drops hard and fast into a leather office chair, a loud thump of the cushion and the chair frame creaking and cracking loudly under his weight',
  },
]

if (import.meta.main) await escribirSonidos(10, TOMAS, SONIDOS)
