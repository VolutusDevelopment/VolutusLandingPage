// Las tomas de la escena 5, en 3D: qué se ve en el instante u ∈ [0, 1) y
// desde dónde, como las de la escena 3 (escena3/tomas.mjs). El guion, con
// sus líneas, está en src/lib/escena5.js.
//
// duck-one vuelve al Sitting Ducks: su F-14 llega por la popa, abre las alas,
// aterriza como puede y frena en la cubierta, de babor, donde moby y duke lo
// esperan al costado del avión. Todo en metros del barco.

import { el, transformar } from '../pilotos/tres.mjs'
import * as M from '../pilotos/modelos.mjs'
import { ALAS_TOMCAT, RAMPAS as C, hueso } from '../pilotos/modelos.mjs'
import { PERSONAJES, figura, pDuckOne, pMoby, pDuke, dukeCerrado } from '../pilotos/cuerpos.mjs'
import { MAR, colocar, enMarcha, poner, portaaviones } from '../escena1/lugares.mjs'
import { MANOS_ATRAS, MARINEROS, OFICIOS, hablar, silaba, suave } from '../escena1/personajes.mjs'
import { giroHacia } from '../escena2/reunion.mjs'
import { ESCALA as K, RUEDAS, SUELO, caza, enCabina } from '../escena3/caza.mjs'
import { ACELERADOR, PALANCA } from '../pilotos/interiores.mjs'
import { EN_CABINA, alargar } from '../tiras.mjs'

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
const barco = (u) => [MAR, ...portaaviones(enMarcha(u))]
const CUPULA_ABIERTA = 40
// Detenido, con las alas barridas al máximo, para ocupar menos cubierta.
const estacionado = (u, opciones = {}) => [...barco(u), ...poner(caza({ cupula: CUPULA_ABIERTA, alas: ALAS_TOMCAT.estacionadas, ...opciones }), 0, PARADA)]

// ── duck-one ─────────────────────────────────────────────────────────────

// La cabeza gira en el cuello:
// `sube` grados hacia arriba, el mentón en alto.
const CARA = M.DUCK_ONE.filter((f) => !M.DUCK_ONE_TORSO.includes(f))
const cabezaAlta = (sube) => [...M.DUCK_ONE_TORSO, ...transformar([0, 0, sube], [0.1, 0.1, 0]).formas(CARA)]
const atras = (tronco = M.DUCK_ONE) => figura(pDuckOne, { tronco, manos: MANOS_ATRAS })
const indice = (mano, hacia) => hueso(mano, sum(mano, hacia), 0.045, C.cuero)

// Salta del ala a la cubierta y queda en jarras, con el pecho afuera. Antes
// de u = 0 el caza está solo, y él baja desde el ala, por arriba del cuadro.
const enJarras = { ...pDuckOne, dobla: (s) => [-0.4, 0, s] }
const pose = (u) => {
  const cae = tramo(u, -0.25, 0.3)
  const k = tramo(u, 0.3, 0.5)
  const manos = { 1: lerp([0.5, 0.2, 1.1], [-0.05, -1.25, 1.0], k), [-1]: lerp([0.5, 0.2, -1.1], [-0.05, -1.25, -1.0], k) }
  return figura(enJarras, { tronco: cabezaAlta(14 * k), manos, salto: 11 * (1 - cae) ** 2, inclina: 7 * k })
}

// Habla con el índice arriba, como siempre.
const hablando = (u) => DUCK.hablando(u, { tronco: M.DUCK_ONE })

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

// ── En la cubierta ───────────────────────────────────────────────────────

// duck-one, al costado de su caza, frente a moby y duke, que lo esperaban.
const AQUI = { duck: [2.6, CUBIERTA, -10.5], moby: [2.0, CUBIERTA, -12.4], duke: [3.6, CUBIERTA, -12.3] }
const mirando = (de, a, suelo) => ({ k: K, en: AQUI[de], giro: giroHacia([AQUI[de][0], AQUI[de][2]], [AQUI[a][0], AQUI[a][2]]), suelo })
const DONDE = { duck: mirando('duck', 'moby'), moby: { ...mirando('moby', 'duck'), suelo: pMoby.suelo }, duke: mirando('duke', 'duck') }

