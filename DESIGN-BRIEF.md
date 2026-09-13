# DESIGN — Landing de Volutus

> **Plantilla vacía.** Nada de lo que hay aquí abajo es una decisión tomada: son huecos con
> una guía al lado. Se rellena caminando, no de una sentada.

---

## Cómo se usa este archivo

**Las líneas que empiezan con `Guía:` son instrucciones para quien rellena. Se borran cuando la
sección queda cerrada.** Si al final del proyecto queda alguna, es que esa sección nunca se
decidió de verdad.

Cada sección lleva un estado. Solo hay tres:

| Marca | Significa |
| --- | --- |
| `[ ]` | **Pendiente.** Nadie lo ha pensado todavía. |
| `[~]` | **En discusión.** Hay opciones sobre la mesa y no hay acuerdo. |
| `[x]` | **Cerrado.** Hay una respuesta y quien la lea puede actuar sin preguntar. |

Una sección **no se cierra porque alguien tenga una opinión**: se cierra cuando la respuesta es
lo bastante concreta como para que otra persona la ejecute sin volver a preguntar. «Colores
cálidos» no cierra nada. `#C4553A` sí.

**Regla del desacuerdo:** si tú y tu socia no coincidís, la sección se queda en `[~]` y la
discrepancia se escribe en *Preguntas abiertas* con las dos posturas. No se cierra por cansancio
ni por quien hable último. Una decisión tomada a medias reaparece en la semana tres disfrazada
de «esto no era lo que habíamos dicho».

**Orden sugerido:** las secciones 1 a 5 antes que las 6 a 9. La identidad visual decidida antes
de saber qué dice la página produce una página bonita que no convierte. Si hay prisa por ver
algo, es mejor un boceto feo con el mensaje correcto.

**Si vas a trabajar esto con un agente en otro chat:** súbele este archivo y el enlace del repo,
y pídele que rellene **una sección a la vez**, que te pregunte lo que no pueda deducir y que no
cierre ninguna sección por su cuenta. Este documento es la fuente de verdad del diseño; el
código se ajusta a él, no al revés.

---

## 0. Ficha

| Campo | Valor |
| --- | --- |
| Proyecto | Volutus, landing page |
| Repositorio | github.com/VolutusDevelopment/VolutusLandingPage |
| Dominio previsto | *pendiente (el código sigue apuntando a `example.com`)* |
| Personas que deciden | Rodrigo y su socio. **Desempata Rodrigo** (delegado explícitamente, 2026-09-13) |
| Fecha de inicio | *pendiente* |
| Fecha objetivo de publicación | *pendiente* |
| Última actualización de este documento | 2026-09-13 |

> Guía: «Personas que deciden» no es «el equipo». Son los nombres que pueden cerrar una sección.
> Si son dos, escribid los dos y añadid quién desempata cuando no hay acuerdo — decidirlo ahora,
> en frío, cuesta una línea; decidirlo en caliente cuesta una semana.

---

## 1. Qué es y qué tiene que pasar `[ ]`

**Qué es esta página, en una frase:**

> Guía: una frase que entienda alguien ajeno al proyecto. Sin «plataforma integral» ni
> «solución 360». Si no se puede decir en una frase, todavía no está claro.

**La única acción que queremos que haga el visitante:**

> Guía: **una**, no tres. Si la lista tiene «que se registre, que nos escriba y que vea el
> catálogo», la página va a hacer las tres mal. Lo demás son acciones secundarias y van abajo.

**Acciones secundarias aceptables:**

**Qué cuenta como éxito:**

> Guía: un número y un plazo. «Que funcione bien» no es medible. «30 registros el primer mes»
> sí, y además os obliga a mirarlo.

**Qué pasa si esta página no existe:**

> Guía: si la respuesta honesta es «nada», conviene saberlo antes de invertir seis semanas.

---

## 2. A quién le hablamos `[ ]`

**Visitante principal:**

> Guía: un perfil, no un segmento demográfico. Qué hace, qué problema tiene hoy, cómo lo
> resuelve ahora sin vosotros.

**Qué sabe ya cuando llega:**

