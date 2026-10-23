import { Fragment } from 'react'
import { PROYECTOS } from '../data/proyectos.js'
import LogoProyecto from './LogoProyecto.jsx'
import Podio from './Podio.jsx'

/**
 * Índice de obra (DESIGN-BRIEF §4, bloque 2). La página sigue en blanco y el
 * color vive en las tarjetas: los logros con jurado externo suben a un podio
 * en pixel art (Podio.jsx): es lo único validado por un tercero.
 *
 * Cada proyecto pinta solo los enlaces que tiene. Un proyecto sin ninguno no
 * llega hasta aquí: lo filtra el propio archivo de datos, donde está explicada
 * la regla y el estado verificado de cada uno.
 *
 * Cada proyecto es una lámina que enseña la obra sin pedir nada: su resumen,
 * el producto en sus pantallas reales y la dirección donde abrirlo, etiquetada
 * por lo que es («En línea» o «Código público»), que es la regla para estar
 * aquí. Lo que no cabe —todas las pantallas y cómo funciona— va en su ficha,
 * un `<dialog>` que se abre al tocar la lámina (src/fichas.js). Un proyecto
 * sin capturas ni pasos no tiene más que enseñar: no lleva ficha y su lámina
 * es una fila.
 */

function Enlaces({ sitio, repositorio, publicacion, nombre }) {
  // El producto en línea manda y va en primario; sin sitio, el primario es el
  // código.
  const clase = (principal) => `boton ${principal ? 'boton-primario' : 'boton-secundario'}`
  return (
    <p className="ficha-enlaces">
      {sitio && (
        <a href={sitio} target="_blank" rel="noopener" className={clase(true)}>
          Abrir el sitio
          <span className="solo-lectores"> de {nombre}</span>
        </a>
      )}
      {repositorio && (
        <a href={repositorio} target="_blank" rel="noopener" className={clase(!sitio)}>
          Ver el código fuente
          <span className="solo-lectores"> de {nombre}</span>
        </a>
      )}
      {publicacion && (
        <a href={publicacion} target="_blank" rel="noopener" className={clase(false)}>
          Ver la publicación del resultado
          <span className="solo-lectores"> de {nombre}</span>
        </a>
      )}
    </p>
  )
}

const tieneFicha = (proyecto) => Boolean(proyecto.vistas || proyecto.pasos)

function Captura({ imagen, sizes = imagen.sizes, className }) {
  return (
    <img
      className={className}
      src={imagen.src}
      srcSet={imagen.srcSet}
      sizes={sizes}
      width={imagen.ancho}
      height={imagen.alto}
      alt={imagen.alt}
      loading="lazy"
      decoding="async"
    />
  )
}

/**
 * El producto en la lámina: el sitio detrás y, delante, el teléfono con lo que
 * ve el cliente. Los dos suben desde el borde de abajo y se salen de él, así
 * que la lámina los recorta. Son las mismas imágenes de la ficha: abrirla
 * después no descarga nada nuevo.
 */
function Vitrina({ vistas }) {
  const pantalla = vistas.find((vista) => vista.forma === 'pantalla')
  const telefono = vistas.find((vista) => vista.forma === 'telefono')
  return (
    <div className="vitrina">
      {pantalla && <Captura imagen={pantalla.imagen} sizes="(min-width: 1024px) 40rem, 75vw" className="vitrina-pantalla" />}
      {telefono && <Captura imagen={telefono.imagen} sizes="(min-width: 1024px) 10rem, 30vw" className="vitrina-telefono" />}
    </div>
  )
}

// La dirección se lee sin el protocolo: `github.com/DiegoPyLL/CarFlip`. Si no
// cabe en la línea, se corta después de una barra y no a mitad de un nombre, y
// la flecha va pegada al último: nunca baja sola.
function Direccion({ url }) {
  const { host, pathname } = new URL(url)
  const partes = (host + pathname).replace(/\/$/, '').split('/')
  const ultima = partes.pop()
  return (
    <>
      {partes.map((parte, i) => (
        <Fragment key={i}>
          {parte}/<wbr />
        </Fragment>
      ))}
      <span className="obra-direccion-fin">
        {ultima}
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </span>
    </>
  )
}

const PRUEBAS = [
  ['sitio', 'En línea'],
  ['repositorio', 'Código público'],
]

