# Roadmap de calidad — volutus.cl

> Auditoría y plan de trabajo del 22 de octubre de 2026. Parte de lo que se midió
> ese día (anexo A) y ordena el trabajo en fases, de lo crítico a lo deseable.
> Cada tarea dice cuánto cuesta, cómo se comprueba que quedó hecha y qué mejora.
> Ninguna se da por cerrada si falla los «Criterios para aceptar un cambio» de
> [CLAUDE.md](CLAUDE.md).

## Cómo se usa

- `[ ]` pendiente · `[~]` en curso · `[x]` hecha y comprobada.
- **Esfuerzo** en horas de un desarrollador junior con revisión de un senior.
- **Impacto**: 🔴 crítico · 🟠 alto · 🟡 medio · ⚪ bajo.
- Una tarea se cierra con su **comprobación**, no con la opinión de quien la hizo.
- Al cerrar una tarea, se anota la fecha. Al cerrar una fase, se repite la
  medición de la línea base y se compara.

## Línea base (2026-10-22)

| Medición | Resultado | Meta |
| --- | --- | --- |
| Lighthouse móvil, portada en producción | Performance 99 (SI 2,2 s, TBT 10 ms, CLS 0) | 100 |
| Lighthouse móvil, servicio y artículo (build local) | 100 · 100 · 100 · 100 | 100 |
| Agentic Browsing (Lighthouse 13.5) | Pasa árbol de accesibilidad, llms.txt y CLS. WebMCP no evaluable sin el flag de Chrome. `ai-catalog.json` no aplica en producción | Todo lo aplicable en verde |
| `www.volutus.cl` → `volutus.cl` | ✅ 301 en HTTP y HTTPS | — |
| `http://volutus.cl` → HTTPS | ❌ Responde **200 en HTTP plano**, también `POST /api/contacto` | 301 a HTTPS |
| DNSSEC / CAA | ❌ / ❌ | Activos |
| Correo (SPF, DKIM Zoho y Resend, DMARC) | ✅ DMARC en `p=quarantine` | `p=reject` |
| CSS incrustado por página | 143 KB (27 KB gzip), el de **todo** el sitio; Lighthouse marca 22–25 KB sin usar | Solo el de la página |

---

## Fase 0 — Medir antes de tocar · semana 1

Sin medición no se sabe si una fase mejoró algo.

- [ ] 🟠 **Google Search Console**: el TXT de verificación ya está en el DNS.
  Enviar `sitemap.xml`, revisar indexación de las 29 URLs y activar avisos por
  correo. *2 h.* Comprobación: las URLs del sitemap aparecen como «Indexadas».
- [ ] 🟠 **Bing Webmaster Tools**, importando desde Search Console. Bing alimenta
  Bing, DuckDuckGo, Yahoo, Ecosia, Copilot y parte de la búsqueda de ChatGPT.
  *1 h.* Comprobación: sitemap procesado sin errores.
- [ ] 🟡 **Lighthouse CI en GitHub Actions** sobre portada, un servicio y un
  artículo, con presupuesto: falla el PR si una categoría baja de 100 o si el
  HTML de una página supera el tope que se fije. *6–8 h.* Comprobación: un PR
  de prueba que empeora el CSS queda en rojo.
- [ ] 🟡 **`pnpm verificar` en CI** (Chromium y WebKit con `wrangler dev`). Hoy
  corre solo a mano. *4–6 h.*
- [ ] ⚪ **Conversiones sin JavaScript**: contar en el Worker cada envío correcto
  del formulario con Workers Analytics Engine (servicio marcado y canal), sin
  datos personales. *3–4 h.* Comprobación: el panel muestra los envíos de una
  semana.

## Fase 1 — Dominio, Cloudflare y www · semana 1

El `www` ya está integrado: `www.volutus.cl` responde 301 hacia `volutus.cl` en
HTTP y en HTTPS, con certificado válido. Falta cerrar el resto del transporte.

- [ ] 🔴 **Always Use HTTPS** (SSL/TLS → Edge Certificates). Hoy
  `http://volutus.cl/…` responde 200 sin cifrar, y el formulario enviado desde
  esa página viajaría en texto plano. Activar también *Automatic HTTPS
  Rewrites*. *0,5 h.* Comprobación: `curl -I http://volutus.cl/` devuelve 301 a
  `https://`.
