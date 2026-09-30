/**
 * La palabra que rota en el titular.
 *
 * El HTML ya trae la frase completa, así que esto solo la anima: sin
 * JavaScript, o con el movimiento reducido, el titular dice «a mano» y se
 * queda así.
 *
 * Para el lector de pantalla la rotación no existe: la palabra visible se
 * esconde con `aria-hidden` y en su lugar queda una copia fija de la frase
 * original. Un titular que cambia cada pocos segundos no se puede escuchar.
 *
 * Cada cambio es una cascada letra a letra. Cada letra vive en su propia caja
 * recortada: la que se va sube y desaparece por arriba, y en cuanto sale la
 * última, la palabra nueva entra desde abajo, también letra a letra. La salida
 * acelera y la entrada frena en seco, así que el relevo se lee como un solo
 * gesto. Solo se anima `transform`; el alto lo reserva el CSS.
 *
 * Al entrar cada palabra se enciende su ruta en el dibujo de la portada
 * (`data-ruta` en `Conexiones.jsx`), que es lo que ata el dibujo a la frase.
 */

const PAUSA = 2600
// Deben coincidir con `.rotativo-letra` en Portada.css.
const SALIDA = 220
const ESCALON_SALIDA = 25

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
      const caja = document.createElement('span')
      caja.className = 'rotativo-caja'
      const letra = document.createElement('span')
      letra.className = 'rotativo-letra'
      letra.style.setProperty('--i', indice++)
      letra.textContent = caracter
      caja.append(letra)
      bloque.append(caja)
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
  const rutas = document.querySelectorAll('[data-ruta]')
  // La palabra toma el tono de su ruta: el color se lee en el titular y en el
  // dibujo a la vez.
  const encender = (indice) =>
    rutas.forEach((ruta) => {
      const activa = ruta.dataset.ruta === String(indice)
      ruta.classList.toggle('activa', activa)
      if (activa) rotativo.style.setProperty('--tono', ruta.style.getPropertyValue('--tono'))
    })

  // El CSS reserva el alto con la frase más larga, pero en pantallas angostas
  // la más alta puede ser otra: «cotizaciones» no cabe junto a nada y parte
  // la frase en tres líneas. Se reservan todas, invisibles en la misma celda,
  // y la celda mide lo que la más alta.
  for (const texto of palabras) {
    const reserva = document.createElement('span')
    reserva.className = 'rotativo-reserva'
    reserva.textContent = texto
    rotativo.append(reserva)
  }

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
  // La primera ruta espera a que el dibujo termine de entrar.
  setTimeout(() => encender(actual), 1500)

  setInterval(() => {
    if (document.hidden || quieto()) return

    const saliente = palabra
    saliente.classList.add('rotativo-sale')
    actual = (actual + 1) % palabras.length
    palabra = enLetras(palabras[actual])

    // La nueva entra cuando sale la última letra de la vieja. Un temporizador
    // y no `animationend`: si la pestaña se oculta a mitad, el evento puede no
    // llegar y quedarían dos palabras.
    const letras = saliente.querySelectorAll('.rotativo-letra').length
    setTimeout(() => {
      saliente.replaceWith(palabra)
      palabra.classList.add('rotativo-entra')
      encender(actual)
    }, SALIDA + ESCALON_SALIDA * (letras - 1))
  }, PAUSA)
}
