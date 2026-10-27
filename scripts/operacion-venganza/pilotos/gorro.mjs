// Lámina v16: duck-one con un gorro cuartelero. Saluda con tanto brío que se
// lo bota de un manotazo, se queda en saludo mientras cae, se agacha a
// recogerlo y se lo vuelve a poner. Debajo esconde un rizo de resorte. La
// escena está en recoge.mjs.
//
//   node scripts/operacion-venganza/pilotos/gorro.mjs <carpeta> <hoja.html>
//
// Escribe <carpeta>/project/V16-duck-one-gorro.dc.html y, en la hoja, los
// 24 cuadros de la escena para revisarlos de una vez.

import { pixel3d, marco } from './tres.mjs'
import * as M from './modelos.mjs'
import { figura, pDuckOne, manosAndando } from './cuerpos.mjs'
import { CUADROS, recoge } from './recoge.mjs'
import { celda, fila, pagina } from './tablero.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'

const [RAIZ, HOJA] = process.argv.slice(2)
const N = 72
const TAM = 3
const LADO = N * TAM
const PASOS = 8

const res = (a, b) => a.map((v, i) => v - b[i])
const esc = (a, k) => a.map((v) => v * k)
const uni = (a) => esc(a, 1 / Math.hypot(...a))

const andando = (fase) => figura(pDuckOne, { tronco: M.DUCK_ONE, manos: manosAndando(pDuckOne, fase), fase })

// ── La lámina ────────────────────────────────────────────────────────────

const TOMAS = [
  ['tres cuartos', { giro: -40, altura: 8 }],
  ['de frente', { giro: 0, altura: 5 }],
  ['de perfil', { giro: -90, altura: 0 }],
  ['contrapicado', { giro: -30, altura: -28 }],
  ['picado', { giro: 35, altura: 35 }],
  ['de espaldas', { giro: -145, altura: 12 }],
]
// Cuadro que queda con movimiento reducido: el gorro en el suelo y el resorte a la vista.
const QUIETO = 9

const esSombra = (f) => f.flat === '#4a80e6'
const sinSombra = (figura, toma) => (toma.altura < 0 ? figura.filter((f) => !esSombra(f)) : figura)

const pasos = Array.from({ length: PASOS }, (_, k) => andando(k / PASOS))
const escena = Array.from({ length: CUADROS }, (_, k) => recoge(k / CUADROS))
// marco() encierra todo en una esfera y aquí sobra mucho (el pato agachado, el
// gorro en el aire): el radio se mide en el plano de cada toma, sin la sombra.
const pto = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const ejesDe = ({ giro, altura }) => {
  const [g, a] = [giro, altura].map((v) => (v * Math.PI) / 180)
  const derecha = uni([Math.sin(g), 0, -Math.cos(g)])
  return [derecha, [-Math.sin(a) * Math.cos(g), Math.cos(a), -Math.sin(a) * Math.sin(g)]]
}
const encuadreJusto = (grupos) => {
  const formas = grupos.flatMap(([figuras]) => figuras.flat()).filter((f) => !esSombra(f))
  const { c } = marco(formas)
  const radio = Math.max(...grupos.flatMap(([figuras, tomas]) => tomas.flatMap(([, toma]) => ejesDe(toma).flatMap((e) => figuras.flat().filter((f) => !esSombra(f)).map((f) => Math.abs(pto(res(f.c, c), e)) + Math.max(...f.r))))))
  return { c, radio }
}
const encuadre = encuadreJusto([[pasos, TOMAS], [escena, TOMAS]])
const pinta = (figuras, toma, tam = TAM) => figuras.map((f) => pixel3d(sinSombra(f, toma), toma, N, tam, encuadre))

const caminando = TOMAS.map(([nombre, toma]) => celda(nombre, pinta(pasos, toma), 'p8', 0.8, 2, LADO))
const seCae = TOMAS.map(([nombre, toma]) => celda(nombre, pinta(escena, toma), 'g24', 3.6, QUIETO, LADO))

mkdirSync(`${RAIZ}/project`, { recursive: true })
writeFileSync(
  `${RAIZ}/project/V16-duck-one-gorro.dc.html`,
  pagina({
    titulo: 'duck-one, el gorro',
    papel: 'El líder del escuadrón · nivel 1',
    nombre: 'duck-one',
    bajada: 'El gorro',
    detalle: 'Un gorro cuartelero ladeado a la derecha y con su piocha dorada. Saluda con tanto brío que se lo bota de un manotazo, se queda en saludo mientras cae y después se agacha a recogerlo y se lo encaja como si nada. Debajo asoma lo que el gorro tapa: un rizo de resorte que salta al quedar libre y vuelve a aplastarse.',
    animaciones: `.p8{animation:cuadro8 .8s step-end infinite}
.g24{animation:cuadro24 3.6s step-end infinite}
@keyframes cuadro8{0%{opacity:1}12.5%{opacity:0}100%{opacity:0}}
@keyframes cuadro24{0%{opacity:1}4.167%{opacity:0}100%{opacity:0}}`,
    filas: [fila('Caminando, con el gorro', caminando), fila('Se le cae el gorro', seCae)],
    alto: 860,
  }),
)

// Hoja de revisión: los 24 cuadros de la escena, en tres cuartos y de perfil.
const tira = (cuadros, toma) => `<div style="display:flex;flex-wrap:wrap;gap:2px;margin:2px">${pinta(cuadros, toma, 2).map((s, k) => `<div style="background:#5c94fc;position:relative">${s}<span style="position:absolute;left:2px;top:0;font:10px sans-serif;color:#fff">${k}</span></div>`).join('')}</div>`
writeFileSync(HOJA, `<html><meta charset="utf-8"><body style="margin:0;background:#fff">${[TOMAS[0], TOMAS[2]].map(([, toma]) => tira(escena, toma)).join('')}</body></html>`)