- [ ] 🟠 **TLS mínimo 1.2 y TLS 1.3 activo.** *0,5 h.*
- [ ] 🟠 **DNSSEC**: activarlo en Cloudflare (DNS → Settings) y cargar el DS en
  NIC Chile. *1 h + espera de NIC.* Comprobación: `dns.google/resolve?name=volutus.cl&type=DS`
  devuelve el registro y `AD=true`.
- [ ] 🟠 **Registros CAA** que limiten quién emite certificados para el dominio,
  con `iodef` a `contacto@volutus.cl`. Al crear uno, Cloudflare agrega los de las
  CA de su Universal SSL; revisar que queden. *1 h.*
- [ ] 🟡 **HSTS por etapas** (en `src/lib/seguridad.js`, que es su único sitio):
  1. Inventariar subdominios (hoy: `www` y `send`, este último solo de correo).
  2. Agregar `includeSubDomains` y vigilar dos semanas.
  3. Agregar `preload` y postular en hstspreload.org.
  *2 h repartidas.* Requiere la tarea de Always Use HTTPS. Comprobación:
  hstspreload.org lo acepta.
- [ ] ⚪ **Barra final**: `/privacidad/` responde 307 (temporal) hacia
  `/privacidad`. Una Redirect Rule que lo haga 301. *1 h.*
- [ ] 🟡 **Despliegue desde GitHub Actions** con `wrangler deploy` al hacer
  merge en `main`, y versión de vista previa por PR. Hoy no hay rastro en el
  repo de cómo se despliega. *6–10 h.*
- [ ] ⚪ **Página de 5xx propia** al pasar la zona a Pro (ya documentado en el
  README).

## Fase 2 — Seguridad por capas · semanas 2 a 4

El sitio ya parte alto: CSP estricta sin scripts en línea, Turnstile con acción
y dominio verificados, rate-limit por IP, trampa de robots, tope de cuerpo,
limpieza de caracteres de control y `security.txt`. Lo que sigue cierra huecos
y deja todo vigilado.

### 2a. Formulario y Worker

- [ ] 🟠 **Turnstile que falle cerrado en producción.** Hoy, si
  `TURNSTILE_SECRET` falta, `pasaTurnstile` deja pasar todo y solo lo registra
  (`worker/index.js`). Que solo deje pasar cuando el host es `localhost`.
  *1–2 h.* Comprobación: sin el secreto, un envío a producción recibe 403.
- [ ] 🟡 **Regla de rate-limit en el WAF** de Cloudflare para `/api/*`, antes del
  Worker (el plan Free incluye una). *1 h.*
- [ ] 🟡 **Retención en Resend y Zoho**: fijar cuánto se guardan los mensajes y
  que coincida con lo que dice `/privacidad`. *2 h.*

### 2b. Cabeceras

- [ ] 🟡 `upgrade-insecure-requests` y `Cross-Origin-Resource-Policy: same-origin`
  en `CABECERAS`. *1 h.* Comprobación: securityheaders.com y Mozilla Observatory
  en A+.
- [ ] ⚪ Evaluar `require-trusted-types-for 'script'`: los navegadores que no la
  soportan la ignoran, pero hay que probar que el bundle y Turnstile no se
  rompan en Chrome. *3–4 h.*

### 2c. Correo del dominio

- [ ] 🟡 **DMARC a `p=reject`** tras cuatro semanas de informes limpios. Mandar
  `rua` a un analizador (Cloudflare DMARC Management es gratis) en vez de a la
  bandeja de contacto. *2 h.*
- [ ] ⚪ **MTA-STS y TLS-RPT** para Zoho. *3–4 h.*

### 2d. Repositorio y dependencias

- [ ] 🟠 **Protección de `main`**: PR obligatorio, lint y build en verde. *1 h.*
- [ ] 🟡 **Dependabot o Renovate** y `pnpm audit` en CI. *2 h.*
- [ ] 🟡 **Fijar las Actions por SHA** (`actions/checkout@v7` en `uf.yml`). *0,5 h.*
- [ ] 🟡 **Secret scanning y push protection** de GitHub activos. *0,5 h.*

### 2e. Ley 21.719 (rige el 1 de diciembre de 2026)

