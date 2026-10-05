// Comportamiento del sitio en el navegador.
//
// El HTML llega prerenderizado (scripts/prerender.mjs), así que aquí solo se
// engancha lo que necesita el DOM que ya existe. Vanilla a propósito: React no
// se envía al cliente (ver src/main.js), y el presupuesto de DESIGN-BRIEF §8 es
// de 15 KB de JavaScript para toda la página.
//
// Lo principal es el formulario: valida mientras se escribe, monta Turnstile
// (sin su token el Worker rechaza el envío) y evita la recarga.

import initTitularRotativo from './titular-rotativo.js'
import initServicios from './servicios.js'
import initFichas from './fichas.js'
import initBarra from './barra.js'
import initNubes from './nubes.js'
import { quieto } from './lib/movimiento.js'
import { desbloqueado } from './lib/odio.js'
import { CORREO_VALIDO, LIMITES, NOMBRE_VALIDO, TURNSTILE_ACCION, TURNSTILE_SITEKEY } from './lib/contacto.js'

// Los textos salen de §5 y dicen qué hacer, no qué falló.
const MENSAJES = {
  nombre: 'Falta tu nombre.',
  // Todos cortos: la reserva bajo el campo es de una línea, y un aviso de dos
  // empuja el botón justo cuando el dedo va hacia él. El más angosto es el
  // nombre en L (158 px): ningún aviso pasa de unos 110 px.
  nombreInvalido: 'Usa solo letras.',
  correo: 'Falta tu correo.',
  correoInvalido: 'Revisa tu correo.',
  proyecto: 'Falta el problema.',
}

// Título y texto del toast con el resultado del envío. El del fallo no lleva
// el correo en el texto: va debajo, como enlace (ver Contacto.jsx). La marca
// (✓ o !) la pone el CSS según el estado.
const TOAST = {
  ok: ['¡Gracias por escribirnos!', 'Te responderemos pronto.'],
  error: ['No pudimos enviar tu mensaje', 'Escríbenos directamente a:'],
}

/**
 * Marca o limpia el error de un campo.
 *
 * Toca tres cosas y las tres hacen falta (regla 3 de §7): `aria-invalid` para
 * quien usa lector de pantalla, el texto para quien no distingue el rojo, y el
 * borde para el resto. El color nunca va solo.
 */
function marcarError(campo, mensaje) {
  const error = document.getElementById(`error-${campo.name}`)
  campo.setAttribute('aria-invalid', mensaje ? 'true' : 'false')
  if (!error) return
  if (mensaje) error.textContent = mensaje
  error.hidden = !mensaje
  if (mensaje) campo.setAttribute('aria-describedby', error.id)
  else campo.removeAttribute('aria-describedby')
}

function validar(campo) {
  const valor = campo.value.trim()

  if (!valor) {
    marcarError(campo, MENSAJES[campo.name])
    return false
  }

  if (campo.name === 'nombre' && !NOMBRE_VALIDO.test(valor)) {
    marcarError(campo, MENSAJES.nombreInvalido)
    return false
  }

  if (campo.name === 'correo' && !CORREO_VALIDO.test(valor)) {
    marcarError(campo, MENSAJES.correoInvalido)
    return false
  }

  marcarError(campo, '')
  return true
}

