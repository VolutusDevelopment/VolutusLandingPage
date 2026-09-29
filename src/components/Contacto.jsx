import { SERVICIOS } from '../lib/servicios.js'


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
 * `hidden`, no creados al vuelo. Ojo: `hidden` por sí solo NO reserva espacio
 * —es `display: none`— y durante un tiempo eso movió el botón de enviar hacia
 * abajo en cuanto aparecía el primer error. El hueco lo reserva el CSS, que le
 * devuelve el `display` y lo esconde con `visibility`.
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
          <p className="antetitulo entra">Cuéntanos</p>
          <h2 className="entra">¿Qué estás resolviendo a mano?</h2>
          {/* Antes eran 65 palabras antes del primer campo: una entradilla de dos
              frases, tres promesas en lista y la línea del correo. Las tres
              promesas dicen una sola cosa —quién, cuándo y con qué te
              contestamos— y caben en una frase. «En tus palabras» sustituye a
              «no hace falta que sepas cómo se resuelve», que decía lo mismo en
              el doble, y va en la etiqueta del mensaje, que es donde se escribe.
              El compromiso de las 48 horas es el de §5, sin cambios. */}
          <p className="entradilla contacto-entradilla">
            Te responde una persona en menos de 48 horas hábiles, con un rango de precio real.
          </p>

          <p className="contacto-alternativa">
            O escríbenos a <a href={`mailto:${CORREO_DE_CONTACTO}`}>{CORREO_DE_CONTACTO}</a>
          </p>
        </div>

        {/* El formulario vive dentro de una tarjeta y no suelto sobre el fondo.
            Es lo que hacen Supabase y Linear, y el motivo se ve al comparar:
            sobre un fondo casi blanco, unos campos blancos no se distinguen y
            el bloque entero se lee como texto con rayas. Dentro de una
            superficie con su borde, el formulario es un objeto. */}
        <form className="formulario tarjeta" method="post" action="/api/contacto" noValidate>
          {/* Nombre y correo en dos columnas: son cortos y ponerlos uno debajo
              de otro alarga el formulario sin necesidad. En S vuelven a una. */}
          <div className="formulario-fila">
            <div className="campo">
              <label htmlFor="nombre">Tu nombre</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                placeholder="Ana Soto"
                required
              />
              <p className="campo-error" id="error-nombre" hidden>
                Falta tu nombre.
              </p>
            </div>

            <div className="campo">
              <label htmlFor="correo">Tu correo</label>
              <input
                id="correo"
                name="correo"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck="false"
                autoCapitalize="off"
                placeholder="ana@tuempresa.cl"
                required
              />
              <p className="campo-error" id="error-correo" hidden>
                Falta tu correo.
              </p>
            </div>
          </div>

          {/* Opcional a propósito: sirve para repartir el mensaje, no para
              filtrar a nadie, y quien no sabe qué pedir no debe quedarse
              atascado aquí. Las tres opciones son las que la página respalda
              con obra —la web y la app de PonleNota, el agente del hackathon—;
              «Otro» recoge el resto. La primera opción está desactivada, así
              que si nadie elige, el campo simplemente no se envía. */}
          <div className="campo">
            <label htmlFor="servicio">Qué necesitas</label>
            <select id="servicio" name="servicio" defaultValue="">
              <option value="" disabled>
                Elige una opción
              </option>
              {SERVICIOS.map((servicio) => (
                <option key={servicio}>{servicio}</option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="proyecto">El problema, en tus palabras</label>
            {/* El marcador de posición enseña QUÉ clase de respuesta sirve, que
                es la duda real de quien se queda mirando un recuadro vacío. */}
            <textarea
              id="proyecto"
              name="proyecto"
              rows="3"
              placeholder="Anotamos las reservas en un cuaderno y se nos pierden."
              required
            />
            <p className="campo-error" id="error-proyecto" hidden>
              Falta el problema.
            </p>
          </div>

          {/* Trampa para robots. No es un campo del diseño —§7 lista los que
              hay y este no está— sino una defensa del endpoint, que es público
              y cualquiera puede llamar. Una persona nunca lo ve ni lo rellena;
              un robot que completa todo lo que encuentra, sí, y el Worker
              descarta ese envío en silencio.

              `aria-hidden` y `tabIndex` lo sacan también del recorrido de
              teclado y del lector de pantalla: esconderlo solo con CSS lo
              habría dejado en medio del formulario para quien navega a ciegas. */}
          <div className="trampa" aria-hidden="true">
            <label htmlFor="empresa">No rellenes este campo</label>
            <input id="empresa" name="empresa" type="text" tabIndex={-1} autoComplete="off" />
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
