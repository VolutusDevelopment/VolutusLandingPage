// Los cuatro pilotos de cuerpo entero: caminando en el lugar y con tres
// gestos cada uno. Cada pose es una figura de tres.mjs para un instante.

import { el, transformar } from './tres.mjs'
import * as M from './modelos.mjs'

const C = M.RAMPAS
const { hueso, ambos, guante, disco, dukeBase, ojosAbiertos, ojosCerrados, destello } = M

// ── Vectores y movimiento ────────────────────────────────────────────────

const sum = (a, b) => a.map((v, i) => v + b[i])
const res = (a, b) => a.map((v, i) => v - b[i])
const esc = (a, k) => a.map((v) => v * k)
const pto = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const uni = (a) => esc(a, 1 / Math.hypot(...a))
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const suave = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k))
const aplicar = (R, v) => R.map((f) => pto(f, v))

// Codo de un brazo de dos tramos que va del hombro a la mano, doblado hacia
// `dobla`. Si la mano queda lejos, el brazo se estira como de goma.
const brazo = (hombro, mano, { L1: l1, L2: l2, g1, g2, manga, antebrazo = manga, dobla }) => {
  const d = res(mano, hombro)
  const u = uni(d)
  const dist = Math.hypot(...d)
  const estira = Math.max(1, (dist * 1.06) / (l1 + l2))
  const [L1, L2] = [l1 * estira, l2 * estira]
  const fin = mano
  const a = (L1 * L1 - L2 * L2 + dist * dist) / (2 * dist)
  const perp = uni(res(dobla, esc(u, pto(dobla, u))))
  const codo = sum(sum(hombro, esc(u, a)), esc(perp, Math.sqrt(Math.max(0, L1 * L1 - a * a))))
  return { formas: [hueso(hombro, codo, g1, manga), hueso(codo, fin, g2, antebrazo)], codo, mano: fin }
}

// Paso de pato: el pie avanza por el aire y vuelve apoyado. ψ = π/2 es de pie.
const pierna = (cadera, ψ, { x, z, suelo, A, alto, grosor, pie, color = C.naranja }) => {
  const levanta = alto * Math.max(0, -Math.sin(ψ))
  const centro = [x + A * Math.cos(ψ), suelo + pie[1] + levanta, z]
  const tobillo = sum(centro, [-pie[0] * 0.45, pie[1] * 0.8, 0])
  // Tan finas, serían puro contorno: se pintan sin él para que se vea el color.
  return [hueso(cadera, tobillo, grosor, color, { brilla: true, pata: true }), el(centro, pie, color, { rot: [0, 0, alto ? (levanta / alto) * 18 : 0], pata: true })]
}

const sombra = (suelo, r) => el([0.1, suelo - 0.012, 0], [r[0], 0.012, r[1]], null, { flat: '#4a80e6', pata: true })

// Bamboleo al caminar: sube en el apoyo simple y se carga hacia el pie que pisa.
const andar = (fase, { balanceo, sube, giro = 0 }) => {
  const φ = fase * Math.PI * 2
  return { φ, rot: [balanceo * Math.sin(φ), giro * Math.sin(φ), 0], alto: sube * Math.abs(Math.sin(φ)) }
}

// Curva de un gesto en el bucle: entra, se sostiene y vuelve a la calma.
const curva = (u) => suave(u / 0.3) * (1 - suave((u - 0.78) / 0.22))
const vaiven = (u, veces = 2) => Math.sin(u * Math.PI * 2 * veces)

