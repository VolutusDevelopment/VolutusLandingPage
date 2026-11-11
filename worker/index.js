import { OPCIONES_DE_CONTACTO } from '../src/lib/servicios.js'
import { CABECERAS } from '../src/lib/seguridad.js'
import { CORREO_DE_CONTACTO, LIMITES, CORREO_VALIDO, NOMBRE_VALIDO, TURNSTILE_ACCION } from '../src/lib/contacto.js'
import { manejarBrief } from './brief.js'
import {
  CONTROL_SALVO_SALTOS,
  dentroDelLimite,
  enviarCorreo,
  esMismoOrigen,
  leerFormulario,
  limpiar,
  noPermitido,
  pasaTurnstile,
  responder,
} from './comun.js'
/**
 * El Worker que entrega el formulario de contacto y los briefs para clientes.
 *
 * El sitio es estático: Cloudflare sirve `dist/` sin pasar por aquí. Este
 * Worker existe por dos rutas: `POST /api/contacto`, que es la única acción
 * que DESIGN-BRIEF §1 quiere que ocurra en toda la página, y `POST /api/brief`,
 * la de los briefs que Volutus manda por link (brief.js). Todo lo demás cae al
 * binding de assets sin tocar nada, salvo las grabaciones de las escenas, que
 * pasan por aquí solo para servirse por partes (ver `porPartes`).
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

// Tope del cuerpo entero, antes de leerlo. Los tres campos a su máximo, con
// las casillas y el token de Turnstile, no llegan a la mitad: lo que pase de
// aquí no es una persona escribiendo.
const TOPE_CUERPO = 16 * 1024

const MENSAJES = {
  enviado: 'Mensaje enviado, te responderemos pronto.',
  invalido: 'Faltan datos o el correo no es válido. Revísalo y vuelve a enviarlo.',
  demasiados: 'Recibimos varios mensajes seguidos. Espera un minuto y vuelve a intentarlo.',
  fallo: `No pudimos enviar tu mensaje. Escríbenos directamente a ${CORREO_DE_CONTACTO}.`,
}

async function manejarContacto(request, env) {
  if (request.method !== 'POST') {
    return noPermitido()
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
  if (!(await dentroDelLimite(env.LIMITE_CONTACTO, ip, 'contacto'))) {
    return responder(request, MENSAJES.demasiados, 429)
  }

  const datos = await leerFormulario(request, TOPE_CUERPO)
  if (!datos) {
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

  if (!(await pasaTurnstile(limpiar(datos.get('cf-turnstile-response'), 4096), ip, env, TURNSTILE_ACCION))) {
    return responder(request, MENSAJES.fallo, 403)
  }

  const enviado = await enviarCorreo(
    env,
    {
      para: CORREO_DE_CONTACTO,
      // Responder al correo contesta a quien escribió, no al remitente
      // técnico. Es lo que hace que responder pronto sea un clic.
      responderA: correo,
      // Los servicios van en el asunto: es lo primero que se ve en la
      // bandeja y lo que decide cuál de los dos socios contesta.
      asunto: servicio ? `Nuevo mensaje de ${nombre} · ${servicio}` : `Nuevo mensaje de ${nombre}`,
      texto: `${servicio ? `Necesita: ${servicio}\n\n` : ''}${proyecto}\n\n—\n${nombre}\n${correo}`,
    },
    'contacto'
  )
  if (!enviado) {
    return responder(request, MENSAJES.fallo, 502)
  }

  return responder(request, MENSAJES.enviado, 200)
}

// Safari reproduce un video solo si el servidor lo entrega por partes: pide un
// rango (`Range`) y espera un 206. Los assets de Cloudflare ignoran `Range` y
// responden el archivo entero, así que las grabaciones de las escenas
// (src/nubes.js) pasan por aquí, que corta la parte pedida. Un solo rango por
// pedido, que es lo que piden los navegadores al reproducir; cualquier otra
// cosa recibe lo que dé el binding de assets.
async function porPartes(request, env) {
  const archivo = await env.ASSETS.fetch(request)
  const rango = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') ?? '')
  const cabeceras = new Headers(archivo.headers)
  Object.entries(CABECERAS).forEach(([nombre, valor]) => cabeceras.set(nombre, valor))
  cabeceras.set('accept-ranges', 'bytes')
  if (request.method !== 'GET' || archivo.status !== 200 || !rango || rango[1] + rango[2] === '') {
    return new Response(archivo.body, { status: archivo.status, headers: cabeceras })
  }
  const datos = await archivo.arrayBuffer()
  const total = datos.byteLength
  // `bytes=a-b`, `bytes=a-` o, los últimos n, `bytes=-n`.
  const desde = rango[1] === '' ? Math.max(total - Number(rango[2]), 0) : Number(rango[1])
  const hasta = rango[1] === '' || rango[2] === '' ? total - 1 : Math.min(Number(rango[2]), total - 1)
  if (desde > hasta) {
    cabeceras.set('content-range', `bytes */${total}`)
    return new Response(null, { status: 416, headers: cabeceras })
  }
  cabeceras.set('content-range', `bytes ${desde}-${hasta}/${total}`)
  cabeceras.delete('content-length')
  return new Response(datos.slice(desde, hasta + 1), { status: 206, headers: cabeceras })
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

    if (pathname === '/api/brief') {
      try {
        return await manejarBrief(request, env)
      } catch (error) {
        console.error('brief: error inesperado', error)
        return responder(request, `No pudimos enviar tu brief. Escríbenos directamente a ${CORREO_DE_CONTACTO}.`, 500)
      }
    }

    if (pathname.startsWith('/grabados/')) return porPartes(request, env)

    // Todo lo demás es el sitio estático, con su página 404 si no existe.
    return env.ASSETS.fetch(request)
  },
}
