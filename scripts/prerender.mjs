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
// Al final escribe los tres archivos que también salen de esas fuentes: el
// sitemap, desde PAGINAS; `_headers`, desde lib/seguridad.js, y `_redirects`,
// desde lib/servicios.js.
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ARTICULOS, ORIGEN, PAGINAS, canonicalDe, tarjetaDe, tituloCorto } from '../src/lib/meta.js'
import { CABECERAS } from '../src/lib/seguridad.js'
import { CORREO_DE_CONTACTO } from '../src/lib/contacto.js'
import { SERVICIOS } from '../src/lib/servicios.js'
import { PAGINAS_DE_SERVICIO } from '../src/data/paginas-de-servicio.js'
import { ESTIMADOS, desde } from '../src/lib/precios.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = `${root}dist/`

const { render } = await import(new URL('../.prerender/entry-server.js', import.meta.url))

const ORGANIZACION = `${ORIGEN}/#organizacion`

// Un servicio con página la tiene que tener de verdad: si no, la rueda y el
// pie enlazarían a la 404.
for (const { id, ruta } of SERVICIOS) {
  if (ruta && !(PAGINAS[ruta] && PAGINAS_DE_SERVICIO[id])) throw new Error(`prerender: falta la página de ${ruta}`)
}

/** El servicio como entidad: uno solo, que nombran la portada y su página. */
const idDeServicio = (ruta) => `${canonicalDe(ruta)}#servicio`

/** Escapa lo que va dentro de un atributo HTML. */
function atributo(texto) {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

/**
 * El precio de partida del estimado de un servicio (lib/precios.js), en UF,
 * cuyo código ISO 4217 es CLF. Sin IVA, y dice que es un estimado.
 */
function ofertaDe(id) {
  return {
    '@type': 'Offer',
    description: 'Estimado: el precio final depende de lo que necesites y se confirma en la cotización.',
    priceSpecification: {
      '@type': 'PriceSpecification',
      minPrice: desde(ESTIMADOS[id]),
      priceCurrency: 'CLF',
      valueAddedTaxIncluded: false,
    },
  }
}

/**
 * La Organization se declara una sola vez, en la portada, y el resto de las
 * páginas la nombran por su `@id`. Repetirla entera en cada URL no la refuerza:
 * obliga a mantener el mismo bloque en varios sitios. Lo mismo cada servicio:
 * su página lo declara y la portada lo nombra.
 *
 * Una página de servicio es su FAQPage, porque sus preguntas van en el HTML,
 * y un artículo, su Article; los dos con la ruta para volver a su índice.
 */
function datosEstructurados(ruta, canonical, { titulo, descripcion, archivo, publicada, actualizada }) {
  const pagina = { name: titulo, url: canonical, inLanguage: 'es-CL' }
  const servicio = SERVICIOS.find((s) => s.ruta === ruta)
  if (servicio) {
    const { tipo, preguntas } = PAGINAS_DE_SERVICIO[servicio.id]
    return ldJson([
      {
        '@type': 'Service',
        '@id': idDeServicio(ruta),
        name: tipo,
        serviceType: tipo,
        description: descripcion,
        url: canonical,
        provider: { '@id': ORGANIZACION },
        areaServed: { '@type': 'Country', name: 'Chile' },
        offers: ofertaDe(servicio.id),
      },
      {
        '@type': 'FAQPage',
        ...pagina,
        about: { '@id': idDeServicio(ruta) },
        mainEntity: preguntas.map(({ pregunta, respuesta }) => ({
          '@type': 'Question',
          name: pregunta,
          acceptedAnswer: { '@type': 'Answer', text: respuesta },
        })),
      },
      migas([
        ['Inicio', '/'],
        ['Servicios', '/servicios'],
        [servicio.nombre, ruta],
      ]),
    ])
  }
  if (publicada) {
    return ldJson([
      {
        '@type': 'Article',
        headline: tituloCorto(titulo),
        description: descripcion,
        url: canonical,
        mainEntityOfPage: canonical,
        image: `${ORIGEN}${tarjetaDe(archivo)}`,
        inLanguage: 'es-CL',
        datePublished: publicada,
        dateModified: actualizada,
        author: { '@id': ORGANIZACION },
        publisher: { '@id': ORGANIZACION },
      },
      migas([
        ['Inicio', '/'],
        ['Artículos', '/articulos'],
        [tituloCorto(titulo), ruta],
      ]),
    ])
  }
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
        email: CORREO_DE_CONTACTO,
        areaServed: 'CL',
        sameAs: ['https://github.com/VolutusDevelopment'],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Servicios',
          itemListElement: SERVICIOS.map(({ nombre, texto, ruta: enlace }) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              ...(enlace && { '@id': idDeServicio(enlace), url: canonicalDe(enlace) }),
              name: nombre.replace(/­/g, ''),
              description: texto,
            },
          })),
        },
      },
    ],
    '/nosotros': [{ '@type': 'AboutPage', ...pagina, about: { '@id': ORGANIZACION } }],
    '/servicios': [
      {
        '@type': 'CollectionPage',
        ...pagina,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: SERVICIOS.map(({ nombre, ruta: destino, enlace }, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: nombre,
            url: canonicalDe(destino ?? enlace),
          })),
        },
      },
    ],
    '/articulos': [
      {
        '@type': 'CollectionPage',
        ...pagina,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: ARTICULOS.map((articulo, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: tituloCorto(articulo.titulo),
            url: canonicalDe(articulo.ruta),
          })),
        },
      },
    ],
  }[ruta] ?? [{ '@type': 'WebPage', ...pagina }]

  return ldJson(grafo)
}