// Figura completa: cuerpo de arriba, brazos y piernas, con el bamboleo
// aplicado al tronco y las piernas tendidas de la cadera movida al suelo.
// agacha baja la cadera sin mover los pies: las piernas se acortan.
const figura = (p, { tronco, manos = {}, extra = [], fase = null, salto = 0, agacha = 0, inclina = 0, sinSombra }) => {
  const paso = fase === null ? { φ: null, rot: [0, 0, inclina], alto: salto - agacha } : andar(fase, p.andar)
  const mov = transformar(paso.rot, p.pivote, [0, paso.alto, 0])
  const brazos = p.brazo ? ambos((s) => brazo([p.hombro[0], p.hombro[1], s * p.hombro[2]], manos[s], { ...p.brazo, dobla: p.dobla(s) })) : []
  const piernas = ambos((s) => {
    const ψ = paso.φ === null ? Math.PI / 2 : paso.φ + (s > 0 ? 0 : Math.PI)
    const cadera = mov.punto([p.cadera[0], p.cadera[1], s * p.cadera[2]])
    return pierna(cadera, ψ, { ...p.pierna, x: p.cadera[0] + p.pierna.adelante, z: s * p.cadera[2], suelo: p.suelo + (fase === null ? salto * 0.85 : 0) })
  }).flat()
  const manosFormas = brazos.flatMap((b, i) => p.mano(b, i ? -1 : 1))
  return [
    ...mov.formas([...tronco, ...brazos.flatMap((b) => b.formas), ...manosFormas, ...extra]),
    ...piernas,
    ...(sinSombra ? [] : [sombra(p.suelo, p.sombra)]),
  ]
}

// Manos en reposo que se balancean al revés que la pierna de su lado.
const manosAndando = (p, fase) => {
  const φ = fase * Math.PI * 2
  return { 1: sum(p.reposo(1), [-Math.cos(φ) * p.braceo, 0, 0]), [-1]: sum(p.reposo(-1), [Math.cos(φ) * p.braceo, 0, 0]) }
}

// En una cabina las manos descansan en los mandos: quien arma la escena fija `cabina.reposo`.
export const cabina = { reposo: null }
const reposoDe = (base) => (s) => (cabina.reposo ? cabina.reposo(s) : [base[0], base[1], s * base[2]])

// Hablar: el pico de abajo baja desde su bisagra y deja ver la boca.
// Sílabas de un bucle de doce cuadros, de cerrado a abierto del todo.
const SILABAS = [0, 0.7, 0.2, 1, 0.4, 0.9, 0.1, 0.8, 0.3, 1, 0.5, 0]
const silaba = (u) => SILABAS[Math.floor(u * SILABAS.length) % SILABAS.length]

const hablar = (tronco, abre) => {
  const picos = tronco.filter((f) => f.k === 'e' && f.rampa === C.pico)
  const [arriba, abajo] = [...picos].sort((a, b) => b.r[1] - a.r[1])
  const eje = aplicar(abajo.M, [1, 0, 0])
  const bisagra = res(abajo.c, esc(eje, abajo.r[0] * 0.8))
  const [bajado] = transformar([0, 0, -30 * abre], bisagra).formas([abajo])
  const medio = res(lerp(arriba.c, bajado.c, 0.5), esc(eje, 0.08))
  const boca = el(medio, [abajo.r[0] * 0.7, 0.03 + 0.08 * abre, abajo.r[2] * 0.8], C.boca, { M: arriba.M })
  return [...tronco.filter((f) => f !== abajo), bajado, ...(abre > 0.15 ? [boca] : [])]
}

// ── duck-one ─────────────────────────────────────────────────────────────

const pDuckOne = {
  pivote: [0, -1.35, 0],
  hombro: [0, -0.4, 0.95],
  cadera: [0, -1.35, 0.42],
  suelo: -2.3,
  sombra: [1.0, 0.8],
  brazo: { L1: 0.46, L2: 0.44, g1: 0.16, g2: 0.14, manga: C.oliva },
  dobla: (s) => [-1, 0, s * 0.4],
  pierna: { adelante: 0.15, A: 0.3, alto: 0.2, grosor: 0.07, pie: [0.26, 0.06, 0.18] },
  andar: { balanceo: 6, sube: 0.06 },
  braceo: 0.32,
  reposo: reposoDe([0.08, -1.2, 1.32]),
  mano: (b) => [el(b.mano, [0.13, 0.12, 0.12], C.cuero)],
}

const duckOne = (extraMano = () => []) => ({ ...pDuckOne, mano: (b, s) => [...pDuckOne.mano(b, s), ...extraMano(b, s)] })

