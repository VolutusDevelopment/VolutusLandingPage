// Genera el kit de marca en `public/marca/`, servido en volutus.cl/marca/:
//
//   - El logotipo, el símbolo (la ola sola) y la palabra sola, en SVG y en PNG
//     transparente: en tinta para fondo claro y en blanco para fondo oscuro.
//   - El avatar cuadrado para Google, Apple, LinkedIn y GitHub: la ola en
//     blanco sobre el color de acción, a sangre y sin transparencia. La ola va
//     al 80 % para que quepa en el círculo con que Google y GitHub lo recortan.
//   - El símbolo de la firma de correo: el favicon, que se ve igual en un
//     correo claro y en uno oscuro.
//   - Las portadas: el pie de día de la portada del sitio, fotografiado cuando
//     los colores de la ola cruzan la palabra. Las de LinkedIn, una 16:9 para
//     presentaciones y una vertical para documentos.
//   - La nube de la portada del sitio, sin el texto encima.
//   - El logotipo animado: el mismo pie mientras la ola se escribe, en WebM.
//
//   pnpm build && pnpm marca
//
// Se corre a mano cuando cambia la marca y los archivos se commitean, igual
// que los íconos y las tarjetas OG. La geometría sale de lib/logotipo.js, y las
// portadas, la nube y el video salen del sitio construido (la ola de ola.js y
// el mar y la nube del pintor), así que el kit no puede quedar con una marca
// vieja. Necesita el Chromium de Playwright, el ffmpeg que trae
// (`pnpm exec playwright install chromium ffmpeg`) y una GPU: sin ella el
// sitio no pinta el mar en vivo.
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { LETRAS, OLA, OLA_DEL_LOGOTIPO, VIEWBOX, trazoDe } from '../src/lib/logotipo.js'
import { chromium } from 'playwright'
import { preview } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
const destino = `${root}public/marca/`

// Los colores del sitio (index.css): la tinta del cielo y la acción.
const TINTA = '#0a1a2a'
const BLANCO = '#ffffff'
const ACCION = '#116492'

// La palabra sola va en la caja de sus letras, de la V a la S.
const PIEZAS = {
  logo: { viewBox: VIEWBOX, ola: OLA_DEL_LOGOTIPO, letras: true, ancho: 2400 },
  simbolo: { viewBox: '0 0 64 64', ola: OLA, ancho: 1024 },
  palabra: { viewBox: '28 100 536 72', letras: true, ancho: 2400 },
}

const FONDOS = { 'fondo-claro': TINTA, 'fondo-oscuro': BLANCO }

// Alto del logotipo por cada px de ancho.
const [, , ANCHO_DEL_LOGO, ALTO_DEL_LOGO] = VIEWBOX.split(' ').map(Number)
const PROPORCION = ALTO_DEL_LOGO / ANCHO_DEL_LOGO

function trazoDeLaOla(ola, color) {
  return `<path d="${trazoDe(ola)}" fill="none" stroke="${color}" stroke-width="${ola.grosor}" stroke-linecap="round"/>`
}

function svg(pieza, color) {
  const { viewBox, ola, letras } = PIEZAS[pieza]
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img"><title>Volutus</title>` +
    (ola ? trazoDeLaOla(ola, color) : '') +
    (letras ? `<path d="${LETRAS.join('')}" fill="${color}"/>` : '') +
    '</svg>\n'
  )
}

// El cuadro de 64 visto desde 80: la ola queda al 80 % y centrada.
const AVATAR =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 80 80">' +
  `<rect x="-8" y="-8" width="80" height="80" fill="${ACCION}"/>` +
  trazoDeLaOla(OLA, BLANCO) +
  '</svg>'

// Las portadas son el pie de día de la portada del sitio, recortado: el cielo,
// el logotipo y el mar. Todo va en px de la imagen: `logo` es el ancho del
// logotipo, `arriba` el cielo sobre él, y el mar llena el resto. Las de
// LinkedIn y la vertical van al doble de su medida, así que también su trama de
// puntos (`celda`, 3 px en el sitio). En LinkedIn el logotipo va centrado y
// arriba, porque la foto del perfil o el logo de la página caen abajo a la
// izquierda.
//
// `instante` son los ms desde que se suelta el logotipo hasta la foto: la
// palabra entera y los colores entrando en la voluta. Cambia con lo lejos que
// queda el borde de la pantalla, de donde salen las líneas, y se eligió
// mirando cuadros de cada una.
const PORTADAS = {
  'linkedin-portada-empresa': { ancho: 2256, alto: 382, logo: 880, arriba: 48, celda: 6, instante: 850 },
  'linkedin-portada-perfil': { ancho: 3168, alto: 792, logo: 1520, arriba: 112, celda: 6, instante: 800 },
  'volutus-portada-16x9': { ancho: 1920, alto: 1080, logo: 1100, arriba: 300, celda: 3, instante: 760 },
  'volutus-portada-vertical': { ancho: 1632, alto: 1280, logo: 1200, arriba: 280, celda: 6, instante: 700 },
}

