// Las tomas de la escena 10, en 3D: qué se ve en el instante u ∈ [0, 1) y
// desde dónde, como las de la escena 2 (escena2/tomas.mjs). El guion, con
// sus líneas, está en src/lib/escena10.js.
//
// Pasa en la sala de mando de la reunión (escena2/reunion.mjs), sin el
// almirante: duck-one de pie frente a la pantalla de las bajas, con la
// carpeta, y los otros tres en sus sillones. Duky sigue donde lo dejaron.

import { ASIENTOS, ENTRADA, entra, girar, giroHacia, reunion } from '../escena2/reunion.mjs'
import { PRENDIDO, SIN_HUMO, duckOne, duke, duky, moby, sentar } from '../escena2/patoon.mjs'
import * as M from '../pilotos/modelos.mjs'
import { figura, manosAndando, pDuke, pMoby } from '../pilotos/cuerpos.mjs'
import { calada } from '../pilotos/calada.mjs'
import { hablar, silaba, suave } from '../escena1/personajes.mjs'

const tramo = (u, a, b) => suave((u - a) / (b - a))
const fija = (ojo, mira, campo) => () => [ojo, mira, campo]
const xz = ({ en }) => [en[0], en[2]]

const PANTALLA = 'bajas'

// ── Quién está y dónde ───────────────────────────────────────────────────

// duck-one, frente a la pantalla y de cara a la mesa, donde terminó la escena 2.
const DUCK_ONE = { en: [2.75, 0, -1.0], giro: 180 }
const DUKY = xz(ASIENTOS.duky)
const aDuky = (donde, k = 1) => ({ ...donde, giro: girar(donde.giro, giroHacia(xz(donde), DUKY), k) })

// El elenco: duck-one con la carpeta cerrada, los demás sentados, moby con el
// puro apagado. `cambios`, por nombre, como en la escena 2: una figura (va a
// su lugar), una figura con su `donde`, o null si no está.
const elenco = (u, cambios = {}) => {
  const de = {
    duckOne: [duckOne.carpeta(0), DUCK_ONE],
    duke: [duke.sentado(u), ASIENTOS.duke],
    duky: [duky.sentado(), ASIENTOS.duky],
    moby: [moby.sentado(u), ASIENTOS.moby],
  }
  return Object.entries({ ...de, ...cambios })
    .filter(([, v]) => v)
    .map(([quien, v]) => (Array.isArray(v[0]) ? v : [v, de[quien][1]]))
}
const sala = (cambios, extra = {}) => (u) => reunion({ pantalla: PANTALLA, figuras: elenco(u, cambios(u)), ...extra })

// Después de la tos, moby se queda con el puro prendido y los ojos llorosos.
// El humo se le ve solo en sus tomas: en las otras taparía a duke.
const lloroso = (cambios) => (u) => ({ moby: moby.sentado(u, SIN_HUMO), ...cambios(u) })
const conLaCarpeta = (u) => duckOne.carpeta(1, 0.8 * silaba(u))

// ── moby, furioso ────────────────────────────────────────────────────────

// Entra con los puños sueltos, braceando más que de costumbre.
const furioso = (fase) => figura({ ...pMoby, braceo: 0.5 }, { tronco: [...M.MOBY_TORSO, ...M.mobyCabeza({ t: fase * 8, apagado: true, llanto: 0 })], manos: manosAndando({ ...pMoby, braceo: 0.5 }, fase), fase, inclina: -6 })
// Sigue tosiendo: el tramo de las toses de la calada, una y otra vez.
const sigueTosiendo = (u) => sentar(pMoby, calada(5.2 + 8 * u, { antes: 0 }), 0.2)

// ── duke ─────────────────────────────────────────────────────────────────

