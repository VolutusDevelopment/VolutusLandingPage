// Las tomas de la escena 13, en 3D: qué se ve en el instante u ∈ [0, 1) y
// desde dónde, como las de la escena 10 (escena10/tomas.mjs). El guion, con
// sus líneas, está en src/lib/escena13.js; quien juega, pintado encima de
// la cabina, en visor.mjs.
//
// Duky vuela a 300 m (escena11/tomas.mjs) y lo que graba su cabina se ve en
// la pantalla de la sala de mando, como en una película de naves: su nuca
// y, delante, quien juega. Duck-one, moby y duke lo
// miran de pie frente a la pantalla, que se parte en tres monitores: la
// cara de duky, la cabina y el radar.

import { MAR, PANTALLA, colocar } from '../escena1/lugares.mjs'
import { el, transformar } from '../pilotos/tres.mjs'
import * as M from '../pilotos/modelos.mjs'
import { RAMPAS as C } from '../pilotos/modelos.mjs'
import { PERSONAJES, dukyFigura, figura, manosAndando, pDuke, pMoby } from '../pilotos/cuerpos.mjs'
import { silaba, suave } from '../escena1/personajes.mjs'
import { duckOne } from '../escena2/patoon.mjs'
import { K, fase, girar, giroHacia, reunion } from '../escena2/reunion.mjs'
import { ALTURA, conDuky, nubes } from '../escena11/tomas.mjs'
import { enCabina } from '../escena11/hangar.mjs'
import { EN_CABINA, aSuDistancia, alargar, cuadro, proyectar } from '../tiras.mjs'
import { ALTO, ANCHO } from '../../../src/lib/escena1.js'
import { enemigo } from './visor.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const res = (a, b) => a.map((v, i) => v - b[i])
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const tramo = (u, a, b) => suave((u - a) / (b - a))
const fija = (ojo, mira, campo) => () => [ojo, mira, campo]
const vuelta = (u) => (u % 1) * Math.PI * 2

const [, MOBY, DUKE] = PERSONAJES

// ── La cabina de duky ────────────────────────────────────────────────────

// Duky, feliz con su cara de siempre: rebota en el asiento `saltos` veces por
// tira (un número par, para que la tira cierre), se mece hacia el lado de cada
// salto, cabecea y aletea.
export const ASIENTO = [-0.2, -1.8, 0]
export const dukyFeliz = (u, saltos = 4) => {
  const s = Math.sin(Math.PI * saltos * u)
  const sube = Math.abs(s)
  return transformar([12 * s, 0, 0], ASIENTO).formas(dukyFigura({ salto: 0.15 * sube, aletea: 45 * sube, cabeza: -10 * sube }))
}

// El caza, alabeado `alabeo` grados, con duky feliz y sin el vidrio de la
// cúpula: la cámara va adentro y vira con él.
const caza = (u) => conDuky({ motor: true, tren: false, t: u }, dukyFeliz(u)).filter((f) => !f.vidrio)
export const enVuelo = (alabeo) => transformar([alabeo, 0, 0], [0, 0, 0], ALTURA)
const desdeElCaza = (alabeo, ojo, mira, campo) => (u) => {
  const T = enVuelo(alabeo(u))
  return [T.punto(ojo), T.punto(mira), campo, res(T.punto([0, 1, 0]), T.punto([0, 0, 0]))]
}
const NIVELADO = () => 0
// Sobre la nuca de duky, un poco hacia abajo: su cabeza y el horizonte.
export const detras = (alabeo) => desdeElCaza(alabeo, enCabina([-1.0, 1.2, 0]), enCabina([29, -0.8, 0]), 80)
// Su cara, desde el tablero, como en la emoción de la escena 11.
export const SU_CARA = fija(sum(enCabina([3.4, 0.55, 0]), ALTURA), sum(enCabina([0, 0.3, 0]), ALTURA), 80)

// Quien juega va adelante, a 140 m, y se mueve sin parar.
const BLANCO = (u) => sum(ALTURA, [140, 30 + 6 * Math.sin(vuelta(u) * 2), 24 * Math.sin(vuelta(u))])

