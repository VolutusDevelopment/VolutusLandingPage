import Pagina from './Pagina.jsx'
import Contacto from './Contacto.jsx'
import { ListaDeArticulos } from './Sugerencias.jsx'
import { PAGINAS, fechaDe, relacionadosDe, tituloCorto } from '../lib/meta.js'
import { SERVICIOS, servicioDeArticulo } from '../lib/servicios.js'

/**
 * El marco de un artículo (paginas/articulos/). El título, la entradilla y las
 * fechas salen de PAGINAS (lib/meta.js), así que el `<head>`, la página y el
 * índice de /articulos dicen lo mismo; el artículo solo escribe su cuerpo.
 *
 * Abre en el cielo del día de las páginas internas y se lee en blanco, a la
 * medida de lectura. Al final sugiere los artículos relacionados y cierra con
 * el formulario de contacto en la caída, con el servicio del que habla ya
 * marcado. En S y M, bajo la fecha, el servicio queda a un toque.
 */
export default function Articulo({ ruta, children }) {
  const { titulo, descripcion, publicada, actualizada, servicios = [] } = PAGINAS[ruta]
  const servicio = SERVICIOS.find(({ id, ruta }) => ruta && servicios.includes(id))

  return (
    <Pagina
      ruta={ruta}
      hora="dia"
      className="articulos-pagina"
      contactoAqui
      cierre={<Contacto marcado={servicioDeArticulo(PAGINAS[ruta])?.opcion} />}
    >
      <article>
        <header className="seccion zona-cielo hora-dia cabecera-cielo">
          <div className="contenedor">
            <p className="antetitulo">
              <a className="articulo-volver" href="/articulos">
                Artículos
              </a>
            </p>
            <h1 className="titular-largo">{tituloCorto(titulo)}</h1>
            <p className="entradilla articulo-entradilla">{descripcion}</p>
            <p className="articulo-fecha dato">
              <time dateTime={publicada}>{fechaDe(ruta, 'publicada')}</time>
              {actualizada !== publicada && (
                <>
                  {' · actualizado el '}
                  <time dateTime={actualizada}>{fechaDe(ruta)}</time>
                </>
              )}
            </p>
            {servicio && (
              <p className="articulo-servicio">
                <small>Servicio</small>
                <a className="boton" href={servicio.ruta}>
                  {servicio.nombre}
                  <span aria-hidden="true">→</span>
                </a>
              </p>
            )}
          </div>
        </header>

        <div className="seccion zona-cielo">
          <div className="contenedor">
            <div className="prosa">{children}</div>
          </div>
        </div>
      </article>

      <section className="seccion zona-cielo" aria-labelledby="relacionados-titulo">
        <div className="contenedor">
          <h2 id="relacionados-titulo" className="titular entra">
            Artículos relacionados
          </h2>
          <ListaDeArticulos articulos={relacionadosDe(ruta)} />
        </div>
      </section>
    </Pagina>
  )
}
