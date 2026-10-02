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
 * Los logros sin obra que abrir (un premio individual) entran con
 * `publicacion`: el enlace al resultado publicado, que es su prueba.
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
    id: 'ponlenota',
    nombre: 'PonleNota',
    resumen:
      'ponlenota.cl convierte cada visita a un negocio local en una valoración privada y, si el cliente quiere, en una reseña en Google.',
    sitio: 'https://ponlenota.cl',
    // Cómo funciona, a la vista aunque la vitrina esté plegada: es lo que
    // necesita entender quien no la abre. El cupón va en su propia frase y con
    // su propio «si»: no depende de la reseña, porque Google prohíbe premiar
    // reseñas y PonleNota está hecho así a propósito.
    pasos: [
      'El cliente acerca el teléfono a una tarjeta NFC o escanea un QR. No descarga nada ni crea una cuenta.',
      'Pone su nota, de 1 a 5. Esa nota la ve solo el negocio.',
      'Si quiere, publica su opinión en Google. Si el negocio ofrece un beneficio, se lleva un cupón para volver.',
    ],
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
        texto: 'Explica el producto y vende los planes. Pensado para aparecer en Google.',
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
        texto: 'Se abre en el navegador: primero las estrellas, sin pedirle nada. Al final elige si deja su opinión en Google o pide su beneficio.',
        tono: 'ciruela',
        imagen: {
          src: '/image/ponlenota-cliente-320.webp',
          srcSet: '/image/ponlenota-cliente-320.webp 320w, /image/ponlenota-cliente-628.webp 628w',
          sizes: '(min-width: 650px) 18rem, 70vw',
          ancho: 320,
          alto: 700,
          alt: 'Un teléfono con la valoración de Café Luna: cinco estrellas, el agradecimiento y los botones para dejar la opinión en Google o pedir el beneficio.',
        },
      },
      {
        titulo: 'La app del negocio',
        // Solo Android: la de iPhone existe, pero sin TestFlight ni prueba con
        // NFC real todavía, así que no se anuncia.
        texto: 'El negocio, el equipo, las tarjetas NFC y los cupones, desde un teléfono o una tablet Android. Es la que graba las tarjetas.',
        imagen: {
          src: '/image/ponlenota-app-640.webp',
          srcSet: '/image/ponlenota-app-640.webp 640w, /image/ponlenota-app-960.webp 960w',
          sizes: '(min-width: 650px) 18rem, 70vw',
          ancho: 640,
          alto: 1536,
          alt: 'El inicio de la app de PonleNota para Café Luna: 1240 toques, 486 valoraciones, 212 cupones entregados y 97 canjeados este mes, los accesos rápidos y la campaña activa de un café americano gratis.',
        },
      },
      {
        titulo: 'El panel web',
        texto: 'Casi todo lo de la app, en el computador de la caja: valoraciones, cupones, campañas y cómo va el mes.',
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
    id: 'cybergames',
    nombre: 'Desafío de ciberseguridad',
    // Un logro y no una obra: no hay código que abrir, así que la prueba es la
    // publicación del resultado. Va antes que el hackathon porque es un primer
    // lugar y la competencia es continental.
    destacado: true,
    credencial: { puesto: '1°', metal: 'oro', titulo: 'Primer lugar', evento: 'Cisco CyberGames Americas 2026' },
    resumen:
      'Rodrigo, socio de Volutus, resolvió las tres misiones de un desafío de ciberseguridad de tres horas, frente a más de 1.000 estudiantes de 21 países.',
    publicacion:
      'https://www.linkedin.com/feed/update/urn:li:activity:7479866884285460481/',
  },

  {
    id: 'hackathon',
    nombre: 'Hackathon Huawei Cloud',
    // Validado por un jurado externo, como el de arriba: por eso también va
    // destacado. Todo lo demás lo valoramos nosotros mismos.
    destacado: true,
    credencial: { puesto: '2°', metal: 'plata', titulo: 'Segundo lugar', evento: 'Hackathon de Huawei Cloud y Kostra AI' },
    resumen:
      'Un agente de IA que atiende por su cuenta las alertas de infraestructura: reúne el contexto de varios sistemas y propone un diagnóstico con su evidencia, en tiempo real, usando servicios MaaS.',
    repositorio: 'https://github.com/DiegoPyLL/Hackathon-Huawei-Cloud-MaaS',
    publicacion:
      'https://www.linkedin.com/posts/rodrigo-mart%C3%ADnez-becker-74b6ab241_agenticai-huaweicloud-hackathon-activity-7504179855928913920-ztEm',
  },



  
  {
    id: 'carflip',
    nombre: 'CarFlip',
    resumen:
      'Un portal chileno de autos usados donde publican particulares y automotoras. Sobre su propio catálogo calcula estadísticas de mercado y detecta oportunidades.',
    repositorio: 'https://github.com/DiegoPyLL/CarFlip',
  },
]
