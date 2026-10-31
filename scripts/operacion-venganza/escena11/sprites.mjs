// Las tiras de la escena 11 (src/lib/escena11.js), una por toma (tiras.mjs).
// La pantalla de carga es la de la escena 1.
//
//   node scripts/operacion-venganza/escena11/sprites.mjs
//
// Se corre a mano cuando cambia una toma, y las imágenes se commitean en
// public/operacion-venganza: pintarlas tarda y no entra al build.

import { TOMAS_3D } from './tomas.mjs'
import { escribirTiras } from '../tiras.mjs'
import { TOMAS, rutaDeToma } from '../../../src/lib/escena11.js'

await escribirTiras(TOMAS, TOMAS_3D, rutaDeToma)
