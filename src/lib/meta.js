import { CARGAS } from './cargas.js'

/**
 * Metadatos de las páginas, en un solo sitio.
 *
 * Están centralizados porque hay dos consumidores del mismo texto: el `<head>`
 * que inyecta el prerender y la entradilla visible que pintan las páginas
 * interiores bajo su titular. Dos copias de un texto que nadie vuelve a mirar es
 * la forma garantizada de que se desincronicen — y en un documento legal, que la
 * descripción del buscador diga una cosa y la página otra es un problema de
 * verdad, no un detalle de estilo.
 *
 * `archivo` es el HTML que escribe el prerender para esa ruta. Cloudflare sirve
 * `privacidad.html` en `/privacidad` sin extensión, así que la ruta limpia del
 * canonical es la que el visitante ve en la barra del navegador.
 *
 * `indexar: false` es para las páginas de error, la 404 y la de los 5xx, que
 * se sirven en cualquier dirección y no tienen una URL propia que declarar.
 * Ninguna debe aparecer en un buscador.
 *
 * `actualizada` (AAAA-MM-DD) es la fecha del último cambio del contenido de la
 * página: texto, datos o enlaces, no colores ni animaciones. Va al `<lastmod>`
 * del sitemap, y Privacidad y Ley 21.719 la muestran. Los buscadores dejan de
 * creerle a un lastmod que cambia sin que cambie la página. Toda página
 * indexable la lleva; si falta, el prerender falla.
 *
 * `tarjetaAlt` es para la página cuya tarjeta para compartir no es la de
 * siempre, el logotipo con el título: la de /patos es el pato del juego (ver
 * scripts/tarjetas-og.mjs).
 */

export const ORIGEN = 'https://volutus.cl'

