import Pagina from './Pagina.jsx'
import { ListaDeArticulos } from './Sugerencias.jsx'
import { PAGINAS, fechaDe, relacionadosDe, tituloCorto } from '../lib/meta.js'
import { SERVICIOS } from '../lib/servicios.js'

/**
 * La invitación con que cierran los artículos y su índice: la tarjeta oscura
 * del contacto, en la caída, como en /privacidad. Lleva a la calculadora de
 * estimado del servicio del artículo, o a /servicios si no tiene uno.
 */
export function Invitacion({ servicio }) {
  return (
    <section className="seccion zona-cielo cierre" aria-labelledby="cierre-titulo">
      <div className="contenedor">
        <div className="cierre-tarjeta zona-plano cierre-invitacion entra">
          <h2 id="cierre-titulo" className="titular titular-menor">
            ¿Lo vemos juntos?
          </h2>
          <p className="entradilla">
            Cuéntanos qué estás resolviendo y una persona te responde pronto.
          </p>
          <p className="cierre-acciones">
            <a className="boton boton-primario" href={servicio ? `${servicio.ruta}#estimado` : '/servicios'}>
              Calcula tu estimado
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

/**
 * El marco de un artículo (paginas/articulos/). El título, la entradilla y las
 * fechas salen de PAGINAS (lib/meta.js), así que el `<head>`, la página y el
 * índice de /articulos dicen lo mismo; el artículo solo escribe su cuerpo.
 *
 * Abre en el cielo del día de las páginas internas y se lee en blanco, a la
 * medida de lectura. Al final sugiere los artículos relacionados y cierra con
 * la invitación en la caída. En S y M, bajo la fecha, el servicio del que
 * habla queda a un toque.
 */
export default function Articulo({ ruta, children }) {
  const { titulo, descripcion, publicada, actualizada, servicios = [] } = PAGINAS[ruta]
  const servicio = SERVICIOS.find(({ id, ruta }) => ruta && servicios.includes(id))

  return (
    <Pagina ruta={ruta} hora="dia" cierre={<Invitacion servicio={servicio} />}>
      <article>
        <header className="seccion zona-cielo hora-dia cabecera-cielo">
          <div className="contenedor">
            <p className="antetitulo">
              <a className="articulo-volver" href="/articulos">
                Artículos
              </a>
            </p>
            <h1 className="titular-menor">{tituloCorto(titulo)}</h1>
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
                <a href={servicio.ruta}>
                  <small>Servicio</small>
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
          <h2 id="relacionados-titulo" className="entra">
            Artículos relacionados
          </h2>
          <ListaDeArticulos articulos={relacionadosDe(ruta)} />
        </div>
      </section>
    </Pagina>
  )
}
