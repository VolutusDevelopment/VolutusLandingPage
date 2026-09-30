/**
 * La vitrina de un proyecto: abrir y cerrar.
 *
 * Empieza plegada (la clase viene en el HTML) y su cabecera la despliega. Los
 * enlaces que apuntan a la vitrina —«Ver la web de PonleNota» en Servicios—
 * la abren al llegar: aterrizar en una caja cerrada después de pedir verla
 * sería pedir un segundo clic sin motivo.
 *
 * **El despliegue es suave.** La altura de llegada no la sabe el CSS —depende
 * del ancho y de las capturas—, así que se mide: se pone el estado final, se
 * lee cuánto mide, se vuelve a la altura de partida y se viaja de una a otra.
 * Todo eso ocurre antes de pintar, así que nunca se ve el salto. Al llegar se
 * suelta la altura fija para que la vitrina vuelva a medir lo que ocupe.
 */

const DURACION = 650

export default function initVitrina() {
  const quieto = () =>
    document.documentElement.dataset.movimiento === 'reducido' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches

  for (const vitrina of document.querySelectorAll('.vitrina')) {
    const boton = vitrina.querySelector('.vitrina-abrir')
    if (!boton || !vitrina.id) continue
    const texto = boton.querySelector('.vitrina-abrir-texto')
    const invitacion = texto.textContent
    let enCurso = null
    let alLlegar = null

    /** El estado, sin animación: la clase, lo que anuncia el botón y su texto. */
    function poner(abierta) {
      vitrina.classList.toggle('plegada', !abierta)
      boton.setAttribute('aria-expanded', String(abierta))
      texto.textContent = abierta ? 'Ocultar' : invitacion
    }

    /** Deja la vitrina en su sitio, con la altura que le toque. */
    function terminar(abierta) {
      clearTimeout(enCurso)
      enCurso = null
      // Sea quien sea el que cierra el viaje, el otro deja de escuchar: si no,
      // un aviso tardío terminaría el siguiente despliegue con el estado viejo.
      vitrina.removeEventListener('transitionend', alLlegar)
      vitrina.classList.remove('desplegando')
      vitrina.style.height = ''
      vitrina.classList.toggle('plegada', !abierta)
      // Al cerrar desde abajo, la página se encoge por encima de quien lee:
      // se le deja delante el botón que acaba de pulsar, no otra sección.
      if (!abierta) boton.scrollIntoView({ block: 'nearest' })
    }

    function cambiar(abierta) {
      if (quieto()) {
        poner(abierta)
        if (!abierta) boton.scrollIntoView({ block: 'nearest' })
        return
      }
      const desde = vitrina.getBoundingClientRect().height
      poner(abierta)
      const hasta = vitrina.getBoundingClientRect().height

      // Al cerrar, el contenido tiene que seguir ahí mientras la tapa baja;
      // se pliega de verdad al llegar.
      vitrina.classList.remove('plegada')
      vitrina.style.height = `${desde}px`
      vitrina.classList.add('desplegando')
      void vitrina.offsetHeight
      vitrina.style.height = `${hasta}px`

      // Por si `transitionend` no llega —pestaña oculta, altura que no cambió—,
      // un temporizador cierra el viaje igual.
      clearTimeout(enCurso)
      enCurso = setTimeout(() => terminar(abierta), DURACION + 100)
      alLlegar = (evento) => {
        if (evento.target === vitrina && evento.propertyName === 'height') terminar(abierta)
      }
      vitrina.addEventListener('transitionend', alLlegar)
    }

    boton.addEventListener('click', () => {
      if (enCurso) return
      cambiar(vitrina.classList.contains('plegada'))
    })

    // Se abre ANTES de que el navegador salte al ancla: el clic llega primero
    // al script y el salto después, así que cae sobre la vitrina ya abierta.
    // Sin animación: quien llega por un enlace quiere ver el contenido, no la
    // tapa abriéndose.
    document.addEventListener('click', (evento) => {
      if (evento.target.closest(`a[href="#${vitrina.id}"]`)) poner(true)
    })
    if (location.hash === `#${vitrina.id}`) poner(true)
  }
}
