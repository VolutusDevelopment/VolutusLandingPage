/**
 * Las piezas que comparten las páginas de servicio. Cada servicio (los demás
 * archivos de esta carpeta) las ordena alrededor de su «Qué incluye», que es
 * lo que no se parece entre una página y otra. Sus estilos, en Servicio.css.
 */

/** La sección de «Qué incluye», con su título; lo de adentro es de cada servicio. */
export function Incluye({ className, children }) {
  return (
    <section id="incluye" className={`seccion zona-cielo ${className}`} aria-labelledby="incluye-titulo">
      <div className="contenedor">
        <h2 id="incluye-titulo" className="titular entra">
          Qué incluye
        </h2>
        {children}
      </div>
    </section>
  )
}

/**
 * Lo que hay que saber antes de escribir: si le sirve y qué le vamos a pedir.
 * Sin `cuando` (la automatización), el pedido va solo. En S y M van sin cajas:
 * las señales con su visto y lo que pedimos numerado (Servicio.css).
 */
export function ParaEmpezar({ cuando, pedimos }) {
  return (
    <section className="seccion zona-cielo">
      <div className="contenedor">
        <div className="servicio-empezar">
          {cuando && (
            <div className="servicio-cuando entra">
              <h2>Te sirve si…</h2>
              <ul className="vistos">
                {cuando.map((senal) => (
                  <li key={senal}>{senal}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="servicio-pedimos entra">
            <h2>Te vamos a pedir</h2>
            <ul className="vistos">
              {pedimos.map((cosa) => (
                <li key={cosa}>{cosa}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Las preguntas frecuentes, plegadas: se lee la pregunta y se abre la que
 * interesa. La primera viene abierta. Plegadas siguen en el HTML, así que
 * buscadores y agentes las leen enteras, y el navegador las abre al buscar
 * en la página. En S y M, preguntas.js deja una sola abierta y anima el paso.
 */
export function Preguntas({ preguntas }) {
  return (
    <section className="seccion zona-cielo" aria-labelledby="preguntas-titulo">
      <div className="contenedor">
        <h2 id="preguntas-titulo" className="titular entra">
          Preguntas frecuentes
        </h2>
        <div className="servicio-preguntas">
          {preguntas.map(({ pregunta, respuesta }, i) => (
            <details key={pregunta} className="entra" open={i === 0}>
              <summary>{pregunta}</summary>
              <p>{respuesta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
