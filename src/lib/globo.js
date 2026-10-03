/**
 * La letra de los patos y sus globos, en filas de puntos como los cuadros de
 * lib/pato.js. La usan el juego (src/patos.js), en el contador, la burla y el
 * reclamo, y el pato del mar (lib/mar.js), en lo que dice al salir.
 */

// Mayúsculas en 3×5. Los dibujos en filas hacen fácil revisar y ampliar la
// letra cuando se agreguen textos nuevos. Un signo sin dibujo usa «?» para
// que nunca desaparezca en silencio.
const GLIFOS = {
  0: ['###', '#.#', '#.#', '#.#', '###'],
  1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['###', '..#', '###', '#..', '###'],
  3: ['###', '..#', '###', '..#', '###'],
  4: ['#.#', '#.#', '###', '..#', '..#'],
  5: ['###', '#..', '###', '..#', '###'],
  6: ['###', '#..', '###', '#.#', '###'],
  7: ['###', '..#', '..#', '..#', '..#'],
  8: ['###', '#.#', '###', '#.#', '###'],
  9: ['###', '#.#', '###', '..#', '###'],
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..#', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#.#', '###', '###', '#.#', '#.#'],
  N: ['##.', '#.#', '#.#', '#.#', '#.#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  Q: ['.#.', '#.#', '#.#', '##.', '.##'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#.#', '#.#', '###', '###', '#.#'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  Z: ['###', '..#', '.#.', '#..', '###'],
  ' ': ['', '', '', '', ''],
  '!': ['.#.', '.#.', '.#.', '...', '.#.'],
  '¡': ['.#.', '...', '.#.', '.#.', '.#.'],
  '"': ['#.#', '#.#', '...', '...', '...'],
  '#': ['#.#', '###', '#.#', '###', '#.#'],
  $: ['.##', '#..', '.#.', '..#', '##.'],
  '%': ['#.#', '..#', '.#.', '#..', '#.#'],
  '&': ['.#.', '#..', '.#.', '#.#', '.##'],
  "'": ['.#.', '.#.', '...', '...', '...'],
  '(': ['..#', '.#.', '#..', '.#.', '..#'],
  ')': ['#..', '.#.', '..#', '.#.', '#..'],
  '*': ['...', '#.#', '.#.', '#.#', '...'],
  '+': ['...', '.#.', '###', '.#.', '...'],
  ',': ['...', '...', '...', '.#.', '#..'],
  '-': ['...', '...', '###', '...', '...'],
  '.': ['...', '...', '...', '...', '.#.'],
  '/': ['..#', '..#', '.#.', '#..', '#..'],
  ':': ['...', '.#.', '...', '.#.', '...'],
  ';': ['...', '.#.', '...', '.#.', '#..'],
  '<': ['..#', '.#.', '#..', '.#.', '..#'],
  '=': ['...', '###', '...', '###', '...'],
  '>': ['#..', '.#.', '..#', '.#.', '#..'],
  '?': ['##.', '..#', '.#.', '...', '.#.'],
  '@': ['###', '#.#', '###', '#..', '###'],
  '[': ['.##', '.#.', '.#.', '.#.', '.##'],
  '\\': ['#..', '#..', '.#.', '..#', '..#'],
  ']': ['##.', '.#.', '.#.', '.#.', '##.'],
  '^': ['.#.', '#.#', '...', '...', '...'],
  _: ['...', '...', '...', '...', '###'],
  '`': ['#..', '...', '...', '...', '...'],
  '{': ['..#', '.#.', '##.', '.#.', '..#'],
  '|': ['.#.', '.#.', '.#.', '.#.', '.#.'],
  '}': ['##.', '.#.', '..#', '.#.', '##.'],
  '~': ['...', '.#.', '#.#', '...', '...'],
  '¿': ['.#.', '...', '.#.', '#..', '.##'],
}

// Tilde, acento agudo/grave, diéresis y circunflejo. La fila superior se
// reserva para la marca; el resto del dibujo conserva sus cinco filas.
const MARCAS = {
  '\u0300': '#..',
  '\u0301': '..#',
  '\u0302': '.#.',
  '\u0303': '.#.',
  '\u0308': '#.#',
  '\u030a': '.#.',
}

// Ninguna línea se lleva el globo entero fuera de la pantalla. Las frases se
// parten por palabras y, si alguien escribe una palabra larguísima, por letras.
const MAX_CARACTERES_POR_LINEA = 16

function ajustarLineas(lineas) {
  const resultado = []
  for (const original of lineas.map(normalizar)) {
    let actual = ''
    for (const palabra of original.trim().split(/\s+/u).filter(Boolean)) {
      const letras = [...palabra]
      if (letras.length > MAX_CARACTERES_POR_LINEA) {
        if (actual) resultado.push(actual)
        actual = ''
        while (letras.length > MAX_CARACTERES_POR_LINEA) {
          resultado.push(letras.splice(0, MAX_CARACTERES_POR_LINEA).join(''))
        }
        if (letras.length) actual = letras.join('')
        continue
      }
      if (actual && [...actual, ' ', ...letras].length > MAX_CARACTERES_POR_LINEA) {
        resultado.push(actual)
        actual = palabra
      } else {
        actual = actual ? `${actual} ${palabra}` : palabra
      }
    }
    if (actual) resultado.push(actual)
  }
  return resultado
}

// Las comillas curvas, los guiones largos y los puntos suspensivos se usan a
// menudo al escribir chistes. Se convierten a signos de la misma letra pixel.
function normalizar(texto) {
  return texto
    .normalize('NFC')
    .toLocaleUpperCase('es-CL')
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
}

// Un texto como cuadro. Cada píxel de letra son `punto`×`punto` puntos, con
// uno libre entre letras. Los espacios quedan más anchos que ese hueco.
export function filasDeTexto(texto, color, punto = 2) {
  const letras = [...normalizar(texto)].map((letra) => {
    if (/\s/u.test(letra)) return { filas: GLIFOS[' '], marca: null }

    const descompuesta = [...letra.normalize('NFD')]
    const base = descompuesta.shift()
    return {
      filas: GLIFOS[base] ?? GLIFOS['?'],
      marca: descompuesta.map((marca) => MARCAS[marca]).filter(Boolean).join(''),
    }
  })

  return Array.from({ length: 6 * punto }, (_, y) =>
    letras
      .map(({ filas, marca }) => {
        if (!filas.some(Boolean)) return ''
        const fila = Math.floor(y / punto)
        const marcas = fila === 0 && marca ? [...marca].map((pixel) => pixel === '#' ? '#' : '.').join('') : ''
        const dibujo = fila === 0 ? marcas.padEnd(3, '.') : filas[fila - 1]
        return [...dibujo].map((pixel) => pixel === '#' ? color.repeat(punto) : '.'.repeat(punto)).join('')
      })
      .join('.'.repeat(punto)),
  )
}

// El globo: una o varias líneas en negro sobre blanco, con una cola a la
// izquierda que apunta al pico. La punta cae a media altura del primer renglón.
export const punta = (punto) => 3 + Math.floor((6 * punto) / 2)

export function filasDelGlobo(lineas, punto) {
  lineas = ajustarLineas(lineas)
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