export const PAGINAS = {
  '/': {
    archivo: 'index.html',
    actualizada: '2026-10-18',
    titulo: 'Páginas web, apps y agentes de IA en Chile — Volutus',
    descripcion:
      'Creamos páginas web, tiendas online, apps, agentes de IA y automatizaciones para tu negocio. Una persona te responde pronto.',
  },
  '/nosotros': {
    archivo: 'nosotros.html',
    actualizada: '2026-10-13',
    titulo: 'Quiénes somos — Volutus',
    descripcion:
      'Volutus es una empresa de desarrollo de software en Chile. Quiénes somos, de dónde viene nuestro nombre y dónde revisar lo que hemos hecho.',
  },
  // El índice de servicios (paginas/IndiceDeServicios.jsx) y, bajo él, la
  // página de cada uno (paginas/Servicio.jsx). Cada ruta de servicio es la
  // `ruta` de su servicio en lib/servicios.js. La descripción es para
  // buscadores; la página lleva una entradilla más corta
  // (data/paginas-de-servicio.js).
  '/servicios': {
    archivo: 'servicios.html',
    actualizada: '2026-10-17',
    titulo: 'Servicios de desarrollo de software en Chile — Volutus',
    descripcion:
      'Páginas web, tiendas online, apps, sistemas de gestión, agentes de IA, automatizaciones, prospección de clientes y adaptación a la Ley 21.719 para tu negocio.',
  },
  '/servicios/desarrollo-web': {
    archivo: 'servicios/desarrollo-web.html',
    actualizada: '2026-10-17',
    titulo: 'Desarrollo web en Chile: páginas rápidas y en Google — Volutus',
    descripcion:
      'Diseñamos y programamos páginas web para negocios en Chile: rápidas en el celular, fáciles de encontrar en Google y con tu marca. Una persona te responde pronto.',
  },
  '/servicios/tiendas-online': {
    archivo: 'servicios/tiendas-online.html',
    actualizada: '2026-10-17',
    titulo: 'Tiendas online para vender por internet en Chile — Volutus',
    descripcion:
      'Creamos tu tienda online con catálogo, carrito, pagos y pedidos, lista para vender por internet y fácil de administrar por ti. Una persona te responde pronto.',
  },
  '/servicios/desarrollo-software-a-medida': {
    archivo: 'servicios/desarrollo-software-a-medida.html',
    actualizada: '2026-10-17',
    titulo: 'Desarrollo de software a medida y apps en Chile — Volutus',
    descripcion:
      'Desarrollamos software a medida para tu negocio: apps para iOS y Android, aplicaciones web y paneles conectados a tus datos. Una persona te responde pronto.',
  },
  '/servicios/agentes-ia': {
    archivo: 'servicios/agentes-ia.html',
    actualizada: '2026-10-17',
    titulo: 'Agentes de IA para negocios en Chile — Volutus',
    descripcion:
      'Creamos agentes de inteligencia artificial que responden con la información de tu negocio, atienden solicitudes y hacen tareas por ti a cualquier hora, con una persona de respaldo.',
  },
  '/servicios/automatizacion-procesos': {
    archivo: 'servicios/automatizacion-procesos.html',
    actualizada: '2026-10-17',
    titulo: 'Automatización de procesos para tu negocio — Volutus',
    descripcion:
      'Conectamos tus herramientas para que las tareas repetitivas ocurran solas: traspaso de datos, formularios y documentos, avisos y tareas programadas, sin cambiar lo que ya usas.',
  },
  '/servicios/sistemas-de-gestion': {
    archivo: 'servicios/sistemas-de-gestion.html',
    actualizada: '2026-10-17',
    titulo: 'Sistemas de gestión a medida para tu negocio — Volutus',
    descripcion:
      'Un sistema hecho a tu medida para llevar inventario, clientes, agenda o cotizaciones en un solo lugar, con tus números al día y acceso por rol desde cualquier dispositivo.',
  },
  '/servicios/prospeccion-de-clientes': {
    archivo: 'servicios/prospeccion-de-clientes.html',
    actualizada: '2026-10-17',
    titulo: 'Prospección de clientes con datos públicos — Volutus',
    descripcion:
      'Encontramos los negocios del rubro y la zona que elijas, solo con datos públicos: nombre, correo, valoración en Google y sitio web, en una planilla lista para ofrecerles lo tuyo.',
  },
  // Los artículos (paginas/articulos/). Los que llevan `publicada` entran al
  // índice de /articulos, del más nuevo al más viejo; `servicios` dice en qué
  // páginas de servicio se sugieren, y uno sin `servicios` se sugiere en
  // todas. `autor` es el `id` del socio que lo firma (data/socios.js); sin
  // él, como la guía de la Ley 21.719, firma Volutus.
  '/articulos': {
    archivo: 'articulos.html',
    actualizada: '2026-10-17',
    titulo: 'Artículos sobre software para negocios — Volutus',
    descripcion:
      'Guías cortas y sin jerga para decidir qué software necesita tu negocio: páginas web, tiendas online, agentes de IA, automatizaciones y sistemas de gestión.',
  },
  '/articulos/que-es-un-agente-de-ia': {
    archivo: 'articulos/que-es-un-agente-de-ia.html',
    publicada: '2026-10-14',
    autor: 'diego',
    actualizada: '2026-10-17',
    servicios: ['agente', 'automatizacion'],
    titulo: 'Qué es un agente de IA y cuándo le sirve a tu negocio — Volutus',
    descripcion:
      'Un agente de IA no solo conversa: consulta tus sistemas y hace tareas. En qué se diferencia de un chatbot, qué puede hacer por un negocio y cuándo no conviene.',
  },
  '/articulos/pagina-web-o-tienda-online': {
    archivo: 'articulos/pagina-web-o-tienda-online.html',
    publicada: '2026-10-14',
    autor: 'diego',
    actualizada: '2026-10-17',
    servicios: ['web', 'tienda'],
    titulo: 'Página web o tienda online: cuál necesita tu negocio — Volutus',
    descripcion:
      'Las dos viven en internet, pero hacen trabajos distintos. Cómo saber si te basta una página web, si necesitas una tienda online o por cuál conviene empezar.',
  },
  '/articulos/software-a-medida-o-ya-hecho': {
    archivo: 'articulos/software-a-medida-o-ya-hecho.html',
    publicada: '2026-10-14',
    autor: 'diego',
    actualizada: '2026-10-17',
    servicios: ['app', 'gestion'],
    titulo: 'Software a medida o uno ya hecho: cómo decidir — Volutus',
    descripcion:
      'Un software ya hecho es más barato y está listo hoy; uno a medida calza con tu forma de trabajar. Cuándo conviene cada uno, y por qué muchas veces la respuesta es una mezcla.',
  },
  '/articulos/planilla-o-sistema-de-gestion': {
    archivo: 'articulos/planilla-o-sistema-de-gestion.html',
    publicada: '2026-10-14',
    autor: 'diego',
    actualizada: '2026-10-17',
    servicios: ['gestion'],
    titulo: 'Planilla o sistema de gestión: cuándo dar el paso — Volutus',
    descripcion:
      'La planilla sirve hasta que deja de servir. Cinco señales de que tu negocio ya necesita un sistema de gestión, y qué hacer antes de cambiarte.',
  },
  '/articulos/que-automatizar-primero': {
    archivo: 'articulos/que-automatizar-primero.html',
    publicada: '2026-10-14',
    autor: 'diego',
    actualizada: '2026-10-17',
    servicios: ['automatizacion'],
    titulo: 'Qué tareas automatizar primero en tu negocio — Volutus',
    descripcion:
      'Una forma simple de elegir qué automatizar: cuánto se repite, cuánto tarda y cuánto cuesta un error. Con ejemplos de tareas que casi todo negocio puede dejar de hacer a mano.',
  },
  '/articulos/que-preparar-antes-de-cotizar': {
    archivo: 'articulos/que-preparar-antes-de-cotizar.html',
    publicada: '2026-10-14',
    autor: 'diego',
    actualizada: '2026-10-17',
    titulo: 'Qué preparar antes de pedir una cotización de software — Volutus',
    descripcion:
      'Lo que conviene tener a mano antes de escribirle a una empresa de software: el problema en tus palabras, cómo lo resuelves hoy y qué sería un buen resultado.',
  },
  '/articulos/dos-formas-de-trabajar': {
    archivo: 'articulos/dos-formas-de-trabajar.html',
    publicada: '2026-10-17',
    autor: 'diego',
    actualizada: '2026-10-17',
    servicios: ['web', 'tienda', 'app', 'gestion', 'agente', 'automatizacion', 'prospeccion'],
    titulo: 'Comprar el producto o pagarlo en cuotas: cómo elegir — Volutus',
    descripcion:
      'Dos formas de trabajar con Volutus: propiedad total, con mantención opcional, o suscripción para pagar en cuotas. Qué incluye cada una y cuál conviene según tu momento.',
  },
  '/articulos/datos-de-tus-clientes-y-la-ley': {
    archivo: 'articulos/datos-de-tus-clientes-y-la-ley.html',
    publicada: '2026-10-17',
    autor: 'diego',
    actualizada: '2026-10-17',
    servicios: ['datos', 'gestion', 'agente', 'prospeccion'],
    titulo: 'Qué datos guardas sin saberlo, antes de la Ley 21.719 — Volutus',
    descripcion:
      'Un formulario, un chat o una planilla ya son datos personales. Qué revisar en tu negocio antes de que la Ley 21.719 rija desde el 1 de diciembre de 2026.',
  },
  '/articulos/por-que-no-te-sirvio-la-herramienta': {
    archivo: 'articulos/por-que-no-te-sirvio-la-herramienta.html',
    publicada: '2026-10-17',
    autor: 'diego',
    actualizada: '2026-10-17',
    servicios: ['app', 'gestion', 'automatizacion'],
    titulo: 'Por qué no te sirvió la herramienta que probaste — Volutus',
    descripcion:
      'Antes de elegir la siguiente, mira qué no encajó: el proceso, los datos o la gente. Preguntas para no repetir la compra.',
  },
  '/articulos/conectar-con-lo-que-ya-usas': {
    archivo: 'articulos/conectar-con-lo-que-ya-usas.html',
    publicada: '2026-10-17',
    autor: 'diego',
    actualizada: '2026-10-17',
    servicios: ['automatizacion', 'gestion', 'tienda'],
    titulo: 'Conectar lo que ya usas: correo, planillas y facturación — Volutus',
    descripcion:
      'Cómo se enlaza un sistema nuevo con el correo, las planillas y la facturación que ya tienes, qué preguntar antes de contratar y qué no conviene dar por hecho.',
  },
  '/articulos/boleta-factura-y-sii': {
    archivo: 'articulos/boleta-factura-y-sii.html',
    publicada: '2026-10-17',
    autor: 'diego',
    actualizada: '2026-10-17',
    servicios: ['tienda', 'gestion'],
    titulo: 'Boleta, factura y SII: qué preguntar a cualquier proveedor — Volutus',
    descripcion:
      'Antes de contratar una tienda o un sistema, pregunta si emite boleta o factura electrónica, cómo se integra con el SII y quién responde por ello.',
  },
  '/articulos/como-se-paga-en-linea': {
    archivo: 'articulos/como-se-paga-en-linea.html',
    publicada: '2026-10-17',
    autor: 'diego',
    actualizada: '2026-10-17',
    servicios: ['tienda', 'web', 'app'],
    titulo: 'Cómo se paga en línea: pasarelas, transferencias y comisiones — Volutus',
    descripcion:
      'Las opciones de pago de una tienda en Chile: pasarelas de tarjeta, transferencias y billeteras. Qué cambia en cada una y qué preguntar antes de elegir.',
  },
  '/articulos/casos-para-un-agente-de-ia': {
    archivo: 'articulos/casos-para-un-agente-de-ia.html',
    publicada: '2026-10-17',
    autor: 'diego',
    actualizada: '2026-10-17',
    servicios: ['agente', 'automatizacion'],
    titulo: 'Casos para un agente de IA: dónde sirve y dónde no — Volutus',
    descripcion:
      'Situaciones típicas donde un agente de IA ahorra tiempo a un negocio, y las que conviene dejar a una persona. Patrones, no clientes.',
  },
  '/articulos/como-trabajamos': {
    archivo: 'articulos/como-trabajamos.html',
    publicada: '2026-10-17',
    autor: 'diego',
    actualizada: '2026-10-18',
    servicios: ['web', 'tienda', 'app', 'gestion', 'agente', 'automatizacion', 'prospeccion'],
    titulo: 'Cómo trabajamos: lo que conviene saber antes de escribirnos — Volutus',
    descripcion:
      'Presupuesto, factura, mockups, funcionamiento sin internet, tecnologías, documentación, confidencialidad y ubicación: cómo trabajamos en Volutus antes de que nos escribas.',
  },
  '/privacidad': {
    archivo: 'privacidad.html',
    actualizada: '2026-10-18',
    titulo: 'Privacidad y protección de datos — Volutus',
    descripcion:
      'Qué datos trata Volutus cuando escribes por el formulario, con quién se comparten, cuánto se conservan y cómo ejercer tus derechos bajo la ley chilena.',
  },
  '/ley21719': {
    archivo: 'ley21719.html',
    publicada: '2026-10-03',
    actualizada: '2026-10-17',
    servicios: ['datos'],
    titulo: 'Ley 21.719 de protección de datos: qué cambia — Volutus',
    descripcion:
      'La nueva ley de datos personales rige desde el 1 de diciembre de 2026. Qué cambia, qué tiene que hacer tu negocio para cumplirla y cuánto arriesga si no.',
  },
  '/404': {
    archivo: '404.html',
    titulo: 'Página no encontrada — Volutus',
    descripcion:
      'Puede que el enlace esté mal escrito o que la página se haya movido. Desde aquí puedes volver al inicio o disparar un par de patos si quieres.',
    indexar: false,
  },
  '/500': {
    archivo: '500.html',
    titulo: 'Error del servidor — Volutus',
    descripcion: 'No fue nada que hicieras: el servidor tuvo un problema. Prueba de nuevo en un momento.',
    indexar: false,
  },
  '/patos': {
    archivo: 'patos.html',
    actualizada: '2026-10-13',
    titulo: 'Caza de patos — Volutus',
    descripcion:
      'Un Duck Hunt hecho con la nube de Volutus: los patos salen de los cúmulos y caen a través de ellos. Se juega en el navegador, sin instalar nada.',
    tarjetaAlt: 'El pato del juego, en píxeles cuadrados, volando en un cielo azul.',
  },
  // El juego al que lleva el portaaviones de /nosotros. `fondo` es el color de
  // su pantalla de carga, para `theme-color`.
  '/operacion-venganza': {
    archivo: 'operacion-venganza.html',
    actualizada: '2026-10-26',
    titulo: 'Operación Venganza — Volutus',
    descripcion:
      'Cazaste quince patos en Nosotros y la armada quiere a los responsables. Escena 1: llega el portaaviones Sitting Ducks. Se juega en el navegador.',
    fondo: '#5c94fc',
  },
  // Cada escena que sigue va en su propia página.
  '/operacion-venganza/escena-2': {
    archivo: 'operacion-venganza/escena-2.html',
    actualizada: '2026-10-26',
    titulo: 'Operación Venganza, escena 2: Patoon-4 — Volutus',
    descripcion:
      'El escuadrón Patoon-4 llega a la sala de mando del Sitting Ducks: medallas, un puro apagado y un pato de hule con 112 victorias. Escena 2, en el navegador.',
    fondo: '#5c94fc',
  },
  '/operacion-venganza/escena-3': {
    archivo: 'operacion-venganza/escena-3.html',
    actualizada: '2026-10-26',
    titulo: 'Operación Venganza, escena 3: Despegue — Volutus',
    descripcion:
      'duck-one sube a su F-15EX en la cubierta del Sitting Ducks, prueba los sistemas y despega al atardecer. Escena 3 de Operación Venganza, en el navegador.',
    fondo: '#5c94fc',
  },
  // Los niveles jugables, entre un grupo de escenas y el siguiente.
  '/operacion-venganza/nivel-1': {
    archivo: 'operacion-venganza/nivel-1.html',
    actualizada: '2026-10-27',
    titulo: 'Operación Venganza, nivel 1: Duck-One — Volutus',
    descripcion:
      'duck-one ataca a quien juega: esquiva las balas de su F-15EX mientras el cielo del atardecer cambia de vista, con ráfagas de viento. Nivel 1, en el navegador.',
    fondo: '#5c94fc',
  },
  '/operacion-venganza/escena-5': {
    archivo: 'operacion-venganza/escena-5.html',
    actualizada: '2026-10-26',
    titulo: 'Operación Venganza, escena 5: Regreso — Volutus',
    descripcion:
      'duck-one vuelve al Sitting Ducks, casi atropella a los marinos y le rinde cuentas a moby y a duke: el enemigo se mueve bastante. Escena 5, en el navegador.',
    fondo: '#5c94fc',
  },
  '/operacion-venganza/escena-6': {
    archivo: 'operacion-venganza/escena-6.html',
    actualizada: '2026-10-26',
    titulo: 'Operación Venganza, escena 6: Entrada — Volutus',
    descripcion:
      'Moby y Duke llegan con el sol a la espalda. Moby amenaza, Duke se presenta ante su cámara y Moby se lanza contra quien juega. Escena 6, en el navegador.',
    fondo: '#5c94fc',
  },
  '/operacion-venganza/nivel-2': {
    archivo: 'operacion-venganza/nivel-2.html',
    actualizada: '2026-10-27',
    titulo: 'Operación Venganza, nivel 2: Moby-Duck y Duke SkyDucker — Volutus',
    descripcion:
      'Moby ataca solo con el cañón de su A-10 y humo negro; después llega Duke con flores de estrellas. Esquívalos en el cielo del atardecer. Nivel 2, en el navegador.',
    fondo: '#5c94fc',
  },
  '/operacion-venganza/escena-9': {
    archivo: 'operacion-venganza/escena-9.html',
    actualizada: '2026-10-26',
    titulo: 'Operación Venganza, escena 9: Retirada — Volutus',
    descripcion:
      'La torre llama de vuelta a Moby y a Duke: ya no queda presupuesto. Duke se mira en el fuselaje y Moby abolla su avión. Escena 9, en el navegador.',
    fondo: '#5c94fc',
  },
  '/operacion-venganza/escena-10': {
    archivo: 'operacion-venganza/escena-10.html',
    actualizada: '2026-10-26',
    titulo: 'Operación Venganza, escena 10: La última opción — Volutus',
    descripcion:
      'Nada ha funcionado y duck-one propone una medida extraordinal. Moby tose, Duke quiere pintura nueva y todos miran a Duky. Escena 10, en el navegador.',
    fondo: '#5c94fc',
  },
  '/operacion-venganza/escena-11': {
    archivo: 'operacion-venganza/escena-11.html',
    actualizada: '2026-10-26',
    titulo: 'Operación Venganza, escena 11: Preparativos — Volutus',
    descripcion:
      'Nivel 3, el fantasma amarillo: un marinero sube a Duky a un F-35 experimental, el cinturón no encaja y la torre no recibe respuesta. Escena 11, en el navegador.',
    fondo: '#5c94fc',
  },
  '/operacion-venganza/nivel-3': {
    archivo: 'operacion-venganza/nivel-3.html',
    actualizada: '2026-10-27',
    titulo: 'Operación Venganza, nivel 3: Duky — Volutus',
    descripcion:
      'El Fantasma Amarillo dispara adonde vas a estar, con rayos prototipo, racimos y misiles de seguimiento. El nivel difícil de Operación Venganza, en el navegador.',
    fondo: '#5c94fc',
  },
  '/operacion-venganza/escena-13': {
    archivo: 'operacion-venganza/escena-13.html',
    actualizada: '2026-10-27',
    titulo: 'Operación Venganza, escena 13: La sala de mando — Volutus',
    descripcion:
      'Duck-One, Moby y Duke miran en los monitores cómo Duky dispara como si viera el futuro. Moby se mira en la pantalla apagada. Escena 13, en el navegador.',
    fondo: '#5c94fc',
  },
  '/operacion-venganza/escena-14': {
    archivo: 'operacion-venganza/escena-14.html',
    actualizada: '2026-10-27',
    titulo: 'Operación Venganza, escena 14: Último ataque — Volutus',
    descripcion:
      'Duky gasta toda su munición y no le da a nadie. Chilla de rabia, vuelve al portaaviones y Moby llora en la sala de mando. Escena 14, en el navegador.',
    fondo: '#5c94fc',
  },
  '/operacion-venganza/escena-15': {
    archivo: 'operacion-venganza/escena-15.html',
    actualizada: '2026-10-27',
    titulo: 'Operación Venganza, escena 15: El regreso del fantasma — Volutus',
    descripcion:
      'Duky vuelve al Sitting Ducks y el escuadrón Patoon-4 mira con él el atardecer. Después, una caja clasificada rumbo a Myanmar. Escena 15, en el navegador.',
    fondo: '#5c94fc',
  },
  '/operacion-venganza/escena-16': {
    archivo: 'operacion-venganza/escena-16.html',
    actualizada: '2026-10-27',
    titulo: 'Operación Venganza, escena 16: Desolación — Volutus',
    descripcion:
      'El almirante, solo en la proa, le habla a quien juega. Al final eliges tú: hundir el Sitting Ducks o dejarlos vivir. Escena 16, en el navegador.',
    fondo: '#5c94fc',
  },
  // El índice de todo el juego, para entrar a cualquier página sin jugar.
  '/operacion-venganza/indice': {
    archivo: 'operacion-venganza/indice.html',
    titulo: 'Operación Venganza: índice — Volutus',
    descripcion: 'El índice de Operación Venganza: cada escena, nivel y pantalla de carga del juego, para entrar a cualquiera.',
    fondo: '#5c94fc',
    indexar: false,
  },
  // Las pantallas de carga, cada una sola: se llega desde el índice del juego.
  ...Object.fromEntries(
    Object.entries(CARGAS).map(([ruta, { nombre }]) => [
      ruta,
      {
        archivo: `${ruta.slice(1)}.html`,
        titulo: `Operación Venganza, pantalla de carga: ${nombre} — Volutus`,
        descripcion: `${nombre}: una pantalla de carga de Operación Venganza, sola, para verla desde el índice del juego.`,
        fondo: '#5c94fc',
        indexar: false,
      },
    ]),
  ),
}

