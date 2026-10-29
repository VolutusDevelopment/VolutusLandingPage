/**
 * Operación Venganza, nivel 3: «El fantasma amarillo», después de la escena 11.
 * Duky en su F-22 experimental, con la forma de lib/nivel1.js. Es el nivel
 * difícil: Duky dispara adonde va a estar quien juega (`j.futuro`), como dicen
 * en la escena 13, con armas prototipo de luz violeta, la de su estela (rayos
 * que se apuntan antes de quemar, racimos que revientan) y misiles de
 * seguimiento. Duky no habla: la torre le habla por radio y nadie contesta.
 */

import { embestida, enCirculo } from './maniobras.js'

const TORRE = 'Torre de control'

export const CAZAS = { duky: { hoja: 'duky' } }

export const LEMA = '«El fantasma amarillo».'
export const INTRO = 'Duky no habla. Dispara adonde vas a estar, con armas prototipo y misiles de seguimiento.'
export const TRIUNFO = 'Silencio.'

// Cada golpe quita 7 PV: aguanta 14, no 20.
export const DANO = 7

// Hacia dónde va a estar quien juega en `s` segundos, desde el caza `c`.
const adelante = (c, j, s) => {
  const [x, y] = j.futuro(s)
  return Math.atan2(y - c.sy, x - c.sx)
}

export const VISTAS = [
  {
    nombre: 'Fantasma',
    camara: { yaw: -90, pitch: 4, roll: 0 },
    avance: 0,
    fondo: 0,
    dur: 16,
    lineas: [{ texto: 'El Fantasma Amarillo aparece en el horizonte, sin un sonido.' }, { texto: 'El radar emite un pitido.' }],
    presenta: (j) => j.cazas.duky.ir(j.w * 0.72, j.h * 0.28, 110, 2.5),
    mover(t, s, j) {
      j.cazas.duky.pasada(t, 2.6, 0.68, j.h * (0.2 + 0.06 * Math.sin(2 * t)), 95)
    },
    disparar(t, s, j) {
      const c = j.cazas.duky
      if (!c.enPantalla(j.w * 0.05)) return
      if (j.cada(s, 'tiro', 0.7, t)) c.abanico(3, 0.18, 80, adelante(c, j, 0.45), { forma: 'violeta' })
      if (j.cada(s, 'racimo', 2, t, 1)) c.racimo(...j.futuro(1.4), { n: 10, rapidez: 40 })
    },
  },
  {
    nombre: 'El futuro',
    camara: { yaw: 0, pitch: 2, roll: 0 },
    dur: 17,
    lineas: [
      { texto: { cursor: 'Duky dispara adonde va a estar el cursor, no adonde está.', huella: 'Duky dispara adonde va a estar el dedo, no adonde está.' } },
      { quien: TORRE, texto: 'Fantasma Amarillo, ese armamento es experimental. Úselo con moderación.' },
    ],
    presenta: (j) => j.cazas.duky.ir(j.w * 0.5, j.h * 0.36, 260, 2),
    mover(t, s, j) {
      s.u = embestida(j.cazas.duky, t, s, j, { periodo: 5 })
    },
    // Rayos que se apuntan adonde vas y tiros que caen donde vas a estar.
    disparar(t, s, j) {
      const c = j.cazas.duky
      if (s.u < 0.15 || s.u > 0.7 || !c.enPantalla()) return
      if (j.cada(s, 'rayo', 1.2, t)) c.rayo(...j.futuro(0.6), { carga: 0.75 })
      if (j.cada(s, 'tiro', 0.6, t, 0.3)) c.hondo(...j.futuro(1), 1)
    },
  },
  {
    nombre: 'Misiles',
    camara: { yaw: -55, pitch: 8, roll: -6 },
    avance: 0,
    fondo: 0,
    dur: 18,
    lineas: [{ texto: 'Se abren las compuertas del caza experimental.' }, { texto: 'Misiles de seguimiento.' }],
    presenta: (j) => j.cazas.duky.ir(j.w * 0.3, j.h * 0.25, 130, 2.5),
    mover(t, s, j) {
      j.cazas.duky.pasada(t, 3.2, 0.34, j.h * 0.22, 120)
    },
    disparar(t, s, j) {
      const c = j.cazas.duky
      if (j.cada(s, 'soplo', 4, t, 1)) {
        s.soplos = (s.soplos ?? 0) + 1
        j.soplar(s.soplos % 2 ? 1 : -1, 0.9, 2.4)
      }
      if (!c.enPantalla(j.w * 0.05)) return
      if (j.cada(s, 'misiles', 2.4, t, 0.5)) {
        c.misil({ rapidez: 68, giro: 2 })
        c.misil({ rapidez: 68, giro: 2 })
      }
      if (j.cada(s, 'tiro', 0.9, t)) c.abanico(1, 0, 85, adelante(c, j, 0.5), { forma: 'violeta' })
    },
  },
  {
    nombre: 'Tonel',
    camara: { yaw: -20, pitch: 62, roll: 0 },
    // Gira sobre sí mismo: el cielo da vueltas sin parar.
    vaiven: (t) => t * 0.45,
    avance: 0,
    fondo: 0,
    dur: 20,
    lineas: [
      { texto: 'Duky gira sobre sí mismo, y todo el cielo gira con él.' },
      { quien: TORRE, texto: 'Fantasma Amarillo, ¿me recibe?' },
      { texto: 'Silencio.' },
    ],
    presenta: (j) => j.cazas.duky.ir(j.w * 0.5, j.h * 0.32, 170, 2),
    mover(t, s, j) {
      j.cazas.duky.enMundo(enCirculo(1.1 * t, 55, 130), 6)
    },
    // Cada 8 s: una espiral de tres brazos, misiles con rayos, y racimos con
    // tiros adonde vas.
    disparar(t, s, j) {
      const c = j.cazas.duky
      const fase = t % 8
      if (fase < 3) {
        if (j.cada(s, 'espiral', 0.14, t)) {
          s.giro = (s.giro ?? 0) + 0.27
          for (let i = 0; i < 3; i++) c.abanico(1, 0, 40, s.giro + (i * 2 * Math.PI) / 3, { forma: 'violeta' })
        }
      } else if (fase < 5) {
        if (j.cada(s, 'misiles', 2, t)) c.misil({ rapidez: 64, giro: 1.9 })
        if (j.cada(s, 'rayo', 0.9, t)) c.rayo(...j.futuro(0.6), { carga: 0.8 })
      } else {
        if (j.cada(s, 'racimo', 1.4, t)) c.racimo(...j.futuro(1.2), { n: 8, rapidez: 38 })
        if (j.cada(s, 'tiro', 0.7, t, 0.35)) c.abanico(3, 0.24, 75, adelante(c, j, 0.45), { forma: 'violeta' })
      }
    },
  },
]

// Al terminar sigue la escena 13: la sala de mando mira los monitores.
export const FINAL = [{ texto: 'Silencio.' }, { texto: 'El radar emite un pitido.' }]
