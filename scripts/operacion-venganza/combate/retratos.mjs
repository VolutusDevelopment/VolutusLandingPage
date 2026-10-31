// Los retratos del cuadro de comunicaciones de los niveles (src/combate.js):
// cada piloto en su cabina, desde la cámara del tablero, hablando; y la torre
// de control, el oficial de la sala azul de la escena 11 con su radio. Una
// fila por quien habla, en el orden de `RETRATOS` (src/lib/cazas.js), con
// `CUADROS_DE_RETRATO` cuadros de `LADO_DE_RETRATO` px: el primero, callado.
//
//   node scripts/operacion-venganza/combate/retratos.mjs
//
// Se corre a mano cuando cambia un piloto, y la imagen se commitea en
// public/operacion-venganza: pintarla tarda y no entra al build.

import { transformar } from '../pilotos/tres.mjs'
import { cerrarGpu } from '../pilotos/gpu.mjs'
import { PERSONAJES, cabina } from '../pilotos/cuerpos.mjs'
import { ACELERADOR, CABINAS, PALANCA, aCaza, avion, cabinaCon } from '../pilotos/interiores.mjs'
import { MAR, cielo } from '../escena1/lugares.mjs'
import { TOMAS_3D } from '../escena11/tomas.mjs'
import { escribir, pixel3dGpu, png, rejilla } from '../tiras.mjs'
import { CUADROS_DE_RETRATO, LADO_DE_RETRATO, RETRATOS, rutaDeRetratos } from '../../../src/lib/cazas.js'

const N = LADO_DE_RETRATO
const ALTURA = [0, 300, 0]
const sum = (a, b) => a.map((v, i) => v + b[i])

// Un piloto en su cabina, a 300 m sobre el mar, desde el tablero: la cara y
// los hombros, con la cúpula y el atardecer detrás.
const piloto = (p) => {
  const cfg = { ...CABINAS[p.archivo] }
  cfg.avion = avion(cfg)
  const [x, y] = cfg.cabezaU
  const camara = { ojo: sum(aCaza(cfg, [x + 3.4, y + 0.35, 0]), ALTURA), mira: sum(aCaza(cfg, [x, y - 0.15, 0]), ALTURA), campo: 50 }
  return (u) => {
    cabina.reposo = (s) => (s > 0 ? PALANCA : ACELERADOR)
    const figura = [MAR, ...transformar([0, 0, 0], [0, 0, 0], ALTURA).formas(cabinaCon(cfg, p.hablando(u)))]
    cabina.reposo = null
    return [figura, camara]
  }
}

// El oficial, de frente y de cerca, con la radio en la mano.
const torre = (u) => [TOMAS_3D.radio.escena(u), { ojo: [2.7, 1.2, 0.16], mira: [1.0, 1.0, -0.05], campo: 40 }]

const QUIENES = {
  'duck-one': piloto(PERSONAJES[0]),
  moby: piloto(PERSONAJES[1]),
  duke: piloto(PERSONAJES[2]),
  duky: piloto(PERSONAJES[3]),
  torre,
}

const cuadros = []
for (const { retrato } of RETRATOS) {
  const fila = []
  for (let k = 0; k < CUADROS_DE_RETRATO; k++) {
    const [figura, camara] = QUIENES[retrato](k / CUADROS_DE_RETRATO)
    fila.push(rejilla(await pixel3dGpu(figura, { ...camara, cielo, instante: k }, N, { c: [0, 0, 0], radio: 1 }), N))
  }
  cuadros.push(fila)
}
const hoja = Array.from({ length: N * RETRATOS.length }, (_, y) => cuadros[Math.floor(y / N)].flatMap((cuadro) => cuadro[y % N]))
escribir(rutaDeRetratos, png([hoja]))

await cerrarGpu()
