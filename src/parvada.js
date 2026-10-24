// La parvada de /nosotros (Nosotros.jsx): quince patos que cruzan una vez,
// lejos, sobre el mar del atardecer. Al que el cursor le pasa encima queda
// cazado, como en el Duck Hunt: se pasma y cae al mar. Con el dedo se caza
// tocando, no arrastrando: arrastrar es desplazarse, y el navegador lo cancela
// (`pointercancel`) antes de soltar. El pato mide 12 px en el teléfono, así que
// el toque vale hasta `DEDO` px fuera de él, y cae el más cercano. El cursor
// los bota uno a uno, con `PAUSA` entre uno y otro aunque barra la V entera;
// cada toque es un tiro y no espera. Pueden caer todos: entonces el pato del
// mar del footer sale comentándolo (`data-fetiche`, ver nubes.js). El vuelo y
// la caída los lleva el CSS (Nosotros.css); aquí solo se elige a qué altura
// vuela (`volar`) y se mira si el puntero da en un pato. Detrás de las
// tarjetas de los socios no se ven, y ahí no se cazan. Cuando la parvada sale
// de la pantalla, se quita. Con movimiento reducido no está.

import { quieto } from './lib/movimiento.js'

const PAUSA = 600
const DEDO = 16

/**
 * La altura de la parvada, en cielo libre y nunca detrás del texto: bajo la
 * entradilla, lejos sobre el horizonte, o, si en una pantalla baja ahí no cabe
 * holgada, entre la barra y el titular, donde el CSS siempre deja aire. Se
 * mide desde arriba de la sección, que es arriba del telón, y la parvada
 * empieza `borde` más abajo. La V mide 4.5 patos de alto y su centro va medio
 * pato bajo el que guía (Nosotros.css).
 */
function volar(parvada) {
  const seccion = parvada.closest('section')
  const cabecera = seccion.querySelector('.atardecer-cabecera')
  const arriba = seccion.getBoundingClientRect().top
  const pato = parvada.querySelector('.pato').offsetWidth
  const borde = parseFloat(getComputedStyle(parvada).marginTop)
  const texto = cabecera.lastElementChild.getBoundingClientRect().bottom - arriba
  const horizonte = borde + parvada.offsetHeight
  const [desde, hasta] =
    horizonte - texto > 1.5 * 4.5 * pato
      ? [texto, horizonte]
      : [parseFloat(getComputedStyle(seccion).getPropertyValue('--barra-alto')), cabecera.firstElementChild.getBoundingClientRect().top - arriba]
  parvada.style.setProperty('--vuelo', `${(desde + hasta) / 2 - pato / 2 - borde}px`)
}

export default function initParvada() {
  const parvada = document.querySelector('.parvada')
  if (!parvada || quieto()) return
  const seccion = parvada.closest('section')
  const patos = [...parvada.querySelectorAll('.pato')]
  const vuelo = new AbortController()
  const caza = new AbortController()
  let ultimo = -PAUSA

  volar(parvada)
  addEventListener('resize', () => volar(parvada), { passive: true, signal: vuelo.signal })

  const cazar = ({ clientX: x, clientY: y, target, timeStamp }, holgura) => {
    if (target.closest('.socio')) return
    let pato
    for (const candidato of patos) {
      const caja = candidato.getBoundingClientRect()
      const distancia = Math.hypot(Math.max(caja.left - x, 0, x - caja.right), Math.max(caja.top - y, 0, y - caja.bottom))
      if (distancia <= holgura) [pato, holgura] = [candidato, distancia]
    }
    if (!pato) return
    pato.classList.add('cazado')
    patos.splice(patos.indexOf(pato), 1)
    ultimo = timeStamp
    if (patos.length) return
    caza.abort()
    const mar = document.querySelector('.nubes[data-vista="mar"]')
    if (mar) mar.dataset.fetiche = ''
  }
  const opciones = { passive: true, signal: caza.signal }
  seccion.addEventListener(
    'pointermove',
    (evento) => evento.pointerType === 'mouse' && evento.timeStamp - ultimo >= PAUSA && cazar(evento, 0),
    opciones,
  )
  seccion.addEventListener('pointerup', (evento) => evento.pointerType !== 'mouse' && cazar(evento, DEDO), opciones)

  parvada.addEventListener('animationend', ({ animationName }) => {
    if (animationName !== 'cruzar') return
    parvada.remove()
    vuelo.abort()
    caza.abort()
  })
}
