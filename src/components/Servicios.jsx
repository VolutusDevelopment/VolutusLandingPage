import { SERVICIOS } from '../lib/servicios.js'
import Icono from './Icono.jsx'

/**
 * Servicios: los ocho, de a uno, sobre la nube fija de la portada, que se ve
 * detrás y entre uno y otro mientras la cámara baja (nubes.js). Cada scroll
 * cae en uno, al centro de la pantalla (Servicios.css). Sin tarjetas:
 * su glifo, en el color de su servicio (lib/servicios.js), el mismo de su
 * página, va como una calcomanía (Servicios.css), su nombre lleva a su página
 * y su frase dice qué es.
 *
 * El título y el índice de los ocho quedan al pie de la pantalla mientras
 * pasan, con el de la pantalla marcado (servicios.js). El índice es solo
 * para la vista: el lector de pantalla y el teclado ya recorren la lista.
 */
export default function Servicios() {
  return (
    <section id="servicios" className="seccion zona-cielo servicios" data-barra="hora-dia">
      <div className="contenedor">
        <div className="servicios-cabeza">
          <h2 className="titular entra">Nuestros servicios</h2>
          <ol className="servicios-indice" aria-hidden="true">
            {SERVICIOS.map((servicio, i) => (
              <li key={servicio.id} style={{ '--servicio': servicio.color }}>
                <a href={`#servicio-${servicio.id}`} tabIndex={-1} className={i === 0 ? 'actual' : undefined}>
                  <Icono id={servicio.id} className="servicios-indice-icono" papel />
                </a>
              </li>
            ))}
          </ol>
        </div>
        <ol className="servicios-lista">
          {SERVICIOS.map((servicio) => (
            <li
              key={servicio.id}
              id={`servicio-${servicio.id}`}
              className="servicio"
              style={{ '--servicio': servicio.color }}
            >
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
