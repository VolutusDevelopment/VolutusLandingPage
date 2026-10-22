# Roadmap de calidad — volutus.cl

> El mapa completo para llevar un sitio a este nivel: lo que Volutus ya hizo,
> con su fecha y dónde vive, y lo que falta, en orden. Va de los fundamentos
> (estrategia, diseño, arquitectura) a lo avanzado (agentes de IA, seguridad
> auditada, presencia fuera del sitio), y sirve de guía para el próximo
> proyecto. Estado al 22 de octubre de 2026, commit `df165f3`.

## Cómo se usa

- `[x]` **hecho**: fecha del commit que lo trajo y dónde vive.
- `[~]` **a medias**: qué falta para cerrarlo.
- `[ ]` **pendiente**: prioridad, horas y cómo se comprueba.
- Prioridad: 🔴 crítico · 🟠 alto · 🟡 medio · ⚪ bajo.
- Horas de un desarrollador junior con asistente de IA, sin reuniones ni
  holgura (el criterio del anexo B).
- Las etapas van en orden de dependencia: no se pule el diseño (2) sin el brief
  (1), ni se mide la exposición (12) con el dominio mal servido (7).
- Un pendiente se cierra con su comprobación, y nada pasa si falla los
  «Criterios para aceptar un cambio» de [CLAUDE.md](CLAUDE.md).

## Resumen

| Etapa | Hechos | Pendientes | Horas pendientes |
| --- | --- | --- | --- |
| 1. Estrategia y reglas | 6 | 2 | 4–6 |
| 2. Fundamentos de diseño | 11 | 6 | 20–29 |
| 3. Arquitectura y rendimiento | 8 | 3 | 9–12 |
| 4. Responsive, accesibilidad y Safari | 8 | 3 | 7–10 |
| 5. SEO técnico | 13 | 5 | 11,5–15,5 |
| 6. Agentes de IA | 7 | 4 | 8,5–13,5 |
| 7. Dominio y Cloudflare | 14 | 3 | 1 |
| 8. Seguridad | 9 | 10 + auditorías | 14,5–19,5 |
| 9. Código y flujo de trabajo | 5 | 6 | 6–8 |
| 10. Skills y agentes | 2 | 8 | 8–13 |
| 11. Conversión y contenido | 6 | 4 | 9–14 |
| 12. Presencia fuera del sitio | 2 | 9 | 10–12 |
| 13. Medición y gobierno | 1 | 3 | 2–4 + 3–5 al mes |
| **Total** | **92** | | **≈ 110–158** |

## Línea base (2026-10-22)

| Medición | Resultado | Meta |
| --- | --- | --- |
| Lighthouse móvil, portada en producción | Performance 99 (SI 2,2 s, TBT 10 ms, CLS 0) | 100 |
| Lighthouse móvil, servicio y artículo (build local) | 100 · 100 · 100 · 100 | 100 |
| Agentic Browsing (Lighthouse 13.5) | Pasan árbol de accesibilidad, `llms.txt` y CLS. WebMCP no se evalúa sin el flag de Chrome. `ai-catalog.json` no aplica en producción | Todo lo aplicable en verde |
| `www.volutus.cl` → `volutus.cl` | ✅ 301 en HTTP y HTTPS | — |
| `http://volutus.cl` → HTTPS | ✅ 301 a HTTPS (respondía 200 en HTTP plano hasta el 2026-10-22) | 301 a HTTPS |
| DNSSEC / CAA | ⏳ Zona firmada, falta el DS en NIC Chile / ✅ | Activos |
| Correo (SPF, DKIM de Zoho y Resend, DMARC) | ✅ DMARC en `p=quarantine` | `p=reject` |
| CSS incrustado por página | 143 KB (27 KB gzip), el de **todo** el sitio; 22–25 KB sin usar | Solo el de la página |

## Cronología de lo hecho

| Fecha | Hito |
| --- | --- |
| 2026-07-02 | Primer commit: Vite, React y prerender |
| 2026-07-15 | CLAUDE.md: principios y prioridades absolutas |
| 2026-07-17 | Arquitectura prerenderizada, primer SEO, `llms.txt` y skills de diseño |
| 2026-09-13 | Brief de diseño rellenado con los dos socios (al repo el 24-09) |
| 2026-09-24 | Rediseño completo según el brief; formulario por Worker de Cloudflare y Resend |
| 2026-09-25 | Privacidad, auditoría de diez acciones y verificación automática con Playwright |
| 2026-09-27 | Skills de copywriting y CRO |
| 2026-09-30 | `/nosotros`, 404, una sola plantilla y cabeceras de seguridad |
| 2026-10-01 | Tarjeta Open Graph por página; 404 con Duck Hunt y página de 5xx |
| 2026-10-03 | Guía de la Ley 21.719; Turnstile y rate-limit en el formulario |
| 2026-10-15 | Páginas de servicio, artículos y datos estructurados por tipo |
| 2026-10-17 | Índice de servicios, estimador en UF, WhatsApp, degradados sin rayas, paginación |
| 2026-10-18 | Cuatro niveles de título, botones unificados, ESLint, RUT visible y WebMCP |
| 2026-10-21 | Favicon por servicio, logotipo animado, UF diaria reforzada |
| 2026-10-22 | Video para equipos sin GPU, entrega por partes para Safari, nubes verificadas; los socios en el grafo y la firma en los artículos; Cloudflare endurecido (HTTPS obligatorio, TLS 1.2, CAA, WAF, alertas, sin workers.dev) |

## Tecnologías integradas

