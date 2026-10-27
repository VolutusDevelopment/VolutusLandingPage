// Las tomas de la escena 5, en 3D: qué se ve en el instante u ∈ [0, 1) y
// desde dónde, como las de la escena 3 (escena3/tomas.mjs). El guion, con
// sus líneas, está en src/lib/escena5.js.
//
// duck-one vuelve al Sitting Ducks: frena su caza en la cubierta, de babor, y
// moby y duke lo esperan al costado del avión. Todo en metros del barco.

import { el, transformar } from '../pilotos/tres.mjs'
import * as M from '../pilotos/modelos.mjs'
import { RAMPAS as C, disco, hueso } from '../pilotos/modelos.mjs'
import { PERSONAJES, figura, pDuckOne, pMoby, pDuke, dukeCerrado } from '../pilotos/cuerpos.mjs'
import { MAR, colocar, poner, portaaviones } from '../escena1/lugares.mjs'
import { MANOS_ATRAS, MARINEROS, OFICIOS, hablar, marineroTronco, pMarinero, silaba, suave } from '../escena1/personajes.mjs'
import { giroHacia } from '../escena2/reunion.mjs'
import { EN_CATAPULTA, ESCALA as K, SUELO, caza, enPiloto } from '../escena3/caza.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const res = (a, b) => a.map((v, i) => v - b[i])
const esc = (a, k) => a.map((v) => v * k)
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const uni = (a) => esc(a, 1 / Math.hypot(...a))
const tramo = (u, a, b) => suave((u - a) / (b - a))
const fija = (ojo, mira, campo) => () => [ojo, mira, campo]

const [DUCK, MOBY, DUKE] = PERSONAJES
const CUBIERTA = 20.8

// ── El caza, detenido en la pista ────────────────────────────────────────

// Frena en el eje de la catapulta de babor, más a popa: caza.mjs lo deja en
// EN_CATAPULTA, así que aquí se corre a `PARADA`.
const PARADA = [0, CUBIERTA - SUELO, -6]
const enParada = (p) => sum(p, PARADA)
const pilotoEnParada = (p) => sum(res(enPiloto(p), EN_CATAPULTA), PARADA)
const BARCO = [MAR, ...portaaviones()]
const CUPULA_ABIERTA = 40
const estacionado = (opciones = {}) => [...BARCO, ...poner(caza({ cupula: CUPULA_ABIERTA, ...opciones }), 0, PARADA)]

// ── duck-one ─────────────────────────────────────────────────────────────

// La cabeza gira en el cuello:
// `sube` grados hacia arriba, el mentón en alto.
const CARA = M.DUCK_ONE.filter((f) => !M.DUCK_ONE_TORSO.includes(f))
const cabezaAlta = (sube) => [...M.DUCK_ONE_TORSO, ...transformar([0, 0, sube], [0.1, 0.1, 0]).formas(CARA)]
const atras = (tronco = M.DUCK_ONE) => figura(pDuckOne, { tronco, manos: MANOS_ATRAS })
const indice = (mano, hacia) => hueso(mano, sum(mano, hacia), 0.045, C.cuero)

// Salta del ala a la cubierta y queda en jarras, con el pecho afuera.
const enJarras = { ...pDuckOne, dobla: (s) => [-0.4, 0, s] }
const pose = (u) => {
  const cae = tramo(u, 0, 0.3)
  const k = tramo(u, 0.3, 0.5)
  const manos = { 1: lerp([0.5, 0.2, 1.1], [-0.05, -1.25, 1.0], k), [-1]: lerp([0.5, 0.2, -1.1], [-0.05, -1.25, -1.0], k) }
  return figura(enJarras, { tronco: cabezaAlta(14 * k), manos, salto: 2.6 * (1 - cae) ** 2, inclina: 7 * k })
}

// Habla con el índice arriba, como siempre.
const hablando = (u) => DUCK.hablando(u, { tronco: M.DUCK_ONE })

// Se va con el mentón en alto, y suelta una medalla y otra por el camino.
const MEDALLAS = [
  { cae: 0.3, en: [0.95, -0.55, 0.3] },
  { cae: 0.55, en: [0.95, -0.8, -0.25] },
]
const medalla = (centro, giro = 0, r = 0.08) => [
  disco(centro, [Math.cos(giro), Math.sin(giro), 0], r, r / 4, C.oro),
  hueso(sum(centro, [0, r, 0]), sum(centro, [0, r * 2.2, 0]), r * 0.45, ['#ff8a7a', '#d83a2c', '#9a2218', '#5a1008']),
]

// En el horizonte: salta, con la mano arriba y el índice al cielo.
const saltaYSeñala = (u, abre) => {
  const vuelo = Math.max(0, Math.sin(tramo(u, 0.1, 0.55) * Math.PI))
  const g = tramo(u, 0.05, 0.3)
  const mano = lerp(MANOS_ATRAS[-1], [0.55, 1.15, -0.85], g)
  const otra = lerp(MANOS_ATRAS[1], [-0.05, -1.25, 1.0], g)
  return figura(enJarras, { tronco: hablar(cabezaAlta(18 * g), abre), manos: { 1: otra, [-1]: mano }, extra: g > 0.6 ? [indice(mano, [0.04, 0.26, 0])] : [], salto: 1.1 * vuelo, inclina: 6 * g })
}