Volutus vende la adaptación a esta ley: su propio sitio tiene que ser el ejemplo.

- [ ] 🟠 **Registro de actividades de tratamiento** del formulario, WhatsApp y
  correo; contratos de encargo con Resend, Zoho y Cloudflare; procedimiento
  escrito para responder derechos en plazo. *8–12 h.*
- [ ] 🟡 Revisar que `/privacidad` refleje exactamente lo anterior. *2 h.*

### 2f. Vigilancia

- [ ] 🟡 **Alertas**: Cloudflare Notifications y una alerta sobre los
  `console.error` de `contacto:` en Workers Observability. *2–3 h.*
- [ ] 🟡 **Prueba semanal del formulario** de punta a punta (cron trigger o
  Action) que avise si deja de llegar el correo. *4–6 h.*
- [ ] ⚪ Renovar `Expires` de `security.txt` antes de septiembre de 2027.

## Fase 3 — SEO técnico en Google · semanas 2 a 6

La base es muy buena: HTML prerenderizado, canonical derivado, sitemap con
`lastmod` real, JSON-LD por tipo de página, OG por página y redirecciones 301.
Lo que falta es identidad (quién está detrás) y enlaces internos.

- [ ] 🟠 **Personas en el grafo**: un `Person` por socio en `/nosotros` (nombre,
  cargo, `alumniOf`, `award`, `sameAs` a LinkedIn y GitHub), y la
  `Organization` con `founder`, `foundingDate`, `contactPoint` y `sameAs`
  ampliado (LinkedIn de la empresa, Perfil de Empresa de Google). *6–8 h.*
  Comprobación: Rich Results Test y validator.schema.org sin errores.
- [ ] 🟠 **Autor con nombre en los artículos**: firma visible con foto y el
  `author` del `Article` apuntando a la `Person`. Google y los modelos de IA
  pesan quién escribe (E-E-A-T). *6–8 h.*
- [ ] 🟡 **`og:type` = `article`** en los artículos, con `article:published_time`,
  `article:modified_time` y `article:author`. *1–2 h.*
- [ ] 🟡 **Logo propio para el grafo**: un PNG cuadrado de 512 px en vez del
  ícono del iPhone. *1 h.*
- [ ] 🟡 **H1 de la portada**: el texto que lee el buscador hoy es «Creamos
  páginas web, tiendas online, …y automatizaciones **páginas web** para tu
  negocio»: la palabra del rotativo se suma a la frase para lectores. Dejar una
  sola frase limpia. *2–3 h.*
- [ ] 🟠 **Enlaces internos desde la portada**: un bloque con 3 artículos y el
  precio de partida de cada servicio en la rueda. Hoy la portada no enlaza a
  ningún artículo. *8–12 h.*
- [ ] 🟠 **Contenido para búsquedas con intención de compra**, una pieza por mes:
  «¿Cuánto cuesta una página web en Chile?» (con la tabla del estimador en
  texto), «tienda online para pyme en Chile», «agente de IA para WhatsApp».
  *8–12 h cada una.*
- [ ] 🟠 **Primer caso de cliente** apenas exista uno, con su permiso y sus
  números. El análisis de perfiles (`docs/`) lo marca como el segundo freno
  (C8). *10–16 h.*
- [ ] ⚪ FAQPage: mantenerlo (sirve a buscadores y modelos), pero sin esperar el
  resultado enriquecido: Google lo muestra solo a sitios de gobierno y salud
  desde 2023.

## Fase 4 — Presencia fuera del sitio: Google, Bing, Apple, Brave · mes 2

Un dominio nuevo sin enlaces externos no sube solo por SEO técnico. Esta fase
pesa más que cualquier ajuste de código.

- [ ] 🔴 **Perfil de Empresa de Google** como negocio de área de servicio, sin
  dirección visible (el domicilio es particular), con Santiago y Chile como zona,
  horario, WhatsApp, enlace y fotos. Pedir las primeras reseñas con PonleNota:
  el producto propio probándose en casa. *4–6 h.*
- [ ] 🟠 **Apple Business Connect**: ficha en Apple Maps, sugerencias de Siri y
  de la barra de Safari y Spotlight. Applebot ya tiene paso en `robots.txt`.
  *2–3 h.*
