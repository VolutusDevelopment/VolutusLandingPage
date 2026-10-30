// Las tomas de la escena 11, en 3D: qué se ve en el instante u ∈ [0, 1) y
// desde dónde, como las de la escena 2 (escena2/tomas.mjs). El guion, con
// sus líneas, está en src/lib/escena11.js.
//
// Un marinero saca a duky de la sala de mando (escena2/reunion.mjs), choca
// con él contra la pared de la puerta y lo lleva al hangar del Sitting Ducks
// (escena1/lugares.mjs), donde su F-22 (hangar.mjs) espera sobre el ascensor
// de popa. Lo sube a la cabina mientras la plataforma sube a la cubierta, y
// el caza despega desde el comienzo de la pista, con la cámara siempre en
// duky. En vuelo, el oficial de inteligencia le habla por radio desde la sala
// azul (cic.mjs), con el almirante detrás, y duky no contesta.

import { ASIENTOS, K as K_SALA, PUERTA, enUnidades, fase, girar, recorrido, reunion } from '../escena2/reunion.mjs'
import { EN_BRAZOS, duky, marinero } from '../escena2/patoon.mjs'
import { el, transformar } from '../pilotos/tres.mjs'
import { DUKY as DUKY_HULE, RAMPAS as C, hueso } from '../pilotos/modelos.mjs'
import { PERSONAJES, dukyFigura, figura, manosAndando } from '../pilotos/cuerpos.mjs'
import { ASCENSOR, HANGAR, MAR, colocar, enMarcha, poner, portaaviones } from '../escena1/lugares.mjs'
import { ALMIRANTE, OFICIAL, OFICIOS, marineroTronco, pMarinero, suave } from '../escena1/personajes.mjs'
import { K, SUELO, caza, enCabina, puntaDelCinturon } from './hangar.mjs'
import { cic } from './cic.mjs'
import { girosHacia, losTres } from '../escena10/tomas.mjs'
import { EN_CABINA } from '../tiras.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const res = (a, b) => a.map((v, i) => v - b[i])
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
export const ARRIBA = { 1: [0.15, 1.45, 0.7], [-1]: [0.15, 1.45, -0.7] }
export const sobreLaCabeza = ({ en, giro }, k) => ({ en: sum(en, [0, 3.4 * k, 0]), giro, suelo: -2.2 })

// ── En la sala: el marinero se lleva a duky ──────────────────────────────

// Entra hasta el costado del sillón, lo levanta, se da vuelta y camina con
// él hacia la puerta, primero de lado a la cámara: duky va delante y no lo tapa.
const DE_LA_PUERTA = recorrido([[-4.6, 2.8], [-2.4, 1.0]])
const A_LA_PUERTA = recorrido([[-2.4, 1.0], [-3.0, 1.05], [-3.0, 2.0]])
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

// ── La puerta ────────────────────────────────────────────────────────────

// Va derecho a la puerta, pero duky, sobre su cabeza, no cabe: la cabeza le
// da contra la pared de arriba. Los dos rebotan, duky se bambolea con
// estrellitas alrededor y el marinero se queda tambaleando.
const MEDIO_DE_LA_PUERTA = (PUERTA.z0 + PUERTA.z1) / 2
const CONTRA_LA_PUERTA = recorrido([[-2.6, MEDIO_DE_LA_PUERTA], [-3.5, MEDIO_DE_LA_PUERTA]])
const CHOCA = 0.45
const estrellitas = (centro, u) =>
  [0, 1, 2].map((i) => {
    const a = u * 14 + (i * Math.PI * 2) / 3
    return el(sum(centro, [Math.sin(a) * 0.4, 0.06 * Math.sin(a * 2), Math.cos(a) * 0.4]), [0.07, 0.07, 0.07], C.oro, { flat: '#fff2a4', brilla: true })
  })
