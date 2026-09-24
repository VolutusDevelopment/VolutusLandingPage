import Marca from './Marca.jsx'
import { CORREO_DE_CONTACTO } from './Contacto.jsx'

/**
 * Pie. Sigue en cielo y forma un solo bloque de cierre con el formulario: no
 * hay corte de tema entre los dos, porque A.4 fija dos cortes en toda la página
 * y los dos ya se gastaron.
 *
 * No lleva enlaces a perfiles personales de GitHub ni de LinkedIn. §4 lo
 * prohíbe expresamente: en esta página no aparecen personas, habla la empresa.
 * Lo que sí se enlaza es el código, y eso vive en el índice de proyectos.
 */
export default function Pie() {
  return (
    <footer className="pie zona-cielo">
      <div className="contenedor pie-interior">
        <Marca />

        <p className="pie-contacto">
          <a href={`mailto:${CORREO_DE_CONTACTO}`}>{CORREO_DE_CONTACTO}</a>
        </p>

        <p className="pie-legal">Volutus · Desarrollo de software · Chile</p>
      </div>
    </footer>
  )
}
