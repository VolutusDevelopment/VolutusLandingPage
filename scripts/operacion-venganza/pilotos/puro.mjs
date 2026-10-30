// Lámina v17: moby-duck y el puro. Da una calada sacando pecho para hacerse el
// duro, el puro le gana: tose sin control, el ceño se le da vuelta y llora a
// chorros. Se seca con el antebrazo, vuelve a sacar pecho y otra calada.
//
//   node scripts/operacion-venganza/pilotos/puro.mjs <carpeta> <hoja.html>
//
// Escribe <carpeta>/project/V17-moby-duck-radical.dc.html y, en la hoja, los
// 24 cuadros de la escena para revisarlos de una vez.

import { pixel3d, marco } from './tres.mjs'
import { calada } from './calada.mjs'
import { celda, fila, pagina } from './tablero.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'

const [RAIZ, HOJA] = process.argv.slice(2)
const N = 72
const TAM = 3
const LADO = N * TAM
const CUADROS = 24

// ── La lámina ────────────────────────────────────────────────────────────

const TOMAS = [
  ['tres cuartos', { giro: -40, altura: 8 }],
  ['de frente', { giro: -15, altura: 5 }],
  ['de perfil', { giro: -90, altura: 0 }],
  ['contrapicado', { giro: -30, altura: -28 }],
  ['picado', { giro: 35, altura: 35 }],
  ['del otro lado', { giro: 40, altura: 8 }],
]
// Quieto en pleno ataque de tos, con las lágrimas cayéndole por la cara.
const QUIETO = 9

const esSombra = (f) => f.flat === '#4a80e6'
const sinSombra = (figura, toma) => (toma.altura < 0 ? figura.filter((f) => !esSombra(f)) : figura)
const cuadros = Array.from({ length: CUADROS }, (_, k) => calada(k))
const m = marco(cuadros.flat().filter((f) => !esSombra(f)))
const encuadre = { c: m.c, radio: m.radio * 0.78 }
const pinta = (toma, tam = TAM) => cuadros.map((f) => pixel3d(sinSombra(f, toma), toma, N, tam, encuadre))

mkdirSync(`${RAIZ}/project`, { recursive: true })
writeFileSync(
  `${RAIZ}/project/V17-moby-duck-radical.dc.html`,
  pagina({
    titulo: 'moby-duck, el puro',
    papel: 'La fuerza bruta · nivel 2',
    nombre: 'moby-duck',
    bajada: 'El puro',
    detalle: 'Duro por fuera: da una calada sacando pecho, con la brasa al rojo. El puro le gana siempre: se le dobla el cuerpo con cada tos, se tapa el pico con el puño, el ceño se le da vuelta y llora a chorros. Se seca con el antebrazo, vuelve a sacar pecho y otra calada, como si nada.',
    animaciones: `.g24{animation:cuadro24 4.2s step-end infinite}
@keyframes cuadro24{0%{opacity:1}4.167%{opacity:0}100%{opacity:0}}`,
    filas: [fila('Tose y llora', TOMAS.map(([nombre, toma]) => celda(nombre, pinta(toma), 'g24', 4.2, QUIETO, LADO)))],
    alto: 560,
  }),
)

const tira = (toma) => `<div style="display:flex;flex-wrap:wrap;gap:2px;margin:2px">${pinta(toma, 2).map((s, k) => `<div style="background:#5c94fc;position:relative">${s}<span style="position:absolute;left:2px;top:0;font:10px sans-serif;color:#fff">${k}</span></div>`).join('')}</div>`
writeFileSync(HOJA, `<html><meta charset="utf-8"><body style="margin:0;background:#fff">${TOMAS.slice(0, 2).map(([, toma]) => tira(toma)).join('')}</body></html>`)