// ── Los demás ────────────────────────────────────────────────────────────

const dukeQuieto = () => figura(pDuke, { tronco: dukeCerrado, manos: { 1: pDuke.reposo(1), [-1]: pDuke.reposo(-1) } })
// moby, de brazos cruzados y con el puro prendido desde la escena 2.
const mobyQuieto = (u) => figura({ ...pMoby, brazo: null }, { tronco: [...M.MOBY_TORSO, ...M.mobyCabeza({ t: u * 8 }), ...M.MOBY_BRAZOS_CRUZADOS] })

// El mecánico, verde como los de la escena 2, sube por una escalerilla al
// costado de la cabina y tironea hasta sacar una medalla enganchada.
const MECANICO = { en: pilotoEnParada([0.3, -0.6, -4.2]), giro: -90 }
const mecanico = (u) => {
  const p = pMarinero(OFICIOS.verde.color)
  const sale = tramo(u, 0.55, 0.75)
  const tiron = 0.12 * Math.max(0, Math.sin(u * Math.PI * 10)) * (1 - sale)
  const dentro = [2.5 - tiron, -0.4, 0]
  const arriba = [0.7, 0.9, -0.9]
  const manos = lerp(dentro, arriba, sale)
  return figura(p, {
    tronco: marineroTronco(OFICIOS.verde.color),
    manos: { 1: sum(manos, [0, 0, 0.18]), [-1]: sum(manos, [0, 0, -0.18]) },
    extra: medalla(sum(manos, [0.2, -0.2, 0]), Math.PI / 2 + 0.6 * sale, 0.35),
    inclina: -12 * (1 - sale) + 4 * sale,
  })
}
const escalerilla = (() => {
  const [x, y, z] = MECANICO.en
  return [-0.25, 0.25].map((dx) => hueso([x + dx, CUBIERTA, z - 0.6], [x + dx, y + 0.1, z], 0.04, C.rayas))
})()

// ── En la cubierta ───────────────────────────────────────────────────────

// duck-one, al costado de su caza, frente a moby y duke, que lo esperaban.
const AQUI = { duck: [2.6, CUBIERTA, -10.5], moby: [2.0, CUBIERTA, -12.4], duke: [3.6, CUBIERTA, -12.3] }
const mirando = (de, a, suelo) => ({ k: K, en: AQUI[de], giro: giroHacia([AQUI[de][0], AQUI[de][2]], [AQUI[a][0], AQUI[a][2]]), suelo })
const DONDE = { duck: mirando('duck', 'moby'), moby: { ...mirando('moby', 'duck'), suelo: pMoby.suelo }, duke: mirando('duke', 'duck') }

const cubierta = (u, { duck = atras(), mobyF = mobyQuieto(u), dukeF = dukeQuieto() } = {}) => [
  ...estacionado(),
  ...colocar(duck, DONDE.duck),
  ...colocar(mobyF, DONDE.moby),
  ...colocar(dukeF, DONDE.duke),
]

// Plano de `a`, que habla, desde el lado de `de`, que escucha: la cámara
// entra entre los dos y `de` queda detrás de ella, sin tapar a nadie.
const plano = (de, a, { cerca = 2.0, lado = 0.5, campo = 46 } = {}) => {
  const f = uni(res([AQUI[a][0], 0, AQUI[a][2]], [AQUI[de][0], 0, AQUI[de][2]]))
  const ojo = sum(sum(AQUI[a], esc(f, -cerca)), [-f[2] * lado, a === 'moby' ? 0.9 : 0.7, f[0] * lado])
  return fija(ojo, sum(AQUI[a], [0, a === 'moby' ? 0.75 : 0.6, 0]), campo)
}

// ── El aterrizaje ────────────────────────────────────────────────────────

// Llega por la popa, toca la cubierta y frena hasta `PARADA`.
const LLEGA = { largo: 170, toca: 0.3, hasta: 0.75 }
const enPista = (u) => {
  const k = Math.min(1, u / LLEGA.hasta)
  const aire = Math.max(0, 1 - k / LLEGA.toca)
  return { aire, en: sum(PARADA, [-LLEGA.largo * (1 - k) ** 2, 16 * aire ** 1.5, 0]) }
}
const aterriza = (u) => {
  const { aire, en } = enPista(u)
  return transformar([0, 0, 7 * Math.min(1, aire * 3)], [-1.4, SUELO, 0], en).formas(caza({ piloto: [] }))
}

