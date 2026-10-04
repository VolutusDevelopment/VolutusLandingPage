/**
 * La palabra que rota en el titular.
 *
 * El HTML ya trae la frase completa, así que esto solo la anima: sin
 * JavaScript, o con el movimiento reducido, el titular dice la primera y se
 * queda así.
 *
 * Para el lector de pantalla la rotación no existe: el rotativo viene con
 * `aria-hidden` y el titular trae la lista fija al lado. Un titular que cambia
 * cada pocos segundos no se puede escuchar.
 *
 * Cada cambio es una cascada letra a letra: la frase que se va sube y la nueva
 * entra desde abajo al mismo tiempo, así que la línea nunca queda vacía. Las
 * dos cruzan el degradé con que el CSS funde los bordes de la línea.
 * Solo se anima `transform`; el alto es siempre una línea (ver el CSS).
 */

import { quieto } from './lib/movimiento.js'

const PAUSA = 2600
// Deben coincidir con `.rotativo-letra` en Portada.css.
const DURACION = 600
const ESCALON = 25

// Cada letra en su caja para que la cascada sea una sola ola. Los espacios
// quedan como texto: una caja con solo un espacio no mide nada.
function enLetras(texto) {
  const palabra = document.createElement('span')
  palabra.className = 'rotativo-palabra'
  let indice = 0
  for (const caracter of texto) {
    if (caracter === ' ') {
      palabra.append(' ')
      continue
    }
    const letra = document.createElement('span')
    letra.className = 'rotativo-letra'
    letra.style.setProperty('--i', indice++)
    letra.textContent = caracter
    palabra.append(letra)
  }
  return palabra
}

export default function initTitularRotativo() {
  const rotativo = document.querySelector('.rotativo')
  let palabra = rotativo?.querySelector('.rotativo-palabra')
  if (!palabra) return

  const palabras = rotativo.dataset.palabras.split('|')

  let actual = 0
  const inicial = enLetras(palabra.textContent)
  palabra.replaceWith(inicial)
  palabra = inicial

  setInterval(() => {
    if (document.hidden || quieto()) return

    const saliente = palabra
    actual = (actual + 1) % palabras.length
    palabra = enLetras(palabras[actual])
    palabra.classList.add('rotativo-entra')
    saliente.classList.remove('rotativo-entra')
    saliente.classList.add('rotativo-sale')
    saliente.after(palabra)

    // La vieja se quita cuando sale su última letra. Un temporizador y no
    // `animationend`: si la pestaña se oculta a mitad, el evento puede no
    // llegar y quedarían dos palabras.
    const letras = saliente.querySelectorAll('.rotativo-letra').length
    setTimeout(() => saliente.remove(), DURACION + ESCALON * (letras - 1))
  }, PAUSA)
}
