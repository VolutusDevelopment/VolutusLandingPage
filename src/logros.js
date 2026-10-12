/**
 * Los logros, como placas en la mano: con un ratón de verdad, cada tarjeta se
 * inclina hacia el cursor y la luz del metal lo sigue (Proyectos.css). Con el
 * dedo no hay cursor que seguir, y con el movimiento reducido no se mueve.
 */
import { quieto } from './lib/movimiento.js'
import { enderezar, inclinar } from './lib/inclinacion.js'

// Hasta 6° hacia cada lado: se nota que es un objeto sin que cueste leerlo.
const GRADOS = 12

export default function initLogros() {
  for (const tarjeta of document.querySelectorAll('.proyecto-destacado')) {
    tarjeta.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse' && !quieto()) inclinar(tarjeta, e, GRADOS)
    })
    tarjeta.addEventListener('pointerleave', () => enderezar(tarjeta))
  }
}
