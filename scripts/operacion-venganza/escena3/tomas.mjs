// Las tomas de la escena 3, en 3D: qué se ve en el instante u ∈ [0, 1) y
// desde dónde, como las de la escena 1 (escena1/tomas.mjs). El guion, con
// sus líneas, está en src/lib/escena3.js.
//
// `escena(u)` arma la figura en metros del barco; `camara(u)` da [ojo, mira,
// campo] en metros y grados.

import { el, placa, transformar } from '../pilotos/tres.mjs'
import { ALAS_TOMCAT, RAMPAS as C, CABEZA, DUCK_ONE, DUCK_ONE_TORSO, GAFAS_DUCK_ONE, POSTCOMBUSTION_TOMCAT, hueso } from '../pilotos/modelos.mjs'
import { PERSONAJES, figura, manosAndando, pDuckOne } from '../pilotos/cuerpos.mjs'
import { ACELERADOR, NORMAL, PALANCA, enCabina } from '../pilotos/interiores.mjs'
import { MAR, colocar, enMarcha, poner, portaaviones } from '../escena1/lugares.mjs'
import { FLECHA, HUELLA } from '../../../src/lib/flecha.js'
import { curva, hablar, silaba, suave } from '../escena1/personajes.mjs'
import { BOTON, EN_CATAPULTA, ESCALA, SUELO, caza, enCaza, enPiloto } from './caza.mjs'
import { EN_CABINA, alargar } from '../tiras.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const esc = (a, k) => a.map((v) => v * k)
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const res = (a, b) => a.map((v, i) => v - b[i])
const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const unitario = (a) => esc(a, 1 / Math.hypot(...a))
const tramo = (u, a, b) => suave((u - a) / (b - a))
const fija = (ojo, mira, campo) => () => [ojo, mira, campo]

// ── duck-one en la cabina ────────────────────────────────────────────────

const DUCK = PERSONAJES.find((p) => p.archivo === 'duck-one')
const gesto = (nombre) => DUCK.gestos.find((g) => g.nombre === nombre).pose

// La cabeza gira en el cuello: `gira` hacia su izquierda y `baja` hacia el
// pecho, en grados. Las gafas se le corren `gafas` por el pico.
const CARA = DUCK_ONE.filter((f) => !DUCK_ONE_TORSO.includes(f) && !GAFAS_DUCK_ONE.includes(f))
const tronco = ({ gira = 0, baja = 0, gafas = [0, 0, 0], abre = 0 } = {}) =>
  hablar([...DUCK_ONE_TORSO, ...transformar([0, gira, -baja], [0.1, 0.1, 0]).formas([...CARA, ...transformar([0, 0, 0], [0, 0, 0], gafas).formas(GAFAS_DUCK_ONE)])], abre)

// Sentado con las manos en los mandos, salvo la que se mueva.
const sentado = ({ tronco: t = DUCK_ONE, mano, extra = [] } = {}) => figura(pDuckOne, { tronco: t, manos: { 1: PALANCA, [-1]: mano ?? ACELERADOR }, extra })
const indice = (mano, punta) => hueso(mano, punta, 0.045, C.cuero)

// Se le resbalan las gafas por el pico y se las sube con el índice. Las
// sostiene un momento, con el mentón arriba, satisfecho, y la mano vuelve
// al acelerador. Pasado u = 1, más cuadros al mismo ritmo.
const PUENTE = CABEZA.punto([1.0, 0.76, 0])
const RESBALA = [0.06, -0.08, 0]
const ajustaGafas = (u) => {
  const corrida = esc(RESBALA, tramo(u, 0, 0.25) * (1 - tramo(u, 0.45, 0.6)))
  const llega = tramo(u, 0.15, 0.4) * (1 - tramo(u, 0.95, 1.2))
  const menton = 10 * tramo(u, 0.6, 0.75) * (1 - tramo(u, 0.95, 1.2))
  const punta = transformar([0, 0, menton], [0.1, 0.1, 0]).punto(sum(PUENTE, sum(corrida, [0.03, -0.02, 0])))
  const mano = lerp(ACELERADOR, sum(punta, [0.2, -0.14, -0.14]), llega)
  return sentado({ tronco: tronco({ gafas: corrida, baja: -menton }), mano, extra: llega > 0.8 ? [indice(mano, punta)] : [] })
}

