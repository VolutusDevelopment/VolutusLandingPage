import Barra from './Barra.jsx'
import Pie from './Pie.jsx'

/**
 * El marco de todas las páginas: el salto al contenido, la barra, el `main` y
 * el pie. Cada página es una caída: empieza arriba, bajo la barra, y termina en
 * el mar del pie.
 *
 * `enHome` decide a dónde apuntan los anclas del menú. Fuera de la
 * portada tienen que ser `/#proyectos`: un `#proyectos` pelado apunta a una
 * sección que la página no tiene, y el error no se ve hasta que alguien hace
 * clic.
 *
 * `ruta` marca en la barra el enlace de la página en la que se está.
 *
 * `hora` es la de la cabecera de la página, para que la barra ya salga del
 * servidor con sus colores y no cambie al cargar (barra.js la sigue después).
 *
 * `pie` en falso lo quita: las páginas de error son una sola pantalla, sin
 * caída que recorrer.
 *
 * `pieDeDia` pone el pie de la home, con su degradado, aunque no haya cierre.
 *
 * `cierre` va entre el `main` y el pie, y comparte con el pie un solo fondo
 * (`.caida`): así el degradado es uno, de arriba de la última sección al
 * final de la página, y no dos que hay que empalmar.
 */
export default function Pagina({ enHome = false, ruta, hora, className, pie = true, pieDeDia = false, cierre, children }) {
  return (
    <>
      <a className="salto" href="#contenido">
        Saltar al contenido
      </a>

      <Barra enHome={enHome} ruta={ruta} hora={hora} />

      <main id="contenido" className={className}>
        {children}
      </main>

      {cierre || pieDeDia ? (
        <div className="caida">
          {cierre}
          {pie && <Pie dia />}
        </div>
      ) : (
        pie && <Pie />
      )}
    </>
  )
}