| Capa | Tecnología | Para qué |
| --- | --- | --- |
| Build | Vite 7 y React 19 solo en el build | Escribir un HTML completo por ruta (`scripts/prerender.mjs`); al navegador no llega React |
| Estilos | CSS puro con tokens | Sin framework; el CSS va incrustado en el HTML |
| Cliente | JavaScript vanilla en módulos | Formulario, rotativo, rueda, fichas, barra; cada parte arranca por separado |
| Gráficos | Canvas en Web Worker (`OffscreenCanvas`) y MP4 | Nube y mar sin bloquear la página; video donde no hay GPU |
| Tipografía | Geist, Geist Mono, Archivo itálica y Press Start 2P en woff2 | Autoalojadas, subconjunto latino, respaldos con métricas ajustadas |
| Hosting | Cloudflare Workers con Static Assets | Sitio estático, `_headers`, `_redirects` y 404 propia |
| Formulario | Worker, Workers Rate Limiting, Turnstile y Resend | `POST /api/contacto` validado y enviado por correo |
| Correo | Zoho Mail y Resend | Bandeja y envío desde el dominio, con SPF, DKIM y DMARC |
| Datos | mindicador.cl, con el SII de respaldo, y GitHub Actions | La UF del día para el estimador |
| SEO | schema.org en JSON-LD, Open Graph, Twitter Card, sitemap | Buscadores y vistas previas al compartir |
| IA | `llms.txt`, Content Signals y WebMCP declarativo | Que los modelos lean, citen y usen los formularios |
| Calidad | ESLint 10, Playwright (Chromium y WebKit), Lighthouse | Sin avisos, medidas contra una referencia, 100 como meta |
| Agentes | Claude Code (CLAUDE.md y 15 skills), GitHub Copilot | Mismas reglas en cada sesión |
| Observabilidad | Workers Observability | Los errores del formulario quedan registrados |

---

## Etapa 1 — Estrategia y reglas del proyecto

Antes de diseñar o programar: para qué existe el sitio, a quién le habla y con
qué reglas se decide.

- [x] **Principios y prioridades**: SEO, rendimiento, simplicidad, seguridad,
  responsive, Safari y WebMCP, con criterios para aceptar un cambio.
  *2026-07-15 · CLAUDE.md*
- [x] **Instrucciones de commit** para Copilot: español, imperativo, agrupados.
  *.github/copilot-instructions.md*
- [x] **Brief**: qué es la página, la única acción (el formulario), quién llega
  y de dónde, sus cuatro dudas en sus palabras, la promesa y la prueba, a quién
  no se le habla. *2026-09-24 · DESIGN-BRIEF.md §1–3*
- [x] **Registro de decisiones** numeradas, 58 a la fecha. *DESIGN-BRIEF.md*
- [x] **Perfiles sintéticos** para encontrar las dudas que la página no
  responde. *docs/perfiles-clientes-100000.md*
- [x] **Identidad legal visible**: razón social y RUT, comprobables en el SII.
  *2026-10-18*
- [ ] 🟠 **Cerrar el brief.** Las secciones 1 a 6 y 9 siguen en `[~]` y los
  indicadores de éxito, sin confirmar: el código va por delante del documento
  que dice mandar sobre él. *2–3 h.* Comprobación: ninguna sección en `[~]` sin
  su pregunta abierta escrita.
- [ ] 🟡 **Traer al repo lo esencial del vault** (`C:\VaultObsidianVolutus`).
  CLAUDE.md lo da como fuente de verdad, pero las sesiones en la nube no lo
  ven. *2–3 h.*

## Etapa 2 — Fundamentos de diseño

Lo que sostiene un diseño: tipografía, color, espacio, componentes y movimiento,
cada uno con una regla escrita.

- [x] **Contenido antes que forma**: el brief pide cerrar mensaje y estructura
  antes de la identidad visual. *DESIGN-BRIEF.md, «Orden sugerido»*
- [x] **Tipografía autoalojada** con `font-display: swap` y respaldos locales
  de métricas ajustadas, para que el texto no salte al cargar.
  *src/styles/index.css*
- [x] **Escala de texto** (13, 15, 17, 22 y 34 px, más tres fluidos) y
  **cuatro niveles de título**. *2026-10-18 · decisión 50, DESIGN.md*
- [x] **Color por zonas** (cielo y plano) con tokens y contraste AA.
  *DESIGN.md · index.css*
- [x] **Espaciado** en múltiplos de 4, contenedor de 1200 px y lectura a 68ch.
- [x] **Dos botones** para todo el sitio: la píldora y el cuadro.
  *2026-10-18 · decisión 51*
- [x] **Movimiento** con curvas y tiempos compartidos, y
  `prefers-reduced-motion` respetado en 24 archivos.
- [x] **Degradados sin rayas**, con el método escrito para el próximo.
  *2026-10-17 · DESIGN.md*
- [x] **Iconografía propia**: un glifo por servicio con su gesto y un favicon
  por servicio. *2026-10-21 · decisión 55*
- [x] **Marca animada**: el logotipo que se escribe y la ola de tres líneas.
  *2026-10-21 · decisiones 56 y 57*
- [x] **Resumen del sistema implementado**. *DESIGN.md*
- [ ] 🟠 **Artefacto de diseño vivo**: una página `/diseno`, `noindex` y fuera
  del sitemap, armada con los mismos componentes del sitio (no copias): tokens
  por zona, los cuatro niveles de título, píldora y cuadro en todos sus
  estados, tarjetas, glifos con su gesto, curvas y tiempos, y un «sí / no» por
  pieza. Como sale del mismo código, no se desincroniza. *8–12 h.*
  Comprobación: una página nueva se arma solo con piezas que están en `/diseno`.
- [ ] 🟡 **Versión para compartir** del sistema (artefacto publicado o PDF) para
  clientes y colaboradores. *2–3 h.*
- [ ] 🟡 **Kit de marca**: logo en SVG y PNG claro y oscuro, avatar cuadrado
  para Google, Apple, LinkedIn y GitHub, portada de LinkedIn, firma de correo
  y plantilla de la tarjeta OG. *3–4 h.*
