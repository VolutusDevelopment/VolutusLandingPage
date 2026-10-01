/**
 * Metadatos de las páginas indexables, en un solo sitio.
 *
 * Están centralizados porque hay dos consumidores del mismo texto: el `<head>`
 * que inyecta el prerender y la entradilla visible que pinta el documento legal
 * bajo su titular. Dos copias de un texto que nadie vuelve a mirar es la forma
 * garantizada de que se desincronicen — y en un documento legal, que la
 * descripción del buscador diga una cosa y la página otra es un problema de
 * verdad, no un detalle de estilo.
 *
 * El canonical se DERIVA, no se escribe a mano. Es lo que garantiza que la URL
 * del canonical, la del sitemap y la de `og:url` sean la misma cadena exacta:
 * `/privacidad` y `/privacidad/` son dos URLs distintas para un buscador.
 *
 * `archivo` es el HTML que Vite construye para esa ruta. Cloudflare sirve
 * `privacidad.html` en `/privacidad` sin extensión, así que la ruta limpia del
 * canonical es la que el visitante ve en la barra del navegador.
 */

export const ORIGEN = 'https://volutus.cl'

export const PAGINAS = {
  '/': {
    archivo: 'index.html',
    titulo: 'Páginas web, apps y agentes de IA en Chile — Volutus',
    descripcion:
      'Creamos páginas web, tiendas online, apps, agentes de IA y automatizaciones para tu negocio. En 48 horas hábiles tienes alcance, plazo y precio.',
  },
  '/privacidad': {
    archivo: 'privacidad.html',
    titulo: 'Privacidad y protección de datos — Volutus',
    descripcion:
      'Qué datos trata Volutus cuando escribes por el formulario, con quién se comparten, cuánto se conservan y cómo ejercer tus derechos bajo la ley chilena.',
  },
}

export function metaDe(ruta) {
  const pagina = PAGINAS[ruta]
  if (!pagina) throw new Error(`Ruta sin metadatos declarados en PAGINAS: ${ruta}`)

  return { ...pagina, canonical: ruta === '/' ? `${ORIGEN}/` : `${ORIGEN}${ruta}` }
}

/** El título sin la marca, que es lo que va escrito en la tarjeta para compartir. */
export const tituloCorto = (titulo) => titulo.replace(/ — Volutus$/, '')

/**
 * La tarjeta para compartir de cada página, derivada de su archivo para que
 * `scripts/tarjetas-og.mjs`, que la genera, y el prerender, que la enlaza,
 * no puedan nombrarla distinto.
 */
export const tarjetaDe = (archivo) => `/image/og/${archivo.replace(/.html$/, '')}.jpg`