// Duky dispara como si supiera el futuro: cada tiro, uno por ala y por turno,
// va a donde estará quien juega cuando llegue, y le da. `VIAJE`, lo que tarda.
// Los cañones van donde el F-22 lleva el suyo, sobre las tomas de aire, en
// la raíz de cada ala (pilotos/modelos.mjs); quedan detrás de la cámara, y los
// tiros entran por abajo a cada lado del cuadro.
export const CANONES = [[1.85, 0.22, 1.45], [1.85, 0.22, -1.45]]
// Su munición es violeta, como en el juego (combate.js), y lila en el centro.
export const VIOLETA = '#9a6cff'
export const LILA = '#efe6ff'
const TIROS = 12
const VIAJE = 0.25
const disparos = (u, T, ojo) =>
  Array.from({ length: TIROS }, (_, k) => {
    const sale = k / TIROS
    const s = ((((u - sale) % 1) + 1) % 1) / VIAJE
    const llega = BLANCO(sale + VIAJE)
    if (s >= 1) return s < 1.2 ? [el(llega, [9, 9, 9], C.blanco, { flat: '#fff1a8', brilla: true })] : []
    const canon = T.punto(CANONES[k % 2])
    // De lejos todo se ve más lento: el tiro avanza más despacio cerca.
    const [a, b] = [lerp(canon, llega, s ** 2.5), lerp(canon, llega, Math.min(1, s + 0.2) ** 2.5)]
    // Un par de pixeles de grueso, a cualquier distancia.
    const grosor = 0.02 + 0.02 * Math.hypot(...res(a, ojo))
    return [M.hueso(a, b, grosor, C.boca, { flat: VIOLETA, brilla: true })]
  }).flat()

// Una toma de la cabina: qué hay, desde dónde y dónde va quien juega.
const cabina = ({ alabeo = NIVELADO, dispara = false, blanco = BLANCO, clic = () => 0 }) => {
  const camara = detras(alabeo)
  return {
    abre: EN_CABINA,
    escena: (u) => {
      const T = enVuelo(alabeo(u))
      return [MAR, ...nubes(u), ...T.formas(caza(u)), ...(dispara ? disparos(u, T, camara(u)[0]) : [])]
    },
    camara,
    // Quien juega, tapado por lo que tenga delante: la cabeza de duky, el caza.
    encima: (celdas, u, modo, distancias) => {
      const [c, en] = [camara(u), blanco(u)]
      if (en) aSuDistancia(celdas, distancias, Math.hypot(...res(en, c[0])), (cs) => enemigo(cs, u, modo, proyectar(c, en, EN_CABINA), clic(u)))
    },
  }
}

// Esquiva: quien juega se le viene encima y hace clic, y duky gira en redondo.
const CERCA = sum(ALTURA, [30, 6, 0])
const seLanza = (u) => (u < 0.3 ? lerp(BLANCO(0), CERCA, tramo(u, 0, 0.3)) : u < 0.6 ? lerp(CERCA, sum(ALTURA, [-30, 6, 0]), tramo(u, 0.3, 0.6)) : null)
const GIRO = (u) => 360 * tramo(u, 0.3, 0.8)

const CABINAS = {
  vuela: cabina({}),
  ataca: cabina({ dispara: true }),
  esquiva: cabina({ alabeo: GIRO, blanco: seLanza, clic: (u) => (u - 0.25) / 0.2 }),
}

// ── Los monitores de la sala ─────────────────────────────────────────────

// Un cuadro de una toma, con lo que lleva encima.
const grabar = ({ escena, camara, encima, abre }, u, modo) => {
  const distancias = []
  const celdas = cuadro(escena(u), camara(u), distancias, abre)
  encima?.(celdas, u, modo, distancias)
  return celdas
}

// La pantalla, en tres monitores: (desde, hasta) en `u` de la pantalla.
export const MONITORES = { cara: [0.015, 0.27], cabina: [0.29, 0.71], radar: [0.73, 0.985] }
export const BISEL = '#16191e'
const VACIO = '#0e1a2a'
export const dentro = (u, [a, b]) => u >= a && u <= b
const celda = (celdas, x, y) => celdas[Math.min(ALTO - 1, Math.floor(y))]?.[Math.min(ANCHO - 1, Math.floor(x))] ?? VACIO

