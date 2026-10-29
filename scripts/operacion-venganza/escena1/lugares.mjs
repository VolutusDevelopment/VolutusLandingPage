// Los lugares de la escena 1, en metros: el mar, el portaaviones Sitting
// Ducks con su cubierta, la escolta y la sala de mando de la isla, con la
// pantalla de las bajas. Proa hacia +x, arriba +y, estribor hacia +z.

import { el, forro, placa, tubo, transformar } from '../pilotos/tres.mjs'
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

// Lo que va pintado en el barco, el 15 y su nombre, la operación en la
// pantalla de la sala (escena 2) y el sticker de la caja de duky (escena 15). Cuatro de ancho y cinco de alto; las que
// llevan tilde traen una fila más, encima.
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
  O: ['.##.', '#..#', '#..#', '#..#', '.##.'],
  Ó: ['..#.', '.##.', '#..#', '#..#', '#..#', '.##.'],
  P: ['###.', '#..#', '###.', '#...', '#...'],
  E: ['####', '#...', '###.', '#...', '####'],
  F: ['####', '#...', '###.', '#...', '#...'],
  L: ['#...', '#...', '#...', '#...', '####'],
  R: ['###.', '#..#', '###.', '#.#.', '#..#'],
  A: ['.##.', '#..#', '####', '#..#', '#..#'],
  B: ['###.', '#..#', '###.', '#..#', '###.'],
  Z: ['####', '...#', '.##.', '#...', '####'],
  ' ': ['....', '....', '....', '....', '....'],
}
// ¿Cae (u, v) en el texto de `alto` de alto? Empieza en u = 0, v = 0 abajo.
export const enTexto = (texto, u, v, alto) => {
  const celda = alto / 5
  const i = Math.floor(u / celda)
  const j = Math.floor((alto - v) / celda)
  const letra = LETRAS[texto[Math.floor(i / 5)]]
  const fila = letra && j + letra.length - 5
  return Boolean(letra && i >= 0 && fila >= 0 && fila < letra.length && i % 5 < 4 && letra[fila][i % 5] === '#')
}
export const ancho = (texto, alto) => ((texto.length * 5 - 1) * alto) / 5

// ── El atardecer ─────────────────────────────────────────────────────────

// La escena sigue a /nosotros, donde el sol queda a medio ponerse en el mar:
// aquí está igual, a la derecha de la flota que llega. `RUMBO` va de la proa
// (+x) hacia estribor (+z), y el disco mide lo mismo que allá.
const RUMBO = 0.28
export const SOL = [Math.cos(RUMBO), 0, Math.sin(RUMBO)]
const RADIO_DEL_SOL = 0.026

// Los colores de la puesta de /nosotros (src/lib/atardecer.js): el cielo va
// del oro del horizonte al coral, al lila y al azul de arriba, y la luz del
// sol lo enciende alrededor. Aquí se reparte en franjas, del color de la
// trama que quede más cerca.
const HORIZONTE = '#ffad5c'
const BAJO = '#f2967e'
const MEDIO = '#a79fd2'
const CENIT = '#5b8fd6'
const LUZ = '#ffb86b'
const DISCO = '#ffdfb3'

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const mezclar = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const entre = (a, b, v) => ((k) => k * k * (3 - 2 * k))(Math.min(1, Math.max(0, (v - a) / (b - a))))
const FRANJAS = [HORIZONTE, BAJO, '#cd9aa8', MEDIO, '#8197d4', CENIT].map((hex) => [hex, rgb(hex)])
const franja = (c) => FRANJAS.reduce((a, b) => (Math.hypot(...res(b[1], c)) < Math.hypot(...res(a[1], c)) ? b : a))[0]

// El color del cielo hacia `d`, un rayo de largo 1: las mismas mezclas que el
// cielo de /nosotros a medio ponerse el sol.
export const cielo = ([x, y, z]) => {
  const a = Math.acos(Math.min(1, x * SOL[0] + y * SOL[1] + z * SOL[2]))
  if (a < RADIO_DEL_SOL) return DISCO
  const alto = Math.max(0, y)
  let c = mezclar(rgb(HORIZONTE), rgb(BAJO), entre(0, 0.07, alto))
  c = mezclar(c, rgb(MEDIO), entre(0.04, 0.24, alto))
  c = mezclar(c, rgb(CENIT), entre(0.16, 0.62, alto))
  return franja(mezclar(c, rgb(LUZ), (0.5 * Math.exp(-a / 0.3) + 0.35 * Math.exp(-a / 0.07)) * (1 - entre(0, 0.5, alto))))
}

