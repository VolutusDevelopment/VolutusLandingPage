# Volutus — Landing Page

Landing page de Volutus, construida con React y Vite, con pre-renderizado estático para SEO y rendimiento.


## Stack

- React 19 — solo en build: se usa como motor de plantillas para el prerender.
- Vite 7
- CSS puro (tokens y componentes en [DESIGN.md](DESIGN.md); decisiones en [DESIGN-BRIEF.md](DESIGN-BRIEF.md))
- JavaScript vanilla en el cliente ([src/client.js](src/client.js))
- Cloudflare Workers: sirve `dist/` y atiende el formulario ([worker/index.js](worker/index.js))

## Arquitectura

En producción **React no se envía al navegador**. El script de build:

1. `vite build` — genera el bundle cliente en `dist/`.
2. `vite build --ssr src/entry-server.jsx --outDir .prerender` — genera el bundle SSR en `.prerender/`.
3. `node scripts/prerender.mjs` — usa `dist/index.html` como plantilla y escribe
   un HTML por cada página de [src/lib/meta.js](src/lib/meta.js), con su
   `<head>`, el HTML de React y el CSS incrustado. Genera también `sitemap.xml`
   y `_headers`.

Las páginas son `/`, `/nosotros`, `/privacidad`, `/ley21719` (la Ley 21.719
explicada para un negocio), las de error —la 404 y la de los 5xx, en `/500`— y
`/patos`, el juego al que lleva el pato que sale a nadar en el mar del pie al
minuto de visita. `/404` y `/500` llevan `noindex`; `/patos` es indexable y
aparece en el sitemap. En las páginas de error el juego se carga al pulsar
«Jugar»; en `/patos` comienza automáticamente. La portada se compone de
Portada, Servicios, Proyectos y Contacto; no tiene sección de métricas. Agregar
una página es una entrada en `PAGINAS` (meta.js) y otra en `COMPONENTES`
(paginas/rutas.js).

**La página de los 5xx no se sirve todavía.** Cloudflare sirve el sitio y el
Worker solo atiende `/api/*`, así que un 5xx que vea un visitante lo genera
Cloudflare, y solo Cloudflare puede reemplazar su página: con una
[Custom Error Rule](https://developers.cloudflare.com/rules/custom-errors/), que
pide plan Pro (la zona está en Free). Al pasar a Pro: en Rules → Custom Errors,
crear un asset desde `https://volutus.cl/500` y una regla que lo sirva cuando el
código de respuesta sea 500 o mayor. Cloudflare incrusta el CSS y el JS en el
asset; el texto y el cielo se ven igual, pero hay que comprobar que la nube y
el juego arranquen, porque el juego se descarga con una ruta relativa.

El JS del cliente engancha sobre el HTML prerenderizado: valida y envía el
formulario, rota el titular, gira la rueda de servicios, abre las fichas de
proyectos, actualiza la barra al desplazarse y mueve los lienzos de nube y mar.
En las páginas de error, «Jugar» descarga el juego de los patos
([src/patos.js](src/patos.js)) al pulsarlo y deshace la volutus en cúmulos
mientras se juega; en `/patos` la partida empieza automáticamente. El formulario
envía a
`POST /api/contacto`, que el Worker reenvía por correo con Resend. El endpoint
acepta cinco envíos por minuto por IP (binding `LIMITE_CONTACTO` en
[wrangler.jsonc](wrangler.jsonc)); el sexto recibe 429 con el correo directo.

Las cabeceras de seguridad viven en [src/lib/seguridad.js](src/lib/seguridad.js):
el prerender las escribe en `dist/_headers` y el Worker las pone en sus
respuestas.

En desarrollo el root llega vacío y React monta la portada en el navegador
(`src/dev.jsx`); Vite elimina ese bloque del bundle de producción.

## Comandos

```bash
pnpm install                    # instalar dependencias
pnpm dev                        # servidor de desarrollo (todas las páginas)
pnpm build                      # build de producción + pre-render
pnpm preview                    # vista previa del build de dist/
pnpm og                         # generar tarjetas Open Graph
pnpm iconos                     # generar iconos
npx wrangler dev                # sitio construido con el Worker, en :8787
pnpm verificar                  # medidas, enlaces y foco contra tests/referencia.json
```

`pnpm preview` requiere un build previo. `wrangler dev` sirve el sitio construido y atiende el Worker en :8787. `pnpm verificar` necesita Playwright y `wrangler dev` corriendo.

## Estructura

```
index.html              # plantilla de todas las páginas
scripts/
  prerender.mjs         # un HTML por página, sitemap.xml y _headers
  verificar.mjs         # verificación con Playwright
src/
  paginas/              # Inicio, Nosotros, Privacidad, Ley21719 y las de error (404 y 5xx)
  components/           # secciones con su CSS
  data/                 # proyectos
  lib/                  # metadatos, servicios, seguridad y geometría de la marca
  styles/               # tokens y base (index.css) + orden de la cascada (main.css)
  main.js, client.js    # entrada y comportamiento en el navegador
worker/
  index.js              # POST /api/contacto
public/
  fonts/, image/        # Geist, Geist Mono, Archivo itálica y recursos webp
  robots.txt, llms.txt, .well-known/security.txt
```

## SEO

- HTML completo prerenderizado (sin depender de JS para indexar).
- Meta description, canonical, Open Graph, Twitter Card y JSON-LD por página,
  desde [src/lib/meta.js](src/lib/meta.js).
- `sitemap.xml` contiene las páginas indexables; `/404` y `/500` llevan `noindex`, mientras que `/patos` es indexable y aparece en el sitemap.
- Imágenes con `srcset`, dimensiones explícitas y `loading="lazy"` fuera del
  viewport inicial.
