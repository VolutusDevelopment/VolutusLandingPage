// El visor de los bocetos del brief (el `<dialog>` de paginas/Brief.jsx): cada
// boceto a pantalla completa, en un iframe, con su reacción, su nota y el paso
// al anterior y al siguiente. Lo abre el arte de cada tarjeta de estilo y la
// invitación a recorrerlos, que empieza por el primero sin calificar.
//
// Lo que se envía es lo de la tarjeta (PreguntaBrief.jsx): el visor lo lee al
// mostrar cada boceto y, al marcar o escribir, lo copia a la tarjeta y avisa
// con el evento de siempre, así que guardar, contar y revisar siguen pasando
// por brief.js. Dentro del iframe, el boceto no repite su propia barra
// (public/brief/bocetos/barra.js).
//
// Sin `<dialog>` (Safari antes de 15.4) no se monta y el arte abre el boceto
// en otra pestaña, como sin JavaScript.

import { BOCETOS, rutaDeBoceto } from './lib/brief/bocetos.js'
import { campoBoceto, campoNotaBoceto } from './lib/brief/reglas.js'

export default function montarVisor(form) {
  const visor = document.querySelector('.brief-visor')
  if (!visor?.showModal) return

  const marco = visor.querySelector('.brief-visor-marco')
  const estilo = visor.querySelector('[data-visor-estilo]')
  const marca = visor.querySelector('[data-visor-marca]')
  const cuenta = visor.querySelector('[data-visor-cuenta]')
  const reacciones = [...visor.querySelectorAll('[name="visor-reaccion"]')]
  const nota = visor.querySelector('.brief-visor-nota')
  const siguiente = visor.querySelector('[data-paso="1"]')
  let actual = 0
  let abridor = null

  const slug = () => BOCETOS[actual].slug
  const radiosDeLaTarjeta = () => [...form.querySelectorAll(`input[name="${campoBoceto(slug())}"]`)]
  const notaDeLaTarjeta = () => form.elements.namedItem(campoNotaBoceto(slug()))
  const avisar = (control, tipo) => control.dispatchEvent(new Event(tipo, { bubbles: true }))

  // Lo de la tarjeta, en el visor. Calificado, «Siguiente» pasa a ser el
  // botón principal: es lo que toca.
  function leer() {
    const marcada = radiosDeLaTarjeta().find(({ checked }) => checked)?.value
    reacciones.forEach((opcion) => (opcion.checked = opcion.value === marcada))
    nota.value = notaDeLaTarjeta().value
    siguiente.classList.toggle('boton-primario', Boolean(marcada))
    siguiente.classList.toggle('boton-secundario', !marcada)
  }

  function mostrar(i) {
    actual = (i + BOCETOS.length) % BOCETOS.length
    const { slug: elegido, nombre, rubro, titulo, fondo } = BOCETOS[actual]
    visor.style.setProperty('--fondo-visor', fondo)
    marco.classList.add('cargando')
    marco.title = `Boceto de ${titulo}: ${nombre}, ${rubro}`
    marco.src = rutaDeBoceto(elegido)
    estilo.textContent = titulo
    marca.textContent = `${nombre} · ${rubro}`
    cuenta.textContent = `${actual + 1} de ${BOCETOS.length}`
    leer()
  }

  function abrir(i, desde) {
    abridor = desde
    mostrar(i)
    visor.showModal()
  }

  // El boceto aparece cuando terminó de cargar, con su barra ya escondida. Si
  // no está calificado, las reacciones saltan una vez: invitan a responder.
  marco.addEventListener('load', () => {
    marco.classList.remove('cargando')
    visor.classList.remove('invita')
    if (!radiosDeLaTarjeta().some(({ checked }) => checked) && marco.getAttribute('src') !== 'about:blank') {
      void visor.offsetWidth
      visor.classList.add('invita')
    }
  })

  // Las reacciones se desmarcan con otro toque, como en la tarjeta (brief.js).
  let yaMarcada = null
  visor.addEventListener('pointerdown', ({ target }) => {
    yaMarcada = reacciones.includes(target) && target.checked ? target : null
  })
  visor.addEventListener('click', ({ target }) => {
    if (target === yaMarcada) {
      target.checked = false
      avisar(target, 'change')
    }
    yaMarcada = null
  })

  visor.addEventListener('change', ({ target }) => {
    if (!reacciones.includes(target)) return
    const elegida = reacciones.find(({ checked }) => checked)?.value
    const radios = radiosDeLaTarjeta()
    radios.forEach((opcion) => (opcion.checked = opcion.value === elegida))
    avisar(radios[0], 'change')
    leer()
  })

  nota.addEventListener('input', () => {
    const enLaTarjeta = notaDeLaTarjeta()
    enLaTarjeta.value = nota.value
    avisar(enLaTarjeta, 'input')
  })

  visor.querySelector('[data-cerrar]').addEventListener('click', () => visor.close())
  for (const boton of visor.querySelectorAll('[data-paso]')) boton.addEventListener('click', () => mostrar(actual + Number(boton.dataset.paso)))

  // Las flechas del teclado pasan de boceto, salvo escribiendo la nota.
  visor.addEventListener('keydown', ({ key, target }) => {
    if (target === nota || !['ArrowLeft', 'ArrowRight'].includes(key)) return
    mostrar(actual + (key === 'ArrowRight' ? 1 : -1))
  })

  // Al cerrar, el iframe suelta el boceto y el foco vuelve adonde estaba.
  visor.addEventListener('close', () => {
    marco.src = 'about:blank'
    abridor?.focus()
  })

  // El arte de cada tarjeta abre su boceto aquí y ya no en otra pestaña.
  const artes = form.querySelectorAll('[data-visor]')
  for (const arte of artes) {
    arte.setAttribute('aria-haspopup', 'dialog')
    arte.querySelector('[data-otra-pestana]')?.remove()
    arte.addEventListener('click', (evento) => {
      if (evento.metaKey || evento.ctrlKey || evento.shiftKey) return
      evento.preventDefault()
      abrir(
        BOCETOS.findIndex((boceto) => boceto.slug === arte.dataset.visor),
        arte
      )
    })
  }

  // La invitación a recorrerlos dice cuántos van y retoma donde se quedó.
  const recorrer = form.querySelector('.brief-recorrer')
  const llevas = recorrer.querySelector('[data-recorrer-cuenta]')
  const accion = recorrer.querySelector('[data-recorrer-texto]')
  const calificado = (cual) => form.querySelector(`input[name="${campoBoceto(cual)}"]:checked`)
  const total = BOCETOS.length

  function contar() {
    const n = BOCETOS.filter(({ slug: cual }) => calificado(cual)).length
    llevas.textContent = n === 0 ? `Son ${total}, y toma unos minutos` : n === total ? `Calificaste los ${total}` : `Llevas ${n} de ${total}: te faltan ${total - n}`
    accion.textContent = n === 0 ? 'Empezar el recorrido' : n === total ? 'Verlos de nuevo' : 'Seguir donde quedé'
  }

  recorrer.querySelector('[data-recorrer]').addEventListener('click', ({ currentTarget }) => {
    abrir(Math.max(0, BOCETOS.findIndex(({ slug: cual }) => !calificado(cual))), currentTarget)
  })
  form.addEventListener('change', contar)
  form.addEventListener('reset', () => setTimeout(contar))
  addEventListener('storage', contar)
  contar()
  recorrer.hidden = false
}
