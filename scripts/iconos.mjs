// Genera el favicon (`public/favicon.svg`) y el ícono de la pantalla de inicio
// del iPhone (`public/apple-touch-icon.png`): la V del logotipo con la ola de
// puntos al lado, en blanco sobre el color de acción.
//
//   pnpm iconos
//
// Se corre a mano cuando cambia el logotipo y los archivos se commitean, igual
// que las tarjetas OG: el PNG necesita el Chromium de Playwright. La geometría
// sale de lib/logotipo.js, así que el ícono no puede quedar con una marca vieja.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { LETRAS, TRAMAS } from '../src/lib/logotipo.js'
import { chromium } from 'playwright'

const root = fileURLToPath(new URL('..', import.meta.url))

// En la palabra la V mide la mitad que la ola; aquí se agranda a altura de
// mayúscula, apenas más baja que la ola, apoyada en la misma línea de base.
// La ola vive al final de la palabra (x ≈ 560) y se corre hasta pegarla a la V.
// La trama gruesa porque la fina se empasta a tamaño de favicon.
const V_ESCALA = 1.75
const V = `translate(28.9 178) scale(${V_ESCALA}) translate(-28.9 -170)`
const OLA_X = -425
const LADO = 285
const X = 5
const Y = -33

// Las líneas rectas de la ola (y 113–173) siguen hacia la izquierda hasta la V
// y se detienen a `HOLGURA` de la letra como en el logotipo.
const HOLGURA = 5
const CONTORNO_V = [
  [41.5, 170], [28.9, 101.3], [47.4, 101.3], [54.7, 151],
  [80, 101.3], [99, 101.3], [62.3, 170],
].map(([x, y]) => [28.9 + (x - 28.9) * V_ESCALA, 178 - (170 - y) * V_ESCALA])

function distanciaAlSegmento([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax
  const dy = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - ax - t * dx, py - ay - t * dy)
}

function tocaLaV(punto, radio) {
  // Basta el borde derecho: la fila viene desde la derecha y se corta al llegar.
  return punto[0] < Math.max(...CONTORNO_V.map(([x]) => x)) &&
    CONTORNO_V.some((a, i) => distanciaAlSegmento(punto, a, CONTORNO_V[(i + 1) % CONTORNO_V.length]) < radio + HOLGURA)
}

const PUNTOS = [...TRAMAS.gruesa.puntos.matchAll(/M([\d.]+) ([\d.]+)a([\d.]+)/g)].map(([, x, y, r]) => ({
  x: +x + +r + OLA_X,
  y: +y,
  r: +r,
}))

/** Una línea recta por cada fila que tiene un punto en x = 583 de la palabra. */
function relleno() {
  const filas = PUNTOS.filter((p) => Math.abs(p.x - (583 + OLA_X)) < 0.5)
  const extra = []
  for (const { y, r } of filas) {
    for (let x = 573 + OLA_X - 10; !tocaLaV([x, y], r); x -= 10) extra.push({ x, y, r })
  }
  return extra
}

const circulo = ({ x, y, r }) => `M${(x - r).toFixed(1)} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`

// Los extremos afinados de esas filas (x < 570) sobran: la línea ya no termina ahí.
const OLA = [...PUNTOS.filter((p) => !(p.x < 570 + OLA_X && p.y >= 113)), ...relleno()]
  .map(circulo)
  .join('')

function svg({ redondeado }) {
  const radio = redondeado ? ' rx="59"' : ''
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${X} ${Y} ${LADO} ${LADO}">` +
    `<rect x="${X}" y="${Y}" width="${LADO}" height="${LADO}"${radio} fill="#2B5F73"/>` +
    `<g fill="#FFFFFF"><path transform="${V}" d="${LETRAS[0]}"/>` +
    `<path d="${OLA}"/></g></svg>\n`
  )
}

writeFileSync(`${root}public/favicon.svg`, svg({ redondeado: true }))

// iOS redondea las esquinas solo y no acepta transparencia: va a sangre.
const navegador = await chromium.launch()
const pagina = await navegador.newPage({ viewport: { width: 180, height: 180 } })
await pagina.setContent(
  `<style>*{margin:0}svg{display:block;width:180px;height:180px}</style>${svg({ redondeado: false })}`,
)
await pagina.screenshot({ path: `${root}public/apple-touch-icon.png` })
await navegador.close()
