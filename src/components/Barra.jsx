import Marca from './Marca.jsx'

/**
 * Barra de navegación: la marca suelta a la izquierda y, a la derecha, una
 * cápsula flotante con las dos anclas y la acción principal.
 *
 * La barra en sí no tiene fondo: lo único que tapa el contenido al desplazar
 * son las dos piezas, cada una con su vidrio translúcido. Así la portada
 * respira hasta arriba y la navegación se lee como un objeto encima de la
 * página, no como una franja que la corta.
 *
 * Detrás va el velo: cuatro capas de desenfoque creciente, cada una con su
 * máscara, que funden lo que pasa por debajo sin un borde donde cortarse. Al
 * pasar sobre una sección oscura, `barra.js` cambia la zona de la barra y el
 * vidrio se oscurece con ella.
 *
 * Lleva la acción principal porque la cápsula la hace discreta: un botón
 * pequeño dentro de un objeto que ya existe, siempre a mano, no un segundo
 * cartel que persigue al visitante. En S se retira y quedan las anclas.
 *
 * Sigue sin menú desplegable en móvil: son dos anclas y un botón, y un
 * hamburguesa sería JavaScript de navegación que el presupuesto de §8 no paga.
 */
export default function Barra({ enHome = true }) {
  // Un ancla pelada fuera de la portada no apunta a nada: en /privacidad,
  // `#proyectos` resuelve a `/privacidad#proyectos`, que no existe. El enlace
  // parece correcto hasta que alguien lo pulsa, que es el peor momento para
  // enterarse. Desde otra página los anclas se cuelgan de la raíz.
  const ancla = (id) => (enHome ? `#${id}` : `/#${id}`)

  return (
    <header className="barra zona-cielo">
      <div className="barra-velo" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
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

        <nav className="barra-capsula" aria-label="Secciones">
          <ul className="barra-enlaces">
            <li>
              <a href={ancla('proyectos')}>Proyectos</a>
            </li>
            <li>
              <a href={ancla('servicios')}>Servicios</a>
            </li>
          </ul>
          <a className="boton boton-primario barra-accion" href={ancla('contacto')}>
            Cuéntanos tu proyecto
          </a>
        </nav>
      </div>
    </header>
  )
}
