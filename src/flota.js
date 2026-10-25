// El portaaviones de /nosotros (Nosotros.jsx, `Flota`): cuando llega
// (src/parvada.js le pone `.llega`), pulsarlo o tocarlo empieza el juego. El
// enlace va en el telón, debajo de las secciones de la página, que se llevan
// el clic; por eso aquí se escucha en toda la página y, si el clic da en el
// barco (con `DEDO` px de holgura, que de chico el barco no es un blanco de
// 44 px) y se ve, no lo tapa una tarjeta ni la sección siguiente, se pulsa el
// enlace. Con teclado y lectores, el enlace se usa solo. Con el cursor encima
// del barco, el cursor es una mano.

import { quieto } from './lib/movimiento.js'

const DEDO = 22

export default function initFlota() {
  const flota = document.querySelector('.flota')
  if (!flota || quieto()) return
  const barco = flota.querySelector('.barco')
  const telon = flota.parentElement

  const sobreElBarco = ({ clientX: x, clientY: y, target }) => {
    if (!flota.classList.contains('llega') || target.closest('a, button, .socio')) return false
    const caja = barco.getBoundingClientRect()
    return (
      x >= caja.left - DEDO &&
      x <= caja.right + DEDO &&
      y >= caja.top - DEDO &&
      y <= caja.bottom + DEDO &&
      document.elementsFromPoint(x, y).includes(telon)
    )
  }

  addEventListener('click', (evento) => sobreElBarco(evento) && barco.click())
  addEventListener(
    'pointermove',
    (evento) => evento.pointerType === 'mouse' && (document.body.style.cursor = sobreElBarco(evento) ? 'pointer' : ''),
    { passive: true },
  )
}
