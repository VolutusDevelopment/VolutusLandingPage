// Las tomas de la escena 9, en 3D: qué se ve en el instante u ∈ [0, 1) y
// desde dónde, como las de la escena 5 (escena5/tomas.mjs). El guion, con
// sus líneas, está en src/lib/escena9.js.
//
// Moby y duke vuelan juntos a 300 m sobre el mar, como duky en la escena 11,
// y el oficial de inteligencia les habla por radio desde el control de vuelo,
// en lo alto de la isla (control.mjs), con el almirante detrás. Vuelven al
// Sitting Ducks y frenan en la cubierta, uno detrás del otro, en el eje de
// la catapulta de babor. Duke sale de un saltito mientras su Hornet pliega
// las alas, como en la vida real. Todo en metros del barco.

import { placa, transformar } from '../pilotos/tres.mjs'
import * as M from '../pilotos/modelos.mjs'
import { RAMPAS as C } from '../pilotos/modelos.mjs'
import { ACELERADOR, PALANCA, enCabina as conMandos } from '../pilotos/interiores.mjs'
import { PERSONAJES, dukeCerrado, figura, pDuke, pMoby } from '../pilotos/cuerpos.mjs'
import { MAR, colocar, enMarcha, poner, portaaviones } from '../escena1/lugares.mjs'
import { ALMIRANTE, OFICIAL, suave } from '../escena1/personajes.mjs'
import { ALTURA, nubes } from '../escena11/tomas.mjs'
import { CONTROL, control } from './control.mjs'
import { DUKE, MOBY } from './cazas.mjs'
import { EN_CABINA, alargar } from '../tiras.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const tramo = (u, a, b) => suave((u - a) / (b - a))
const fija = (ojo, mira, campo) => () => [ojo, mira, campo]

const [, MOBY_P, DUKE_P] = PERSONAJES
const CUBIERTA = 20.8
// En la cubierta todos van a la escala de la cabina de duke, como en la escena 5.
const K = DUKE.k
const MANDOS = { 1: PALANCA, [-1]: ACELERADOR }

// ── En vuelo ─────────────────────────────────────────────────────────────

// duke adelante y moby a su estribor, un poco atrás: las nubes pasan más
// lejos, a estribor de los dos, y la cámara va por babor.
const EN = { duke: ALTURA, moby: sum(ALTURA, [-10, 7, 18]) }
const enVuelo = (quien, p) => sum((quien === 'duke' ? DUKE : MOBY).enCabina(p), EN[quien])

// Cada piloto sentado en su cabina, con las manos en los mandos o donde las
// lleve su pose; `pilotos` cambia a quien se mueva.
const QUIETOS = { duke: (u) => DUKE_P.sentado(u, MANDOS), moby: (u) => MOBY_P.sentado(u, MANDOS) }
const volando = ({ pilotos = {}, alarma = () => false } = {}) => (u) => {
  const pose = { ...QUIETOS, ...pilotos }
  return [
    MAR,
    ...nubes(u),
    ...poner(DUKE.caza({ motor: true, piloto: conMandos(() => pose.duke(u)), alarma: alarma(u) }), 0, EN.duke),
    ...poner(MOBY.caza({ motor: true, piloto: conMandos(() => pose.moby(u)), alarma: alarma(u) }), 0, EN.moby),
  ]
}
const hablando = (quien) => volando({ pilotos: { [quien]: (u) => (quien === 'duke' ? DUKE_P : MOBY_P).hablando(u) } })

// Las tomas de la cabina, como en las láminas (pilotos/cabinas.mjs): desde
// el tablero, de tres cuartos por el lado sin humo y desde abajo.
// En el Hornet de duke, más cerrada: más abierta, asoma en las esquinas el
// borde de su cúpula rosada.
const DEL_TABLERO = (quien) => fija(enVuelo(quien, [3.4, 1.0, 0]), enVuelo(quien, [0, 0.1, 0]), quien === 'duke' ? 72 : 85)
const TRES_CUARTOS = (quien, lado) => fija(enVuelo(quien, [2.8, 0.8, lado * 1.2]), enVuelo(quien, [0, 0.1, -lado * 0.1]), 80)
// Desde el tablero, más abajo y temblando, al ritmo de los gritos.
const TEMBLANDO = (quien) => (u) => {
  const tiembla = 0.06 * Math.sin(Math.floor(u * 24) * 2.3)
  return [enVuelo(quien, [3.6, 0.2 + tiembla, 0.8 + tiembla]), enVuelo(quien, [0, 0.4, 0]), 80]
}

// ── En el control de vuelo ───────────────────────────────────────────────

