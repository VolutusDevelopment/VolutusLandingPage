// Las tiras de la escena 1 (src/lib/escena1.js), una por toma (tiras.mjs), y
// la de duck-one caminando para la pantalla de carga (su lámina está en
// cargas.mjs). Se pintan con el mismo motor que las láminas.
//
//   node scripts/operacion-venganza/escena1/sprites.mjs
//
// Se corre a mano cuando cambia una toma, y las imágenes se commitean en
// public/operacion-venganza: pintarlas tarda y no entra al build.

import { marco } from '../pilotos/tres.mjs'
import { PERSONAJES } from '../pilotos/cuerpos.mjs'
import { TOMAS_3D } from './tomas.mjs'
import { escribir, escribirTiras, pixel3dGpu, png, rejilla } from '../tiras.mjs'
import { CARGA, TOMAS, rutaDeToma } from '../../../src/lib/escena1.js'

// duck-one de tres cuartos, como en la lámina de la pantalla de carga.
const duckOne = PERSONAJES.find((p) => p.archivo === 'duck-one')
const pasos = Array.from({ length: CARGA.cuadros }, (_, k) => duckOne.andando(k / CARGA.cuadros))
const encuadre = ((m) => ({ c: m.c, radio: m.radio * 0.9 }))(marco(pasos[0]))
// Si la escena se reparte en varios procesos, la carga la escribe solo el
// primero, para no pisarla entre ellos.
if (Number(process.env.TOMAS_DESDE ?? 0) === 0) {
  const celdas = []
  for (const paso of pasos) celdas.push(rejilla(await pixel3dGpu(paso, { giro: -40, altura: 8 }, CARGA.lado, encuadre), CARGA.lado))
  escribir(CARGA.ruta, png(celdas))
}

await escribirTiras(TOMAS, TOMAS_3D, rutaDeToma)
