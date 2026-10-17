/**
 * Lo que ofrecemos. Una sola lista para todo el sitio.
 *
 * Cada servicio es independiente: el cliente puede contratar una prestación
 * sin necesitar contratar otra previamente. Los puntos describen capacidades
 * concretas de la solución, no dependencias entre servicios.
 *
 * `color` es el de su card en la rueda y el de su página: la costa —mar hondo,
 * roca, coral, atardecer, arena quemada, alga, huiro y ola—, colores hondos
 * para contrastar con el cielo y sin morado (DESIGN-BRIEF, A.2). El blanco
 * encima da 5.5:1 o más.
 *
 * `ruta` es la de su página propia (paginas/Servicio.jsx), bajo /servicios,
 * el índice de todos, y tiene que estar declarada en PAGINAS (lib/meta.js). La ley de datos no tiene página
 * de servicio: su card lleva a la guía de la ley (`enlace`).
 */
export const SERVICIOS = [
  {
    id: 'web',
    color: '#007192',
    ruta: '/servicios/desarrollo-web',
    nombre: 'Páginas web',
    opcion: 'Una página web',
    texto: 'Una web rápida, clara y pensada para convertir visitas en clientes.',
    puntos: [
      'Diseño responsivo para celulares, tablets y computadores',
      'Optimización para el SEO de Google',
      'Tu identidad de marca plasmada como tú quieres',
    ],
    enlace: null,
  },

  {
    id: 'tienda',
    color: '#405f74',
    ruta: '/servicios/tiendas-online',
    nombre: 'Tiendas online',
    opcion: 'Una tienda online',
    texto: 'Vende tus productos por internet con una tienda que puedas administrar.',
    puntos: [
      'Catálogo de productos y categorías',
      'Carrito y proceso de compra',
      'Pagos y gestión de pedidos',
      'Seguimiento de tus estadísticas',
    ],
    enlace: null,
  },

  {
    id: 'app',
    color: '#b8342c',
    ruta: '/servicios/desarrollo-software-a-medida',
    nombre: 'Aplicaciones',
    opcion: 'Una app',
    texto: 'Una aplicación hecha para resolver una necesidad concreta de tu negocio.',
    puntos: [
      'Para clientes, trabajadores o uso interno',
      'Conectada a tus datos y sistemas',
      'Desarrollo en iOS y Android',
    ],
    enlace: null,
  },

  {
    id: 'gestion',
    color: '#af4000',
    ruta: '/servicios/sistemas-de-gestion',
    nombre: 'Sistemas de gestión',
    opcion: 'Un sistema de gestión',
    texto: 'Un sistema a la medida para ordenar la operación de tu negocio en un solo lugar.',
    puntos: [
      'Inventario, clientes, agenda o cotizaciones',
      'Paneles con los números de tu negocio',
      'Usuarios y permisos según su rol',
      'Acceso desde cualquier dispositivo',
    ],
    enlace: null,
  },

  {
    id: 'agente',
    color: '#905500',
    ruta: '/servicios/agentes-ia',
    nombre: 'Agentes de IA',
    opcion: 'Un agente de IA',
    texto: 'Un agente de IA que entiende tu información y se encarga de tareas por ti.',
    puntos: [
      'Responde preguntas y solicitudes',
      'Trabaja con la información de tu negocio',
      'Disponible cuando tus clientes lo necesiten',
      'Enfoque en la consistencia y resiliencia del modelo',
    ],
    enlace: null,
  },

  {
    id: 'automatizacion',
    color: '#005d37',
    ruta: '/servicios/automatizacion-procesos',
    nombre: 'Automatizaciones',
    opcion: 'Una automatización',
    texto: 'Conectamos tus herramientas para que las tareas repetitivas ocurran automáticamente.',
    puntos: [
      'Traspaso automático de información',
      'Procesamiento de formularios y documentos',
      'Avisos, registros y tareas programadas',
    ],
    enlace: null,
  },

  {
    id: 'prospeccion',
    color: '#007156',
    ruta: '/servicios/prospeccion-de-clientes',
    nombre: 'Prospección de clientes',
    opcion: 'Encontrar clientes potenciales',
    texto: 'Encontramos los negocios de tu rubro y zona con sus datos de contacto, listos para ofrecerles lo tuyo.',
    puntos: [
      'Búsqueda por rubro y zona en Google Maps',
      'Correos y teléfonos desde sus sitios web',
      'Lista ordenada en Google Sheets o Excel',
      'Detección de negocios sin sitio web',
    ],
    enlace: null,
  },

  {
    id: 'datos',
    color: '#00588d',
    nombre: 'Ley de datos',
    opcion: 'Adaptarme a la ley de datos',
    texto: 'Adaptamos técnicamente tus sistemas para gestionar los datos personales de acuerdo con la Ley 21.719.',
    puntos: [
      'Gestión del consentimiento',
      'Privacidad y control de los datos',
      'Recopilación de solo la información necesaria',
    ],
    enlace: '/ley21719',
  },
]

/** Las opciones del menú del formulario: un servicio de la lista, u otra cosa. */
export const OPCIONES_DE_CONTACTO = [
  ...SERVICIOS.map((s) => s.opcion),
  'Otro',
]