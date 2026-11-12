# Hoja de ruta de los bocetos del brief

> El plan para terminar los bocetos de /brief-web: qué falta, cómo se hace cada
> uno y en qué orden. Está pensado para repartirse entre varias sesiones: cada
> una toma la siguiente tanda pendiente, la deja lista para revisar y actualiza
> la tabla de estado. Escrito el 11 de noviembre de 2026, sobre el commit
> `1432db0`.

## Objetivo

El brief muestra 24 direcciones de estilo ([src/lib/brief/bocetos.js](../src/lib/brief/bocetos.js)). Cada una tiene una tarjeta en el brief y un boceto: la landing page entera de una marca inventada, en `public/brief/bocetos/<slug>.html`, para que el cliente vea el estilo puesto en una página real y lo califique.

Al escribirse había 6 bocetos (Alba, Nodo, Rosa, Ónix, Golpe y Kōen) y los otros 18 daban 404. Las tarjetas dibujaban cada estilo con un arte genérico («$ ./tu-marca --deploy») que no se parecía a su boceto. El avance está en la [tabla de estado](#tabla-de-estado). Nodo y Kōen, ya reemplazados por Cauce y Kiri, siguen en `public/` hasta que se borren (ver la bitácora).

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

Estados: **pendiente**, **hecho** (listo para revisar), **segunda vuelta** (el usuario lo vio, pidió cambios y ya se hicieron: falta que lo vuelva a ver) y **aprobado** (el usuario lo vio y quedó). La tarjeta de cada uno se revisa en la tanda 6, con las 24 juntas.

| Estilo | Marca | Tanda | Página | Fotos | Tarjeta | Revisado |
| --- | --- | --- | --- | --- | --- | --- |
| Tecnológico | Cauce | 1 | hecho | hecho | hecho | segunda vuelta |
| Zen / japonés | Kiri | 1 | hecho | hecho | hecho | pendiente |
| Corporativo | Basal Ingeniería | 2 | aprobado | aprobado | hecho | segunda vuelta |
| Editorial | Viña Ladera | 2 | hecho | hecho | hecho | segunda vuelta |
| Clínico / limpio | Iris Centro Visual | 2 | aprobado | aprobado | hecho | segunda vuelta |
| Natural | Quillay | 2 | hecho | hecho | hecho | segunda vuelta |
| Lúdico | Pelusa | 3 | hecho | hecho | hecho | segunda vuelta |
| Retro | Pista Lucero | 3 | hecho | hecho | hecho | segunda vuelta |
| Memphis | Tablero | 3 | hecho | hecho | hecho | segunda vuelta |
| Y2K | Destello | 3 | hecho | hecho | hecho | segunda vuelta |
| Futurista | Cénit | 3 | hecho | hecho | hecho | segunda vuelta |
| Brutalista | Sótano | 4 | hecho | hecho | hecho | segunda vuelta |
| Suizo / gráfico | Rumbo | 4 | hecho | hecho | hecho | segunda vuelta |
| Bauhaus | Bisagra | 4 | hecho | hecho | hecho | segunda vuelta |
| Art déco | Bar Marfil | 4 | hecho | hecho | hecho | segunda vuelta |
| Artesanal | Libar | 5 | hecho | hecho | hecho | segunda vuelta |
| Industrial | Remache | 5 | hecho | hecho | hecho | segunda vuelta |
| Andino / folclórico | Parina | 5 | hecho | hecho | hecho | segunda vuelta |
| Letterpress | Prensa Tilde | 5 | hecho | hecho | hecho | segunda vuelta |
| Collage / zine | Rampa | 5 | hecho | hecho | hecho | segunda vuelta |
| Minimalista | Alba Interiores | 6 | hecho | hecho | pendiente | pendiente |
| Cálido y cercano | La Mesa de Rosa | 6 | hecho | hecho | pendiente | segunda vuelta |
| Premium | Ónix | 6 | hecho | hecho | pendiente | pendiente |
| Audaz | Golpe | 6 | hecho | hecho | pendiente | segunda vuelta |

## Tandas

1. **Cauce y Kiri**, que reemplazan a Nodo y Kōen, con sus tarjetas. En la misma tanda se borran `public/brief/bocetos/nodo.html` y `koen.html`, `public/image/bocetos/nodo/` y `koen/` y sus tablas en [bocetos-fotos.md](bocetos-fotos.md), y el abanico de [PreguntaBrief.jsx](../src/components/PreguntaBrief.jsx) (`ABANICO`, línea 345) pasa a `['kiri', 'golpe', 'cauce']`.
2. **Basal, Ladera, Iris y Quillay**: los estilos que más piden las pymes. *Hecha el 11 de noviembre, junto con Pelusa y Lucero.*
3. **Pelusa, Lucero, Tablero, Destello y Cénit**: los de color, luz y humor. *Hecha el 11 de noviembre.*
4. **Sótano, Rumbo, Bisagra y Marfil**: los de tipografía y geometría. *Hecha el 11 de noviembre.*
5. **Libar, Remache, Parina, Tilde y Rampa**: los de material y oficio. *Hecha el 11 de noviembre.*
6. **Las tarjetas de Alba, Rosa, Ónix y Golpe**, sacadas de sus páginas, y una revisión de conjunto de /brief-web con las 24 tarjetas y el recorrido del visor de principio a fin.

## Pendientes conocidos

- **En un iPhone o iPad real:** la cortina pegada de Remache (sube con el scroll en Safari 26 y sola en Safari 18) y la trama de Rampa (filtro de contraste con mezcla), que en el WebKit de Playwright se ven bien pero conviene confirmar.
- **Ladera da 97 en rendimiento y Rosa entre 95 y 99** (en el build de producción con `wrangler dev`, en teléfono). En las dos el LCP es la foto de la tapa: en la carga real llega en menos de 100 ms, pero la red simulada de Lighthouse reparte el ancho de banda entre la foto y las tres letras de la primera pantalla (Ladera: Newsreader, su itálica y Hanken Grotesk; Rosa: Fraunces, Nunito Sans y Caveat) y lo estima en 2,4 s. Ya se probó con tapas más livianas (540 px antes; ahora 760 px a calidad baja para teléfonos, que es lo que pide un teléfono de 412 px a densidad 1,75) y con la fila de la mancheta visible desde el primer cuadro, sin cambio en Ladera. Queda probar con una sola letra arriba del pliegue. En Rosa la nota oscila con el desplazamiento de la barra de calificar (el pendiente de abajo).
- **Un desplazamiento de 0,048 al cargar**, que Lighthouse ve a veces en varios bocetos (también en Golpe, anterior a estas tandas). Parece la barra de calificar de barra.js, que se monta después del primer pintado. El rendimiento igual queda en 100.

## Bitácora de decisiones

- **2026-11-11, segunda vuelta de seis.** El usuario pidió buscar el estilo de cada uno en Awwwards y tomar componentes, animaciones y detalles. Referencias usadas: Farm Minerals e iyO (Cauce), los «sticky header» de Petro.Design y Aqtos (Basal), Bijou Wines y Post Familiar Wine (Ladera), Amrit Palace (Rosa), My Dog Company (Pelusa) y, como scroll guiado, /nosotros de Volutus. Lo que se hizo:
  - **Cauce** («se ve muy simple»): portada y panel en oscuro, titular grande condensado con un puñado de tierra metido en la línea, mapa de borde a borde con una barra de lectura que pone al día cada sensor al cruzarlo, la grilla de doce columnas a la vista y una pieza nueva, «Un riego»: el corte del suelo pegado mientras se leen cinco pasos, con el bulbo húmedo bajo cada gotero (crece con la raíz del agua entregada), la estaca que lo lee a 20, 40 y 60 cm y la válvula que se cierra sola antes de los 60. Es la alerta del panel («Domingo 05:40, regar el cuartel 2») cumpliéndose. Su `fondo` pasó a `#0d1210`.
  - **Basal** («la animación más pulida, el navbar sticky con el logo animado»): el ensayo dejó los keyframes y sale de un modelo en basal.js (envolvente con velocidad cero en las dos puntas, edificio a una décima del suelo, aisladores con la diferencia), con el tiempo atado al scroll por un resorte de 140 ms para que la rueda no lo mueva a tirones; se suma la deformada punteada del mismo edificio sin aislación, las plumas del registro y la lectura en vivo (tiempo, suelo y último piso). La cabecera queda pegada bajo la barra: el suelo del logo se corre con la velocidad del scroll y los aisladores se inclinan mientras la losa queda quieta, y una raya azul sigue la sección que se lee.
  - **Ladera** («más impacto, fotos a todo el ancho, animaciones sutiles, contraste»): la tapa ocupa la pantalla, con «LADERA» gigante en tinta sobre la niebla y un velo de papel que la asegura; las fotos a sangre van de borde a borde y se abren del ancho de la página al de la pantalla al llegar; la cita de don Ruperto va sobre la bodega; los vinos, en un pliego oscuro. El problema de contraste era el texto que se fundía atado al scroll y se leía a medio fundir: ahora entra por tiempo (`data-aparece="tiempo"`, nuevo en barra.css).
  - **La Mesa de Rosa** («no me gusta»): tercera vuelta, la mesa puesta. Portada con la mesa a pantalla completa y la tarjeta del plato de mañana (rosa.js), una frase subrayada a mano en vez de los tres íconos, y la carta como el pedido: pizarra de cocinería con los días (`pedir_almuerzo`), el plato que se posa en un mantel a cuadros con su vapor y una comanda de papel, todo con `:has()`. Banquetería de noche, opiniones como citas grandes y el cuaderno de recetas de Rosa escrito a mano. La cotización perdió `toolautosubmit`, porque le escribe a una persona.
  - **Golpe**: el cierre es un video en bucle de una velada vista desde arriba, en blanco y negro. La foto anterior (`velada`) mostraba esvásticas en el costado del ring y se borró.
  - **Pelusa** («gifs, hogareño y cálido, más movido, mejor uso del color, scroll guiado como /nosotros, la historia del día de tu mascota»): el día del perro contado con el encaje de /nosotros: un cielo pegado detrás que va de la mañana a la noche (colores registrados con `@property` para que se fundan, el sol en arco, la casa que enciende la ventana) y un momento por pantalla (llegada, patio, almuerzo, siesta, baño y vuelta), cada uno con su gif, su hora y lo que dice alguien de la pandilla; un reloj pegado abajo marca la hora y deja saltar. Después de la noche, precios, pandilla, reglas y carnet, cada sección con su color. Su `fondo` pasó a `#ffd9b8`.
  - **Comunes:** barra.js suma los videos en bucle (`video[data-bucle]`: bajan a una pantalla de verse, corren solo a la vista y se funden sobre su foto quieta; con el movimiento reducido no bajan) y `--alto-barra`, para lo que se pega arriba. Los videos van en `public/grabados/bocetos/<slug>/`, donde el Worker los entrega por partes como pide Safari, y salen de Pexels y Mixkit (ver bocetos-fotos.md).
  - Verificado: lint; Chromium y WebKit a 390, 820 y 1440 px con y sin movimiento reducido, sin errores ni desborde; el encaje de Pelusa con la flecha (una pulsación, un momento) en los dos motores; `wrangler dev` sin bloqueos de la política de contenido y los videos corriendo en WebKit; Lighthouse en teléfono: accesibilidad y buenas prácticas en 100 en los seis, rendimiento 100 en Cauce, Basal, Golpe y Pelusa (Ladera y Rosa, en los pendientes). La rueda del mouse no se pudo probar en Chromium sin ventana (tampoco mueve /nosotros ahí): se confirma a mano.
- **2026-11-11.** Al usuario no le gustaron Nodo ni Kōen y pidió marcas nuevas desde cero para tecnológico y zen. Para los 18 que faltaban eligió inventar todo: nombre, rubro e identidad, sin usar los nombres que traía bocetos.js (Roble, Marea, Pinpón…). Pidió referencias de galerías de diseño, fotos de stock y animaciones «sin nada brusco, siempre con un inicio y un final continuo». Su «portada» es la tarjeta de cada estilo en el brief, que debe ir con su estilo y su marca.
- **2026-11-11, segunda sesión.** El usuario pidió seis páginas que no fueran zen ni tecnológico, así que la tanda 1 (Cauce y Kiri) sigue pendiente y se hicieron la tanda 2 entera y las dos primeras de la 3: Basal, Ladera, Iris, Quillay, Pelusa y Lucero, con sus fotos, sus tarjetas y sus entradas en bocetos.js (reemplazan a Roble, Marea, Andes Dental, Raíz, Pinpón y Disco Sur). Quedan para la tanda 3 Tablero, Destello y Cénit. Cambios respecto de las fichas: el `fondo` de Basal es `#ffffff`, porque la página es blanca y la niebla queda para sus bandas; la portada de Iris es una mujer probándose lentes en una óptica, porque la foto con la tabla de letras cortaba la cara; Ladera tiene una viticultora, Antonia Fuentealba; el patinador de Lucero da vueltas con `<animateMotion>` de SVG, que escala con el plano (con el movimiento reducido se cambia por uno quieto).
- **2026-11-11, misma sesión.** Al ver los seis, el usuario pidió más variedad de componentes: tenían un formato demasiado parecido (cabecera con logo, menú y botón; portada partida en texto y foto; rótulo, título y párrafo en cada sección; filas de tarjetas; contacto con datos a la izquierda y formulario a la derecha; pie con la marca gigante). Se rehizo cada uno desde su marca: Ladera tiene mancheta de diario, tapa centrada con el sumario debajo y un cupón de recorte; Iris pone la tabla de Snellen como portada, el equipo en una agenda semanal y la reserva como turnero de días y horas, y titula con preguntas; Quillay va con el logo al centro y el menú a los lados, portada centrada con foto panorámica, productos en lista de botica y pie como etiqueta de herbario; Pelusa tiene la portada en un bloque amarillo con el perro que habla, la pandilla clavada en un corcho y el formulario como carnet de ingreso; Lucero es un afiche centrado, con tablero de precios con puntos guía, la historia en fundas de disco y la reserva como entrada con talón; Basal queda como el corporativo clásico, con secciones numeradas y pie institucional en columnas.
- **2026-11-11, revisión de los seis.** Basal, Iris y Pelusa quedaron como estaban; del clínico le gustó mucho el desenfoque de las letras de distintos tamaños. Ladera suma fotos de sus vinos (una botella, una barrica y una copa, una por ficha). Quillay pidió una portada con más impacto, pensada para quien compra, con textos que lleguen y una presentación muy pulida de los jabones, con WebGL o un componente 3D: ahora es una vitrina donde el jabón elegido gira en 3D sobre su pedestal (quillay.js, WebGL propio sin dependencias, que arranca después de la carga y muestra la foto si no hay WebGL), con un selector de los tres jabones, su ficha y «Agregar al pedido», que deja el producto elegido en el formulario. Lucero no gustó ni en su orden ni en su estética y se rehízo: es la pista de noche, con fondo café oscuro, una cinta de cuatro franjas que cruza la página en curva y la foto dentro de un anillo de colores, y sigue el camino de quien llega por primera vez (la semana como cartel, tres pasos para empezar, la pista para grupos con su entrada y la historia en fundas de disco). Su `fondo` pasó a `#24140c` y las tarjetas de natural y retro se redibujaron con el jabón y la noche.
- **2026-11-11, tercera sesión.** El usuario pidió seis de una vez (Marfil, Ulmo, Remache, Parina, Tilde y Rampa), cada uno único y con algo nuevo que aportar al índice, personalidad marcada y animaciones con sentido. Se aprobó un plan con una pieza y un movimiento nuevos por boceto (anotados como «Lo nuevo» en cada ficha). Ulmo pasó a llamarse **Libar**, porque existe Los Ulmos, una empresa chilena de miel de ulmo y tiaca; Bar Marfil se mantuvo (lo más cercano es un café en Villarrica y una cervecería en Estación Central). barra.js suma `form[data-consulta]` para los formularios que solo consultan. Revisados con movimiento en Chromium y WebKit a 390 y 1440 px, sin desborde ni errores; faltan la pasada a 820 y 1024, la política de contenido con `wrangler dev` y Lighthouse (en Rampa, por el costo de la trama en CSS) antes del commit.
- **Lección de Nodo y Kōen.** Los dos eran una secuencia de secciones de plantilla: logos de clientes, cifras, planes, preguntas frecuentes, en un caso, y clases, horario, pases y reserva, en el otro. Cada boceto nuevo parte de una idea propia de su marca, y las secciones salen de esa idea, no de una lista.
- **2026-11-11, tanda 1.** Cauce y Kiri quedaron hechos, con sus fotos y sus tarjetas, y el abanico pasó a `['kiri', 'golpe', 'cauce']`. Al ver Cauce, el usuario dijo que le gustaba mucho y pidió más interacción o componentes 3D de su producto. Se sumó, sin librerías: el sensor como modelo 3D de caras de CSS que se mece, se gira al arrastrarlo o con las flechas, se despieza con el scroll y enciende la pieza que se señala en la lista; un cursor que lee la gráfica del panel, y una calculadora de ahorro de agua (`calcular_ahorro_agua`, con `toolautosubmit`). Todo eso vive en `cauce.js`, que va como módulo para no chocar con las constantes de barra.js.
- **Pendiente de la tanda 1.** El borrado de `nodo.html`, `koen.html`, `public/image/bocetos/nodo/` y `koen/`, y de sus tablas en bocetos-fotos.md, no se aprobó en la sesión: queda para que el usuario lo haga o lo autorice. El WebKit de Playwright en Windows aplana `transform-style: preserve-3d` (también en un cubo mínimo), así que el sensor 3D se confirma en un iPhone o iPad real. En S, la barra de los bocetos puede dar un CLS de hasta 0,05: barra.js le agrega el formulario de calificar después del primer cuadro, según cuánto tarde la página en pintar. Es de la barra común, no de un boceto.
- **2026-11-11, tandas 3 y 4.** El usuario pidió Tablero, Destello, Cénit, Sótano, Rumbo y Foco, cada uno único, con personalidad marcada y animaciones que aporten. Quedaron hechos, con sus fotos, sus tarjetas y sus entradas en bocetos.js (reemplazan a Garabato, Brillo, Helio, Bloque, Grilla y Forma). Foco pasó a llamarse **Bisagra**: ya existe Tienda Foco, del mismo rubro. Cada página sale de su idea y sus piezas no repiten las de otros bocetos:
  - **Tablero:** la cabecera son los turnos del menú, cada uno con una figura, y el horario de hoy. En la portada, las figuras Memphis flotan sueltas y, al bajar, caen cada una en su casilla de un tablero; dos dados de CSS 3D giran. Siguen el reglamento de la caja, la ludoteca como estante de lomos filtrable con `:has()` (`filtrar_juegos`), la carta como hoja de puntaje, la llave del torneo que se dibuja y termina en la foto del campeón, la reserva con fichas de colores y el pie como dorso de la caja.
  - **Destello:** la cabecera es el dial de modos de la cámara. La portada es una compacta plateada con la foto en su pantallita y un disparador que dispara el flash y revela la foto siguiente. Las fechas son dígitos de siete segmentos en SVG. Siguen los blísteres colgados en un tablero perforado, la revisión como una batería que se carga, las copias que salen del sobre de revelado, el certificado de garantía, la venta como menú de la pantalla LCD (`tasar_camara`) y el pie como tarjeta de memoria.
  - **Cénit:** la cabecera son las coordenadas, con la marca al centro. En la portada, el cielo gira alrededor del polo sur celeste con sus estelas de degradé cónico, sobre los cerros. Siguen un planisferio que gira con la hora elegida, las experiencias en vidrio neutro con la duración como exposición, el camino de la luz por el espejo del telescopio, el perfil de altura desde La Serena, la reserva por fase de la luna y el pie como horizonte con sus coordenadas.
  - **Sótano:** una columna fija con el nombre apilado. La función de hoy va en Times gigante, la cartelera es una tabla cuyas filas se invierten (en M y S, cada función pasa a ser un bloque), y siguen los ciclos en lista cruda, el plano de las 80 butacas, el precio de socio en Times gigante, un formulario con bordes del navegador y un pie de texto crudo. Las fotos entran con un corte de cortina, salvo la de la portada.
  - **Rumbo:** la grilla de doce columnas a la vista. La cabecera es el directorio del edificio. En la portada, una flecha gigante entra girando y, al bajar, se vuelve hacia abajo. Cada sección es un piso con su número pegado al costado, como en un ascensor. Siguen el método como letrero negro con pictogramas, los proyectos con ficha, el sistema como página de manual, los clientes en texto, el contacto con campos numerados y un pie de «volver al inicio».
  - **Bisagra:** la cabecera es una regla de cinco celdas. En la portada, el logo se arma en lámpara al bajar y un interruptor la enciende. Siguen la colección con el dibujo de las formas de cada lámpara, el taller como afiche de tres bloques, el configurador de colores con `:has()` (`configurar_lampara`) y el pedido.
- **Letras de respaldo.** Destello, Tablero y Cénit llevan un respaldo de Arial con `size-adjust` medido contra su letra (Syne, 148 %; Rubik, 103 y 105 %; Unbounded, 129 %; Sora, 110 %). Sin él, el título cambiaba de líneas al llegar la letra y movía la página: en Destello, el CLS era de 0,08 y el rendimiento de 95. Las fotos que esperan su turno en la pantallita de Destello no bajan hasta el `load`. Lighthouse en teléfono, en las seis: Performance, Accessibility, Best Practices y Agentic Search en 100; SEO en 66, por el `noindex`. Rumbo marca a veces el 0,048 de CLS de la barra (ver los pendientes).
- **Por confirmar en un iPhone o iPad real:** los dados 3D de Tablero (el WebKit de Playwright en Windows aplana `preserve-3d`) y el giro de las formas de Bisagra con el scroll, que en Safari 18 se arma una vez al cargar.
- **2026-11-11, segunda vuelta de ocho.** El usuario revisó Sótano, Lucero, Rumbo, Quillay, Cénit, Libar, Remache y Marfil y pidió investigar cada estilo en Awwwards y variar el formato de la información y de los formularios entre páginas. Lo que pidió y lo que se hizo:
  - **Sótano** (la que menos gustó): otra iteración. Ahora es la sala a oscuras: la cola de inicio con la función de hoy, la cartelera donde el cursor es el proyector, ciclos con sombra dura, el plano de butacas con corchetes y los créditos finales como pie.
  - **Lucero** (gustó el reenfoque): las líneas se cortaban. La cinta de 112 px se salía de su cuadro SVG y la sección la recortaba; ahora tiene margen y `overflow: visible`, y la línea de los pasos va de círculo a círculo. La marca entra y el pie se despide como el logotipo de Volutus (`lucero.js`). Vinilos y «gifs» con animación al pasar el cursor; el formulario se desbordaba (columnas `1fr` que el campo de fecha ensanchaba) y ya no.
  - **Rumbo:** no se entendía qué vendía. Ahora lo dice el título, cuelga un letrero real al lado y un plano permite trazar una ruta. Animaciones al pasar el cursor en todo.
  - **Quillay** (muy buena personalidad): los jabones 3D son distintos y giran sobre una esquina; el resto de la página se rehízo.
  - **Cénit:** la portada es un video real de la Vía Láctea, es la página con más interacción (retícula, ocular para enfocar) y el pie amanece.
  - **Libar** (lo odió, «muy IA»): enfoque totalmente distinto, la miel que cae lento.
  - **Remache** (buen camino): animaciones e íconos más reales, barra y pie nuevos.
  - **Marfil:** rehecho entero, más pulido y como experiencia.
  - Los «gifs» son videos de [Mixkit](https://mixkit.co/license/#videoFree) en bucle, como los de Golpe, en `public/grabados/bocetos/<slug>/`. Instrument Serif se bajó para Libar; la tarjeta de Libar se redibujó y su `fondo` pasó a `#1c1308`. Se borraron las fotos que dejaron de usarse. Revisado con movimiento en Chromium y WebKit a 1440 y 390 px, sin desborde lateral ni errores en la consola; faltan 820 y 1024, `wrangler dev` y Lighthouse antes del commit.
- **2026-11-11, segunda vuelta de siete.** El usuario comentó Bisagra, Tablero, Destello, Parina, Prensa Tilde, Rampa e Iris, con el mismo pedido de buscar en Awwwards y variar los formatos. Referencias: Halcyon y Yalamps (iluminación con modo día y noche), Memphis Milano, el sitio de Lando Norris (entrada y recorrido guiado), High Mountains (mapa 3D de caminatas) y VeilHymn (video con semitono). Lo que se hizo:
  - **Bisagra** («se nota demasiado la Bauhaus»; modo día y noche, mejores imágenes e interacción, logo): marca nueva. El logo es una «B» hecha con una bisagra, cuyas hojas se abren al pasar y se encienden de noche. Letras Instrument Serif, DM Sans y Plex Mono para las fichas; paleta de papel, tinta y arcilla, sin primarios. Un interruptor fijo (una cápsula angosta, por las franjas de iOS) apaga la página y enciende cada lámpara sobre su propia foto: cada `.foco` lleva en `--x`/`--y` dónde está la ampolleta y el CSS oscurece lo lejano y suma el brillo y el charco de luz. Parte de noche si en Santiago son más de las 20:00 (bisagra.js, que también muestra la hora). En la portada, de noche, la luz sigue al cursor con un resorte. La colección es una lista con la foto al lado que cambia al pasar, el taller deja la foto pegada mientras pasan los pasos, el configurador dobla el brazo de la Codo en sus tres bisagras y elige color y temperatura de luz (`data-consulta`; barra.js le responde al agente), y el pedido es una frase que se completa. Fotos nuevas y tarjeta redibujada (de noche al pasar); `fondo` `#f2eee7`.
  - **Tablero** («lo odio, que sea legible»): rehecho con la regla de Memphis Milano: texto negro sobre color liso, a 19 px o más, y los patrones solo en franjas. La portada es un afiche amarillo con la foto, los pasos son tres casillas que una ficha recorre al bajar, la ludoteca es una tabla que se filtra (`data-consulta`: se borró tablero.js), la carta es un cartón de bingo y los torneos, fechas grandes.
  - **Destello** (entrada, figura 3D de fondo, experiencia guiada, ancho de página, navbar pegada): una compacta de cromo en 3D (destello.js, WebGL propio con formas a distancia) vive detrás de la página: llega girando y dispara al cargar, y cada sección le da una pose (`data-pose`) entre las que viaja con curva suave; saca el zoom en la vitrina, muestra su pantalla en la revisión y dispara al entrar a la galería. En teléfonos sale de cuadro después de la portada y vuelve solo para la galería. La cápsula de arriba se queda pegada y su pantallita dice la sección (`data-nombre`). La vitrina y la galería se ensanchan al entrar y se angostan al salir. El pie y el contenido se mantienen.
  - **Parina:** el flamenco del logo se redibujó (cuerpo de rombo con su ala, cuello en S, una pata) y la «i» lleva un rombo por punto; también en su tarjeta. Las caminatas tienen un mapa en relieve (parina.js, WebGL propio): el altiplano de Putre como maqueta, con los lados tejidos en franjas, las cuatro rutas con sus paradas y una cámara que viaja a la elegida; cada ruta suma su lista de paradas con hora. Nueva sección «Un día en el cerro», con cinco fotos de caminatas por un sendero que se dibuja al bajar.
  - **Prensa Tilde:** otra iteración, el pliego de prueba: el nombre enorme en dos pasadas (azul y bermellón) que entran en registro, fotos a dos tintas, notas de corrección al margen, muestrario de tipos, invitaciones en abanico, extendidas de tinta, la barra de color como pasos, el presupuesto como orden de trabajo junto a la prueba en vivo (tilde.js sin cambios) y el colofón como pie.
  - **Rampa** (más movimiento, videos y gifs con la trama, puntos más chicos): el punto bajó de 4 a 6 px a 2,4 a 3,4 px; cinco «gifs» de Mixkit pasan por la misma trama (en gris y con la curva apretada para que la figura se lea), la secuencia del mes va cuadro a cuadro con su folioscopio, las letras del título se mecen, los recortes de los jueves flotan a distinta velocidad y las fotos vuelven a pasar por la fotocopiadora al pasar el cursor.
  - **Iris:** donde el navegador ata animaciones al scroll, lo que está en el tercio de arriba o el de abajo de la pantalla se ve un poco borroso y se aclara al llegar al centro.
  - **WebGL y rendimiento:** la cámara de Destello y el mapa de Parina no se montan si el navegador dibuja por software (SwiftShader, llvmpipe): ahí costarían cada cuadro en el hilo principal. Es lo que pasa en el Chrome sin ventana de Lighthouse, que así mide la página sin ellos; con tarjeta de video se ven. El mapa calcula sus normales de la grilla de alturas, no del terreno, y la cámara arranca cuando el navegador está libre.
  - Revisado: lint; Chromium y WebKit a 390, 820, 1024 y 1440 px, con y sin movimiento reducido, sin desborde lateral ni errores. Lighthouse en teléfono sobre `pnpm dev` (sin compresión ni minificado): accesibilidad y buenas prácticas en 100 en las seis; rendimiento entre 94 y 99 (Parina, 94, por el LCP de su portada). Faltan `wrangler dev` con el build, Lighthouse ahí y confirmar en un iPhone el lienzo fijo de Destello y la cápsula de Bisagra.

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
- `--curva` no se redefine dentro de `[data-aparece]` con `var(--curva)`: es una referencia circular que deja la variable inválida y, con ella, toda animación que la use dentro de ese elemento. Si la marca tiene su curva, se declara una vez en `:root`.

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
- `toolautosubmit` solo en los que no envían nada a nadie (el configurador de Bisagra, el filtro de Tablero). Los demás los rellena el agente y los envía la persona.
- Los que solo consultan algo de la página (filtran, configuran, buscan) llevan `data-consulta` en vez de `data-muestra`, y lo que muestran, `data-respuesta`: barra.js le responde al agente el texto de las respuestas visibles. Lo usa el rastreador de lotes de Libar.
- Letra de 16 px o más en los campos, etiquetas reales y foco visible.
- Correos y teléfonos van como texto, sin `mailto:` ni `tel:`.

### Fotos

- Solo fotos de [Unsplash](https://unsplash.com/license) con su licencia gratuita, nunca Unsplash+. Se comprueba en la página de cada foto antes de usarla.
- Unsplash pide pasar un desafío de navegador (Anubis) que el Chromium de Playwright sin ventana no pasa. Se busca con ventana (puede abrirse fuera de la pantalla, `--window-position=-3000,0`) en `unsplash.com/s/photos/<consulta>?license=free`, y de ahí se leen los `photo-<id>` de las miniaturas: con ese filtro y en `images.unsplash.com` (no en `plus.unsplash.com`) son de la licencia gratuita. Una hoja de miniaturas numeradas sirve para elegir sin abrir cada una.
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
- Ningún boceto repite la forma de otro en sus piezas comunes: cabecera, portada, encabezados de sección, listas de cosas (servicios, productos, equipo), formulario y pie. Antes de construir, se mira cómo resolvieron esas piezas los bocetos ya hechos y se elige otra forma que salga de la marca (un cupón, un turnero, una entrada, un carnet; una mancheta, un afiche, una etiqueta). Una sola página puede tener la cabecera «logo, menú y botón» y una sola el pie con la marca gigante.
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
| Bisagra | [Tecnolumen](https://tecnolumen.com) | Lámparas de la Bauhaus |
| Marfil | [American Bar del Savoy](https://www.thesavoylondon.com/restaurants-and-bars/american-bar) y [Tengile](https://tengilemalamala.com) | Bar art déco; la noche como experiencia |
| Libar | [Diaspora Co.](https://www.diasporaco.com) y [Meadlight](https://meadlight.com/en) | Origen como historia; el producto con su física |
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
- **Idea:** el enfoque. La portada es una tabla de Snellen tipográfica (letras que achican fila por fila) y es el índice de servicios. Los títulos son preguntas («¿Quién te atiende?»), el equipo va en una agenda semanal y la reserva es un turnero de días y horas.
- **Movimiento:** las filas de la tabla se enfocan una tras otra al cargar, de la letra más grande a la más chica (de `blur` a nítido, sin bajar la opacidad: el usuario lo aprobó). Las secciones se aclaran al llegar.
- **Letras:** Plus Jakarta Sans.
- **Paleta:** blanco `#ffffff`, tinta `#0f1c2b`, azul `#1e6fd9`, menta `#e6f5f1`, gris `#5b6b7a`. `fondo`: `#ffffff`.
- **Secciones:** portada; la tabla de Snellen como índice (consulta, cirugía láser, lentes de contacto, niños, óptica); el equipo médico, con nombre, especialidad y foto; tu primera consulta, paso a paso y con lo que dura; convenios (Fonasa, isapres) y precios de referencia; dónde estamos y horarios; agendar hora (formulario: nombre, RUT, correo, especialidad, previsión, fecha).
- **Fotos:** consulta oftalmológica, persona probándose lentes, montura sobre una mesa clara, doctora conversando con un paciente, sala de espera luminosa. Nada de ojos en primerísimo plano.
- **Página de inspiración:** [Warby Parker](https://www.warbyparker.com), del mismo rubro: examen de la vista y óptica. Se toma la claridad, el tono cercano y cómo agendar y comprar quedan a un paso. También: [One Medical](https://www.onemedical.com), por la confianza sin frialdad y los médicos con nombre.
- **Tarjeta:** blanco, tres filas de Snellen («E», «F P», «T O Z») que se enfocan al pasar el cursor y el logo: un anillo azul. Sello: el anillo.

### Quillay · natural

- **Slug y marca:** `quillay` · Quillay.
- **Rubro:** jabones y cosmética de plantas nativas (quillay, maqui, rosa mosqueta). Lolol, Valle de Colchagua.
- **Idea:** luz entre hojas. Una sombra moteada de hojas se mece sobre la portada, que es una vitrina: el jabón elegido gira en 3D (WebGL propio, `quillay.js`) apoyado en una esquina sobre un pedestal de greda, junto a un selector de los tres jabones con su ficha, su precio y «Agregar al pedido». Los tres son distintos: la barra de avena, larga y redondeada, con su sello hundido; el cubo de maqui y arcilla, de cantos vivos y en dos capas con una veta; la pastilla cuadrada del champú, color rosa mosqueta, con semillas.
- **Movimiento:** el jabón gira sobre su esquina como un trompo (la diagonal casi vertical, una vuelta cada 9 s y un cabeceo leve), se inclina hacia el cursor con un resorte y da una vuelta más al cambiar de jabón. La sombra de hojas (SVG) se mece de ida y vuelta, muy lenta. La planta elegida se dibuja a línea en su lámina; las barras de la repisa se secan al bajar; lo que se marca en el pedido cae en su lugar de la caja.
- **Letras:** Young Serif (títulos) y Figtree (texto).
- **Paleta:** crema `#f0eadb`, hoja `#5f6f45`, tierra `#a86b3c`, arcilla `#d7b89a`, tinta `#2b2a22`. `fondo`: `#f0eadb`.
- **Secciones:** portada; las tres plantas como índice de nombres grandes con su lámina al lado; del bosque al jabón, con tres pasos y la repisa de las seis semanas de curado (una fila de barras por semana, de húmedas a secas, con el peso); «¿Cuál es para ti?», una guía por lo que se busca (`elegir_producto`, con `toolautosubmit` y `data-consulta`); una barra de 110 g cortada en gramos; arma tu caja (`armar_caja`: cuatro lugares que se llenan con lo que se marca y un papel de regalo); el pie como etiqueta de papel con su sello redondo.
- **Fotos:** jabones artesanales cortados, hojas a contraluz, manos con espuma o greda, frascos de vidrio ámbar, ramas de rosa mosqueta.
- **Página de inspiración:** [Aesop](https://www.aesop.com). Se toma la botánica sin cliché, los ingredientes contados con precisión, los tonos de tierra y la tienda tranquila. También: [Grown Alchemist](https://grownalchemist.com).
- **Tarjeta:** una forma de tierra, una rama de quillay dibujada a línea, el jabón con su sello hundido y «quillay» en Young Serif. Al pasar el cursor, la rama se mece y el jabón se levanta. Sello: la hoja.

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
- **Idea:** una noche de pista de los setenta. El fondo es la pista a oscuras, una cinta de cuatro franjas cruza la página en curva, las letras son gruesas y redondas y pasa la luz de la bola. La página sigue el camino de quien llega por primera vez. (La primera versión, clara y con arcos, no gustó ni en su orden ni en su estética.)
- **Movimiento:** la cinta de franjas se mece apenas y los rayos de la bola giran detrás de la foto, una vuelta por minuto. Las luces de la bola cruzan la portada despacio, como manchas suaves de luz cálida. Un patinador recorre la pista ovalada (el dibujo del plano) en un bucle sin costura. Como el logotipo de Volutus (`ola.js`), la marca entra escribiéndose: cuatro franjas llegan desde fuera de la pantalla, cruzan «Lucero», las letras aparecen al paso de la cola y se enrollan en un remolino; en el pie, la cinta se va por la derecha y el saludo aparece a su paso (`lucero.js`, como módulo). Al pasar el cursor, el vinilo sube de su funda y gira, la funda se ladea y su dibujo avanza un período; los «gifs» (la patinadora y la bola, videos en bucle) recuperan el color y se ladean.
- **Letras:** Shrikhand (títulos) y Josefin Sans (texto).
- **Paleta:** noche `#24140c`, pista `#3a2216`, crema `#f3e1bf`, naranja `#e8742a`, mostaza `#e0a526`, café `#5a3520`, rosa `#d9677a`. `fondo`: `#24140c`.
- **Secciones:** portada (qué es y qué hay este viernes); la semana como cartel de concierto; «¿Primera vez sobre ruedas?» en tres pasos (arrendar patines con sus tallas, aprender un lunes, volver el viernes); la pista para grupos, con el plano y la reserva como entrada con talón (formulario); la historia desde 1977, en fundas de disco.
- **Fotos:** patines de cuatro ruedas retro, bola de disco, gente patinando en una pista, luces de colores cálidos en una pista oscura.
- **Página de inspiración:** [Moxi](https://www.moxiskates.com), patines de cuatro ruedas. Se toma la energía, los patines como objeto de deseo y la comunidad de la pista. La paleta y las letras se van a los setenta cálidos de la ficha, no a sus colores caramelo. También: [Fonts In Use](https://fontsinuse.com), buscando «1970s», para las letras y la gráfica de discos de esos años.
- **Tarjeta:** la noche, la cinta de franjas, «Lucero» en Shrikhand y el patín dentro de su anillo de colores. Al pasar el cursor, la cinta se mece y el anillo gira un poco. Sello: una estrella de cuatro puntas.

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
- **Tarjeta:** el patrón Memphis, un dado y «tablero» en Rubik. Al pasar el cursor, los garabatos se desplazan. Sello: el dado.
- **Sin JavaScript propio:** el filtro es CSS y al agente le responde barra.js (`data-consulta`) con los juegos que quedan a la vista.

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
- **Usa** `destello.js`, como módulo: el disparador de la cámara de la portada (foto siguiente, flash y revelado). Sin JavaScript, el botón no aparece y se ve la primera foto.

### Cénit · futurista

- **Slug y marca:** `cenit` · Cénit.
- **Rubro:** observatorio turístico y astroturismo, con domo propio y telescopio de 16 pulgadas. Pisco Elqui, Valle de Elqui.
- **Idea:** el cielo en exposición larga, y que se pueda mirar. La portada es un video real de la Vía Láctea sobre un valle entre cerros, con una retícula de telescopio que sigue al cursor y lee hacia dónde apunta (azimut y altura). Es la página con más interacción: el planisferio que gira con la hora, el ocular donde uno enfoca Saturno, la Luna, Omega Centauri o la Nebulosa de Carina con una perilla, y la reserva por luna. Lo futurista está en la luz y en los degradés de la noche, no en el neón.
- **Movimiento:** el video entra fundiéndose sobre su cuadro quieto; la retícula sigue al cursor con un resorte corto y el cielo se corre apenas al revés (`cenit.js`, como módulo, que también mide el foco del ocular). Los paneles de datos son de vidrio neutro (blanco, `saturate` de 1,2 como máximo, con su `-webkit-`) y entran con un fundido. El pie amanece: al llegar al final, el alba sube detrás de los cerros, atada al scroll.
- **Letras:** Unbounded (títulos) y Sora (texto).
- **Paleta:** noche `#0b0c1e`, índigo `#1b1f4a`, polvo `#8d90b8`, luz `#e9e8ff`, blanco `#ffffff`. `fondo`: `#0b0c1e`.
- **Secciones:** portada; la noche de esta semana (fase de la luna, hora en que oscurece y qué se ve, con datos de muestra rotulados como tales); las experiencias (observación guiada, astrofotografía, domo privado), con duración y precio; el telescopio, en ficha técnica, y su ocular (`mirar_por_el_telescopio`, con `toolautosubmit` y `data-consulta`); cómo llegar y qué llevar (abrigo, linterna roja); reservar (formulario: fecha, personas, experiencia); el pie con la despedida al alba, cuatro columnas (dónde, cuándo, contacto y la próxima luna nueva) y las coordenadas.
- **Fotos:** Vía Láctea sobre el desierto o los cerros, telescopio dentro de un domo, persona mirando el cielo estrellado, domos de observatorio al atardecer.
- **Página de inspiración:** [Apple Vision Pro](https://www.apple.com/apple-vision-pro/). Se toma la luz sobre negro, los degradés de la noche, el vidrio neutro y cómo cada sección se revela con el scroll. También: [ESO](https://www.eso.org/public/), por la fotografía del cielo de Chile, y [Lusion](https://lusion.co), por la profundidad.
- **Tarjeta:** degradé de noche con estelas circulares y «CÉNIT» en Unbounded. Al pasar el cursor, las estelas giran un poco. Sello: una estrella de ocho puntas.

### Sótano · brutalista

- **Slug y marca:** `sotano` · Sótano.
- **Rubro:** cine club y sala independiente de 80 butacas, con proyector de 35 mm. Barrio Brasil, Santiago.
- **Idea:** la sala a oscuras. La función de hoy aparece en la cola de inicio de una película (el círculo con su cruz y el barrido que gira, con la hora al centro). En la cartelera, de filas enormes en Times, el cursor es el proyector: la fila se apaga y un haz de luz la recorre siguiendo la mano (`sotano.js`, como módulo). Bordes negros gruesos, enlaces azules, sombras duras y fotos en blanco y negro duro. (La primera versión, de columna fija y tabla, fue la que menos gustó.)
- **Movimiento:** el barrido de la cola gira a velocidad pareja, una vuelta cada 4 s. Al pasar el cursor, las filas se apagan con su haz, los ciclos se levantan sobre su sombra dura y las fotos de la sala se vuelven negativo. Las fotos aparecen con un corte de cortina, sin fundido; los créditos del pie suben con el scroll.
- **Letras:** Times, la del sistema, e IBM Plex Mono para horarios y formatos.
- **Paleta:** blanco `#ffffff`, negro `#000000`, gris `#d9d9d4`, azul enlace `#0000ee`, rojo `#ff0000` (solo «agotado»). `fondo`: `#ffffff`.
- **Secciones:** cabecera negra de una línea; portada (la función de hoy en Times enorme y la cola de inicio); la cartelera de la semana; ciclos del mes en bloques con sombra dura; la sala (ficha cruda y tres fotos); tu butaca: el plano de las 80 escrito con corchetes, `[ ]` libre, `[x]` la tuya y `[■]` ocupada (`reservar_butaca`); socios (precio en Times gigante); el pie son los créditos finales, con «Fin» y el formulario para recibir la cartelera (`recibir_cartelera`).
- **Fotos:** sala con el haz del proyector, butaca numerada, proyector, rollos de película. Todas con `sat=-100` y contraste alto.
- **Página de inspiración:** [Anthology Film Archives](https://www.anthologyfilmarchives.org), un cine independiente de Nueva York. Se toma la cartelera como lista cruda, densa y sin adornos, con la programación como protagonista. También: [Yale School of Art](https://art.yale.edu) y la galería [Brutalist Websites](https://brutalistwebsites.com).
- **Tarjeta:** una tabla cruda con «SÓTANO / VIE 21:00 / 35MM» en Times y bordes negros. Al pasar el cursor, una fila se invierte. Sello: «[x]».

### Rumbo · suizo / gráfico

- **Slug y marca:** `rumbo` · Rumbo.
- **Rubro:** señalética y orientación para hospitales, campus y aeropuertos. Santiago.
- **Idea:** la página es un edificio señalizado y dice sin rodeos qué se vende: «Señalética para que nadie se pierda», junto a un letrero colgante de verdad (Urgencias ←, Rayos X ↑, Cafetería →, Estacionamiento ↓). Al medio, un plano de hospital donde se elige adónde ir y la ruta roja se dibuja con los letreros de su camino. La grilla de doce columnas se ve. (La primera versión, con la flecha gigante y los números de piso, no dejaba claro qué hacía la empresa.)
- **Movimiento:** al cargar, las filas del letrero llegan una tras otra y el letrero se mece muy poco. Todo responde a la mano con el gesto del oficio: cada flecha se corre hacia donde apunta, el letrero colgante se mece y se calma, el directorio enciende otro piso, el punto del mapa crece, la línea del piso se termina de pintar, los pictogramas se invierten, las estaciones del método se encienden y el hombre del letrero de salida echa a correr. La ruta del plano se dibuja con `stroke-dashoffset`.
- **Letras:** Archivo.
- **Paleta:** blanco `#ffffff`, negro `#111111`, rojo `#e3001b`, gris `#ececec`. `fondo`: `#ffffff`.
- **Secciones:** cabecera como directorio del edificio; portada con el letrero y cuatro cifras; «¿Adónde vas?», el plano con la ruta (`trazar_ruta`, con `toolautosubmit` y `data-consulta`); las cinco piezas que fabrican, cada una dibujada; proyectos con el resultado medido (−38 % de preguntas en el mesón); el método como línea de metro; clientes, en texto; cotizar, con el tipo de edificio en pictogramas (`cotizar_senaletica`); el pie es el letrero verde de salida.
- **Fotos:** pasillo de hospital con letreros, número de piso en una escalera, letrero colgante de un aeropuerto.
- **Página de inspiración:** [Mijksenaar](https://www.mijksenaar.com), del mismo rubro: la señalética de Schiphol, entre otros. Se toma cómo cuenta cada proyecto, los pictogramas y la promesa de que nadie se pierda. La grilla y la letra se van a lo suizo con las otras dos. También: [Swissted](https://www.swissted.com), por la grilla y el rojo, y [Standards Manual](https://standardsmanual.com), por el manual de señalética como pieza.
- **Tarjeta:** grilla visible, un bloque rojo, una flecha grande y «Rumbo» en Archivo. Al pasar el cursor, la flecha gira 90°. Sello: la flecha.

### Bisagra · Bauhaus

- **Slug y marca:** `bisagra` · Bisagra. Se iba a llamar Foco, pero ya existe Tienda Foco, que vende veladores de diseño hechos a mano.
- **Rubro:** lámparas de diseño hechas a mano. Taller en San Joaquín, Santiago.
- **Idea:** círculo, cuadrado y triángulo, una línea y una bisagra forman el logo y, al bajar, se reacomodan en una lámpara: la pantalla es el círculo, la base el cuadrado, el brazo la línea y el triángulo, la luz.
- **Movimiento:** las formas se trasladan y giran a su lugar con el scroll y curva suave (donde el navegador no ata animaciones al scroll, se arman una vez al cargar). Un interruptor enciende la lámpara: el triángulo se vuelve luz y la portada se entibia. En el configurador, el color cambia con una transición corta.
- **Letras:** Jost.
- **Paleta:** crema `#f1ead8`, rojo `#d7261e`, azul `#1f4aa8`, amarillo `#f2b705`, negro `#111111`. `fondo`: `#f1ead8`.
- **Secciones:** portada; la colección (cuatro lámparas, cada una con su foto y el dibujo de sus formas); el taller (torneado, plegado, pintura en polvo); a medida: un configurador de color de pantalla y de base con radios y `:has()`, sin JavaScript (formulario `configurar_lampara`, con `toolautosubmit`, que no envía nada); pedido (formulario: lámpara, colores, correo).
- **Fotos:** lámpara de escritorio sobre una mesa, lámpara colgante, taller de metal, interior con una lámpara encendida.
- **Página de inspiración:** [Tecnolumen](https://tecnolumen.com), que fabrica las lámparas clásicas de la Bauhaus. Se toma cada lámpara como objeto aislado, con su historia y su ficha. También: [Stiftung Bauhaus Dessau](https://bauhaus-dessau.de), por la geometría y los colores primarios, y [Vitra](https://www.vitra.com).
- **Tarjeta:** crema con un círculo rojo, un cuadrado azul, un triángulo amarillo, la línea con su bisagra y «bisagra» en Jost. Al pasar el cursor, las formas se arman en lámpara. Sello: el círculo.
- **Usa** `bisagra.js`, como módulo: solo le responde al agente del configurador la combinación y su precio. Los colores cambian con CSS.

### Bar Marfil · art déco

- **Slug y marca:** `marfil` · Bar Marfil.
- **Rubro:** coctelería y salón de baile desde 1928. Cerro Alegre, Valparaíso.
- **Idea:** ir a Marfil es una noche entera. Al llegar se abren las puertas del ascensor de 1928 sobre la barra en video; la noche se cuenta hora por hora (19:00 el ascensor, 19:30 el primer cóctel, 21:00 la cena, 22:30 la orquesta, 01:30 el último baile) junto a un reloj déco que avanza con el scroll; la carta son copas dibujadas a línea que se llenan; la reserva es una tarjeta. Oro solo en líneas finas sobre verde botella. (La primera versión, con el dial del ascensor y el plano del salón, no gustó: se pidió algo más pulido y que se viera como una experiencia.)
- **Movimiento:** las puertas se abren hacia los lados y el abanico de la portada se traza desde el centro hacia afuera (`stroke-dashoffset`). Las manecillas del reloj avanzan de las 19:00 a la 01:30 atadas al scroll (en Safari 18 queda en las siete). Las fotos se abren desde el eje, como dos puertas. Al pasar el cursor, las copas se llenan y reciben su adorno, y las invitaciones se levantan y se les abre el filete.
- **Letras:** Cormorant Garamond (títulos y texto), Poiret One (la marca y las horas) y Josefin Sans (rótulos). Bodoni Moda quedó fuera porque la usa Ónix.
- **Paleta:** botella `#0f1f1c`, oro `#c9a24a`, marfil `#f1e9d6`, negro `#0b0b0b`. `fondo`: `#0f1f1c`.
- **Secciones:** portada con la barra en video y el marco déco; una noche en Marfil, hora por hora, con el reloj; la carta (seis cócteles, cada uno en su copa); las noches (jueves jazz, viernes piano, sábado swing) como invitaciones; el salón privado a sangre; reservar (`reservar_mesa`: la noche, la hora, personas, ocasión); el pie verde con el abanico y tres columnas.
- **Fotos:** cócteles en copa coupé, barra con botellas iluminadas, interior déco con lámparas, músicos de jazz.
- **Página de inspiración:** [American Bar del Savoy](https://www.thesavoylondon.com/restaurants-and-bars/american-bar), un bar art déco de Londres. Se toma la carta como pieza central, la elegancia simétrica y el ritual del cóctel. También: [Bemelmans Bar](https://www.rosewoodhotels.com/en/the-carlyle-new-york/dining/bemelmans-bar), por el oro y la luz baja, y [Claridge's](https://www.maybourne.com/en/hotels/claridges).
- **Página de inspiración (segunda vuelta):** de Awwwards, [Tengile MalaMala](https://tengilemalamala.com) y [Mùn Rooftop](https://munrooftoprome.com): la experiencia como recorrido, foto y video a sangre, una serif fina y grande y un pie de un solo color.
- **Tarjeta:** fondo botella con el abanico de rayos y «MARFIL» en Poiret One. Al pasar el cursor, el abanico se abre hacia los lados. Sello: el abanico.

### Libar · artesanal

- **Slug y marca:** `libar` · Libar (lo que hace la abeja con la flor). Se iba a llamar Ulmo, pero ya existe Los Ulmos, una empresa chilena de miel de ulmo y tiaca.
- **Rubro:** miel cruda de ulmo, quillay y tiaca, de colmenas propias. Curacautín, Región de La Araucanía.
- **Idea:** la miel buena cae lento. La portada es miel cayendo de una cuchara (video en bucle); los bordes de las secciones gotean despacio, sin que la gota caiga; los frascos se ladean al pasar el cursor y su miel queda horizontal; en la prueba del frasco se da vuelta el frasco y la burbuja sube a la velocidad de cada miel, y el pedido se escribe como una frase con blancos. (La primera versión, de papel kraft, sellos y notas a mano, se sintió hecha por una IA y sin personalidad.)
- **Movimiento:** todo frena largo, como algo espeso (`cubic-bezier(0.45, 0, 0.2, 1)`). Cada gota de los bordes se estira y se recoge de ida y vuelta, a su ritmo; la del logo también. Al ladearse un frasco, su miel gira lo mismo al revés. La burbuja sube en 9 s en la de ulmo, 5 s en la de quillay y 3 s en la de tiaca, después de que el frasco gira. Los tramos del calendario se llenan de izquierda a derecha.
- **Letras:** Instrument Serif con su itálica (títulos; bajada de Google Fonts, OFL) y DM Sans (texto).
- **Paleta:** noche `#1c1308`, miel `#e0a12a`, oro `#f2c45a`, crema `#f7eedb`, papel `#fbf6ea`, café `#3a2814`; las mieles: ulmo `#efe1b8`, quillay `#ebbd5c`, tiaca `#d4912a`. `fondo`: `#1c1308`.
- **Secciones:** portada con la cuchara; las tres mieles en sus frascos (color Pfund, sabor, cosecha, precio); la prueba del frasco; las colmenas se mudan con las flores (calendario de octubre a marzo y el video de las abejas); el apicultor y su frase; el pedido como frase (`pedir_miel`); el pie de miel oscura, con su borde que gotea.
- **Fotos y videos:** cuchara de miel (video), abejas entrando a la colmena (video), apicultor con traje.
- **Página de inspiración:** [Diaspora Co.](https://www.diasporaco.com), especias de un solo origen: el origen contado como historia. En la segunda vuelta, de Awwwards, [Meadlight · Principio](https://meadlight.com/en) (sitio del día): el producto que se mueve con la física de lo que contiene y una sola letra grande con mucho aire.
- **Tarjeta:** miel oscura con un borde que gotea arriba y «libar» en Instrument Serif. Al pasar el cursor, las gotas se estiran. Sello: la gota.

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
- **Lo nuevo:** la cortina de la portada, con el nombre pintado en sus últimas lamas: la escena queda pegada (más angosta que el 90 % del ancho) y la cortina sube con el scroll; en Safari 18 sube sola al cargar. Las fichas son placas remachadas que se atornillan, los servicios cuelgan de un tablero perforado sobre su silueta pintada, las fotos se abren como persiana (`@property --abre`) y la reserva es una orden de trabajo en su portapapeles.
- **Segunda vuelta (más real):** la barra es la caja de cambios (N y cinco marchas, con la luz que se corre a la marcha señalada) y un tacómetro cuya aguja sube con cada marcha; las herramientas están dibujadas con cromo, goma, ámbar y madera con veta (llave combinada, destornillador, chicharra, alicate, brocha y martillo) y se mecen en su gancho al pasar el cursor; la cortina tiene lamas con relieve y rieles; los tornillos son de cruz; un «gif» del aceite entrando al motor, y el pie es la placa de chasis del taller, de aluminio cepillado y estampada, con un brillo que la cruza.
- **Tarjeta:** acero con la cortina y «REMACHE» pintado en esténcil, y cuatro remaches. Al pasar el cursor, la cortina sube y deja ver adentro. Sello: el remache.

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
- **Lo nuevo:** la página se teje. Entre sección y sección, una franja de siete filas se teje con el scroll, cada fila en sentido contrario a la anterior; el pie es el aguayo entero. Las madejas de la portada dicen de dónde sale cada color. Las caminatas se eligen con radios y el perfil de altura de la elegida se dibuja. La reserva se teje: cada dato completo suma una fila (`:has(:valid)`). Su `fondo` pasó a `#f3e7d3`.
- **Tarjeta:** dos franjas de grecas y «Parina» con el flamenco de rombos. A la segunda franja le falta su fila de rombos: al pasar el cursor, se teje. Sello: un rombo de greca.

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
- **Lo nuevo:** la prueba de imprenta en vivo. Lo que se escribe en el presupuesto se compone en la invitación de al lado y se vuelve a imprimir al dejar de escribir (`tilde.js`, módulo, solo `textContent`); el papel, la tinta y la pieza cambian con `:has()`. Los tipos de la portada están en espejo y se dan vuelta en 2D (se angostan hasta cero y se abren derechos): el 3D con `backface-visibility` no se veía en el WebKit de prueba. La tilde es un acento en SVG, en bermellón.
- **Tarjeta:** papel de algodón con «Tilde» hundido en Abril Fatface, su acento y las marcas de corte. Al pasar el cursor, el relieve se hunde más. Sello: el acento.

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
- **Lo nuevo:** la trama de semitono en CSS (la foto gris, oscurecida y apenas desenfocada, bajo una grilla de puntos con contraste alto y multiplicada sobre el papel) y la barra de luz de la fotocopiadora que la imprime al entrar. Los títulos son letras de rescate (el texto real va oculto para lectores de pantalla). La inscripción es un volante con tiras para arrancar: los horarios son radios y la elegida se ladea y cae, como arrancada.
- **Tarjeta:** textura de fotocopia, «RAMPA» en letras de rescate, una tira de cinta y una línea a máquina. Al pasar el cursor, dos recortes se ladean. Sello: una estrella recortada.

## Las tarjetas de Alba, Rosa, Ónix y Golpe

En la tanda 6 se rehace el arte de su tarjeta a partir de su página, con la regla de [la tarjeta](#la-tarjeta-del-brief-la-portada): el logo, la paleta y la letra de cada una, y su gesto. En Alba, la cortina que sube. En Golpe, las letras enormes. En Rosa y Ónix, el que se elija al mirarlas.
