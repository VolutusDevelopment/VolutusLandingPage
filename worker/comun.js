import { CABECERAS } from '../src/lib/seguridad.js'

/**
 * Lo que comparten los formularios del Worker: el de contacto (index.js) y
 * los briefs para clientes (brief.js). Cada uno recorre el mismo camino, en el
 * mismo orden: método, origen, límite por IP, tamaño y tipo, trampa,
 * validación, Turnstile y Resend.
 */

// Resend solo deja enviar desde un dominio verificado en la cuenta. Mientras
// volutus.cl no lo esté, `REMITENTE` se configura por variable de entorno y cae
// al remitente de pruebas de Resend, que entrega pero marca el correo como tal.
const REMITENTE_POR_DEFECTO = 'Volutus <onboarding@resend.dev>'

const TIPOS_ACEPTADOS = ['application/x-www-form-urlencoded', 'multipart/form-data']

// Caracteres de control. En lo que va al asunto se quitan todos —un salto de
// línea ahí es la puerta a inyectar cabeceras—; en los textos largos se
// conservan el salto y la tabulación, que son parte del texto.
/* eslint-disable no-control-regex -- buscarlos es justo lo que hacen */
export const CONTROL = /[\u0000-\u001f\u007f]/g
export const CONTROL_SALVO_SALTOS = /[\u0000-\u0008\u000b-\u001f\u007f]/g
/* eslint-enable no-control-regex */

/**
 * Página de confirmación para quien envía sin JavaScript.
 *
 * Va con sus estilos dentro y sin depender de nada del sitio: es una respuesta
 * del Worker, no un archivo de `dist/`, así que no puede contar con el CSS
 * incrustado de la portada. Los valores son los mismos tokens del tema cielo.
 */
function paginaDeRespuesta(mensaje, estado) {
  const color = estado === 200 ? '#12714b' : '#b3261e'
  return new Response(
    `<!doctype html><html lang="es-CL"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Volutus</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;
background:#f6f9fc;color:#0a1a2a;font:17px/1.6 system-ui,-apple-system,'Segoe UI',sans-serif}
main{max-width:34rem;text-align:center}p{margin:0 0 24px;color:${color}}
a{display:inline-flex;align-items:center;min-height:44px;padding:0 24px;border-radius:4px;
background:#116492;color:#fff;text-decoration:none}</style></head>
<body><main><p>${mensaje}</p><a href="/">Volver a la página</a></main></body></html>`,
    { status: estado, headers: { ...CABECERAS, 'content-type': 'text/html; charset=utf-8' } }
  )
}

export function responder(request, mensaje, estado) {
  const quiereJson = (request.headers.get('accept') ?? '').includes('application/json')
  if (!quiereJson) return paginaDeRespuesta(mensaje, estado)

  return new Response(JSON.stringify({ mensaje }), {
    status: estado,
    headers: { ...CABECERAS, 'content-type': 'application/json; charset=utf-8' },
  })
}

export function noPermitido() {
  return new Response('Método no permitido', { status: 405, headers: { ...CABECERAS, allow: 'POST' } })
}

// El navegador envía los saltos de línea como `\r\n`: se dejan en `\n` antes
// de quitar los de control, o cada línea del correo terminaría en un espacio.
export function limpiar(valor, tope, control = CONTROL) {
  return typeof valor === 'string' ? valor.replace(/\r\n?/g, '\n').replace(control, ' ').trim().slice(0, tope) : ''
}

/**
 * ¿Viene el envío de esta misma página? Un `<form>` de cualquier otro sitio
 * puede apuntar aquí y el navegador lo manda sin preguntar. Los navegadores
 * actuales ponen `Origin` en todo POST, también en el nativo sin JavaScript;
 * si falta, `Sec-Fetch-Site` dice lo mismo. Sin ninguna de las dos (curl, un
 * script) se deja pasar: no es un navegador engañado, y para eso están el
 * rate-limit y Turnstile.
 */
export function esMismoOrigen(request) {
  const origen = request.headers.get('origin')
  if (origen) return origen === new URL(request.url).origin
  return request.headers.get('sec-fetch-site') !== 'cross-site'
}

