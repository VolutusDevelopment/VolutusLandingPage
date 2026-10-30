/**
 * Operación Venganza, nivel 2: «La rabia y la belleza», después de la escena 6.
 * Moby-Duck sale solo, furioso, y tras tres vistas llega Duke SkyDucker. Tiene
 * la forma de lib/nivel1.js. Moby grita en mayúsculas y dispara como un A-10
 * de verdad: el cañón de siete tubos como una manguera, a veces sin soltar
 * el gatillo, y cohetes sin guía, que salen derechos. Duke posa y dispara
 * flores de estrellas que giran. Como hablan los dos, cada uno lo hace desde
 * su esquina (`LADOS`).
 */

import { embestida, enCirculo } from './maniobras.js'

const MOBY = 'Moby-Duck'
const DUKE = 'Duke SkyDucker'

export const CAZAS = { moby: { hoja: 'moby' }, duke: { hoja: 'duke', destellos: true } }
export const LADOS = { [MOBY]: 'izquierda', [DUKE]: 'derecha' }

export const FICHAS = [
  {
    quien: MOBY,
    papel: 'La fuerza bruta',
    caza: 'A-10 Thunderbolt II',
    personalidad: 'Puro humeando y pañuelo rojo al viento. Habla a los gritos y, si llora, es el humo.',
  },
  {
    quien: DUKE,
    papel: 'El rostro del escuadrón',
    caza: 'F/A-18C Hornet',
    personalidad: 'Copete rubio y uniforme blanco de gala. Se peina entre destellos: vuela para la foto.',
  },
]
export const LEMA = '«La rabia y la belleza».'
export const INTRO = 'Moby sale primero, solo, con su cañón y sus cohetes. Duke llega cuando hay buena luz.'
export const TRIUNFO = '¡JAJAJAJAJA! ¡ESO ES UN VERDADERO MONSTRUO!'

// El cañón de Moby: ráfagas de `dura` s cada `ciclo` s, un chorro de balas
// gruesas que gira hacia quien juega a lo más `sigue` rad/s. Hay que
// adelantarse al chorro, o pasarle por detrás entre ráfaga y ráfaga.
function chorro(c, t, s, j, { ciclo = 2.2, dura = 1.2, cadencia = 0.09, sigue = 1.1, rapidez = 85 } = {}) {
  const dt = t - (s.chorro ?? t)
  s.chorro = t
  const hacia = Math.atan2(j.jugador.y - c.sy, j.jugador.x - c.sx)
  s.mira ??= hacia
  const d = Math.atan2(Math.sin(hacia - s.mira), Math.cos(hacia - s.mira))
  s.mira += Math.max(-sigue * dt, Math.min(sigue * dt, d))
  if (t % ciclo < dura && j.cada(s, 'bala', cadencia, t)) c.abanico(1, 0, rapidez, s.mira, { forma: 'gruesa' })
}

// Un cohete sin guía: sale hacia donde está quien juega, apenas abierto, y no dobla.
const cohete = (c) => c.misil({ guia: 0, abre: 0.16, rapidez: 125 })

// Una rueda alrededor del blanco, como la de un A-10 antes de cada pasada: a
// 170 m de la cámara de «Cañón», delante y arriba, ladeado hacia dentro.
const rueda = (ang) => [120 + 80 * Math.cos(ang), 80 + 10 * Math.sin(2 * ang), -85 + 80 * Math.sin(ang)]

// Fuego que camina: 7 tiros que caen en fila, uno tras otro, desde un costado
// de quien juega hasta pasarlo. Se esquiva saliéndose de la fila.
function caminata(c, j) {
  const { x, y } = j.jugador
  const ang = Math.random() * Math.PI * 2
  const [ox, oy] = [x + Math.cos(ang) * 70, y + Math.sin(ang) * 70]
  for (let i = 0; i < 7; i++) c.hondo(ox + (x - ox) * (i / 4), oy + (y - oy) * (i / 4), 1 + i * 0.12)
}

