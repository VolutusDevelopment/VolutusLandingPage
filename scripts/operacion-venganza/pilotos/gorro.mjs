// Lámina v16: duck-one con un gorro cuartelero. Saluda con tanto brío que se
// lo bota de un manotazo, se queda en saludo mientras cae, se agacha a
// recogerlo y se lo vuelve a poner. Debajo esconde un rizo de resorte.
//
//   node scripts/operacion-venganza/pilotos/gorro.mjs <carpeta> <hoja.html>
//
// Escribe <carpeta>/project/V16-duck-one-gorro.dc.html y, en la hoja, los
// 24 cuadros de la escena para revisarlos de una vez.

import { el, rotacion, transformar, pixel3d, marco } from './tres.mjs'
import * as M from './modelos.mjs'
import { RAMPAS as C, CABEZA, GORRO_PUESTO as PUESTO, ponerGorro as gorro } from './modelos.mjs'
import { figura, pDuckOne, manosAndando } from './cuerpos.mjs'
import { celda, fila, pagina } from './tablero.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'

const [RAIZ, HOJA] = process.argv.slice(2)
const N = 72
const TAM = 3
const LADO = N * TAM
const PASOS = 8
const CUADROS = 24 // 150 ms cada uno, el ritmo de los gestos

const sum = (a, b) => a.map((v, i) => v + b[i])
const res = (a, b) => a.map((v, i) => v - b[i])
const esc = (a, k) => a.map((v) => v * k)
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const uni = (a) => esc(a, 1 / Math.hypot(...a))
const suave = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k))
const tramo = (t, a, b) => suave((t - a) / (b - a))
// Curva de Bézier de a a c, tirada hacia b.
const bezier = (a, b, c, k) => sum(sum(esc(a, (1 - k) ** 2), esc(b, 2 * k * (1 - k))), esc(c, k * k))
const aplicar = (R, v) => R.map((f) => f[0] * v[0] + f[1] * v[1] + f[2] * v[2])
const trasp = (R) => [0, 1, 2].map((j) => [R[0][j], R[1][j], R[2][j]])

// Resorte amortiguado: sale de 0, se pasa, vuelve y se asienta en 1.
const rebote = (τ) => (τ <= 0 ? 0 : 1 - Math.exp(-0.35 * τ) * Math.cos((Math.PI * τ) / 2))

// ── El cuerpo gira en la cadera ──────────────────────────────────────────

const cuerpo = ({ inclina, agacha }) => transformar([0, 0, inclina], pDuckOne.pivote, [0, -agacha, 0])
const desdeMundo = ({ inclina, agacha }, p) => sum(aplicar(trasp(rotacion([0, 0, inclina])), res(sum(p, [0, agacha, 0]), pDuckOne.pivote)), pDuckOne.pivote)

// ── El gorro ─────────────────────────────────────────────────────────────

// Una pose del gorro es su centro y su giro [x, 0, z]: con y = 0, pasar del
// cuerpo al mundo solo suma la inclinación al giro en z.
const alMundo = (pose, { c, rot }) => ({ c: cuerpo(pose).punto(c), rot: [rot[0], 0, rot[2] + pose.inclina] })

const EN_EL_SUELO = { c: [0.85, -2.125, -1.0], rot: [0, 0, 0] }
// Del manotazo sale por arriba y cae por la izquierda, contra el cielo.
const VUELO = [0.5, 4.0, -1.4]
// La mano lo toma por arriba.
const AGARRE = 0.2125
const arribaDe = ({ c, rot }) => sum(c, aplicar(rotacion(rot), [0, AGARRE, 0]))
const colgado = (mano, rot) => ({ c: res(mano, aplicar(rotacion(rot), [0, AGARRE, 0])), rot })

// ── La escena, en cuadros de 0 a 24 ──────────────────────────────────────

const MANOTAZO = 2.6
const TOCA_SUELO = 8
const LANZA = 16.4 // con los brazos cortos no alcanza la cabeza: se lo tira encima
const APRIETA = 18 // el gorro cae en la cabeza y aplasta el peinado
const PUESTO_OTRA_VEZ = 19
const SALUDO = [0.5, 1.02, 0.66]
const PECHO = [0.85, -0.35, -0.75]
const IMPULSO = [0.75, 0.1, -0.6]

const cuerpoEn = (t) => {
  const saludo = tramo(t, 1, MANOTAZO) * (1 - tramo(t, 6, TOCA_SUELO))
  const baja = tramo(t, 8.5, 12) * (1 - tramo(t, 13, 16))
  return { saludo, inclina: 3 * saludo - 42 * baja, agacha: 0.42 * baja }
}

