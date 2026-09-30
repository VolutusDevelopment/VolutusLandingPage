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
 * Solo se anima `transform`; el alto lo reserva el CSS.
 */

const PAUSA = 2600
// Deben coincidir con `.rotativo-letra` en Portada.css.
const DURACION = 600
const ESCALON = 25

// Las letras de cada palabra van juntas en un bloque que no se parte, así la
// frase solo puede cortar línea entre palabras. El índice sigue corriendo de
// una palabra a otra para que la cascada sea una sola ola.
function enLetras(texto) {
  const palabra = document.createElement('span')
  palabra.className = 'rotativo-palabra'
  let indice = 0
  texto.split(' ').forEach((trozo, posicion) => {
    if (posicion) palabra.append(' ')
    const bloque = document.createElement('span')
    bloque.className = 'rotativo-trozo'
    for (const caracter of trozo) {
      const letra = document.createElement('span')
      letra.className = 'rotativo-letra'
      letra.style.setProperty('--i', indice++)
      letra.textContent = caracter
      bloque.append(letra)
    }
    palabra.append(bloque)
  })
  return palabra
}

export default function initTitularRotativo() {
  const rotativo = document.querySelector('.rotativo')
  let palabra = rotativo?.querySelector('.rotativo-palabra')
  if (!palabra) return

  const palabras = rotativo.dataset.palabras.split('|')
  // El CSS reserva el alto con la frase más larga, pero en pantallas angostas
  // la más alta puede ser otra, según dónde corte cada una. Se reservan todas,
  // invisibles en la misma celda, y la celda mide lo que la más alta.
  for (const texto of palabras) {
    const reserva = document.createElement('span')
    reserva.className = 'rotativo-reserva'
    reserva.textContent = texto
    rotativo.append(reserva)
  }

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
