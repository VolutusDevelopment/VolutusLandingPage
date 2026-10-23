import { SERVICIOS } from '../lib/servicios.js'
import Icono from './Icono.jsx'

/**
 * Servicios: los ocho, de a uno, sobre la nube fija de la portada, que se ve
 * detrás y entre uno y otro mientras la cámara baja (nubes.js). Sin tarjetas:
 * su glifo, en el color de su servicio (lib/servicios.js), el mismo de su
 * página, va como una calcomanía (Servicios.css), su nombre lleva a su página
 * y su frase dice qué es.
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