// El oficial habla por radio y el almirante, detrás, mira las pantallas.
const gesto = (p, nombre) => p.gestos.find((g) => g.nombre === nombre).pose
const RADIO = control({ oficial: gesto(OFICIAL, 'habla por radio'), almirante: gesto(ALMIRANTE, 'mira las pantallas') })
const { piso: PISO } = CONTROL

// ── En la cubierta ───────────────────────────────────────────────────────

const barco = (u) => [MAR, ...portaaviones(enMarcha(u))]
// Frenan en el eje de la catapulta de babor: duke donde frenó duck-one en la
// escena 5 y moby detrás, más a popa.
const PARADA = { duke: [0, CUBIERTA - DUKE.suelo, -6], moby: [-30, CUBIERTA - MOBY.suelo, -6] }
const CUPULA_ABIERTA = 40
// Las puntas de las alas del Hornet suben hasta pasar un poco la vertical.
const PLEGADAS = 100
const enCubierta = (quien, p) => sum((quien === 'duke' ? DUKE : MOBY).enCabina(p), PARADA[quien])

// Llegan por la popa, tocan la cubierta y frenan hasta su parada, con el
// morro arriba mientras están en el aire (escena5/tomas.mjs).
const LLEGA = { largo: 170, toca: 0.3, hasta: 0.75 }
export const enPista = (k, parada) => {
  const corrido = Math.min(1, k / LLEGA.hasta)
  const aire = Math.max(0, 1 - corrido / LLEGA.toca)
  return { aire, en: sum(parada, [-LLEGA.largo * (1 - corrido) ** 2, 16 * aire ** 1.5, 0]) }
}
const aterriza = (quien, k) => {
  const c = quien === 'duke' ? DUKE : MOBY
  const { aire, en } = enPista(k, PARADA[quien])
  return transformar([0, 0, 7 * Math.min(1, aire * 3)], [-1.4, c.suelo, 0], en).formas(c.caza({ motor: aire > 0 || k < 0.5, tren: true }))
}

// Los dos cazas detenidos, duke ya sin su piloto; `duke`, sus opciones.
const estacionados = (u, duke = {}) => [...barco(u), ...poner(DUKE.caza({ cupula: CUPULA_ABIERTA, alas: PLEGADAS, ...duke }), 0, PARADA.duke), ...poner(MOBY.caza(), 0, PARADA.moby)]

// ── duke sale de un saltito ──────────────────────────────────────────────

// Se para en el asiento, salta por babor y cae en la cubierta junto al morro,
// con los brazos arriba, de cara a la cámara. Mientras baja, detrás de él
// las puntas de las alas suben hasta quedar casi de pie.
const ASIENTO = enCubierta('duke', [0, -2.3, 0])
const AL_LADO = [3.6, CUBIERTA, -9.0]
const saltito = (u) => {
  const k = tramo(u, 0.15, 0.7)
  const en = sum(lerp(ASIENTO, AL_LADO, k), [0, 1.4 * Math.sin(Math.PI * k), 0])
  const arriba = Math.sin(Math.PI * Math.min(1, k * 1.2))
  const manos = Object.fromEntries([1, -1].map((s) => [s, lerp(pDuke.reposo(s), [0.3, 0.9, s * 1.1], arriba)]))
  const brilla = u > 0.75 && Math.floor(u * 12) % 2 ? M.destello([0.1, 1.55, -0.55]) : []
  return colocar(figura(pDuke, { tronco: dukeCerrado, manos, extra: brilla, inclina: -8 * arriba }), { k: K, en })
}

// ── duke en el fuselaje ──────────────────────────────────────────────────

