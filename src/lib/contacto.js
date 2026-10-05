/**
 * Las reglas del formulario de contacto, compartidas por la página
 * (`maxLength`, validación en `client.js`) y el Worker, que las vuelve a
 * aplicar porque el endpoint es público. Una sola copia para que nunca
 * difieran: si el servidor recortara más que el campo, se perdería texto sin
 * aviso.
 */

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
