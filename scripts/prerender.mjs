// Prerender: convierte cada página declarada en src/lib/meta.js en un HTML
// completo dentro de dist/. Corre después de `vite build --ssr src/entry-server.jsx`
// (ver el script "build" en package.json), que deja el bundle SSR en .prerender/.
//
// Todas las páginas salen de la misma plantilla, el `dist/index.html` que
// construye Vite: llevan el mismo JavaScript y el mismo CSS, así que una sola
// plantilla basta y agregar una página es declararla en PAGINAS y darle su
// componente en entry-server.jsx.
//
// Hace tres cosas por página, y las tres existen para que el navegador reciba
// una sola respuesta con todo dentro:
//
//   1. Inyecta el <head> a partir de PAGINAS, que es la única fuente de los
//      títulos y las descripciones.
//   2. Mete el HTML de React dentro de #root.
//   3. Incrusta el CSS, porque un <link rel="stylesheet"> bloquea el primer
//      pintado con una petición extra.
//
// Al final escribe los dos archivos que también salen de esas fuentes: el
// sitemap, desde PAGINAS, y `_headers`, desde lib/seguridad.js.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { ORIGEN, PAGINAS, canonicalDe, tarjetaDe, tituloCorto } from '../src/lib/meta.js'
import { CABECERAS } from '../src/lib/seguridad.js'
import { SERVICIOS } from '../src/lib/servicios.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = `${root}dist/`

const { render } = await import(new URL('../.prerender/entry-server.js', import.meta.url))

const ORGANIZACION = `${ORIGEN}/#organizacion`

/** Escapa lo que va dentro de un atributo HTML. */
function atributo(texto) {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

/**
 * La Organization se declara una sola vez, en la portada, y el resto de las
 * páginas la nombran por su `@id`. Repetirla entera en cada URL no la refuerza:
 * obliga a mantener el mismo bloque en varios sitios.
 */
function datosEstructurados(ruta, canonical, titulo) {
  const pagina = { name: titulo, url: canonical, inLanguage: 'es-CL' }
  const grafo = {
    '/': [
      { '@type': 'WebSite', name: 'Volutus', url: `${ORIGEN}/`, inLanguage: 'es-CL' },
      {
        // ProfessionalService dice que esto se contrata; el catálogo nombra los
        // mismos servicios que la sección de la página.
        '@type': ['Organization', 'ProfessionalService'],
        '@id': ORGANIZACION,
        name: 'Volutus',
        url: `${ORIGEN}/`,
        logo: `${ORIGEN}/apple-touch-icon.png`,
        description: 'Empresa de desarrollo de software en Chile.',
        email: 'contacto@volutus.cl',
        areaServed: 'CL',
        sameAs: ['https://github.com/VolutusDevelopment'],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Servicios',
          itemListElement: SERVICIOS.map(({ nombre }) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: nombre.replace(/­/g, '') },
          })),
        },
      },
    ],
    '/nosotros': [{ '@type': 'AboutPage', ...pagina, about: { '@id': ORGANIZACION } }],
  }[ruta] ?? [{ '@type': 'WebPage', ...pagina }]

  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': grafo,
  })}</script>`
}

function cabecera(ruta, { archivo, titulo, descripcion, indexar = true, tarjetaAlt }) {
  const t = atributo(titulo)
  const d = atributo(descripcion)
  const basicas = [`<title>${t}</title>`, `<meta name="description" content="${d}" />`]

  // Las páginas de error no tienen URL propia ni vida en buscadores: título,
  // descripción y la orden de no indexarlas. Sin canonical, sin tarjeta para
  // compartir.
  if (!indexar) return [...basicas, `<meta name="robots" content="noindex" />`].join('\n    ')

  const canonical = canonicalDe(ruta)
  const imagen = `${ORIGEN}${tarjetaDe(archivo)}`
  const alt = atributo(tarjetaAlt ?? `El logotipo de Volutus sobre fondo blanco y el título «${tituloCorto(titulo)}».`)
  return [
    ...basicas,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Volutus" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:locale" content="es_CL" />`,
    `<meta property="og:image" content="${imagen}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${alt}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${imagen}" />`,
    `<meta name="twitter:image:alt" content="${alt}" />`,
    datosEstructurados(ruta, canonical, titulo),
  ].join('\n    ')
}

const plantilla = readFileSync(`${dist}index.html`, 'utf8')
for (const marcador of ['<!--meta-->', '<div id="root"></div>']) {
  if (!plantilla.includes(marcador)) throw new Error(`prerender: falta ${marcador} en index.html`)
}

// El CSS es el mismo archivo para todas las páginas, así que se lee una vez y
// se borra al final: incrustarlo en cada una y dejar además el archivo suelto
// sería servir los mismos bytes dos veces.
const enlace = plantilla.match(/<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/)
if (!enlace) throw new Error('prerender: no se encontró el <link rel="stylesheet"> en index.html')
const css = readFileSync(`${dist}${enlace[1]}`, 'utf8').trim()

// Los reemplazos van como función para que el texto entre literal: como cadena,
// un `$&` o un `$'` dentro del CSS o del HTML se interpretaría como patrón.
for (const [ruta, pagina] of Object.entries(PAGINAS)) {
  const html = plantilla
    .replace('<!--meta-->', () => cabecera(ruta, pagina))
    .replace('<div id="root"></div>', () => `<div id="root">${render(ruta)}</div>`)
    .replace(enlace[0], () => `<style>${css}</style>`)

  writeFileSync(`${dist}${pagina.archivo}`, html)
  console.log(`prerender: ${pagina.archivo} (${ruta})`)
}

const urls = Object.entries(PAGINAS)
  .filter(([, { indexar = true }]) => indexar)
  .map(([ruta]) => `  <url><loc>${canonicalDe(ruta)}</loc></url>`)
writeFileSync(
  `${dist}sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
)

// Cloudflare lee `_headers` de la raíz de los assets y no lo sirve como archivo.
// Lo que va en /assets/ lleva el hash de su contenido en el nombre, así que
// puede quedarse en caché para siempre: si cambia, cambia de nombre.
const reglas = Object.entries(CABECERAS).map(([nombre, valor]) => `  ${nombre}: ${valor}`)
writeFileSync(
  `${dist}_headers`,
  `/*\n${reglas.join('\n')}\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`
)

rmSync(`${dist}${enlace[1]}`)
rmSync(`${root}.prerender`, { recursive: true, force: true })
