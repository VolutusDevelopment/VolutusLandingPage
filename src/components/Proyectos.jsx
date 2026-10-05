import { PROYECTOS } from '../data/proyectos.js'
import LogoProyecto from './LogoProyecto.jsx'

/**
 * Índice de obra (DESIGN-BRIEF §4, bloque 2). La página sigue en blanco y el
 * color vive en las tarjetas: los logros con jurado externo van en el metal
 * de su puesto —oro o plata, porque es lo único validado por un tercero—.
 *
 * Cada proyecto pinta solo los enlaces que tiene. Un proyecto sin ninguno no
 * llega hasta aquí: lo filtra el propio archivo de datos, donde está explicada
 * la regla y el estado verificado de cada uno.
 *
 * Los proyectos van en un mosaico (issue #33): una tesela por proyecto, con su
 * ícono, su nombre y una línea. Lo demás —el resumen, las capturas, cómo
 * funciona y los enlaces— está en su ficha, un `<dialog>` que se abre al tocar
 * la tesela (src/fichas.js). Así la sección mide lo mismo con dos proyectos
 * que con ocho, y las capturas no se descargan hasta que alguien abre la ficha.
 */

function Enlaces({ sitio, repositorio, publicacion, nombre, botones }) {
  if (!sitio && !repositorio && !publicacion) return null
  // En la ficha son botones: el producto en línea manda y va en primario; sin
  // sitio, el primario es el código.
  const clase = (principal) => (botones ? `boton ${principal ? 'boton-primario' : 'boton-secundario'}` : undefined)
  return (
    <p className={botones ? 'ficha-enlaces' : 'proyecto-enlaces'}>
      {sitio && (
        <a href={sitio} rel="noopener" className={clase(true)}>
          Abrir el sitio
          <span className="solo-lectores"> de {nombre}</span>
        </a>
      )}
      {repositorio && (
        <a href={repositorio} rel="noopener" className={clase(!sitio)}>
          Ver el código fuente
          <span className="solo-lectores"> de {nombre}</span>
        </a>
      )}
      {publicacion && (
        <a href={publicacion} rel="noopener" className={clase(false)}>
          Ver la publicación del resultado
          <span className="solo-lectores"> de {nombre}</span>
        </a>
      )}
    </p>
  )
}

// El círculo con flecha de las piezas que se abren: abajo para desplegar (el
// CSS la gira cuando ya está abierta) y a la derecha para abrir una ficha.
const TRAZOS = { desplegar: 'M6 9l6 6 6-6', abrir: 'M5 12h14M13 6l6 6-6 6' }

function Flecha({ hacia = 'desplegar' }) {
  return (
    <span className="flecha-desplegar" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d={TRAZOS[hacia]} />
      </svg>
    </span>
  )
}

/**
 * La tesela de un proyecto. El botón es una línea de texto, pero su `::after`
 * se estira sobre la tesela entera: se abre tocando en cualquier punto.
 */
function Obra({ proyecto }) {
  return (
    <li className="obra zona-plano entra" id={proyecto.id}>
      <div className="obra-icono">
        <LogoProyecto proyecto={proyecto} />
      </div>
      <div className="obra-texto">
        <h3>{proyecto.nombre}</h3>
        <p className="obra-lema">{proyecto.lema}</p>
        <button type="button" className="obra-abrir" data-ficha={`ficha-${proyecto.id}`} aria-haspopup="dialog">
          <span>
            Ver ficha<span className="solo-lectores"> de {proyecto.nombre}</span>
          </span>
          <Flecha hacia="abrir" />
        </button>
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
        {/* Cerrar no necesita script: un formulario `dialog` cierra el suyo. */}
        <form method="dialog">
          <button className="ficha-cerrar" aria-label={`Cerrar la ficha de ${proyecto.nombre}`}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </form>
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
                    <img
                      src={imagen.src}
                      srcSet={imagen.srcSet}
                      sizes={imagen.sizes}
                      width={imagen.ancho}
                      height={imagen.alto}
                      alt={imagen.alt}
                      loading="lazy"
                      decoding="async"
                    />
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

        <Enlaces {...proyecto} botones />
      </div>
    </dialog>
  )
}

// Sin JavaScript nadie abre un `<dialog>`: las fichas se ven en línea, debajo
// del mosaico, y se esconden los botones que no harían nada.
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
        <h2 className="entra">Echa un vistazo a nuestros proyectos y logros</h2>

        <div className="proyectos-logros">
          {destacados.map((destacado) => (
            <article
              key={destacado.id}
              className={`tarjeta proyecto proyecto-destacado proyecto-${destacado.credencial.metal} entra`}
            >
              {/* Plegada, la tarjeta dice el puesto y la obra; el relato y su
                  prueba se despliegan. `<details>` lo hace sin JavaScript y
                  el texto plegado sigue en el HTML para los buscadores. */}
              <details>
                {/* La credencial va ANTES del nombre: es lo único de esta página
                    que validó un tercero, y es el motivo de que encabece. La
                    medalla repite el puesto en grande; el texto lo dice entero. */}
                <summary>
                  <span className="proyecto-medalla dato" aria-hidden="true">
                    {destacado.credencial.puesto}
                  </span>
                  <span className="proyecto-credencial">
                    <strong>{destacado.credencial.titulo}</strong>{' '}
                    <span className="proyecto-evento dato">{destacado.credencial.evento}</span>
                  </span>
                  <h3>{destacado.nombre}</h3>
                  <Flecha />
                </summary>
                <div className="proyecto-cuerpo">
                  <p className="proyecto-resumen">{destacado.resumen}</p>
                  <Enlaces {...destacado} />
                </div>
              </details>
            </article>
          ))}
        </div>

        <div className="obras-bloque">
          <div className="obras-intro entra">
            <p className="antetitulo">Proyectos</p>
            <p className="obras-bajada">Toca un proyecto para ver cómo funciona por dentro y abrirlo.</p>
          </div>
          <ul className="obras">
            {obras.map((proyecto) => (
              <Obra key={proyecto.id} proyecto={proyecto} />
            ))}
          </ul>
        </div>

        {obras.map((proyecto) => (
          <Ficha key={proyecto.id} proyecto={proyecto} />
        ))}
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: SIN_SCRIPT }} />
        </noscript>
      </div>
    </section>
  )
}
