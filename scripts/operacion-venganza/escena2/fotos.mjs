// Las fotos de la sesión de duke skyducker, como las de los aviadores de
// antes: posa sobre su Hornet en la cubierta del Sitting Ducks, al atardecer,
// con nubes y cazas que pasan. Son instantáneas cuadradas, con su marco
// blanco, más ancho abajo, que caen de a una sobre una mesa de madera y quedan
// apiladas, cada una un poco ladeada sobre la anterior.
//
// El caza va en sus metros (morro hacia +x) y duke en sus unidades;
// enCaza() los lleva a los metros del barco (escena1/lugares.mjs).

import { el, pixel3d, transformar } from '../pilotos/tres.mjs'
import { CAZA_DUCK_ONE, CAZA_MOBY, destello } from '../pilotos/modelos.mjs'
import { figura, pDuke, dukeCerrado } from '../pilotos/cuerpos.mjs'
import { CABINAS, avion } from '../pilotos/interiores.mjs'
import { MAR, cielo, colocar, poner, portaaviones } from '../escena1/lugares.mjs'
import { suave } from '../escena1/personajes.mjs'
import { rejilla } from '../tiras.mjs'
import { ALTO, ANCHO } from '../../../src/lib/escena1.js'

const sum = (a, b) => a.map((v, i) => v + b[i])
const esc = (a, k) => a.map((v) => v * k)

// Su caza estacionado en la cubierta, cerrado y con los motores apagados; él,
// a la escala que tiene en la cabina.
const EN = [10, 22.8, 6]
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
    { k: K, en: enCaza([-1.6, 0.55, 2.5]), giro: -30 },
  )

// 2 · Tendido en el morro, de lado, con la cabeza en la mano.
const enElMorro = () =>
  colocar(transformar([-90, -90, 0]).formas(figura(pDuke, { tronco: dukeCerrado, manos: { 1: [0.15, -1.15, 1.05], [-1]: [0.35, 0.55, -0.75] }, sinSombra: true })), { k: K, en: enCaza([7.3, 0.74, 0]), suelo: -1.1 })

// 3 · De cerca, con la mano en el mentón y el sol detrás.
const retrato = () =>
  colocar(figura(pDuke, { tronco: dukeCerrado, manos: { 1: [0.85, 0.3, 0.35], [-1]: [0.15, -1.15, -1.05] }, extra: destello([0.6, 1.5, 0.5]), sinSombra: true }), { k: K, en: enCaza([-1.6, 0.55, 2.5]) })

const FOTOS = [
  { duke: sobreElAla, camara: [enCaza([1.4, 0.75, 5.4]), enCaza([-1.6, 1.1, 2.5]), 30] },
  { duke: enElMorro, camara: [enCaza([8.6, 1.4, 4.2]), enCaza([7.3, 0.9, 0]), 32] },
  { duke: retrato, camara: [enCaza([0.4, 1.5, 4.3]), enCaza([-1.6, 1.32, 2.5]), 26] },
]

// ── La mesa ──────────────────────────────────────────────────────────────

// Tablas a lo ancho, con la veta en cuatro tonos y una junta oscura entre
// ellas: el sol entra por la izquierda y la mesa se oscurece hacia la derecha.
const MADERA = ['#c08a52', '#a87240', '#8c5a30', '#6a4222']
const JUNTA = '#3e2614'
const SOMBRA = '#4a2e18'
const TABLA = 26
const MESA = Array.from({ length: ALTO }, (_, y) =>
  Array.from({ length: ANCHO }, (_, x) => {
    const tabla = Math.floor(y / TABLA)
    if (y % TABLA === 0) return JUNTA
    const veta = Math.sin(x * 0.045 + tabla * 2.3 + 1.6 * Math.sin(y * 0.35 + tabla))
    const luz = x / ANCHO + 0.15 * veta
    return MADERA[Math.min(3, Math.max(0, Math.floor(luz * 2.4 + (veta > 0.6 ? -1 : 0) + 0.6)))]
  }),
)

// ── Las instantáneas ─────────────────────────────────────────────────────

// La foto, de `LADO` px, con su marco: `BORDE` arriba y a los lados, y
// `PIE` abajo.
const LADO = 72
const BORDE = 5
const PIE = 17
const BLANCO = '#f6f2e8'
const ANCHO_FOTO = LADO + 2 * BORDE
const ALTO_FOTO = LADO + BORDE + PIE

const revelar = ({ duke, camara: [ojo, mira, campo] }) => rejilla(pixel3d([...ESCENARIO, ...duke()], { ojo, mira, campo, cielo, filas: LADO }, LADO, 1, { c: [0, 0, 0], radio: 1 }), LADO)
let reveladas
const instantaneas = () => (reveladas ??= FOTOS.map(revelar))

// Dónde queda cada una en la pila: su centro y cuánto se ladea, en grados.
const PILA = [
  { c: [108, 71], giro: -7 },
  { c: [168, 75], giro: 5 },
  { c: [228, 70], giro: -3 },
]

// Pinta la instantánea `foto` sobre `celdas`, con su sombra, centrada en `c`
// y ladeada `giro` grados: cada celda busca de qué punto de la foto viene.
const pegar = (celdas, foto, [cx, cy], giro) => {
  const [cos, sin] = [Math.cos((giro * Math.PI) / 180), Math.sin((giro * Math.PI) / 180)]
  const radio = Math.ceil(Math.hypot(ANCHO_FOTO, ALTO_FOTO) / 2) + 3
  const enLaFoto = (x, y) => {
    const [dx, dy] = [x - cx, y - cy]
    return [Math.floor(dx * cos + dy * sin + ANCHO_FOTO / 2), Math.floor(-dx * sin + dy * cos + ALTO_FOTO / 2)]
  }
  const dentro = ([u, v]) => u >= 0 && u < ANCHO_FOTO && v >= 0 && v < ALTO_FOTO
  for (const [sombra, dx, dy] of [[true, 2, 3], [false, 0, 0]])
    for (let y = Math.max(0, cy - radio); y < Math.min(ALTO, cy + radio); y++)
      for (let x = Math.max(0, cx - radio); x < Math.min(ANCHO, cx + radio); x++) {
        const [u, v] = enLaFoto(x - dx, y - dy)
        if (!dentro([u, v])) continue
        const enFoto = u >= BORDE && u < BORDE + LADO && v >= BORDE && v < BORDE + LADO
        celdas[y][x] = sombra ? SOMBRA : enFoto ? (foto[v - BORDE][u - BORDE] ?? BLANCO) : BLANCO
      }
}

// Cada foto cae en su tercio del tiempo: llega de arriba, más grande y más
// ladeada, y se asienta en `CAE` de su tercio.
const CAE = 0.25
export const FOTOS_3D = {
  escena: () => [],
  camara: () => [[0, 0, 0], [1, 0, 0], 60],
  encima: (celdas, u) => {
    celdas.forEach((fila, y) => fila.forEach((_, x) => (fila[x] = MESA[y][x])))
    instantaneas().forEach((foto, k) => {
      const t = u * FOTOS.length - k
      if (t < 0) return
      const cae = 1 - suave(Math.min(1, t / CAE))
      const { c, giro } = PILA[k]
      pegar(celdas, foto, [Math.round(c[0] + 30 * cae), Math.round(c[1] - 90 * cae)], giro + 25 * cae)
    })
  },
}
