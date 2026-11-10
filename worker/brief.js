import { BOCETOS } from '../src/lib/brief/bocetos.js'
import { BRIEF } from '../src/lib/brief/preguntas.js'
import {
  ESCALA,
  LIMITES_BRIEF,
  REACCIONES,
  TELEFONO_VALIDO,
  TIEMPO_MINIMO,
  TURNSTILE_ACCION_BRIEF,
  campoBoceto,
  campoCelda,
  campoColor,
  campoEstrella,
  campoNotaBoceto,
  campoOtro,
  respondibles,
  textoDeEscala,
} from '../src/lib/brief/reglas.js'
import { CORREO_DE_CONTACTO, CORREO_VALIDO, NOMBRE_VALIDO } from '../src/lib/contacto.js'
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
 * `POST /api/brief`: el brief para clientes (src/paginas/Brief.jsx) llega a
 * contacto@volutus.cl, y la persona que lo llenó recibe una copia si la pidió.
 *
 * Recorre el mismo camino que el contacto (comun.js), con dos defensas más:
 * un límite por IP propio y más bajo (`LIMITE_BRIEF`), y el tiempo de llenado:
 * menos de `TIEMPO_MINIMO` entre abrir la página y enviar no lo hace una
 * persona, y se descarta en silencio, como la trampa.
 *
 * Cada respuesta se lee según su pregunta (lib/brief/preguntas.js): las opciones solo
 * valen si están en la lista, las de «elige hasta 3» se cortan en 3, y los
 * textos se recortan a su límite. Lo que no es una pregunta no se lee.
 *
 * La copia le escribe a una dirección que tecleó quien llenó el formulario, así
 * que solo sale si Turnstile se verificó de verdad (con su secreto) y después
 * de que el correo a Volutus salió: todo abuso pasa primero por la bandeja de
 * Volutus.
 *
 * Al correo de Volutus se suma lo que identifica el envío: el número al azar
 * del navegador, su pantalla, zona horaria e idioma, la IP, el lugar y el
 * proveedor que informa Cloudflare, el navegador y el tiempo de llenado. La
 * copia no lleva nada de eso. Lo explica /privacidad.
 */

// Un brief entero a su máximo, con sus textos largos llenos, no llega a esto;
// lo que pase no es una persona escribiendo.
const TOPE_CUERPO = 64 * 1024

// Más enlaces que esto en las respuestas es una señal (no una regla) de spam:
// va en el correo para que se mire con calma.
const MUCHOS_ENLACES = 5

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const MENSAJES = {
  invalido: 'Falta tu nombre o una forma de responderte (correo o WhatsApp). Revisa el primer paso y vuelve a enviarlo.',
  demasiados: 'Recibimos varios envíos seguidos. Espera un minuto y vuelve a intentarlo.',
  fallo: `No pudimos enviar tu brief. Vuelve a intentarlo en un momento o escríbenos a ${CORREO_DE_CONTACTO}.`,
  // El de la trampa y el del robot apurado: parece un éxito a propósito.
  silencio: 'Recibimos tu brief.',
}

// El nombre de cada dirección de estilo, para decir el de cada boceto.
const ESTILOS = new Map(
  BRIEF.pasos
    .flatMap(respondibles)
    .find(({ id }) => id === 'estilo')
    .opciones.map(({ v, l }) => [v, l])
)

