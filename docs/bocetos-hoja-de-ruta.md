# Hoja de ruta de los bocetos del brief

> El plan para terminar los bocetos de /brief-web: qué falta, cómo se hace cada
> uno y en qué orden. Está pensado para repartirse entre varias sesiones: cada
> una toma la siguiente tanda pendiente, la deja lista para revisar y actualiza
> la tabla de estado. Escrito el 11 de noviembre de 2026, sobre el commit
> `1432db0`.

## Objetivo

El brief muestra 24 direcciones de estilo ([src/lib/brief/bocetos.js](../src/lib/brief/bocetos.js)). Cada una tiene una tarjeta en el brief y un boceto: la landing page entera de una marca inventada, en `public/brief/bocetos/<slug>.html`, para que el cliente vea el estilo puesto en una página real y lo califique.

Hoy hay 6 bocetos (Alba, Cauce, Rosa, Ónix, Golpe y Kiri) y los otros 18 dan 404. Nodo y Kōen, los que reemplazaron Cauce y Kiri, siguen en `public/` hasta que se borren (ver la bitácora). Salvo las de Cauce y Kiri, las tarjetas dibujan cada estilo con un arte genérico que no se parece a su boceto.

El trabajo termina cuando:

- los 24 estilos tienen su boceto, cada uno con una marca creíble creada desde cero (nombre, rubro, logo, paleta, voz y fotos) y **una sola idea fuerte**, que se ve en la página y en su movimiento;
- Nodo (tecnológico) y Kōen (zen) quedaron reemplazados por marcas nuevas, porque no gustaron;
- las 24 tarjetas del brief están dibujadas con la marca de su boceto: su logo, su paleta, su letra y un gesto de su página;
- ningún enlace del brief da 404 y cada tarjeta coincide con su página.

## Cómo retomar en una sesión nueva

