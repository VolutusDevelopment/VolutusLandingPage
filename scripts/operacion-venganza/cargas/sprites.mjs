// Las tiras de las pantallas de carga (src/lib/cargas.js), menos la de
// duck-one, que pinta escena1/sprites.mjs. Cada personaje de tres cuartos,
// como en sus láminas (cargas.mjs), y cada marinero en su toma.
//
//   node scripts/operacion-venganza/cargas/sprites.mjs
//
// Se corre a mano y las imágenes se commitean en public/operacion-venganza.

import { marco } from '../pilotos/tres.mjs'
import { cerrarGpu } from '../pilotos/gpu.mjs'
import { PERSONAJES, dukyFigura } from '../pilotos/cuerpos.mjs'
import { ALMIRANTE, OFICIOS, corre } from '../escena1/personajes.mjs'
import { escribir, pixel3dGpu, png, rejilla } from '../tiras.mjs'
import { CARGAS, CUADROS, LADO } from '../../../src/lib/cargas.js'

const TRES_CUARTOS = { giro: -40, altura: 8 }
const fases = (pose) => Array.from({ length: CUADROS }, (_, k) => pose(k / CUADROS))
const andando = (archivo) => fases(PERSONAJES.find((p) => p.archivo === archivo).andando)

const tira = async (ruta, figuras, toma) => {
  const encuadre = ((m) => ({ c: m.c, radio: m.radio * 0.9 }))(marco(figuras[0]))
  const celdas = []
  for (const figura of figuras) celdas.push(rejilla(await pixel3dGpu(figura, toma, LADO, encuadre), LADO))
  escribir(ruta, png(celdas))
}

const FIGURAS = {
  '/operacion-venganza/carga-duke': andando('duke'),
  '/operacion-venganza/carga-moby-duck': andando('moby-duck'),
  // Sin las patas naranjas: la sombra sube a donde queda el cuerpo.
  '/operacion-venganza/carga-duky': [
    dukyFigura({})
      .filter((forma) => !(forma.pata && forma.rampa))
      .map((forma) => (forma.pata ? { ...forma, c: [forma.c[0], forma.c[1] + 0.3, forma.c[2]] } : forma)),
  ],
  '/operacion-venganza/carga-almirante': fases((u) => ALMIRANTE.andando(u * 2)),
}

for (const [ruta, figuras] of Object.entries(FIGURAS)) await tira(CARGAS[ruta].tira, figuras, TRES_CUARTOS)
for (const { tira: ruta, oficio, giro, altura } of CARGAS['/operacion-venganza/carga-marineros'].corredores)
  await tira(ruta, fases((u) => corre(OFICIOS[oficio], u)), { giro, altura })

await cerrarGpu()