/**
 * El canonical se DERIVA, no se escribe a mano. Es lo que garantiza que la URL
 * del canonical, la del sitemap y la de `og:url` sean la misma cadena exacta:
 * `/privacidad` y `/privacidad/` son dos URLs distintas para un buscador.
 */
export const canonicalDe = (ruta) => (ruta === '/' ? `${ORIGEN}/` : `${ORIGEN}${ruta}`)

/** El título sin la marca, que es lo que va escrito en la tarjeta para compartir. */
export const tituloCorto = (titulo) => titulo.replace(/ — Volutus$/, '')

/**
 * La fecha `actualizada` de una página (o la que diga `campo`, como
 * `publicada`) como se lee en ella: «13 de octubre de 2026». En UTC porque
 * `new Date('2026-10-13')` es la medianoche UTC, que en Chile todavía es el
 * día 12.
 */
export const fechaDe = (ruta, campo = 'actualizada') =>
  new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(PAGINAS[ruta][campo])
  )

/** Los artículos, del más nuevo al más viejo: las páginas con `publicada`. */
export const ARTICULOS = Object.entries(PAGINAS)
  .filter(([, { publicada }]) => publicada)
  .map(([ruta, pagina]) => ({ ruta, ...pagina }))
  .sort((a, b) => b.publicada.localeCompare(a.publicada))

