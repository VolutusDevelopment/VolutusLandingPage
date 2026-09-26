import Marca from './Marca.jsx'
import { CORREO_DE_CONTACTO } from './Contacto.jsx'
import { PROYECTOS } from '../data/proyectos.js'

/**
 * Pie.
 *
 * Sigue en cielo y forma un solo bloque de cierre con el formulario. Que no
 * cambie de tema no es un olvido: A.4 fija **dos** cortes en toda la página y
 * los dos están gastados, así que un pie oscuro sería un tercero. Es la
 * diferencia con el de PonleNota, que sí es navy porque su página reparte los
 * fondos de otra manera.
 *
 * De ahí sí se toma la anatomía, que es lo que aquí faltaba: a la izquierda la
 * identidad —marca, una línea de qué somos y el correo—, a la derecha los
 * enlaces agrupados por para qué sirven. Antes era una fila plana donde el
 * aviso legal y el enlace de privacidad pesaban lo mismo.
 *
 * **La columna de obra se genera desde `PROYECTOS`.** No es floritura: es la
 * misma lista que pinta el índice, así que el día que un proyecto entre o
 * salga, el pie se entera solo. Un pie con enlaces a obra que ya no está es
 * exactamente lo que esta página no se puede permitir.
 *
 * Sigue sin llevar perfiles personales de GitHub ni LinkedIn: §4 lo prohíbe.
 * Lo que se enlaza es el código, y eso es justamente la columna del medio.
 */

const ANCLAS = [
  ['#proyectos', 'Proyectos'],
  ['#proceso', 'Cómo trabajamos'],
  ['#contacto', 'Contacto'],
]

function Columna({ titulo, children }) {
  return (
    <div className="pie-columna">
      <h2 className="pie-titulo">{titulo}</h2>
      <ul>{children}</ul>
    </div>
  )
}

export default function Pie() {
  return (
    <footer className="pie zona-cielo">
      <div className="contenedor pie-interior">
        <div className="pie-identidad">
          <Marca />

          <p className="pie-lema">
            Software que puedes abrir y revisar. Cuéntanos qué necesitas y te respondemos en menos
            de 48 horas hábiles.
          </p>

          <p className="pie-correo">
            <a href={`mailto:${CORREO_DE_CONTACTO}`}>{CORREO_DE_CONTACTO}</a>
          </p>
        </div>

        <nav className="pie-columnas" aria-label="Pie de página">
          <Columna titulo="Página">
            {ANCLAS.map(([href, texto]) => (
              <li key={href}>
                <a href={href}>{texto}</a>
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

          <Columna titulo="Legal">
            <li>
              <a href="/privacidad">Privacidad</a>
            </li>
          </Columna>
        </nav>
      </div>

      <div className="contenedor pie-cierre">
        <p>© {new Date().getFullYear()} Volutus · Desarrollo de software · Chile</p>
      </div>
    </footer>
  )
}