// Una flor de Duke: `n` estrellas en anillo que se abren girando.
function flor(c, n, rapidez, curva, giro = 0) {
  for (let i = 0; i < n; i++) c.abanico(1, 0, rapidez, giro + (i / n) * 2 * Math.PI, { forma: 'estrella', curva })
}

export const VISTAS = [
  {
    nombre: 'Embestida',
    camara: { yaw: 0, pitch: 2, roll: 0 },
    cazas: ['moby'],
    dur: 15,
    lineas: [
      { texto: { cursor: 'Moby se lanza de frente contra el cursor, sin frenar.', huella: 'Moby se lanza de frente contra el dedo, sin frenar.' } },
      { quien: MOBY, texto: '¡TU MAMÁ NO TE VA A RECONOCER! ¡VOY A REDUCIR TU PANTALLA A CENIZAS! ¡VOY A…!' },
    ],
    presenta: (j) => j.cazas.moby.ir(j.w * 0.5, j.h * 0.36, 260, 2),
    mover(t, s, j) {
      s.u = embestida(j.cazas.moby, t, s, j)
    },
    disparar(t, s, j) {
      const c = j.cazas.moby
      if (s.u < 0.2 || s.u > 0.7 || !c.enPantalla()) return
      if (j.cada(s, 'caminata', 1.5, t)) caminata(c, j)
      if (s.u > 0.5 && j.cada(s, 'tiro', 0.9, t)) c.abanico(3, 0.4, 60, undefined, { forma: 'gruesa' })
    },
  },
  {
    nombre: 'Metralla',
    camara: { yaw: -90, pitch: 4, roll: 0 },
    cazas: ['moby'],
    avance: 0,
    fondo: 0,
    dur: 16,
    lineas: [
      { texto: 'Moby da una calada al puro y llora. Tose mientras intenta mantener el avión estable.' },
      { quien: MOBY, texto: 'Estoy perfecto.' },
      { quien: DUKE, texto: '¿Estás llorando? Patéticooo.' },
      { quien: MOBY, texto: '¡ES EL HUMO TÁCTICO!' },
    ],
    presenta: (j) => j.cazas.moby.ir(j.w * 0.72, j.h * 0.3, 110, 2.5),
    mover(t, s, j) {
      s.n = j.cazas.moby.pasada(t, 3.6, 0.68, j.h * (0.22 + 0.05 * Math.sin(1.6 * t)), 100)
    },
    // Cerca, ráfagas de cañón; lejos, salvas de cuatro cohetes.
    disparar(t, s, j) {
      const c = j.cazas.moby
      if (!c.enPantalla(j.w * 0.05)) return
      if (s.n % 2 === 0) chorro(c, t, s, j)
      else if (t % 1.8 < 0.5 && j.cada(s, 'cohete', 0.13, t)) cohete(c)
    },
  },
  {
    nombre: 'Cañón',
    camara: { yaw: -35, pitch: 28, roll: 6 },
    cazas: ['moby'],
    avance: 0,
    fondo: 0,
    dur: 16,
    lineas: [
      { texto: 'Moby da vueltas en rueda, aprieta el gatillo del cañón y no lo suelta.' },
      { quien: MOBY, texto: '¡SIETE CAÑONES! ¡TREINTA MILÍMETROS! ¡QUÉDATE QUIETO!' },
      { quien: DUKE, texto: 'Qué ruido más vulgar.' },
    ],
    presenta: (j) => j.cazas.moby.ir(j.w * 0.6, j.h * 0.3, 170, 2),
    mover(t, s, j) {
      j.cazas.moby.enMundo(rueda(0.55 * t), 5)
    },
    // Fuego continuo 4 s, que sigue a quien juega sin alcanzarlo si no se
    // detiene: hay que darle la vuelta. Mientras el cañón se enfría, tres cohetes.
    disparar(t, s, j) {
      const c = j.cazas.moby
      const fase = (t + 1) % 5.5
      if (fase < 4) {
        chorro(c, t, s, j, { ciclo: 5.5, dura: 5.5, cadencia: 0.035, sigue: 0.8, rapidez: 105 })
        j.sacudir(0.25)
      } else if (fase > 4.4 && j.cada(s, 'cohete', 0.3, t)) cohete(c)
    },
  },
  {
    nombre: 'La belleza',
    camara: { yaw: -55, pitch: 8, roll: -6 },
    avance: 0,
    fondo: 0,
    dur: 18,
    lineas: [
      { texto: 'Duke entra a la batalla: su avión hace un giro elegante y entra en una formación simétrica.' },
      { quien: DUKE, texto: 'Observa, Moby. Precisión, control y elegancia.' },
      { quien: MOBY, texto: '¡YA CÁLLATE!' },
    ],
    presenta(j) {
      j.cazas.moby.ir(j.w * 0.25, j.h * 0.3, 120, 2)
      j.cazas.duke.ir(j.w * 0.75, j.h * 0.2, 140, 2)
    },
    // Moby pasa de lado a lado; Duke se pasea arriba, sin apuro.
    mover(t, s, j) {
      j.cazas.moby.pasada(t, 4, 0.2, j.h * 0.32, 110)
      j.cazas.duke.ir(j.w * (0.5 + 0.3 * Math.sin(0.4 * t)), j.h * (0.18 + 0.04 * Math.sin(1.3 * t)), 150, 2)
    },
    disparar(t, s, j) {
      const { moby, duke } = j.cazas
      if (j.cada(s, 'soplo', 5, t, 3)) {
        s.soplos = (s.soplos ?? 0) + 1
        j.soplar(s.soplos % 2 ? 1 : -1, 0.8, 2.4)
      }
      if (j.cada(s, 'flor', 2.2, t)) {
        s.flores = (s.flores ?? 0) + 1
        flor(duke, 12, 34, s.flores % 2 ? 0.6 : -0.6, s.flores * 0.3)
      }
      if (moby.enPantalla(j.w * 0.05)) chorro(moby, t, s, j, { cadencia: 0.13, ciclo: 2.6 })
    },
  },
  {
    nombre: 'Desde abajo',
    camara: { yaw: -20, pitch: 62, roll: 0 },
    vaiven: (t) => 0.4 * Math.sin(t * 0.45),
    avance: 0,
    fondo: 0,
    dur: 18,
    lineas: [
      {
        texto: {
          cursor: 'Moby y Duke vuelan en círculos sobre el cursor, cada uno para su lado.',
          huella: 'Moby y Duke vuelan en círculos sobre el dedo, cada uno para su lado.',
        },
      },
      { quien: DUKE, texto: 'Sal de mi encuadre.' },
    ],
    presenta(j) {
      j.cazas.moby.ir(j.w * 0.65, j.h * 0.35, 170, 2)
      j.cazas.duke.ir(j.w * 0.35, j.h * 0.3, 170, 2)
    },
    mover(t, s, j) {
      j.cazas.moby.enMundo(enCirculo(0.8 * t, 70, 150), 6)
      j.cazas.duke.enMundo(enCirculo(Math.PI - 0.8 * t, 50, 120), 6)
    },
    // Duke abre una espiral de estrellas y Moby suelta anillos de balas gruesas.
    disparar(t, s, j) {
      const { moby, duke } = j.cazas
      if (j.cada(s, 'espiral', 0.2, t)) {
        s.giro = (s.giro ?? 0) + 0.32
        flor(duke, 2, 34, 0.35, s.giro)
      }
      if (j.cada(s, 'anillo', 1.9, t, 1)) {
        s.anillos = (s.anillos ?? 0) + 1
        for (let i = 0; i < 9; i++) moby.abanico(1, 0, 30, (i / 9) * 2 * Math.PI + s.anillos * 0.35, { forma: 'gruesa' })
      }
    },
  },
]

// Al terminar sigue la escena 9, con la alarma de combustible.
export const FINAL = [
  { quien: MOBY, texto: '¡YA CASI TE TENGO! ¡NO TE MUEVAS!' },
  { quien: DUKE, texto: 'Sigue así, Moby. Te ves muy natural.' },
]
