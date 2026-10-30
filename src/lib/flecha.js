// La flecha de quien juega con ratón, pixel a pixel: X borde, de `BORDE`, y W
// relleno, blanco. Es el personaje del combate (src/combate.js), el cursor de
// las escenas (src/operacion-venganza.js) y la que se ve en las pantallas de
// las tomas (scripts/operacion-venganza): la misma en todas partes.
export const FLECHA = [
  'X',
  'XX',
  'XWX',
  'XWWX',
  'XWWWX',
  'XWWWWX',
  'XWWWWWX',
  'XWWWWWWX',
  'XWWWWWWWX',
  'XWWWWWWWWX',
  'XWWWWWXXXXX',
  'XWWXWWX',
  'XWX XWWX',
  'XX  XWWX',
  'X    XWWX',
  '     XWWX',
  '      XX',
]
export const BORDE = '#0c0e12'

// Cuántos px de pantalla mide un pixel del juego en una vista de `ancho` × `alto`.
export const escalaDe = (ancho, alto) => Math.max(2, Math.ceil(Math.sqrt((ancho * alto) / 62000)))
