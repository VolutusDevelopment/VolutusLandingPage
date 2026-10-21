# Sistema de diseño — Volutus

> Resumen de la interfaz implementada. Las decisiones se registran en DESIGN-BRIEF.md; los valores efectivos están en src/styles/index.css y en las hojas de estilo de cada componente.

## Modelo visual

La interfaz organiza el color por zonas de contenido, no mediante un selector de tema. zona-cielo define las superficies claras de la portada y otras secciones; zona-plano define las secciones oscuras donde se muestra la obra. El recorrido de la portada llega gradualmente al mar del pie. /nosotros hace el mismo recorrido: abre bajo la misma nube, vista de costado, sigue en blanco con un plano oscuro para la marca y baja por la caída hasta el mar de día. La barra fija adapta su lectura al fondo que tiene debajo.

La propuesta «Recorrido del día» conserva valor como exploración histórica, pero sus tonos cálidos no forman parte de la página actual. Ver DESIGN-BRIEF.md y la nota correspondiente del vault antes de reutilizarla.

## Tipografía

Las fuentes se alojan en public/fonts/ y usan font-display: swap:

- Geist variable, rango declarado 400–800, para texto.
- Geist Mono variable, rango declarado 400–800, para datos.
- Archivo en cursiva 800, para los titulares h1 que comparten inclinación con la marca.
- Geist respaldo y Archivo respaldo son caras locales ajustadas a las métricas de las fuentes para reducir el cambio de líneas mientras cargan.

El texto base usa 17 px y line-height 1.6. La escala CSS es: 13, 15, 17, 22 y 34 px, más los tres tamaños fluidos de los títulos (`--texto-2xl`, `--texto-seccion` y `--texto-bloque`).

### Jerarquía de títulos

Cuatro niveles, todos en peso 800, para que no pesen lo mismo y suenen igual de fuerte (decisión 50). La Archivo cursiva abre: la página en mayúscula y cada sección en minúscula. La Geist ordena lo de adentro. De un nivel al siguiente baja el tamaño y la caja, no la voz.

| Nivel | Marcado | Letra | Caja y aire | S · 390 | M · 820 | L y XL · 1440 | Ejemplo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 · página | `h1` | Archivo cursiva | Mayúscula, +0.065em | 40 px (la portada, 32) | 57 px | 76 px | «Páginas web rápidas de verdad» |
| 1 · título largo | `h1.titular-largo` | Archivo cursiva | Minúscula, −0.005em, interlineado 1.04 | 34 px | 44 px | 60 px | El título de un artículo |
| 2 · sección | `h2.titular` | Archivo cursiva | Minúscula, −0.01em, interlineado 1.05 | 26 px | 36 px | 52 px | «Preguntas frecuentes», «¿Lo vemos juntos?» |
| 3 · bloque | `h2`, `h3.subtitulo` | Geist | −0.02em | 22 px | 22 px | 28 px | «Te sirve si…», los subtítulos de un artículo |
| 4 · elemento | `h3`, `h4` | Geist | −0.015em | 22 px | 22 px | 22 px | «Para cada pantalla», una pregunta frecuente |
| Antetítulo | `.antetitulo` | Geist Mono 400 | Mayúscula, +0.14em | 15 px | 15 px | 15 px | «Lo que se ve», sobre un nivel 2 o 3 |

Reglas de uso:

- Un solo h1 por página, y la mayúscula es solo suya. El h1 de un artículo es una frase larga y va en minúscula.
- El h2 que abre una sección, o una tarjeta de cierre, lleva `.titular`. Sin la clase, un h2 es un bloque. El h3 que hace de subtítulo dentro de una sección lleva `.subtitulo`.
- El CSS de un componente no escribe el tamaño de un título: elige su nivel. Si un título no encaja en ninguno, se discute antes de agregar un tamaño.
- El texto se escribe como se lee, en oración: la mayúscula la pone el CSS, y solo en el h1.
- Quedan fuera de la jerarquía, a propósito: el nombre de cada card del índice de servicios (`.indice-servicio-nombre`, Archivo en mayúscula, crece con su card), el nombre de cada proyecto y de cada fase de la tienda (34 px), el título del formulario y el nombre de cada socio en /nosotros (22 px).
- La cabecera de la portada ajusta su h1 a su ancho (Portada.css), y en S queda en 32 px: por eso la sección no pasa de 26 px en S.