/** Los artículos que se sugieren en la página de un servicio. */
export const articulosDe = (servicio) =>
  ARTICULOS.filter(({ servicios }) => !servicios || servicios.includes(servicio))

/**
 * Los tres artículos que más se parecen a `ruta`: los que comparten más
 * servicios con él. A igual parecido gana el más nuevo (ARTICULOS ya viene así
 * y el orden es estable).
 */
export const relacionadosDe = (ruta) => {
  const { servicios = [] } = PAGINAS[ruta]
  return ARTICULOS.filter((articulo) => articulo.ruta !== ruta)
    .map((articulo) => ({
      articulo,
      comunes: (articulo.servicios ?? []).filter((servicio) => servicios.includes(servicio)).length,
    }))
    .sort((a, b) => b.comunes - a.comunes)
    .slice(0, 3)
    .map(({ articulo }) => articulo)
}

/**
 * El índice de artículos va de a doce por página. La primera es /articulos y
 * las demás, /articulos/pagina/2 en adelante: cada una es una página más, con
 * su título y su descripción, que se prerenderiza y entra al sitemap. Publicar
 * el artículo trece abre sola la segunda.
 */
export const POR_PAGINA = 12
export const PAGINAS_DEL_INDICE = Math.max(1, Math.ceil(ARTICULOS.length / POR_PAGINA))
export const rutaDePagina = (n) => (n === 1 ? '/articulos' : `/articulos/pagina/${n}`)
export const numeroDePagina = (ruta) => (ruta === '/articulos' ? 1 : Number(ruta.split('/').at(-1)))
export const articulosDePagina = (n) => ARTICULOS.slice((n - 1) * POR_PAGINA, n * POR_PAGINA)

for (let n = 2; n <= PAGINAS_DEL_INDICE; n++) {
  const { actualizada, descripcion } = PAGINAS['/articulos']
  PAGINAS[rutaDePagina(n)] = {
    archivo: `articulos/pagina/${n}.html`,
    actualizada,
    titulo: `Artículos sobre software para negocios, página ${n} — Volutus`,
    descripcion: `${descripcion} Página ${n} de ${PAGINAS_DEL_INDICE}.`,
  }
}

/**
 * La tarjeta para compartir de cada página, derivada de su archivo para que
 * `scripts/tarjetas-og.mjs`, que la genera, y el prerender, que la enlaza,
 * no puedan nombrarla distinto.
 */
export const tarjetaDe = (archivo) => `/image/og/${archivo.replace(/\.html$/, '')}.jpg`
