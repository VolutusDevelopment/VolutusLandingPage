// Las tomas de la escena 15, en 3D: qué se ve en el instante u ∈ [0, 1) y
// desde dónde, como las de la escena 9 (escena9/tomas.mjs), de donde sale el
// aterrizaje. El guion, con sus líneas, está en src/lib/escena15.js.
//
// El caza de duky frena en la cubierta del Sitting Ducks y un marinero lo
// saca como lo metió en la escena 11, pero al revés. Lo deja en la proa, de
// cara al sol, y el escuadrón se pone a su lado, tomados de las manos, con
// quien juega a lo lejos en el cielo. Después el mismo marinero lo mete en
// una caja, el almirante llega a ella y el segundo marinero, del miedo, se
// cae por la borda. Todo en metros del barco, y los patos a la escala de la
// cabina de duky.

import { el, placa, transformar } from '../pilotos/tres.mjs'
import * as M from '../pilotos/modelos.mjs'
import { RAMPAS as C } from '../pilotos/modelos.mjs'
import { dukeAbierto, dukyFigura, figura, manosAndando, pDuckOne, pDuke, pMoby } from '../pilotos/cuerpos.mjs'
import { MAR, SOL, ancho, colocar, enMarcha, enTexto, poner, portaaviones } from '../escena1/lugares.mjs'
import { OFICIOS, corre, hablar, marineroTronco, pMarinero, silaba, suave } from '../escena1/personajes.mjs'
import { almirante } from '../escena2/patoon.mjs'
import { enUnidades, giroHacia, girar, recorrido } from '../escena2/reunion.mjs'
import { K, SUELO, caza, enCabina } from '../escena11/hangar.mjs'
import { ARRIBA, CUPULA_ABIERTA, conDuky, deposita, escalerilla, sobreLaCabeza } from '../escena11/tomas.mjs'
import { enPista } from '../escena9/tomas.mjs'
import { aLoLejos } from '../escena14/visor.mjs'
import { aSuDistancia, alargar, proyectar } from '../tiras.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const res = (a, b) => a.map((v, i) => v - b[i])
const esc = (a, k) => a.map((v) => v * k)
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const entre = (a, b, k) => a + (b - a) * k
const tramo = (u, a, b) => suave((u - a) / (b - a))
const fija = (ojo, mira, campo) => () => [ojo, mira, campo]
const vuelta = (u) => u * Math.PI * 2
// Un ciclo de pasos cada 33 cm, como en el hangar.
const pasos = (s) => (s / 0.33) % 1

const CUBIERTA = 20.8
const barco = (u) => [MAR, ...portaaviones(enMarcha(u))]
const reposo = (p) => ({ 1: p.reposo(1), [-1]: p.reposo(-1) })
const pato = (formas, donde) => colocar(formas, { k: K, ...donde })
// En el aire, sin la sombra que figura() le pone bajo los pies.
const SOMBRA = '#4a80e6'
const enElAire = (formas) => formas.filter((f) => f.flat !== SOMBRA)

// ── El aterrizaje y la cabina ────────────────────────────────────────────

// Frena donde frenó duke en la escena 9, en el eje de la catapulta de babor.
const PARADA = [0, CUBIERTA - SUELO, -6]
const aterriza = (u) => {
  const { aire, en } = enPista(u, PARADA)
  return [...barco(u), ...transformar([0, 0, 7 * Math.min(1, aire * 3)], [-1.4, SUELO, 0], en).formas(conDuky({ motor: aire > 0 || u < 0.5, armas: false }, dukyFigura({})))]
}

// El marinero lo saca como lo metió en el hangar (escena11/tomas.mjs): la
// misma toma, al revés.
const saca = (u) => [...barco(u), ...poner([...caza({ cupula: CUPULA_ABIERTA, armas: false }), ...escalerilla, ...deposita(1 - u)], 0, PARADA)]
const SOBRE_LA_CABINA = (() => {
  const de = (p) => sum(enCabina(p), PARADA)
  return fija(de([9.5, 4.2, -1.6]), de([0, 0.4, -1.2]), 54)
})()

// ── La proa, de cara al sol ──────────────────────────────────────────────

// La fila mira al sol, que se pone por la amura de estribor; a su derecha,
// `A_LA_DERECHA`. duky queda al medio de la proa, a metro y medio del borde.
const AL_SOL = SOL
const A_LA_DERECHA = [-SOL[2], 0, SOL[0]]
const MIRA_AL_SOL = giroHacia([0, 0], [SOL[0], SOL[2]])
const BORDE = [164.3, CUBIERTA, 0]
const enLaFila = (lado, atras = 0) => sum(sum(BORDE, esc(A_LA_DERECHA, lado)), esc(AL_SOL, -atras))
const deFrente = (lado, atras = 0) => ({ en: enLaFila(lado, atras), giro: MIRA_AL_SOL })