// ── El mar ───────────────────────────────────────────────────────────────

// El agua refleja el atardecer en tres franjas, del horizonte (0) a cerca
// (2): el coral al fondo, el lila y el azul hondo, con sus olas. En la estela
// del sol, las olas brillan: pareja al fondo y en destellos cerca.
const AGUA = [['#d9967f', '#d9967f'], ['#6f6c9e', '#9a86ae'], ['#2c3f74', '#4a5a92']]
const ESTELA = [[LUZ, LUZ], ['#d97a5e', LUZ], ['#2c3f74', '#ff8f3a']]
const agua = (franja, ola, estela) => (estela ? ESTELA : AGUA)[franja][ola ? 1 : 0]

// Un plano: una esfera tan grande pierde precisión al cortarla. La estela se
// abre desde el horizonte hacia quien mira desde el centro (la llegada).
export const MAR = placa([[-60000, 0, -60000], [-60000, 0, 60000], [60000, 0, 60000], [60000, 0, -60000]], 0.2, C.azul, {
  pinta: ([x, , z]) => {
    const lejos = Math.hypot(x, z)
    const estela = Math.abs(Math.atan2(z, x) - RUMBO) < 0.02 + 3 / lejos
    const ola = estela ? Math.sin(x / 2.3 + Math.sin(z / 5) * 3) * Math.sin(z / 3.1 + x / 9) > 0.35 : Math.sin(x / 7 + Math.sin(z / 19) * 2) > 0.86
    return agua(lejos > 1100 ? 0 : lejos > 300 ? 1 : 2, ola, estela)
  },
})

// Espuma de proa: el barco abre el mar al avanzar.
const espuma = (x, z, largo) => [el([x, 0.3, z], [largo, 0.8, largo * 0.35], C.nube, { flat: '#eef4ff' }), ...ambos((s) => el([x - largo * 2, 0.2, z + s * largo * 0.6], [largo * 1.6, 0.5, largo * 0.25], C.nube, { flat: '#d8e4fa' }))]

// ── El portaaviones ──────────────────────────────────────────────────────

const CASCO = ['#c4ccd6', '#96a2ae', '#6c7884', '#3c4650']
const CUBIERTA = ['#6a7078', '#4c525a', '#3a3f46', '#22262b']
const ISLA = ['#d0d8e0', '#a4b0bc', '#7a8692', '#46505a']
const AMARILLO = '#f2c440'


// El nombre va a los dos costados, bajo la cubierta y a proa de la isla, y en
// la popa; siempre se lee de afuera.
export const NOMBRE = { texto: 'SITTING DUCKS', x: 40 }
const POPA = { alto: 2.5, y: 10, z: -ancho(NOMBRE.texto, 2.5) / 2 }

// El ascensor de popa, a estribor detrás de la isla, como en un Nimitz: una
// plataforma por fuera del casco que sube del piso del hangar a la cubierta.
// El hangar va dentro del casco y se abre al ascensor por un portalón.
export const ASCENSOR = { x0: -88, x1: -64, z0: 22, z1: 38 }
export const HANGAR = { x0: -104, x1: -58, z0: -12, piso: 12, techo: 19.15, portalon: 18.4 }
const dentroDelHangar = ([x, y, z]) => x > HANGAR.x0 && x < HANGAR.x1 && y > HANGAR.piso - 0.05 && z > HANGAR.z0