// Baja la cabeza y se golpea las medallas, una y otra, a ver si están bien pegadas.
const MEDALLAS = [[0.75, -0.48, -0.2], [0.45, -0.38, -0.6]]
const revisaMedallas = (u) => {
  const g = curva(u)
  const golpe = Math.max(0, Math.sin(u * Math.PI * 8))
  const medalla = MEDALLAS[Math.floor(u * 2) % 2]
  return sentado({ tronco: tronco({ baja: 34 * g }), mano: lerp(ACELERADOR, sum(medalla, [0.14 + 0.08 * golpe, 0, 0]), g) })
}

// Mira a un lado y al otro del tablero con el índice en el aire, y pregunta.
const buscaElBoton = (u) => {
  const g = curva(u)
  const lado = Math.sin(u * Math.PI * 4)
  const mano = lerp(ACELERADOR, [1.3, -0.8, -0.45 - 0.45 * lado], g)
  return sentado({ tronco: tronco({ gira: 35 * lado * g, baja: 18 * g, abre: u > 0.5 ? silaba(u) : 0 }), mano, extra: g > 0.5 ? [indice(mano, sum(mano, [0.22, -0.1, 0]))] : [] })
}

// Duda, pulsa y deja el dedo un rato en el botón, que se enciende.
const pulsaElBoton = (u) => {
  const empuja = tramo(u, 0.45, 0.55) * (1 - tramo(u, 0.75, 0.9))
  const punta = sum(BOTON, esc(NORMAL, 0.04 + 0.14 * (1 - empuja)))
  const mano = lerp(ACELERADOR, sum(punta, esc(NORMAL, 0.24)), tramo(u, 0, 0.4))
  return { piloto: sentado({ mano, extra: u > 0.3 ? [indice(mano, punta)] : [] }), pulsado: u > 0.5 }
}

// ── Las tomas ────────────────────────────────────────────────────────────

// Detrás del caza, el deflector levantado, para que el chorro de los motores
// salga hacia arriba.
const DEFLECTOR = placa([[-13.6, 20.8, -10], [-13.6, 20.8, -2], [-15.8, 23.5, -2], [-15.8, 23.5, -10]].map(([x, y, z]) => [EN_CATAPULTA[0] + x, y, z]), 0.3, C.grisOscuro)
const barco = (u) => [MAR, ...portaaviones(enMarcha(u)), DEFLECTOR]
// El caza enganchado a la catapulta, con duck-one en la cabina en la pose `piloto`.
const enCatapulta = (u, opciones) => [...barco(u), ...poner(caza({ barra: true, t: u, ...opciones }), 0, EN_CATAPULTA)]
const enCabinaCon = (pose) => (u) => enCatapulta(u, { piloto: pose(u) })

// Cruza la cubierta hacia el caza, por babor, hasta quedar bajo la cabina.
const PASOS = { desde: enCaza([4.4, SUELO, -8]), largo: 2.5 }
const caminando = (u) => sum(PASOS.desde, [0, 0, PASOS.largo * u])

