
/**
 * Contacto (DESIGN-BRIEF §4, bloque 5). Tema cielo: aquí la página convierte.
 *
 * Es la única acción que la página quiere que ocurra (§1), así que no compite
 * con nada: sin panel que se despliega, sin pasos, sin pastillas de opciones.
 * Tres campos y un botón. Cada campo que se agrega aquí cuesta mensajes.
 *
 * **Funciona sin JavaScript**, que es requisito de §8: el `<form>` lleva
 * `method="post"` y `action`, así que sin JS el navegador envía y recarga. El
 * JavaScript de `client.js` solo mejora la validación y evita la recarga.
 *
 * Los mensajes de error están escritos en el HTML servido y ocultos con
 * `hidden`, no creados al vuelo: así reservan su espacio y aparecer no empuja
 * el formulario hacia abajo. CLS 0 también cuando algo falla.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * EL DESTINO NO EXISTE TODAVÍA. `/api/contacto` es el endpoint que este
 * formulario espera, y hoy no hay ninguno: el repositorio despliega a
 * Cloudflare Workers sirviendo solo `dist/` (wrangler.jsonc), mientras que §10
 * y §11 del brief dan por hecho Vercel con Resend. Esa contradicción es la
 * única decisión que falta para que la página esté completa, y hasta que se
 * tome NO se puede publicar: un formulario que no entrega el mensaje es peor
 * que no tenerlo.
 * ────────────────────────────────────────────────────────────────────────────
 */

export const CORREO_DE_CONTACTO = 'contacto@volutus.cl'

export default function Contacto() {
  return (
    <section id="contacto" className="seccion zona-cielo contacto">
      <div className="contenedor contacto-interior">
        <div>
          <p className="antetitulo">Cuéntanos</p>
          <h2>Dinos qué necesitas.</h2>
          <p className="entradilla contacto-entradilla">
            Te respondemos en menos de 48 horas hábiles, con un rango de precio real y lo que haría
            falta para empezar. Si prefieres el correo directo, escríbenos a{' '}
            <a href={`mailto:${CORREO_DE_CONTACTO}`}>{CORREO_DE_CONTACTO}</a>.
          </p>
        </div>

        <form className="formulario" method="post" action="/api/contacto" noValidate>
          <div className="campo">
            <label htmlFor="nombre">Tu nombre</label>
            <input id="nombre" name="nombre" type="text" autoComplete="name" required />
            <p className="campo-error" id="error-nombre" hidden>
              Falta tu nombre.
            </p>
          </div>

          <div className="campo">
            <label htmlFor="correo">Tu correo</label>
            <input id="correo" name="correo" type="email" autoComplete="email" required />
            <p className="campo-error" id="error-correo" hidden>
              Falta tu correo.
            </p>
          </div>

          <div className="campo">
            <label htmlFor="proyecto">Qué necesitas</label>
            <textarea id="proyecto" name="proyecto" rows="5" required />
            <p className="campo-error" id="error-proyecto" hidden>
              Cuéntanos qué necesitas, aunque sea en una línea.
            </p>
          </div>

          {/* Regla 4 de §7: al enviar no desaparece ni encoge. El ancho lo fija
              el texto más largo de los dos estados, reservado desde el HTML. */}
          <button className="boton boton-primario formulario-enviar" type="submit">
            Enviar mensaje
          </button>

          {/* `role="status"` para que un lector de pantalla anuncie el
              resultado sin que el foco salte. Vive en el HTML servido, vacío. */}
          <p className="formulario-aviso" role="status" hidden />
        </form>
      </div>
    </section>
  )
}