// Los marinos esperan en la pista y escapan a un lado cuando el caza se les viene encima.
const MARINOS = [
  { oficio: OFICIOS.amarillo, x: 5, z: -5.4, lado: 1, desfase: 0 },
  { oficio: OFICIOS.morado, x: 1, z: -6.6, lado: -1, desfase: 0.3 },
  { oficio: OFICIOS.rojo, x: -4, z: -5.8, lado: 1, desfase: 0.6 },
]
const marinos = (u) => {
  const nariz = enPista(u).en[0] + 9
  return MARINOS.flatMap(({ oficio, x, z, lado, desfase }) => {
    const huye = tramo(nariz, x - 30, x - 2)
    const figuraM = huye > 0 ? MARINEROS.corre(oficio, (u * 6 + desfase) % 1) : MARINEROS.corre(oficio, 0, { fase: null })
    return colocar(figuraM, { k: K, giro: lado > 0 ? -90 : 90, en: [x, CUBIERTA, z + lado * 5 * huye] })
  })
}

export const TOMAS_3D = {
  aterrizaje: {
    escena: (u) => [...BARCO, ...aterriza(u), ...marinos(u)],
    camara: (u) => [[13, 21.8, -11.5], lerp(sum(enPista(u).en, [3, -1, 0]), enParada([0, -1, 0]), tramo(u, 0.5, 0.8)), 60],
  },
  pose: {
    escena: (u) => [...estacionado(), ...colocar(pose(u), { k: K, en: [3.2, CUBIERTA, -8.2], giro: giroHacia([3.2, -8.2], [4.6, -10.4]) })],
    // Desde abajo, como en los afiches.
    camara: fija([4.6, CUBIERTA + 0.2, -10.4], [3.2, CUBIERTA + 0.9, -8.2], 60),
  },
  medalla: {
    escena: (u) => [...estacionado(), ...escalerilla, ...colocar(mecanico(u), { k: K, ...MECANICO })],
    camara: fija(sum(MECANICO.en, [1.4, 0.7, -2.2]), sum(MECANICO.en, [0, 0.55, 0.5]), 55),
  },
  ybien: { escena: (u) => cubierta(u, { mobyF: MOBY.hablando(u) }), camara: plano('duck', 'moby') },
  estimasiones: { escena: (u) => cubierta(u, { duck: hablando(u) }), camara: plano('moby', 'duck') },
  lediste: { escena: (u) => cubierta(u, { mobyF: MOBY.hablando(u) }), camara: plano('duck', 'moby', { lado: -0.4 }) },
  concluyente: { escena: (u) => cubierta(u, { duck: hablando(u) }), camara: plano('moby', 'duck', { lado: 0.9 }) },
  inservibles: { escena: (u) => cubierta(u, { mobyF: MOBY.hablando(u) }), camara: plano('duck', 'moby', { campo: 56 }) },
  datos: { escena: (u) => cubierta(u, { duck: hablando(u) }), camara: plano('moby', 'duck', { lado: -0.6, campo: 56 }) },
  recopilaste: { escena: (u) => cubierta(u, { dukeF: DUKE.hablando(u) }), camara: plano('duck', 'duke', { lado: -0.4 }) },
  bastante: { escena: (u) => cubierta(u, { duck: hablando(u) }), camara: plano('duke', 'duck', { lado: -0.4 }) },
  marcha: {
    escena: (u) => {
      const camino = (t) => sum(AQUI.duck, [5 * t, 0, 0])
      const caidas = MEDALLAS.filter(({ cae }) => u > cae).flatMap(({ cae, en }) => {
        const k = Math.min(1, (u - cae) / 0.08)
        const desde = colocar([el(en, [0.01, 0.01, 0.01], C.oro)], { k: K, en: camino(cae), giro: 0 })[0].c
        const centro = [desde[0], desde[1] + (CUBIERTA + 0.03 - desde[1]) * k * k, desde[2]]
        return medalla(centro, (Math.PI / 2) * k)
      })
      return [...estacionado(), ...colocar(mobyQuieto(u), DONDE.moby), ...colocar(dukeQuieto(), DONDE.duke), ...colocar(DUCK.andando((u * 6) % 1, { tronco: cabezaAlta(14) }), { k: K, en: camino(u), giro: 0 }), ...caidas]
    },
    camara: fija([5, CUBIERTA + 0.9, -17.5], [5.2, CUBIERTA + 0.4, -10.5], 46),
  },
  salta: {
    escena: (u) => [...estacionado(), ...colocar(saltaYSeñala(u, 0), { k: K, en: [9, CUBIERTA, -10.5], giro: -16 })],
    camara: fija([7.4, CUBIERTA + 0.5, -12.4], [11, CUBIERTA + 1.2, -9.2], 58),
  },
  fase: {
    escena: (u) => [...estacionado(), ...colocar(saltaYSeñala(1, silaba(u)), { k: K, en: [9, CUBIERTA, -10.5], giro: -16 })],
    camara: fija([10.6, CUBIERTA + 0.7, -12.2], [9, CUBIERTA + 0.75, -10.5], 46),
  },
}