- [ ] 🟠 **IndexNow** con *Crawler Hints* de Cloudflare (Caching →
  Configuration): avisa a Bing y otros buscadores cada vez que cambia una
  página. *0,5 h.*
- [ ] 🟡 **Brave Search** no acepta envíos: su índice crece con las visitas de
  usuarios de Brave que participan en su Web Discovery Project y con los
  enlaces. Comprobar `site:volutus.cl` en search.brave.com cada mes; lo que
  ayuda es lo mismo que en esta fase: enlaces y visitas reales. *0,5 h/mes.*
- [ ] 🟠 **Enlaces desde lo propio**: «Hecho por Volutus» en el pie de
  ponlenota.cl, `volutus.cl` en los README de CarFlip y del Hackathon, en la
  organización de GitHub y en los perfiles de LinkedIn de los socios. *3–4 h.*
- [ ] 🟠 **Página de empresa en LinkedIn** con el mismo nombre, descripción,
  logo y enlace. *2–3 h.*
- [ ] 🟡 **Directorios B2B** (Clutch, GoodFirms, Sortlist, DesignRush) y
  gremiales chilenos. Los modelos de IA citan mucho esas listas. *6–10 h.*
- [ ] 🟡 **Datos idénticos en todas partes**: razón social, RUT, correo,
  WhatsApp y ciudad escritos igual en el sitio, Google, Apple, LinkedIn y
  directorios. *1 h de revisión.*

## Fase 5 — Visibilidad en IAs (ChatGPT, Gemini, Claude, Perplexity, Copilot) · mes 2

Ya hay `llms.txt` (Lighthouse lo da por bueno), `Content-Signal` que permite
buscar, citar y entrenar, y el formulario anotado para WebMCP.

- [ ] 🟠 **Alinear Cloudflare con `robots.txt`**: el README dice que AI Crawl
  Control bloquea GPTBot y ClaudeBot, pero desde el 17 de octubre `robots.txt`
  los deja pasar. Revisar el panel, decidir una sola política y corregir el
  README. *1 h.*
- [ ] 🟡 **Respuestas citables**: en cada artículo y servicio, un primer párrafo
  que responda la pregunta del título en dos o tres frases, y los precios de
  partida escritos en texto («una landing desde 10 UF + IVA»), no solo en el
  estimador interactivo. *1–2 h por página.*
- [ ] 🟡 **Seguimiento mensual**: 10 preguntas fijas («empresa de desarrollo de
  software para pymes en Santiago», «cuánto cuesta una tienda online en
  Chile», …) en ChatGPT, Gemini, Claude, Perplexity y Copilot; anotar si
  aparece Volutus y con qué fuente. El panel de AI Crawl Control muestra qué
  rastreadores entran. *2 h/mes.*
- [ ] ⚪ **`llms-full.txt`** generado en el prerender con el texto de cada
  página, si la medición anterior muestra que los modelos no encuentran el
  contenido. *6–10 h.*
- [ ] ⚪ **`/.well-known/ai-catalog.json`** (Agent Resource Discovery): Lighthouse
  ya lo audita, pero la especificación sigue en desarrollo. Esperar a que se
  estabilice. En local, `vite preview` devuelve el HTML para esa ruta y el
  audit falla; en producción responde 404 y no aplica.

## Fase 6 — Diseño y conversión · meses 2 y 3

El sitio tiene una identidad propia y un oficio poco común: la nube en píxeles,
la rueda de servicios, las piezas de cada servicio y el estimador en UF. Lo que
sigue no es rehacerlo, sino que la página venda tan bien como se ve.

- [ ] 🔴 **La acción principal desaparece en el teléfono.** Bajo 768 px la barra
  retira «Cuéntanos tu proyecto», y bajo 1024 px, «Artículos»; no hay menú
  que los recoja. Según el brief, casi todos llegan desde WhatsApp, en el
  teléfono. Mantener siempre visible el botón de contacto (o un menú compacto)
  y sumar «Proyectos», que es la prueba que vienen a buscar. *8–12 h.*
  Comprobación: en 360, 390 y 820 px el contacto está a un toque desde
  cualquier altura.
