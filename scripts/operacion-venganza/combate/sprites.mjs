// Las hojas de los cazas del combate (src/lib/cazas.js): cada caza desde todos
// sus giros y alturas, con las llamas de los motores atrás. El F-14 de
// duck-one vuela con las alas barridas, como sale de la escena 3.
//
//   node scripts/operacion-venganza/combate/sprites.mjs
//
// Se corre a mano cuando cambia un caza, y las imágenes se commitean en
// public/operacion-venganza: pintarlas tarda y no entra al build.

import { marco, pixel3d } from '../pilotos/tres.mjs'
import { ALAS_TOMCAT, CAZA_DUCK_ONE, CAZA_DUKE, CAZA_DUKY, CAZA_MOBY, barrerAlas } from '../pilotos/modelos.mjs'
import { escribir, png, rejilla } from '../tiras.mjs'
import { ALTURAS, GIROS, LADO, LLENADO, RADIO, rutaDeCaza } from '../../../src/lib/cazas.js'

const CAZAS = { 'duck-one': barrerAlas(CAZA_DUCK_ONE, ALAS_TOMCAT.barridas), moby: CAZA_MOBY, duke: CAZA_DUKE, duky: CAZA_DUKY }

for (const [nombre, caza] of Object.entries(CAZAS)) {
  const encuadre = { c: marco(caza, true).c, radio: RADIO }
  const hoja = Array.from({ length: LADO * ALTURAS.length }, () => Array(LADO * GIROS).fill(null))
  ALTURAS.forEach((altura, fila) => {
    for (let giro = 0; giro < GIROS; giro++) {
      const celdas = rejilla(pixel3d(caza, { giro: giro * (360 / GIROS), altura }, LADO, 1, encuadre, LLENADO), LADO)
      celdas.forEach((linea, y) => linea.forEach((color, x) => (hoja[fila * LADO + y][giro * LADO + x] = color)))
    }
  })
  escribir(rutaDeCaza(nombre), png([hoja]))
}
