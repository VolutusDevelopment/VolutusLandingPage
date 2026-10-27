// Las tomas de la escena 11, en 3D: qué se ve en el instante u ∈ [0, 1) y
// desde dónde, como las de la escena 2 (escena2/tomas.mjs). El guion, con
// sus líneas, está en src/lib/escena11.js.
//
// Un marinero saca a duky de la sala de mando (escena2/reunion.mjs), lo
// sube a su F-35 en el hangar (hangar.mjs) y el caza despega de la cubierta
// del Sitting Ducks. En vuelo, la torre le habla por radio, desde la consola
// de radar de la sala, y duky no contesta.

import { ASIENTOS, K as K_SALA, enUnidades, fase, girar, recorrido, reunion } from '../escena2/reunion.mjs'
import { EN_BRAZOS, duky, marinero } from '../escena2/patoon.mjs'
import { el } from '../pilotos/tres.mjs'
import { DUKY as DUKY_HULE, RAMPAS as C, ambos, hueso } from '../pilotos/modelos.mjs'
import { PERSONAJES, dukyFigura, figura, manosAndando } from '../pilotos/cuerpos.mjs'
import { MAR, colocar, poner, portaaviones } from '../escena1/lugares.mjs'
import { OFICIOS, marineroTronco, pMarinero, suave } from '../escena1/personajes.mjs'
import { K, PISO, SUELO, caza, enCabina, hangar } from './hangar.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const tramo = (u, a, b) => suave((u - a) / (b - a))
const fija = (ojo, mira, campo) => () => [ojo, mira, campo]

const DUKY = PERSONAJES.at(-1)
const VERDE = OFICIOS.verde.color
const pMar = pMarinero(VERDE)
const REPOSO = { 1: pMar.reposo(1), [-1]: pMar.reposo(-1) }
const PANTALLA = 'bajas'

// Lleva a duky sobre la cabeza, con los brazos arriba: así, al darse vuelta
// o al caminar, ninguno de los dos tapa al otro.
const ARRIBA = { 1: [0.15, 1.45, 0.7], [-1]: [0.15, 1.45, -0.7] }
const sobreLaCabeza = ({ en, giro }, k) => ({ en: sum(en, [0, 3.4 * k, 0]), giro, suelo: -2.2 })

// ── En la sala: el marinero se lleva a duky ──────────────────────────────

// Entra hasta el costado del sillón, lo levanta, se da vuelta y sale con él,
// primero de lado a la cámara: duky va delante y no lo tapa.
const DE_LA_PUERTA = recorrido([[-4.6, 2.8], [-2.4, 1.0]])
const A_LA_PUERTA = recorrido([[-2.4, 1.0], [-3.8, 1.1], [-4.6, 2.8]])
const JUNTO_AL_SILLON = { en: [-2.4, 0, 1.0], giro: 0 }
const SENTADO_EN_EL_SILLON = { ...ASIENTOS.duky, en: sum(ASIENTOS.duky.en, [0, 0.15 * K_SALA, 0]) }
// Se da vuelta de cara a la cámara, para que duky no le pase por detrás.
const VUELTA = (A_LA_PUERTA.donde(0.3).giro + 360) % 360
const AGARRA = Object.fromEntries([1, -1].map((s) => [s, sum(EN_BRAZOS.manos[s], [1.0, -0.45, 0])]))

const seLoLleva = (u) => {
  if (u < 0.35) {
    const s = DE_LA_PUERTA.largo * tramo(u, 0, 0.35)
    return [[marinero(fase(s), manosAndando(pMar, fase(s))), DE_LA_PUERTA.donde(s)], [duky.sentado(), ASIENTOS.duky]]
  }
  if (u < 0.65) {
    const levanta = tramo(u, 0.42, 0.55)
    const manos = Object.fromEntries([1, -1].map((s) => [s, lerp(lerp(REPOSO[s], AGARRA[s], tramo(u, 0.35, 0.42)), ARRIBA[s], levanta)]))
    const donde = { ...JUNTO_AL_SILLON, giro: VUELTA * tramo(u, 0.55, 0.65) }
    const brazos = sobreLaCabeza(donde, K_SALA)
    // Primero lo sube en el lugar y después lo pasa sobre su cabeza: no le pasa por la cara.
    const sube = [SENTADO_EN_EL_SILLON.en[0], brazos.en[1], SENTADO_EN_EL_SILLON.en[2]]
    const en = lerp(lerp(SENTADO_EN_EL_SILLON.en, sube, tramo(u, 0.42, 0.5)), brazos.en, tramo(u, 0.5, 0.55))
    const dukyDonde = u < 0.55 ? { en, giro: girar(SENTADO_EN_EL_SILLON.giro, brazos.giro, levanta), suelo: -2.2 } : brazos
    return [[marinero(null, manos), donde], [duky.enBrazos(), dukyDonde]]
  }
  const s = A_LA_PUERTA.largo * tramo(u, 0.65, 1)
  const donde = A_LA_PUERTA.donde(s)
  return [[marinero(fase(s), ARRIBA), donde], [duky.enBrazos(), sobreLaCabeza(donde, K_SALA)]]
}

