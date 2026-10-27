// Las tiras del juego: cada toma de una escena (src/lib/escena<n>.js) en una
// imagen PNG con sus cuadros de lado a lado, pintados con el motor de las
// láminas y el cielo del atardecer. Las escriben los sprites.mjs de cada
// escena, en public/operacion-venganza.

import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pixel3d } from './pilotos/tres.mjs'
import { cielo } from './escena1/lugares.mjs'
import { LADO, MODOS, cuadrosDe } from '../../src/lib/escena1.js'

const PUBLICO = fileURLToPath(new URL('../../public', import.meta.url))

// pixel3d entrega un SVG de tramos por color; de vuelta a una rejilla de colores.
export const rejilla = (svg, lado) => {
  const celdas = Array.from({ length: lado }, () => Array(lado).fill(null))
  for (const [, color, d] of svg.matchAll(/<path fill="(#[0-9a-f]{6})"(?: fill-opacity="[^"]+")? d="([^"]+)"/gi))
    for (const [, x, y, n] of d.matchAll(/M(\d+) (\d+)h(\d+)/g)) for (let i = 0; i < Number(n); i++) celdas[Number(y)][Number(x) + i] = color
  return celdas
}

// Una paleta tiene 256 colores, el primero para el vacío. Si sobran (el vidrio
// de una cúpula mezcla todo lo que tiene detrás), los menos usados toman el más
// parecido de los que quedan.
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const reducir = (cuadros) => {
  const usos = new Map()
  for (const celda of cuadros.flat(2)) if (celda) usos.set(celda, (usos.get(celda) ?? 0) + 1)
  if (usos.size < 256) return cuadros
  const orden = [...usos.keys()].sort((a, b) => usos.get(b) - usos.get(a))
  const quedan = orden.slice(0, 255)
  const parecido = new Map()
  for (const color of orden.slice(255)) {
    const v = hex(color)
    const distancia = (c) => Math.hypot(...hex(c).map((x, i) => x - v[i]))
    parecido.set(color, quedan.reduce((a, b) => (distancia(b) < distancia(a) ? b : a)))
  }
  return cuadros.map((cuadro) => cuadro.map((fila) => fila.map((celda) => parecido.get(celda) ?? celda)))
}

// PNG con paleta (tipo 3); el vacío es transparente.
export const png = (todos) => {
  const cuadros = reducir(todos)
  const alto = cuadros[0].length
  const ancho = cuadros[0][0].length * cuadros.length
  const paleta = [null]
  const indice = new Map([[null, 0]])
  const filas = Buffer.alloc((ancho + 1) * alto)
  for (let y = 0; y < alto; y++)
    cuadros.forEach((cuadro, k) =>
      cuadro[y].forEach((celda, x) => {
        if (!indice.has(celda)) indice.set(celda, paleta.push(celda) - 1)
        filas[y * (ancho + 1) + 1 + k * cuadro[y].length + x] = indice.get(celda)
      }),
    )
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
  const rgb = Buffer.from(paleta.flatMap((c) => (c ? hex(c) : [0, 0, 0])))
  const alfa = Buffer.from(paleta.map((c) => (c ? 255 : 0)))
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), trozo('IHDR', cabecera), trozo('PLTE', rgb), trozo('tRNS', alfa), trozo('IDAT', deflateSync(filas, { level: 9 })), trozo('IEND', Buffer.alloc(0))])
}

export const escribir = (ruta, datos) => {
  mkdirSync(dirname(`${PUBLICO}${ruta}`), { recursive: true })
  writeFileSync(`${PUBLICO}${ruta}`, datos)
  console.log(`sprites: ${ruta} (${(datos.length / 1024).toFixed(1)} KB)`)
}

// Una tira por toma del guion, con la escena 3D de `TOMAS_3D`; las que van
// `segunModo`, una por modo. `encima`, si la toma lo tiene, pinta sobre los
// cuadros lo que va en la pantalla y no en la escena (un visor, una marca).
export const escribirTiras = (TOMAS, TOMAS_3D, rutaDeToma) => {
  for (const toma of TOMAS) {
    const { escena, camara, encima } = TOMAS_3D[toma.id]
    for (const modo of toma.segunModo ? MODOS : [MODOS[0]]) {
      const cuadros = Array.from({ length: cuadrosDe(toma) }, (_, k) => {
        const u = k / cuadrosDe(toma)
        const [ojo, mira, campo] = camara(u)
        const celdas = rejilla(pixel3d(escena(u, modo), { ojo, mira, campo, cielo }, LADO, 1, { c: [0, 0, 0], radio: 1 }), LADO)
        encima?.(celdas, u, modo)
        return celdas
      })
      escribir(rutaDeToma(toma, modo), png(cuadros))
    }
  }
}
