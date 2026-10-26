// Los lugares de la escena 1, en metros: el mar, el portaaviones Sitting
// Ducks con su cubierta, la escolta y la sala de mando de la isla, con la
// pantalla de las bajas. Proa hacia +x, arriba +y, estribor hacia +z.

import { el, placa, tubo, transformar } from '../pilotos/tres.mjs'
import { RAMPAS as C, hueso, ambos, disco } from '../pilotos/modelos.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const res = (a, b) => a.map((v, i) => v - b[i])
const esc = (a, k) => a.map((v) => v * k)

// ── Colocar figuras ──────────────────────────────────────────────────────

// Lleva formas de unidades de pato (pisan en -2.3) a metros: escala k, gira
// `giro` grados alrededor del eje vertical y las pone de pie en `en`.
export const colocar = (formas, { k, giro = 0, en, suelo = -2.3 }) => {
  const o = [0, suelo, 0]
  const ida = (p) => esc(res(p, o), k)
  const vuelta = (p) => sum(esc(p, 1 / k), o)
  const escaladas = formas.map((f) => {
    const g = f.k === 'e' ? { ...f, c: ida(f.c), r: esc(f.r, k) } : { ...f, centro: ida(f.centro), radio: f.radio * k, tris: f.tris.map((t) => ({ ...t, a: ida(t.a), b: ida(t.b), c: ida(t.c) })) }
    if (f.pinta) g.pinta = (p, n) => f.pinta(vuelta(p), n)
    return g
  })
  return transformar([0, giro, 0], [0, 0, 0], en).formas(escaladas)
}

export const poner = (formas, giro, en) => transformar([0, giro, 0], [0, 0, 0], en).formas(formas)

// ── Letras de cuadritos ──────────────────────────────────────────────────

