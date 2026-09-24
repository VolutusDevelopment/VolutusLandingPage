/**
 * El Worker que entrega el formulario de contacto.
 *
 * El sitio es estático: Cloudflare sirve `dist/` sin pasar por aquí. Este
 * Worker existe por una sola ruta, `POST /api/contacto`, que es la única acción
 * que DESIGN-BRIEF §1 quiere que ocurra en toda la página. Todo lo demás cae al
 * binding de assets sin tocar nada.
 *
 * §10 y §11 del brief daban por hecho Vercel con una función serverless. El
 * repositorio despliega a Cloudflare Workers, así que la integración con Resend
 * se hace aquí en vez de en /api: mismo resultado, sin cambiar de proveedor ni
 * mover el dominio.
 *
 * **Responde de dos maneras, y las dos hacen falta.** Con JavaScript el
 * formulario manda `Accept: application/json` y recibe JSON, que es lo que le
 * permite confirmar sin recargar. Sin JavaScript el navegador envía el POST
 * nativo y recibe una página HTML de confirmación: §8 exige que el formulario
 * funcione sin JS, y una respuesta JSON en pantalla no es funcionar.
 */

const DESTINO = 'contacto@volutus.cl'

// Resend solo deja enviar desde un dominio verificado en la cuenta. Mientras
// volutus.cl no lo esté, `REMITENTE` se configura por variable de entorno y cae
// al remitente de pruebas de Resend, que entrega pero marca el correo como tal.
const REMITENTE_POR_DEFECTO = 'Volutus <onboarding@resend.dev>'

// Topes de longitud. No son validación de formato —eso ya lo hace el navegador
// y lo repite el cliente—, son un freno al abuso: este endpoint es público y
// cualquiera puede llamarlo sin pasar por la página.
const LIMITES = { nombre: 120, correo: 200, proyecto: 4000 }

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MENSAJES = {
  enviado: 'Mensaje enviado. Te respondemos en menos de 48 horas hábiles.',
  invalido: 'Faltan datos o el correo no es válido. Revísalo y vuelve a enviarlo.',
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
    { status: estado, headers: { 'content-type': 'text/html; charset=utf-8' } }
  )
}

function responder(request, mensaje, estado) {
  const quiereJson = (request.headers.get('accept') ?? '').includes('application/json')
  if (!quiereJson) return paginaDeRespuesta(mensaje, estado)

  return new Response(JSON.stringify({ mensaje }), {
    status: estado,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

function limpiar(valor, tope) {
  return typeof valor === 'string' ? valor.trim().slice(0, tope) : ''
}

async function manejarContacto(request, env) {
  if (request.method !== 'POST') {
    return new Response('Método no permitido', { status: 405, headers: { allow: 'POST' } })
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
  if (limpiar(datos.get('empresa'), 200)) {
    return responder(request, MENSAJES.enviado, 200)
  }

  const nombre = limpiar(datos.get('nombre'), LIMITES.nombre)
  const correo = limpiar(datos.get('correo'), LIMITES.correo)
  const proyecto = limpiar(datos.get('proyecto'), LIMITES.proyecto)

  if (!nombre || !proyecto || !CORREO_VALIDO.test(correo)) {
    return responder(request, MENSAJES.invalido, 400)
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
        subject: `Nuevo mensaje de ${nombre}`,
        text: `${proyecto}\n\n—\n${nombre}\n${correo}`,
      }),
    })

    if (!envio.ok) {
      console.error('contacto: Resend respondió', envio.status, await envio.text())
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

    if (pathname === '/api/contacto') return manejarContacto(request, env)

    // Todo lo demás es el sitio estático.
    return env.ASSETS.fetch(request)
  },
}