const DUCK_ONE = {
  archivo: 'duck-one',
  nombre: 'duck-one',
  papel: 'El líder del escuadrón · nivel 1',
  detalle: 'Camina como si el escuadrón entero le siguiera el paso: el mentón arriba, guantes de cuero y el bamboleo justo. Saluda de reglamento, señala el frente sin mirar atrás y aprueba con el pulgar. Al hablar levanta el índice, como quien dicta cátedra.',
  andando: (fase) => figura(pDuckOne, { tronco: M.DUCK_ONE, manos: manosAndando(pDuckOne, fase), fase }),
  sentado: (u, manos) => figura(pDuckOne, { tronco: M.DUCK_ONE, manos, salto: 0.03 * Math.sin(u * Math.PI * 4), inclina: 1.2 * Math.sin(u * Math.PI * 2) }),
  hablando: (u) => {
    const g = curva(u)
    const p = duckOne((b, s) => (s < 0 && g > 0.5 ? [hueso(b.mano, sum(b.mano, [0.03, 0.22, 0]), 0.045, C.cuero)] : []))
    return figura(p, { tronco: hablar(M.DUCK_ONE, silaba(u)), manos: { 1: pDuckOne.reposo(1), [-1]: lerp(pDuckOne.reposo(-1), [0.8, 0.3 + 0.08 * vaiven(u, 3) * g, -1.05], g) }, inclina: 3 * g })
  },
  gestos: [
    {
      nombre: 'saluda',
      lado: 1,
      pose: (u) => {
        const g = curva(u)
        return figura(pDuckOne, { tronco: M.DUCK_ONE, manos: { 1: lerp(pDuckOne.reposo(1), [0.5, 1.02, 0.66], g), [-1]: pDuckOne.reposo(-1) }, inclina: 3 * g })
      },
    },
    {
      nombre: 'señala',
      lado: -1,
      pose: (u) => {
        const g = curva(u)
        const p = duckOne((b, s) => (s < 0 && g > 0.5 ? [hueso(b.mano, sum(b.mano, [0.24, 0.06, 0.02]), 0.045, C.cuero)] : []))
        const empuje = 0.06 * Math.max(0, vaiven(u, 2)) * g
        return figura(p, { tronco: M.DUCK_ONE, manos: { 1: pDuckOne.reposo(1), [-1]: lerp(pDuckOne.reposo(-1), [1.35 + empuje, 0.35 + empuje, -0.75], g) }, inclina: -4 * g })
      },
    },
    {
      nombre: 'pulgar arriba',
      lado: -1,
      pose: (u) => {
        const g = curva(u)
        const p = duckOne((b, s) => (s < 0 && g > 0.5 ? [hueso(b.mano, sum(b.mano, [0.02, 0.22, 0]), 0.05, C.cuero)] : []))
        return figura(p, { tronco: M.DUCK_ONE, manos: { 1: pDuckOne.reposo(1), [-1]: lerp(pDuckOne.reposo(-1), [0.95, -0.3 + 0.05 * vaiven(u, 2) * g, -0.5], g) } })
      },
    },
  ],
}

// ── duke skyducker ───────────────────────────────────────────────────────

const pDuke = {
  pivote: [0, -1.35, 0],
  hombro: [0.02, -0.45, 0.92],
  cadera: [0, -1.35, 0.4],
  suelo: -2.3,
  sombra: [1.0, 0.8],
  brazo: { L1: 0.46, L2: 0.44, g1: 0.16, g2: 0.15, manga: C.blanco },
  dobla: (s) => [-1, 0, s * 0.4],
  pierna: { adelante: 0.15, A: 0.32, alto: 0.24, grosor: 0.07, pie: [0.26, 0.06, 0.18], color: C.pico },
  andar: { balanceo: 4, sube: 0.07, giro: 5 },
  braceo: 0.26,
  reposo: reposoDe([0.08, -1.2, 1.28]),
  mano: (b) => [hueso(lerp(b.codo, b.mano, 0.78), lerp(b.codo, b.mano, 0.9), 0.165, C.oro), ...guante(b.mano)],
}

// Peine de oro de DUKE_B, llevado por la mano.
const PEINE_MANO = [0.3, 1.08, 0.66]
const peine = (mano) => {
  const d = res(mano, PEINE_MANO)
  const mueve = (p) => sum(p, d)
  return [hueso(mueve([0.05, 1.3, 0.5]), mueve([0.6, 1.45, 0.42]), 0.06, C.negro), ...[0, 1, 2, 3, 4, 5, 6].map((i) => hueso(mueve([0.1 + i * 0.08, 1.31 + i * 0.022, 0.48]), mueve([0.1 + i * 0.08, 1.18 + i * 0.022, 0.44]), 0.02, C.negro))]
}

