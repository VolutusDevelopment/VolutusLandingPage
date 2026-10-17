# Lo que queda por resolver en Sistemas de gestión

Parte de los 100.000 perfiles sintéticos de [perfiles-clientes-100000.csv](perfiles-clientes-100000.csv), que no cambia. Toma como «la página» la de Sistemas de gestión: sus preguntas frecuentes, lo que pide y sus módulos. Separa las dudas de los perfiles en tres grupos: las que la página resuelve, las que responde en parte y las que no responde. Los números describen el modelo, no el mercado.

## Resumen

- **Sin la página, se detiene el 74,2% de los perfiles.** Si la página resolviera las cuatro dudas que responde del todo (C2, C6, C10 y C14), se detendría el 65,2%. Quitar una duda no libera a quien tiene otra que también lo frena.
- **Quedan 15 frenos.** El mayor es el precio (C5): el 15,8% de quienes se detienen. La página explica cómo se arma el presupuesto, pero no da cifra ni rango. No publicar precios es una decisión del equipo.
- **Cuatro dudas no tienen respuesta en la página ni en los textos que revisé:** caso parecido (C8), prioridad (C16), proveedor vigente (C17) y decisor (C12). Suman el 28% de quienes quedan detenidos.

## Ya resuelto por la página

Estas dudas no detienen a nadie en el recálculo.

| Código | Duda | Lo que dice la página |
| --- | --- | --- |
| C2 | Sus planillas están desordenadas o incompletas | «Tus planillas, tal como están.» |
| C6 | No sabe si se conectará con su facturación o su tienda | «Puede conectarse con tu facturación, tu tienda online o tus planillas». |
| C10 | No tiene claro qué pasa después: mantención y propiedad | «Dejamos la solución documentada y fácil de modificar», con la mantención opcional y la explicación de propiedad y suscripción. |
| C14 | Necesita que funcione sin internet | «Cada solución es única. Si lo necesitas, la diseñamos para que siga funcionando sin conexión.» |

## Lo que queda por resolver

*Frena a*: perfiles detenidos por ese freno, con la página resolviendo las cuatro dudas anteriores. *Parcial*: la página responde una parte y deja una pregunta abierta. *Pendiente*: la página no responde. Los parciales siguen frenando en el modelo, así que es un criterio conservador.

| # | Código | Duda | Lo que dice hoy la página | Estado | Frena a | % de frenados |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | C5 | No sabe cuánto costaría | «Depende del alcance del proyecto y de los indicadores»; no da cifra ni rango | Parcial | 10.329 | 15,8% |
| 2 | C8 | No ha visto un caso parecido a su negocio | «todavía no tenemos casos de clientes para mostrar»; ofrece un mockup | Pendiente | 6.273 | 9,6% |
| 3 | D8 | Ya pagó una herramienta que no le sirvió | Nada. El artículo sobre herramientas que no sirvieron explica las causas | Pendiente | 5.640 | 8,6% |
| 4 | C16 | No es prioridad este año | Nada | Pendiente | 5.158 | 7,9% |
| 5 | C1 | No tiene documentado cómo funciona hoy su proceso | Nada. El artículo sobre planillas pide anotar cómo funciona hoy | Pendiente | 5.102 | 7,8% |
| 6 | C17 | Ya tiene un proveedor o contrato vigente | Nada | Pendiente | 4.730 | 7,3% |
| 7 | C9 | No sabe si le basta un producto ya hecho | Nada en esta página. La de software a medida responde «¿Conviene software a medida o uno ya hecho?» | Pendiente | 4.151 | 6,4% |
| 8 | C3 | No sabe qué números quiere ver | Muestra los módulos (ventas, inventario, clientes, agenda, cotizaciones); no ayuda a elegir | Parcial | 3.971 | 6,1% |
| 9 | C15 | No tiene presupuesto para este proyecto ahora | «Con suscripción… un costo mayor»; sin cifras | Parcial | 3.894 | 6,0% |
| 10 | C11 | No tiene tiempo para describir su operación | «Tus planillas, tal como están»; no dice cuánto toma | Parcial | 3.801 | 5,8% |
| 11 | D2 | Todo depende de una persona que entiende la planilla | «Un sistema guarda cada dato una sola vez, con permisos y con historial» | Parcial | 3.107 | 4,8% |
| 12 | C4 | No ha definido quién usa qué ni con qué permisos | «Permisos por rol», pero no ayuda a definirlos | Parcial | 2.661 | 4,1% |
| 13 | C7 | Teme perder datos al migrar desde sus planillas | «Partimos de tus planillas y las cargamos al sistema»; no habla de pérdidas | Parcial | 2.412 | 3,7% |
| 14 | C12 | La decisión la toma otra persona | Nada | Pendiente | 2.086 | 3,2% |
| 15 | C13 | Duda de sus obligaciones con la Ley 21.719 | Nada en esta página. La página de la ley la explica en general | Pendiente | 1.915 | 2,9% |

