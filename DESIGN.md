# Sistema de diseño — Volutus

> Resumen de la interfaz implementada. Las decisiones se registran en DESIGN-BRIEF.md; los valores efectivos están en src/styles/index.css y en las hojas de estilo de cada componente.

## Modelo visual

La interfaz organiza el color por zonas de contenido, no mediante un selector de tema. zona-cielo define las superficies claras de la portada y otras secciones; zona-plano define las secciones oscuras donde se muestra la obra. El recorrido de la portada llega gradualmente al mar del pie. /nosotros usa tres fondos hondos graduados. La barra fija adapta su lectura al fondo que tiene debajo.

La propuesta «Recorrido del día» conserva valor como exploración histórica, pero sus tonos cálidos no forman parte de la página actual. Ver DESIGN-BRIEF.md y la nota correspondiente del vault antes de reutilizarla.

## Tipografía

Las fuentes se alojan en public/fonts/ y usan font-display: swap:

- Geist variable, rango declarado 400–800, para texto.
- Geist Mono variable, rango declarado 400–800, para datos.
- Archivo en cursiva 800, para los titulares h1 que comparten inclinación con la marca.
- Geist respaldo y Archivo respaldo son caras locales ajustadas a las métricas de las fuentes para reducir el cambio de líneas mientras cargan.

El texto base usa 17 px y line-height 1.6. Los encabezados h1–h3 usan peso 800; h1 usa Archivo cursiva, mayúsculas y tamaño fluido. La escala CSS es: 13, 15, 17, 22 y 34 px, más clamp(40px, 7vw, 76px) para el título principal.

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
| Mañana | Degradado #2b8de4 → #4d9fea → #7cbcf1 → #c2e1f8 → #f6f9fc |
| Noche | Degradado #0a1a2a → #050d18; mar #0e2c47 / #3b86bf / #eef3ff |
| Profundidad de /nosotros | Tres degradados entre #173350 y #0a1a2a |

El cielo base define nube #b9dcf2 / #56779b / #e0b870 y mar #116492 / #38a9e8 / #9fd3f2. La mañana ajusta la nube a #ffffff / #6a8cb2 / #ffd48a. El plano nocturno define nube #34506e / #16293d / #7f9bb8 y mar #155a86 / #38a9e8 / #d9f0fc. Los tonos de marca y acción tienen usos distintos para mantener contraste.

## Espaciado, contenedor y radios

La escala de espacios usa múltiplos de 4 px: 4, 8, 12, 16, 24, 32, 48, 64 y 96 px. El contenedor mide hasta 1200 px, con margen lateral de 24 px; los textos de lectura tienen un máximo de 68ch.

La altura de la barra es 64 px y pasa a 84 px desde 768 px de ancho. Las secciones usan 64 px de espacio vertical en móvil primero y 96 px desde 1024 px.

Los radios efectivos no son uniformes: 4 px en controles y superficies pequeñas, 12 px en tarjetas y 28 px en paneles grandes de servicios y vitrina.

## Componentes y escenas

- Barra fija translúcida, enlaces de navegación y botón principal; el estilo responde al fondo bajo ella.
- Botones, etiquetas, tarjetas, formulario, estados de foco y utilidades para contenido accesible.
- Paneles de servicios con interacción desplegable; se presentan apilados en móvil y como paneles en escritorio.
- Proyectos en tarjetas y vitrina interactiva para PonleNota.
- Tarjeta clara de contacto sobre el cierre oscuro de la portada.
- Canvas de nube en la portada y canvas de mar en el pie. La nube usa un worker de módulo.
- Escena de error reutilizada en /404, /500 y /patos; esta última inicia el juego automáticamente.

Los estilos base están en src/styles/index.css; los de cada pieza están junto a su componente. src/styles/main.css organiza las importaciones.

## Movimiento y adaptación

Las curvas compartidas son cubic-bezier(0.23, 1, 0.32, 1) para entrada/salida y cubic-bezier(0.77, 0, 0.175, 1) para movimiento entre posiciones. Los tiempos base son 160 ms para respuesta, 180 ms para paneles y 500 ms para entradas narrativas.

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