// La mano izquierda y el gorro: vuela, cae, la mano baja, lo toma, lo lanza y
// le cae puesto. `salto` es lo que el peinado lo empuja de vuelta al caer.
const manoYGorro = (t, pose, salto) => {
  const reposo = pDuckOne.reposo(-1)
  if (t < MANOTAZO) return { mano: reposo, gorro: alMundo(pose, PUESTO) }
  if (t < TOCA_SUELO) {
    const k = (t - MANOTAZO) / (TOCA_SUELO - MANOTAZO)
    const desde = alMundo(cuerpoEn(MANOTAZO), PUESTO)
    return { mano: reposo, gorro: { c: bezier(desde.c, VUELO, EN_EL_SUELO.c, k), rot: [12 - 372 * k, 0, desde.rot[2] * (1 - k)] } }
  }
  if (t < 13) return { mano: lerp(reposo, desdeMundo(pose, arribaDe(EN_EL_SUELO)), tramo(t, 9, 12.5)), gorro: EN_EL_SUELO }
  const tomado = desdeMundo(cuerpoEn(13), arribaDe(EN_EL_SUELO))
  const mano = t < 16 ? lerp(tomado, PECHO, tramo(t, 13.5, 16)) : t < LANZA ? lerp(PECHO, IMPULSO, tramo(t, 16, LANZA)) : lerp(IMPULSO, reposo, tramo(t, LANZA, 19.5))
  // En la mano, nivelado mientras se endereza.
  if (t < LANZA) return { mano, gorro: alMundo(pose, colgado(mano, [0, 0, -pose.inclina])) }
  if (t < PUESTO_OTRA_VEZ) {
    const k = (t - LANZA) / (PUESTO_OTRA_VEZ - LANZA)
    const desde = alMundo(cuerpoEn(LANZA), colgado(IMPULSO, [0, 0, 0]))
    const c = sum(lerp(desde.c, alMundo(pose, PUESTO).c, k), [0, 3.2 * k * (1 - k), 0])
    return { mano, gorro: { c, rot: [(12 - 360) * k, 0, PUESTO.rot[2] * k] } }
  }
  const c = sum(PUESTO.c, aplicar(rotacion(PUESTO.rot), [0, salto, 0]))
  return { mano, gorro: alMundo(pose, { c, rot: PUESTO.rot }) }
}

// ── El resorte ───────────────────────────────────────────────────────────

// Suelto desde el manotazo hasta que el gorro lo aplasta de nuevo.
const suelto = (t) => t >= MANOTAZO && t < PUESTO_OTRA_VEZ
const apretado = (t) => 1 - tramo(t, APRIETA, PUESTO_OTRA_VEZ)

// Un rizo enrollado que salta al quedar libre y se bambolea.
const resorte = (t) => {
  if (!suelto(t)) return []
  const τ = t - MANOTAZO
  const alto = 0.8 * rebote(τ) * (0.12 + 0.88 * apretado(t))
  const ladeo = 24 * Math.exp(-0.3 * τ) * Math.sin((Math.PI * τ) / 2 + 0.6) + (t > 13.5 ? 14 * Math.exp(-0.4 * (t - 13.5)) * Math.sin((Math.PI * (t - 13.5)) / 2) : 0)
  const R = rotacion([ladeo, 0, -0.6 * ladeo])
  const punto = (k, r) => sum([0.08, 1.2, 0.1], aplicar(R, [r * Math.cos(k * 9 * Math.PI), k * alto, r * Math.sin(k * 9 * Math.PI)]))
  return [...Array.from({ length: 32 }, (_, i) => el(punto(i / 31, 0.16), [0.07, 0.07, 0.07], C.verdinegro)), el(punto(1, 0), [0.09, 0.08, 0.09], C.verdinegro)]
}
// Lo que el resorte empuja el gorro de vuelta al caerle encima.
const SALTO = 0.14

const recoge = (u) => {
  const t = u * CUADROS
  const pose = cuerpoEn(t)
  const salto = SALTO * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - PUESTO_OTRA_VEZ) / 2)))
  const { mano, gorro: g } = manoYGorro(t, pose, salto)
  return [
    ...figura(pDuckOne, { tronco: [...M.DUCK_ONE_SIN_GORRO, ...CABEZA.formas(resorte(t))], manos: { 1: lerp(pDuckOne.reposo(1), SALUDO, pose.saludo), [-1]: mano }, inclina: pose.inclina, agacha: pose.agacha }),
    ...gorro(g),
  ]
}

