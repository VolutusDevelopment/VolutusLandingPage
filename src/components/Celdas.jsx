import { COLORES } from '../lib/pato.js'

/**
 * Un cuadro del pato (lib/pato.js) en SVG, celda por celda y con sus colores:
 * una forma por color, el píxel de las consolas que lo inspiran. Cada tramo de
 * celdas seguidas del mismo color en una fila es un solo rectángulo, que pesa
 * menos en el HTML que un cuadrado por celda y se ve igual. Va dentro de un
 * `<svg>` o de un `<g>` que lo coloca; quien lo usa le quita el suavizado
 * (`shapeRendering="crispEdges"`), para que los rectángulos vecinos no dejen
 * costuras entre ellos. Los colores son los del pato, salvo que se pasen otros
 * (el portaaviones, lib/portaaviones.js).
 */
export default function Celdas({ filas, colores = COLORES }) {
  const formas = {}
  filas.forEach((fila, y) => {
    for (const { 0: tramo, 1: letra, index: x } of fila.matchAll(/(.)\1*/g)) {
      if (colores[letra]) formas[letra] = `${formas[letra] ?? ''}M${x} ${y}h${tramo.length}v1h-${tramo.length}z`
    }
  })
  return Object.entries(formas).map(([letra, d]) => <path key={letra} fill={colores[letra]} d={d} />)
}
