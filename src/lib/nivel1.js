/**
 * Operación Venganza, nivel 1: Duck-One, solo, después de la escena 3. El
 * guion del combate que juega src/combate.js en /operacion-venganza/nivel-1:
 * su caza (lib/cazas.js), las vistas por las que pasa la cámara y lo que se
 * dice al final. duck-one escribe como habla: sus faltas son suyas.
 *
 * Cada vista dice dónde mira la cámara (`camara`, en grados) y, si no va a
 * 300 m ni a 150 m/s, a qué altura sobre el mar (`altura`, m) y a qué
 * velocidad (`velocidad`, m/s), cuánto dura el
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
 * con `vaiven` gira la cámara con el tiempo, en radianes, y una con `choque`
 * hace que el caza mismo pegue si toca a quien juega.
 *
 * Duck-One es el que menos sabe pilotar (`torpeza`): se le va el ala, da
 * tirones de mandos y apunta mal (`torcido`).
 */

import { embestida, enCirculo } from './maniobras.js'

const DUCK_ONE = 'Duck-One'

export const CAZAS = { duckOne: { hoja: 'duck-one', torpeza: 1 } }

// La ventana antes de jugar: quién es cada piloto (su retrato sale de
// lib/cazas.js), su lema, cómo pelea y lo que dice quien te derriba.
export const FICHAS = [
  {
    quien: DUCK_ONE,
    papel: 'El líder del escuadrón',
    caza: 'F-14 Tomcat',
    personalidad: 'Mentón arriba, ceja alzada y medallas chuecas pegadas como stickers. Habla como quien dicta cátedra, con palabras difíciles y mal escritas.',
  },
]
export const LEMA = '«Superioridad intelectual».'
export const INTRO = 'Es el que menos sabe pilotar: vuela a tirones y apunta mal, así que no se sabe adónde va a disparar.'
export const TRIUNFO = 'Superioridad tactico-operativa confirmada.'

// Hacia quien juega, errado hasta `desvio` radianes.
const torcido = (c, j, desvio = 0.5) => Math.atan2(j.jugador.y - c.sy, j.jugador.x - c.sx) + (Math.random() - 0.5) * desvio

export const VISTAS = [
  {
    nombre: 'Costado',
    camara: { yaw: -90, pitch: 4, roll: 0 },
    avance: 0,
    fondo: 0,
    dur: 16,
    lineas: [
      { texto: 'Duck-One llega a la zona de combate.' },
      { quien: DUCK_ONE, texto: 'Estimado hadbersario, procederé a ejecutar la Formasión Imperial de Triangulación Inbersa.' },
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
        if (j.cada(s, 'tiro', 1.2, t)) c.abanico(2, 0.3, 52, torcido(c, j))
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
      { quien: DUCK_ONE, texto: 'En los livros de combate, a esto se le conoce como sicocombate 101.' },
    ],
    presenta: (j) => j.cazas.duckOne.ir(j.w * 0.5, j.h * 0.36, 260, 2),
    // Pasadas de 6 s: aparece en el horizonte, se acerca y se encabrita por
    // encima de la cámara. La primera empieza encabritándose.
    mover(t, s, j) {
      embestida(j.cazas.duckOne, t, s, j, { tonel: true })
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
      { quien: DUCK_ONE, texto: 'Aparentemente, por cambios en la conbergencia de la gravedad cósmica, esa bala no llegó a su objetivo.' },
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
      if (j.cada(s, 'abanico', 2.6, t)) c.abanico(4, 1, 42, torcido(c, j, 0.6))
      if (j.cada(s, 'tiro', 1.4, t, 0.7)) c.abanico(1, 0, 55, torcido(c, j))
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
        if (j.cada(s, 'espiral', 0.26, t)) {
          s.giro = (s.giro ?? 0) + 0.3
          c.abanico(1, 0, 36, s.giro)
          c.abanico(1, 0, 36, s.giro + Math.PI)
        }
      } else if (fase > 4.2 && fase < 6.3) {
        if (j.cada(s, 'flor', 1.05, t)) {
          s.flor = (s.flor ?? 0) + 1
          for (let i = 0; i < 8; i++) c.abanico(1, 0, 32, (i / 8) * 2 * Math.PI + s.flor * 0.17)
        }
      } else if (fase >= 6.3 && j.cada(s, 'tiro', 0.8, t)) c.abanico(2, 0.35, 55, torcido(c, j))
    },
  },
  {
    nombre: 'Huida',
    // A ras del mar y a toda velocidad, mirando hacia abajo: quien juega
    // escapa hacia arriba de la pantalla y Duck-One lo persigue desde abajo,
    // como el cañón de Space Invaders, pero aquí el que dispara es él.
    camara: { yaw: 0, pitch: -75, roll: 0 },
    altura: 105,
    velocidad: 220,
    avance: 1,
    fondo: 0,
    choque: true,
    dur: 18,
    lineas: [
      {
        texto: {
          cursor: 'El cursor escapa a ras del mar, a toda velocidad. Duck-One lo persigue desde atrás.',
          huella: 'La huella escapa a ras del mar, a toda velocidad. Duck-One la persigue desde atrás.',
        },
      },
      { quien: DUCK_ONE, texto: 'Ningún hadbersario escapa de mi Persecusión Rasante Imperial.' },
    ],
    presenta: (j) => j.cazas.duckOne.ir(j.w * 0.5, j.h * 0.45, 100, 2),
    // Se pone debajo de quien juega, tarde y pasándose. Cada 4,5 s toma
    // impulso hacia atrás y embiste hacia arriba: el avión también pega.
    mover(t, s, j) {
      const c = j.cazas.duckOne
      const fase = (t + 1) % 4.5
      const embiste = t > 2 && fase > 3.6
      const impulso = t > 2 && fase > 3 && !embiste
      const y = embiste ? Math.max(j.h * 0.2, j.jugador.y) : j.h * (impulso ? 0.92 : 0.8)
      c.ir(j.jugador.x + 5, y, 100, embiste ? 4 : 2.5)
      s.embiste = embiste || impulso
      if (j.cada(s, 'agua', 0.04, t)) j.salpicar(c.sx + (Math.random() - 0.5) * j.h * 0.08, c.sy + j.h * 0.08)
    },
    // Tiros hacia arriba desde las dos alas y, a veces, uno que se le escapa de lado.
    disparar(t, s, j) {
      const c = j.cazas.duckOne
      if (s.embiste || !c.enPantalla()) return
      if (j.cada(s, 'tiro', 0.65, t, 0.5)) {
        const ala = j.h * 0.05
        j.disparo(c.sx - ala, c.sy, 0, -95)
        j.disparo(c.sx + ala, c.sy, 0, -95)
      }
      if (j.cada(s, 'suelto', 1.7, t, 1.2)) c.abanico(1, 0, 70, -Math.PI / 2 + (Math.random() - 0.5) * 1.4)
    },
  },
]

// Al terminar, el caza se va y empiezan las escenas que siguen.
export const FINAL = [
  { quien: DUCK_ONE, texto: 'Recopilación de datos induljentes completada.' },
  { texto: 'Duck-One procede a retirarse.' },
]
