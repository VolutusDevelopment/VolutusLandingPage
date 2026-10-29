// La sala azul: el centro de información de combate, en la oscuridad del
// casco del Sitting Ducks, desde donde se sigue al caza de duky, que es un
// prototipo. Pantallas grandes al frente, una fila de consolas con su radar,
// relojes rojos y luces azules en el techo; todo lo que no da luz queda
// teñido de azul oscuro. El oficial de inteligencia le habla por radio desde
// la consola del medio y el almirante, de pie detrás, mira las pantallas.
// En metros: el frente en x = 4, el piso en y = 0.

import { placa } from '../pilotos/tres.mjs'
import { RAMPAS as C, hueso } from '../pilotos/modelos.mjs'
import { CONSOLA, caja, colocar } from '../escena1/lugares.mjs'
import { pantalla, radar, renglones } from '../escena9/control.mjs'

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mezcla = (a, b, k) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * k).toString(16).padStart(2, '0')).join('')

// ── La penumbra ──────────────────────────────────────────────────────────

const NOCHE = '#081028'
const TENIDOS = new Map()
const tenir = (c) => {
  if (!TENIDOS.has(c)) TENIDOS.set(c, mezcla(c, NOCHE, 0.55))
  return TENIDOS.get(c)
}
const tenirPintura = (c) => (Array.isArray(c) ? c.map(tenir) : c && tenir(c))
const enPenumbra = (formas) =>
  formas.map((f) => (f.brilla ? f : { ...f, rampa: f.rampa?.map(tenir), flat: f.flat && tenir(f.flat), ...(f.pinta ? { pinta: (p, n) => tenirPintura(f.pinta(p, n)) } : {}) }))

// ── El cuarto ────────────────────────────────────────────────────────────

const { x0, x1, z0, z1, techo } = { x0: -3.5, x1: 4, z0: -3.2, z1: 3.2, techo: 2.6 }
const PARED = ['#8a96a8', '#626e80', '#465062', '#262e3c']
const SUELO = ['#6a7484', '#4c5564', '#384050', '#1e2430']
const ROJO = '#ff3a2a'

// Un reloj de cuadritos rojos sobre negro, de lejos: dígitos que corren.
const reloj = (t) => (u, v) => {
  const [i, du] = [Math.floor(u * 8), (u * 8) % 1]
  if (v < 0.25 || v > 0.75 || du > 0.7) return '#140808'
  if (i === 2 || i === 5) return Math.abs(v - 0.5) < 0.1 && du > 0.25 && du < 0.45 ? ROJO : '#140808'
  return Math.sin(i * 7 + v * 9 + (i > 5 ? Math.floor(t * 12) * 3 : 0)) > -0.2 ? ROJO : '#3a0c08'
}

// Luces de los equipos: puntitos verdes y rojos que parpadean.
const lucecitas = (t) => (u, v) => {
  const [i, j] = [Math.floor(u * 6), Math.floor(v * 10)]
  if ((u * 6) % 1 > 0.35 || (v * 10) % 1 > 0.3) return '#101622'
  const prende = Math.sin(i * 12.9 + j * 78.2 + Math.floor(t * 6) * (i + j)) > 0
  return prende ? ((i + j) % 3 ? '#7dffa0' : ROJO) : '#101622'
}

// Duky en el medio del radar y, con `eco`, quien juega, que parpadea.
const ecos = (eco) => [[0, 0, '#f8cc1c'], ...(eco ? [[0.42, 0.5, ROJO]] : [])]

// Una consola en `z`, mirando al frente: el escritorio, la pantalla alta
// echada hacia atrás (corrida `corre` hacia un lado), el teclado de teclas
// naranjas y la placa verde.
const consola = (z, dibujo, corre = 0) => [
  caja(1.4, 2.2, 0.9, 0.75, 0.375, z, CONSOLA),
  pantalla([[2.05, 0.82, z + corre - 0.4], [2.05, 0.82, z + corre + 0.4], [2.2, 1.4, z + corre - 0.4]], dibujo),
  placa([[1.55, 0.77, z - 0.3], [1.55, 0.77, z + 0.3], [1.8, 0.77, z + 0.3], [1.8, 0.77, z - 0.3]], 0.02, C.oscuro, {
    brilla: true,
    pinta: ([x, , zz]) => (Math.hypot(((x + 10) % 0.05) - 0.025, ((zz + 10) % 0.05) - 0.025) < 0.014 ? '#ff7a3a' : '#1a1410'),
  }),
  placa([[1.85, 0.77, z + 0.08], [1.85, 0.77, z + 0.32], [2.0, 0.77, z + 0.32], [2.0, 0.77, z + 0.08]], 0.02, C.verde, { brilla: true, flat: '#9dffb0' }),
]

