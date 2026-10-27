/**
 * Operación Venganza, nivel 1: Duck-One, solo, después de la escena 3. El
 * guion del combate que juega src/combate.js en /operacion-venganza/nivel-1:
 * su caza (lib/cazas.js), las vistas por las que pasa la cámara y lo que se
 * dice al final. duck-one escribe como habla: sus faltas son suyas.
 *
 * Cada vista dice dónde mira la cámara (`camara`, en grados), cuánto dura el
 * ataque (`dur`, s), qué se dice antes (`lineas`), dónde espera el caza
 * mientras tanto (`presenta`), cómo se mueve (`mover`) y qué dispara
 * (`disparar`). Las tres últimas reciben `j`, lo que el combate les presta
 * (ver `prestar` en src/combate.js), con los cazas de `CAZAS` en `j.cazas`, y
 * las dos últimas el tiempo `t` desde que empezó el ataque y `s`, un objeto
 * propio de la vista para recordar cosas. Una vista con `cazas` lleva solo
 * esos; si no, todos.
 *
 * El caza mira hacia donde se mueve en la pantalla; `avance` es la parte de
 * la velocidad de la cámara que conserva (0,35 si no lo dice) y `fondo`
 * cuánto se inclina a alejarse al virar, en m/s (45 si no lo dice). Una vista
 * con `vaiven` gira la cámara con el tiempo, en radianes.
 */

import { embestida, enCirculo } from './maniobras.js'

const DUCK_ONE = 'Duck-One'

export const CAZAS = { duckOne: { hoja: 'duck-one' } }

// Lo que dice la portada bajo el nombre del nivel, y quien te derriba.
export const LEMA = '«Superioridad táctico-operativa».'
export const INTRO = 'Eres quien está detrás de la pantalla. Esquiva las balas del caza de Duck-One mientras el cielo cambia de vista.'
export const TRIUNFO = 'Superioridad tactico-operativa confirmada.'

