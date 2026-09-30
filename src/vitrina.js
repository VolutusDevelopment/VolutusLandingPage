/**
 * La vitrina de un proyecto: abrir y cerrar.
 *
 * Empieza plegada (la clase viene en el HTML) y el botón de su cabecera la
 * despliega. Los enlaces que apuntan a la vitrina —«Ver la web de PonleNota»
 * en Servicios— la abren al llegar: aterrizar en una caja cerrada después de
 * pedir verla sería pedir un segundo clic sin motivo.
 */
export default function initVitrina() {
  for (const vitrina of document.querySelectorAll('.vitrina')) {
    const boton = vitrina.querySelector('.vitrina-abrir')
    if (!boton || !vitrina.id) continue
    const texto = boton.querySelector('.vitrina-abrir-texto')
    const invitacion = texto.textContent

    function poner(abierta) {
      vitrina.classList.toggle('plegada', !abierta)
      boton.setAttribute('aria-expanded', String(abierta))
      texto.textContent = abierta ? 'Ocultar' : invitacion
    }

    boton.addEventListener('click', () => {
      const abrir = vitrina.classList.contains('plegada')
      poner(abrir)
      // Al cerrar desde abajo, la página se encoge por encima de quien lee:
      // se le deja delante el botón que acaba de pulsar, no otra sección.
      if (!abrir) boton.scrollIntoView({ block: 'nearest' })
    })

    // Se abre ANTES de que el navegador salte al ancla: el clic llega primero
    // al script y el salto después, así que cae sobre la vitrina ya abierta.
    document.addEventListener('click', (evento) => {
      if (evento.target.closest(`a[href="#${vitrina.id}"]`)) poner(true)
    })
    if (location.hash === `#${vitrina.id}`) poner(true)
  }
}
