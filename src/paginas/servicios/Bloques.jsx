import { canonicalDe } from '../../lib/meta.js'
import { PROYECTOS } from '../../data/proyectos.js'
import { PASOS } from '../../data/paginas-de-servicio.js'

/**
 * Las piezas que comparten las páginas de servicio. Cada servicio (los demás
 * archivos de esta carpeta) las ordena alrededor de su «Qué incluye», que es
 * lo que no se parece entre una página y otra. Sus estilos, en Servicio.css.
 */

/** La sección de «Qué incluye», con su título; lo de adentro es de cada servicio. */
export function Incluye({ className, children }) {
  return (
    <section id="incluye" className={`seccion zona-cielo ${className}`} aria-labelledby="incluye-titulo">
      <div className="contenedor">
        <h2 id="incluye-titulo" className="entra">
          Qué incluye
        </h2>
        {children}
      </div>
    </section>
  )
}

/**
 * Un proyecto de data/proyectos.js como prueba: su nombre, por qué y sus
 * enlaces y, si tiene, una captura. Sin captura es una franja: el texto a un
 * lado y los enlaces al otro. `className` se suma a la sección, para el
 * servicio que la pinta a su manera (la web).
 */
export function Prueba({ prueba: { proyecto: id, vista: tituloVista, texto, medir }, ruta, className }) {
  const { nombre, credencial, sitio, repositorio, publicacion, vistas } = PROYECTOS.find((p) => p.id === id)
  const vista = vistas?.find((v) => v.titulo === tituloVista)

  const enlaces = [
    medir && {
      href: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(canonicalDe(ruta))}`,
      texto: 'Medir esta página',
      boton: true,
    },
    sitio && { href: sitio, texto: new URL(sitio).host },
    repositorio && { href: repositorio, texto: 'Ver el código' },
    publicacion && { href: publicacion, texto: 'Ver la publicación' },
  ].filter(Boolean)

  return (
    <section className={className ? `seccion zona-cielo ${className}` : 'seccion zona-cielo'} aria-labelledby="prueba-titulo">
      <div className="contenedor">
        <div className={`servicio-prueba zona-plano entra${vista ? ' con-vista' : ''}`}>
          <div className="servicio-prueba-texto">
            <p className="antetitulo">
              Compruébalo{credencial && ` · ${credencial.titulo}`}
            </p>
            <h2 id="prueba-titulo">{nombre}</h2>
            <p className="servicio-prueba-bajada">{texto}</p>
          </div>
          <ul className="servicio-prueba-enlaces">
            {enlaces.map(({ href, texto, boton }) => (
              <li key={href}>
                <a className={boton ? 'boton boton-primario' : undefined} href={href} rel="noopener">
                  {texto} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
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

/**
 * Lo que hay que saber antes de escribir: si le sirve, qué le vamos a pedir y
 * cómo trabajamos. Sin `cuando` (la automatización), el pedido va solo.
 */
export function ParaEmpezar({ cuando, pedimos, pasos = PASOS }) {
  return (
    <section className="seccion zona-cielo">
      <div className="contenedor">
        <div className="servicio-empezar">
          {cuando && (
            <div className="servicio-cuando entra">
              <h2>Te sirve si…</h2>
              <ul className="vistos">
                {cuando.map((senal) => (
                  <li key={senal}>{senal}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="servicio-pedimos entra">
            <h2>Te vamos a pedir</h2>
            <ul className="vistos">
              {pedimos.map((cosa) => (
                <li key={cosa}>{cosa}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="servicio-pasos entra">
          <h2>Cómo trabajamos</h2>
          <ol>
            {pasos.map((paso) => (
              <li key={paso}>{paso}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/**
 * Las preguntas frecuentes, plegadas: se lee la pregunta y se abre la que
 * interesa. La primera viene abierta. Plegadas siguen en el HTML, así que
 * buscadores y agentes las leen enteras, y el navegador las abre al buscar
 * en la página.
 */
export function Preguntas({ preguntas }) {
  return (
    <section className="seccion zona-cielo" aria-labelledby="preguntas-titulo">
      <div className="contenedor">
        <h2 id="preguntas-titulo" className="entra">
          Preguntas frecuentes
        </h2>
        <div className="servicio-preguntas">
          {preguntas.map(({ pregunta, respuesta }, i) => (
            <details key={pregunta} className="entra" open={i === 0}>
              <summary>{pregunta}</summary>
              <p>{respuesta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
