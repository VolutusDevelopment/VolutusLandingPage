/**
 * El configurador de Bisagra (bisagra.html). Los colores y el dibujo cambian
 * con CSS (`:has()` sobre los radios): sin JavaScript funciona igual. Esto
 * solo le responde al agente que use el formulario (`configurar_lampara`)
 * qué combinación quedó y cuánto cuesta, con lo elegido pasado por las
 * mismas reglas que si lo eligiera una persona.
 */

const COLORES = { rojo: ['roja', 'rojo'], azul: ['azul', 'azul'], amarillo: ['amarilla', 'amarillo'], negro: ['negra', 'negro'], crema: ['crema', 'crema'] }
const PRECIO = '$189.000'

function montarConfigurador() {
  const form = document.querySelector('form.configurador')
  if (!form) return

  form.addEventListener('submit', (evento) => {
    evento.preventDefault()
    if (!evento.agentInvoked) return
    const pantalla = COLORES[form.elements.pantalla.value]
    const base = COLORES[form.elements.base.value]
    evento.respondWith(
      Promise.resolve(
        pantalla && base
          ? `Lámpara Codo con pantalla ${pantalla[0]} y base ${base[0]}: ${PRECIO}, hecha en tres semanas. Bisagra es una marca inventada por Volutus para un boceto de página.`
          : 'La pantalla y la base van en rojo, azul, amarillo, negro o crema.'
      )
    )
  })
}

montarConfigurador()
