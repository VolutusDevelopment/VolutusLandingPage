import Pagina from '../components/Pagina.jsx'
import { PAGINAS } from '../lib/meta.js'
import { ARRIBA, COLORES } from '../lib/pato.js'

/**
 * Las páginas de error —la 404 y la de los 5xx— y /pato. Son la misma
 * pantalla, la nube de la portada con un aviso y una sola salida, y ninguna
 * lleva pie: son un alto, no una página que se recorre. Cada una ocupa la
 * pantalla entera.
 *
 * Las de error pueden aparecer en cualquier dirección, así que todos sus
 * enlaces son absolutos. La 404 la sirve Cloudflare donde no hay archivo
 * (`not_found_handling` en wrangler.jsonc). La de los 5xx sale en /500 y solo
 * Cloudflare puede servirla en sus errores, con una Custom Error Rule, que pide
 * plan Pro (ver README).
 *
 * Y un juego: «Jugar» deshace la volutus en cúmulos repartidos por el cielo y
 * suelta patos desde dentro de ellos, como los del Duck Hunt desde el pasto; el
 * que se caza cae a través de la nube (src/patos.js).
 * Su lienzo va antes que el de la nube para quedar detrás: dentro de la nube,
 * los puntos de ella tapan los del pato. El botón llega oculto, porque sin
 * JavaScript no sirve, y flota sobre el cielo para que aparecer no mueva nada.
 *
 * /pato es la misma escena dedicada al juego: llega ahí quien caza al pato que
 * sale a nadar en el mar del pie, así que la partida empieza sola
 * (`empiezaSolo`, ver src/client.js).
 */
export function NoEncontrada() {
  return <PaginaDeError ruta="/404" antetitulo="Error 404" titulo="Esta página no existe." />
}

// Una sola para todos los 5xx, así que no dice el código: dice de quién es la
// falla.
export function ErrorDelServidor() {
  return <PaginaDeError ruta="/500" antetitulo="Error del servidor" titulo="Algo falló de nuestro lado." />
}

export function CazaDePatos() {
  return <PaginaDeError ruta="/pato" titulo="Dispara al pato" empiezaSolo />
}

function PaginaDeError({ ruta, antetitulo, titulo, empiezaSolo = false }) {
  const { descripcion } = PAGINAS[ruta]

  return (
    <Pagina pie={false}>
      <section className="seccion zona-cielo hora-manana pagina-error">
        <div className="pagina-error-cielo">
          <canvas className="patos" aria-hidden="true" />
          <canvas className="nubes" data-vista="cielo" aria-hidden="true" />
          <button className="boton boton-secundario jugar" type="button" data-empieza={empiezaSolo || undefined} hidden>
            <Pato />
            <span>Jugar</span>
          </button>
        </div>

        <div className="contenedor pagina-error-texto">
          {antetitulo && <p className="antetitulo">{antetitulo}</p>}
          <h1>{titulo}</h1>
          <p className="entradilla">{descripcion}</p>
          <p className="pagina-error-salidas">
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
