import Icono from './Icono.jsx'
import { fechaDe, tituloCorto } from '../lib/meta.js'
import { servicioDeArticulo } from '../lib/servicios.js'

/**
 * Un artículo en una fila del índice de /articulos (paginas/Articulos.jsx) y de
 * los relacionados al pie de cada artículo (components/Articulo.jsx): el glifo
 * del servicio del que habla en una baldosa de su color, con su nombre y la
 * fecha, el título y el resumen. El que habla de todos lleva la hoja de una
 * guía. La fila entera lleva al artículo (Articulos.css).
 *
 * `destacado` es el más nuevo del índice, en una lámina oscura; `nivel`, la
 * etiqueta de su título según dónde va la fila.
 */
export default function FilaDeArticulo({ articulo, destacado = false, nivel: Titulo = 'h2' }) {
  const { ruta, titulo, descripcion, publicada } = articulo
  const servicio = servicioDeArticulo(articulo)

  return (
    <li
      className={destacado ? 'articulos-destacado zona-plano entra' : 'entra'}
      style={servicio && { '--tinte': servicio.color }}
    >
      <div className="articulos-tapa">
        <Icono id={servicio?.id ?? 'guia'} />
      </div>
      <p className="articulos-meta dato">
        <span className="articulos-servicio">{servicio?.nombre ?? 'Todos los servicios'}</span>
        <time dateTime={publicada}>{fechaDe(ruta, 'publicada')}</time>
      </p>
      <Titulo>
        <a href={ruta}>{tituloCorto(titulo)}</a>
      </Titulo>
      <p className="articulos-resumen">{descripcion}</p>
    </li>
  )
}
