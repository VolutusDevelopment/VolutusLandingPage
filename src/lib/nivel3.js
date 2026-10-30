/**
 * Operación Venganza, nivel 3: «El fantasma amarillo», después de la escena 11.
 * Duky en su F-22 experimental, con la forma de lib/nivel1.js. Es el nivel
 * difícil: seis vistas, cada una desde una cámara que no sale en los otros
 * niveles y más dura que la anterior. Duky dispara adonde va a estar quien
 * juega (`j.futuro`), como dicen en la escena 13, con armas prototipo de luz
 * violeta, la de su estela: un rayo que se apunta antes de quemar y quita
 * 15 PV, anillos de balas y misiles de seguimiento. Todo sale del caza: nada
 * cae desde fuera en un punto marcado. Duky no habla: la torre le habla por
 * radio y nadie contesta.
 */

import { embestida } from './maniobras.js'

const TORRE = 'Torre de control'

export const CAZAS = { duky: { hoja: 'duky' } }

export const FICHAS = [
  {
    quien: 'Duky',
    papel: 'El fantasma amarillo',
    caza: 'F-22A Raptor',
    personalidad: 'Un pato de hule gigante, con la cara de siempre. No habla: cuando le toca, aparecen tres puntos y nada más.',
  },
]
export const LEMA = '«El fantasma amarillo».'
export const INTRO = 'Duky no habla. Dispara adonde vas a estar, y su rayo quita 15 PV de un golpe.'
export const TRIUNFO = 'Silencio.'

// Cada golpe quita 7 PV, y el rayo, 15.
export const DANO = 7

// El rayo de Duky hacia [x, y]: grueso, destructivo, y avisa antes de quemar.
const rayo = (c, [x, y], extra) => c.rayo(x, y, { carga: 0.85, dura: 0.3, ancho: 5, dano: 15, ...extra })

// Hacia dónde va a estar quien juega en `s` segundos, desde el caza `c`.
const adelante = (c, j, s) => {
  const [x, y] = j.futuro(s)
  return Math.atan2(y - c.sy, x - c.sx)
}

// Un anillo de `n` balas que sale del caza hacia todos lados.
const anillo = (c, s, n, rapidez) => {
  s.anillos = (s.anillos ?? 0) + 1
  for (let i = 0; i < n; i++) c.abanico(1, 0, rapidez, ((i + (s.anillos % 2) / 2) * 2 * Math.PI) / n, { forma: 'violeta' })
}

// Una espiral de `brazos` brazos que gira: una bala por brazo cada vez.
const espiral = (c, s, brazos, rapidez) => {
  s.giro = (s.giro ?? 0) + 0.27
  for (let i = 0; i < brazos; i++) c.abanico(1, 0, rapidez, s.giro + (i * 2 * Math.PI) / brazos, { forma: 'violeta' })
}

