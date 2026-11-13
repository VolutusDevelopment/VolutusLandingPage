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
 * `credencial.corto` es el nombre en la tabla de honor del podio, en letra
 * pixel: cabe en una línea del teléfono con unos 18 caracteres.
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
    // El fondo de su ícono, que pinta la mancha de la lámina: blanco, con el
    // símbolo en sus colores (ver LogoProyecto.jsx).
    fondoIcono: '#ffffff',
    resumen:
      'ponlenota.cl convierte cada visita a un negocio local en una valoración privada y, si el cliente quiere, en una reseña en Google.',
    sitio: 'https://ponlenota.cl',
    // Tres caras del producto, cada una con su captura real, en la vitrina de
    // la lámina. `forma` dice cómo se enmarca: `pantalla` va en una ventana,
    // `telefono` ya trae su teléfono dibujado y `app` es la pantalla sola, así
    // que la vitrina le pone el borde del teléfono.
    //
    // La web es de ponlenota.cl (25-09-2026). El cliente es la demo de la
    // propia web, sin guardar nada. La app es la pantalla real de Android,
    // pintada con un negocio de ejemplo (Café Luna) y datos inventados: ningún
    // dato de un cliente real.
    vistas: [
      {
        forma: 'pantalla',
        imagen: {
          src: '/image/ponlenota-1280.webp',
          srcSet: '/image/ponlenota-760.webp 760w, /image/ponlenota-1280.webp 1280w',
          ancho: 1280,
          alto: 800,
          alt: 'La portada de ponlenota.cl: el titular «Opiniones privadas. Reseñas en Google» junto a una tarjeta con la valoración media de un café de ejemplo.',
        },
      },
      {
        forma: 'telefono',
        imagen: {
          src: '/image/ponlenota-cliente-320.webp',
          srcSet: '/image/ponlenota-cliente-320.webp 320w, /image/ponlenota-cliente-628.webp 628w',
          ancho: 320,
          alto: 700,
          alt: 'Un teléfono con la valoración de Café Luna: cinco estrellas, el agradecimiento y los botones para dejar la opinión en Google o pedir el beneficio.',
        },
      },
      {
        forma: 'app',
        imagen: {
          src: '/image/ponlenota-app-640.webp',
          srcSet: '/image/ponlenota-app-640.webp 640w, /image/ponlenota-app-960.webp 960w',
          ancho: 640,
          alto: 2636,
          alt: 'El inicio de la app de PonleNota para Café Luna: 1240 toques, 486 valoraciones, 212 cupones entregados y 97 canjeados este mes, los accesos rápidos y la campaña activa de un café americano gratis.',
        },
      },
    ],
  },

  {
    id: 'carflip',
    nombre: 'CarFlip',
    // El azul de su marca (`--c-accent` de su sistema de diseño). No tiene
    // símbolo propio, así que la mancha lleva su inicial.
    fondoIcono: '#1873b3',
    resumen:
      'Un portal chileno de autos usados donde publican particulares y automotoras. Sobre su propio catálogo calcula estadísticas de mercado y detecta oportunidades.',
    repositorio: 'https://github.com/DiegoPyLL/CarFlip',
  },

  {
    id: 'cybergames',
    nombre: 'Cisco Cybergames 2026',
    destacado: true,
    credencial: { corto: 'Cisco CyberGames', puesto: '1°', metal: 'oro', titulo: 'Primer lugar', evento: 'Cisco CyberGames Americas 2026' },
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
    credencial: { corto: 'Hackathon Huawei', puesto: '2°', metal: 'plata', titulo: 'Segundo lugar', evento: 'Hackathon de Huawei Cloud y Kostra AI' },
    resumen:
      'Un agente de IA que atiende por su cuenta las alertas de infraestructura: reúne el contexto de varios sistemas y propone un diagnóstico con su evidencia, en tiempo real, usando servicios MaaS.',
    repositorio: 'https://github.com/DiegoPyLL/Hackathon-Huawei-Cloud-MaaS',
    publicacion:
      'https://www.linkedin.com/posts/rodrigo-mart%C3%ADnez-becker-74b6ab241_agenticai-huaweicloud-hackathon-activity-7504179855928913920-ztEm',
  },

  {
    id: 'ctf-pdi',
    nombre: 'Capture the Flag PDI',
    // Validado por un jurado externo, como el de arriba: por eso también va
    // destacado. Todo lo demás lo valoramos nosotros mismos.
    destacado: true,
    credencial: { corto: 'CTF PDI', puesto: '2°', metal: 'plata', titulo: 'Segundo lugar', evento: '9° Seminario Internacional de Ciberseguridad PDI' },
    resumen:
      'El Capture the Flag (CTF) de ciberseguridad de la PDI de Chile permite poner a prueba habilidades técnicas mediante desafíos de identificación de vulnerabilidades, análisis digital y resolución de problemas. Code Cadaver, una experiencia inmersiva de Biohacking Village, propone investigar la desaparición de un amigo resolviendo retos relacionados con sistemas informáticos hospitalarios, redes y dispositivos médicos.',
    repositorio: '',
    publicacion: '',
  },
]