// Quien juega, a lo lejos: sobre el mar, a la izquierda del sol.
const QUIEN_JUEGA = sum(enLaFila(-10 * 15, -900), [0, 70, 0])
const conQuienJuega = (escena, camara) => ({
  escena,
  camara,
  encima: (celdas, u, modo, distancias) => {
    const c = camara(u)
    const en = proyectar(c, QUIEN_JUEGA)
    if (en) aSuDistancia(celdas, distancias, Math.hypot(...res(QUIEN_JUEGA, c[0])), (cs) => aLoLejos(cs, modo, en))
  },
})

// ── El marinero que lo lleva ─────────────────────────────────────────────

const VERDE = OFICIOS.verde.color
const AMARILLO = OFICIOS.amarillo.color
const marinero = (color, cfg = {}) => figura(pMarinero(color), { tronco: marineroTronco(color), manos: reposo(pMarinero(color)), ...cfg })
const andando = (color, f) => marinero(color, { manos: manosAndando(pMarinero(color), f), fase: f })

// Las manos van antes de inclinar y agachar la figura: se ponen girando al revés.
const antesDe = ({ inclina = 0, agacha = 0 }, p) => transformar([0, 0, -inclina], [0, -1.35, 0]).punto(sum(p, [0, agacha, 0]))

// Duky va de sobre la cabeza de quien está en `donde` hasta `destino`, con
// `k` de 0 a 1: adelante a `alto` metros, y después abajo. El marinero se
// agacha para dejarlo; las manos, siempre con él.
const deja = (donde, destino, k, alto = 0) => {
  const arriba = sobreLaCabeza(donde, K)
  const encima = [destino[0], Math.max(arriba.en[1], destino[1] + alto), destino[2]]
  const en = lerp(lerp(arriba.en, encima, tramo(k, 0, 0.4)), destino, tramo(k, 0.4, 1))
  const desde = enUnidades(arriba.en, { ...donde, k: K })
  const corrido = res(enUnidades(en, { ...donde, k: K }), desde)
  const doblado = { inclina: -24 * tramo(k, 0.5, 1), agacha: 0.3 * tramo(k, 0.5, 1) }
  const manos = Object.fromEntries([1, -1].map((s) => [s, antesDe(doblado, sum(ARRIBA[s], corrido))]))
  return [...pato(marinero(VERDE, { manos, ...doblado }), donde), ...pato(enElAire(dukyFigura({})), { en, giro: donde.giro, suelo: -2.2 })]
}

// Con duky sobre la cabeza, por un `camino` (recorrido) de `s` metros.
const loLleva = (camino, s) => {
  const donde = { ...camino.donde(s), en: sum(camino.donde(s).en, [0, CUBIERTA, 0]) }
  return [...pato(marinero(VERDE, { manos: ARRIBA, fase: pasos(s) }), donde), ...pato(enElAire(dukyFigura({})), sobreLaCabeza(donde, K))]
}
const camino = (puntos) => recorrido(puntos.map(([x, , z]) => [x, z]))

// Por la cubierta, hacia la proa, y hasta detrás de donde lo deja.
const DETRAS_DE_DUKY = deFrente(0, 0.8)
const A_LA_PROA = camino([enLaFila(-1.5, 7), enLaFila(0, 3.2), DETRAS_DE_DUKY.en])

// Lo deja, se endereza, se da vuelta y se va por donde vino.
const DE_VUELTA = camino([DETRAS_DE_DUKY.en, enLaFila(0, 5)])
const DUKY_EN_EL_BORDE = { en: BORDE, giro: MIRA_AL_SOL, suelo: -2.2 }
const loDeja = (u) => {
  if (u < 0.6) return deja(DETRAS_DE_DUKY, BORDE, tramo(u, 0.05, 0.55))
  const duky = pato(dukyFigura({}), DUKY_EN_EL_BORDE)
  if (u < 0.75) return [...pato(marinero(VERDE), { ...DETRAS_DE_DUKY, giro: girar(MIRA_AL_SOL, MIRA_AL_SOL + 180, tramo(u, 0.6, 0.75)) }), ...duky]
  const s = DE_VUELTA.largo * tramo(u, 0.75, 1.15)
  const { en, giro } = DE_VUELTA.donde(s)
  return [...pato(andando(VERDE, pasos(s)), { en: sum(en, [0, CUBIERTA, 0]), giro }), ...duky]
}