const choca = (u) => {
  const rebote = 0.35 * tramo(u, CHOCA, CHOCA + 0.15)
  const s = CONTRA_LA_PUERTA.largo * Math.min(1, u / CHOCA) - rebote
  const { en, giro } = CONTRA_LA_PUERTA.donde(s)
  const golpe = Math.max(0, u - CHOCA)
  const bambolea = u > CHOCA ? 22 * Math.exp(-golpe * 9) * Math.cos(golpe * 40) : 0
  const tambalea = u > CHOCA ? 6 * Math.sin(golpe * 18) * (1 - tramo(u, 0.8, 1)) : 0
  const donde = { en, giro }
  const marineroF = figura(pMar, { tronco: marineroTronco(VERDE), manos: ARRIBA, fase: u < CHOCA ? fase(s) : null, inclina: tambalea })
  const dukyDonde = sobreLaCabeza(donde, K_SALA)
  const cabeza = sum(dukyDonde.en, [0, 3.6 * K_SALA, 0])
  return {
    figuras: [[marineroF, donde], [dukyFigura({ inclina: -bambolea }), dukyDonde]],
    extra: u > CHOCA && u < 0.85 ? estrellitas(cabeza, u) : [],
  }
}

// ── El caza y la escalerilla ─────────────────────────────────────────────

export const CUPULA_ABIERTA = 40

// El marinero se para en el lomo, junto a la cabina y mirando a ella: sube
// por una escalerilla desde el piso, con sus dos largueros y siete peldaños.
const LOMO = { en: enCabina([0.3, -2.15, -2.6]), giro: -90 }
const PIE = [LOMO.en[0], SUELO, LOMO.en[2] - 1.4]
const CIMA = [LOMO.en[0], LOMO.en[1], LOMO.en[2] - 0.2]
export const escalerilla = [
  ...[-0.25, 0.25].map((dx) => hueso(sum(PIE, [dx, 0, 0]), sum(CIMA, [dx, 0, 0]), 0.04, C.rayas)),
  ...Array.from({ length: 7 }, (_, i) => lerp(PIE, CIMA, (i + 1) / 8)).map((p) => hueso(sum(p, [-0.25, 0, 0]), sum(p, [0.25, 0, 0]), 0.03, C.rayas)),
]
const enSusManos = (p) => enUnidades(p, { ...LOMO, k: K })
const elMarinero = (cfg) => colocar(figura(pMar, { tronco: marineroTronco(VERDE), ...cfg }), { k: K, ...LOMO })

// duky, un modelo aparte del caza: siempre con sus patas, sin su sombra.
const SOMBRA = '#4a80e6'
const SENTADO = { en: enCabina([0, -2.2, 0]), giro: 0, suelo: -2.2 }
const dukyEn = (donde, formas = DUKY.sentado(0)) => colocar(formas.filter((f) => f.flat !== SOMBRA), { k: K, ...donde })
// El marinero con duky sobre la cabeza; con `paso`, caminando.
const conLaCarga = (donde, paso = null) => [...colocar(marinero(paso, ARRIBA), { k: K, ...donde }), ...dukyEn(sobreLaCabeza(donde, K), duky.enBrazos())]

// Lo pasa de sobre su cabeza a sobre la cabina, lo gira hacia el morro, lo
// baja y lo suelta para el último tramo, que duky cae solo.
const EN_EL_LOMO = sobreLaCabeza(LOMO, K)
const bajando = (u) => {
  const arriba = sum(SENTADO.en, [0, 0.55, 0])
  const pasa = lerp(EN_EL_LOMO.en, arriba, tramo(u, 0.1, 0.45))
  const baja = lerp(pasa, sum(SENTADO.en, [0, 0.3, 0]), tramo(u, 0.45, 0.7))
  return lerp(baja, SENTADO.en, tramo(u, 0.7, 0.8))
}
export const deposita = (u) => {
  const llevado = sum(enSusManos(bajando(Math.min(u, 0.7))), enSusManos(EN_EL_LOMO.en).map((v) => -v))
  const manos = Object.fromEntries([1, -1].map((s) => [s, lerp(sum(ARRIBA[s], llevado), REPOSO[s], tramo(u, 0.75, 0.95))]))
  return [...elMarinero({ manos }), ...dukyEn({ en: bajando(u), giro: girar(-90, 0, tramo(u, 0.1, 0.45)), suelo: -2.2 }, duky.enBrazos())]
}

export const conDuky = (opciones, piloto) => [...caza(opciones), ...dukyEn(SENTADO, piloto)]

