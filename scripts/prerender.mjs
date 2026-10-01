// Prerender: convierte cada página declarada en src/lib/meta.js en un HTML
// completo dentro de dist/. Corre después de `vite build --ssr src/entry-server.jsx`
// (ver el script "build" en package.json), que deja el bundle SSR en .prerender/.
//
// Hace tres cosas por página, y las tres existen para que el navegador reciba
// una sola respuesta con todo dentro:
//
//   1. Inyecta el <head> a partir de PAGINAS, que es la única fuente de los
//      títulos y las descripciones.
//   2. Mete el HTML de React dentro de #root.
//   3. Incrusta el CSS, porque un <link rel="stylesheet"> bloquea el primer
//      pintado con una petición extra.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { tarjetaDe, tituloCorto } from '../src/lib/meta.js'

const root = fileURLToPath(new URL('..', import.meta.url))

const { render, PAGINAS } = await import(new URL('../.prerender/entry-server.js', import.meta.url))

const ORIGEN = 'https://volutus.cl'

/** Escapa lo que va dentro de un atributo HTML. */
function atributo(texto) {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

/**
 * Los datos estructurados solo los lleva la portada.
 *
 * Declarar la Organization en cada página no la refuerza: repite la misma
 * entidad en varias URL y obliga a mantener el mismo bloque en dos sitios. El
 * documento legal se describe a sí mismo y nada más.
 */
function datosEstructurados(ruta, canonical, titulo) {
  const grafo =
    ruta === '/'
      ? [
          { '@type': 'WebSite', name: 'Volutus', url: `${ORIGEN}/`, inLanguage: 'es-CL' },
          {
            '@type': 'Organization',
            name: 'Volutus',
            url: `${ORIGEN}/`,
            description: 'Empresa de desarrollo de software en Chile.',
            email: 'contacto@volutus.cl',
            areaServed: 'CL',
          },
        ]
      : [{ '@type': 'WebPage', name: titulo, url: canonical, inLanguage: 'es-CL' }]

  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': grafo,
  })}</script>`
}

function cabecera(ruta, { archivo, titulo, descripcion }) {
  const canonical = ruta === '/' ? `${ORIGEN}/` : `${ORIGEN}${ruta}`
  const t = atributo(titulo)
  const d = atributo(descripcion)
  const imagen = `${ORIGEN}${tarjetaDe(archivo)}`
  const alt = atributo(`El logotipo de Volutus sobre fondo blanco y el título «${tituloCorto(titulo)}».`)

  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
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

// El CSS es el mismo archivo para todas las páginas, así que se lee una vez y
// se borra al final: incrustarlo en cada una y dejar además el archivo suelto
// sería servir los mismos bytes dos veces.
let cssIncrustado = null
let cssRuta = null

for (const [ruta, pagina] of Object.entries(PAGINAS)) {
  const destino = `${root}dist/${pagina.archivo}`
  let html = readFileSync(destino, 'utf8')

  if (!html.includes('<!--meta-->')) {
    throw new Error(`prerender: falta el marcador <!--meta--> en ${pagina.archivo}`)
  }
  html = html.replace('<!--meta-->', cabecera(ruta, pagina))

  const marcador = '<div id="root"></div>'
  if (!html.includes(marcador)) {
    throw new Error(`prerender: no se encontró ${marcador} en ${pagina.archivo}`)
  }
  html = html.replace(marcador, `<div id="root">${render(ruta)}</div>`)

  const enlace = html.match(/<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/)
  if (!enlace) {
    throw new Error(`prerender: no se encontró el <link rel="stylesheet"> en ${pagina.archivo}`)
  }
  if (cssIncrustado === null) {
    cssRuta = enlace[1]
    cssIncrustado = readFileSync(`${root}dist/${cssRuta}`, 'utf8').trim()
  }
  html = html.replace(enlace[0], `<style>${cssIncrustado}</style>`)

  writeFileSync(destino, html)
  console.log(`prerender: ${pagina.archivo} (${ruta})`)
}

rmSync(`${root}dist/${cssRuta}`)
rmSync(`${root}.prerender`, { recursive: true, force: true })
