import Icono from './Icono.jsx'
import Marca from './Marca.jsx'
import { SERVICIOS } from '../lib/servicios.js'

// Los que tienen página propia: los de la lista de servicios de la barra.
const CON_PAGINA = SERVICIOS.filter(({ ruta }) => ruta)

/**
 * La lente de la cápsula: el bisel del vidrio desvía lo que hay detrás.
 *
 * La misma losa que describe Barra.css (n = 1.5, bisel de 12 px) tiene, a
 * una distancia d del canto, la superficie inclinada un ángulo θ con
 * sin θ = (b − d)/b. Un rayo que la cruza se tuerce según Snell,
 * sin θ = n · sin θr, y sale desviado δ = θ − θr: a través de un vidrio de
 * grosor h, lo de atrás se ve corrido h · tan δ. El bisel es convexo, y una
 * lente convexa aumenta: en el canto se ve lo que en realidad está más hacia
 * el centro, así que el fondo se estira y se curva al llegar al borde. (Es
 * también lo único que se puede pintar: `backdrop-filter` solo ve lo que hay
 * bajo la cápsula, no lo de fuera.) Dentro de los 4 px del
 * ángulo crítico la luz no pasa (reflexión total interna); ahí se sostiene el
 * valor del borde.
 *
 * El corrimiento se codifica en el canal verde de un mapa de desplazamiento
 * (128 = quieto) y `feDisplacementMap` lo aplica al fondo. Solo es vertical:
 * así el mapa se puede estirar a cualquier ancho de cápsula sin deformarse.
 * Se calcula aquí porque React corre solo en el prerender: el HTML llega con
 * los números y el navegador no calcula nada.
 */
const N = 1.5
const BISEL = 12
const GROSOR = 40
const ALTO = 52
// Corrimiento máximo representable: ±ESCALA/2 px.
const ESCALA = 24

function corrimiento(d) {
  if (d >= BISEL) return 0
  const seno = (BISEL - Math.max(d, BISEL * (1 - 1 / N))) / BISEL
  return GROSOR * Math.tan(Math.asin(seno) - Math.asin(seno / N))
}

// Arriba el fondo se toma de más abajo (verde > 128) y abajo, de más arriba:
// los dos bordes miran hacia el centro.
const canal = (px) => Math.round((0.5 + px / ESCALA) * 255)
const PERFIL = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const PARADAS = [
  ...PERFIL.map((d) => [d, canal(corrimiento(d))]),
  ...PERFIL.toReversed().map((d) => [ALTO - d, canal(-corrimiento(d))]),
]
const MAPA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 ${ALTO}" preserveAspectRatio="none"><linearGradient id="g" x2="0" y2="1">${PARADAS.map(
  ([y, verde]) => `<stop offset="${(y / ALTO).toFixed(4)}" stop-color="rgb(128,${verde},128)"/>`
).join('')}</linearGradient><rect width="1" height="${ALTO}" fill="url(#g)"/></svg>`

function Lente() {
  return (
    <svg className="barra-lente" width="0" height="0" aria-hidden="true" focusable="false">
      <filter id="lente" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feImage
          href={`data:image/svg+xml,${encodeURIComponent(MAPA)}`}
          x="0"
          y="0"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          result="mapa"
        />
        <feDisplacementMap in="SourceGraphic" in2="mapa" scale={ESCALA} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  )
}

/**
 * Barra de navegación: la marca suelta a la izquierda y, a la derecha, una
 * cápsula flotante con los enlaces a /nosotros, /servicios y /articulos y la
 * acción principal.
 *
 * La barra en sí no tiene fondo, y al bajar la acompañan las dos piezas, fijas
 * cada una por su lado (Barra.css): son lo único que tapa el contenido, cada
 * una con su vidrio translúcido. Así la portada respira hasta arriba y la
 * navegación se lee como un objeto encima de la página, no como una franja que
 * la corta.
 * `barra.js` da a cada pieza la zona de lo que tiene justo detrás: el vidrio
 * de la cápsula no cambia, solo el color del logo y el de cada enlace, por
 * separado.
 *
 * La cápsula se nota por cómo se comporta, no por su adorno: el vidrio se
 * condensa con el scroll, y una gota viaja entre los enlaces y descansa en el
 * de la página o la sección actual: marca dónde estás (Barra.css y
 * `barra.js`). En Chromium, además, el bisel refracta el fondo (ver `Lente`).
 *
 * Lleva la acción principal porque la cápsula la hace discreta: un botón
 * pequeño dentro de un objeto que ya existe, siempre a mano, no un segundo
 * cartel que persigue al visitante. Va de contorno y no relleno: la cápsula
 * nunca pesa más que el titular, y el botón relleno de la portada es el que
 * manda. En S se retira y quedan los enlaces, que caben desde 360 px. Antes
 * que él, desde M, se retira «Artículos», que sigue en el pie.
 *
 * Sin hamburguesa: son tres enlaces y un botón. Lo único que se despliega es
 * la lista de servicios: en S y M, «Servicios» la abre (menu-servicios.js) en
 * vez de ir a /servicios, para saltar de un servicio a otro sin recorrer el
 * índice. Sin JavaScript, y desde L, el enlace lleva a /servicios.
 */
export default function Barra({ enHome = true, ruta, hora = 'manana', estilo, contactoAqui = false }) {
  // Un ancla pelada fuera de la portada no apunta a nada: en /privacidad,
  // `#contacto` resuelve a `/privacidad#contacto`, que no existe. El enlace
  // parece correcto hasta que alguien lo pulsa, que es el peor momento para
  // enterarse. Desde otra página los anclas se cuelgan de la raíz.
  const ancla = (id) => (enHome ? `#${id}` : `/#${id}`)
  // En una página hija (un servicio, un artículo, otra página del índice) el
  // indicador descansa en su madre.
  const actual = (destino) => (ruta === destino ? 'page' : ruta?.startsWith(`${destino}/`) ? 'true' : undefined)

  return (
    <header className={`barra zona-cielo hora-${hora}`} style={estilo}>
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
            {/* Páginas y no secciones: en ellas el indicador descansa
                desde el HTML, sin esperar a barra.js. */}
            <a href="/nosotros" aria-current={actual('/nosotros')}>
              Nosotros
            </a>
          </li>
          <li>
            <a href="/servicios" aria-current={actual('/servicios')}>
              Servicios
            </a>
          </li>
          <li className="barra-articulos">
            <a href="/articulos" aria-current={actual('/articulos')}>
              Artículos
            </a>
          </li>
          <li className="barra-contacto">
            <a href={contactoAqui ? '#contacto' : ancla('contacto')}>Cuéntanos tu proyecto</a>
          </li>
        </ul>
      </nav>
      <div id="menu-servicios" className="menu-servicios zona-cielo" hidden>
        <ul>
          {CON_PAGINA.map(({ id, ruta: destino, nombre, color }, fila) => (
            <li key={id} style={{ '--fila': fila }}>
              <a href={destino} aria-current={destino === ruta ? 'page' : undefined} style={{ '--servicio': color }}>
                <Icono id={id} className="menu-servicios-icono" papel />
                {nombre}
                {destino === ruta && <small>Estás aquí</small>}
              </a>
            </li>
          ))}
          <li className="menu-servicios-todos" style={{ '--fila': CON_PAGINA.length }}>
            <a href="/servicios">
              Todos los servicios <span aria-hidden="true">→</span>
            </a>
          </li>
        </ul>
      </div>
      <Lente />
    </header>
  )
}
