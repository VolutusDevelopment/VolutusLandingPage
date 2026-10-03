// Genera la tarjeta para compartir (OpenGraph) de cada página indexable: el
// logotipo sobre fondo blanco y, debajo, el título de la página. La de /patos
// es el pato del juego en el cielo; su texto alternativo va en meta.js
// (`tarjetaAlt`).
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
import { ARRIBA, COLORES } from '../src/lib/pato.js'
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

// El pato de lib/pato.js con un cuadrado por celda, el píxel de las consolas
// que lo inspiran, sobre el cielo de la mañana de la página (`--fondo-hora` de
// `.hora-manana`). Sin suavizado, para que los cuadrados vecinos no dejen
// costuras entre ellos.
function htmlPato() {
  const pixeles = ARRIBA.flatMap((fila, y) =>
    [...fila].map((letra, x) =>
      COLORES[letra] ? `<rect x="${x}" y="${y}" width="1" height="1" fill="${COLORES[letra]}" />` : '',
    ),
  )
  return `<!doctype html>
<html lang="es-CL"><head><meta charset="utf-8"><style>
  html, body { margin: 0; width: ${ANCHO}px; height: ${ALTO}px; }
  body {
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(#2b8de4, #4d9fea 28%, #7cbcf1 52%, #c2e1f8 76%, #f6f9fc 94%);
  }
  svg { width: 560px; height: auto; display: block; }
</style></head><body>
  <svg viewBox="0 0 ${ARRIBA[0].length} ${ARRIBA.length}" shape-rendering="crispEdges" aria-hidden="true">${pixeles.join('')}</svg>
</body></html>`
}

mkdirSync(`${root}public/image/og`, { recursive: true })
const navegador = await chromium.launch()
const pagina = await navegador.newPage({ viewport: { width: ANCHO, height: ALTO } })

for (const [ruta, { archivo, titulo, indexar = true }] of Object.entries(PAGINAS)) {
  if (!indexar) continue
  await pagina.setContent(ruta === '/patos' ? htmlPato() : html(tituloCorto(titulo)))
  await pagina.evaluate(() => document.fonts.ready)
  const destino = `${root}public${tarjetaDe(archivo)}`
  await pagina.screenshot({ path: destino, type: 'jpeg', quality: 90 })
  console.log(`og: ${destino.slice(root.length)}`)
}

await navegador.close()
