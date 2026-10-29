// Escena 9, «Retirada»: las tomas de la cubierta en una lámina animada del
// lienzo de Design, como las de la escena 3 (escena3/laminas.mjs), con el
// Hornet de duke plegando las alas detrás de él, y en otra las de la radio,
// desde el control de vuelo.
//
//   node scripts/operacion-venganza/escena9/laminas.mjs <carpeta>
//
// Escribe <carpeta>/project/E9-tomas-cubierta.dc.html y E9-tomas-radio.dc.html.

import { pixel3d } from '../pilotos/tres.mjs'
import { celdaDeToma, fila, pagina } from '../pilotos/tablero.mjs'
import { TOMAS_3D } from './tomas.mjs'
import { cielo } from '../escena1/lugares.mjs'
import { TOMAS } from '../../../src/lib/escena9.js'
import { mkdirSync, writeFileSync } from 'node:fs'

const RAIZ = process.argv[2]

// Doce cuadros por toma, de 96 px y la franja del medio en 4:3, como en el juego.
const CUADROS = 12
const DURACION = 3.6
const N = 96
const ALTO = (N * 3) / 4
const TAM = 4
const ANIMACIONES = `.t12{animation:cuadro12 ${DURACION}s step-end infinite}
@keyframes cuadro12{0%{opacity:1}8.333%{opacity:0}100%{opacity:0}}`

const cuadro = (figura, [ojo, mira, campo]) =>
  pixel3d(figura, { ojo, mira, campo, cielo }, N, TAM, { c: [0, 0, 0], radio: 1 }).replace(`height="${N * TAM}" viewBox="0 0 ${N} ${N}"`, `height="${ALTO * TAM}" viewBox="0 ${(N - ALTO) / 2} ${N} ${ALTO}"`)

const NOMBRES = { regresen: 'regresen', presupuesto: 'el presupuesto', regresan: 'regresan', aterrizan: 'aterrizan', saltito: 'el saltito', fuselaje: 'el fuselaje', abolladura: 'la abolladura', torre: 'a la torre' }
const dialogo = ({ lineas }) => lineas.map(({ quien, texto }) => (quien ? `${quien}: ${texto}` : `<i>${texto}</i>`)).join('<br>')

const celda = (id) => {
  const numero = TOMAS.findIndex((t) => t.id === id)
  const toma = TOMAS[numero]
  const { escena, camara } = TOMAS_3D[id]
  const svgs = Array.from({ length: CUADROS }, (_, k) => cuadro(escena(k / CUADROS), camara(k / CUADROS)))
  return celdaDeToma(`${numero + 1} · ${NOMBRES[id]}`, svgs, 't12', DURACION, toma.unaVez ? CUADROS - 1 : CUADROS / 2, [N * TAM, ALTO * TAM], dialogo(toma))
}

mkdirSync(`${RAIZ}/project`, { recursive: true })
writeFileSync(
  `${RAIZ}/project/E9-tomas-cubierta.dc.html`,
  pagina({
    titulo: 'Escena 9 · en la cubierta',
    papel: 'Escena 9 · tomas 9 a 14',
    nombre: 'En la cubierta',
    bajada: 'Del regreso a la torre, con el Hornet de duke',
    detalle: 'Los dos bajan hacia la popa; duke aterriza primero y moby detrás. Duke sale de un saltito, visto de frente y desde abajo, y mientras baja, detrás de él su Hornet pliega las alas como en la vida real: las puntas suben hasta pasar un poco la vertical, y así queda el caza en la cubierta. Se mira en la toma de aire de babor, blanca y brillante como un espejo, mientras moby le abolla la góndola a su A-10, y los dos caminan hacia la torre.',
    animaciones: ANIMACIONES,
    filas: [fila('El aterrizaje', ['regresan', 'aterrizan', 'saltito'].map(celda), 3), fila('En la cubierta', ['fuselaje', 'abolladura', 'torre'].map(celda), 3)],
    alto: 1180,
  }),
)
writeFileSync(
  `${RAIZ}/project/E9-tomas-radio.dc.html`,
  pagina({
    titulo: 'Escena 9 · la radio',
    papel: 'Escena 9 · tomas 2 y 4',
    nombre: 'El control de vuelo',
    bajada: 'El oficial de inteligencia llama de vuelta al Patoon-4',
    detalle: 'En lo alto de la isla, con ventanales a babor, a proa y a popa sobre la cubierta y pantallas colgadas del techo. El oficial habla por radio sentado a la consola, con la mano en el audífono, entre el radar de aproximación y el combustible de los dos cazas, que parpadea en rojo. Detrás de él, de pie y con las manos atrás, el almirante mira las pantallas con el ceño fruncido.',
    animaciones: ANIMACIONES,
    filas: [fila('En el control de vuelo', ['regresen', 'presupuesto'].map(celda), 3)],
    alto: 640,
  }),
)