function Pruebas({ proyecto }) {
  return (
    <dl className="obra-pruebas">
      {PRUEBAS.filter(([clave]) => proyecto[clave]).map(([clave, etiqueta]) => (
        <div key={clave}>
          <dt>{etiqueta}</dt>
          <dd>
            <a href={proyecto[clave]} target="_blank" rel="noopener" className="obra-direccion">
              <Direccion url={proyecto[clave]} />
            </a>
          </dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * La lámina de un proyecto. El botón de la ficha es una línea de texto, pero
 * su `::after` se estira sobre la lámina entera: se abre tocando en cualquier
 * punto que no sea un enlace.
 */
function Obra({ proyecto }) {
  const conFicha = tieneFicha(proyecto)
  return (
    <li className={`obra zona-plano entra${proyecto.vistas ? ' obra-con-vitrina' : ''}`} id={proyecto.id}>
      <div className="obra-lamina">
        <div className="obra-texto">
          <div className="obra-nombre">
            <LogoProyecto proyecto={proyecto} />
            <h3>{proyecto.nombre}</h3>
          </div>
          <p className="obra-resumen">{proyecto.resumen}</p>
          <Pruebas proyecto={proyecto} />
          {conFicha && (
            <button
              type="button"
              className="boton boton-secundario obra-abrir"
              data-ficha={`ficha-${proyecto.id}`}
              aria-haspopup="dialog"
            >
              Ver cómo funciona<span className="solo-lectores"> {proyecto.nombre}</span>
              <span className="obra-flecha" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </button>
          )}
        </div>
        {proyecto.vistas && <Vitrina vistas={proyecto.vistas} />}
      </div>
    </li>
  )
}

/**
 * La ficha de un proyecto: todo lo que la tesela no dice. Va en el HTML desde
 * el servidor, así que los buscadores la leen aunque nadie la abra.
 */
function Ficha({ proyecto }) {
  const titulo = `ficha-${proyecto.id}-titulo`
  return (
    <dialog className="ficha zona-plano" id={`ficha-${proyecto.id}`} aria-labelledby={titulo}>
      <div className="ficha-cabecera">
        <LogoProyecto proyecto={proyecto} />
        <div className="ficha-titulos">
          <h3 id={titulo}>{proyecto.nombre}</h3>
          <p>{proyecto.lema}</p>
        </div>
        <button type="button" className="boton-cuadro ficha-cerrar" aria-label={`Cerrar la ficha de ${proyecto.nombre}`}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="ficha-cuerpo">
        <p className="ficha-resumen">{proyecto.resumen}</p>

        {/* Una tira que se desliza de lado: cada captura con su pie. Se puede
            enfocar para recorrerla con el teclado. */}
        {proyecto.vistas && (
          <ul className="ficha-capturas" tabIndex={0} aria-label={`Capturas de ${proyecto.nombre}`}>
            {proyecto.vistas.map(({ titulo, texto, forma, imagen }) => (
              <li key={titulo} className={`captura captura-${forma}`}>
                <figure>
                  <div className="captura-marco">
                    <Captura imagen={imagen} />
                  </div>
                  <figcaption>
                    <strong>{titulo}</strong> {texto}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}

        {proyecto.pasos && (
          <div>
            <p className="antetitulo">Cómo funciona</p>
            <ol className="ficha-pasos">
              {proyecto.pasos.map((paso) => (
                <li key={paso}>{paso}</li>
              ))}
            </ol>
          </div>
        )}

        <Enlaces {...proyecto} />
      </div>
    </dialog>
  )
}

// Sin JavaScript nadie abre un `<dialog>`: las fichas se ven en línea, debajo
// de las láminas, y se esconden los botones que no harían nada.
const SIN_SCRIPT = `
.ficha { display: block !important; position: static !important; width: auto !important; max-height: none !important; margin: var(--e-6) 0 0 !important; }
.obra-abrir, .ficha-cerrar { display: none !important; }
`

export default function Proyectos() {
  const destacados = PROYECTOS.filter((p) => p.destacado)
  const obras = PROYECTOS.filter((p) => !p.destacado)

  return (
    <section id="proyectos" className="seccion zona-cielo proyectos">
      <div className="contenedor">
        <h2 className="titular entra">Proyectos y logros</h2>

        <div className="obras-bloque">
          <div className="obras-intro entra">
            <p className="antetitulo">Proyectos</p>
            <p className="obras-bajada">Todo lo que mostramos se puede abrir: el producto en línea o su código.</p>
          </div>
          <ul className="obras">
            {obras.map((proyecto) => (
              <Obra key={proyecto.id} proyecto={proyecto} />
            ))}
          </ul>
        </div>

        {/* Los logros con jurado externo suben al podio (Podio.jsx). */}
        <Podio logros={destacados} />

        {obras.filter(tieneFicha).map((proyecto) => (
          <Ficha key={proyecto.id} proyecto={proyecto} />
        ))}
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: SIN_SCRIPT }} />
        </noscript>
      </div>
    </section>
  )
}
