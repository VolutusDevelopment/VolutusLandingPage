import Pagina from '../components/Pagina.jsx'
import { PAGINAS } from '../lib/meta.js'

/**
 * La 404. Cloudflare la sirve en cualquier dirección que no existe
 * (`not_found_handling` en wrangler.jsonc), así que todos sus enlaces son
 * absolutos: puede aparecer a cualquier profundidad.
 *
 * Es el arranque de la caída y nada más: la nube de la portada, el aviso y las
 * salidas, y debajo el mar. Ocupa la pantalla entera para que el pie no asome
 * a medio entrar al cargar.
 */
export default function NoEncontrada() {
  const { descripcion } = PAGINAS['/404']

  return (
    <Pagina>
      <section className="seccion zona-cielo hora-manana no-encontrada">
        <div className="no-encontrada-cielo">
          <canvas className="nubes" data-vista="cielo" aria-hidden="true" />
        </div>

        <div className="contenedor no-encontrada-texto">
          <p className="antetitulo">Error 404</p>
          <h1>Esta página no existe.</h1>
          <p className="entradilla">{descripcion}</p>
          <p className="no-encontrada-salidas">
            <a className="boton boton-primario" href="/">
              Volver al inicio
            </a>
          </p>
        </div>
      </section>
    </Pagina>
  )
}