// Agita la cabellera: echa la cabeza atrás y adelante, con un destello en el copete.
const cabellera = (u) => {
  const sacude = Math.sin(u * Math.PI * 6)
  const tronco = hablar(M.dukeBase({ ojos: M.ojosCerrados, menton: 16 + 18 * sacude }, []), silaba(u) * 0.8)
  return sentar(pDuke, figura(pDuke, { tronco, manos: { 1: pDuke.reposo(1), [-1]: pDuke.reposo(-1) }, extra: sacude > 0.7 ? M.destello([-0.4, 1.5, -0.5]) : [], inclina: 3 * sacude }))
}
// Mira fijo a la cámara con los ojos abiertos, y le brillan destellos alrededor, de a uno.
const BRILLOS = [[0.7, 1.45, -0.85], [0.7, 0.15, -1.05], [0.7, 1.5, 0.8], [0.7, 0.2, 1.0], [0.7, 0.85, -1.15], [0.7, 0.8, 1.15]]
const mirada = (u) => {
  const tronco = M.dukeBase({ ojos: M.ojosAbiertos, menton: 2 }, [])
  const brillan = BRILLOS.filter((_, i) => (Math.floor(u * 12) + i * 2) % 6 < 2).flatMap((c) => M.destello(c))
  return sentar(pDuke, figura(pDuke, { tronco, manos: { 1: pDuke.reposo(1), [-1]: pDuke.reposo(-1) }, extra: brillan }))
}

// ── Las cámaras ──────────────────────────────────────────────────────────

// duck-one, desde la mesa; moby y duke, cada uno desde el otro lado.
const A_DUCK = fija([0.8, 1.35, -0.2], [2.75, 1.1, -1.0], 40)
const A_DUCK_ABIERTO = fija([0.4, 1.2, -0.9], [2.75, 1.1, -1.0], 50)
const A_DUCK_DE_CERCA = fija([0.6, 1.5, 0.6], [2.75, 1.2, -1.0], 30)
const A_MOBY = fija([0.4, 1.05, -0.8], [-0.3, 0.9, 1.1], 42)
const A_MOBY_DE_LADO = fija([-0.2, 1.45, -0.6], [-0.1, 0.95, 1.1], 46)
const A_DUKE = fija([-0.9, 1.05, 0.9], [-1.0, 0.85, -1.0], 50)

// Con los giros de los que miran a duky.
const MIRAN = { moby: aDuky(ASIENTOS.moby), duke: aDuky(ASIENTOS.duke) }
const mirandoADuky = (cambios) => sala((u) => ({ duckOne: [duckOne.carpeta(0), aDuky(DUCK_ONE)], moby: [moby.sentado(u, SIN_HUMO), MIRAN.moby], duke: [duke.sentado(u), MIRAN.duke], ...cambios(u) }), { giros: { moby: MIRAN.moby.giro, duke: MIRAN.duke.giro } })

