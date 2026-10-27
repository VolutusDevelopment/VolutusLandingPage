// Lo que la escena 6 pinta sobre los cuadros (el `encima` de tiras.mjs), en
// pixeles del cuadro de LADO × LADO: el visor de la cámara de la cabina de
// duke y la marca de quien juega en el cielo. Solo se ve la franja del medio,
// de ALTO pixeles (src/lib/escena1.js).

import { ALTO, LADO } from '../../../src/lib/escena1.js'
import { FLECHA } from '../escena1/lugares.mjs'

const ARRIBA = (LADO - ALTO) / 2
const ABAJO = ARRIBA + ALTO - 1
const MEDIO = LADO / 2

const BLANCO = '#ffffff'
const SOMBRA = '#16191e'
const ROJO = '#e0201c'

export const poner = (celdas, x, y, color) => {
  if (y >= 0 && y < LADO && x >= 0 && x < LADO) celdas[y][x] = color
}

// Un dibujo de filas: `#` va de `color` y lleva sombra abajo a la derecha.
const dibujar = (celdas, filas, x, y, color) => {
  for (const [dx, tinta] of [[1, SOMBRA], [0, color]]) filas.forEach((fila, j) => [...fila].forEach((c, i) => c === '#' && poner(celdas, x + i + dx, y + j + dx, tinta)))
}

// Las cuatro esquinas de un recuadro, con brazos de `brazo` pixeles.
const esquinas = (celdas, [x0, y0, x1, y1], brazo, color) => {
  for (const [x, y, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]])
    for (let k = 0; k < brazo; k++) {
      poner(celdas, x + dx * k, y, color)
      poner(celdas, x, y + dy * k, color)
    }
}

const REC = ['###.###.###', '#.#.#...#..', '##..##..#..', '#.#.#...#..', '#.#.###.###']
const PUNTO = ['.##.', '####', '####', '.##.']

// La cámara de la cabina, grabando: el recuadro y, arriba a la izquierda, el
// punto rojo que parpadea y «REC».
export const grabando = (celdas, u) => {
  esquinas(celdas, [5, ARRIBA + 5, LADO - 6, ABAJO - 5], 9, BLANCO)
  if (Math.floor(u * 8) % 2 === 0) dibujar(celdas, PUNTO, 11, ARRIBA + 11, ROJO)
  dibujar(celdas, REC, 17, ARRIBA + 11, BLANCO)
}

// Una huella de 11 × 15 pixeles: surcos en óvalo, como en la pantalla de la sala.
const HUELLA = Array.from({ length: 15 }, (_, j) =>
  Array.from({ length: 11 }, (_, i) => {
    const [x, y] = [(i - 5) / 5.5, (j - 7) / 7.5]
    const r = Math.hypot(x, y)
    if (r > 1) return null
    return Math.sin(r * 9 + Math.sin(Math.atan2(y, x) * 2 + r * 3) * 1.2) > 0.1 ? '#2a1e18' : '#c8bca8'
  }),
)

// Quien juega, marcado en el cielo en `[x, y]` (al medio del cuadro, si no se
// dice): su cursor o su huella, entre cuatro esquinas rojas que laten.
export const objetivo = (celdas, u, modo, [x, y] = [MEDIO, MEDIO]) => {
  if (modo === 'cursor') FLECHA.forEach((fila, j) => [...fila].forEach((c, i) => c !== '.' && poner(celdas, x - 3 + i, y - 8 + j, c === '#' ? '#0c0e12' : BLANCO)))
  else HUELLA.forEach((fila, j) => fila.forEach((c, i) => c && poner(celdas, x - 5 + i, y - 7 + j, c)))
  const lado = 14 + (Math.floor(u * 12) % 2)
  esquinas(celdas, [x - lado, y - lado, x + lado, y + lado], 5, ROJO)
}