// Lo respondido en una pregunta, en una o varias líneas. Vacío si no tiene.
function respuestaDe(pregunta, datos) {
  const { id, tipo } = pregunta
  const texto = (nombre, tope = LIMITES_BRIEF.texto) => limpiar(datos.get(nombre), tope)

  switch (tipo) {
    case 'texto':
    case 'correo':
    case 'telefono':
      return texto(id, LIMITES_BRIEF[id] ?? LIMITES_BRIEF.texto)
    case 'parrafo':
      return limpiar(datos.get(id), LIMITES_BRIEF.parrafo, CONTROL_SALVO_SALTOS)
    case 'escala': {
      const n = Number(datos.get(id))
      return ESCALA.includes(n) ? `${n} de 5: ${textoDeEscala(n, pregunta.izquierda, pregunta.derecha)}` : ''
    }
    case 'una':
    case 'varias': {
      const { opciones, max, estrella, otro } = pregunta
      const elegidas = datos.getAll(id).slice(0, opciones.length)
      const tope = tipo === 'una' ? 1 : (max ?? opciones.length)
      const estrellas = estrella ? datos.getAll(campoEstrella(id)).slice(0, opciones.length) : []
      const partes = opciones
        .filter(({ v }) => elegidas.includes(v))
        .slice(0, tope)
        .map(({ v, l }) => l + (estrellas.includes(v) ? ' ★' : ''))
      const libre = otro && texto(campoOtro(id))
      if (libre) partes.push(`Otro: ${libre}`)
      return partes.join(', ')
    }
    case 'tabla':
      return Array.from({ length: pregunta.filas }, (_, i) =>
        pregunta.columnas
          .map((columna) => {
            const valor = texto(campoCelda(id, i + 1, columna.id), LIMITES_BRIEF.celda)
            return valor && `${columna.etiqueta}: ${valor}`
          })
          .filter(Boolean)
          .join(' · ')
      )
        .filter(Boolean)
        .map((fila, i) => `${i + 1}. ${fila}`)
        .join('\n')
    case 'frase': {
      const huecos = pregunta.partes.filter((parte) => typeof parte !== 'string')
      if (!huecos.some((hueco) => texto(hueco.id))) return ''
      return pregunta.partes.map((parte) => (typeof parte === 'string' ? parte : texto(parte.id) || '___')).join('')
    }
    case 'colores':
      return pregunta.espacios
        .map((espacio, i) => {
          const valor = texto(campoColor(id, i + 1), LIMITES_BRIEF.color)
          return valor && `${espacio}: ${valor}`
        })
        .filter(Boolean)
        .join(', ')
    case 'bocetos':
      return BOCETOS.map(({ slug, nombre, estilo }) => {
        const reaccion = REACCIONES.find(([valor]) => valor === datos.get(campoBoceto(slug)))?.[1]
        const nota = texto(campoNotaBoceto(slug), LIMITES_BRIEF.nota)
        return (reaccion || nota) && `${nombre} (${ESTILOS.get(estilo)}): ${[reaccion, nota].filter(Boolean).join(' — ')}`
      })
        .filter(Boolean)
        .join('\n')
    default:
      return ''
  }
}

// Las respuestas, por paso: el título del paso en mayúscula y, debajo, cada
// pregunta con lo respondido. Lo que quedó en blanco no va.
function respuestasEnTexto(datos) {
  return BRIEF.pasos
    .map((paso, i) => {
      const lineas = respondibles(paso)
        .map((pregunta) => [pregunta.etiqueta, respuestaDe(pregunta, datos)])
        .filter(([, respuesta]) => respuesta)
        .map(([pregunta, respuesta]) => `${pregunta}\n${respuesta}`)
      return lineas.length ? `${String(i + 1).padStart(2, '0')} · ${paso.titulo.toUpperCase()}\n\n${lineas.join('\n\n')}` : ''
    })
    .filter(Boolean)
    .join('\n\n\n')
}

const duracion = (ms) => {
  const minutos = Math.round(ms / 60000)
  if (minutos < 1) return `${Math.round(ms / 1000)} s`
  if (minutos < 120) return `${minutos} min`
  const horas = Math.round(minutos / 60)
  return horas < 48 ? `${horas} h` : `${Math.round(horas / 24)} días`
}