> Guía: esto decide cuánto hay que explicar. Alguien que llega desde una recomendación no
> necesita el mismo texto que alguien que cae desde una búsqueda fría.

**De dónde llega:**

> Guía: enumerad las vías reales previstas (búsqueda, redes, tarjeta física, boca a boca,
> demo en persona). Si una vía trae gente con contexto muy distinto, quizá necesite su propia
> entrada a la página.

**Qué le preocupa antes de decir que sí:**

> Guía: las objeciones reales, escritas como las diría esa persona. «¿Cuánto cuesta?»,
> «¿esto me va a dar más trabajo?», «¿y si no funciona?». Cada una tendrá que estar
> respondida en alguna parte de la página, o el visitante se va a buscarla fuera.

**A quién NO le hablamos:**

> Guía: tan importante como lo anterior. Una página que intenta servir a todos no convence
> a nadie.

---

## 3. La promesa y la prueba `[ ]`

**La promesa, en una frase que pueda ir de titular:**

> Guía: qué gana el visitante, no qué hacéis vosotros. «Ahorra dos horas de caja al día» y no
> «software de gestión avanzada».

**Por qué habría de creernos — la prueba:**

| Afirmación | Con qué se sostiene | ¿La tenemos ya? |
| --- | --- | --- |
| | | |
| | | |

> Guía: cifras, clientes reales, capturas, garantías, una demo. **Si una fila no tiene con qué
> sostenerse, o se consigue la prueba o se quita la afirmación.** Una promesa sin respaldo se
> nota, y quema la confianza del resto de la página.

**Respuesta a cada objeción de la sección 2:**

| Objeción | Dónde se responde en la página | Cómo |
| --- | --- | --- |
| | | |

---

## 4. Arquitectura de la página `[~]`

Orden acordado con el equipo. El tema de color de cada bloque viene de la
decisión A.4.

| # | Sección | Qué tiene que conseguir | Contenido | Tema | Estado |
| --- | --- | --- | --- | --- | --- |
| 1 | Portada | Que se entienda qué hacemos y qué hacer, sin desplazar | Titular, entradilla, acción principal, pieza atmosférica de marca | Cielo | `[~]` |
| 2 | Demostración | Mostrar en vez de contar | Dos huecos reservados para capturas de proyectos en desarrollo | Plano | `[~]` |
| 3 | Métricas | Probar la capacidad técnica con números | Datos reales en Geist Mono sobre fondo de plano | Plano | `[~]` |
| 4 | *(por definir)* | *(ver nota)* | *(ver nota)* | Cielo | `[ ]` |
| 5 | Contacto | Convertir | Formulario | Cielo | `[~]` |

**Nota sobre el bloque 4.** En la arquitectura original era "sobre nosotros".
Con la decisión de no mostrar personas, ese bloque se queda sin contenido y
está pendiente de redefinición.

**Personas en la página** `[x]`: **no aparece ninguna.** Sin nombres, sin
retratos, sin firmas. Habla la empresa en primera persona del plural. Un
apartado "sobre nosotros" queda para una versión posterior, fuera del alcance
de esta.

Se descartó mostrar nombres con enlace a GitHub o LinkedIn, que el asesor
recomendaba como prueba verificable de capacidad técnica, y los retratos.

**Dónde aparece la acción principal y cuántas veces:** `[ ]` *bloqueado hasta
que la sección 1 defina cuál es esa acción.*

**Qué ve alguien que no baja nada, la primera pantalla:** `[ ]` *bloqueado por
lo mismo.*

## 5. Voz y copy `[~]`

**Tratamiento:** `[x]` **Tuteo.** "Cuéntanos qué necesitas." Se mantiene en toda
la página, botones, mensajes de error, validaciones del formulario y correos de
respuesta. Decisión de Rodrigo; voto del socio no registrado.

Se descartó el usted (choca de frente con la persona que "conversa al mismo
nivel" del anexo A.1) y el impersonal (no ofende a nadie y tampoco conecta con
nadie).

**Cómo hablamos, tres adjetivos y un contraejemplo de cada uno** `[~]`
*(propuesta del asesor derivada de los anexos A.1 y A.2, pendiente de
validación del equipo):*

