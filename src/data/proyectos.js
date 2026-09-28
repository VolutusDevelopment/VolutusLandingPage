/**
 * El índice de obra (DESIGN-BRIEF §4).
 *
 * La regla que manda aquí es dura y no admite excepciones: **un proyecto que no
 * tenga repositorio público o URL en línea que se pueda abrir no entra en la
 * página.** Para una empresa sin clientes, la obra abierta es la única
 * credencial que hay, y un enlace roto produce el efecto contrario al buscado.
 *
 * Por eso `sitio` y `repositorio` son los dos opcionales y el componente pinta
 * solo los que existen: un proyecto entra si tiene AL MENOS UNO de los dos. Así
 * el día que un repositorio se haga público o se arregle un sitio, el cambio es
 * una línea de este archivo y no una sección nueva.
 *
 * Estado verificado el 2026-09-24, y no coincide con lo que el brief daba por
 * hecho:
 *
 * - `VolutusDevelopment/PonleNota-WEB` es PRIVADO. Entra por su sitio, no por
 *   su código.
 * - `carflip.cl` responde 500. Entra por su repositorio, no por su sitio, y
 *   por eso no lleva captura: no hay página que fotografiar.
 * - El traspaso de repositorios a la organización (decisión 13 del registro)
 *   NO se ha hecho: CarFlip y el de la hackathon siguen en la cuenta personal.
 *
 * Los enlaces de abajo son los que funcionan HOY. Cuando se ejecute el traspaso
 * hay que actualizarlos; GitHub mantiene la redirección, así que el orden
 * correcto es traspasar primero y editar esto después.
 */

export const PROYECTOS = [
  {
    id: 'hackathon',
    nombre: 'Agente de respuesta a incidentes',
    // Es la única prueba validada por un tercero que existe hoy, así que va
    // primero y destacada. Todo lo demás lo valoramos nosotros mismos.
    destacado: true,
    credencial: 'Segundo lugar, hackathon de IA agéntica',
    resumen:
      'Recibe una alerta de infraestructura, reúne el contexto de varios sistemas y propone el diagnóstico con su evidencia.',
    repositorio: 'https://github.com/DiegoPyLL/Hackathon-Huawei-Cloud-MaaS',
  },
  {
    id: 'ponlenota',
    nombre: 'PonleNota',
    resumen:
      'Plataforma NFC para negocios: el cliente valora en un minuto y se lleva un cupón para volver.',
    sitio: 'https://ponlenota.cl',
    // Las tres caras del producto, cada una con su captura real. Sin `vistas`
    // un proyecto se pinta como tarjeta simple; con ellas, como vitrina (ver
    // `Vitrina` en Proyectos.jsx). El orden fija la forma: ancha, alta,
    // desplazada y a la derecha. Sin `tono` la tarjeta queda en el bosque de
    // la zona de plano.
    //
    // La web es de ponlenota.cl (25-09-2026). El cliente es la demo de la
    // propia web, sin guardar nada. La app y el panel son las pantallas reales
    // de Android y de la web, pintadas con un negocio de ejemplo (Café Luna) y
    // datos inventados: ningún dato de un cliente real.
    vistas: [
      {
        titulo: 'El sitio',
        texto: 'Explica el producto y vende los planes. Hecho para aparecer en Google.',
        tono: 'petroleo',
        imagen: {
          src: '/image/ponlenota-1280.webp',
          srcSet: '/image/ponlenota-760.webp 760w, /image/ponlenota-1280.webp 1280w',
          sizes: '(min-width: 1024px) 50vw, 100vw',
          ancho: 1280,
          alto: 800,
          alt: 'La portada de ponlenota.cl: el titular «Opiniones privadas. Reseñas en Google» junto a una tarjeta con la valoración media de un café de ejemplo.',
        },
      },
      {
        titulo: 'Lo que ve el cliente',
        texto: 'Toca la tarjeta, valora en un minuto y se lleva un cupón. Sin descargar nada.',
        tono: 'ciruela',
        imagen: {
          src: '/image/ponlenota-cliente-320.webp',
          srcSet: '/image/ponlenota-cliente-320.webp 320w, /image/ponlenota-cliente-628.webp 628w',
          sizes: '(min-width: 1024px) 18rem, 70vw',
          ancho: 320,
          alto: 700,
          alt: 'Un teléfono con la valoración de Café Luna: cinco estrellas, el agradecimiento y los botones para dejar la opinión en Google o pedir el beneficio.',
        },
      },
      {
        titulo: 'La app del negocio',
        texto: 'Toques, valoraciones y cupones en el teléfono del dueño. App Android.',
        imagen: {
          src: '/image/ponlenota-app-640.webp',
          srcSet: '/image/ponlenota-app-640.webp 640w, /image/ponlenota-app-960.webp 960w',
          sizes: '(min-width: 1024px) 20rem, 70vw',
          ancho: 640,
          alto: 831,
          alt: 'El inicio de la app de PonleNota para Café Luna: 1240 toques, 486 valoraciones, 212 cupones entregados y 97 canjeados este mes, y la campaña activa.',
        },
      },
      {
        titulo: 'El panel web',
        texto: 'Lo mismo que la app, en el computador de la caja: toques por día y cómo va el mes.',
        tono: 'pizarra',
        imagen: {
          src: '/image/ponlenota-panel-1280.webp',
          srcSet: '/image/ponlenota-panel-760.webp 760w, /image/ponlenota-panel-1280.webp 1280w',
          sizes: '(min-width: 1024px) 50vw, 100vw',
          ancho: 1280,
          alto: 524,
          alt: 'El resumen del panel web de PonleNota para Café Luna: 1240 taps, 486 valoraciones, 212 cupones emitidos y 97 canjeados, con el gráfico de taps por día de los últimos 30 días.',
        },
      },
    ],
  },
  {
    id: 'carflip',
    nombre: 'CarFlip',
    resumen:
      'Rastrea varios sitios de venta de autos y los deja todos consultables en un solo lugar.',
    repositorio: 'https://github.com/DiegoPyLL/CarFlip',
  },
]
