// Verificación de la página contra una base de referencia.
//
// Corre cada página en navegadores reales y compara un puñado de medidas con
// las de `tests/referencia.json`. Si algo se movió, lo dice y falla.
//
//   node scripts/verificar.mjs                 compara contra la referencia
//   node scripts/verificar.mjs --actualizar    reescribe la referencia
//
// Necesita el sitio servido en http://127.0.0.1:8787 (wrangler dev; otra
// dirección va en BASE_URL) y Chromium y WebKit de Playwright instalados
// (`pnpm exec playwright install chromium webkit`).
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
//   - Las fichas de proyectos se cerraban con un `<form>` sin anotar para los
//     agentes de IA, y Lighthouse lo cuenta.
//
// Cada comprobación de aquí existe porque su fallo ya ocurrió.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { chromium, webkit } from 'playwright'

import { PAGINAS } from '../src/lib/meta.js'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:8787'
const REFERENCIA = fileURLToPath(new URL('../tests/referencia.json', import.meta.url))
const actualizar = process.argv.includes('--actualizar')

// Tolerancia en píxeles. Las alturas varían un poco entre versiones del motor
// y entre sistemas; lo que importa es que no cambien de golpe.
const MARGEN = 24

// Los puntos de quiebre de DESIGN-BRIEF §8, cada uno en una pantalla de
// verdad: S es un iPhone; M y L, un iPad de pie y apaisado (en el apaisado
// desbordaba la fila de logros y nadie lo medía); XL, el escritorio.
const ANCHOS = [
  ['S', 390, 844],
  ['M', 820, 1180],
  ['L', 1180, 820],
  ['XL', 1440, 900],
]

// Safari parte las líneas y mide distinto que Chromium (CLAUDE.md §6): los
// anchos de iPhone y iPad se miden también en WebKit, como pantalla táctil.
const EN_WEBKIT = ['S', 'M', 'L']

const ESCRITORIO = { viewport: { width: 1280, height: 900 } }

const chrome = await chromium.launch()
const safari = await webkit.launch()

async function abrir(navegador, ruta, opciones) {
  const ctx = await navegador.newContext(opciones)
  const pagina = await ctx.newPage()
  await pagina.goto(BASE + ruta, { waitUntil: 'networkidle' })
  return pagina
}

// Recorrer la página resuelve las entradas al scroll y pinta las secciones con
// `content-visibility: auto` (Ley 21.719), que hasta entonces miden lo que
// dice su `contain-intrinsic-size`: la página crece mientras se recorre.
//
// Cuatro detalles que producen falsos positivos si se olvidan: se mide sobre
// `documentElement` y no sobre `body` —el segundo puede ser más corto y deja
// el recorrido a medias—; el final se vuelve a leer en cada paso, porque
// crece; el desplazamiento va en `instant`, porque la página usa
// `scroll-behavior: smooth` y con el suave todavía se está moviendo cuando se
// lee la opacidad; y se esperan dos fotogramas al final, porque las líneas de
// tiempo del scroll se ponen al día al pintar y no al leer el estilo, y con el
// navegador ocupado un tiempo fijo a veces no alcanza.
async function recorrer(pagina) {
  await pagina.evaluate(async () => {
    const raiz = document.documentElement
    for (let y = 0; y < raiz.scrollHeight - window.innerHeight; y += 300) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 25))
    }
    window.scrollTo({ top: raiz.scrollHeight, behavior: 'instant' })
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  })
}

const invisibles = (pagina) =>
  pagina.$$eval('.entra', (els) => els.filter((e) => Number(getComputedStyle(e).opacity) < 0.05).length)

async function medir(navegador, ruta, opciones) {
  const pagina = await abrir(navegador, ruta, opciones)
  await pagina.waitForTimeout(600)

  // Se mide ya recorrida: antes, el alto de la Ley 21.719 es una estimación.
  await recorrer(pagina)
  await pagina.waitForTimeout(300)

  const medidas = await pagina.evaluate(() => {
    const raiz = document.documentElement
    return {
      alto: raiz.scrollHeight,
      desborda: raiz.scrollWidth > raiz.clientWidth,
      h1: document.querySelector('h1')?.getBoundingClientRect().height ?? 0,
      bloquesQueEntran: document.querySelectorAll('.entra').length,
    }
  })

  // Todo lo que anima al entrar tiene que ser alcanzable. Si un bloque se
  // queda en 0 después de recorrer la página, no se puede leer nunca.
  medidas.ocultosTrasRecorrer = await invisibles(pagina)

  // Al imprimir no hay scroll: lo que dependa de él se queda en su primer
  // fotograma. Es el modo de fallar que dejó las hojas en blanco.
  await pagina.emulateMedia({ media: 'print' })
  await pagina.evaluate(() => window.scrollTo(0, 0))
  await pagina.waitForTimeout(200)
  medidas.ocultosAlImprimir = await invisibles(pagina)

  await pagina.context().close()
  return medidas
}

/**
 * Mide la página en cada ancho, y en WebKit los de iPhone y iPad. Todos a la
 * vez: cada uno va en su propio contexto, y uno tras otro la verificación de
 * todas las páginas pasaba de diez minutos.
 */
