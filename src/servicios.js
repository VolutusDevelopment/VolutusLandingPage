/**
 * Los servicios: cambiar de uno a otro.
 *
 * Toda la maqueta —columnas en escritorio, fichas en el celular— es CSS y
 * funciona igual en las dos. Esto solo mueve la clase `activo` y dice lo que
 * pasa a quien no ve la pantalla, con el patrón de acordeón de ARIA: el botón
 * dice si su panel está abierto y cuál es.
 *
 * El servicio abierto no se puede cerrar: siempre hay uno a la vista, como en
 * la original. Su botón queda marcado como `aria-disabled` y no hace nada.
 */
export default function initServicios() {
  const servicios = [...document.querySelectorAll('.servicio')]
  if (!servicios.length) return

  // La vuelta es cosa del escritorio, donde hay columnas que girar; en el
  // celular el panel cambia debajo de las fichas. Y nunca con menos movimiento.
  const conGiro = () =>
    matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)').matches &&
    document.documentElement.dataset.movimiento !== 'reducido'

  function abrir(elegido) {
    for (const servicio of servicios) {
      const abierto = servicio === elegido
      const boton = servicio.querySelector('.servicio-boton')
      servicio.classList.toggle('activo', abierto)
      boton.setAttribute('aria-expanded', String(abierto))
      if (abierto) boton.setAttribute('aria-disabled', 'true')
      else boton.removeAttribute('aria-disabled')
    }
  }

  for (const servicio of servicios) {
    const boton = servicio.querySelector('.servicio-boton')
    const panel = servicio.querySelector('.servicio-panel')
    boton.setAttribute('aria-controls', panel.id)
    panel.setAttribute('role', 'region')
    panel.setAttribute('aria-labelledby', boton.id)
    boton.addEventListener('click', () => {
      if (servicio.classList.contains('activo')) return
      abrir(servicio)
      if (!conGiro()) return
      // El giro solo al pulsar, no al cargar. La clase se quita y se vuelve a
      // poner para que la animación arranque de cero en cada clic.
      servicio.classList.remove('gira')
      void servicio.offsetWidth
      servicio.classList.add('gira')
    })
    servicio.addEventListener('animationend', (evento) => {
      if (evento.animationName === 'servicio-rota') servicio.classList.remove('gira')
    })
  }

  abrir(servicios.find((s) => s.classList.contains('activo')) ?? servicios[0])
}
