// Las tiras de la escena 16 (src/lib/escena16.js), una por toma (tiras.mjs),
// las de los dos finales también. La pantalla de carga es la de la escena 1.
//
//   node scripts/operacion-venganza/escena16/sprites.mjs
//
// Se corre a mano cuando cambia una toma, y las imágenes se commitean en
// public/operacion-venganza: pintarlas tarda y no entra al build.

import { TOMAS_3D } from './tomas.mjs'
import { escribirTiras } from '../tiras.mjs'
import { TODAS, rutaDeToma } from '../../../src/lib/escena16.js'

await escribirTiras(TODAS, TOMAS_3D, rutaDeToma)
