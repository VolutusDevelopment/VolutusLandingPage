import Pagina from './Pagina.jsx'
import { FilaDeServicios, ListaDeArticulos } from './Sugerencias.jsx'
import { ARTICULOS, PAGINAS, fechaDe, tituloCorto } from '../lib/meta.js'
import { SERVICIOS } from '../lib/servicios.js'

/**
 * La invitación con que cierran los artículos y su índice: la tarjeta oscura
 * del contacto, en la caída, como en /privacidad. Lleva al formulario y, si el
 * artículo es de un servicio, a su página.
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
            <a className="boton boton-primario" href="/#contacto">
              Cuéntanos tu proyecto
            </a>
            {servicio && (
              <a className="boton boton-secundario" href={servicio.ruta}>
                Conoce el servicio
              </a>
            )}
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
 * medida de lectura. Al final sugiere los servicios de los que habla y otros
 * artículos, y cierra con la invitación en la caída.
 */
export default function Articulo({ ruta, children }) {
  const { titulo, descripcion, publicada, actualizada, servicios = [] } = PAGINAS[ruta]
  const relacionados = SERVICIOS.filter(({ id, ruta }) => ruta && servicios.includes(id))
  const otros = ARTICULOS.filter((articulo) => articulo.ruta !== ruta).slice(0, 4)

  return (
    <Pagina ruta={ruta} hora="dia" cierre={<Invitacion servicio={relacionados[0]} />}>
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
          </div>
        </header>

        <div className="seccion zona-cielo">
          <div className="contenedor">
            <div className="prosa">{children}</div>
          </div>
        </div>
      </article>

      <section className="seccion zona-cielo" aria-labelledby="sigue-titulo">
        <div className="contenedor">
          <h2 id="sigue-titulo" className="entra">
            Sigue leyendo
          </h2>
          <ListaDeArticulos articulos={otros} />
          {relacionados.length > 0 && (
            <>
              <h3 className="articulo-servicios-titulo entra">Te puede servir</h3>
              <FilaDeServicios servicios={relacionados} />
            </>
          )}
        </div>
      </section>
    </Pagina>
  )
}
