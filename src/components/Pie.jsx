import { Logotipo } from './Marca.jsx'
import { CORREO_DE_CONTACTO } from './Contacto.jsx'
import { PROYECTOS } from '../data/proyectos.js'

/**
 * Pie.
 *
 * Cierra la página en plano, oscuro, con el nombre a todo lo ancho: es lo
 * último que se ve y se queda como una firma. Debajo, los enlaces agrupados por
 * para qué sirven y separados por líneas discontinuas, y la línea legal.
 *
 * El logotipo grande es decoración: la marca ya enlaza a la portada desde la
 * barra, así que aquí no es un enlace y se esconde del lector de pantalla. La
 * palabra va en `content` del CSS y no en el HTML, para que no compita con el
 * titular como texto de la página.
 *
 * **La columna de obra se genera desde `PROYECTOS`.** Es la misma lista que
 * pinta el índice, así que el día que un proyecto entre o salga, el pie se
 * entera solo.
 *
 * Sigue sin llevar perfiles personales de GitHub ni LinkedIn: §4 lo prohíbe.
 * Lo que se enlaza es el código, y eso es justamente la columna de obra.
 */

const ANCLAS = [
  ['proyectos', 'Proyectos'],
  ['proceso', 'Cómo trabajamos'],
  ['contacto', 'Contacto'],
]

function Columna({ titulo, children }) {
  return (
    <div className="pie-columna">
      <h2 className="pie-titulo">{titulo}</h2>
      <ul>{children}</ul>
    </div>
  )
}

export default function Pie({ enHome = true }) {
  // El mismo cuidado que en la barra: un ancla suelta fuera de la portada
  // apunta a una sección que esa página no tiene.
  const ancla = (id) => (enHome ? `#${id}` : `/#${id}`)

  return (
    <footer className="pie zona-plano">
      <div className="contenedor">
        <div className="pie-logotipo" aria-hidden="true">
          <span className="pie-logotipo-cuerpo">
            <Logotipo className="pie-logotipo-svg" />
          </span>
        </div>

        <nav className="pie-columnas" aria-label="Pie de página">
          <Columna titulo="Página">
            {ANCLAS.map(([id, texto]) => (
              <li key={id}>
                <a href={ancla(id)}>{texto}</a>
              </li>
            ))}
          </Columna>

          <Columna titulo="Obra">
            {PROYECTOS.map((p) => (
              <li key={p.id}>
                <a href={p.sitio ?? p.repositorio} rel="noopener">
                  {p.nombre}
                </a>
              </li>
            ))}
          </Columna>

          <Columna titulo="Escríbenos">
            <li>
              <a href={`mailto:${CORREO_DE_CONTACTO}`}>{CORREO_DE_CONTACTO}</a>
            </li>
          </Columna>
        </nav>

        <div className="pie-cierre">
          <p>© {new Date().getFullYear()} Volutus · Desarrollo de software · Chile</p>
          <a href="/privacidad">Privacidad</a>
        </div>
      </div>
    </footer>
  )
}
