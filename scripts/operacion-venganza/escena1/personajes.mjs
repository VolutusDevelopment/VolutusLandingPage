// Los patos de la escena 1, a bordo del Sitting Ducks: el almirante, el
// oficial de inteligencia y los marineros de cubierta. Mismas unidades que
// los pilotos: el pato mira hacia +x, su ala derecha hacia +z y pisa en -2.3.

import { el, placa, transformar } from '../pilotos/tres.mjs'
import { RAMPAS as C, hueso, ambos, disco } from '../pilotos/modelos.mjs'
import { figura, manosAndando } from '../pilotos/cuerpos.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const res = (a, b) => a.map((v, i) => v - b[i])
const esc = (a, k) => a.map((v) => v * k)
const uni = (a) => esc(a, 1 / Math.hypot(...a))
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
export const suave = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k))
export const curva = (u) => suave(u / 0.3) * (1 - suave((u - 0.78) / 0.22))
const vaiven = (u, veces = 2) => Math.sin(u * Math.PI * 2 * veces)

const NAVAL = ['#5a6c9c', '#2c3c6a', '#1e2a50', '#0e1630']
const CANOSO = ['#f6f6f0', '#cdd0cc', '#9c9f9a', '#5e615c']
const PATA_VIEJA = ['#ffd0a0', '#e8964e', '#b06a24', '#6a3c10']
const CAQUI = ['#eee2b4', '#c8b67a', '#97874e', '#5e522a']
const PARDA = ['#ecd0a4', '#c0966a', '#8c6842', '#523a22']
const PEKIN = ['#ffffff', '#f6f2e6', '#d6cfb8', '#9a9178']
const PIEL_OREJERA = ['#5a5f68', '#30343a', '#202328', '#0e1014']

// Sílabas de doce cuadros y el pico de abajo que baja desde su bisagra (como los pilotos).
const SILABAS = [0, 0.7, 0.2, 1, 0.4, 0.9, 0.1, 0.8, 0.3, 1, 0.5, 0]
export const silaba = (u) => SILABAS[Math.floor(u * SILABAS.length) % SILABAS.length]
const hablar = (tronco, abre) => {
  if (abre < 0.05) return tronco
  const picos = tronco.filter((f) => f.k === 'e' && f.rampa === C.pico)
  const [arriba, abajo] = [...picos].sort((a, b) => b.r[1] - a.r[1])
  const eje = abajo.M.map((f) => f[0])
  const bisagra = res(abajo.c, esc(eje, abajo.r[0] * 0.8))
  const [bajado] = transformar([0, 0, -30 * abre], bisagra).formas([abajo])
  const medio = res(lerp(arriba.c, bajado.c, 0.5), esc(eje, 0.08))
  const boca = el(medio, [abajo.r[0] * 0.7, 0.03 + 0.08 * abre, abajo.r[2] * 0.8], C.boca, { M: arriba.M })
  return [...tronco.filter((f) => f !== abajo), bajado, boca]
}

const pico = () => [el([0.95, 0.45, 0], [0.56, 0.13, 0.28], C.pico, { rot: [0, 0, -8] }), el([0.88, 0.33, 0], [0.45, 0.08, 0.22], C.pico, { rot: [0, 0, -6] })]

// Ojo con párpado: `abre` de 0 (cerrado) a 1; `mira` corre la pupila.
const ojo = (s, { abre = 0.6, plumaje, mira = [0, 0], grande = 1 }) => {
  const c = [0.75, 0.66, s * 0.33]
  const r = esc([0.08, 0.1, 0.1], grande)
  return [
    el(c, r, C.blanco, { flat: '#ffffff' }),
    el(sum(c, [0.06, mira[1] - 0.01, s * 0.01 + mira[0]]), esc([0.035, 0.05, 0.05], grande), C.blanco, { flat: '#101418' }),
    el(sum(c, [0.015, 0.1 - 0.16 * abre, 0]), esc([0.09, 0.08, 0.115], grande), plumaje),
  ]
}

// ── El almirante ─────────────────────────────────────────────────────────