// Junto a la toma de aire de babor, que es plana, blanca y brilla como un
// espejo, delante de la rueda. Su reflejo va dentro, tras un vidrio perla en
// un hueco del fuselaje, y más arriba: duke no le llega a la toma, y así se ve.
const ESPEJO = { x0: -0.3, x1: 1.2, y0: -0.42, y1: 0.32, z: -1.43 }
const enElEspejo = ([x, y, z]) => x > ESPEJO.x0 && x < ESPEJO.x1 && y > ESPEJO.y0 && y < ESPEJO.y1 && z < -0.4
const VIDRIO = placa(
  [[ESPEJO.x0, ESPEJO.y0, ESPEJO.z], [ESPEJO.x1, ESPEJO.y0, ESPEJO.z], [ESPEJO.x1, ESPEJO.y1, ESPEJO.z], [ESPEJO.x0, ESPEJO.y1, ESPEJO.z]],
  0.02,
  C.perla,
  { vidrio: true },
)
const PLANO = PARADA.duke[2] + ESPEJO.z
const SUBE = 1.15
const SOMBRA = '#4a80e6'
const voltea = ([x, y, z]) => [x, y, 2 * PLANO - z]
const espejar = (formas) =>
  formas
    .filter((f) => f.flat !== SOMBRA)
    .map((f) => {
      const ida = (p) => sum(voltea(p), [0, SUBE, 0])
      const vuelta = (p) => voltea(sum(p, [0, -SUBE, 0]))
      const normal = ([x, y, z]) => [x, y, -z]
      const g = f.k === 'e' ? { ...f, c: ida(f.c), M: f.M.map((fila, i) => (i === 2 ? fila.map((v) => -v) : fila)) } : { ...f, centro: ida(f.centro), tris: f.tris.map((t) => ({ a: ida(t.a), b: ida(t.b), c: ida(t.c), ...(t.na ? { na: normal(t.na), nb: normal(t.nb), nc: normal(t.nc) } : {}) })) }
      if (f.pinta) g.pinta = (p, n) => f.pinta(vuelta(p), normal(n))
      return g
    })
const SE_PEINA = DUKE_P.gestos.find((g) => g.nombre === 'se peina').pose
const FRENTE = (ESPEJO.x0 + ESPEJO.x1) / 2
const ANTE_EL_ESPEJO = { k: K, en: [FRENTE, CUBIERTA, PLANO - 0.75], giro: -90 }
const fuselaje = (u) => {
  const duke = colocar(SE_PEINA(u), ANTE_EL_ESPEJO)
  const brillo = Math.floor(u * 12) % 4 === 0 ? M.destello([0.5, 0.2, 0]).map((f) => ({ ...f, c: [ESPEJO.x0 + 0.25 + 1.0 * ((u * 3) % 1), PARADA.duke[1] + ESPEJO.y1 - 0.12, PLANO - 0.03], r: f.r.map((r) => r * K) })) : []
  // Bajo la toma no hay espejo: ahí el reflejo no se ve.
  const reflejo = espejar(duke).filter((f) => (f.c ?? f.centro)[1] > PARADA.duke[1] + ESPEJO.y0)
  return [...estacionados(u, { hueco: enElEspejo }), ...poner([VIDRIO], 0, PARADA.duke), ...duke, ...reflejo, ...brillo]
}

// ── moby y su abolladura ─────────────────────────────────────────────────

// Bajo el ala de babor, al costado de la góndola del tren, le pega con un
// puño y otro, saltando, hasta que la góndola se hunde. Después retrocede
// resoplando, se agacha a mirar la abolladura y, pasado u = 1, sacude la mano
// adolorida. Los puños se turnan en cada cuadro.
const GONDOLA = sum(PARADA.moby, [1.2, -0.85, -2.9])
const GOLPE = sum(GONDOLA, [1.1, -0.08, -0.22])
const JUNTO_A_LA_GONDOLA = { k: K, en: [GOLPE[0], CUBIERTA, GOLPE[2] - 0.6], giro: -90, suelo: pMoby.suelo }
const RETROCEDE = 0.5
const MOBY_ENOJADO = (u) => [...M.MOBY_TORSO, ...M.mobyCabeza({ t: u * 8, humea: false })]
const pegando = (u) => {
  const golpea = u < 0.7
  const golpe = Math.floor(u * 24) % 2 ? 1 : -1
  const sacude = tramo(u, 1.0, 1.08)
  const duele = sum(lerp(pMoby.reposo(1), [1.0, -0.25, 0.85], sacude), [0, 0.1 * golpe * sacude, 0])
  const manos = golpea
    ? { [golpe]: [1.6, 0.9, golpe * 0.35], [-golpe]: [0.6, -0.2, -golpe * 1.1] }
    : { 1: duele, [-1]: pMoby.reposo(-1) }
  const mira = tramo(u, 0.82, 0.9) * (1 - tramo(u, 1.0, 1.08))
  const retrocede = u >= 0.7 && u < 0.82
  return figura(pMoby, { tronco: MOBY_ENOJADO(u), manos, fase: retrocede ? (1 - (u - 0.7) / 0.06) % 1 : null, salto: golpea ? 0.5 + 0.4 * (golpe > 0 ? 1 : 0) : 0.06 * Math.abs(Math.sin(u * Math.PI * 8)), inclina: golpea ? 10 : -4 - 8 * mira })
}
const dondePega = (u) => ({ ...JUNTO_A_LA_GONDOLA, en: sum(JUNTO_A_LA_GONDOLA.en, [0, 0, -RETROCEDE * tramo(u, 0.7, 0.82)]) })
// La abolladura crece con los golpes: un hundido oscuro con su borde gris.
const abolladura = (k) => (k > 0 ? [M.disco(GOLPE, [0, 0, -1], 0.2 * k, 0.02, C.gris), M.disco(sum(GOLPE, [0, 0, -0.03]), [0, 0, -1], 0.12 * k, 0.02, C.oscuro, { flat: '#101216' })] : [])

