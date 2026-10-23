import { SERVICIOS } from '../lib/servicios.js'
import Icono from './Icono.jsx'

/**
 * Servicios: los ocho a la vista, en una retícula a todo el ancho y sin
 * tarjetas, para que la nube de la portada se vea detrás. Cada uno lleva una
 * raya del color de su servicio (lib/servicios.js), el mismo de su página.
 */
export default function Servicios() {
  return (
    <section id="servicios" className="seccion zona-cielo servicios" data-barra="hora-dia">
      <div className="contenedor">
        <h2 className="titular entra">Nuestros servicios</h2>
        <ol className="servicios-lista">
          {SERVICIOS.map((servicio) => (
            <li key={servicio.id} className="servicio" style={{ '--servicio': servicio.color }}>
              <Icono id={servicio.id} className="servicio-icono" papel />
              <h3 className="servicio-nombre">
                <a href={servicio.ruta ?? servicio.enlace}>{servicio.nombre}</a>
              </h3>
              <p className="servicio-texto">{servicio.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