- [ ] 🟡 **Una sola voz visual.** En la portada conviven la nube en píxeles,
  cards 3D, láminas oscuras, un podio de 8 bits con Press Start 2P, un
  formulario estilo SaaS y la marca gigante del pie. Dejar el podio en pixel
  art, pero con la tipografía, los radios y los colores del sistema, y el tono
  de juego en `/patos`. *4–6 h.*
- [ ] 🟡 **Presupuesto de movimiento**: una animación protagonista por pantalla,
  escrito en DESIGN.md. Hoy se mueven a la vez el logotipo, la gota, la nube,
  la rueda, la ola y el mar. *2–3 h.*
- [ ] ⚪ **Titulares en mayúscula** con tope de tres líneas y
  `text-wrap: balance` (Safari 17.5 en adelante; sin él solo cambia el corte).
  *1 h.*

## Etapa 3 — Arquitectura y rendimiento

- [x] **Un HTML completo por ruta**, prerenderizado; React solo en el build.
  *2026-07-17 · scripts/prerender.mjs*
- [x] **Una plantilla** para todas las páginas y metadatos desde una sola
  fuente. *2026-09-30 · index.html, src/lib/meta.js*
- [x] **CSS incrustado**: ninguna hoja bloquea el primer pintado.
- [x] **JavaScript mínimo**: 13 KB gzip en el cliente, el juego se descarga
  solo al pedirlo y cada parte de la página arranca por separado.
  *2026-10-22 · src/client.js*
- [x] **Nube y mar en un Web Worker**, con video para equipos sin GPU.
  *2026-10-11 y 2026-10-22 · src/nubes.js, src/nubes-lienzo.js*
- [x] **Imágenes WebP** con `srcset`, medidas explícitas, `loading="lazy"` y
  prioridad baja fuera de la primera pantalla. *2026-10-22*
- [x] **Caché inmutable** de un año para `/assets/`, que lleva el hash en el
  nombre. *_headers*
- [x] **Lighthouse móvil 99–100** en producción.
- [ ] 🟠 **CSS por página.** Cada HTML lleva el CSS de todo el sitio: 143 KB
  (27 KB gzip), con 22–25 KB que esa página no usa, y se vuelve a descargar en
  cada navegación. Partirlo en una base común más el CSS de los componentes
  que renderiza cada ruta, que el prerender ya conoce. *6–8 h.* Comprobación:
  Lighthouse sin «unused CSS» y `pnpm verificar` sin diferencias.
- [ ] 🟡 **Póster de la nube**: el Speed Index de la portada (2,2 s) es lo que
  la deja en 99. Una imagen liviana bajo el canvas mientras arranca el Worker.
  *2–3 h.*
- [ ] 🟡 **Precargar solo las fuentes de la primera pantalla** de cada página:
  hoy las tres se precargan en todas. *1 h.*

## Etapa 4 — Responsive, accesibilidad y Safari

- [x] **Cuatro tamaños** (S, M, L y XL) medidos en pantallas reales: 390, 820,
  1180 y 1440 px. *DESIGN-BRIEF §8 · scripts/verificar.mjs*
- [x] **WebKit de Playwright** en los anchos de iPhone y iPad, como pantalla
  táctil.
- [x] **Accesibilidad**: enlace para saltar al contenido, foco visible de 2 px,
  `aria-live` en el formulario y textos alternativos que describen. Lighthouse
  Accessibility 100.
- [x] **Accesible de fábrica, sin widget**: el panel de accesibilidad se
  retiró. *2026-10-02*
- [x] **Safari e iOS**: `svh`/`dvh`, zonas seguras, campos de 16 px,
  `@supports` ante lo que Safari no tenga y container queries.
- [x] **Video por partes** (`Range`), que Safari exige para reproducir.
  *2026-10-22 · worker/index.js*
- [x] **Impresión**: contenido completo y quieto (`@media print`).
- [x] **Sin desbordamiento horizontal** en los cuatro tamaños.
- [ ] 🔴 **Contacto siempre a mano en el teléfono.** Bajo 768 px la barra quita
  «Cuéntanos tu proyecto», y bajo 1024 px, «Artículos»; ningún menú los
  recoge. Según el brief, casi todos llegan desde WhatsApp, en el teléfono.
  Mantener el botón de contacto (o un menú compacto) y sumar «Proyectos».
  *3–4 h.* Comprobación: en 360, 390 y 820 px el contacto está a un toque desde
  cualquier altura.
- [ ] 🟠 **Formulario**: etiquetas visibles en vez de solo placeholders, el
  mensaje con 4 o 5 líneas y las pastillas en una sola línea en S (hoy
  «Un sistema de gestión» se parte en dos). *3–4 h.*
- [ ] 🟡 **Prueba en un iPad real con Safari 18** de lo que Playwright no
  reproduce: nubes, video y Turnstile. *1–2 h.*

## Etapa 5 — SEO técnico

- [x] **Título y descripción únicos** por página, desde una sola fuente.
  *src/lib/meta.js*
- [x] **Canonical derivado**: la misma cadena en `<link>`, sitemap y `og:url`.
- [x] **Open Graph y Twitter Card** por página, con tarjeta de 1200 × 630
  generada por script. *2026-10-01 · scripts/tarjetas-og.mjs*
- [x] **Datos estructurados**: Organization y ProfessionalService con RUT,
  WebSite, Service con Offer en UF (CLF), FAQPage, Article, BreadcrumbList,
  CollectionPage y AboutPage. *2026-10-15 · scripts/prerender.mjs*
- [x] **`sitemap.xml` con `lastmod` real**; el build falla si una página
  indexable no la tiene.
- [x] **`robots.txt`**, `noindex` en las páginas de error y 301 de las rutas
  viejas de servicios. *2026-10-17*
- [x] **Una sola URL por página**: `www` y barra final redirigen.
- [x] **Cuatro niveles de título** y textos alternativos descriptivos.
- [x] **Contenido**: 7 servicios con preguntas frecuentes, 14 artículos, la guía
  de la Ley 21.719 y un índice paginado. *2026-10-03 a 2026-10-17*
