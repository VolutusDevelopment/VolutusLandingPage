// Lo que la escena 14 pinta sobre los cuadros, en pixeles del cuadro de
// LADO × LADO: el indicador de munición de la cabina de duky, abajo a la
// derecha, y quien juega chiquito, a lo lejos, por un ventanal de la sala.

import { poner } from '../escena6/visor.mjs'
import { ALTO, LADO } from '../../../src/lib/escena1.js'

const ABAJO = (LADO + ALTO) / 2
const SOMBRA = '#16191e'
const AMBAR = '#ffad5c'
const ROJO = '#ff3a2a'

// Cifras de tres por cinco, y una bala.
const CIFRAS = [
  ['###', '#.#', '#.#', '#.#', '###'],
  ['.#.', '##.', '.#.', '.#.', '###'],
  ['###', '..#', '###', '#..', '###'],
  ['###', '..#', '.##', '..#', '###'],
  ['#.#', '#.#', '###', '..#', '..#'],
  ['###', '#..', '###', '..#', '###'],
  ['###', '#..', '###', '#.#', '###'],
  ['###', '..#', '.#.', '.#.', '.#.'],
  ['###', '#.#', '###', '#.#', '###'],
  ['###', '#.#', '###', '..#', '###'],
]
const BALA = ['.#.', '###', '###', '###', '###']

// Un dibujo de filas, cada `#` de 2 × 2 pixeles, con sombra abajo a la derecha.
const dibujar = (celdas, filas, x, y, color) => {
  for (const [d, tinta] of [[1, SOMBRA], [0, color]])
    filas.forEach((fila, j) => [...fila].forEach((c, i) => c === '#' && [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([a, b]) => poner(celdas, x + i * 2 + a + d, y + j * 2 + b + d, tinta))))
}

// Las balas que quedan, en tres cifras. En cero, rojo y parpadeando.
export const municion = (celdas, u, quedan) => {
  const n = Math.max(0, Math.round(quedan))
  if (n === 0 && Math.floor(u * 16) % 2) return
  const color = n === 0 ? ROJO : AMBAR
  const [x, y] = [LADO - 33, ABAJO - 16]
  dibujar(celdas, BALA, x, y, color)
  String(n).padStart(3, '0').split('').forEach((c, i) => dibujar(celdas, CIFRAS[c], x + 8 + i * 8, y, color))
}

// Quien juega, a lo lejos por un ventanal: chiquito y sin marca.
const LEJOS = {
  cursor: ['#....', '##...', '#o#..', '#oo#.', '#ooo#', '#o##.', '##...'],
  huella: ['.ooo.', 'o#o#o', 'o#o#o', 'o#o#o', '.ooo.'],
}
export const aLoLejos = (celdas, modo, [x, y]) =>
  LEJOS[modo].forEach((fila, j) => [...fila].forEach((c, i) => c !== '.' && poner(celdas, Math.round(x) + i, Math.round(y) + j, c === '#' ? (modo === 'cursor' ? SOMBRA : '#2a1e18') : modo === 'cursor' ? '#ffffff' : '#c8bca8')))
