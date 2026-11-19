// Los cuadros en que cada personaje pisa, toma por toma, para que sus pasos
// suenen justo cuando el pie toca el suelo (escenaN/sonidos.mjs). Recorre las
// tiras como las dibuja tiras.mjs y lee la `fase` con que camina cada figura
// (pilotos/cuerpos.mjs): el pie derecho apoya cuando la fase cruza 0, y el
// izquierdo, 0,5. Cuenta lo que se ve, cuadro a cuadro: el primer cuadro en
// que un pie que iba en el aire está en el suelo. Las tomas con más de cuatro
// que caminan son multitudes, y suenan como tales. Con números, rehace solo
// esas escenas.
//
//   node scripts/operacion-venganza/pisadas.mjs [escena…]

import { registerHooks } from 'node:module'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

// Para leer la fase sin tocar cuerpos.mjs: al cargarlo, figura anota la suya.
const FIGURA = 'const figura = (p, { tronco, manos = {}, extra = [], fase = null, salto = 0, agacha = 0, inclina = 0, patada = Math.PI / 2, sinSombra }) => {'
registerHooks({
  load(url, context, nextLoad) {
    const cargado = nextLoad(url, context)
    if (!url.endsWith('/pilotos/cuerpos.mjs')) return cargado
    const fuente = String(cargado.source)
    if (!fuente.includes(FIGURA)) throw new Error('figura cambió en pilotos/cuerpos.mjs: actualiza FIGURA')
    return { ...cargado, source: fuente.replace(FIGURA, `${FIGURA} globalThis.figuras?.push([p, fase]);`) }
  },
})

const { cuadrosDe } = await import('../../src/lib/operacion-venganza/escena1.js')
const { pDuckOne, pMoby, pDuke } = await import('./pilotos/cuerpos.mjs')
const { pAlmirante } = await import('./escena1/personajes.mjs')

// Quién es cada figura, por sus piernas: los marineros comparten las suyas.
const CONOCIDOS = { duckOne: pDuckOne, moby: pMoby, duke: pDuke, almirante: pAlmirante }
const quienEs = (p) => Object.keys(CONOCIDOS).find((quien) => JSON.stringify(CONOCIDOS[quien].pierna) === JSON.stringify(p.pierna)) ?? 'marinero'
const enElSuelo = (fase) => (fase === null ? [true, true] : [0, 0.5].map((pie) => Math.sin(2 * Math.PI * (fase + pie)) >= 0))
const ESCENAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const MULTITUD = 4
const ARCHIVO = new URL('./pisadas.json', import.meta.url)

const pedidas = process.argv.slice(2).map(Number)
const pisadas = pedidas.length && existsSync(ARCHIVO) ? JSON.parse(readFileSync(ARCHIVO, 'utf8')) : {}
for (const numero of pedidas.length ? pedidas : ESCENAS) {
  delete pisadas[numero]
  const guion = await import(`../../src/lib/operacion-venganza/escena${numero}.js`)
  const { TOMAS_3D } = await import(`./escena${numero}/tomas.mjs`)
  for (const toma of guion.TODAS ?? guion.TOMAS) {
    const escena = TOMAS_3D[toma.id]?.escena
    if (!escena) continue
    const cuadros = cuadrosDe(toma)
    const antes = new Map()
    const deLaToma = {}
    for (let k = 0; k < cuadros; k++) {
      globalThis.figuras = []
      escena(k / cuadros, 'cursor')
      const vistos = {}
      for (const [p, fase] of globalThis.figuras) {
        const quien = quienEs(p)
        const clave = vistos[quien] ? `${quien}${vistos[quien] + 1}` : quien
        vistos[quien] = (vistos[quien] ?? 0) + 1
        const suelo = enElSuelo(fase)
        if (antes.has(clave) && fase !== null && suelo.some((pie, i) => pie && !antes.get(clave)[i])) (deLaToma[clave] ??= []).push(k)
        antes.set(clave, suelo)
      }
    }
    const quienes = Object.keys(deLaToma)
    if (quienes.length && quienes.length <= MULTITUD) (pisadas[numero] ??= {})[toma.id] = deLaToma
  }
}
writeFileSync(ARCHIVO, `${JSON.stringify(pisadas, null, 2)}\n`)
for (const [numero, tomas] of Object.entries(pisadas))
  for (const [toma, quienes] of Object.entries(tomas)) console.log(`escena ${numero} · ${toma}: ${Object.entries(quienes).map(([q, c]) => `${q} ${c.join(' ')}`).join(' | ')}`)
// Algún módulo de las escenas deja algo andando: se termina a mano.
process.exit(0)
