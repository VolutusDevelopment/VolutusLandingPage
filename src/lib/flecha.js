// La flecha de quien juega con ratón, pixel a pixel: X borde, W relleno. Es
// el personaje del combate (src/combate.js) y el cursor de las escenas
// (src/operacion-venganza.js).
export const FLECHA = [
  'X',
  'XX',
  'XWX',
  'XWWX',
  'XWWWX',
  'XWWWWX',
  'XWWWWWX',
  'XWWWWWWX',
  'XWWWWXXXX',
  'XWWXWWX',
  'XWX XWWX',
  'XX  XWWX',
  'X    XWWX',
  '     XWWX',
  '      XX',
]

// Cuántos px de pantalla mide un pixel del juego en una vista de `ancho` × `alto`.
export const escalaDe = (ancho, alto) => Math.max(2, Math.ceil(Math.sqrt((ancho * alto) / 62000)))