// El marinero tironea de las dos puntas del cinturón (`tira`, de 0 a 1), o
// las suelta (`suelta`) y se encoge de hombros (`encoge`); con `mira`, se
// inclina a mirar la correa. duky es medio gordito: mientras más tironea, más
// se le aprieta la barriga, y la correa igual no le cierra. Da el cinturón
// como quedó y a los dos.
const tirando = (tira, { suelta = 0, encoge = 0, mira = 0 } = {}) => {
  const cinturon = tira * (1 - suelta)
  const hombros = { 1: [0.35, -0.35, 1.45], [-1]: [0.35, -0.35, -1.45] }
  const manos = Object.fromEntries([1, -1].map((s) => [s, lerp(lerp(enSusManos(puntaDelCinturon(s, cinturon)), REPOSO[s], suelta), hombros[s], encoge)]))
  const aprieta = Math.max(0, (cinturon - 0.55) / 0.45)
  const apretado = deformar(DUKY.sentado(0), [0, -1.9, 0], [1, 1 + 0.06 * aprieta, 1 - 0.14 * aprieta])
  return { cinturon, figuras: [...elMarinero({ manos, salto: 0.08 * encoge, inclina: -10 * mira }), ...dukyEn(SENTADO, apretado)] }
}

// ── En el ascensor ───────────────────────────────────────────────────────

// El caza espera sobre la plataforma del ascensor de popa con el morro a popa,
// así la escalerilla queda hacia el mar. `k` es dónde va la plataforma, de 0
// (en el hangar) a 1 (en la cubierta); `delCaza` lleva un punto del caza al barco.
const SOBRE_EL_ASCENSOR = [(ASCENSOR.x0 + ASCENSOR.x1) / 2, (ASCENSOR.z0 + ASCENSOR.z1) / 2]
const enAscensor = (k) => [SOBRE_EL_ASCENSOR[0], HANGAR.piso + (20.8 - HANGAR.piso) * k - SUELO, SOBRE_EL_ASCENSOR[1]]
const delCaza = (k, [x, y, z]) => sum(enAscensor(k), [-x, y, -z])
const enElAscensor = (u, k, formas) => [MAR, ...portaaviones({ ...enMarcha(u), ascensor: k }), ...poner(formas, 180, enAscensor(k))]
// Arriba, a ras de la cubierta, con la escalerilla puesta.
const enLaCabina = (u, cupula, { cinturon, figuras }) => enElAscensor(u, 1, [...caza({ cupula, cinturon }), ...escalerilla, ...figuras])
// Junto a la cabina, del lado de afuera del marinero, bajo la cúpula abierta.
const JUNTO_A_LA_CABINA = { ojo: [3.0, 1.2, 7.5], mira: [-0.2, 0.0, -0.6], campo: 54 }
const CERCA_DE_LA_CABINA = { ojo: [2.2, 1.6, 5.0], mira: [-0.1, -0.6, -0.4], campo: 52 }
const alLado = (k, { ojo, mira, campo }) => [delCaza(k, enCabina(ojo)), delCaza(k, enCabina(mira)), campo]

// Cruza el hangar con duky en brazos, hacia el portalón y el caza.
const AL_PORTALON = recorrido([[SOBRE_EL_ASCENSOR[0] + 1.5, 3], [SOBRE_EL_ASCENSOR[0] + 1.5, 16.5]])
const enElHangar = (u) => {
  const { en, giro } = AL_PORTALON.donde(AL_PORTALON.largo * u)
  return { en: [en[0], HANGAR.piso, en[2]], giro }
}
const alPortalon = (u) => conLaCarga(enElHangar(u), fase(AL_PORTALON.largo * u))

// Sube por la escalerilla mientras se abre la cúpula y la plataforma
// arranca; después lo deposita y la plataforma termina de subir.
const SUBE = 0.4
const subiendo = (u) => {
  const s = tramo(u, 0.2, 0.85)
  return conLaCarga({ en: lerp([PIE[0], SUELO, PIE[2] - 0.35], LOMO.en, s), giro: LOMO.giro }, s > 0 && s < 1 ? (s * 5) % 1 : null)
}

// ── El despegue ──────────────────────────────────────────────────────────