- [x] **Search Console verificado** con registro TXT en el DNS.
- [x] **Personas en el grafo**: un `Person` por socio en `/nosotros`
  (`alumniOf`, `award` y `sameAs` a LinkedIn y GitHub), con el ancla de su
  tarjeta como `@id`, y la `Organization` con `founder`, `foundingDate` (la
  constitución en el Registro, 2026-07-22) y `contactPoint`. Su `sameAs` sigue
  siendo solo GitHub hasta que exista la página de empresa en LinkedIn
  (etapa 12). *2026-10-22 · src/data/socios.js, scripts/prerender.mjs*
- [x] **Autor con nombre en los artículos**: firma con foto, nombre y rol bajo
  la entradilla, que lleva a la tarjeta del socio, y solo la fecha de
  actualización. El `author` del `Article` es su `Person`, y cada artículo dice
  quién lo firma (`autor`). *2026-10-22 · decisión 58, src/components/Articulo.jsx*
- [x] **`og:type` = `article`** en los artículos y en la guía de la Ley 21.719,
  con `article:published_time`, `article:modified_time` y `article:author`.
  *2026-10-22 · scripts/prerender.mjs*
- [ ] 🟡 **Logo de 512 px** para el grafo, en vez del ícono del iPhone. *0,5 h.*
- [ ] 🟡 **H1 de la portada limpio**: hoy el buscador lee «…y automatizaciones
  **páginas web** para tu negocio», porque la palabra del rotativo se suma a la
  frase para lectores de pantalla. *1 h.*
- [ ] 🟠 **Enlaces internos desde la portada**: 3 artículos y el precio de
  partida en cada servicio. Hoy la portada no enlaza a ningún artículo.
  *3–4 h.*
- [ ] 🟠 **Contenido con intención de compra**, uno al mes, empezando por
  «¿Cuánto cuesta una página web en Chile?» con la tabla real en UF.
  *3–4 h cada uno.*
- [ ] 🟠 **Primer caso de cliente** apenas exista, con su permiso y sus números.
  *4–6 h.*
- Las preguntas frecuentes se quedan como FAQPage (las leen buscadores y
  modelos), sin esperar el resultado enriquecido: desde 2023 Google lo muestra
  solo a sitios de gobierno y salud.

## Etapa 6 — Agentes de IA (Agentic Search)

- [x] **`llms.txt`** con empresa, RUT, páginas, proyectos, servicios y
  artículos, servido en UTF-8. *2026-07-17, al día · public/llms.txt*
- [x] **Content Signals** en `robots.txt`: buscar, citar y entrenar.
  *2026-10-15; entrenamiento permitido desde 2026-10-17*
- [x] **WebMCP declarativo**: `escribir_a_volutus` (contacto; lo rellena el
  agente y lo envía la persona) y `estimar_precio` (con `toolautosubmit`; le
  responde al agente con `respondWith`). *2026-10-18 · src/estimado.js*
- [x] **Ningún `<form>` sin anotar**: las fichas se cierran con `<button>`.
  *scripts/verificar.mjs*
- [x] **Lo que envía un agente** pasa por la misma validación que lo de una
  persona. *worker/index.js*
- [x] **Árbol de accesibilidad** legible para agentes: Lighthouse lo da por
  bueno.
- [x] **Cloudflare alineado con `robots.txt`**: AI Crawl Control no bloquea a
  ningún rastreador (GPTBot y ClaudeBot reciben 200) y el `robots.txt`
  gestionado está apagado. El README decía lo contrario y ya está corregido.
  *2026-10-22*
- [ ] 🟡 **Respuestas citables**: en cada artículo y servicio, un primer párrafo
  que responda el título en dos o tres frases, y los precios de partida en
  texto, no solo en el estimador. *0,5 h por página, 6–10 h en total.*
- [ ] 🟡 **Seguimiento mensual**: 10 preguntas fijas («empresa de software para
  pymes en Santiago», «cuánto cuesta una tienda online en Chile»…) en
  ChatGPT, Gemini, Claude, Perplexity y Copilot; anotar si aparece Volutus y
  con qué fuente. *1 h al mes.*
- [ ] ⚪ **`llms-full.txt`** generado en el prerender, solo si el seguimiento
  muestra que los modelos no encuentran el contenido. *2–3 h.*
- [ ] ⚪ **`/.well-known/ai-catalog.json`**: Lighthouse ya lo audita, pero la
  especificación sigue en desarrollo. Esperar. (En local, `vite preview`
  devuelve HTML en esa ruta y el audit falla; en producción da 404 y no
  aplica.)

## Etapa 7 — Dominio e infraestructura (Cloudflare)

- [x] **Cloudflare Workers con Static Assets**: el Worker solo corre en `/api/*`
  y `/grabados/*`; lo demás lo sirve Cloudflare directo. *2026-09-24 ·
  wrangler.jsonc*
- [x] **404 propia** con su estado 404.
- [x] **`www` integrado**: `www.volutus.cl` responde 301 hacia `volutus.cl` en
  HTTP y HTTPS, con certificado válido.
- [x] **HTTP/3, Brotli** y caché en el borde.
- [x] **Workers Observability**: los errores del formulario quedan registrados.
- [x] **Correo del dominio**: Zoho (MX, SPF, DKIM), Resend (DKIM y subdominio
  `send`) y DMARC en `quarantine`.
- [x] **UF diaria por GitHub Actions**, dos veces al día y con fuente de
  respaldo. *2026-10-21 · .github/workflows/uf.yml*
- [x] **Always Use HTTPS**: `http://` responde 301 a `https://` con la ruta y
  la query; *Automatic HTTPS Rewrites* ya estaba activo. *2026-10-22 · cf*
- [x] **TLS mínimo 1.2** y TLS 1.3 activo: 1.0 y 1.1 se rechazan.
  *2026-10-22 · cf*