// ── El escuadrón ─────────────────────────────────────────────────────────

// Cada uno en su lugar de la fila (`lado`, en metros a la derecha de duky),
// de pie, con su cuerpo de siempre y las manos donde se le diga.
const mobyTronco = (u) => [...M.MOBY_TORSO, ...M.mobyCabeza({ t: u * 8, humea: false })]
const ESCUADRON = {
  moby: { lado: -2.2, p: pMoby, suelo: pMoby.suelo, tronco: mobyTronco },
  duckOne: { lado: -1.05, p: pDuckOne, suelo: pDuckOne.suelo, tronco: () => M.DUCK_ONE },
  duke: { lado: 1.0, p: pDuke, suelo: pDuke.suelo, tronco: () => dukeAbierto },
}
const dondeDe = (quien, atras = 0) => ({ ...deFrente(ESCUADRON[quien].lado, atras), suelo: ESCUADRON[quien].suelo })

// Las manos que se toman, en metros: la de cada uno, a medio camino de la
// del vecino; con duky, la punta de su ala.
const aMetros = (p, { en, giro, suelo }) => transformar([0, giro, 0], [0, 0, 0], en).punto(esc(res(p, [0, suelo, 0]), K))
const manoEnMetros = (quien, s) => aMetros(ESCUADRON[quien].p.reposo(s), dondeDe(quien))
const ALA = (s) => aMetros([-0.25, -0.85, s * 1.0], DUKY_EN_EL_BORDE)
const TOMADAS = {
  moby: { 1: lerp(manoEnMetros('moby', 1), manoEnMetros('duckOne', -1), 0.5) },
  duckOne: { [-1]: lerp(manoEnMetros('moby', 1), manoEnMetros('duckOne', -1), 0.5), 1: ALA(-1) },
  duke: { [-1]: ALA(1) },
}
// De pie en la fila; `toma`, de 0 a 1, lleva sus manos a las del vecino.
const enLaFilaDe = (quien, u, toma = 0) => {
  const { p, tronco } = ESCUADRON[quien]
  const donde = dondeDe(quien)
  const manos = Object.fromEntries([1, -1].map((s) => [s, TOMADAS[quien][s] ? lerp(p.reposo(s), enUnidades(TOMADAS[quien][s], { ...donde, k: K }), toma) : p.reposo(s)]))
  return pato(figura(p, { tronco: tronco(u), manos, salto: 0.015 * Math.sin(vuelta(u)) }), donde)
}
const juntos = (u, toma = 0) => Object.keys(ESCUADRON).flatMap((quien) => enLaFilaDe(quien, u, toma))
const dukyQuieto = (u) => pato(dukyFigura({ salto: 0.02 * Math.sin(vuelta(u)) }), DUKY_EN_EL_BORDE)
const fila = (toma = () => 0) => (u) => [...barco(u), ...juntos(u, toma(u)), ...dukyQuieto(u)]

// Llegan por detrás, cada uno por su carril y desde más o menos lejos.
const DESDE = { moby: 6.5, duckOne: 5, duke: 5.8 }
const seAcercan = (u) => {
  const llegan = Object.keys(ESCUADRON).flatMap((quien) => {
    const s = DESDE[quien] * (1 - tramo(u, 0, 0.8))
    if (s <= 0) return enLaFilaDe(quien, u)
    const { p, tronco } = ESCUADRON[quien]
    const f = pasos(DESDE[quien] - s)
    return pato(figura(p, { tronco: tronco(u), manos: manosAndando(p, f), fase: f }), dondeDe(quien, s))
  })
  return [...barco(u), ...llegan, ...dukyQuieto(u)]
}

// Detrás de la fila, un poco por encima: el sol entre duck-one y duky.
const MEDIO = enLaFila(-0.55)
const DETRAS = fija(sum(MEDIO, sum(esc(AL_SOL, -5.5), [0, 1.9, 0])), sum(MEDIO, sum(esc(AL_SOL, 40), [0, 0.2, 0])), 52)
const MAS_CERCA = fija(sum(MEDIO, sum(esc(AL_SOL, -4.2), [0, 1.2, 0])), sum(MEDIO, sum(esc(AL_SOL, 30), [0, -0.3, 0])), 58)
// De frente, desde el mar, con la cubierta detrás.
const DE_CARA = (lejos, alto, campo) => fija(sum(MEDIO, sum(esc(AL_SOL, lejos), [0, alto, 0])), sum(MEDIO, [0, 0.45, 0]), campo)
// Detrás de duky, a ras de cubierta y a su izquierda: el sol a su lado.
const TRAS_DUKY = fija(sum(enLaFila(-0.6, 3.4), [0, 0.8, 0]), sum(enLaFila(-9, -60), [0, 2.6, 0]), 46)
// De costado, desde estribor, a la altura del marinero.
const DE_COSTADO = fija(sum(enLaFila(4.6, 1.2), [0, 1.4, 0]), sum(enLaFila(0, 1.0), [0, 0.35, 0]), 50)