// Dónde se sienta el oficial y dónde se para el almirante, detrás de él.
const OFICIAL_EN = { k: 0.42, en: [1.0, 0, 0], giro: 0 }
const ALMIRANTE_EN = { k: 0.42, en: [-0.6, 0, -0.85], giro: 0 }
// El radar grande del frente.
const RADAR_GRANDE = { y0: 1.05, y1: 2.15, z0: -0.8, z1: 0.8 }

const cuarto = (t, eco) => [
  placa([[x0, -0.05, z0], [x0, -0.05, z1], [x1, -0.05, z1], [x1, -0.05, z0]], 0.1, SUELO),
  placa([[x0, techo, z0], [x0, techo, z1], [x1, techo, z1], [x1, techo, z0]], 0.1, PARED),
  ...[x0, x1].map((x) => placa([[x, 0, z0], [x, 0, z1], [x, techo, z1], [x, techo, z0]], 0.1, PARED)),
  ...[z0, z1].map((z) => placa([[x0, 0, z], [x1, 0, z], [x1, techo, z], [x0, techo, z]], 0.1, PARED)),
  // Al frente, el radar grande entre dos tablas, y encima los relojes.
  pantalla([[x1 - 0.06, RADAR_GRANDE.y0, RADAR_GRANDE.z0], [x1 - 0.06, RADAR_GRANDE.y0, RADAR_GRANDE.z1], [x1 - 0.06, RADAR_GRANDE.y1, RADAR_GRANDE.z0]], radar(t, ecos(eco), 1.4, 1.0)),
  pantalla([[x1 - 0.06, 1.2, -2.6], [x1 - 0.06, 1.2, -0.95], [x1 - 0.06, 2.1, -2.6]], renglones(t)),
  pantalla([[x1 - 0.06, 1.2, 0.95], [x1 - 0.06, 1.2, 2.6], [x1 - 0.06, 2.1, 0.95]], renglones(t + 0.4, eco ? 3 : -1)),
  ...[-1.75, 1.75].map((z) => pantalla([[x1 - 0.06, 2.25, z - 0.45], [x1 - 0.06, 2.25, z + 0.45], [x1 - 0.06, 2.45, z - 0.45]], reloj(t))),
  // Las tres consolas: la del medio es la del oficial, con el radar a su izquierda.
  ...consola(0, radar(t, ecos(eco), 0.8, 0.6), -0.5),
  ...consola(-1.7, renglones(t + 0.2)),
  ...consola(1.7, renglones(t + 0.6, 5)),
  // Los equipos de los costados, con sus lucecitas, y el reloj del fondo.
  ...[-2.4, -0.8, 0.8].flatMap((x) =>
    [z0, z1].flatMap((z) => {
      const [s, frente] = [Math.sign(z), z - Math.sign(z) * 0.61]
      return [caja(x - 0.55, x + 0.55, 0.6, 2.0, 1.0, z - s * 0.3, CONSOLA), pantalla([[x + s * 0.45, 0.4, frente], [x - s * 0.45, 0.4, frente], [x + s * 0.45, 1.8, frente]], lucecitas(t + x))]
    }),
  ),
  pantalla([[x0 + 0.06, 2.1, 0.5], [x0 + 0.06, 2.1, -0.5], [x0 + 0.06, 2.3, 0.5]], reloj(t + 0.5)),
  // Los paneles de luz azul del techo y un ducto.
  ...[-2, 0, 2].flatMap((x) => [-1.4, 1.4].map((z) => placa([[x - 0.5, techo - 0.06, z - 0.35], [x - 0.5, techo - 0.06, z + 0.35], [x + 0.5, techo - 0.06, z + 0.35], [x + 0.5, techo - 0.06, z - 0.35]], 0.02, C.azul, { brilla: true, flat: '#3a6aff' }))),
  hueso([x0, techo - 0.25, 0], [x1, techo - 0.25, 0], 0.16, PARED),
]

// La sala con los dos: `oficial(u)` y `almirante(u)`, sus poses; con `eco`,
// quien juega aparece en los radares.
export const cic = ({ oficial, almirante, eco = false }) => (u) =>
  enPenumbra([...cuarto(u, eco), ...colocar(oficial(u), OFICIAL_EN), ...colocar(almirante(u), ALMIRANTE_EN)])
