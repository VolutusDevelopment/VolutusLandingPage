import { OPCIONES_DE_CONTACTO } from '../src/lib/servicios.js'
import { CABECERAS } from '../src/lib/seguridad.js'
import { LIMITES, CORREO_VALIDO, NOMBRE_VALIDO, TURNSTILE_ACCION } from '../src/lib/contacto.js'
/**
 * El Worker que entrega el formulario de contacto.
 *
 * El sitio es estático: Cloudflare sirve `dist/` sin pasar por aquí. Este
 * Worker existe por una sola ruta, `POST /api/contacto`, que es la única acción
 * que DESIGN-BRIEF §1 quiere que ocurra en toda la página. Todo lo demás cae al
 * binding de assets sin tocar nada.
 *
 * Sus respuestas llevan a mano las cabeceras de `lib/seguridad.js`: el
 * `_headers` del sitio solo cubre lo que Cloudflare sirve directo.
 *
 * §10 y §11 del brief daban por hecho Vercel con una función serverless. El
 * repositorio despliega a Cloudflare Workers, así que la integración con Resend
 * se hace aquí en vez de en /api: mismo resultado, sin cambiar de proveedor ni
 * mover el dominio.
 *
 * **Responde de dos maneras, y las dos hacen falta.** Con JavaScript el
 * formulario manda `Accept: application/json` y recibe JSON, que es lo que le
 * permite confirmar sin recargar. Sin JavaScript el navegador envía el POST
 * nativo y recibe una página HTML. Ese envío llega sin token de Turnstile y
 * se rechaza: la página que recibe ofrece el correo directo, que es la vía sin
 * JavaScript. Aceptarlo dejaba a cualquier robot saltarse Turnstile con solo
 * omitir el token.
 */

const DESTINO = 'contacto@volutus.cl'

// Resend solo deja enviar desde un dominio verificado en la cuenta. Mientras
// volutus.cl no lo esté, `REMITENTE` se configura por variable de entorno y cae
// al remitente de pruebas de Resend, que entrega pero marca el correo como tal.
const REMITENTE_POR_DEFECTO = 'Volutus <onboarding@resend.dev>'

// Tope del cuerpo entero, antes de leerlo. Los tres campos a su máximo, con
// las casillas y el token de Turnstile, no llegan a la mitad: lo que pase de
// aquí no es una persona escribiendo.
const TOPE_CUERPO = 16 * 1024

const TIPOS_ACEPTADOS = ['application/x-www-form-urlencoded', 'multipart/form-data']

// Caracteres de control. En el nombre se quitan todos —va en el asunto, y un
// salto de línea ahí es la puerta a inyectar cabeceras—; en el mensaje se
// conservan el salto y la tabulación, que son parte del texto.
const CONTROL = /[\u0000-\u001f\u007f]/g
const CONTROL_SALVO_SALTOS = /[\u0000-\u0008\u000b-\u001f\u007f]/g

const MENSAJES = {
  enviado: 'Mensaje enviado, te responderemos pronto.',
  invalido: 'Faltan datos o el correo no es válido. Revísalo y vuelve a enviarlo.',
  demasiados: 'Recibimos varios mensajes seguidos. Espera un minuto y vuelve a intentarlo.',
  fallo: `No pudimos enviar tu mensaje. Escríbenos directamente a ${DESTINO}.`,
}

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

function responder(request, mensaje, estado) {
  const quiereJson = (request.headers.get('accept') ?? '').includes('application/json')
  if (!quiereJson) return paginaDeRespuesta(mensaje, estado)

  return new Response(JSON.stringify({ mensaje }), {
    status: estado,
    headers: { ...CABECERAS, 'content-type': 'application/json; charset=utf-8' },
  })
}

function limpiar(valor, tope, control = CONTROL) {
  return typeof valor === 'string' ? valor.replace(control, ' ').trim().slice(0, tope) : ''
}

/**
 * ¿Viene el envío de esta misma página? Un `<form>` de cualquier otro sitio
 * puede apuntar aquí y el navegador lo manda sin preguntar. Los navegadores
 * actuales ponen `Origin` en todo POST, también en el nativo sin JavaScript;
 * si falta, `Sec-Fetch-Site` dice lo mismo. Sin ninguna de las dos (curl, un
 * script) se deja pasar: no es un navegador engañado, y para eso están el
 * rate-limit y Turnstile.
 */
function esMismoOrigen(request) {
  const origen = request.headers.get('origin')
  if (origen) return origen === new URL(request.url).origin
  return request.headers.get('sec-fetch-site') !== 'cross-site'
}

/**
 * Verifica el token de Turnstile con siteverify. Además de `success`, exige la
 * acción de este formulario y uno de los dominios de `TURNSTILE_HOSTNAMES`:
 * un token válido sacado de otra página o de localhost no sirve aquí.
 *
 * Sin `TURNSTILE_SECRET` (wrangler dev) no hay contra qué comprobar y se deja
 * pasar, registrándolo, igual que el rate-limit. En producción el secreto
 * tiene que estar: se carga con `wrangler secret put TURNSTILE_SECRET`.
 */
async function pasaTurnstile(token, ip, env) {
  if (!env.TURNSTILE_SECRET) {
    console.error('contacto: falta TURNSTILE_SECRET, sigo sin verificar')
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
    return success === true && action === TURNSTILE_ACCION && dominios.includes(hostname)
  } catch (error) {
    console.error('contacto: falló siteverify', error)
    return false
  }
}