/**
 * ¿Le quedan envíos a esta IP? Se pregunta antes de leer nada: un envío que
 * sobra no debe costar ni el parseo.
 *
 * Si el binding no existe (wrangler dev sin rate-limits, despliegue sin
 * aplicarlos), se sigue sin limitar y se registra: perder mensajes por una
 * defensa auxiliar sería peor que recibir uno de más.
 */
export async function dentroDelLimite(limite, ip, registro) {
  if (!limite) return true
  try {
    const { success } = await limite.limit({ key: ip })
    return success
  } catch (error) {
    console.error(`${registro}: rate-limit no disponible, sigo sin limitar`, error)
    return true
  }
}

/**
 * El cuerpo del formulario, o `null` si no se debe leer. El tamaño y el tipo
 * se miran antes: `formData()` carga el cuerpo entero en memoria, y un POST de
 * varios megas no debe llegar a eso. Sin `content-length` (cuerpo por trozos)
 * tampoco se sabe cuánto viene.
 */
export async function leerFormulario(request, tope) {
  const largo = Number(request.headers.get('content-length'))
  const tipo = (request.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
  if (!largo || largo > tope || !TIPOS_ACEPTADOS.includes(tipo)) return null
  try {
    return await request.formData()
  } catch {
    return null
  }
}

/**
 * Verifica el token de Turnstile con siteverify. Además de `success`, exige la
 * `accion` del formulario y uno de los dominios de `TURNSTILE_HOSTNAMES`: un
 * token válido sacado de otro formulario, de otra página o de localhost no
 * sirve aquí.
 *
 * Sin `TURNSTILE_SECRET` (wrangler dev) no hay contra qué comprobar y se deja
 * pasar, registrándolo, igual que el rate-limit. En producción el secreto
 * tiene que estar: se carga con `wrangler secret put TURNSTILE_SECRET`. Lo que
 * no deba ocurrir sin verificar de verdad (la copia de un brief) mira además
 * que el secreto exista.
 */
export async function pasaTurnstile(token, ip, env, accion) {
  if (!env.TURNSTILE_SECRET) {
    console.error(`${accion}: falta TURNSTILE_SECRET, sigo sin verificar`)
    return true
  }

  const dominios = (env.TURNSTILE_HOSTNAMES ?? '').split(',').map((d) => d.trim()).filter(Boolean)
  if (!token || token.length > 2048 || dominios.length === 0) return false

  try {
    const respuesta = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(10000),
    })
    if (!respuesta.ok) throw new Error(`siteverify ${respuesta.status}`)
    const { success, action, hostname } = await respuesta.json()
    return success === true && action === accion && dominios.includes(hostname)
  } catch (error) {
    console.error(`${accion}: falló siteverify`, error)
    return false
  }
}

/**
 * Manda un correo de texto por Resend. Devuelve si salió. `adjuntos` son
 * `{ nombre, bytes }` (un `Uint8Array`), y Resend los recibe en base64.
 *
 * Sin clave no hay envío posible: se registra, porque fallar en silencio aquí
 * significa perder mensajes sin que nadie se entere. De Resend se registra
 * solo el estado: su cuerpo puede repetir el correo y el texto de quien
 * escribió, y eso no debe quedar en los logs.
 */
export async function enviarCorreo(env, { para, responderA, asunto, texto, adjuntos = [] }, registro) {
  if (!env.RESEND_API_KEY) {
    console.error(`${registro}: falta RESEND_API_KEY`)
    return false
  }
  try {
    const envio = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: env.REMITENTE ?? REMITENTE_POR_DEFECTO,
        to: [para],
        ...(responderA && { reply_to: responderA }),
        subject: asunto,
        text: texto,
        ...(adjuntos.length && {
          attachments: adjuntos.map(({ nombre, bytes }) => ({ filename: nombre, content: enBase64(bytes) })),
        }),
      }),
    })
    if (!envio.ok) console.error(`${registro}: Resend respondió`, envio.status)
    return envio.ok
  } catch (error) {
    console.error(`${registro}: falló la llamada a Resend`, error)
    return false
  }
}

// Base64 de unos bytes, por tramos: `String.fromCharCode` con un archivo de
// megas entero desborda la pila.
function enBase64(bytes) {
  let binario = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binario)
}
