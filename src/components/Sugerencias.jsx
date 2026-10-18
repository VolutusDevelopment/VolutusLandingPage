import { tituloCorto } from '../lib/meta.js'

/**
 * Lo que se sugiere al final de las páginas de servicio y de los artículos:
 * otros artículos. Son los enlaces que un buscador o un agente sigue para
 * recorrer el sitio, así que van como texto y a la vista.
 */

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
