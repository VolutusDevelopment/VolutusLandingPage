import Pagina from '../components/Pagina.jsx'
import Contacto from '../components/Contacto.jsx'
import Icono from '../components/Icono.jsx'
import { PAGINAS } from '../lib/meta.js'
import { SERVICIOS } from '../lib/servicios.js'
import { PAGINAS_DE_SERVICIO } from '../data/paginas-de-servicio.js'

/**
 * El índice de servicios, la madre de las páginas de /servicios/…. Abre bajo
 * la nube, vista con su propia cámara (`lejos`, lib/volutus.js).
 *
 * La rueda de la portada ya explica cada servicio y su página lo cuenta
 * entero, así que aquí no se explica: cada servicio es la portada de su
 * página en chico, el cielo en su color con su glifo, su nombre y su titular
 * (data/paginas-de-servicio.js), y entero lleva a ella.
 *
 * Cierra con el formulario, como cada servicio: quien ya eligió, escribe aquí.
 */

// La ley de datos no tiene página de servicio: lleva a la guía de la ley
// (/ley21719), así que su titular va aquí.
const TITULAR_LEY_DE_DATOS = 'Cumple la ley de datos'

export default function IndiceDeServicios({ ruta }) {
  const { descripcion } = PAGINAS[ruta]

  return (
    <Pagina ruta={ruta} hora="dia" contactoAqui cierre={<Contacto />}>
      <section className="seccion zona-cielo hora-dia cabecera-cielo indice-cabecera">
        <div className="indice-cielo">
          <canvas className="nubes" data-vista="cielo" data-perspectiva="lejos" aria-hidden="true" />
        </div>
        <div className="contenedor indice-cabecera-texto">
          <p className="antetitulo">Servicios</p>
          <h1>Lo que hacemos</h1>
        </div>
      </section>

      <section className="seccion zona-cielo" aria-label="Todos los servicios">
        <div className="contenedor">
          <ul className="indice-servicios">
            {SERVICIOS.map(({ id, color, ruta: destino, enlace, nombre }) => (
              <li key={id} className="indice-servicio hora-dia entra" style={{ '--tinte': color }}>
                <Icono id={id} className="indice-servicio-icono" />
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
    </Pagina>
  )
}
