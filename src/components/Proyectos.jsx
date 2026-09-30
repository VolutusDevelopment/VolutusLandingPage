import { PROYECTOS } from '../data/proyectos.js'

/**
 * Índice de obra (DESIGN-BRIEF §4, bloque 2). La página sigue en blanco y el
 * color vive en las tarjetas: el proyecto con jurado externo va en bosque
 * —la única tarjeta oscura, porque es lo único validado por un tercero— y los
 * otros dos en tintes fríos y cálidos, así cada uno se lee como un objeto
 * aparte y no como filas de una tabla.
 *
 * Cada proyecto pinta solo los enlaces que tiene. Un proyecto sin ninguno no
 * llega hasta aquí: lo filtra el propio archivo de datos, donde está explicada
 * la regla y el estado verificado de cada uno.
 *
 * Un proyecto con capturas se enseña como vitrina: una tarjeta por cada cara
 * del producto. Sin capturas se sostiene con su texto y su enlace, que es
 * lo que exige §4; nunca con un marcador vacío en lugar de la imagen.
 */

function Enlaces({ sitio, repositorio, nombre }) {
  if (!sitio && !repositorio) return null
  return (
    <p className="proyecto-enlaces">
      {sitio && (
        <a href={sitio} rel="noopener">
          Abrir el sitio
          <span className="solo-lectores"> de {nombre}</span>
        </a>
      )}
      {repositorio && (
        <a href={repositorio} rel="noopener">
          Ver el código fuente
          <span className="solo-lectores"> de {nombre}</span>
        </a>
      )}
    </p>
  )
}

// La forma de cada vista sale de su orden: la primera ancha, la segunda corrida
// hacia dentro, la tercera alta y la cuarta cierra a todo el ancho. Juntas
// arman la composición desordenada.
const FORMAS = ['ancha', 'desplazada', 'alta', 'cierre']

// Tres trazos cortos, como los que se hacen a mano al margen para señalar algo.
function Chispa() {
  return (
    <svg className="chispa" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M6 22 L15 25 M12 8 L18 18 M26 4 L25 15" />
    </svg>
  )
}

/**
 * Un proyecto que se enseña por dentro: su cabecera y una tarjeta por cada
 * cara del producto, con su captura real, que sale por el borde de abajo
 * como si la tarjeta fuera una ventana sobre él. Cada tarjeta es una zona de
 * plano con su tono, así que el texto hereda colores que ya pasan contraste.
 */
const SIN_SCRIPT = `
.vitrina.plegada .vista { display: flex !important; }
.vitrina.plegada .vitrina-rejilla::before { display: block !important; }
.vitrina-abrir { display: none !important; }
`

function Vitrina({ proyecto }) {
  // Si el resumen nombra el dominio del sitio, el enlace va en esas mismas
  // palabras y sobra el «Abrir el sitio» aparte. Si no lo nombra, el enlace
  // aparte se queda: el sitio nunca se pierde.
  const dominio = proyecto.sitio && new URL(proyecto.sitio).hostname
  const [antes, ...despues] = proyecto.resumen.split(dominio)
  const enLinea = dominio && despues.length > 0

  const tarjetas = proyecto.vistas.map(({ titulo, texto, tono, imagen }, i) => (
    <section
      key={titulo}
      className={`vista vista-${FORMAS[i]} zona-plano ${tono ? `tono-${tono}` : ''} entra`}
    >
      <Chispa />
      <div className="vista-texto">
        <h4>{titulo}</h4>
        <p>{texto}</p>
      </div>
      <div className="vista-marco">
        <img
          src={imagen.src}
          srcSet={imagen.srcSet}
          sizes={imagen.sizes}
          width={imagen.ancho}
          height={imagen.alto}
          alt={imagen.alt}
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  ))
  // El cierre va fuera de la rejilla: la tarjeta fija de la app se suelta al
  // final de su contenedor, y así lo hace antes de llegar a él.
  const cierre = FORMAS.indexOf('cierre')

  return (
    // Plegada por defecto: abierta ocupa varias pantallas y tapaba el resto de
    // la obra. La cabecera se queda a la vista con un botón que la despliega;
    // lo mueve `vitrina.js`. Sin JavaScript, la hoja de `<noscript>` la deja
    // abierta y esconde el botón, que ahí no haría nada.
    <article className="vitrina plegada" id={proyecto.id}>
      <div className="vitrina-rejilla">
        {/* La cabecera es una burbuja más de la sección, como las de al lado,
            y se pulsa entera: el botón se estira por encima de toda la
            tarjeta (ver `.vitrina-abrir::after`). El enlace a ponlenota.cl
            queda por encima del botón y se sigue pudiendo abrir aparte. */}
        <div className="vitrina-cabecera tarjeta entra">
          <h3>{proyecto.nombre}</h3>
          <p className="proyecto-resumen">
            {enLinea ? (
              <>
                {antes}
                <a href={proyecto.sitio} rel="noopener">
                  {dominio}
                </a>
                {despues.join(dominio)}
              </>
            ) : (
              proyecto.resumen
            )}
          </p>
          <Enlaces {...proyecto} sitio={enLinea ? null : proyecto.sitio} />
          <button
            type="button"
            className="vitrina-abrir"
            aria-expanded="false"
            aria-controls={proyecto.id}
          >
            <span className="vitrina-abrir-texto">Ver {proyecto.nombre} por dentro</span>
            <span className="vitrina-abrir-flecha" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>
        </div>
        {tarjetas.slice(0, cierre)}
      </div>
      {tarjetas.slice(cierre)}
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: SIN_SCRIPT }} />
      </noscript>
    </article>
  )
}

export default function Proyectos() {
  const [destacado, ...resto] = [
    ...PROYECTOS.filter((p) => p.destacado),
    ...PROYECTOS.filter((p) => !p.destacado),
  ]

  return (
    <section id="proyectos" className="seccion zona-cielo proyectos">
      <div className="contenedor">
        <h2 className="entra">Echa un vistazo a nuestro trabajo</h2>

        <article className="tarjeta proyecto proyecto-destacado zona-plano tono-ciruela entra">
          {/* La credencial va ANTES del nombre: es lo único de esta página que
              validó un tercero, y es el motivo de que este proyecto encabece. */}
          <p className="proyecto-credencial dato">{destacado.credencial}</p>
          <h3>{destacado.nombre}</h3>
          <p className="proyecto-resumen">{destacado.resumen}</p>
          <Enlaces {...destacado} />
        </article>

        {resto.filter((p) => p.vistas).map((proyecto) => (
          <Vitrina key={proyecto.id} proyecto={proyecto} />
        ))}

        <div className="proyectos-resto">
          {resto.filter((p) => !p.vistas).map((proyecto) => (
            <article key={proyecto.id} className="tarjeta proyecto entra">
              <h3>{proyecto.nombre}</h3>
              <p className="proyecto-resumen">{proyecto.resumen}</p>

              <Enlaces {...proyecto} />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