// Viejo y canoso: cejas blancas tupidas, patillas de plumas, párpados
// pesados. Uniforme azul marino cruzado, hombreras doradas, pasadores al
// pecho y gorra de plato con laureles en la visera. Gafas redondas de
// marinero, de alambre dorado, que se quita despacio.
const ALM_CABEZA = transformar([0, 0, -4], [0.1, 0.1, 0])

const gafasRedondas = () => [
  ...ambos((s) => {
    const n = uni([1, 0, s * 0.3])
    const c = [0.9, 0.67, s * 0.29]
    return [disco(c, n, 0.17, 0.012, C.oro), disco(sum(c, esc(n, 0.02)), n, 0.14, 0.01, C.vidrio, { vidrio: true })]
  }).flat(),
  hueso([0.95, 0.72, -0.13], [0.95, 0.72, 0.13], 0.018, C.oro),
  ...ambos((s) => hueso([0.86, 0.7, s * 0.45], [0.1, 0.74, s * 0.66], 0.018, C.oro)),
]
const GAFAS_PUESTAS = ALM_CABEZA.formas(gafasRedondas())
const PUENTE_GAFAS = ALM_CABEZA.punto([0.95, 0.68, 0.3])

const gorraDePlato = () => [
  el([0.1, 1.24, 0], [0.7, 0.2, 0.68], C.blanco),
  el([0.1, 1.08, 0], [0.56, 0.14, 0.56], NAVAL, { pinta: ([x, y, z]) => (x > 0.45 && Math.abs(z) < 0.13 && Math.abs(y - 1.09) < 0.1 ? (Math.hypot(y - 1.09, z) < 0.05 ? C.bermellon : C.oro) : null) }),
  el([0.58, 1.0, 0], [0.36, 0.05, 0.48], C.negro, { rot: [0, 0, -12], pinta: ([x, , z]) => (x > 0.62 && Math.sin(z * 30) > 0.1 ? C.oro : null) }),
]

const almiranteCabeza = ({ abre = 0.45, gafas = true, ceño = 0 } = {}) =>
  ALM_CABEZA.formas([
    el([0.15, 0.6, 0], [0.7, 0.64, 0.64], CANOSO),
    ...pico(),
    ...ambos((s) => ojo(s, { abre, plumaje: CANOSO })).flat(),
    ...ambos((s) => el([0.74, 0.84 - ceño * 0.04, s * 0.32], [0.13, 0.07, 0.21], C.blanco, { rot: [s * (-14 + ceño * 22), 0, 0] })),
    ...ambos((s) => el([0.32, 0.42, s * 0.52], [0.3, 0.27, 0.16], C.blanco, { rot: [0, 0, -15] })),
    ...gorraDePlato(),
  ]).concat(gafas ? GAFAS_PUESTAS : [])

const almiranteTronco = (cabeza) => [
  el([0, -0.85, 0], [0.92, 0.72, 1.1], NAVAL, {
    pinta: ([x, y, z]) => {
      if (x < 0.3) return null
      for (const by of [-0.45, -0.72, -0.99]) for (const bz of [-0.24, 0.24]) if (Math.hypot(y - by, z - bz) < 0.055) return C.oro
      if (z < -0.32 && z > -0.66 && y < -0.28 && y > -0.48) {
        const fila = Math.floor((y + 0.48) / 0.1)
        const col = Math.floor((z + 0.66) / 0.085)
        return ['#d8282c', '#f2f2f2', '#2c4cb0', '#f2c440', '#22a04a'][(fila * 2 + col) % 5]
      }
      return null
    },
  }),
  ...ambos((s) => el([-0.02, -0.38, s * 0.86], [0.42, 0.11, 0.3], C.oro)),
  el([0.1, 0, 0], [0.5, 0.52, 0.52], CANOSO),
  el([0.12, -0.18, 0], [0.56, 0.13, 0.58], C.blanco),
  hueso([0.66, -0.22, 0], [0.84, -0.55, 0], 0.07, C.negro),
  ...cabeza,
]

