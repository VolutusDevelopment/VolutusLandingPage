// Escena 1, «El portaaviones»: los personajes, la sala de mando y las tomas,
// en láminas animadas del lienzo de Design, con el motor de las cabinas.
//
//   node scripts/operacion-venganza/escena1/laminas.mjs <carpeta> <hoja.html>
//
// Escribe <carpeta>/project/E1-*.dc.html y, en la hoja, un cuadro de cada
// celda para revisarlas de una vez. Con PRUEBA=1 solo arma la hoja.

import { pixel3d, marco } from '../pilotos/tres.mjs'
import { pagina, mono } from '../pilotos/tablero.mjs'
import { ALMIRANTE, OFICIAL, MARINEROS, OFICIOS, SILLON } from './personajes.mjs'
import { salaCon, TOMAS_3D } from './tomas.mjs'
import { cielo } from './lugares.mjs'
import { TOMAS as GUION, textoDe } from '../../../src/lib/escena1.js'
import { writeFileSync } from 'node:fs'

const [RAIZ, HOJA] = process.argv.slice(2)
const PRUEBA = Boolean(process.env.PRUEBA)

// ── Cuadros y celdas ─────────────────────────────────────────────────────

const RITMOS = {
  p8: [8, 0.8],
  g12: [12, 1.8],
  t12: [12, 3.6],
  a4: [4, 1.2],
}
const ANIMACIONES = Object.entries(RITMOS)
  .map(([clase, [n, s]]) => `.${clase}{animation:cuadro${n} ${s}s step-end infinite}`)
  .concat([...new Set(Object.values(RITMOS).map(([n]) => n))].map((n) => `@keyframes cuadro${n}{0%{opacity:1}${(100 / n).toFixed(3)}%{opacity:0}100%{opacity:0}}`))
  .join('\n')

// Cuadros de una toma: `escena(u)` arma la figura del instante u ∈ [0, 1).
const cuadros = (clase, escena) => Array.from({ length: PRUEBA ? 1 : RITMOS[clase][0] }, (_, k) => escena(k / RITMOS[clase][0]))

// Cuadrado, con cámara ortográfica alrededor del personaje.
const N = 72
const TAM = 4
const apretado = (f) => ((m) => ({ c: m.c, radio: m.radio * 0.9 }))(marco(f))
const retrato = (figuras, toma) => {
  const encuadre = apretado(figuras[0])
  return figuras.map((f) => pixel3d(f, toma, N, TAM, encuadre))
}

// Panorámico 16:9 en perspectiva: se pinta el cuadrado y se recorta al medio.
const NP = 96
const ALTO_P = 54
const panoramica = (figuras, [ojo, mira, campo]) =>
  figuras.map((f) => pixel3d(f, { ojo, mira, campo, cielo }, NP, TAM, { c: [0, 0, 0], radio: 1 }).replace(`height="${NP * TAM}" viewBox="0 0 ${NP} ${NP}"`, `height="${ALTO_P * TAM}" viewBox="0 ${(NP - ALTO_P) / 2} ${NP} ${ALTO_P}"`))

// Tomas que mueven la cámara: una por cuadro.
const panoramicaMovil = (figuras, camara) => figuras.map((f, k) => panoramica([f], camara(k / figuras.length))[0])

const apilar = (svgs, clase, quieto) =>
  svgs.map((svg, k) => svg.replace('<svg style="display: block"', `<svg class="f ${clase}${k === quieto ? ' quieto' : ''}" style="position: absolute; left: 0; top: 0; animation-delay: -${((((svgs.length - k) % svgs.length) * RITMOS[clase][1]) / svgs.length).toFixed(3)}s"`)).join('')

const celda = ({ titulo, svgs, clase, quieto = 0, ancho, alto, fondo = '#5c94fc', dialogo = '' }) =>
  `<div style="display: flex; flex-direction: column; gap: 10px"><div style="position: relative; width: ${ancho}px; height: ${alto}px; background: ${fondo}; border-radius: 12px; overflow: hidden">${apilar(svgs, clase, quieto)}</div><span style="${mono}; color: #47607a">${titulo}</span>${dialogo ? `<span style="font-size: 15px; line-height: 1.45; max-width: ${ancho}px">${dialogo}</span>` : ''}</div>`

const fila = (titulo, celdas, columnas) => `<div style="display: flex; flex-direction: column; gap: 14px">
<h2 style="margin: 0; font-size: 18px; font-weight: 800">${titulo}</h2>
<div style="display: grid; grid-template-columns: repeat(${columnas}, max-content); gap: 40px; justify-content: start">
${celdas.join('\n')}
</div>
</div>`

const cuadrada = (titulo, svgs, clase, quieto) => celda({ titulo, svgs, clase, quieto, ancho: N * TAM, alto: N * TAM })
const ancha = (titulo, svgs, clase, quieto, dialogo) => celda({ titulo, svgs, clase, quieto, ancho: NP * TAM, alto: ALTO_P * TAM, dialogo })