## Color implementado

Los valores se resuelven por zona y por estado. Las tarjetas y los componentes pueden declarar superficies propias.

| Token o zona | Valores actuales |
| --- | --- |
| Fondo claro | #f6f9fc |
| Texto claro / secundario | #0a1a2a / #47607a |
| Superficie clara / línea | #ffffff / #d6e2ec |
| Acción sobre claro | #116492; hover #0f5780; activa #0c4565 |
| Fondo oscuro | #0a1a2a; superficie #122638; línea #1e3348 |
| Texto oscuro / secundario | #e6eef6 / #9db2c6 |
| Marca | #38a9e8; en zona-cielo se reserva para superficies por contraste |
| Acción oscura | #38a9e8; hover #6dc0ef; activa #8fd0f4 |
| Estados | Cielo: éxito #12714b, aviso #8a5a00, error #b3261e; plano: #4fcf96, #e8b14c, #ff8a80 |
| Vitrina de proyectos | Ciruela: fondo #1f141c, acción #e2b6cf; petróleo: #0a1e27, acción #8fc6d9; pizarra: #13171e, acción #b4c6e0 |
| Mañana | Degradado #2b8de4 → #4d9fea → #7cbcf1 → #c2e1f8 → #f6f9fc, en curva suave (ver «Degradados sin rayas») |
| Noche | Degradado #0a1a2a → #050d18; mar #0e2c47 / #3b86bf / #eef3ff |

El cielo base define nube #b9dcf2 / #56779b y mar #116492 / #38a9e8 / #9fd3f2. La mañana ajusta la nube a #ffffff / #6a8cb2. El plano nocturno define nube #34506e / #16293d y mar #155a86 / #38a9e8 / #d9f0fc. Los tonos de marca y acción tienen usos distintos para mantener contraste.

### Degradados sin rayas

Un degradado de fondo no va en tramos rectos donde empieza o termina en un color liso. En cada parada de `linear-gradient` el color cambia de golpe de ritmo, y donde un color liso empieza a aclararse, o donde el degradado llega al blanco de la sección siguiente, el ojo ve ese quiebre como una raya (banda de Mach). Pasó en las cabeceras, en la portada, en la caída, en el cielo de las páginas de error y detrás de los socios de /nosotros, y se corrigió en octubre de 2026.

- **Curva suave, plana en los extremos.** El fundido recorre sus colores en una curva sin quiebres, con pendiente cero donde toca un color liso, escrita como muchas paradas tomadas de esa curva: cada 16 px en las cabeceras y cada 10 % en los cielos grandes. Entre parada y parada el navegador interpola en recta, así que con pocas paradas cada una vuelve a ser un quiebre: un smoothstep en tramos de 48 px todavía se veía.
- **No forzar la parada vecina al color liso.** Si el último tramo es corto y empinado, la curva tiene que frenar de golpe y la raya vuelve. Se conserva el camino de colores; lo que cambia es dónde cae cada uno. Después hay que comprobar que el texto que va encima sigue contrastando igual.
- **Un solo fundido para las cabeceras.** Todas las cabeceras del cielo comparten el de `:root .cabecera-cielo` y `:root .cabecera-cielo + .seccion` (index.css): una parábola de ida y vuelta en oklab, del color de la página (`--fondo`, o sea `--tinte` o el azul del día) a #f6f9fc. Ocupa 12 tramos de 16 px en el relleno de abajo (`--fundido`, 192 px) y 6 más en la sección siguiente, sin mover nada. Una cabecera nueva lo hereda: no se le escribe otro.
- **La franja de la barra va con el fundido.** Si un fundido cambia de largo o de colores, se recalculan sus paradas y también `.cabecera-fundido`: es el punto donde la tinta empieza a contrastar más que el blanco, y ahí barra.js cambia la barra a tinta.
- **Se revisa de cerca.** Al tocar un degradado, se mira ampliado (captura a 2×) dónde empieza y dónde termina. Medido en claridad percibida (OKLab L), el salto de ritmo entre tramos queda bajo ~0.1 por px; la raya que se veía medía 0.68.