export const TOMAS_3D = {
  espera: { escena: sala(() => ({ duke: null, moby: null })), camara: fija([-3.4, 1.9, -2.6], [2.0, 0.8, 0.6], 60) },
  furioso: entra(furioso, ENTRADA(2.95), (x) => [[x + 2.4, 1.3, 1.9], [x, 0.85, 2.95], 44], { pantalla: PANTALLA, quienes: (u) => elenco(u, { duke: null, moby: null }) }),
  reflejo: entra(duke.alPiso, ENTRADA(2.6), (x) => [[x + 3.0, 0.9, 3.7], [x + 0.2, 0.45, 2.6], 50], { pantalla: PANTALLA, pulido: true, quienes: (u) => elenco(u, { duke: null }) }),

  evaluasion: { escena: sala((u) => ({ duckOne: conLaCarpeta(u) })), camara: A_DUCK },
  maldita: { escena: sala((u) => ({ duckOne: duckOne.carpeta(1), moby: moby.hablando(u) })), camara: A_MOBY },
  tos: { escena: sala((u) => ({ duckOne: duckOne.carpeta(1), moby: moby.tose(u) })), camara: A_MOBY },
  indicador: { escena: sala(lloroso((u) => ({ duckOne: conLaCarpeta(u) }))), camara: A_DUCK_ABIERTO },
  pintura: { escena: sala(lloroso((u) => ({ duke: cabellera(u) }))), camara: A_DUKE },
  perfecto: { escena: sala((u) => ({ moby: moby.hablando(u, PRENDIDO) })), camara: A_MOBY_DE_LADO },
  sigue: { escena: sala((u) => ({ moby: sigueTosiendo(u) })), camara: A_MOBY_DE_LADO },
  reparar: { escena: sala(lloroso((u) => ({ duke: duke.hablando(u) }))), camara: A_DUKE },
  // De frente, a la altura de sus ojos.
  mirada: { escena: sala(lloroso((u) => ({ duke: mirada(u) }))), camara: fija([-1.0, 1.05, 0.6], [-1.0, 1.0, -1.0], 44) },

  recurso: { escena: sala(lloroso((u) => ({ duckOne: conLaCarpeta(u) }))), camara: A_DUCK_DE_CERCA },
  nuclear: { escena: sala(lloroso((u) => ({ moby: moby.hablando(u, PRENDIDO) }))), camara: A_MOBY },
  especializado: { escena: sala(lloroso((u) => ({ duckOne: conLaCarpeta(u) }))), camara: A_DUCK },
  guapo: { escena: sala(lloroso((u) => ({ duke: duke.hablando(u) }))), camara: A_DUKE },
  chiyar: { escena: sala(lloroso((u) => ({ duckOne: conLaCarpeta(u) }))), camara: A_DUCK_ABIERTO },
  // Giran todos hacia duky, a la vez.
  miran: {
    escena: (u) => {
      const k = tramo(u, 0.1, 0.5)
      const giros = { moby: aDuky(ASIENTOS.moby, k).giro, duke: aDuky(ASIENTOS.duke, k).giro }
      const figuras = elenco(u, { duckOne: [duckOne.carpeta(0), aDuky(DUCK_ONE, k)], moby: [moby.sentado(u, SIN_HUMO), aDuky(ASIENTOS.moby, k)], duke: [duke.sentado(u), aDuky(ASIENTOS.duke, k)] })
      return reunion({ pantalla: PANTALLA, giros, figuras })
    },
    camara: fija([-1.0, 2.9, -2.4], [-1.0, 0.5, 0.6], 60),
  },
  enserio: { escena: mirandoADuky((u) => ({ moby: [moby.hablando(u, PRENDIDO), MIRAN.moby] })), camara: fija([-1.0, 1.6, -0.3], [-1.0, 1.0, 1.05], 60) },
  eficacia: { escena: mirandoADuky((u) => ({ duckOne: [conLaCarpeta(u), aDuky(DUCK_ONE)] })), camara: A_DUCK },
  // El dolly de la escena 2, más brusco: la cámara se lanza de 4,7 a 0,7 m
  // mientras abre el campo, la cara queda del mismo ancho y todo tiembla.
  noot: {
    escena: mirandoADuky((u) => ({ duky: duky.susto(u, { tics: [[0.12, 0.2], [0.3, 0.42], [0.5, 0.56], [0.62, 0.74], [0.8, 0.88], [0.92, 1]], tiembla: tramo(u, 0.2, 0.6) }) })),
    camara: (u) => {
      const k = suave(tramo(u, 0.05, 0.6))
      const d = 4.7 - 4.0 * k
      const sacude = 0.012 * tramo(u, 0.55, 0.7) * Math.sin(Math.floor(u * 40) * 2.1)
      return [[-1.7 + sacude, 1.07 + sacude, 0.75 - d], [-1.6, 1.07, 0.75], (2 * Math.atan((1.1 - 0.3 * k) / 2 / d) * 180) / Math.PI]
    },
  },
}
