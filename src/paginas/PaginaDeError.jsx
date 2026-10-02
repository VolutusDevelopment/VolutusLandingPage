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
 * los puntos de ella tapan casi todo el pato. El botón llega oculto, porque sin
 * JavaScript no sirve, y va junto a «Inicio», que es igual de alto, así que
 * aparecer no mueve nada.
 *
 * /pato es la misma escena dedicada al juego: llega ahí quien caza al pato que
 * sale a nadar en el mar del pie, así que la partida empieza sola
 * (`empiezaSolo`, ver src/client.js). Su descripción va solo en el `<head>`
 * (`sinEntradilla`): la pantalla es el juego, y debajo del título no dice nada.
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
  return <PaginaDeError ruta="/pato" titulo="Dispara al pato" empiezaSolo sinEntradilla />
}

function PaginaDeError({ ruta, antetitulo, titulo, empiezaSolo = false, sinEntradilla = false }) {
  const { descripcion } = PAGINAS[ruta]

  return (
    <Pagina pie={false}>
      <section className="seccion zona-cielo hora-manana pagina-error">
        <div className="pagina-error-cielo">
          <canvas className="patos" aria-hidden="true" />
          <canvas className="nubes" data-vista="cielo" aria-hidden="true" />
        </div>

        <div className="contenedor pagina-error-texto">
          {antetitulo && <p className="antetitulo">{antetitulo}</p>}
          <h1>{titulo}</h1>
          {!sinEntradilla && <p className="entradilla">{descripcion}</p>}
          <p className="pagina-error-salidas">
            <a className="boton boton-primario" href="/">
              Inicio
            </a>
            <button className="boton boton-secundario jugar" type="button" data-empieza={empiezaSolo || undefined} hidden>
              <Pato />
              <span>Jugar</span>
            </button>
          </p>
        </div>
      </section>
    </Pagina>
  )
}

/**
 * El pato del botón: el mismo que vuela en el juego (lib/pato.js), celda por
 * celda y con sus colores. Va en el HTML y no en un lienzo porque el botón se
 * ve antes de que el juego se descargue. Una forma por color, con un cuadrado
 * por celda, el píxel de las consolas que lo inspiran, como la tarjeta para
 * compartir de /pato. Sin suavizado, para que los cuadrados vecinos no dejen
 * costuras entre ellos.
 */
function Pato() {
  const formas = {}
  ARRIBA.forEach((fila, y) =>
    [...fila].forEach((letra, x) => {
      if (COLORES[letra]) formas[letra] = `${formas[letra] ?? ''}M${x} ${y}h1v1h-1z`
    }),
  )
  return (
    <svg
      viewBox={`0 0 ${ARRIBA[0].length} ${ARRIBA.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {Object.entries(formas).map(([letra, d]) => (
        <path key={letra} fill={COLORES[letra]} d={d} />
      ))}
    </svg>
  )
}
