import Pagina from './Pagina.jsx'
import Contacto from './Contacto.jsx'
import FilaDeArticulo from './FilaDeArticulo.jsx'
import Mapa from './Mapa.jsx'
import { socioDe } from '../data/socios.js'
import { leer } from '../lib/lectura.js'
import { PAGINAS, relacionadosDe, tituloCorto } from '../lib/meta.js'
import { SERVICIOS, servicioDeArticulo } from '../lib/servicios.js'

/**
 * El marco de un artículo (paginas/articulos/), guía u opinión. El título, la
 * entradilla y el autor salen de PAGINAS (lib/meta.js), así que el
 * `<head>`, la página y el índice de /articulos dicen lo mismo; el artículo
 * solo escribe su cuerpo.
 *
 * Una opinión lleva bajo la entradilla la firma del socio que la escribió
 * (decisiones 58 y 66 del brief): su cara, su nombre, que lleva a su tarjeta
 * en /nosotros, y su rol. Las guías no llevan firma: las firma Volutus.
 * No se muestra fecha: la de publicación y la de la última actualización
 * quedan en el grafo y en el sitemap.
 *
 * Abre en el cielo del día de las páginas internas, con una flecha que vuelve
 * a su índice: el de las guías o el de las opiniones. Se lee en blanco, a la
 * medida de lectura, con el mapa de sus apartados y sus minutos de lectura
 * (components/Mapa.jsx), que cuenta lib/lectura.js. Al final sugiere otros de
 * su tipo, en las filas del índice, y cierra con el formulario de contacto en
 * la caída, con el servicio del que habla ya marcado. En S y M, bajo la
 * entradilla, el servicio queda a un toque.
 */
export default function Articulo({ ruta, children }) {
  const { titulo, descripcion, autor, servicios = [] } = PAGINAS[ruta]
  const servicio = SERVICIOS.find(({ id, ruta }) => ruta && servicios.includes(id))
  const firma = autor && socioDe(autor)
  const { cuerpo, apartados, minutos } = leer(children)
  const relacionados = relacionadosDe(ruta)

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
              <a
                className="articulo-volver"
                href={firma ? '/articulos/opiniones' : '/articulos'}
                aria-label={firma ? 'Volver a las opiniones' : 'Volver a las guías'}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 12H5M11 6l-6 6 6 6" />
                </svg>
              </a>
            </p>
            <h1 className="titular-largo">{tituloCorto(titulo)}</h1>
            <p className="entradilla articulo-entradilla">{descripcion}</p>
            {firma && (
              <p className="articulo-firma">
                <img src={firma.avatar} alt="" width={48} height={48} decoding="async" />
                <span>
                  <a href={`/nosotros#${firma.id}`}>{`${firma.nombre} ${firma.apellidos}`}</a>
                  <small>{firma.rol}</small>
                </span>
              </p>
            )}
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
          <div className="contenedor articulo-cuerpo">
            {apartados.length > 1 && <Mapa apartados={apartados} minutos={minutos} />}
            <div className="prosa">{cuerpo}</div>
          </div>
        </div>
      </article>

      {relacionados.length > 0 && (
        <section className="seccion zona-cielo" aria-labelledby="relacionados-titulo">
          <div className="contenedor">
            <h2 id="relacionados-titulo" className="titular entra">
              {firma ? 'Otras opiniones' : 'Guías relacionadas'}
            </h2>
            <ul className="articulos articulos-relacionados">
              {relacionados.map((articulo) => (
                <FilaDeArticulo key={articulo.ruta} articulo={articulo} nivel="h3" />
              ))}
            </ul>
          </div>
        </section>
      )}
    </Pagina>
  )
}
