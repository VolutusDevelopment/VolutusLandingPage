# DESIGN.md — Sistema de diseño de Volutus

Este documento describe el sistema **vigente**: los valores que usa el código,
cómo se usan y qué no se hace. El porqué de cada decisión y su historial
viven en `DESIGN-BRIEF.md` (§12, registro de decisiones). Si un valor cambia
en `src/styles/index.css`, cambia también aquí.

## Filosofía

Volutus es una empresa de desarrollo de software que se presenta con obra que
se puede abrir y revisar. El diseño transmite precisión, simpleza y dominio
técnico, sin ruido. Cada elemento se gana su lugar: si se puede quitar sin
perder nada, se quita.

1. La función manda sobre la forma.
2. Pocos componentes, mucho espacio y buena tipografía.
3. El contenido es el protagonista.
4. Cada animación tiene un propósito, y si no lo tiene no entra.
5. La estética nunca le cuesta rendimiento a la página.

---

## Marca

### El logotipo

La palabra **VOLUTUS** en Archivo 800 itálica, convertida a trazos, y una
**ola de trama de puntos** que nace en la S y rompe en voluta. Palabra y ola
son una sola pieza (`image.png` es la referencia visual).

- **Construcción.** Las tres líneas de la ola salen de la S a tres alturas y se
  enrollan. La trama es una grilla de puntos cuyo radio depende de la
  distancia a esas líneas, y se recorta alrededor de las letras para que nunca
  las toque.
- **Dos tramas**, por tamaño:
  - **fina**: para el logotipo grande (pie, documentos). Por debajo de ~60 px
    de alto se empasta.
  - **gruesa**: para tamaños chicos (la barra, a 38 px de alto).
- **Color.** Las letras usan `currentColor` y la trama también, salvo que se
  defina `--logotipo-puntos`. En la barra la trama va al 80 % del color y en el
  pie al 70 %.
- **Geometría congelada.** Vive en `src/lib/logotipo.js` y no se edita a ojo.

### El símbolo

La **voluta de Fibonacci**: una recta de entrada y cuatro cuartos de
circunferencia con radios 8·5·3·2. Es un solo trazo sin esquinas en los
empalmes. No se dibuja a mano: la calcula `espiralFibonacci` y la constante
`VOLUTA` de `src/lib/espiral.js`. Se queda en 8·5·3·2 porque los arcos 1·1
finales se empastan a 16 px.

Se dibuja con trazo de 2.2 sobre 24 unidades, extremos redondos y
`currentColor`.

### Versiones y dónde va cada una

| Versión | Dónde | Componente |
| --- | --- | --- |
| Logotipo, trama gruesa | Barra en M, L y XL (38 px de alto) | `Logotipo trama="gruesa"` en `Marca.jsx` |
| Símbolo solo | Barra en S (< 480 px, 26 px), favicon, avatares, espacios cuadrados | `Onda` en `Marca.jsx` |
| Logotipo, trama fina | Pie, a todo el ancho del contenedor | `Logotipo` en `Pie.jsx` |
| Favicon | Símbolo blanco sobre cuadrado `#2B5F73` con radio 5/24 | `index.html`, `privacidad.html` |

### Reglas de uso

- **Tamaño mínimo:** el logotipo no se usa por debajo de 38 px de alto; más
  chico va el símbolo. El símbolo tiene que leerse a 16 px.
- **Área de respeto:** alrededor del logotipo, un aire libre igual al alto de
  sus mayúsculas.
- **Un color por pieza:** el color de texto de la zona donde vive. Sin
  degradados, sin sombras, sin contornos.
- **No se hace:**
  - escribir «VOLUTUS» con texto en vez de usar el SVG;
  - separar la ola de la palabra (el único corte permitido es el símbolo
    solo);
  - enderezar, deformar, rotar o recolorear partes sueltas;
  - poner el logotipo encima del mar u otra trama.
- **Accesibilidad:** el SVG va con `aria-hidden`; el nombre lo lleva el enlace
  que lo contiene (`aria-label`).

### Kit de marca

`public/marca/` tiene el logotipo (tramas fina y «pequeño» gruesa) y el
símbolo, en versión clara (`#151515`) y oscura (`#eef3f1`). Sirven para
correo, documentos y redes, y la página no los descarga. Se regeneran con
`node scripts/marca.mjs` desde la misma geometría, así que nunca se desvían.

---

## Color

La página tiene **dos temas por zona**, no un modo oscuro conmutable:

- **Cielo** (claro): donde la página promete (portada, proceso, contacto).
- **Plano** (oscuro): donde la página demuestra (métricas, láminas, pie).

