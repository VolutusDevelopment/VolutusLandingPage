import Pagina from '../components/Pagina.jsx'
import { Invitacion } from '../components/Articulo.jsx'
import { ARTICULOS, PAGINAS, fechaDe, tituloCorto } from '../lib/meta.js'
import { SERVICIOS } from '../lib/servicios.js'

/**
 * El índice de artículos: guías cortas para decidir qué software necesita un
 * negocio. La lista sale sola de PAGINAS (todo lo que lleva `publicada`, ver
 * lib/meta.js), del más nuevo al más viejo, así que publicar un artículo no
 * toca esta página.
 *
 * Cada artículo lleva la marca del color del servicio del que habla, el de su
 * card en la rueda: el índice se lee también por servicio.
 */
export default function Articulos({ ruta }) {
  const { descripcion } = PAGINAS[ruta]

  return (
    <Pagina ruta={ruta} hora="dia" cierre={<Invitacion />}>
      <section className="seccion zona-cielo hora-dia cabecera-cielo">
        <div className="contenedor">
          <p className="antetitulo">Artículos</p>
          <h1>Software, en simple</h1>
          <p className="entradilla articulo-entradilla">{descripcion}</p>
        </div>
      </section>

      <section className="seccion zona-cielo" aria-label="Todos los artículos">
        <div className="contenedor">
          <ol className="articulos">
            {ARTICULOS.map(({ ruta: enlace, titulo, descripcion: resumen, publicada, servicios = [] }) => {
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
        </div>
      </section>
    </Pagina>
  )
}
