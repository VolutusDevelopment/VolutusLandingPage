// Las tomas de la escena 14, en 3D: qué se ve en el instante u ∈ [0, 1) y
// desde dónde, como las de la escena 13 (escena13/tomas.mjs), de donde salen
// la cabina de duky y la pantalla de la sala. El guion, con sus líneas, está
// en src/lib/escena14.js; el indicador de munición y la marca de quien juega,
// en visor.mjs.
//
// Duky tira todo lo que tiene y no le da a quien juega: cada ráfaga va a donde
// estaba, y quien juega ya no está. Las cámaras van dentro de la cabina, como
// en las láminas v15 (pilotos/cabinas.mjs), y el caza alabea y cabecea de
// verdad. Sin balas, duky chilla como el pato de hule que es, vuelve al
// portaaviones en una S partida y se calma: primero exhala y después inhala.
// En la sala, la cámara de duky se corta, moby llora y la cámara sigue a cada
// uno a lo suyo hasta una esquina.

import { MAR, portaaviones, poner } from '../escena1/lugares.mjs'
import { el, transformar } from '../pilotos/tres.mjs'
import * as M from '../pilotos/modelos.mjs'
import { RAMPAS as C } from '../pilotos/modelos.mjs'
import { PERSONAJES, dukeAbierto, dukyFigura, espejoDeMano, figura, manosAndando, pDuckOne, pDuke, pMoby } from '../pilotos/cuerpos.mjs'
import { recoge } from '../pilotos/recoge.mjs'
import { silaba, suave } from '../escena1/personajes.mjs'
import { duckOne, sentar } from '../escena2/patoon.mjs'
import { ASIENTOS, fase, giroHacia, girar, recorrido, reunion } from '../escena2/reunion.mjs'
import { ALTURA, conDuky, nubes } from '../escena11/tomas.mjs'
import { enCabina } from '../escena11/hangar.mjs'
import { ASIENTO, BISEL, DE_FRENTE, DONDE, FILA, MONITORES, dentro, dukyFeliz, radar } from '../escena13/tomas.mjs'
import { enemigo } from '../escena13/visor.mjs'
import { aSuDistancia, proyectar } from '../tiras.mjs'
import { aLoLejos, municion } from './visor.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const res = (a, b) => a.map((v, i) => v - b[i])
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const entre = (a, b, k) => a + (b - a) * k
const tramo = (u, a, b) => suave((u - a) / (b - a))
const fija = (ojo, mira, campo) => () => [ojo, mira, campo]
const vuelta = (u) => (u % 1) * Math.PI * 2
const ciclo = (u) => ((u % 1) + 1) % 1
const lejos = ([ojo], punto) => Math.hypot(...res(punto, ojo))
const juntos = (...quienes) => (u) => Object.assign({}, ...quienes.map((q) => q(u)))

const [DUCK_ONE, , DUKE] = PERSONAJES

// ── Duky, de hule ────────────────────────────────────────────────────────

// Aplasta sus formas `escala` ([x, y, z]) desde `pivote`: el hule cede.
// Aproximado: cada elipsoide conserva su giro y estira sus radios.
const aplastar = (formas, escala, pivote) => {
  const ida = (p) => sum(pivote, res(p, pivote).map((v, i) => v * escala[i]))
  const vuelve = (p) => sum(pivote, res(p, pivote).map((v, i) => v / escala[i]))
  return formas.map((f) => {
    const g =
      f.k === 'e'
        ? { ...f, c: ida(f.c), r: f.r.map((r, i) => r * Math.hypot(...[0, 1, 2].map((j) => f.M[j][i] * escala[j]))) }
        : { ...f, centro: ida(f.centro), tris: f.tris.map((t) => ({ ...t, a: ida(t.a), b: ida(t.b), c: ida(t.c) })) }
    if (f.pinta) g.pinta = (p, n) => f.pinta(vuelve(p), n)
    return g
  })
}
// Desinflado en `k` (0, como siempre; 1, la mitad de alto y más ancho), sentado.
const desinflado = (formas, k) => aplastar(formas, [1 + 0.3 * k, 1 - 0.5 * k, 1 + 0.3 * k], ASIENTO)

const enElCaza = (piloto) => conDuky({ motor: true, tren: false }, piloto).filter((f) => !f.vidrio)
// Mientras tiene balas, va feliz como en la escena 13.
const feliz = (u) => dukyFeliz(u, 6)
const DE_HULE = conDuky({ motor: true, tren: false }, dukyFigura({}))