const hoja = []
const lamina = (archivo, datos) => {
  hoja.push(`<h3 style="font:14px sans-serif;margin:6px">${archivo}</h3><div style="display:flex;flex-wrap:wrap;gap:4px;margin:4px">${datos.vistas.map((s) => `<div style="background:#5c94fc">${s}</div>`).join('')}</div>`)
  if (!PRUEBA) writeFileSync(`${RAIZ}/project/${archivo}.dc.html`, pagina({ ...datos, animaciones: ANIMACIONES }))
}
// Para la hoja: el cuadro quieto de cada celda.
const vistas = []
const anota = (svgs, quieto = 0) => (vistas.push(svgs[Math.min(quieto, svgs.length - 1)]), svgs)
const tomarVistas = () => vistas.splice(0)

// ── Personajes ───────────────────────────────────────────────────────────

const PERSPECTIVAS = [
  ['tres cuartos', { giro: -40, altura: 8 }],
  ['de frente', { giro: 0, altura: 5 }],
  ['de perfil', { giro: -90, altura: 0 }],
  ['contrapicado', { giro: -30, altura: -28 }],
]
const TRES_CUARTOS = PERSPECTIVAS[0][1]

const laminaPersonaje = (archivo, p, filas, alto = 960) =>
  lamina(archivo, {
    titulo: p.nombre,
    papel: p.papel,
    nombre: p.nombre,
    bajada: p.bajada,
    detalle: p.detalle,
    filas,
    alto,
    vistas: tomarVistas(),
  })

const quietoDe = (p) => cuadros('p8', p.quieto)
const filaPerspectivas = (titulo, figs, clase = 'p8', quieto = 0) => fila(titulo, PERSPECTIVAS.map(([nombre, t]) => cuadrada(nombre, anota(retrato(figs, t), quieto), clase, quieto)), 4)

{
  const quieto = quietoDe(ALMIRANTE)
  laminaPersonaje('E1-almirante', ALMIRANTE, [
    filaPerspectivas('De pie, con las manos atrás', quieto),
    // Se levanta de su sillón, que en la escena pone la sala.
    fila('En la escena', [...ALMIRANTE.gestos, { nombre: 'camina', pose: (u) => ALMIRANTE.andando(u * 2) }].map((g) => cuadrada(g.nombre, anota(retrato(cuadros('g12', g.nombre === 'se levanta' ? (u) => [...g.pose(u), ...SILLON] : g.pose), TRES_CUARTOS), 6), 'g12', 6)), 4),
  ], 1340)
}
{
  const quieto = quietoDe(OFICIAL)
  laminaPersonaje('E1-oficial', OFICIAL, [
    filaPerspectivas('Firme, con su tableta', quieto),
    fila('En la escena', [['contesta', OFICIAL.hablando], ...OFICIAL.gestos.map((g) => [g.nombre, g.pose])].map(([nombre, pose], i) => cuadrada(nombre, anota(retrato(cuadros('g12', pose), i ? TRES_CUARTOS : PERSPECTIVAS[1][1]), 6), 'g12', 6)), 4),
  ])
}
{
  const corre = Object.values(OFICIOS).map((o) => [`${o.nombre} · ${o.oficio}`, cuadros('p8', (u) => MARINEROS.corre(o, u))])
  laminaPersonaje('E1-marineros', MARINEROS, [
    fila('Corren por la cubierta', corre.map(([nombre, figs]) => cuadrada(nombre, anota(retrato(figs, TRES_CUARTOS)), 'p8', 0)), 4),
    fila(
      'Cuando suena la alarma',
      MARINEROS.gestos.map((g, i) => cuadrada(g.nombre + (i === 2 ? ', de frente' : i === 3 ? ', de perfil' : ''), anota(retrato(cuadros('p8', g.pose), [TRES_CUARTOS, TRES_CUARTOS, PERSPECTIVAS[1][1], PERSPECTIVAS[2][1]][i]), 2), 'p8', 2)),
      4,
    ),
  ])
}

// ── La sala de mando ─────────────────────────────────────────────────────

const PANTALLA_DE_FRENTE = [[0.9, 1.875, 0], [4, 1.875, 0], 84]
{
  const vacia = (pantalla) => cuadros('a4', (u) => salaCon(u, { pantalla, almirante: ALMIRANTE.sentado(0) }))
  const sinNadie = vacia('bajas')
  lamina('E1-sala', {
    titulo: 'La sala de mando',
    papel: 'Escena 1 · el interior',
    nombre: 'La sala de mando',
    bajada: 'Bajo el puente del Sitting Ducks, a estribor de la isla',
    detalle: 'Una sala de acero gris claro: al frente la pantalla de las bajas, a estribor los ventanales con el atardecer y la escolta en el horizonte, a babor las consolas de radar y al fondo la puerta y la carta náutica. Al medio, la mesa de reuniones con seis sillones de cuero: el del almirante, en la cabecera, mira a la pantalla. La baliza roja del techo gira mientras dura la alarma.',
    filas: [
      fila(
        'Tres miradas a la sala',
        [
          ['desde la puerta', [[-3.6, 2.3, 2.8], [3, 1.1, -1.2], 82]],
          ['hacia la pantalla', [[-3.7, 1.7, 0.4], [4, 1.6, 0], 74]],
          ['hacia los ventanales', [[0.6, 1.6, -4.5], [0, 1.4, 5], 84]],
        ].map(([nombre, cam]) => ancha(nombre, anota(panoramica(sinNadie, cam)), 'a4', 0)),
        3,
      ),
      fila(
        'La pantalla',
        [
          ['las quince bajas', 'bajas'],
          ['el atacante, en escritorio', 'cursor'],
          ['el atacante, en teléfono', 'huella'],
        ].map(([nombre, estado]) => ancha(nombre, anota(panoramica(vacia(estado), PANTALLA_DE_FRENTE)), 'a4', 0)),
        3,
      ),
    ],
    alto: 900,
    vistas: tomarVistas(),
  })
}

