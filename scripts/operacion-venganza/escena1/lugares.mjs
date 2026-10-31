// Los lugares de la escena 1, en metros: el mar, el portaaviones Sitting
// Ducks con su cubierta, la escolta y la sala de mando de la isla, con la
// pantalla de las bajas. Proa hacia +x, arriba +y, estribor hacia +z.

import { el, forro, placa, tubo, transformar } from '../pilotos/tres.mjs'
import { RAMPAS as C, hueso, ambos, CAZA_DUKE, plegarAlas } from '../pilotos/modelos.mjs'
import { TREN_HORNET } from '../escena9/cazas.mjs'
import { BORDE, FLECHA, HUELLA } from '../../../src/lib/flecha.js'

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
    if (f.hueco) g.hueco = (p) => f.hueco(vuelta(p))
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

// El mar del juego (src/combate.js): el agua toma el color de su franja según
// lo hondo que se la mira, la tangente del ángulo bajo el horizonte, y sus
// olas, uno más claro; bajo el sol, doradas. Así se ve mar hasta el
// horizonte desde cualquier altura, sin un círculo alrededor de nadie.
const FRANJAS_DEL_MAR = [
  [0.018, '#c495a8', '#ecc0c0'],
  [0.045, '#9a86b6', '#c2acd6'],
  [0.1, '#7470ac', '#a09ad6'],
  [Infinity, '#5c5b9e', '#8584cc'],
]
const BRILLO = '#ffd59a'
const agua = (hondo, ola, sol) => {
  const [, color, claro] = FRANJAS_DEL_MAR.find(([hasta]) => hondo <= hasta)
  return ola ? (sol ? BRILLO : claro) : color
}
const azar = (a, b, c) => {
  let n = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 1274126177)) | 0
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296
}

// Un plano: una esfera tan grande pierde precisión al cortarla. pixel3d le da
// a `pinta` el `ojo` desde donde se mira. Las olas, como en el juego, son
// trazos cortos fijos en el mundo, más grandes a lo lejos para que no
// titilen, y más seguidos en el camino del sol.
export const MAR = placa([[-60000, 0, -60000], [-60000, 0, 60000], [60000, 0, 60000], [60000, 0, -60000]], 0.2, C.azul, {
  pinta: ([x, y, z], n, [ox, oy, oz]) => {
    const lejos = Math.hypot(x - ox, z - oz)
    const hondo = (oy - y) / lejos
    let haciaElSol = Math.atan2(z - oz, x - ox) - RUMBO
    haciaElSol -= Math.round(haciaElSol / (2 * Math.PI)) * 2 * Math.PI
    const sol = Math.abs(haciaElSol) < 0.045 + hondo * 0.12
    if (lejos >= 3600) return agua(hondo, false, sol)
    const nivel = lejos < 320 ? 0 : lejos < 700 ? 1 : lejos < 1500 ? 2 : 3
    const tam = 2 ** nivel
    const iz = Math.floor(z / (3.2 * tam))
    const fx = (x + azar(iz, 7, nivel) * 40) / (9 * tam)
    const ix = Math.floor(fx)
    const [cx, cz] = [fx - ix, z / (3.2 * tam) - iz]
    return agua(hondo, cz > 0.35 && cz < 0.62 && cx > 0.12 && cx < 0.72 && azar(ix, iz, nivel) < (sol ? 0.5 : 0.2), sol)
  },
})

// Espuma de proa: el barco abre el mar al avanzar.
const espuma = (x, z, largo) => [el([x, 0.3, z], [largo, 0.8, largo * 0.35], C.nube, { flat: '#eef4ff' }), ...ambos((s) => el([x - largo * 2, 0.2, z + s * largo * 0.6], [largo * 1.6, 0.5, largo * 0.25], C.nube, { flat: '#d8e4fa' }))]

// ── El portaaviones ──────────────────────────────────────────────────────