export const pAlmirante = {
  pivote: [0, -1.35, 0],
  hombro: [0, -0.42, 0.95],
  cadera: [0, -1.35, 0.42],
  suelo: -2.3,
  sombra: [1.0, 0.8],
  brazo: { L1: 0.46, L2: 0.44, g1: 0.16, g2: 0.14, manga: NAVAL },
  dobla: (s) => [-1, 0, s * 0.4],
  pierna: { adelante: 0.15, A: 0.25, alto: 0.15, grosor: 0.07, pie: [0.26, 0.06, 0.18], color: PATA_VIEJA },
  andar: { balanceo: 4, sube: 0.04 },
  braceo: 0.2,
  reposo: (s) => [0.08, -1.2, s * 1.32],
  mano: (b) => [hueso(lerp(b.codo, b.mano, 0.72), lerp(b.codo, b.mano, 0.84), 0.15, C.oro), el(b.mano, [0.13, 0.12, 0.12], CANOSO)],
}

// Sillón de mando de cuero con apoyabrazos, en unidades del pato.
export const SILLON = [
  placa([[-0.95, -1.95, -1.15], [-0.95, -1.95, 1.15], [0.75, -1.95, 1.15], [0.75, -1.95, -1.15]], 0.25, C.cuero),
  placa([[-1.05, -2.0, -1.05], [-1.05, -2.0, 1.05], [-1.2, 0.3, 0.95], [-1.2, 0.3, -0.95]], 0.3, C.cuero),
  ...ambos((s) => placa([[-0.8, -1.4, s * 1.25], [0.6, -1.4, s * 1.25], [0.6, -1.4, s * 1.45], [-0.8, -1.4, s * 1.45]], 0.18, C.cuero)),
  ...ambos((s) => hueso([0.45, -1.4, s * 1.35], [0.45, -2.0, s * 1.35], 0.07, C.oscuro)),
  hueso([-0.1, -2.1, 0], [-0.1, -2.75, 0], 0.16, C.oscuro),
  el([-0.1, -2.8, 0], [0.75, 0.06, 0.75], C.oscuro),
]

const SENTADO = 0.5
// Las manos van antes de bajar la figura: se suben lo que se sienta para quedar en los apoyabrazos.
const brazosEnSillon = (s) => [0.15, -1.28 + SENTADO, s * 1.32]
const alm = (cfg) => figura(pAlmirante, { sinSombra: true, ...cfg })
// De pie lleva las manos atrás: así espera, así camina y así mira el mar.
const MANOS_ATRAS = { 1: [-0.55, -1.0, 0.55], [-1]: [-0.55, -1.0, -0.55] }