// Desde el comienzo de la catapulta de babor: quieto un instante, la
// catapulta lo lanza hasta la proa y, ya en el aire, sube con el morro
// arriba. La cámara va en el tablero, mirando a duky todo el tiempo.
const PISTA = { en: [40, 20.8 - SUELO, -6], lanza: 0.12, sale: 0.62, largo: 127 }
const despegando = (u) => {
  const corre = Math.min(1, Math.max(0, (u - PISTA.lanza) / (PISTA.sale - PISTA.lanza)))
  const aire = Math.max(0, u - PISTA.sale)
  const rapidez = (2 * PISTA.largo) / (PISTA.sale - PISTA.lanza)
  const sube = 35 * (aire / (1 - PISTA.sale)) ** 1.6
  return transformar([0, 0, 10 * tramo(u, PISTA.sale, PISTA.sale + 0.2)], [0, 0, 0], sum(PISTA.en, [PISTA.largo * corre ** 2 + rapidez * aire, sube, 0]))
}

// ── La emoción ───────────────────────────────────────────────────────────

// duky jadea de la emoción como lo que es, un pato de hule que alguien
// aprieta: con `k` de 0 a 1 se aplasta entero desde el asiento, ancho y bajo,
// y bota el aire por el pico abierto; al soltarlo vuelve a su forma y lo
// recupera. El pico de su cara de siempre (la forma 7 de pilotos/modelos.mjs)
// se parte en dos. En la catapulta, en cambio, la aceleración lo pega al
// respaldo (`pegar`, con `g` de 0 a 1): se achata contra él.
const CARA = DUKY_HULE.slice(6)
const PICO = DUKY_HULE[7]
const caraQueJadea = (k) => [
  ...CARA.filter((forma) => forma !== PICO),
  el(sum(PICO.c, [0, 0.03 + 0.05 * k, 0]), [0.36, 0.08, 0.32], C.picoHule, { rot: [0, 0, 6 + 10 * k] }),
  el(sum(PICO.c, [-0.04, -0.03 - 0.06 * k, 0]), [0.3, 0.07, 0.28], C.picoHule, { rot: [0, 0, -14 * k] }),
  el(sum(PICO.c, [-0.08, 0, 0]), [0.22, 0.02 + 0.08 * k, 0.22], C.oscuro, { flat: '#3a0e0a' }),
]
const deformar = (formas, base, S) => {
  const p = (v) => v.map((x, i) => base[i] + (x - base[i]) * S[i])
  return formas.map((f) =>
    f.k === 'e' ? { ...f, c: p(f.c), r: f.r.map((x, i) => x * S[i]) } : { ...f, centro: p(f.centro), tris: f.tris.map((t) => ({ ...t, a: p(t.a), b: p(t.b), c: p(t.c) })) },
  )
}
const aplastar = (formas, k) => deformar(formas, [0, -1.9, 0], [1 + 0.14 * k, 1 - 0.24 * k, 1 + 0.14 * k])
// Pegado, se achata contra el respaldo, se ensancha y aprieta los ojos.
const [, , ...OJOS] = CARA
const caraPegada = (g) => CARA.filter((f, i) => g < 0.5 || i < 4).map((f) => (OJOS.includes(f) ? { ...f, r: [f.r[0], f.r[1] * (1 - 0.75 * g), f.r[2] * (1 + 0.3 * g)] } : f))
const pegar = (formas, g) => deformar(formas, [-1.2, -1.9, 0], [1 - 0.35 * g, 1 - 0.14 * g, 1 + 0.24 * g])
// Jadea `veces` por bucle, con fuerza `fuerza` (de 0 a 1).
const jadea = (u, veces, fuerza = 1) => fuerza * (0.5 - 0.5 * Math.cos(u * Math.PI * 2 * veces))
const jadeando = (u, veces) => aplastar(dukyFigura({ cara: caraQueJadea(jadea(u, veces)) }), jadea(u, veces))
// En la pista va pegado al asiento; recién en el aire se suelta y empieza a jadear.
const dukyDespega = (u) => {
  const g = tramo(u, PISTA.lanza, PISTA.lanza + 0.05) * (1 - tramo(u, PISTA.sale + 0.02, PISTA.sale + 0.14))
  const k = jadea(u, 10, tramo(u, PISTA.sale + 0.14, 0.95))
  return pegar(aplastar(dukyFigura({ cara: g > 0.05 ? caraPegada(g) : caraQueJadea(k) }), k), g)
}

