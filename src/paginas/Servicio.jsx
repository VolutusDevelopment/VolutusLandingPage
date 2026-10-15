import Pagina from '../components/Pagina.jsx'
import Contacto from '../components/Contacto.jsx'
import Pieza from '../components/Pieza.jsx'
import { FilaDeServicios, ListaDeArticulos } from '../components/Sugerencias.jsx'
import { PAGINAS, canonicalDe, articulosDe } from '../lib/meta.js'
import { SERVICIOS } from '../lib/servicios.js'
import { PAGINAS_DE_SERVICIO, PROCESO } from '../data/paginas-de-servicio.js'
import { PROYECTOS } from '../data/proyectos.js'

/**
 * La página propia de un servicio: una sola plantilla para los seis, que la
 * ruta elige (paginas/rutas.js).
 *
 * Cada una es la card de su servicio abierta: su color tiñe el cielo de la
 * cabecera y la barra (`tinte`, ver Pagina.jsx), y una pieza propia
 * (Pieza.jsx) dibuja en él lo que hace el servicio. El resto es el recorrido
 * de las páginas internas: el blanco para leer y, al final, la caída con el
 * formulario —con el servicio ya marcado— y el pie de día.
 *
 * El orden responde las preguntas de §2 del brief una tras otra: qué recibo,
 * ¿me sirve?, qué tengo que poner yo, dónde lo compruebo y lo demás. El
 * precio no se publica (§3), pero la pregunta se responde igual.
 */

/** Un proyecto de data/proyectos.js como prueba: su nombre, por qué y sus enlaces. */
function Prueba({ prueba: { proyecto: id, vista: tituloVista, texto, medir }, ruta }) {
  const { nombre, credencial, sitio, repositorio, publicacion, vistas } = PROYECTOS.find((p) => p.id === id)
  const vista = vistas?.find((v) => v.titulo === tituloVista)

  const enlaces = [
    sitio && { href: sitio, texto: new URL(sitio).host },
    repositorio && { href: repositorio, texto: 'Ver el código' },
    publicacion && { href: publicacion, texto: 'Ver la publicación' },
    medir && {
      href: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(canonicalDe(ruta))}`,
      texto: 'Medir esta página',
    },
  ].filter(Boolean)

  return (
    <section className="seccion zona-cielo" aria-labelledby="prueba-titulo">
      <div className="contenedor">
        <div className={`servicio-prueba zona-plano entra${vista ? ' con-vista' : ''}`}>
          <div className="servicio-prueba-texto">
            <p className="antetitulo">Compruébalo</p>
            <h2 id="prueba-titulo">{nombre}</h2>
            {credencial && (
              <p className="servicio-prueba-credencial dato">
                {credencial.titulo} · {credencial.evento}
              </p>
            )}
            <p className="servicio-prueba-bajada">{texto}</p>
            <ul className="servicio-prueba-enlaces">
              {enlaces.map(({ href, texto }) => (
                <li key={href}>
                  <a href={href} rel="noopener">
                    {texto} <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {vista && (
            <img
              className="servicio-prueba-vista"
              src={vista.imagen.src}
              srcSet={vista.imagen.srcSet}
              sizes="(min-width: 1024px) 34rem, 90vw"
              width={vista.imagen.ancho}
              height={vista.imagen.alto}
              alt={vista.imagen.alt}
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default function Servicio({ ruta }) {
  const servicio = SERVICIOS.find((s) => s.ruta === ruta)
  const pagina = PAGINAS_DE_SERVICIO[servicio.id]
  const { descripcion } = PAGINAS[ruta]

  return (
    <Pagina
      ruta={ruta}
      hora="dia"
      tinte={servicio.color}
      contactoAqui
      className="servicio-pagina"
      cierre={<Contacto marcado={servicio.opcion} />}
    >
      <section className="seccion zona-cielo hora-dia cabecera-cielo servicio-cabecera">
        <div className="contenedor servicio-portada">
          <div>
            <p className="antetitulo">{pagina.antetitulo}</p>
            <h1>{pagina.titular}</h1>
            {/* La entradilla es la meta description, como en las demás
                páginas internas: un resumen, escrito una vez. */}
            <p className="entradilla servicio-entradilla">{descripcion}</p>
            <p className="servicio-acciones">
              <a className="boton boton-primario" href="#contacto">
                Cuéntanos tu proyecto
              </a>
              <a className="boton boton-secundario" href="#incluye">
                Qué incluye
              </a>
            </p>
          </div>
          <Pieza id={servicio.id} />
        </div>
      </section>

      <section id="incluye" className="seccion zona-cielo" aria-labelledby="incluye-titulo">
        <div className="contenedor">
          <h2 id="incluye-titulo" className="entra">
            Qué incluye
          </h2>
          <ul className="servicio-incluye">
            {pagina.incluye.map(({ titulo, texto }) => (
              <li key={titulo} className="entra">
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {pagina.principio && (
        <section className="seccion zona-cielo" aria-labelledby="principio-titulo">
          <div className="contenedor">
            <div className="servicio-principio entra">
              <h2 id="principio-titulo">{pagina.principio.titulo}</h2>
              <ul className="vistos">
                {pagina.principio.puntos.map((punto) => (
                  <li key={punto}>{punto}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="seccion zona-cielo" aria-labelledby="cuando-titulo">
        <div className="contenedor servicio-cuando">
          <h2 id="cuando-titulo" className="entra">
            Te sirve si…
          </h2>
          <ul className="vistos servicio-vistos">
            {pagina.cuando.map((senal) => (
              <li key={senal} className="entra">
                {senal}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="seccion zona-cielo" aria-labelledby="proceso-titulo">
        <div className="contenedor">
          <p className="antetitulo entra">Cómo trabajamos</p>
          <h2 id="proceso-titulo" className="entra">
            Cuatro pasos, y en cada uno qué pones tú
          </h2>
          <ol className="numerada servicio-pasos">
            {PROCESO.map(({ titulo, pones }) => (
              <li key={titulo} className="entra">
                <div>
                  <h3>{titulo}</h3>
                  <p>
                    <span className="servicio-pones">Pones tú:</span> {pones}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="servicio-pedimos entra">
            <h3>Para empezar, te vamos a pedir</h3>
            <ul className="vistos servicio-vistos">
              {pagina.pedimos.map((cosa) => (
                <li key={cosa}>{cosa}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {pagina.prueba && <Prueba prueba={pagina.prueba} ruta={ruta} />}

      <section className="seccion zona-cielo" aria-labelledby="preguntas-titulo">
        <div className="contenedor">
          <h2 id="preguntas-titulo" className="entra">
            Preguntas frecuentes
          </h2>
          <dl className="servicio-preguntas">
            {pagina.preguntas.map(({ pregunta, respuesta }) => (
              <div key={pregunta} className="entra">
                <dt>{pregunta}</dt>
                <dd>{respuesta}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="seccion zona-cielo" aria-labelledby="sigue-titulo">
        <div className="contenedor">
          <h2 id="sigue-titulo" className="entra">
            Sigue leyendo
          </h2>
          <ListaDeArticulos articulos={articulosDe(servicio.id)} />
          <h3 className="servicio-otros-titulo entra">Otros servicios</h3>
          <FilaDeServicios servicios={SERVICIOS.filter((s) => s.ruta && s !== servicio)} />
        </div>
      </section>
    </Pagina>
  )
}