// Llega por detrás de duky, los vecinos le sueltan las alas, lo sube sobre
// la cabeza y se lo lleva por donde vino.
const DE_ATRAS = camino([enLaFila(0, 4), DETRAS_DE_DUKY.en])
const loRecoge = (u) => {
  const sueltan = 1 - tramo(u, 0.05, 0.25)
  const quedan = [...barco(u), ...juntos(u, sueltan)]
  if (u < 0.35) {
    const s = DE_ATRAS.largo * tramo(u, 0, 0.35)
    const { en, giro } = DE_ATRAS.donde(s)
    return [...quedan, ...pato(andando(VERDE, pasos(s)), { en: sum(en, [0, CUBIERTA, 0]), giro }), ...dukyQuieto(u)]
  }
  if (u < 0.75) return [...quedan, ...deja(DETRAS_DE_DUKY, BORDE, 1 - tramo(u, 0.35, 0.75))]
  const donde = { ...DETRAS_DE_DUKY, giro: girar(MIRA_AL_SOL, MIRA_AL_SOL + 180, tramo(u, 0.75, 0.9)) }
  return [...quedan, ...pato(marinero(VERDE, { manos: ARRIBA }), donde), ...pato(enElAire(dukyFigura({})), sobreLaCabeza(donde, K))]
}
// De frente y muy desde arriba, sobre el mar: así el marinero, detrás de
// duky, queda por encima de él en el cuadro.
const DESDE_ARRIBA = fija(sum(enLaFila(-0.55, -3.2), [0, 5.4, 0]), sum(enLaFila(-0.55, 0.5), [0, 0.2, 0]), 56)

// ── La caja ──────────────────────────────────────────────────────────────

// De madera, de 1,2 m de lado y 1 de alto, a estribor, frente a los cazas
// estacionados. La cinta de peligro la cruza por arriba en dos bandas, que se
// van poniendo con `cinta` de 0 a 1, y el sticker va en la cara de estribor.
const CAJA = { x: 50, z: 10, lado: 1.2, alto: 1.0 }
const MADERA = ['#f2cf96', '#cf9c5c', '#9a6a36', '#5c3c1c']
const [X0, X1, Z0, Z1] = [CAJA.x - CAJA.lado / 2, CAJA.x + CAJA.lado / 2, CAJA.z - CAJA.lado / 2, CAJA.z + CAJA.lado / 2]
const [Y0, Y1] = [CUBIERTA, CUBIERTA + CAJA.alto]
const LETRA = 0.085
const STICKER = { texto: 'CLASIFICADO', ancho: ancho('CLASIFICADO', LETRA) + 0.1, y0: Y0 + 0.36, y1: Y0 + 0.64 }

const rayas = ([x, y, z]) => (Math.floor((x + y + z) / 0.07) % 2 ? '#1c1d22' : '#f8d020')
const pintaCaja = ({ cinta, sticker }) => ([x, y, z]) => {
  const cx = x - CAJA.x
  if (sticker && z > Z1 - 0.02 && Math.abs(cx) < STICKER.ancho / 2 && y > STICKER.y0 && y < STICKER.y1) {
    const u = cx + STICKER.ancho / 2 - 0.05
    return enTexto(STICKER.texto, u, y - STICKER.y0 - (STICKER.y1 - STICKER.y0 - LETRA) / 2, LETRA) ? '#ffffff' : '#d8282c'
  }
  if (cinta > 0 && Math.abs(z - CAJA.z) < 0.11 && (x - X0) / CAJA.lado < cinta * 2) return rayas([x, y, z])
  if (cinta > 0.5 && Math.abs(cx) < 0.11 && (z - Z0) / CAJA.lado < cinta * 2 - 1) return rayas([x, y, z])
  // Un listón en cada arista, donde dos de las tres medidas tocan su borde, y las tablas cada 20 cm.
  const cerca = (v, a, b) => Math.min(Math.abs(v - a), Math.abs(v - b)) < 0.08
  if (cerca(x, X0, X1) + cerca(y, Y0, Y1) + cerca(z, Z0, Z1) >= 2) return '#b07a40'
  return ((y - Y0) / 0.2) % 1 < 0.1 ? '#8a5a2c' : null
}