export const ALMIRANTE = {
  nombre: 'El almirante',
  papel: 'Comandante del Sitting Ducks',
  bajada: 'Azul marino cruzado, hombreras doradas y gorra de plato',
  detalle: 'Viejo, canoso y de pocas palabras: cejas blancas tupidas, patillas de plumas y párpados pesados de quien ya lo ha visto todo. Lleva gafas redondas de marinero, de alambre dorado, y se las quita despacio cuando algo no le cabe en la cabeza. Pasa la escena sentado en su sillón de mando, frente a la pantalla, hasta que se levanta y camina despacio a la ventana, con las manos atrás, a mirar el atardecer.',
  quieto: (u) => alm({ tronco: almiranteTronco(almiranteCabeza({ abre: u > 0.8 && u < 0.92 ? 0 : 0.45 })), manos: MANOS_ATRAS, salto: 0.015 * Math.sin(u * Math.PI * 2) }),
  // Despacio y con las manos atrás; sin `fase`, se detiene.
  andando: (fase = null) => alm({ tronco: almiranteTronco(almiranteCabeza()), manos: MANOS_ATRAS, fase }),
  sentado: (u, extra = {}) => [...alm({ tronco: hablar(almiranteTronco(almiranteCabeza(extra)), extra.abrePico ?? 0), manos: { 1: brazosEnSillon(1), [-1]: brazosEnSillon(-1) }, agacha: SENTADO, salto: 0.012 * Math.sin(u * Math.PI * 2) }), ...SILLON],
  gestos: [
    {
      nombre: 'pregunta',
      pose: (u) => {
        const g = curva(u)
        return alm({ tronco: hablar(almiranteTronco(almiranteCabeza({ ceño: g })), silaba(u) * 0.8), manos: { 1: lerp(MANOS_ATRAS[1], [0.85, -0.45 + 0.06 * vaiven(u, 3) * g, 0.9], g), [-1]: MANOS_ATRAS[-1] }, inclina: -3 * g })
      },
    },
    {
      nombre: 'se quita las gafas',
      pose: (u, { sentado = false } = {}) => {
        const sube = suave(u / 0.3)
        const baja = suave((u - 0.42) / 0.4)
        const lentes = sum(PUENTE_GAFAS, [0.12, -0.05, 0.12])
        const pecho = [0.95, -0.55, 0.75]
        const mano = lerp(lerp([0.08, -1.2, 1.32], lentes, sube), pecho, baja)
        const gafas = u > 0.38 ? transformar([0, 0, -50 * baja], PUENTE_GAFAS, res(mano, lentes)).formas(GAFAS_PUESTAS) : []
        const otra = sentado ? brazosEnSillon(-1) : [0.08, -1.2, -1.32]
        const figura = alm({ tronco: almiranteTronco(almiranteCabeza({ gafas: u <= 0.38, abre: baja > 0.5 ? 0.25 : 0.45, ceño: baja })), manos: { 1: mano, [-1]: otra }, extra: gafas, agacha: sentado ? SENTADO : 0, inclina: 3 * baja })
        return sentado ? [...figura, ...SILLON] : figura
      },
    },
    {
      nombre: 'se levanta',
      pose: (u) => {
        const k = suave((u - 0.15) / 0.55)
        const empuje = Math.sin(k * Math.PI)
        return [...alm({ tronco: almiranteTronco(almiranteCabeza({ ceño: k })), manos: { 1: lerp(brazosEnSillon(1), [0.2, -1.2, 1.3], k), [-1]: lerp(brazosEnSillon(-1), [0.2, -1.2, -1.3], k) }, agacha: SENTADO * (1 - k), inclina: -14 * empuje }), ...SILLON]
      },
    },
    {
      nombre: 'da la orden',
      pose: (u) => {
        const g = curva(u)
        return alm({ tronco: hablar(almiranteTronco(almiranteCabeza({ ceño: 1 })), silaba(u)), manos: { 1: lerp(MANOS_ATRAS[1], [1.45, 0.05, 0.55], g), [-1]: MANOS_ATRAS[-1] }, inclina: -5 * g })
      },
    },
    {
      nombre: 'mira el atardecer',
      pose: (u) => alm({ tronco: almiranteTronco(almiranteCabeza({ abre: u > 0.55 && u < 0.67 ? 0 : 0.3 })), manos: MANOS_ATRAS, salto: 0.015 * Math.sin(u * Math.PI * 2), inclina: 3 }),
    },
  ],
}

// ── El oficial de inteligencia ───────────────────────────────────────────

// Joven, pardo y sin expresión: camisa caqui con bolsillos, corbata, gafas
// rectangulares de pasta y audífonos con micrófono. Lee todo de su tableta.
const OF_CABEZA = transformar([0, 0, 2], [0.1, 0.1, 0])

const gafasDePasta = () =>
  ambos((s) => {
    const [z0, z1] = [s * 0.13, s * 0.45]
    const esquinas = [[0.9, 0.59, z0], [0.9, 0.59, z1], [0.86, 0.75, z1], [0.86, 0.75, z0]]
    return [
      ...esquinas.map((a, i) => hueso(a, esquinas[(i + 1) % 4], 0.03, C.negro)),
      placa(esquinas, 0.01, C.vidrio, { vidrio: true }),
      hueso([0.86, 0.68, z1], [0.1, 0.7, s * 0.66], 0.02, C.negro),
    ]
  }).flat()

