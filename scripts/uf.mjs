/**
 * La UF del día, en src/data/uf.js. Lo corre cada mañana
 * .github/workflows/uf.yml, que hace commit si el valor cambió.
 *
 * La trae de mindicador.cl, que publica los valores del Banco Central. El
 * convertidor del propio Banco Central no sirve: un captcha lo cierra a
 * cualquier script.
 */

import { writeFileSync } from 'node:fs'
import { UF } from '../src/data/uf.js'

const respuesta = await fetch('https://mindicador.cl/api/uf', { signal: AbortSignal.timeout(30_000) })
if (!respuesta.ok) throw new Error(`mindicador.cl respondió ${respuesta.status}`)

// La serie viene de la más nueva a la más vieja. La fecha es la medianoche de
// Chile en UTC, así que sus diez primeros caracteres son el día.
const { valor, fecha } = (await respuesta.json()).serie[0]
const dia = String(fecha).slice(0, 10)

// Lo que se escribe termina en el sitio: si no llega un número y una fecha, o
// si el valor salta más de lo que la UF se mueve en meses, mejor fallar.
if (!Number.isFinite(valor) || !/^\d{4}-\d{2}-\d{2}$/.test(dia) || Math.abs(valor / UF.valor - 1) > 0.1) {
  throw new Error(`Respuesta inesperada de mindicador.cl: ${JSON.stringify({ valor, fecha })}`)
}

writeFileSync(
  new URL('../src/data/uf.js', import.meta.url),
  `// Lo escribe scripts/uf.mjs cada día. No se edita a mano.\nexport const UF = { valor: ${valor}, fecha: '${dia}' }\n`
)
console.log(`UF del ${dia}: ${valor}`)
