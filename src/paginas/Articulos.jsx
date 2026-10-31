import Pagina from '../components/Pagina.jsx'
import Contacto from '../components/Contacto.jsx'
import FilaDeArticulo from '../components/FilaDeArticulo.jsx'
import Icono from '../components/Icono.jsx'
import { SERVICIOS } from '../lib/servicios.js'
import {
  GUIAS,
  OPINIONES,
  PAGINAS,
  PAGINAS_DEL_INDICE,
  POR_PAGINA,
  articulosDePagina,
  numeroDePagina,
  rutaDePagina,
} from '../lib/meta.js'

// Las opiniones que caben en la tira; las demás, en /articulos/opiniones.
const EN_LA_TIRA = 5

// Las baldosas de la cabecera: tres servicios, en su color.
const EMBLEMA = ['web', 'agente', 'tienda'].map((id) => SERVICIOS.find((servicio) => servicio.id === id))

/**
 * El índice de artículos. La lista sale sola de PAGINAS (todo lo que lleva
 * `publicada`, ver lib/meta.js), del más nuevo al más viejo, así que publicar
 * un artículo no toca esta página.
 *
 * La cabecera dice lo que hay, guías y opiniones, con tres baldosas de
 * servicios a la derecha que hacen su gesto al cargar. En la primera página,
 * debajo, un salto a cada sección con cuántas hay.
 *
 * En la primera página van primero las opiniones: las cinco más nuevas en una
 * tira que se desliza de lado y, al final, la entrada a todas
 * (paginas/Opiniones.jsx). Después, las guías, un sumario de a doce por página
 * (`ruta` dice cuál), con los números de las demás al pie: la más nueva en una
 * lámina oscura a todo el ancho y las demás en filas
 * (components/FilaDeArticulo.jsx). Cada guía lleva el glifo del servicio del
 * que habla en una baldosa de su color, con su nombre y la fecha: el índice se
 * lee también por servicio. Termina en el formulario de contacto.
 */
export default function Articulos({ ruta }) {
  const { descripcion } = PAGINAS['/articulos']
  const pagina = numeroDePagina(ruta)

  return (
    <Pagina ruta={ruta} hora="dia" className="articulos-pagina" contactoAqui cierre={<Contacto />}>
      <section className="seccion zona-cielo hora-dia cabecera-cielo">
        <div className="contenedor articulos-cabecera">
          <p className="antetitulo">{pagina === 1 ? 'Artículos' : `Artículos · página ${pagina}`}</p>
          <div className="articulos-emblema" aria-hidden="true">
            {EMBLEMA.map(({ id, color }) => (
              <span key={id} style={{ '--tinte': color }}>
                <Icono id={id} />
              </span>
            ))}
          </div>
          <h1>
            <span>Guías para decidir,</span> <span>opiniones para pensar</span>
          </h1>
          <p className="entradilla articulo-entradilla">{descripcion}</p>
          {pagina === 1 && (
            <p className="articulos-saltos">
              <a className="boton" href="#guias-titulo">
                {GUIAS.length} guías <span aria-hidden="true">↓</span>
              </a>
              {OPINIONES.length > 0 && (
                <a className="boton" href="#opiniones-titulo">
                  {OPINIONES.length === 1 ? '1 opinión' : `${OPINIONES.length} opiniones`}{' '}
                  <span aria-hidden="true">↓</span>
                </a>
              )}
            </p>
          )}
        </div>
      </section>

      {pagina === 1 && OPINIONES.length > 0 && (
        <section className="seccion zona-cielo" aria-labelledby="opiniones-titulo">
          <div className="contenedor">
            <h2 id="opiniones-titulo" className="titular entra">
              Opiniones
            </h2>
            <ul className="articulos opiniones-tira">
              {OPINIONES.slice(0, EN_LA_TIRA).map((articulo) => (
                <FilaDeArticulo key={articulo.ruta} articulo={articulo} nivel="h3" />
              ))}
              <li className="opiniones-todas">
                <a className="boton boton-secundario" href="/articulos/opiniones">
                  Todas las opiniones <span aria-hidden="true">→</span>
                </a>
              </li>
            </ul>
          </div>
        </section>
      )}

      <section className="seccion zona-cielo" aria-labelledby="guias-titulo">
        <div className="contenedor">
          <h2 id="guias-titulo" className="titular entra">
            Guías
          </h2>
          <ol className="articulos articulos-indice" start={(pagina - 1) * POR_PAGINA + 1}>
            {articulosDePagina(pagina).map((articulo, i) => (
              <FilaDeArticulo key={articulo.ruta} articulo={articulo} destacado={pagina === 1 && i === 0} nivel="h3" />
            ))}
          </ol>
          {PAGINAS_DEL_INDICE > 1 && (
            <nav className="paginacion" aria-label="Páginas de guías">
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