// El radar: barrido verde, duky al centro y quien juega, que parpadea.
export const radar = (t, cu, cv) => {
  const [x, y] = [(cu - 0.5) * 1.3, (cv - 0.55) * 1.65]
  const r = Math.hypot(x, y) / 0.55
  if (r > 1) return VACIO
  if (Math.hypot(x, y - 0.32) < 0.035 && Math.floor(t * 12) % 3 !== 2) return '#ff3a2a'
  if (Math.abs(x) < 0.03 && Math.abs(y) < 0.04) return '#f8cc1c'
  const atras = (((vuelta(t * 2) - Math.atan2(y, x)) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  if (r > 0.94 || atras < 0.12) return '#7dffa0'
  return atras < 0.6 ? '#1f5a36' : '#123a24'
}

// La pantalla, monitor por monitor: `pinta(quien, cu, cv)` da el color de
// cada uno, con (cu, cv) de 0 a 1 dentro de él; entre ellos, el bisel.
const porMonitor = (pinta) => (u, v) => {
  const monitor = Object.entries(MONITORES).find(([, m]) => dentro(u, m))
  if (!monitor) return BISEL
  const [quien, [a, b]] = monitor
  return pinta(quien, (u - a) / (b - a), (v - 0.03) / 0.94)
}

// Prendida: la cara de duky, la cabina de `toma` y el radar. La cara abre el
// campo hasta cubrir de alto lo que cubría el cuadro cuadrado de antes; la
// cabina, la franja de 4:3 del medio.
export const prendida = (toma, t, modo) => {
  const cara = grabar({ escena: CABINAS.vuela.escena, camara: SU_CARA, abre: ANCHO / ALTO }, t, modo)
  const vista = grabar(CABINAS[toma], t, modo)
  return porMonitor((quien, cu, cv) => {
    if (quien === 'cara') return celda(cara, ANCHO / 2 + (cu - 0.5) * 0.78 * ALTO, (1 - cv) * ALTO)
    if (quien === 'cabina') return celda(vista, ANCHO / 2 + (cu - 0.5) * (4 / 3) * ALTO, (1 - cv) * ALTO)
    return radar(t, cu, cv)
  })
}

// Apagada: los monitores de duky, negros, con lo que se refleja en ellos visto
// desde `camara`; el radar, que miran los demás, sigue prendido. El reflejo
// es lo que se ve desde la cámara espejada al otro lado del vidrio, por el
// mismo punto de la pantalla, sin el cielo de detrás.
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mezcla = (a, b, k) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * k).toString(16).padStart(2, '0')).join('')
const NEGRO = '#06080a'
const espejo = ([x, y, z]) => [2 * PANTALLA.x - x, y, z]
const apagada = (formas, [ojo, mira, campo], t) => {
  const camara = [espejo(ojo), espejo(mira), campo]
  const distancias = []
  const reflejo = cuadro(formas, camara, distancias)
  const { y0, y1, z0, z1 } = PANTALLA
  const reflejado = (u, v) => {
    const en = proyectar(camara, [PANTALLA.x, y0 + v * (y1 - y0), z0 + u * (z1 - z0)])
    const [x, y] = en ? en.map(Math.floor) : []
    return en && distancias[y]?.[x] < Infinity ? mezcla(NEGRO, reflejo[y][x], 0.45) : NEGRO
  }
  return (u, v) => porMonitor((quien, cu, cv) => (quien === 'radar' ? radar(t, cu, cv) : reflejado(u, v)))(u, v)
}

// ── Quién está y dónde ───────────────────────────────────────────────────

// Los tres de pie frente a la pantalla, mirándola, sin humo que tape a nadie:
// entre la mesa de control (x de 1,3 a 1,75, escena1/lugares.mjs) y ella.
export const FILA = 2.7
export const DONDE = { duke: { en: [FILA, 0, -1.7], giro: 0 }, moby: { en: [FILA, 0, 0], giro: 0, suelo: pMoby.suelo }, duckOne: { en: [FILA, 0, 1.7], giro: 0 } }
const reposo = (p) => ({ 1: p.reposo(1), [-1]: p.reposo(-1) })
export const mobyQuieto = (u, abre = 0, llanto = 0) => figura(pMoby, { tronco: [...M.MOBY_TORSO, ...M.mobyCabeza({ t: u * 8, humea: false, abre, llanto })], manos: reposo(pMoby) })
export const SIN_HUMO = { humea: false }

const quietos = (u) => ({ duckOne: duckOne.atras(), moby: mobyQuieto(u), duke: DUKE.sentado(u, reposo(pDuke)) })
export const figuras = (u, cambios) =>
  Object.entries({ ...quietos(u), ...cambios })
    .filter(([, v]) => v)
    .map(([quien, v]) => (Array.isArray(v[0]) ? v : [v, DONDE[quien]]))

// La sala con los tres y la pantalla prendida en la cabina de `toma`.
export const ante = (toma, cambios = () => ({})) => (u, modo) => reunion({ u, pantalla: prendida(toma, u, modo), figuras: figuras(u, cambios(u)) })