// Las cuadernas del casco, de popa a proa: [x, manga en la flotación, manga
// bajo la cubierta], las dos a cada lado. Angosto en el agua, se abre hacia
// arriba hasta la cubierta, y en la proa más: corta el mar con la roda y se
// ensancha hasta la cubierta de las catapultas. Bajo el agua se recoge en la quilla.
const CUADERNAS = [
  [-158, 14, 17.5],
  [-135, 16.5, 18.6],
  [-100, 17.8, 19],
  [70, 17.8, 19],
  [105, 15.5, 18.8],
  [128, 10.5, 17],
  [148, 4.5, 13],
  [160, 1.2, 9],
  [166, 0.3, 6],
]
const BORDA = 19.2
const ALTOS = [-2, -0.6, 0, 2.5, 5, 7.5, 10, 12.5, 15, 17, BORDA]
const manga = (abajo, arriba, y) => (y < 0 ? abajo * (1 + y * 0.18) : abajo + (arriba - abajo) * (y / BORDA) ** 2)
// La manga del casco en (x, y), entre las dos cuadernas que la rodean.
const mangaEn = (x, y) => {
  const i = Math.max(1, CUADERNAS.findIndex(([cx]) => cx >= x))
  const [[x0, a0, b0], [x1, a1, b1]] = [CUADERNAS[i - 1], CUADERNAS[i]]
  const k = Math.min(1, Math.max(0, (x - x0) / (x1 - x0)))
  return manga(a0 + (a1 - a0) * k, b0 + (b1 - b0) * k, y)
}
const cuaderna = ([x, abajo, arriba]) => {
  const estribor = ALTOS.map((y) => [x, y, manga(abajo, arriba, y)])
  return [...estribor, ...estribor.toReversed().map(([, y, z]) => [x, y, -z])]
}

const casco = forro(
  CUADERNAS.map(cuaderna),
  CASCO,
  {
    pinta: ([x, y, z]) => {
      if (x > 124 && x < 146 && y > 7 && y < 18 && enTexto('15', z > 0 ? x - 124 : 146 - x, y - 7, 10)) return '#f4f4ee'
      if (x > NOMBRE.x && x < NOMBRE.x + ancho(NOMBRE.texto, 4) && y > 4 && y < 8 && enTexto(NOMBRE.texto, z > 0 ? x - NOMBRE.x : NOMBRE.x + ancho(NOMBRE.texto, 4) - x, y - 4, 4)) return '#f4f4ee'
      if (x < -157.5 && enTexto(NOMBRE.texto, z - POPA.z, y - POPA.y, POPA.alto)) return '#f4f4ee'
      if (y > 12 && y < 17 && x > 15 && x < 40) return '#2a3036'
      return null
    },
    // Donde va el hangar no hay casco: lo cubren sus paredes.
    hueco: dentroDelHangar,
  },
)

// Donde la cubierta vuela por fuera del casco, un faldón inclinado la une
// al costado, de `y` metros hacia arriba: de `a` a `b`, los dos [x, z] del
// borde de la cubierta, sobre el lado `s` (1 estribor, -1 babor).
const faldon = ([xa, za], [xb, zb], s, y = 8) => placa([[xa, BORDA, za], [xb, BORDA, zb], [xb, y, s * mangaEn(xb, y)], [xa, y, s * mangaEn(xa, y)]], 0.4, CASCO)

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

// La cubierta vuela por fuera del casco: a babor, bajo la pista en ángulo,
// los faldones la sostienen.
const cubierta = [
  placa([[-160, 20, -19], [-160, 20, 22], [150, 20, 22], [166, 20, 6], [166, 20, -6], [150, 20, -19]], 1.6, CUBIERTA, { pinta: pintaCubierta }),
  placa([[-150, 20, -19], [-40, 20, -36], [40, 20, -36], [70, 20, -19]], 1.6, CUBIERTA, { pinta: pintaCubierta }),
  faldon([-150, -19], [-40, -36], -1),
  faldon([-40, -36], [40, -36], -1),
  faldon([40, -36], [70, -19], -1),
]

const caja = (x0, x1, ancho, alto, yc, zc, rampa, o) => tubo([[x0, ancho, alto, yc, 8, zc], [x1, ancho, alto, yc, 8, zc]], rampa, o)

// Ventanales en la franja de `y0` a `y1`, con sus montantes.
const ventanales = (y0, y1, donde = () => true) => ([x, y, z]) => (y > y0 && y < y1 && donde(x, z) ? (Math.abs((x + z) % 2.2) < 0.3 ? ISLA[3] : '#1b2a3a') : null)

// Pasarela alrededor de un piso, con la baranda oscura en el borde.
const pasarela = (x0, x1, z0, z1, y) => placa([[x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0]], 0.3, ISLA, { pinta: ([x, , z]) => (Math.min(x - x0, x1 - x, z - z0, z1 - z) < 0.3 ? ISLA[3] : null) })

