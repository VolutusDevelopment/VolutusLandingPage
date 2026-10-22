# 00 · Ficha del proyecto

> Se rellena antes de empezar y se mantiene al día. Lo que cambia entre
> proyectos vive aquí; lo que no cambia, en los módulos 01 a 10. Cada módulo
> dice qué claves lee (`ficha.tipo`, `ficha.negocio_local`…) y cómo cambian
> sus tareas según el valor.

**Cómo se usa.** Copia `docs/roadmap/` al proyecto nuevo, rellena esta ficha y
crea el archivo de estado del proyecto (como `volutus.md`). Una clave sin valor
es una decisión pendiente: se anota en «Preguntas abiertas» y no se adivina.

## 1. Identidad

| Clave | Qué va | Ejemplo |
| --- | --- | --- |
| `nombre` | Nombre comercial, escrito siempre igual | Empresa |
| `razon_social` | Nombre legal | Empresa SpA |
| `id_fiscal` | RUT u otro identificador tributario | 76.000.000-0 |
| `dominio` | Dominio canónico, con o sin `www` (uno solo) | `empresa.cl` |
| `dominios_extra` | Otros dominios que redirigen al canónico | `empresa.com` |
| `pais` | País donde opera (ISO 3166) | CL |
| `ciudad` | Ciudad base | Santiago |
| `idiomas` | Idiomas del sitio (BCP 47), el primero es el principal | `es-CL` |
| `moneda` | Moneda de precios (ISO 4217) | CLP, CLF (UF) |

## 2. Propósito

| Clave | Qué va | Valores |
| --- | --- | --- |
| `tipo` | Para qué existe el sitio | `respaldo` (validar a quien ya llega con el enlace) · `captacion` (traer clientes desde buscadores) · `tienda` · `contenido` · `institucional` · `reservas` |
| `accion_principal` | La única acción que se quiere del visitante | Enviar el formulario, comprar, reservar, llamar |
| `acciones_secundarias` | Las aceptables | Ver proyectos, escribir por WhatsApp |
| `publico` | Quién llega y qué sabe ya | Dueño de pyme que acaba de conversar con el equipo |
| `canales_de_llegada` | De dónde llega, en orden | WhatsApp, búsqueda de marca, recomendación |
| `objeciones` | Sus dudas, en sus palabras | «¿Cuánto me cobran?» |
| `kpis` | Indicadores con meta y plazo | 6 mensajes en 3 meses |
| `no_se_le_habla` | A quién no se dirige el sitio | Quien busca el precio más bajo |

## 3. Negocio local

| Clave | Qué va | Valores |
| --- | --- | --- |
| `negocio_local` | Cómo atiende | `no` · `local_fisico` (recibe clientes en una dirección) · `area_de_servicio` (va donde el cliente o atiende a distancia) |
| `direccion_publica` | Si la dirección se puede mostrar | sí · no (domicilio particular) |
| `zona_de_servicio` | Comunas, regiones o países que atiende | Región Metropolitana, Chile |
| `horario` | Días y horas de atención | Lun–vie 9–18 |
| `telefono` / `whatsapp` | Números públicos, en formato internacional | +56 9 … |
| `categoria_principal` | Categoría del negocio en mapas y directorios | Empresa de software |

## 4. Contenido y funciones

| Clave | Qué va | Valores |
| --- | --- | --- |
| `paginas` | Lista de páginas y su propósito | Inicio, Servicios, Nosotros, Contacto, Privacidad |
| `blog` | Si publica artículos | sí · no |
| `multi_idioma` | Más de un idioma | sí · no |
| `productos` | Cuántos productos vende en línea | 0 · número |
| `formularios` | Cada formulario y qué hace | Contacto, cotizador, reserva |
| `pagos` | Si cobra en el sitio | sí · no |
| `cuentas_de_usuario` | Si hay inicio de sesión | sí · no |
| `precios_publicos` | Si muestra precios o rangos | sí · desde · no |

## 5. Reglas de diseño

Lo que hace distinto a cada proyecto. Los principios (contraste, jerarquía,
accesibilidad, rendimiento) son fijos y están en el módulo 02; esto son los
valores.

