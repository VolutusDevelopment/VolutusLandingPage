// El control de vuelo por dentro: el último piso de la isla del Sitting Ducks
// (escena1/lugares.mjs), con ventanales a babor, a proa y a popa que dan a
// la cubierta, la consola bajo los de babor y pantallas colgadas del techo.
// Desde aquí el oficial de inteligencia les habla por radio a los pilotos,
// sentado a la consola, y el almirante, de pie detrás de él, mira las
// pantallas. En metros del barco.

import { placa } from '../pilotos/tres.mjs'
import { RAMPAS as C, hueso } from '../pilotos/modelos.mjs'
import { CONSOLA, ISLA, MAR, caja, colocar, portaaviones } from '../escena1/lugares.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const res = (a, b) => a.map((v, i) => v - b[i])
const pto = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0)
const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]

// De popa a proa entre x0 y x1 y de babor a estribor entre z0 y z1; por fuera
// llega hasta `arriba`, como el piso cerrado que reemplaza.
export const CONTROL = { x0: -37, x1: -20, z0: 24, z1: 30, piso: 44.55, techo: 47.75, arriba: 52 }
const { x0, x1, z0, z1, piso, techo, arriba } = CONTROL
const PARED = ['#c6d4d8', '#9cb0b6', '#768a92', '#46565e']
const SUELO = ['#5e6874', '#48515c', '#363e48', '#20262c']

// ── Las pantallas ────────────────────────────────────────────────────────

// Una pantalla plana que da luz, de esquinas [abajo a la izquierda, abajo a la
// derecha, arriba a la izquierda] vistas de frente: `dibujo(u, v)`, de 0 a 1
// desde abajo a la izquierda, la pinta dentro del marco; por detrás es negra.
export const pantalla = ([a, b, d], dibujo) => {
  const [ex, ey] = [res(b, a), res(d, a)]
  const frente = cruz(ex, ey)
  return placa([a, b, sum(b, ey), d], 0.04, C.oscuro, {
    brilla: true,
    pinta: (p, n) => {
      if (pto(n, frente) < 0) return null
      const q = res(p, a)
      const [u, v] = [pto(q, ex) / pto(ex, ex), pto(q, ey) / pto(ey, ey)]
      return u < 0.04 || u > 0.96 || v < 0.06 || v > 0.94 ? '#16191e' : (dibujo(u, v) ?? '#0e1a2a')
    },
  })
}