// Antena de radar plana, enrejada, que gira `giro` grados sobre su eje (x, z).
const enrejada = (p, n) => (Math.abs(n[1]) < 0.9 && (Math.abs((((p[1] + p[2]) * 1.6) % 1) - 0.5) < 0.12 || Math.abs(((p[1] * 1.6) % 1) - 0.5) < 0.12) ? ISLA[3] : null)
const radar = ([x, y, z], ancho, alto, giro) =>
  transformar([0, giro, 0], [x, 0, z]).formas([
    hueso([x, y - 1.6, z], [x, y, z], 0.35, ISLA),
    placa([[x, y, z - ancho / 2], [x, y, z + ancho / 2], [x - alto * 0.25, y + alto, z + ancho / 2], [x - alto * 0.25, y + alto, z - ancho / 2]], 0.3, ISLA, { pinta: enrejada }),
  ])

// El mástil, como el de un Nimitz: una columna enrejada que se angosta hacia
// arriba, con tres crucetas anchas, cada una con su baranda y sus antenas,
// domos en las puntas de la primera, una antena plana en la segunda y, en la
// punta, la antena con su luz.
const mastil = ([mx, mz]) => {
  const pies = [[-2.5, -2], [-2.5, 2], [2.5, -2], [2.5, 2]].map(([dx, dz]) => [mx + dx, 52, mz + dz])
  const punta = [mx, 74, mz]
  const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
  const cruceta = (y, largo) => [
    placa([[mx - 1.3, y, mz - largo], [mx - 1.3, y, mz + largo], [mx + 1.3, y, mz + largo], [mx + 1.3, y, mz - largo]], 0.35, ISLA, { pinta: ([x, , z]) => (Math.abs(x - mx) > 1 || Math.abs(z - mz) > largo - 0.3 ? ISLA[3] : null) }),
    ...[-0.85, -0.45, 0.45, 0.85].map((k) => hueso([mx, y, mz + k * largo], [mx, y + 1.8, mz + k * largo], 0.08, ISLA)),
  ]
  return [
    ...pies.map((p) => hueso(p, punta, 0.3, ISLA)),
    ...[0.25, 0.5, 0.75].flatMap((k) => pies.map((p, i) => hueso(lerp(p, punta, k), lerp(pies[[1, 3, 0, 2][i]], punta, k), 0.16, ISLA))),
    ...cruceta(58, 8.5),
    ...cruceta(64, 7),
    ...cruceta(69, 4.5),
    ...[-8.5, 8.5].map((dz) => el([mx, 59.2, mz + dz], [0.8, 0.8, 0.8], C.nube)),
    ...radar([mx + 2.4, 66, mz], 4, 1.2, 0),
    hueso(punta, [mx, 80, mz], 0.2, ISLA),
    el([mx, 80.2, mz], [0.35, 0.35, 0.35], C.boca, { flat: '#ff3a2a', brilla: true }),
  ]
}

