import Marca from './Marca.jsx'

/**
 * Barra de navegación (DESIGN-BRIEF §7: «reposo, fija al desplazar»).
 *
 * No lleva la acción principal. §4 lo fija en dos apariciones y solo dos: el
 * botón de la portada y el formulario del final. Una barra que persigue al
 * visitante con el mismo botón es ruido en una página que se lee en un minuto.
 *
 * Tampoco lleva menú desplegable en móvil: hay dos anclas. Un hamburguesa aquí
 * sería JavaScript de navegación en la portada que abre alguien desde WhatsApp,
 * y el presupuesto de §8 es de 15 KB para todo el sitio.
 *
 * Vive siempre en tema cielo aunque flote sobre la zona de plano: el fondo es
 * translúcido con desenfoque, así que al pasar sobre el corte se oscurece sola
 * sin que haya que conmutarle el tema con JavaScript.
 */
export default function Barra() {
  return (
    <header className="barra zona-cielo">
      <div className="contenedor barra-interior">
        <a className="barra-marca" href="#portada" aria-label="Volutus, inicio">
          <Marca />
        </a>

        <nav aria-label="Secciones">
          <ul className="barra-enlaces">
            <li>
              <a href="#proyectos">Proyectos</a>
            </li>
            <li>
              <a href="#proceso">Cómo trabajamos</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
