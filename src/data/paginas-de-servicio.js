/**
 * El contenido de la página propia de cada servicio (paginas/Servicio.jsx),
 * por el `id` de lib/servicios.js. El título, la descripción y la fecha van en
 * lib/meta.js, como los de toda página.
 *
 * Rige la regla de §3 del brief: lo que no se puede comprobar, no se dice. Por
 * eso no hay plazos —el equipo no los ha fijado (pregunta abierta 6)— ni
 * clientes.
 *
 * Todo va corto, para que la página se lea de una pasada: una línea por punto,
 * tres señales y tres pedidos. Lo que la página ya dibuja no se repite en
 * texto ni en las preguntas.
 *
 * - `tipo`: el nombre del servicio como se busca, el del Service del JSON-LD
 *   (scripts/prerender.mjs).
 * - `titular`: el h1. Ninguna palabra pasa de ocho letras, para que el
 *   titular quepa en su columna desde L y en un teléfono de 360 px.
 * - `entradilla`: una frase bajo el titular. La descripción larga, la de
 *   meta.js, queda para los buscadores.
 * - `incluye`: lo que recibe el cliente, dicho por su resultado. Cada servicio
 *   lo cuenta con la forma de lo que entrega, así que cada uno lo guarda a su
 *   manera: la forma la explica su cuerpo, en paginas/servicios/.
 * - `cuando`: las señales de que le sirve, en palabras de quien llega. La
 *   automatización no lo lleva: sus señales son las tareas de hoy (`antes`).
 * - `pedimos`: lo que el cliente pone de su parte, la objeción que §2 llama la
 *   más valiosa: «¿qué tengo que entregarles yo?».
 * - `preguntas`: en texto plano, porque también van a los datos estructurados
 *   (FAQPage) del prerender. La primera va abierta.
 */

// La respuesta al precio es la misma en todos: lleva al estimado de la página
// (components/Estimado.jsx) y dice que el precio final llega en la cotización.
const PRECIO =
  'En esta página puedes calcular un estimado según lo que necesites. Es un estimado: tus necesidades pueden cambiar el precio final. Cuando entendemos tu proyecto, te mandamos alcance y precio, sin compromiso.'

const EJEMPLO = {
  pregunta: '¿Puedo ver un ejemplo parecido a mi negocio?',
  respuesta:
    'Podemos mostrarte un mockup del diseño y de lo que necesitas resolver. Como estamos empezando, todavía no tenemos casos de clientes para mostrar.',
}

const SIN_INTERNET = {
  pregunta: '¿Funciona si no tengo internet?',
  respuesta:
    'Cada solución es única. Si lo necesitas, la diseñamos para que siga funcionando sin conexión.',
}

const INDEPENDIENTE = {
  pregunta: '¿Puedo contratar solo este servicio?',
  respuesta: 'Sí. Cada servicio es independiente: no necesitas contratar otro antes ni después.',
}

const POST_ENTREGA = {
  pregunta: '¿Qué pasa después de la entrega?',
  respuesta:
    'Dejamos la solución documentada y fácil de modificar, para que puedas cambiar algo sin ayuda externa. También puede operarla Volutus por ti, con un costo asociado. Con propiedad total, el producto es tuyo desde la entrega y la mantención es opcional: si la contratas con nosotros, corregimos a nuestro costo los errores de nuestra autoría y los cambios entran en el plan; una falla causada por un servicio de terceros no está incluida sin un plan aparte. Con suscripción, el producto pasa a ser tuyo al terminar de pagar, con un costo mayor y cláusulas de mutuo acuerdo en caso de no pago. Lo explicamos en el artículo «Comprar el producto o pagarlo en cuotas».',
}

