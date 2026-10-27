// Lo que la escena 13 pinta sobre los cuadros de la cabina de duky (el
// `encima` de tiras.mjs), en pixeles del cuadro de LADO × LADO: quien juega,
// marcado como en la escena 6, y el anillo de su clic.

import { objetivo, poner } from '../escena6/visor.mjs'

// Un anillo blanco de radio `r` alrededor de [x, y], de borde sombreado.
const anillo = (celdas, [x, y], r) => {
  for (let a = 0; a < 64; a++) {
    const [dx, dy] = [Math.cos((a / 64) * Math.PI * 2), Math.sin((a / 64) * Math.PI * 2)]
    poner(celdas, Math.round(x + dx * (r + 1)), Math.round(y + dy * (r + 1)), '#16191e')
    poner(celdas, Math.round(x + dx * r), Math.round(y + dy * r), '#ffffff')
  }
}

// Quien juega en `en` ([x, y], o null si no está en el cuadro) y, con
// `clic` de 0 a 1, el anillo que se abre desde la punta del cursor o el
// centro de la huella.
export const enemigo = (celdas, u, modo, en, clic = 0) => {
  if (!en) return
  const [x, y] = en.map(Math.round)
  objetivo(celdas, u, modo, [x, y])
  if (clic > 0 && clic < 1) anillo(celdas, modo === 'cursor' ? [x - 3, y - 8] : [x, y], 3 + 14 * clic)
}