// La cámara en el tablero, sobre la pantalla, mirando a duky: en unidades de la cabina.
const TABLERO = { ojo: [3.6, 0.55, 0], mira: [-0.4, -0.5, 0], campo: 72 }

// ── En vuelo ─────────────────────────────────────────────────────────────

// A 300 m sobre el mar. El caza se queda donde está y las nubes pasan hacia
// atrás, una vuelta de 600 m por bucle, más abajo y al otro lado del caza que
// la cámara: nunca lo tapan.
export const ALTURA = [0, 300, 0]
const NUBES = [[-80, -30, 120, 40], [60, -50, 200, 55], [200, -20, 90, 35], [330, -45, 160, 60], [470, -25, 110, 45]]
export const nubes = (u) => NUBES.map(([x, y, z, r]) => el([((((x - 600 * u + 900) % 600) + 600) % 600) - 300, 300 + y, z], [r, r * 0.3, r * 0.6], C.nube))
const volando = (u, piloto = DUKY.sentado(0)) => [MAR, ...nubes(u), ...poner(conDuky({ motor: true, tren: false }, piloto), 0, ALTURA)]
const enVueloDe = (p) => sum(enCabina(p), ALTURA)

// ── La radio ─────────────────────────────────────────────────────────────

// En la sala azul, el oficial habla por radio o calla, y el almirante, detrás,
// mira las pantallas; con `eco`, quien juega aparece en los radares.
const gesto = (p, nombre) => p.gestos.find((g) => g.nombre === nombre).pose
const POR_RADIO = gesto(OFICIAL, 'habla por radio')
const enLaSalaAzul = ({ habla = false, eco = false }) => cic({ oficial: habla ? POR_RADIO : (u) => POR_RADIO(u, { abre: 0 }), almirante: gesto(ALMIRANTE, 'mira las pantallas'), eco })

// La sala con el marinero y duky, `figuras`, en ese orden, y los demás donde
// terminó la escena 10, siguiendo a duky con la vista.
const losVenIrse = (u, figuras) => {
  const { en } = figuras[1][1]
  const duky = [en[0], en[2]]
  return reunion({ pantalla: PANTALLA, abre: 1, giros: girosHacia(duky), figuras: [...losTres(u, duky), ...figuras] })
}

