// Láminas v12 (v13 la de moby-duck): el busto de cada piloto y su caza, desde seis tomas fijas.
//
//   node scripts/operacion-venganza/pilotos/tomas.mjs <carpeta>
//
// Escribe <carpeta>/project/V12-<piloto>.dc.html (o la `lamina` del piloto), un tablero del lienzo de Design.

import * as M from './modelos.mjs'
import { pixel3d, marco } from './tres.mjs'
import { writeFileSync } from 'node:fs'

const RAIZ = process.argv[2]

const TOMAS_PILOTO = [
  ['tres cuartos', { giro: -40, altura: 8 }],
  ['de frente', { giro: 0, altura: 5 }],
  ['de perfil', { giro: -90, altura: 0 }],
  ['contrapicado', { giro: -30, altura: -28 }],
  ['picado', { giro: 35, altura: 35 }],
  ['de espaldas', { giro: -145, altura: 12 }],
]

const TOMAS_CAZA = [
  ['tres cuartos', { giro: -35, altura: 22 }],
  ['de perfil', { giro: -90, altura: 0 }],
  ['desde abajo', { giro: -25, altura: -55 }],
  ['de frente', { giro: -8, altura: 6 }],
  ['planta', { giro: 0, altura: 89.9 }],
  ['en viraje', { giro: -50, altura: 15, alabeo: -55 }],
]

const PERSONAJES = [
  {
    archivo: 'duck-one',
    nombre: 'duck-one',
    papel: 'El líder del escuadrón · nivel 1',
    piloto: M.DUCK_ONE,
    encuadre: { c: [0.2, 0.35, 0], radio: 1.4 },
    caza: M.CAZA_DUCK_ONE,
    modelo: 'Boeing F-15EX Eagle II, gris tradicional',
    detalle: 'Gorro cuartelero ladeado y gafas de aviador clásicas. El mentón arriba y una ceja alzada por sobre el marco. Medallas chuecas pegadas como stickers en el uniforme.',
  },
  {
    archivo: 'moby-duck',
    lamina: 'V13-moby-a',
    nombre: 'moby-duck',
    papel: 'La fuerza bruta · nivel 2',
    piloto: M.MOBY,
    caza: M.CAZA_MOBY,
    modelo: 'Fairchild Republic A-10 Thunderbolt II, negro',
    detalle: 'El comando: espalda en V, trapecios que le tragan el cuello y la cabeza chica hundida entre los hombros, de brazos cruzados. Musculosa oliva, placas al cuello, pretina a rayas y pañuelo rojo con las colas al viento. Ceño de matón, el puro echando humo y el llanto que no para.',
  },
  {
    archivo: 'duke',
    nombre: 'duke skyducker',
    papel: 'El rostro del escuadrón · nivel 2',
    piloto: M.DUKE_B,
    encuadre: { c: [0.2, 0.5, 0], radio: 1.45 },
    caza: M.CAZA_DUKE,
    modelo: 'Boeing F-15EX Eagle II, perla, oro y rosa',
    detalle: 'Plumaje marfil impecable y copete rubio. Uniforme blanco de gala cruzado, con botones dorados, cordón dorado al pecho y hombreras doradas con flecos. Con el mentón arriba y los ojos cerrados de gusto, se pasa un peine por el copete entre destellos. Sin casco.',
  },
  {
    archivo: 'duky',
    nombre: 'duky',
    papel: 'El fantasma amarillo · nivel 3',
    piloto: M.DUKY,
    caza: M.CAZA_DUKY,
    modelo: 'Lockheed Martin F-35A Lightning II, negro',
    detalle: 'El pato de hule gigante, de cuerpo ancho, cola alzada y pico rojo; ninguna toma le cambia la expresión. Su F-35 es negro furtivo, con la cabina dorada del real y las marcas de victorias en amarillo, lo único amarillo que le queda. Deja la estela de un motor F135 real: azul violeta con diamantes de choque.',
  },
]

const mono = "font-family: 'Geist Mono', monospace; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase"

const fila = (titulo, figura, tomas, encuadre) => `<div style="display: flex; flex-direction: column; gap: 12px">
<h2 style="margin: 0; font-size: 18px; font-weight: 800">${titulo}</h2>
<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px">
${tomas
  .map(
    ([nombre, toma]) => `<div style="display: flex; flex-direction: column; gap: 8px"><div style="height: 208px; display: flex; align-items: center; justify-content: center; background: #5c94fc; border-radius: 12px">${pixel3d(figura, toma, 64, 3, encuadre)}</div><span style="${mono}; color: #47607a">${nombre}</span></div>`,
  )
  .join('\n')}
</div>
</div>`

const ficha = (p) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${p.nombre}, tomas</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@1,800&family=Geist:wght@400;800&family=Geist+Mono:wght@400&display=swap">
<style>
body{margin:0}
</style>
</helmet>
<div style="width: 1440px; height: 840px; box-sizing: border-box; padding: 40px 56px; display: flex; flex-direction: column; gap: 32px; background: #f6f9fc; font-family: Geist, system-ui, sans-serif; color: #0a1a2a">
<div style="display: flex; gap: 48px; align-items: flex-end">
<div style="display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; width: 420px">
<span style="${mono}; color: #47607a">${p.papel}</span>
<h1 style="margin: 0; font-family: Archivo, sans-serif; font-style: italic; font-weight: 800; font-size: 34px; line-height: 1.05">${p.nombre}</h1>
<span style="font-size: 15px; line-height: 1.4">${p.modelo}</span>
</div>
<p style="margin: 0; font-size: 15px; line-height: 1.6; max-width: 760px">${p.detalle}</p>
</div>
${fila('El piloto', p.piloto, TOMAS_PILOTO, p.encuadre ?? marco(p.piloto))}
${fila('El caza', p.caza, TOMAS_CAZA, ((m) => ({ c: m.c, radio: m.radio * 0.85 }))(marco(p.caza, true)))}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1440,"height":840}}'>
class Component extends DCLogic {
renderVals() {
return {};
}
}
</script>
</body>
</html>
`

for (const p of PERSONAJES) writeFileSync(`${RAIZ}/project/${p.lamina ?? `V12-${p.archivo}`}.dc.html`, ficha(p))
