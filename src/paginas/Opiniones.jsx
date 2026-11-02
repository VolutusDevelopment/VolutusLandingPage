import Pagina from '../components/Pagina.jsx'
import Contacto from '../components/Contacto.jsx'
import FilaDeArticulo from '../components/FilaDeArticulo.jsx'
import { OPINIONES, PAGINAS } from '../lib/meta.js'

/**
 * Las opiniones, aparte de las guías de /articulos (paginas/Articulos.jsx):
 * todas, de la más nueva a la más vieja, en una columna de diario: la foto de
 * portada de cada una y, junto a su título y su resumen, la cara, el nombre y el día de
 * quien la firma. Termina en el formulario de contacto.
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
          <ol className="articulos articulos-diario">
            {OPINIONES.map((articulo) => (
              <FilaDeArticulo key={articulo.ruta} articulo={articulo} diario />
            ))}
          </ol>
        </div>
      </section>
    </Pagina>
  )
}
