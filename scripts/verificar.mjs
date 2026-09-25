// Verificación de la página contra una base de referencia.
//
// Corre la página en un navegador real y compara un puñado de medidas con las
// de `tests/referencia.json`. Si algo se movió, lo dice y falla.
//
//   node scripts/verificar.mjs                 compara contra la referencia
//   node scripts/verificar.mjs --actualizar    reescribe la referencia
//
// Necesita el sitio servido en http://127.0.0.1:8787 (wrangler dev) y
// Playwright disponible. No es dependencia del repo: se invoca con npx.
//
// **Por qué medidas y no capturas.** Un diff de píxeles sobre una página con
// fotografía y tipografía web da falsos positivos cada vez que cambia el
// antialiasing o el sistema operativo, y acaba desactivado por ruidoso. Las
// medidas de abajo son las que de verdad se rompen sin que nadie lo note, y
// son las que se rompieron de verdad en este proyecto:
//
//   - La entrada al scroll dejó el contenido en opacidad 0 al imprimir y al
//     llegar por un ancla. Dos días sin que nadie lo viera.
//   - El anillo de foco desapareció del enlace de salto porque `--foco` no
//     resolvía fuera de las zonas.
//   - El desbordamiento horizontal aparece en un solo ancho y solo si se mira.
//
// Cada comprobación de aquí existe porque su fallo ya ocurrió.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:8787'
const REFERENCIA = fileURLToPath(new URL('../tests/referencia.json', import.meta.url))
const actualizar = process.argv.includes('--actualizar')

// Tolerancia en píxeles. Las alturas varían un poco entre versiones del motor
// y entre sistemas; lo que importa es que no cambien de golpe.
const MARGEN = 24

// Playwright no es dependencia del repo: instalarlo arrastra los navegadores
// enteros y esta comprobación se corre a mano, no en cada build.
//
// Se busca primero como módulo normal y, si no está, donde diga PLAYWRIGHT.
// NODE_PATH no sirve aquí: los módulos ESM no lo consultan.
//
//   PLAYWRIGHT=/ruta/a/node_modules/playwright \
//   CHROMIUM=/ruta/a/chrome.exe \
//   node scripts/verificar.mjs
let chromium
try {
  // Una ruta absoluta no es un especificador válido para import(): en Windows
  // `C:/...` se interpreta como un protocolo. Hay que pasarla como file://.
  const desde = process.env.PLAYWRIGHT ? pathToFileURL(process.env.PLAYWRIGHT).href : 'playwright'
  ;({ chromium } = await import(desde))
} catch {
  console.error(
    'Falta Playwright.\n' +
      '  npm i playwright && npx playwright install chromium\n' +
      'Si ya lo tienes en otro sitio, apúntalo:\n' +
      '  PLAYWRIGHT=/ruta/a/node_modules/playwright node scripts/verificar.mjs\n'
  )
  process.exit(2)
}

const ANCHOS = [
  ['movil', 390, 844],
  ['tablet', 768, 1024],
  ['escritorio', 1440, 900],
]

// CHROMIUM permite usar un binario ya presente en la máquina en vez de bajar
// otro: Playwright espera una compilación concreta y no siempre está.
const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
)

async function medir(ruta, ancho, alto, tema) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: alto } })
  const pagina = await ctx.newPage()
  if (tema) {
    await pagina.addInitScript(
      (t) => localStorage.setItem('a11y-preferencias', JSON.stringify({ tema: t, escala: '1', movimiento: 'normal' })),
      tema
    )
  }
  await pagina.goto(BASE + ruta, { waitUntil: 'networkidle' })
  await pagina.waitForTimeout(600)

  const medidas = await pagina.evaluate(() => {
    const raiz = document.documentElement
    return {
      alto: raiz.scrollHeight,
      desborda: raiz.scrollWidth > raiz.clientWidth,
      h1: document.querySelector('h1')?.getBoundingClientRect().height ?? 0,
      // Todo lo que anima al entrar tiene que ser alcanzable. Si un bloque se
      // queda en 0 después de recorrer la página, no se puede leer nunca.
      bloquesQueEntran: document.querySelectorAll('.entra').length,
    }
  })

  // Recorrer la página resuelve las entradas al scroll. Después, nada puede
  // seguir invisible.
  //
  // Dos detalles que producen falsos positivos si se olvidan: se mide sobre
  // `documentElement` y no sobre `body` —el segundo puede ser más corto y deja
  // el recorrido a medias—, y el desplazamiento va en `instant`, porque la
  // página usa `scroll-behavior: smooth` y con el suave todavía se está
  // moviendo cuando se lee la opacidad.
  await pagina.evaluate(async () => {
    const raiz = document.documentElement
    const tope = raiz.scrollHeight - window.innerHeight
    for (let y = 0; y <= tope; y += 300) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 25))
    }
    window.scrollTo({ top: tope, behavior: 'instant' })
    await new Promise((r) => setTimeout(r, 120))
  })
  await pagina.waitForTimeout(300)
  medidas.ocultosTrasRecorrer = await pagina.$$eval('.entra', (els) =>
    els.filter((e) => Number(getComputedStyle(e).opacity) < 0.05).length
  )

  // Al imprimir no hay scroll: lo que dependa de él se queda en su primer
  // fotograma. Es el modo de fallar que dejó las hojas en blanco.
  await pagina.emulateMedia({ media: 'print' })
  await pagina.evaluate(() => window.scrollTo(0, 0))
  await pagina.waitForTimeout(200)
  medidas.ocultosAlImprimir = await pagina.$$eval('.entra', (els) =>
    els.filter((e) => Number(getComputedStyle(e).opacity) < 0.05).length
  )
  await pagina.emulateMedia({ media: 'screen' })

  await ctx.close()
  return medidas
}

