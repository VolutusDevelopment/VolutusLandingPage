// Las tiras de la escena 2 (src/lib/escena2.js), una por toma (tiras.mjs);
// las que ven la pantalla de la sala, una por modo. La pantalla de carga es
// la de la escena 1.
//
//   node scripts/operacion-venganza/escena2/sprites.mjs
//
// Se corre a mano cuando cambia una toma, y las imágenes se commitean en
// public/operacion-venganza: pintarlas tarda y no entra al build.

import { TOMAS_3D } from './tomas.mjs'
import { escribirTiras } from '../tiras.mjs'
import { TOMAS, rutaDeToma } from '../../../src/lib/escena2.js'

await escribirTiras(TOMAS, TOMAS_3D, rutaDeToma)