// El pie solo, al alto de la portada. Detrás va el tramo hondo del cielo de
// `.caida` (Contacto.css), sus paradas del 60 al 100 %, que es lo que tiene
// detrás en el sitio. El mar ocupa lo que queda bajo el logotipo, contando que
// sube un 10 % sobre él (Pie.css). `:root .caida > .pie` le gana a la regla
// que le quita el aire de arriba por seguir a otra zona de cielo (index.css).
// Entra con la página cargada, cuando el pie todavía está lejos: el mar se
// monta al esconderse lo de arriba, y el pintor ya lee esta celda. Hasta que
// se suelta, el logotipo espera fuera de la vista, así el mar se pinta antes
// de que la ola empiece.
function cssDelPie({ alto, logo, arriba, celda }) {
  const mar = (alto - arriba - logo * PROPORCION) / 0.9
  return `
    html { scroll-behavior: auto !important; }
    .salto, .barra, main, .caida > .contacto, .pie-contacto, .pie-enlaces, .pie-legal { display: none !important; }
    :root .caida { background: linear-gradient(#4b9eea, #4198e8, #3994e6, #3291e5, #2b8de4); }
    :root .caida > .pie { height: ${alto}px; box-sizing: border-box; padding-top: ${arriba}px; overflow: hidden; }
    .pie .contenedor { max-width: ${logo}px; padding: 0; margin-inline: auto; }
    .pie-mar { --alto-mar: ${mar}px; --nubes-celda: ${celda}; }
    .pie-logotipo:not(.suelto) { transform: translateY(-300vh); }
  `
}

mkdirSync(destino, { recursive: true })

if (!existsSync(`${root}dist/index.html`)) throw new Error('Falta el sitio construido: corre pnpm build antes de pnpm marca.')

const navegador = await chromium.launch()
const pagina = await navegador.newPage()

async function png(html, ancho, alto, transparente) {
  await pagina.setViewportSize({ width: ancho, height: alto })
  await pagina.setContent(`<style>*{margin:0}svg{display:block;width:${ancho}px;height:${alto}px}</style>${html}`)
  return pagina.screenshot({ omitBackground: transparente })
}

function guardar(nombre, contenido) {
  writeFileSync(`${destino}${nombre}`, contenido)
  console.log(`marca: public/marca/${nombre}`)
}

for (const [pieza, { viewBox, ancho }] of Object.entries(PIEZAS)) {
  const [, , w, h] = viewBox.split(' ').map(Number)
  for (const [fondo, color] of Object.entries(FONDOS)) {
    const nombre = `volutus-${pieza}-${fondo}`
    guardar(`${nombre}.svg`, svg(pieza, color))
    guardar(`${nombre}.png`, await png(svg(pieza, color), ancho, Math.round((ancho * h) / w), true))
  }
}

for (const lado of [1024, 400]) guardar(`volutus-avatar-${lado}.png`, await png(AVATAR, lado, lado, false))

guardar('firma-simbolo.png', await png(readFileSync(`${root}public/favicon.svg`, 'utf8'), 96, 96, true))

await navegador.close()

// ---- lo que sale del sitio construido ----

const servidor = await preview({ root, logLevel: 'silent' })
const base = servidor.resolvedUrls.local[0]
// El Chromium completo usa la GPU de la máquina; el que Playwright abre por
// defecto dibuja WebGL por software, y el sitio no le pinta el mar (ver
// `revisarNubes` en verificar.mjs).
const conGpu = await chromium.launch({ channel: 'chromium' })

// La página con el pie como portada, el mar ya pintado en vivo y el logotipo
// por asomar.
async function abrirPie(medidas) {
  const pagina = await conGpu.newPage({ viewport: { width: medidas.ancho, height: medidas.alto } })
  // El pato del mar no sale: es un juego del sitio, no parte de la marca. Lo
  // suelta el pintor cuando recibe `pato` (nubes.js).
  await pagina.addInitScript(() => {
    const enviar = Worker.prototype.postMessage
    Worker.prototype.postMessage = function (mensaje, ...resto) {
      if (mensaje?.tipo !== 'pato') enviar.call(this, mensaje, ...resto)
    }
  })
  await pagina.goto(base, { waitUntil: 'load' })
  await pagina.addStyleTag({ content: cssDelPie(medidas) })
  const vivo = await pagina.waitForSelector('canvas.nubes[data-vista="mar"].vivo', { timeout: 30000 }).then(
    () => true,
    () => false,
  )
  if (!vivo || (await pagina.locator('.pie-mar video.grabado').count())) {
    throw new Error('El mar no se pintó en vivo: pnpm marca necesita una GPU.')
  }
  await pagina.waitForTimeout(800)
  return pagina
}

