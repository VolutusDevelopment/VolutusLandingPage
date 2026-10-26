// Lámina v16: duck-one con un gorro cuartelero chico. Saluda con tanto brío
// que se lo bota de un manotazo, se queda en saludo mientras cae, se agacha a
// recogerlo y se lo vuelve a poner. Debajo esconde un peinado, en tres
// opciones: un rizo de resorte, una trenza hasta el suelo o un jopo.
//
//   node scripts/operacion-venganza/pilotos/gorro.mjs <carpeta> <hoja.html>
//
// Escribe <carpeta>/project/V16-duck-one-gorro.dc.html y, en la hoja, los
// cuadros quietos de cada peinado para revisarlos de una vez.

import { el, rotacion, pixel3d, marco } from './tres.mjs'
import * as M from './modelos.mjs'
import { RAMPAS as C, hueso } from './modelos.mjs'
import { figura, transformar, pDuckOne, manosAndando } from './cuerpos.mjs'
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

// ── Marcos: la cabeza va con el mentón 16° arriba; el cuerpo gira en la cadera ──

const CABEZA = transformar([0, 0, 16], [0.1, 0.1, 0])
const desdeCabeza = (p) => sum(aplicar(trasp(rotacion([0, 0, 16])), res(p, [0.1, 0.1, 0])), [0.1, 0.1, 0])
const cuerpo = ({ inclina, agacha }) => transformar([0, 0, inclina], pDuckOne.pivote, [0, -agacha, 0])
const desdeMundo = ({ inclina, agacha }, p) => sum(aplicar(trasp(rotacion([0, 0, inclina])), res(sum(p, [0, agacha, 0]), pDuckOne.pivote)), pDuckOne.pivote)

// ── El gorro ─────────────────────────────────────────────────────────────

// Cuartelero: dos mitades que suben en las puntas, el pliegue al medio, el
// vivo dorado del borde y la piocha al lado izquierdo. Más oscuro que el
// uniforme, para que se lea sobre la cabeza verde.
const OLIVA_OSCURO = ['#9aa45a', '#5c6a2c', '#3e481e', '#20260f']
const GORRO = [
  ...[1, -1].map((s) =>
    el([s * 0.15, 0, 0], [0.25, 0.14, 0.18], OLIVA_OSCURO, {
      rot: [0, 0, s * 12],
      pinta: ([, y, z]) => (y > 0.08 && Math.abs(z) < 0.03 ? OLIVA_OSCURO[3] : y > -0.06 && y < 0 ? C.oro : null),
    }),
  ),
  el([0.22, 0.03, -0.175], [0.05, 0.05, 0.03], C.oro),
]

// Una pose del gorro es su centro y su giro [x, 0, z]: con y = 0, pasar del
// cuerpo al mundo solo suma la inclinación al giro en z.
const gorro = ({ c, rot }) => transformar(rot, [0, 0, 0], c).formas(GORRO)
const alMundo = (pose, { c, rot }) => ({ c: cuerpo(pose).punto(c), rot: [rot[0], 0, rot[2] + pose.inclina] })

// Puesto en la coronilla, ladeado a la derecha.
const PUESTO = { c: CABEZA.punto([0.12, 1.3, 0.1]), rot: [12, 0, 16] }
const EN_EL_SUELO = { c: [0.85, -2.16, -1.0], rot: [0, 0, 0] }
// Del manotazo sale por arriba y cae por la izquierda, contra el cielo.
const VUELO = [0.5, 4.0, -1.4]
// La mano lo toma por arriba.
const AGARRE = 0.17
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

// ── Los peinados ─────────────────────────────────────────────────────────

// Sueltos desde el manotazo hasta que el gorro los aplasta de nuevo.
const suelto = (t) => t >= MANOTAZO && t < PUESTO_OTRA_VEZ
const apretado = (t) => 1 - tramo(t, APRIETA, PUESTO_OTRA_VEZ)

// A · Resorte: un rizo enrollado que salta al quedar libre y se bambolea.
const resorte = (t) => {
  if (!suelto(t)) return []
  const τ = t - MANOTAZO
  const alto = 0.8 * rebote(τ) * (0.12 + 0.88 * apretado(t))
  const ladeo = 24 * Math.exp(-0.3 * τ) * Math.sin((Math.PI * τ) / 2 + 0.6) + (t > 13.5 ? 14 * Math.exp(-0.4 * (t - 13.5)) * Math.sin((Math.PI * (t - 13.5)) / 2) : 0)
  const R = rotacion([ladeo, 0, -0.6 * ladeo])
  const punto = (k, r) => sum([0.08, 1.2, 0.1], aplicar(R, [r * Math.cos(k * 9 * Math.PI), k * alto, r * Math.sin(k * 9 * Math.PI)]))
  return [...Array.from({ length: 32 }, (_, i) => el(punto(i / 31, 0.16), [0.07, 0.07, 0.07], C.verdinegro)), el(punto(1, 0), [0.09, 0.08, 0.09], C.verdinegro)]
}