- [x] **Registros CAA**: `iodef` a `contacto@volutus.cl`, y Cloudflare suma los
  `issue` de sus CA (Google Trust Services, Sectigo, Let's Encrypt, SSL.com y
  DigiCert). *2026-10-22 · cf*
- [x] **Barra final con 301**: `/privacidad/`, y toda ruta con barra, va a la
  misma sin ella. *2026-10-22 · scripts/prerender.mjs*
- [x] **Despliegue con Workers Builds**: `wrangler deploy` al hacer merge en
  `main` y una vista previa por rama con `wrangler versions upload`. Cumple lo
  que se pensaba hacer con GitHub Actions sin guardar un token de Cloudflare en
  GitHub. *Verificado el 2026-10-22*
- [x] **workers.dev apagado**: servía el sitio entero fuera de la zona, en HTTP
  y sin la regla del WAF. Las vistas previas siguen ahí. *2026-10-22 ·
  wrangler.jsonc*
- [x] **HSTS con `includeSubDomains`**: subdominios inventariados; solo `www`
  sirve web, y redirige por HTTPS. *2026-10-22 · src/lib/seguridad.js*
- [~] 🟠 **DNSSEC**: Cloudflare ya firma la zona; falta cargar el DS en NIC
  Chile (key tag `2371`, algoritmo `13`, digest tipo `2`,
  `42C802DC80BF887574309E6F532D3444E794E4D0E57A8E40751F254143B7465D`).
  *0,25 h + espera.* Comprobación: `dns.google/resolve?name=volutus.cl&type=DS`
  responde con `AD=true`.
- [ ] 🟡 **HSTS con `preload`**: dos semanas después de publicar
  `includeSubDomains` sin quejas, sumarlo en `src/lib/seguridad.js` y postular
  en hstspreload.org. *0,5 h.*
- [ ] ⚪ **Página de 5xx propia** al pasar la zona a Pro (pasos en el README).

## Etapa 8 — Seguridad

### Lo que ya protege el sitio

- [x] **Cabeceras desde un solo sitio** para `_headers` y el Worker: CSP
  estricta sin scripts en línea, HSTS, `nosniff`, Referrer-Policy,
  Permissions-Policy y COOP. *2026-09-30 · src/lib/seguridad.js*
- [x] **Un solo tercero en la página**: Turnstile. Sin analítica ni fuentes
  externas.
- [x] **Formulario endurecido**: mismo origen (`Origin` o `Sec-Fetch-Site`),
  5 envíos por minuto por IP, tope de 16 KB y de tipo antes de leer, trampa
  para robots, limpieza de caracteres de control (evita inyectar cabeceras por
  el asunto) y validación compartida entre cliente y Worker.
  *2026-10-03 · worker/index.js, src/lib/contacto.js*
- [x] **Turnstile** verificado con acción y dominio; el envío sin JavaScript y
  sin token se rechaza. *2026-10-03*
- [x] **Secretos fuera del repo** (`wrangler secret`, `.dev.vars` ignorado) y
  ningún dato personal en los logs.
- [x] **`security.txt`** con contacto y vencimiento. *2026-09-30*
- [x] **Envío por agente** validado igual que el de una persona.
- [x] **Rate-limit en el WAF** para `/api/*`: 5 peticiones cada 10 s por IP
  antes de llegar al Worker, que además corta a 5 por minuto. Lo que pasa de
  ahí recibe 429. *2026-10-22 · cf*
- [x] **Alertas** a `contacto@volutus.cl`: Workers Observability Issues avisa
  apenas el Worker registra un error (los `console.error` de `contacto:`), y
  Cloudflare Notifications, ante un problema de certificado o un ataque DDoS en
  cualquier zona de la cuenta. *2026-10-22 · wrangler.jsonc*

### Lo que falta cerrar

- [ ] 🟠 **Turnstile que falle cerrado**: si falta `TURNSTILE_SECRET`, hoy deja
  pasar todo. Que solo lo haga en `localhost`. *0,5 h.* Comprobación: sin el
  secreto, un envío a producción recibe 403.
- [ ] 🟡 **Retención en Resend y Zoho** igual a la que dice `/privacidad`. *1 h.*
- [ ] 🟡 **`upgrade-insecure-requests`** y `Cross-Origin-Resource-Policy:
  same-origin` en `CABECERAS`. *0,5 h.*
- [ ] ⚪ **Trusted Types** (`require-trusted-types-for 'script'`): probar que el
  bundle y Turnstile no se rompan. *1–2 h.*
- [ ] 🟡 **DMARC a `p=reject`** tras cuatro semanas limpias, con los informes a
  un analizador (Cloudflare DMARC Management es gratis y solo se activa desde
  el panel, en Email → DMARC Management). *0,5 h.*
- [ ] ⚪ **MTA-STS y TLS-RPT** para Zoho. *1–2 h.*
- [ ] 🟠 **Ley 21.719** (rige el 1 de diciembre de 2026): registro de
  actividades de tratamiento, contratos con Resend, Zoho y Cloudflare como
  encargados y procedimiento para responder derechos. Volutus vende esta
  adaptación: su sitio tiene que ser el ejemplo. *4–6 h.*
- [ ] 🟡 **`/privacidad` al día** con lo anterior. *1 h.*
- [ ] 🟡 **Prueba semanal del formulario** de punta a punta que avise si deja de
  llegar el correo. *2 h.*
- [ ] ⚪ **Renovar `security.txt`** antes de septiembre de 2027.

### Auditorías periódicas