const CASCO = ['#c4ccd6', '#96a2ae', '#6c7884', '#3c4650']
const CUBIERTA = ['#6a7078', '#4c525a', '#3a3f46', '#22262b']
export const ISLA = ['#d0d8e0', '#a4b0bc', '#7a8692', '#46505a']
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
  if (x > -6 && (Math.abs(z - 8) < 0.35 || Math.abs(z + 6) < 0.35)) return AMARILLO
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

export const caja = (x0, x1, ancho, alto, yc, zc, rampa, o) => tubo([[x0, ancho, alto, yc, 8, zc], [x1, ancho, alto, yc, 8, zc]], rampa, o)

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
// domos en las puntas de la primera, una antena plana en la segunda, que gira
// al doble de los `giro` grados del radar grande, y, en la punta, la antena
// con su luz.
const mastil = ([mx, mz], giro) => {
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
    ...radar([mx + 2.4, 66, mz], 4, 1.2, 2 * giro),
    hueso(punta, [mx, 80, mz], 0.2, ISLA),
    el([mx, 80.2, mz], [0.35, 0.35, 0.35], C.boca, { flat: '#ff3a2a', brilla: true }),
  ]
}

// La isla, a estribor: el bloque con el 15 a los costados, el puente de mando
// con sus ventanales y pasarelas, el control de vuelo y, encima, el mástil,
// los domos de las antenas y las balizas de alarma. Detrás, en su propia
// torre, el radar de búsqueda aérea gira `giro` grados, y la antena del
// mástil, el doble. Va sobre un saliente de la cubierta que un faldón une al
// casco, como en un Nimitz. Con `control`, el control de vuelo, cerrado,
// cambia por esas formas (escena9/control.mjs).
const QUINCE = { alto: 8, x: -25 - ancho('15', 8) / 2, y: 25 }
const isla = (alarma, giro, control) => [
  faldon([-56, 33], [-4, 33], 1),
  ...[-56, -4].map((x) => placa([[x, BORDA, 19], [x, BORDA, 33], [x, 8, mangaEn(x, 8)]], 0.4, CASCO)),
  placa([[-56, 20, 21], [-56, 20, 33], [-4, 20, 33], [-4, 20, 21]], 1.6, CUBIERTA),
  caja(-40, -10, 7.5, 18, 29.5, 27, ISLA, {
    pinta: ([x, y, z]) => (Math.abs(z - 27) > 3.5 && enTexto('15', z > 27 ? x - QUINCE.x : QUINCE.x + ancho('15', QUINCE.alto) - x, y - QUINCE.y, QUINCE.alto) ? '#f4f4ee' : null),
  }),
  pasarela(-41.5, -8.5, 21, 33, 34),
  caja(-43, -13, 9.5, 6, 41, 27, ISLA, { pinta: ventanales(39.6, 42.8, (x, z) => z < 22.6 || x > -13.6 || z > 31.4) }),
  pasarela(-39, -18, 23, 31, 44.3),
  ...(control ?? [caja(-37, -20, 6, 8, 48, 27, ISLA, { pinta: ventanales(46.4, 48.6) })]),
  ...mastil([-28, 27], giro),
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

// ── Los aviones de servicio ──────────────────────────────────────────────

const GRIS_NAVY = ['#e2e6ea', '#b4bcc4', '#88929c', '#545e68']
const RADOMO = ['#ffffff', '#e8ecf0', '#c0c8d0', '#86909a']

// E-2D Advanced Hawkeye: 17,6 m de largo, 24,6 de envergadura, el radomo de 7,3 m sobre dos patas, ala alta, dos turbohélices y cuatro derivas.
const ventanas = ([x, y], n) => (x > 8.5 ? '#1a1d22' : x > 6 && x < 7.6 && y > 2.9 && n[1] > -0.3 ? '#22303c' : Math.abs(x - 4.6) < 0.1 ? '#c8302a' : null)
// Las hélices quietas: ocho palas anchas, de 2 m, alrededor del cono.
const helice = ([x, y, z]) =>
  Array.from({ length: 8 }, (_, i) => {
    const a = ((i + 0.5) / 8) * Math.PI * 2
    const en = (r, d) => [x, y + r * Math.sin(a) - d * Math.cos(a), z + r * Math.cos(a) + d * Math.sin(a)]
    return placa([en(0.3, -0.12), en(0.3, 0.12), en(1.4, 0.16), en(2.05, 0.06), en(2.05, -0.06), en(1.4, -0.16)], 0.05, C.oscuro)
  })
const hawkeye = ({ plegado = false } = {}) => [
  tubo([[8.9, 0.2, 0.2, 2.1], [8.4, 1.0, 1.0, 2.2], [7.2, 2.0, 2.2, 2.45], [5.6, 2.4, 2.8, 2.55], [-3.5, 2.4, 2.8, 2.6], [-6.8, 1.4, 1.8, 3.0], [-8.4, 0.6, 0.8, 3.4]], GRIS_NAVY, { pinta: ventanas }),
  ...ambos((s) => placa([[2.4, 3.95, s * 1.1], [2.2, 3.95, s * 4.9], [-0.6, 3.95, s * 4.9], [-0.7, 3.95, s * 1.1]], 0.3, GRIS_NAVY)),
  // Las alas exteriores: abiertas o, plegadas, de canto junto al fuselaje con las puntas hacia la cola.
  ...ambos((s) => placa(plegado ? [[2.2, 3.7, s * 4.9], [-8.6, 3.2, s * 4.6], [-8.6, 4.6, s * 4.6], [2.2, 5.0, s * 4.9]] : [[2.2, 3.95, s * 4.9], [1.5, 3.95, s * 12.3], [0.2, 3.95, s * 12.3], [-0.6, 3.95, s * 4.9]], 0.3, GRIS_NAVY)),
  ...ambos((s) => [
    tubo([[4.3, 0.5, 0.6, 3.5, 2, s * 3.9], [3.4, 1.1, 1.4, 3.5, 2, s * 3.9], [-1.4, 1.0, 1.3, 3.4, 2, s * 3.9], [-3.0, 0.3, 0.4, 3.6, 2, s * 3.9]], GRIS_NAVY),
    el([4.5, 3.5, s * 3.9], [0.5, 0.35, 0.35], C.oscuro),
    ...helice([4.4, 3.5, s * 3.9]),
  ]).flat(),
  ...ambos((s) => placa([[0.6, 3.9, s * 0.7], [-2.4, 3.9, s * 0.7], [-1.9, 5.9, s * 0.35], [-0.2, 5.9, s * 0.35]], 0.2, GRIS_NAVY)),
  el([-1.0, 6.2, 0], [3.65, 0.42, 3.65], RADOMO),
  placa([[-6.8, 3.6, -4.0], [-8.5, 3.6, -4.0], [-8.5, 3.6, 4.0], [-6.8, 3.6, 4.0]], 0.2, GRIS_NAVY),
  ...[-4, -1.5, 1.5, 4].map((z) => placa([[-7.0, Math.abs(z) > 2 ? 2.4 : 3.6, z], [-8.6, Math.abs(z) > 2 ? 2.4 : 3.6, z], [-9.0, 6.0, z], [-7.9, 6.0, z]], 0.15, GRIS_NAVY)),
  hueso([6.6, 1.5, 0], [6.6, 0.45, 0], 0.09, C.grisOscuro),
  el([6.6, 0.45, 0], [0.45, 0.45, 0.2], C.negro),
  ...ambos((s) => [hueso([0.3, 2.8, s * 3.9], [0.3, 0.5, s * 3.9], 0.12, C.grisOscuro), el([0.3, 0.5, s * 3.9], [0.5, 0.5, 0.25], C.negro)]).flat(),
]

// Con el capó del motor de estribor abierto, la escalera puesta y el tractor amarillo enganchado.
const hawkeyeEnServicio = () => [
  ...hawkeye(),
  placa([[1.2, 4.2, 4.4], [3.6, 4.2, 4.4], [3.6, 5.6, 5.4], [1.2, 5.6, 5.4]], 0.12, GRIS_NAVY),
  hueso([2.0, 0.2, 6.6], [2.0, 4.0, 4.7], 0.15, C.rayas),
  hueso([3.0, 0.2, 6.6], [3.0, 4.0, 4.7], 0.15, C.rayas),
  caja(9.6, 13.4, 2.6, 1.6, 1.0, 0, C.rayas),
  hueso([6.6, 0.5, 0], [9.6, 0.9, 0], 0.12, C.oscuro),
]

// EA-18G Growler: el Hornet en gris, con el radomo oscuro, las góndolas ALQ-218 en las puntas, dos ALQ-99 bajo el ala, el tanque al centro y las alas plegadas.
const GRIS_GROWLER = ['#d4dae0', '#a2acb6', '#76808c', '#48505a']
const radomo = ([x]) => (x > 7.6 ? C.grisOscuro : null)
const growler = () =>
  plegarAlas(
    [
      ...CAZA_DUKE.filter((f) => !f.luz && f.rampa !== C.crema && f.rampa !== C.corona && f.rampa !== C.pico).map((f, i) => (f.rampa === C.blanco ? { ...f, rampa: GRIS_GROWLER, pinta: i === 0 ? radomo : undefined } : f)),
      ...ambos((s) => tubo([[-1.4, 0.05, 0.05, 0.45, 2, s * 5.8], [-2.0, 0.35, 0.35, 0.45, 2, s * 5.8], [-4.2, 0.35, 0.35, 0.45, 2, s * 5.8]], GRIS_GROWLER, { plegable: s })),
      ...ambos((s) => [tubo([[1.6, 0.05, 0.05, -0.15, 2, s * 3.0], [1.0, 0.55, 0.55, -0.15, 2, s * 3.0], [-2.4, 0.55, 0.55, -0.15, 2, s * 3.0], [-2.9, 0.1, 0.1, -0.15, 2, s * 3.0]], GRIS_GROWLER), hueso([-0.4, 0.4, s * 3.0], [-0.4, 0.1, s * 3.0], 0.12, GRIS_GROWLER)]).flat(),
      tubo([[2.6, 0.05, 0.05, -0.85], [1.8, 0.65, 0.65, -0.85], [-1.6, 0.65, 0.65, -0.85], [-2.4, 0.05, 0.05, -0.85]], GRIS_GROWLER),
      ...TREN_HORNET,
    ],
    100,
  )

// El tractor amarillo de cubierta, suelto en el Junkyard.
const tractor = () => [caja(-1.8, 1.8, 2.4, 1.2, 0.8, 0, C.rayas), caja(-0.6, 0.6, 1.6, 0.8, 1.7, 0, C.rayas), ...ambos((s) => [el([1.1, 0.4, s * 1.25], [0.4, 0.4, 0.2], C.negro), el([-1.1, 0.4, s * 1.25], [0.4, 0.4, 0.2], C.negro)]).flat()]

// Growler estacionado, con las ruedas en la cubierta (o en `y`).
const jet = (x, z, giro, y = 20.8) => poner(growler(), giro, [x, y + 2.0, z])

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

// Lo que se mueve solo en el barco a lo largo de una tira, con u de 0 a 1: el
// radar de la isla da una vuelta (la antena del mástil, dos), para que la tira
// vuelva a empezar sin saltos.
export const enMarcha = (u) => ({ radar: u * 360 })

// `radar`: los grados que lleva girado el radar de la isla (enMarcha los da
// para una tira); `ascensor`: dónde va la plataforma, de 0 (en el hangar) a 1
// (en la cubierta); `control`, el control de vuelo por dentro.
export const portaaviones = ({ alarma = -1, avion = true, radar = 0, ascensor: plataforma = 1, control } = {}) => [
  casco,
  ...cubierta,
  ...isla(alarma, radar, control),
  ...hangar(),
  ...ascensor(plataforma),
  // La cubierta como la de un Nimitz: Growler en el Corral (delante de la isla), en la
  // Row de estribor y en el Fantail; E-2D plegados en el Hummer Hole, junto a la isla, y
  // tractores en el Junkyard. La pista, las catapultas y el Six Pack, donde paran los
  // cazas del escuadrón, quedan libres: por babor de la catapulta pasan las alas del
  // caza de duck-one cuando despega (escena 3).
  ...[[70, 14, 30], [90, 14, 30], [110, 14, 30], [128, 14, 30], [-6, 15, 30], [8, 15, 30], [22, 15, 30], [-154, 12, 30]].flatMap(([x, z, g]) => jet(x, z, g)),
  ...(avion ? poner(hawkeyeEnServicio(), 62, [30, 20.8, -24]) : []),
  ...[-50, -31].flatMap((x) => poner(hawkeye({ plegado: true }), 200, [x, 20.8, 13])),
  ...[[-62, 17, 80], [-68, 15, 120]].flatMap(([x, z, g]) => poner(tractor(), g, [x, 20.8, z])),
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
export const CONSOLA = ['#7c8794', '#4e5864', '#3a424c', '#20252b']

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
  // El cursor o la huella de quien juega, los mismos del combate, al centro.
  const [dibujo, celda, desde] = estado === 'cursor' ? [FLECHA, 0.075, [-0.3, 0.62]] : [HUELLA, 0.085, [-0.47, 0.6]]
  const c = dibujo[Math.floor((desde[1] - cv) / celda)]?.[Math.floor((cu - desde[0]) / celda)]
  return c === 'X' ? BORDE : c === 'W' ? '#ffffff' : fondo
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
  // Mirado desde 5 m del vidrio: lo hondo es lo que baja del horizonte, en quintos.
  const bajo = horizonte - y
  const sol = Math.abs(x - X_DEL_SOL) < 0.1 + 0.4 * bajo
  const ola = sol ? Math.sin(x * 70 + Math.sin(y * 160) * 3) * Math.sin(y * 230 + x * 20) > 0.35 : Math.sin(x * 40 + Math.sin(y * 90) * 2) > 0.8
  return agua(bajo / 5, ola, sol)
}

// Las consolas de babor, cada una con su oficio (el radar está en la pantalla
// grande): la mesa «ouija» del control de cubierta, la carta de navegación y
// la radio. Pinta cada una con (s, t) de 0 a 1 en su panel, de izquierda a
// derecha y de abajo arriba; lo que se mueve da vueltas enteras por tira,
// para que vuelva a empezar sin saltos.
const ondea = (u, vueltas, fase) => (1 - Math.cos(2 * Math.PI * (u * vueltas + fase))) / 2

// La ouija: el plano de la cubierta, con la pista en ángulo y la isla, y sus
// avioncitos de juguete, que se mueven a mano para ordenar los aviones. Uno
// va hasta la catapulta y vuelve.
const AVIONCITOS = [[[0.2, 0.36], '#f8d020'], [[0.3, 0.36], '#6a7a3a'], [[0.4, 0.36], '#eef0f4'], [[0.74, 0.62], '#9050d8'], [[0.84, 0.62], '#d8282c']]
const ouija = (s, t, u) => {
  const mueve = ondea(u, 1, 0)
  const piezas = [...AVIONCITOS, [[0.5 + 0.3 * mueve, 0.5 + 0.08 * mueve], '#ffad5c']]
  const pieza = piezas.find(([[ps, pt]]) => Math.abs(s - ps) < 0.035 && Math.abs(t - pt) < 0.05)
  if (pieza) return pieza[1]
  if (s > 0.55 && s < 0.65 && t > 0.24 && t < 0.31) return '#20252b'
  const enAngulo = s < 0.55 && t > 0.68 && t < 0.68 + (0.55 - s) * 0.6 && s > 0.08
  if ((s > 0.08 && s < 0.94 && t > 0.3 && t < 0.68) || enAngulo) return Math.abs(t - 0.5 - (0.5 - s) * 0.3) < 0.015 && s < 0.55 ? '#eef0f4' : '#8a96a4'
  return '#1a3a5a'
}

// La carta: el mar, la costa al este, el rumbo de la flota a puntos y su
// posición, que parpadea. Arriba a la izquierda, la rosa de los vientos.
const carta = (s, t, u) => {
  if (s > 0.78 + 0.06 * Math.sin(t * 11)) return '#d8c89a'
  if (Math.hypot(s - 0.62, (t - 0.66) * 0.7) < 0.04) return Math.floor(u * 6) % 2 ? '#e0201c' : '#7a1a14'
  const rumbo = (t - 0.2) / 0.46
  if (rumbo > 0 && rumbo < 1 && Math.abs(s - 0.18 - 0.44 * rumbo) < 0.02 && Math.floor(rumbo * 9) % 2 === 0) return '#e0201c'
  const r = Math.hypot(s - 0.2, (t - 0.76) * 0.7)
  if (r < 0.1) return r > 0.085 || Math.abs(s - 0.2) < 0.012 || Math.abs(t - 0.76) < 0.02 ? '#2c4cb0' : '#bcd8e8'
  return (s * 10) % 2 < 0.08 || (t * 6) % 2 < 0.08 ? '#9ec4e8' : '#bcd8e8'
}

// La radio: las frecuencias en verde, los medidores de señal que suben y
// bajan, y las luces de los canales.
const radio = (s, t, u) => {
  if (t > 0.72 && t < 0.9) return s > 0.08 && s < 0.92 && (s * 12) % 1 < 0.7 && (s * 12) % 4 < 3.5 ? '#7dffa0' : '#0e1a12'
  if (t > 0.22 && t < 0.62) {
    const i = Math.floor(s * 8)
    if ((s * 8) % 1 < 0.25 || i < 1 || i > 6) return '#16191e'
    const alto = 0.25 + 0.7 * ondea(u, 2, i * 0.37)
    const k = (t - 0.22) / 0.4
    return k < alto ? (k > 0.75 ? '#f8d020' : '#3ad070') : '#123a24'
  }
  if (t > 0.06 && t < 0.16) {
    const i = Math.floor(s * 6)
    if ((s * 6) % 1 < 0.35 || i < 1 || i > 4) return '#16191e'
    return Math.floor(u * 6 + i * 5) % 3 ? '#3a7ad8' : '#1a2a4a'
  }
  return '#16191e'
}

const consola = (x0, x1, pinta, u) => [
  caja(x0, x1, 0.8, 1.0, 0.5, -4.55, CONSOLA),
  placa([[x0, 1.0, -4.15], [x1, 1.0, -4.15], [x1, 1.6, -4.85], [x0, 1.6, -4.85]], 0.06, CONSOLA, {
    pinta: ([x, y]) => {
      const [s, t] = [(x - x0) / (x1 - x0), (y - 1.0) / 0.6]
      return s < 0.04 || s > 0.96 || t < 0.06 || t > 0.94 ? null : pinta((s - 0.04) / 0.92, (t - 0.06) / 0.88, u)
    },
  }),
]

// La baliza de alarma del techo gira: en cada cuadro alumbra un lado.
const baliza = (prendida) => [hueso([3.2, 3.0, -4.3], [3.2, 2.82, -4.3], 0.08, C.oscuro), el([3.2, 2.72, -4.3], [0.14, 0.14, 0.14], C.boca, prendida ? { flat: '#ff3a2a', brilla: true } : { flat: '#7a1a14' })]

// Con `pulido`, el piso refleja lo que se ponga bajo él, de cabeza (escena 2).
// Su cara de arriba queda en y = 0, donde pisan los patos.
export const sala = ({ pantalla = 'bajas', alarma = false, pulido = false, u = 0 } = {}) => [
  placa([[-4, -0.05, -5], [-4, -0.05, 5], [4, -0.05, 5], [4, -0.05, -5]], 0.1, SUELO, { pinta: ([x, , z]) => (Math.abs(((x + 40) % 1) - 0.5) > 0.48 || Math.abs(((z + 50) % 1) - 0.5) > 0.48 ? SUELO[2] : null), vidrio: pulido }),
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
  ...consola(-2.7, -1.3, ouija, u),
  ...consola(-0.95, 0.45, carta, u),
  ...consola(0.8, 2.2, radio, u),
  ...baliza(alarma),
]