const andando = (fase) => figura(pDuckOne, { tronco: M.DUCK_ONE, manos: manosAndando(pDuckOne, fase), fase })

// ── La lámina ────────────────────────────────────────────────────────────

const TOMAS = [
  ['tres cuartos', { giro: -40, altura: 8 }],
  ['de frente', { giro: 0, altura: 5 }],
  ['de perfil', { giro: -90, altura: 0 }],
  ['contrapicado', { giro: -30, altura: -28 }],
  ['picado', { giro: 35, altura: 35 }],
  ['de espaldas', { giro: -145, altura: 12 }],
]
// Cuadro que queda con movimiento reducido: el gorro en el suelo y el resorte a la vista.
const QUIETO = 9

const esSombra = (f) => f.flat === '#4a80e6'
const sinSombra = (figura, toma) => (toma.altura < 0 ? figura.filter((f) => !esSombra(f)) : figura)

const pasos = Array.from({ length: PASOS }, (_, k) => andando(k / PASOS))
const escena = Array.from({ length: CUADROS }, (_, k) => recoge(k / CUADROS))
// marco() encierra todo en una esfera y aquí sobra mucho (el pato agachado, el
// gorro en el aire): el radio se mide en el plano de cada toma, sin la sombra.
const pto = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const ejesDe = ({ giro, altura }) => {
  const [g, a] = [giro, altura].map((v) => (v * Math.PI) / 180)
  const derecha = uni([Math.sin(g), 0, -Math.cos(g)])
  return [derecha, [-Math.sin(a) * Math.cos(g), Math.cos(a), -Math.sin(a) * Math.sin(g)]]
}
const encuadreJusto = (grupos) => {
  const formas = grupos.flatMap(([figuras]) => figuras.flat()).filter((f) => !esSombra(f))
  const { c } = marco(formas)
  const radio = Math.max(...grupos.flatMap(([figuras, tomas]) => tomas.flatMap(([, toma]) => ejesDe(toma).flatMap((e) => figuras.flat().filter((f) => !esSombra(f)).map((f) => Math.abs(pto(res(f.c, c), e)) + Math.max(...f.r))))))
  return { c, radio }
}
const encuadre = encuadreJusto([[pasos, TOMAS], [escena, TOMAS]])
const pinta = (figuras, toma, tam = TAM) => figuras.map((f) => pixel3d(sinSombra(f, toma), toma, N, tam, encuadre))

const caminando = TOMAS.map(([nombre, toma]) => celda(nombre, pinta(pasos, toma), 'p8', 0.8, 2, LADO))
const seCae = TOMAS.map(([nombre, toma]) => celda(nombre, pinta(escena, toma), 'g24', 3.6, QUIETO, LADO))

mkdirSync(`${RAIZ}/project`, { recursive: true })
writeFileSync(
  `${RAIZ}/project/V16-duck-one-gorro.dc.html`,
  pagina({
    titulo: 'duck-one, el gorro',
    papel: 'El líder del escuadrón · nivel 1',
    nombre: 'duck-one',
    bajada: 'El gorro',
    detalle: 'Un gorro cuartelero ladeado a la derecha y con su piocha dorada. Saluda con tanto brío que se lo bota de un manotazo, se queda en saludo mientras cae y después se agacha a recogerlo y se lo encaja como si nada. Debajo asoma lo que el gorro tapa: un rizo de resorte que salta al quedar libre y vuelve a aplastarse.',
    animaciones: `.p8{animation:cuadro8 .8s step-end infinite}
.g24{animation:cuadro24 3.6s step-end infinite}
@keyframes cuadro8{0%{opacity:1}12.5%{opacity:0}100%{opacity:0}}
@keyframes cuadro24{0%{opacity:1}4.167%{opacity:0}100%{opacity:0}}`,
    filas: [fila('Caminando, con el gorro', caminando), fila('Se le cae el gorro', seCae)],
    alto: 860,
  }),
)

// Hoja de revisión: los 24 cuadros de la escena, en tres cuartos y de perfil.
const tira = (cuadros, toma) => `<div style="display:flex;flex-wrap:wrap;gap:2px;margin:2px">${pinta(cuadros, toma, 2).map((s, k) => `<div style="background:#5c94fc;position:relative">${s}<span style="position:absolute;left:2px;top:0;font:10px sans-serif;color:#fff">${k}</span></div>`).join('')}</div>`
writeFileSync(HOJA, `<html><meta charset="utf-8"><body style="margin:0;background:#fff">${[TOMAS[0], TOMAS[2]].map(([, toma]) => tira(escena, toma)).join('')}</body></html>`)