| Somos | No somos |
| --- | --- |
| **Precisos.** Cada afirmación va con su número o no se hace. | Vagos: "soluciones a medida", "calidad de nivel empresarial". |
| **Directos.** Decimos alcance, plazo y qué no hacemos. | Evasivos: "conversemos y lo vemos". |
| **Del mismo nivel.** Explicamos sin jerga y sin condescendencia. | Ni sabihondos ("arquitectura hexagonal orientada a eventos") ni simplones ("te hacemos una web bonita"). |

**Cómo se nombran las cosas, glosario** `[~]`

Volutus se presenta como **empresa de desarrollo de software**. Decisión de
Rodrigo. Se descartó "estudio de ingeniería" (palabra prestada mientras no haya
obra publicada que la respalde) y declarar el tamaño de forma explícita
("somos dos ingenieros"), que el asesor recomendaba como diferenciador frente a
los equipos que subcontratan.

*Resto del glosario: propuesta del asesor, pendiente de validación. Vocabulario
de Chile.*

| Lo llamamos | No lo llamamos | Por qué |
| --- | --- | --- |
| Empresa de desarrollo de software | Estudio, agencia, software factory | Es lo decidido, y se mantiene igual en toda la página |
| Proyecto | Solución | "Solución" no significa nada y suena a folleto |
| Cliente | Partner, aliado estratégico | Nadie habla así fuera de una presentación |
| Reunión | Call, meeting | Se escribe en español en toda la página |
| Cotización | Presupuesto, quote | Es la palabra que usa el cliente chileno |

**Textos de los botones** `[ ]`

*Bloqueado: los textos de botón no se pueden escribir hasta que la sección 1
defina cuál es la única acción principal de la página.*

## 6. Identidad visual `[~]`

*Color y tipografía cerrados. Espaciado, forma e imagen pendientes.*

### Color `[x]`

La página usa **dos temas por zona**, no un modo oscuro conmutable. El corte
está definido en el anexo A.4: la portada y el cierre van en *cielo*, la zona
de demostración va en *plano*.

**Color de marca:** `#38A9E8`, cielo de mediodía. Es el color del logo, de la
onda y de las superficies de identidad. **No se usa nunca para texto ni para
botones sobre fondo claro:** da 2.48:1, por debajo del mínimo de 4.5:1. Sobre
el tema plano sí funciona (6.71:1) y ahí se usa tal cual.

**Tema cielo (claro):**

| Uso | Valor | Contraste sobre el fondo |
| --- | --- | --- |
| Fondo | `#F6F9FC` | base |
| Superficie | `#FFFFFF` | base |
| Texto principal | `#0A1A2A` | 16.64:1 |
| Texto secundario | `#47607A` | 6.17:1 |
| Líneas y bordes | `#D6E2EC` | decorativo |
| Marca (solo superficies) | `#38A9E8` | 2.48:1, no apto para texto |
| Acción (enlaces y botones) | `#116492` | 6.09:1, blanco encima 6.44:1 |
| Acción hover | `#0F5780` | 7.37:1 |
| Acción activa | `#0C4565` | 9.67:1 |
| Éxito | `#12714B` | 5.70:1 |
| Aviso | `#8A5A00` | 5.61:1 |
| Error | `#B3261E` | 6.19:1 |

**Tema plano (oscuro):**

| Uso | Valor | Contraste sobre el fondo |
| --- | --- | --- |
| Fondo | `#0A1A2A` | base |
| Superficie | `#122638` | base |
| Texto principal | `#E6EEF6` | 15.01:1 |
| Texto secundario | `#9DB2C6` | 8.05:1 |
| Líneas y bordes | `#1E3348` | decorativo |
| Acción y marca | `#38A9E8` | 6.71:1 |
| Botón primario | fondo `#38A9E8`, texto `#0A1A2A` | 6.71:1 |
| Éxito | `#4FCF96` | 8.96:1 |
| Aviso | `#E8B14C` | 9.06:1 |
| Error | `#FF8A80` | 7.70:1 |

**¿Hay modo oscuro conmutable?** `[ ] sí  [x] no  [ ] más adelante`. Los dos
temas son zonas de la página, no una preferencia del usuario.

