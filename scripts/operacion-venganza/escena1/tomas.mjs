// Las tomas de la escena 1, en 3D: qué se ve en el instante u ∈ [0, 1) y
// desde dónde. Las usan las láminas del lienzo (laminas.mjs) y las tiras del
// juego (sprites.mjs); el guion, con sus líneas, está en src/lib/escena1.js.
//
// `escena(u, modo)` arma la figura; `camara(u)` da [ojo, mira, campo] en
// metros y grados. `modo` es lo que muestra la pantalla de la sala desde el
// atacante: 'cursor' o 'huella'.

import { ALMIRANTE, OFICIAL, MARINEROS, OFICIOS, silaba, suave } from './personajes.mjs'
import { MAR, NOMBRE, PANTALLA, portaaviones, destructor, navegando, sala, colocar } from './lugares.mjs'

const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const fija = (ojo, mira, campo) => () => [ojo, mira, campo]
const alarma = (u) => Math.floor(u * 12) % 2

// ── Fuera ────────────────────────────────────────────────────────────────

// Lejos, a ras del agua: el mar vacío; aparece un portaaviones, otro, otro más
// y la escolta, y el Sitting Ducks, una mancha en el horizonte, se viene acercando.
const FLOTA = [
  [0.15, portaaviones({ avion: false }), 172, [2900, 0, -950]],
  [0.3, portaaviones({ avion: false }), 188, [3300, 0, 820]],
  [0.45, portaaviones({ avion: false }), 176, [2300, 0, -420]],
  [0.55, destructor(), 165, [1700, 0, -1100]],
  [0.55, destructor(), 195, [1900, 0, 1000]],
  [0.6, destructor(), 180, [2600, 0, 250]],
  [0.65, destructor(), 160, [1300, 0, 700]],
]
const llegada = (u) => [
  MAR,
  ...FLOTA.filter(([desde]) => u >= desde).flatMap(([, formas, giro, en]) => navegando(formas, giro, en)),
  ...(u >= 0.1 ? navegando(portaaviones({ alarma: alarma(u) }), 158, [3800 - 3350 * suave((u - 0.1) / 0.9), 0, 300 - 120 * u]) : []),
]

// De cerca, por estribor: la cámara corre por el costado desde la proa hasta el
// nombre pintado en el casco. La escolta navega lejos, detrás.
const ESCOLTA = [
  [destructor(), 10, [-700, 0, -900]],
  [destructor(), -5, [600, 0, -1400]],
  [portaaviones({ avion: false }), 5, [-200, 0, -2600]],
]
const costado = (u) => [MAR, ...ESCOLTA.flatMap(([formas, giro, en]) => navegando(formas, giro, en)), ...navegando(portaaviones({ alarma: alarma(u) }), 0, [0, 0, 0], [168, 6, 10])]
const CENTRO_DEL_NOMBRE = NOMBRE.x + 25.6

// En cubierta: marineros que corren de un lado a otro y el avión de mantenimiento atravesado en la pista.
const CORREDORES = [
  [OFICIOS.amarillo, [96, -1], 90, 0],
  [OFICIOS.rojo, [92, 6], -90, 0.3],
  [OFICIOS.morado, [86, -5], 70, 0.6],
  [OFICIOS.verde, [98, 3], -100, 0.15],
]
const cubierta = (u) => [
  MAR,
  ...portaaviones({ alarma: alarma(u) }),
  ...CORREDORES.flatMap(([oficio, [x, z], giro, desfase]) => {
    const fase = (u * 3 + desfase) % 1
    const avance = Math.sin(((u + desfase) % 1) * Math.PI * 2) * 5
    return colocar(MARINEROS.corre(oficio, fase), { k: 0.6, giro, en: [x, 20.8, z + avance * (giro > 0 ? -1 : 1)] })
  }),
]

// ── Dentro: el almirante sentado frente a la pantalla y el oficial de pie a su derecha ──

