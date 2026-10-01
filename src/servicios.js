/**
 * Los servicios: cambiar de un panel a otro.
 *
 * Toda la maqueta —paneles superpuestos en escritorio, apilados en el
 * celular— es CSS y funciona igual en las dos. Esto solo mueve la clase
 * `activo` y dice lo que pasa a quien no ve la pantalla, con el patrón de
 * acordeón de ARIA: el botón dice si su panel está abierto y cuál es.
 *
 * El panel abierto no se puede cerrar: siempre hay uno a la vista, como en la
 * original. Su botón queda marcado como `aria-disabled` y no hace nada.
 */
export default function initServicios() {
  const servicios = [...document.querySelectorAll('.servicio')]
  if (!servicios.length) return

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
      if (!servicio.classList.contains('activo')) abrir(servicio)
    })
  }

  abrir(servicios.find((s) => s.classList.contains('activo')) ?? servicios[0])
}