Los neutros llevan la misma tonalidad azulada que la marca, ningún gris puro.
Los semánticos son independientes del acento y no se usan como color de marca.

### Tipografía `[x]`

| Rol | Familia | Grosores | De dónde se carga |
| --- | --- | --- | --- |
| Titulares y wordmark | Geist | 400, 800 | Autohospedada, `woff2` variable con subset latino |
| Texto | Geist | 400 | La misma variable |
| Datos, métricas y código | Geist Mono | 400 | Autohospedada, subset latino |

Reglas de uso, obligatorias (razón en el anexo A.7):

- Solo 400 y 800. Nunca 500 ni 600.
- Titulares grandes con `letter-spacing: -0.03em`.
- Wordmark `VOLUTUS` en mayúsculas con tracking positivo amplio.
- Geist Mono solo para números y datos reales, nunca como decoración.

**Escala de tamaños:** seis pasos, y no se sale de ahí.

| Paso | Tamaño | Uso |
| --- | --- | --- |
| `xs` | 13 px | Etiquetas, pies |
| `sm` | 15 px | Texto secundario |
| `base` | 17 px | Texto corrido |
| `lg` | 22 px | Entradilla |
| `xl` | 34 px | Título de sección |
| `2xl` | fluido, 48 a 76 px | Titular de portada |

### Espaciado y forma `[x]`

| Concepto | Valor |
| --- | --- |
| Unidad base de espaciado | 4 px, escala de 4 a 96 |
| Ancho máximo del contenido | 1200 px, con `padding-inline` de 24 px |
| Medida de lectura | 68 caracteres máximo en texto corrido |
| Radio de esquinas | **4 px**, uniforme en todo el sitio |
| Sombras | **Ninguna** |

**Radio 4 px (decisión de Rodrigo; voto del socio no registrado).** Se descartó
la esquina recta absoluta, que con Geist resultaba dura, y el radio amable de
10 a 12 px, que es el aspecto por defecto de las plantillas SaaS y apunta justo
a la prohibición principal de A.2.

**Sin sombras, por decisión, no por olvido.** La separación entre planos se
hace con color de superficie y una línea de 1 px. Una sombra dice "esto flota",
y en esta página nada flota. Además evita repintados y `will-change`
innecesarios.

**Regla de jerarquía:** borde, relleno, radio y fondo propio son recursos
caros. Si todos los bloques los llevan, dejan de significar nada. Se reservan
para lo que de verdad tiene que destacar, que en esta página es la acción
principal y los datos de la zona de plano.

### Imagen y gráfica `[x]`

**Regla de las dos capas.** Es la que resuelve la tensión entre "sin sombras ni
degradados" y "que no se vea pobre":

| Capa | Qué incluye | Reglas |
| --- | --- | --- |
| Interfaz | Botones, campos, tarjetas, tablas, datos | Sin sombras, sin degradados, radio 4 px, color plano |
| Atmósfera de marca | Una o dos piezas grandes en toda la página | Aquí sí hay luz, profundidad y tonalidad, y se resuelve como **imagen**, nunca simulada en CSS o SVG |

**Qué tipo de imágenes usamos:**

1. **Pieza atmosférica de marca: la nube volutus, fotorrealista.** Cielo real,
   luz rasante, calidad de cuadro. Como máximo dos apariciones en la página.
   Se genera y se exporta a `webp` con `srcset`, dimensiones explícitas y peso
   máximo de **120 KB** en el tamaño que recibe un móvil.
2. **Gráfica vectorial propia:** la onda de marca, diagramas e iconos de trazo,
   en SVG inline, de un solo color, sin degradados.
3. **Capturas reales de producto: dos espacios reservados.** El diseño deja
   dos huecos preparados que el equipo rellena con los proyectos que está
   desarrollando. Hasta que lleguen las capturas, el hueco se ocupa con un
   marcador sobrio del sistema (superficie, borde de 1 px y etiqueta), nunca
   con una imagen de relleno.

   Especificación del hueco, para que la imagen real entre sin romper nada:
   proporción fija 16:10, `width` y `height` explícitos en el HTML, `webp` con
   `srcset`, peso máximo 90 KB en el tamaño de móvil y `loading="lazy"`. Así el
   CLS se mantiene en 0 antes y después de tener las capturas.

