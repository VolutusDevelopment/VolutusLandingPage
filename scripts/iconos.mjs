// Genera los íconos del sitio con la ola de lib/logotipo.js, en blanco sobre el
// color de acción:
//
//   - `public/favicon.svg`, para la pestaña y el buscador, con las esquinas
//     redondeadas.
//   - `public/favicon.ico`, con 16, 32 y 48 px, para Safari y para quien pide
//     /favicon.ico sin leer el HTML. Google pide un múltiplo de 48.
//   - `public/apple-touch-icon.png`, 180 px a sangre y sin transparencia: iOS
//     redondea las esquinas solo. Es también el logo de la Organization.
//
//   pnpm iconos
//
// Se corre a mano cuando cambia la ola y los archivos se commitean, igual que
// las tarjetas OG: los PNG necesitan el Chromium de Playwright. La geometría
// sale de lib/logotipo.js, así que el ícono no puede quedar con una marca vieja.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { OLA, trazoDe } from '../src/lib/logotipo.js'
import { chromium } from 'playwright'

const root = fileURLToPath(new URL('..', import.meta.url))

function svg({ redondeado }) {
  const radio = redondeado ? ' rx="14"' : ''
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    `<rect width="64" height="64"${radio} fill="#116492"/>` +
    `<path d="${trazoDe(OLA)}" fill="none" stroke="#fff" stroke-width="${OLA.grosor}" stroke-linecap="round"/>` +
    '</svg>\n'
  )
}

writeFileSync(`${root}public/favicon.svg`, svg({ redondeado: true }))

const navegador = await chromium.launch()
const pagina = await navegador.newPage()

async function png(lado, redondeado) {
  await pagina.setViewportSize({ width: lado, height: lado })
  await pagina.setContent(
    `<style>*{margin:0}svg{display:block;width:${lado}px;height:${lado}px}</style>${svg({ redondeado })}`,
  )
  return pagina.screenshot({ omitBackground: redondeado })
}

writeFileSync(`${root}public/apple-touch-icon.png`, await png(180, false))

// Un ICO con PNG adentro: la cabecera, una entrada de 16 bytes por tamaño y,
// después, las imágenes una tras otra.
const TAMANOS = [16, 32, 48]
const imagenes = []
for (const lado of TAMANOS) imagenes.push(await png(lado, true))
await navegador.close()

const cabecera = Buffer.alloc(6 + 16 * TAMANOS.length)
cabecera.writeUInt16LE(1, 2)
cabecera.writeUInt16LE(TAMANOS.length, 4)
let desde = cabecera.length
imagenes.forEach((imagen, i) => {
  const entrada = 6 + 16 * i
  cabecera.writeUInt8(TAMANOS[i], entrada)
  cabecera.writeUInt8(TAMANOS[i], entrada + 1)
  cabecera.writeUInt16LE(1, entrada + 4)
  cabecera.writeUInt16LE(32, entrada + 6)
  cabecera.writeUInt32LE(imagen.length, entrada + 8)
  cabecera.writeUInt32LE(desde, entrada + 12)
  desde += imagen.length
})
writeFileSync(`${root}public/favicon.ico`, Buffer.concat([cabecera, ...imagenes]))