export const VISTAS = [
  {
    nombre: 'Costado',
    camara: { yaw: -90, pitch: 4, roll: 0 },
    avance: 0,
    fondo: 0,
    dur: 16,
    lineas: [
      { quien: DUCK_ONE, texto: 'Aquí el comandante autoritario Duck-One, máxima autoridad de las fuerzas aeronavales.' },
      { quien: DUCK_ONE, texto: 'Te recomiendo que abandones inmediatamente el espacio aéreo.' },
    ],
    presenta: (j) => j.cazas.duckOne.ir(j.w * 0.72, j.h * 0.3, 110, 2.5),
    mover(t, s, j) {
      s.n = j.cazas.duckOne.pasada(t, 3.2, 0.68, j.h * (0.22 + 0.05 * Math.sin(1.6 * t)), 95)
    },
    disparar(t, s, j) {
      if (t > 8 && !s.rafaga) {
        s.rafaga = true
        j.soplar(-1, 0.6, 2.4)
      }
      const c = j.cazas.duckOne
      if (!c.enPantalla(j.w * 0.06)) return
      if (s.n % 2 === 0) {
        if (j.cada(s, 'tiro', 1.2, t)) c.abanico(2, 0.3, 52)
      } else if (j.cada(s, 'bomba', 0.4, t)) {
        j.disparo(c.sx, c.sy, c.svx * 0.3, 6, { ay: 32 })
      }
    },
  },
  {
    nombre: 'De frente',
    camara: { yaw: 0, pitch: 2, roll: 0 },
    dur: 17,
    lineas: [
      { texto: 'Duck-One se aleja, da la vuelta y vuelve de frente.' },
      { quien: DUCK_ONE, texto: 'No quisiera verme obligado a recurrir a medidas de una complejidad balística superior.' },
    ],
    presenta: (j) => j.cazas.duckOne.ir(j.w * 0.5, j.h * 0.36, 260, 2),
    // Pasadas de 6 s: aparece en el horizonte, se acerca y se encabrita por
    // encima de la cámara. La primera empieza encabritándose.
    mover(t, s, j) {
      embestida(j.cazas.duckOne, t, s, j)
    },
    // Tiros que llegan desde el fondo a donde estaba quien juega y, una vez
    // por pasada, una fila o una columna entera que hay que dejar.
    disparar(t, s, j) {
      const u = ((t + 4.3) % 6) / 6
      const c = j.cazas.duckOne
      if (u < 0.2 || u > 0.68 || !c.enPantalla()) return
      if (j.cada(s, 'tiro', 1, t)) c.hondo(j.jugador.x + (Math.random() - 0.5) * 10, j.jugador.y + (Math.random() - 0.5) * 10)
      const vuelta = Math.floor((t + 4.3) / 6)
      if (u > 0.45 && s.linea !== vuelta) {
        s.linea = vuelta
        const paso = Math.max(24, Math.min(j.w, j.h) / 5)
        if (vuelta % 2) for (let y = paso / 2; y < j.h; y += paso) c.hondo(j.jugador.x, y, 1.8)
        else for (let x = paso / 2; x < j.w; x += paso) c.hondo(x, j.jugador.y, 1.8)
      }
    },
  },
  {
    nombre: 'Ráfagas',
    camara: { yaw: -55, pitch: 8, roll: -6 },
    avance: 0,
    fondo: 0,
    dur: 17,
    lineas: [
      { texto: 'Entra viento desde el mar, en ráfagas.' },
      { quien: DUCK_ONE, texto: 'El viento es una variable que ya e considerado en mis estimasiones.' },
    ],
    presenta: (j) => j.cazas.duckOne.ir(j.w * 0.3, j.h * 0.25, 130, 2.5),
    mover(t, s, j) {
      j.cazas.duckOne.pasada(t, 3.5, 0.34, j.h * (0.2 + 0.06 * Math.sin(1.1 * t)), 120)
    },
    disparar(t, s, j) {
      s.soplo ??= 0
      if (t > 1 + s.soplo * 3) {
        j.soplar(s.soplo % 2 ? -1 : 1, 1.1, 2.4)
        s.soplo++
      }
      const c = j.cazas.duckOne
      if (!c.enPantalla(j.w * 0.05)) return
      if (j.cada(s, 'abanico', 2.4, t)) c.abanico(5, 1, 42)
      if (j.cada(s, 'tiro', 1.4, t, 0.7)) c.abanico(1, 0, 55)
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
      { texto: { cursor: 'Duck-One sube y vuela en círculos sobre el cursor.', huella: 'Duck-One sube y vuela en círculos sobre el dedo.' } },
      { quien: DUCK_ONE, texto: 'Procedo a la recopilasión de datos desde una posición de superioridad.' },
    ],
    presenta: (j) => j.cazas.duckOne.ir(j.w * 0.5, j.h * 0.32, 170, 2),
    // Círculos a 140 m por encima, siempre a la misma altura, ladeado hacia dentro.
    mover(t, s, j) {
      j.cazas.duckOne.enMundo(enCirculo(0.9 * t), 6)
    },
    // Una espiral, tres flores y unos tiros directos, cada 7 s.
    disparar(t, s, j) {
      if (t > 9 && !s.rafaga) {
        s.rafaga = true
        j.soplar(1, 0.7, 2.6)
      }
      const c = j.cazas.duckOne
      const fase = t % 7
      if (fase < 3.5) {
        if (j.cada(s, 'espiral', 0.2, t)) {
          s.giro = (s.giro ?? 0) + 0.3
          c.abanico(1, 0, 36, s.giro)
          c.abanico(1, 0, 36, s.giro + Math.PI)
        }
      } else if (fase > 4.2 && fase < 6.3) {
        if (j.cada(s, 'flor', 1.05, t)) {
          s.flor = (s.flor ?? 0) + 1
          for (let i = 0; i < 10; i++) c.abanico(1, 0, 32, (i / 10) * 2 * Math.PI + s.flor * 0.17)
        }
      } else if (fase >= 6.3 && j.cada(s, 'tiro', 0.8, t)) c.abanico(2, 0.35, 55)
    },
  },
]

// Al terminar, el caza se va y empiezan las escenas que siguen.
export const FINAL = [
  { quien: DUCK_ONE, texto: 'Recopilasión de datos completada. Regreso a la base.' },
  { texto: 'Duck-One vuelve al Sitting Ducks.' },
]