// La isla, a estribor: el bloque con el 15 a los costados, el puente de mando
// con sus ventanales y pasarelas, el control de vuelo y, encima, el mástil,
// los domos de las antenas y las balizas de alarma. Detrás, en su propia
// torre, el radar de búsqueda aérea gira `giro` grados. Va sobre un saliente
// de la cubierta que un faldón une al casco, como en un Nimitz.
const QUINCE = { alto: 8, x: -25 - ancho('15', 8) / 2, y: 25 }
const isla = (alarma, giro) => [
  faldon([-56, 33], [-4, 33], 1),
  ...[-56, -4].map((x) => placa([[x, BORDA, 19], [x, BORDA, 33], [x, 8, mangaEn(x, 8)]], 0.4, CASCO)),
  placa([[-56, 20, 21], [-56, 20, 33], [-4, 20, 33], [-4, 20, 21]], 1.6, CUBIERTA),
  caja(-40, -10, 7.5, 18, 29.5, 27, ISLA, {
    pinta: ([x, y, z]) => (Math.abs(z - 27) > 3.5 && enTexto('15', z > 27 ? x - QUINCE.x : QUINCE.x + ancho('15', QUINCE.alto) - x, y - QUINCE.y, QUINCE.alto) ? '#f4f4ee' : null),
  }),
  pasarela(-41.5, -8.5, 21, 33, 34),
  caja(-43, -13, 9.5, 6, 41, 27, ISLA, { pinta: ventanales(39.6, 42.8, (x, z) => z < 22.6 || x > -13.6 || z > 31.4) }),
  pasarela(-39, -18, 23, 31, 44.3),
  caja(-37, -20, 6, 8, 48, 27, ISLA, { pinta: ventanales(46.4, 48.6) }),
  ...mastil([-28, 27]),
  el([-22, 54, 27], [2.2, 2.2, 2.2], C.nube),
  ...[23.8, 30.2].map((z) => el([-15.5, 45.3, z], [1.3, 1.3, 1.3], C.nube)),
  ...[[-36, 24], [-36, 30], [-21, 24]].map(([x, z]) => hueso([x, 52, z], [x - 1.2, 59, z + (z < 27 ? -1.2 : 1.2)], 0.07, ISLA)),
  ...[24.6, 29.4].map((z, i) => el([-34, 53, z], [1.1, 1.1, 1.1], C.boca, alarma === i ? { flat: '#ff3a2a', brilla: true } : { flat: '#6a1a14' })),
  caja(-54.5, -49.5, 4, 18, 29.8, 27, ISLA),
  pasarela(-56, -48, 24, 30, 39),
  caja(-53.5, -50.5, 2.6, 8, 43, 27, ISLA),
  pasarela(-55.5, -48.5, 24, 30, 47.1),
  el([-52, 48.6, 27], [1.4, 1.4, 1.4], C.nube),
  ...radar([-52, 51.6, 27], 7, 4.5, giro),
]

// Caza estacionado: un dardo gris con ala en delta y deriva.
const jet = (x, z, giro, y = 20.8) =>
  poner(
    [
      tubo([[-8, 1.8, 1.8, 1.8], [5, 2.0, 2.2, 2.0], [9, 0.3, 0.5, 1.8]], CASCO),
      placa([[-6, 1.8, -6], [2, 1.8, -1], [2, 1.8, 1], [-6, 1.8, 6]], 0.3, CASCO),
      placa([[-8, 2.4, 0], [-4, 2.4, 0], [-7, 6, 0]], 0.3, CASCO),
    ],
    giro,
    [x, y, z],
  )

// ── El hangar y el ascensor ──────────────────────────────────────────────

const PARED = ['#a8b0b8', '#7e8894', '#5e6874', '#363e48']
const PISO_GRIS = ['#8a949e', '#646e7a', '#4a525c', '#2c3238']
const conCostillas = ([x]) => (Math.abs(((x + 100) % 4) - 2) < 0.15 ? PARED[2] : null)

// La nave bajo la cubierta, con su piso a rayas, las luces del techo y dos
// cazas guardados. La pared de estribor es casco por fuera y hangar por
// dentro, con el portalón abierto al ascensor; el piso sale por él hasta la
// plataforma.
const hangar = () => {
  const { x0, x1, z0, piso, techo, portalon } = HANGAR
  const { x0: a0, x1: a1, z0: borde } = ASCENSOR
  const z1 = 19.05
  const costado = (pts) => placa(pts, 0.2, CASCO, { pinta: (p, n) => (n[2] < 0 ? conCostillas(p) ?? PARED : null) })
  return [
    placa([[x0, piso - 0.1, z0], [x0, piso - 0.1, borde], [x1, piso - 0.1, borde], [x1, piso - 0.1, z0]], 0.2, PISO_GRIS, {
      pinta: ([x, , z]) => (Math.abs(z - 15) < 0.1 || Math.abs(z + 6) < 0.1 ? AMARILLO : Math.hypot(((x + 100) % 3) - 1.5, ((z + 100) % 3) - 1.5) < 0.12 ? PISO_GRIS[3] : null),
    }),
    placa([[x0, techo, z0], [x0, techo, z1], [x1, techo, z1], [x1, techo, z0]], 0.1, PARED, { pinta: ([x, , z]) => (z < 16 && Math.abs(((x + 100) % 6) - 3) < 0.25 ? '#fbfcf4' : null) }),
    placa([[x0, piso, z0], [x1, piso, z0], [x1, techo, z0], [x0, techo, z0]], 0.2, PARED, { pinta: conCostillas }),
    ...[x0, x1].map((x) => placa([[x, piso, z0], [x, piso, z1], [x, techo, z1], [x, techo, z0]], 0.2, PARED)),
    costado([[x0, piso, z1], [a0, piso, z1], [a0, techo, z1], [x0, techo, z1]]),
    costado([[a1, piso, z1], [x1, piso, z1], [x1, techo, z1], [a1, techo, z1]]),
    costado([[a0, portalon, z1], [a1, portalon, z1], [a1, techo, z1], [a0, techo, z1]]),
    ...jet(-96, 2, -20, piso),
    ...jet(-70, -4, 160, piso),
  ]
}

