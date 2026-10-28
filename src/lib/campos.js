/**
 * Los campos grabados: la nube de la portada y el mar del pie en video, para
 * la pantalla cuya GPU no los dibuja a tiempo (`PRESUPUESTO` en
 * nubes-lienzo.js).
 *
 * No se graban los puntos sino el campo: lo que `CAMPO` y `MAR` calculan por
 * celda, que es lo caro. Cada cuadro lleva dos planos en gris, lado a lado y
 * separados por `ENTRE_PLANOS` px que repiten su borde: en la nube, el tono
 * (de `sombra` a `luz`) y la cobertura; en el mar, el tono y si la celda es
 * agua. El pintor los vuelve puntos a la medida y con los colores de cada
 * pantalla (`DESEMPACAR`).
 *
 * Una cámara por forma de lienzo. La nube de la portada mira distinto en uno
 * vertical y en uno apaisado (`apaisado` en `VISTAS.aire`, lib/volutus.js):
 * el campo vertical se graba cuadrado y el apaisado, en la proporción desde
 * la que la cámara mide por el ancho (`cubre`, 1.8). El mar, en la suya
 * (`camara`, lib/mar.js: 1.8 × 1.6). Cualquier lienzo de esa forma ve un
 * recorte exacto de su campo.
 *
 * Y una grabación por densidad. El pintor suma detalle hasta el tamaño del
 * punto, así que la nube y el mar se ven distintos según cuántas filas de
 * celdas cubren el alto con que su cámara mide (`filas`): un campo solo se ve
 * como en vivo en una pantalla de su densidad. Se usa el de la densidad más
 * alta que no pasa la de la pantalla, si está a menos de un `paso` de ella.
 * La nube se ve igual hasta un 18 % más densa (bajo 0,5 % de puntos
 * distintos); el mar, que cambia de golpe de una celda a la otra, solo en la
 * misma: la de todos los teléfonos. Donde ninguno sirve, va la grabación
 * liviana (nubes.js).
 *
 * `alto` es el lienzo con que se grabó, en px CSS, con `alto × proporcion`
 * de ancho: da la rapidez de la nube grabada (`lapso`, lib/volutus.js). Las
 * `filas` son pares: son el alto del video, y H.264 en 4:2:0 no acepta uno
 * impar. Los graba scripts/grabar-nubes.mjs.
 */
export const ENTRE_PLANOS = 16
export const CUADROS_POR_SEGUNDO = 120

export const CAMPOS = {
  vertical: { alto: 768, proporcion: 1, paso: 1.18, filas: [440, 518, 610, 716] },
  apaisado: { alto: 720, proporcion: 1.8, paso: 1.18, filas: [216, 254, 298, 350, 412, 484, 570, 670] },
  mar: { alto: 200, proporcion: 2.88, paso: 1, filas: [100] },
}

// El video del campo de `camara` para un lienzo de `filas` filas de celdas, o
// nada si ninguno se ve como él.
export function campoPara(camara, filas) {
  const { paso, filas: niveles } = CAMPOS[camara]
  const nivel = niveles.findLast((n) => n <= filas + 1e-6 && filas <= n * paso + 1e-6)
  return nivel && `/grabados/${camara === 'mar' ? 'mar' : `nube-${camara}`}-${nivel}.mp4`
}