export const PAGINAS_DE_SERVICIO = {
  web: {
    tipo: 'Desarrollo web',
    titular: 'Páginas web rápidas de verdad',
    entradilla: 'Rápidas en el celular, fáciles de encontrar en Google y con tu marca.',
    // Lo que se ve, sobre la onda, y lo que no, debajo. `icono` es el dibujo
    // de cada punto en S y M (Web.jsx).
    incluye: [
      {
        grupo: 'Lo que se ve',
        puntos: [
          { icono: 'pantalla', titulo: 'Para cada pantalla', texto: 'Pensada primero para el celular.' },
          { icono: 'identidad', titulo: 'Con tu identidad', texto: 'Tus colores y tu voz, no una plantilla.' },
          { icono: 'correo', titulo: 'Lista para que te escriban', texto: 'Un formulario que llega a tu correo.' },
        ],
      },
      {
        grupo: 'Lo que no se ve',
        puntos: [
          { icono: 'buscar', titulo: 'Hecha para Google', texto: 'Títulos, datos estructurados y mapa del sitio.' },
          { icono: 'rayo', titulo: 'Rápida al abrir', texto: 'La medimos con Lighthouse antes de entregarla.' },
          { icono: 'chispa', titulo: 'Legible para la IA', texto: 'Para que ChatGPT, Gemini o Claude puedan citarte.' },
        ],
      },
    ],
    cuando: ['No te encuentran en Google.', 'Hoy dependes solo de redes sociales.', 'Tu página tarda o se ve mal en el celular.'],
    pedimos: ['Tu logo y tus colores, si los tienes.', 'Los textos, o los escribimos juntos.', 'Fotos de tu negocio.'],
    preguntas: [
      { pregunta: '¿Cuánto cuesta una página web?', respuesta: PRECIO },
      {
        pregunta: '¿Mi página va a aparecer en Google?',
        respuesta:
          'La dejamos lista para que Google la lea y la entienda: contenido en HTML, un título y una descripción por página, datos estructurados y un mapa del sitio. Nadie puede prometerte una posición en los resultados; lo que sí controlamos es que nada técnico te impida aparecer.',
      },
      {
        pregunta: '¿Qué diferencia hay entre una página web y una tienda online?',
        respuesta:
          'La página web presenta tu negocio y te trae contactos. La tienda online además vende: tiene catálogo, carrito, pagos y pedidos.',
      },
      INDEPENDIENTE,
      EJEMPLO,
      POST_ENTREGA,
    ],
  },

  tienda: {
    tipo: 'Tiendas online',
    titular: 'Tu tienda online, en tus manos',
    entradilla: 'Catálogo, carrito, pagos y pedidos, en una tienda que administras tú.',
    // Las fases, en el orden en que las recorre una compra; la última es la de
    // quien vende. Cada `id` tiene su escena en Tienda.jsx y su línea de
    // tiempo en Tienda.css.
    incluye: [
      { id: 'catalogo', titulo: 'Catálogo', texto: 'Fotos, precios, variantes y stock, por categoría.' },
      { id: 'carrito', titulo: 'Carrito', texto: 'Pocos pasos, pensados para el celular.' },
      { id: 'pago', titulo: 'Pago', texto: 'Débito y crédito, con la plata en tu cuenta.' },
      { id: 'pedido', titulo: 'Pedido', texto: 'Pagado, preparado, enviado o entregado: siempre sabes en qué va.' },
      { id: 'panel', titulo: 'Tu panel', texto: 'Ves qué se vende y cambias productos, precios y pedidos tú mismo.' },
    ],
    cuando: [
      'Vendes por Instagram o WhatsApp y respondes todo a mano.',
      'Pagas comisiones en un marketplace.',
      'Llevas los pedidos en un cuaderno.',
    ],
    pedimos: ['Tu catálogo. Una planilla sirve.', 'Cómo despachas y cuánto cobras.', 'Una cuenta en la pasarela de pago.'],
    preguntas: [
      { pregunta: '¿Cuánto cuesta una tienda online?', respuesta: PRECIO },
      {
        pregunta: '¿Por qué una tienda propia y no solo un marketplace?',
        respuesta:
          'En un marketplace vendes en la vitrina de otro, con sus reglas y sus comisiones. En tu tienda, los clientes y los datos son tuyos. Muchos negocios usan los dos: el marketplace para que los encuentren y la tienda para que vuelvan.',
      },
      {
        pregunta: '¿Mi tienda cumple la Ley 21.719 de datos personales?',
        respuesta:
          'Una tienda trata datos de sus clientes: nombre, dirección, correo y lo que compran. La construimos con consentimiento claro, pidiendo solo los datos necesarios y con un canal para que cada cliente ejerza sus derechos.',
      },
      INDEPENDIENTE,
      EJEMPLO,
      POST_ENTREGA,
    ],
  },

  app: {
    tipo: 'Desarrollo de software a medida',
    titular: 'Software hecho a tu medida',
    entradilla: 'Apps, aplicaciones web y paneles, conectados a tus datos.',
    // Las caras donde se usa, la base que las une, los sistemas a los que se
    // conecta y, alrededor de todo, lo que lo cuida.
    incluye: {
      caras: {
        titulo: 'Donde se usa',
        puntos: [
          { titulo: 'Apps para iOS y Android', texto: 'En las tiendas o solo en tu empresa.' },
          { titulo: 'Aplicaciones web', texto: 'Desde el navegador, sin instalar nada.' },
        ],
      },
      base: { titulo: 'Una base para todo', texto: 'Lo que cambias en uno se ve en los otros.' },
      conectado: { titulo: 'Conectado a tus datos', sistemas: ['Planillas', 'Ventas', 'Facturación', 'Cualquier API'] },
      cuida: {
        titulo: 'Lo que lo cuida',
        puntos: [
          { titulo: 'Usuarios y permisos', texto: 'Cada persona ve solo lo suyo.' },
          { titulo: 'Seguro desde el inicio', texto: 'Cifrado y Ley 21.719, desde el diseño.' },
        ],
      },
    },
    cuando: [
      'Ningún software calza con tu forma de trabajar.',
      'Pagas herramientas que no se hablan entre sí.',
      'Tienes una idea y quieres llevarla a una app.',
    ],
    pedimos: ['Quién lo va a usar y para qué.', 'Cómo lo resuelves hoy.', 'Alguien de tu lado que pruebe cada entrega.'],
    preguntas: [
      {
        pregunta: '¿Conviene software a medida o uno ya hecho?',
        respuesta:
          'Si un producto del mercado resuelve tu proceso sin forzarlo, úsalo: es más barato y está listo hoy. El software a medida conviene cuando tu forma de trabajar es tu ventaja, cuando pagas varias herramientas que no se conectan o cuando el software es tu negocio.',
      },
      { pregunta: '¿Cuánto cuesta desarrollar una app?', respuesta: PRECIO },
      {
        pregunta: '¿Hacen apps para iPhone y Android?',
        respuesta: 'Sí, para los dos. Y si basta con una aplicación web, te lo decimos: se usa desde el navegador y no hay que publicarla en ninguna tienda.',
      },
      {
        pregunta: '¿Puedo empezar con una versión pequeña?',
        respuesta:
          'Sí, y casi siempre conviene. Construimos por entregas que puedes revisar, así ves algo funcionando pronto y decides lo que sigue con el producto en la mano.',
      },
      INDEPENDIENTE,
      EJEMPLO,
      SIN_INTERNET,
      POST_ENTREGA,
    ],
  },

  agente: {
    tipo: 'Agentes de IA',
    titular: 'IA que conoce tu negocio',
    entradilla: 'Responde con tu información y hace tareas por ti, a cualquier hora.',
    incluye: [
      { titulo: 'Responde con lo tuyo', texto: 'Tus documentos, catálogo y horarios.' },
      { titulo: 'Atiende solicitudes', texto: 'Agenda, toma pedidos y cotiza.' },
      { titulo: 'Hace, no solo conversa', texto: 'Consulta tus sistemas y avisa a tu equipo.' },
      { titulo: 'A cualquier hora', texto: 'En tu web o en tu mensajería.' },
      { titulo: 'Probado antes de salir', texto: 'Con preguntas reales y registro de todo.' },
    ],
    cuando: ['Respondes lo mismo todos los días.', 'Te escriben fuera de horario.', 'Quieres IA, pero con tus datos.'],
    pedimos: ['Las preguntas que más te hacen.', 'De dónde sale la información.', 'Qué pasa siempre por una persona.'],
    // Van primero y en conversación (Agente.jsx).
    preguntas: [
      {
        pregunta: '¿Qué es un agente de IA?',
        respuesta:
          'Un programa que usa un modelo de lenguaje para entender lo que se le pide y, además de responder, actuar: consultar tus sistemas, completar un registro o avisar a alguien. Un chatbot conversa; un agente también hace.',
      },
      {
        pregunta: '¿Puede inventar respuestas?',
        respuesta:
          'Los modelos de lenguaje pueden equivocarse con total seguridad. Por eso el agente responde con tu información, lo probamos con preguntas reales antes de publicarlo y, cuando no sabe, lo dice y deriva a una persona.',
      },
      {
        pregunta: '¿Reemplaza a mi equipo?',
        respuesta:
          'No es la idea. Se queda con lo repetitivo, las mismas preguntas y los mismos registros, y le deja a tu equipo lo que necesita criterio.',
      },
      {
        pregunta: '¿Cuánto cuesta un agente de IA?',
        respuesta: `${PRECIO} Además del desarrollo, el modelo de IA cobra por uso, según cuántas conversaciones atienda: ese costo mensual también va estimado en la cotización.`,
      },
      INDEPENDIENTE,
      EJEMPLO,
      POST_ENTREGA,
    ],
  },

  automatizacion: {
    tipo: 'Automatización de procesos',
    titular: 'Deja de copiar y pegar',
    entradilla: 'Las tareas repetitivas ocurren solas, con las herramientas que ya usas.',
    // Cada tarea de hoy (`antes`) junto a cómo queda automatizada; después,
    // lo que va en todas: las herramientas que se conectan.
    incluye: {
      tareas: [
        {
          antes: 'Copias datos de un sistema a otro.',
          titulo: 'Datos que se mueven solos',
          texto: 'Del formulario a la planilla, sin tocarlos.',
        },
        {
          antes: 'Armas el mismo reporte cada semana.',
          titulo: 'Tareas programadas',
          texto: 'Reportes, respaldos y recordatorios, solos.',
        },
        {
          antes: 'Se te pasan cobros y vencimientos.',
          titulo: 'Avisos a tiempo',
          texto: 'A la persona correcta, cuando pasa algo.',
        },
        {
          antes: 'Un error de tipeo ya te costó plata.',
          titulo: 'Formularios y documentos',
          texto: 'Leemos PDF y correos. Nadie tipea.',
        },
      ],
      herramientas: {
        titulo: 'Con lo que ya usas',
        texto: 'Conectamos lo que tienes antes de proponerte algo nuevo.',
        lista: ['Correo', 'Planillas', 'Google Workspace', 'Microsoft 365', 'Tu sistema'],
      },
    },
    pedimos: ['Un recorrido por la tarea.', 'Acceso a las herramientas.', 'Ejemplos de lo que entra y lo que sale.'],
    preguntas: [
      {
        pregunta: '¿Qué procesos conviene automatizar primero?',
        respuesta:
          'Los que se repiten seguido, siguen siempre los mismos pasos y hoy se hacen copiando y pegando. Si una tarea ocurre varias veces por semana y nadie tiene que decidir nada en ella, es buena candidata.',
      },
      {
        pregunta: '¿Qué pasa si una automatización falla?',
        respuesta:
          'Avisa. Cada paso deja registro y, si algo no se puede completar, le llega un aviso a la persona que definiste, en vez de fallar en silencio.',
      },
      {
        pregunta: '¿En qué se diferencia de un agente de IA?',
        respuesta:
          'Una automatización sigue siempre los mismos pasos; un agente de IA puede leer, interpretar y elegir el siguiente paso. Muchas veces van juntos: la automatización mueve los datos y el agente se encarga de lo que hay que entender.',
      },
      { pregunta: '¿Cuánto cuesta automatizar un proceso?', respuesta: PRECIO },
      INDEPENDIENTE,
      EJEMPLO,
      SIN_INTERNET,
      POST_ENTREGA,
    ],
  },

  gestion: {
    tipo: 'Sistemas de gestión',
    titular: 'Tu negocio en un solo lugar',
    entradilla: 'Inventario, clientes, agenda y cotizaciones, con tus números al día.',
    // Los módulos de un solo panel. Cada `id` tiene su dibujo en Gestion.jsx:
    // los números van primero y en grande, y los permisos lo cruzan entero.
    incluye: [
      { id: 'numeros', titulo: 'Tus números al día', texto: 'Ventas y pedidos, sin armar reportes a mano.' },
      { id: 'inventario', titulo: 'Inventario', texto: 'Te avisa cuando algo se acaba.' },
      { id: 'clientes', titulo: 'Clientes', texto: 'Cada ficha con su historial.' },
      { id: 'agenda', titulo: 'Agenda', texto: 'Sin topes ni dobles reservas.' },
      { id: 'cotizaciones', titulo: 'Cotizaciones', texto: 'Con tu formato, y sabes cuáles se cierran.' },
      { id: 'roles', titulo: 'Cada uno en lo suyo', texto: 'Permisos por rol, desde cualquier dispositivo.' },
    ],
    cuando: ['Tu operación vive en planillas.', 'Nadie sabe cuál es la versión buena.', 'Sumar el mes te toma una tarde.'],
    pedimos: ['Tus planillas, tal como están.', 'Quién usa qué.', 'Los números que quieres mirar.'],
    preguntas: [
      {
        pregunta: '¿Por qué un sistema y no una planilla?',
        respuesta:
          'La planilla sirve hasta que la usan varias personas o crece: se duplican versiones, se borran fórmulas y nadie sabe quién cambió qué. Un sistema guarda cada dato una sola vez, con permisos y con historial.',
      },
      {
        pregunta: '¿Puedo llevar mis datos actuales al sistema?',
        respuesta: 'Sí. Partimos de tus planillas y las cargamos al sistema, para que no empieces de cero.',
      },
      {
        pregunta: '¿Se conecta con otros sistemas?',
        respuesta:
          'Puede conectarse con tu facturación, tu tienda online o tus planillas, para que la misma información no se escriba dos veces.',
      },
      { pregunta: '¿Cuánto cuesta un sistema de gestión?', respuesta: PRECIO },
      INDEPENDIENTE,
      EJEMPLO,
      SIN_INTERNET,
      POST_ENTREGA,
    ],
  },

  prospeccion: {
    tipo: 'Prospección de clientes',
    titular: 'Tus próximos clientes, en una planilla',
    entradilla: 'Los negocios de tu rubro y tu zona, con su contacto. Solo datos públicos.',
    // Lo que trae la planilla, al pie del mapa y la planilla que lo dibujan.
    incluye: [
      { titulo: 'Tu zona', texto: 'Un barrio, una comuna o un área en el mapa.' },
      { titulo: 'Tus rubros', texto: 'Cada negocio aparece una sola vez.' },
      { titulo: 'Su correo', texto: 'El que publica en su web. Si no hay, queda vacío.' },
      { titulo: 'Su reputación', texto: 'Su nota en Google y cuántas reseñas la sostienen.' },
      { titulo: 'Sheets y Excel', texto: 'Con la fecha de la búsqueda.' },
    ],
    cuando: [
      'Le vendes a negocios y no sabes dónde buscarlos.',
      'Tu equipo arma listas a mano.',
      'Quieres abrir una zona o un rubro nuevo.',
    ],
    pedimos: ['La zona.', 'Los rubros que te interesan.', 'Los datos que te importan.'],
    preguntas: [
      {
        pregunta: 'Si el dato es público, ¿puedo usarlo para cualquier cosa?',
        respuesta:
          'No. Desde el 1 de diciembre de 2026, la Ley 21.719 también rige los datos que vienen de fuentes públicas. Úsalos para lo que el negocio los publicó, que lo contacten, y saca de tu lista a quien te pida que no le escribas más.',
      },
      {
        pregunta: '¿De dónde salen los datos?',
        respuesta:
          'Solo de fuentes públicas: la ficha que cada negocio tiene en Google Maps y su propio sitio web. No compramos bases de datos ni usamos información privada.',
      },
      {
        pregunta: '¿Los datos se actualizan?',
        respuesta:
          'Cada búsqueda es una foto del día en que se hace, con su fecha en el archivo. Si quieres seguir una zona en el tiempo, se repite y comparas.',
      },
      { pregunta: '¿Cuánto cuesta una búsqueda?', respuesta: PRECIO },
      INDEPENDIENTE,
      EJEMPLO,
      POST_ENTREGA,
    ],
  },
}
