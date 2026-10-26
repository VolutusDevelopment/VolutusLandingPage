// Las tiras de la escena 1 (src/lib/escena1.js), una por toma (tiras.mjs), y
// la de duck-one caminando para la pantalla de carga. Se pintan con el mismo
// motor que las láminas.
//
//   node scripts/operacion-venganza/escena1/sprites.mjs
//
// Se corre a mano cuando cambia una toma, y las imágenes se commitean en
// public/operacion-venganza: pintarlas tarda y no entra al build.

import { pixel3d, marco } from '../pilotos/tres.mjs'
import { PERSONAJES } from '../pilotos/cuerpos.mjs'
import { TOMAS_3D } from './tomas.mjs'
import { escribir, escribirTiras, png, rejilla } from '../tiras.mjs'
import { CARGA, TOMAS, rutaDeToma } from '../../../src/lib/escena1.js'

// duck-one de tres cuartos, como en la lámina de la pantalla de carga.
const duckOne = PERSONAJES.find((p) => p.archivo === 'duck-one')
const pasos = Array.from({ length: CARGA.cuadros }, (_, k) => duckOne.andando(k / CARGA.cuadros))
const encuadre = ((m) => ({ c: m.c, radio: m.radio * 0.9 }))(marco(pasos[0]))
escribir(CARGA.ruta, png(pasos.map((f) => rejilla(pixel3d(f, { giro: -40, altura: 8 }, CARGA.lado, 1, encuadre), CARGA.lado))))

escribirTiras(TOMAS, TOMAS_3D, rutaDeToma)
