import { Children, cloneElement, isValidElement } from 'react'

/**
 * Lo que mide la lectura de un artículo, contado sobre su cuerpo al construir
 * el sitio (components/Articulo.jsx): los minutos que toma y cuántas palabras
 * tiene cada apartado, para el mapa (components/Mapa.jsx). El navegador no
 * cuenta nada.
 */

const PALABRAS_POR_MINUTO = 200

// Lo que va dentro de una línea de texto y no la corta: su texto se pega al de
// al lado («Ley <a>21.719</a>.»). Todo lo demás es un bloque y lleva espacio
// alrededor, para que el último ítem de una lista no se pegue al siguiente.
const EN_LINEA = new Set(['a', 'abbr', 'b', 'code', 'em', 'i', 'small', 'span', 'strong'])

function textoDe(nodo) {
  if (typeof nodo === 'string' || typeof nodo === 'number') return String(nodo)
  if (Array.isArray(nodo)) return nodo.map(textoDe).join('')
  if (!isValidElement(nodo)) return ''
  const texto = textoDe(nodo.props.children)
  return EN_LINEA.has(nodo.type) ? texto : ` ${texto} `
}

// Una palabra es lo que va entre espacios y lleva al menos una letra o un
// número: «¿Y», «21.719» y «online:» cuentan; una coma o un punto sueltos, no.
const contarPalabras = (texto) => texto.match(/\S*[\p{L}\p{N}]\S*/gu)?.length ?? 0

const minutosDeLectura = (palabras) => Math.max(1, Math.round(palabras / PALABRAS_POR_MINUTO))

// «¿Y si estás en medio?» → «y-si-estas-en-medio».
const anclaDe = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * Recorre el cuerpo de un artículo: le pone a cada subtítulo (`h2`) un id
 * sacado de su texto, para que el mapa lleve a él, y cuenta las palabras de
 * cada apartado, de su subtítulo al siguiente. Devuelve el cuerpo con los ids,
 * los apartados como `{ id, titulo, palabras }` y los minutos de todo el texto.
 */
export function leer(cuerpo) {
  const apartados = []
  let total = 0
  const conAnclas = Children.map(cuerpo, (nodo) => {
    const palabras = contarPalabras(textoDe(nodo))
    total += palabras
    if (nodo?.type === 'h2') {
      const titulo = textoDe(nodo).replace(/\s+/g, ' ').trim()
      const id = anclaDe(titulo)
      apartados.push({ id, titulo, palabras: 0 })
      return cloneElement(nodo, { id })
    }
    if (apartados.length) apartados.at(-1).palabras += palabras
    return nodo
  })
  return { cuerpo: conAnclas, apartados, minutos: minutosDeLectura(total) }
}