**Qué NO usamos, nunca:**

- Fotos de banco de imágenes, y en especial gente sonriendo señalando una
  pantalla.
- Ilustración vectorial con degradados suaves y sombritas, el estilo por
  defecto de las plantillas y de las IA de diseño baratas.
- Iconografía 3D genérica.
- Fotorrealismo **simulado** en CSS o SVG: cuesta más pintar que la foto que
  pretende evitar.
- Degradados RGB, morado, y cualquier cosa que delate generación automática.

**Consecuencia sobre lo que ya existe:** el video del hero actual queda
descartado. Son 464 KB en `webm` y 512 KB en `mp4` con `preload="auto"`,
compitiendo por ancho de banda en la pantalla donde se mide el LCP, a cambio
de decoración que no demuestra nada. Lo sustituye la pieza atmosférica como
imagen.

**¿Hay logo? ¿Dónde están los archivos?** Todavía no. La forma está decidida
(anexo A.6: la onda, un solo trazo, geometría). Los archivos SVG se producen en
la sesión de rediseño y viven en `public/image/`.

## 7. Componentes `[ ]`

> Guía: la lista de piezas que se repiten. Rellenar solo las que la página necesita de verdad
> — un inventario inventado se convierte en trabajo inventado.

| Componente | Estados que necesita | Dónde se usa | Estado |
| --- | --- | --- | --- |
| Botón principal | reposo, hover, foco, pulsado, desactivado, cargando | | `[ ]` |
| Botón secundario | | | `[ ]` |
| Campo de formulario | reposo, foco, error, desactivado | | `[ ]` |
| | | | `[ ]` |

**El foco de teclado tiene que verse siempre.** Es la única forma de navegar para quien no usa
ratón, y es lo primero que se pierde cuando alguien quita el contorno «porque queda feo».

---

## 8. Responsive, accesibilidad y rendimiento `[ ]`

**Puntos de quiebre:**

**¿Se diseña primero móvil o escritorio?**

> Guía: decidirlo explícitamente. «Ya se verá» significa escritorio primero y un móvil
> arreglado a última hora.

**Contraste mínimo que aceptamos:**

> Guía: el estándar razonable es 4.5:1 para texto normal y 3:1 para texto grande. Si el acento
> de marca no llega, se ajusta el acento — no se baja el listón.

**Qué tiene que funcionar sin JavaScript:**

**Presupuesto de carga:**

| Métrica | Objetivo |
| --- | --- |
| Peso total de la primera carga | |
| Tiempo hasta que se ve el contenido | |

**Idiomas:**

---

## 9. SEO y metadatos `[ ]`

| Campo | Valor |
| --- | --- |
| Título de la pestaña | |
| Descripción | |
| Imagen para compartir (OG) | |
| ¿Se indexa? | |
| Palabras por las que queremos aparecer | |

> Guía: la imagen de compartir es lo que se ve cuando alguien pega el enlace en WhatsApp. Si
> no se define, se ve un recuadro gris y parece un enlace sospechoso.

---

## 10. Medición `[ ]`

**Qué eventos queremos registrar:**

| Evento | Cuándo se dispara | Para qué decisión sirve |
| --- | --- | --- |
| | | |

> Guía: la tercera columna es la que importa. Un evento que no va a cambiar ninguna decisión
> es ruido que hay que mantener para siempre.

**Herramienta:**

**Qué se mira y cada cuánto:**

---

## 11. Alcance y restricciones `[ ]`

**Lo que SÍ entra en la primera versión:**

**Lo que NO entra, y cuándo se revisará:**

> Guía: esta lista es la que salva el proyecto. Todo lo que no esté aquí escrito como «no
> entra» va a aparecer a mitad de camino como «era obvio que hacía falta».

**Restricciones técnicas conocidas:**

| Restricción | De dónde viene |
| --- | --- |
| | |

**Presupuesto y plazos:**

---

## 12. Registro de decisiones

> Guía: una fila por decisión que costó una conversación. Las que se tomaron sin discutir no
> hace falta registrarlas. La columna que de verdad sirve es «qué descartamos»: dentro de dos
> meses, alguien va a proponer exactamente eso, y esta tabla evita repetir el debate entero.