/** El camino desde la portada hasta la página, como `[nombre, ruta]`. */
function migas(camino) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: camino.map(([name, destino], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: canonicalDe(destino),
    })),
  }
}

function ldJson(grafo) {
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': grafo,
  })}</script>`
}

function cabecera(ruta, pagina) {
  const { archivo, titulo, descripcion, indexar = true, tarjetaAlt } = pagina
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
    datosEstructurados(ruta, canonical, pagina),
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

  mkdirSync(dirname(`${dist}${pagina.archivo}`), { recursive: true })
  writeFileSync(`${dist}${pagina.archivo}`, html)
  console.log(`prerender: ${pagina.archivo} (${ruta})`)
}

const urls = Object.entries(PAGINAS)
  .filter(([, { indexar = true }]) => indexar)
  .map(([ruta, { actualizada }]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(actualizada ?? '')) throw new Error(`prerender: ${ruta} necesita actualizada (AAAA-MM-DD)`)
    return `  <url><loc>${canonicalDe(ruta)}</loc><lastmod>${actualizada}</lastmod></url>`
  })
writeFileSync(
  `${dist}sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
)

// Cloudflare lee `_headers` de la raíz de los assets y no lo sirve como archivo.
// Lo que va en /assets/ lleva el hash de su contenido en el nombre, así que
// puede quedarse en caché para siempre: si cambia, cambia de nombre.
// llms.txt lleva tildes y Cloudflare lo sirve como `text/plain` sin charset,
// que algunos clientes (`requests` de Python) leen como Latin-1.
const reglas = Object.entries(CABECERAS).map(([nombre, valor]) => `  ${nombre}: ${valor}`)
writeFileSync(
  `${dist}_headers`,
  `/*\n${reglas.join('\n')}\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/llms.txt\n  Content-Type: text/plain; charset=utf-8\n`
)

// Las páginas de servicio vivían en la raíz (/desarrollo-web) hasta que
// pasaron bajo /servicios: el enlace viejo, guardado o compartido, sigue
// llegando a su página, y el buscador le traspasa lo ganado a la nueva.
const traslados = SERVICIOS.filter(({ ruta }) => ruta).map(
  ({ ruta }) => `${ruta.replace(/^\/servicios/, '')} ${ruta} 301`
)
writeFileSync(`${dist}_redirects`, `${traslados.join('\n')}\n`)

rmSync(`${dist}${enlace[1]}`)
rmSync(`${root}.prerender`, { recursive: true, force: true })
