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
export default function Barra({ enHome = true }) {
  // Un ancla pelada fuera de la portada no apunta a nada: en /privacidad,
  // `#proyectos` resuelve a `/privacidad#proyectos`, que no existe. El enlace
  // parece correcto hasta que alguien lo pulsa, que es el peor momento para
  // enterarse. Desde otra página los anclas se cuelgan de la raíz.
  const ancla = (id) => (enHome ? `#${id}` : `/#${id}`)

  return (
    <header className="barra zona-cielo">
      <div className="contenedor barra-interior">
        {/* En la portada la marca sube al principio; fuera de ella, vuelve a
            la portada. Es la única forma de salir del documento legal con el
            gesto que todo el mundo intenta primero. */}
        <a
          className="barra-marca"
          href={enHome ? '#portada' : '/'}
          aria-label={enHome ? 'Volutus, volver arriba' : 'Volutus, ir a la portada'}
        >
          <Marca />
        </a>

        <nav aria-label="Secciones">
          <ul className="barra-enlaces">
            <li>
              <a href={ancla('proyectos')}>Proyectos</a>
            </li>
            <li>
              <a href={ancla('servicios')}>Servicios</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
