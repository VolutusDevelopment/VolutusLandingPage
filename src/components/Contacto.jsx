import { OPCIONES_DE_CONTACTO } from '../lib/servicios.js'
import {
  CORREO_DE_CONTACTO,
  ERRORES,
  LIMITES,
  PLACEHOLDERS,
  TITULOS_DEL_CONTACTO,
  WHATSAPP_DE_CONTACTO,
} from '../lib/contacto.js'

/**
 * Contacto (DESIGN-BRIEF §4, bloque 5): aquí la página convierte. Es la última
 * hondura de la caída, justo antes del mar, y la composición es la del
 * formulario de surgehq.ai/enterprise: a la izquierda, una tarjeta oscura con
 * el titular y los problemas que trae quien llega; a la derecha, el formulario
 * en una tarjeta clara montada encima, que sobresale por arriba y por abajo.
 *
 * Que el formulario sea claro no es un adorno: A.4 descartó bajar la página
 * entera a oscuro porque dejaba los campos sobre fondo oscuro, peor para
 * convertir y más frágil en accesibilidad. La tarjeta clara deja caer la
 * página hasta el mar sin pagar ese precio.
 *
 * El `<form>` lleva `method="post"` y `action`, pero el envío exige el token
 * de Turnstile, que solo existe con JavaScript: sin él, el Worker responde con
 * una página que ofrece el correo directo. Las
 * opciones de «Qué necesitas» son casillas nativas: se marcan y se envían sin
 * una línea de código.
 *
 * «Enviar por» va primero, porque decide qué se pide: por correo, el Worker
 * manda el mensaje y el correo es obligatorio; por WhatsApp, client.js abre el
 * chat con el nombre, los servicios y el mensaje ya escritos, y el correo pasa
 * a opcional, como dice la nota que aparece bajo su casilla.
 *
 * Los mensajes de error están escritos en el HTML servido y ocultos con
 * `hidden`, no creados al vuelo. Ojo: `hidden` por sí solo NO reserva espacio
 * —es `display: none`— y durante un tiempo eso movió el botón de enviar hacia
 * abajo en cuanto aparecía el primer error. El hueco lo reserva el CSS, que le
 * devuelve el `display` y lo esconde con `visibility`.
 *
 * Lleva las anotaciones de WebMCP, para que un agente de IA pueda rellenarlo.
 * Rellenarlo, no enviarlo: sin `toolautosubmit`, el navegador deja el foco en
 * «Enviar mensaje» y la persona revisa lo escrito antes de mandarlo, porque es
 * un mensaje a personas de verdad.
 *
 * El correo, el WhatsApp y los textos de los campos viven en `lib/contacto.js`.
 */

// Lo que trae quien llega (§2), dicho como lo diría: cada problema es uno de
// los servicios visto desde el otro lado del mostrador.

