// Láminas v14: los cuatro pilotos de cuerpo entero, caminando, con sus tres
// gestos y hablando, animados cuadro a cuadro.
//
//   node scripts/operacion-venganza/pilotos/laminas.mjs <carpeta> <hoja.html>
//
// Escribe <carpeta>/project/V14-<piloto>-cuerpo.dc.html y, en la hoja, todos
// los cuadros quietos para revisarlos de una vez.

import { pixel3d, marco } from './tres.mjs'
import { PERSONAJES } from './cuerpos.mjs'
import { celda, fila, pagina } from './tablero.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'

const [RAIZ, HOJA] = process.argv.slice(2)
const N = 72
const TAM = 3
const LADO = N * TAM
const PASOS = 8
const CUADROS_GESTO = 12

const TOMAS = [
  ['tres cuartos', { giro: -40, altura: 8 }],
  ['de frente', { giro: 0, altura: 5 }],
  ['de perfil', { giro: -90, altura: 0 }],
  ['contrapicado', { giro: -30, altura: -28 }],
  ['picado', { giro: 35, altura: 35 }],
  ['de espaldas', { giro: -145, altura: 12 }],
]
const tomasGesto = (lado) => [['tres cuartos', { giro: lado * 40, altura: 8 }], ['de frente', { giro: 0, altura: 5 }]]

// La esfera de marco() es holgada para una figura alta: se aprieta un 10 %.
const apretado = (figuras) => ((m) => ({ c: m.c, radio: m.radio * 0.9 }))(marco(figuras))

const ANIMACIONES = `.p8{animation:cuadro8 .8s step-end infinite}
.p8r{animation:cuadro8 .56s step-end infinite}
.g12{animation:cuadro12 1.8s step-end infinite}
@keyframes cuadro8{0%{opacity:1}12.5%{opacity:0}100%{opacity:0}}
@keyframes cuadro12{0%{opacity:1}8.333%{opacity:0}100%{opacity:0}}`

const sinSombra = (figura, toma) => (toma.altura < 0 ? figura.filter((f) => f.flat !== '#4a80e6') : figura)

const lamina = (p) => {
  const pasos = Array.from({ length: PASOS }, (_, k) => p.andando(k / PASOS))
  const habla = Array.from({ length: CUADROS_GESTO }, (_, k) => p.hablando(k / CUADROS_GESTO))
  const gestos = p.gestos.map((g) => ({ ...g, cuadros: Array.from({ length: CUADROS_GESTO }, (_, k) => g.pose(k / CUADROS_GESTO)) }))
  const encuadre = apretado([...pasos, ...habla, ...gestos.flatMap((g) => g.cuadros)].flat())
  const pinta = (figuras, toma) => figuras.map((f) => pixel3d(sinSombra(f, toma), toma, N, TAM, encuadre))
  const ritmo = p.archivo === 'duky' ? 'p8r' : 'p8'
  const duracionPaso = p.archivo === 'duky' ? 0.56 : 0.8
  const caminando = TOMAS.map(([nombre, toma]) => celda(nombre, pinta(pasos, toma), ritmo, duracionPaso, 2, LADO))
  const gesticulando = gestos.flatMap((g) => tomasGesto(g.lado).map(([nombre, toma]) => celda(`${g.nombre} · ${nombre}`, pinta(g.cuadros, toma), 'g12', 1.8, 6, LADO)))
  const hablando = TOMAS.map(([nombre, toma]) => celda(nombre, pinta(habla, toma), 'g12', 1.8, 3, LADO))
  const cuadros = { pasos, habla, gestos }
  return {
    cuadros,
    html: pagina({
      titulo: `${p.nombre}, cuerpo entero`,
      papel: p.papel,
      nombre: p.nombre,
      bajada: 'De cuerpo entero',
      detalle: p.detalle,
      animaciones: ANIMACIONES,
      filas: [fila('Caminando', caminando), fila('Gesticulando', gesticulando), fila('Hablando', hablando)],
      alto: 1180,
    }),
  }
}

// Hoja de revisión: todos los cuadros quietos, de perfil y en tres cuartos.
const hoja = []
mkdirSync(`${RAIZ}/project`, { recursive: true })
for (const p of PERSONAJES) {
  const { html, cuadros } = lamina(p)
  writeFileSync(`${RAIZ}/project/V14-${p.archivo}-cuerpo.dc.html`, html)
  const encuadre = apretado([...cuadros.pasos, ...cuadros.habla, ...cuadros.gestos.flatMap((g) => g.cuadros)].flat())
  const tira = (figs, toma) => `<div style="display:flex;gap:2px;margin:2px">${figs.map((f) => `<div style="background:#5c94fc">${pixel3d(f, toma, N, 2, encuadre)}</div>`).join('')}</div>`
  hoja.push(`<h3 style="font:14px sans-serif;margin:6px">${p.nombre}</h3>`, tira(cuadros.pasos, TOMAS[2][1]), tira(cuadros.pasos, TOMAS[0][1]), tira(cuadros.habla, TOMAS[0][1]), ...cuadros.gestos.map((g) => tira(g.cuadros, tomasGesto(g.lado)[0][1])))
}
writeFileSync(HOJA, `<html><body style="margin:0;background:#fff">${hoja.join('')}</body></html>`)