// ── Las maniobras ────────────────────────────────────────────────────────

// Una maniobra da, en el instante u, el alabeo, el rumbo y el cabeceo del caza
// en grados, a 300 m sobre el mar; `en` lo corre de ahí.
const enManiobra = ({ alabeo = 0, rumbo = 0, cabeceo = 0, en = [0, 0, 0] }) => transformar([alabeo, rumbo, cabeceo], [0, 0, 0], sum(ALTURA, en))
const NIVELADO = () => ({})
// Alabea `grados` de un lado al otro y tira del morro `tirones` veces.
const virajes = (grados, tirones = 1) => (u) => ({ alabeo: grados * Math.sin(vuelta(u)), cabeceo: 12 * Math.sin(vuelta(u) * tirones * 2) })
// Un tonel entero por tira.
const TONEL = (u) => ({ alabeo: 360 * u, cabeceo: 6 * Math.sin(vuelta(u)) })
// Sacudido por los chillidos.
const TEMBLOR = (u) => ({ alabeo: 8 * Math.sin(Math.floor(u * 48) * 2.3) })

// Una cámara amarrada a la cabina, en sus unidades (pilotos/interiores.mjs)
// como las de las láminas v15: vira con el caza.
const aBordo = (maniobra, [ojo, mira, campo]) => (u) => {
  const T = enManiobra(maniobra(u))
  return [T.punto(enCabina(ojo)), T.punto(enCabina(mira)), campo, res(T.punto([0, 1, 0]), T.punto([0, 0, 0]))]
}
const CAMARAS = {
  // Sobre la nuca de duky: su cabeza y, delante, quien juega.
  detras: [[-0.9, 1.6, 0], [6, 0.6, 0], 80],
  tablero: [[3.4, 1.0, 0], [0, 0.1, 0], 85],
  tresCuartos: [[2.8, 0.8, -1.2], [0, 0.1, 0.1], 80],
  hombro: [[-1.0, 1.3, -0.85], [2.5, 0.0, 0.3], 95],
}

// ── Los tiros ────────────────────────────────────────────────────────────

// Quien juega, a 140 m, en una curva que se cierra más con cada `nervio`.
const blanco = (nervio) => (u) => sum(ALTURA, [140, 30 + (8 + 4 * nervio) * Math.sin(vuelta(u) * (nervio + 1)), (24 + 6 * nervio) * Math.sin(vuelta(u) * nervio + 1)])
const QUIETO = blanco(1)
const NERVIOSO = blanco(2)
const SIN_DESCANSO = blanco(4)

// Cada tiro sale de un cañón hacia `destino`, el lugar al que apuntó, y sigue
// de largo: quien juega ya se movió. Tarda `VIAJE` en llegar. Como en la
// escena 13, cerca avanza más rápido y tiene un par de pixeles de grueso con
// cualquier `campo`. Al salir, un fogonazo en la boca del cañón.
const CANONES = [[6, 0.2, 2.2], [6, 0.2, -2.2]]
const VIAJE = 0.25
const trazadora = (canon, destino, s, [ojo, , campo]) => {
  const [a, b] = [lerp(canon, destino, s ** 2), lerp(canon, destino, (s + 0.18) ** 2)]
  const grosor = (0.02 + 0.02 * Math.hypot(...res(a, ojo))) * (Math.tan((campo * Math.PI) / 360) / Math.tan(Math.PI / 4.5))
  return M.hueso(a, b, grosor, C.boca, { flat: '#ff3a2a', brilla: true })
}
const fogonazo = (canon) => el(canon, [0.5, 0.35, 0.35], C.blanco, { flat: '#fff1a8', brilla: true })

// Una ráfaga: `tiros` por vuelta, que se turnan los cañones, y `desvio(k)`, lo
// que el tiro k se aparta de quien juega, en metros (y, z). Solo los que salen
// antes de `hasta`.
const rafaga = ({ tiros, objetivo, desvio, hasta = 1 }) => (u, T, camara) =>
  Array.from({ length: tiros }, (_, k) => {
    const sale = k / tiros
    if (sale >= hasta) return []
    const s = ciclo(u - sale) / VIAJE
    if (s > 1.6) return []
    const canon = T.punto(CANONES[k % 2])
    const destino = sum(objetivo(sale), [0, ...desvio(k)])
    return [trazadora(canon, destino, s, camara), ...(s < 0.15 ? [fogonazo(canon)] : [])]
  }).flat()

