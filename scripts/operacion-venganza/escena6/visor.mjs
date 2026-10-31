// Lo que la escena 6 pinta sobre los cuadros (el `encima` de tiras.mjs), en
// pixeles del cuadro de ANCHO × ALTO (src/lib/escena1.js): el visor de la
// cámara de la cabina de duke y la marca de quien juega en el cielo.

import { ALTO, ANCHO } from '../../../src/lib/escena1.js'
import { BORDE, FLECHA, HUELLA } from '../../../src/lib/flecha.js'

const BLANCO = '#ffffff'
const SOMBRA = '#16191e'
const ROJO = '#e0201c'

export const poner = (celdas, x, y, color) => {
  if (y >= 0 && y < ALTO && x >= 0 && x < ANCHO) celdas[y][x] = color
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
  esquinas(celdas, [5, 5, ANCHO - 6, ALTO - 6], 9, BLANCO)
  if (Math.floor(u * 8) % 2 === 0) dibujar(celdas, PUNTO, 11, 11, ROJO)
  dibujar(celdas, REC, 17, 11, BLANCO)
}

// Quien juega, marcado en el cielo en `[x, y]` (al medio del cuadro, si no se
// dice): su cursor o su huella, entre cuatro esquinas rojas que laten.
export const objetivo = (celdas, u, modo, [x, y] = [ANCHO / 2, ALTO / 2]) => {
  const [dibujo, dx, dy] = modo === 'cursor' ? [FLECHA, 3, 8] : [HUELLA, 5, 7]
  dibujo.forEach((fila, j) => [...fila].forEach((c, i) => c !== ' ' && poner(celdas, x - dx + i, y - dy + j, c === 'X' ? BORDE : BLANCO)))
  const lado = 14 + Math.abs(Math.floor(u * 12) % 2)
  esquinas(celdas, [x - lado, y - lado, x + lado, y + lado], 5, ROJO)
}