function initFormulario() {
  const form = document.querySelector('.formulario')
  if (!form) return

  const toast = form.parentElement.querySelector('.contacto-toast')
  const boton = form.querySelector('.formulario-enviar')
  const campos = [form.elements.nombre, form.elements.correo, form.elements.proyecto]

  // El contador de caracteres del mensaje. El tope lo impone `maxLength`; aquí
  // solo se dibuja cuántos van, y se tiñe al acercarse al límite.
  const cuenta = form.querySelector('.campo-cuenta-n')
  const actualizarCuenta = () => {
    const usados = form.elements.proyecto.value.length
    cuenta.textContent = usados
    cuenta.parentElement.classList.toggle('campo-cuenta--cerca', usados >= LIMITES.proyecto * 0.9)
  }
  form.elements.proyecto.addEventListener('input', actualizarCuenta)
  actualizarCuenta()

  // El toast del resultado: sube desde abajo y baja al cerrarlo. El éxito se
  // retira solo a los 5 s; el fallo se queda, porque trae el correo para
  // escribir directo y hay que darle tiempo a usarlo. Tras bajar se vuelve a
  // ocultar con `hidden` —a los 300 ms, haya o no transición— para que no
  // quede en el árbol de accesibilidad.
  let retirar
  const cerrarToast = () => {
    clearTimeout(retirar)
    toast.classList.remove('visible')
    retirar = setTimeout(() => (toast.hidden = true), 300)
  }
  toast.querySelector('.contacto-toast-cerrar').addEventListener('click', cerrarToast)

  // `detalle` reemplaza el texto cuando el Worker explica qué corregir. Siempre
  // como `textContent`: lo que llega de la red nunca se lee como HTML. El
  // texto se escribe con el toast ya visible: escrito estando oculto, el
  // lector de pantalla no siempre lo anuncia.
  const [titulo, texto] = toast.querySelectorAll('p')
  const mostrarToast = (estado, detalle) => {
    clearTimeout(retirar)
    toast.dataset.estado = estado
    toast.hidden = false
    requestAnimationFrame(() => {
      titulo.textContent = TOAST[estado][0]
      texto.textContent = detalle || TOAST[estado][1]
      // Medirlo fija el punto de partida (abajo y transparente). Sin esto,
      // salir de `hidden` y ganar `visible` caen en el mismo cálculo de estilo
      // y el toast aparece sin subir.
      toast.getBoundingClientRect()
      toast.classList.add('visible')
    })
    if (estado === 'ok') retirar = setTimeout(cerrarToast, 5000)
  }

  // Nombre y correo avisan de un error de tipeo mientras se escribe. Vacío no
  // se marca: eso es ir en orden, no equivocarse, y lo cubre el envío.
  // La descripción, en cambio, solo se revisa al salir para LIMPIAR un error
  // que ya estaba.
  const { nombre, correo, proyecto } = form.elements
  ;[nombre, correo].forEach((campo) => {
    campo.addEventListener('input', () => {
      if (campo.value.trim()) validar(campo)
      else marcarError(campo, '')
    })
  })
  proyecto.addEventListener('blur', () => {
    if (proyecto.getAttribute('aria-invalid') === 'true') validar(proyecto)
  })

  // Turnstile se descarga al primer contacto con el formulario: así no pesa
  // en la carga ni en Lighthouse. Se monta a mano (`render=explicit`) para
  // guardar su id: el token vale un envío, y tras cada intento hay que pedir
  // otro. Añade `cf-turnstile-response` al FormData.
  let widget
  form.addEventListener(
    'focusin',
    () => {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.onload = () => {
        widget = window.turnstile.render(form.querySelector('.turnstile'), {
          sitekey: TURNSTILE_SITEKEY,
          action: TURNSTILE_ACCION,
          appearance: 'interaction-only',
        })
      }
      document.head.append(script)
    },
    { once: true }
  )

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault()

    // Se validan TODOS, no se corta en el primero: quien rellenó mal dos
    // campos merece verlo de una vez y no descubrirlo de a uno.
    const valido = campos.map(validar).every(Boolean)
    if (!valido) {
      campos.find((c) => c.getAttribute('aria-invalid') === 'true')?.focus()
      return
    }

    // Regla 4 de §7: el botón no desaparece. Cambia el texto y se desactiva
    // conservando su ancho, que lo reserva el CSS.
    //
    // Desactivar es inmediato —es lo que impide un segundo envío—, pero el
    // TEXTO espera 150 ms. Sin esa espera, una respuesta rápida hace que
    // «Enviando…» aparezca y desaparezca en menos de lo que dura un parpadeo,
    // y eso no se lee como «está trabajando»: se lee como un defecto. Si la
    // respuesta llega antes, la persona no ve ningún estado intermedio, que es
    // exactamente lo correcto cuando algo fue instantáneo.
    boton.disabled = true
    const avisarQueEnvia = setTimeout(() => {
      boton.textContent = 'Enviando…'
    }, 150)

    try {
      const respuesta = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
        // Sin tope, una red colgada dejaría el botón desactivado para siempre.
        signal: AbortSignal.timeout(15000),
      })
      // El Worker dice qué pasó. Con un 4xx (datos inválidos, demasiados
      // envíos) su frase dice qué corregir y va en el toast; con un 5xx o sin
      // respuesta vale el texto genérico, que lleva al correo.
      const { mensaje } = await respuesta.json().catch(() => ({}))
      if (!respuesta.ok) {
        mostrarToast('error', respuesta.status < 500 && mensaje)
        return
      }

      // El formulario se vacía y queda a la vista; el agradecimiento sube
      // desde abajo y se retira solo.
      form.reset()
      actualizarCuenta()
      mostrarToast('ok')
    } catch {
      mostrarToast('error')
    } finally {
      // Cada token de Turnstile vale un solo envío.
      if (widget !== undefined) window.turnstile.reset(widget)
      clearTimeout(avisarQueEnvia)
      boton.disabled = false
      boton.textContent = 'Enviar mensaje'
    }
  })
}

/**
 * El juego de las páginas de error y de /patos (src/patos.js). Casi nadie lo
 * abre, así que no pesa en la carga: se descarga al pulsar «Jugar», y cada
 * pulsación lo empieza o lo termina. Sin JavaScript el botón no sirve, por eso
 * llega oculto.
 */
function initPatos() {
  const boton = document.querySelector('.jugar')
  if (!boton) return
  boton.hidden = false
  const alternar = () => import('./patos.js').then((juego) => juego.alternar(boton))
  boton.addEventListener('click', alternar)
  const odio = document.querySelector('.odio')
  odio.hidden = !desbloqueado()
  odio.addEventListener('click', () => {
    odio.classList.add('desarmado')
    import('./patos.js').then((juego) => setTimeout(() => juego.odio(boton), 600))
  })
  if (boton.dataset.empieza && !quieto()) empezarSolo(boton, alternar)
}

/**
 * En /patos la partida empieza sola: llegar desde el pato del mar ya es pedirla.
 * Espera a que la nube pinte (`vivo`, ver nubes.js), porque antes no escucha
 * los cambios de forma del juego. Si la persona pulsa antes, manda ella. Sin
 * WebGL la nube nunca pinta, y queda «Jugar».
 */
function empezarSolo(boton, alternar) {
  const nube = boton.closest('.pagina-error').querySelector('.nubes')
  if (nube.classList.contains('vivo')) return alternar()
  nube.addEventListener('vivo', alternar, { once: true })
  boton.addEventListener('click', () => nube.removeEventListener('vivo', alternar), { once: true })
}

export default function init() {
  initFormulario()
  initPatos()
  initTitularRotativo()
  initServicios()
  initFichas()
  initBarra()
  initNubes()
}