// C · Jopo: engominado y negro, se esponja hacia adelante, se pasa y cabecea.
const BASE_JOPO = [0.02, 1.18, 0]
const jopo = (t) => {
  if (!suelto(t)) return []
  const τ = t - MANOTAZO
  const s = rebote(τ) * apretado(t)
  if (s < 0.05) return []
  const en = (p) => sum(BASE_JOPO, esc(p, s))
  const brillo = (p) => {
    const [x, y, z] = esc(res(p, BASE_JOPO), 1 / s)
    return Math.abs(z - 0.15) < 0.05 && y > 0.3 + 0.29 * (x - 0.55) ? '#dfe6f0' : null
  }
  const formas = [
    el(en([0.55, 0.22, 0]), esc([0.68, 0.24, 0.36], s), C.negro, { rot: [0, 0, 16], pinta: brillo }),
    el(en([1.2, 0.36, 0]), esc([0.24, 0.24, 0.34], s), C.negro),
    el(en([1.12, 0.16, 0]), esc([0.13, 0.08, 0.26], s), C.negro, { flat: C.negro[3] }),
  ]
  return transformar([0, 0, 40 * (1 - rebote(τ))], BASE_JOPO).formas(formas)
}

// B · Trenza rubia: se desenrolla hasta el suelo, cuelga de la nuca por la espalda y
// se mece. Va en el mundo: cuelga hacia abajo aunque él se agache.
const RUBIO = ['#fff0b8', '#f2cc6a', '#c8963a', '#7a5418']
const SUELO = pDuckOne.suelo + 0.11
const NUCA = [-0.3, 1.1, -0.1]
const TORSO = { c: [0, -0.85, 0], r: [1.0, 0.8, 1.2] }
const CRANEO = { c: [0.15, 0.6, 0], r: [0.8, 0.74, 0.74] }
const fuera = ({ c, r }, p) => {
  const u = res(p, c).map((v, i) => v / r[i])
  const d = Math.hypot(...u)
  return d >= 1 ? p : sum(c, u.map((v, i) => (v / d) * r[i]))
}
const PASO_TRENZA = 0.09
const trenza = (t, pose) => {
  if (!suelto(t)) return []
  const τ = t - MANOTAZO
  const largo = 3.6 * Math.min(1, (τ / 2.2) ** 2) * apretado(t)
  const mov = cuerpo(pose)
  const enMundo = (p) => mov.punto(CABEZA.punto(p))
  // Sin atravesar el cuerpo ni la cabeza.
  const apartar = (p) => enMundo(fuera(CRANEO, desdeCabeza(fuera(TORSO, desdeMundo(pose, p)))))
  const mece = τ > 2.2 ? 0.25 * Math.exp(-0.3 * (τ - 2.2)) * Math.sin((Math.PI * (τ - 2.2)) / 2.5) : 0
  let p = enMundo(NUCA)
  let dir = uni(res(enMundo([-1.3, 0.9, -0.15]), p))
  const puntos = [p]
  for (let l = PASO_TRENZA; l <= largo; l += PASO_TRENZA) {
    dir = uni(sum(dir, [mece * 0.3, -0.35, -0.04]))
    const q = apartar(sum(p, esc(dir, PASO_TRENZA)))
    // En el suelo se arrastra.
    q[1] = Math.max(q[1], SUELO)
    dir = uni(res(q, p))
    puntos.push(q)
    p = q
  }
  // Mechones cruzados de lado a lado, como una trenza, y un lazo rojo en la punta.
  const lado = uni([0.5, 0, -0.85])
  const mechones = puntos.slice(1).map((q, i) => {
    const s = i % 2 ? 1 : -1
    return hueso(sum(puntos[i], esc(lado, 0.05 * s)), sum(q, esc(lado, -0.05 * s)), 0.11, RUBIO)
  })
  const punta = puntos.at(-1)
  return puntos.length < 2 ? [] : [...mechones, el(punta, [0.09, 0.09, 0.09], C.bermellon), el(sum(punta, esc(dir, 0.12)), [0.13, 0.11, 0.13], RUBIO)]
}

const PEINADOS = [
  { nombre: 'A · resorte', cabeza: resorte, salto: 0.14 },
  { nombre: 'B · trenza', mundo: trenza, salto: 0.05 },
  { nombre: 'C · jopo', cabeza: jopo, salto: 0.08 },
]

