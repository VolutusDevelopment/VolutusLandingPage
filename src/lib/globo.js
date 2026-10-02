/**
 * La letra de los patos y sus globos, en filas de puntos como los cuadros de
 * lib/pato.js. La usan el juego (src/patos.js), en el contador, la burla y el
 * reclamo, y el pato del mar (lib/mar.js), en lo que dice al salir.
 */

// Las letras, en 3×5 leídas por filas: el bit 14 es la esquina de arriba a la
// izquierda. Mayúsculas, como en el NES.
const GLIFOS = {
  0: 0x7b6f,
  1: 0x2c97,
  2: 0x73e7,
  3: 0x73cf,
  4: 0x5bc9,
  5: 0x79cf,
  6: 0x79ef,
  7: 0x7249,
  8: 0x7bef,
  9: 0x7bcf,
  A: 0x2bed,
  B: 0x6bae,
  C: 0x3923,
  D: 0x6b6e,
  E: 0x79a7,
  F: 0x79a4,
  G: 0x396b,
  H: 0x5bed,
  I: 0x7497,
  J: 0x126a,
  L: 0x4927,
  M: 0x5fed,
  N: 0x6b6d,
  O: 0x2b6a,
  P: 0x6ba4,
  Q: 0x2b73,
  R: 0x6bad,
  S: 0x388e,
  T: 0x7492,
  U: 0x5b6f,
  V: 0x5b6a,
  W: 0x5bfd,
  X: 0x5aad,
  Y: 0x5a92,
  Z: 0x72a7,
  ',': 0x0014,
  '?': 0x6282,
  '¿': 0x20a3,
}

// Un texto como cuadro, en la letra de `GLIFOS` y del color dado: cada píxel
// de la letra son `punto`×`punto` puntos, con uno libre entre letras. El
// espacio es solo ese hueco, doble.
export function filasDeTexto(texto, color, punto = 2) {
  return Array.from({ length: 5 * punto }, (_, y) =>
    [...texto]
      .map((letra) => {
        if (letra === ' ') return ''
        let fila = ''
        for (let x = 0; x < 3 * punto; x++) {
          fila += (GLIFOS[letra] >> (14 - 3 * Math.floor(y / punto) - Math.floor(x / punto))) & 1 ? color : '.'
        }
        return fila
      })
      .join('.'.repeat(punto)),
  )
}

// El globo: una o varias líneas en negro sobre blanco, con borde y una cola a
// la izquierda que apunta al pico. La punta de la cola es la primera columna
// de la fila de `punta`, la del medio de la primera línea (ver `globoJunto` en
// patos.js), así que un globo de varias líneas lo apunta igual.
export const punta = (punto) => 3 + Math.floor((5 * punto) / 2)

export function filasDelGlobo(lineas, punto) {
  const ancha = Math.max(...lineas.map((linea) => filasDeTexto(linea, 'k', punto)[0].length))
  const textos = lineas.map((linea) =>
    filasDeTexto(linea, 'k', punto).map((fila) => `kbbb${fila.replaceAll('.', 'b')}${'b'.repeat(ancha - fila.length)}bbbk`),
  )
  const ancho = textos[0][0].length
  const aire = `k${'b'.repeat(ancho - 2)}k`
  const cuerpo = ['k'.repeat(ancho), aire, aire]
  textos.forEach((texto, i) => {
    if (i) cuerpo.push(aire, aire)
    cuerpo.push(...texto)
  })
  cuerpo.push(aire, aire, 'k'.repeat(ancho))
  const centro = punta(punto)
  const cola = { [centro - 1]: '.kk', [centro]: 'kbb', [centro + 1]: '.kk' }
  return cuerpo.map((fila, y) => (cola[y] ? `${cola[y]}b${fila.slice(1)}` : `...${fila}`))
}