// Abanicos que giran: cada tiro, en un rayo de una estrella de `puntas`.
const ORO = Math.PI * (3 - Math.sqrt(5))
const estrella = (puntas, radio) => (k) => {
  const a = (k % puntas) * ((Math.PI * 2) / puntas) + Math.floor(k / puntas) * ORO
  return [radio * Math.sin(a), radio * Math.cos(a)]
}
// Una espiral que se abre.
const espiral = (k) => [(6 + (k % 9) * 2.5) * Math.sin(k * ORO), (6 + (k % 9) * 2.5) * Math.cos(k * ORO)]

const RAFAGAS = {
  patrones: rafaga({ tiros: 24, objetivo: QUIETO, desvio: estrella(6, 14) }),
  lluvia: rafaga({ tiros: 48, objetivo: NERVIOSO, desvio: espiral }),
  secuencia: rafaga({ tiros: 36, objetivo: SIN_DESCANSO, desvio: () => [0, 0] }),
}

// Quien juega donde lo vea `camara`, tapado por lo que tenga delante.
const marcar = (camara, objetivo) => (celdas, u, modo, distancias) => {
  const c = camara(u)
  aSuDistancia(celdas, distancias, lejos(c, objetivo(u)), (cs) => enemigo(cs, u, modo, proyectar(c, objetivo(u))))
}

// ── El ataque ────────────────────────────────────────────────────────────

// Desde la cabina: la maniobra, la ráfaga, quien juega, las balas que
// quedan, de `municiones[0]` a `municiones[1]`, y el `piloto` en el instante u.
const cabina = ({ maniobra = NIVELADO, camara = 'detras', objetivo = QUIETO, dispara, municiones: [desde, hasta], piloto = feliz }) => {
  const cam = aBordo(maniobra, CAMARAS[camara])
  return {
    escena: (u) => {
      const T = enManiobra(maniobra(u))
      return [MAR, ...nubes(u), ...T.formas(enElCaza(piloto(u))), ...(dispara ? dispara(u, T, cam(u)) : [])]
    },
    camara: cam,
    encima: (celdas, u, modo, distancias) => {
      marcar(cam, objetivo)(celdas, u, modo, distancias)
      municion(celdas, u, desde + (hasta - desde) * Math.min(1, u))
    },
  }
}

// Desde afuera: el caza entero y, si hay `objetivo`, quien juega (sin él,
// quien juega es la cámara).
const afuera = ({ maniobra, objetivo, dispara, camara }) => ({
  escena: (u) => {
    const T = enManiobra(maniobra(u))
    return [MAR, ...nubes(u), ...T.formas(conDuky({ motor: true, tren: false }, feliz(u))), ...dispara(u, T, camara(u))]
  },
  camara,
  encima: objetivo && marcar(camara, objetivo),
})

const ATAQUE = {
  patrones: cabina({ maniobra: virajes(45), objetivo: QUIETO, dispara: RAFAGAS.patrones, municiones: [999, 720] }),
  // Desde donde está quien juega: el caza le viene de frente, disparándole.
  frente: afuera({ maniobra: virajes(30), dispara: RAFAGAS.patrones, camara: (u) => [QUIETO(u), sum(ALTURA, [0, 1, 0]), 11] }),
  lluvia: cabina({ maniobra: virajes(70, 2), camara: 'hombro', objetivo: NERVIOSO, dispara: RAFAGAS.lluvia, municiones: [720, 400] }),
  // A su lado, dando un tonel mientras la lluvia sale hacia adelante.
  costado: afuera({ maniobra: TONEL, objetivo: NERVIOSO, dispara: RAFAGAS.lluvia, camara: fija(sum(ALTURA, [-1, 3, -18]), sum(ALTURA, [2, 4, 0]), 60) }),
  secuencia: cabina({ maniobra: virajes(60, 2), camara: 'tresCuartos', objetivo: SIN_DESCANSO, dispara: RAFAGAS.secuencia, municiones: [400, 60] }),
  // Por detrás y arriba, siguiendo los tiros hasta quien juega.
  cola: afuera({ maniobra: virajes(80, 2), objetivo: SIN_DESCANSO, dispara: RAFAGAS.secuencia, camara: fija(sum(ALTURA, [-32, 6, 4]), sum(ALTURA, [140, 16, 0]), 46) }),
  cero: cabina({ maniobra: virajes(20), dispara: rafaga({ tiros: 24, objetivo: QUIETO, desvio: estrella(3, 10), hasta: 0.3 }), municiones: [60, -140] }),
  // Sin balas, se queda quieto.
  silencio: cabina({ municiones: [0, 0], piloto: () => dukyFigura({}) }),
}