## Espaciado, contenedor y radios

La escala de espacios usa múltiplos de 4 px: 4, 8, 12, 16, 24, 32, 48, 64 y 96 px. El contenedor mide hasta 1200 px, con margen lateral de 24 px; los textos de lectura tienen un máximo de 68ch.

La altura de la barra es 64 px y pasa a 84 px desde 768 px de ancho. Las secciones usan 64 px de espacio vertical en móvil primero y 96 px desde 1024 px.

Los radios efectivos no son uniformes: 4 px en campos y superficies pequeñas, 12 px en tarjetas y 28 px en paneles grandes: servicios, y láminas y fichas de proyectos. Los botones van aparte (decisión 51): la píldora, de extremos redondos, y el cuadro, inclinado 10° con 6 px de radio.

## Componentes y escenas

- Barra fija translúcida, enlaces de navegación y botón principal; el estilo responde al fondo bajo ella. Una gota marca dónde estás (decisión 52): descansa en el enlace de la página o la sección actual, sigue al cursor estirándose y, mientras está en otro enlace, deja un punto bajo el tuyo.
- Dos botones (decisión 51). Con palabras, la píldora (`.boton`): Archivo itálica 800 en minúscula, siempre en una línea, rellena para lo principal y de contorno para lo demás. Con un signo o un número, el cuadro (`.boton-cuadro`): inclinado 10°, para cerrar, − y + y las páginas. Al pulsar, los dos se inclinan un poco más y vuelven.
- Etiquetas, tarjetas, formulario, estados de foco y utilidades para contenido accesible.
- Servicios en ocho cards, en una rueda en todos los tamaños: muestra todas y gira (arrastre con el ratón o el dedo, trackpad o pulsando una que asoma). El glifo de cada card hace un gesto corto al quedar al frente y al pasar el cursor (Icono.css). Sin JavaScript, una lista con todas a la vista.
- Logros en tarjetas con medalla, siempre a la vista: uno bajo otro hasta M y lado a lado desde L. Con ratón se inclinan hacia el cursor. Proyectos en láminas oscuras: resumen, la dirección donde se abre cada uno («En línea» o «Código público») y, si hay capturas, el producto en sus pantallas reales saliendo del borde de la lámina; tocarla abre su ficha en un `<dialog>`, que sale de la lámina (arranca encima, con su ancho, y crece hasta su sitio) y al cerrar vuelve a ella; es Web Animations y no View Transitions, que en Safari no captura bien un `<dialog>` modal. Un proyecto sin capturas ni pasos no tiene ficha y su lámina es una fila. Cada lámina toma su forma por su propio ancho (container query).
- Tarjeta clara de contacto sobre el cierre oscuro de la portada. Su titular, en todas las páginas que la llevan, es una de seis frases (`TITULOS_DEL_CONTACTO`), al azar en cada carga y sin rotar mientras se mira; las frases van apiladas en una celda, así que cambiarla no mueve nada. En S y M el formulario sube sobre la tarjeta oscura hasta el titular, los 24 px que los separan: nunca lo tapa.
- /nosotros: la escena de la portada (`Escena`) con la nube de costado (`perspectiva="costado"`): el rollo cruza la cabecera casi paralelo a la pantalla y su frente sube; en todos los tamaños va arriba y el texto debajo. Su lienzo no baja de 45svh y la textura sigue la foto de la Morning Glory: vetas en el frente y bultos bajos en la cresta. Después, el nombre: primero lo que es la nube, con la definición del Atlas como entrada de diccionario y la Morning Glory en foto con cifras; luego lo que es para nosotros, en lista numerada, un rasgo por cada palabra de la definición (única, simple, imponente, al mismo nivel), y las fuentes citadas. Cierra el plano de la marca (zona-plano con cuadrícula) en tarjeta oscura sobre la caída, «Tres líneas»: la ola del logotipo sola y en grande, en blanco (decisión 54).
- Cifras (`.cifras`): número en Geist Mono sobre una línea; las comparten /ley21719 y /nosotros.
- Canvas de nube en la portada, /nosotros y las páginas de error, y canvas de mar en el pie. Las pinta un worker de módulo. La nube es una sola volutus física (`src/lib/volutus.js`) y cada página la mira con su cámara (`data-perspectiva`): `aire`, `costado`, `abajo` (/servicios), `suelo` (404), `encima` (500) y `horizonte` (/patos). Su punto mide 2 px, nunca menos de 3 px del aparato, y es un cuadrado redondeado (decisión 38).
- Escena de error reutilizada en /404, /500 y /patos; esta última inicia el juego automáticamente.
- Páginas de servicio: la card de la rueda abierta. Su color (`--tinte`, el de la card) tiñe la barra y el cielo de la cabecera, que se aclara en una curva suave hasta entrar en la sección siguiente, y marca lo propio del servicio —líneas, vistos y rótulos—; enlaces y botones siguen en la acción de siempre. La cabecera lleva una pieza (`Pieza.jsx`): la card en grande, con la trama de puntos, su anillo blanco, su sombra y una escena en SVG de lo que hace el servicio, en el idioma de los iconos de las cards: glifos macizos inclinados 10°, en blanco y medio blanco sobre el color, con un solo dato concreto en Archivo. Al cargar cuenta su historia una vez y se queda quieta; con el cursor encima se inclina como la card del frente (pieza.js), sus tres capas se corren según su hondura y repite el gesto de su servicio. Con movimiento reducido está entera y quieta. Lo de en medio es de cada servicio (`paginas/servicios/`), que cuenta lo que incluye con la forma de lo que entrega y en textos de una línea: la web, a todo el ancho y partida por una onda que se mueve despacio (lo que se ve, arriba; lo que no y la prueba, en el color, que se cierra con la misma onda volteada); la tienda, sus fases con un índice fijo a un lado que marca la que se lee; el software a medida, un diagrama con líneas punteadas por donde corren los datos; el agente, las preguntas en un chat que se escribe al bajar; la automatización, cada tarea de hoy que se tacha mientras se enciende su reemplazo, y un registro que corre solo; la gestión, un panel de módulos donde las ventas suben, el stock avisa y la agenda se llena, y la prospección, un mapa donde caen los negocios y una planilla donde llegan. Las animaciones al bajar van con `animation-timeline` y las demás con `transform`, en CSS: sin ellas, al imprimir o con movimiento reducido, cada dibujo está completo y quieto. Comparten la obra que lo prueba, si la hay; si le sirve y qué le pedimos, lado a lado; cómo trabajamos, en una línea, y las preguntas frecuentes, plegadas. Justo después de lo que incluye —en la web, al cerrarse su franja de color— va «Calcula un estimado» (`Estimado.jsx`): las opciones en pasos numerados, con el número en la itálica de los titulares y en el color del servicio, en las pastillas del contacto y cada una con su precio; las cantidades, entre − y +. Al lado, la boleta: la cabeza en el color del servicio y el borde de abajo picado, cada cosa marcada con puntos hasta su monto, el total grande en la itálica, los pesos, la UF del día con su fecha, cómo se paga, lo que cuesta al mes, el aviso de que es un estimado y «Pedir esta cotización», que deja lo marcado escrito en el mensaje del formulario. Desde L la boleta acompaña al bajar; en S y M va debajo, y mientras se marca, una barra con el total se pega abajo. La cabecera lleva a él: «Calcula tu estimado» con el precio de partida al lado y, debajo, su equivalente en pesos y el aviso. La guía de la ley de datos lleva el suyo al final. Terminan en el formulario del contacto, con el servicio marcado.
- /servicios, el índice de las páginas de servicio: la cabecera del cielo del día con la nube de borde a borde, vista desde abajo (`perspectiva="abajo"`), y el título «Nuestros servicios» dentro de ella, en tinta, sin antetítulo. Bajo el título, también en la nube, una entradilla corta en negrita y el botón al formulario, en el azul hondo de la portada, para quien ya sabe lo que quiere. Debajo, cada servicio como la portada de su página en chico: el cielo del día en su color con la pieza de su página arriba y, al pie, su nombre en grande, en Archivo, que crece con el ancho de la card, y el titular de su página en una línea, con la flecha a su lado. El nombre va en grande porque es lo que se busca en el índice. Al pasar el cursor, la card se levanta y su pieza repite su gesto. No explica el servicio: eso lo hacen la rueda y su página. La card entera lleva a su página. La primera fila sube sobre el fundido de la cabecera, cerca de la nube, para asomar en la primera pantalla; la barra toma el color de la card porque, de lo que tiene detrás, manda lo más hondo. Una bajo otra en S, de a dos desde M (la prospección, sola en su fila, con la pieza a la derecha) y, desde L, en filas de dos, tres y dos, con la ley de datos, que no tiene pieza sino su glifo, en una franja a todo el ancho. Debajo, «Antes de escribirnos»: cuatro líneas separadas por un filete (un estimado en cada servicio, cada solución es única, alcance y precio sin compromiso, cada servicio es independiente), en fila desde L, y después el formulario.
- Artículos: cabecera del cielo del día, cuerpo a la medida de lectura (`.prosa`) y, en la caída, el formulario del contacto, con el servicio del artículo marcado. El índice es un sumario (decisión 53): el más nuevo en una lámina oscura a todo el ancho, con su baldosa en grande y el anillo blanco de la pieza, y los demás en filas con filete, de a dos desde M. Cada fila lleva el glifo de su servicio en una baldosa de su color con la trama, su nombre en mono y en su color, la fecha, el título y el resumen en dos líneas; la fila entera es el enlace y, con el cursor, el glifo hace su gesto. El artículo que habla de todos los servicios va en azul marino con la hoja de una guía.