// La caja con su `tapa` a `tapa` metros de cerrada (0, cerrada; sin tapa, null).
const caja = ({ tapa = 0, cinta = 0, sticker = false, salto = 0 } = {}) => {
  const o = { pinta: pintaCaja({ cinta, sticker }) }
  const paredes = [
    placa([[X0, Y0, Z0], [X1, Y0, Z0], [X1, Y1, Z0], [X0, Y1, Z0]], 0.05, MADERA, o),
    placa([[X0, Y0, Z1], [X0, Y1, Z1], [X1, Y1, Z1], [X1, Y0, Z1]], 0.05, MADERA, o),
    placa([[X0, Y0, Z0], [X0, Y1, Z0], [X0, Y1, Z1], [X0, Y0, Z1]], 0.05, MADERA, o),
    placa([[X1, Y0, Z0], [X1, Y0, Z1], [X1, Y1, Z1], [X1, Y1, Z0]], 0.05, MADERA, o),
  ]
  const arriba = tapa === null ? [] : [placa([[X0, Y1 + tapa, Z0], [X0, Y1 + tapa, Z1], [X1, Y1 + tapa, Z1], [X1, Y1 + tapa, Z0]], 0.05, MADERA, o)]
  return transformar([salto * 4, 0, salto * 3], [CAJA.x, Y0, CAJA.z], [0, 0.04 * salto, 0]).formas([...paredes, ...arriba])
}
const CERRADA = { cinta: 1, sticker: true }

// Los tres alrededor de la caja: el primer marinero a popa, el segundo a proa
// y el almirante, al llegar, en la esquina de estribor, sin tapar el sticker.
// Cada uno mira la caja.
const hacia = ([x, z], destino = [CAJA.x, CAJA.z]) => ({ en: [x, CUBIERTA, z], giro: giroHacia([x, z], destino) })
const M1 = hacia([CAJA.x - 1.0, CAJA.z])
const M2 = hacia([CAJA.x + 1.0, CAJA.z - 0.5])
const ALM = hacia([CAJA.x + 0.8, CAJA.z + 1.2])

// Quien está en `donde`, de tres cuartos: la cámara, a `angulo` grados de
// hacia donde mira (la caja), del lado donde no hay nadie. Los marineros, más
// bajos que la caja, van de perfil, pasados los 90°, para que no los tape.
const primerPlano = (donde, angulo, lejos = 2.2, campo = 44) => {
  const a = ((donde.giro + angulo) * Math.PI) / 180
  return fija(sum(donde.en, [lejos * Math.cos(a), 0.95, -lejos * Math.sin(a)]), sum(donde.en, [0, 0.6, 0]), campo)
}

// La lleva hasta la caja, lo deja dentro y la tapa.
const DENTRO = [CAJA.x, CUBIERTA + 0.06, CAJA.z]
const AL_LADO_DE_LA_CAJA = (() => {
  const p = M1.en
  return camino([[p[0] - 3, 0, p[2] - 1.5], [p[0], 0, p[2]]])
})()
const tapando = (u) => {
  const tapa = 0.5 * (1 - tramo(u, 0.6, 0.9))
  const manos = Object.fromEntries([1, -1].map((s) => [s, enUnidades([X0 + 0.1, Y1 + tapa, CAJA.z + s * 0.35], { ...M1, k: K })]))
  return [...pato(marinero(VERDE, { manos }), M1), ...caja({ tapa })]
}
const enLaCaja = (u) => {
  if (u < 0.2) return [...loLleva(AL_LADO_DE_LA_CAJA, AL_LADO_DE_LA_CAJA.largo * (0.6 + 0.4 * tramo(u, 0, 0.2))), ...caja({ tapa: null })]
  if (u < 0.55) return [...deja(M1, DENTRO, tramo(u, 0.2, 0.55), 1.25), ...caja({ tapa: null })]
  return tapando(u)
}