async function medirAnchos(ruta) {
  const tomas = {}
  for (const [nombre, width, height] of ANCHOS) {
    const viewport = { width, height }
    tomas[nombre] = medir(chrome, ruta, { viewport })
    if (EN_WEBKIT.includes(nombre))
      tomas[`${nombre} webkit`] = medir(safari, ruta, { viewport, isMobile: true, hasTouch: true })
  }
  const medidas = await Promise.all(Object.values(tomas))
  return Object.fromEntries(Object.keys(tomas).map((nombre, i) => [nombre, medidas[i]]))
}

/** Recorre la página con el tabulador y comprueba que cada parada se ve. */
async function medirFoco(ruta) {
  const pagina = await abrir(chrome, ruta, ESCRITORIO)
  await recorrer(pagina)
  await pagina.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await pagina.waitForTimeout(400)

  let paradas = 0
  let sinAnillo = 0
  for (let i = 0; i < 200; i++) {
    await pagina.keyboard.press('Tab')
    const estado = await pagina.evaluate(() => {
      const e = document.activeElement
      if (!e || e === document.body) return null
      // El anillo puede ir en el `::before` —el de `.boton-cuadro` va en su
      // cuadro sesgado— o en el envoltorio inmediato: el composer del
      // formulario lo lleva por su textarea, para que no lo corte la barra.
      const conAnillo = (el, pseudo) => {
        const s = getComputedStyle(el, pseudo)
        return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2
      }
      return { conAnillo: conAnillo(e) || conAnillo(e, '::before') || conAnillo(e.parentElement) }
    })
    if (!estado) break
    paradas++
    if (!estado.conAnillo) sinAnillo++
  }
  await pagina.context().close()
  return { paradas, sinAnillo }
}

// Las respuestas de las rutas enlazadas, una vez por ruta: la barra y el pie
// enlazan lo mismo desde todas las páginas.
const respuestas = new Map()

async function responder(pagina, url) {
  if (!respuestas.has(url)) {
    const respuesta = await pagina.request.get(url)
    respuestas.set(url, { ok: respuesta.ok(), estado: respuesta.status(), html: await respuesta.text() })
  }
  return respuestas.get(url)
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
async function enlacesRotos(pagina, ruta) {
  const enlaces = await pagina.$$eval('a[href]', (els) =>
    els.map((e) => ({ href: e.getAttribute('href'), abs: e.href }))
  )

  const rotos = []
  for (const { href, abs } of enlaces) {
    if (href.startsWith('http') || href.startsWith('mailto:')) continue

    // `#top` no necesita un id: el estándar lo resuelve al principio del
    // documento (es el «Volver arriba» del pie).
    if (href === '#top') continue

    if (href.startsWith('#')) {
      const existe = await pagina.evaluate((id) => Boolean(document.getElementById(id)), href.slice(1))
      if (!existe) rotos.push(`${ruta}: «${href}» no existe en esta página`)
      continue
    }

    const destino = new URL(abs)
    const respuesta = await responder(pagina, destino.origin + destino.pathname)
    if (!respuesta.ok) {
      rotos.push(`${ruta}: «${href}» responde ${respuesta.estado}`)
      continue
    }
    if (destino.hash && !respuesta.html.includes(`id="${destino.hash.slice(1)}"`)) {
      rotos.push(`${ruta}: «${href}» apunta a un ancla que el destino no tiene`)
    }
  }

  return rotos
}

/**
 * Comprueba que cada formulario se lo puede dar un agente de IA (CLAUDE.md §7):
 * Lighthouse cuenta en Agentic Search todo `<form>` sin `toolname`. Y que
 * ninguno que escriba a una persona —los que van por POST— se envíe solo: ese
 * lo rellena el agente y lo envía la persona.
 */
async function formulariosSinAnotar(pagina, ruta) {
  const formularios = await pagina.$$eval('form', (els) =>
    els.map((f) => ({
      nombre: f.getAttribute('toolname'),
      descripcion: f.getAttribute('tooldescription')?.trim(),
      seEnviaSolo: f.hasAttribute('toolautosubmit') && f.method === 'post',
    }))
  )

  return formularios.flatMap(({ nombre, descripcion, seEnviaSolo }, i) => {
    if (!/^[a-z][a-z0-9_]*$/.test(nombre ?? ''))
      return [`${ruta}: el formulario ${i + 1} no lleva un toolname en snake_case`]
    if (!descripcion) return [`${ruta}: «${nombre}» no lleva tooldescription`]
    if (seEnviaSolo) return [`${ruta}: «${nombre}» escribe a una persona y lleva toolautosubmit`]
    return []
  })
}

async function revisarMarcado(ruta) {
  const pagina = await abrir(chrome, ruta, ESCRITORIO)
  const problemas = [...(await enlacesRotos(pagina, ruta)), ...(await formulariosSinAnotar(pagina, ruta))]
  await pagina.context().close()
  return problemas
}

const actual = { rutas: {}, foco: {} }
const marcado = []

// Todas las páginas indexables, y la 404 en `/no-existe`: Cloudflare la sirve
// en cualquier dirección que no existe, así que se mide en una que no existe y
// no en /404.
const RUTAS = [...Object.keys(PAGINAS).filter((ruta) => PAGINAS[ruta].indexar !== false), '/no-existe']

for (const ruta of RUTAS) {
  actual.rutas[ruta] = await medirAnchos(ruta)
  actual.foco[ruta] = await medirFoco(ruta)
  marcado.push(...(await revisarMarcado(ruta)))
}

await Promise.all([chrome.close(), safari.close()])

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

fallos.push(...marcado)

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
