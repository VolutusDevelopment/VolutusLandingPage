/**
 * El pato de las páginas de error, cuadro por cuadro. Lo usan dos: el juego
 * (src/patos.js), que lo pinta con los puntos de la trama de la nube, y el
 * botón que lo abre (PaginaDeError.jsx), que lleva el mismo pato punto por
 * punto. Un solo dibujo para los dos, así el botón no puede prometer otro
 * pato.
 *
 * Miran a la derecha. Una letra por punto: verde la cabeza, café el cuerpo,
 * ocre el ala, naranjo el pico y las patas, blanco el ojo y el collar, negra la
 * pupila. El punto es vacío. Los colores son los del NES, a propósito
 * (DESIGN-BRIEF, decisión 21).
 */

export const COLORES = {
  v: '#00a800',
  c: '#881400',
  o: '#ac7c00',
  n: '#fca044',
  b: '#fcfcfc',
  k: '#000000',
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

// Cayendo va de cabeza: el herido, girado un cuarto de vuelta.
export const CAE = girar(HERIDO)

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
