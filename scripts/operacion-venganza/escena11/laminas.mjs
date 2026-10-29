// Escena 11, «Preparativos»: las tomas de la radio en una lámina animada del
// lienzo de Design, como las de la escena 9 (escena9/laminas.mjs), desde la
// sala azul.
//
//   node scripts/operacion-venganza/escena11/laminas.mjs <carpeta>
//
// Escribe <carpeta>/project/E11-tomas-radio.dc.html.

import { pixel3d } from '../pilotos/tres.mjs'
import { celdaDeToma, fila, pagina } from '../pilotos/tablero.mjs'
import { TOMAS_3D } from './tomas.mjs'
import { cielo } from '../escena1/lugares.mjs'
import { TOMAS } from '../../../src/lib/escena11.js'
import { mkdirSync, writeFileSync } from 'node:fs'

const RAIZ = process.argv[2]

// Doce cuadros por toma, de 96 px y la franja del medio en 4:3, como en el juego.
const CUADROS = 12
const DURACION = 1.8
const N = 96
const ALTO = (N * 3) / 4
const TAM = 4
const ANIMACIONES = `.t12{animation:cuadro12 ${DURACION}s step-end infinite}
@keyframes cuadro12{0%{opacity:1}8.333%{opacity:0}100%{opacity:0}}`

const cuadro = (figura, [ojo, mira, campo]) =>
  pixel3d(figura, { ojo, mira, campo, cielo }, N, TAM, { c: [0, 0, 0], radio: 1 }).replace(`height="${N * TAM}" viewBox="0 0 ${N} ${N}"`, `height="${ALTO * TAM}" viewBox="0 ${(N - ALTO) / 2} ${N} ${ALTO}"`)

const NOMBRES = { radio: 'la radio', pitido: 'el pitido', termina: 'termina', otroPitido: 'otro pitido' }
const dialogo = ({ lineas }) => lineas.map(({ quien, texto }) => (quien ? `${quien}: ${texto}` : `<i>${texto}</i>`)).join('<br>')

const celda = (id) => {
  const numero = TOMAS.findIndex((t) => t.id === id)
  const { escena, camara } = TOMAS_3D[id]
  const svgs = Array.from({ length: CUADROS }, (_, k) => cuadro(escena(k / CUADROS), camara(k / CUADROS)))
  return celdaDeToma(`${numero + 1} · ${NOMBRES[id]}`, svgs, 't12', DURACION, CUADROS / 2, [N * TAM, ALTO * TAM], dialogo(TOMAS[numero]))
}

mkdirSync(`${RAIZ}/project`, { recursive: true })
writeFileSync(
  `${RAIZ}/project/E11-tomas-radio.dc.html`,
  pagina({
    titulo: 'Escena 11 · la radio',
    papel: 'Escena 11 · tomas 10, 12, 13 y 15',
    nombre: 'La sala azul',
    bajada: 'El oficial de inteligencia llama al Fantasma Amarillo',
    detalle: 'El caza de duky es un prototipo: se sigue desde el centro de información de combate, en la oscuridad del casco. Pantallas grandes al frente con el radar, relojes rojos, consolas de teclas naranjas y luces azules en el techo; todo lo que no da luz se tiñe de azul. El oficial llama por radio desde la consola del medio, y el almirante, de pie detrás, mira las pantallas. Nadie contesta; el radar emite un pitido.',
    animaciones: ANIMACIONES,
    filas: [fila('En la sala azul', ['radio', 'pitido', 'termina', 'otroPitido'].map(celda), 2)],
    alto: 1180,
  }),
)
