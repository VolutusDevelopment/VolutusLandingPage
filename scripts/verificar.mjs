// Verificación de la página contra una base de referencia.
//
// Corre cada página en navegadores reales y compara un puñado de medidas con
// las de `tests/referencia.json`. Si algo se movió, lo dice y falla.
//
//   node scripts/verificar.mjs                 compara contra la referencia
//   node scripts/verificar.mjs --actualizar    reescribe la referencia
//
// Necesita el sitio servido en http://127.0.0.1:8787 (wrangler dev; otra
// dirección va en BASE_URL), Chromium y WebKit de Playwright instalados
// (`pnpm exec playwright install chromium webkit`) y una GPU: las nubes se
// comprueban con la de la máquina (ver `revisarNubes`).
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
//   - Con la rueda del ratón, donde la página se baja libre, bajaba el doble y
//     en dos tirones.
//   - Con gráficos Intel la nube salía como un recorte a la derecha, o no
//     salía, y la primera visita congelaba la página casi 2 s (ver
//     `revisarNubes`).
//
// Cada comprobación de aquí existe porque su fallo ya ocurrió.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { chromium, webkit } from 'playwright'

import { campoPara } from '../src/lib/campos.js'
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

/**
 * Comprueba que la página no encaja al final, donde las que encajan se bajan
 * libres (src/encaje.js): con la rueda del ratón Chrome encajaba ahí cada tick
 * y la página bajaba el doble y en dos tirones. La rueda de Playwright no lo
 * reproduce, así que se mira el encaje. Se recorre de a poco, como quien baja:
 * de un salto, encaja en el borde de la zona libre, donde todavía encaja, y
 * ahí se queda.
 */
async function encajaAlFinal(pagina, ruta) {
  await recorrer(pagina)
  await pagina.waitForTimeout(300)
  const encaja = await pagina.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType !== 'none')
  return encaja ? [`${ruta}: al final de la página, donde se baja libre, encaja`] : []
}

async function revisarMarcado(ruta) {
  const pagina = await abrir(chrome, ruta, ESCRITORIO)
  const problemas = [
    ...(await enlacesRotos(pagina, ruta)),
    ...(await formulariosSinAnotar(pagina, ruta)),
    ...(await encajaAlFinal(pagina, ruta)),
  ]
  await pagina.context().close()
  return problemas
}

// La bienvenida del home tapa la página y se va a los 4 s, con o sin
// JavaScript. Con él sale del documento, también si el script llega cuando ya
// se fue (src/bienvenida.js): si no, su ola sigue pasando sin que nadie la vea.
async function revisarBienvenida() {
  const problemas = []
  for (const [como, opciones, tarde] of [
    ['', ESCRITORIO],
    [' con el script tarde', ESCRITORIO, true],
    [' sin JavaScript', { ...ESCRITORIO, javaScriptEnabled: false }],
  ]) {
    const pagina = await (await chrome.newContext(opciones)).newPage()
    if (tarde) await pagina.route('**/assets/index-*.js', (ruta) => setTimeout(() => ruta.continue(), 4500))
    await pagina.goto(BASE + '/', { waitUntil: 'load' })
    await pagina.waitForTimeout(tarde ? 500 : 4500)
    const queda = await pagina.evaluate(() => {
      const bienvenida = document.querySelector('.bienvenida')
      return bienvenida && getComputedStyle(bienvenida).visibility
    })
    if (queda === 'visible') problemas.push(`/${como}: a los 4 s la bienvenida sigue tapando la página`)
    else if (queda && opciones.javaScriptEnabled !== false) problemas.push(`/${como}: la bienvenida se fue pero quedó en el documento`)
    await pagina.context().close()
  }
  return problemas
}