1. Leer este archivo entero y la [bitácora](#bitácora-de-decisiones): ahí está lo que el usuario ya aprobó o rechazó.
2. Tomar la primera tanda con trabajo pendiente en la [tabla de estado](#tabla-de-estado).
3. Hacer cada boceto de la tanda con los [pasos por boceto](#pasos-por-boceto), siguiendo su ficha en [las marcas](#las-20-marcas-nuevas).
4. Verificar la tanda (ver [Verificación](#verificación)) y entregarla para revisión en `pnpm dev`, con los enlaces a cada boceto.
5. Actualizar la tabla de estado y anotar en la bitácora lo que diga el usuario.
6. Hacer commit solo cuando el usuario lo pida: uno por tanda, sin líneas de atribución.

El usuario prefiere revisar rápido sobre lo real: se entrega apenas la tanda funciona, con un ancho de teléfono y uno de escritorio revisados con movimiento. La pasada completa de anchos y Safari se hace antes del commit.

## Tabla de estado

Estados: **pendiente**, **hecho** (listo para revisar) y **aprobado** (el usuario lo vio y quedó).

| Estilo | Marca | Tanda | Página | Fotos | Tarjeta | Revisado |
| --- | --- | --- | --- | --- | --- | --- |
| Tecnológico | Cauce | 1 | hecho | hecho | hecho | pendiente |
| Zen / japonés | Kiri | 1 | hecho | hecho | hecho | pendiente |
| Corporativo | Basal Ingeniería | 2 | pendiente | pendiente | pendiente | pendiente |
| Editorial | Viña Ladera | 2 | pendiente | pendiente | pendiente | pendiente |
| Clínico / limpio | Iris Centro Visual | 2 | pendiente | pendiente | pendiente | pendiente |
| Natural | Quillay | 2 | pendiente | pendiente | pendiente | pendiente |
| Lúdico | Pelusa | 3 | pendiente | pendiente | pendiente | pendiente |
| Retro | Pista Lucero | 3 | pendiente | pendiente | pendiente | pendiente |
| Memphis | Tablero | 3 | pendiente | pendiente | pendiente | pendiente |
| Y2K | Destello | 3 | pendiente | pendiente | pendiente | pendiente |
| Futurista | Cénit | 3 | pendiente | pendiente | pendiente | pendiente |
| Brutalista | Sótano | 4 | pendiente | pendiente | pendiente | pendiente |
| Suizo / gráfico | Rumbo | 4 | pendiente | pendiente | pendiente | pendiente |
| Bauhaus | Foco | 4 | pendiente | pendiente | pendiente | pendiente |
| Art déco | Bar Marfil | 4 | pendiente | pendiente | pendiente | pendiente |
| Artesanal | Ulmo | 5 | pendiente | pendiente | pendiente | pendiente |
| Industrial | Remache | 5 | pendiente | pendiente | pendiente | pendiente |
| Andino / folclórico | Parina | 5 | pendiente | pendiente | pendiente | pendiente |
| Letterpress | Prensa Tilde | 5 | pendiente | pendiente | pendiente | pendiente |
| Collage / zine | Rampa | 5 | pendiente | pendiente | pendiente | pendiente |
| Minimalista | Alba Interiores | 6 | hecho | hecho | pendiente | pendiente |
| Cálido y cercano | La Mesa de Rosa | 6 | hecho | hecho | pendiente | pendiente |
| Premium | Ónix | 6 | hecho | hecho | pendiente | pendiente |
| Audaz | Golpe | 6 | hecho | hecho | pendiente | pendiente |

## Tandas

1. **Cauce y Kiri**, que reemplazan a Nodo y Kōen, con sus tarjetas. En la misma tanda se borran `public/brief/bocetos/nodo.html` y `koen.html`, `public/image/bocetos/nodo/` y `koen/` y sus tablas en [bocetos-fotos.md](bocetos-fotos.md), y el abanico de [PreguntaBrief.jsx](../src/components/PreguntaBrief.jsx) (`ABANICO`, línea 345) pasa a `['kiri', 'golpe', 'cauce']`.
2. **Basal, Ladera, Iris y Quillay**: los estilos que más piden las pymes.
3. **Pelusa, Lucero, Tablero, Destello y Cénit**: los de color, luz y humor.
4. **Sótano, Rumbo, Foco y Marfil**: los de tipografía y geometría.
5. **Ulmo, Remache, Parina, Tilde y Rampa**: los de material y oficio.
6. **Las tarjetas de Alba, Rosa, Ónix y Golpe**, sacadas de sus páginas, y una revisión de conjunto de /brief-web con las 24 tarjetas y el recorrido del visor de principio a fin.

## Bitácora de decisiones

- **2026-11-11.** Al usuario no le gustaron Nodo ni Kōen y pidió marcas nuevas desde cero para tecnológico y zen. Para los 18 que faltaban eligió inventar todo: nombre, rubro e identidad, sin usar los nombres que traía bocetos.js (Roble, Marea, Pinpón…). Pidió referencias de galerías de diseño, fotos de stock y animaciones «sin nada brusco, siempre con un inicio y un final continuo». Su «portada» es la tarjeta de cada estilo en el brief, que debe ir con su estilo y su marca.
- **Lección de Nodo y Kōen.** Los dos eran una secuencia de secciones de plantilla: logos de clientes, cifras, planes, preguntas frecuentes, en un caso, y clases, horario, pases y reserva, en el otro. Cada boceto nuevo parte de una idea propia de su marca, y las secciones salen de esa idea, no de una lista.
- **2026-11-11, tanda 1.** Cauce y Kiri quedaron hechos, con sus fotos y sus tarjetas, y el abanico pasó a `['kiri', 'golpe', 'cauce']`. Al ver Cauce, el usuario dijo que le gustaba mucho y pidió más interacción o componentes 3D de su producto. Se sumó, sin librerías: el sensor como modelo 3D de caras de CSS que se mece, se gira al arrastrarlo o con las flechas, se despieza con el scroll y enciende la pieza que se señala en la lista; un cursor que lee la gráfica del panel, y una calculadora de ahorro de agua (`calcular_ahorro_agua`, con `toolautosubmit`). Todo eso vive en `cauce.js`, que va como módulo para no chocar con las constantes de barra.js.
- **Pendiente de la tanda 1.** El borrado de `nodo.html`, `koen.html`, `public/image/bocetos/nodo/` y `koen/`, y de sus tablas en bocetos-fotos.md, no se aprobó en la sesión: queda para que el usuario lo haga o lo autorice. El WebKit de Playwright en Windows aplana `transform-style: preserve-3d` (también en un cubo mínimo), así que el sensor 3D se confirma en un iPhone o iPad real. En S, la barra de los bocetos puede dar un CLS de hasta 0,05: barra.js le agrega el formulario de calificar después del primer cuadro, según cuánto tarde la página en pintar. Es de la barra común, no de un boceto.

## Reglas comunes

Todo boceto cumple [CLAUDE.md](../CLAUDE.md). Además:

### Movimiento: siempre continuo

- Toda curva empieza y termina con velocidad cero: `cubic-bezier(0.45, 0, 0.55, 1)`, `cubic-bezier(0.65, 0, 0.35, 1)` o la curva propia de la marca, siempre con pendiente cero en las dos puntas. **Nunca `linear`**, tampoco en el paralaje atado al scroll: en los bordes de su tramo, el movimiento tiene que frenar, no cortarse.
- Sin rebote ni sobrepaso, también en el estilo lúdico. Lo que «se acomoda» llega frenando.
- Los bucles van de ida y vuelta (`alternate`, con curva suave) o son periódicos sin costura, como una rotación completa a velocidad constante. Aparecen con un fundido, nunca de golpe. Duran 6 s o más.
- Entradas de 0,9 a 1,6 s y cambios al pasar el cursor de 300 a 600 ms. Nada parpadea ni salta.
- Las entradas al bajar usan lo que ya traen [barra.css](../public/brief/bocetos/barra.css) y [barra.js](../public/brief/bocetos/barra.js): `data-aparece` y `data-sigue`, con la manera de cada marca en `--entrada` (sus `@keyframes`), `--curva`, `--tramo`, `--duracion` y `--orden`. Donde el navegador ata animaciones al scroll (Chrome, Safari 26), avanzan y retroceden con él. Donde no (Safari 18), barra.js les pone `visto` al verse y corren `--duracion`.
- Con `prefers-reduced-motion: reduce` todo queda quieto y a la vista. Sin JavaScript, también.
- Se revisa con el movimiento encendido, no solo con capturas quietas.

### Estructura de cada página

El esqueleto de [alba.html](../public/brief/bocetos/alba.html):

- `lang="es-CL"`, `<meta name="robots" content="noindex, nofollow">`, título «Marca · boceto de página de Volutus» y una descripción que diga que es una marca inventada para mostrar el estilo;
- `favicon.svg`, la precarga de la letra principal y de la foto de portada (con `imagesrcset`), `barra.css` y `barra.js` con `defer`;
- todo el CSS en un `<style>` en línea y ningún script en línea: la política de contenido ([seguridad.js](../src/lib/seguridad.js)) no lo permite. Si un boceto necesita JavaScript propio, va en `public/brief/bocetos/<slug>.js`, sin dependencias, y se detiene cuando la página está en espera (`.en-espera` en `<html>`, que pone el visor a la carta de abajo) o con la pestaña oculta. Primero se intenta con CSS;
- `<body data-boceto="<slug>">`, la `.boceto-barra` con su texto («**Marca** es una marca inventada por Volutus para mostrarte el estilo **Estilo**») y un pie con «Boceto de Volutus · marca inventada»;
- el logo, en SVG en línea: un símbolo y su palabra;
- dentro del visor (iframe del brief) la barra no se ve, el pie gana 96 px de aire y la página solo se desplaza en vertical (`touch-action: pan-y`). Nada se arrastra de lado.

### Formularios

- Cada boceto tiene al menos un formulario de muestra: `<form data-muestra>` con `toolname` (snake_case, con verbo), `tooldescription` (que diga que la marca es inventada y que no envía nada) y `toolparamdescription` donde la etiqueta no baste. barra.js responde al agente y avisa que es un boceto.
- `toolautosubmit` solo en los que no envían nada a nadie (el configurador de Foco, el filtro de Tablero). Los demás los rellena el agente y los envía la persona.
- Letra de 16 px o más en los campos, etiquetas reales y foco visible.
- Correos y teléfonos van como texto, sin `mailto:` ni `tel:`.

### Fotos

- Solo fotos de [Unsplash](https://unsplash.com/license) con su licencia gratuita, nunca Unsplash+. Se comprueba en la página de cada foto antes de usarla.
- Se bajan de `images.unsplash.com/photo-<id>` con los parámetros de imgix, ya recortadas y en WebP: `?fm=webp&q=70&w=<ancho>&fit=crop&ar=<proporción>&crop=entropy` (`crop=faces` si hay personas, `sat=-100` para blanco y negro, `flip=h` para espejo). Van dos anchos por foto, el que se muestra en teléfono y el de escritorio. Si un parámetro no responde, se baja la original y se codifica a WebP con Playwright (canvas, `toDataURL('image/webp', 0.7)`).
- Se guardan en `public/image/bocetos/<slug>/<nombre>-<ancho>.webp` y se anotan en [bocetos-fotos.md](bocetos-fotos.md), con una tabla por boceto.
- La foto de portada va con `fetchpriority="high"` y su precarga. Las demás, con `loading="lazy"`. Todas llevan `srcset`, `sizes`, `width`, `height` y un `alt` que describa lo que se ve.
- Por página: la portada pesa 120 KB o menos en su ancho mayor, y el total queda por debajo de unos 900 KB.

### Letras

- Primero las de `public/fonts/bocetos/`, que ya están todas las de la tabla salvo dos.
- Las nuevas (Shippori Mincho y Zen Kaku Gothic New, para Kiri) se bajan de Google Fonts, con licencia OFL, en subconjunto latino y `.woff2`. Kiri usa además un solo kanji (霧), que se dibuja en SVG para no cargar la fuente japonesa.
- La tarjeta del brief usa un subconjunto de un solo peso en `public/fonts/brief/`, declarado en [muestras.css](../public/brief/muestras.css) como `'Muestra <Nombre>'`.
- `font-display: swap` y medidas de respaldo que no muevan la página al cargar.

### Diseño

- Una idea fuerte por página, la de su ficha. Las secciones la sirven.
- Nada de lo que delata una plantilla o una IA: grillas bento, tarjetas de vidrio, marquesinas, contadores que suben, grillas genéricas de íconos con tres columnas, degradés de fondo porque sí.
- Sin tiras que se deslizan de lado: lo que no cabe se reacomoda en filas.
- Sin neón: ni halos de color detrás del texto ni bordes teñidos. El vidrio, si lo hay, es neutro.
- Una sola voz fuerte por pantalla. Un botón primario, el resto callado.
- Contraste AA, jerarquía de títulos en orden y textos alternativos descriptivos.
- El texto que cambia en vivo (lecturas de Cauce, fecha de Destello) tiene su espacio fijo: `font-variant-numeric: tabular-nums` y un ancho en `ch`, para no depender de cómo corte cada navegador.
- Datos inventados pero creíbles: precios en pesos, direcciones de calles reales con números inventados y correos con el dominio de la marca, siempre como texto.
- Antes de fijar un nombre, se busca que no haya una empresa conocida con ese nombre y ese rubro en Chile.

### Responsive y Safari

- S hasta 599 px, M de 600 a 899, L de 900 a 1279 y XL desde 1280, como en Alba. La vertical del iPad (820 px) es la referencia de M.
- Altos de pantalla en `svh`/`dvh`, nunca `vh`.
- Lo que Safari 18 no tiene va detrás de `@supports`, con un resultado completo sin ello: `animation-timeline` (barra.js da la alternativa) y `backdrop-filter` con su `-webkit-`. `@property` y `:has()` sí están desde Safari 16.4 y 15.4.

### La tarjeta del brief («la portada»)

- Vive en `ESTILOS[estilo]` de [MuestraBrief.jsx](../src/components/MuestraBrief.jsx) (el arte y el sello de elegido) y en las reglas `.estilo-<estilo>` de [muestras.css](../public/brief/muestras.css).
- Muestra su marca: el logo, la paleta, la letra y un gesto de su página, descrito en su ficha. Se hace con HTML, CSS y SVG y **sin fotos**, porque las 24 tarjetas bajan juntas en una sola página.
- Al pasar el cursor se mueve con la misma regla de continuidad. Al marcarse con «Me gusta», el pie se viste con su marca y el sello es su símbolo.
- El arte es decorado (`aria-hidden`): la tarjeta se llama por la leyenda de su estilo.
- Su `fondo` en bocetos.js es el fondo del boceto, el que pinta el visor mientras carga.

## Pasos por boceto

1. **Nombre.** Comprobar que no choca con una empresa conocida del mismo rubro en Chile.
2. **Inspiración.** Abrir la página de inspiración de su ficha en el navegador real, no en un resumen de texto: captura con Playwright a 1440 y 390 px, con scroll de principio a fin. Anotar tres cosas concretas que se toman: una de composición, una de letra o color y una de movimiento. Mirar las de «También» y, si hace falta, buscar más en las [galerías](#galerías-de-referencia). Lo usado se anota en el comentario de arriba del `<style>` del boceto.
3. **Marca.** Logo en SVG (símbolo y palabra), paleta como variables CSS, la curva de movimiento propia (`--curva`) y tres frases de muestra de su voz.
4. **Fotos.** Elegir entre 6 y 12 según la ficha, bajarlas en dos anchos y anotarlas.
5. **Página.** Esqueleto, secciones en el orden de la ficha, su idea y su movimiento, y el formulario anotado para WebMCP.
6. **Tarjeta.** Arte y sello en MuestraBrief.jsx, sus reglas en muestras.css, su letra en `public/fonts/brief/`, y la entrada en bocetos.js con slug, nombre, rubro y `fondo`. `estilo`, `titulo` y `detalle` se mantienen.
7. **Verificar** (abajo) y **actualizar** la tabla de estado.

## Dónde se toca el código

| Qué | Dónde |
| --- | --- |
| La página | `public/brief/bocetos/<slug>.html` y, si hace falta, `<slug>.js` |
| Las fotos | `public/image/bocetos/<slug>/` y [bocetos-fotos.md](bocetos-fotos.md) |
| Letras nuevas | `public/fonts/bocetos/` (página) y `public/fonts/brief/` (tarjeta) |
| Nombre, rubro y fondo | [src/lib/brief/bocetos.js](../src/lib/brief/bocetos.js) |
| La tarjeta | [src/components/MuestraBrief.jsx](../src/components/MuestraBrief.jsx) y [public/brief/muestras.css](../public/brief/muestras.css) |
| El abanico de la invitación | `ABANICO` en [src/components/PreguntaBrief.jsx](../src/components/PreguntaBrief.jsx) (solo en la tanda 1) |

No hace falta tocar el visor ([brief-visor.js](../src/brief-visor.js)), el Worker ni el prerender: leen bocetos.js, y Cloudflare ya sirve `/brief/bocetos/*` con `noindex`. Las calificaciones se guardan por slug, así que las que se dieron a Nodo y Kōen no se pasan a Cauce y Kiri.

## Verificación

Por tanda, antes de entregar:

- `pnpm dev`: cada boceto suelto y dentro del visor de /brief-web (sin barra, la carta de abajo en espera y aire al pie).
- Playwright con el WebKit y el Chromium del proyecto, a 390, 820, 1024 y 1440 px de ancho. Con el movimiento encendido, recorrer `document.getAnimations()` y fijar `currentTime` en varios puntos, también el final de cada bucle. Repetir con `reducedMotion: 'reduce'`. Que no haya desborde lateral (`document.documentElement.scrollWidth <= innerWidth`) ni errores en la consola.
- `pnpm build && npx wrangler dev` (:8787): que la política de contenido no bloquee nada (letras, fotos, scripts) y que `/brief/bocetos/<slug>` abra sin la extensión.
- `pnpm lint` si se sumó JavaScript.
- Lighthouse en un boceto por tanda: Performance, Accessibility y Best Practices en 100. El de SEO marca el `noindex`, como corresponde a un boceto.
- La tarjeta en /brief-web: en reposo, al pasar el cursor y marcada con «Me gusta», en S y en XL.
- Lo que no se pueda reproducir en el WebKit de Playwright se anota para revisarlo en un iPhone o iPad real.

## Galerías de referencia

[Awwwards](https://www.awwwards.com), [Godly](https://godly.website), [Siteinspire](https://www.siteinspire.com), [Land-book](https://land-book.com), [Lapa Ninja](https://www.lapa.ninja), [Minimal Gallery](https://minimal.gallery), [One Page Love](https://onepagelove.com), [Brutalist Websites](https://brutalistwebsites.com), [SANKOU!](https://sankoudesign.com), [I/O 3000](https://io3000.com), [MUUUUU.ORG](https://muuuuu.org) y [Fonts In Use](https://fontsinuse.com). Las tres japonesas sirven sobre todo para Kiri.

## Páginas de inspiración

Cada boceto tiene una página real en la que inspirarse, elegida por su estilo y, cuando se pudo, por ser del mismo rubro. Se comprobó que todas respondían el 11 de noviembre de 2026. Algunas (Warby Parker, Aesop, Vitra, Blue Bottle) bloquean a los scripts y solo se ven en un navegador.

**Inspirarse no es copiar.** De la página se toma la estructura, el ritmo, el tono y un gesto. Nunca sus textos, su logo, sus fotos, sus ilustraciones ni su código. La marca del boceto es propia y no debe confundirse con la de referencia. La idea y el movimiento de la ficha mandan: si la página de inspiración contradice la ficha (un color, un efecto), gana la ficha.

| Boceto | Página de inspiración | Por qué |
| --- | --- | --- |
| Cauce | [Teenage Engineering · OP–1 field](https://teenage.engineering/products/op-1) | Ficha de producto como hoja técnica |
| Kiri | [Hoshinoya](https://hoshinoresorts.com/ja/brands/hoshinoya/) | Ryokan: aire, vertical, calma |
| Basal | [Arup](https://www.arup.com) | Ingeniería: sobriedad y proyectos con ficha |
| Ladera | [Kinfolk](https://www.kinfolk.com) | Ritmo de revista |
| Iris | [Warby Parker](https://www.warbyparker.com) | Mismo rubro: vista y óptica |
| Quillay | [Aesop](https://www.aesop.com) | Botánica sin cliché |
| Pelusa | [Wild One](https://wildone.com) | Perros, color y humor |
| Lucero | [Moxi](https://www.moxiskates.com) | Patines y comunidad de pista |
| Tablero | [Walala Studio](https://www.camillewalala.com) | Patrón y color Memphis |
| Destello | [Retrospekt](https://retrospekt.com) | Mismo rubro: aparatos de antes, revisados |
| Cénit | [Apple Vision Pro](https://www.apple.com/apple-vision-pro/) | Luz, vidrio neutro y scroll |
| Sótano | [Anthology Film Archives](https://www.anthologyfilmarchives.org) | Cine independiente, cartelera cruda |
| Rumbo | [Mijksenaar](https://www.mijksenaar.com) | Mismo rubro: señalética |
| Foco | [Tecnolumen](https://tecnolumen.com) | Lámparas de la Bauhaus |
| Marfil | [American Bar del Savoy](https://www.thesavoylondon.com/restaurants-and-bars/american-bar) | Bar art déco y su carta |
| Ulmo | [Diaspora Co.](https://www.diasporaco.com) | Origen y lotes como historia |
| Remache | [Deus Ex Machina](https://deuscustoms.com) | Mismo rubro: motos custom |
| Parina | [Explora](https://www.explora.com) | Mismo rubro: lodges en Chile |
| Tilde | [Studio On Fire](https://www.studioonfire.com) | Taller de impresión tipográfica |
| Rampa | [Thrasher](https://www.thrashermagazine.com) | Revista de skate |

## Las 20 marcas nuevas

Cada ficha fija lo que no se discute: la idea, el movimiento, la paleta y las secciones. El resto (textos, fotos exactas, medidas) se decide al construir. Las letras están en `public/fonts/bocetos/` salvo que se diga otra cosa.

### Cauce · tecnológico

- **Slug y marca:** `cauce` · Cauce.
- **Rubro:** telemetría de riego para viñas y huertos. Sensores de humedad de suelo y caudal, con un panel en el teléfono. Santa Cruz, Valle de Colchagua.
- **Idea:** la página es el instrumento. La tecnología se ve en su precisión, no en un terminal oscuro como el de Nodo: una hoja de ingeniería clara, de líneas finas, con anotaciones en monoespaciada y un solo color de señal.
- **Movimiento:** en la portada, las curvas de nivel del valle con cinco sensores, cuyas lecturas (humedad %, caudal L/h) cambian con un ciclo seno lento y desfasado entre ellos. El sensor es un modelo 3D de caras de CSS (cajas, cilindros y una punta): se mece de ida y vuelta, se gira al arrastrarlo o con las flechas (en el visor, solo con el mouse) y, al bajar, se despieza en capas (tapa, placa, batería, sonda), atadas al scroll y con curva suave en las dos puntas. La pieza que se señala en la lista se enciende en el modelo. Las gráficas del panel se dibujan con `stroke-dashoffset` al llegar, y un cursor lee la humedad de cada hora.
- **Letras:** Instrument Sans (títulos, apretada) e IBM Plex Mono (datos, rótulos).
- **Paleta:** papel `#f3f4f1`, tinta `#101412`, grafito `#5b625e`, línea `#d5d9d4`, señal `#ff5b1f` (solo marcas y lo activo, nunca texto chico). `fondo`: `#f3f4f1`.
- **Secciones:** portada con el mapa vivo; «Qué mide» (el despiece); el panel (una semana de humedad, la alerta de riego, el ahorro de agua, todo en HTML y SVG); ficha técnica en tabla (alcance, batería de 5 años, IP68, LoRa); dos campos con su foto y su dato («−31 % de agua en la temporada 2025») y una calculadora de ahorro (`calcular_ahorro_agua`, con `toolautosubmit`: hectáreas y cultivo, responde m³ y pesos); pedir una visita a terreno (formulario: nombre, correo, cultivo, hectáreas, comuna).
- **Fotos:** viñedo desde dron, goteo de riego de cerca, manos con tierra húmeda, sensor o estaca en el suelo, valle con la cordillera al fondo.
- **Página de inspiración:** [Teenage Engineering · OP–1 field](https://teenage.engineering/products/op-1). Se toma la ficha de producto como hoja técnica: dibujos a línea, anotaciones en monoespaciada, un solo color de acento y medidas exactas. También: [Arable](https://www.arable.com), del mismo rubro, por cómo pone los datos sobre fotos de campo.
- **Tarjeta:** curvas de nivel finas en tinta sobre papel, un sensor naranja que late despacio y «Humedad 31,4 %» en mono. Al pasar el cursor, las curvas se desplazan apenas. Sello: el punto de señal.
- **Usa** `cauce.js`, como módulo para no chocar con las constantes de barra.js: las lecturas (WebKit no garantiza contadores con decimales desde una propiedad animada), el giro del sensor, el cursor de la gráfica y la calculadora.

### Kiri · zen / japonés

- **Slug y marca:** `kiri` · Kiri (霧, niebla).
- **Rubro:** baños termales y ryokan de doce habitaciones en el bosque, junto al volcán Osorno. Ensenada, Región de Los Lagos.
- **Idea:** *ma*, el espacio vacío. La página respira: mucho aire, un solo elemento por vista, texto vertical y la niebla como material.
- **Movimiento:** sobre la foto de portada, vapor en tres capas de degradados borrosos que suben muy lento, cada una en su propio bucle de ida y vuelta, desfasadas para que nunca se note el ciclo. Un ensō a pincel (SVG) que se traza con el scroll. Las fotos salen de la niebla al entrar: de `blur` y blanco a nítidas, despacio.
- **Letras:** Shippori Mincho (títulos) y Zen Kaku Gothic New (texto). Hay que bajarlas (ver [Letras](#letras)). El kanji 霧 va en SVG.
- **Paleta:** washi `#efeae0`, sumi `#1c1b19`, ceniza `#6e6a62`, cedro `#8a5a3c`, musgo `#5d6b4f`. `fondo`: `#efeae0`.
- **Secciones:** portada (foto, vapor y el nombre en vertical); el ritual del baño en cuatro tiempos (lavarse, entrar, reposar, volver), uno por vista; las aguas (tres pozones con su temperatura y su vista); las habitaciones (tatami, madera, el volcán desde la ventana); la cena (cocina del sur con método japonés, por estación); reservar (formulario: fechas, personas, habitación, nota).
- **Fotos:** termas entre árboles con vapor, tina de madera, piedras mojadas, cuarto de tatami con ventana al bosque, platos pequeños de cerámica, volcán nevado entre niebla.
- **Página de inspiración:** [Hoshinoya](https://hoshinoresorts.com/ja/brands/hoshinoya/), la marca de ryokan de Hoshino Resorts. Se toma el aire, el texto vertical, una sola imagen por vista y un ritmo sin prisa. También: [Beniya Mukayu](https://mukayu.com), otro ryokan, y las galerías japonesas SANKOU!, I/O 3000 y MUUUUU.ORG.
- **Tarjeta:** papel washi, un ensō de pincel, 霧 en vertical y «Kiri» en Mincho. Al pasar el cursor, una niebla sube despacio. Sello: el ensō.

### Basal · corporativo

- **Slug y marca:** `basal` · Basal Ingeniería.
- **Rubro:** aislación sísmica y cálculo estructural para hospitales, edificios y puentes. Las Condes, Santiago.
- **Idea:** la prueba de lo que venden. Un corte del edificio sobre sus aisladores: al bajar, el suelo se mueve apenas, de un lado a otro, y se amortigua hasta quedar quieto, mientras el edificio casi no se mueve. Va rotulado como ensayo, en calma, sin nada que asuste.
- **Movimiento:** el ensayo atado al scroll, una oscilación amortiguada con curva suave. Los datos de cada proyecto se escriben en su ficha al entrar. Las fotos se destapan con una cortina de abajo arriba.
- **Letras:** Manrope.
- **Paleta:** marino `#0f2a44`, azul `#1f5fbf`, niebla `#eef2f6`, acero `#5a6b7d`, ámbar `#f2a900` (solo para el ensayo). `fondo`: `#eef2f6`.
- **Secciones:** portada (titular y el corte del edificio); el ensayo; sectores (salud, vivienda, infraestructura), cada uno con un proyecto; proyectos con ficha técnica (aisladores, superficie, año, mandante); la forma de trabajar, con plazos y responsables; certificaciones y equipo, con nombres; contacto (formulario: empresa, correo, tipo de proyecto, superficie, etapa).
- **Fotos:** edificio en obra con grúa, ingenieros con casco revisando planos, hospital moderno, puente, detalle de hormigón y fierro.
- **Página de inspiración:** [Arup](https://www.arup.com). Se toma la sobriedad, los sectores que llevan a proyectos y cada proyecto contado con su ficha y su gente. También: [SOM](https://www.som.com), por las fotos de obra grandes y la grilla.
- **Tarjeta:** banda marina con el logo (una línea de base sobre dos aisladores) y la silueta de un edificio sobre ellos. Al pasar el cursor, la línea del suelo se mece una vez y se calma. Sello: el aislador.

### Viña Ladera · editorial

- **Slug y marca:** `ladera` · Viña Ladera.
- **Rubro:** vinos de secano, cinsault y país de viñas viejas. Valle del Itata.
- **Idea:** el sitio es una revista que sale con cada cosecha: «Nº 12 · Vendimia 2026». Se lee como un reportaje, no como una tienda.
- **Movimiento:** paralaje lento de las fotos a sangre, con curva suave en las dos puntas del tramo. Las columnas de texto aparecen con un fundido corto. Un folio en el margen («p. 3») avanza mientras se lee.
- **Letras:** Newsreader con su itálica (títulos y texto) y Hanken Grotesk (folios, rótulos, fichas).
- **Paleta:** papel `#f2ede3`, tinta `#1d1a16`, vino `#6b1f2a`, oliva `#7a7a4a`, greda `#b4694a`. `fondo`: `#f2ede3`.
- **Secciones:** portada como tapa de revista (cabecera, número, titular y foto); carta del viticultor con capitular; reportaje «Un año en la ladera» en cuatro estaciones, con citas destacadas y notas al margen; los vinos (tres fichas a dos columnas: cepa, suelo, crianza, precio); visitas y la revista impresa (formulario: reservar una visita o recibir el próximo número); colofón como pie.
- **Fotos:** viñedo en ladera con niebla, manos cortando racimos, tinajas de greda o barricas, mesa con copa y pan, retrato del viticultor.
- **Página de inspiración:** [Kinfolk](https://www.kinfolk.com). Se toma el ritmo de revista: titulares en serif, fotos a sangre, mucho margen y el texto largo como protagonista. También: [Cereal](https://www.readcereal.com), por la calma y el blanco.
- **Tarjeta:** una tapa de revista dibujada con su cabecera «LADERA», «Nº 12 · Vendimia» y una línea de titular. Al pasar el cursor, la tapa se levanta como una página que se da vuelta, apenas. Sello: «Nº 12».

### Iris Centro Visual · clínico / limpio

- **Slug y marca:** `iris` · Iris Centro Visual.
- **Rubro:** oftalmología, cirugía láser y óptica. Providencia, Santiago.
- **Idea:** el enfoque. La portada parte desenfocada y se enfoca, y una tabla de Snellen tipográfica (letras que achican fila por fila) es el índice de servicios.
- **Movimiento:** el enfoque de la portada al cargar (de `blur` 8 px a nítido, 1,4 s). Las secciones se aclaran al llegar y las filas de la tabla se enfocan una tras otra al bajar.
- **Letras:** Plus Jakarta Sans.
- **Paleta:** blanco `#ffffff`, tinta `#0f1c2b`, azul `#1e6fd9`, menta `#e6f5f1`, gris `#5b6b7a`. `fondo`: `#ffffff`.
- **Secciones:** portada; la tabla de Snellen como índice (consulta, cirugía láser, lentes de contacto, niños, óptica); el equipo médico, con nombre, especialidad y foto; tu primera consulta, paso a paso y con lo que dura; convenios (Fonasa, isapres) y precios de referencia; dónde estamos y horarios; agendar hora (formulario: nombre, RUT, correo, especialidad, previsión, fecha).
- **Fotos:** consulta oftalmológica, persona probándose lentes, montura sobre una mesa clara, doctora conversando con un paciente, sala de espera luminosa. Nada de ojos en primerísimo plano.
- **Página de inspiración:** [Warby Parker](https://www.warbyparker.com), del mismo rubro: examen de la vista y óptica. Se toma la claridad, el tono cercano y cómo agendar y comprar quedan a un paso. También: [One Medical](https://www.onemedical.com), por la confianza sin frialdad y los médicos con nombre.
- **Tarjeta:** blanco, tres filas de Snellen («E», «F P», «T O Z») que se enfocan al pasar el cursor y el logo: un anillo azul. Sello: el anillo.

### Quillay · natural

- **Slug y marca:** `quillay` · Quillay.
- **Rubro:** jabones y cosmética de plantas nativas (quillay, maqui, rosa mosqueta). Lolol, Valle de Colchagua.
- **Idea:** luz entre hojas. Una sombra moteada de hojas se mece sobre la portada, como la del bosque donde se recolecta.
- **Movimiento:** la sombra de hojas (SVG o máscara) se mece de ida y vuelta, muy lenta. Las plantas, dibujadas a línea, se trazan con el scroll. Las fotos llegan dentro de formas orgánicas que se abren.
- **Letras:** Young Serif (títulos) y Figtree (texto).
- **Paleta:** crema `#f0eadb`, hoja `#5f6f45`, tierra `#a86b3c`, arcilla `#d7b89a`, tinta `#2b2a22`. `fondo`: `#f0eadb`.
- **Secciones:** portada; las tres plantas, dibujadas, con para qué sirve cada una; del bosque al jabón (recolección, maceración, curado de seis semanas); los productos (cuatro, con precio y lo que llevan, sin letra chica); ingredientes, contados con honestidad; pedido o venta al por mayor (formulario).
- **Fotos:** jabones artesanales cortados, hojas a contraluz, manos con espuma o greda, frascos de vidrio ámbar, ramas de rosa mosqueta.
- **Página de inspiración:** [Aesop](https://www.aesop.com). Se toma la botánica sin cliché, los ingredientes contados con precisión, los tonos de tierra y la tienda tranquila. También: [Grown Alchemist](https://grownalchemist.com).
- **Tarjeta:** una forma de tierra, una hoja de quillay dibujada a línea y «quillay» en Young Serif. Al pasar el cursor, la hoja se mece. Sello: la hoja.

### Pelusa · lúdico

- **Slug y marca:** `pelusa` · Pelusa.
- **Rubro:** guardería de día y peluquería de perros. Ñuñoa, Santiago.
- **Idea:** los perros son los personajes. Cada uno, recortado en una forma blanda, con su nombre y su edad, y el humor está en lo que dicen las fichas.
- **Movimiento:** las formas llegan y se acomodan frenando, sin rebote. Un día en Pelusa es un camino de huellas que se dibuja al bajar. Al pasar el cursor, las orejas o la cola se mecen de ida y vuelta.
- **Letras:** Fredoka (títulos) y Nunito Sans (texto).
- **Paleta:** crema `#fff6e6`, amarillo `#ffd34d`, cielo `#6cc4ff`, coral `#ff7a59`, tinta `#2a1f1a`. `fondo`: `#fff6e6`.
- **Secciones:** portada; un día en Pelusa (llegada, juego, siesta, baño, retiro), en el camino de huellas; servicios y precios (baño, corte, guardería por día y por mes); la pandilla («Mostaza, 3 años, le gusta robar calcetines»); las reglas de la casa (vacunas, primera visita de prueba); reservar (formulario: tu nombre, el de tu perro, tamaño, servicio, fecha).
- **Fotos:** perros felices de frente, perro recién bañado con toalla, perros jugando en pasto, peluquería canina.
- **Página de inspiración:** [Wild One](https://wildone.com), del mismo mundo: productos para perros. Se toma el color, los perros como protagonistas de cada foto y un humor que no infantiliza. También: [Headspace](https://www.headspace.com), por sus formas blandas.
- **Tarjeta:** tres formas blandas de su paleta, una huella y «pelusa» en Fredoka. Al pasar el cursor, las formas se mecen. Sello: la huella.

### Pista Lucero · retro

- **Slug y marca:** `lucero` · Pista Lucero.
- **Rubro:** pista de patinaje y disco, abierta desde 1977. Viña del Mar.
- **Idea:** las noches de los setenta: franjas en arco, letras gruesas y redondas, y la luz de la bola de disco.
- **Movimiento:** las franjas en arco se mecen apenas. Las luces de la bola cruzan la portada despacio, como manchas suaves de luz cálida. Un patinador recorre la pista ovalada (el dibujo del plano) en un bucle sin costura.
- **Letras:** Shrikhand (títulos) y Josefin Sans (texto).
- **Paleta:** crema `#f3e1bf`, naranja `#e8742a`, mostaza `#e0a526`, café `#5a3520`, rosa `#d9677a`. `fondo`: `#f3e1bf`.
- **Secciones:** portada; las noches de la semana (lunes de clases, viernes disco, domingo familiar); arriendo de patines (tallas y precios); clases para empezar; cumpleaños; la historia, desde 1977; reservar la pista (formulario).
- **Fotos:** patines de cuatro ruedas retro, bola de disco, gente patinando en una pista, luces de colores cálidos en una pista oscura.
- **Página de inspiración:** [Moxi](https://www.moxiskates.com), patines de cuatro ruedas. Se toma la energía, los patines como objeto de deseo y la comunidad de la pista. La paleta y las letras se van a los setenta cálidos de la ficha, no a sus colores caramelo. También: [Fonts In Use](https://fontsinuse.com), buscando «1970s», para las letras y la gráfica de discos de esos años.
- **Tarjeta:** franjas en arco con los cinco colores, «Lucero» en Shrikhand y un patín. Al pasar el cursor, las franjas se mecen. Sello: una estrella de cuatro puntas.

### Tablero · Memphis

- **Slug y marca:** `tablero` · Tablero.
- **Rubro:** café de juegos de mesa, con 400 juegos y alguien que te los explica. Providencia, Santiago.
- **Idea:** el desorden alegre que se ordena. Garabatos, confeti, zigzags y puntos que flotan y se acomodan como piezas sobre un tablero.
- **Movimiento:** las figuras Memphis flotan de ida y vuelta, cada una a su ritmo, y al bajar se ordenan en su sitio. Dos dados en CSS 3D giran despacio.
- **Letras:** Rubik.
- **Paleta:** blanco `#ffffff`, negro `#111111`, rosa `#ff6fa8`, turquesa `#2ec4b6`, amarillo `#ffd23f`, violeta `#7b5cff`. `fondo`: `#ffffff`.
- **Secciones:** portada; cómo funciona (llegas, eliges, te enseñamos); la ludoteca, filtrable por número de jugadores y duración con radios y `:has()`, sin JavaScript (formulario `filtrar_juegos`, con `toolautosubmit`); la carta (café, sándwiches, precios); torneos del mes; reservar mesa (formulario: personas, fecha, hora).
- **Fotos:** juegos sobre una mesa vistos desde arriba, amigos jugando y riendo, dados y fichas, café junto a un tablero.
- **Página de inspiración:** [Walala Studio](https://www.camillewalala.com), de Camille Walala. Se toma el patrón como arquitectura, los bloques de color plano y la alegría ordenada. También: [Memphis Milano](https://memphis.it), el origen del estilo.
- **Tarjeta:** el patrón Memphis, un dado y «TABLERO» en Rubik. Al pasar el cursor, los garabatos se desplazan. Sello: el dado.

### Destello · Y2K

- **Slug y marca:** `destello` · Destello.
- **Rubro:** cámaras digitales compactas de los 2000, revisadas y con garantía de seis meses. Venta online con retiro en Santiago Centro.
- **Idea:** el flash. Las fotos de la página llevan la fecha naranja estampada en la esquina («'06 11 11»), como salían de esas cámaras.
- **Movimiento:** destellos ✦ que titilan con curva suave (crecen y se apagan, nunca parpadean). Las fotos se «revelan» como en la pantallita de la cámara: de oscuras a claras. El cromo de las letras es un degradé gris que se desplaza despacio, sin brillo de color.
- **Letras:** Syne (títulos) y Figtree (texto).
- **Paleta:** lila `#e9dcff`, plata `#c9ced8`, hielo `#9fd8ff`, rosa `#ff9ad5`, fecha `#ff8a1f`, tinta `#15131c`. `fondo`: `#e9dcff`.
- **Secciones:** portada con una cámara; el catálogo (megapíxeles, zoom, estado, precio); cómo revisamos (cinco pruebas); galería de fotos tomadas con ellas, con su fecha; garantía y envíos; vender tu cámara (formulario: marca, modelo, estado, correo).
- **Fotos:** cámaras compactas plateadas, fotos de fiesta con flash, persona sacando una foto con una compacta, objetos de los 2000.
- **Página de inspiración:** [Retrospekt](https://retrospekt.com), del mismo rubro: aparatos de antes, revisados y con garantía. Se toma el catálogo con el estado de cada equipo, la garantía a la vista y el cariño por el objeto. También: [CARI](https://cari.institute), el archivo de la estética Y2K, para el cromo, los destellos y las formas.
- **Tarjeta:** «destello» en cromo, tres destellos y una fecha naranja. Al pasar el cursor, los destellos titilan. Sello: ✦.

### Cénit · futurista

- **Slug y marca:** `cenit` · Cénit.
- **Rubro:** observatorio turístico y astroturismo, con domo propio y telescopio de 16 pulgadas. Pisco Elqui, Valle de Elqui.
- **Idea:** el cielo en exposición larga. Las estrellas de la portada giran muy lento alrededor del polo sur celeste y dejan su estela, como en una foto de varias horas. Lo futurista está en la luz y en los degradés de la noche, no en el neón.
- **Movimiento:** la capa de estrellas rota a velocidad constante (una vuelta cada pocos minutos) y aparece con un fundido largo. Las estelas son arcos de un degradé cónico. Los paneles de datos son de vidrio neutro (blanco, `saturate` de 1,2 como máximo, con su `-webkit-`) y entran con un fundido. El horizonte baja un poco al bajar, con curva suave.
- **Letras:** Unbounded (títulos) y Sora (texto).
- **Paleta:** noche `#0b0c1e`, índigo `#1b1f4a`, polvo `#8d90b8`, luz `#e9e8ff`, blanco `#ffffff`. `fondo`: `#0b0c1e`.
- **Secciones:** portada; la noche de esta semana (fase de la luna, hora en que oscurece y qué se ve, con datos de muestra rotulados como tales); las experiencias (observación guiada, astrofotografía, domo privado), con duración y precio; el telescopio, en ficha técnica; cómo llegar y qué llevar (abrigo, linterna roja); reservar (formulario: fecha, personas, experiencia).
- **Fotos:** Vía Láctea sobre el desierto o los cerros, telescopio dentro de un domo, persona mirando el cielo estrellado, domos de observatorio al atardecer.
- **Página de inspiración:** [Apple Vision Pro](https://www.apple.com/apple-vision-pro/). Se toma la luz sobre negro, los degradés de la noche, el vidrio neutro y cómo cada sección se revela con el scroll. También: [ESO](https://www.eso.org/public/), por la fotografía del cielo de Chile, y [Lusion](https://lusion.co), por la profundidad.
- **Tarjeta:** degradé de noche con estelas circulares y «CÉNIT» en Unbounded. Al pasar el cursor, las estelas giran un poco. Sello: una estrella de ocho puntas.

### Sótano · brutalista

- **Slug y marca:** `sotano` · Sótano.
- **Rubro:** cine club y sala independiente de 80 butacas, con proyector de 35 mm. Barrio Brasil, Santiago.
- **Idea:** la cartelera es la página: una tabla cruda y enorme en Times, con bordes negros, enlaces azules y fotos en blanco y negro duro. Nada decorado.
- **Movimiento:** al pasar el cursor, las filas se invierten (negro sobre blanco) con una transición corta. Las fotos aparecen con un corte de cortina, sin fundido.
- **Letras:** Times, la del sistema, e IBM Plex Mono para horarios y formatos.
- **Paleta:** blanco `#ffffff`, negro `#000000`, gris `#d9d9d4`, azul enlace `#0000ee`, rojo `#ff0000` (solo «agotado»). `fondo`: `#ffffff`.
- **Secciones:** portada (la función de hoy en Times enorme); la cartelera de la semana en tabla; ciclos del mes; la sala (butacas, proyector, cabina); hacerse socio (precio); escribir (formulario: proponer una película o recibir la cartelera).
- **Fotos:** butacas vacías, proyector de cine, haz de luz en una sala oscura, rollos de película, marquesina. Todas con `sat=-100` y contraste alto.
- **Página de inspiración:** [Anthology Film Archives](https://www.anthologyfilmarchives.org), un cine independiente de Nueva York. Se toma la cartelera como lista cruda, densa y sin adornos, con la programación como protagonista. También: [Yale School of Art](https://art.yale.edu) y la galería [Brutalist Websites](https://brutalistwebsites.com).
- **Tarjeta:** una tabla cruda con «SÓTANO / VIE 21:00 / 35MM» en Times y bordes negros. Al pasar el cursor, una fila se invierte. Sello: «[x]».

### Rumbo · suizo / gráfico

- **Slug y marca:** `rumbo` · Rumbo.
- **Rubro:** señalética y orientación para hospitales, campus y aeropuertos. Santiago.
- **Idea:** la grilla se ve y todo se alinea a ella. La marca vende que nadie se pierda, y la página lo demuestra con flechas, números de piso y pictogramas.
- **Movimiento:** flechas gigantes que giran y se deslizan a su sitio en la grilla con el scroll. Los números de piso cambian al pasar de una sección a otra, con su espacio fijo.
- **Letras:** Archivo.
- **Paleta:** blanco `#ffffff`, negro `#111111`, rojo `#e3001b`, gris `#ececec`. `fondo`: `#ffffff`.
- **Secciones:** portada (una flecha enorme y «Que nadie se pierda»); el método en cuatro pasos (recorrer, ordenar, dibujar, instalar); proyectos (hospital, campus, aeropuerto regional), con foto y ficha; el sistema (tipografía, pictogramas y colores, como página de un manual); clientes, en texto; contacto (formulario: tipo de edificio, superficie, pisos, plazo).
- **Fotos:** señalética en una estación, flechas en un aeropuerto, números de piso en una escalera, pasillo de hospital con letreros.
- **Página de inspiración:** [Mijksenaar](https://www.mijksenaar.com), del mismo rubro: la señalética de Schiphol, entre otros. Se toma cómo cuenta cada proyecto, los pictogramas y la promesa de que nadie se pierda. La grilla y la letra se van a lo suizo con las otras dos. También: [Swissted](https://www.swissted.com), por la grilla y el rojo, y [Standards Manual](https://standardsmanual.com), por el manual de señalética como pieza.
- **Tarjeta:** grilla visible, un bloque rojo, una flecha grande y «Rumbo» en Archivo. Al pasar el cursor, la flecha gira 90°. Sello: la flecha.

### Foco · Bauhaus

- **Slug y marca:** `foco` · Foco.
- **Rubro:** lámparas de diseño hechas a mano. Taller en San Joaquín, Santiago.
- **Idea:** círculo, cuadrado y triángulo forman el logo y, al bajar, se reacomodan en cada lámpara: la pantalla es el círculo, la base el cuadrado y el brazo una línea.
- **Movimiento:** las formas se trasladan y giran a su lugar con el scroll y curva suave. En el configurador, el color cambia con una transición corta.
- **Letras:** Jost.
- **Paleta:** crema `#f1ead8`, rojo `#d7261e`, azul `#1f4aa8`, amarillo `#f2b705`, negro `#111111`. `fondo`: `#f1ead8`.
- **Secciones:** portada; la colección (cuatro lámparas, cada una con su foto y el dibujo de sus formas); el taller (torneado, plegado, pintura en polvo); a medida: un configurador de color de pantalla y de base con radios y `:has()`, sin JavaScript (formulario `configurar_lampara`, con `toolautosubmit`, que no envía nada); pedido (formulario: lámpara, colores, correo).
- **Fotos:** lámpara de escritorio sobre una mesa, lámpara colgante, taller de metal, interior con una lámpara encendida.
- **Página de inspiración:** [Tecnolumen](https://tecnolumen.com), que fabrica las lámparas clásicas de la Bauhaus. Se toma cada lámpara como objeto aislado, con su historia y su ficha. También: [Stiftung Bauhaus Dessau](https://bauhaus-dessau.de), por la geometría y los colores primarios, y [Vitra](https://www.vitra.com).
- **Tarjeta:** crema con un círculo rojo, un cuadrado azul, un triángulo amarillo y «foco» en Jost. Al pasar el cursor, las formas se arman en lámpara. Sello: el círculo.

### Bar Marfil · art déco

- **Slug y marca:** `marfil` · Bar Marfil.
- **Rubro:** coctelería y salón de baile desde 1928. Cerro Alegre, Valparaíso.
- **Idea:** la simetría. Todo se ordena desde un eje central, con marcos escalonados y un abanico dorado.
- **Movimiento:** en la portada, un abanico de rayos dorados que se traza desde el centro hacia afuera (`stroke-dashoffset`, 1,6 s). Los marcos escalonados se dibujan al entrar.
- **Letras:** Poiret One (títulos) y Josefin Sans (texto).
- **Paleta:** botella `#0f1f1c`, oro `#c9a24a`, marfil `#f1e9d6`, negro `#0b0b0b`. `fondo`: `#0f1f1c`.
- **Secciones:** portada; la casa (1928, el salón y su barra); la carta de cócteles, simétrica en dos columnas, con precio; las noches (jazz los jueves, swing los sábados); salón privado para eventos; reservar mesa (formulario: nombre, personas, fecha, hora).
- **Fotos:** cócteles en copa coupé, barra con botellas iluminadas, interior déco con lámparas, músicos de jazz.
- **Página de inspiración:** [American Bar del Savoy](https://www.thesavoylondon.com/restaurants-and-bars/american-bar), un bar art déco de Londres. Se toma la carta como pieza central, la elegancia simétrica y el ritual del cóctel. También: [Bemelmans Bar](https://www.rosewoodhotels.com/en/the-carlyle-new-york/dining/bemelmans-bar), por el oro y la luz baja, y [Claridge's](https://www.maybourne.com/en/hotels/claridges).
- **Tarjeta:** fondo botella con el abanico dorado y «MARFIL» en Poiret One. Al pasar el cursor, el abanico se abre un poco más. Sello: el abanico.

### Ulmo · artesanal

- **Slug y marca:** `ulmo` · Ulmo.
- **Rubro:** miel cruda de ulmo, quillay y tiaca, de colmenas propias. Curacautín, Región de La Araucanía.
- **Idea:** el frasco y su etiqueta. Papel kraft, sellos de tinta, lote numerado y notas a mano en los márgenes.
- **Movimiento:** un sello que baja y deja tinta: se acerca, se asienta y la tinta aparece, sin rebote. Las notas a mano se escriben con una máscara que avanza. El mapa de colmenas se traza al llegar.
- **Letras:** Caveat (notas a mano) y Alegreya Sans (texto).
- **Paleta:** kraft `#e9dcc4`, miel `#d99a1e`, café `#3b2a1a`, ulmo `#4f5b3a`, sello `#b5442b`. `fondo`: `#e9dcc4`.
- **Secciones:** portada (el frasco y su etiqueta); de dónde viene (el mapa dibujado de las colmenas); las tres mieles, con su color, su sabor y su cosecha; el apicultor; cómo pedir (cajas de tres y de seis); pedido (formulario).
- **Fotos:** frascos de miel con etiqueta de papel, panal, apicultor con traje, abeja en una flor, cuchara con miel.
- **Página de inspiración:** [Diaspora Co.](https://www.diasporaco.com), especias de un solo origen. Se toma el origen como historia (cada lote, su campo y su productor) y las etiquetas como identidad. También: [Heath Ceramics](https://www.heathceramics.com), por el oficio a mano contado sin adornos, y [Blue Bottle Coffee](https://bluebottlecoffee.com).
- **Tarjeta:** kraft con un sello redondo «ULMO · Lote 07» y «miel cruda» a mano. Al pasar el cursor, el sello baja. Sello: el timbre redondo.

### Remache · industrial

- **Slug y marca:** `remache` · Remache.
- **Rubro:** taller de motos clásicas y custom: restauración, preparación y mantención. San Miguel, Santiago.
- **Idea:** el taller abre su cortina. La página es fierro, placas remachadas y números de serie estampados.
- **Movimiento:** la cortina metálica de la portada sube con el scroll, lama por lama, y descubre la moto. Las placas se atornillan al entrar (giran y se asientan). Hay un antes y después de una restauración con el deslizador de barra.js (`data-comparar`).
- **Letras:** Big Shoulders Stencil (marca), Big Shoulders Display (títulos) y Barlow (texto).
- **Paleta:** acero `#1b1d1f`, plomo `#3a3e42`, hueso `#e8e2d6`, óxido `#b5562b`, señal `#f2c230`. `fondo`: `#1b1d1f`.
- **Secciones:** portada con la cortina; trabajos (tres motos con su ficha, una con el antes y después); servicios; el taller; repuestos en tabla; agendar (formulario: marca, modelo, año, qué necesita).
- **Fotos:** café racer en un taller, pared de herramientas, soldadura, motor de cerca, moto antes de restaurar.
- **Página de inspiración:** [Deus Ex Machina](https://deuscustoms.com), del mismo rubro: motos custom y taller. Se toma cada moto como una obra con su nombre y su historia, el taller como lugar y las fotos crudas.
- **Tarjeta:** acero con «REMACHE» en stencil, cuatro remaches y las lamas de una cortina. Al pasar el cursor, la cortina sube un poco. Sello: el remache.

### Parina · andino / folclórico

- **Slug y marca:** `parina` · Parina («flamenco» en aimara).
- **Rubro:** lodge de ocho habitaciones y caminatas por el altiplano, con guías de la zona. Putre, Región de Arica y Parinacota.
- **Idea:** el tejido. Franjas de grecas como las de un aguayo separan las secciones y se tejen fila por fila. Los colores salen del paisaje (el lago Chungará, el bofedal, el volcán), y las tejedoras del pueblo tienen su lugar con nombre.
- **Movimiento:** cada franja se teje al bajar: sus filas se revelan de izquierda a derecha, una tras otra. El perfil de altura de cada ruta se dibuja al llegar.
- **Letras:** Alegreya (títulos) y Alegreya Sans (texto).
- **Paleta:** tierra `#b5442b`, ocre `#d99b3c`, bofedal `#5b7a4a`, lago `#2f5d8a`, lana `#f3e7d3`, negro `#1a1512`. `fondo`: `#f3e7d3`.
- **Secciones:** portada (el volcán Parinacota y el lago); el lodge; las caminatas (cuatro rutas, con altura, horas y dificultad); la aclimatación, contada con honestidad (los primeros dos días, la puna); el taller de las tejedoras; reservar (formulario: fechas, personas, rutas de interés).
- **Fotos:** volcán con lago, llamas o alpacas, textiles andinos de cerca, casa de piedra, flamencos en un salar.
- **Página de inspiración:** [Explora](https://www.explora.com), del mismo rubro: lodges y expediciones en Chile, entre ellos uno en el desierto de Atacama. Se toma el paisaje como protagonista y las rutas con su dificultad y sus horas. También: [Kuna](https://www.kuna.com.pe), por el textil andino contemporáneo.
- **Tarjeta:** franjas de grecas en sus colores y «Parina» en Alegreya. Al pasar el cursor, se teje una fila. Sello: un rombo de greca.

### Prensa Tilde · letterpress

- **Slug y marca:** `tilde` · Prensa Tilde.
- **Rubro:** invitaciones, tarjetas y papelería impresas en tipos móviles. Barrio Italia, Santiago.
- **Idea:** la impresión. El texto aparece hundido en el papel grueso, como cuando baja la prensa.
- **Movimiento:** al entrar, los títulos «se imprimen»: una sombra interior crece, se asienta y queda el relieve. Los tipos en espejo de la portada se dan vuelta y quedan derechos. Las muestras de papel se apilan con un leve desfase.
- **Letras:** Abril Fatface (títulos) y Libre Caslon Text con su itálica (texto).
- **Paleta:** algodón `#f4efe6`, tinta `#1f2a44`, bermellón `#c0392b`, gris `#8a857c`. `fondo`: `#f4efe6`.
- **Secciones:** portada (el nombre en relieve); el taller (la prensa de 1962 y la caja de tipos); invitaciones (matrimonios, bautizos y aniversarios, con muestras); papeles y tintas (gramajes, algodón, colores); cómo encargar (plazos y pruebas); presupuesto (formulario: pieza, cantidad, fecha del evento).
- **Fotos:** tipos móviles en su caja, prensa tipográfica, tarjetas con relieve, rodillo con tinta, papel de algodón con bordes irregulares.
- **Página de inspiración:** [Studio On Fire](https://www.studioonfire.com), un taller de impresión tipográfica de Minneapolis. Se toma el papel y la tinta mostrados de cerca, las muestras como portafolio y el oficio como argumento. También: [Hamilton Wood Type & Printing Museum](https://woodtype.org), por los tipos móviles, y Fonts In Use, buscando «letterpress».
- **Tarjeta:** papel de algodón con «Tilde» hundido en Abril Fatface y un ornamento. Al pasar el cursor, el relieve se hunde más. Sello: la tilde (ˊ).

### Rampa · collage / zine

- **Slug y marca:** `rampa` · Rampa.
- **Rubro:** tienda de skate y escuela para niños y adultos. Junto al Parque de los Reyes, Santiago.
- **Idea:** un zine fotocopiado. Fotos en blanco y negro con trama, recortes pegados con cinta y títulos en letras de rescate.
- **Movimiento:** los recortes llegan girando suave y se asientan, frenando. La cinta se estira al aparecer. Al pasar el cursor, un recorte se ladea apenas.
- **Letras:** Special Elite (texto a máquina) y Archivo Black (recortes de título).
- **Paleta:** fotocopia `#e6e3dc`, negro `#111111`, rojo `#e63228`, amarillo `#ffe14d`. `fondo`: `#e6e3dc`.
- **Secciones:** portada (el collage); la tienda (tablas, ruedas y zapatillas, como recortes con su precio a mano); la escuela (clases y horarios); las sesiones de los jueves en la rampa; el zine del mes, para leer en la tienda; inscripción (formulario: nombre, edad, nivel, horario).
- **Fotos:** skaters en el aire, tablas gastadas, rampa de hormigón, zapatillas rotas. Todas con `sat=-100` y una trama de semitono en CSS encima.
- **Página de inspiración:** [Thrasher](https://www.thrashermagazine.com), la revista de skate. Se toma la energía de revista, las fotos de skate en blanco y negro y la tipografía de portada. También: [Bronze 56k](https://shop.bronze56k.com), por la estética lo-fi de tienda de skate, y *Ray Gun*, la revista de David Carson, para el collage.
- **Tarjeta:** textura de fotocopia, «RAMPA» en letras de rescate y una tira de cinta. Al pasar el cursor, un recorte se ladea. Sello: una estrella recortada.

## Las tarjetas de Alba, Rosa, Ónix y Golpe

En la tanda 6 se rehace el arte de su tarjeta a partir de su página, con la regla de [la tarjeta](#la-tarjeta-del-brief-la-portada): el logo, la paleta y la letra de cada una, y su gesto. En Alba, la cortina que sube. En Golpe, las letras enormes. En Rosa y Ónix, el que se elija al mirarlas.