export const TOMAS_3D = {
  // Desde lo alto, por sobre la mesa.
  recoge: {
    escena: (u) => losVenIrse(u, seLoLleva(u)),
    camara: fija([3.2, 2.6, -2.6], [-2.4, 1.0, 1.2], 58),
  },
  // De costado, desde la sala: se ve la puerta y la pared contra la que choca.
  choca: {
    escena: (u) => {
      const { figuras, extra } = choca(u)
      return [...losVenIrse(u, figuras), ...extra]
    },
    camara: fija([-2.4, 1.9, -0.3], [-3.5, 2.0, MEDIO_DE_LA_PUERTA], 56),
  },
  // La primera vez que se ve el caza: con la cúpula cerrada, recortado en el
  // portalón contra el atardecer. La cámara va detrás del marinero.
  hangar: {
    escena: (u) => [...enElAscensor(u, 0, [...caza(), ...escalerilla]), ...alPortalon(u)],
    camara: (u) => {
      const { en } = enElHangar(u)
      return [[en[0] + 1.6, HANGAR.piso + 1.2, en[2] - 3.4], [en[0] - 0.4, HANGAR.piso + 2.4, en[2] + 10], 58]
    },
  },
  // Desde la plataforma, abajo y de contrapicado: sube con ella, y detrás el
  // costado del barco baja hasta que asoma el cielo.
  sube: {
    escena: (u) => enElAscensor(u, SUBE * suave(u), [...caza({ cupula: CUPULA_ABIERTA * tramo(u, 0, 0.2) }), ...escalerilla, ...subiendo(u)]),
    camara: (u) => {
      const y = HANGAR.piso + (20.8 - HANGAR.piso) * SUBE * suave(u)
      return [[-74, y + 0.9, 36.4], [-80, y + 2.4 + 0.6 * suave(u), 31.2], 60]
    },
  },
  // De costado y adelante, bajo la cúpula, que se abre desde la bisagra de
  // atrás: lo deja en el asiento con el atardecer detrás, mientras la
  // plataforma llega a la cubierta.
  deposita: {
    abre: EN_CABINA,
    escena: (u) => enElAscensor(u, SUBE + (1 - SUBE) * suave(u), [...caza({ cupula: CUPULA_ABIERTA }), ...escalerilla, ...deposita(u)]),
    camara: (u) => alLado(SUBE + (1 - SUBE) * suave(u), JUNTO_A_LA_CABINA),
  },
  cinturon: { abre: EN_CABINA, escena: (u) => enLaCabina(u, CUPULA_ABIERTA, tirando(0.55 + 0.45 * Math.abs(Math.sin(u * Math.PI * 2)))), camara: () => alLado(1, CERCA_DE_LA_CABINA) },
  // Un último tirón, con fuerza: lo sostiene, se inclina a mirar la correa que
  // no cierra y la suelta. Se encoge de hombros, cierra la cabina, y duky
  // queda adentro un momento, sin cinturón.
  encoge: {
    abre: EN_CABINA,
    escena: (u) => {
      const tira = 0.55 + 0.45 * tramo(u, 0, 0.09) * (1 - tramo(u, 0.24, 0.33))
      const mira = tramo(u, 0.15, 0.21) * (1 - tramo(u, 0.24, 0.3))
      return enLaCabina(u, CUPULA_ABIERTA * (1 - tramo(u, 0.64, 0.82)), tirando(tira, { suelta: tramo(u, 0.33, 0.42), encoge: tramo(u, 0.42, 0.5) * (1 - tramo(u, 0.585, 0.64)), mira }))
    },
    camara: () => alLado(1, JUNTO_A_LA_CABINA),
  },
  despegue: {
    abre: EN_CABINA,
    escena: (u) => [MAR, ...portaaviones({ ...enMarcha(u), radar: u * 120 }), ...despegando(u).formas(conDuky({ motor: u > PISTA.lanza - 0.04, tren: u < PISTA.sale + 0.2 }, dukyDespega(u)))],
    camara: (u) => {
      const { punto } = despegando(u)
      const tiembla = u > PISTA.lanza && u < PISTA.sale + 0.05 ? 0.08 * Math.sin(Math.floor(u * 30) * 2.3) : 0
      return [punto(enCabina(sum(TABLERO.ojo, [0, tiembla, tiembla]))), punto(enCabina(TABLERO.mira)), TABLERO.campo, res(punto([0, 1, 0]), punto([0, 0, 0]))]
    },
  },
  emocion: { abre: EN_CABINA, escena: (u) => volando(u, jadeando(u, 8)), camara: fija(enVueloDe(TABLERO.ojo), enVueloDe(TABLERO.mira), TABLERO.campo) },

  // Desde su consola, junto a la pantalla, de frente al oficial; el almirante, detrás.
  radio: { escena: enLaSalaAzul({ habla: true }), camara: fija([2.5, 1.15, 0.2], [1.0, 1.02, -0.05], 50) },
  // Mientras el oficial llama, duky de perfil frente al tablero del F-22, de un
  // lado y del otro: las pantallas encendidas y él, que no contesta.
  silencio: { abre: EN_CABINA, escena: (u) => volando(u), camara: fija(enVueloDe([1.2, 0.6, -1.45]), enVueloDe([1.9, -1.0, 0.7]), 96) },
  // El radar de su consola, de cerca: aparece el eco.
  pitido: { escena: enLaSalaAzul({ eco: true }), camara: fija([1.5, 1.2, -0.95], [2.12, 1.1, -0.5], 40) },
  // Por el lado izquierdo del oficial, el que no tapa su brazo.
  termina: { escena: enLaSalaAzul({ habla: true }), camara: fija([2.0, 1.25, -1.2], [1.0, 1.0, 0.0], 54) },
  calla: { abre: EN_CABINA, escena: (u) => volando(u), camara: fija(enVueloDe([0.9, 0.75, 1.5]), enVueloDe([1.9, -0.9, -0.55]), 92) },
  // Desde el rincón del fondo, en alto, la sala entera: el almirante de
  // espaldas, el oficial en su consola y el eco otra vez en el radar grande.
  otroPitido: { escena: enLaSalaAzul({ eco: true }), camara: fija([-3.1, 2.0, 2.3], [1.1, 1.1, -0.42], 58) },
}