// ---- Las nubes, en cualquier equipo ----
//
// La nube y el mar los dibuja un worker con WebGL (src/nubes-lienzo.js), y
// cada GPU compila sus shaders a su manera. Sus fallos ocurrieron en equipos
// que no eran el del desarrollo:
//
//   - Con gráficos Intel la nube salía como un recorte a la derecha, o no
//     salía: leía su ruido con derivadas indefinidas. Se compara con la misma
//     nube dibujada por software (SwiftShader), que no depende de ninguna GPU.
//   - La primera visita congelaba la página casi 2 s mientras la nube
//     compilaba.
//   - Con la GPU caída a mitad del primer enlace la nube no volvía más.
//   - Con el dibujo por software de Windows (WARP), que el filtro de GPU deja
//     pasar, la nube se movía a 274 ms por fotograma y ocupaba la CPU entera.
//     Sin GPU de verdad la escena va quieta, con su grabación encima.
//   - En un teléfono la nube cabía en vivo, pero trababa la página, y el cielo
//     de /servicios seguía en vivo a 100 ms por fotograma. Pasado su
//     presupuesto, la escena con grabación va desde su campo grabado, de la
//     cámara y la densidad de su lienzo, y las demás quedan quietas.
//   - En un artículo se descargaba el pintor aunque nadie llegara al mar.
//
// Van en el Chromium completo (`channel: 'chromium'`), que usa la GPU de la
// máquina: el que Playwright abre por defecto sin ventana dibuja WebGL por
// software, y el sitio no le pinta nubes.

const CIELO = 'canvas.nubes[data-vista="cielo"]'
const ATARDECER = 'canvas.nubes[data-vista="atardecer"]'
const GRABACION = '.portada-cielo video.grabado'
const LIVIANA = '/grabados/nube-sin-gpu.mp4'
const EN_FRIO = ['--disable-gpu-program-cache', '--disable-gpu-shader-disk-cache']
const SWIFTSHADER = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
// Cuánto puede diferir la nube de la GPU de la de software, en % de píxeles: la
// precisión de cada una da hasta medio punto; la nube rota de Intel, 69.
const NUBE_DISTINTA = 2

const viva = (pagina, selector = CIELO) =>
  pagina.waitForSelector(`${selector}.vivo`, { timeout: 30000 }).then(() => true, () => false)

// El pintor, parchado solo aquí: cada cambio es un par [original, reemplazo]
// sobre su código ya compilado. Sin el filtro de GPU ni el nombre del software,
// acepta el dibujo por software como si fuera una GPU.
const SIN_FILTRO = ['failIfMajorPerformanceCaveat:!0', 'failIfMajorPerformanceCaveat:!1']
const SIN_NOMBRE = ['/basic render|swiftshader|llvmpipe|softpipe|software/i', '/(?!)/']
// Sin presupuesto, la GPU de la máquina nunca da abasto: la escena con
// grabación va desde su campo grabado y las demás quedan quietas.
// `PRESUPUESTO` se declara justo después de `LENTO` (nubes-lienzo.js).
const SIN_PRESUPUESTO = [/(=150,\w+=)11,/, '$10,']

async function parcharPintor(pagina, cambios) {
  await pagina.route('**/assets/nubes-lienzo-*.js', async (ruta) => {
    const respuesta = await ruta.fetch()
    let cuerpo = await respuesta.text()
    for (const [original, reemplazo] of cambios) cuerpo = cuerpo.replace(original, reemplazo)
    await ruta.fulfill({ response: respuesta, body: cuerpo })
  })
}

// La escena quieta (movimiento reducido) del `lienzo` de la página, sin el
// texto, la barra ni la grabación encima.
async function fotoDeLaNube(navegador, ruta, software, lienzo) {
  const ctx = await navegador.newContext({ viewport: { width: 480, height: 320 }, reducedMotion: 'reduce' })
  const pagina = await ctx.newPage()
  if (software) await parcharPintor(pagina, [SIN_FILTRO, SIN_NOMBRE])
  await pagina.goto(BASE + ruta, { waitUntil: 'load' })
  await pagina.addStyleTag({
    content:
      '.portada-texto,.pagina-error-texto,.indice-titulo,.atardecer-cabecera,.barra,video.grabado{visibility:hidden!important}',
  })
  const pintada = await viva(pagina, lienzo)
  await pagina.waitForTimeout(1600)
  const caja = await pagina.locator(lienzo).boundingBox()
  const foto = pintada && (await pagina.screenshot({ clip: { x: 0, y: 0, width: 480, height: Math.min(caja.y + caja.height, 320) } }))
  await ctx.close()
  return foto
}

