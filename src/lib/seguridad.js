/**
 * Las cabeceras de seguridad de todo el sitio, en un solo sitio.
 *
 * Las leen dos consumidores: el prerender, que escribe con ellas `dist/_headers`
 * para lo que Cloudflare sirve directo, y el Worker, que las pone en sus propias
 * respuestas. Hacen falta las dos vías porque Cloudflare no aplica `_headers` a
 * lo que genera el Worker, y una copia en cada lado es la forma segura de que un
 * día no coincidan.
 *
 * La política de contenido es estricta porque puede serlo: la página no tiene un
 * solo script en línea, y el único dominio ajeno es el de Turnstile.
 *
 * - `script-src 'self' challenges.cloudflare.com`: el bundle, el Worker de las
 *   nubes y Turnstile, que se descarga al tocar el formulario y monta su
 *   comprobación en un iframe (`frame-src`). Los
 *   datos estructurados van en `<script type="application/ld+json">`, que el
 *   navegador no ejecuta y por eso no necesita permiso.
 * - `style-src 'unsafe-inline'`: el CSS va incrustado en el HTML para no
 *   bloquear el primer pintado, y React escribe variables en `style=""`.
 * - `img-src data:`: el favicon y el mapa de la lente de la barra son SVG en
 *   línea.
 */
const POLITICA = [
  "default-src 'self'",
  "script-src 'self' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

export const CABECERAS = {
  'Content-Security-Policy': POLITICA,
  // `includeSubDomains` obliga a todo subdominio a HTTPS por un año, y eso no
  // se deshace desde aquí: el único con web es www, que redirige a la raíz por
  // HTTPS, y send y rsend son del correo de Resend y no sirven páginas. Un
  // subdominio nuevo tiene que nacer con HTTPS. `preload` va después de dos
  // semanas sin quejas con esta línea, porque salir de esa lista toma meses.
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
}
