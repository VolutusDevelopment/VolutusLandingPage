import { enderezar, inclinar } from './lib/inclinacion.js'
import { quieto } from './lib/movimiento.js'

/**
 * La pieza de un servicio (components/Pieza.jsx) se inclina hacia el cursor,
 * y las capas de su escena se corren según su hondura (Servicio.css). Solo con un ratón de verdad y
 * nunca con el movimiento reducido. En /servicios la pieza va bajo el enlace
 * que cubre su card, así que el cursor lo escucha la card.
 */
export default function initPieza() {
  for (const pieza of document.querySelectorAll('.pieza')) {
    const zona = pieza.closest('.indice-servicio') ?? pieza
    zona.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || quieto()) return
      inclinar(pieza, e, 6)
    })
    zona.addEventListener('pointerleave', () => enderezar(pieza))
  }
}