- [ ] 🟠 **Prueba en la primera pantalla.** La portada promete en abstracto («Tú
  pones el problema. Nosotros lo resolvemos.») y en XL deja un tercio de cielo
  vacío. Bajo el titular: una línea de prueba («1.er lugar Cisco CyberGames
  Americas 2026 · PonleNota en línea · Código público»), un segundo botón
  («Ver proyectos» o «Calcula tu estimado») y la entradilla del brief
  («Software que puedes abrir y revisar»). Que la rueda asome en la primera
  pantalla en XL. *10–14 h.*
- [ ] 🟠 **Formulario**: etiquetas visibles en vez de solo placeholders; el
  mensaje, que es el campo que importa, con 4 o 5 líneas; pastillas de una sola
  línea en S (hoy «Un sistema de gestión» y «Una automatización» se parten en
  dos y quedan de alturas distintas); qué pasa después y en cuánto se responde
  («te respondemos en menos de 48 horas hábiles»). *8–12 h.*
- [ ] 🟠 **Caras junto al formulario.** La tarjeta oscura al lado del formulario
  solo lleva el titular. Usarla para «Te responde Diego o Rodrigo», con sus
  fotos y el WhatsApp. Para una pyme, saber quién contesta pesa más que
  cualquier animación. *6–8 h.*
- [ ] 🟡 **Una sola voz visual.** En una misma portada conviven la nube en
  píxeles, cards 3D brillantes, láminas editoriales oscuras, un podio de 8 bits
  con Press Start 2P, un formulario estilo SaaS y la marca gigante del pie. El
  podio es lo que más se aleja: dejar el pixel art como ilustración, pero con
  la tipografía, los radios y los colores del sistema, y llevar el tono de
  juego a `/patos`. *12–16 h.*
- [ ] 🟡 **Presupuesto de movimiento**: una animación protagonista por pantalla.
  Hoy se mueven a la vez el logotipo, la gota, la nube, la rueda, la ola y el
  mar. Escribir la regla en DESIGN.md y aplicarla. *6–8 h.*
- [ ] 🟡 **Artículos en L y XL**: la columna derecha queda vacía. Índice fijo
  del artículo y un llamado a «Calcula tu estimado», más el tiempo de lectura
  y la firma del autor. *8–10 h.*
- [ ] 🟡 **Tarjeta para compartir con la marca**: hoy es logotipo azul sobre
  blanco. En la vista previa de WhatsApp, el cielo de la portada con la nube la
  hace reconocible al instante; en los servicios, el color de su card.
  *4–6 h* (`scripts/tarjetas-og.mjs`).
- [ ] ⚪ **Titulares en mayúscula**: la Archivo cursiva en mayúscula a 76 px es
  la firma de la marca, pero en español las palabras largas la parten mal.
  Tope de tres líneas y `text-wrap: balance` (Safari 17.5 en adelante; sin él
  solo cambia el corte). *2–3 h.*

## Fase 7 — Rendimiento y mantenibilidad · mes 3

- [ ] 🟠 **CSS por página.** El prerender incrusta en cada HTML el CSS de todo el
  sitio: 143 KB (27 KB gzip), con 22–25 KB que esa página no usa, y se vuelve a
  descargar en cada navegación. Partirlo en una base común más el CSS de los
  componentes que renderiza cada ruta, que el prerender ya conoce. Meta: −50 %
  de CSS por página. *16–24 h.* Comprobación: Lighthouse sin «unused CSS» y
  ninguna página con un estilo de menos (capturas de `pnpm verificar`).
- [ ] 🟡 **Primer pintado de la nube**: el Speed Index de la portada (2,2 s) es
  lo que la deja en 99. Un póster liviano (AVIF o el primer cuadro del video)
  bajo el canvas, mientras el Worker arranca. *6–10 h.*
- [ ] 🟡 **Precargar solo las fuentes de la primera pantalla** de cada página:
  hoy las tres se precargan en todas, Geist Mono incluida. *3–4 h.*
- [ ] ⚪ **Orden del repositorio**: sacar del repo el CSV sintético de 7,1 MB
  (`docs/perfiles-clientes-100000.csv`) a un release o a otro almacenamiento;
  corregir la URL de `package.json` (dice `VolutusDevGroup`); actualizar el
  README (sección SEO y robots); avisar en CLAUDE.md que el vault
  `C:\VaultObsidianVolutus` no existe en las sesiones en la nube. *2–3 h.*