Los estilos base están en src/styles/index.css; los de cada pieza están junto a su componente. src/styles/main.css organiza las importaciones.

## Movimiento y adaptación

Las curvas compartidas son cubic-bezier(0.23, 1, 0.32, 1) para entrada/salida y cubic-bezier(0.77, 0, 0.175, 1) para movimiento entre posiciones. Los tiempos base son 160 ms para respuesta y 500 ms para entradas narrativas. La rueda de servicios no usa una duración fija: gira con un resorte.

La entrada de bloques usa animación ligada al scroll cuando el navegador admite animation-timeline: view(); si no, el contenido permanece visible. La hoja base desactiva el desplazamiento de scroll y algunas transformaciones con prefers-reduced-motion; componentes y lienzos ajustan su movimiento según esa preferencia. El cambio de tema no depende de un widget del usuario.

El layout es fluido y mobile-first; los puntos de quiebre varían por componente. Las reglas globales usan 768 px para altura de barra y 1024 px para el ancho vertical de las secciones.

## Accesibilidad y objetivos

El foco visible usa un contorno de 2 px; la navegación, el contenido semántico, los controles y alternativas de texto se definen por componente. Las animaciones deben respetar prefers-reduced-motion. El contraste AA, evitar desbordamiento y lograr Lighthouse 100/100/100/100 son objetivos, no una afirmación de medición actual. Las mediciones, si se registran, deben incluir fecha, versión y alcance.

## Fuentes de verdad

- Decisiones de diseño: DESIGN-BRIEF.md.
- Tokens y base: src/styles/index.css.
- Interacción y presentación: CSS de src/components/ y src/paginas/.
- Estado funcional de páginas y rutas: src/lib/meta.js y src/paginas/rutas.js.
- Generación de HTML y sitemap: scripts/prerender.mjs.
