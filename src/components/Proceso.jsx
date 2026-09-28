
import { VOLUTA } from './Marca.jsx'

/**
 * Qué hacemos y cómo lo hacemos (DESIGN-BRIEF §4, bloque 4). Segundo corte de
 * tema: la página vuelve a cielo, porque vuelve a hablar con el visitante en
 * vez de enseñarle datos.
 *
 * Es UN bloque, no dos, y el orden no es negociable: **el cómo manda y el qué
 * va subordinado.** Partirlos en dos secciones es lo que haría crecer la página
 * sin motivo, y el *cómo* es lo que contesta la pregunta que el visitante trae
 * de verdad. §2 lo dice sin rodeos: la objeción más valiosa de las cuatro es
 * «¿qué tengo que entregarles yo?», y casi ninguna página de software la
 * responde. Por eso cada paso declara qué pone el cliente.
 *
 * Las tecnologías no aparecen. §4 las degrada a pie de página y prohíbe usarlas
 * como argumento de venta: los cuatro encargos se nombran por el resultado que
 * recibe el cliente, «una app Android en producción» y no «Kotlin».
 *
 * Los pasos son tarjetas que se apilan al desplazar: cada una se queda pegada
 * arriba y la siguiente sube por encima, mientras la de detrás se encoge y se
 * apaga. El orden se lee con el cuerpo —uno encima del otro— y no hay que
 * contar filas. Todo el efecto es CSS atado al scroll (ver Proceso.css).
 *
 * ────────────────────────────────────────────────────────────────────────────
 * LOS PLAZOS ESTÁN RESERVADOS, NO OLVIDADOS. §4 exige que el proceso lleve
 * tiempos —«un proceso sin tiempos no responde la pregunta que el visitante
 * trae»— y la pregunta abierta 6 del brief dice quién los pone: el equipo, con
 * horquillas por tipo de proyecto. Inventarlos aquí sería publicar un
 * compromiso que nadie aceptó. El hueco está preparado: basta rellenar `plazo`
 * en cada paso y la marca de pendiente desaparece sola.
 * ────────────────────────────────────────────────────────────────────────────
 */

const ENCARGOS = [
  'Un producto web en producción, con su panel y sus usuarios.',
  'Una app Android publicada y funcionando.',
  'Un agente de IA conectado a los sistemas que ya usas.',
  'Un indexador que reúne datos dispersos en un solo lugar consultable.',
]

const PASOS = [
  {
    titulo: 'Nos cuentas el problema',
    ponesTu: 'El problema en tus palabras. No hace falta que sepas cómo se resuelve.',
    plazo: null,
  },
  {
    titulo: 'Te mandamos alcance y precio',
    ponesTu: 'Una decisión: seguimos o no. Sin compromiso hasta aquí.',
    plazo: null,
  },
  {
    titulo: 'Construimos por entregas revisables',
    ponesTu: 'Media hora cada entrega para mirarlo y decirnos qué está mal.',
    plazo: null,
  },
  {
    titulo: 'Lo ponemos en producción y te lo entregamos',
    ponesTu: 'Los accesos necesarios. El código y las cuentas quedan a tu nombre.',
    plazo: null,
  },
]

const NO_ACEPTAMOS = [
  'Encargos para mañana. Lo que se hace con prisa se paga dos veces.',
  'Competir por ser los más baratos. Hay quien cobra menos, y se nota.',
  'Licitaciones con meses de papeleo. Para cuando aprueban, el problema ya cambió.',
]

// Cuatro volutas, una dentro de otra, todas con el mismo ojo: es la
// ilustración de cada paso, la marca repetida hasta volverse curvas de nivel.
// Cada tarjeta la gira un cuarto de vuelta más, así ninguna se ve igual a la
// de atrás cuando se apilan.
const ESCALAS = [1, 0.78, 0.56, 0.34]
const [OJO_X, OJO_Y] = VOLUTA.puntos.at(-1)

function Lamina({ giro }) {
  return (
    <div className="paso-lamina" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <g transform={`rotate(${giro} 12 12)`}>
          {ESCALAS.map((escala) => (
            <path
              key={escala}
              d={VOLUTA.d}
              transform={`translate(${OJO_X * (1 - escala)} ${OJO_Y * (1 - escala)}) scale(${escala})`}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>
    </div>
  )
}

export default function Proceso() {
  return (
    <section id="proceso" className="seccion zona-cielo corte-de-zona proceso">
      <div className="contenedor">
        <p className="antetitulo entra">Cómo trabajamos</p>
        <h2 className="entra">En qué te estás metiendo, antes de escribirnos.</h2>
        <p className="entradilla proceso-entradilla entra">
          Cuatro pasos, y en cada uno está dicho qué pones tú. Es la pregunta que más incomoda y la
          que casi nadie contesta.
        </p>

        <ol className="pasos" style={{ '--pasos': PASOS.length }}>
          {PASOS.map((paso, i) => (
            <li key={paso.titulo} className="paso" style={{ '--i': i }}>
              <div className="paso-carta zona-plano">
                <div className="paso-cuerpo">
                  <span className="paso-numero dato" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3>{paso.titulo}</h3>
                  <p className="paso-pones">
                    <span className="paso-pones-etiqueta">Pones tú:</span> {paso.ponesTu}
                  </p>
                  {paso.plazo && <p className="paso-plazo dato">{paso.plazo}</p>}
                </div>
                <Lamina giro={i * 90} />
              </div>
            </li>
          ))}
        </ol>

        <div className="proceso-columnas entra">
          <div>
            <h3>Qué construimos</h3>
            <ul className="lista">
              {ENCARGOS.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Qué no tomamos</h3>
            <ul className="lista">
              {NO_ACEPTAMOS.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
