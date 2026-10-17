import Pagina from '../components/Pagina.jsx'
import Contacto from '../components/Contacto.jsx'
import Icono from '../components/Icono.jsx'
import Pieza from '../components/Pieza.jsx'
import { SERVICIOS } from '../lib/servicios.js'
import { PAGINAS_DE_SERVICIO } from '../data/paginas-de-servicio.js'

/**
 * El índice de servicios, la madre de las páginas de /servicios/…. Abre con
 * el título dentro de la nube, vista desde abajo con su propia cámara
 * (`abajo`, lib/volutus.js), con la entradilla y el botón al formulario,
 * para quien ya sabe lo que quiere.
 *
 * La rueda de la portada ya explica cada servicio y su página lo cuenta
 * entero, así que aquí no se explica: cada servicio es la portada de su
 * página en chico, el cielo en su color con su pieza (Pieza.jsx), su nombre
 * en grande, que es lo que se busca aquí, y el titular de su página
 * (data/paginas-de-servicio.js), y entero lleva a ella. La ley de datos no
 * tiene página ni pieza: lleva su glifo.
 *
 * Debajo, lo que se pregunta antes de pedir una cotización. El precio de
 * cada servicio se estima en su página (decisión 48 del brief).
 *
 * Cierra con el formulario, como cada servicio: quien ya eligió, escribe aquí.
 */

// La ley de datos no tiene página de servicio: lleva a la guía de la ley
// (/ley21719), así que su titular va aquí.
const TITULAR_LEY_DE_DATOS = 'Cumple la ley de datos'

export default function IndiceDeServicios({ ruta }) {
  return (
    <Pagina ruta={ruta} hora="dia" contactoAqui cierre={<Contacto />}>
      <section className="seccion zona-cielo hora-dia cabecera-cielo indice-cabecera">
        <div className="contenedor indice-cabecera-texto">
          <div className="indice-cielo">
            <canvas className="nubes" data-vista="cielo" data-perspectiva="abajo" aria-hidden="true" />
          </div>
          <h1>Nuestros servicios</h1>
          <p className="entradilla">Elige lo que necesita tu negocio.</p>
          <p className="indice-acciones">
            <a className="boton boton-primario" href="#contacto">
              Cuéntanos tu proyecto
            </a>
          </p>
        </div>
      </section>

      <section className="seccion zona-cielo" aria-label="Todos los servicios">
        <div className="contenedor">
          <ul className="indice-servicios">
            {SERVICIOS.map(({ id, color, ruta: destino, enlace, nombre }) => (
              <li key={id} className="indice-servicio hora-dia entra" style={{ '--tinte': color }}>
                {destino ? <Pieza id={id} /> : <Icono id={id} className="indice-servicio-icono" />}
                <h2 className="indice-servicio-nombre">
                  <a href={destino ?? enlace}>{nombre}</a>
                </h2>
                <p className="indice-servicio-titular">
                  {PAGINAS_DE_SERVICIO[id]?.titular ?? TITULAR_LEY_DE_DATOS}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="seccion zona-cielo" aria-labelledby="saber-titulo">
        <div className="contenedor">
          <h2 id="saber-titulo" className="entra">
            Antes de escribirnos
          </h2>
          <ul className="indice-saber">
            <li className="entra">
              <h3>Un estimado en cada servicio</h3>
              <p>En su página calculas cuánto costaría. Es un estimado: lo que necesites puede cambiar el precio final.</p>
            </li>
            <li className="entra">
              <h3>Cada solución es única</h3>
              <p>La diseñamos para tu negocio y tu forma de trabajar, no sobre una plantilla.</p>
            </li>
            <li className="entra">
              <h3>Alcance y precio, sin compromiso</h3>
              <p>Te respondemos pronto, y te los mandamos cuando entendemos tu proyecto.</p>
            </li>
            <li className="entra">
              <h3>Contratas solo lo que necesitas</h3>
              <p>Cada servicio es independiente: no necesitas contratar otro antes ni después.</p>
            </li>
          </ul>
        </div>
      </section>
    </Pagina>
  )
}