export const TOMAS_3D = {
  // Los dos de frente, por babor; la alarma prende y apaga la cúpula.
  alarma: { escena: volando({ alarma: (u) => Math.floor(u * 6) % 2 === 0 }), camara: fija(sum(ALTURA, [24, -1, -26]), sum(ALTURA, [-5, 3, 9]), 42) },
  // Desde la consola, entre sus dos pantallas, de frente al oficial.
  regresen: { escena: RADIO, camara: fija([-27.45, PISO + 1.12, 24.2], [-27.6, PISO + 1.0, 25.75], 50) },
  tengo: { abre: EN_CABINA, escena: hablando('moby'), camara: DEL_TABLERO('moby') },
  // Por su lado de popa, junto a los ventanales: detrás, la proa y el atardecer.
  presupuesto: { escena: RADIO, camara: fija([-30.6, PISO + 1.35, 24.3], [-27.9, PISO + 1.0, 26.7], 58) },
  significa: { abre: EN_CABINA, escena: hablando('moby'), camara: TRES_CUARTOS('moby', 1) },
  recortado: { abre: EN_CABINA, escena: hablando('duke'), camara: DEL_TABLERO('duke') },
  contabilidad: { abre: EN_CABINA, escena: hablando('moby'), camara: TEMBLANDO('moby') },
  adicional: { abre: EN_CABINA, escena: hablando('duke'), camara: TRES_CUARTOS('duke', -1) },

  // Desde atrás y arriba, los dos bajan hacia la popa del barco.
  regresan: {
    escena: (u) => {
      const en = lerp([-560, 110, -6], [-330, 60, -6], u)
      return [...barco(u), ...poner(DUKE.caza({ motor: true }), 0, en), ...poner(MOBY.caza({ motor: true }), 0, sum(en, [-18, 6, -12]))]
    },
    camara: (u) => {
      const en = lerp([-560, 110, -6], [-330, 60, -6], u)
      return [sum(en, [-80, 18, 0]), [-150, CUBIERTA, 0], 36]
    },
  },
  // Desde babor, con la isla al fondo: primero duke y, detrás, moby.
  aterrizan: {
    escena: (u) => [...barco(u), ...aterriza('duke', Math.min(1, u / 0.5)), ...aterriza('moby', Math.max(0, (u - 0.4) / 0.55))],
    camara: fija([-14, 34, -42], [-14, 23, -6], 64),
  },
  // De frente y desde abajo, a la altura de la rueda de proa.
  saltito: { escena: (u) => [...estacionados(u, { alas: PLEGADAS * tramo(u, 0.35, 0.9) }), ...saltito(u)], camara: fija([13, 21.3, -8], [0, 23.2, -6], 50) },
  fuselaje: { escena: fuselaje, camara: fija([FRENTE + 2.3, 21.6, PLANO - 3.8], [FRENTE, 22.0, PLANO - 0.3], 52) },
  abolladura: alargar(
    {
      escena: (u) => [...estacionados(u), ...colocar(pegando(u), dondePega(u)), ...abolladura(tramo(u, 0.25, 0.65))],
      camara: fija([GOLPE[0] + 2.4, 21.4, GOLPE[2] - 3.0], [GOLPE[0] - 0.2, 21.6, GOLPE[2] - 0.3], 50),
    },
    0,
    31 / 24,
  ),
  // A ras de cubierta, detrás de los dos: caminan hacia la isla y la cámara
  // sube despacio hasta el último piso.
  torre: {
    escena: (u) => {
      const z = -10.5 + 6 * u
      const fase = (u * 10) % 1
      return [...estacionados(u), ...colocar(DUKE_P.andando(fase), { k: K, en: [-16.8, CUBIERTA, z], giro: -90 }), ...colocar(MOBY_P.andando((fase + 0.5) % 1), { k: K, en: [-18.5, CUBIERTA, z], giro: -90, suelo: pMoby.suelo })]
    },
    camara: (u) => [[-17.6, CUBIERTA + 0.35, -16], lerp([-17.6, CUBIERTA + 0.5, 0], [-26, 48, 27], suave(tramo(u, 0.2, 0.95))), 52],
  },
}
