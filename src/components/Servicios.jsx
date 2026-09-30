import { SERVICIOS } from '../lib/servicios.js'
import { VOLUTA } from './Marca.jsx'

/**
 * Servicios. Ocupa el sitio de «Cómo trabajamos» y copia el diseño de la
 * sección «Support For Any Business Type» de orderful.com, que se comporta
 * distinto según la pantalla:
 *
 * - **En escritorio es un acordeón horizontal.** Una columna por servicio; la
 *   elegida se abre ancha con su texto, su enlace y su lámina, y las demás
 *   quedan estrechas con el icono y el nombre en vertical. Se cambia con un
 *   clic, no al pasar el ratón: pasar solo resalta.
 * - **En el celular es una rejilla de fichas** con el panel de la elegida
 *   debajo. La original usa tres columnas; aquí van dos, porque con seis
 *   servicios «Automatizaciones» no cabía ni a 412 px, se partía con guion y
 *   dejaba las dos filas de distinta altura.
 *
 * Un solo marcado para las dos: cada servicio es un título con su botón y un
 * panel. En escritorio cada servicio es una columna; en el celular el
 * envoltorio desaparece (`display: contents`) y títulos y paneles pasan a ser
 * piezas sueltas de la rejilla, con los paneles al final. Orderful pinta el
 * contenido dos veces, una por pantalla; aquí se pinta una.
 *
 * El patrón de accesibilidad es el del acordeón de ARIA: un botón dentro del
 * título que abre su región. Los atributos los pone `servicios.js` al
 * arrancar, porque sin JavaScript no hay nada que abrir: la hoja de
 * `<noscript>` enseña los cuatro servicios uno debajo del otro, y un
 * `aria-expanded="false"` sobre un panel a la vista sería mentira.
 */

// La lámina de cada panel: las volutas de Diego, una dentro de otra, cada una
// girada un cuarto de vuelta más que la anterior y en su tono de la paleta.
const TONOS = ['tono-petroleo', 'tono-ciruela', 'tono-pizarra', '', 'tono-petroleo', 'tono-ciruela']
const ESCALAS = [1, 0.78, 0.56, 0.34]
const [OJO_X, OJO_Y] = VOLUTA.puntos.at(-1)

function Lamina({ giro, tono }) {
  return (
    <div className={`servicio-lamina zona-plano ${tono}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <g transform={`rotate(${giro} 12 12)`}>
          {ESCALAS.map((escala) => (
            <path
              key={escala}
              d={VOLUTA.d}
              transform={`translate(${OJO_X * (1 - escala)} ${OJO_Y * (1 - escala)}) scale(${escala})`}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>
    </div>
  )
}

// Iconos de trazo, en la misma rejilla de 24 que el símbolo. Uno por servicio.
const ICONOS = {
  web: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
    </>
  ),
  tienda: (
    <>
      <path d="M3.5 4h2.2l2 11h10.8l1.8-7.5H7" />
      <circle cx="9.5" cy="19" r="1.3" />
      <circle cx="17" cy="19" r="1.3" />
    </>
  ),
  app: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  agente: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z" />
      <path d="M12 6.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" />
    </>
  ),
  datos: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8.2-7 9.5-4-1.3-7-5-7-9.5V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  automatizacion: (
    <>
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5" />
    </>
  ),
}

function Icono({ id }) {
  return (
    <svg
      className="servicio-icono"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONOS[id]}
    </svg>
  )
}

// Sin JavaScript no hay acordeón: los cuatro servicios se ven enteros, uno
// debajo del otro. Va en `<noscript>` y no al revés —el acordeón activado por
// una clase que pone el script— porque así la página no cambia de forma al
// arrancar: quien llega por /#servicios cae donde tiene que caer.
const SIN_SCRIPT = `
.servicios-lista { display: grid !important; grid-template-columns: 1fr !important; gap: var(--e-2); }
.servicio { display: block !important; }
.servicio-panel { display: flex !important; min-width: 0 !important; visibility: visible !important; grid-row: auto !important; }
.servicio-boton { pointer-events: none; flex-direction: row !important; height: auto !important; }
.servicio-nombre { writing-mode: horizontal-tb !important; }
.servicio-panel-titulo { display: none !important; }
`

export default function Servicios() {
  return (
    <section id="servicios" className="seccion zona-cielo corte-de-zona servicios">
      <div className="contenedor">
        <p className="antetitulo entra">Servicios</p>
        <h2 className="entra">Lo que construimos.</h2>

        {/* `--fila-paneles`: la fila que sigue a las fichas en el celular,
            donde se apilan todos los paneles (ver Servicios.css). */}
        <div
          className="servicios-lista entra"
          style={{ '--fila-paneles': Math.ceil(SERVICIOS.length / 2) + 1 }}
        >
          {SERVICIOS.map((servicio, i) => (
            <div key={servicio.id} className={`servicio${i === 0 ? ' activo' : ''}`}>
              <h3 className="servicio-titulo">
                <button type="button" className="servicio-boton" id={`servicio-${servicio.id}-boton`}>
                  <Icono id={servicio.id} />
                  <span className="servicio-nombre">{servicio.nombre}</span>
                </button>
              </h3>

              <div className="servicio-panel" id={`servicio-${servicio.id}`}>
                {/* En el celular el nombre de arriba es una ficha pequeña de la
                    rejilla, así que el panel repite el nombre como título.
                    Para el lector de pantalla ya lo dice el botón. */}
                <p className="servicio-panel-titulo" aria-hidden="true">
                  {servicio.nombre}
                </p>
                <p className="servicio-texto">{servicio.texto}</p>
                {servicio.enlace && (
                  <p>
                    <a
                      className="boton boton-secundario"
                      href={servicio.enlace.href}
                      {...(servicio.enlace.href.startsWith('http') && { rel: 'noopener' })}
                    >
                      {servicio.enlace.texto}
                    </a>
                  </p>
                )}
                {servicio.imagen ? (
                  <div className="servicio-captura">
                    <img
                      src={servicio.imagen.src}
                      srcSet={servicio.imagen.srcSet}
                      sizes="(min-width: 1024px) 40rem, 100vw"
                      width={servicio.imagen.ancho}
                      height={servicio.imagen.alto}
                      alt={servicio.imagen.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : (
                  <Lamina giro={i * 90} tono={TONOS[i]} />
                )}
              </div>
            </div>
          ))}
        </div>

        <noscript>
          <style dangerouslySetInnerHTML={{ __html: SIN_SCRIPT }} />
        </noscript>
      </div>
    </section>
  )
}