const cubierta = (u, { duck = atras(), mobyF = mobyQuieto(u), dukeF = dukeQuieto() } = {}) => [
  ...estacionado(u),
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

// Llega por la popa en el eje de la catapulta de babor, bajando por la senda
// de planeo de 3,5°, toca la cubierta en `TOCA` y frena hasta `PARADA`. El
// caza gira en torno a sus ruedas principales: `alabeo` a estribor, `rumbo` a
// babor y `cabeceo` con el morro arriba, en grados; `sube` lo levanta de la senda.
const TOCA = -70
const SENDA = Math.tan((3.5 * Math.PI) / 180)
const enVuelo = ({ x, z = PARADA[2], alabeo = 0, rumbo = 0, cabeceo = 0, sube = 0 }) =>
  transformar([alabeo, rumbo, cabeceo], RUEDAS.principal(0), [x, CUBIERTA - SUELO + Math.max(0, TOCA - x) * SENDA + sube, z])
const EN_LOS_MANDOS = figura(pDuckOne, { tronco: M.DUCK_ONE, manos: { 1: PALANCA, [-1]: ACELERADOR } })

// Desde atrás, como en los videos de los Tomcat: viene con las alas
// barridas, las abre, baja el tren y después el gancho, ya meciéndose.
const APROXIMA = { desde: -720, hasta: -480 }
const aproxima = (u) => ({ x: APROXIMA.desde + (APROXIMA.hasta - APROXIMA.desde) * u, alabeo: 7 * Math.sin(u * Math.PI * 2.4), cabeceo: 7 })
const aproximacion = (u) => {
  const { abiertas, barridas } = ALAS_TOMCAT
  const alas = barridas + (abiertas - barridas) * tramo(u, 0.1, 0.5)
  return enVuelo(aproxima(u)).formas(caza({ piloto: EN_LOS_MANDOS, alas, tren: u > 0.55, gancho: tramo(u, 0.62, 0.8) }))
}

// Desde la cabeza de duck-one, el peor aterrizaje: se ladea de lado a lado y
// el barco se le va de un costado al otro; golpea la cubierta, rebota y frena
// entre los marinos.
const POV = { desde: -325, toca: 0.58, para: 0.9 }
const vaiven = (a) => PARADA[2] + 9 * (1 - a) ** 1.1 * Math.sin(Math.PI * 2.5 * a)
const bandazos = (u) => {
  if (u < POV.toca) {
    const a = u / POV.toca
    const x = POV.desde + (TOCA - POV.desde) * a
    const deriva = (vaiven(a + 0.01) - vaiven(a)) / ((TOCA - POV.desde) * 0.01)
    const rumbo = (-0.6 * Math.atan(deriva) * 180) / Math.PI + 4 * (1 - a) * Math.sin(Math.PI * 9 * a)
    return { x, z: vaiven(a), alabeo: -(8 + 24 * (1 - a)) * Math.sin(Math.PI * 2.5 * a - 0.6), rumbo, cabeceo: 2 + 2.5 * Math.sin(Math.PI * 6 * a) }
  }
  // Del golpe: rebota un poco, se endereza de un tirón y frena con el gancho.
  const k = Math.min(1, (u - POV.toca) / (POV.para - POV.toca))
  const golpe = Math.exp(-k * 9)
  return { x: TOCA * (1 - k) ** 2, alabeo: 6.6 * golpe * Math.cos(k * 30), sube: 0.9 * Math.max(0, Math.sin(k * Math.PI * 5)) * golpe, cabeceo: 3 * golpe - 2.5 * Math.sin(Math.PI * tramo(u, POV.para - 0.04, POV.para + 0.05)) }
}
// La medalla cuelga hacia donde está el suelo, con algo de retraso, y salta con los golpes.
const medalla = (u) => {
  const salta = (desde) => (u > desde ? 35 * Math.exp(-(u - desde) * 14) * Math.sin((u - desde) * 45) : 0)
  return 0.9 * bandazos(Math.max(0, u - 0.04)).alabeo + salta(POV.toca) + salta(POV.para)
}
// Sus ojos, en unidades de la cabina: él es la cámara, y no se dibuja. La
// cámara va un poco detrás y arriba de ellos, para que se vea más de la cabina
// y de la cubierta.
const OJOS = [0.3, 1.25, 0]
const enLaCabina = (u) => enVuelo(bandazos(u)).formas(caza({ gancho: 1, medalla: medalla(u) }))
const camaraEnLaCabina = (u) => {
  const { punto } = enVuelo(bandazos(u))
  const tiembla = u > POV.toca ? 0.12 * Math.exp(-(u - POV.toca) * 25) * Math.sin(Math.floor(u * 44) * 2.3) : 0
  return [punto(enCabina(sum(OJOS, [-0.9, 0.35 + tiembla, 0]))), punto(enCabina([4, 1.0, 0])), 70, res(punto([0, 1, 0]), punto([0, 0, 0]))]
}

// El humo de las ruedas: tres nubes donde tocan la cubierta, que crecen y se deshacen.
const humo = (u) => {
  const k = (u - POV.toca) / 0.4
  if (k < 0 || k > 1) return []
  return [RUEDAS.principal(1), RUEDAS.principal(-1), RUEDAS.proa].map((rueda) => el(sum(rueda, [TOCA, CUBIERTA - SUELO + 0.3 + 1.2 * k, PARADA[2]]), esc([1.2, 0.8, 1.0], 0.8 + 2 * k), C.humo))
}

// Los marinos esperan en la pista, delante de donde frena, escapan a un lado
// cuando el caza se les viene encima y, ya a salvo, se quedan quietos.
const MARINOS = [
  { oficio: OFICIOS.amarillo, x: 16, z: -5.4, lado: 1, desfase: 0 },
  { oficio: OFICIOS.morado, x: 22, z: -6.6, lado: -1, desfase: 0.3 },
  { oficio: OFICIOS.rojo, x: 28, z: -5.8, lado: 1, desfase: 0.6 },
]
const marinos = (u) => {
  const nariz = bandazos(u).x + 9.45
  return MARINOS.flatMap(({ oficio, x, z, lado, desfase }) => {
    const huye = tramo(nariz, x - 28, x - 8)
    const figuraM = huye > 0 && huye < 1 ? MARINEROS.corre(oficio, (u * 8 + desfase) % 1) : MARINEROS.corre(oficio, 0, { fase: null })
    return colocar(figuraM, { k: K, giro: lado > 0 ? -90 : 90, en: [x, CUBIERTA, z + lado * 6 * huye] })
  })
}

export const TOMAS_3D = {
  aproximacion: {
    abre: EN_CABINA,
    escena: (u) => [...barco(u), ...aproximacion(u)],
    // Detrás y arriba, sin mecerse con él: el barco asoma sobre el caza.
    camara: (u) => {
      const { punto } = enVuelo({ x: aproxima(u).x })
      return [punto([-26, 10, 0]), punto([30, -2.9, 0]), 50]
    },
  },
  aterrizaje: { abre: EN_CABINA, escena: (u) => [...barco(u), ...enLaCabina(u), ...humo(u), ...marinos(u)], camara: camaraEnLaCabina },
  pose: alargar(
    {
      escena: (u) => [...estacionado(u), ...colocar(pose(u), { k: K, en: [3.2, CUBIERTA, -8.2], giro: giroHacia([3.2, -8.2], [4.6, -10.4]) })],
      // Desde abajo, como en los afiches.
      camara: fija([4.6, CUBIERTA + 0.2, -10.4], [3.2, CUBIERTA + 0.9, -8.2], 60),
    },
    -0.5,
    1,
  ),
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
      const camino = sum(AQUI.duck, [5 * u, 0, 0])
      return [...estacionado(u), ...colocar(mobyQuieto(u), DONDE.moby), ...colocar(dukeQuieto(), DONDE.duke), ...colocar(DUCK.andando((u * 6) % 1, { tronco: cabezaAlta(14) }), { k: K, en: camino, giro: 0 })]
    },
    camara: fija([5, CUBIERTA + 0.9, -17.5], [5.2, CUBIERTA + 0.4, -10.5], 46),
  },
  // Sin la espera del final, que ya no pide el texto.
  salta: alargar(
    {
      escena: (u) => [...estacionado(u), ...colocar(saltaYSeñala(u, 0), { k: K, en: [9, CUBIERTA, -10.5], giro: -16 })],
      camara: fija([7.4, CUBIERTA + 0.5, -12.4], [11, CUBIERTA + 1.2, -9.2], 58),
    },
    0,
    25 / 32,
  ),
  fase: {
    escena: (u) => [...estacionado(u), ...colocar(saltaYSeñala(1, silaba(u)), { k: K, en: [9, CUBIERTA, -10.5], giro: -16 })],
    camara: fija([10.6, CUBIERTA + 0.7, -12.2], [9, CUBIERTA + 0.75, -10.5], 46),
  },
}