## Fase 8 — Artefacto de diseño (sistema vivo) · mes 3

DESIGN.md describe muy bien el sistema, pero es texto: nadie puede ver los
botones, las zonas de color o los niveles de título lado a lado, y el día que
el CSS cambie, el documento queda atrás.

- [ ] 🟠 **Página `/diseno`** prerenderizada con los mismos componentes del sitio
  (no copias), `noindex` y fuera del sitemap: tokens de color por zona, escala
  tipográfica con los cuatro niveles, píldora y cuadro en todos sus estados,
  tarjetas, glifos de servicio con su gesto, curvas y tiempos de movimiento, y
  un «sí / no» por pieza. Como sale del mismo código, no puede desincronizarse.
  *20–30 h.* Comprobación: una página nueva se arma solo con piezas que están
  en `/diseno`.
- [ ] 🟡 **Versión para compartir** (artefacto publicado o PDF) para clientes y
  colaboradores: la marca, los colores, la tipografía y el tono. *6–8 h.*
- [ ] 🟡 **Kit de marca** para que el sitio se vea igual fuera de él: logo en
  SVG y PNG (claro y oscuro), avatar cuadrado para Google, Apple, LinkedIn y
  GitHub, portada de LinkedIn, firma de correo y plantilla de la tarjeta OG.
  *8–12 h.*
- [ ] ⚪ Enlazar `/diseno` desde DESIGN.md y DESIGN-BRIEF.md como fuente visual.

## Fase 9 — Gobierno continuo · desde el mes 2

| Cada | Qué | Dónde |
| --- | --- | --- |
| PR | Lint, build, Lighthouse CI, `pnpm verificar` | GitHub Actions |
| Semana | Formulario de punta a punta; errores del Worker | Action + Observability |
| Mes | Consultas y páginas en Search Console y Bing; `site:` en Brave; preguntas fijas en las IAs; Core Web Vitals reales | Planilla de seguimiento |
| Trimestre | Repetir la línea base; revisar DMARC, dependencias, CSP y `security.txt` | Este archivo |

**Indicadores del brief** (DESIGN-BRIEF §1): 6 mensajes reales en 3 meses, 10 %
de las visitas envían el formulario, primer resultado al buscar «Volutus» y
Lighthouse 100 en las cuatro categorías.

## Calendario resumido

| Cuándo | Fases | Horas junior aprox. |
| --- | --- | --- |
| Semana 1 | 0 y 1 (crítico: HTTPS, DNSSEC, CAA, Search Console, Bing) | 25–40 |
| Semanas 2–4 | 2 (seguridad) y lo 🔴/🟠 de la 6 (contacto en el teléfono, prueba en la portada) | 70–100 |
| Mes 2 | 3, 4 y 5 (identidad, presencia fuera del sitio, IAs) | 80–120 |
| Mes 3 | 6 restante, 7 y 8 (diseño, CSS por página, artefacto de diseño) | 110–160 |
| Continuo | 9 | 6–10 al mes |

---

## Anexo A — Evidencia de la auditoría

Medido el 2026-10-22 sobre el commit `df165f3`.

- **Build**: `pnpm build` y `pnpm lint` sin errores ni avisos. 31 HTML; JS de
  cliente: 32 KB (13 KB gzip) más el Worker de la nube, 42 KB (16 KB gzip), y
  el juego, 23 KB, que se carga solo al pedirlo.
- **Lighthouse 13.5 móvil, producción**: portada 99 en dos corridas (FCP 1,4–1,5 s,
  LCP 1,5–1,6 s, TBT 10 ms, CLS 0, SI 2,2–2,3 s).
- **Lighthouse local** (`vite preview`, sin compresión): servicio y artículo 100
  en las cuatro categorías; la portada dio 85 en una primera corrida en frío,
  que producción no repite.
- **Producción**: `www` → apex 301 (HTTP y HTTPS); `http://volutus.cl/` y
  `http://volutus.cl/servicios` 200 sin redirigir; `/privacidad/` 307; Brotli,
  HTTP/3 y cabeceras de `seguridad.js` presentes; los rastreadores de buscadores
  e IAs probados por user-agent reciben 200.