| Auditoría | Herramienta | Cada | Horas |
| --- | --- | --- | --- |
| Cabeceras y TLS | Mozilla Observatory, securityheaders.com y SSL Labs (meta: A+) | Trimestre | 0,5 |
| Revisión del código | Skill `/security-review` de Claude Code en cada PR que toque `worker/`, `seguridad.js` o `contacto.js` | PR | 0,25 |
| Dependencias | `pnpm audit` y Dependabot | Semana | Automática |
| Secretos | Secret scanning y push protection de GitHub | Continuo | Automática |
| Escaneo dinámico | OWASP ZAP *baseline* contra la vista previa | Trimestre | 1–2 la primera vez |
| Abuso del formulario | Lista manual contra `wrangler dev`: otro origen, sin token, cuerpo de 1 MB, sexto envío en un minuto, salto de línea en el nombre, trampa rellena | Semestre | 1 |
| DNS y correo | DS, CAA e informes DMARC | Trimestre | 0,5 |
| Cloudflare | WAF, bots, AI Crawl Control, HTTPS y certificados | Semestre | 0,5 |
| Privacidad | Registro de tratamiento, retención y encargados | Año | 2 |
| Pentest externo | Una empresa de seguridad | Cuando el sitio maneje datos de clientes o pagos; hoy no se justifica | — |

- [ ] 🟠 **Primera ronda de auditorías** (Observatory, SSL Labs, ZAP y la lista
  del formulario) y su fecha anotada aquí. *3–4 h.*

## Etapa 9 — Calidad del código y flujo de trabajo

- [x] **ESLint sin avisos**. *2026-10-18 · eslint.config.js*
- [x] **Verificación automática** con Playwright en Chromium y WebKit: medidas,
  enlaces, foco, desbordamiento, WebMCP y nubes contra `tests/referencia.json`.
  *2026-09-25, ampliada hasta 2026-10-22 · scripts/verificar.mjs*
- [x] **Cada comprobación nace de un fallo real**, anotado en el script.
- [x] **Documentación**: README (arquitectura y comandos), DESIGN.md y
  DESIGN-BRIEF.md.
- [x] **Commits en español**, en imperativo.
- [ ] 🟠 **CI en cada PR**: lint, build, `pnpm verificar` con `wrangler dev` y
  Lighthouse CI con presupuesto (falla si una categoría baja de 100).
  *4–6 h.*
- [ ] 🟠 **Protección de `main`**: PR obligatorio con el CI en verde. *0,25 h.*
- [ ] 🟡 **Dependabot** activado. *0,5 h.*
- [ ] 🟡 **Actions fijadas por SHA** (`actions/checkout@v7` en `uf.yml`). *0,25 h.*
- [ ] 🟡 **Secret scanning y push protection** activos. *0,25 h.*
- [ ] ⚪ **Orden del repo**: sacar el CSV sintético de 7,1 MB a un release,
  corregir la URL de `package.json` (dice `VolutusDevGroup`) y la sección SEO
  del README. *1 h.*

## Etapa 10 — Skills y agentes (Claude Code)

Una skill es un paquete de instrucciones que el agente carga cuando la tarea lo
pide. Bien elegidas, aplican el mismo criterio en cada sesión; de más, gastan
contexto y se activan donde no corresponde.

- [x] **CLAUDE.md** como reglas del agente. *2026-07-15*
- [x] **15 skills en `.claude/skills/`**, con hash en `skills-lock.json` y
  origen documentado donde se trajeron a mano (`ORIGEN.md`). *2026-07-17 y
  2026-09-27*

### Revisión de las skills instaladas

| Skill | Para qué | Veredicto |
| --- | --- | --- |
| `frontend-design` | Dirección visual al crear UI | Mantener |
| `web-design-guidelines` | Revisar UI contra guías de interfaz y accesibilidad | Mantener; correrla en cada PR de UI |
| `emil-design-eng`, `apple-design` | Pulido y movimiento físico | Mantener |
| `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-vocabulary` | Movimiento | Mantener; `review-animations` antes de mergear animaciones |
| `copywriting`, `cro` | Textos y conversión | Mantener |
| `ui-ux-pro-max` | Catálogo de estilos y paletas | Opcional: se solapa con `frontend-design` |
| `vercel-react-best-practices` | Rendimiento de React y Next en el navegador | Quitar: aquí React no llega al navegador |
| `huashu-design` | Prototipos y presentaciones en HTML (en chino) | Quitar: se solapa con `frontend-design` |
| `clone-website`, `ui-cloner` | Copiar sitios ajenos | Quitar: chocan con un diseño propio y con derechos de terceros |

**Skills incluidas en Claude Code** que conviene usar: `/security-review`
(seguridad del diff), `/code-review` (errores), `/simplify` (encaja con la
regla de simplicidad) y `session-start-hook` (prepara las sesiones en la nube).

### Pendiente

Las skills propias convierten los pasos del README en algo que el agente sigue
solo. Van junto a las de terceros, nunca encima (regla de `ORIGEN.md`).

- [ ] 🟠 **`publicar-articulo`**: entrada en `PAGINAS` con `publicada` y
  `servicios`, cuerpo en `<Articulo>`, línea en `COMPONENTES`, `pnpm og`,
  `llms.txt`, `actualizada`, y la revisión SEO (título, descripción, primer
  párrafo que responde). *1–2 h.*
- [ ] 🟠 **`nueva-pagina-de-servicio`**: `SERVICIOS`, `PAGINAS`,
  `PAGINAS_DE_SERVICIO`, `ESTIMADOS`, pieza, favicon, tarjeta OG y `llms.txt`.
  *1–2 h.*
- [ ] 🟠 **`auditoria-seo`**: build, Lighthouse con la categoría agéntica,
  validación del JSON-LD, sitemap, robots, `llms.txt` y las pruebas de
  producción del anexo A. *1–2 h.*
- [ ] 🟠 **`auditoria-seguridad`**: cabeceras, HTTP → HTTPS, DNS (DS, CAA,
  DMARC), la lista de abuso del formulario y `pnpm audit`. *1–2 h.*
- [ ] 🟡 **`verificar-safari`**: `pnpm verificar` en WebKit y la lista de
  CLAUDE.md §6. *1–2 h.*
