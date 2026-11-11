/**
 * Turnstile, la comprobación anti-robots de los formularios que le escriben a
 * personas: el contacto (client.js) y los briefs (brief.js).
 *
 * El script se descarga al primer foco dentro del formulario: así no pesa en
 * la carga ni en Lighthouse. Se monta a mano (`render=explicit`) para guardar
 * su id: el token vale un envío, y tras cada intento hay que pedir otro. Añade
 * `cf-turnstile-response` al FormData.
 *
 * Se monta en el hueco `.turnstile` del formulario, y solo cuando el hueco
 * está a la vista: escondido (la revisión de un brief, antes de llegar a ella)
 * no tiene ancho, y el reto, si aparece, no se vería. `montar` se puede llamar
 * de nuevo cuando el hueco aparece; si ya está montado, no hace nada.
 *
 * `accion` es la que el Worker exige de vuelta: un token de un formulario no
 * sirve en otro.
 */

import { TURNSTILE_SITEKEY } from './contacto.js'

export function montarTurnstile(form, accion) {
  const hueco = form.querySelector('.turnstile')
  let cargado = false
  let pedido = false
  let widget

  const montar = () => {
    if (widget !== undefined) return
    if (!pedido) {
      pedido = true
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.onload = () => {
        cargado = true
        montar()
      }
      document.head.append(script)
      return
    }
    if (!cargado || !hueco.clientWidth) return
    widget = window.turnstile.render(hueco, {
      sitekey: TURNSTILE_SITEKEY,
      action: accion,
      appearance: 'interaction-only',
      // El reto normal mide 300 px fijos, más que el formulario en casi todos
      // los celulares, y se salía de la tarjeta. Donde no cabe va el compacto,
      // de 150 × 140.
      size: hueco.clientWidth >= 300 ? 'normal' : 'compact',
    })
  }

  form.addEventListener('focusin', montar, { once: true })

  return {
    montar,
    // Cada token vale un solo envío.
    reiniciar: () => {
      if (widget !== undefined) window.turnstile.reset(widget)
    },
  }
}
