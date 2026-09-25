// Comportamiento del sitio en el navegador.
//
// El HTML llega prerenderizado (scripts/prerender.mjs), así que aquí solo se
// engancha lo que necesita el DOM que ya existe. Vanilla a propósito: React no
// se envía al cliente (ver src/main.js), y el presupuesto de DESIGN-BRIEF §8 es
// de 15 KB de JavaScript para toda la página.
//
// Lo único que hay es el formulario, y lo que hace es MEJORAR algo que ya
// funciona sin él: el <form> lleva method y action, así que sin JavaScript el
// navegador envía y recarga. Esto solo valida antes y evita la recarga.

import { montarAccesibilidad } from './accesibilidad/widget.js'

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Los textos salen de §5 y dicen qué hacer, no qué falló.
const MENSAJES = {
  nombre: 'Falta tu nombre.',
  correo: 'Falta tu correo.',
  correoInvalido: 'Ese correo no parece válido, revísalo.',
  proyecto: 'Cuéntanos qué necesitas, aunque sea en una línea.',
  enviado: 'Mensaje enviado. Te respondemos en menos de 48 horas hábiles.',
  fallo: 'No pudimos enviar tu mensaje. Escríbenos directamente a contacto@volutus.cl.',
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
  campo.setAttribute('aria-describedby', mensaje ? error.id : '')
}

function validar(campo) {
  const valor = campo.value.trim()

  if (!valor) {
    marcarError(campo, MENSAJES[campo.name])
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

  const aviso = form.querySelector('.formulario-aviso')
  const boton = form.querySelector('.formulario-enviar')
  const campos = [form.elements.nombre, form.elements.correo, form.elements.proyecto]

  // Al salir de un campo se valida, pero solo para LIMPIAR un error que ya
  // estaba: marcar en rojo un campo que la persona aún no terminó de rellenar
  // es regañarla por ir en orden.
  campos.forEach((campo) => {
    campo.addEventListener('blur', () => {
      if (campo.getAttribute('aria-invalid') === 'true') validar(campo)
    })
  })

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
    aviso.hidden = true
    const avisarQueEnvia = setTimeout(() => {
      boton.textContent = 'Enviando…'
    }, 150)

    try {
      const respuesta = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      })
      if (!respuesta.ok) throw new Error(String(respuesta.status))

      form.reset()
      aviso.textContent = MENSAJES.enviado
      aviso.dataset.estado = 'ok'
    } catch {
      aviso.textContent = MENSAJES.fallo
      aviso.dataset.estado = 'error'
    } finally {
      clearTimeout(avisarQueEnvia)
      aviso.hidden = false
      boton.disabled = false
      boton.textContent = 'Enviar mensaje'
    }
  })
}

export default function init() {
  initFormulario()
  montarAccesibilidad()
}
