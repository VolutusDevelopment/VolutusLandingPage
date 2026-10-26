// Las tiras del juego: cada toma de la escena 1 (src/lib/escena1.js) en una
// imagen PNG con sus cuadros de lado a lado, y la de duck-one caminando para
// la pantalla de carga. Se pintan con el mismo motor que las láminas.
//
//   node scripts/operacion-venganza/escena1/sprites.mjs
//
// Se corre a mano cuando cambia una toma, y las imágenes se commitean en
// public/operacion-venganza: pintarlas tarda y no entra al build.

import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { pixel3d, marco } from '../pilotos/tres.mjs'
import { PERSONAJES } from '../pilotos/cuerpos.mjs'
import { TOMAS_3D } from './tomas.mjs'
import { CARGA, LADO, MODOS, TOMAS, cuadrosDe, rutaDeToma } from '../../../src/lib/escena1.js'

const PUBLICO = fileURLToPath(new URL('../../../public', import.meta.url))
const CIELO = '#5c94fc'

// pixel3d entrega un SVG de tramos por color; de vuelta a una rejilla de colores.
const rejilla = (svg, lado) => {
  const celdas = Array.from({ length: lado }, () => Array(lado).fill(null))
  for (const [, color, d] of svg.matchAll(/<path fill="(#[0-9a-f]{6})"(?: fill-opacity="[^"]+")? d="([^"]+)"/gi))
    for (const [, x, y, n] of d.matchAll(/M(\d+) (\d+)h(\d+)/g)) for (let i = 0; i < Number(n); i++) celdas[Number(y)][Number(x) + i] = color
  return celdas
}

// PNG con paleta (tipo 3); el vacío es transparente o del color `fondo`.
const png = (cuadros, fondo) => {
  const alto = cuadros[0].length
  const ancho = cuadros[0][0].length * cuadros.length
  const paleta = [null]
  const indice = new Map([[null, 0]])
  const filas = Buffer.alloc((ancho + 1) * alto)
  for (let y = 0; y < alto; y++)
    cuadros.forEach((cuadro, k) =>
      cuadro[y].forEach((celda, x) => {
        const color = celda ?? fondo
        if (!indice.has(color)) indice.set(color, paleta.push(color) - 1)
        filas[y * (ancho + 1) + 1 + k * cuadro[y].length + x] = indice.get(color)
      }),
    )
  if (paleta.length > 256) throw new Error(`sprites: ${paleta.length} colores no caben en una paleta`)
  const crc = (buf) => {
    let c = ~0
    for (const b of buf) {
      c ^= b
      for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
    }
    return ~c >>> 0
  }
  const trozo = (tipo, datos) => {
    const cuerpo = Buffer.concat([Buffer.from(tipo), datos])
    const largo = Buffer.alloc(4)
    largo.writeUInt32BE(datos.length)
    const suma = Buffer.alloc(4)
    suma.writeUInt32BE(crc(cuerpo))
    return Buffer.concat([largo, cuerpo, suma])
  }
  const cabecera = Buffer.alloc(13)
  cabecera.writeUInt32BE(ancho, 0)
  cabecera.writeUInt32BE(alto, 4)
  cabecera.set([8, 3, 0, 0, 0], 8)
  const rgb = Buffer.from(paleta.flatMap((c) => (c ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : [0, 0, 0])))
  const alfa = Buffer.from(paleta.map((c) => (c ? 255 : 0)))
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), trozo('IHDR', cabecera), trozo('PLTE', rgb), trozo('tRNS', alfa), trozo('IDAT', deflateSync(filas, { level: 9 })), trozo('IEND', Buffer.alloc(0))])
}

const escribir = (ruta, datos) => {
  writeFileSync(`${PUBLICO}${ruta}`, datos)
  console.log(`sprites: ${ruta} (${(datos.length / 1024).toFixed(1)} KB)`)
}

mkdirSync(`${PUBLICO}/operacion-venganza/escena1`, { recursive: true })

// duck-one de tres cuartos, como en la lámina de la pantalla de carga.
const duckOne = PERSONAJES.find((p) => p.archivo === 'duck-one')
const pasos = Array.from({ length: CARGA.cuadros }, (_, k) => duckOne.andando(k / CARGA.cuadros))
const encuadre = ((m) => ({ c: m.c, radio: m.radio * 0.9 }))(marco(pasos[0]))
escribir(CARGA.ruta, png(pasos.map((f) => rejilla(pixel3d(f, { giro: -40, altura: 8 }, CARGA.lado, 1, encuadre), CARGA.lado))))

for (const toma of TOMAS) {
  const { escena, camara } = TOMAS_3D[toma.id]
  for (const modo of toma.segunModo ? MODOS : [MODOS[0]]) {
    const cuadros = Array.from({ length: cuadrosDe(toma) }, (_, k) => {
      const u = k / cuadrosDe(toma)
      const [ojo, mira, campo] = camara(u)
      return rejilla(pixel3d(escena(u, modo), { ojo, mira, campo }, LADO, 1, { c: [0, 0, 0], radio: 1 }), LADO)
    })
    escribir(rutaDeToma(toma, modo), png(cuadros, CIELO))
  }
}