| # | Fecha | Decisión | Qué descartamos y por qué | Quién |
| --- | --- | --- | --- | --- |
| 1 | 2026-09-13 | Desempata Rodrigo cuando no hay acuerdo | Una regla objetiva sin nombre propio: no cierra nada en caliente | Rodrigo |
| 2 | 2026-09-13 | Dos temas por zona: cielo arriba, plano en la zona técnica, cielo al cierre | Quedarse solo en azul cielo (indistinguible del resto de la industria) y solo en azul de plano (pierde el vínculo con el nombre) | Ambos |
| 3 | 2026-09-13 | El corte de tema ocurre en un borde seco, dos veces en toda la página | El fundido progresivo: sería un degradado de scroll, justo lo prohibido | Ambos |
| 4 | 2026-09-13 | Logo = símbolo más palabra, con símbolo autónomo para favicon | Solo wordmark: dejaba sin marca todos los espacios cuadrados | Ambos |
| 5 | 2026-09-13 | El símbolo es una onda de un solo trazo, geométrica | La nube como sección técnica con curvas de nivel: a 16 px es una mancha | Ambos |
| 6 | 2026-09-13 | Tipografía Geist y Geist Mono | Archivo (anónima) e IBM Plex (recomendada por el asesor). Riesgo asumido: Geist se asocia al ecosistema Vercel | Rodrigo |
| 7 | 2026-09-13 | Color de marca `#38A9E8`, con `#116492` para toda acción y texto | Usar el celeste para texto o botones: 2.48:1, incumple accesibilidad | Rodrigo |
| 8 | 2026-09-13 | Radio 4 px y cero sombras en la interfaz | Esquina recta absoluta (dura con Geist) y radio de 10 a 12 px (estética de plantilla SaaS) | Rodrigo |
| 9 | 2026-09-13 | La riqueza visual viene de una pieza atmosférica en imagen, no de efectos en código | Fotorrealismo simulado en CSS o SVG: coste de pintado alto y aspecto de plantilla | Ambos |
| 10 | 2026-09-13 | Se elimina el video del hero | Mantenerlo: medio megabyte en la pantalla donde se mide el LCP, sin aportar prueba | Rodrigo |

---

## 13. Preguntas abiertas

> Guía: aquí vive lo que está en `[~]`. Cuando una se resuelve, se mueve a la sección que
> corresponda y se borra de aquí. Si una pregunta lleva semanas sin moverse, normalmente no es
> que sea difícil: es que falta un dato que nadie ha ido a buscar, o que bloquea a alguien que
> no sabe que está bloqueado.

| # | Pregunta | Postura A | Postura B | Qué hace falta para cerrarla | Bloquea a |
| --- | --- | --- | --- | --- | --- |
| 1 | ¿Qué se muestra exactamente en el "demo en vivo" del bloque 1? | Sin postura | Sin postura | Saber si existe un producto propio demostrable, o si el demo es de trabajo hecho para clientes | La primera pantalla entera y el bloque de mayor riesgo del rediseño |
| 2 | | | | | |

---

## Antes de dar el diseño por cerrado

- [ ] Ninguna sección sigue en `[ ]` o `[~]`
- [ ] No queda ninguna línea `Guía:` en el documento
- [ ] Todas las afirmaciones de la sección 3 tienen con qué sostenerse
- [ ] La primera pantalla explica qué ofrecéis y qué hacer, sin desplazar
- [ ] Hay **una** acción principal, y se puede señalar con el dedo
- [ ] Los colores del acento pasan el contraste sobre su fondo real
- [ ] El foco de teclado se ve en todo lo que se pueda pulsar
- [ ] Alguien ajeno al proyecto leyó la página y supo decir qué ofrecéis

---

## Anexo A. Ejercicio de personificación de marca `[~]`

> Registro de la sesión de identidad (Rodrigo + socio). Material en bruto y su
> traducción a consecuencias de diseño. Alimenta las secciones 5 y 6; nada de
> aquí está cerrado hasta que se copie a su sección con valores concretos.

### A.1 "Volutus entra a una sala" (2026-09-13)

