import Pagina from '../components/Pagina.jsx'
import { PAGINAS } from '../lib/meta.js'
import { ARRIBA, COLORES } from '../lib/pato.js'

/**
 * La 404. Cloudflare la sirve en cualquier dirección que no existe
 * (`not_found_handling` en wrangler.jsonc), así que todos sus enlaces son
 * absolutos: puede aparecer a cualquier profundidad.
 *
 * Es el arranque de la caída y nada más: la nube de la portada, el aviso y las
 * salidas, y debajo el mar. Ocupa la pantalla entera para que el pie no asome
 * a medio entrar al cargar.
 *
 * Y un juego: «Jugar» deshace la volutus en cúmulos repartidos por el cielo y
 * suelta patos desde dentro de ellos, como los del Duck Hunt desde el pasto; el
 * que se caza cae a través de la nube (src/patos.js).
 * Su lienzo va antes que el de la nube para quedar detrás: dentro de la nube,
 * los puntos de ella tapan los del pato. El botón llega oculto, porque sin
 * JavaScript no sirve, y flota sobre el cielo para que aparecer no mueva nada.
 */
export default function NoEncontrada() {
  const { descripcion } = PAGINAS['/404']

  return (
    <Pagina>
      <section className="seccion zona-cielo hora-manana no-encontrada">
        <div className="no-encontrada-cielo">
          <canvas className="patos" aria-hidden="true" />
          <canvas className="nubes" data-vista="cielo" aria-hidden="true" />
          <button className="boton boton-secundario jugar" type="button" hidden>
            <Pato />
            <span>Jugar</span>
          </button>
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

/**
 * El pato del botón: el mismo que vuela en el juego (lib/pato.js), punto por
 * punto y con sus colores. Va en el HTML y no en un lienzo porque el botón se
 * ve antes de que el juego se descargue. Un trazo por color, con un punto por
 * celda: un tramo casi nulo con punta redonda de una celda de ancho, que es el
 * mismo punto de media celda de radio que pinta el juego.
 */
function Pato() {
  const trazos = {}
  ARRIBA.forEach((fila, y) =>
    [...fila].forEach((letra, x) => {
      if (COLORES[letra]) trazos[letra] = `${trazos[letra] ?? ''}M${x + 0.5} ${y + 0.5}h.01`
    }),
  )
  return (
    <svg
      viewBox={`0 0 ${ARRIBA[0].length} ${ARRIBA.length}`}
      fill="none"
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      {Object.entries(trazos).map(([letra, d]) => (
        <path key={letra} stroke={COLORES[letra]} d={d} />
      ))}
    </svg>
  )
}
