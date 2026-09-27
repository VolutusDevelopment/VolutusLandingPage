import { VOLUTA } from './Marca.jsx'

/**
 * La voluta, dibujada con su construcción a la vista.
 *
 * El titular promete software **que puedes abrir y revisar**, y esto es la
 * marca haciendo lo mismo consigo misma: se ven los cuadrados de Fibonacci que
 * la generan (lados 8, 5, 3 y 2), el centro de cada arco y la recta de entrada.
 * Cada arco vive en su cuadrado y su radio es el lado; la razón entre vecinos
 * tiende a φ.
 *
 * No es un adorno que se le parece: todo sale de `VOLUTA`, el mismo cálculo que
 * pinta la barra y el favicon. Si alguien mide el dibujo, cuadra. Y si la serie
 * cambia, esto cambia solo, con sus longitudes de animación incluidas.
 *
 * Va en SVG dentro del HTML: sin petición y alrededor de 1,5 kB.
 */

const desfase = VOLUTA.puntos.length - VOLUTA.arcos.length - 1
const base = VOLUTA.puntos[0][1]

// Cada cuadrado tiene por esquinas el inicio del arco, su centro, su final y
// la esquina opuesta al centro.
const CUADROS = VOLUTA.arcos.map(({ centro, r, serie }, i) => {
  const inicio = VOLUTA.puntos[i + desfase]
  const fin = VOLUTA.puntos[i + desfase + 1]
  const esquina = [inicio[0] + fin[0] - centro[0], inicio[1] + fin[1] - centro[1]]
  // La cota va entre el centro y la esquina, lejos del trazo.
  const cota = [centro[0] + (esquina[0] - centro[0]) * 0.4, centro[1] + (esquina[1] - centro[1]) * 0.4]
  return {
    puntos: [inicio, centro, fin, esquina].map((p) => p.join(',')).join(' '),
    perimetro: Math.ceil(r * 4),
    centro,
    cota,
    serie,
  }
})

export default function ConstruccionDeLaOnda({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label="El símbolo de Volutus con su construcción: una recta y cuatro cuartos de circunferencia de radios 8, 5, 3 y 2, la serie de Fibonacci, cada uno dentro de su cuadrado."
    >
      <line className="onda-guias" x1="0.5" y1={base} x2="23.5" y2={base} strokeDasharray="0.6 0.9" />

      {/* Los cuadrados se trazan uno detrás de otro, del mayor al menor: es el
          orden en que la serie se lee hacia dentro. */}
      {CUADROS.map(({ puntos, perimetro }, i) => (
        <polygon key={puntos} className="onda-cuadro" points={puntos} style={{ '--largo': perimetro, '--i': i }} />
      ))}

      <g className="onda-centros">
        {CUADROS.map(({ centro }, i) => (
          <circle key={centro.join()} cx={centro[0]} cy={centro[1]} r="0.32" style={{ '--i': i }} />
        ))}
      </g>

      <path className="onda-trazo" d={VOLUTA.d} strokeLinecap="round" style={{ '--largo': VOLUTA.longitud }} />

      {CUADROS.map(({ cota, serie }) => (
        <text
          key={serie}
          className="onda-cota"
          x={cota[0]}
          y={cota[1]}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {serie}
        </text>
      ))}
    </svg>
  )
}
