/**
 * La UF del día, en src/data/uf.js. Lo corre dos veces al día
 * .github/workflows/uf.yml, que hace commit si el valor cambió.
 *
 * Hay dos fuentes, y si una falla se prueba la otra: la tabla del SII, que es
 * oficial y rápida, y mindicador.cl, que publica los valores del Banco Central
 * pero a veces tarda o no responde. El convertidor del propio Banco Central no
 * sirve: un captcha lo cierra a cualquier script.
 */

import { writeFileSync } from 'node:fs'
import { setTimeout as esperar } from 'node:timers/promises'
import { UF } from '../src/data/uf.js'

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

// Si las dos fuentes fallan, se vuelve a probar tras cada pausa, por si la
// falla es de la red del runner y no de las fuentes.
const PAUSAS = [0, 30_000, 60_000]

async function pedir(url) {
  const respuesta = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  if (!respuesta.ok) throw new Error(`${url} respondió ${respuesta.status}`)
  return respuesta
}

// La tabla del año trae un bloque por mes, con el valor de cada día escrito a
// la chilena («41.194,55») y vacío los días que aún no se publican.
async function desdeSii() {
  const dia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date())
  const [año, mes, numero] = dia.split('-').map(Number)
  const html = await (await pedir(`https://www.sii.cl/valores_y_fechas/uf/uf${año}.htm`)).text()
  const bloque = html.split(`id='mes_${MESES[mes - 1]}'`)[1]?.split("class='meses'")[0]
  const celda = bloque?.match(new RegExp(`<strong>${numero}</strong></th>\\s*<td[^>]*>([\\d.]+,\\d+)</td>`))
  return { valor: Number(celda?.[1].replaceAll('.', '').replace(',', '.')), dia }
}

// La serie viene de la más nueva a la más vieja. La fecha es la medianoche de
// Chile en UTC, así que sus diez primeros caracteres son el día.
async function desdeMindicador() {
  const { valor, fecha } = (await (await pedir('https://mindicador.cl/api/uf')).json()).serie[0]
  return { valor, dia: String(fecha).slice(0, 10) }
}

// Lo que se escribe termina en el sitio: si no llega un número y una fecha, o
// si el valor salta más de lo que la UF se mueve en meses, se descarta.
function validar({ valor, dia }) {
  if (!Number.isFinite(valor) || !/^\d{4}-\d{2}-\d{2}$/.test(dia) || Math.abs(valor / UF.valor - 1) > 0.1) {
    throw new Error(`Respuesta inesperada: ${JSON.stringify({ valor, dia })}`)
  }
  return { valor, dia }
}

async function traerUf() {
  for (const pausa of PAUSAS) {
    await esperar(pausa)
    for (const fuente of [desdeSii, desdeMindicador]) {
      try {
        return validar(await fuente())
      } catch (error) {
        console.warn(`${fuente.name}: ${error.cause?.message ?? error.message}`)
      }
    }
  }
  throw new Error('Ninguna fuente entregó la UF')
}

const { valor, dia } = await traerUf()
writeFileSync(
  new URL('../src/data/uf.js', import.meta.url),
  `// Lo escribe scripts/uf.mjs cada día. No se edita a mano.\nexport const UF = { valor: ${valor}, fecha: '${dia}' }\n`
)
console.log(`UF del ${dia}: ${valor}`)