- [ ] 🟡 **`formulario-webmcp`**: las reglas de CLAUDE.md §7 como lista para cada
  `<form>` nuevo. *1–2 h.*
- [ ] 🟡 **Podar las skills** marcadas «Quitar». *0,5 h.*
- [ ] 🟡 **Hook de inicio de sesión** que instale dependencias, para que un
  agente en la nube pueda correr lint y build. *1 h.*

## Etapa 11 — Conversión y contenido

- [x] **Una sola acción**: el formulario, con correo y WhatsApp como
  alternativas. *Brief §1 · WhatsApp desde 2026-10-17*
- [x] **Las cuatro dudas respondidas**: qué hacen, cuánto cuesta, cuánto tarda
  y qué tiene que entregar el cliente.
- [x] **Precio visible**: estimador en UF con precio de partida, pesos del día
  y formas de pago. *2026-10-17 · src/lib/precios.js*
- [x] **Servicio ya marcado** en el formulario al llegar desde su página o
  artículo.
- [x] **«Antes de escribirnos» y «Cómo trabajamos»**. *2026-10-17*
- [x] **Proyectos comprobables**, con su enlace o su código.
- [ ] 🟠 **Prueba en la primera pantalla**: bajo el titular, «1.er lugar Cisco
  CyberGames Americas 2026 · PonleNota en línea · Código público», un segundo
  botón («Ver proyectos») y la promesa del brief («Software que puedes abrir y
  revisar») en vez de «Tú pones el problema…». *3–5 h.*
- [ ] 🟠 **Caras junto al formulario**: la tarjeta oscura de al lado solo lleva
  el titular. «Te responde Diego o Rodrigo», con fotos, el plazo de respuesta y
  el WhatsApp. *2–3 h.*
- [ ] 🟡 **Artículos en L y XL**: índice fijo y «Calcula tu estimado» en la
  columna derecha, que hoy queda vacía, más el tiempo de lectura. *3–4 h.*
- [ ] 🟡 **Tarjeta para compartir con la marca**: el cielo con la nube en vez
  de logotipo sobre blanco, y en los servicios, el color de su card.
  *1–2 h · scripts/tarjetas-og.mjs*

## Etapa 12 — Presencia fuera del sitio

Un dominio nuevo sin enlaces externos no sube solo con SEO técnico. Esta etapa
pesa más que cualquier ajuste de código.

- [x] **Search Console verificado**.
- [x] **Organización de GitHub** enlazada desde el grafo (`sameAs`).
- [ ] 🟠 **Search Console**: enviar `sitemap.xml` y activar avisos. *1 h.*
- [ ] 🟠 **Bing Webmaster Tools**, importando desde Search Console. Bing
  alimenta Copilot, DuckDuckGo, Yahoo, Ecosia y parte de ChatGPT. *0,5 h.*
- [ ] 🟠 **IndexNow** con *Crawler Hints* de Cloudflare (Caching →
  Configuration). *0,25 h.*
- [ ] 🔴 **Perfil de Empresa de Google** como negocio de área de servicio, sin
  dirección visible: Santiago y Chile, horario, WhatsApp y fotos. Las primeras
  reseñas, con PonleNota. *2 h.*
- [ ] 🟠 **Apple Business Connect**: Apple Maps, Siri, Spotlight y sugerencias
  de Safari. Applebot ya tiene paso en `robots.txt`. *1 h.*
- [ ] 🟡 **Brave Search** no acepta envíos: su índice crece con las visitas de
  quienes participan en su Web Discovery Project y con los enlaces. Revisar
  `site:volutus.cl` en search.brave.com cada mes. *0,5 h.*
- [ ] 🟠 **Enlaces desde lo propio**: «Hecho por Volutus» en ponlenota.cl, y
  `volutus.cl` en los README de CarFlip y del Hackathon y en los LinkedIn de
  los socios. *1–2 h.*
- [ ] 🟠 **Página de empresa en LinkedIn**. *1 h.*
- [ ] 🟡 **Directorios B2B** (Clutch, GoodFirms, Sortlist) y gremiales chilenos,
  con los mismos datos que el sitio: razón social, RUT, correo, WhatsApp y
  ciudad. *3–4 h.*

## Etapa 13 — Medición y gobierno

- [x] **Indicadores definidos** en el brief: 6 mensajes reales en 3 meses, 10 %
  de las visitas envían el formulario, primer resultado al buscar «Volutus» y
  Lighthouse 100. (Pendientes de confirmar; ver etapa 1.)
- [ ] 🟡 **Conversiones sin JavaScript**: contar en el Worker cada envío
  correcto con Workers Analytics Engine (servicio y canal, sin datos
  personales). *1–2 h.*
- [ ] 🟡 **Planilla de seguimiento** para la revisión mensual. *0,5 h.*
- [ ] 🟡 **Primera revisión trimestral**: repetir la línea base y comparar.
  *0,5–1 h.*

| Cada | Qué | Dónde |
| --- | --- | --- |
| PR | Lint, build, `pnpm verificar`, Lighthouse CI, `/security-review` si toca seguridad | GitHub Actions y Claude Code |
| Semana | Formulario de punta a punta, errores del Worker, dependencias | Actions, Observability y Dependabot |
| Mes | Search Console y Bing, `site:` en Brave, preguntas fijas a las IAs, conversiones | Planilla de seguimiento |
| Trimestre | Línea base, auditorías de la etapa 8 y este archivo al día | ROADMAP.md |

## Calendario de lo pendiente

| Cuándo | Qué | Horas |
| --- | --- | --- |
| Semana 1 | Etapa 7 completa, contacto en el teléfono (4), Search Console, Bing e IndexNow (12) | 10–12 |
| Semanas 2–4 | Etapas 1, 8 y 9; formulario (4); prueba en la portada y caras (11) | 35–50 |
| Mes 2 | Etapas 5, 6, 10 y el resto de la 12 | 35–55 |
| Mes 3 | Etapas 2 y 3; iPad real (4); artículos y tarjeta OG (11); conversiones (13) | 35–55 |
| Continuo | Etapa 13 | 3–5 al mes |
| | **Total** | **≈ 115–165** |

