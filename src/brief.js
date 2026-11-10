// El brief para clientes (paginas/Brief.jsx). client.js lo descarga solo en
// su página.
//
// El HTML ya hace lo principal: cada paso es un ancla, el CSS muestra la del
// ancla de la dirección (`:target`) y el «atrás» del navegador retrocede un
// paso. Aquí va lo que un formulario largo necesita además:
//
// - guardar las respuestas en el equipo mientras se escriben, y recuperarlas
//   si la persona cierra la pestaña o se le apaga el teléfono;
// - poner el foco en cada paso al llegar, decir dónde se está y llenar la
//   barra con el scroll de la parte;
// - los topes de «elige hasta 3», con su cuenta;
// - que Enter en un campo avance en vez de enviar a medias;
// - pedir los dos datos obligatorios donde están;
// - traer lo que se calificó en los bocetos, que se abren en otra pestaña;
// - la revisión: cuánto hay en cada área, lo que más sirve y falta, lo que no
//   calza (lib/brief/revision.js) y el resumen; y el envío con su salida si
//   falla.
//
// Las preguntas no están aquí: se leen del formulario, con el `data-etiqueta`
// de cada control.

import { CORREO_VALIDO, NOMBRE_VALIDO } from './lib/contacto.js'
import {
  CLAVE_BOCETOS,
  ERRORES_BRIEF,
  LIMITES_BRIEF,
  REACCIONES,
  TELEFONO_VALIDO,
  TURNSTILE_ACCION_BRIEF,
  campoBoceto,
  campoNotaBoceto,
} from './lib/brief/reglas.js'
import { incoherencias } from './lib/brief/revision.js'
import { montarTurnstile } from './lib/turnstile.js'

// Lo que no es una respuesta y no se guarda.
const NO_SE_GUARDA = new Set(['hp_campo', 'cf-turnstile-response', 'dispositivo', 'pantalla', 'zona', 'idioma', 'transcurrido'])

const CLAVE_DEL_DISPOSITIVO = 'volutus:dispositivo'

// Las respuestas guardadas. Si las preguntas cambian de forma, sube la versión
// y lo guardado antes se ignora en vez de rellenar campos equivocados.
const CLAVE = 'volutus:brief:v2'

const FALLO =
  'No pudimos enviar tu brief. Tus respuestas siguen guardadas en este equipo: reintenta en un momento, o cópialas y mándalas por correo.'

// El almacenamiento del navegador puede no estar (modo privado, cookies
// bloqueadas): nada de esto debe romper el formulario.
const almacen = {
  leer(clave) {
    try {
      return localStorage.getItem(clave)
    } catch {
      return null
    }
  },
  escribir(clave, valor) {
    try {
      localStorage.setItem(clave, valor)
      return true
    } catch {
      return false
    }
  },
  borrar(clave) {
    try {
      localStorage.removeItem(clave)
    } catch {
      // Sin almacenamiento no hay nada que borrar.
    }
  },
}

const nuevo = (etiqueta, clase, texto) => {
  const elemento = document.createElement(etiqueta)
  if (clase) elemento.className = clase
  if (texto) elemento.textContent = texto
  return elemento
}

const fechaLegible = (ms) =>
  new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(ms)

// La pregunta de un contenedor `[data-pregunta]`, sin el «(obligatorio)».
const preguntaDe = (contenedor) => contenedor.querySelector(':scope > legend, :scope > label').firstChild.textContent

