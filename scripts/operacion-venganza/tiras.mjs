// Las tiras del juego: cada toma de una escena (src/lib/escena<n>.js) en una
// imagen PNG con sus cuadros de lado a lado, pintados con el motor de las
// láminas y el cielo del atardecer. Las escriben los sprites.mjs de cada
// escena, en public/operacion-venganza.

import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pixel3d } from './pilotos/tres.mjs'
import { candidatosGpu, cerrarGpu } from './pilotos/gpu.mjs'
import { cielo } from './escena1/lugares.mjs'
import { ALTO, ANCHO, MODOS, cuadrosDe } from '../../src/lib/escena1.js'

const PUBLICO = fileURLToPath(new URL('../../public', import.meta.url))

// Las cámaras de las tomas se pensaron para un cuadro de 4:3. En 21:9 cada una
// abre su campo `ABRE` veces, y así se aleja un poco y no corta a nadie; la que
// lo pida abre las suyas, `abre` en su TOMAS_3D: las de la cabina de un caza,
// o pegadas a él, `EN_CABINA`.
export const ABRE = 1.4
export const EN_CABINA = 1.8
const abrir = (campo, abre) => (360 / Math.PI) * Math.atan(abre * Math.tan((campo * Math.PI) / 360))

// pixel3d entrega un SVG de tramos por color; de vuelta a una rejilla de colores.
export const rejilla = (svg, ancho, alto = ancho) => {
  const celdas = Array.from({ length: alto }, () => Array(ancho).fill(null))
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

// Un cuadro de ANCHO × ALTO: `formas` vistas desde `camara` ([ojo, mira, campo,
// vertical]), con el campo abierto `abre` veces y el cielo del atardecer donde
// no hay nada. Si viene `distancias`, se llena con la distancia a lo que se ve
// en cada pixel; `instante`, el número del cuadro en su tira, hace titilar el
// chorro de los motores. pixel3dGpu() pinta el mismo cuadro con la ayuda de la
// GPU (pilotos/gpu.mjs), también con cámaras ortográficas.
const ENCUADRE = { c: [0, 0, 0], radio: 1 }
const tomaDe = ([ojo, mira, campo, vertical], distancias, abre, instante, filas = ALTO) => ({ ojo, mira, campo: campo === undefined ? undefined : abrir(campo, abre), vertical, cielo, distancias, filas, instante })
export const pixel3dGpu = async (formas, toma, n, encuadre = ENCUADRE, llenado = 0.94) => {
  toma.candidatos = await candidatosGpu(formas, toma, n, encuadre, llenado)
  return pixel3d(formas, toma, n, 1, encuadre, llenado)
}
export const cuadro = (formas, camara, distancias, abre = ABRE, instante) => rejilla(pixel3d(formas, tomaDe(camara, distancias, abre, instante), ANCHO, 1, ENCUADRE), ANCHO, ALTO)
export const cuadroGpu = async (formas, camara, distancias, abre = ABRE, instante, { n = ANCHO, filas = ALTO, encuadre = ENCUADRE, llenado = 0.94 } = {}) => {
  const toma = tomaDe(camara, distancias, abre, instante, filas)
  return rejilla(await pixel3dGpu(formas, toma, n, encuadre, llenado), n, filas)
}

// Dónde cae `punto` en un cuadro de `camara`, como lo pinta pixel3d: [x, y]
// en pixeles, o null si queda detrás de la cámara.
export const proyectar = ([ojo, mira, campo, vertical = [0, 1, 0]], punto, abre = ABRE) => {
  const pto = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
  const uni = (a) => a.map((v) => v / Math.hypot(...a))
  const f = uni(mira.map((v, i) => v - ojo[i]))
  const derecha = uni(cruz(f, vertical))
  const arriba = cruz(derecha, f)
  const v = punto.map((p, i) => p - ojo[i])
  const lejos = pto(v, f)
  if (lejos <= 0) return null
  const medio = Math.tan((abrir(campo, abre) * Math.PI) / 360) * lejos
  return [((pto(v, derecha) / medio + 1) * ANCHO) / 2, ALTO / 2 - (pto(v, arriba) / medio) * (ANCHO / 2)]
}

// Lo que `dibuja` pinta sobre `celdas` a `lejos` metros de la cámara, tapado
// por lo que esté más cerca según las `distancias` de cuadro().
export const aSuDistancia = (celdas, distancias, lejos, dibuja) => {
  const antes = celdas.map((fila) => [...fila])
  dibuja(celdas)
  celdas.forEach((fila, y) => fila.forEach((_, x) => distancias[y]?.[x] < lejos && (fila[x] = antes[y][x])))
}

// La misma toma 3D en una tira más larga, al mismo ritmo: el u de la tira
// nueva recorre de `desde` a `hasta` del u de la vieja. Antes de 0 queda como
// empieza, y después de 1 como termina, o sigue su ciclo.
export const alargar = ({ escena, camara, encima, abre }, desde, hasta) => {
  const viejo = (u) => desde + (hasta - desde) * u
  return {
    abre,
    escena: (u, modo) => escena(viejo(u), modo),
    camara: (u) => camara(viejo(u)),
    encima: encima && ((celdas, u, modo, distancias) => encima(celdas, viejo(u), modo, distancias)),
  }
}

export const escribir = (ruta, datos) => {
  mkdirSync(dirname(`${PUBLICO}${ruta}`), { recursive: true })
  writeFileSync(`${PUBLICO}${ruta}`, datos)
  console.log(`sprites: ${ruta} (${(datos.length / 1024).toFixed(1)} KB)`)
}

// Una tira por toma del guion, con la escena 3D de `TOMAS_3D`; las que van
// `segunModo`, una por modo. `encima`, si la toma lo tiene, pinta sobre los
// cuadros lo que va en la pantalla y no en la escena (un visor, una marca), y
// recibe las distancias de cada pixel para que lo de atrás quede tapado. Se
// pintan con la GPU, si la hay. TOMAS_DESDE/TOMAS_HASTA acotan las tomas para
// repartir una escena entre varios procesos (renderizar.py).
export const escribirTiras = async (TOMAS, TOMAS_3D, rutaDeToma) => {
  const desde = Number(process.env.TOMAS_DESDE ?? 0)
  const hasta = Number(process.env.TOMAS_HASTA ?? TOMAS.length)
  for (const toma of TOMAS.slice(desde, hasta)) {
    const { escena, camara, encima, abre } = TOMAS_3D[toma.id]
    for (const modo of toma.segunModo ? MODOS : [MODOS[0]]) {
      const cuadros = []
      for (let k = 0; k < cuadrosDe(toma); k++) {
        const u = k / cuadrosDe(toma)
        const distancias = []
        const celdas = await cuadroGpu(escena(u, modo), camara(u), distancias, abre, k)
        encima?.(celdas, u, modo, distancias)
        cuadros.push(celdas)
      }
      escribir(rutaDeToma(toma, modo), png(cuadros))
    }
  }
  await cerrarGpu()
}
