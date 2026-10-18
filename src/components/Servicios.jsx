import { SERVICIOS } from '../lib/servicios.js'
import Icono from './Icono.jsx'

/**
 * Servicios: ocho cards, una por servicio, que se ven todas a la vez y piden
 * que las toquen. Va justo después de la portada, todavía en el cielo. Cada
 * card lleva el color de su servicio (lib/servicios.js), el mismo de su
 * página.
 *
 * Van en una rueda, en todos los tamaños: las cards montadas en un anillo, la
 * del frente entera; las demás, más chicas y en sombra, asoman detrás de
 * ella; la del fondo se desvanece. Se gira arrastrando (con el dedo en el teléfono), con el trackpad
 * de lado o pulsando una que asoma; el scroll vertical no la mueve. La
 * geometría entera está en el CSS en función de un solo número, `--giro`: el
 * HTML ya llega con la rueda en su lugar y servicios.js solo lo anima.
 *
 * Sin JavaScript la rueda no puede girar, así que no se arma: las ocho quedan
 * enteras, una bajo otra en S y en rejilla desde M (Servicios.css).
 */
export default function Servicios() {
  return (
    <section id="servicios" className="seccion zona-cielo servicios">
      <div className="contenedor">
        <h2 className="titular entra">Nuestros servicios</h2>
      </div>

      <div className="rueda">
        <ol className="servicios-lista" style={{ '--n': SERVICIOS.length }}>
          {SERVICIOS.map((servicio, i) => (
            <li
              key={servicio.id}
              className={`servicio zona-plano${i === 0 ? ' activo' : ''}`}
              style={{ '--i': i, '--panel': servicio.color }}
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
                {/* El nombre lleva a la página del servicio o, en la ley
                    de datos, a su guía. La flecha la pone el CSS, para que
                    no entre en el aviso de la card que queda al frente
                    (servicios.js). */}
                <h3 className="servicio-nombre">
                  <a href={servicio.ruta ?? servicio.enlace} draggable="false">
                    {servicio.nombre}
                  </a>
                </h3>
                <p className="servicio-texto">{servicio.texto}</p>
                <ol className="servicio-puntos">
                  {servicio.puntos.map((punto) => (
                    <li key={punto}>{punto}</li>
                  ))}
                </ol>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Quien no ve la rueda oye cuál quedó al frente al girar la rueda. */}
      <p className="solo-lectores servicios-aviso" aria-live="polite" />
    </section>
  )
}