Cada sección declara su zona con `.zona-cielo` o `.zona-plano`, y los
componentes usan tokens sin conocer su color. El panel de accesibilidad puede
forzar un tema con `data-tema` en `<html>`.

### Zona cielo

| Token | Valor | Uso | Contraste sobre blanco |
| --- | --- | --- | --- |
| `--fondo` / `--superficie` | `#ffffff` | Fondo | — |
| `--texto` | `#151515` | Texto principal | 18.26:1 |
| `--texto-suave` | `#4d5c63` | Texto secundario | 6.94:1 |
| `--linea` | `#dfe6e8` | Bordes y divisores | decorativo |
| `--marca` | `#448597` | Trazos y superficies. **Nunca texto ni botón** | 4.16:1 |
| `--accion` | `#2b5f73` | Enlaces, botón primario, foco | 7.03:1 |
| `--accion-hover` / `--accion-activa` | `#2a5060` / `#1f3f4d` | Estados | 8.70:1 / — |
| `--exito` / `--aviso` / `--error` | `#12714b` / `#8a5a00` / `#b3261e` | Semánticos | ≥ 5.6:1 |

### Zona plano y sus tonos

La base del plano es **bosque**. Tres tonos más dan color sin gastar la acción:
`.zona-plano.tono-ciruela`, `.tono-petroleo` y `.tono-pizarra`. Cada tono
redefine fondo, superficie, texto suave, marca/acción y `--lamina`. El texto
principal es siempre `#eef3f1`.

| Tono | Fondo | Superficie | Marca = acción | Lámina | Texto sobre fondo | Dónde se usa |
| --- | --- | --- | --- | --- | --- | --- |
| Bosque (base) | `#0c221d` | `#13302a` | `#8cc9b1` (8.80:1) | `#1f5c4b` | 14.84:1 | Pie, paso 3 de Proceso |
| Ciruela | `#1f141c` | `#2c1d28` | `#e2b6cf` (10.06:1) | `#543b4e` | 15.94:1 | Paso 1, proyecto destacado |
| Petróleo | `#0a1e27` | `#112b36` | `#8fc6d9` (9.16:1) | `#2b5f73` | 15.25:1 | Paso 2, Métricas |
| Pizarra | `#13171e` | `#1c222b` | `#b4c6e0` (10.35:1) | `#3d4a5c` | 16.02:1 | Paso 4 |

Las **láminas** son el color saturado de cada tono. Aguantan blanco encima
(de 7.03:1 a 9.94:1) y son la mitad ilustrada de las tarjetas de Proceso.

### Reglas

- El color vive en las tarjetas y las zonas, no en la página: cielo se queda
  en blanco.
- Un solo color de acción por zona. Los tonos no son colores de estado.
- Los estados derivados (hover, tintes, trama al 80 %) salen de `color-mix()`
  sobre los tokens; no se introducen colores fuera de la paleta.
- Nada de degradados multicolor ni morado saturado. La ciruela es un tono
  apagado y se usa solo como tono de zona.

---

## Tipografía

**Archivo** es la única familia del sitio: titulares, texto, etiquetas y
datos. Es la misma del logotipo.

- Autohospedada en `public/fonts/archivo-latin.woff2` (33 KB). Es variable,
  con subset latino y el eje de peso recortado a 400–800. Tiene
  `font-display: swap` y preload en el HTML.
- La **itálica no se carga**: es exclusiva del logotipo, que va a trazos.
- **Respaldo calzado:** mientras Archivo viaja se usa `'Archivo respaldo'`,
  una Arial local deformada con `size-adjust: 98.59%` y métricas medidas.
  Mide igual que Archivo, así que el texto no se recoloca al cambiar de
  fuente.
- **Pesos:** solo 400 y 800. Nunca 500 ni 600.

| Paso | Tamaño | Uso |
| --- | --- | --- |
| `--texto-xs` | 13 px | Antetítulos, etiquetas, pie |
| `--texto-sm` | 15 px | Texto secundario |
| `--texto-base` | 17 px | Texto corrido (`line-height: 1.6`) |
| `--texto-lg` | 22 px | Entradilla, h3 |
| `--texto-xl` | 34 px | Título de sección (h2) |
| `--texto-2xl` | `clamp(36px, 7vw, 76px)` | Titular de portada (h1) |

Todos los pasos se multiplican por `--escala`, que el panel de accesibilidad
mueve entre 1 y 1.5.

- **Titulares:** 800, `letter-spacing: -0.03em`, `line-height: 1.08` y
  `text-wrap: balance`. El h1 entra en tres líneas a 390 px.