## Qué le falta a la página

Propuestas para discutir. No están implementadas.

1. **Caso parecido (C8).** Un mockup por rubro, en lugar de uno solo, para los rubros que más aparecen en el modelo: comercio, gastronomía y servicios.
2. **Precio (C5).** Publicar o no cifras es una decisión del equipo. Sin cifras, la página puede explicar qué entra en el alcance y qué lo cambia, que es lo que hoy queda abierto.
3. **Preguntas que faltan (C13, D8, C9, C1, C11).** Una sobre la Ley 21.719 que enlace a /ley21719. Otra sobre qué hacer si ya se probó algo que no sirvió, con el artículo correspondiente. Una de preparación que aclare que no hace falta tener todo documentado ni cuánto toma. Y enlazar la pregunta de software a medida o ya hecho.
4. **Lo que va a la conversación (C12, C16, C17).** Un resumen de una página para quien decide, y una pregunta de seguimiento sobre el momento y el contrato vigente.

## Cómo se calculó

- Son los mismos 100.000 perfiles. Solo cambia qué freno detiene a cada uno: los cuatro resueltos no detienen a nadie, y los demás siguen igual.
- Sin cambios, el generador reproduce las 100.000 filas del CSV. Con la página, no cambia ningún atributo ni ninguna lista de dolencias o carencias.
- Las cifras usan los mismos supuestos que el resto del informe. Fuera del precio, el orden no es robusto según la verificación de abajo.

## Detalle del modelo

### Cómo se generó

- **Semilla.** Lo que la landing dice de Sistemas de gestión: lo que pide, sus preguntas frecuentes y sus artículos sobre planillas y sobre herramientas que no sirvieron. De ahí salen las dolencias y las carencias.
- **Personas.** Seis arquetipos con rubro, tamaño, región, herramienta y necesidad, más entre 1 y 3 dolencias y entre 1 y 3 carencias.
- **Recorrido.** Cinco etapas. Cada carencia frena con probabilidad 0,5, y cada una de las dolencias D2 y D8, con 0,3. Se detiene en el obstáculo que aparece antes en la consulta. Si ninguno frena, contrata.
- **Informe.** Conteo de frenos, dolencias, necesidades y etapas, más pruebas de sensibilidad.

