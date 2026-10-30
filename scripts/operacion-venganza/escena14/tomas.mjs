// Las tomas de la escena 14, en 3D: qué se ve en el instante u ∈ [0, 1) y
// desde dónde, como las de la escena 13 (escena13/tomas.mjs), de donde salen
// la cabina de duky y la pantalla de la sala. El guion, con sus líneas, está
// en src/lib/escena14.js; el indicador de munición y la marca de quien juega,
// en visor.mjs.
//
// Duky tira todo lo que tiene y no le da a quien juega: cada ráfaga va a donde
// estaba, y quien juega ya no está. En la lluvia gasta además los doce
// misiles y el arma prototipo, los racimos violeta del juego. Las cámaras van dentro de la cabina, como
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
import { MISILES, enCabina, misil } from '../escena11/hangar.mjs'
import { ASIENTO, BISEL, CANONES, DE_FRENTE, DONDE, FILA, LILA, MONITORES, VIOLETA, dentro, dukyFeliz, radar } from '../escena13/tomas.mjs'
import { enemigo } from '../escena13/visor.mjs'
import { EN_CABINA, aSuDistancia, alargar, proyectar } from '../tiras.mjs'
import { aLoLejos, municion } from './visor.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const res = (a, b) => a.map((v, i) => v - b[i])
const esc = (a, k) => a.map((v) => v * k)
const uni = (a) => esc(a, 1 / Math.hypot(...a))
const aGrados = (r) => (r * 180) / Math.PI
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

// Sin `armas` después del ataque: las gastó todas contra quien juega. Antes,
// sin los misiles ya `disparados`.
const enElCaza = (piloto, armas = true, disparados = 0) => conDuky({ motor: true, tren: false, armas, disparados }, piloto).filter((f) => !f.vidrio)
// Mientras tiene balas, va feliz como en la escena 13.
const feliz = (u) => dukyFeliz(u, 6)
const DE_HULE = conDuky({ motor: true, tren: false, armas: false }, dukyFigura({}))

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

// Cada tiro sale de un cañón (los de la escena 13) hacia `destino`, el lugar
// al que apuntó, y sigue de largo: quien juega ya se movió. Tarda `VIAJE` en
// llegar. Como en la escena 13, cerca avanza más rápido y tiene un par de
// pixeles de grueso con cualquier `campo`. Al salir, un fogonazo en la boca
// del cañón.
const VIAJE = 0.25
// El grosor que se ve de un par de pixeles en `p`, desde `ojo` y con `campo`.
const grueso = (p, ojo, campo) => (0.02 + 0.02 * Math.hypot(...res(p, ojo))) * (Math.tan((campo * Math.PI) / 360) / Math.tan(Math.PI / 4.5))
const trazadora = (canon, destino, s, [ojo, , campo]) => {
  const [a, b] = [lerp(canon, destino, s ** 2), lerp(canon, destino, (s + 0.18) ** 2)]
  return M.hueso(a, b, grueso(a, ojo, campo), C.boca, { flat: VIOLETA, brilla: true })
}
const fogonazo = (canon) => el(canon, [0.5, 0.35, 0.35], C.blanco, { flat: LILA, brilla: true })