// ── En el hangar ─────────────────────────────────────────────────────────

// El caza, con las ruedas en el piso, y lo que va con él en sus metros.
const AVION = [2, PISO - SUELO, -3]
const enHangar = (formas) => [...hangar, ...poner(formas, 0, AVION)]
const CUPULA_ABIERTA = 85

// El marinero se para en el lomo, junto a la cabina y mirando a ella: sube
// por una escalerilla desde el piso.
const LOMO = { en: enCabina([0.3, -1.6, -2.6]), giro: -90 }
const escalerilla = [-0.25, 0.25].map((dx) => hueso([LOMO.en[0] + dx, SUELO, LOMO.en[2] - 1.4], [LOMO.en[0] + dx, LOMO.en[1], LOMO.en[2] - 0.2], 0.04, C.rayas))
const enSusManos = (p) => enUnidades(p, { ...LOMO, k: K })
const elMarinero = (cfg) => colocar(figura(pMar, { tronco: marineroTronco(VERDE), ...cfg }), { k: K, ...LOMO })

// duky sentado en su cabina, con los pies donde los pone la cabina.
const SENTADO = { en: enCabina([0, -2.2, 0]), giro: 0, suelo: -2.2 }
const dukyEn = (donde, formas = DUKY.sentado(0)) => colocar(formas.filter((f) => !f.pata), { k: K, ...donde })

// Lo pasa de sobre su cabeza a sobre la cabina, lo gira hacia el morro, lo
// baja y lo suelta para el último tramo, que duky cae solo.
const EN_EL_LOMO = sobreLaCabeza(LOMO, K)
const bajando = (u) => {
  const arriba = sum(SENTADO.en, [0, 0.55, 0])
  const pasa = lerp(EN_EL_LOMO.en, arriba, tramo(u, 0.1, 0.45))
  const baja = lerp(pasa, sum(SENTADO.en, [0, 0.3, 0]), tramo(u, 0.45, 0.7))
  return lerp(baja, SENTADO.en, tramo(u, 0.7, 0.8))
}
const deposita = (u) => {
  const llevado = sum(enSusManos(bajando(Math.min(u, 0.7))), enSusManos(EN_EL_LOMO.en).map((v) => -v))
  const manos = Object.fromEntries([1, -1].map((s) => [s, lerp(sum(ARRIBA[s], llevado), REPOSO[s], tramo(u, 0.75, 0.95))]))
  return [...elMarinero({ manos }), ...dukyEn({ en: bajando(u), giro: girar(-90, 0, tramo(u, 0.1, 0.45)), suelo: -2.2 }, duky.enBrazos())]
}

// El cinturón: una correa a cada lado, del respaldo a la hebilla, en
// unidades de la cabina. No le dan la vuelta a duky: con `tira`, de 0 a 1,
// el marinero las acerca por delante y siempre les falta.
const HOMBRO = (s) => [-1.25, 0.65, s * 0.6]
const COSTADO = (s) => [0.5, -0.45, s * 1.05]
const SUELTA = (s) => [-0.2, -1.3, s * 1.1]
const CASI = (s) => [1.45, -0.85, s * 0.42]
const correas = (tira) =>
  [1, -1].map((s) => {
    const [hombro, costado, punta] = [HOMBRO(s), COSTADO(s), lerp(SUELTA(s), CASI(s), tira)].map(enCabina)
    return { s, punta, formas: [hueso(hombro, costado, 0.06 * K, C.grisOscuro), hueso(costado, punta, 0.06 * K, C.grisOscuro), el(punta, [0.03, 0.035, 0.035], C.gris)] }
  })