const espejoDeMano = (mano) => {
  const centro = sum(mano, [0.12, 0.62, 0])
  const ojo = [0.74, 0.63, 0.34]
  const n = uni(res(ojo, centro))
  return [hueso(sum(mano, [0.02, 0.04, -0.01]), sum(mano, [0.12, 0.32, 0]), 0.045, C.oro), disco(centro, n, 0.3, 0.035, C.oro), disco(sum(centro, esc(n, 0.04)), n, 0.25, 0.02, C.vidrio)]
}

const dukeCerrado = dukeBase({ ojos: ojosCerrados, menton: 14 }, [])
const dukeAbierto = dukeBase({ ojos: ojosAbiertos, menton: 4 }, [])

const DUKE = {
  archivo: 'duke',
  nombre: 'duke skyducker',
  papel: 'El rostro del escuadrón · nivel 2',
  detalle: 'Desfila más de lo que camina: ojos cerrados de gusto, el mentón arriba y un leve giro de cadera en cada paso. Se pasa el peine por el copete, se admira en su espejo de mano y saluda como la realeza, con la muñeca. Habla con la mano abierta y sin abrir los ojos.',
  andando: (fase) => figura(pDuke, { tronco: dukeCerrado, manos: manosAndando(pDuke, fase), fase }),
  sentado: (u, manos) => figura(pDuke, { tronco: dukeAbierto, manos, salto: 0.03 * Math.sin(u * Math.PI * 4), inclina: 1.2 * Math.sin(u * Math.PI * 2) }),
  hablando: (u) => {
    const g = curva(u)
    const mano = lerp(pDuke.reposo(1), [0.9, -0.3 + 0.1 * vaiven(u, 2) * g, 1.2], g)
    return figura(pDuke, { tronco: hablar(dukeCerrado, silaba(u) * 0.8), manos: { 1: mano, [-1]: pDuke.reposo(-1) }, extra: g > 0.8 && Math.floor(u * 12) % 4 === 1 ? destello([0.75, 1.6, -0.2]) : [], inclina: 2 * g })
  },
  gestos: [
    {
      nombre: 'se peina',
      lado: 1,
      pose: (u) => {
        const g = curva(u)
        const mano = lerp(pDuke.reposo(1), sum(PEINE_MANO, [0.2 * vaiven(u, 2) * g, 0, 0]), g)
        return figura(pDuke, { tronco: dukeCerrado, manos: { 1: mano, [-1]: pDuke.reposo(-1) }, extra: [...peine(mano), ...(g > 0.6 ? destello(u < 0.55 ? [0.75, 1.6, -0.2] : [-0.4, 1.4, -0.5]) : [])], inclina: 3 * g })
      },
    },
    {
      nombre: 'al espejo',
      lado: 1,
      pose: (u) => {
        const g = curva(u)
        const mano = lerp(pDuke.reposo(1), [1.05 + 0.04 * vaiven(u, 1) * g, 0.25, 0.76], g)
        return figura(pDuke, { tronco: g > 0.4 ? dukeAbierto : dukeCerrado, manos: { 1: mano, [-1]: pDuke.reposo(-1) }, extra: [...espejoDeMano(mano), ...(g > 0.8 && Math.floor(u * 12) % 3 === 0 ? destello([1.05, 1.3, 0.5]) : [])] })
      },
    },
    {
      nombre: 'saludo real',
      lado: 1,
      pose: (u) => {
        const g = curva(u)
        return figura(pDuke, { tronco: dukeCerrado, manos: { 1: lerp(pDuke.reposo(1), [0.45 + 0.12 * vaiven(u, 3) * g, 0.7, 1.2], g), [-1]: pDuke.reposo(-1) }, inclina: 2 * g })
      },
    },
  ],
}

// ── duky ─────────────────────────────────────────────────────────────────

// Duky no tiene brazos: sus alas de hule son las formas 4 y 5, la cabeza va
// de la 6 en adelante. Camina sobre pies de juguete.
const DUKY_CUERPO = M.DUKY.slice(0, 4)
const DUKY_ALAS = M.DUKY.slice(4, 6)
const DUKY_CABEZA = M.DUKY.slice(6)

