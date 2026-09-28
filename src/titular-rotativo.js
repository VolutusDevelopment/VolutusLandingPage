/**
 * La palabra que rota en el titular.
 *
 * El HTML ya trae la frase completa, así que esto solo la anima: sin
 * JavaScript, o con el movimiento reducido, el titular dice «a mano» y se
 * queda así.
 *
 * Para el lector de pantalla la rotación no existe: la palabra visible se
 * esconde con `aria-hidden` y en su lugar queda una copia fija de la frase
 * original. Un titular que cambia cada tres segundos no se puede escuchar.
 *
 * Cada cambio es una cascada letra a letra: la palabra que se va sube y
 * desaparece por arriba, y la que llega entra desde abajo casi a la vez, cada
 * letra un poco después que la anterior. Las dos palabras comparten la celda
 * de la rejilla y cada palabra recorta lo que sale de su línea; el alto lo
 * reserva el CSS, así que no mueve nada. Solo se anima `transform`.
 */

const PAUSA = 2800
// Deben coincidir con `.rotativo-letra` en Portada.css.
const DURACION = 700
const ESCALON = 28

// Cada palabra va en su propia caja, que es la que recorta: si la frase
// parte en dos líneas, las letras de abajo no cruzan por encima de las de
// arriba. El índice de las letras sigue corriendo entre palabras, así la
// cascada se lee como una sola ola de izquierda a derecha.
function enLetras(texto) {
  const palabra = document.createElement('span')
  palabra.className = 'rotativo-palabra'
  let indice = 0
  texto.split(' ').forEach((trozo, posicion) => {
    if (posicion) palabra.append(' ')
    const caja = document.createElement('span')
    caja.className = 'rotativo-trozo'
    for (const caracter of trozo) {
      const letra = document.createElement('span')
      letra.className = 'rotativo-letra'
      letra.style.setProperty('--i', indice++)
      letra.textContent = caracter
      caja.append(letra)
    }
    palabra.append(caja)
  })
  return palabra
}

export default function initTitularRotativo() {
  const rotativo = document.querySelector('.rotativo')
  let palabra = rotativo?.querySelector('.rotativo-palabra')
  if (!palabra) return

  const palabras = rotativo.dataset.palabras.split('|')

  const fija = document.createElement('span')
  fija.className = 'solo-lectores'
  fija.textContent = palabra.textContent
  rotativo.before(fija)
  rotativo.setAttribute('aria-hidden', 'true')

  const quieto = () =>
    document.documentElement.dataset.movimiento === 'reducido' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches

  let actual = 0
  const inicial = enLetras(palabra.textContent)
  palabra.replaceWith(inicial)
  palabra = inicial

  setInterval(() => {
    if (document.hidden || quieto()) return

    const saliente = palabra
    saliente.classList.add('rotativo-sale')

    actual = (actual + 1) % palabras.length
    palabra = enLetras(palabras[actual])
    palabra.classList.add('rotativo-entra')
    rotativo.append(palabra)

    // Un temporizador y no `animationend`: si la pestaña se oculta a mitad de
    // la cascada, el evento puede no llegar y quedarían dos palabras.
    setTimeout(() => saliente.remove(), DURACION + ESCALON * saliente.textContent.length)
  }, PAUSA)
}
