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
 * Los dos huecos de captura son los que §6 reserva para los productos en
 * desarrollo. Hasta que lleguen las imágenes se ocupan con un marcador sobrio
 * del sistema —superficie, línea de 1 px y etiqueta—, nunca con una imagen de
 * relleno. El hueco ya tiene su proporción 16:10 fija, así que la captura real
 * entra sin mover un píxel: el CLS es 0 antes y después.
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

export default function Proyectos() {
  const [destacado, ...resto] = [
    ...PROYECTOS.filter((p) => p.destacado),
    ...PROYECTOS.filter((p) => !p.destacado),
  ]

  return (
    <section id="proyectos" className="seccion zona-cielo proyectos">
      <div className="contenedor">
        <p className="antetitulo entra">Obra abierta</p>
        <h2 className="entra">Tres cosas que puedes abrir ahora mismo.</h2>
        {/* La versión anterior abría anunciando lo que falta: «no hay logos de
            clientes ni testimonios, porque todavía no hay clientes». Era
            honesta, pero dejaba al lector pensando en los clientes que no hay
            justo al entrar en la sección que tiene que convencerlo.

            Esta dice lo mismo sin confesar nada. §3 pide no aparentar
            trayectoria; no pide declarar la que falta. Y convierte la única
            credencial que hay —obra abierta— en una invitación: no te pido que
            me creas, te pido que lo abras. */}
        <p className="entradilla proyectos-entradilla entra">
          No tienes que creernos: cada proyecto va con su enlace o su código.
        </p>

        <article className="tarjeta proyecto proyecto-destacado zona-plano entra">
          {/* La credencial va ANTES del nombre: es lo único de esta página que
              validó un tercero, y es el motivo de que este proyecto encabece. */}
          <p className="proyecto-credencial dato">{destacado.credencial}</p>
          <h3>{destacado.nombre}</h3>
          <p className="proyecto-resumen">{destacado.resumen}</p>
          <Enlaces {...destacado} />
        </article>

        <div className="proyectos-resto">
          {resto.map((proyecto) => (
            <article key={proyecto.id} className="tarjeta proyecto entra">
              <h3>{proyecto.nombre}</h3>
              <p className="proyecto-resumen">{proyecto.resumen}</p>

              {/* La captura solo aparece si existe. Un marcador «en camino»
                  ocupando el elemento más grande de la tarjeta resta en vez de
                  sumar: la sección se llama «obra abierta» y un recuadro vacío
                  es lo contrario de enseñar obra. Un proyecto sin captura se
                  sostiene con su texto y su enlace, que es lo que exige §4. */}
              {proyecto.captura && (
                <img
                  className="proyecto-captura"
                  src={proyecto.captura.src}
                  srcSet={proyecto.captura.srcSet}
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  width={proyecto.captura.ancho}
                  height={proyecto.captura.alto}
                  alt={proyecto.captura.alt}
                  loading="lazy"
                  decoding="async"
                />
              )}

              <Enlaces {...proyecto} />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