// ── El chillido, la vuelta y el respiro ──────────────────────────────────

// Y después chilla como chillan los patos de hule, apretándose de golpe, una
// y otra vez.
const chilla = (u) => {
  const aprieta = Math.abs(Math.sin(vuelta(u) * 4)) ** 3
  const piloto = desinflado(dukyFigura({ inclina: 6 * Math.sin(Math.floor(u * 48) * 1.7) }), 0.45 * aprieta)
  return [MAR, ...nubes(u), ...enManiobra(TEMBLOR(u)).formas(enElCaza(piloto))]
}

// Una S partida: se pone de espaldas, tira del morro hasta quedar al revés de
// como venía y se va hacia el portaaviones, que espera en el horizonte.
const PORTAAVIONES = poner(portaaviones(), 30, [-1800, 0, 300])
const S_PARTIDA = (u) => {
  const g = tramo(u, 0.25, 0.6)
  const arco = [25 * Math.sin(Math.PI * g), -25 * (1 - Math.cos(Math.PI * g)), 0]
  return { alabeo: 180 * tramo(u, 0.05, 0.25), cabeceo: -180 * g, en: sum(arco, [-420 * tramo(u, 0.6, 1) ** 1.6, -20 * tramo(u, 0.6, 1), 0]) }
}

// Ya de vuelta, desde el tablero: exhala primero, desinflándose, y después
// inhala hasta quedar como estaba.
const respira = (u) => {
  const k = tramo(u, 0.1, 0.45) - tramo(u, 0.6, 0.9)
  return [MAR, ...nubes(u * 0.5), ...enManiobra({}).formas(enElCaza(desinflado(dukyFigura({}), k)))]
}

// ── La sala ──────────────────────────────────────────────────────────────

// La cámara de duky se cortó: nieve en la cara y en la cabina; el radar sigue.
const nieve = (t, u, v) => {
  const h = Math.sin(Math.floor(u * 90) * 12.99 + Math.floor(v * 30) * 78.23 + Math.floor(t * 12) * 37.7) * 43758.5
  return ['#1c2028', '#3a3f48', '#6a707a', '#a8adb4'][Math.floor((h - Math.floor(h)) * 4)]
}
const sinSenal = (t) => (u, v) => {
  const monitor = Object.entries(MONITORES).find(([, m]) => dentro(u, m))
  if (!monitor) return BISEL
  const [quien, [a, b]] = monitor
  const cv = (v - 0.03) / 0.94
  return quien === 'radar' ? radar(t, (u - a) / (b - a), cv) : nieve(t, u, v)
}

// Los tres, de pie en la fila de la escena 13.
const reposo = (p) => ({ 1: p.reposo(1), [-1]: p.reposo(-1) })

// moby se deshace: llora a chorros con el pico abierto, se agarra la cabeza
// y los sollozos lo sacuden.
const sollozo = (u) => Math.abs(Math.sin(vuelta(u) * 5))
const llorando = (u) => [...M.MOBY_TORSO, ...M.mobyCabeza({ t: u * 8, humea: false, pena: 1, llanto: 1.6, abre: 0.45 + 0.45 * sollozo(u) })]
const CODOS_AFUERA = { ...pMoby, dobla: (s) => [-0.2, -0.6, s] }
const agarrandoseLaCabeza = (u) => Object.fromEntries([1, -1].map((s) => [s, [0.55, 0.75 + 0.08 * Math.sin(vuelta(u) * 5 + s), s * 1.0]]))
const mobyDeshecho = (u) => figura(CODOS_AFUERA, { tronco: llorando(u), manos: agarrandoseLaCabeza(u), salto: 0.08 * sollozo(u), inclina: 6 + 4 * Math.sin(vuelta(u) * 5) })
// Sentado se hunde 0,2, como moby.sentado (escena2/patoon.mjs).
const mobySentado = (u) => sentar(pMoby, mobyDeshecho(u), 0.2)

const enFila = (u) => ({
  duckOne: [duckOne.atras(), DONDE.duckOne],
  moby: [mobyDeshecho(u), DONDE.moby],
  duke: [DUKE.sentado(u, reposo(pDuke)), DONDE.duke],
})
// Quien habla, en su lugar de la fila.
const habla = (quien, cuerpo) => (u) => ({ [quien]: [cuerpo(u), DONDE[quien]] })

