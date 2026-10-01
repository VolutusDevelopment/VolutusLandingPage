import Barra from './Barra.jsx'
import Pie from './Pie.jsx'

/**
 * El marco de todas las páginas: el salto al contenido, la barra, el `main` y
 * el pie. Cada página es una caída: empieza arriba, bajo la barra, y termina en
 * el mar del pie.
 *
 * `enHome` decide a dónde apuntan los anclas del menú y del pie. Fuera de la
 * portada tienen que ser `/#proyectos`: un `#proyectos` pelado apunta a una
 * sección que la página no tiene, y el error no se ve hasta que alguien hace
 * clic.
 *
 * `ruta` marca en la barra el enlace de la página en la que se está.
 */
export default function Pagina({ enHome = false, ruta, className, children }) {
  return (
    <>
      <a className="salto" href="#contenido">
        Saltar al contenido
      </a>

      <Barra enHome={enHome} ruta={ruta} />

      <main id="contenido" className={className}>
        {children}
      </main>

      <Pie enHome={enHome} />
    </>
  )
}
