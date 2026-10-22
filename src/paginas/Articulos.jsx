import Pagina from '../components/Pagina.jsx'
import Contacto from '../components/Contacto.jsx'
import FilaDeArticulo from '../components/FilaDeArticulo.jsx'
import { PAGINAS, PAGINAS_DEL_INDICE, POR_PAGINA, articulosDePagina, numeroDePagina, rutaDePagina } from '../lib/meta.js'

/**
 * El índice de artículos: guías cortas para decidir qué software necesita un
 * negocio. La lista sale sola de PAGINAS (todo lo que lleva `publicada`, ver
 * lib/meta.js), del más nuevo al más viejo, así que publicar un artículo no
 * toca esta página. Va de a doce por página (`ruta` dice cuál), con los
 * números de las demás al pie.
 *
 * Es un sumario: en la primera página, el más nuevo en una lámina oscura a
 * todo el ancho, y los demás en filas (components/FilaDeArticulo.jsx). Cada
 * uno lleva el glifo del servicio del que habla en una baldosa de su color, el
 * de su card en la rueda, con su nombre y la fecha: el índice se lee también
 * por servicio. Termina en el formulario de contacto.
 */
export default function Articulos({ ruta }) {
  const { descripcion } = PAGINAS['/articulos']
  const pagina = numeroDePagina(ruta)

  return (
    <Pagina ruta={ruta} hora="dia" className="articulos-pagina" contactoAqui cierre={<Contacto />}>
      <section className="seccion zona-cielo hora-dia cabecera-cielo">
        <div className="contenedor">
          <p className="antetitulo">{pagina === 1 ? 'Artículos' : `Artículos · página ${pagina}`}</p>
          <h1>Software, en simple</h1>
          <p className="entradilla articulo-entradilla">{descripcion}</p>
        </div>
      </section>

      <section className="seccion zona-cielo" aria-label={`Artículos, página ${pagina} de ${PAGINAS_DEL_INDICE}`}>
        <div className="contenedor">
          <ol className="articulos articulos-indice" start={(pagina - 1) * POR_PAGINA + 1}>
            {articulosDePagina(pagina).map((articulo, i) => (
              <FilaDeArticulo key={articulo.ruta} articulo={articulo} destacado={pagina === 1 && i === 0} />
            ))}
          </ol>
          {PAGINAS_DEL_INDICE > 1 && (
            <nav className="paginacion" aria-label="Páginas de artículos">
              {pagina > 1 && (
                <a className="boton boton-secundario paginacion-paso" href={rutaDePagina(pagina - 1)}>
                  <span aria-hidden="true">←</span> Anterior
                </a>
              )}
              {Array.from({ length: PAGINAS_DEL_INDICE }, (_, i) => i + 1).map((n) => (
                <a
                  key={n}
                  className="boton-cuadro"
                  href={rutaDePagina(n)}
                  aria-label={`Página ${n}`}
                  aria-current={n === pagina ? 'page' : undefined}
                >
                  {n}
                </a>
              ))}
              {pagina < PAGINAS_DEL_INDICE && (
                <a className="boton boton-secundario paginacion-paso" href={rutaDePagina(pagina + 1)}>
                  Siguiente <span aria-hidden="true">→</span>
                </a>
              )}
            </nav>
          )}
        </div>
      </section>
    </Pagina>
  )
}