// La plataforma del ascensor con su borde amarillo y negro, sus líneas y los
// anillos de amarre, entre dos guías pegadas al casco. Sube con `k`, de 0 (en
// el piso del hangar) a 1 (a ras de la cubierta). Mientras no está arriba,
// la baranda del borde de afuera está levantada.
const ascensor = (k) => {
  const { x0, x1, z0, z1 } = ASCENSOR
  const arriba = HANGAR.piso + (20.8 - HANGAR.piso) * k
  const pinta = ([x, y, z]) => {
    if (y < arriba - 0.1) return null
    if (Math.min(z1 - z, x - x0, x1 - x) < 0.6) return Math.floor((x + z) / 0.9) % 2 ? AMARILLO : '#1e2226'
    if (Math.abs(z - (z0 + z1) / 2) < 0.12 || Math.abs(x - (x0 + x1) / 2) < 0.12) return '#f4f4ee'
    return Math.hypot(((x + 100) % 2.5) - 1.25, ((z + 100) % 2.5) - 1.25) < 0.14 ? CUBIERTA[3] : null
  }
  const baranda = k < 0.98 ? [...Array.from({ length: 9 }, (_, i) => hueso([x0 + 1 + i * 2.75, arriba, z1 - 0.3], [x0 + 1 + i * 2.75, arriba + 1.1, z1 - 0.3], 0.06, C.rayas)), hueso([x0 + 1, arriba + 1.1, z1 - 0.3], [x1 - 1, arriba + 1.1, z1 - 0.3], 0.06, C.rayas)] : []
  return [
    placa([[x0, arriba - 0.6, z0], [x0, arriba - 0.6, z1], [x1, arriba - 0.6, z1], [x1, arriba - 0.6, z0]], 1.2, CUBIERTA, { pinta }),
    ...[x0 - 0.8, x1 + 0.8].map((x) => caja(x - 0.7, x + 0.7, 4, 9.4, 14.5, 20.4, CASCO)),
    ...baranda,
  ]
}

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

