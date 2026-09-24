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
 * - `carflip.cl` responde 500. Entra por su repositorio, no por su sitio.
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
      'Un agente que recibe una alerta de infraestructura, reúne el contexto disperso en varios sistemas y propone el diagnóstico con la evidencia que lo sostiene.',
    repositorio: 'https://github.com/DiegoPyLL/Hackathon-Huawei-Cloud-MaaS',
  },
  {
    id: 'ponlenota',
    nombre: 'PonleNota',
    resumen:
      'Plataforma NFC para negocios locales: el cliente toca con el móvil, valora en menos de un minuto y se lleva un cupón para volver.',
    sitio: 'https://ponlenota.cl',
  },
  {
    id: 'carflip',
    nombre: 'CarFlip',
    resumen:
      'Indexador de automotores que rastrea varios sitios de venta y los deja consultables en un solo lugar.',
    repositorio: 'https://github.com/DiegoPyLL/CarFlip',
  },
]