**Respuesta del equipo:**

- No busca llamar la atención, pero tampoco pasar desapercibida.
- Persona correcta, vestida de manera semiformal. No necesita ruido para que
  la noten.
- Usa lentes, pero no parece un nerd.
- Da su opinión cuando le preguntan, sin cerrarse a la de los demás.
- Mira a los ojos, da la mano firme, conversa de cerca y **al mismo nivel** que
  el otro.
- Busca que la persona con la que habla entienda lo mismo que ella: abstrae
  ideas y aterriza expectativas.

**Lectura para diseño (propuesta, sin cerrar):**

| Rasgo declarado | Consecuencia concreta en la página |
| --- | --- |
| Ni ruidosa ni invisible | Un solo elemento con fuerza por pantalla, el resto en silencio. Sin degradados ni animaciones decorativas. |
| Semiformal | Sans con carácter. Ni serif de bufete ni grotesque genérica de startup. |
| No necesita ruido | Un único color de acento, usado poco. El peso lo carga el espacio. |
| Lentes, no nerd | Precisión sin estética hacker: nada de terminal, monoespaciado solo para datos reales. |
| Habla al mismo nivel | Copy sin jerga. Se explica el *cómo trabajamos*, no solo el *qué usamos*. |
| Opina, pero escucha | Titulares afirmativos, no preguntas retóricas. |

**Pendiente de esta pregunta:** el contraejemplo con nombre propio (a quién no
queremos parecernos).

### A.2 Prohibiciones y dirección inicial (2026-09-13)

**Lo que NO puede existir en la página (acuerdo de ambos socios):**

- Degradados de colores tipo RGB / unicornio.
- El color morado, en ninguna forma.
- Cualquier cosa que delate "generado con la IA más barata del mercado".
- Sobrecarga de animaciones.
- Exceso de recuadros con información.
- **Por encima de todo: falta de identidad.** Es el defecto que más rechazan.

**Dirección declarada:**

- Paleta simple: blanco y algún tipo de azul celeste (a validar, ver A.3).
- La página tiene identidad **por encima** de sus componentes.
- Nada que no aporte a la comunicación entre usuario y página.
- Cada animación tiene que tener su porqué.
- Debe demostrar habilidad técnica y simpleza al mismo tiempo.

**Arquitectura propuesta por Rodrigo (alimenta la sección 4, sin cerrar):**

| # | Bloque | Intención declarada |
| --- | --- | --- |
| 1 | Ejemplo gráfico de lo que hace la empresa, casi un demo en vivo de los productos | Mostrar, no contar |
| 2 | El beneficio del tipo de diseño, en métricas | Probar la habilidad técnica con números |
| 3 | Algo breve sobre nosotros | Confianza |
| 4 | Formulario | Conversión |

**Objetivo de este bloque de trabajo:** identidad clara, imagen de marca e
idealmente un logo, utilizables en la página.

### A.3 Dirección cromática: cielo que desciende a plano `[~]`

**Decisión de dirección (Rodrigo, con acuerdo pendiente del socio):** combinar
las direcciones A y B como un recorrido, no como una mezcla.

- La página **abre en azul cielo**: identidad de marca, la nube volutus, única
  e imponente.
- A medida que se baja y el contenido se vuelve técnico, la página **pasa a
  azul de plano**: azul profundo, casi negro, registro de ingeniería.

El color cambia cuando cambia el registro del discurso: claro mientras la
página *promete*, oscuro cuando la página *demuestra*.

**Reglas que se derivan de esto y que no son negociables si la idea se
mantiene:**

1. **La transición es un corte, no un degradado.** Si el cielo se funde
   suavemente con el plano, eso es un degradado de scroll, justo lo prohibido
   en A.2. El cambio ocurre en un borde definido, coherente con las esquinas
   rectas y los divisores marcados del sistema actual.
2. **Dos temas significan dos sistemas completos:** cada token necesita su
   pareja clara y oscura, y cada componente sus estados en ambos fondos. El
   contraste se verifica en los dos.
3. El número de cambios de tema en toda la página es **finito y decidido**,
   no uno por sección.

**Pendiente para cerrar:** punto exacto del corte, valores hex de ambos temas,
y voto explícito del socio.

