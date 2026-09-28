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
          Ver el código
          <span className="solo-lectores"> de {nombre}</span>
        </a>
      )}
    </p>
  )
}

// La forma de cada vista sale de su orden: la primera ancha, la segunda alta,
// la tercera corrida hacia dentro y la cuarta pegada a la derecha. Juntas arman
// la composición desordenada.
const FORMAS = ['ancha', 'alta', 'desplazada', 'derecha']

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
function Vitrina({ proyecto }) {
  return (
    <article className="vitrina">
      <div className="vitrina-cabecera entra">
        <h3>{proyecto.nombre}</h3>
        <p className="proyecto-resumen">{proyecto.resumen}</p>
        <Enlaces {...proyecto} />
      </div>

      {proyecto.vistas.map(({ titulo, texto, tono, imagen }, i) => (
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
      ))}
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
        <h2 className="entra">Un vistazo a nuestro trabajo</h2>
        {/* La versión anterior abría anunciando lo que falta: «no hay logos de
            clientes ni testimonios, porque todavía no hay clientes». Era
            honesta, pero dejaba al lector pensando en los clientes que no hay
            justo al entrar en la sección que tiene que convencerlo.

            Esta dice lo mismo sin confesar nada. §3 pide no aparentar
            trayectoria; no pide declarar la que falta. Y convierte la única
            credencial que hay —obra abierta— en una invitación: no te pido que
            me creas, te pido que lo abras. */}
        <p className="entradilla proyectos-entradilla entra">
          Cada uno con su enlace o su código.
        </p>

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