- **DNS**: NS de Cloudflare; MX, SPF y DKIM de Zoho; DKIM de Resend; DMARC
  `p=quarantine`; sin DS (DNSSEC) ni CAA; verificación de Google presente, de
  Bing ausente.

## Anexo B — Estimación para un desarrollador junior

Lo que costaría construir el sitio tal como está hoy, desde cero, con un
desarrollador junior y revisión de un senior.

| # | Bloque | Incluye | Horas |
| --- | --- | --- | --- |
| 1 | Descubrimiento y contenidos de marca | Brief con 57 decisiones, perfiles de cliente, textos de portada y servicios | 50–70 |
| 2 | Sistema de diseño | Tokens, cuatro niveles de título, color por zonas, botones, degradados, glifos | 50–70 |
| 3 | Arquitectura y build | Vite + React como plantilla, prerender, metadatos, rutas, ESLint, scripts de OG e íconos | 35–50 |
| 4 | Barra, logotipo animado y pie | Cápsula de vidrio, gota, ola en canvas, mar del pie | 65–100 |
| 5 | Portada | Titular rotativo, rueda con resorte y arrastre, proyectos con `<dialog>` animado, podio en pixel art | 130–190 |
| 6 | Nube en canvas | Worker, física de la volutus, seis perspectivas, grabaciones para equipos sin GPU, entrega por partes para Safari | 90–130 |
| 7 | Juego de patos y páginas de error | 404, 500 y `/patos` | 45–70 |
| 8 | Páginas de servicio | Índice, marco, 7 escenas SVG animadas, 7 cuerpos propios con animación al desplazarse, preguntas frecuentes | 185–265 |
| 9 | Estimador en UF | Precios, boleta, barra fija en el teléfono, UF diaria con GitHub Actions | 40–60 |
| 10 | Artículos | Plantilla, sumario, paginación, relacionados y redacción de 14 artículos | 80–120 |
| 11 | Nosotros, Privacidad y Ley 21.719 | Escenas, socios, textos legales investigados | 60–90 |
| 12 | SEO técnico y agentes | JSON-LD, sitemap, OG, `llms.txt`, `robots.txt`, redirecciones, WebMCP | 30–45 |
| 13 | Backend y seguridad | Worker, Turnstile, rate-limit, limpieza de datos, Resend, CSP, DNS de correo | 30–45 |
| 14 | QA | Cuatro tamaños, Safari e iOS, accesibilidad, `scripts/verificar.mjs` | 50–80 |
| 15 | Infraestructura | Cloudflare Workers, dominio, `www` | 8–15 |
| 16 | Gestión e iteraciones | Reuniones, revisiones, cambios de rumbo | 60–100 |
| | **Total** | | **≈ 1.000–1.500** |

A tiempo completo son **7 a 10 meses** de una persona. Se suman **100 a 150
horas de un senior** para revisar: sin esa guía, un junior difícilmente llega a
este nivel de detalle.

**Costo** (UF a $41.194,55 del 21-10-2026):

| Escenario | Supuesto | Junior | + senior (100–150 h a 1 UF) | Total aprox. |
| --- | --- | --- | --- | --- |
| Junior contratado | Sueldo de ~$1,2 M bruto + ~25 % de costo empresa ≈ $10.000 por hora productiva | $10,0–15,0 M | $4,1–6,2 M | **$14–21 M** |
| Junior freelance | $15.000 la hora | $15,0–22,5 M | $4,1–6,2 M | **$19–29 M** |
| Agencia | 0,5 UF la hora junior | 500–750 UF ($20,6–30,9 M) | 100–150 UF | **600–900 UF ($25–37 M)** |

Valores sin IVA. El sueldo de referencia es de Coderhouse, una fuente con
interés comercial; las tarifas freelance y de agencia son supuestos razonables
del mercado chileno, no datos medidos.

**Una versión sobria** del mismo sitio (mismo contenido y SEO, sin nube ni mar
en canvas, sin juego, sin podio y con un solo molde para los servicios) bajaría
a unas **450–650 horas**.

**Para comparar**: el estimador de Volutus cotiza una landing de una página en
10 horas (10 UF). Este sitio es un escaparate, unas cien veces eso: no sirve de
referencia para cotizar a un cliente.
