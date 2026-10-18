// Las preguntas frecuentes de las páginas de servicio (Bloques.jsx), en S y M:
// una abierta a la vez, y la respuesta se despliega y se pliega en vez de
// aparecer de golpe. Al abrir una, la que estaba abierta se cierra. Con
// movimiento reducido, solo se abre y se cierra.

import { quieto } from './lib/movimiento.js'

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'

function mover(pregunta, abrir) {
  const respuesta = pregunta.querySelector('p')
  if (quieto()) {
    pregunta.open = abrir
    return
  }
  if (abrir) pregunta.open = true
  const { paddingBottom } = getComputedStyle(respuesta)
  const abierta = { height: `${respuesta.offsetHeight - parseFloat(paddingBottom)}px`, paddingBottom, opacity: 1 }
  const plegada = { height: '0px', paddingBottom: '0px', opacity: 0 }
  respuesta.style.overflow = 'hidden'
  pregunta.classList.toggle('cerrando', !abrir)
  respuesta.animate(abrir ? [plegada, abierta] : [abierta, plegada], { duration: abrir ? 280 : 220, easing: EASE }).onfinish = () => {
    respuesta.style.overflow = ''
    pregunta.classList.remove('cerrando')
    if (!abrir) pregunta.open = false
  }
}

export default function initPreguntas() {
  if (!matchMedia('(max-width: 1023px)').matches) return
  document.querySelectorAll('.servicio-preguntas').forEach((lista) => {
    const preguntas = [...lista.querySelectorAll('details')]
    preguntas.forEach((pregunta) =>
      pregunta.querySelector('summary').addEventListener('click', (evento) => {
        evento.preventDefault()
        const abrir = !pregunta.open
        if (abrir) preguntas.filter((otra) => otra !== pregunta && otra.open).forEach((otra) => mover(otra, false))
        mover(pregunta, abrir)
      })
    )
  })
}
