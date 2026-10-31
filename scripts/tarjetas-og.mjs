// Genera la tarjeta para compartir (OpenGraph) de cada página indexable: el
// logotipo sobre fondo blanco y, debajo, el título de la página. La de /patos
// es el pato del juego en el cielo, y las de Operación Venganza y sus niveles
// 2 y 3, afiches de sus pilotos; su texto alternativo va en meta.js
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
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { PAGINAS, tarjetaDe, tituloCorto } from '../src/lib/meta.js'
import { LETRAS, OLA_DEL_LOGOTIPO, VIEWBOX, trazoDe } from '../src/lib/logotipo.js'
import { ARRIBA, COLORES } from '../src/lib/pato.js'
import { marco, pixel3d } from './operacion-venganza/pilotos/tres.mjs'
import { PERSONAJES } from './operacion-venganza/pilotos/cuerpos.mjs'
import { chromium } from 'playwright'

const root = fileURLToPath(new URL('..', import.meta.url))
const ANCHO = 1200
const ALTO = 630
// El azul de la pantalla de carga de Operación Venganza, el cielo de las
// consolas: fondo de las dos tarjetas de los juegos.
const AZUL_DEL_JUEGO = PAGINAS['/operacion-venganza'].fondo

// Incrustadas: la página se arma con setContent y no tiene servidor del que
// pedir las fuentes.
const fuente = (archivo) => readFileSync(`${root}public/fonts/${archivo}`).toString('base64')
const archivo = fuente('archivo-italica-latin.woff2')
const mono = fuente('geist-mono-latin.woff2')
const pixelada = fuente('press-start-2p-latin.woff2')

// La tarjeta habla como la página: el título como los h1 (Archivo negra
// itálica, mayúscula, el aire del logotipo) en el azul de `--accion`, y el
// dominio como un antetítulo (mono espaciada en `--texto-suave`).
function html(titulo) {
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
  <svg viewBox="${VIEWBOX}" aria-hidden="true">
    <path d="${trazoDe(OLA_DEL_LOGOTIPO)}" fill="none" stroke="currentColor" stroke-width="${OLA_DEL_LOGOTIPO.grosor}" stroke-linecap="round" />
    <path d="${LETRAS.join('')}" fill="currentColor" />
  </svg>
  <h1>${titulo}</h1>
  <p>volutus.cl</p>
</body></html>`
}

// El pato de lib/pato.js con un cuadrado por celda, el píxel de las consolas
// que lo inspiran, en su cielo azul. Sin suavizado, para que los cuadrados
// vecinos no dejen costuras entre ellos.
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
    background: ${AZUL_DEL_JUEGO};
  }
  svg { width: 560px; height: auto; display: block; }
</style></head><body>
  <svg viewBox="0 0 ${ARRIBA[0].length} ${ARRIBA.length}" shape-rendering="crispEdges" aria-hidden="true">${pixeles.join('')}</svg>
</body></html>`
}

// Un afiche del juego: sus pilotos de cuerpo entero, cada uno con un gesto
// suyo y en los mismos 72 píxeles de su pantalla de carga, y al lado el texto
// en la letra del juego. Dos pilotos van más chicos para que quepan.
function htmlAfiche(pilotos, texto) {
  const tam = pilotos.length > 1 ? 5 : 8
  const sprites = pilotos.map(({ archivo, gesto, toma }) => {
    const figura = PERSONAJES.find((p) => p.archivo === archivo).gestos.find((g) => g.nombre === gesto).pose(0.5)
    const { c, radio } = marco(figura)
    return pixel3d(figura, toma, 72, tam, { c, radio: radio * 0.9 })
  })
  return `<!doctype html>
<html lang="es-CL"><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Press Start 2P'; src: url(data:font/woff2;base64,${pixelada}) format('woff2'); }
  html, body { margin: 0; width: ${ANCHO}px; height: ${ALTO}px; }
  body { display: flex; align-items: center; justify-content: center; gap: 24px; background: ${AZUL_DEL_JUEGO}; }
  h1 { margin: 0; white-space: nowrap; font: 40px/1.6 'Press Start 2P', monospace; color: #fff; text-shadow: 4px 4px 0 #0a1a2a; }
</style></head><body>
  ${sprites.join('')}
  <h1>${texto}</h1>
</body></html>`
}

const PROPIAS = {
  '/patos': htmlPato(),
  // duck-one recluta a quien mira, con las faltas de su guion.
  '/operacion-venganza': htmlAfiche([{ archivo: 'duck-one', gesto: 'señala', toma: { giro: -12, altura: 4 } }], 'SE BUZCA:<br>HADBERSARIO'),
  // Los pilotos de cada nivel, con el lema del nivel.
  '/operacion-venganza/nivel-2': htmlAfiche(
    [
      { archivo: 'moby-duck', gesto: 'saca músculo', toma: { giro: -30, altura: 6 } },
      { archivo: 'duke', gesto: 'saludo real', toma: { giro: -50, altura: 6 } },
    ],
    'LA RABIA<br>Y LA<br>BELLEZA',
  ),
  '/operacion-venganza/nivel-3': htmlAfiche([{ archivo: 'duky', gesto: 'aletea', toma: { giro: -30, altura: 6 } }], 'EL FANTASMA<br>AMARILLO'),
}

const navegador = await chromium.launch()
const pagina = await navegador.newPage({ viewport: { width: ANCHO, height: ALTO } })

for (const [ruta, { archivo, titulo, indexar = true, tarjeta }] of Object.entries(PAGINAS)) {
  if (!indexar || tarjeta) continue
  await pagina.setContent(PROPIAS[ruta] ?? html(tituloCorto(titulo)))
  await pagina.evaluate(() => document.fonts.ready)
  const destino = `${root}public${tarjetaDe(archivo)}`
  mkdirSync(dirname(destino), { recursive: true })
  await pagina.screenshot({ path: destino, type: 'jpeg', quality: 90 })
  console.log(`og: ${destino.slice(root.length)}`)
}

await navegador.close()