// Un radar redondo en el medio de la pantalla, de `ancho` por `alto` (sus
// proporciones): el barrido da dos vueltas por bucle y los `ecos`, [x, y,
// color] desde el centro con radio 1, prenden y apagan.
export const radar = (t, ecos, ancho = 1, alto = 1) => (u, v) => {
  const [x, y] = [((u - 0.5) * 2.4 * ancho) / Math.min(ancho, alto), ((v - 0.5) * 2.4 * alto) / Math.min(ancho, alto)]
  const r = Math.hypot(x, y)
  if (r > 1) return null
  const eco = ecos.find(([ex, ey]) => Math.hypot(x - ex, y - ey) < 0.1)
  if (eco && Math.floor(t * 12) % 3 !== 2) return eco[2]
  const atras = (((t * Math.PI * 4 - Math.atan2(y, x)) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  if (r > 0.93 || atras < 0.15 || Math.abs(r - 0.5) < 0.03) return '#7dffa0'
  return atras < 0.7 ? '#1f5a36' : '#123a24'
}

// Renglones de texto, de lejos: rayas claras de largos distintos; el renglón
// `alerta` parpadea en rojo.
export const renglones = (t, alerta = -1) => (u, v) => {
  const fila = Math.floor((1 - v) * 7)
  if (((1 - v) * 7) % 1 < 0.4 || u < 0.1 || u > 0.15 + 0.75 * ((fila * 0.37 + 0.3) % 1)) return null
  if (fila === alerta) return Math.floor(t * 8) % 2 ? '#ff3a2a' : null
  return Math.sin(u * 70 + fila * 3) > -0.4 ? '#c8d8f0' : null
}

// El combustible de los dos cazas, en barras: les queda poco y parpadean.
const combustible = (t) => (u, v) => {
  if (![0.3, 0.7].some((c) => Math.abs(u - c) < 0.12) || v < 0.15 || v > 0.85) return null
  if (v < 0.27) return Math.floor(t * 8) % 2 ? '#ff3a2a' : '#7a1a14'
  return '#1e2a3a'
}

// Moby y duke en el radar de aproximación, juntos y lejos del barco.
const PATOON = [[0.55, 0.35, '#f8cc1c'], [0.68, 0.24, '#f8cc1c']]

// ── El cuarto ────────────────────────────────────────────────────────────

// Ventanales de `bajo` a `alto`, con un montante cada `paso` m a lo largo de
// la pared; por dentro, la pared es clara.
const VENTANAL = { bajo: piso + 0.9, alto: techo - 0.1, montante: 0.14 }
const pared = (pts, adentro, { largo = () => 0, paso = 0, pinta = () => null } = {}) =>
  placa(pts, 0.2, ISLA, {
    pinta: (p, n) => (pto(n, adentro) > 0.5 ? (pinta(p) ?? PARED) : null),
    hueco: (p) => paso > 0 && p[1] > VENTANAL.bajo && p[1] < VENTANAL.alto && Math.abs(largo(p) - Math.round(largo(p) / paso) * paso) > VENTANAL.montante / 2,
  })

// A estribor, sin ventanas: la puerta y la pizarra con los cazas en el aire.
const pintaEstribor = ([x, y]) => {
  if (x > -23.5 && x < -22.3 && y < piso + 2.1) return Math.abs(y - piso - 1.0) < 0.05 && x < -22.4 && x > -22.6 ? C.oro : '#5c6874'
  if (x > -34.5 && x < -31.5 && y > piso + 1.2 && y < piso + 2.2) {
    if (x < -34.45 || x > -31.55 || y < piso + 1.25 || y > piso + 2.15) return '#2a3036'
    const fila = Math.floor((piso + 2.15 - y) / 0.15)
    return (piso + 2.15 - y) % 0.15 < 0.03 ? '#2c4cb0' : fila < 2 && x < -33.4 ? '#d8282c' : '#dfe6ec'
  }
  return null
}

// El techo con sus tubos de luz, y un ducto a lo largo, a estribor.
const LUCES = [25.6, 28.4]
const techoConLuces = placa([[x0, techo, z0], [x0, techo, z1], [x1, techo, z1], [x1, techo, z0]], 0.1, PARED, {
  pinta: ([x, , z]) => (LUCES.some((c) => Math.abs(z - c) < 0.12) && ((x - x0) % 2.4) > 0.5 ? '#fbfcf4' : null),
})

// La consola corre bajo los ventanales de babor; los botones, de colores.
const CONSOLA_Z = z0 + 0.5
const ALTO_CONSOLA = 0.8
const botones = ([x, y, z]) => (y > piso + ALTO_CONSOLA - 0.03 && z > CONSOLA_Z + 0.15 && Math.hypot(((x + 100) % 0.4) - 0.2, ((z + 100) % 0.2) - 0.1) < 0.03 ? ['#d8282c', '#7dffa0', '#f2c440', '#3a7ad8'][Math.floor(x / 0.4) & 3] : null)

// Una pantalla de escritorio en (x, `z0` + 0.5), mirando a la sala, apenas echada hacia atrás.
const deEscritorio = (x, dibujo, ancho = 0.6) => {
  const y = piso + ALTO_CONSOLA + 0.08
  return [hueso([x, y - 0.08, CONSOLA_Z], [x, y + 0.1, CONSOLA_Z - 0.05], 0.03, C.oscuro), pantalla([[x - ancho / 2, y, CONSOLA_Z + 0.05], [x + ancho / 2, y, CONSOLA_Z + 0.05], [x - ancho / 2, y + 0.42, CONSOLA_Z - 0.05]], dibujo)]
}

// Colgada del techo sobre los ventanales de babor, inclinada hacia la sala.
const colgada = (x, dibujo) => {
  const [y0, y1] = [techo - 0.85, techo - 0.3]
  return [hueso([x, techo, z0 + 0.5], [x, y1, z0 + 0.5], 0.03, C.oscuro), pantalla([[x - 0.55, y0, z0 + 0.3], [x + 0.55, y0, z0 + 0.3], [x - 0.55, y1, z0 + 0.6]], dibujo)]
}

// Dónde se sienta el oficial y dónde se para el almirante, detrás de él.
const OFICIAL_EN = { k: 0.42, en: [-27.5, piso, 25.75], giro: 90 }
const ALMIRANTE_EN ={ k: 0.42, en: [-28.7, piso, 27.6], giro: 90 }

const cuarto = (t) => [
  placa([[x0, piso - 0.05, z0], [x0, piso - 0.05, z1], [x1, piso - 0.05, z1], [x1, piso - 0.05, z0]], 0.1, SUELO),
  techoConLuces,
  placa([[x0, arriba, z0], [x0, arriba, z1], [x1, arriba, z1], [x1, arriba, z0]], 0.2, ISLA),
  pared([[x0, piso, z0], [x1, piso, z0], [x1, arriba, z0], [x0, arriba, z0]], [0, 0, 1], { largo: ([x]) => x - x0, paso: (x1 - x0) / 10 }),
  pared([[x1, piso, z0], [x1, piso, z1], [x1, arriba, z1], [x1, arriba, z0]], [-1, 0, 0], { largo: ([, , z]) => z - z0, paso: (z1 - z0) / 4 }),
  pared([[x0, piso, z0], [x0, piso, z1], [x0, arriba, z1], [x0, arriba, z0]], [1, 0, 0], { largo: ([, , z]) => z - z0, paso: (z1 - z0) / 4 }),
  pared([[x0, piso, z1], [x1, piso, z1], [x1, arriba, z1], [x0, arriba, z1]], [0, 0, -1], { pinta: pintaEstribor }),
  hueso([x0, techo - 0.3, z1 - 0.5], [x1, techo - 0.3, z1 - 0.5], 0.2, ISLA),
  caja(x0 + 1.4, x1 - 1.4, 0.9, ALTO_CONSOLA, piso + ALTO_CONSOLA / 2, CONSOLA_Z, CONSOLA, { pinta: botones }),
  // Las dos del oficial, a los lados de su puesto: el radar y el combustible.
  ...deEscritorio(OFICIAL_EN.en[0] - 0.85, radar(t, PATOON, 0.6, 0.42)),
  ...deEscritorio(OFICIAL_EN.en[0] + 0.85, combustible(t)),
  ...[-33.5, -31.5, -23.5, -21.9].flatMap((x, i) => deEscritorio(x, renglones(t + i * 0.3, i === 1 ? 2 : -1), 0.5)),
  ...colgada(-33.4, renglones(t, 4)),
  ...colgada(-30.6, radar(t, PATOON, 1.1, 0.55)),
  ...colgada(-27.8, combustible(t)),
  ...colgada(-25, renglones(t + 0.5, 1)),
  ...colgada(-22.2, radar(t + 0.25, PATOON, 1.1, 0.55)),
]

// El barco entero con el control de vuelo abierto, y en él a los dos:
// `oficial(u)` y `almirante(u)`, sus poses.
export const control = ({ oficial, almirante }) => (u) => [
  MAR,
  ...portaaviones({ control: cuarto(u), radar: u * 360 }),
  ...colocar(oficial(u), OFICIAL_EN),
  ...colocar(almirante(u), ALMIRANTE_EN),
]
