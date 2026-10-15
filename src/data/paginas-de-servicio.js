/**
 * El contenido de la página propia de cada servicio (paginas/Servicio.jsx),
 * por el `id` de lib/servicios.js. El título, la descripción y la fecha van en
 * lib/meta.js, como los de toda página.
 *
 * Rige la regla de §3 del brief: lo que no se puede comprobar, no se dice. Por
 * eso no hay plazos —el equipo no los ha fijado (pregunta abierta 6)— ni
 * clientes, y la prueba de cada servicio es obra con enlace (`prueba`, de
 * data/proyectos.js) o no aparece.
 *
 * - `antetitulo`: el nombre del servicio como se busca.
 * - `titular`: el h1. Ninguna palabra pasa de ocho letras, para que el
 *   titular quepa en su columna desde L y en un teléfono de 360 px.
 * - `incluye`: lo que recibe el cliente, dicho por su resultado.
 * - `cuando`: las señales de que le sirve, en palabras de quien llega.
 * - `principio`: opcional, una regla del servicio que merece su propio bloque,
 *   como que la prospección solo usa datos públicos.
 * - `pedimos`: lo que el cliente pone de su parte, la objeción que §2 llama la
 *   más valiosa: «¿qué tengo que entregarles yo?».
 * - `prueba`: un proyecto de data/proyectos.js que lo demuestra, con una línea
 *   que dice por qué; `vista` muestra una de sus capturas y `medir` suma el
 *   enlace para medir esta misma página.
 * - `preguntas`: en texto plano, porque también van a los datos estructurados
 *   (FAQPage) del prerender.
 */

// La respuesta al precio es la misma en todos: §3 decidió no publicarlo.
const PRECIO =
  'No publicamos precios, porque cada proyecto se cotiza según su alcance. Te mandamos alcance y precio en nuestra primera respuesta, en menos de 48 horas hábiles y sin compromiso.'

const INDEPENDIENTE = {
  pregunta: '¿Puedo contratar solo este servicio?',
  respuesta: 'Sí. Cada servicio es independiente: no necesitas contratar otro antes ni después.',
}

