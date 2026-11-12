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
 * Dentro del visor del brief (un iframe del mismo sitio, src/brief-visor.js)
 * la barra no va: el visor ya dice qué es y deja calificarlo. El visor muestra
 * el boceto recién al cargar, cuando esto ya corrió, así que no asoma.
 *
 * También hace lo que comparten los bocetos al bajar: marca con `visto` lo que
 * tiene `data-aparece` al verse (donde el navegador no ata animaciones al
 * scroll, eso dispara su entrada: barra.css), y lo que tiene `data-cuenta`
 * cuenta hasta su número.
 *
 * Y lo que los bocetos no pueden hacer solos, porque la política de contenido
 * no deja scripts en línea: los formularios de muestra (`form[data-muestra]`)
 * avisan que no envían nada, también al agente que los use; los que solo
 * consultan algo de la página (`form[data-consulta]`, como el rastreador de
 * lotes de Libar) le responden al agente lo que quedó a la vista, y el
 * deslizador del antes y después (`input[data-comparar]`) mueve su corte
 * (`--corte`).
 *
 * Los videos en bucle (`video[data-bucle]`, los «gifs» de los bocetos) bajan
 * recién cuando están por verse, corren solo mientras se ven y, con el
 * movimiento reducido, no bajan: queda la foto quieta que llevan detrás. Y el
 * alto de la barra queda en `--alto-barra`, para que lo que se pega arriba
 * quede bajo ella.
 */

const CLAVE = 'volutus:brief:bocetos'
const REACCIONES = [
  ['no', 'No me gusta', '✕'],
  ['medio', 'Más o menos', '~'],
  ['si', 'Me gusta', '♥'],
]
const LARGO_DE_LA_NOTA = 200
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches

const enElVisor = window.self !== window.top

document.documentElement.classList.add('con-js')
if (enElVisor) document.documentElement.classList.add('en-visor')

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

// Los formularios de un boceto son de muestra: se llenan, pero al enviarlos
// solo avisan que no salió nada. Su aviso (`.boceto-aviso`) tiene su lugar
// reservado en el CSS, así que aparecer no mueve la página.
function montarMuestras() {
  const AVISO = 'Es un boceto: no se envió nada.'
  for (const form of document.querySelectorAll('form[data-muestra]')) {
    let aviso = form.querySelector('.boceto-aviso')
    if (!aviso) {
      aviso = document.createElement('p')
      aviso.className = 'boceto-aviso'
      form.append(aviso)
    }
    aviso.setAttribute('role', 'status')
    form.addEventListener('submit', (evento) => {
      evento.preventDefault()
      aviso.textContent = AVISO
      if (evento.agentInvoked)
        evento.respondWith(Promise.resolve(`${AVISO} La marca es inventada por Volutus para mostrar un estilo de página.`))
    })
  }
}

// Un formulario de consulta cambia la página con CSS (`:has()`) y no envía
// nada. Al agente le responde el texto de sus `[data-respuesta]` visibles:
// `checkVisibility` existe en Chrome, el único navegador con WebMCP.
function montarConsultas() {
  for (const form of document.querySelectorAll('form[data-consulta]')) {
    form.addEventListener('submit', (evento) => {
      evento.preventDefault()
      if (!evento.agentInvoked) return
      const vistas = [...form.querySelectorAll('[data-respuesta]')].filter((respuesta) => respuesta.checkVisibility())
      evento.respondWith(Promise.resolve(vistas.map((respuesta) => respuesta.innerText.trim()).join('\n') || 'No hay nada que mostrar.'))
    })
  }
}

function montarComparadores() {
  for (const control of document.querySelectorAll('input[data-comparar]')) {
    const marco = control.closest('[data-comparar-marco]')
    if (!marco) continue
    const mover = () => marco.style.setProperty('--corte', `${control.value}%`)
    control.addEventListener('input', mover)
    mover()
  }
}

// El alto de la barra, para las cabeceras que se pegan arriba (`top:
// var(--alto-barra, 0px)`). En el visor no hay barra y queda en cero.
function medirBarra() {
  const barra = document.querySelector('.boceto-barra')
  if (!barra || enElVisor || !('ResizeObserver' in window)) return
  new ResizeObserver(([{ target }]) => {
    document.documentElement.style.setProperty('--alto-barra', `${target.offsetHeight}px`)
  }).observe(barra)
}

// Un video en bucle lleva su fuente en `data-src` y una foto quieta detrás.
// Baja a una pantalla de verse, corre mientras se ve y se detiene fuera de
// ella, con la pestaña oculta o con la página en espera en el visor. Al
// arrancar se le pone `andando`, y el CSS del boceto lo funde sobre su foto.
function montarVideos() {
  const videos = document.querySelectorAll('video[data-bucle]')
  if (quieto || !videos.length || !('IntersectionObserver' in window)) return
  const raiz = document.documentElement
  const vistos = new Set()
  const puede = () => !document.hidden && !raiz.classList.contains('en-espera')
  const seguir = () => {
    for (const video of videos) {
      if (vistos.has(video) && puede()) video.play().catch(() => {})
      else video.pause()
    }
  }
  const cerca = new IntersectionObserver(
    (entradas) => {
      for (const { isIntersecting, target } of entradas) {
        if (!isIntersecting) continue
        cerca.unobserve(target)
        target.src = target.dataset.src
      }
      seguir()
    },
    { rootMargin: '100% 0px' }
  )
  const enPantalla = new IntersectionObserver((entradas) => {
    for (const { isIntersecting, target } of entradas) {
      if (isIntersecting) vistos.add(target)
      else vistos.delete(target)
    }
    seguir()
  })
  for (const video of videos) {
    Object.assign(video, { muted: true, loop: true, playsInline: true })
    video.addEventListener('playing', () => video.classList.add('andando'), { once: true })
    cerca.observe(video)
    enPantalla.observe(video)
  }
  document.addEventListener('visibilitychange', seguir)
  new MutationObserver(seguir).observe(raiz, { attributes: true, attributeFilter: ['class'] })
}

if (!enElVisor) montarBarra()
medirBarra()
montarVideos()
montarEntradas()
montarMuestras()
montarConsultas()
montarComparadores()