// Una ráfaga: `tiros` por vuelta, que se turnan los `canones`, y `desvio(k, t)`,
// lo que el tiro k, disparado en el instante t, se aparta de quien juega, en
// metros (y, z). Solo los que salen antes de `hasta` en cada vuelta, y los
// disparados desde `desde`.
const rafaga = ({ tiros, objetivo, desvio, hasta = 1, desde = -Infinity, canones = CANONES }) => (u, T, camara) =>
  Array.from({ length: tiros }, (_, k) => {
    const sale = k / tiros
    if (sale >= hasta) return []
    const vuela = ciclo(u - sale)
    const s = vuela / VIAJE
    if (s > 1.6 || u - vuela < desde) return []
    const canon = T.punto(canones[k % canones.length])
    const destino = sum(objetivo(sale), [0, ...desvio(k, u - vuela)])
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

// ── El derroche ──────────────────────────────────────────────────────────

// Un misil que dejó su riel en `desde` hace `t` s, hacia `destino`, y sigue de
// largo: acelera con la llama encendida y suelta humo, que el `aire` (m/s,
// lo que corren las nubes) se lleva hacia atrás y se deshace.
const misilEnVuelo = (desde, destino, t, aire) => {
  const dir = uni(res(destino, desde))
  const donde = (s) => sum(desde, esc(dir, 20 * s + 300 * s * s))
  const cuerpo = transformar([0, aGrados(Math.atan2(-dir[2], dir[0])), aGrados(Math.asin(dir[1]))], [0, 0, 0], donde(t)).formas([
    ...misil([0, 0, 0, 1.2]),
    el([-1.45, 0, 0], [0.3, 0.1, 0.1], C.naranja, { flat: '#ffd59a', brilla: true }),
  ])
  const humo = [1, 2, 3, 4, 5, 6].map((j) => j * 0.04).filter((a) => a <= t)
  return [...cuerpo, ...humo.map((a) => el(sum(donde(t - a), [-aire * a, 0, 0]), esc([1, 1, 1], 0.15 + 1.2 * a), C.humo))]
}

// Una toma del derroche: su `maniobra`, su `objetivo`, los `segundos` que
// dura una vuelta, cuándo sale cada par de misiles (`salvas`, en segundos;
// `antes`, los pares que salieron en tomas de antes) y cada `racimo`.
const DERROCHE = {
  lluvia: { maniobra: virajes(70, 2), objetivo: NERVIOSO, segundos: 3, salvas: [0.2, 0.7, 1.2, 1.7], antes: 0, racimos: [0.9, 2.1] },
  costado: { maniobra: TONEL, objetivo: NERVIOSO, segundos: 1.26, salvas: [0.1, 0.4], antes: 4, racimos: [] },
}
const TODOS = () => MISILES.length
const disparados = ({ segundos, salvas, antes }) => (u) => 2 * (antes + salvas.filter((sale) => sale <= u * segundos).length)
const misiles = ({ maniobra, objetivo, segundos, salvas, antes }) => (u) =>
  salvas.flatMap((sale, i) => {
    const t = u * segundos - sale
    if (t < 0 || t > 0.9) return []
    const T = enManiobra(maniobra(sale / segundos))
    return [0, 1].flatMap((lado) => misilEnVuelo(T.punto(MISILES[2 * (antes + i) + lado].slice(0, 3)), objetivo(sale / segundos), t, 600 / segundos))
  })

// El arma prototipo: un racimo, como en el juego (combate.js). Una bola de luz
// violeta, que parpadea en blanco, sale del morro hacia donde estaba quien
// juega, frena y a los `REVIENTA` s revienta en un anillo de `PUNTAS` tiros
// que se abre, con un destello lila. Todo de un par de pixeles a lo menos.
const MORRO = [9.7, 0, 0]
const REVIENTA = 0.45
const PUNTAS = 12
const racimo = (desde, destino, t, [ojo, , campo]) => {
  const dir = uni(res(destino, desde))
  const centro = sum(desde, esc(dir, 90 * (1 - (1 - Math.min(1, t / REVIENTA)) ** 2)))
  const g = grueso(centro, ojo, campo)
  if (t < REVIENTA) return [el(centro, esc([1, 1, 1], 1.6 * g), C.blanco, { flat: Math.floor(t * 10) % 2 ? '#ffffff' : VIOLETA, brilla: true })]
  const a = t - REVIENTA
  const lado = uni([-dir[2], 0, dir[0]])
  const alto = [dir[1] * lado[2], dir[2] * lado[0] - dir[0] * lado[2], -dir[1] * lado[0]]
  const tiros = Array.from({ length: PUNTAS }, (_, i) => {
    const ang = (i / PUNTAS) * Math.PI * 2
    const sale = sum(esc(lado, Math.cos(ang)), esc(alto, Math.sin(ang)))
    const p = sum(centro, sum(esc(sale, 4 + 45 * a), esc(dir, 15 * a)))
    return M.hueso(p, sum(p, esc(sale, 3)), grueso(p, ojo, campo), C.boca, { flat: VIOLETA, brilla: true })
  })
  return [...tiros, ...(a < 0.12 ? [el(centro, esc([1, 1, 1], 5 * g), C.blanco, { flat: LILA, brilla: true })] : [])]
}
const racimos = ({ maniobra, objetivo, segundos, racimos: cuando }) => (u, T, camara) =>
  cuando.flatMap((sale) => {
    const t = u * segundos - sale
    return t < 0 || t > REVIENTA + 0.6 ? [] : racimo(enManiobra(maniobra(sale / segundos)).punto(MORRO), objetivo(sale / segundos), t, camara)
  })
const derrocha = (cual, balas) => (u, T, camara) => [...balas(u, T, camara), ...misiles(DERROCHE[cual])(u), ...racimos(DERROCHE[cual])(u, T, camara)]

// Quien juega donde lo vea `camara`, tapado por lo que tenga delante.
const marcar = (camara, objetivo, abre) => (celdas, u, modo, distancias) => {
  const c = camara(u)
  aSuDistancia(celdas, distancias, lejos(c, objetivo(u)), (cs) => enemigo(cs, u, modo, proyectar(c, objetivo(u), abre)))
}

// ── El ataque ────────────────────────────────────────────────────────────

// Desde la cabina: la maniobra, la ráfaga, quien juega, las balas que
// quedan, de `municiones[0]` (en u = `empieza`) a `municiones[1]` (en u = 1),
// el `piloto` en el instante u y los misiles que ya `disparo`.
const cabina = ({ maniobra = NIVELADO, camara = 'detras', objetivo = QUIETO, dispara, municiones: [desde, hasta], empieza = 0, piloto = feliz, disparo = () => 0 }) => {
  const cam = aBordo(maniobra, CAMARAS[camara])
  return {
    abre: EN_CABINA,
    escena: (u) => {
      const T = enManiobra(maniobra(u))
      return [MAR, ...nubes(u), ...T.formas(enElCaza(piloto(u), true, disparo(u))), ...(dispara ? dispara(u, T, cam(u)) : [])]
    },
    camara: cam,
    encima: (celdas, u, modo, distancias) => {
      marcar(cam, objetivo, EN_CABINA)(celdas, u, modo, distancias)
      municion(celdas, u, desde + (hasta - desde) * Math.min(1, Math.max(0, (u - empieza) / (1 - empieza))))
    },
  }
}

// Desde afuera: el caza entero y, si hay `objetivo`, quien juega (sin él,
// quien juega es la cámara).
const afuera = ({ maniobra, objetivo, dispara, camara, disparo = () => 0 }) => ({
  escena: (u) => {
    const T = enManiobra(maniobra(u))
    return [MAR, ...nubes(u), ...T.formas(conDuky({ motor: true, tren: false, disparados: disparo(u) }, feliz(u))), ...dispara(u, T, camara(u))]
  },
  camara,
  encima: objetivo && marcar(camara, objetivo),
})

// Las tomas que duran más que su vuelta siguen al mismo ritmo, antes de u = 0
// o después de 1 (alargar): los patrones empiezan con estrellas de tres
// puntas y se complican; la lluvia empieza con la pantalla vacía.
const ATAQUE = {
  patrones: alargar(
    cabina({ maniobra: virajes(45), objetivo: QUIETO, dispara: rafaga({ tiros: 24, objetivo: QUIETO, desvio: (k, t) => estrella(t < 0 ? 3 : 6, 14)(k) }), municiones: [999, 720], empieza: -5 / 32 }),
    -5 / 32,
    1,
  ),
  // Desde donde está quien juega: el caza le viene de frente, disparándole.
  frente: afuera({ maniobra: virajes(30), dispara: RAFAGAS.patrones, camara: (u) => [QUIETO(u), sum(ALTURA, [0, 1, 0]), 11] }),
  // Con las balas, los misiles de a pares y los racimos.
  lluvia: alargar(
    cabina({
      maniobra: DERROCHE.lluvia.maniobra,
      camara: 'hombro',
      objetivo: NERVIOSO,
      dispara: derrocha('lluvia', rafaga({ tiros: 48, objetivo: NERVIOSO, desvio: espiral, desde: -4 / 30 })),
      municiones: [720, 400],
      empieza: -4 / 30,
      disparo: disparados(DERROCHE.lluvia),
    }),
    -4 / 30,
    1,
  ),
  // A su lado, dando un tonel mientras la lluvia sale hacia adelante y se le
  // van los últimos misiles.
  costado: afuera({ maniobra: DERROCHE.costado.maniobra, objetivo: NERVIOSO, dispara: derrocha('costado', RAFAGAS.lluvia), camara: fija(sum(ALTURA, [-1, 3, -18]), sum(ALTURA, [2, 4, 0]), 60), disparo: disparados(DERROCHE.costado) }),
  // De tres cuartos, el cañón de estribor queda detrás de duky, y sus tiros le
  // saldrían de la cara: dispara solo el de babor.
  secuencia: alargar(
    cabina({ maniobra: virajes(60, 2), camara: 'tresCuartos', objetivo: SIN_DESCANSO, dispara: rafaga({ tiros: 36, objetivo: SIN_DESCANSO, desvio: () => [0, 0], canones: [CANONES[1]] }), municiones: [400, 60], disparo: TODOS }),
    0,
    25 / 24,
  ),
  // Por detrás y arriba, siguiendo los tiros hasta quien juega.
  cola: alargar(afuera({ maniobra: virajes(80, 2), objetivo: SIN_DESCANSO, dispara: RAFAGAS.secuencia, camara: fija(sum(ALTURA, [-32, 6, 4]), sum(ALTURA, [140, 16, 0]), 46), disparo: TODOS }), -6 / 24, 1),
  cero: cabina({ maniobra: virajes(20), dispara: rafaga({ tiros: 24, objetivo: QUIETO, desvio: estrella(3, 10), hasta: 0.3 }), municiones: [60, -140], disparo: TODOS }),
  // Sin balas, se queda quieto.
  silencio: cabina({ municiones: [0, 0], piloto: () => dukyFigura({}), disparo: TODOS }),
}

// ── El chillido, la vuelta y el respiro ──────────────────────────────────

// Y después chilla como chillan los patos de hule, apretándose de golpe, una
// y otra vez.
const chilla = (u) => {
  const aprieta = Math.abs(Math.sin(vuelta(u) * 4)) ** 3
  const piloto = desinflado(dukyFigura({ inclina: 6 * Math.sin(Math.floor(u * 48) * 1.7) }), 0.45 * aprieta)
  return [MAR, ...nubes(u), ...enManiobra(TEMBLOR(u)).formas(enElCaza(piloto, false))]
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
  return [MAR, ...nubes(u * 0.5), ...enManiobra({}).formas(enElCaza(desinflado(dukyFigura({}), k), false))]
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

// moby se deshace: llora con el pico abierto, se agarra la cabeza y los
// sollozos lo sacuden. En la fila, las lágrimas le caen por la cara (`llanto`
// 1, modelos.mjs); al sentarse se rompe en lágrimas y le saltan (2).
const sollozo = (u) => Math.abs(Math.sin(vuelta(u) * 5))
const llorando = (u, llanto) => [...M.MOBY_TORSO, ...M.mobyCabeza({ t: u * 8, humea: false, pena: 1, llanto, abre: 0.45 + 0.45 * sollozo(u) })]
const CODOS_AFUERA = { ...pMoby, dobla: (s) => [-0.2, -0.6, s] }
const agarrandoseLaCabeza = (u) => Object.fromEntries([1, -1].map((s) => [s, [0.55, 0.75 + 0.08 * Math.sin(vuelta(u) * 5 + s), s * 1.0]]))
const mobyDeshecho = (u, llanto = 1) => figura(CODOS_AFUERA, { tronco: llorando(u, llanto), manos: agarrandoseLaCabeza(u), salto: 0.08 * sollozo(u), inclina: 6 + 4 * Math.sin(vuelta(u) * 5) })
// Sentado se hunde 0,2, como moby.sentado (escena2/patoon.mjs).
const mobySentado = (u) => sentar(pMoby, mobyDeshecho(u, 2), 0.2)

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
    return { moby: [figura(pMoby, { tronco: llorando(u, 1), manos: manosAndando(pMoby, fase(s)), fase: fase(s) }), { ...AL_SILLON.donde(s), suelo: pMoby.suelo }] }
  }
  if (u < SE_SIENTA.cae) {
    const giro = girar(AL_SILLON.donde(AL_SILLON.largo).giro, SILLON.giro, tramo(u, SE_SIENTA.camina, SE_SIENTA.gira))
    const cae = tramo(u, SE_SIENTA.gira, SE_SIENTA.cae)
    return { moby: [mobyDeshecho(u, 1 + cae), { en: lerp([0.5, 0, 1.45], SILLON.en, cae), giro, suelo: pMoby.suelo }] }
  }
  return SENTADO(u)
}
const SENTADO = (u) => ({ moby: [mobySentado(u), SILLON] })
const giraElSillon = (u) => ({ moby: girar(ASIENTOS.moby.giro, SILLON.giro, tramo(u, 0, SE_SIENTA.camina)) })
const SILLON_GIRADO = () => ({ moby: SILLON.giro })

export const TOMAS_3D = {
  ...ATAQUE,
  chillido: { abre: EN_CABINA, escena: chilla, camara: aBordo(TEMBLOR, CAMARAS.tablero), encima: (celdas, u) => municion(celdas, u, 0) },
  // Desde atrás y por babor: lo sigue hasta que se pierde hacia el portaaviones.
  retirada: {
    escena: (u) => [MAR, ...nubes(0.4 + 0.2 * u), ...PORTAAVIONES, ...enManiobra(S_PARTIDA(u)).formas(DE_HULE)],
    camara: (u) => [sum(ALTURA, [40, 4, -40]), lerp(sum(ALTURA, S_PARTIDA(u).en), sum(ALTURA, [-400, -40, 60]), tramo(u, 0.65, 1)), 50],
  },
  respira: { abre: EN_CABINA, escena: respira, camara: aBordo(NIVELADO, CAMARAS.tablero) },
  // Donde estaba duky, solo quien juega y las nubes, quietas.
  vacio: { abre: EN_CABINA, escena: () => [MAR, ...nubes(0.4)], camara: aBordo(NIVELADO, CAMARAS.detras), encima: marcar(aBordo(NIVELADO, CAMARAS.detras), QUIETO, EN_CABINA) },

  // Desde atrás, por sobre la mesa de control, los tres ante la pantalla sin señal.
  torre: enLaSala(sala(), fija([-0.6, 2.85, 0], [3.9, 1.3, 0], 62)),
  llora: enLaSala(sala(), DE_FRENTE(0)),
  sabe: enLaSala(sala(habla('duke', DUKE.hablando)), DE_FRENTE(DONDE.duke.en[2])),
  naturalmente: enLaSala(sala(habla('duckOne', (u) => duckOne.atras(null, silaba(u)))), DE_FRENTE(DONDE.duckOne.en[2])),
  pausa: enLaSala(sala(), fija([-0.4, 2.8, 0], [FILA, 0.7, 0], 80)),
  moral: enLaSala(sala(habla('duckOne', (u) => duckOne.atras(null, silaba(u)))), DE_FRENTE(DONDE.duckOne.en[2])),

  // De tres cuartos, desde el lado de los sillones: recoge el gorro.
  gorro: enLaSala(sala((u) => ({ duckOne: duckOneVaAlVentanal(u) })), (u) => [[-1.8, 1.9, 1.6], sum(duckOneVaAlVentanal(u)[1].en, [0, 0.75, 0]), 76]),
  circulos: enLaSala(sala(juntos(EN_EL_VENTANAL, dukeDaVueltas)), fija([-0.6, 1.7, -2.4], [FILA, 0.9, -2.4], 54)),
  lagrimas: enLaSala(sala(juntos(EN_EL_VENTANAL, dukeDaVueltas, mobySeSienta), giraElSillon), (u) => [[1.5, 2.2, 2.7], sum(mobySeSienta(u).moby[1].en, [0, 0.6, 0]), 72]),
  // Desde la esquina de arriba, entre la puerta y las consolas: los tres,
  // cada uno a lo suyo, y quien juega por el ventanal.
  sala: enLaSala(sala(juntos(EN_EL_VENTANAL, dukeDaVueltas, SENTADO), SILLON_GIRADO), fija([-3.7, 2.85, -4.4], [1.0, 0.4, 1.0], 72)),
}
