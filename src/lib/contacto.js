/**
 * Todo lo de contacto en un solo lugar: cómo escribirle a Volutus, los textos
 * del formulario y sus reglas. Lo usan la página (Contacto, Pie, Privacidad),
 * `client.js`, el Worker y el prerender.
 *
 * El Worker vuelve a aplicar las reglas porque el endpoint es público. Una
 * sola copia para que nunca difieran: si el servidor recortara más que el
 * campo, se perdería texto sin aviso.
 *
 * `public/llms.txt` y `public/.well-known/security.txt` son estáticos y
 * repiten el correo a mano: si cambia, hay que cambiarlo también ahí.
 */

// ---- cómo escribirle a Volutus ----

export const CORREO_DE_CONTACTO = 'contacto@volutus.cl'

// Formato internacional sin «+» ni espacios, por ejemplo 56912345678. Mientras
// esté vacío, ni el pie ni el formulario ofrecen WhatsApp.
export const WHATSAPP_DE_CONTACTO = '56968695173'

// Lo que llega escrito al chat desde el pie.
export const SALUDO_DE_WHATSAPP = 'Hola, vi la página de Volutus y quiero conversar sobre un proyecto.'

// Lo que llega escrito al chat desde el formulario, con lo mismo que el correo
// que arma el Worker: quién escribe y su correo, qué necesita y su mensaje.
export const mensajeDeWhatsapp = ({ nombre, correo, servicios, proyecto }) =>
  `Hola, soy ${nombre} (${correo}).` + (servicios ? `\nNecesito: ${servicios}` : '') + `\n\n${proyecto}`

// El enlace que abre el chat con `texto` ya escrito.
export const enlaceDeWhatsapp = (texto) =>
  `https://wa.me/${WHATSAPP_DE_CONTACTO}?text=${encodeURIComponent(texto)}`

// ---- los textos del formulario ----

export const PLACEHOLDERS = {
  nombre: 'Tu Nombre',
  correo: 'tu@correo.cl',
  // Enseña QUÉ clase de respuesta sirve, que es la duda real de quien se
  // queda mirando un recuadro vacío.
  proyecto: 'El problema, en tus palabras.',
}

// Los avisos de cada campo: salen de §5 y dicen qué hacer, no qué falló. El
// HTML servido trae los de campo vacío; `client.js` escribe el que toque.
// Todos cortos: la reserva bajo el campo es de una línea, y un aviso de dos
// empuja el botón justo cuando el dedo va hacia él. El más angosto es el
// nombre en L (158 px): ningún aviso pasa de unos 110 px.
export const ERRORES = {
  nombre: 'Falta tu nombre.',
  nombreInvalido: 'Usa solo letras.',
  correo: 'Falta tu correo.',
  correoInvalido: 'Revisa tu correo.',
  proyecto: 'Falta el problema.',
}

// ---- las reglas ----

export const LIMITES = { nombre: 60, correo: 100, proyecto: 500 }

// Sin espacios ni separadores de direcciones (`,` `;` `<>` `"`...): el correo
// termina en `reply_to`, y una coma ahí lo convertiría en varios destinatarios.
export const CORREO_VALIDO = /^[^\s@,;:<>"()[\]\\]+@[^\s@,;:<>"()[\]\\]+\.[^\s@,;:<>"()[\]\\]+$/

// Letras de cualquier idioma, espacios y apóstrofo (O'Higgins): un dígito o
// cualquier otro signo en el nombre es casi siempre un error de tipeo.
export const NOMBRE_VALIDO = /^[\p{L}\p{M}' ]+$/u

// Clave pública del widget de Turnstile: va en el HTML de todas formas, no es
// un secreto. El que sí lo es, `TURNSTILE_SECRET`, vive solo en el Worker.
export const TURNSTILE_SITEKEY = '0x4AAAAAAFNL4PmSlH4OWPEc'

// La acción que el widget sella en su token y el Worker exige de vuelta: un
// token sacado de otro formulario con la misma clave no sirve aquí.
export const TURNSTILE_ACCION = 'contacto'
