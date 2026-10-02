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
 *
 * `pie` en falso lo quita: las páginas de error son una sola pantalla, sin
 * caída que recorrer.
 *
 * `cierre` va entre el `main` y el pie, y comparte con el pie un solo fondo
 * (`.caida`): así el degradado es uno, de arriba de la última sección al
 * final de la página, y no dos que hay que empalmar.
 */
export default function Pagina({ enHome = false, ruta, className, pie = true, cierre, children }) {
  return (
    <>
      <a className="salto" href="#contenido">
        Saltar al contenido
      </a>

      <Barra enHome={enHome} ruta={ruta} />

      <main id="contenido" className={className}>
        {children}
      </main>

      {cierre ? (
        <div className="caida">
          {cierre}
          {pie && <Pie enHome={enHome} dia />}
        </div>
      ) : (
        pie && <Pie enHome={enHome} />
      )}
    </>
  )
}
