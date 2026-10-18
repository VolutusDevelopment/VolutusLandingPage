import { Incluye, ParaEmpezar } from './Bloques.jsx'

/**
 * Agentes de IA: las preguntas frecuentes van primero y como una
 * conversación. Al bajar, cada pregunta entra, el agente escribe y llega su
 * respuesta (Agente.css); sin esas animaciones se leen enteras, como
 * cualquier lista de preguntas. La hora de cada burbuja la pone chat.js. Lo
 * que incluye viene después.
 *
 * En S y M la respuesta llega en varias burbujas, como escribe una persona:
 * se parte en frases, juntando las cortas. Desde L las partes van en línea y
 * se lee el mismo párrafo de siempre.
 */
const LARGO_DE_BURBUJA = 120

function burbujas(respuesta) {
  return respuesta.split(/(?<=[.!?»])\s+(?=[¿¡«A-ZÁÉÍÓÚÑ])/).reduce((partes, frase) => {
    const ultima = partes.at(-1)
    if (ultima && ultima.length + frase.length < LARGO_DE_BURBUJA) partes[partes.length - 1] = `${ultima} ${frase}`
    else partes.push(frase)
    return partes
  }, [])
}

export default function Agente({ pagina, estimado }) {
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
                  <p>
                    {burbujas(respuesta).map((parte, i) => (
                      <span key={i} className="agente-burbuja">
                        {i > 0 && ' '}
                        {parte}
                      </span>
                    ))}
                  </p>
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
      {estimado}
      <ParaEmpezar cuando={pagina.cuando} pedimos={pagina.pedimos} />
    </>
  )
}