// Lo respondido en una pregunta, en palabras. Vacío si no tiene nada.
function respuestaDe(contenedor) {
  const valor = (campo) => campo.value.trim()

  const bocetos = contenedor.querySelectorAll('[data-boceto]')
  if (bocetos.length)
    return [...bocetos]
      .map((boceto) => {
        const reaccion = boceto.querySelector('input:checked')?.dataset.etiqueta
        const nota = valor(boceto.querySelector('.brief-boceto-nota'))
        return (reaccion || nota) && `${boceto.querySelector('legend').textContent}: ${[reaccion, nota].filter(Boolean).join(' — ')}`
      })
      .filter(Boolean)
      .join('\n')

  const frase = contenedor.querySelector('.brief-frase')
  if (frase) {
    if (![...frase.querySelectorAll('input')].some(valor)) return ''
    return [...frase.childNodes].map((nodo) => (nodo.nodeType === Node.TEXT_NODE ? nodo.textContent : valor(nodo.querySelector('input')) || '___')).join('')
  }

  const filas = contenedor.querySelectorAll('.brief-tabla-fila')
  if (filas.length)
    return [...filas]
      .map((fila) => [...fila.querySelectorAll('input')].filter(valor).map((campo) => `${campo.dataset.etiqueta}: ${valor(campo)}`).join(' · '))
      .filter(Boolean)
      .join('\n')

  const partes = []
  for (const campo of contenedor.querySelectorAll('input[name], textarea')) {
    if (campo.closest('.brief-estrella')) continue
    if (campo.type === 'checkbox' || campo.type === 'radio') {
      const estrella = campo.closest('.brief-tarjeta')?.querySelector('.brief-estrella input:checked')
      if (campo.checked) partes.push(campo.dataset.etiqueta + (estrella ? ' ★' : ''))
    } else if (valor(campo)) {
      partes.push(campo.closest('.brief-otro, .brief-color') ? `${campo.dataset.etiqueta}: ${valor(campo)}` : valor(campo))
    }
  }
  return partes.join(', ')
}

