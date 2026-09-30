// Kit de marca: el logotipo y el símbolo como archivos SVG sueltos.
//
//   node scripts/marca.mjs
//
// La página no usa estos archivos —dibuja la marca inline desde la misma
// geometría—; son para todo lo que vive fuera de ella: firma de correo,
// documentos, redes. Salen de `logotipo.js` y `espiral.js`, así que nunca se
// desvían de lo que la página muestra. Se vuelven a exportar solo cuando el
// logotipo cambia.
//
// Dos colores, los de texto de cada zona (DESIGN.md, Color), y la trama al
// 80 %, igual que en la barra. Dos tamaños de trama, con la misma regla que la
// página: la fina para el logotipo grande, la gruesa por debajo de ~60 px de
// alto, donde la fina se empasta.

import { mkdirSync, writeFileSync } from 'node:fs'
import { VOLUTA } from '../src/lib/espiral.js'
import { LETRAS, TRAMAS } from '../src/lib/logotipo.js'

const SALIDA = new URL('../public/marca/', import.meta.url)

const COLORES = { claro: '#151515', oscuro: '#eef3f1' }

const logotipo = (trama, color) => {
  const { viewBox, puntos } = TRAMAS[trama]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><title>Volutus</title><path d="${puntos}" fill="${color}" fill-opacity="0.8"/><path d="${LETRAS}" fill="${color}"/></svg>\n`
}

const simbolo = (color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Volutus</title><path d="${VOLUTA.d}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`

mkdirSync(SALIDA, { recursive: true })

for (const [fondo, color] of Object.entries(COLORES)) {
  const archivos = {
    [`volutus-logotipo-${fondo}.svg`]: logotipo('fina', color),
    [`volutus-logotipo-pequeno-${fondo}.svg`]: logotipo('gruesa', color),
    [`volutus-simbolo-${fondo}.svg`]: simbolo(color),
  }
  for (const [nombre, svg] of Object.entries(archivos)) {
    writeFileSync(new URL(nombre, SALIDA), svg)
    console.log(`public/marca/${nombre}`)
  }
}
