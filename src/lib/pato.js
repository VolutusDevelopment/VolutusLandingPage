/**
 * El pato, cuadro por cuadro. Lo usan tres, y los tres lo pintan en cuadrados:
 * el juego (src/patos.js), sobre la rejilla de la nube; el botón que lo abre
 * (PaginaDeError.jsx), y el mar del pie (nubes-lienzo.js), donde sale a nadar.
 * Un solo dibujo para todos, así ninguno puede prometer otro pato.
 *
 * Miran a la derecha. Una letra por punto: verde la cabeza, café el cuerpo,
 * ocre el ala, naranjo el pico y las patas, blanco el ojo y el collar, negra la
 * pupila, celeste la lágrima del que reclama, gris el casco del modo «Odio a
 * los patos» y amarilla la aureola de los cazados. El punto es vacío. Los
 * colores son los del NES, a propósito (DESIGN-BRIEF, decisión 21).
 */

export const COLORES = {
  v: '#00a800',
  c: '#881400',
  o: '#ac7c00',
  n: '#fca044',
  b: '#fcfcfc',
  k: '#000000',
  a: '#3cbcfc',
  g: '#bcbcbc',
  y: '#f8d878',
}

export const ARRIBA = [
  '..oo............',
  '..ooo...........',
  '...ooo......vv..',
  '...oooo....vvvv.',
  '....oooo...vbkvn',
  '....ooooo..vvvvn',
  '.c...oooo..bbb..',
  'cc...ooocccccc..',
  'cccccccccccccc..',
  '.cccccccccccc...',
  '...cccccccc.....',
  '....n...n.......',
  '................',
]

export const ABAJO = [
  '................',
  '................',
  '............vv..',
  '...........vvvv.',
  '...........vbkvn',
  '...........vvvvn',
  '.c.........bbb..',
  'cc...ccccccccc..',
  'ccccooooocccc...',
  '.cccoooooccc....',
  '....oooooc......',
  '....oooon.n.....',
  '.....oo.........',
]

export const HERIDO = [
  'o...........o...',
  'oo.........oo...',
  '.oo.......oo....',
  '.ooo.....ooo....',
  '..ooo...ooo.vv..',
  '...ooo.ooo.vbbv.',
  '....ooooo..vbbvn',
  '.c...ooo...vvvvn',
  'cc..ccccccccbb..',
  'cccccccccccccc..',
  '.cccccccccccc...',
  '...cccccccc.....',
  '....n...n.......',
]

// El yelmo de caballero de los patos del modo «Odio a los patos», con penacho
// y visera, en una capa aparte que se pinta encima de cualquier cuadro de
// vuelo: la cabeza es la misma en todos.
export const CASCO = [
  '.........cc.....',
  '..........ccgg..',
  '..........ggggg.',
  '..........gggggg',
  '..........gkkkgg',
  '..........gggggg',
  '..........gggg..',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
]

// La aureola de los cazados que suben al cielo al final de la partida, en una
// capa aparte que va sobre la cabeza, como el casco.
export const AUREOLA = [
  '...........yyy..',
  '..........y...y.',
  '...........yyy..',
]

// Cayendo va de cabeza: el herido, girado un cuarto de vuelta.
export const CAE = girar(HERIDO)

// Nadando: el ala plegada sobre el cuerpo y las patas bajo el agua. La panza
// es la fila 11, y `FLOTACION` es el punto de la línea de flotación: la
// columna del medio de esa fila. Lo de abajo lo tapa el agua sola (ver `MAR`
// en lib/mar.js).
export const NADA = [
  '................',
  '................',
  '................',
  '............vv..',
  '...........vvvv.',
  '...........vbkvn',
  '...........vvvvn',
  '.c.........bbb..',
  'cc...ooooocccc..',
  'ccccooooooocccc.',
  '.ccccooooocccc..',
  '..cccccccccccc..',
  '................',
]

export const FLOTACION = [8, 11]

// Un cuarto de vuelta en el sentido del reloj: la columna de la izquierda pasa
// a ser la fila de arriba.
function girar(filas) {
  return [...filas[0]].map((_, x) =>
    filas
      .map((fila) => fila[x])
      .reverse()
      .join(''),
  )
}
