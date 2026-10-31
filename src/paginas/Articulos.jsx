import Pagina from '../components/Pagina.jsx'
import Contacto from '../components/Contacto.jsx'
import FilaDeArticulo from '../components/FilaDeArticulo.jsx'
import Icono from '../components/Icono.jsx'
import { SERVICIOS } from '../lib/servicios.js'
import {
  PAGINAS,
  PAGINAS_DEL_INDICE,
  articulosDePagina,
  inicioDePagina,
  numeroDePagina,
  rutaDePagina,
} from '../lib/meta.js'

// Las baldosas de la cabecera: tres servicios, en su color.
const EMBLEMA = ['web', 'agente', 'tienda'].map((id) => SERVICIOS.find((servicio) => servicio.id === id))

/**
 * El índice de las guías. La lista sale sola de PAGINAS (todo lo que lleva
 * `publicada` y no `autor`, ver lib/meta.js), de la más nueva a la más vieja,
 * así que publicar una guía no toca esta página. Las opiniones tienen su
 * propia página (paginas/Opiniones.jsx).
 *
 * La cabecera lleva tres baldosas de servicios a la derecha que hacen su
 * gesto al cargar. Debajo, un sumario de a doce por página (`ruta` dice cuál),
 * con los números de las demás al pie; la primera abre además con la más
 * nueva, en una lámina oscura a todo el ancho. Las demás van en filas
 * (components/FilaDeArticulo.jsx). Cada guía lleva el glifo del servicio del
 * que habla en una baldosa de su color, con su nombre: el índice se lee
 * también por servicio. Termina en el formulario de contacto.
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
          <h1>Guías para decidir</h1>
          <p className="entradilla articulo-entradilla">{descripcion}</p>
        </div>
      </section>

      <section className="seccion zona-cielo" aria-label={`Guías, página ${pagina} de ${PAGINAS_DEL_INDICE}`}>
        <div className="contenedor">
          <ol className="articulos articulos-indice" start={inicioDePagina(pagina) + 1}>
            {articulosDePagina(pagina).map((articulo, i) => (
              <FilaDeArticulo key={articulo.ruta} articulo={articulo} destacado={pagina === 1 && i === 0} />
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