// moby se vuelve hacia el monitor de la cara de duky.
const HACIA_DUKY = { ...DONDE.moby, giro: giroHacia([FILA, 0], [PANTALLA.x, -1.85]) }

// Para mirarse, moby se acerca a la pantalla; la cámara, por sobre su hombro
// izquierdo, lo ve a él y a su reflejo. `abre`, su pico, y `llanto`, sus
// lágrimas (modelos.mjs): no le gusta lo que ve. Hasta `apaga`, la pantalla
// sigue prendida.
const AL_VIDRIO = { ...DONDE.moby, en: [3.1, 0, 0] }
const ANTE_EL_REFLEJO = [[1.8, 1.55, -1.1], [PANTALLA.x, 1.3, 0.3], 56]
const DE_CERCA = [[1.8, 1.45, -1.15], [PANTALLA.x, 1.25, 0.3], 44]
const seRefleja = (camara, { abre = () => 0, llanto, apaga = 0 }) => (u, modo) => {
  const moby = mobyQuieto(u, abre(u), llanto(u))
  const pantalla = u < apaga ? prendida('vuela', u, modo) : apagada(colocar(moby.filter((f) => !f.pata), { k: K, ...AL_VIDRIO }), camara, u)
  return reunion({ u, pantalla, figuras: figuras(u, { moby: [moby, AL_VIDRIO] }) })
}
// Antes de u = 0, con la pantalla aún prendida, da el paso desde donde miraba
// a duky hasta el vidrio y se vuelve hacia él; poco después, se apaga.
const ACERCA = [-0.375, -0.06]
const seAcercaYSeRefleja = (u, modo) => {
  if (u >= ACERCA[1]) return seRefleja(ANTE_EL_REFLEJO, { llanto: (v) => tramo(v, 0.45, 0.85), apaga: 0.1 })(u, modo)
  const k = tramo(u, ...ACERCA)
  const paso = fase(0.4 * k)
  const moby = figura(pMoby, { tronco: [...M.MOBY_TORSO, ...M.mobyCabeza({ t: u * 8, humea: false })], manos: manosAndando(pMoby, paso), fase: paso })
  const donde = { ...AL_VIDRIO, en: lerp(HACIA_DUKY.en, AL_VIDRIO.en, k), giro: girar(HACIA_DUKY.giro, AL_VIDRIO.giro, k) }
  return reunion({ u, pantalla: prendida('vuela', u, modo), figuras: figuras(u, { moby: [moby, donde] }) })
}

// ── Las cámaras de la sala ───────────────────────────────────────────────

// Desde la pantalla, de frente a quien está en `z`: muy cerca, con el campo abierto.
export const DE_FRENTE = (z) => fija([3.88, 1.3, z], [FILA, 1.35, z], 86)
// Moby, más alto, desde más abajo: a la altura de los otros, el pico le tapa la cara.
export const A_MOBY = fija([3.88, 1.0, DONDE.moby.en[2]], [FILA, 1.2, DONDE.moby.en[2]], 86)

export const TOMAS_3D = {
  // Desde atrás, los tres ante la pantalla.
  monitores: { escena: ante('vuela'), camara: fija([-1.6, 2.5, 0], [PANTALLA.x, 1.8, 0], 58) },
  ...CABINAS,

  pasando: { escena: ante('ataca', (u) => ({ moby: mobyQuieto(u, silaba(u)) })), camara: A_MOBY },
  metodologia: { escena: ante('ataca', (u) => ({ duckOne: duckOne.atras(null, silaba(u)) })), camara: DE_FRENTE(DONDE.duckOne.en[2]) },
  futuro: { escena: ante('ataca', (u) => ({ moby: MOBY.hablando(u, SIN_HUMO) })), camara: A_MOBY },
  antes: { escena: ante('ataca', (u) => ({ duke: DUKE.hablando(u) })), camara: DE_FRENTE(DONDE.duke.en[2]) },

  // Desde arriba, por sobre su hombro derecho: moby mira el monitor de la cara
  // de duky, y duke, a su lado, queda entero.
  mira: { escena: ante('vuela', (u) => ({ moby: [mobyQuieto(u), HACIA_DUKY] })), camara: fija([1.45, 2.4, 0.85], [PANTALLA.x, 1.3, -1.0], 62) },
  reflejo: alargar({ escena: seAcercaYSeRefleja, camara: fija(...ANTE_EL_REFLEJO) }, ACERCA[0], 1),
  nomegusta: { escena: seRefleja(DE_CERCA, { abre: silaba, llanto: () => 1 }), camara: fija(...DE_CERCA) },
}