const pDuky = {
  pivote: [-0.2, -1.8, 0],
  cadera: [-0.2, -1.8, 0.45],
  suelo: -2.2,
  sombra: [1.5, 1.1],
  pierna: { adelante: 0.1, A: 0.16, alto: 0.12, grosor: 0.06, pie: [0.2, 0.05, 0.13] },
  andar: { balanceo: 7, sube: 0.04, giro: 7 },
}

const dukyFigura = ({ fase = null, ala = 0, cabeza = 0, salto = 0, inclina = 0 }) => {
  const alas = ambos((s) => transformar([s < 0 ? ala : 0, 0, 0], [0.2, -0.6, s * 0.8]).formas([DUKY_ALAS[s > 0 ? 0 : 1]])).flat()
  const testa = transformar([0, 0, cabeza], [0.2, -0.35, 0]).formas(DUKY_CABEZA)
  return figura(pDuky, { tronco: [...DUKY_CUERPO, ...alas, ...testa], fase, salto, inclina })
}

const DUKY = {
  archivo: 'duky',
  nombre: 'duky',
  papel: 'El fantasma amarillo · nivel 3',
  detalle: 'El pato de hule gigante, sin asiento: camina a pasitos de juguete de cuerda, y la cara de siempre. Gesticula a su manera: un aleteo mínimo, dos cabeceos y un salto en el lugar. Ninguno le cambia la expresión. Cuando le toca hablar aparecen tres puntos, y nada más.',
  andando: (fase) => dukyFigura({ fase }),
  sentado: (u) => dukyFigura({ salto: 0.03 * Math.sin(u * Math.PI * 4), inclina: 1.2 * Math.sin(u * Math.PI * 2) }),
  hablando: (u) => [...dukyFigura({}), ...[0, 1, 2].filter((i) => u >= 0.15 + i * 0.2 && u < 0.9).map((i) => el([0.6 - (1 - i) * 0.15, 1.2, (1 - i) * 0.45], [0.11, 0.11, 0.11], null, { flat: '#ffffff', brilla: true }))],
  gestos: [
    { nombre: 'aletea', lado: -1, pose: (u) => dukyFigura({ ala: 38 * curva(u) * (0.6 + 0.4 * Math.abs(vaiven(u, 2))) }) },
    { nombre: 'asiente', lado: -1, pose: (u) => dukyFigura({ cabeza: -16 * curva(u) * Math.abs(vaiven(u, 1.5)) }) },
    {
      nombre: 'salta',
      lado: -1,
      pose: (u) => {
        const vuelo = Math.max(0, Math.sin(((u - 0.2) / 0.6) * Math.PI))
        return dukyFigura({ salto: u > 0.2 && u < 0.8 ? 0.55 * vuelo : 0, inclina: 6 * vuelo })
      },
    },
  ],
}

// ── moby-duck ────────────────────────────────────────────────────────────

// Torso y cabeza en el instante u del bucle: el pañuelo flamea y el puro humea.
const mobyVivo = (u, estado) => [...M.MOBY_TORSO, ...M.mobyCabeza({ t: u * 8, ...estado })]

// Brazos gruesos con bíceps y antebrazo marcados; piernas cortas y anchas.
const pMoby = {
  pivote: [0, -1.75, 0],
  hombro: [0.05, -0.5, 1.45],
  cadera: [0, -1.75, 0.62],
  suelo: -2.55,
  sombra: [1.7, 1.6],
  brazo: { L1: 0.62, L2: 0.6, g1: 0.28, g2: 0.26, manga: C.pardo },
  dobla: (s) => [-1, 0, s * 0.5],
  pierna: { adelante: 0.15, A: 0.26, alto: 0.13, grosor: 0.15, pie: [0.42, 0.1, 0.3] },
  andar: { balanceo: 8, sube: 0.07, giro: 6 },
  braceo: 0.3,
  reposo: reposoDe([0.2, -1.55, 1.9]),
  mano: (b) => [el(b.formas[0].c, [0.34, 0.31, 0.31], C.pardo), el(lerp(b.codo, b.mano, 0.42), [0.3, 0.29, 0.29], C.pardo), el(b.mano, [0.25, 0.22, 0.22], C.pardo)],
}

