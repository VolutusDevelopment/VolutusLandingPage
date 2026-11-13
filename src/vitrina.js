/**
 * La vitrina de Proyectos sigue al ratón: sus piezas se corren hacia el
 * puntero a distintas profundidades y se alzan mientras está encima (ver «la
 * llegada y el cursor» en Proyectos.css).
 *
 * Cada eje es un resorte con amortiguación crítica (lib/resorte.js): arranca y
 * frena sin golpes y no se pasa de largo. Solo corre mientras se mueve.
 */
import { quieto } from './lib/movimiento.js'
import { arrastrar } from './lib/resorte.js'

const EJES = ['mx', 'my', 'encima']

export default function initVitrina() {
  const vitrina = document.querySelector('.obra-con-vitrina .vitrina')
  if (!vitrina || !matchMedia('(hover: hover)').matches || quieto()) return
  const obra = vitrina.closest('.obra')

  const estado = Object.fromEntries(EJES.map((eje) => [eje, { x: 0, v: 0 }]))
  let meta = { mx: 0, my: 0, encima: 0 }
  let cuando
  let pendiente = null

  const seguir = (ahora) => {
    const dt = Math.min((ahora - (cuando ?? ahora)) / 1000, 0.1)
    cuando = ahora
    let quieta = true
    for (const eje of EJES) {
      estado[eje] = arrastrar(estado[eje], meta[eje], dt)
      if (Math.abs(estado[eje].x - meta[eje]) > 1e-3 || Math.abs(estado[eje].v) > 1e-3) quieta = false
      vitrina.style.setProperty(`--${eje}`, estado[eje].x.toFixed(4))
    }
    if (quieta) {
      cuando = undefined
      pendiente = null
    } else pendiente = requestAnimationFrame(seguir)
  }

  const apuntar = (nueva) => {
    meta = nueva
    pendiente ??= requestAnimationFrame(seguir)
  }

  // De -1 a 1 en cada eje, desde el centro de la caja.
  const eje = (valor, desde, largo) => Math.max(-1, Math.min(1, ((valor - desde) / largo) * 2 - 1))
  obra.addEventListener('pointermove', ({ clientX, clientY }) => {
    const caja = vitrina.getBoundingClientRect()
    apuntar({ mx: eje(clientX, caja.left, caja.width), my: eje(clientY, caja.top, caja.height), encima: 1 })
  })
  obra.addEventListener('pointerleave', () => apuntar({ mx: 0, my: 0, encima: 0 }))
}
