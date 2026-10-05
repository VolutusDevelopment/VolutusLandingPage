import { SERVICIOS } from '../lib/servicios.js'
import Icono from './Icono.jsx'

/**
 * Servicios: seis cards, una por servicio, que se ven todas a la vez y piden
 * que las toquen. Va justo después de la portada, todavía en el cielo.
 *
 * - **Desde M (768 px), la rueda.** Las cards van montadas en un anillo: la del
 *   frente se ve entera; las de los costados y la del fondo, más chicas y en
 *   sombra, pero con el número, el icono y el nombre a la vista. Se gira
 *   arrastrando, con el trackpad de lado, con las flechas o eligiendo un
 *   servicio abajo, y siempre por el camino corto. La geometría entera está en
 *   el CSS en función de un solo número, `--giro`: el HTML ya llega con la
 *   rueda en su lugar y servicios.js solo lo anima.
 * - **En S, el mazo que se apila.** Las mismas cards, una debajo de otra; al
 *   bajar, cada una se pega bajo la barra y la siguiente la tapa. Es solo CSS.
 *
 * Sin JavaScript la rueda no puede girar, así que no se arma: las seis quedan
 * en una rejilla, con todo a la vista (Servicios.css). Por lo mismo, los
 * controles solo aparecen con la rueda.
 */
export default function Servicios() {
  return (
    <section id="servicios" className="seccion zona-cielo servicios">
      <div className="contenedor">
        <h2 className="titular entra">Nuestros Servicios</h2>
      </div>

      <div className="rueda">
        <ol className="servicios-lista" style={{ '--n': SERVICIOS.length }}>
          {SERVICIOS.map((servicio, i) => (
            <li
              key={servicio.id}
              className={`servicio zona-plano${i === 0 ? ' activo' : ''}`}
              style={{ '--i': i }}
            >
              <div className="servicio-cara">
                <div className="servicio-cabecera">
                  <Icono id={servicio.id} className="servicio-icono" />
                  {/* El número es la marca de la card, no información: el
                      lector de pantalla ya anuncia la posición en la lista. */}
                  <span className="servicio-numero" aria-hidden="true">
                    {i + 1}
                  </span>
                </div>
                <h3 className="servicio-nombre">{servicio.nombre}</h3>
                <p className="servicio-texto">{servicio.texto}</p>
                <ol className="servicio-puntos">
                  {servicio.puntos.map((punto) => (
                    <li key={punto}>{punto}</li>
                  ))}
                </ol>
                {servicio.enlace && (
                  <p className="servicio-enlace">
                    <a
                      className="boton boton-secundario"
                      href={servicio.enlace.href}
                      // Arrastrar el enlace lo sacaría de la página en vez de
                      // girar la rueda.
                      draggable="false"
                      {...(servicio.enlace.href.startsWith('http') && { rel: 'noopener' })}
                    >
                      {servicio.enlace.texto}
                    </a>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="contenedor servicios-controles">
        <button type="button" className="servicios-flecha" data-sentido="-1" aria-label="Servicio anterior">
          <Icono id="anterior" className="servicios-flecha-icono" />
        </button>
        <ul className="servicios-chips">
          {SERVICIOS.map((servicio, i) => (
            <li key={servicio.id}>
              <button type="button" className="servicios-chip" aria-current={i === 0 ? 'true' : undefined}>
                {servicio.nombre}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="servicios-flecha" data-sentido="1" aria-label="Servicio siguiente">
          <Icono id="siguiente" className="servicios-flecha-icono" />
        </button>
      </div>

      {/* Quien no ve la rueda oye cuál quedó al frente al usar los controles. */}
      <p className="solo-lectores servicios-aviso" aria-live="polite" />
    </section>
  )
}