// ── Las tomas ────────────────────────────────────────────────────────────

// Cada celda dice su toma y sus líneas, del guion del juego (src/lib/escena1.js).
const NOMBRES = {
  llegada: 'llegan los barcos',
  orbita: 'el Sitting Ducks',
  cubierta: 'la cubierta',
  subida: 'sube a la sala de mando',
  sala: 'la sala de mando',
  pantalla: 'la pantalla',
  oficial: 'el oficial',
  gafas: 'las gafas',
  caidos: 'los quince caídos',
  atacante: 'el atacante',
  levanta: 'se levanta',
  ventana: 'a la ventana',
  atardecer: 'el atardecer',
  cuatro: 'los cuatro disponibles',
  silencio: '…',
}
const NUMERO = Object.fromEntries(GUION.map(({ id }, i) => [id, i + 1]))
const dialogo = (toma, modo) => toma.lineas.map((l) => (l.quien ? `${l.quien.toUpperCase()}: ${textoDe(l, modo)}` : `<i>${textoDe(l, modo)}</i>`)).join('<br>')

const celdaDeToma = (id, modo = 'cursor', aparte = '') => {
  const toma = GUION.find((t) => t.id === id)
  const { escena, camara } = TOMAS_3D[id]
  const figs = cuadros('t12', (u) => escena(u, modo))
  const quieto = toma.unaVez ? figs.length - 1 : Math.floor(figs.length / 2)
  return ancha(`${NUMERO[id]} · ${NOMBRES[id]}${aparte}`, anota(panoramicaMovil(figs, camara), quieto), 't12', quieto, dialogo(toma, modo))
}

lamina('E1-tomas-llegada', {
  titulo: 'Escena 1 · la llegada',
  papel: 'Escena 1 · tomas 1 a 4',
  nombre: 'La llegada',
  bajada: 'Del mar vacío al puente del Sitting Ducks',
  detalle: 'Después de la última bala en Nosotros el escenario queda vacío y aparece el mar, al atardecer: el sol a medio ponerse, como lo deja Nosotros. Cuatro tomas exteriores, de lejos a cerca: la flota que llega desde todas las direcciones, la vuelta al Sitting Ducks, la cubierta en alarma y la subida por la isla hasta la sala de mando.',
  filas: [fila('Fuera', ['llegada', 'orbita', 'cubierta', 'subida'].map((id) => celdaDeToma(id)), 3)],
  alto: 1100,
  vistas: tomarVistas(),
})

lamina('E1-tomas-sala', {
  titulo: 'Escena 1 · la sala de mando',
  papel: 'Escena 1 · tomas 5 a 15',
  nombre: 'En la sala de mando',
  bajada: 'El almirante, el oficial y la fotografía del atacante',
  detalle: 'Once tomas dentro, siempre en la misma sala: el plano general, la pantalla por sobre el hombro del almirante, el oficial que lee sin expresión, las gafas, el recorrido por los quince caídos hasta el oficial que señala, el atacante (cursor en escritorio, huella en teléfono: el navegador elige), el almirante que camina a la ventana y mira el atardecer antes de dar la orden, y el oficial que se queda sin palabras. Desde el atacante, la pantalla muestra lo que use quien juega.',
  filas: [
    fila('Las bajas', ['sala', 'pantalla', 'oficial'].map((id) => celdaDeToma(id)), 3),
    fila('Por diversión', ['gafas', 'caidos'].map((id) => celdaDeToma(id)), 3),
    fila('El atacante', [celdaDeToma('atacante', 'cursor', ', en escritorio'), celdaDeToma('atacante', 'huella', ', en teléfono')], 3),
    fila('El atardecer', ['levanta', 'ventana', 'atardecer'].map((id) => celdaDeToma(id)), 3),
    fila('Patoon-4', ['cuatro', 'silencio'].map((id) => celdaDeToma(id)), 3),
  ],
  alto: 2280,
  vistas: tomarVistas(),
})

writeFileSync(HOJA, `<html><body style="margin:0;background:#fff">${hoja.join('')}</body></html>`)