/** Recorre la página con el tabulador y comprueba que cada parada se ve. */
async function medirFoco(ruta) {
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 900 } })
  const pagina = await ctx.newPage()
  await pagina.goto(BASE + ruta, { waitUntil: 'networkidle' })
  await pagina.evaluate(async () => {
    const raiz = document.documentElement
    const tope = raiz.scrollHeight - window.innerHeight
    for (let y = 0; y <= tope; y += 300) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 25))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await pagina.waitForTimeout(400)

  let paradas = 0
  let sinAnillo = 0
  for (let i = 0; i < 60; i++) {
    await pagina.keyboard.press('Tab')
    const estado = await pagina.evaluate(() => {
      const e = document.activeElement
      if (!e || e === document.body) return null
      const s = getComputedStyle(e)
      return { estilo: s.outlineStyle, ancho: parseFloat(s.outlineWidth) }
    })
    if (!estado) break
    paradas++
    if (estado.estilo === 'none' || estado.ancho < 2) sinAnillo++
  }
  await ctx.close()
  return { paradas, sinAnillo }
}

const actual = { rutas: {}, foco: {} }

for (const ruta of ['/', '/privacidad']) {
  actual.rutas[ruta] = {}
  for (const [nombre, ancho, alto] of ANCHOS) {
    actual.rutas[ruta][nombre] = await medir(ruta, ancho, alto, null)
  }
  actual.rutas[ruta].oscuro = await medir(ruta, 1440, 900, 'oscuro')
  actual.foco[ruta] = await medirFoco(ruta)
}

await navegador.close()

if (actualizar) {
  writeFileSync(REFERENCIA, JSON.stringify(actual, null, 2) + '\n')
  console.log('referencia actualizada')
  process.exit(0)
}

const referencia = JSON.parse(readFileSync(REFERENCIA, 'utf8'))
const fallos = []

for (const [ruta, anchos] of Object.entries(actual.rutas)) {
  for (const [nombre, m] of Object.entries(anchos)) {
    const r = referencia.rutas?.[ruta]?.[nombre]
    if (!r) {
      fallos.push(`${ruta} ${nombre}: no está en la referencia`)
      continue
    }
    if (m.desborda) fallos.push(`${ruta} ${nombre}: desbordamiento horizontal`)
    if (m.ocultosTrasRecorrer > 0)
      fallos.push(`${ruta} ${nombre}: ${m.ocultosTrasRecorrer} bloques siguen invisibles tras recorrer la página`)
    if (m.ocultosAlImprimir > 0)
      fallos.push(`${ruta} ${nombre}: ${m.ocultosAlImprimir} bloques invisibles al imprimir`)
    if (Math.abs(m.alto - r.alto) > MARGEN)
      fallos.push(`${ruta} ${nombre}: el alto pasó de ${r.alto} a ${m.alto}`)
    if (Math.abs(m.h1 - r.h1) > MARGEN)
      fallos.push(`${ruta} ${nombre}: el titular pasó de ${Math.round(r.h1)} a ${Math.round(m.h1)} px de alto`)
  }
}

for (const [ruta, f] of Object.entries(actual.foco)) {
  const r = referencia.foco?.[ruta]
  if (f.sinAnillo > 0) fallos.push(`${ruta}: ${f.sinAnillo} paradas de teclado sin anillo de foco`)
  if (r && f.paradas !== r.paradas)
    fallos.push(`${ruta}: las paradas de teclado pasaron de ${r.paradas} a ${f.paradas}`)
}

if (fallos.length) {
  console.error('\nDIFERENCIAS:\n' + fallos.map((f) => '  · ' + f).join('\n') + '\n')
  console.error('Si el cambio es intencionado: node scripts/verificar.mjs --actualizar\n')
  process.exit(1)
}

console.log('todo coincide con la referencia')
