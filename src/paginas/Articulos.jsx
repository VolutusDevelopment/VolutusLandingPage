import Pagina from '../components/Pagina.jsx'
import { Invitacion } from '../components/Articulo.jsx'
import {
  PAGINAS,
  PAGINAS_DEL_INDICE,
  POR_PAGINA,
  articulosDePagina,
  fechaDe,
  numeroDePagina,
  rutaDePagina,
  tituloCorto,
} from '../lib/meta.js'
import { SERVICIOS } from '../lib/servicios.js'

/**
 * El índice de artículos: guías cortas para decidir qué software necesita un
 * negocio. La lista sale sola de PAGINAS (todo lo que lleva `publicada`, ver
 * lib/meta.js), del más nuevo al más viejo, así que publicar un artículo no
 * toca esta página. Va de a doce por página (`ruta` dice cuál), con los
 * números de las demás al pie.
 *
 * Cada artículo lleva la marca del color del servicio del que habla, el de su
 * card en la rueda: el índice se lee también por servicio.
 */
export default function Articulos({ ruta }) {
  const { descripcion } = PAGINAS['/articulos']
  const pagina = numeroDePagina(ruta)

  return (
    <Pagina ruta={ruta} hora="dia" cierre={<Invitacion />}>
      <section className="seccion zona-cielo hora-dia cabecera-cielo">
        <div className="contenedor">
          <p className="antetitulo">{pagina === 1 ? 'Artículos' : `Artículos · página ${pagina}`}</p>
          <h1>Software, en simple</h1>
          <p className="entradilla articulo-entradilla">{descripcion}</p>
        </div>
      </section>

      <section className="seccion zona-cielo" aria-label={`Artículos, página ${pagina} de ${PAGINAS_DEL_INDICE}`}>
        <div className="contenedor">
          <ol className="articulos" start={(pagina - 1) * POR_PAGINA + 1}>
            {articulosDePagina(pagina).map(({ ruta: enlace, titulo, descripcion: resumen, publicada, servicios = [] }) => {
              const servicio = SERVICIOS.find(({ id }) => id === servicios[0])
              return (
                <li key={enlace} className="entra" style={servicio && { '--tinte': servicio.color }}>
                  <p className="articulos-fecha dato">
                    <time dateTime={publicada}>{fechaDe(enlace, 'publicada')}</time>
                  </p>
                  <h2>
                    <a href={enlace}>{tituloCorto(titulo)}</a>
                  </h2>
                  <p className="articulos-resumen">{resumen}</p>
                </li>
              )
            })}
          </ol>
          {PAGINAS_DEL_INDICE > 1 && (
            <nav className="paginacion" aria-label="Páginas de artículos">
              {pagina > 1 && (
                <a className="paginacion-paso" href={rutaDePagina(pagina - 1)}>
                  <span aria-hidden="true">←</span> Anterior
                </a>
              )}
              {Array.from({ length: PAGINAS_DEL_INDICE }, (_, i) => i + 1).map((n) => (
                <a
                  key={n}
                  href={rutaDePagina(n)}
                  aria-label={`Página ${n}`}
                  aria-current={n === pagina ? 'page' : undefined}
                >
                  {n}
                </a>
              ))}
              {pagina < PAGINAS_DEL_INDICE && (
                <a className="paginacion-paso" href={rutaDePagina(pagina + 1)}>
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