const audifonos = () => [
  ...ambos((s) => el([0.12, 0.62, s * 0.66], [0.18, 0.22, 0.09], PIEL_OREJERA)),
  ...[0, 1, 2, 3, 4, 5, 6].map((i) => {
    const a = (i / 7) * Math.PI
    const b = ((i + 1) / 7) * Math.PI
    const p = (t) => [0.08, 0.62 + 0.72 * Math.sin(t), 0.7 * Math.cos(t)]
    return hueso(p(a), p(b), 0.04, C.negro)
  }),
  hueso([0.25, 0.48, 0.68], [0.82, 0.26, 0.44], 0.022, C.negro),
  el([0.84, 0.26, 0.42], [0.06, 0.05, 0.05], C.negro),
]

const oficialCabeza = ({ abre = 0.55, mira = [0, 0] } = {}) =>
  OF_CABEZA.formas([
    el([0.15, 0.6, 0], [0.68, 0.64, 0.62], PARDA, { pinta: ([x, y]) => (x > 0.25 && y > 0.6 && y < 0.67 ? PARDA[2] : null) }),
    ...pico(),
    ...ambos((s) => ojo(s, { abre, plumaje: PARDA, mira })).flat(),
    ...gafasDePasta(),
    ...audifonos(),
    el([0.0, 1.18, 0], [0.3, 0.14, 0.2], PARDA, { rot: [0, 0, 30] }),
  ])

const oficialTronco = (cabeza) => [
  el([0, -0.85, 0], [0.82, 0.7, 1.0], CAQUI, {
    pinta: ([x, y, z]) => {
      if (x < 0.3) return null
      for (const s of [1, -1]) {
        const dz = s * z
        if (dz > 0.2 && dz < 0.52 && y < -0.42 && y > -0.74) {
          if (y > -0.5) return CAQUI[2]
          if (dz < 0.23 || dz > 0.49 || y < -0.71) return CAQUI[2]
        }
      }
      if (z > 0.2 && z < 0.5 && y > -0.38 && y < -0.3) return '#1a1c22'
      return null
    },
  }),
  ...ambos((s) => el([-0.02, -0.38, s * 0.78], [0.36, 0.08, 0.24], C.negro, { pinta: ([x]) => (x > 0.2 ? C.oro : null) })),
  el([0.1, 0, 0], [0.46, 0.5, 0.48], PARDA),
  el([0.12, -0.18, 0], [0.5, 0.12, 0.52], CAQUI),
  hueso([0.6, -0.22, 0], [0.8, -0.62, 0], 0.065, NAVAL),
  ...cabeza,
]

// Tableta sostenida con la mano izquierda, de pantalla azul.
const tableta = (mano, inclina = 0) => {
  const [x, y, z] = mano
  const a = (inclina * Math.PI) / 180
  const pts = [[x - 0.05, y - 0.22, z + 0.05], [x - 0.05, y - 0.22, z + 0.6], [x - 0.05 + 0.3 * Math.cos(a), y + 0.25, z + 0.6], [x - 0.05 + 0.3 * Math.cos(a), y + 0.25, z + 0.05]]
  return [placa(pts, 0.05, C.negro, { pinta: ([, py, pz]) => (py > y - 0.18 && py < y + 0.21 && pz > z + 0.1 && pz < z + 0.55 ? (py > y + 0.14 ? '#d8282c' : '#3a7ad8') : null) })]
}

export const pOficial = {
  pivote: [0, -1.35, 0],
  hombro: [0, -0.45, 0.88],
  cadera: [0, -1.35, 0.4],
  suelo: -2.3,
  sombra: [0.95, 0.75],
  brazo: { L1: 0.44, L2: 0.42, g1: 0.14, g2: 0.13, manga: CAQUI },
  dobla: (s) => [-1, 0, s * 0.4],
  pierna: { adelante: 0.15, A: 0.25, alto: 0.15, grosor: 0.065, pie: [0.24, 0.06, 0.17] },
  andar: { balanceo: 3, sube: 0.04 },
  braceo: 0.2,
  reposo: (s) => [0.05, -1.2, s * 1.22],
  mano: (b) => [el(b.mano, [0.12, 0.11, 0.11], PARDA)],
}

const LEE = [0.75, -0.6, -0.55]
const of = (cfg) => figura(pOficial, { sinSombra: true, ...cfg })
const conTableta = (cabeza, u, extra = {}) => of({ tronco: oficialTronco(cabeza), manos: { 1: pOficial.reposo(1), [-1]: LEE }, extra: tableta(LEE, 25), salto: 0.012 * Math.sin(u * Math.PI * 2), ...extra })