// La sala sin señal con los tres en fila; `cambios(u)` mueve a quien diga y
// `giros(u)`, los sillones.
const sala = (cambios = () => ({}), giros = () => ({})) => (u) => reunion({ pantalla: sinSenal(u), giros: giros(u), figuras: Object.values({ ...enFila(u), ...cambios(u) }) })

// Por el ventanal, a lo lejos, sigue quien juega: en el cielo del tercer
// panel, tapado por lo que tenga delante.
const POR_EL_VENTANAL = [1.7, 2.15, 4.94]
const enLaSala = (escena, camara) => ({
  escena,
  camara,
  encima: (celdas, u, modo, distancias) => {
    const c = camara(u)
    const en = proyectar(c, POR_EL_VENTANAL)
    if (en) aSuDistancia(celdas, distancias, lejos(c, POR_EL_VENTANAL), (cs) => aLoLejos(cs, modo, en))
  },
})

// ── Cada uno a lo suyo ───────────────────────────────────────────────────

// duck-one sale de la fila hacia el ventanal por el lado de los sillones. A
// medio camino se le cae el gorro, lo recoge y se lo pone (lámina v16, sin el
// saludo) y el rizo salta como un resorte. La toma empieza ya fuera de la fila.
const AL_VENTANAL = recorrido([[FILA, 1.7], [1.6, 2.6], [0.2, 2.9], [-0.6, 4.2]])
const DESDE = Math.hypot(1.1, 0.9)
const PARA = AL_VENTANAL.largo - Math.hypot(0.8, 1.3)
const SIN_GORRO = M.DUCK_ONE_SIN_GORRO
const RECOGE = { desde: 0.3, hasta: 0.75 }
const duckOneVaAlVentanal = (u) => {
  const recogiendo = u >= RECOGE.desde && u < RECOGE.hasta
  const s = u < RECOGE.desde ? entre(DESDE, PARA, tramo(u, 0, RECOGE.desde)) : recogiendo ? PARA : entre(PARA, AL_VENTANAL.largo, tramo(u, RECOGE.hasta, 0.95))
  const donde = AL_VENTANAL.donde(s)
  if (recogiendo) return [recoge(tramo(u, RECOGE.desde, RECOGE.hasta), { tronco: SIN_GORRO, saluda: false }), donde]
  const cuerpo = s < AL_VENTANAL.largo ? DUCK_ONE.andando(fase(s)) : figura(pDuckOne, { tronco: M.DUCK_ONE, manos: reposo(pDuckOne) })
  return [cuerpo, donde]
}
const EN_EL_VENTANAL = () => ({ duckOne: duckOneVaAlVentanal(1) })

// Duke da vueltas con el espejo de mano delante de la cara, una por tira,
// entre la mesa de control y la pantalla, desde donde estaba.
const ESPEJO = [1.05, 0.25, 0.76]
const CIRCULO = { c: [FILA, -2.4], r: 0.7 }
const dukeDaVueltas = (u) => {
  const a = vuelta(u)
  const [x, z] = [CIRCULO.c[0] + CIRCULO.r * Math.sin(a), CIRCULO.c[1] + CIRCULO.r * Math.cos(a)]
  const pasos = fase(CIRCULO.r * a)
  const cuerpo = figura(pDuke, { tronco: dukeAbierto, manos: { 1: ESPEJO, [-1]: manosAndando(pDuke, pasos)[-1] }, extra: espejoDeMano(ESPEJO), fase: pasos })
  return { duke: [cuerpo, { en: [x, 0, z], giro: giroHacia([x, z], [x + Math.cos(a), z - Math.sin(a)]) }] }
}

