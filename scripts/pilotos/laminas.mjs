// Láminas v14: los cuatro pilotos de cuerpo entero, caminando, con sus tres
// gestos y hablando, animados cuadro a cuadro.
//
//   node scripts/pilotos/laminas.mjs <carpeta> <hoja.html>
//
// Escribe <carpeta>/project/V14-<piloto>-cuerpo.dc.html y, en la hoja, todos
// los cuadros quietos para revisarlos de una vez.

import { pixel3d, marco } from './tres.mjs'
import { PERSONAJES } from './cuerpos.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'

const [RAIZ, HOJA] = process.argv.slice(2)
const N = 72
const TAM = 3
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

const mono = "font-family: 'Geist Mono', monospace; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase"
const sinSombra = (figura, toma) => (toma.altura < 0 ? figura.filter((f) => f.flat !== '#4a80e6') : figura)

// Cuadros apilados; la clase de animación muestra uno a la vez.
const animacion = (cuadros, clase, duracion, quieto) =>
  cuadros
    .map((svg, k) => svg.replace('<svg style="display: block"', `<svg class="f ${clase}${k === quieto ? ' quieto' : ''}" style="position: absolute; left: 0; top: 0; animation-delay: -${(((cuadros.length - k) % cuadros.length) * duracion / cuadros.length).toFixed(3)}s"`))
    .join('')

const celda = (titulo, cuadros, clase, duracion, quieto) => `<div style="display: flex; flex-direction: column; gap: 8px"><div style="height: 232px; display: flex; align-items: center; justify-content: center; background: #5c94fc; border-radius: 12px"><div style="position: relative; width: ${N * TAM}px; height: ${N * TAM}px">${animacion(cuadros, clase, duracion, quieto)}</div></div><span style="${mono}; color: #47607a">${titulo}</span></div>`

const fila = (titulo, celdas) => `<div style="display: flex; flex-direction: column; gap: 12px">
<h2 style="margin: 0; font-size: 18px; font-weight: 800">${titulo}</h2>
<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px">
${celdas.join('\n')}
</div>
</div>`

const lamina = (p) => {
  const pasos = Array.from({ length: PASOS }, (_, k) => p.andando(k / PASOS))
  const habla = Array.from({ length: CUADROS_GESTO }, (_, k) => p.hablando(k / CUADROS_GESTO))
  const gestos = p.gestos.map((g) => ({ ...g, cuadros: Array.from({ length: CUADROS_GESTO }, (_, k) => g.pose(k / CUADROS_GESTO)) }))
  const encuadre = apretado([...pasos, ...habla, ...gestos.flatMap((g) => g.cuadros)].flat())
  const pinta = (figuras, toma) => figuras.map((f) => pixel3d(sinSombra(f, toma), toma, N, TAM, encuadre))
  const ritmo = p.archivo === 'duky' ? 'p8r' : 'p8'
  const duracionPaso = p.archivo === 'duky' ? 0.56 : 0.8
  const caminando = TOMAS.map(([nombre, toma]) => celda(nombre, pinta(pasos, toma), ritmo, duracionPaso, 2))
  const gesticulando = gestos.flatMap((g) => tomasGesto(g.lado).map(([nombre, toma]) => celda(`${g.nombre} · ${nombre}`, pinta(g.cuadros, toma), 'g12', 1.8, 6)))
  const hablando = TOMAS.map(([nombre, toma]) => celda(nombre, pinta(habla, toma), 'g12', 1.8, 3))
  const cuadros = { pasos, habla, gestos }
  return { cuadros, html: `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${p.nombre}, cuerpo entero</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@1,800&family=Geist:wght@400;800&family=Geist+Mono:wght@400&display=swap">
<style>
body{margin:0}
.f{opacity:0}
.p8{animation:cuadro8 .8s step-end infinite}
.p8r{animation:cuadro8 .56s step-end infinite}
.g12{animation:cuadro12 1.8s step-end infinite}
@keyframes cuadro8{0%{opacity:1}12.5%{opacity:0}100%{opacity:0}}
@keyframes cuadro12{0%{opacity:1}8.333%{opacity:0}100%{opacity:0}}
@media (prefers-reduced-motion: reduce){.f{animation:none}.quieto{opacity:1}}
</style>
</helmet>
<div style="width: 1440px; height: 1180px; box-sizing: border-box; padding: 40px 56px; display: flex; flex-direction: column; gap: 32px; background: #f6f9fc; font-family: Geist, system-ui, sans-serif; color: #0a1a2a">
<div style="display: flex; gap: 48px; align-items: flex-end">
<div style="display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; width: 420px">
<span style="${mono}; color: #47607a">${p.papel}</span>
<h1 style="margin: 0; font-family: Archivo, sans-serif; font-style: italic; font-weight: 800; font-size: 34px; line-height: 1.05">${p.nombre}</h1>
<span style="font-size: 15px; line-height: 1.4">De cuerpo entero</span>
</div>
<p style="margin: 0; font-size: 15px; line-height: 1.6; max-width: 760px">${p.detalle}</p>
</div>
${fila('Caminando', caminando)}
${fila('Gesticulando', gesticulando)}
${fila('Hablando', hablando)}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1440,"height":1180}}'>
class Component extends DCLogic {
renderVals() {
return {};
}
}
</script>
</body>
</html>
` }
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