// Mientras la cinta se pone sola (hasta u = 0,47), el primer marinero la va
// pasando. Después se inclina, estira el brazo por la esquina y pega el
// sticker de un manotazo (aparece con el golpe, en u = 0,6), lo aplasta otra
// vez y baja las manos. El segundo mira.
const EN_EL_STICKER = [X0 + 0.2, (STICKER.y0 + STICKER.y1) / 2, Z1 + 0.04]
const pegando = (u) => {
  const ida = Math.sin(vuelta(u) * 3.84) * (1 - tramo(u, 0.44, 0.48))
  const [estira, aplasta, baja] = [tramo(u, 0.52, 0.6), Math.sin(Math.PI * tramo(u, 0.63, 0.69)), tramo(u, 0.71, 0.79)]
  const enCaja = (p) => enUnidades(p, { ...M1, k: K })
  const pega = lerp(lerp(enCaja([X0 + 0.05, Y1 - 0.15 + 0.1 * ida, CAJA.z + 0.2]), enCaja(sum(EN_EL_STICKER, [0, 0, 0.12 * aplasta])), estira), M1_REPOSO[1], baja)
  const otra = lerp(enCaja([X0 + 0.05, Y1 - 0.15 - 0.1 * ida, CAJA.z - 0.2]), M1_REPOSO[-1], estira)
  return pato(marinero(VERDE, { manos: { 1: pega, [-1]: otra }, inclina: -12 * estira * (1 - baja) }), M1)
}
const M1_REPOSO = reposo(pMarinero(VERDE))
const segundo = (u, cfg = {}) => pato(marinero(AMARILLO, { salto: 0.01 * Math.sin(vuelta(u)), ...cfg }), M2)
const primero = (u, cfg = {}) => pato(marinero(VERDE, { salto: 0.01 * Math.sin(vuelta(u) + 1), ...cfg }), M1)

// El almirante llega desde la isla, con las manos atrás.
const DE_LA_ISLA = camino([[CAJA.x - 1.6, 0, CAJA.z + 2.6], [ALM.en[0], 0, ALM.en[2]]])
const llegaElAlmirante = (u) => {
  const s = DE_LA_ISLA.largo * tramo(u, 0, 0.85)
  const { en, giro } = DE_LA_ISLA.donde(s)
  const donde = s < DE_LA_ISLA.largo ? { en: sum(en, [0, CUBIERTA, 0]), giro } : { ...ALM, giro: girar(giro, ALM.giro, tramo(u, 0.85, 1)) }
  return pato(s < DE_LA_ISLA.largo ? almirante.andando(pasos(s)) : almirante.quieto(u), donde)
}

// Junto a la caja: quien hable, con su cuerpo; los demás, quietos.
const hablando = (color) => (u) => marinero(color, { tronco: hablar(marineroTronco(color), silaba(u)) })
const conversacion = (cambios = {}) => (u) => [
  ...barco(u),
  ...caja(CERRADA),
  ...pato(cambios.m1?.(u) ?? marinero(VERDE, { salto: 0.01 * Math.sin(vuelta(u) + 1) }), M1),
  ...pato(cambios.m2?.(u) ?? marinero(AMARILLO, { salto: 0.01 * Math.sin(vuelta(u)) }), M2),
  ...pato(cambios.alm?.(u) ?? almirante.quieto(u), ALM),
]

// ── La patada y el miedo ─────────────────────────────────────────────────

// Abre los brazos y patea dos veces con la derecha, sola: el pie sube y se
// adelanta como un paso largo, la izquierda queda plantada y la caja salta
// con cada golpe. Conforme, baja los brazos y asiente. Antes de u = 0 y
// después de 1, más cuadros al mismo ritmo.
const PATADA = { ...pMarinero(VERDE), pierna: { ...pMarinero(VERDE).pierna, A: 1.4, alto: 0.9 } }
const GOLPES = [0.3, 0.65]
const golpe = (u) => Math.max(...GOLPES.map((g) => Math.max(0, 1 - Math.abs(u - g) / 0.1)))
const patea = (u) => {
  const k = golpe(u)
  const ψ = Math.PI / 2 - (Math.PI / 2 + 0.45) * suave(k)
  const abre = tramo(u, -0.08, 0) * (1 - tramo(u, 0.95, 1.03))
  const manos = Object.fromEntries([1, -1].map((s) => [s, lerp(PATADA.reposo(s), [0.1, -0.7, s * 1.4], abre)]))
  const asiente = Math.max(0, Math.sin(2 * Math.PI * tramo(u, 1.0, 1.08)))
  const cuerpo = figura(PATADA, { tronco: marineroTronco(VERDE), manos, patada: ψ, inclina: 10 * k - 6 * asiente })
  const sacude = Math.max(...GOLPES.map((g) => (u > g ? Math.max(0, 1 - (u - g) / 0.12) : 0))) * Math.sin(vuelta(u) * 6)
  return [...barco(u), ...caja({ ...CERRADA, salto: sacude }), ...pato(cuerpo, M1), ...segundo(u), ...pato(almirante.quieto(u), ALM)]
}

