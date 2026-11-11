/**
 * El filtro de la ludoteca de Tablero (tablero.html). El filtro mismo es CSS
 * (`:has()` sobre los radios): sin JavaScript, el estante igual se ordena al
 * elegir. Esto solo le responde al agente que use el formulario
 * (`filtrar_juegos`) qué juegos de la muestra calzan, con lo elegido pasado
 * por las mismas reglas que si lo eligiera una persona.
 */

const JUGADORES = { todos: 'cualquier número de jugadores', 2: '2 jugadores', 34: '3 a 4 jugadores', 5: '5 o más jugadores' }
const DURACIONES = { todas: 'cualquier duración', corto: 'menos de 30 minutos', medio: '30 a 60 minutos', largo: 'más de una hora' }

function montarFiltro() {
  const form = document.querySelector('form.filtro')
  if (!form) return
  const lomos = [...document.querySelectorAll('.estante .lomo')]

  form.addEventListener('submit', (evento) => {
    evento.preventDefault()
    const jugadores = form.elements.jugadores.value
    const duracion = form.elements.duracion.value
    if (!(jugadores in JUGADORES) || !(duracion in DURACIONES)) {
      if (evento.agentInvoked) evento.respondWith(Promise.resolve('Jugadores va en todos, 2, 34 o 5, y duración en todas, corto, medio o largo.'))
      return
    }
    if (!evento.agentInvoked) return
    const calzan = lomos
      .filter((lomo) => jugadores === 'todos' || lomo.dataset.j.split(' ').includes(jugadores))
      .filter((lomo) => duracion === 'todas' || lomo.dataset.d === duracion)
      .map((lomo) => {
        const small = lomo.querySelector('small')
        return `${lomo.querySelector('b').textContent} (${small.firstChild.textContent} jugadores, ${small.lastChild.textContent.replace('′', ' min')})`
      })
    evento.respondWith(
      Promise.resolve(
        `Para ${JUGADORES[jugadores]} y ${DURACIONES[duracion]}, calzan ${calzan.length} juegos de la muestra: ${calzan.join('; ')}. Tablero es una marca inventada por Volutus para un boceto de página.`
      )
    )
  })
}

montarFiltro()