// Tironea de las dos puntas, o las suelta (`suelta`, de 0 a 1) y se encoge de hombros (`encoge`).
const conElCinturon = (tira, { suelta = 0, encoge = 0 } = {}) => {
  const lasCorreas = correas(tira * (1 - suelta))
  const hombros = { 1: [0.35, -0.35, 1.45], [-1]: [0.35, -0.35, -1.45] }
  const manos = Object.fromEntries(lasCorreas.map(({ s, punta }) => [s, lerp(lerp(enSusManos(punta), REPOSO[s], suelta), hombros[s], encoge)]))
  return [...lasCorreas.flatMap(({ formas }) => formas), ...elMarinero({ manos, salto: 0.08 * encoge })]
}

// El caza en el hangar con duky en la cabina y la escalerilla puesta.
const enLaCabina = (cupula, extra = []) => enHangar([...caza({ cupula }), ...escalerilla, ...dukyEn(SENTADO), ...extra])
// La cabina vista desde el morro, por arriba: el marinero a un lado y duky al otro.
const SOBRE_LA_CABINA = (() => {
  const de = (p) => sum(enCabina(p), AVION)
  return fija(de([9.5, 4.2, -1.6]), de([0, 0.4, -1.2]), 54)
})()

// El marinero cruza el hangar con duky en brazos, hacia la escalerilla.
const AL_CAZA = recorrido([[AVION[0] + LOMO.en[0] - 2.6, AVION[2] + LOMO.en[2] - 4.1], [AVION[0] + LOMO.en[0], AVION[2] + LOMO.en[2] - 2.2]])
const pasos = (s) => (s / 0.33) % 1
const alCaza = (u) => {
  const s = AL_CAZA.largo * u
  const { en, giro } = AL_CAZA.donde(s)
  const donde = { en: [en[0], PISO, en[2]], giro }
  return [...colocar(marinero(pasos(s), ARRIBA), { k: K, ...donde }), ...dukyEn(sobreLaCabeza(donde, K), duky.enBrazos())]
}

// ── El despegue ──────────────────────────────────────────────────────────

// En la catapulta de babor, como el de duck-one (escena3/tomas.mjs): lo
// lanza hasta la proa y, ya en el aire, sube y recoge el tren.
const BARCO = [MAR, ...portaaviones()]
const EN_CATAPULTA = [70, 20.8 - SUELO, -6]
const CARRERA = { desde: 0.15, hasta: 0.55, largo: 96 }
const enVuelo = (u) => {
  const corrido = CARRERA.largo * Math.min(1, Math.max(0, (u - CARRERA.desde) / (CARRERA.hasta - CARRERA.desde))) ** 2
  const vuelo = Math.max(0, (u - CARRERA.hasta) / (1 - CARRERA.hasta))
  return { vuelo, en: sum(EN_CATAPULTA, [corrido + 450 * Math.max(0, u - CARRERA.hasta), 50 * vuelo ** 1.6, 0]) }
}
const conDuky = (opciones, piloto) => [...caza(opciones), ...dukyEn(SENTADO, piloto)]

// ── La sonrisa ───────────────────────────────────────────────────────────