// Filma el pie con el screencast del navegador mientras la ola se escribe:
// desde `antes` ms antes de soltar el logotipo hasta `despues` ms después de
// que se posa. Cada cuadro lleva los ms en que se pintó, contados desde que se
// suelta, así que la foto cae en su instante aunque la captura tarde.
async function filmar(pagina, { formato, antes = 0, despues = 0 }) {
  const cdp = await pagina.context().newCDPSession(pagina)
  const cuadros = []
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    cuadros.push({ t: metadata.timestamp * 1000, imagen: Buffer.from(data, 'base64') })
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
  })
  await cdp.send('Page.startScreencast', { format: formato, quality: 95 })
  await pagina.waitForTimeout(antes)
  const suelta = Date.now()
  await pagina.evaluate(() => document.querySelector('.pie-logotipo').classList.add('suelto'))
  await pagina.waitForFunction(() => !document.querySelector('.pie-logotipo-cuerpo').classList.contains('barriendo'))
  await pagina.waitForTimeout(despues)
  await cdp.send('Page.stopScreencast')
  return cuadros.map(({ t, imagen }) => ({ t: t - suelta, imagen }))
}

for (const [nombre, medidas] of Object.entries(PORTADAS)) {
  const pagina = await abrirPie(medidas)
  const cuadros = await filmar(pagina, { formato: 'png' })
  guardar(`${nombre}.png`, cuadros.findLast(({ t }) => t <= medidas.instante).imagen)
  await pagina.close()
}

// La nube de la portada del sitio, quieta un momento y sin nada encima.
const cielo = await conGpu.newPage({ viewport: { width: 1920, height: 1080 } })
await cielo.goto(base, { waitUntil: 'load' })
await cielo.addStyleTag({ content: '.portada-texto, .barra, .salto { visibility: hidden !important; }' })
await cielo.waitForSelector('canvas.nubes[data-vista="cielo"].vivo', { timeout: 30000 })
await cielo.waitForTimeout(1600)
guardar('volutus-nube.png', await cielo.locator('.portada-cielo').screenshot())
await cielo.close()

// El ffmpeg que Playwright usa para sus videos. Solo codifica VP8, que basta
// para un WebM.
function ffmpeg() {
  const raiz =
    process.env.PLAYWRIGHT_BROWSERS_PATH ??
    { win32: join(process.env.LOCALAPPDATA ?? '', 'ms-playwright'), darwin: join(homedir(), 'Library/Caches/ms-playwright') }[
      process.platform
    ] ??
    join(homedir(), '.cache/ms-playwright')
  const carpeta = existsSync(raiz) && readdirSync(raiz).find((nombre) => nombre.startsWith('ffmpeg-'))
  if (!carpeta) throw new Error('Falta el ffmpeg de Playwright: pnpm exec playwright install ffmpeg')
  return join(raiz, carpeta, { win32: 'ffmpeg-win64.exe', darwin: 'ffmpeg-mac' }[process.platform] ?? 'ffmpeg-linux')
}

// El screencast manda un cuadro cada vez que la pantalla cambia; el video va a
// 30 por segundo, cada uno con el último cuadro que llegó hasta su momento.
const FPS = 30

function webm(cuadros, archivo) {
  const desde = cuadros[0].t
  const proceso = spawn(ffmpeg(), [
    ...['-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', 'pipe:0'],
    ...['-c:v', 'libvpx', '-b:v', '5M', '-crf', '10', '-qmin', '4', '-qmax', '40', '-deadline', 'good', '-an', '-y', archivo],
  ])
  let i = 0
  for (let n = 0; n <= ((cuadros.at(-1).t - desde) * FPS) / 1000; n++) {
    while (i + 1 < cuadros.length && cuadros[i + 1].t - desde <= (n * 1000) / FPS) i++
    proceso.stdin.write(cuadros[i].imagen)
  }
  proceso.stdin.end()
  return new Promise((listo, falla) =>
    proceso.on('close', (codigo) => (codigo ? falla(new Error(`ffmpeg terminó con el código ${codigo}`)) : listo())),
  )
}

// El logotipo animado, en la composición de la portada 16:9: medio segundo de
// cielo y mar, la ola que se escribe y un segundo y medio con la marca posada.
const animado = await abrirPie(PORTADAS['volutus-portada-16x9'])
await webm(await filmar(animado, { formato: 'jpeg', antes: 500, despues: 1500 }), `${destino}volutus-logo-animado.webm`)
console.log('marca: public/marca/volutus-logo-animado.webm')

await conGpu.close()
await servidor.close()