// El segundo marinero niega con la cabeza, rápido, y tirita entero, con las
// manos al pecho. La cabeza son sus formas desde la tercera.
const tirita = (u, k) => Math.sin(Math.floor(u * 96) * 2.39 + k)
const niega = (u) => {
  const tronco = marineroTronco(AMARILLO)
  const cabeza = transformar([0, 28 * Math.sin(vuelta(u) * 4), 0], [0.1, 0.1, 0]).formas(tronco.slice(2))
  return marinero(AMARILLO, { tronco: [...tronco.slice(0, 2), ...cabeza], manos: { 1: [0.7, -0.45, 0.45], [-1]: [0.7, -0.45, -0.45] }, salto: 0.03 * tirita(u, 0), inclina: 3 + 2 * tirita(u, 1) })
}

// Se da vuelta, corre hacia estribor con los brazos arriba, sigue de largo
// por el borde de la cubierta y cae al agua dando una vuelta, de cabeza.
const BORDA = 22.4
const A_LA_BORDA = camino([[M2.en[0], 0, M2.en[2]], [M2.en[0] + 0.4, 0, BORDA]])
const CAIDA = { sale: 0.5, cae: 0.82 }
const AGUA = 0.1
const salpica = (en, k) =>
  k <= 0 || k >= 1
    ? []
    : [0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2
        const r = 0.8 + 2 * k
        return el([en[0] + r * Math.cos(a), AGUA + 2.4 * Math.sin(Math.PI * k) * (0.6 + 0.4 * (i % 2)), en[2] + r * Math.sin(a)], esc([0.6, 1.0, 0.6], 1 - k * 0.6), C.nube, { flat: '#eef4ff' })
      })
// Dónde va en el instante u: corriendo por la cubierta y, desde la borda, cayendo.
const FIN = sum(A_LA_BORDA.donde(A_LA_BORDA.largo).en, [0, CUBIERTA, 0])
const EN_EL_AGUA = [FIN[0], AGUA - 0.25, FIN[2] + 1.2]
const corriendoEn = (u) => {
  if (u < CAIDA.sale) {
    const { en, giro } = A_LA_BORDA.donde(A_LA_BORDA.largo * tramo(u, 0.05, CAIDA.sale) ** 1.3)
    return { en: sum(en, [0, CUBIERTA, 0]), giro: girar(M2.giro, giro, tramo(u, 0, 0.1)) }
  }
  const k = tramo(u, CAIDA.sale, CAIDA.cae)
  return { en: [FIN[0], entre(FIN[1], EN_EL_AGUA[1], k ** 2), entre(FIN[2], EN_EL_AGUA[2], k)], giro: A_LA_BORDA.donde(A_LA_BORDA.largo).giro }
}
const corriendo = (u) => {
  const donde = corriendoEn(u)
  // Sin sombra: la cubierta la tapa, pero al llegar a la borda quedaría en el aire.
  if (u < CAIDA.sale) return pato(enElAire(corre(OFICIOS.amarillo, (u * 10) % 1)), donde)
  if (u < CAIDA.cae) return transformar([200 * tramo(u, CAIDA.sale, CAIDA.cae), 0, 0], sum(donde.en, [0, 0.5, 0])).formas(pato(enElAire(corre(OFICIOS.amarillo, (u * 14) % 1, { inclina: 0 })), donde))
  return salpica(EN_EL_AGUA, tramo(u, CAIDA.cae, 1))
}
const huye = (u) => [...barco(u), ...caja(CERRADA), ...primero(u), ...pato(almirante.quieto(u), ALM), ...corriendo(u)]

// Flota de espaldas con los brazos abiertos y los ojos cerrados, subiendo y
// bajando con las olas, mientras el barco se aleja: la corriente lo lleva
// mar adentro por estribor.
const FLOTA = [CAJA.x + 1.4, AGUA, BORDA + 8]
const DE_ESPALDAS = transformar([0, 0, 90], [0, -1.35, 0]).formas(
  enElAire(marinero(AMARILLO, { tronco: marineroTronco(AMARILLO, 0), manos: { 1: [0, -0.8, 1.9], [-1]: [0, -0.8, -1.9] } })),
)
const alejandose = (u) => sum(FLOTA, [-4 * u, 0.06 * Math.sin(vuelta(u) * 3), 40 * u])
const flota = (u) => [...barco(u), ...pato(DE_ESPALDAS, { en: alejandose(u), giro: 90, suelo: -1.6 })]