// Gota de sudor que cae por la sien.
const gota = (k) => {
  const p = OF_CABEZA.punto([0.45, 1.02 - 0.5 * k, 0.55])
  return [el(p, [0.07, 0.11, 0.07], C.vidrio, { flat: '#7ac8f4', brilla: true })]
}

export const OFICIAL = {
  nombre: 'El oficial de inteligencia',
  papel: 'Lee los informes en voz alta',
  bajada: 'Camisa caqui, tableta, audífonos y gafas de pasta',
  detalle: 'Joven, pardo y sin la menor expresión: contesta cada pregunta con la misma voz, leyendo de su tableta. Camisa caqui con bolsillos, corbata azul, gafas rectangulares de pasta y audífonos con micrófono. Cuando el almirante dice «a los cuatro que están disponibles», no le queda nada que leer: se queda callado y le cae una gota de sudor.',
  quieto: (u) => conTableta(oficialCabeza({ abre: u > 0.8 && u < 0.92 ? 0 : 0.55, mira: [0, -0.02] }), u),
  hablando: (u) => conTableta(hablar(oficialCabeza({ mira: [0, -0.02] }), silaba(u) * 0.6), u),
  gestos: [
    { nombre: 'lee el informe', pose: (u) => conTableta(hablar(oficialCabeza({ mira: [0, -0.03] }), silaba(u) * 0.6), u) },
    {
      nombre: 'señala la pantalla',
      pose: (u) => {
        const g = curva(u)
        return of({ tronco: hablar(oficialTronco(oficialCabeza({ mira: [0.03 * g, 0] })), silaba(u) * 0.5 * g), manos: { 1: lerp(pOficial.reposo(1), [0.7, 0.25 + 0.04 * vaiven(u, 2) * g, 1.6], g), [-1]: LEE }, extra: tableta(LEE, 25) })
      },
    },
    {
      nombre: 'se queda callado',
      pose: (u) => conTableta(oficialCabeza({ abre: u > 0.45 && u < 0.6 ? 0 : 0.7, mira: [0, 0] }), u, { extra: [...tableta(LEE, 25), ...gota(suave(u / 0.9))] }),
    },
  ],
}

// ── Los marineros de cubierta ────────────────────────────────────────────

// Patos pekineses con el chaleco y el casco del color de su oficio en la
// cubierta: amarillo dirige, morado carga combustible, rojo arma y verde
// opera las catapultas. Casco con orejeras y antiparras sobre la frente.
export const OFICIOS = {
  amarillo: { nombre: 'amarillo', oficio: 'dirige los aviones', color: ['#fff09a', '#f8d020', '#c89a00', '#7a5c00'] },
  morado: { nombre: 'morado', oficio: 'carga combustible', color: ['#d4b0f4', '#9050d8', '#62309c', '#36185a'] },
  rojo: { nombre: 'rojo', oficio: 'carga las armas', color: C.bermellon },
  verde: { nombre: 'verde', oficio: 'opera las catapultas', color: C.verde },
}

const MAR_CABEZA = transformar([0, 0, 8], [0.1, 0.1, 0])

const marineroTronco = (color) => [
  el([0, -0.85, 0], [0.86, 0.7, 1.04], color, { pinta: ([x, y]) => (Math.abs(y + 0.62) < 0.05 || Math.abs(y + 1.0) < 0.05 ? (x > -0.2 ? '#eef6f4' : null) : null) }),
  el([0.1, 0, 0], [0.48, 0.5, 0.5], PEKIN),
  ...MAR_CABEZA.formas([
    el([0.15, 0.6, 0], [0.68, 0.64, 0.64], PEKIN),
    ...pico(),
    ...ambos((s) => ojo(s, { abre: 1, plumaje: PEKIN, grande: 1.25 })).flat(),
    el([0.08, 0.98, 0], [0.62, 0.36, 0.62], color),
    ...ambos((s) => el([0.12, 0.66, s * 0.64], [0.2, 0.24, 0.1], PIEL_OREJERA)),
    ...ambos((s) => el([0.6, 1.06, s * 0.2], [0.08, 0.1, 0.13], C.oscuro, { flat: '#24303c' })),
    hueso([0.62, 1.06, -0.08], [0.62, 1.06, 0.08], 0.04, C.oscuro),
  ]),
]

