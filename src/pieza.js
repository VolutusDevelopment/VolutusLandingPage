import { enderezar, inclinar } from './lib/inclinacion.js'
import { quieto } from './lib/movimiento.js'

/**
 * La pieza de la cabecera de un servicio (components/Pieza.jsx) se inclina
 * hacia el cursor como la card del frente de la rueda (servicios.js), y las
 * capas de su escena se corren según su hondura (Servicio.css). Solo con un
 * ratón de verdad y nunca con el movimiento reducido.
 */
export default function initPieza() {
  const pieza = document.querySelector('.pieza')
  if (!pieza) return

  pieza.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || quieto()) return
    inclinar(pieza, e, 6)
  })
  pieza.addEventListener('pointerleave', () => enderezar(pieza))
}