// moby rodea la mesa de control hasta su sillón, que gira hacia él, se da
// vuelta, se deja caer y se deshace. La toma lo toma ya llegando, con lo
// demás a su espalda: así nadie queda detrás de él.
const AL_SILLON = recorrido([[FILA, 0], [2.2, 1.45], [0.5, 1.45]])
const LLEGANDO = AL_SILLON.largo - 0.5
const SILLON = { ...ASIENTOS.moby, giro: 0 }
const SE_SIENTA = { camina: 0.15, gira: 0.3, cae: 0.4 }
const mobySeSienta = (u) => {
  if (u < SE_SIENTA.camina) {
    const s = entre(LLEGANDO, AL_SILLON.largo, tramo(u, 0, SE_SIENTA.camina))
    return { moby: [figura(pMoby, { tronco: llorando(u), manos: manosAndando(pMoby, fase(s)), fase: fase(s) }), { ...AL_SILLON.donde(s), suelo: pMoby.suelo }] }
  }
  if (u < SE_SIENTA.cae) {
    const giro = girar(AL_SILLON.donde(AL_SILLON.largo).giro, SILLON.giro, tramo(u, SE_SIENTA.camina, SE_SIENTA.gira))
    return { moby: [mobyDeshecho(u), { en: lerp([0.5, 0, 1.45], SILLON.en, tramo(u, SE_SIENTA.gira, SE_SIENTA.cae)), giro, suelo: pMoby.suelo }] }
  }
  return SENTADO(u)
}
const SENTADO = (u) => ({ moby: [mobySentado(u), SILLON] })
const giraElSillon = (u) => ({ moby: girar(ASIENTOS.moby.giro, SILLON.giro, tramo(u, 0, SE_SIENTA.camina)) })
const SILLON_GIRADO = () => ({ moby: SILLON.giro })

export const TOMAS_3D = {
  ...ATAQUE,
  chillido: { escena: chilla, camara: aBordo(TEMBLOR, CAMARAS.tablero), encima: (celdas, u) => municion(celdas, u, 0) },
  // Desde atrás y por babor: lo sigue hasta que se pierde hacia el portaaviones.
  retirada: {
    escena: (u) => [MAR, ...nubes(0.4 + 0.2 * u), ...PORTAAVIONES, ...enManiobra(S_PARTIDA(u)).formas(DE_HULE)],
    camara: (u) => [sum(ALTURA, [40, 4, -40]), lerp(sum(ALTURA, S_PARTIDA(u).en), sum(ALTURA, [-400, -40, 60]), tramo(u, 0.65, 1)), 50],
  },
  respira: { escena: respira, camara: aBordo(NIVELADO, CAMARAS.tablero) },
  // Donde estaba duky, solo quien juega y las nubes, quietas.
  vacio: { escena: () => [MAR, ...nubes(0.4)], camara: aBordo(NIVELADO, CAMARAS.detras), encima: marcar(aBordo(NIVELADO, CAMARAS.detras), QUIETO) },

  // Desde atrás, por sobre la mesa de control, los tres ante la pantalla sin señal.
  torre: enLaSala(sala(), fija([-0.6, 2.85, 0], [3.9, 1.3, 0], 62)),
  llora: enLaSala(sala(), DE_FRENTE(0)),
  sabe: enLaSala(sala(habla('duke', DUKE.hablando)), DE_FRENTE(DONDE.duke.en[2])),
  naturalmente: enLaSala(sala(habla('duckOne', (u) => duckOne.atras(null, silaba(u)))), DE_FRENTE(DONDE.duckOne.en[2])),
  pausa: enLaSala(sala(), fija([-0.4, 2.8, 0], [FILA, 0.7, 0], 80)),
  moral: enLaSala(sala(habla('duckOne', (u) => duckOne.atras(null, silaba(u)))), DE_FRENTE(DONDE.duckOne.en[2])),

  // De tres cuartos, desde el lado de los sillones: recoge el gorro.
  gorro: enLaSala(sala((u) => ({ duckOne: duckOneVaAlVentanal(u) })), (u) => [[-1.8, 1.9, 1.6], sum(duckOneVaAlVentanal(u)[1].en, [0, 0.75, 0]), 76]),
  circulos: enLaSala(sala(juntos(EN_EL_VENTANAL, dukeDaVueltas)), fija([-0.6, 1.7, -2.4], [FILA, 0.8, -2.4], 46)),
  lagrimas: enLaSala(sala(juntos(EN_EL_VENTANAL, dukeDaVueltas, mobySeSienta), giraElSillon), (u) => [[1.5, 2.0, 2.7], sum(mobySeSienta(u).moby[1].en, [0, 0.6, 0]), 62]),
  // Desde la esquina de arriba, entre la puerta y las consolas: los tres,
  // cada uno a lo suyo, y quien juega por el ventanal.
  sala: enLaSala(sala(juntos(EN_EL_VENTANAL, dukeDaVueltas, SENTADO), SILLON_GIRADO), fija([-3.7, 2.85, -4.4], [1.0, 0.4, 1.0], 72)),
}
