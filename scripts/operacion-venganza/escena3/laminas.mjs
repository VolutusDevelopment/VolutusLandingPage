// Escena 3, «Despegue»: las tomas en láminas animadas del lienzo de Design,
// con el motor de las cabinas, para revisarlas antes de pasarlas al juego.
//
//   node scripts/operacion-venganza/escena3/laminas.mjs <carpeta> <hoja.html>
//
// Escribe <carpeta>/project/E3-*.dc.html y, en la hoja, el cuadro quieto de
// cada toma para revisarlas de una vez. Con PRUEBA=1 solo arma la hoja.

import { pixel3d } from '../pilotos/tres.mjs'
import { celdaDeToma, fila, pagina } from '../pilotos/tablero.mjs'
import { TOMAS_3D } from './tomas.mjs'
import { cielo } from '../escena1/lugares.mjs'
import { TOMAS } from '../../../src/lib/escena3.js'
import { mkdirSync, writeFileSync } from 'node:fs'

const [RAIZ, HOJA] = process.argv.slice(2)
const PRUEBA = Boolean(process.env.PRUEBA)

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

// Cada celda dice su toma y sus líneas, del guion del juego (src/lib/escena3.js).
const NOMBRES = {
  cubierta: 'a su caza',
  cabina: 'entra en la cabina',
  gafas: 'las gafas',
  medallas: 'las medallas',
  presentacion: 'se presenta',
  advertencia: 'la advertencia',
  instrumentos: 'los instrumentos',
  boton: 'el botón',
  limpiaparabrisas: 'el limpiaparabrisas',
  excelente: 'prueba completada',
  despegue: 'despega',
}
const dialogo = ({ lineas }) => lineas.map(({ quien, texto }) => (quien ? `${quien.toUpperCase()}: ${texto}` : `<i>${texto}</i>`)).join('<br>')

const hoja = []
const celda = (id, modo = 'cursor', aparte = '') => {
  const numero = TOMAS.findIndex((t) => t.id === id)
  const toma = TOMAS[numero]
  const { escena, camara } = TOMAS_3D[id]
  const svgs = Array.from({ length: PRUEBA ? 1 : CUADROS }, (_, k) => {
    const u = k / CUADROS
    return cuadro(escena(u, modo), camara(u))
  })
  const quieto = PRUEBA ? 0 : toma.unaVez ? CUADROS - 1 : CUADROS / 2
  hoja.push(`<div style="background:#5c94fc">${svgs[quieto]}</div>`)
  return celdaDeToma(`${numero + 1} · ${NOMBRES[id]}${aparte}`, svgs, 't12', DURACION, quieto, [N * TAM, ALTO * TAM], dialogo(toma))
}

const lamina = (archivo, datos) => {
  const html = pagina({ ...datos, animaciones: ANIMACIONES, alto: 1180 })
  if (!PRUEBA) writeFileSync(`${RAIZ}/project/${archivo}.dc.html`, html)
}

if (!PRUEBA) mkdirSync(`${RAIZ}/project`, { recursive: true })

lamina('E3-tomas-cabina', {
  titulo: 'Escena 3 · a la cabina',
  papel: 'Escena 3 · tomas 1 a 6',
  nombre: 'A la cabina',
  bajada: 'De la cubierta del Sitting Ducks a la cabina de su F-14 Tomcat',
  detalle: 'Al atardecer, como en Nosotros y la escena 1. La cámara acompaña a duck-one por la cubierta hasta su caza, que espera en la catapulta de babor, y se mete en la cabina por el costado de la cúpula. Ahí se sube las gafas con el índice, baja la cabeza para revisar sus medallas y le habla al atacante, que es quien juega: primero a la cámara del tablero, después señalándolo.',
  filas: [fila('Hasta la cabina', ['cubierta', 'cabina', 'gafas'].map((id) => celda(id)), 3), fila('Al atacante', ['medallas', 'presentacion', 'advertencia'].map((id) => celda(id)), 3)],
})

lamina('E3-tomas-despegue', {
  titulo: 'Escena 3 · el despegue',
  papel: 'Escena 3 · tomas 7 a 11',
  nombre: 'El despegue',
  bajada: 'Prueba de sistemas y lanzamiento desde la catapulta',
  detalle: 'Busca el botón de las armas mirando a un lado y otro del tablero, duda y pulsa el rojo: se enciende el limpiaparabrisas que ningún F-14 tiene, y duck-one lo sigue con la cabeza. Lo da por bueno con el pulgar arriba. Enciende la postcombustión contra el deflector, la catapulta lo lanza hasta la proa entre el vapor y un helicóptero lo sigue por detrás, por babor, y lo deja irse hacia el sol, que se pone, con el morro arriba, el tren recogido y las alas barriéndose hacia atrás. Ya en el aire, la cámara encuentra al atacante, quieto en el cielo a lo lejos, sobre el sol: un cursor en escritorio, una huella en teléfono.',
  filas: [fila('El botón de las armas', ['instrumentos', 'boton', 'limpiaparabrisas'].map((id) => celda(id)), 3), fila('Despegue', [celda('excelente'), celda('despegue', 'cursor', ', en escritorio'), celda('despegue', 'huella', ', en teléfono')], 3)],
})

writeFileSync(HOJA, `<html><body style="margin:0;background:#fff;display:flex;flex-wrap:wrap;gap:4px">${hoja.join('')}</body></html>`)
