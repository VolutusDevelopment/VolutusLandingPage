
import { VOLUTA } from '../lib/espiral.js'

/**
 * Cómo trabajamos (DESIGN-BRIEF §4, bloque 4). Segundo corte de tema: la
 * página vuelve a cielo, porque vuelve a hablar con el visitante en vez de
 * enseñarle datos.
 *
 * Qué hacemos ya lo dice la portada; aquí solo queda el cómo, que contesta la
 * objeción más valiosa de §2: «¿qué tengo que entregarles yo?». Por eso cada
 * paso declara, en una línea, qué pone el cliente.
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

/* Un tono de la paleta por paso: la carta entera, no solo la lámina. */
const TONOS = ['tono-ciruela', 'tono-petroleo', '', 'tono-pizarra']

const PASOS = [
  {
    titulo: 'Nos cuentas el problema',
    ponesTu: 'El problema en tus palabras.',
    plazo: null,
  },
  {
    titulo: 'Te mandamos alcance y precio',
    ponesTu: 'Decidir si seguimos. Sin compromiso.',
    plazo: null,
  },
  {
    titulo: 'Construimos por entregas revisables',
    ponesTu: 'Media hora por entrega para revisarla.',
    plazo: null,
  },
  {
    titulo: 'Lo ponemos en producción y te lo entregamos',
    ponesTu: 'Los accesos. El código queda a tu nombre.',
    plazo: null,
  },
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
        <h2 className="entra">Cuatro pasos, y en cada uno qué pones tú.</h2>

        <ol className="pasos" style={{ '--pasos': PASOS.length }}>
          {PASOS.map((paso, i) => (
            <li key={paso.titulo} className="paso" style={{ '--i': i }}>
              <div className={`paso-carta zona-plano ${TONOS[i]}`}>
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
      </div>
    </section>
  )
}