// Enciende la postcombustión, la catapulta lo lanza por la cubierta hasta la
// proa y, apenas deja la cubierta, barre las alas hacia atrás, a la posición
// de combate; sube con el morro arriba y recoge el tren. El vapor queda atrás,
// deshaciéndose.
const CARRERA = { enciende: 0.06, desde: 0.15, hasta: 0.55, largo: 166 }
const corrido = (u) => CARRERA.largo * Math.min(1, Math.max(0, (u - CARRERA.desde) / (CARRERA.hasta - CARRERA.desde))) ** 2
const enVuelo = (u) => {
  const vuelo = Math.max(0, (u - CARRERA.hasta) / (1 - CARRERA.hasta))
  return { vuelo, en: sum(EN_CATAPULTA, [corrido(u) + 450 * Math.max(0, u - CARRERA.hasta), 50 * vuelo ** 1.6 - 1.5 * Math.sin(Math.min(1, vuelo * 4) * Math.PI), 0]) }
}
const despega = (u) => {
  const { vuelo, en } = enVuelo(u)
  const { abiertas, barridas } = ALAS_TOMCAT
  const formas = caza({ piloto: sentado(), tren: vuelo < 0.4, barra: u < CARRERA.desde, alas: abiertas + (barridas - abiertas) * tramo(vuelo, 0.03, 0.3) })
  // Hasta encender la postcombustión, los motores no echan llama.
  const motores = u > CARRERA.enciende ? POSTCOMBUSTION_TOMCAT : []
  return transformar([0, 0, 12 * suave(vuelo / 0.4)], [-1.4, SUELO, 0], en).formas([...formas.filter((f) => motores.length || !f.luz), ...motores])
}
// Antes del lanzamiento, el vapor se escapa en hilos por la ranura de la
// catapulta, delante del caza; después, la lanzadera deja nubes a su paso.
const vapor = (u) => [
  ...(u < CARRERA.desde
    ? [10, 40, 70, 100, 130, 160].map((x, i) => {
        const k = (u * 4 + i * 0.37) % 1
        return el(sum(EN_CATAPULTA, [x, SUELO + 0.2 + 0.9 * k, 0]), [0.9 + k, 0.35 + 0.3 * k, 0.5 + 0.4 * k], C.nube)
      })
    : []),
  ...[4, 40, 80, 120, 160].flatMap((x) => {
    const paso = CARRERA.desde + (CARRERA.hasta - CARRERA.desde) * Math.sqrt(x / CARRERA.largo)
    const k = (u - paso) / 0.45
    return k > 0 && k < 1 ? [el(sum(EN_CATAPULTA, [x, SUELO + 0.6 + 1.5 * k, 0]), esc([2.4, 1.1, 1.6], 1 - k * 0.7), C.nube)] : []
  }),
]

// ── El atacante, a lo lejos ──────────────────────────────────────────────

// Quieto en el cielo, a 3 km y justo sobre el sol: no acompaña al caza, y la
// cámara lo encuentra hacia el final. Es un cursor, o una huella donde se juega
// con el dedo, de cuadritos de 10 m que miran hacia donde termina la cámara.
const ATACANTE = { sale: 0.68, celda: 10, lejos: [2710, 827, 986] }
const atacante = (modo, u, { d, a }) => {
  if (u < ATACANTE.sale) return []
  const dibujo = modo === 'cursor' ? FLECHA : HUELLA
  const centro = modo === 'cursor' ? [0, 0] : [6, 9]
  const k = ATACANTE.celda * tramo(u, ATACANTE.sale, ATACANTE.sale + 0.05)
  return dibujo.flatMap((fila, j) =>
    [...fila].flatMap((c, i) => {
      const color = c === 'X' ? '#2b2347' : '#ffffff'
      return c === ' ' ? [] : [el(sum(ATACANTE.lejos, sum(esc(d, (i - centro[0]) * k), esc(a, (centro[1] - j) * k))), esc([0.62, 0.62, 0.62], k), [color], { flat: color })]
    }),
  )
}

// Desde un helicóptero detrás del caza, apenas a babor y por sobre el
// deflector, con la vía de la catapulta por delante: ve encenderse la
// postcombustión, lo sigue por la cubierta, se queda en la proa (a x = 145) y
// lo deja irse hacia el sol, mirando hacia el atacante.
const camaraDespegue = (u) => {
  const { en } = enVuelo(u)
  const avanza = Math.min(en[0] - EN_CATAPULTA[0], (145 + 26 - EN_CATAPULTA[0]) / 0.9)
  return [sum(EN_CATAPULTA, [-26 + 0.9 * avanza, 7.5 + 0.04 * avanza, -3]), lerp(sum(en, [6, 1, 0]), ATACANTE.lejos, 0.04 * tramo(u, 0.65, 0.9)), 46]
}
const haciaLaCamara = (() => {
  const [ojo, mira] = camaraDespegue(0.85)
  const d = unitario(cruz(unitario(res(mira, ojo)), [0, 1, 0]))
  return { d, a: cruz(d, unitario(res(mira, ojo))) }
})()

