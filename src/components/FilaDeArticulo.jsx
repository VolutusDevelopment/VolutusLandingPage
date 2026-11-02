import Icono from './Icono.jsx'
import { socioDe } from '../data/socios.js'
import { fechaDe, tituloCorto } from '../lib/meta.js'
import { servicioDeArticulo } from '../lib/servicios.js'

/**
 * Un artículo en una fila del índice de /articulos (paginas/Articulos.jsx), de
 * las opiniones (paginas/Opiniones.jsx) y de los relacionados al pie de cada
 * artículo (components/Articulo.jsx). Una guía lleva el glifo del servicio del
 * que habla en una baldosa de su color, con su nombre; la que habla de todos
 * lleva la hoja de una guía. Una opinión lleva la cara de quien la firma y su
 * nombre. Después, el título y el resumen; la fecha no se muestra, queda en
 * los datos estructurados. La fila entera lleva al artículo (Articulos.css).
 *
 * `destacado` es la guía más nueva del índice, en una lámina oscura; `nivel`,
 * la etiqueta de su título según dónde va la fila. `diario` es la entrada del
 * índice de opiniones: la foto de portada del artículo en vez del glifo, y en
 * la línea de la firma la cara, el nombre y el día en que se publicó, bajo el resumen.
 */
export default function FilaDeArticulo({ articulo, destacado = false, diario = false, nivel: Titulo = 'h2' }) {
  const { ruta, titulo, descripcion, autor, portada } = articulo
  const servicio = servicioDeArticulo(articulo)
  const firma = autor && socioDe(autor)

  return (
    <li
      className={destacado ? 'articulos-destacado zona-plano entra' : 'entra'}
      style={servicio && { '--tinte': servicio.color }}
    >
      {diario ? (
        <img
          className="articulos-foto"
          src={`/image/${portada}-800.webp`}
          srcSet={`/image/${portada}-800.webp 800w, /image/${portada}-1600.webp 1600w`}
          sizes="(min-width: 640px) 260px, 100vw"
          alt=""
          width={800}
          height={500}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="articulos-tapa">
          {firma ? (
            <img className="articulos-cara" src={firma.avatar} alt="" width={120} height={120} decoding="async" />
          ) : (
            <Icono id={servicio?.id ?? 'guia'} />
          )}
        </div>
      )}
      <p className="articulos-meta dato">
        {diario && <img className="articulos-cara" src={firma.avatar} alt="" width={36} height={36} decoding="async" />}
        {firma ? `${firma.nombre} ${firma.apellidos}` : (servicio?.nombre ?? 'Todos los servicios')}
        {diario && <time dateTime={articulo.publicada}>{fechaDe(ruta, 'publicada')}</time>}
      </p>
      <Titulo>
        <a href={ruta}>{tituloCorto(titulo)}</a>
      </Titulo>
      <p className="articulos-resumen">{descripcion}</p>
    </li>
  )
}