### A.4 Punto de corte del tema `[x]`

**Cerrado (acuerdo de ambos socios, 2026-09-13): opción B, corte en la mitad
con retorno.**

| Zona | Tema | Función |
| --- | --- | --- |
| Portada | Cielo (claro) | Promete |
| Demo en vivo | Plano (oscuro) | Demuestra |
| Métricas | Plano (oscuro) | Demuestra |
| Nosotros | Cielo (claro) | Da confianza |
| Formulario y pie | Cielo (claro) | Convierte |

Dos cortes en toda la página, ambos secos. **Se descartó:** el corte temprano
(dejaba la identidad de marca reducida a una sola pantalla) y el descenso
completo sin retorno (dejaba el formulario sobre fondo oscuro, peor para
conversión y más frágil en accesibilidad).

### A.5 Estructura del logo `[x]`

**Cerrado:** la marca es un **lockup**, símbolo más palabra, y el símbolo tiene
que sostenerse solo.

| Versión | Composición | Dónde se usa |
| --- | --- | --- |
| Principal | Símbolo + `VOLUTUS` en horizontal | Nav, pie, firma de correo, documentos |
| Símbolo solo | Símbolo aislado | Favicon, avatar, cualquier espacio cuadrado |
| Palabra sola | `VOLUTUS` sin símbolo | Casos de una sola línea, texto legal |

**Requisitos técnicos, no negociables:**

- El símbolo tiene que ser legible a **16 px**. Lo que no se distingue a 16 px
  no entra en el símbolo.
- SVG vectorial, sin degradados, sin sombras, sin más de un color.
- Versión para fondo claro (cielo) y para fondo oscuro (plano), porque la
  página usa los dos.
- La tipografía de la palabra sale de la familia de titulares del sitio, no
  de una fuente exclusiva del logo. Una familia menos que cargar.

**Consecuencia directa:** el favicon actual, un cuadrado azul sobre gris,
queda descartado.

**Pendiente:** la forma concreta del símbolo.

### A.6 Forma del símbolo `[x]`

**Cerrado (voto de ambos socios, 2026-09-13): la onda.**

Una sola línea continua que se enrolla sobre sí misma, construida con
geometría (círculos y tangentes), no dibujada a mano. Una idea, un trazo, un
color.

**Se descartó:** la nube como sección técnica con curvas de nivel. Motivo: a
16 px se convierte en una mancha, y el símbolo tiene que sobrevivir al favicon.

**Criterio de construcción:** si la onda se puede confundir con el logo de otra
empresa, está mal construida. La precisión geométrica es lo que la hace
propia, no la curva en sí.

### A.7 Tipografía `[x]`

**Cerrado (decisión de Rodrigo, 2026-09-13): Geist y Geist Mono.**

| Rol | Familia | Grosores | De dónde se carga |
| --- | --- | --- | --- |
| Titulares y wordmark | Geist | 400 y 800 | Autohospedada, `woff2` variable con subset latino |
| Texto | Geist | 400 | La misma variable |
| Datos, métricas y código | Geist Mono | 400 | Autohospedada, subset latino |

**Se descartó:** Archivo (correcta pero anónima, no carga identidad) e IBM Plex
(recomendada por el asesor, rechazada por el equipo).

**Riesgo asumido, declarado una vez y registrado:** Geist es la tipografía de
Vercel y del ecosistema Next. Un visitante técnico, que es parte del público
objetivo, puede leerla como "plantilla por defecto".

**Mitigación obligatoria, porque la diferenciación ya no puede venir de la
familia sino del uso:**

1. Solo dos grosores, 400 y 800. Nada de 500 ni 600, que es el ajuste por
   defecto de las plantillas.
2. Titulares grandes con `letter-spacing` negativo marcado, alrededor de
   `-0.03em`. El tracking por defecto es lo que hace que Geist parezca
   plantilla.
3. El wordmark `VOLUTUS` va en mayúsculas con tracking **positivo** amplio,
   lo contrario de los titulares. Ese contraste es lo que lo vuelve una marca
   y no un texto.
4. Geist Mono se reserva para números y datos reales. Nunca como decoración.
