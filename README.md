# Volutus — Landing Page

Landing page de Volutus, construida con React y Vite, con pre-renderizado estático para SEO y rendimiento.

[Diseño de referencia en Canva](https://www.canva.com/design/DAHPg0F3exU/gsNlD7AkpXAVVIyV5ObjTQ/edit?ui=eyJFIjp7Im0iOnRydWUsIkE_IjoibiJ9LCJLIjp7IkEiOiIyYTZiZDgyMy1mY2UyLTRlYTMtYTdmMi1kMTM0OTA2N2RhMDEifX0)

![1784174150425](image/README/1784174150425.png)![1784174195927](image/README/1784174195927.png)

## Stack

- React 19 — solo en build: se usa como motor de plantillas para el prerender.
- Vite 7
- CSS puro (tokens y componentes en [DESIGN.md](DESIGN.md); decisiones en [DESIGN-BRIEF.md](DESIGN-BRIEF.md))
- JavaScript vanilla en el cliente ([src/client.js](src/client.js))
- Cloudflare Workers: sirve `dist/` y atiende el formulario ([worker/index.js](worker/index.js))

## Arquitectura

En producción **React no se envía al navegador**. El script de build:

1. `vite build` — genera el bundle cliente en `dist/`.
2. `vite build --ssr src/entry-server.jsx` — genera el bundle SSR en `.prerender/`.
3. `node scripts/prerender.mjs` — usa `dist/index.html` como plantilla y escribe
   un HTML por cada página de [src/lib/meta.js](src/lib/meta.js), con su
   `<head>`, el HTML de React y el CSS incrustado. Genera también `sitemap.xml`
   y `_headers`.

Las páginas son `/`, `/nosotros`, `/privacidad`, las de error —la 404 y la de
los 5xx, en `/500`— y `/patos`, el juego al que lleva el pato que sale a nadar en
el mar del pie al minuto de visita (sin indexar). Agregar una es una entrada en
`PAGINAS` (meta.js) y otra en `COMPONENTES` (paginas/rutas.js).

**La página de los 5xx no se sirve todavía.** Cloudflare sirve el sitio y el
Worker solo atiende `/api/*`, así que un 5xx que vea un visitante lo genera
Cloudflare, y solo Cloudflare puede reemplazar su página: con una
[Custom Error Rule](https://developers.cloudflare.com/rules/custom-errors/), que
pide plan Pro (la zona está en Free). Al pasar a Pro: en Rules → Custom Errors,
crear un asset desde `https://volutus.cl/500` y una regla que lo sirva cuando el
código de respuesta sea 500 o mayor. Cloudflare incrusta el CSS y el JS en el
asset; el texto y el cielo se ven igual, pero hay que comprobar que la nube y
el juego arranquen, porque el juego se descarga con una ruta relativa.

El JS del cliente engancha sobre el HTML prerenderizado: validación del
formulario, medidores, titular rotativo, paneles de servicios, vitrina, barra y
nubes, y el botón «Jugar» de las páginas de error, que descarga el juego de los patos
([src/patos.js](src/patos.js)) recién al pulsarlo y deshace la volutus en
cúmulos mientras se juega. El formulario envía a
`POST /api/contacto`, que el Worker reenvía por correo con Resend.

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
npx wrangler dev                # el sitio construido con el Worker, en :8787
pnpm verificar                  # medidas, enlaces y foco contra tests/referencia.json
```

`pnpm verificar` necesita Playwright y `wrangler dev` corriendo.

## Estructura

```
index.html              # plantilla de todas las páginas
scripts/
  prerender.mjs         # un HTML por página, sitemap.xml y _headers
  verificar.mjs         # verificación con Playwright
src/
  paginas/              # Inicio, Nosotros, Privacidad y las de error (404 y 5xx)
  components/           # secciones con su CSS
  data/                 # proyectos
  lib/                  # metadatos, servicios, seguridad y geometría de la marca
  styles/               # tokens y base (index.css) + orden de la cascada (main.css)
  main.js, client.js    # entrada y comportamiento en el navegador
worker/
  index.js              # POST /api/contacto
public/
  fonts/, image/        # Geist autohospedada y webp con srcset
  robots.txt, llms.txt, .well-known/security.txt
```

## SEO

- HTML completo prerenderizado (sin depender de JS para indexar).
- Meta description, canonical, Open Graph, Twitter Card y JSON-LD por página,
  desde [src/lib/meta.js](src/lib/meta.js).
- `sitemap.xml` generado desde las páginas indexables; las de error llevan `noindex`.
- Imágenes con `srcset`, dimensiones explícitas y `loading="lazy"` fuera del
  viewport inicial.