// Pisa tan pesado que levanta polvo: dos nubes al lado del pie que apoya.
const polvo = (fase) =>
  ambos((s) => {
    const ψ = fase * Math.PI * 2 + (s > 0 ? 0 : Math.PI)
    const k = (((ψ / (Math.PI * 2)) % 1) + 1) % 1
    if (k > 0.25) return []
    const x = 0.15 + pMoby.pierna.A * Math.cos(ψ)
    return [1, -1].map((d) => el([x + d * (0.38 + k * 0.6), pMoby.suelo + 0.08 + k * 0.2, s * 0.62 + d * 0.1], esc([0.16, 0.12, 0.14], 1 - k * 1.5), C.crema))
  }).flat()

const conBiceps = (g, u) => ({
  ...pMoby,
  dobla: (s) => (s > 0 ? lerp([-1, 0, 0.5], [0, -0.3, 1], g) : pMoby.dobla(s)),
  mano: (b, s) => [...pMoby.mano(b, s), ...(s > 0 && g > 0.5 ? [el(sum(b.formas[0].c, [0, 0.18, 0]), esc([0.3, 0.26, 0.26], 0.85 + 0.15 * Math.abs(vaiven(u, 2))), C.pardo)] : [])],
})

const MOBY = {
  archivo: 'moby-duck',
  nombre: 'moby-duck',
  papel: 'La fuerza bruta · nivel 2',
  detalle: 'Espalda en V, trapecios que le tragan el cuello y antebrazos de leñador: anda abierto de brazos y pisa tan pesado que levanta polvo, con el puro humeando y las colas del pañuelo al viento. Saca músculo, se golpea la palma con el puño y se seca el llanto con el antebrazo, que le vuelve a correr al instante. Habla a los gritos, con el puño en alto.',
  andando: (fase) => [...figura(pMoby, { tronco: mobyVivo(fase), manos: manosAndando(pMoby, fase), fase }), ...polvo(fase)],
  sentado: (u, manos) => figura(pMoby, { tronco: mobyVivo(u), manos, salto: 0.03 * Math.sin(u * Math.PI * 4), inclina: 1.2 * Math.sin(u * Math.PI * 2) }),
  hablando: (u) => {
    const g = curva(u)
    const p = { ...pMoby, dobla: (s) => (s > 0 ? [0, -0.3, 1] : pMoby.dobla(s)) }
    return figura(p, { tronco: hablar(mobyVivo(u), Math.min(1, silaba(u) * 1.2)), manos: { 1: lerp(pMoby.reposo(1), [0.55, 0.4 + 0.14 * Math.abs(vaiven(u, 4)) * g, 1.9], g), [-1]: pMoby.reposo(-1) }, inclina: -4 * g })
  },
  gestos: [
    {
      nombre: 'saca músculo',
      lado: 1,
      pose: (u) => {
        const g = curva(u)
        return figura(conBiceps(g, u), { tronco: mobyVivo(u), manos: { 1: lerp(pMoby.reposo(1), [0.25, 0.2, 1.95], g), [-1]: pMoby.reposo(-1) }, inclina: 2 * g })
      },
    },
    {
      nombre: 'puño y palma',
      lado: -1,
      pose: (u) => {
        const g = curva(u)
        const golpe = Math.max(0, vaiven(u, 2.5))
        const palma = lerp(pMoby.reposo(1), [1.5, -1.0, 0.25], g)
        const puno = lerp(pMoby.reposo(-1), [1.55, -0.55 - 0.25 * (1 - golpe), -0.35 + 0.2 * (1 - golpe)], g)
        return figura(pMoby, { tronco: mobyVivo(u), manos: { 1: palma, [-1]: puno }, inclina: -3 * g })
      },
    },
    {
      nombre: 'se seca',
      lado: 1,
      pose: (u) => {
        const g = curva(u)
        const p = { ...pMoby, dobla: (s) => (s > 0 ? [-0.3, -1, 0.6] : pMoby.dobla(s)) }
        return figura(p, { tronco: mobyVivo(u), manos: { 1: lerp(pMoby.reposo(1), [1.25, 0.45, 0.6 - 0.55 * (0.5 + 0.5 * vaiven(u, 2))], g), [-1]: pMoby.reposo(-1) }, inclina: 5 * g })
      },
    },
  ],
}

export const PERSONAJES = [DUCK_ONE, MOBY, DUKE, DUKY]

export { figura, pDuckOne, pMoby, manosAndando }
