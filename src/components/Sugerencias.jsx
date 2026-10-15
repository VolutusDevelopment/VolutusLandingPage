import Icono from './Icono.jsx'
import { tituloCorto } from '../lib/meta.js'

/**
 * Lo que se sugiere al final de las páginas de servicio y de los artículos:
 * otros servicios y otros artículos. Son los enlaces que un buscador o un
 * agente sigue para recorrer el sitio, así que van como texto y a la vista.
 */

/** Servicios de lib/servicios.js, cada uno en el color de su card. */
export function FilaDeServicios({ servicios }) {
  return (
    <ul className="fila-servicios">
      {servicios.map(({ id, ruta, nombre, color }) => (
        <li key={id} className="entra" style={{ '--tinte': color }}>
          <a href={ruta}>
            <Icono id={id} className="fila-servicios-icono" />
            {nombre}
          </a>
        </li>
      ))}
    </ul>
  )
}

/** Artículos de ARTICULOS (lib/meta.js): el título y su resumen. */
export function ListaDeArticulos({ articulos }) {
  return (
    <ul className="lista-articulos">
      {articulos.map(({ ruta, titulo, descripcion }) => (
        <li key={ruta} className="entra">
          <a href={ruta}>{tituloCorto(titulo)}</a>
          <p>{descripcion}</p>
        </li>
      ))}
    </ul>
  )
}