// Lo que va pintado en el barco: el 15 y su nombre. Cuatro de ancho y cinco de alto.
const LETRAS = {
  1: ['.#..', '##..', '.#..', '.#..', '###.'],
  5: ['####', '#...', '###.', '...#', '###.'],
  S: ['.###', '#...', '.##.', '...#', '###.'],
  I: ['###.', '.#..', '.#..', '.#..', '###.'],
  T: ['###.', '.#..', '.#..', '.#..', '.#..'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  G: ['.###', '#...', '#.##', '#..#', '.###'],
  D: ['###.', '#..#', '#..#', '#..#', '###.'],
  U: ['#..#', '#..#', '#..#', '#..#', '.##.'],
  C: ['.###', '#...', '#...', '#...', '.###'],
  K: ['#..#', '#.#.', '##..', '#.#.', '#..#'],
  ' ': ['....', '....', '....', '....', '....'],
}
// ¿Cae (u, v) en el texto de `alto` de alto? Empieza en u = 0, v = 0 abajo.
const enTexto = (texto, u, v, alto) => {
  const celda = alto / 5
  const i = Math.floor(u / celda)
  const j = Math.floor((alto - v) / celda)
  const letra = LETRAS[texto[Math.floor(i / 5)]]
  return Boolean(letra && i >= 0 && j >= 0 && j < 5 && i % 5 < 4 && letra[j][i % 5] === '#')
}
const ancho = (texto, alto) => ((texto.length * 5 - 1) * alto) / 5

// ── El mar ───────────────────────────────────────────────────────────────

// Un plano: una esfera tan grande pierde precisión al cortarla.
export const MAR = placa([[-60000, 0, -60000], [-60000, 0, 60000], [60000, 0, 60000], [60000, 0, -60000]], 0.2, C.azul, {
  pinta: ([x, , z]) => {
    const lejos = Math.hypot(x, z)
    const ola = Math.sin(x / 7 + Math.sin(z / 19) * 2) > 0.86
    return lejos > 2600 ? '#8cb0ea' : lejos > 1100 ? (ola ? '#86a8e2' : '#5f8ad6') : ola ? '#5c86d0' : '#3a68b8'
  },
})

// Espuma de proa: el barco abre el mar al avanzar.
const espuma = (x, z, largo) => [el([x, 0.3, z], [largo, 0.8, largo * 0.35], C.nube, { flat: '#eef4ff' }), ...ambos((s) => el([x - largo * 2, 0.2, z + s * largo * 0.6], [largo * 1.6, 0.5, largo * 0.25], C.nube, { flat: '#d8e4fa' }))]

// ── El portaaviones ──────────────────────────────────────────────────────

const CASCO = ['#c4ccd6', '#96a2ae', '#6c7884', '#3c4650']
const CUBIERTA = ['#6a7078', '#4c525a', '#3a3f46', '#22262b']
const ISLA = ['#d0d8e0', '#a4b0bc', '#7a8692', '#46505a']
const AMARILLO = '#f2c440'


// El nombre va a los dos costados, bajo la cubierta y a proa de la isla, y se lee de afuera.
export const NOMBRE = { texto: 'SITTING DUCKS', x: 40 }

const casco = tubo(
  [
    [-158, 36, 21, 8.5, 6],
    [-120, 40, 21, 8.5, 6],
    [80, 40, 21, 8.5, 6],
    [125, 30, 21, 9, 5],
    [150, 16, 20, 10, 4],
    [163, 3, 18, 11, 3],
  ],
  CASCO,
  {
    pinta: ([x, y, z]) => {
      if (x > 124 && x < 146 && y > 7 && y < 18 && enTexto('15', z > 0 ? x - 124 : 146 - x, y - 7, 10)) return '#f4f4ee'
      if (x > NOMBRE.x && x < NOMBRE.x + ancho(NOMBRE.texto, 4) && y > 4 && y < 8 && enTexto(NOMBRE.texto, z > 0 ? x - NOMBRE.x : NOMBRE.x + ancho(NOMBRE.texto, 4) - x, y - 4, 4)) return '#f4f4ee'
      if (y > 12 && y < 17 && ((x > -60 && x < -35) || (x > 15 && x < 40))) return '#2a3036'
      return null
    },
  },
)

// Pista en ángulo hacia babor, con su eje a trazos y sus bordes; catapultas de proa en amarillo; el 15 en la proa.
const pintaCubierta = ([x, y, z]) => {
  if (y < 20.3) return null
  const d = (x + 150) * 0.156 + (z + 12) * 0.988
  if (x < 70 && Math.abs(d) < 0.5 && Math.floor(x / 8) % 2 === 0) return '#f4f4ee'
  if (x < 70 && x > -150 && Math.abs(Math.abs(d) - 12) < 0.4) return '#f4f4ee'
  if (x > 40 && (Math.abs(z - 8) < 0.35 || Math.abs(z + 6) < 0.35)) return AMARILLO
  if (x > 126 && x < 150 && Math.abs(z) < 9 && enTexto('15', z + 9, 150 - x, 10)) return '#f4f4ee'
  return null
}

const cubierta = [
  placa([[-160, 20, -19], [-160, 20, 22], [150, 20, 22], [166, 20, 6], [166, 20, -6], [150, 20, -19]], 1.6, CUBIERTA, { pinta: pintaCubierta }),
  placa([[-150, 20, -19], [-40, 20, -36], [40, 20, -36], [70, 20, -19]], 1.6, CUBIERTA, { pinta: pintaCubierta }),
]

const caja = (x0, x1, ancho, alto, yc, zc, rampa, o) => tubo([[x0, ancho, alto, yc, 8, zc], [x1, ancho, alto, yc, 8, zc]], rampa, o)

// La isla, a estribor: el puente de mando con sus ventanales y, arriba, las
// balizas de alarma. Va sobre un saliente de la cubierta que el casco sostiene
// desde el agua, como en un Nimitz: sin él, la isla quedaba en el aire.
const isla = (alarma) => [
  caja(-46, -4, 14, 19, 10.5, 26, CASCO),
  placa([[-46, 20, 21], [-46, 20, 33], [-4, 20, 33], [-4, 20, 21]], 1.6, CUBIERTA),
  caja(-40, -10, 9, 18, 29.5, 27, ISLA),
  caja(-43, -13, 11, 6, 41, 27, ISLA, { pinta: ([x, y, z]) => (y > 39.6 && y < 42.8 && (z < 22 || x > -13.6 || z > 32) ? (Math.abs((x + z) % 2.2) < 0.3 ? ISLA[3] : '#1b2a3a') : null) }),
  caja(-37, -20, 7, 8, 48, 27, ISLA),
  hueso([-28, 52, 27], [-28, 68, 27], 0.6, ISLA),
  hueso([-28, 63, 22], [-28, 63, 32], 0.35, ISLA),
  el([-22, 54, 27], [2.2, 2.2, 2.2], C.nube),
  ...[23.5, 30.5].map((z, i) => el([-34, 53, z], [1.1, 1.1, 1.1], C.boca, alarma === i ? { flat: '#ff3a2a', brilla: true } : { flat: '#6a1a14' })),
]

// Caza estacionado: un dardo gris con ala en delta y deriva.
const jet = (x, z, giro) =>
  poner(
    [
      tubo([[-8, 1.8, 1.8, 1.8], [5, 2.0, 2.2, 2.0], [9, 0.3, 0.5, 1.8]], CASCO),
      placa([[-6, 1.8, -6], [2, 1.8, -1], [2, 1.8, 1], [-6, 1.8, 6]], 0.3, CASCO),
      placa([[-8, 2.4, 0], [-4, 2.4, 0], [-7, 6, 0]], 0.3, CASCO),
    ],
    giro,
    [x, 20.8, z],
  )

const AVION_BLANCO = ['#ffffff', '#e4e8ee', '#b8c0cc', '#7a8494']

// El avión de mantenimiento: un turbohélice con el capó del motor abierto,
// la escalera puesta y el tractor amarillo enganchado, atravesado en la pista.
const mantenimiento = () => [
  tubo([[-9, 2.6, 2.8, 2.6], [5, 3, 3.2, 2.7], [8, 1.6, 2, 2.7], [-12, 1, 1.2, 3.4]], AVION_BLANCO, { pinta: ([x]) => (Math.abs(x + 2) < 0.6 || Math.abs(x - 3) < 0.6 ? '#ff7a1a' : null) }),
  placa([[0, 4.4, -12.5], [3, 4.4, -12.5], [3, 4.4, 12.5], [0, 4.4, 12.5]], 0.35, AVION_BLANCO, { pinta: ([, , z]) => (Math.abs(z) > 11 ? '#ff7a1a' : null) }),
  ...ambos((s) => [el([3.2, 4, s * 4.5], [2.6, 0.8, 0.8], AVION_BLANCO), disco([5.9, 4, s * 4.5], [1, 0, 0], 2.2, 0.05, C.oscuro, { flat: '#5a626c' })]).flat(),
  placa([[1.5, 4.9, 3.8], [4.5, 4.9, 3.8], [4.5, 6.6, 4.8], [1.5, 6.6, 4.8]], 0.15, AVION_BLANCO),
  hueso([3.5, 0.2, 6.5], [3.4, 4.6, 4.6], 0.15, C.rayas),
  hueso([4.5, 0.2, 6.5], [4.4, 4.6, 4.6], 0.15, C.rayas),
  placa([[-12, 3.8, -4], [-10, 3.8, -4], [-10, 3.8, 4], [-12, 3.8, 4]], 0.25, AVION_BLANCO),
  ...ambos((s) => placa([[-12, 3.8, s * 4], [-10, 3.8, s * 4], [-11.5, 7.5, s * 4]], 0.25, AVION_BLANCO)),
  caja(9, 13, 2.6, 1.6, 1.0, 0, C.rayas),
  hueso([8, 0.9, 0], [9.2, 0.9, 0], 0.15, C.oscuro),
]

export const portaaviones = ({ alarma = -1, avion = true } = {}) => [
  casco,
  ...cubierta,
  ...isla(alarma),
  ...[[70, 14, 30], [90, 14, 30], [110, 14, 30], [-120, 15, -30], [-100, 15, -30]].flatMap(([x, z, g]) => jet(x, z, g)),
  ...(avion ? poner(mantenimiento(), 62, [30, 20.8, -24]) : []),
]

// Destructor de la escolta: casco largo y fino, superestructura y mástil.
export const destructor = () => [
  tubo([[-75, 16, 10, 3, 5], [40, 18, 10, 3, 5], [70, 8, 10, 4, 4], [80, 1, 9, 5, 3]], CASCO),
  caja(-30, 15, 12, 8, 12, 0, ISLA),
  caja(-10, 10, 9, 6, 19, 0, ISLA),
  hueso([0, 22, 0], [0, 34, 0], 0.5, ISLA),
]

export const navegando = (formas, giro, en, rumbo) => [...poner(formas, giro, en), ...(rumbo ? espuma(en[0] + rumbo[0], en[2] + rumbo[1], rumbo[2]) : [])]

// ── La sala de mando ─────────────────────────────────────────────────────

// Sala de 8 × 10 m bajo el puente: la pantalla de las bajas al frente (x = 4),
// los ventanales a estribor (z = 5), consolas a babor y la puerta al fondo.
const SALA = ['#c4ccd4', '#98a4b0', '#74808c', '#48525c']
const SUELO = ['#7a8694', '#56606c', '#3e4650', '#262c32']
const CONSOLA = ['#7c8794', '#4e5864', '#3a424c', '#20252b']

export const PANTALLA = { x: 3.94, y0: 1.0, y1: 2.75, z0: -2.5, z1: 2.5 }

// Foto de un pato con su cruz roja; (u, v) de 0 a 1 dentro de la foto.
const fotoPato = (u, v, i) => {
  const fondo = ['#cfd8de', '#d8d0c4', '#c8d4cc'][i % 3]
  const x = (u - 0.5) * 1.7
  const y = v - 0.5
  if (u < 0.04 || u > 0.96 || v < 0.06 || v > 0.94) return '#f4f4ee'
  if (Math.abs(u - v) < 0.06 || Math.abs(u + v - 1) < 0.06) return '#e0201c'
  if (Math.hypot(x + 0.05, y - 0.08) < 0.26) return Math.hypot(x + 0.0, y - 0.14) < 0.05 ? '#101418' : '#2a8a4a'
  if (Math.hypot((x - 0.3) / 1.8, y - 0.02) < 0.07) return '#f6b23a'
  if (y < -0.18 && y > -0.24 && Math.abs(x) < 0.3) return '#ffffff'
  if (y < -0.24 && Math.abs(x) < 0.45 - (y + 0.24) * -0.4) return '#8a6a4a'
  return fondo
}

// El cursor de flecha, cuadro a cuadro: # borde, o relleno.
const FLECHA = ['#...........', '##..........', '#o#.........', '#oo#........', '#ooo#.......', '#oooo#......', '#ooooo#.....', '#oooooo#....', '#ooooooo#...', '#oooooooo#..', '#ooooo#####.', '#oo#oo#.....', '#o#.#oo#....', '##..#oo#....', '#....#oo#...', '.....#oo#...', '......##....']

const grano = (u, v) => ((Math.sin(u * 913.7 + v * 377.1) * 43758.5) % 1 + 1) % 1

const pintaPantalla = (estado) => ([, y, z]) => {
  const { y0, y1, z0, z1 } = PANTALLA
  const u = (z - z0) / (z1 - z0)
  const v = (y - y0) / (y1 - y0)
  if (u < 0.015 || u > 0.985 || v < 0.03 || v > 0.97) return '#16191e'
  const ancho = z1 - z0
  const alto = y1 - y0
  if (estado === 'bajas') {
    if (v > 0.84) return '#c8201c'
    const col = Math.floor(((u - 0.03) / 0.94) * 5)
    const fil = Math.floor(((0.82 - v) / 0.76) * 3)
    if (col < 0 || col > 4 || fil < 0 || fil > 2) return '#0e1a2a'
    const cu = ((u - 0.03) / 0.94) * 5 - col
    const cv = 1 - (((0.82 - v) / 0.76) * 3 - fil)
    if (cu < 0.06 || cu > 0.94 || cv < 0.08 || cv > 0.92) return '#0e1a2a'
    return fotoPato((cu - 0.06) / 0.88, (cv - 0.08) / 0.84, col + fil * 5)
  }
  // El atacante: una foto granulada al centro con esquinas rojas de objetivo.
  const cu = (u - 0.5) * ancho
  const cv = (v - 0.5) * alto
  const [mx, my] = [0.95, 0.7]
  if (Math.abs(cu) > mx || Math.abs(cv) > my) {
    const esquina = Math.abs(cu) > mx && Math.abs(cu) < mx + 0.08 && Math.abs(cv) > my - 0.25 && Math.abs(cv) < my + 0.08
    const esquina2 = Math.abs(cv) > my && Math.abs(cv) < my + 0.08 && Math.abs(cu) > mx - 0.25 && Math.abs(cu) < mx + 0.08
    return esquina || esquina2 ? '#e0201c' : '#0e1a2a'
  }
  const ruido = grano(Math.round(cu * 30), Math.round(cv * 30))
  const fondo = ruido > 0.6 ? '#9aa8a0' : ruido > 0.25 ? '#7e8c84' : '#6a7870'
  if (estado === 'cursor') {
    const celda = 0.075
    const i = Math.floor((cu + 0.3) / celda)
    const j = Math.floor((0.62 - cv) / celda)
    const c = FLECHA[j]?.[i]
    return c === '#' ? '#0c0e12' : c === 'o' ? '#ffffff' : fondo
  }
  const r = Math.hypot(cu / 0.42, (cv + 0.02) / 0.58)
  if (r > 1) return fondo
  const giro = Math.atan2(cv, cu)
  const surco = Math.sin(r * 34 + Math.sin(giro * 2 + r * 3) * 1.4)
  return surco > 0.15 ? '#2a1e18' : '#c8bca8'
}

// La vista por los ventanales: cielo, horizonte, mar con olas y la escolta.
const vista = (x, y) => {
  const panel = [[-3.3, -1.15], [-1.05, 1.05], [1.15, 3.3]].find(([a, b]) => x > a && x < b)
  if (!panel || y < 1.05 || y > 2.55) return null
  if (x - panel[0] < 0.06 || panel[1] - x < 0.06 || y < 1.11 || y > 2.49) return '#2a3036'
  const horizonte = 1.72
  if (y > horizonte) {
    const nube = Math.hypot((x + 1.8) / 0.5, (y - 2.25) / 0.08) < 1 || Math.hypot((x - 1.6) / 0.6, (y - 2.15) / 0.07) < 1
    return nube ? '#f3f6fc' : '#5c94fc'
  }
  const barco = [[-2.4, 0.5], [0.3, 0.35], [2.3, 0.6]].some(([bx, l]) => Math.abs(x - bx) < l && y > horizonte - 0.002 && y < horizonte + (Math.abs(x - bx) < l * 0.3 ? 0.07 : 0.03))
  if (barco) return '#7d8a97'
  const ola = Math.sin(x * 40 + Math.sin(y * 90) * 2) > 0.8
  return y > horizonte - 0.12 ? '#8cb0ea' : ola ? '#5c86d0' : '#3a68b8'
}

// Consola de babor con radar verde y pantallitas.
const consola = (x0, x1) => [
  caja(x0, x1, 0.8, 1.0, 0.5, -4.55, CONSOLA),
  placa([[x0, 1.0, -4.15], [x1, 1.0, -4.15], [x1, 1.6, -4.85], [x0, 1.6, -4.85]], 0.06, CONSOLA, {
    pinta: ([x, y]) => {
      const cx = (x0 + x1) / 2
      const r = Math.hypot((x - cx) / 0.6, (y - 1.3) / 0.22)
      if (r < 1) return r > 0.92 || Math.abs(x - cx) < 0.02 ? '#7dffa0' : r < 0.3 && x > cx ? '#3ad070' : '#123a24'
      return Math.abs(x - cx) > 0.7 && Math.abs(x - cx) < 0.95 && y > 1.12 && y < 1.5 ? (Math.floor(y * 30) % 2 ? '#3a7ad8' : '#1a2a4a') : null
    },
  }),
]

// La baliza de alarma del techo gira: en cada cuadro alumbra un lado.
const baliza = (prendida) => [hueso([3.2, 3.0, -4.3], [3.2, 2.82, -4.3], 0.08, C.oscuro), el([3.2, 2.72, -4.3], [0.14, 0.14, 0.14], C.boca, prendida ? { flat: '#ff3a2a', brilla: true } : { flat: '#7a1a14' })]

export const sala = ({ pantalla = 'bajas', alarma = false } = {}) => [
  placa([[-4, 0, -5], [-4, 0, 5], [4, 0, 5], [4, 0, -5]], 0.1, SUELO, { pinta: ([x, , z]) => (Math.abs(((x + 40) % 1) - 0.5) > 0.48 || Math.abs(((z + 50) % 1) - 0.5) > 0.48 ? SUELO[2] : null) }),
  placa([[-4, 3, -5], [-4, 3, 5], [4, 3, 5], [4, 3, -5]], 0.1, SALA, { pinta: ([x, , z]) => (Math.abs(z) < 3.5 && [-2, 0.5, 3].some((cx) => Math.abs(x - cx) < 0.25) ? '#fbfcf4' : null) }),
  placa([[4, 0, -5], [4, 0, 5], [4, 3, 5], [4, 3, -5]], 0.1, SALA),
  placa([[PANTALLA.x, PANTALLA.y0, PANTALLA.z0], [PANTALLA.x, PANTALLA.y0, PANTALLA.z1], [PANTALLA.x, PANTALLA.y1, PANTALLA.z1], [PANTALLA.x, PANTALLA.y1, PANTALLA.z0]], 0.04, C.oscuro, { pinta: pintaPantalla(pantalla), brilla: true }),
  placa([[-4, 0, 5], [4, 0, 5], [4, 3, 5], [-4, 3, 5]], 0.1, SALA, { pinta: ([x, y]) => vista(x, y) }),
  placa([[-4, 0, -5], [4, 0, -5], [4, 3, -5], [-4, 3, -5]], 0.1, SALA),
  placa([[-4, 0, -5], [-4, 0, 5], [-4, 3, 5], [-4, 3, -5]], 0.1, SALA, {
    pinta: ([, y, z]) => {
      if (z > 2 && z < 3.2 && y < 2.2) return z > 3.05 && y > 1.0 && y < 1.15 ? AMARILLO : Math.abs(y - 1.6) < 0.25 && Math.abs(z - 2.6) < 0.2 ? '#1b2a3a' : '#5c6874'
      if (z > -3 && z < 0.6 && y > 1.1 && y < 2.4) return z < -2.95 || z > 0.55 || y < 1.15 || y > 2.35 ? '#2a3036' : Math.sin(z * 12 + y * 4) > 0.9 ? '#2c4cb0' : (z + 1) ** 2 + (y - 1.7) ** 2 < 0.2 ? '#d8c89a' : '#9ec4e8'
      return null
    },
  }),
  ...consola(-2.6, -0.6),
  ...consola(0.2, 2.2),
  caja(1.3, 1.75, 2.6, 0.85, 0.42, -0.6, CONSOLA, { pinta: ([, y]) => (y > 0.83 ? '#1a2a4a' : null) }),
  ...baliza(alarma),
]
