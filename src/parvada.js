// La parvada de /nosotros (Nosotros.jsx): quince patos que cruzan una vez,
// lejos, sobre el mar del atardecer, apenas se deja el último socio: salen
// cuando la pausa que lo sigue (`.atardecer-pausa`) asoma un poco desde
// abajo, a un 15 % de la pantalla, o ya quedó atrás (un salto, una recarga con
// la página a medio camino): basta con que su borde de arriba esté sobre esa línea. Vuelan en el telón, así que si la escena se recorta en la lámina
// mientras cruzan, siguen adentro. Al que el cursor le pasa encima queda
// cazado, como en el Duck Hunt: se pasma y cae al mar. Con el dedo se caza
// tocando, no arrastrando: arrastrar es desplazarse, y el navegador lo cancela
// (`pointercancel`) antes de soltar. El pato mide 12 px en el teléfono, así que
// el toque vale hasta `DEDO` px fuera de él, y cae el más cercano. El cursor
// los bota uno a uno, con `PAUSA` entre uno y otro aunque barra la V entera;
// cada toque es un tiro y no espera. Pueden caer todos: entonces llega el
// portaaviones (`.flota`, ver flota.js). El vuelo y
// la caída los lleva el CSS (Nosotros.css); aquí se les da la salida y se mira
// si el puntero da en un pato que se vea: fuera de la lámina, recortado, o
// detrás de las tarjetas de los socios, no se caza. La sección siguiente se
// monta sobre la lámina, así que el puntero se escucha en toda la página
// mientras vuelan. Cuando la parvada sale de la pantalla, se quita. Con
// movimiento reducido no está.

import { quieto } from './lib/movimiento.js'

const PAUSA = 600
const DEDO = 16

export default function initParvada() {
  const parvada = document.querySelector('.parvada')
  if (!parvada || quieto()) return
  const telon = parvada.parentElement
  const patos = [...parvada.querySelectorAll('.pato')]
  const caza = new AbortController()
  let ultimo = -PAUSA

  const cazar = ({ clientX: x, clientY: y, target, timeStamp }, holgura) => {
    if (target.closest('.socio')) return
    let pato
    for (const candidato of patos) {
      const caja = candidato.getBoundingClientRect()
      const distancia = Math.hypot(Math.max(caja.left - x, 0, x - caja.right), Math.max(caja.top - y, 0, y - caja.bottom))
      if (distancia <= holgura) [pato, holgura] = [candidato, distancia]
    }
    if (!pato || !document.elementsFromPoint(x, y).includes(telon)) return
    pato.classList.add('cazado')
    patos.splice(patos.indexOf(pato), 1)
    ultimo = timeStamp
    if (patos.length) return
    caza.abort()
    document.querySelector('.flota')?.classList.add('llega')
  }

  const salida = new IntersectionObserver(
    ([{ boundingClientRect, rootBounds }]) => {
      if (boundingClientRect.top > rootBounds.bottom) return
      salida.disconnect()
      parvada.classList.add('vuela')
      const opciones = { passive: true, signal: caza.signal }
      addEventListener(
        'pointermove',
        (evento) => evento.pointerType === 'mouse' && evento.timeStamp - ultimo >= PAUSA && cazar(evento, 0),
        opciones,
      )
      addEventListener('pointerup', (evento) => evento.pointerType !== 'mouse' && cazar(evento, DEDO), opciones)
    },
    { rootMargin: '0px 0px -15% 0px' },
  )
  salida.observe(document.querySelector('.atardecer-pausa'))

  parvada.addEventListener('animationend', ({ animationName }) => {
    if (animationName !== 'cruzar') return
    parvada.remove()
    caza.abort()
  })
}
