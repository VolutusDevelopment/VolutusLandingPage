/**
 * La barra de los bocetos del brief (/brief/bocetos/*). Cada boceto trae, a la
 * vista y sin JavaScript, el aviso de que es un boceto de una marca inventada
 * (`.boceto-barra`). Este script le suma el formulario para calificarlo: lo
 * que se marca se guarda en este equipo, bajo la misma clave que lee el brief
 * (src/brief.js), que lo muestra en la tarjeta del boceto y lo envía.
 *
 * Es un `<form>` anotado para WebMCP: un agente puede calificar el boceto, y
 * como no le envía nada a nadie, lleva `toolautosubmit`.
 *
 * También hace lo que comparten los bocetos al bajar: lo que tiene
 * `data-aparece` entra al verse, y lo que tiene `data-cuenta` cuenta hasta su
 * número.
 */

const CLAVE = 'volutus:brief:bocetos'
const REACCIONES = [
  ['si', 'Me gusta', '♥'],
  ['medio', 'Más o menos', '~'],
  ['no', 'No me gusta', '✕'],
]
const LARGO_DE_LA_NOTA = 200
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches

document.documentElement.classList.add('con-js')

const leer = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) || '{}') || {}
  } catch {
    return {}
  }
}

const escribir = (todos) => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(todos))
    return true
  } catch {
    return false
  }
}

function montarBarra() {
  const barra = document.querySelector('.boceto-barra')
  const boceto = document.body.dataset.boceto
  if (!barra || !boceto) return

  const form = document.createElement('form')
  form.className = 'boceto-calificar'
  form.setAttribute('toolname', 'calificar_boceto')
  form.setAttribute(
    'tooldescription',
    'Guarda en el brief de Volutus si a la persona le gusta este boceto de página (una marca inventada para mostrar un estilo) y por qué. No envía nada: queda en este equipo y aparece en su brief. Responde lo que quedó guardado.'
  )
  form.setAttribute('toolautosubmit', '')

  const grupo = document.createElement('fieldset')
  grupo.className = 'boceto-reacciones'
  grupo.setAttribute('toolparamdescription', 'Qué le parece el boceto: si (me gusta), medio (más o menos) o no (no me gusta)')
  const leyenda = document.createElement('legend')
  leyenda.textContent = '¿Te gusta este boceto?'
  grupo.append(leyenda)
  for (const [valor, texto, signo] of REACCIONES) {
    const etiqueta = document.createElement('label')
    etiqueta.className = valor
    const opcion = document.createElement('input')
    Object.assign(opcion, { type: 'radio', name: 'reaccion', value: valor })
    const icono = document.createElement('span')
    icono.setAttribute('aria-hidden', 'true')
    icono.textContent = signo
    etiqueta.append(opcion, icono, texto)
    grupo.append(etiqueta)
  }

  const nota = document.createElement('input')
  Object.assign(nota, {
    type: 'text',
    name: 'nota',
    className: 'boceto-nota',
    maxLength: LARGO_DE_LA_NOTA,
    placeholder: '¿Por qué? (opcional)',
    autocomplete: 'off',
  })
  nota.setAttribute('aria-label', 'Qué te gustó o qué no de este boceto')
  nota.setAttribute('toolparamdescription', 'Lo que le gustó o no del boceto, en una frase')

  const estado = document.createElement('span')
  estado.className = 'boceto-guardado'
  estado.setAttribute('role', 'status')

  form.append(grupo, nota, estado)
  barra.append(form)

  const guardado = leer()[boceto]
  if (guardado) {
    const elegida = form.querySelector(`input[value="${guardado.reaccion}"]`)
    if (elegida) elegida.checked = true
    nota.value = guardado.nota ?? ''
  }

  // Lo que se guarda pasa por las mismas reglas venga de una persona o de un
  // agente: una reacción conocida y una nota corta, sin espacios de sobra.
  function guardar() {
    const reaccion = form.elements.reaccion.value
    if (!REACCIONES.some(([valor]) => valor === reaccion)) return null
    const texto = nota.value.trim().slice(0, LARGO_DE_LA_NOTA)
    const todos = leer()
    todos[boceto] = { reaccion, nota: texto, fecha: Date.now() }
    estado.textContent = escribir(todos) ? '✓ Guardado en tu brief' : 'Este navegador no deja guardar'
    return todos[boceto]
  }

  let espera
  form.addEventListener('change', guardar)
  nota.addEventListener('input', () => {
    clearTimeout(espera)
    espera = setTimeout(guardar, 400)
  })
  form.addEventListener('submit', (evento) => {
    evento.preventDefault()
    const listo = guardar()
    if (evento.agentInvoked) {
      const nombre = REACCIONES.find(([valor]) => valor === listo?.reaccion)?.[1]
      evento.respondWith(
        Promise.resolve(listo ? `Guardado en el brief: ${nombre}${listo.nota ? `, «${listo.nota}»` : ''}.` : 'Falta elegir una reacción: si, medio o no.')
      )
    }
  })
}

function montarEntradas() {
  const aparecen = document.querySelectorAll('[data-aparece]')
  const cuentan = document.querySelectorAll('[data-cuenta]')
  if (!('IntersectionObserver' in window)) {
    aparecen.forEach((elemento) => elemento.classList.add('visto'))
    return
  }

  const contar = (elemento) => {
    const final = Number(elemento.dataset.cuenta)
    const decimales = Number(elemento.dataset.decimales ?? 0)
    const formato = new Intl.NumberFormat('es-CL', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })
    if (quieto || !Number.isFinite(final)) return
    const inicio = performance.now()
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / 1400)
      elemento.textContent = formato.format(final * (1 - (1 - t) ** 3))
      if (t < 1) requestAnimationFrame(paso)
    }
    requestAnimationFrame(paso)
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const { isIntersecting, target } of entradas) {
        if (!isIntersecting) continue
        observador.unobserve(target)
        if (target.dataset.cuenta) contar(target)
        else target.classList.add('visto')
      }
    },
    { threshold: 0.15 }
  )
  aparecen.forEach((elemento) => observador.observe(elemento))
  cuentan.forEach((elemento) => observador.observe(elemento))
}

montarBarra()
montarEntradas()