[MiroFish](https://github.com/666ghj/MiroFish) usa agentes que funcionan con modelos de lenguaje, lo que encarece la simulación, y su README no muestra métricas de precisión. Esta versión sigue el mismo esquema (semilla, personas, recorrido, informe) con reglas y pesos explícitos, sin modelo de lenguaje. Con la semilla 20261017, el resultado se repite.

### Verificación de sesgos

Estas pruebas se hicieron con los 19 frenos del modelo completo.

| Prueba | Resultado | Qué significa |
| --- | --- | --- |
| Fidelidad: el CSV reproduce los pesos declarados | Pasa: 38 pruebas, diferencia máxima de 0,9 puntos | El generador no añade sesgo propio. |
| Cantidad de dolencias | La versión anterior tenía exactamente una por persona. Ahora hay entre 1 y 3 (33,8%, 33,3% y 32,9%) | Era un sesgo de diseño. El reparto entre 1 y 3 es un supuesto. |
| Modelo nulo: pesos uniformes dentro de cada arquetipo | El precio baja de 10,2% a 6,1% | Su primer lugar viene de los pesos que asigné. |
| Sensibilidad: 150 pruebas de 8.000 perfiles, con pesos movidos entre ±30% y ±50%, probabilidades de freno y etapas corridas | El precio es el único que queda entre los tres primeros de forma estable (93%). Ningún otro supera el 43% | El orden del resto no es confiable. |
| Cobertura del catálogo | Antes faltaban presupuesto, prioridad y proveedor vigente. Ahora están (C15 a C17) | Sus pesos son estimados. El presupuesto sí aparece en la landing: el artículo sobre pagar en cuotas dice que no todos los negocios lo tienen hoy. Lo omití yo. |
| Origen de los frenos en la landing | Casi todos salen de textos del sitio. C11 (falta de tiempo) no aparece en ningún texto, y C12, C16 y C17 solo tienen un anclaje indirecto | El catálogo describe cómo habla la empresa, no necesariamente a sus clientes. |

La verificación no puede demostrar que no haya sesgo. Mide cuánto depende el resultado de mis supuestos. Lo que falta solo lo pueden medir consultas reales.

### Dolencias que no frenan

Ninguna de estas frena en el modelo: solo D2 y D8 pueden frenar, y lo decidí yo.

| Código | Dolencia | Lo tienen |
| --- | --- | --- |
| D3 | Copia los mismos datos en varias partes | 27,9% |
| D10 | Clientes repartidos entre WhatsApp, cuadernos y correo | 23,6% |
| D4 | Cerrar el mes le toma días | 21,6% |
| D1 | Versiones de la planilla que se pisan | 21,3% |
| D5 | Fórmulas rotas: números que no cuadran | 17,4% |
| D6 | Stock que se acaba o sobra sin aviso | 16,9% |
| D9 | Cotizaciones que se pierden | 16,8% |
| D7 | Dobles reservas en la agenda | 10,7% |

### Necesidades

Lo que busca cada perfil. En el modelo, la necesidad no cambia el freno.

| Código | Necesidad | Perfiles |
| --- | --- | --- |
| N2 | Saber sus números sin armarlos a mano | 18,2% |
| N1 | Una sola versión de sus datos | 15,8% |
| N5 | Ordenar clientes y cotizaciones | 12,2% |
| N7 | Que sus herramientas se conecten | 11,6% |
| N3 | Controlar inventario y compras | 9,3% |
| N4 | Ordenar agenda y reservas | 9,1% |
| N8 | Dejar de depender de una sola persona | 9,0% |
| N6 | Que cada persona vea lo que le corresponde | 8,7% |
| N9 | Cumplir la Ley 21.719 con sus clientes | 6,1% |

### Arquetipos

*Contrata*: porcentaje de perfiles del arquetipo que llegan a contratar.

| Código | Arquetipo | Perfiles | Contrata |
| --- | --- | --- | --- |
| A1 | Negocio que ordena todo en planillas | 29,9% | 26,1% |
| A2 | Comercio con stock en cuaderno o WhatsApp | 20,2% | 27,2% |
| A3 | Equipo de servicios con herramientas sueltas | 14,8% | 24,8% |
| A4 | Operación con sistema antiguo o de terceros | 12,2% | 23,6% |
| A5 | Servicio con agenda y reservas en papel | 13,0% | 26,6% |
| A6 | Empresa con datos repartidos que revisa la Ley 21.719 | 10,0% | 25,3% |

Herramientas: H1 cuaderno o papel · H2 planillas (Excel o Google Sheets) · H3 WhatsApp y notas del celular · H4 facturación del SII, sin más módulos · H5 software de terceros que no calza · H6 sistema antiguo a medida · H7 varias herramientas sueltas.

Las diferencias de contratación entre arquetipos son pequeñas (23,6% a 27,2%) porque todos comparten la misma regla de freno. No conviene leerlas como diferencias entre segmentos.

### Cómo medirlo

- En cada consulta real, anotar la etapa donde se detuvo y el motivo, con los mismos códigos de este informe.
- Con unas decenas de consultas se pueden reemplazar los pesos y las probabilidades de freno por frecuencias observadas. La diferencia entre el modelo y esos datos muestra cuánto dependía el informe de mis supuestos.

### Límites

- **Son perfiles sintéticos.** No hay personas reales, ni nombres, correos, teléfonos ni RUT.
- **Los pesos, las probabilidades de freno y las etapas son supuestos.** Las pruebas de sensibilidad miden cuánto cambia el resultado dentro de rangos razonables, pero no prueban que el rango sea el correcto.
- **Los obstáculos actúan de forma independiente.** Un obstáculo no empeora a otro, y el primero que aparece en la consulta siempre detiene.
- **Necesidades y dolencias no están vinculadas.** Un perfil puede necesitar algo que no corresponde a sus dolencias.
- **Sin validación externa.** El modelo describe a los clientes que imaginé, no a los que llegan.
- **La clasificación es mi lectura del texto de la página.** Las citas están arriba para que el equipo la revise.

### Cambios frente a la versión anterior

| | Versión anterior | Versión actual |
| --- | --- | --- |
| Dolencias por perfil | 1 | Entre 1 y 3 |
| Carencias por perfil | 1 | Entre 1 y 3 |
| Carencias en el catálogo | 14 | 17 (agrega presupuesto, prioridad y proveedor vigente) |
| Probabilidad de que una carencia frene | 80% | 50% |
| Personas que se detienen | 81,5% | 74,2% (64% a 84% con supuestos distintos) |
| Dudas que la página resuelve | No se descontaban | Se descuentan 4 (C2, C6, C10 y C14): se detienen 65,2% |