const pMarinero = (color) => ({
  pivote: [0, -1.35, 0],
  hombro: [0, -0.42, 0.92],
  cadera: [0, -1.35, 0.42],
  suelo: -2.3,
  sombra: [1.0, 0.8],
  brazo: { L1: 0.46, L2: 0.44, g1: 0.15, g2: 0.13, manga: color },
  dobla: (s) => [-1, 0, s * 0.4],
  pierna: { adelante: 0.15, A: 0.45, alto: 0.35, grosor: 0.07, pie: [0.26, 0.06, 0.18] },
  andar: { balanceo: 9, sube: 0.12, giro: 8 },
  braceo: 0.5,
  reposo: (s) => [0.08, -1.1, s * 1.3],
  mano: (b) => [el(b.mano, [0.13, 0.12, 0.12], PEKIN)],
})

// Corre en pánico: los brazos arriba, agitándose al revés que los pies.
export const corre = (oficio, fase, cfg = {}) => {
  const p = pMarinero(oficio.color)
  const φ = fase * Math.PI * 2
  const manos = { 1: [0.3 + 0.3 * Math.cos(φ), 0.3 + 0.25 * Math.sin(φ), 1.25], [-1]: [0.3 - 0.3 * Math.cos(φ), 0.3 - 0.25 * Math.sin(φ), -1.25] }
  return figura(p, { tronco: marineroTronco(oficio.color), manos, fase: fase * 2, inclina: -10, ...cfg })
}

export const MARINEROS = {
  nombre: 'Los marineros de cubierta',
  papel: 'La tripulación del Sitting Ducks',
  bajada: 'Patos pekineses con chaleco y casco del color de su oficio',
  detalle: 'Los colores son los de una cubierta real: amarillo dirige los aviones, morado carga combustible, rojo arma y verde opera las catapultas. Casco con orejeras y antiparras sobre la frente, bandas reflectantes en el chaleco. Cuando suenan las alarmas corren de un lado a otro con los brazos en alto, sin ir a ninguna parte en particular.',
  corre,
  gestos: [
    {
      nombre: 'amarillo · agita los brazos',
      oficio: OFICIOS.amarillo,
      pose: (u) => {
        const p = pMarinero(OFICIOS.amarillo.color)
        const a = vaiven(u, 2)
        return figura(p, { tronco: marineroTronco(OFICIOS.amarillo.color), manos: { 1: [0.4, 0.75 + 0.15 * a, 0.6 + 0.6 * a], [-1]: [0.4, 0.75 - 0.15 * a, -0.6 + 0.6 * a] }, salto: 0.1 * Math.abs(a) })
      },
    },
    {
      nombre: 'morado · se tapa los oídos',
      oficio: OFICIOS.morado,
      pose: (u) => {
        const p = { ...pMarinero(OFICIOS.morado.color), dobla: (s) => [0, -1, s * 0.6] }
        return figura(p, { tronco: marineroTronco(OFICIOS.morado.color), manos: { 1: MAR_CABEZA.punto([0.14, 0.66, 0.8]), [-1]: MAR_CABEZA.punto([0.14, 0.66, -0.8]) }, salto: 0.15 * Math.abs(vaiven(u, 2)), inclina: 6 * vaiven(u, 1) })
      },
    },
    { nombre: 'rojo · corre', oficio: OFICIOS.rojo, pose: (u) => corre(OFICIOS.rojo, u) },
    { nombre: 'verde · corre', oficio: OFICIOS.verde, pose: (u) => corre(OFICIOS.verde, u) },
  ],
}

export { almiranteTronco, almiranteCabeza, oficialTronco, oficialCabeza, conTableta, gota, tableta, LEE, hablar, manosAndando, MANOS_ATRAS, SENTADO, pMarinero, marineroTronco }
