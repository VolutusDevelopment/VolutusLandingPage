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
 * Cada cambio es una salida hacia arriba y una entrada desde abajo, solo con
 * `transform` y `opacity`. El alto lo reserva el CSS, así que no mueve nada.
 */

const PAUSA = 2600
// La misma duración que la transición de `.rotativo-palabra` en Portada.css.
const SALIDA = 320

export default function initTitularRotativo() {
  const rotativo = document.querySelector('.rotativo')
  const palabra = rotativo?.querySelector('.rotativo-palabra')
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

  setInterval(() => {
    if (document.hidden || quieto()) return

    palabra.classList.add('rotativo-sale')

    // Un temporizador y no `transitionend`: si la pestaña se oculta a mitad de
    // la salida, el evento puede no llegar y la palabra se quedaría invisible.
    setTimeout(() => {
      actual = (actual + 1) % palabras.length
      palabra.textContent = palabras[actual]
      // La nueva palabra se coloca abajo sin transición y, en el siguiente
      // fotograma, sube a su sitio.
      palabra.classList.replace('rotativo-sale', 'rotativo-entra')
      requestAnimationFrame(() => requestAnimationFrame(() => palabra.classList.remove('rotativo-entra')))
    }, SALIDA)
  }, PAUSA)
}
