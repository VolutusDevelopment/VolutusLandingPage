import { OPCIONES_DE_CONTACTO } from '../lib/servicios.js'
import Icono from './Icono.jsx'

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
 * **Funciona sin JavaScript**, que es requisito de §8: el `<form>` lleva
 * `method="post"` y `action`, así que sin JS el navegador envía y recarga. El
 * JavaScript de `client.js` solo mejora la validación y evita la recarga. Las
 * opciones de «Qué necesitas» son casillas nativas: se marcan y se envían sin
 * una línea de código.
 *
 * Los mensajes de error están escritos en el HTML servido y ocultos con
 * `hidden`, no creados al vuelo. Ojo: `hidden` por sí solo NO reserva espacio
 * —es `display: none`— y durante un tiempo eso movió el botón de enviar hacia
 * abajo en cuanto aparecía el primer error. El hueco lo reserva el CSS, que le
 * devuelve el `display` y lo esconde con `visibility`.
 */

export const CORREO_DE_CONTACTO = 'contacto@volutus.cl'

// Lo que trae quien llega (§2), dicho como lo diría: cada problema es uno de
// los servicios visto desde el otro lado del mostrador.
const PROBLEMAS = [
  { icono: 'automatizacion', texto: 'Copias datos de una planilla a otra, a mano.' },
  { icono: 'web', texto: 'Te buscan en Google y no te encuentran.' },
  { icono: 'agente', texto: 'Respondes lo mismo todo el día por WhatsApp.' },
]

export default function Contacto() {
  return (
    <section id="contacto" className="seccion zona-plano hondura-3 contacto">
      <div className="contenedor contacto-interior">
        <div className="contacto-relato">
          <p className="antetitulo entra">Cuéntanos</p>
          <h2 className="entra">¿Qué estás resolviendo a mano?</h2>
          {/* Una frase: quién te contesta y cuándo. El compromiso de las 48
              horas es el de §5, sin cambios. */}
          <p className="entradilla contacto-entradilla">
            Te responde una persona en menos de 48 horas hábiles.
          </p>

          <ul className="contacto-problemas">
            {PROBLEMAS.map(({ icono, texto }) => (
              <li key={icono}>
                <Icono id={icono} className="contacto-icono" />
                {texto}
              </li>
            ))}
          </ul>

          <p className="contacto-nosotros">
            <a href="/nosotros">Conoce quiénes somos</a>
          </p>
        </div>

        <form className="formulario tarjeta zona-cielo" method="post" action="/api/contacto" noValidate>
          <h3 className="formulario-titulo">Escríbenos</h3>

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
              atascado aquí. Se puede marcar más de una, porque una tienda
              suele venir con su automatización. Las opciones son los servicios
              de más arriba, sacados de la misma lista (`lib/servicios.js`), y
              «Otro» recoge el resto. */}
          <fieldset className="campo opciones">
            <legend>Qué necesitas</legend>
            <div className="chips">
              {OPCIONES_DE_CONTACTO.map((opcion) => (
                <label key={opcion} className="chip">
                  <input type="checkbox" name="servicio" value={opcion} />
                  {opcion}
                </label>
              ))}
            </div>
          </fieldset>

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

          {/* Regla 4 de §7: al enviar no desaparece ni encoge. El correo va al
              lado, como segunda puerta para quien prefiere escribir desde el
              suyo: es la acción secundaria aceptable de §1. */}
          <div className="formulario-acciones">
            <button className="boton boton-primario formulario-enviar" type="submit">
              Enviar mensaje
            </button>
            <a className="boton boton-secundario" href={`mailto:${CORREO_DE_CONTACTO}`}>
              {CORREO_DE_CONTACTO}
            </a>
          </div>

          {/* `role="status"` para que un lector de pantalla anuncie el
              resultado sin que el foco salte. Vive en el HTML servido, vacío. */}
          <p className="formulario-aviso" role="status" hidden />
        </form>
      </div>
    </section>
  )
}
