import { PROYECTOS } from '../data/proyectos.js'

/**
 * Índice de obra (DESIGN-BRIEF §4, bloque 2). Aquí ocurre el primer corte de
 * tema: la página pasa a plano porque cambia el registro del discurso — deja de
 * prometer y empieza a demostrar (A.3). El corte es una línea, nunca un
 * degradado.
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
    <section id="proyectos" className="seccion zona-plano corte-de-zona proyectos">
      <div className="contenedor">
        <p className="antetitulo">Obra abierta</p>
        <h2>Tres cosas que puedes abrir ahora mismo.</h2>
        <p className="entradilla proyectos-entradilla">
          No hay logos de clientes ni testimonios, porque todavía no hay clientes. Hay obra, y se
          revisa.
        </p>

        <article className="tarjeta proyecto proyecto-destacado">
          {/* La credencial va ANTES del nombre: es lo único de esta página que
              validó un tercero, y es el motivo de que este proyecto encabece. */}
          <p className="proyecto-credencial dato">{destacado.credencial}</p>
          <h3>{destacado.nombre}</h3>
          <p className="proyecto-resumen">{destacado.resumen}</p>
          <Enlaces {...destacado} />
        </article>

        <div className="proyectos-resto">
          {resto.map((proyecto) => (
            <article key={proyecto.id} className="tarjeta proyecto">
              <h3>{proyecto.nombre}</h3>
              <p className="proyecto-resumen">{proyecto.resumen}</p>

              <div className="proyecto-hueco" role="img" aria-label={`Captura de ${proyecto.nombre}, pendiente`}>
                <span className="dato">Captura en camino</span>
              </div>

              <Enlaces {...proyecto} />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
