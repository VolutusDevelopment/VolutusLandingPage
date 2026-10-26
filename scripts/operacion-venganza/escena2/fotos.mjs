// Las fotos de la sesión de duke skyducker, como las de los aviadores de
// antes: posa sobre su F-15EX en la cubierta del Sitting Ducks, al atardecer,
// con nubes y cazas que pasan. Cada foto lleva su marco blanco de
// instantánea, puesto justo delante de la cámara.
//
// El caza va en sus metros (morro hacia +x) y duke en sus unidades;
// enCaza() los lleva a los metros del barco (escena1/lugares.mjs).

import { el, placa, transformar } from '../pilotos/tres.mjs'
import { RAMPAS as C, CAZA_DUCK_ONE, CAZA_MOBY, destello } from '../pilotos/modelos.mjs'
import { figura, pDuke, dukeCerrado } from '../pilotos/cuerpos.mjs'
import { CABINAS, avion } from '../pilotos/interiores.mjs'
import { MAR, colocar, poner, portaaviones } from '../escena1/lugares.mjs'
import { anteLaCamara } from './reunion.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const esc = (a, k) => a.map((v) => v * k)

// Su caza estacionado en la cubierta, cerrado y con los motores apagados; él,
// a la escala que tiene en la cabina.
const EN = [10, 23.0, 6]
const enCaza = (p) => sum(p, EN)
const CAZA = avion(CABINAS.duke)
  .filter((f) => !f.luz)
  .map((f) => ({ ...f, hueco: undefined }))
const K = CABINAS.duke.k

// Nubes de atardecer, de las que se apilan, y dos cazas del escuadrón que pasan a lo lejos.
const NUBE = ['#fff4ea', '#ffd8c6', '#e9aca6', '#a27c9c']
const cumulo = (c, r) =>
  [[0, 0, 0, 1], [0.8, -0.2, 0.3, 0.75], [-0.85, -0.25, -0.2, 0.7], [0.3, 0.55, 0.1, 0.65], [-0.4, 0.45, 0.3, 0.6], [1.5, -0.4, 0, 0.5], [-1.5, -0.45, 0.1, 0.45]].map(([x, y, z, s]) => el(sum(c, esc([x, y, z], r)), esc([1, 0.8, 1], r * s), NUBE))
const ESCENARIO = [
  MAR,
  ...portaaviones({ avion: false }),
  ...poner(CAZA, 0, EN),
  ...cumulo([-480, 95, -360], 70),
  ...cumulo([-160, 70, -560], 50),
  ...cumulo([300, 90, -420], 60),
  ...poner(transformar([25, 0, 0]).formas(CAZA_DUCK_ONE), 150, [-160, 62, -125]),
  ...poner(transformar([25, 0, 0]).formas(CAZA_MOBY), 150, [-125, 78, -62]),
]

// El marco de la instantánea, delante de la cámara: más ancho abajo.
const BLANCO = '#f6f2e8'
const marco = (camara) => {
  const p = anteLaCamara(camara)
  const banda = (x0, y0, x1, y1) => placa([p(x0, y0), p(x1, y0), p(x1, y1), p(x0, y1)], 0.001, C.blanco, { flat: BLANCO })
  return [banda(-1.2, -1.2, 1.2, -0.7), banda(-1.2, 0.88, 1.2, 1.2), banda(-1.2, -1.2, -0.9, 1.2), banda(0.9, -1.2, 1.2, 1.2)]
}

// ── Las poses ────────────────────────────────────────────────────────────

// Sin bamboleo: las piernas se ponen con la fase de un paso, quieto en él.
const quieto = { ...pDuke, andar: { balanceo: 0, sube: 0 } }

// 1 · Sobre el ala, como en la foto de la aviadora: una pierna atrás y
// arriba, una mano en el fuselaje, el otro brazo al aire y el mentón arriba.
const sobreElAla = () =>
  colocar(
    figura(
      { ...quieto, pierna: { ...pDuke.pierna, A: 0.4, alto: 0.7 } },
      { tronco: dukeCerrado, manos: { 1: [0.3, 1.0, 1.5], [-1]: [-0.5, -0.7, -1.35] }, extra: destello([0.75, 1.6, -0.2]), fase: 0.65, sinSombra: true },
    ),
    { k: K, en: enCaza([-1.6, 0.35, 2.5]), giro: -30 },
  )

// 2 · Tendido en el morro, de lado, con la cabeza en la mano.
const enElMorro = () =>
  colocar(transformar([-90, -90, 0]).formas(figura(pDuke, { tronco: dukeCerrado, manos: { 1: [0.15, -1.15, 1.05], [-1]: [0.35, 0.55, -0.75] }, sinSombra: true })), { k: K, en: enCaza([7.3, 0.85, 0]), suelo: -1.1 })

// 3 · De cerca, con la mano en el mentón y el sol detrás.
const retrato = () =>
  colocar(figura(pDuke, { tronco: dukeCerrado, manos: { 1: [0.85, 0.3, 0.35], [-1]: [0.15, -1.15, -1.05] }, extra: destello([0.6, 1.5, 0.5]), sinSombra: true }), { k: K, en: enCaza([-1.6, 0.35, 2.5]) })

const FOTOS = [
  { duke: sobreElAla, camara: [enCaza([1.4, 0.55, 5.4]), enCaza([-1.6, 0.95, 2.5]), 36] },
  { duke: enElMorro, camara: [enCaza([8.6, 1.5, 4.2]), enCaza([7.3, 1.0, 0]), 32] },
  { duke: retrato, camara: [enCaza([0.4, 1.3, 4.3]), enCaza([-1.6, 1.12, 2.5]), 26] },
]

// Tres fotos, una tras otra, en el instante u ∈ [0, 1).
const foto = (u) => FOTOS[Math.min(FOTOS.length - 1, Math.floor(u * FOTOS.length))]

export const FOTOS_3D = {
  escena: (u) => [...ESCENARIO, ...foto(u).duke(), ...marco(foto(u).camara)],
  camara: (u) => foto(u).camara,
}
