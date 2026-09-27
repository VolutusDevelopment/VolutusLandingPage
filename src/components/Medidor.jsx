/**
 * Medidor circular: una puntuación sobre su tope.
 *
 * `data-valor` y `data-tope` están ahí para `medidores.js`, que al seguir al
 * puntero tiene que saber a qué cifra volver y sobre qué tope contar. Se
 * publican en el marcado en vez de repetirse en el JavaScript para que el
 * número de la página y el que usa el gesto no puedan separarse.
 *
 * La forma no es un capricho. La guía de visualización la nombra sin ambages
 * —«a single ratio against a limit → Meter (same-ramp track)»— y lo que sí
 * marca como antipatrón es la dona para comparar valores parecidos, que es
 * otra cosa. Aquí cada anillo lleva un solo número contra un solo tope.
 *
 * **El anillo es decorativo para quien no lo ve.** La puntuación y su nombre
 * son texto de verdad, así que un lector de pantalla lee «Rendimiento, 100 de
 * 100» sin enterarse de que había un dibujo. Por eso el SVG va `aria-hidden`:
 * duplicarlo en la etiqueta accesible haría que se leyera dos veces.
 *
 * El número va en tinta de texto y no en el color de marca. Es la regla de la
 * guía —«text wears text tokens, never the series color»—: el color lo carga
 * el anillo, que está al lado, y el número se lee mejor en blanco sobre el
 * fondo de plano.
 *
 * La pista gris y el relleno salen de la misma rampa, que es lo que pide un
 * medidor: no son dos colores compitiendo, son el mismo recorrido con una
 * parte hecha y otra por hacer.
 */

// Circunferencia de la pista: 2πr con r = 20. Si cambia el radio, cambia esto
// o el relleno se quedará corto o se pasará de largo.
const RADIO = 20
const VUELTA = 2 * Math.PI * RADIO

export default function Medidor({ valor, tope = 100, nombre, nota }) {
  const fraccion = Math.min(1, Math.max(0, valor / tope))

  return (
    <li className="medidor entra" data-valor={valor} data-tope={tope}>
      <div className="medidor-anillo">
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          {/* La pista completa: el recorrido que habría que llenar. */}
          <circle className="medidor-pista" cx="24" cy="24" r={RADIO} />

          {/* El relleno. Arranca arriba —de ahí el giro de un cuarto— porque
              un medidor que empieza a la derecha se lee como un reloj parado. */}
          <circle
            className="medidor-relleno"
            cx="24"
            cy="24"
            r={RADIO}
            style={{
              '--vuelta': VUELTA,
              '--resto': VUELTA * (1 - fraccion),
            }}
          />
        </svg>

        <span className="medidor-valor dato">{valor}</span>
      </div>

      <p className="medidor-nombre">{nombre}</p>
      {/* La explicación ocupa su sitio desde el principio y solo cambia de
          opacidad: apareciendo de golpe movería la fila entera. */}
      <p className="medidor-nota">{nota}</p>
    </li>
  )
}