export const PAGINAS_DE_SERVICIO = {
  web: {
    antetitulo: 'Desarrollo web',
    titular: 'Páginas web rápidas de verdad',
    incluye: [
      {
        titulo: 'Para cada pantalla',
        texto: 'Se ve y se usa bien en celulares, tablets y computadores. Partimos por el celular, que es desde donde te va a abrir casi todo el mundo.',
      },
      {
        titulo: 'Hecha para Google',
        texto: 'HTML que los buscadores leen sin esfuerzo, un título y una descripción por página, datos estructurados y un mapa del sitio.',
      },
      {
        titulo: 'Rápida al abrir',
        texto: 'Imágenes optimizadas, el mínimo de JavaScript y nada que sobre. La medimos con Lighthouse, la herramienta de Google, antes de entregarla.',
      },
      {
        titulo: 'Con tu identidad',
        texto: 'Tus colores, tu tipografía y tu forma de hablar. No una plantilla con tu logo encima.',
      },
      {
        titulo: 'Lista para que te escriban',
        texto: 'Un formulario que llega a tu correo y los enlaces de contacto que de verdad usas.',
      },
      {
        titulo: 'Legible para la IA',
        texto: 'Contenido claro y ordenado, y un archivo llms.txt, para que asistentes como ChatGPT, Gemini o Claude puedan leer tu negocio y citarlo.',
      },
    ],
    cuando: [
      'Te buscan por tu nombre y no te encuentran, o encuentran algo desactualizado.',
      'Hoy dependes solo de redes sociales y quieres un lugar propio.',
      'Tu página actual tarda en abrir o se ve mal en el celular.',
      'Necesitas un sitio al que mandar a tus clientes con toda la información.',
    ],
    pedimos: [
      'Tu logo y tus colores, si los tienes.',
      'Los textos, o una conversación para escribirlos juntos.',
      'Fotos de tu negocio, tus productos o tu equipo.',
      'Tu dominio, si ya tienes uno.',
    ],
    prueba: {
      proyecto: 'ponlenota',
      vista: 'El sitio',
      texto: 'El sitio de PonleNota explica el producto y vende sus planes. Lo hicimos nosotros, igual que esta página.',
      medir: true,
    },
    preguntas: [
      { pregunta: '¿Cuánto cuesta una página web?', respuesta: PRECIO },
      {
        pregunta: '¿Mi página va a aparecer en Google?',
        respuesta:
          'La dejamos lista para que Google la lea y la entienda: contenido en HTML, un título y una descripción por página, datos estructurados y un mapa del sitio. Nadie puede prometerte una posición en los resultados; lo que sí controlamos es que nada técnico te impida aparecer.',
      },
      {
        pregunta: '¿Cómo sé si una página es rápida?',
        respuesta:
          'Ábrela en PageSpeed Insights, de Google, y mira la nota de rendimiento en celular. Esta misma página la puedes medir tú.',
      },
      {
        pregunta: '¿Qué diferencia hay entre una página web y una tienda online?',
        respuesta:
          'La página web presenta tu negocio y te trae contactos. La tienda online además vende: tiene catálogo, carrito, pagos y pedidos.',
      },
      INDEPENDIENTE,
    ],
  },

  tienda: {
    antetitulo: 'Tiendas online',
    titular: 'Tu tienda online, en tus manos',
    incluye: [
      {
        titulo: 'Catálogo y categorías',
        texto: 'Tus productos con fotos, precios, variantes y stock, ordenados para que se encuentren rápido.',
      },
      {
        titulo: 'Compra en pocos pasos',
        texto: 'Un carrito y un pago cortos y claros, pensados primero para el celular.',
      },
      {
        titulo: 'Pagos en línea',
        texto: 'Cobros con tarjeta de débito y crédito a través de una pasarela de pago, con la plata en tu cuenta.',
      },
      {
        titulo: 'Pedidos con su estado',
        texto: 'Cada compra llega como un pedido: pagado, preparado, enviado o entregado. Siempre sabes en qué va.',
      },
      {
        titulo: 'Tus estadísticas',
        texto: 'Qué se vende, cuánto y cuándo, para decidir con números y no a ojo.',
      },
      {
        titulo: 'La administras tú',
        texto: 'Subir un producto, cambiar un precio o marcar un pedido como enviado lo haces tú, sin tener que escribirnos.',
      },
    ],
    cuando: [
      'Vendes por Instagram o WhatsApp y respondes precios y stock a mano todo el día.',
      'Pagas comisiones en un marketplace y quieres un canal propio.',
      'Llevas los pedidos en un cuaderno o en una planilla.',
      'Quieres vender fuera de tu horario o fuera de tu ciudad.',
    ],
    pedimos: [
      'Tu catálogo: nombre, precio y fotos de cada producto. Una planilla sirve.',
      'Cómo despachas y cuánto cobras por el envío.',
      'Una cuenta en la pasarela de pago, a nombre de tu negocio.',
      'Tus condiciones de cambio y devolución.',
    ],
    preguntas: [
      { pregunta: '¿Cuánto cuesta una tienda online?', respuesta: PRECIO },
      {
        pregunta: '¿Por qué una tienda propia y no solo un marketplace?',
        respuesta:
          'En un marketplace vendes en la vitrina de otro, con sus reglas y sus comisiones. En tu tienda, los clientes y los datos son tuyos. Muchos negocios usan los dos: el marketplace para que los encuentren y la tienda para que vuelvan.',
      },
      {
        pregunta: '¿Puedo administrar la tienda yo mismo?',
        respuesta:
          'Sí, esa es la idea. Subir productos, cambiar precios y gestionar pedidos lo haces tú desde un panel, sin depender de nosotros.',
      },
      {
        pregunta: '¿Mi tienda cumple la Ley 21.719 de datos personales?',
        respuesta:
          'Una tienda trata datos de sus clientes: nombre, dirección, correo y lo que compran. La construimos con consentimiento claro, pidiendo solo los datos necesarios y con un canal para que cada cliente ejerza sus derechos.',
      },
      INDEPENDIENTE,
    ],
  },

  app: {
    antetitulo: 'Desarrollo de software a medida',
    titular: 'Software hecho a tu medida',
    incluye: [
      {
        titulo: 'Apps para iOS y Android',
        texto: 'Para tus clientes o para tu equipo: publicadas en App Store y Google Play, o solo en los teléfonos de tu empresa.',
      },
      {
        titulo: 'Aplicaciones web',
        texto: 'Se abren desde el navegador, sin instalar nada, en el computador de la oficina o en el celular.',
      },
      {
        titulo: 'Conectado a tus datos',
        texto: 'Se integra con lo que ya usas: planillas, tu sistema de ventas, tu facturación o cualquier servicio con API.',
      },
      {
        titulo: 'Una base para todo',
        texto: 'La app, la web y el panel trabajan sobre los mismos datos: lo que cambias en uno se ve en los otros.',
      },
      {
        titulo: 'Usuarios y permisos',
        texto: 'Cada persona entra con su cuenta y ve y hace solo lo que le corresponde.',
      },
      {
        titulo: 'Seguro desde el inicio',
        texto: 'Accesos protegidos, datos cifrados donde corresponde y lo que pide la Ley 21.719, pensado desde el diseño y no al final.',
      },
    ],
    cuando: [
      'Tu forma de trabajar no calza con ningún software del mercado, o lo tienes que forzar.',
      'Pagas varias herramientas que no se hablan entre sí.',
      'Tienes una idea de producto y necesitas llevarla a una app real.',
      'Tu equipo repite a mano lo que una aplicación podría hacer sola.',
    ],
    pedimos: [
      'Quién lo va a usar y para qué: clientes, trabajadores o tú.',
      'Cómo lo resuelves hoy, aunque sea en papel o en una planilla.',
      'Acceso a los sistemas con los que se tiene que conectar.',
      'Una persona de tu lado que pruebe cada entrega.',
    ],
    prueba: {
      proyecto: 'ponlenota',
      texto: 'PonleNota es nuestro: un sitio, una app Android para el negocio y un panel web, los tres sobre la misma base de datos.',
    },
    preguntas: [
      { pregunta: '¿Cuánto cuesta desarrollar una app?', respuesta: PRECIO },
      {
        pregunta: '¿Conviene software a medida o uno ya hecho?',
        respuesta:
          'Si un producto del mercado resuelve tu proceso sin forzarlo, úsalo: es más barato y está listo hoy. El software a medida conviene cuando tu forma de trabajar es tu ventaja, cuando pagas varias herramientas que no se conectan o cuando el software es tu negocio.',
      },
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
    ],
  },

  agente: {
    antetitulo: 'Agentes de IA',
    titular: 'IA que conoce tu negocio',
    incluye: [
      {
        titulo: 'Responde con lo tuyo',
        texto: 'Contesta con tus documentos, tu catálogo, tus horarios o tu base de datos, y no con lo que inventaría un chat genérico.',
      },
      {
        titulo: 'Atiende solicitudes',
        texto: 'Agenda horas, toma pedidos, prepara cotizaciones o deriva a una persona cuando hace falta.',
      },
      {
        titulo: 'Hace, no solo conversa',
        texto: 'Consulta tus sistemas, completa registros y avisa a tu equipo: un agente actúa sobre tus herramientas.',
      },
      {
        titulo: 'A cualquier hora',
        texto: 'En tu web o en tus canales de mensajería, también de noche y en fin de semana.',
      },
      {
        titulo: 'Probado antes de salir',
        texto: 'Lo probamos con preguntas reales antes de publicarlo, acotamos lo que puede hacer y queda registro de cada respuesta.',
      },
      {
        titulo: 'Sabe cuándo no sabe',
        texto: 'Si no tiene la respuesta, lo dice y deriva a una persona en vez de adivinar.',
      },
    ],
    cuando: [
      'Respondes las mismas preguntas todos los días.',
      'Los mensajes llegan fuera de horario y se quedan sin respuesta.',
      'Tu equipo pierde tiempo buscando información en documentos o sistemas.',
      'Quieres usar IA, pero con tus datos y bajo tu control.',
    ],
    pedimos: [
      'Las preguntas que más te hacen y cómo las respondes hoy.',
      'Los documentos o sistemas de donde sale la información.',
      'Qué puede resolver solo y qué tiene que pasar por una persona.',
      'Ejemplos de conversaciones reales, sin datos personales.',
    ],
    prueba: {
      proyecto: 'hackathon',
      texto: 'Nuestro agente para alertas de infraestructura ganó el segundo lugar con un jurado externo. Su código es público.',
    },
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
    ],
  },

  automatizacion: {
    antetitulo: 'Automatización de procesos',
    titular: 'Deja de copiar y pegar',
    incluye: [
      {
        titulo: 'Datos que se mueven solos',
        texto: 'Lo que entra por un lado aparece en el otro: del formulario a la planilla, de la venta al inventario, del correo al sistema.',
      },
      {
        titulo: 'Formularios y documentos',
        texto: 'Leemos formularios, PDF y correos, sacamos los datos que importan y los dejamos donde tienen que estar.',
      },
      {
        titulo: 'Avisos a tiempo',
        texto: 'Un mensaje a la persona correcta cuando pasa algo: un pedido nuevo, un pago atrasado, un stock que se acaba.',
      },
      {
        titulo: 'Tareas programadas',
        texto: 'Reportes que se envían solos cada lunes, respaldos cada noche y recordatorios antes de cada vencimiento.',
      },
      {
        titulo: 'Registro de todo',
        texto: 'Cada paso queda anotado, para saber qué pasó y cuándo, y para que nada falle en silencio.',
      },
      {
        titulo: 'Con lo que ya usas',
        texto: 'Tu correo, tus planillas, Google Workspace, Microsoft 365 o tu sistema: conectamos lo que tienes antes de proponerte algo nuevo.',
      },
    ],
    cuando: [
      'Copias datos de un sistema a otro varias veces al día.',
      'Alguien de tu equipo pasa horas armando el mismo reporte.',
      'Se te pasan vencimientos, cobros o seguimientos.',
      'Un error de tipeo ya te costó plata.',
    ],
    pedimos: [
      'Un recorrido por la tarea: quién la hace, con qué y cada cuánto.',
      'Acceso a las herramientas que hay que conectar.',
      'Ejemplos reales de lo que entra y de lo que tiene que salir.',
      'Quién recibe el aviso cuando algo no se puede completar.',
    ],
    prueba: {
      proyecto: 'hackathon',
      texto: 'Nuestro agente atiende solo las alertas de infraestructura: junta el contexto de varios sistemas y propone un diagnóstico, sin esperar a una persona.',
    },
    preguntas: [
      {
        pregunta: '¿Qué procesos conviene automatizar primero?',
        respuesta:
          'Los que se repiten seguido, siguen siempre los mismos pasos y hoy se hacen copiando y pegando. Si una tarea ocurre varias veces por semana y nadie tiene que decidir nada en ella, es buena candidata.',
      },
      {
        pregunta: '¿Tengo que cambiar mis herramientas?',
        respuesta:
          'Casi nunca. Lo normal es conectar lo que ya usas; solo te proponemos algo nuevo si lo que tienes no se puede conectar.',
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
    ],
  },

  gestion: {
    antetitulo: 'Sistemas de gestión',
    titular: 'Tu negocio en un solo lugar',
    incluye: [
      {
        titulo: 'Inventario',
        texto: 'El stock de cada producto con sus entradas y salidas, y un aviso cuando algo se está acabando.',
      },
      {
        titulo: 'Clientes',
        texto: 'La ficha de cada cliente con su historial: qué compró, qué cotizó y qué se conversó.',
      },
      {
        titulo: 'Agenda',
        texto: 'Horas, turnos y reservas a la vista de todo el equipo, sin topes ni dobles reservas.',
      },
      {
        titulo: 'Cotizaciones',
        texto: 'Cotizaciones con tu formato en minutos, y el seguimiento de cuáles se cerraron.',
      },
      {
        titulo: 'Tus números al día',
        texto: 'Un panel con las ventas, los pedidos o lo que importe en tu negocio, sin armar reportes a mano.',
      },
      {
        titulo: 'Cada uno en lo suyo',
        texto: 'Usuarios y permisos según el rol de cada persona, y acceso desde cualquier dispositivo.',
      },
    ],
    cuando: [
      'Tu operación vive en planillas que solo una persona entiende.',
      'Dos personas editan el mismo archivo y nadie sabe cuál es la versión buena.',
      'No sabes cuánto vendiste este mes sin pasar una tarde sumando.',
      'Pagas un sistema genérico y usas la mitad, o le falta justo lo que necesitas.',
    ],
    pedimos: [
      'Tus planillas actuales, tal como están.',
      'Quién usa el sistema y qué necesita ver cada uno.',
      'Los números que quieres mirar cada semana.',
      'Una persona de tu lado que pruebe cada entrega.',
    ],
    prueba: {
      proyecto: 'ponlenota',
      vista: 'El panel web',
      texto: 'El panel web de PonleNota es un sistema de gestión: el negocio ve sus valoraciones, cupones y campañas, y cómo va el mes.',
    },
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
        pregunta: '¿Funciona en el celular?',
        respuesta: 'Sí. Se usa desde el navegador en el computador, la tablet o el celular, sin instalar nada.',
      },
      {
        pregunta: '¿Se conecta con otros sistemas?',
        respuesta:
          'Puede conectarse con tu facturación, tu tienda online o tus planillas, para que la misma información no se escriba dos veces.',
      },
      { pregunta: '¿Cuánto cuesta un sistema de gestión?', respuesta: PRECIO },
      INDEPENDIENTE,
    ],
  },

  prospeccion: {
    antetitulo: 'Prospección de clientes',
    titular: 'Tus próximos clientes, en una planilla',
    incluye: [
      {
        titulo: 'Tu zona, en el mapa',
        texto: 'Marcamos el área exacta: un barrio, una comuna o un polígono a tu medida. Solo entran los negocios que quedan dentro.',
      },
      {
        titulo: 'Los rubros que te sirven',
        texto: 'Restaurantes, peluquerías, veterinarias, hoteles o el rubro al que le vendes. Cada negocio aparece una sola vez.',
      },
      {
        titulo: 'Con su contacto',
        texto: 'El correo que cada negocio publica en su propio sitio web. Si no publica uno, la celda queda vacía: no lo adivinamos.',
      },
      {
        titulo: 'Su reputación',
        texto: 'La valoración en Google y cuántas reseñas la sostienen, con un aviso cuando una nota alta descansa en muy pocas.',
      },
      {
        titulo: 'Los que no tienen web',
        texto: 'Una pestaña aparte con los negocios sin sitio web: los primeros a los que ofrecer presencia en internet.',
      },
      {
        titulo: 'En Google Sheets y Excel',
        texto: 'Una planilla compartida, ordenada por pestañas, y una copia en Excel con la fecha de la búsqueda.',
      },
    ],
    principio: {
      titulo: 'Siempre datos públicos',
      puntos: [
        'Todo sale de lo que cada negocio publica: su ficha en Google Maps y su propio sitio web.',
        'No compramos bases de datos ni usamos información privada.',
        'Son datos de negocios, no de personas: el nombre del local, su correo de contacto, su nota y su web.',
      ],
    },
    cuando: [
      'Le vendes a negocios y no sabes por dónde empezar a buscarlos.',
      'Tu equipo arma listas a mano, buscando local por local.',
      'Quieres abrir una zona o un rubro nuevo y saber cuántos negocios hay.',
      'Ofreces páginas web o marketing y quieres encontrar a quienes todavía no tienen.',
    ],
    pedimos: [
      'La zona: comunas, barrios o un área marcada en el mapa.',
      'Los rubros de los negocios que te interesan.',
      'Qué datos te importan y en qué orden quieres verlos.',
      'Una cuenta de Google para compartirte la planilla, si la quieres en Sheets.',
    ],
    preguntas: [
      {
        pregunta: '¿De dónde salen los datos?',
        respuesta:
          'Solo de fuentes públicas: la ficha que cada negocio tiene en Google Maps y su propio sitio web. No compramos bases de datos ni usamos información privada.',
      },
      {
        pregunta: '¿Qué trae cada negocio?',
        respuesta:
          'Su nombre, el correo de contacto que publica en su sitio web, su valoración en Google, cuántas reseñas tiene y su sitio web, si tiene uno.',
      },
      {
        pregunta: 'Si el dato es público, ¿puedo usarlo para cualquier cosa?',
        respuesta:
          'No. Desde el 1 de diciembre de 2026, la Ley 21.719 también rige los datos que vienen de fuentes públicas. Úsalos para lo que el negocio los publicó, que lo contacten, y saca de tu lista a quien te pida que no le escribas más.',
      },
      {
        pregunta: '¿Los datos se actualizan?',
        respuesta:
          'Cada búsqueda es una foto del día en que se hace, con su fecha en el archivo. Si quieres seguir una zona en el tiempo, se repite y comparas.',
      },
      { pregunta: '¿Cuánto cuesta una búsqueda?', respuesta: PRECIO },
      INDEPENDIENTE,
    ],
  },
}

/**
 * Cómo trabajamos, igual para todos los servicios: cuatro pasos y, en cada
 * uno, qué pones tú. Sin plazos, por lo mismo que arriba.
 */
export const PROCESO = [
  { titulo: 'Nos cuentas el problema', pones: 'El problema, en tus palabras.' },
  { titulo: 'Te mandamos alcance y precio', pones: 'Decidir si seguimos. Sin compromiso.' },
  { titulo: 'Construimos por entregas revisables', pones: 'Media hora por entrega para revisarla.' },
  { titulo: 'Lo publicamos y te lo entregamos', pones: 'Los accesos. El código queda a tu nombre.' },
]