---

## Anexo A — Evidencia de la auditoría

Medido el 2026-10-22 sobre el commit `df165f3`.

- **Build**: `pnpm build` y `pnpm lint` sin errores ni avisos. 31 HTML; JS de
  cliente: 32 KB (13 KB gzip), el Worker de la nube, 42 KB (16 KB gzip), y el
  juego, 23 KB, que se carga solo al pedirlo.
- **Lighthouse 13.5 móvil, producción**: portada 99 en dos corridas (FCP 1,4–1,5 s,
  LCP 1,5–1,6 s, TBT 10 ms, CLS 0, SI 2,2–2,3 s).
- **Lighthouse local** (`vite preview`, sin compresión): servicio y artículo 100
  en las cuatro categorías; la portada dio 85 en una primera corrida en frío,
  que producción no repite.
- **Producción**: `www` → apex 301 (HTTP y HTTPS); `http://volutus.cl/` y
  `http://volutus.cl/servicios` 200 sin redirigir; `/privacidad/` 307; Brotli,
  HTTP/3 y cabeceras de `seguridad.js` presentes; los rastreadores de
  buscadores e IAs probados por user-agent reciben 200.
- **DNS**: NS de Cloudflare; MX, SPF y DKIM de Zoho; DKIM de Resend; DMARC
  `p=quarantine`; sin DS (DNSSEC) ni CAA; verificación de Google presente, de
  Bing ausente.

## Anexo B — Estimación estricta para un desarrollador junior

Lo que costaría construir el sitio tal como está hoy, con supuestos todos a la
baja:

- El junior recibe el brief, los textos de marca y las decisiones de
  DESIGN-BRIEF.md: no las descubre ni las discute.
- Trabaja con un asistente de IA, como se hizo este sitio: 71 de los 188
  commits de `main` llevan a Claude de coautor.
- Solo cuentan las horas que dejan código o texto en el repo. Nada de
  reuniones, gestión, holgura ni revisión senior pagada.

**Lo que tomó de verdad.** El historial de `main` va del 2 de julio al 22 de
octubre de 2026: 39 días-persona con commits (24 de Diego y 15 de Marbeck-one),
repartidos en 110 horas-reloj distintas. A 5–7 horas por día activo son unas
**200–270 horas**, hechas por quienes ya conocían el producto. La estimación
por bloques cae en el mismo rango.

| # | Bloque | Incluye | Horas |
| --- | --- | --- | --- |
| 1 | Descubrimiento y contenidos de marca | Lo entrega el cliente | 0 |
| 2 | Sistema de diseño | Tokens, cuatro niveles de título, color por zonas, botones, degradados, glifos | 10–15 |
| 3 | Arquitectura y build | Vite + React como plantilla, prerender, metadatos, rutas, ESLint, scripts de OG e íconos | 6–10 |
| 4 | Barra, logotipo animado y pie | Cápsula de vidrio, gota, ola en canvas, mar del pie | 15–20 |
| 5 | Portada | Titular rotativo, rueda con resorte y arrastre, proyectos con `<dialog>` animado, podio en pixel art | 30–40 |
| 6 | Nube en canvas | Worker, física de la volutus, seis perspectivas, grabaciones sin GPU, entrega por partes para Safari | 20–30 |
| 7 | Juego de patos y páginas de error | 404, 500 y `/patos` | 8–12 |
| 8 | Páginas de servicio | Índice, marco, 7 escenas SVG animadas, 7 cuerpos propios, preguntas frecuentes | 40–55 |
| 9 | Estimador en UF | Precios, boleta, barra fija en el teléfono, UF diaria con GitHub Actions | 8–12 |
| 10 | Artículos | Plantilla, sumario, paginación, relacionados y 14 textos revisados | 15–25 |
| 11 | Nosotros, Privacidad y Ley 21.719 | Escenas, socios y textos legales | 10–15 |
| 12 | SEO técnico y agentes | JSON-LD, sitemap, OG, `llms.txt`, `robots.txt`, redirecciones, WebMCP | 4–6 |
| 13 | Backend y seguridad | Worker, Turnstile, rate-limit, limpieza de datos, Resend, CSP, DNS de correo | 6–10 |
| 14 | QA | Cuatro tamaños, Safari e iOS, accesibilidad, `scripts/verificar.mjs` | 12–20 |
| 15 | Infraestructura | Cloudflare Workers, dominio, `www` | 2–4 |
| | **Total** | | **≈ 190–275** |

Son **5 a 7 semanas** de una persona a tiempo completo.

**Costo**, sin IVA (UF a $41.194,55 del 21-10-2026):

| Escenario | Supuesto | Total |
| --- | --- | --- |
| Junior contratado | Sueldo de ~$1,2 M bruto al mes ≈ $7.000 la hora, sin costos de empleador | **$1,3–1,9 M** (32–47 UF) |
| Junior freelance | $10.000 la hora | **$1,9–2,8 M** (46–67 UF) |

El sueldo de referencia es de Coderhouse, una fuente con interés comercial; la
tarifa freelance es un supuesto del mercado chileno, no un dato medido.

**Una versión sobria** (mismo contenido y SEO, sin nube ni mar en canvas, sin
juego, sin podio y con un solo molde para los servicios) son unas **80–120
horas: $0,6–1,2 M**.

**Para comparar**: esa versión sobria, cotizada con el propio estimador de
Volutus (sitio de 5 páginas, 20 páginas extra, blog y textos), sale 118 UF,
unos $4,9 M + IVA. Ese es un precio de venta, con la tarifa de la empresa
(1 UF la hora), no lo que cuesta pagarle a un junior.

**Lo pendiente de este roadmap** suma ≈ 115–165 horas con el mismo criterio:
$0,8–1,7 M.
