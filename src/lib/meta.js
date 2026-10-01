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
 * `indexar: false` es para la 404: se sirve en cualquier dirección que no
 * existe, así que no tiene una URL propia que declarar ni debe aparecer en un
 * buscador.
 */

export const ORIGEN = 'https://volutus.cl'

export const PAGINAS = {
  '/': {
    archivo: 'index.html',
    titulo: 'Páginas web, apps y agentes de IA en Chile — Volutus',
    descripcion:
      'Creamos páginas web, tiendas online, apps, agentes de IA y automatizaciones para tu negocio. Te responde una persona en menos de 48 horas hábiles.',
  },
  '/nosotros': {
    archivo: 'nosotros.html',
    titulo: 'Quiénes somos — Volutus',
    descripcion:
      'Volutus es una empresa de desarrollo de software en Chile. Quiénes somos, cómo trabajamos y por qué nos llamamos como una nube.',
  },
  '/privacidad': {
    archivo: 'privacidad.html',
    titulo: 'Privacidad y protección de datos — Volutus',
    descripcion:
      'Qué datos trata Volutus cuando escribes por el formulario, con quién se comparten, cuánto se conservan y cómo ejercer tus derechos bajo la ley chilena.',
  },
  '/404': {
    archivo: '404.html',
    titulo: 'Página no encontrada — Volutus',
    descripcion:
      'Puede que el enlace esté mal escrito o que la página se haya movido. Desde aquí puedes volver a la portada, ver los proyectos o escribirnos.',
    indexar: false,
  },
}

/**
 * El canonical se DERIVA, no se escribe a mano. Es lo que garantiza que la URL
 * del canonical, la del sitemap y la de `og:url` sean la misma cadena exacta:
 * `/privacidad` y `/privacidad/` son dos URLs distintas para un buscador.
 */
export const canonicalDe = (ruta) => (ruta === '/' ? `${ORIGEN}/` : `${ORIGEN}${ruta}`)