// Con la cabina cerrada, a duky le cambia la cara de a poco, con `k` de 0 a
// 1: una sonrisa sádica se le abre de mejilla a mejilla, oscura y llena de
// colmillos, los párpados bajan en diagonal y los ojos se le encienden de
// rojo. Sobre su cara de siempre (pilotos/modelos.mjs, de la forma 6 en
// adelante). La boca va pegada a lo que esté más adelante: el pico al medio,
// la cabeza en las comisuras.
const CARA = DUKY_HULE.slice(6)
const delante = (y, z) => {
  const pico = 1.04 + 0.36 * Math.sqrt(Math.max(0, 1 - (z / 0.32) ** 2 - ((y - 0.1) / 0.14) ** 2))
  const cabeza = 0.35 + 0.7 * Math.sqrt(Math.max(0, 1 - ((y - 0.2) / 0.68) ** 2 - (z / 0.66) ** 2))
  return Math.max(pico * (Math.abs(z) < 0.3 ? 1 : 0), cabeza) + 0.01
}
const caraQueSonrie = (k) => {
  if (k < 0.08) return CARA
  const ancho = 0.2 + 0.32 * k
  const N = 15
  const boca = Array.from({ length: N }, (_, i) => {
    const z = ((i / (N - 1)) * 2 - 1) * ancho
    const t = (z / ancho) ** 2
    const medio = 0.05 + 0.3 * k * t
    const abre = (0.02 + 0.1 * k) * (1 - t) + 0.015
    const colmillo = (y, sube) => el([delante(y, z) + 0.01, y + sube * 0.025, z], [0.02, 0.035, 0.02], C.blanco, { flat: '#fffbe8', brilla: true })
    return [
      el([delante(medio, z), medio, z], [0.03, abre, (ancho / N) * 1.3], C.oscuro, { flat: '#2a0604', brilla: true }),
      ...(i % 2 ? [colmillo(medio + abre - 0.02, -1)] : [colmillo(medio - abre + 0.02, 1)]),
    ]
  }).flat()
  return [
    ...CARA,
    ...boca,
    ...ambos((s) => [
      el([0.92, 0.54 - 0.1 * k, s * 0.36], [0.075, 0.07, 0.15], C.hule, { rot: [s * 32 * k, 0, 0] }),
      el([0.97, 0.37, s * 0.365], [0.02, 0.06 * k, 0.05 * k], C.boca, { flat: '#ff1a0a', brilla: true }),
      el([0.985, 0.36, s * 0.37], [0.012, 0.02 * k, 0.018 * k], C.blanco, { flat: '#ffd0a0', brilla: true }),
    ]).flat(),
  ]
}

// Sonríe en la catapulta y, a la mitad, la catapulta lo lanza: la cámara va
// en el tablero y la cubierta pasa hacia atrás cada vez más rápido.
const SONRISA = { lanza: 0.55, largo: 96 }
const enLaCatapulta = (u) => sum(EN_CATAPULTA, [SONRISA.largo * tramo(u, SONRISA.lanza, 1) ** 2, 0, 0])

// ── En vuelo ─────────────────────────────────────────────────────────────

// A 300 m sobre el mar. El caza se queda donde está y las nubes pasan hacia
// atrás, una vuelta de 600 m por bucle, más abajo y al otro lado del caza que
// la cámara: nunca lo tapan.
const ALTURA = [0, 300, 0]
const NUBES = [[-80, -30, 120, 40], [60, -50, 200, 55], [200, -20, 90, 35], [330, -45, 160, 60], [470, -25, 110, 45]]
const nubes = (u) => NUBES.map(([x, y, z, r]) => el([((x - 600 * u + 900) % 600) - 300, 300 + y, z], [r, r * 0.3, r * 0.6], C.nube))
const volando = (u) => [MAR, ...nubes(u), ...poner(conDuky({ motor: true, tren: false }), 0, ALTURA)]
const enVueloDe = (p) => sum(enCabina(p), ALTURA)

// ── La radio ─────────────────────────────────────────────────────────────

// La consola de radar de babor, en la sala de mando (escena1/lugares.mjs):
// la pantalla va inclinada hacia la sala. El barrido da dos vueltas por
// bucle; con `eco`, un punto parpadea donde está el enemigo.
const RADAR = { x: -1.6, y: 1.3 }
const enLaPantalla = (x, y) => [x, y + 0.016, -4.15 - ((y - 1.0) / 0.6) * 0.7 + 0.014]
const ECO = [RADAR.x + 0.3, RADAR.y + 0.09]
const radar = (u, eco) => {
  const a = u * Math.PI * 4
  const barrido = hueso(enLaPantalla(RADAR.x, RADAR.y), enLaPantalla(RADAR.x + 0.55 * Math.cos(a), RADAR.y + 0.2 * Math.sin(a)), 0.012, C.verde, { flat: '#b8ffc8', brilla: true })
  const prendido = eco && Math.floor(u * 12) % 3 !== 2
  return [barrido, ...(prendido ? [el(enLaPantalla(...ECO), [0.035, 0.035, 0.035], C.verde, { flat: '#eaffee', brilla: true })] : [])]
}
const torre = (eco) => (u) => [...reunion({ pantalla: PANTALLA, figuras: [] }), ...radar(u, eco)]