// `radar`: los grados que lleva girado el radar de la isla; `ascensor`: dónde
// va la plataforma, de 0 (en el hangar) a 1 (en la cubierta).
export const portaaviones = ({ alarma = -1, avion = true, radar = 0, ascensor: plataforma = 1 } = {}) => [
  casco,
  ...cubierta,
  ...isla(alarma, radar),
  ...hangar(),
  ...ascensor(plataforma),
  ...[[70, 14, 30], [90, 14, 30], [110, 14, 30]].flatMap(([x, z, g]) => jet(x, z, g)),
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
export const FLECHA = ['#...........', '##..........', '#o#.........', '#oo#........', '#ooo#.......', '#oooo#......', '#ooooo#.....', '#oooooo#....', '#ooooooo#...', '#oooooooo#..', '#ooooo#####.', '#oo#oo#.....', '#o#.#oo#....', '##..#oo#....', '#....#oo#...', '.....#oo#...', '......##....']

// La operación iniciada, en tres líneas al centro: su texto, su borde de abajo
// y su color. Con 'operacion', «INICIADA» se apaga: alternadas, parpadea.
const ALTO_DE_LETRA = 0.33
const OPERACION = [['OPERASIÓN', 2.172, '#ffad5c'], ['BENGANZA', 1.712, '#ffad5c'], ['INICIADA', 1.182, '#7dffa0']].map(([texto, abajo, color]) => ({ texto, abajo, color, medio: ancho(texto, ALTO_DE_LETRA) / 2 }))

const grano = (u, v) => ((Math.sin(u * 913.7 + v * 377.1) * 43758.5) % 1 + 1) % 1

const pintaPantalla = (estado) => ([, y, z]) => {
  const { y0, y1, z0, z1 } = PANTALLA
  const u = (z - z0) / (z1 - z0)
  const v = (y - y0) / (y1 - y0)
  if (u < 0.015 || u > 0.985 || v < 0.03 || v > 0.97) return '#16191e'
  // Otro estado: una función que pinta la pantalla entera, con (u, v) de 0 a 1.
  if (typeof estado === 'function') return estado(u, v)
  if (estado === 'iniciada' || estado === 'operacion') {
    const linea = OPERACION.find(({ texto, abajo, medio }) => (estado === 'iniciada' || texto !== 'INICIADA') && enTexto(texto, z + medio, y - abajo, ALTO_DE_LETRA))
    return linea ? linea.color : '#0e1a2a'
  }
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

// La vista por los ventanales: el atardecer de afuera, con el sol en el panel
// del medio (en `X_DEL_SOL`), la escolta recortada contra el horizonte y la
// estela abierta hacia la sala. El cielo es el de `cielo`, mirado desde el
// medio de la sala, a la altura del horizonte: hacia estribor, el sol.
const X_DEL_SOL = -0.7
const DERECHA_DEL_SOL = [-SOL[2], 0, SOL[0]]
const vista = (x, y) => {
  const panel = [[-3.3, -1.15], [-1.05, 1.05], [1.15, 3.3]].find(([a, b]) => x > a && x < b)
  if (!panel || y < 1.05 || y > 2.55) return null
  if (x - panel[0] < 0.06 || panel[1] - x < 0.06 || y < 1.11 || y > 2.49) return '#2a3036'
  const horizonte = 1.72
  const barco = [[-2.4, 0.5], [0.6, 0.35], [2.3, 0.6]].some(([bx, l]) => Math.abs(x - bx) < l && y > horizonte - 0.002 && y < horizonte + (Math.abs(x - bx) < l * 0.3 ? 0.07 : 0.03))
  if (barco) return '#4a4060'
  if (y > horizonte) {
    const d = sum(sum(esc(SOL, 5), esc(DERECHA_DEL_SOL, X_DEL_SOL - x)), [0, y - horizonte, 0])
    return cielo(esc(d, 1 / Math.hypot(...d)))
  }
  const bajo = horizonte - y
  const estela = Math.abs(x - X_DEL_SOL) < 0.1 + 0.4 * bajo
  const ola = estela ? Math.sin(x * 70 + Math.sin(y * 160) * 3) * Math.sin(y * 230 + x * 20) > 0.35 : Math.sin(x * 40 + Math.sin(y * 90) * 2) > 0.8
  return agua(bajo < 0.03 ? 0 : bajo < 0.12 ? 1 : 2, ola, estela)
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

// Con `pulido`, el piso refleja lo que se ponga bajo él, de cabeza (escena 2).
export const sala = ({ pantalla = 'bajas', alarma = false, pulido = false } = {}) => [
  placa([[-4, 0, -5], [-4, 0, 5], [4, 0, 5], [4, 0, -5]], 0.1, SUELO, { pinta: ([x, , z]) => (Math.abs(((x + 40) % 1) - 0.5) > 0.48 || Math.abs(((z + 50) % 1) - 0.5) > 0.48 ? SUELO[2] : null), vidrio: pulido }),
  placa([[-4, 3, -5], [-4, 3, 5], [4, 3, 5], [4, 3, -5]], 0.1, SALA, { pinta: ([x, , z]) => (Math.abs(z) < 3.5 && [-2, 0.5, 3].some((cx) => Math.abs(x - cx) < 0.25) ? '#fbfcf4' : null) }),
  placa([[4, 0, -5], [4, 0, 5], [4, 3, 5], [4, 3, -5]], 0.1, SALA),
  placa([[PANTALLA.x, PANTALLA.y0, PANTALLA.z0], [PANTALLA.x, PANTALLA.y0, PANTALLA.z1], [PANTALLA.x, PANTALLA.y1, PANTALLA.z1], [PANTALLA.x, PANTALLA.y1, PANTALLA.z0]], 0.04, C.oscuro, { pinta: pintaPantalla(pantalla), brilla: true }),
  placa([[-4, 0, 5], [4, 0, 5], [4, 3, 5], [-4, 3, 5]], 0.1, SALA, { pinta: ([x, y]) => vista(x, y), lejos: ([x, y]) => ![null, '#2a3036'].includes(vista(x, y)) }),
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