// `marcado` es la opción de «Qué necesitas» que llega marcada: en la página de
// un servicio, ese servicio. Se puede desmarcar como cualquier otra.
//
// El titular es una frase de TITULOS_DEL_CONTACTO: el HTML trae la primera y
// titular-del-contacto.js elige una al azar al cargar la página. Cada una va
// también en una copia invisible que mide su alto (Contacto.css), así que
// cambiarla no mueve nada.
export default function Contacto({ marcado }) {
  return (
    <section id="contacto" className="seccion zona-cielo contacto" aria-labelledby="contacto-titulo">
      <div className="contenedor contacto-interior">
        <div className="contacto-relato zona-plano">
          <div className="contacto-titular">
            <h2 id="contacto-titulo" className="titular entra">
              {TITULOS_DEL_CONTACTO[0]}
            </h2>
            {TITULOS_DEL_CONTACTO.map((titulo) => (
              <span key={titulo} className="titular" data-titulo={titulo} aria-hidden="true" />
            ))}
          </div>
        </div>

        <form
          className="formulario tarjeta"
          method="post"
          action="/api/contacto"
          noValidate
          toolname="escribir_a_volutus"
          tooldescription="Escribe un mensaje a Volutus, empresa chilena de desarrollo de software, para cotizar o conversar un proyecto. La persona lo revisa y lo envía."
        >
          {/* «Enviar por» va al lado del título donde caben los dos, y
              debajo, con su leyenda a la vista, donde no (Contacto.css). */}
          <div className="formulario-cabeza">
            <h3 className="formulario-titulo">Escríbenos</h3>

            {/* Radios nativos con las mismas pastillas de «Qué necesitas»: las
                flechas cambian de opción sin código. Sin JavaScript, WhatsApp
                cae en el envío normal, y el Worker responde con su página de
                siempre, que ofrece el correo. */}
            {WHATSAPP_DE_CONTACTO && (
              <fieldset
                className="campo opciones opciones-canal"
                toolparamdescription="Por dónde se envía el mensaje: correo o WhatsApp"
              >
                <legend>Enviar por</legend>
                <div className="chips">
                  <label className="chip">
                    <input type="radio" name="canal" value="correo" defaultChecked />
                    Correo
                  </label>
                  <label className="chip chip-whatsapp">
                    <input type="radio" name="canal" value="whatsapp" />
                    WhatsApp
                    <svg className="doble-tick" viewBox="0 0 16 10" aria-hidden="true">
                      <path d="M1.5 5.5l3 3 6.5-7" />
                      <path d="M7 7l1.5 1.5 6.5-7" />
                    </svg>
                  </label>
                </div>
              </fieldset>
            )}
          </div>

          {/* Nombre y correo en dos columnas, también en S: son cortos, y uno
              debajo de otro el formulario no cabía en la pantalla del celular. */}
          <div className="formulario-fila">
            <div className="campo">
              <input
                id="nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                maxLength={LIMITES.nombre}
                placeholder={PLACEHOLDERS.nombre}
                toolparamdescription="Nombre de quien escribe"
                required
              />
              <p className="campo-error" id="error-nombre" hidden>
                {ERRORES.nombre}
              </p>
            </div>

            <div className="campo">
              <input
                id="correo"
                name="correo"
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={LIMITES.correo}
                spellCheck="false"
                autoCapitalize="off"
                placeholder={PLACEHOLDERS.correo}
                toolparamdescription="Correo donde responderle; opcional si se envía por WhatsApp"
                required
              />
              <p className="campo-error" id="error-correo" hidden>
                {ERRORES.correo}
              </p>
              {/* Con WhatsApp el correo es opcional, y lo dice aquí, en el
                  hueco de su aviso: aparecer no empuja nada (Contacto.css). */}
              {WHATSAPP_DE_CONTACTO && <p className="campo-opcional">Opcional</p>}
            </div>
          </div>

          {/* Opcional a propósito: sirve para repartir el mensaje, no para
              filtrar a nadie, y quien no sabe qué pedir no debe quedarse
              atascado aquí. Se puede marcar más de una, porque una tienda
              suele venir con su automatización. Las opciones son los servicios
              de más arriba, sacados de la misma lista (`lib/servicios.js`), y
              «Otro» recoge el resto. */}
          <fieldset
            className="campo opciones opciones-servicio"
            toolparamdescription="Servicios que necesita: uno, varios o ninguno"
          >
            <legend>Dinos lo que necesitas</legend>
            <div className="chips">
              {OPCIONES_DE_CONTACTO.map((opcion) => (
                <label key={opcion} className="chip">
                  <input type="checkbox" name="servicio" value={opcion} defaultChecked={opcion === marcado} />
                  {opcion}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Trampa para robots. No es un campo del diseño —§7 lista los que
              hay y este no está— sino una defensa del endpoint, que es público
              y cualquiera puede llamar. Una persona nunca lo ve ni lo rellena;
              un robot que completa todo lo que encuentra, sí, y el Worker
              descarta ese envío en silencio.

              `aria-hidden` y `tabIndex` lo sacan también del recorrido de
              teclado y del lector de pantalla: esconderlo solo con CSS lo
              habría dejado en medio del formulario para quien navega a ciegas.

              El nombre no significa nada a propósito: «empresa» lo reconocía el
              autocompletado del navegador como organización y lo rellenaba,
              y el Worker descartaba el mensaje de una persona real. */}
          <div className="trampa" aria-hidden="true">
            <label htmlFor="hp_campo">No rellenes este campo</label>
            <input id="hp_campo" name="hp_campo" type="text" tabIndex={-1} autoComplete="new-password" />
          </div>

          {/* Turnstile monta aquí su comprobación, invisible salvo que dude.
              El script lo descarga client.js al primer foco en el formulario. */}
          <div className="turnstile" />

          {/* El mensaje es un «composer»: un solo cuadro con el texto arriba y,
              en su base, el botón de enviar. Un `<textarea>` no puede contener
              otros elementos, así que el cuadro lo dibuja el envoltorio y la
              barra va DEBAJO del texto, no encima: ninguna palabra puede
              quedar tapada por el botón, mida lo que mida la pantalla. Parte
              en dos líneas y se agranda desde la esquina. El contador va
              debajo, en la línea que el aviso ya tiene reservada: dentro de la
              barra le sumaba una fila en el celular. El tope lo impone
              `maxLength`; el contador solo lo muestra. Regla 4 de §7: al
              enviar, el botón no desaparece ni encoge (ver Contacto.css). */}
          <div className="campo">
            <div className="composer">
              <textarea
                id="proyecto"
                name="proyecto"
                rows="2"
                maxLength={LIMITES.proyecto}
                placeholder={PLACEHOLDERS.proyecto}
                aria-describedby="cuenta-proyecto"
                toolparamdescription="Qué necesita resolver, en sus palabras"
                required
              />
              <div className="composer-barra">
                <button className="boton boton-primario formulario-enviar" type="submit">
                  Enviar mensaje
                </button>
              </div>
            </div>
            <div className="campo-pie">
              <p className="campo-error" id="error-proyecto" hidden>
                {ERRORES.proyecto}
              </p>
              <p className="campo-cuenta" id="cuenta-proyecto">
                <span className="campo-cuenta-n">0</span> / {LIMITES.proyecto}
              </p>
            </div>
          </div>
        </form>

        {/* El resultado del envío —el agradecimiento o el fallo— aparece como
            un toast que sube desde abajo, dejando el formulario a la vista.
            Vive en el HTML servido, vacío y oculto; client.js lo rellena. Es
            `position: fixed`, así que su sitio en el DOM no condiciona dónde se
            ve. El correo solo se muestra en el fallo, como salida directa. */}
        <div className="contacto-toast" role="status" hidden>
          <span className="contacto-toast-marca" aria-hidden="true" />
          <div className="contacto-toast-cuerpo">
            <p className="contacto-toast-titulo" />
            <p className="contacto-toast-texto" />
            <a className="contacto-toast-correo" href={`mailto:${CORREO_DE_CONTACTO}`}>
              {CORREO_DE_CONTACTO}
            </a>
          </div>
          <button className="boton-cuadro contacto-toast-cerrar" type="button" aria-label="Cerrar aviso">
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </div>
    </section>
  )
}
