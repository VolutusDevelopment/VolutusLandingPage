import Pagina from '../components/Pagina.jsx'
import Contacto from '../components/Contacto.jsx'
import FilaDeArticulo from '../components/FilaDeArticulo.jsx'
import { OPINIONES, PAGINAS } from '../lib/meta.js'

/**
 * Las opiniones, aparte de las guías de /articulos (paginas/Articulos.jsx):
 * todas, de la más nueva a la más vieja, en las filas del índice. Cada una
 * lleva la cara y el nombre de quien la firma. Termina en el formulario de
 * contacto.
 */
export default function Opiniones({ ruta }) {
  const { descripcion } = PAGINAS[ruta]

  return (
    <Pagina ruta={ruta} hora="dia" className="articulos-pagina" contactoAqui cierre={<Contacto />}>
      <section className="seccion zona-cielo hora-dia cabecera-cielo">
        <div className="contenedor">
          <p className="antetitulo">Opiniones</p>
          <h1>Lo que pensamos</h1>
          <p className="entradilla articulo-entradilla">{descripcion}</p>
        </div>
      </section>

      <section className="seccion zona-cielo" aria-label="Todas las opiniones">
        <div className="contenedor">
          <ol className="articulos articulos-indice">
            {OPINIONES.map((articulo) => (
              <FilaDeArticulo key={articulo.ruta} articulo={articulo} />
            ))}
          </ol>
        </div>
      </section>
    </Pagina>
  )
}
