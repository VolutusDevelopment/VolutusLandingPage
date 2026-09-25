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
    titulo: 'Volutus, desarrollo de software en Chile',
    descripcion:
      'Construimos software que puedes abrir y revisar: productos en línea, código público y un agente de IA premiado. Cuéntanos tu proyecto y respondemos en 48 horas hábiles.',
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