export const VISTAS = [
  {
    nombre: 'Contraluz',
    // De frente al sol: Duky cruza delante de él, recortado.
    camara: { yaw: -66, pitch: 3, roll: 0 },
    avance: 0,
    fondo: 0,
    dur: 16,
    lineas: [{ texto: 'El Fantasma Amarillo sale del sol, sin un sonido.' }, { texto: 'El radar emite un pitido.' }],
    presenta: (j) => j.cazas.duky.ir(j.w * 0.72, j.h * 0.28, 110, 2.5),
    mover(t, s, j) {
      j.cazas.duky.pasada(t, 3, 0.68, j.h * (0.24 + 0.05 * Math.sin(2 * t)), 100)
    },
    disparar(t, s, j) {
      const c = j.cazas.duky
      if (!c.enPantalla(j.w * 0.05)) return
      if (j.cada(s, 'tiro', 0.8, t)) c.abanico(3, 0.18, 78, adelante(c, j, 0.45), { forma: 'violeta' })
      if (j.cada(s, 'abanico', 2.4, t, 1)) c.abanico(7, 1.2, 46, adelante(c, j, 0.8), { forma: 'violeta' })
      if (j.cada(s, 'rayo', 3.4, t, 2)) rayo(c, [j.jugador.x, j.jugador.y], { carga: 1 })
    },
  },
  {
    nombre: 'Retaguardia',
    // Mirando hacia atrás: Duky viene desde la cola, se acerca y pasa de largo.
    camara: { yaw: 180, pitch: 3, roll: 0 },
    avance: 0.85,
    dur: 17,
    lineas: [
      {
        texto: {
          cursor: 'Duky se pone detrás del cursor y dispara adonde va a estar, no adonde está.',
          huella: 'Duky se pone detrás de la huella y dispara adonde va a estar, no adonde está.',
        },
      },
      { quien: TORRE, texto: 'Fantasma Amarillo, ese armamento es experimental. Úselo con moderación.' },
    ],
    presenta: (j) => j.cazas.duky.ir(j.w * 0.5, j.h * 0.36, 260, 2),
    mover(t, s, j) {
      s.u = embestida(j.cazas.duky, t, s, j, { periodo: 4.8, tonel: true })
    },
    // Rayos y tiros adonde vas a estar.
    disparar(t, s, j) {
      const c = j.cazas.duky
      if (s.u < 0.15 || s.u > 0.7 || !c.enPantalla()) return
      if (j.cada(s, 'rayo', 1.5, t)) rayo(c, j.futuro(0.6))
      if (j.cada(s, 'tiro', 0.75, t, 0.3)) c.abanico(2, 0.14, 95, adelante(c, j, 0.6), { forma: 'violeta' })
    },
  },
  {
    nombre: 'Rasante',
    // A 24 m sobre el mar, que pasa a toda velocidad.
    camara: { yaw: -30, pitch: 6, roll: 0 },
    altura: 24,
    velocidad: 200,
    avance: 0,
    fondo: 0,
    dur: 18,
    lineas: [{ texto: 'Duky baja a ras del mar y abre las compuertas del caza.' }, { texto: 'Misiles de seguimiento.' }],
    presenta: (j) => j.cazas.duky.ir(j.w * 0.3, j.h * 0.25, 130, 2.5),
    mover(t, s, j) {
      j.cazas.duky.pasada(t, 3, 0.34, j.h * 0.24, 115)
    },
    disparar(t, s, j) {
      const c = j.cazas.duky
      if (j.cada(s, 'soplo', 4, t, 1)) {
        s.soplos = (s.soplos ?? 0) + 1
        j.soplar(s.soplos % 2 ? 1 : -1, 0.9, 2.4)
      }
      if (!c.enPantalla(j.w * 0.05)) return
      if (j.cada(s, 'misiles', 2.3, t, 0.5)) {
        c.misil({ rapidez: 70, giro: 2.1 })
        c.misil({ rapidez: 70, giro: 2.1 })
      }
      if (j.cada(s, 'tiro', 0.85, t)) c.abanico(1, 0, 88, adelante(c, j, 0.5), { forma: 'violeta' })
      if (j.cada(s, 'anillo', 3, t, 1.5)) anillo(c, s, 10, 40)
    },
  },
  {
    nombre: 'Filo',
    // La cámara de canto: el horizonte queda de pie y Duky hace rizos.
    camara: { yaw: -90, pitch: 2, roll: 90 },
    avance: 0,
    fondo: 0,
    dur: 18,
    lineas: [{ texto: 'Duky pone el caza de filo, y el horizonte queda de pie.' }, { quien: TORRE, texto: 'Fantasma Amarillo, confirme su posición.' }],
    presenta: (j) => j.cazas.duky.ir(j.w * 0.7, j.h * 0.3, 110, 2.5),
    mover(t, s, j) {
      j.cazas.duky.pasada(t, 2.8, 0.68, j.h * (0.22 + 0.06 * Math.sin(1.5 * t)), 100)
    },
    // El rayo barre un abanico, que se marca mientras carga: hay que salir de él.
    disparar(t, s, j) {
      const c = j.cazas.duky
      if (!c.enPantalla(j.w * 0.05)) return
      if (t % 6 < 2.5 && j.cada(s, 'espiral', 0.16, t)) espiral(c, s, 3, 40)
      if (j.cada(s, 'rayo', 2.8, t, 1)) {
        s.rayos = (s.rayos ?? 0) + 1
        rayo(c, [j.jugador.x, j.jugador.y], { carga: 0.9, dura: 0.7, barre: s.rayos % 2 ? 0.9 : -0.9 })
      }
    },
  },
  {
    nombre: 'Invertido',
    // Cabeza abajo: el mar queda arriba y Duky embiste girando.
    camara: { yaw: 0, pitch: -3, roll: 180 },
    dur: 19,
    lineas: [{ texto: 'Duky vuela de espaldas. El mar queda arriba.' }, { quien: TORRE, texto: 'Fantasma Amarillo, ¿me recibe?' }, { texto: 'Silencio.' }],
    presenta: (j) => j.cazas.duky.ir(j.w * 0.5, j.h * 0.4, 260, 2),
    mover(t, s, j) {
      s.u = embestida(j.cazas.duky, t, s, j, { periodo: 4.6, tonel: true })
    },
    // Dos rayos a la vez, adonde está y adonde va a estar, misiles y tiros.
    disparar(t, s, j) {
      const c = j.cazas.duky
      if (s.u < 0.15 || s.u > 0.7 || !c.enPantalla()) return
      if (j.cada(s, 'rayo', 1.6, t)) {
        rayo(c, [j.jugador.x, j.jugador.y])
        rayo(c, j.futuro(0.7))
      }
      if (j.cada(s, 'misil', 2.4, t, 0.8)) c.misil({ rapidez: 70, giro: 2 })
      if (j.cada(s, 'tiro', 0.5, t, 0.25)) c.abanico(1, 0, 100, adelante(c, j, 0.5), { forma: 'violeta' })
    },
  },
  {
    nombre: 'Barrena',
    // Mirando hacia el mar, que gira sin parar: Duky da vueltas debajo.
    camara: { yaw: -20, pitch: -50, roll: 0 },
    vaiven: (t) => t * 0.5,
    avance: 0,
    fondo: 0,
    dur: 22,
    lineas: [{ texto: 'Duky entra en barrena hacia el mar, y todo gira con él.' }, { quien: TORRE, texto: 'Fantasma Amarillo, ¡suba! ¡Suba!' }],
    presenta: (j) => j.cazas.duky.ir(j.w * 0.5, j.h * 0.4, 150, 2),
    mover(t, s, j) {
      const ang = 1.1 * t
      j.cazas.duky.enMundo([91 + 55 * Math.cos(ang), -115 + 8 * Math.sin(2 * ang), -33 + 55 * Math.sin(ang)], 6)
    },
    // Cada 8 s: una espiral de cuatro brazos, misiles con el rayo que barre,
    // y anillos con tiros adonde vas.
    disparar(t, s, j) {
      const c = j.cazas.duky
      const fase = t % 8
      if (fase < 3) {
        if (j.cada(s, 'espiral', 0.16, t)) espiral(c, s, 4, 42)
      } else if (fase < 5.5) {
        if (j.cada(s, 'misiles', 2, t)) c.misil({ rapidez: 66, giro: 2 })
        if (j.cada(s, 'rayo', 1.2, t)) {
          s.rayos = (s.rayos ?? 0) + 1
          rayo(c, j.futuro(0.5), { dura: 0.6, barre: s.rayos % 2 ? 0.8 : -0.8 })
        }
      } else {
        if (j.cada(s, 'anillo', 1.6, t)) anillo(c, s, 12, 40)
        if (j.cada(s, 'tiro', 0.6, t, 0.3)) c.abanico(3, 0.24, 78, adelante(c, j, 0.45), { forma: 'violeta' })
      }
    },
  },
]

// Al terminar sigue la escena 13: la sala de mando mira los monitores.
export const FINAL = [{ texto: 'Silencio.' }, { texto: 'El radar emite un pitido.' }]