async function manejarContacto(request, env) {
  if (request.method !== 'POST') {
    return new Response('Método no permitido', { status: 405, headers: { ...CABECERAS, allow: 'POST' } })
  }

  if (!esMismoOrigen(request)) {
    return responder(request, MENSAJES.fallo, 403)
  }

  // `ip` también la usa Turnstile. En producción Cloudflare siempre manda la
  // cabecera; 'sin-ip' solo aparece en local.
  const ip = request.headers.get('cf-connecting-ip') ?? 'sin-ip'

  // Antes de leer nada: un envío que sobra no debe costar ni el parseo. Se
  // responde con el mismo mensaje de fallo, que ya ofrece el correo directo:
  // es también lo que muestra el cliente ante cualquier respuesta no 2xx.
  //
  // Si el binding no existe (wrangler dev sin rate-limits, despliegue sin
  // aplicarlos), se sigue sin limitar y se registra: perder mensajes por una
  // defensa auxiliar sería peor que recibir uno de más.
  if (env.LIMITE_CONTACTO) {
    try {
      const { success } = await env.LIMITE_CONTACTO.limit({ key: ip })
      if (!success) {
        return responder(request, MENSAJES.demasiados, 429)
      }
    } catch (error) {
      console.error('contacto: rate-limit no disponible, sigo sin limitar', error)
    }
  }

  // El tamaño y el tipo se miran antes de leer: `formData()` carga el cuerpo
  // entero en memoria, y un POST de varios megas no debe llegar a eso. Sin
  // `content-length` (cuerpo por trozos) tampoco se sabe cuánto viene.
  const largo = Number(request.headers.get('content-length'))
  const tipo = (request.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
  if (!largo || largo > TOPE_CUERPO || !TIPOS_ACEPTADOS.includes(tipo)) {
    return responder(request, MENSAJES.invalido, 400)
  }

  let datos
  try {
    datos = await request.formData()
  } catch {
    return responder(request, MENSAJES.invalido, 400)
  }

  // Trampa para robots: un campo que la hoja de estilos esconde y que una
  // persona nunca rellena. Si viene con algo, se acepta en silencio y no se
  // manda nada — decirle al robot que falló solo le enseña a reintentar.
  if (limpiar(datos.get('hp_campo'), 200)) {
    return responder(request, MENSAJES.enviado, 200)
  }

  const nombre = limpiar(datos.get('nombre'), LIMITES.nombre)
  const correo = limpiar(datos.get('correo'), LIMITES.correo)
  const proyecto = limpiar(datos.get('proyecto'), LIMITES.proyecto, CONTROL_SALVO_SALTOS)
  // Opcional, y se puede marcar más de uno. Solo valen los de la lista: lo que
  // no coincida se descarta sin rechazar el envío, porque perder un mensaje por
  // una casilla manipulada no protege nada y deja a alguien sin respuesta.
  const marcados = datos
    .getAll('servicio')
    .slice(0, OPCIONES_DE_CONTACTO.length)
    .map((valor) => limpiar(valor, 40))
  const servicio = OPCIONES_DE_CONTACTO.filter((opcion) => marcados.includes(opcion)).join(' · ') || null

  if (!NOMBRE_VALIDO.test(nombre) || !proyecto || !CORREO_VALIDO.test(correo)) {
    return responder(request, MENSAJES.invalido, 400)
  }

  if (!(await pasaTurnstile(limpiar(datos.get('cf-turnstile-response'), 4096), ip, env))) {
    return responder(request, MENSAJES.fallo, 403)
  }

  if (!env.RESEND_API_KEY) {
    // Sin clave no hay envío posible. Se dice y se registra: fallar en silencio
    // aquí significa perder mensajes sin que nadie se entere.
    console.error('contacto: falta RESEND_API_KEY')
    return responder(request, MENSAJES.fallo, 500)
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
        to: [DESTINO],
        // Responder al correo contesta a quien escribió, no al remitente
        // técnico. Es lo que hace que el compromiso de 48 horas sea un clic.
        reply_to: correo,
        // Los servicios van en el asunto: es lo primero que se ve en la
        // bandeja y lo que decide cuál de los dos socios contesta.
        subject: servicio ? `Nuevo mensaje de ${nombre} · ${servicio}` : `Nuevo mensaje de ${nombre}`,
        text: `${servicio ? `Necesita: ${servicio}\n\n` : ''}${proyecto}\n\n—\n${nombre}\n${correo}`,
      }),
    })

    if (!envio.ok) {
      // Solo el estado: el cuerpo de Resend puede repetir el correo y el
      // mensaje de quien escribió, y eso no debe quedar en los logs.
      console.error('contacto: Resend respondió', envio.status)
      return responder(request, MENSAJES.fallo, 502)
    }
  } catch (error) {
    console.error('contacto: falló la llamada a Resend', error)
    return responder(request, MENSAJES.fallo, 502)
  }

  return responder(request, MENSAJES.enviado, 200)
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url)

    if (pathname === '/api/contacto') {
      // Un error que se escape no puede terminar en la página genérica de
      // Cloudflare: quien escribió tiene que saber que su mensaje no salió y
      // por dónde escribirnos.
      try {
        return await manejarContacto(request, env)
      } catch (error) {
        console.error('contacto: error inesperado', error)
        return responder(request, MENSAJES.fallo, 500)
      }
    }

    // Todo lo demás es el sitio estático, con su página 404 si no existe.
    return env.ASSETS.fetch(request)
  },
}
