import Pagina from '../components/Pagina.jsx'
import Contacto from '../components/Contacto.jsx'
import FilaDeArticulo from '../components/FilaDeArticulo.jsx'
import Volver from '../components/Volver.jsx'
import { OPINIONES, PAGINAS } from '../lib/meta.js'

/**
 * Todas las opiniones, de la más nueva a la más vieja, en las filas del índice
 * de /articulos, que muestra solo las cinco más nuevas (paginas/Articulos.jsx).
 * Cada una lleva la cara y el nombre de quien la firma. Termina en el
 * formulario de contacto.
 */
export default function Opiniones({ ruta }) {
  const { descripcion } = PAGINAS[ruta]

  return (
    <Pagina ruta={ruta} hora="dia" className="articulos-pagina" contactoAqui cierre={<Contacto />}>
      <section className="seccion zona-cielo hora-dia cabecera-cielo">
        <div className="contenedor">
          <Volver />
          <h1>Opiniones</h1>
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