export const TOMAS_3D = {
  // El caza solo en el hangar, mientras la cámara se le acerca.
  nivel: {
    escena: () => enHangar(caza({ cupula: CUPULA_ABIERTA })),
    camara: (u) => {
      const k = suave(u)
      return [sum(AVION, lerp([10, 2.2, -6], [8, 1.5, -4.5], k)), sum(AVION, [1, 0, 0]), 60]
    },
  },
  recoge: {
    escena: (u) => reunion({ pantalla: PANTALLA, abre: 1, figuras: seLoLleva(u) }),
    camara: fija([-2.3, 1.8, -2.2], [-2.7, 1.2, 1.2], 64),
  },
  hangar: {
    escena: (u) => enHangar([...caza({ cupula: CUPULA_ABIERTA }), ...escalerilla]).concat(alCaza(u)),
    // Lo acompaña de lado, a su altura.
    camara: (u) => {
      const { en } = AL_CAZA.donde(AL_CAZA.largo * u)
      return [[en[0] + 1.2, PISO + 1.4, en[2] - 3.4], [en[0] + 0.6, PISO + 0.9, en[2]], 54]
    },
  },
  deposita: { escena: (u) => enHangar([...caza({ cupula: CUPULA_ABIERTA }), ...escalerilla, ...deposita(u)]), camara: SOBRE_LA_CABINA },
  cinturon: { escena: (u) => enLaCabina(CUPULA_ABIERTA, conElCinturon(0.55 + 0.45 * Math.abs(Math.sin(u * Math.PI * 2)))), camara: SOBRE_LA_CABINA },
  encoge: {
    escena: (u) => {
      const tira = 0.55 + 0.45 * Math.sin(tramo(u, 0, 0.25) * Math.PI)
      return enLaCabina(CUPULA_ABIERTA * (1 - tramo(u, 0.7, 0.95)), conElCinturon(tira, { suelta: tramo(u, 0.28, 0.4), encoge: tramo(u, 0.4, 0.5) * (1 - tramo(u, 0.62, 0.7)) }))
    },
    camara: SOBRE_LA_CABINA,
  },
  despega: {
    escena: (u) => {
      const { vuelo, en } = enVuelo(u)
      return [...BARCO, ...poner(conDuky({ motor: true, tren: vuelo < 0.4 }), 0, en)]
    },
    // Desde un helicóptero por babor, que lo acompaña y se queda en la proa.
    camara: (u) => {
      const { en } = enVuelo(u)
      return [[Math.min(88 + 0.85 * (en[0] - EN_CATAPULTA[0]), 182), 27, -34], sum(en, [4, 1, 0]), 40]
    },
  },
  // Un poco desde abajo: se ve todo lo que lleva bajo las alas.
  sonrisa: {
    escena: (u) => [...BARCO, ...poner(conDuky({ motor: u > SONRISA.lanza }, dukyFigura({ cara: caraQueSonrie(tramo(u, 0.05, 0.5)) })), 0, enLaCatapulta(u))],
    camara: (u) => {
      const tiembla = u > SONRISA.lanza ? 0.015 * Math.sin(Math.floor(u * 40) * 2.3) : 0
      const en = enLaCatapulta(u)
      return [sum(enCabina([3.4, 0.55 + tiembla, tiembla]), en), sum(enCabina([0, 0.3, 0]), en), 80]
    },
  },
  combate: { escena: volando, camara: fija(sum(ALTURA, [-13, -2.2, -14]), sum(ALTURA, [0.5, 0.6, 0]), 54) },

  radio: { escena: torre(false), camara: fija([RADAR.x, 2.15, -3.75], enLaPantalla(RADAR.x, RADAR.y), 56) },
  silencio: { escena: volando, camara: fija(enVueloDe([3.4, 1.0, 0]), enVueloDe([0, 0.1, 0]), 85) },
  pitido: { escena: torre(true), camara: fija([RADAR.x + 0.3, 1.85, -3.85], enLaPantalla(...ECO), 40) },
  termina: { escena: torre(false), camara: fija([RADAR.x - 0.9, 1.9, -3.5], enLaPantalla(RADAR.x, RADAR.y), 50) },
  calla: { escena: volando, camara: fija(enVueloDe([2.8, 0.8, -1.2]), enVueloDe([0, 0.1, 0.1]), 80) },
  otroPitido: { escena: torre(true), camara: fija([RADAR.x + 0.3, 1.65, -4.05], enLaPantalla(...ECO), 32) },
}