const ALM_EN = { k: 0.42, en: [-0.6, 0, -0.6] }
const OF_EN = { k: 0.42, en: [2.4, 0, 2.0], giro: 140 }
export const salaCon = (u, { pantalla, almirante, oficial }) => [...sala({ pantalla, alarma: Math.floor(u * 4) % 2 === 0 }), ...(almirante ? colocar(almirante, ALM_EN) : []), ...(oficial ? colocar(oficial, OF_EN) : [])]

// `pantalla` es un estado fijo o, con 'modo', el que usa quien juega.
const dentro = (pantalla, almirante, oficial = OFICIAL.quieto) => (u, modo) => salaCon(u, { pantalla: pantalla === 'modo' ? modo : pantalla, almirante: almirante(u), oficial: oficial(u) })
const pregunta = (u) => ALMIRANTE.sentado(u, { abrePico: silaba(u) * 0.8, ceño: 0.5 })
const callado = (u) => ALMIRANTE.sentado(u, {})
const gesto = (p, nombre) => p.gestos.find((g) => g.nombre === nombre).pose
const SOBRE_EL_HOMBRO = [-2.6, 1.95, -2.3]

export const TOMAS_3D = {
  llegada: { escena: llegada, camara: fija([0, 6, 0], [1000, -12, 180], 40) },
  nombre: {
    escena: costado,
    camara: (u) => {
      const k = suave(u)
      return [lerp([270, 16, 150], [CENTRO_DEL_NOMBRE, 13, 108], k), lerp([150, 10, 10], [CENTRO_DEL_NOMBRE, 10, 0], k), 44]
    },
  },
  cubierta: { escena: cubierta, camara: fija([104, 23.2, 5], [-20, 28, -8], 72) },
  subida: {
    escena: (u) => [MAR, ...portaaviones({ alarma: alarma(u) })],
    camara: (u) => [lerp([20, 23, 6], [-2, 42, 13], suave(u)), lerp([-25, 36, 27], [-30, 41, 27], suave(u)), 62],
  },
  sala: { escena: dentro('bajas', pregunta), camara: fija([-3.6, 2.5, -4.4], [3, 1.0, 1.4], 80) },
  pantalla: { escena: dentro('bajas', pregunta), camara: fija(SOBRE_EL_HOMBRO, [4, 1.55, 0.7], 58) },
  oficial: { escena: dentro('bajas', callado, gesto(OFICIAL, 'lee el informe')), camara: fija([0.3, 1.15, 0.05], [2.4, 1.05, 2.0], 44) },
  gafas: { escena: dentro('bajas', (u) => gesto(ALMIRANTE, 'se quita las gafas')(u, { sentado: true })), camara: fija([0.9, 1.0, -0.3], [-0.55, 0.98, -0.6], 56) },
  caidos: {
    escena: dentro('bajas', callado, (u) => gesto(OFICIAL, 'señala la pantalla')(Math.min(u, 0.45))),
    camara: (u) => {
      const gira = suave((u - 0.7) / 0.3)
      const ojo = [1.6 - 0.7 * gira, 1.85 - 0.4 * gira, -1.7 + 2.9 * suave(u / 0.7)]
      return [ojo, lerp([PANTALLA.x, 1.85, ojo[2]], [2.5, 0.95, 1.8], gira), 45]
    },
  },
  atacante: { escena: dentro('modo', callado, gesto(OFICIAL, 'señala la pantalla')), camara: fija(SOBRE_EL_HOMBRO, [4, 1.7, 0.7], 54) },
  levanta: { escena: dentro('modo', gesto(ALMIRANTE, 'se levanta')), camara: fija([1.0, 0.3, -0.25], [-0.6, 1.1, -0.6], 72) },
  cuatro: { escena: dentro('modo', gesto(ALMIRANTE, 'da la orden')), camara: fija([-3.6, 1.4, 1.6], [2.0, 1.0, -0.6], 70) },
  silencio: { escena: dentro('modo', callado, gesto(OFICIAL, 'se queda callado')), camara: fija([1.2, 1.1, 0.9], [2.4, 1.05, 2.0], 52) },
}
