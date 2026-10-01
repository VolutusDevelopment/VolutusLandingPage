// Genera la tarjeta para compartir (OpenGraph) de cada página indexable: el
// logotipo sobre fondo blanco y, debajo, el título de la página.
//
//   pnpm og
//
// Se corre a mano cuando cambia el logotipo o un título, y las imágenes se
// commitean: no entra al build porque necesita el Chromium de Playwright
// (`pnpm exec playwright install chromium`). El logotipo sale de
// lib/logotipo.js, la misma geometría que pinta la barra, así que la tarjeta
// no puede quedar con una marca vieja.
import { mkdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { PAGINAS, tarjetaDe, tituloCorto } from '../src/lib/meta.js'
import { LETRAS, TRAMAS } from '../src/lib/logotipo.js'
import { chromium } from 'playwright'

const root = fileURLToPath(new URL('..', import.meta.url))
const ANCHO = 1200
const ALTO = 630

// Incrustadas: la página se arma con setContent y no tiene servidor del que
// pedir las fuentes.
const fuente = (archivo) => readFileSync(`${root}public/fonts/${archivo}`).toString('base64')
const archivo = fuente('archivo-italica-latin.woff2')
const mono = fuente('geist-mono-latin.woff2')

// La tarjeta habla como la página: el título como los h1 (Archivo negra
// itálica, mayúscula, el aire del logotipo) en el azul de `--accion`, y el
// dominio como un antetítulo (mono espaciada en `--texto-suave`).
function html(titulo) {
  const { viewBox, puntos } = TRAMAS.fina
  return `<!doctype html>
<html lang="es-CL"><head><meta charset="utf-8"><style>
  @font-face { font-family: Archivo; src: url(data:font/woff2;base64,${archivo}) format('woff2'); font-style: italic; font-weight: 800; }
  @font-face { font-family: 'Geist Mono'; src: url(data:font/woff2;base64,${mono}) format('woff2'); font-weight: 400 800; }
  html, body { margin: 0; width: ${ANCHO}px; height: ${ALTO}px; background: #fff; }
  body {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 44px;
    box-sizing: border-box; padding-bottom: 24px; position: relative; color: #0a1a2a;
  }
  svg { width: 640px; height: auto; display: block; }
  h1 {
    margin: 0; max-width: 940px; text-align: center; text-wrap: balance;
    font: italic 800 40px/1.15 Archivo, sans-serif; letter-spacing: 0.065em; text-transform: uppercase;
    color: #116492;
  }
  p {
    position: absolute; bottom: 48px; margin: 0;
    font: 400 18px 'Geist Mono', monospace; letter-spacing: 0.14em; text-transform: uppercase;
    color: #47607a;
  }
</style></head><body>
  <svg viewBox="${viewBox}" aria-hidden="true">
    <path d="${puntos}" fill="currentColor" />
    <path d="${LETRAS.join('')}" fill="currentColor" />
  </svg>
  <h1>${titulo}</h1>
  <p>volutus.cl</p>
</body></html>`
}

mkdirSync(`${root}public/image/og`, { recursive: true })
const navegador = await chromium.launch()
const pagina = await navegador.newPage({ viewport: { width: ANCHO, height: ALTO } })

for (const { archivo, titulo, indexar = true } of Object.values(PAGINAS)) {
  if (!indexar) continue
  await pagina.setContent(html(tituloCorto(titulo)))
  await pagina.evaluate(() => document.fonts.ready)
  const destino = `${root}public${tarjetaDe(archivo)}`
  await pagina.screenshot({ path: destino, type: 'jpeg', quality: 90 })
  console.log(`og: ${destino.slice(root.length)}`)
}

await navegador.close()
