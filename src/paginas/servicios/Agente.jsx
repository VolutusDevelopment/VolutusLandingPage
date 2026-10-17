import { Incluye, ParaEmpezar, Prueba } from './Bloques.jsx'

/**
 * Agentes de IA: las preguntas frecuentes van primero y como una
 * conversación. Al bajar, cada pregunta entra, el agente escribe y llega su
 * respuesta (Agente.css); sin esas animaciones se leen enteras, como
 * cualquier lista de preguntas. La hora de cada burbuja la pone chat.js. Lo
 * que incluye viene después.
 */
export default function Agente({ pagina, ruta }) {
  return (
    <>
      <section className="seccion zona-cielo" aria-labelledby="preguntas-titulo">
        <div className="contenedor">
          <h2 id="preguntas-titulo" className="entra">
            Preguntas frecuentes
          </h2>
          <dl className="agente-chat">
            {pagina.preguntas.map(({ pregunta, respuesta }) => (
              <div key={pregunta} className="agente-mensaje">
                <dt>{pregunta}</dt>
                <dd>
                  <span className="agente-escribiendo" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  <p>{respuesta}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <Incluye className="agente-incluye">
        <ul className="agente-puntos">
          {pagina.incluye.map(({ titulo, texto }) => (
            <li key={titulo} className="entra">
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </li>
          ))}
        </ul>
      </Incluye>
      <Prueba prueba={pagina.prueba} ruta={ruta} />
      <ParaEmpezar cuando={pagina.cuando} pedimos={pagina.pedimos} />
    </>
  )
}