export default function iniciarBrief(form) {
  const clave = CLAVE
  const pantallas = [...form.querySelectorAll('.brief-pantalla')]
  const pasos = pantallas.filter(({ id }) => id.startsWith('paso-'))
  const indice = [...form.querySelectorAll('.brief-indice a')]
  const guia = form.querySelector('.brief-guia')
  const donde = form.querySelector('.brief-donde-texto')
  const dondeArea = form.querySelector('.brief-donde-area')
  const progreso = form.querySelector('.brief-progreso')
  const guardadoVisible = form.querySelector('.brief-guardado')
  const comenzar = document.querySelectorAll('[data-comenzar]')
  const anuncio = form.querySelector('.brief-anuncio')
  const medidores = form.querySelector('.brief-medidores')
  const alertas = form.querySelector('.brief-alertas')
  const resumen = form.querySelector('.brief-resumen')
  const fallo = form.querySelector('.brief-fallo')
  const boton = form.querySelector('.brief-enviar')
  const aviso = document.querySelector('.brief-aviso')
  const enviado = document.querySelector('.brief-enviado')
  const campo = (nombre) => form.elements.namedItem(nombre)
  const turnstile = montarTurnstile(form, TURNSTILE_ACCION_BRIEF)

  const guardado = JSON.parse(almacen.leer(clave) || 'null')
  // Cuándo empezó (al abrir la página por primera vez): lo que tarda en
  // llenarse va en el correo, y un envío en menos de 8 s el Worker lo toma por
  // un robot (worker/brief.js). Viaja lo transcurrido y no la hora, medido con
  // el mismo reloj: un equipo con la hora mal puesta no cambia la cuenta.
  let inicio = guardado?.inicio ?? Date.now()
  let pendiente = false
  let terminado = false
  let espera
  let esperaDelGuardado
  // Al enviar con un dato malo, el foco va a ese campo y no al título del paso.
  let enfocarAlLlegar = null

  // ---- Guardar y recuperar ----

  function respuestas() {
    const todas = {}
    for (const [nombre, valor] of new FormData(form)) {
      if (NO_SE_GUARDA.has(nombre) || valor === '') continue
      ;(todas[nombre] ??= []).push(valor)
    }
    return todas
  }

  function guardar() {
    clearTimeout(espera)
    pendiente = false
    if (terminado) return
    const paso = pantallas.find(({ id }) => `#${id}` === location.hash)?.id ?? 'inicio'
    const listo = almacen.escribir(clave, JSON.stringify({ respuestas: respuestas(), paso, inicio, fecha: Date.now() }))
    if (!listo) {
      mostrarAviso('Este navegador no deja guardar tus respuestas (¿modo privado?). No cierres la página hasta enviar.', false)
      return
    }
    // Lo dice a la vista, sin anunciarlo: cada pocas letras sería ruido.
    guardadoVisible.textContent = '✓ Guardado'
    guardadoVisible.classList.add('recien')
    clearTimeout(esperaDelGuardado)
    esperaDelGuardado = setTimeout(() => {
      guardadoVisible.textContent = 'Se guarda solo'
      guardadoVisible.classList.remove('recien')
    }, 1800)
  }

  function guardarPronto() {
    pendiente = true
    clearTimeout(espera)
    espera = setTimeout(guardar, 300)
  }

  // Al cerrar o esconder la pestaña no se espera: es la última oportunidad.
  addEventListener('pagehide', () => pendiente && guardar())
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && pendiente && guardar())

  function rellenar(todas) {
    for (const control of form.elements) {
      if (!control.name || NO_SE_GUARDA.has(control.name)) continue
      if (control.type === 'checkbox' || control.type === 'radio') control.checked = (todas[control.name] ?? []).includes(control.value)
      else control.value = todas[control.name]?.[0] ?? ''
    }
  }

  function mostrarAviso(texto, conAcciones = true) {
    aviso.querySelector('.brief-aviso-texto').textContent = texto
    aviso.querySelector('.brief-aviso-acciones').hidden = !conAcciones
    aviso.hidden = false
  }

  // «Empezar de nuevo» pide un segundo toque: borra todo y no se deshace.
  const borrar = aviso.querySelector('[data-borrar]')
  let confirmar
  borrar.addEventListener('click', () => {
    if (!confirmar) {
      borrar.textContent = 'Toca otra vez para borrar todo'
      confirmar = setTimeout(() => {
        confirmar = undefined
        borrar.textContent = 'Empezar de nuevo'
      }, 4000)
      return
    }
    clearTimeout(confirmar)
    confirmar = undefined
    borrar.textContent = 'Empezar de nuevo'
    almacen.borrar(clave)
    almacen.borrar(CLAVE_BOCETOS)
    form.reset()
    inicio = Date.now()
    aviso.hidden = true
    actualizar()
    location.hash = '#paso-1'
  })

  aviso.querySelector('[data-seguir]').addEventListener('click', () => (aviso.hidden = true))

  // ---- Topes, estrellas y radios que se desmarcan ----

  const conTope = [...form.querySelectorAll('[data-max]')]

  function aplicarTopes() {
    for (const grupo of conTope) {
      const casillas = [...grupo.querySelectorAll(`input[name="${grupo.dataset.pregunta}"]`)]
      const marcadas = casillas.filter(({ checked }) => checked).length
      casillas.forEach((casilla) => (casilla.disabled = !casilla.checked && marcadas >= Number(grupo.dataset.max)))
      grupo.querySelector('.brief-cuenta-n').textContent = marcadas
      grupo.querySelector('.brief-cuenta').classList.toggle('lleno', marcadas >= Number(grupo.dataset.max))
    }
  }

  // ---- Los bocetos: lo calificado aquí y en su pestaña es lo mismo ----
  //
  // Cada boceto guarda su calificación bajo `CLAVE_BOCETOS`
  // (public/brief/bocetos/barra.js), aparte de las respuestas: así el brief,
  // al guardar, no pisa lo que se marcó en otra pestaña. Lo que llega de ahí
  // se acepta solo con su forma: una reacción conocida y una nota corta.

  const bocetosGuardados = () => {
    try {
      return JSON.parse(almacen.leer(CLAVE_BOCETOS) || '{}') || {}
    } catch {
      return {}
    }
  }

  function traerBocetos() {
    for (const [slug, guardado] of Object.entries(bocetosGuardados())) {
      const nota = campo(campoNotaBoceto(slug))
      if (!nota) continue
      for (const opcion of form.querySelectorAll(`input[name="${campoBoceto(slug)}"]`)) opcion.checked = opcion.value === guardado?.reaccion
      nota.value = typeof guardado?.nota === 'string' ? guardado.nota.slice(0, LIMITES_BRIEF.nota) : ''
    }
  }

  function llevarBoceto(control) {
    const boceto = control.closest('[data-boceto]')
    if (!boceto) return
    const { boceto: slug } = boceto.dataset
    const reaccion = boceto.querySelector('input[type="radio"]:checked')?.value
    const nota = campo(campoNotaBoceto(slug)).value.trim()
    const todos = bocetosGuardados()
    if (REACCIONES.some(([valor]) => valor === reaccion) || nota) todos[slug] = { reaccion, nota, fecha: Date.now() }
    else delete todos[slug]
    almacen.escribir(CLAVE_BOCETOS, JSON.stringify(todos))
  }

  // Lo que se califica en el boceto, con el brief abierto en otra pestaña.
  addEventListener('storage', ({ key }) => {
    if (key !== CLAVE_BOCETOS) return
    traerBocetos()
    actualizar()
    guardarPronto()
  })

  // La estrella de «imprescindible» elige también el bloque, y desmarcar el
  // bloque le quita la estrella.
  function alinearEstrella(control) {
    const tarjeta = control.closest('.brief-tarjeta')
    const estrella = tarjeta?.querySelector('.brief-estrella input')
    if (!estrella) return
    const opcion = tarjeta.querySelector('.brief-opcion input')
    if (control === estrella && estrella.checked) opcion.checked = true
    if (control === opcion && !opcion.checked) estrella.checked = false
  }

  // Todo es opcional, así que un radio marcado por error se desmarca con otro
  // toque. El radio nativo no lo permite: se recuerda si ya estaba marcado.
  let radioMarcado = null
  form.addEventListener('pointerdown', ({ target }) => {
    radioMarcado = target.type === 'radio' && target.checked ? target : null
  })
  form.addEventListener('click', ({ target }) => {
    if (target === radioMarcado) {
      target.checked = false
      target.dispatchEvent(new Event('change', { bubbles: true }))
    }
    radioMarcado = null
  })

  // ---- Los colores: el selector escribe el código en el texto ----

  const sincronizadores = [...form.querySelectorAll('[data-color]')].map((selector) => {
    const texto = document.getElementById(selector.dataset.color)
    selector.hidden = false
    selector.addEventListener('input', () => {
      texto.value = selector.value
      guardarPronto()
    })
    const sincronizar = () => {
      if (/^#[0-9a-f]{6}$/i.test(texto.value.trim())) selector.value = texto.value.trim()
    }
    texto.addEventListener('input', sincronizar)
    return sincronizar
  })

  // ---- Los obligatorios: el nombre y una forma de responder ----

  function marcar(control, error) {
    const mensaje = document.getElementById(`error-${control.name}`)
    control.setAttribute('aria-invalid', String(Boolean(error)))
    if (error) mensaje.textContent = error
    mensaje.hidden = !error
  }

  // Devuelve el primer campo con problema, o nada si están bien.
  function validarContacto() {
    const [nombre, correo, telefono] = ['nombre', 'correo', 'telefono'].map(campo)
    const [n, c, t] = [nombre, correo, telefono].map(({ value }) => value.trim())
    marcar(nombre, !n ? ERRORES_BRIEF.nombre : !NOMBRE_VALIDO.test(n) && ERRORES_BRIEF.nombreInvalido)
    marcar(correo, c ? !CORREO_VALIDO.test(c) && ERRORES_BRIEF.correoInvalido : !t && ERRORES_BRIEF.contacto)
    marcar(telefono, t && !TELEFONO_VALIDO.test(t) && ERRORES_BRIEF.telefonoInvalido)
    return [nombre, correo, telefono].find((control) => control.getAttribute('aria-invalid') === 'true')
  }

  // ---- Dónde estoy ----

  const pantallaActual = () => pantallas.find(({ id }) => `#${id}` === location.hash) ?? pantallas[0]
  const nombreDeArea = (area) => form.querySelector(`.brief-grupo.brief-area-${area} .brief-grupo-lomo span`)?.textContent ?? ''

  function actualizar() {
    aplicarTopes()
    sincronizadores.forEach((sincronizar) => sincronizar())
    pasos.forEach((paso, i) => {
      const respondido = [...paso.querySelectorAll('[data-pregunta]')].some((pregunta) => respuestaDe(pregunta))
      indice[i].classList.toggle('respondido', respondido)
    })
  }

  // La barra mide la parte en que se está: cuánto de ella ya pasó por la
  // pantalla. Arriba de la parte, vacía; al llegar a su final, llena. Al
  // cambiar de parte vuelve a empezar, porque la página sube a la nueva.
  let midiendo = false
  function medirAvance() {
    midiendo = false
    const caja = pantallaActual().getBoundingClientRect()
    const recorrido = caja.height - innerHeight
    const avance = recorrido <= 0 ? 1 : Math.min(1, Math.max(0, -caja.top / recorrido))
    progreso.style.setProperty('--avance', avance.toFixed(3))
  }
  const medirPronto = () => {
    if (midiendo) return
    midiendo = true
    requestAnimationFrame(medirAvance)
  }
  addEventListener('scroll', medirPronto, { passive: true })
  addEventListener('resize', medirPronto, { passive: true })

  function mostrar(enfocar) {
    const pantalla = pantallaActual()
    const n = pasos.indexOf(pantalla)
    const titulo = pantalla.querySelector('h2').textContent
    const parte = n >= 0 ? `Parte ${n + 1} de ${pasos.length}` : pantalla.id === 'revisar' ? 'Revisar y enviar' : 'El recorrido'
    const { area } = pantalla.dataset
    const texto = n >= 0 ? `${nombreDeArea(area)}, ${parte}: ${titulo}` : parte
    donde.textContent = parte
    dondeArea.textContent = area ? nombreDeArea(area) : ''
    dondeArea.hidden = !area
    for (const otra of ['marca', 'diseno']) guia.classList.toggle(`brief-area-${otra}`, otra === area)
    indice.forEach((enlace) =>
      enlace.getAttribute('href') === `#${pantalla.id}` ? enlace.setAttribute('aria-current', 'step') : enlace.removeAttribute('aria-current')
    )

    if (pantalla.id === 'revisar') {
      armarRevision()
      turnstile.montar()
    }

    if (enfocar) {
      anuncio.textContent = texto
      ;(enfocarAlLlegar ?? pantalla.querySelector('h2')).focus({ preventScroll: !enfocarAlLlegar })
      enfocarAlLlegar = null
    }
    medirAvance()
  }

  // ---- La revisión ----
  //
  // Primero cuánto hay en cada área y si están los obligatorios; después lo
  // que más nos sirve y quedó vacío, y lo que no calza entre respuestas, cada
  // cosa con un enlace a su pregunta; al final el resumen, parte por parte,
  // con solo lo respondido y lo vacío plegado.

  // Los avisos que la persona ya vio y dejó así, mientras la página esté abierta.
  const dejados = new Set()

  const preguntaPorId = (id) => form.querySelector(`[data-pregunta="${id}"]`)
  const pasoDe = (pregunta) => pregunta.closest('.brief-pantalla')
  const figuraDe = (area) => form.querySelector(`.brief-grupo.brief-area-${area} .brief-figura`).cloneNode(true)

  // Un enlace que lleva a una pregunta y deja el cursor en ella.
  function enlaceA(pregunta, texto) {
    const enlace = nuevo('a', '', texto)
    enlace.href = `#${pasoDe(pregunta).id}`
    enlace.dataset.irA = pregunta.dataset.pregunta
    return enlace
  }

  form.addEventListener('click', ({ target }) => {
    const enlace = target.closest('[data-ir-a]')
    if (enlace) enfocarAlLlegar = preguntaPorId(enlace.dataset.irA)?.querySelector('input:not([type="hidden"]):not(:disabled), textarea')
  })

  function medidor(area, respondidas, total, detalle) {
    const caja = nuevo('div', `brief-medidor brief-area-${area}`)
    const figuras = nuevo('span', 'brief-medidor-figura')
    const base = figuraDe(area)
    base.classList.add('base')
    const llena = figuraDe(area)
    llena.classList.add('llena')
    figuras.style.setProperty('--lleno', total ? respondidas / total : 1)
    figuras.append(base, llena)
    const texto = nuevo('div')
    texto.append(nuevo('b', '', `${respondidas} de ${total}`), nuevo('span', '', detalle))
    caja.append(figuras, texto)
    return caja
  }

  function armarMedidores() {
    const contacto = ['nombre', 'correo', 'telefono'].map((nombre) => campo(nombre).value.trim())
    const obligatorios = Number(Boolean(contacto[0])) + Number(Boolean(contacto[1] || contacto[2]))
    const listos = obligatorios === 2
    const deLosObligatorios = nuevo('div', `brief-medidor ${listos ? 'brief-medidor-listo' : 'brief-medidor-falta'}`)
    const texto = nuevo('div')
    texto.append(
      nuevo('b', '', `${obligatorios} de 2`),
      nuevo('span', '', listos ? 'Obligatorios listos: ya puedes enviarlo.' : 'Falta tu nombre o una forma de responderte.')
    )
    deLosObligatorios.append(nuevo('span', 'brief-medidor-marca', listos ? '✓' : '!'), texto)

    medidores.replaceChildren(
      ...['marca', 'diseno'].map((area) => {
        const preguntas = pasos.filter(({ dataset }) => dataset.area === area).flatMap((paso) => [...paso.querySelectorAll('[data-pregunta]')])
        const respondidas = preguntas.filter((pregunta) => respuestaDe(pregunta)).length
        const partes = pasos.map((paso, i) => paso.dataset.area === area && i + 1).filter(Boolean)
        return medidor(area, respondidas, preguntas.length, `${nombreDeArea(area)} · partes ${partes[0]} a ${partes.at(-1)}`)
      }),
      deLosObligatorios
    )
  }

  function armarAlertas() {
    const cajas = []

    const faltan = [...form.querySelectorAll('[data-pregunta][data-clave]')].filter((pregunta) => !respuestaDe(pregunta))
    if (faltan.length) {
      const caja = nuevo('section', 'brief-alerta')
      const titulo = nuevo('h3', '', 'Lo que más nos sirve y está vacío')
      titulo.append(nuevo('span', 'brief-pastilla brief-pastilla-clave', String(faltan.length)))
      const lista = nuevo('ul')
      for (const pregunta of faltan) {
        const paso = pasoDe(pregunta)
        const fila = nuevo('li', `brief-falta brief-area-${paso.dataset.area}`)
        const texto = nuevo('span', '', preguntaDe(pregunta))
        texto.append(nuevo('small', '', `Parte ${pasos.indexOf(paso) + 1} · ${paso.querySelector('h2').textContent}`))
        fila.append(texto, enlaceA(pregunta, 'Responder →'))
        lista.append(fila)
      }
      caja.append(titulo, lista)
      cajas.push(caja)
    }

    const datos = new FormData(form)
    const respondido = {
      todos: (nombre) => datos.getAll(nombre).filter((valor) => String(valor).trim()),
      etiqueta: (nombre, valor) => form.querySelector(`input[name="${nombre}"][value="${valor}"]`)?.dataset.etiqueta ?? valor,
    }
    const avisos = incoherencias(respondido).filter(({ titulo }) => !dejados.has(titulo))
    if (avisos.length) {
      const caja = nuevo('section', 'brief-alerta')
      const titulo = nuevo('h3', '', 'Revisa esto')
      titulo.append(nuevo('span', 'brief-pastilla brief-pastilla-clave', String(avisos.length)))
      const lista = nuevo('ul')
      for (const aviso of avisos) {
        const fila = nuevo('li', 'brief-ojo')
        const acciones = nuevo('div', 'brief-ojo-acciones')
        const dejar = nuevo('button', '', 'Está bien así')
        dejar.type = 'button'
        dejar.addEventListener('click', () => {
          dejados.add(aviso.titulo)
          armarAlertas()
        })
        const pregunta = preguntaPorId(aviso.pregunta)
        if (pregunta) acciones.append(enlaceA(pregunta, 'Ir a la pregunta →'))
        acciones.append(dejar)
        fila.append(nuevo('b', '', aviso.titulo), nuevo('p', '', aviso.texto), acciones)
        lista.append(fila)
      }
      caja.append(titulo, lista)
      cajas.push(caja)
    }

    alertas.replaceChildren(...cajas)
  }

  // Lo respondido de una pregunta, como se ve: las escalas en sus puntos y los
  // colores con su muestra.
  function respuestaVisible(pregunta, respuesta) {
    const dd = nuevo('dd')
    const marcado = pregunta.querySelector('.brief-escala input:checked')
    if (marcado) {
      const puntos = nuevo('span', 'brief-resumen-escala')
      puntos.setAttribute('aria-hidden', 'true')
      for (let n = 1; n <= 5; n++) puntos.append(nuevo('i', String(n) === marcado.value ? 'marcado' : ''))
      dd.append(puntos)
    }
    for (const color of pregunta.querySelectorAll('.brief-color input[type="text"]')) {
      const codigo = color.value.trim()
      if (!/^#[0-9a-f]{6}$/i.test(codigo)) continue
      const muestra = nuevo('span', 'brief-resumen-color')
      muestra.style.background = codigo
      dd.append(muestra)
    }
    dd.append(respuesta)
    return dd
  }

  function armarResumen() {
    resumen.replaceChildren(
      ...pasos.map((paso, i) => {
        const preguntas = [...paso.querySelectorAll('[data-pregunta]')]
        const filas = preguntas.map((pregunta) => [pregunta, preguntaDe(pregunta), respuestaDe(pregunta)])
        const respondidas = filas.filter(([, , respuesta]) => respuesta)
        const vacias = filas.filter(([, , respuesta]) => !respuesta)

        const parte = nuevo('section', `brief-resumen-parte brief-area-${paso.dataset.area}`)
        const cabeza = nuevo('div', 'brief-resumen-cabeza')
        const titulo = paso.querySelector('h2').textContent
        const editar = nuevo('a', 'brief-resumen-editar', 'Editar')
        editar.href = `#${paso.id}`
        editar.setAttribute('aria-label', `Editar ${titulo}`)
        const cuenta = nuevo('span', 'brief-pastilla brief-cuenta brief-resumen-avance', `${respondidas.length} de ${preguntas.length}`)
        cuenta.classList.toggle('lleno', !vacias.length)
        cabeza.append(figuraDe(paso.dataset.area), nuevo('h3', '', `${String(i + 1).padStart(2, '0')} · ${titulo}`), cuenta, editar)
        parte.append(cabeza)

        if (respondidas.length) {
          const lista = nuevo('dl')
          for (const [pregunta, texto, respuesta] of respondidas) lista.append(nuevo('dt', '', texto), respuestaVisible(pregunta, respuesta))
          parte.append(lista)
        }
        if (vacias.length) {
          const plegadas = nuevo('details', 'brief-vacias')
          const lista = nuevo('ul')
          for (const [, texto] of vacias) lista.append(nuevo('li', '', texto))
          plegadas.append(nuevo('summary', '', `${vacias.length} sin responder`), lista)
          parte.append(plegadas)
        }
        return parte
      })
    )
  }

  function armarRevision() {
    armarMedidores()
    armarAlertas()
    armarResumen()
  }

  // Lo mismo, en texto, para pegarlo en un correo si el envío falla.
  function resumenEnTexto() {
    armarResumen()
    const partes = [...resumen.querySelectorAll('.brief-resumen-parte')].map((parte) =>
      [
        parte.querySelector('h3').textContent.toUpperCase(),
        ...[...parte.querySelectorAll('dd')].map((dd) => `${dd.previousElementSibling.textContent}\n${dd.textContent}`),
      ].join('\n\n')
    )
    return [document.querySelector('h1').textContent, ...partes].join('\n\n\n')
  }

  const copiar = fallo.querySelector('[data-copiar]')
  copiar.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(resumenEnTexto())
      copiar.textContent = 'Copiadas ✓'
    } catch {
      copiar.textContent = 'No se pudo copiar'
    }
    setTimeout(() => (copiar.textContent = 'Copiar mis respuestas'), 2500)
  })

  // ---- El envío ----

  // Lo que identifica el envío: un número al azar que se queda en este
  // navegador (no es una huella del equipo), la pantalla, la zona horaria, el
  // idioma y cuánto lleva desde que empezó.
  function identificar() {
    let dispositivo = almacen.leer(CLAVE_DEL_DISPOSITIVO)
    if (!dispositivo && crypto.randomUUID) {
      dispositivo = crypto.randomUUID()
      almacen.escribir(CLAVE_DEL_DISPOSITIVO, dispositivo)
    }
    campo('dispositivo').value = dispositivo ?? ''
    campo('pantalla').value = `${screen.width}×${screen.height}${matchMedia('(pointer: coarse)').matches ? ' · táctil' : ''}`
    campo('zona').value = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
    campo('idioma').value = navigator.language ?? ''
    campo('transcurrido').value = Date.now() - inicio
  }

  async function enviar() {
    const malo = validarContacto()
    if (malo) {
      enfocarAlLlegar = malo
      location.hash = '#paso-1'
      return 'Faltan datos: el nombre y un correo o WhatsApp válidos.'
    }

    identificar()
    fallo.hidden = true
    // El botón se desactiva al instante, para que no se envíe dos veces. El
    // texto espera 150 ms, como en el contacto: una respuesta rápida no debe
    // dejar ver un «Enviando…» de un parpadeo.
    boton.disabled = true
    const avisarQueEnvia = setTimeout(() => (boton.textContent = 'Enviando…'), 150)

    try {
      const respuesta = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
        signal: AbortSignal.timeout(20000),
      })
      const { mensaje } = await respuesta.json().catch(() => ({}))
      // Con un 4xx la frase del Worker dice qué pasó; con un 5xx o sin
      // respuesta, el texto de siempre.
      if (!respuesta.ok) throw new Error((respuesta.status < 500 && mensaje) || FALLO)

      terminado = true
      almacen.borrar(clave)
      almacen.borrar(CLAVE_BOCETOS)
      form.hidden = true
      aviso.hidden = true
      enviado.querySelector('.brief-enviado-texto').textContent = mensaje
      enviado.hidden = false
      history.replaceState(null, '', location.pathname)
      enviado.focus()
      return mensaje
    } catch (error) {
      fallo.querySelector('.brief-fallo-texto').textContent = error.name === 'Error' ? error.message : FALLO
      fallo.hidden = false
      return fallo.querySelector('.brief-fallo-texto').textContent
    } finally {
      turnstile.reiniciar()
      clearTimeout(avisarQueEnvia)
      boton.disabled = false
      boton.textContent = 'Enviar brief'
    }
  }

  // Un agente de IA (WebMCP) recibe lo mismo que ve la persona. Sin WebMCP,
  // `agentInvoked` no existe y el envío es igual.
  form.addEventListener('submit', (evento) => {
    evento.preventDefault()
    const resultado = enviar()
    if (evento.agentInvoked) evento.respondWith(resultado)
  })

  // ---- Lo que pasa al escribir, marcar y moverse ----

  form.addEventListener('input', ({ target }) => {
    if (['nombre', 'correo', 'telefono'].includes(target.name) && target.getAttribute('aria-invalid') === 'true') validarContacto()
    llevarBoceto(target)
    guardarPronto()
  })

  form.addEventListener('change', ({ target }) => {
    alinearEstrella(target)
    llevarBoceto(target)
    actualizar()
    guardarPronto()
  })

  // Los comienzos de frase del texto largo se suman al final del cuadro, en
  // un párrafo nuevo, sin pasar su largo máximo.
  form.addEventListener('click', ({ target }) => {
    const guia = target.closest('[data-frase]')
    if (!guia) return
    const cuadro = guia.closest('[data-pregunta]').querySelector('textarea')
    const antes = cuadro.value.trimEnd()
    cuadro.value = `${antes}${antes ? '\n\n' : ''}${guia.dataset.frase}`.slice(0, cuadro.maxLength)
    cuadro.focus()
    cuadro.setSelectionRange(cuadro.value.length, cuadro.value.length)
    actualizar()
    guardarPronto()
  })

  // Enter en un campo de una línea avanza al paso siguiente: enviar el
  // formulario entero a mitad de camino nunca es lo que se quiso.
  form.addEventListener('keydown', (evento) => {
    const { key, target, isComposing } = evento
    if (key !== 'Enter' || isComposing || target.tagName !== 'INPUT' || ['checkbox', 'radio'].includes(target.type)) return
    evento.preventDefault()
    pantallaActual().querySelector('[data-siguiente]')?.click()
  })

  // Del primer paso no se sale sin los dos obligatorios.
  form.addEventListener('click', (evento) => {
    if (!evento.target.closest('#paso-1 [data-siguiente]')) return
    const malo = validarContacto()
    if (malo) {
      evento.preventDefault()
      malo.focus()
    }
  })

  // El paso en que va también se guarda, pero solo si ya escribió algo: abrir
  // el link y mirar no deja nada en el equipo.
  addEventListener('hashchange', () => {
    mostrar(true)
    if (pendiente || almacen.leer(clave)) guardar()
  })

  // ---- Al abrir ----

  if (guardado?.respuestas) {
    rellenar(guardado.respuestas)
    const paso = guardado.paso && guardado.paso !== 'inicio' ? guardado.paso : 'paso-1'
    aviso.querySelector('[data-seguir]').href = `#${paso}`
    comenzar.forEach((boton) => {
      boton.href = `#${paso}`
      boton.firstChild.textContent = 'Continuar donde quedé'
    })
    mostrarAviso(`Retomaste las respuestas que dejaste el ${fechaLegible(guardado.fecha)}.`)
  }
  traerBocetos()
  actualizar()
  mostrar(false)

  // Si la página se dibujó después de leer el ancla (en dev, React pinta en el
  // navegador), `:target` quedó vacío: se vuelve a la misma ancla, sin sumar
  // una entrada al historial.
  if (location.hash && !document.querySelector(':target')) location.replace(location.hash)
}