export const TOMAS_3D = {
  cubierta: {
    escena: (u) => [...enCatapulta(u, {}), ...colocar(figura(pDuckOne, { tronco: DUCK_ONE, manos: manosAndando(pDuckOne, (u * 4) % 1), fase: (u * 4) % 1, sinSombra: true }), { k: ESCALA, giro: -90, en: caminando(u) })],
    camara: (u) => {
      const [x, y, z] = caminando(u)
      return [[x - 0.6, y + 1.8, z - 4.4], lerp([x + 0.6, y + 0.8, z + 6], enCaza([5.0, 1.2, 0]), tramo(u, 0.55, 1)), 62]
    },
  },
  cabina: {
    abre: EN_CABINA,
    escena: enCabinaCon(() => sentado()),
    camara: (u) => {
      const k = suave(u)
      return [lerp(enCaza([4.4, 2.6, -3.4]), enPiloto([3.4, 1.0, 0]), k), lerp(enCaza([5.0, 1.0, 0]), enPiloto([0, 0.1, 0]), k), 50 + 35 * k]
    },
  },
  gafas: alargar({ abre: EN_CABINA, escena: enCabinaCon(ajustaGafas), camara: fija(enPiloto([2.9, 0.95, -1.3]), enPiloto([0.4, 0.7, -0.15]), 55) }, 0, 17 / 12),
  medallas: { abre: EN_CABINA, escena: enCabinaCon(revisaMedallas), camara: fija(enPiloto([2.6, 0.5, -1.15]), enPiloto([0.4, 0.15, -0.25]), 70) },
  presentacion: { abre: EN_CABINA, escena: enCabinaCon((u) => enCabina(() => DUCK.hablando(u))), camara: fija(enPiloto([3.2, 1.2, 0.1]), enPiloto([0.1, 0.3, 0]), 72) },
  advertencia: {
    abre: EN_CABINA,
    escena: enCabinaCon((u) => enCabina(() => gesto('señala')(u, { tronco: hablar(DUCK_ONE, silaba(u)) }))),
    camara: fija(enPiloto([2.6, 0.5, -0.9]), enPiloto([0.3, 0.4, -0.3]), 72),
  },
  instrumentos: { abre: EN_CABINA, escena: enCabinaCon(buscaElBoton), camara: fija(enPiloto([-0.6, 1.4, -1.4]), enPiloto([1.8, -1.0, 0]), 85) },
  boton: { abre: EN_CABINA, escena: (u) => enCatapulta(u, pulsaElBoton(u)), camara: fija(enPiloto([1.2, -0.6, -1.5]), enPiloto([1.75, -1.45, -0.85]), 50) },
  // Barre el parabrisas de lado a lado, y duck-one lo sigue con la cabeza.
  limpiaparabrisas: {
    escena: (u) => {
      const barre = Math.sin(u * Math.PI * 4)
      return enCatapulta(u, { piloto: sentado({ tronco: tronco({ gira: -20 * barre }) }), limpia: 40 * barre })
    },
    camara: fija(enCaza([8.6, 2.7, 0.3]), enCaza([5.9, 1.2, 0]), 34),
  },
  excelente: {
    abre: EN_CABINA,
    escena: enCabinaCon((u) => enCabina(() => gesto('pulgar arriba')(u, { tronco: hablar(DUCK_ONE, silaba(u) * 0.8) }))),
    camara: fija(enPiloto([2.8, 0.8, -1.2]), enPiloto([0, 0.1, 0.1]), 80),
  },
  despegue: {
    escena: (u, modo = 'cursor') => [...barco(u), ...despega(u), ...vapor(u), ...atacante(modo, u, haciaLaCamara)],
    camara: camaraDespegue,
  },
}