| Clave | Qué va | Ejemplo |
| --- | --- | --- |
| `diseno.tono` | Tres adjetivos de la marca y tres que no es | Formal, preciso, cercano · no juvenil, no frío |
| `diseno.tipografias` | Familias, pesos y uso (texto, titulares, datos) | Geist 400–800, Archivo itálica 800 |
| `diseno.escala` | Tamaños de texto y niveles de título | 13, 15, 17, 22, 34 px y 4 niveles |
| `diseno.paleta` | Colores con su rol (fondo, texto, acción, estados) | `#116492` acción |
| `diseno.zonas` | Zonas de color o temas por sección | Cielo claro, plano oscuro |
| `diseno.modo_oscuro` | Si sigue la preferencia del sistema | sí · no · por zonas |
| `diseno.espaciado` | Base y escala | Múltiplos de 4 |
| `diseno.radios` | Radios por tipo de pieza | 4, 12, 28 px |
| `diseno.movimiento` | Cuánto se mueve | `sobrio` · `medido` · `expresivo` |
| `diseno.iconografia` | Estilo de íconos e ilustración | Glifos macizos inclinados 10° |
| `diseno.referencias` | Sitios de referencia y qué se toma de cada uno | — |
| `diseno.restricciones` | Lo que la marca no permite | Sin fotos de banco |
| `diseno.documento` | Dónde vive el sistema del proyecto | DESIGN.md |

## 6. Técnica

| Clave | Qué va | Ejemplo |
| --- | --- | --- |
| `tecnica.stack` | Cómo se construye | HTML prerenderizado con Vite |
| `tecnica.hosting` | Dónde se sirve | Cloudflare Workers con Static Assets |
| `tecnica.registrador` | Dónde está registrado el dominio | NIC Chile |
| `tecnica.dns` | Quién responde el DNS | Cloudflare |
| `tecnica.correo` | Bandeja del dominio | Zoho Mail, Google Workspace |
| `tecnica.envio_transaccional` | Quién envía los correos del sitio | Resend |
| `tecnica.repositorio` | Dónde vive el código | GitHub |
| `tecnica.ci` | Dónde corren las pruebas y el despliegue | GitHub Actions |
| `tecnica.cms` | Si hay gestor de contenidos | no · cuál |

## 7. Soporte

| Clave | Qué va | Ejemplo |
| --- | --- | --- |
| `soporte.navegadores` | Navegadores y versiones mínimas | Dos últimas de Chrome, Firefox y Edge; Safari 18 en adelante |
| `soporte.anchos` | Anchos de prueba por punto de quiebre | S 390 · M 820 · L 1180 · XL 1440 |
| `soporte.accesibilidad` | Nivel exigido | WCAG 2.2 AA |

## 8. IA y agentes

| Clave | Qué va | Valores |
| --- | --- | --- |
| `ia.buscar` | Dejar que buscadores con IA indexen y muestren | sí · no |
| `ia.citar` | Dejar que asistentes usen el contenido para responder (`ai-input`) | sí · no |
| `ia.entrenar` | Dejar que se entrenen modelos con el contenido (`ai-train`) | sí · no |
| `ia.webmcp` | Anotar los formularios para agentes | sí · no |

## 9. Legal y privacidad

| Clave | Qué va | Ejemplo |
| --- | --- | --- |
| `legal.leyes` | Leyes que aplican | Ley 21.719 (datos, Chile); Ley 19.496 (consumidor) si vende |
| `legal.publico_ue` | Si apunta a personas en la Unión Europea | sí · no |
| `legal.cookies_no_esenciales` | Si usa cookies o rastreadores que no son imprescindibles | sí · no |
| `legal.encargados` | Terceros que tratan datos por el negocio | Proveedor de correo, CDN |
| `legal.responsable_datos` | Quién responde por los datos personales | Nombre y correo |

## 10. Plan y equipo

| Clave | Qué va | Ejemplo |
| --- | --- | --- |
| `plan.cloudflare` | Plan de la zona | Free · Pro · Business |
| `plan.herramientas_de_pago` | Herramientas pagadas permitidas | Ninguna |
| `plan.horas` | Horas disponibles por mes para mantener | 6 |
| `equipo.decide` | Quiénes deciden | Dos socios |
| `equipo.desempata` | Quién desempata | Socio A |
| `equipo.mantiene` | Quién mantiene el sitio | Desarrollador |
| `equipo.cuentas_a_nombre_de` | A nombre de quién quedan dominio y cuentas | La empresa, nunca una persona |

## Preguntas abiertas

| Clave | Pregunta | Quién decide | Fecha límite |
| --- | --- | --- | --- |
| | | | |