const recoge = (peinado, u) => {
  const t = u * CUADROS
  const pose = cuerpoEn(t)
  const salto = peinado.salto * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - PUESTO_OTRA_VEZ) / 2)))
  const { mano, gorro: g } = manoYGorro(t, pose, salto)
  const pelo = peinado.cabeza ? CABEZA.formas(peinado.cabeza(t)) : []
  return [
    ...figura(pDuckOne, { tronco: [...M.DUCK_ONE, ...pelo], manos: { 1: lerp(pDuckOne.reposo(1), SALUDO, pose.saludo), [-1]: mano }, inclina: pose.inclina, agacha: pose.agacha }),
    ...gorro(g),
    ...(peinado.mundo ? peinado.mundo(t, pose) : []),
  ]
}

const andando = (fase) => figura(pDuckOne, { tronco: [...M.DUCK_ONE, ...gorro(PUESTO)], manos: manosAndando(pDuckOne, fase), fase })

// ── La lámina ────────────────────────────────────────────────────────────

const TOMAS = [
  ['tres cuartos', { giro: -40, altura: 8 }],
  ['de frente', { giro: 0, altura: 5 }],
  ['de perfil', { giro: -90, altura: 0 }],
  ['contrapicado', { giro: -30, altura: -28 }],
  ['picado', { giro: 35, altura: 35 }],
  ['de espaldas', { giro: -145, altura: 12 }],
]
const TOMAS_RECOGE = [TOMAS[0], TOMAS[2]]
// Cuadro que queda con movimiento reducido: el gorro en el suelo y el peinado a la vista.
const QUIETO = 9

const esSombra = (f) => f.flat === '#4a80e6'
const sinSombra = (figura, toma) => (toma.altura < 0 ? figura.filter((f) => !esSombra(f)) : figura)

const pasos = Array.from({ length: PASOS }, (_, k) => andando(k / PASOS))
const escenas = PEINADOS.map((p) => ({ ...p, cuadros: Array.from({ length: CUADROS }, (_, k) => recoge(p, k / CUADROS)) }))
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
const encuadre = encuadreJusto([[pasos, TOMAS], ...escenas.map((e) => [e.cuadros, TOMAS_RECOGE])])
const pinta = (figuras, toma, tam = TAM) => figuras.map((f) => pixel3d(sinSombra(f, toma), toma, N, tam, encuadre))

const caminando = TOMAS.map(([nombre, toma]) => celda(nombre, pinta(pasos, toma), 'p8', 0.8, 2, LADO))
const seCae = escenas.flatMap((e) => TOMAS_RECOGE.map(([nombre, toma]) => celda(`${e.nombre} · ${nombre}`, pinta(e.cuadros, toma), 'g24', 3.6, QUIETO, LADO)))

mkdirSync(`${RAIZ}/project`, { recursive: true })
writeFileSync(
  `${RAIZ}/project/V16-duck-one-gorro.dc.html`,
  pagina({
    titulo: 'duck-one, el gorro',
    papel: 'El líder del escuadrón · nivel 1',
    nombre: 'duck-one',
    bajada: 'El gorro',
    detalle: 'Un gorro cuartelero chico, ladeado a la derecha y con su piocha dorada. Saluda con tanto brío que se lo bota de un manotazo, se queda en saludo mientras cae y después se agacha a recogerlo y se lo encaja como si nada. Debajo asoma lo que el gorro tapa: un rizo de resorte, una trenza hasta el suelo o un jopo engominado.',
    animaciones: `.p8{animation:cuadro8 .8s step-end infinite}
.g24{animation:cuadro24 3.6s step-end infinite}
@keyframes cuadro8{0%{opacity:1}12.5%{opacity:0}100%{opacity:0}}
@keyframes cuadro24{0%{opacity:1}4.167%{opacity:0}100%{opacity:0}}`,
    filas: [fila('Caminando, con el gorro', caminando), fila('Se le cae el gorro', seCae)],
    alto: 860,
  }),
)

// Hoja de revisión: los 24 cuadros de cada peinado, en tres cuartos y de perfil.
const tira = (cuadros, toma) => `<div style="display:flex;flex-wrap:wrap;gap:2px;margin:2px">${pinta(cuadros, toma, 2).map((s, k) => `<div style="background:#5c94fc;position:relative">${s}<span style="position:absolute;left:2px;top:0;font:10px sans-serif;color:#fff">${k}</span></div>`).join('')}</div>`
writeFileSync(HOJA, `<html><meta charset="utf-8"><body style="margin:0;background:#fff">${escenas.map((e) => `<h3 style="font:14px sans-serif;margin:6px">${e.nombre}</h3>${TOMAS_RECOGE.map(([, toma]) => tira(e.cuadros, toma)).join('')}`).join('')}</body></html>`)