// % de píxeles que cambian más que el ruido entre dos capturas.
async function diferencia(navegador, a, b) {
  const pagina = await navegador.newPage()
  const pct = await pagina.evaluate(async ([a, b]) => {
    const cargar = async (b64) => createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob())
    const [ia, ib] = await Promise.all([cargar(a), cargar(b)])
    const lienzo = new OffscreenCanvas(ia.width, ia.height)
    const x = lienzo.getContext('2d', { willReadFrequently: true })
    x.drawImage(ia, 0, 0)
    const da = x.getImageData(0, 0, lienzo.width, lienzo.height).data
    x.clearRect(0, 0, lienzo.width, lienzo.height)
    x.drawImage(ib, 0, 0)
    const db = x.getImageData(0, 0, lienzo.width, lienzo.height).data
    let distintos = 0
    for (let i = 0; i < da.length; i += 4) {
      if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 12) distintos++
    }
    return +((100 * distintos) / (da.length / 4)).toFixed(2)
  }, [a.toString('base64'), b.toString('base64')])
  await pagina.close()
  return pct
}

async function revisarNubes() {
  const problemas = []

  // La nube de la GPU de la máquina, igual a la de software, en cada cámara, y
  // el atardecer de /nosotros.
  const gpu = await chromium.launch({ channel: 'chromium' })
  const software = await chromium.launch({ args: SWIFTSHADER })
  for (const [ruta, lienzo] of [
    ['/', CIELO],
    ['/nosotros', ATARDECER],
    ['/servicios', CIELO],
    ['/no-existe', CIELO],
  ]) {
    const deGpu = await fotoDeLaNube(gpu, ruta, false, lienzo)
    const deSoftware = await fotoDeLaNube(software, ruta, true, lienzo)
    if (!deGpu || !deSoftware) {
      problemas.push(`${ruta}: la nube no se pintó ${deGpu ? 'por software' : 'con la GPU'}`)
      continue
    }
    const pct = await diferencia(software, deGpu, deSoftware)
    if (pct > NUBE_DISTINTA) problemas.push(`${ruta}: la nube de la GPU difiere en ${pct} % de la de software`)
  }
  await Promise.all([gpu.close(), software.close()])

  // La primera visita, con los shaders en frío: después de `load`, ningún
  // fotograma de la página espera más de 250 ms. Antes del load sí: es el
  // navegador compilando en frío su propio dibujo. Con GPU, ninguna grabación
  // se descarga.
  const frio = await chromium.launch({ channel: 'chromium', args: EN_FRIO })
  const ctx = await frio.newContext({ viewport: { width: 1366, height: 768 } })
  await ctx.addInitScript(() => {
    self.__cuadros = []
    const cuadro = (t) => (self.__cuadros.push(t), t < 10000 && requestAnimationFrame(cuadro))
    requestAnimationFrame(cuadro)
  })
  const primera = await ctx.newPage()
  const grabaciones = []
  primera.on('request', (pedido) => pedido.url().includes('/grabados/') && grabaciones.push(pedido.url()))
  await primera.goto(BASE + '/', { waitUntil: 'load' })
  if (!(await viva(primera))) problemas.push('/: en la primera visita la nube no se pintó')
  await primera.waitForTimeout(1500)
  const hueco = await primera.evaluate(() => {
    const desde = performance.getEntriesByType('navigation')[0].loadEventEnd + 200
    const cuadros = self.__cuadros.filter((t) => t >= desde)
    let mayor = 0
    for (let i = 1; i < cuadros.length; i++) mayor = Math.max(mayor, cuadros[i] - cuadros[i - 1])
    return Math.round(mayor)
  })
  if (hueco > 250) problemas.push(`/: en la primera visita la página se congeló ${hueco} ms después de cargar`)
  if (grabaciones.length) problemas.push(`/: con GPU se descargó ${grabaciones.join(', ')}`)
  await frio.close()

  // La GPU se cae a mitad del primer enlace y la nube vuelve.
  const caida = await chromium.launch({ channel: 'chromium', args: EN_FRIO })
  const tras = await caida.newPage()
  await tras.goto(BASE + '/', { waitUntil: 'load' })
  await tras.waitForTimeout(700)
  await (await caida.newBrowserCDPSession()).send('Browser.crashGpuProcess')
  if (!(await viva(tras))) problemas.push('/: tras caerse la GPU a mitad del enlace, la nube no volvió')
  await caida.close()

  // Sin GPU de verdad nada se mueve en vivo: la nube queda quieta y encima va su
  // grabación. Se reconoce el software por su nombre y, si no lo dice, por lo
  // que tarda. Sin WebGL o sin pintor queda solo la grabación, y el pintor no
  // sigue vivo. Con movimiento reducido también va la grabación, y si cambia con
  // la página abierta, va y viene sobre la nube que la GPU mueve en vivo.
  // `--disable-webgl` no llega al WebGL de los workers: sin GPU ni software, sí.
  const SIN_WEBGL = ['--disable-gpu', '--disable-software-rasterizer']
  const casos = [
    { nombre: 'sin GPU', args: ['--disable-gpu'], quieta: true },
    { nombre: 'por software que pasa el filtro', args: SWIFTSHADER, quieta: true },
    { nombre: 'por software que no dice su nombre', args: SWIFTSHADER, cambios: [SIN_NOMBRE], quieta: true },
    ...(process.platform === 'win32' ? [{ nombre: 'con WARP', args: ['--use-angle=d3d11-warp'], quieta: true }] : []),
    { nombre: 'sin WebGL', args: SIN_WEBGL, sinPintor: true },
    { nombre: 'sin pintor', bloquearPintor: true, sinPintor: true },
    { nombre: 'sin WebGL y con movimiento reducido', args: SIN_WEBGL, reducido: true, sinPintor: true },
    { nombre: 'con GPU y movimiento reducido', reducido: true, quieta: true, alterna: true },
  ]
  for (const caso of casos) {
    const navegador = await chromium.launch({ channel: 'chromium', args: caso.args ?? [] })
    const contexto = await navegador.newContext({
      viewport: { width: 1366, height: 768 },
      reducedMotion: caso.reducido ? 'reduce' : 'no-preference',
    })
    const pagina = await contexto.newPage()
    if (caso.cambios) await parcharPintor(pagina, caso.cambios)
    if (caso.bloquearPintor) await pagina.route('**/assets/nubes-lienzo-*.js', (ruta) => ruta.abort())
    await pagina.goto(BASE + '/', { waitUntil: 'load' })
    const que = `/ ${caso.nombre}`
    if (!(await viva(pagina, GRABACION))) problemas.push(`${que}: la nube grabada no se reprodujo`)
    const src = await pagina.locator(GRABACION).getAttribute('src')
    if (src !== LIVIANA) problemas.push(`${que}: la grabación fue ${src} y no la liviana`)
    // Antes de ocultar la grabación para las fotos de abajo: oculta, el
    // navegador no la reproduce.
    if (caso.alterna) {
      await pagina.emulateMedia({ reducedMotion: 'no-preference' })
      await pagina.waitForTimeout(500)
      if (await pagina.locator(GRABACION).count()) problemas.push(`${que}: sin movimiento reducido, la grabación siguió encima`)
      await pagina.emulateMedia({ reducedMotion: 'reduce' })
      if (!(await viva(pagina, GRABACION))) problemas.push(`${que}: al volver el movimiento reducido, la grabación no volvió`)
    }
    if (caso.quieta) {
      // La nube de debajo, sin la grabación encima y pasado su fundido: dos
      // fotos seguidas, iguales.
      if (!(await viva(pagina))) problemas.push(`${que}: la nube quieta no se pintó`)
      await pagina.addStyleTag({ content: 'video.grabado,.portada-texto,.barra,.bienvenida{visibility:hidden!important}' })
      await pagina.waitForTimeout(1500)
      const foto = () => pagina.screenshot({ clip: { x: 0, y: 0, width: 1366, height: 600 } })
      const antes = await foto()
      await pagina.waitForTimeout(1000)
      const pct = await diferencia(navegador, antes, await foto())
      if (pct > 0) problemas.push(`${que}: la nube se movió en vivo (${pct} % distinta en 1 s)`)
    }
    if (caso.sinPintor && pagina.workers().length) problemas.push(`${que}: el pintor quedó vivo`)
    await navegador.close()
  }

  // Con una GPU que no da abasto la escena con grabación va desde su campo
  // grabado: el de la cámara y la densidad de su lienzo (lib/campos.js), y se
  // sigue moviendo. En el teléfono, vertical: 2340 px de alto en celdas de 4
  // son 585 filas, y el mar del pie, el de todos los teléfonos; en el
  // escritorio, apaisado: 768 px en celdas de 3, 256. La liviana no se
  // descarga. Se mira apenas cambia: sin presupuesto, a los pocos segundos
  // tampoco cabe grabada y queda quieta. El cielo de /servicios no tiene
  // grabación: queda quieto, pasado su fundido, y no descarga nada.
  const TELEFONO = { viewport: { width: 384, height: 832 }, deviceScaleFactor: 2.8125, isMobile: true }
  for (const [ruta, nombre, contexto, cielo, mar] of [
    ['/', 'en el teléfono', TELEFONO, campoPara('vertical', 585), campoPara('mar', 100)],
    ['/', 'en el escritorio', { viewport: { width: 1366, height: 768 } }, campoPara('apaisado', 256)],
    ['/servicios', 'en el teléfono', TELEFONO],
  ]) {
    const que = `${ruta} con una GPU que no da abasto, ${nombre}`
    const navegador = await chromium.launch({ channel: 'chromium' })
    const pagina = await (await navegador.newContext(contexto)).newPage()
    const grabaciones = []
    pagina.on('request', (pedido) => pedido.url().includes('/grabados/') && grabaciones.push(new URL(pedido.url()).pathname))
    await parcharPintor(pagina, [SIN_PRESUPUESTO])
    const pide = (campo) =>
      pagina.waitForRequest((pedido) => pedido.url().endsWith(campo), { timeout: 30000 }).then(() => true, () => false)
    const pideCielo = cielo && pide(cielo)
    await pagina.goto(BASE + ruta, { waitUntil: 'load' })
    if (cielo && !(await pideCielo)) problemas.push(`${que}: no pidió ${cielo}`)
    if (!cielo && !(await viva(pagina))) problemas.push(`${que}: la nube quieta no se pintó`)
    await pagina.addStyleTag({ content: '.portada-texto,.barra,.bienvenida{visibility:hidden!important}' })
    await pagina.waitForTimeout(cielo ? 600 : 1500)
    const { width, height } = contexto.viewport
    const foto = () => pagina.screenshot({ clip: { x: 0, y: 0, width, height: Math.round(height * 0.7) } })
    const antes = await foto()
    await pagina.waitForTimeout(400)
    const pct = await diferencia(navegador, antes, await foto())
    if (cielo && !pct) problemas.push(`${que}: la nube grabada no se movió`)
    if (!cielo && pct) problemas.push(`${que}: la nube se movió en vivo (${pct} % distinta)`)
    if (mar) {
      const pideMar = pide(mar)
      await pagina.locator('canvas.nubes[data-vista="mar"]').scrollIntoViewIfNeeded()
      if (!(await pideMar)) problemas.push(`${que}: el mar no pidió ${mar}`)
    }
    const otras = grabaciones.filter((grabacion) => grabacion !== cielo && grabacion !== mar)
    if (otras.length) problemas.push(`${que}: además se descargó ${otras.join(', ')}`)
    await navegador.close()
  }

  // En un artículo el pintor no se descarga hasta acercarse al mar del pie.
  const lector = await chromium.launch({ channel: 'chromium' })
  const articulo = await lector.newPage()
  const pedidos = []
  articulo.on('request', (pedido) => pedido.url().includes('nubes-lienzo') && pedidos.push(pedido.url()))
  const ruta = Object.keys(PAGINAS).find((r) => r.startsWith('/articulos/') && PAGINAS[r].publicada)
  await articulo.goto(BASE + ruta, { waitUntil: 'load' })
  await articulo.waitForTimeout(2500)
  if (pedidos.length) problemas.push(`${ruta}: el pintor se descargó sin que nadie bajara al mar`)
  await articulo.locator('canvas.nubes[data-vista="mar"]').scrollIntoViewIfNeeded()
  if (!(await viva(articulo, 'canvas.nubes[data-vista="mar"]'))) problemas.push(`${ruta}: al bajar al pie, el mar no se pintó`)
  await lector.close()

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
marcado.push(...(await revisarBienvenida()))

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
fallos.push(...(await revisarNubes()))

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