- **Etiquetas** (`.antetitulo`, títulos del pie, etiquetas del dibujo): 400,
  mayúsculas y tracking positivo (0.1–0.14em).
- **Cifras** (`.dato`): `font-variant-numeric: tabular-nums`, que Archivo
  trae.
- **Medida de lectura:** 68 caracteres como máximo.

---

## Espaciado y forma

| Concepto | Valor |
| --- | --- |
| Escala de espaciado | Múltiplos de 4: `--e-1` (4) · 2 (8) · 3 (12) · 4 (16) · 6 (24) · 8 (32) · 12 (48) · 16 (64) · 24 (96) |
| Contenedor | `--ancho-maximo: 1200px`, `--margen-lateral: 24px` |
| Ritmo de sección | 64 px en S y M, 96 px desde 1024 px |
| Barra | `--barra-alto`: 64 px, y 84 px desde 768 px |

**Radios:**

| Token o valor | Uso |
| --- | --- |
| `--radio: 4px` | Controles: campos, capturas, anillo de foco |
| `--radio-tarjeta: 12px` | Superficies de color (tarjetas, pasos) |
| `999px` (píldora) | Botones y cápsula de la barra: lo único redondo, y por eso se lee como pulsable |
| `28px` | Vistas de la vitrina de proyectos (excepción local) |

**Sombras:** ninguna de elevación. La jerarquía la dan el tinte de la
superficie y una línea de 1 px. Las únicas excepciones son los cantos
interiores de 1 px (el borde encendido de los pasos) y el vidrio de la barra.

---

## Atmósfera: el mar y las nubes

La riqueza visual no viene de la interfaz, que es plana, sino de **una pieza
atmosférica: el mar y sus nubes**. Es la trama del logotipo en movimiento.

- **Qué es.** Un fragment shader (WebGL, sin dependencias) dibuja una rejilla
  de puntos de 9 px, partida por un horizonte:
  - **mar**, abajo: cada punto mira el agua en perspectiva y crece con la
    altura de la ola. Son tres ondas con dispersión de agua profunda más una
    envolvente que agrupa el oleaje;
  - **nubes**, arriba: ruido fractal que el viento arrastra, con la
    perspectiva en espejo. Son grandes y lentas arriba, y chicas y apretadas
    contra el horizonte.
- **Dónde.**
  - **Portada:** la primera pantalla es una escena. Un lienzo la cubre entera,
    detrás del texto. El titular va al centro, entre nubes tenues (alfa 0.38,
    marca), y el mar llena lo que sobra hasta el borde, en petróleo (frente) y
    marca (horizonte). El horizonte es el borde de arriba de
    `.portada-mar[data-horizonte]`, un espaciador que se lleva el alto que el
    texto no usa.
  - **Pie:** una franja final de mar, sin nubes, más tenue y de noche (marca
    de bosque). No tiene texto encima.
- **Color.** Cada lienzo toma `--mar-cerca`, `--mar-lejos`, `--mar-alfa` y
  `--nubes-alfa` (0 o ausente: sin nubes) de su contenedor, y reacciona al tema
  forzado.
- **Arquitectura.** `src/mar.js` corre en la página: mide, lee los colores,
  observa la visibilidad y avisa. `src/mar-lienzo.js` es un Web Worker con
  OffscreenCanvas, y ahí vive todo el WebGL.
  - **Por qué:** en un navegador recién abierto, crear el primer contexto
    WebGL espera a que arranque la GPU. En el hilo principal eso era una tarea
    de 1.2–1.4 s que bajaba Lighthouse a ~76 en la mitad de las corridas. En
    el worker no bloquea nada y Lighthouse vuelve a 100.
- **Reglas de rendimiento, no negociables:**
  - arranca después de `load`, en tiempo ocioso: nunca antes del LCP;
  - todo el WebGL va fuera del hilo principal;
  - se pausa fuera de pantalla y con la pestaña oculta;
  - ~30 fps, DPR máximo 1.5 y `powerPreference: 'low-power'`;
  - `failIfMajorPerformanceCaveat`: sin GPU real no hay mar;
  - con movimiento reducido pinta un solo fotograma quieto;
  - sin OffscreenCanvas o sin WebGL el lienzo queda transparente y la página
    sigue entera;
  - el lienzo es absoluto: cero CLS;
  - el shader viaja sin minificar, así que no lleva comentarios dentro: sus
    explicaciones van en el JavaScript de alrededor.
- **No se añade** un shader en otro lugar (barra, tarjetas, láminas) ni
  librerías 3D. Dos lienzos y un solo worker como máximo en la página.