// Lo que identifica el envío, para el correo de Volutus. Lo que manda el
// navegador se acepta solo con su forma esperada.
function envioYDispositivo(request, datos, { referencia, ip, transcurrido, verificado, copia, enlaces }) {
  const cf = request.cf ?? {}
  const conForma = (nombre, tope, forma) => {
    const valor = limpiar(datos.get(nombre), tope)
    return forma.test(valor) ? valor : ''
  }
  const plataforma = limpiar(request.headers.get('sec-ch-ua-platform'), 40).replaceAll('"', '')
  const movil = { '?1': 'móvil', '?0': 'escritorio' }[request.headers.get('sec-ch-ua-mobile')]
  const lineas = [
    ['Referencia', referencia],
    ['Fecha', new Intl.DateTimeFormat('es-CL', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Santiago' }).format(Date.now())],
    ['Tiempo de llenado', duracion(transcurrido)],
    ['Turnstile', verificado ? 'verificado' : 'sin verificar (falta TURNSTILE_SECRET)'],
    ['Copia al cliente', copia ? 'pedida' : 'no pedida'],
    ['Enlaces en las respuestas', enlaces > MUCHOS_ENLACES ? `${enlaces}, revisar` : enlaces],
    ['Id del navegador', conForma('dispositivo', 36, UUID)],
    ['IP', ip],
    ['Lugar', [cf.city, cf.region, cf.country].filter(Boolean).join(', ')],
    ['Proveedor', cf.asOrganization],
    ['Navegador', limpiar(request.headers.get('user-agent'), 300)],
    ['Sistema', [plataforma, movil].filter(Boolean).join(', ')],
    ['Pantalla', conForma('pantalla', 30, /^\d{2,5}×\d{2,5}( · táctil)?$/)],
    ['Zona horaria', conForma('zona', 60, /^[\w/+-]+$/)],
    ['Idioma', conForma('idioma', 35, /^[a-z]{2,3}(-[a-z0-9]{1,8})*$/i)],
  ]
  return lineas
    .filter(([, valor]) => valor !== undefined && valor !== '')
    .map(([nombre, valor]) => `${nombre}: ${valor}`)
    .join('\n')
}

export async function manejarBrief(request, env) {
  if (request.method !== 'POST') return noPermitido()
  if (!esMismoOrigen(request)) return responder(request, MENSAJES.fallo, 403)

  // `ip` también la usa Turnstile. En producción Cloudflare siempre manda la
  // cabecera; 'sin-ip' solo aparece en local.
  const ip = request.headers.get('cf-connecting-ip') ?? 'sin-ip'
  if (!(await dentroDelLimite(env.LIMITE_BRIEF, ip, 'brief'))) return responder(request, MENSAJES.demasiados, 429)

  const datos = await leerFormulario(request, TOPE_CUERPO)
  if (!datos) return responder(request, MENSAJES.invalido, 400)

  // Trampa y apuro: se acepta en silencio y no se manda nada. Decirle al
  // robot que falló solo le enseña a reintentar.
  const transcurrido = Number(datos.get('transcurrido'))
  if (limpiar(datos.get('hp_campo'), 200) || !(transcurrido >= TIEMPO_MINIMO)) {
    return responder(request, MENSAJES.silencio, 200)
  }

  const nombre = limpiar(datos.get('nombre'), LIMITES_BRIEF.nombre)
  const correo = limpiar(datos.get('correo'), LIMITES_BRIEF.correo)
  const telefono = limpiar(datos.get('telefono'), LIMITES_BRIEF.telefono)
  const correoValido = !correo || CORREO_VALIDO.test(correo)
  const telefonoValido = !telefono || TELEFONO_VALIDO.test(telefono)
  if (!NOMBRE_VALIDO.test(nombre) || !(correo || telefono) || !correoValido || !telefonoValido) {
    return responder(request, MENSAJES.invalido, 400)
  }

  if (!(await pasaTurnstile(limpiar(datos.get('cf-turnstile-response'), 4096), ip, env, TURNSTILE_ACCION_BRIEF))) {
    return responder(request, MENSAJES.fallo, 403)
  }
  // `pasaTurnstile` deja pasar sin secreto (en local). La copia no.
  const verificado = Boolean(env.TURNSTILE_SECRET)

  const respuestas = respuestasEnTexto(datos)
  const empresa = limpiar(datos.get('empresa'), LIMITES_BRIEF.texto)
  const quiereCopia = datos.get('copia') === 'si' && Boolean(correo)
  const referencia = `B-${new Date().toISOString().slice(2, 10).replaceAll('-', '')}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`

  const llego = await enviarCorreo(
    env,
    {
      para: CORREO_DE_CONTACTO,
      // Responder al correo contesta a quien llenó el brief.
      responderA: correo,
      asunto: [BRIEF.nombre, nombre, empresa, referencia].filter(Boolean).join(' · '),
      texto: [
        `${BRIEF.nombre} de ${nombre}${empresa ? `, ${empresa}` : ''}`,
        [correo && `Correo: ${correo}`, telefono && `WhatsApp o teléfono: ${telefono}`].filter(Boolean).join('\n'),
        respuestas,
        `— ENVÍO Y DISPOSITIVO —\n${envioYDispositivo(request, datos, {
          referencia,
          ip,
          transcurrido,
          verificado,
          copia: quiereCopia,
          enlaces: (respuestas.match(/https?:\/\/|www\./gi) ?? []).length,
        })}`,
      ].join('\n\n\n'),
    },
    'brief'
  )
  if (!llego) return responder(request, MENSAJES.fallo, 502)

  const copia =
    quiereCopia &&
    verificado &&
    (await enviarCorreo(
      env,
      {
        para: correo,
        responderA: CORREO_DE_CONTACTO,
        asunto: `Tu ${BRIEF.nombre.toLowerCase()} para Volutus · ${referencia}`,
        texto: [
          `Hola, ${nombre}:`,
          `Esta es una copia de tu ${BRIEF.nombre.toLowerCase()} para Volutus (referencia ${referencia}). Lo leemos con calma y te escribimos para conversarlo. Si quieres sumar algo, responde este correo.`,
          'Si no llenaste este formulario, ignora este correo.',
          respuestas,
          '—\nVolutus · volutus.cl',
        ].join('\n\n'),
      },
      'brief'
    ))

  const mensaje = copia
    ? `Te mandamos una copia a ${correo}. Tu número de referencia es ${referencia}.`
    : quiereCopia
      ? `Tu brief nos llegó, pero no pudimos mandarte la copia por correo. Tu número de referencia es ${referencia}.`
      : `Tu número de referencia es ${referencia}.`
  return responder(request, mensaje, 200)
}
