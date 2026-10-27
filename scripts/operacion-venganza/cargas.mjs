// Las pantallas de carga del juego, en láminas del lienzo de Design: una por
// personaje, en teléfono y en escritorio, todas en la página «Pantallas de
// carga». Cada una es el personaje de tres cuartos sobre el azul del juego y
// la barra de bloques que se llena; la de los marineros, en cambio, los tiene
// cruzando la pantalla de lado a lado, cada uno en su perspectiva.
//
//   node scripts/operacion-venganza/cargas.mjs <carpeta>
//
// Escribe <carpeta>/project/<archivo>.dc.html.

import { pixel3d, marco } from './pilotos/tres.mjs'
import { mono } from './pilotos/tablero.mjs'
import { PERSONAJES, dukyFigura } from './pilotos/cuerpos.mjs'
import { ALMIRANTE, OFICIOS, corre } from './escena1/personajes.mjs'
import { writeFileSync } from 'node:fs'

const [RAIZ] = process.argv.slice(2)

const N = 72
const CUADROS = 8
const PASO = 0.8
const TRES_CUARTOS = { giro: -40, altura: 8 }
const PANTALLAS = { telefono: { ancho: 390, alto: 844, tam: 4, bloques: 12 }, escritorio: { ancho: 1440, alto: 900, tam: 6, bloques: 18 } }

const fases = (pose) => Array.from({ length: CUADROS }, (_, k) => pose(k / CUADROS))
const apretado = (f) => ((m) => ({ c: m.c, radio: m.radio * 0.9 }))(marco(f))
const personaje = (archivo) => PERSONAJES.find((p) => p.archivo === archivo)

// Cuadros apilados: la clase `f` muestra uno a la vez; sin movimiento, el primero.
const apilar = (svgs) =>
  svgs.map((svg, k) => svg.replace('<svg style="display: block"', `<svg class="f${k ? '' : ' quieto'}" style="position: absolute; left: 0; top: 0; animation-delay: -${((((svgs.length - k) % svgs.length) * PASO) / svgs.length).toFixed(3)}s"`)).join('')

const sprite = (figuras, toma, tam) => {
  const encuadre = apretado(figuras[0])
  const svgs = figuras.map((f) => pixel3d(f, toma, N, tam, encuadre))
  return `<div style="position: relative; width: ${N * tam}px; height: ${N * tam}px">${svgs.length > 1 ? apilar(svgs) : svgs[0].replace('<svg style="display: block"', '<svg style="display: block; position: absolute; left: 0; top: 0"')}</div>`
}

const lamina = (archivo, titulo, { ancho, alto, bloques }, centro, fondo = '', estilos = '') =>
  writeFileSync(
    `${RAIZ}/project/${archivo}.dc.html`,
    `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${titulo}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400&display=swap">
<style>
body{margin:0}
.f{opacity:0;animation:cuadro ${PASO}s step-end infinite}
@keyframes cuadro{0%{opacity:1}${(100 / CUADROS).toFixed(3)}%{opacity:0}100%{opacity:0}}
.llena{width:100%;animation:carga 4s steps(${bloques}, end) infinite}
@keyframes carga{0%{width:0}100%{width:100%}}
${estilos}
@media (prefers-reduced-motion: reduce){.f,.cruza{animation:none}.quieto{opacity:1}.llena{animation:none;width:${Math.floor(bloques / 2) * 20}px}}
</style>
</helmet>
<div style="position: relative; overflow: hidden; width: ${ancho}px; height: ${alto}px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 32px; background: #5c94fc; color: #0a1a2a">
${fondo}
${centro}
<div style="position: relative; display: flex; flex-direction: column; align-items: center; gap: 12px">
<div role="progressbar" aria-label="Cargando la escena" style="box-sizing: content-box; width: ${bloques * 20}px; height: 16px; padding: 4px 0 4px 4px; border: 4px solid #0a1a2a">
<div class="llena" style="height: 16px; background: repeating-linear-gradient(90deg, #0a1a2a 0 16px, transparent 16px 20px)"></div>
</div>
<span style="${mono}">Cargando</span>
</div>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${ancho},"height":${alto}}}'>
class Component extends DCLogic {
renderVals() {
return {};
}
}
</script>
</body>
</html>
`,
  )

// Uno solo, de tres cuartos, en el centro.
const SOLOS = [
  ['E1-carga', 'duck-one camina', fases(personaje('duck-one').andando)],
  ['Carga-duke', 'Duke camina', fases(personaje('duke').andando)],
  ['Carga-moby-duck', 'Moby camina', fases(personaje('moby-duck').andando)],
  // Duky no hace nada: un solo cuadro.
  ['Carga-duky', 'Duky, quieto', [dukyFigura({})]],
  ['Carga-almirante', 'El almirante camina', fases((u) => ALMIRANTE.andando(u * 2))],
]

for (const [archivo, titulo, figuras] of SOLOS)
  for (const [pantalla, medidas] of Object.entries(PANTALLAS)) lamina(`${archivo}-${pantalla}`, `Cargando: ${titulo}`, medidas, sprite(figuras, TRES_CUARTOS, medidas.tam))

// Los marineros cruzan la pantalla en pánico, cada uno a su altura, su ritmo
// y su perspectiva: de perfil, de tres cuartos o en contrapicado, hacia la
// derecha o hacia la izquierda. Encima, la barra.
const CORREDORES = [
  { oficio: OFICIOS.amarillo, toma: { giro: 90, altura: 0 }, alto: 0.12, s: 5.2, demora: 0, derecha: true },
  { oficio: OFICIOS.rojo, toma: { giro: -40, altura: 8 }, alto: 0.3, s: 4.4, demora: 1.6, derecha: false },
  { oficio: OFICIOS.verde, toma: { giro: 40, altura: 8 }, alto: 0.6, s: 3.8, demora: 0.8, derecha: true },
  { oficio: OFICIOS.morado, toma: { giro: -90, altura: 0 }, alto: 0.76, s: 4.8, demora: 2.4, derecha: false },
  { oficio: OFICIOS.amarillo, toma: { giro: -30, altura: -28 }, alto: 0.44, s: 6, demora: 3.2, derecha: false },
]

for (const [pantalla, medidas] of Object.entries(PANTALLAS)) {
  const tam = Math.round(medidas.tam / 2)
  const lado = N * tam
  const estilos = [
    `.cruza{position: absolute; left: 0; animation: var(--cruce) linear infinite}`,
    `@keyframes derecha{from{transform: translateX(${-lado}px)}to{transform: translateX(${medidas.ancho}px)}}`,
    `@keyframes izquierda{from{transform: translateX(${medidas.ancho}px)}to{transform: translateX(${-lado}px)}}`,
  ].join('\n')
  const fondo = CORREDORES.map(
    ({ oficio, toma, alto, s, demora, derecha }) =>
      `<div class="cruza" style="top: ${Math.round(alto * medidas.alto - lado / 2)}px; --cruce: ${derecha ? 'derecha' : 'izquierda'} ${s}s; animation-delay: -${demora}s" aria-hidden="true">${sprite(fases((u) => corre(oficio, u)), toma, tam)}</div>`,
  ).join('\n')
  lamina(`Carga-marineros-${pantalla}`, 'Cargando: los marineros corren', medidas, '', fondo, estilos)
}