Fuera del mar, la atmósfera se hace con **degradados radiales tenues con
colores de la paleta**: el resplandor detrás del titular y el fondo de las
vistas de la vitrina. Nunca multicolor.

---

## Movimiento

**Curvas** (solo dos):

- `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` para lo que entra o sale.
- `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` para lo que se mueve en
  pantalla.
- `ease-in` no se usa nunca.

**Duraciones:**

- `--t-pulsar: 160ms` y `--t-panel: 180ms` para la interfaz, que queda por
  debajo de 300 ms.
- `--t-entrada: 500ms` para lo narrativo, que se ve una vez.

Solo se animan `transform` y `opacity`, con dos excepciones: el `clip-path` de
la ola del logotipo y los trazos SVG.

**Inventario:**

| Animación | Dónde | Cómo |
| --- | --- | --- |
| Entrada de bloques (`.entra`) | Toda la página | `animation-timeline: view()`, CSS puro, reversible |
| Titular que sube y palabra que rota | Portada | CSS y `titular-rotativo.js` |
| Rutas que se encienden | Dibujo de la portada | SVG y CSS, atado a la palabra |
| Mar y nubes | Portada y pie | WebGL en un worker (`mar.js`, `mar-lienzo.js`) |
| Voluta que se traza y ola que rompe | Barra, una vez por carga | `stroke-dasharray` y `clip-path` |
| Pasos que se apilan | Proceso | `position: sticky` y línea de tiempo de vista |
| Medidores | Métricas | `medidores.js` |
| Logotipo que sube | Pie | `animation-timeline: view()` |
| Botón que se hunde | Botones | `scale(0.97)` al pulsar |

**Movimiento reducido:** se atiende por dos vías, `prefers-reduced-motion` y
`data-movimiento='reducido'` desde el panel. El JavaScript pregunta a
`quieto()` en `src/lib/movimiento.js`. Reducir quita el desplazamiento y
conserva los cambios de color y opacidad.

---

## Componentes base

Definidos en `src/styles/index.css`, y todos funcionan en las dos zonas sin
variante propia:

- `.boton`, `.boton-primario` y `.boton-secundario`: píldora de 44 px de alto
  mínimo. Al enviar no desaparece: cambia el texto y se desactiva.
- `.tarjeta`: superficie `--tinte-a` con `--radio-tarjeta`.
- `.antetitulo`: etiqueta de sección (un `<p>`, fuera de la jerarquía de
  títulos).
- `.entradilla` y `.dato`: el texto de apoyo y las cifras tabulares.
- `.contenedor` y `.seccion`: ancho y ritmo vertical.
- `.corte-de-zona`: línea de 1 px entre temas; el corte es seco, nunca un
  fundido.
- `.mar`: el lienzo del shader.
- `.salto` y `.solo-lectores`: accesibilidad.

---

## Responsive

Móvil primero: el caso principal es un enlace abierto desde WhatsApp.

| Nombre | Ancho | Cortes usados en el CSS |
| --- | --- | --- |
| S | < 640 px | 480 (barra con símbolo solo, botones a ancho completo), 560 |
| M | 640–1023 px | 650 (vitrina a dos columnas), 768 (barra alta, pasos a dos columnas), 900 |
| L | 1024–1439 px | 1024 (ritmo de sección y portada) |
| XL | ≥ 1440 px | El contenido topa en 1200 px |

No debe haber overflow horizontal, layout shift ni contenido inaccesible en
ningún ancho.

## Accesibilidad

- Contraste AA en las dos zonas y en todos los tonos (tablas de arriba). Si un
  color no llega, se ajusta el color, nunca el listón.
- Foco visible siempre: 2 px con 2 px de separación, en `--foco`.
- Área táctil mínima de 44 × 44 px.
- El error nunca se comunica solo con color.
- Todo funciona sin JavaScript. Sin él se pierden las animaciones y el mar,
  nada más.
- El texto de la portada se lee sobre las nubes: son de un solo color, en
  alfa 0.38, y nunca cubren el titular por completo.

## Presupuesto de rendimiento

| Métrica | Objetivo |
| --- | --- |
| Lighthouse móvil | 100 en las cuatro categorías |
| JavaScript de la primera carga | ≤ 15 KB. Hoy: 11.7 KB (4.8 KB gzip) |
| Pintor del mar (worker, después de `load`) | 3.8 KB (1.9 KB gzip) |
| Fuentes | Una familia, 33 KB |
| LCP en 4G | < 1.5 s |
| CLS | 0 |
| INP | < 200 ms |