export const TOMAS_3D = {
  // Desde babor, siguiéndolo hasta que frena.
  aterriza: { escena: aterriza, camara: (u) => [[12, 26, -30], sum(enPista(Math.max(u, 0.3), PARADA).en, [0, 0.5, 0]), 52] },
  saca: { escena: saca, camara: SOBRE_LA_CABINA },
  // Lo acompaña de costado, desde babor, a su altura.
  cubierta: {
    escena: (u) => [...barco(u), ...loLleva(A_LA_PROA, A_LA_PROA.largo * 0.75 * u)],
    camara: (u) => {
      const { en } = A_LA_PROA.donde(A_LA_PROA.largo * 0.75 * u)
      const p = sum(en, [0, CUBIERTA, 0])
      return [sum(p, sum(esc(A_LA_DERECHA, -3.6), [0.4, 1.5, 0])), sum(p, [0.6, 0.6, 0]), 54]
    },
  },
  borde: { escena: (u) => [...barco(u), ...loDeja(u)], camara: DE_COSTADO },
  lejos: conQuienJuega((u) => [...barco(u), ...dukyQuieto(u)], TRAS_DUKY),
  acercan: { escena: seAcercan, camara: DE_CARA(8, 2.6, 46) },
  atardecer: conQuienJuega(fila(), DETRAS),
  manos: conQuienJuega(fila((u) => tramo(u, 0.15, 0.8)), MAS_CERCA),
  bonito: { escena: fila(() => 1), camara: DE_CARA(4.6, 0.9, 50) },

  recoge: { escena: loRecoge, camara: DESDE_ARRIBA },
  // Desde atrás y arriba, a estribor: se ve el fondo de la caja.
  caja: { escena: (u) => [...barco(u), ...enLaCaja(u)], camara: fija([CAJA.x - 1.6, CUBIERTA + 2.9, CAJA.z + 3.0], [CAJA.x - 0.3, CUBIERTA + 0.5, CAJA.z], 54) },
  // De cerca, de frente a la cara del sticker.
  cinta: {
    escena: (u) => [...barco(u), ...caja({ cinta: tramo(u, 0.039, 0.468), sticker: u > 0.6 }), ...pegando(u), ...segundo(u)],
    camara: (u) => [[CAJA.x + 0.1, CUBIERTA + 1.3, CAJA.z + 2.3 - 0.5 * tramo(u, 0.55, 0.71)], [CAJA.x, CUBIERTA + 0.55, CAJA.z], 54],
  },
  almirante: { escena: (u) => [...barco(u), ...caja(CERRADA), ...primero(u), ...segundo(u), ...llegaElAlmirante(u)], camara: fija([CAJA.x + 0.2, CUBIERTA + 3.8, CAJA.z + 3.8], [CAJA.x - 0.3, CUBIERTA + 0.3, CAJA.z + 0.8], 54) },
  destino: { escena: conversacion({ m1: hablando(VERDE) }), camara: primerPlano(M1, -100) },
  myanmar: { escena: conversacion({ alm: almirante.habla }), camara: primerPlano(ALM, 70, 2.2) },
  porque: { escena: conversacion({ m2: hablando(AMARILLO) }), camara: primerPlano(M2, -100) },
  clasificada: { escena: conversacion({ alm: almirante.ordena }), camara: primerPlano(ALM, -70, 2.2, 46) },
  proteccion: { escena: conversacion({ m1: hablando(VERDE) }), camara: primerPlano(M1, 100) },

  patea: alargar({ escena: patea, camara: fija([CAJA.x - 0.6, CUBIERTA + 0.9, CAJA.z + 3.4], [CAJA.x - 0.6, CUBIERTA + 0.45, CAJA.z], 52) }, -2 / 24, 26 / 24),
  tiembla: { escena: conversacion({ m2: niega }), camara: primerPlano(M2, -100, 2.0, 44) },
  // Desde fuera de la borda, a la altura de la cubierta: lo ve venir y lo
  // sigue en la caída hasta la espuma.
  corre: { escena: huye, camara: (u) => [[CAJA.x + 3.5, CUBIERTA + 0.8, BORDA + 2.5], sum(corriendoEn(Math.min(u, CAIDA.cae)).en, [0, 0.4, 0]), 54] },
  // Sobre el agua, detrás de su cabeza: él abajo y el barco, cada vez más chico.
  flota: {
    escena: flota,
    camara: (u) => {
      const en = alejandose(u)
      return [sum(en, [0.5, 2.2, 2.6]), sum(en, [-0.3, -0.6, -2.5]), 64]
    },
  },
}
