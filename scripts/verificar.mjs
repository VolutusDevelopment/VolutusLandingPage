// Verificación de la página contra una base de referencia.
//
// Corre la página en un navegador real y compara un puñado de medidas con las
// de `tests/referencia.json`. Si algo se movió, lo dice y falla.
//
//   node scripts/verificar.mjs                 compara contra la referencia
//   node scripts/verificar.mjs --actualizar    reescribe la referencia
//
// Necesita el sitio servido en http://127.0.0.1:8787 (wrangler dev) y
// Chromium de Playwright instalado (`pnpm exec playwright install chromium`).
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
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:8787'
const REFERENCIA = fileURLToPath(new URL('../tests/referencia.json', import.meta.url))
const actualizar = process.argv.includes('--actualizar')

// Tolerancia en píxeles. Las alturas varían un poco entre versiones del motor
// y entre sistemas; lo que importa es que no cambien de golpe.
const MARGEN = 24

const ANCHOS = [
  ['movil', 390, 844],
  ['tablet', 768, 1024],
  ['escritorio', 1440, 900],
]

const navegador = await chromium.launch()

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

/**
 * Comprueba que todos los enlaces internos de una página llevan a algún sitio.
 *
 * Existe porque este fallo ya ocurrió y nadie lo vio: la barra y el pie
 * llevaban anclas peladas —`#proyectos`— que en la portada funcionan y en
 * /privacidad resuelven a `/privacidad#proyectos`, una sección que esa página
 * no tiene. El enlace parece correcto en el código y en pantalla; solo falla
 * al pulsarlo, que es el peor momento para enterarse.
 *
 * Se comprueban las tres formas de romperse: el ancla local que no existe, la
 * ruta que responde error, y la ruta correcta con un ancla que la página de
 * destino no tiene.
 */
async function enlacesRotos(ruta) {
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 900 } })
  const pagina = await ctx.newPage()
  await pagina.goto(BASE + ruta, { waitUntil: 'networkidle' })

  const enlaces = await pagina.$$eval('a[href]', (els) =>
    els.map((e) => ({ href: e.getAttribute('href'), abs: e.href }))
  )

  const rotos = []
  for (const { href, abs } of enlaces) {
    if (href.startsWith('http') || href.startsWith('mailto:')) continue

    if (href.startsWith('#')) {
      const existe = await pagina.evaluate((id) => Boolean(document.getElementById(id)), href.slice(1))
      if (!existe) rotos.push(`${ruta}: «${href}» no existe en esta página`)
      continue
    }

    const destino = new URL(abs)
    const respuesta = await pagina.request.get(destino.origin + destino.pathname)
    if (!respuesta.ok()) {
      rotos.push(`${ruta}: «${href}» responde ${respuesta.status()}`)
      continue
    }
    if (destino.hash) {
      const html = await respuesta.text()
      if (!html.includes(`id="${destino.hash.slice(1)}"`)) {
        rotos.push(`${ruta}: «${href}» apunta a un ancla que el destino no tiene`)
      }
    }
  }

  await ctx.close()
  return rotos
}

const actual = { rutas: {}, foco: {} }
const enlaces = []

for (const ruta of ['/', '/privacidad']) {
  actual.rutas[ruta] = {}
  for (const [nombre, ancho, alto] of ANCHOS) {
    actual.rutas[ruta][nombre] = await medir(ruta, ancho, alto, null)
  }
  actual.rutas[ruta].oscuro = await medir(ruta, 1440, 900, 'oscuro')
  actual.foco[ruta] = await medirFoco(ruta)
  enlaces.push(...(await enlacesRotos(ruta)))
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

fallos.push(...enlaces)

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
