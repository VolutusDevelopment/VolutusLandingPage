import { VOLUTA } from '../lib/espiral.js'

/**
 * Las formas en que hoy se hace el trabajo, conectadas a un solo sitio.
 *
 * Es el dibujo que acompaña al titular: cada etiqueta es una de las maneras
 * manuales que la frase va nombrando, y todas llegan por su ruta al símbolo.
 * Las cuatro primeras rutas están atadas a la palabra que rota —`data-ruta` es
 * su índice en `data-palabras`—, así que cuando el titular dice «por WhatsApp»
 * se enciende la ruta de WhatsApp. Las otras tres acompañan.
 *
 * Todas las rutas son ortogonales y salen de un borde del nodo. Cada una
 * sigue más allá de su etiqueta hacia el borde del dibujo, donde la máscara la
 * apaga: así el diagrama no tiene un final que se vea recortado.
 *
 * Es SVG dentro del HTML: ninguna petición, y las longitudes de trazo se
 * calculan aquí para que el CSS no tenga un solo número de la geometría.
 */

const NODO = { x: 464, y: 134, lado: 72 }

// `tono`: el color de la paleta de la ruta; las que se encienden llevan uno
// que aguanta texto blanco encima, porque la etiqueta se rellena con él.
// `hasta`: del nodo al centro de la etiqueta. `sigue`: de ahí al borde. La
// etiqueta se pinta encima de la línea, que pasa por debajo sin cortarse.
const RUTAS = [
  { texto: 'A mano', tono: 'pizarra', ruta: 0, hasta: [[464, 178], [200, 178]], sigue: [[0, 178]] },
  { texto: 'Planilla', tono: 'bosque', ruta: 1, hasta: [[464, 152], [420, 152], [420, 80], [320, 80]], sigue: [[40, 80]] },
  { texto: 'WhatsApp', tono: 'petroleo', ruta: 2, hasta: [[512, 134], [512, 46], [660, 46]], sigue: [[960, 46]] },
  { texto: 'Papel', tono: 'ciruela', ruta: 3, hasta: [[488, 206], [488, 244], [370, 244], [370, 280]], sigue: [[370, 360]] },
  { texto: 'Correo', tono: 'marca', hasta: [[536, 156], [812, 156]], sigue: [[1000, 156]] },
  { texto: 'Cuaderno', tono: 'ciruela', hasta: [[536, 188], [640, 188], [640, 250]], sigue: [[640, 360]] },
  { texto: 'Llamadas', tono: 'petroleo', hasta: [[512, 206], [512, 324]], sigue: [[512, 360]] },
]

const largo = (puntos) =>
  puntos.slice(1).reduce((t, [x, y], i) => t + Math.abs(x - puntos[i][0]) + Math.abs(y - puntos[i][1]), 0)

const trazo = (puntos) => 'M' + puntos.map((p) => p.join(' ')).join(' L')

// Archivo es proporcional: cada mayúscula avanza distinto. Estos son sus
// avances a 400, en milésimas de em, leídos de archivo-latin.woff2. Con 13 px
// y 0,1 em de tracking, cada letra ocupa su avance más 1,3 unidades, y la
// etiqueta suma 12 de aire por lado. Se mide sola, sin tocar el DOM.
const MAYUSCULAS = ' ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
const AVANCES = [
  209, 682, 698, 728, 734, 677, 612, 796, 736, 267, 559, 662, 536, 847, 736, 736, 788, 665, 788, 727, 673, 606,
  731, 648, 924, 680, 655, 635,
]
const ancho = (texto) =>
  Math.round([...texto.toUpperCase()].reduce((t, c) => t + (AVANCES[MAYUSCULAS.indexOf(c)] ?? 736) * 0.013 + 1.3, 24))

export default function Conexiones() {
  return (
    <svg
      className="conexiones"
      viewBox="0 0 1000 360"
      role="img"
      aria-label="A mano, planilla, WhatsApp, papel, correo, cuaderno y llamadas: todas las formas en que hoy se hace el trabajo, conectadas a Volutus."
    >
      {RUTAS.map(({ texto, tono, ruta, hasta, sigue }, i) => {
        const camino = [...hasta, ...sigue]
        const [x, y] = hasta.at(-1)
        const w = ancho(texto)
        const total = Math.ceil(largo(camino))
        // `--llega` es la fracción del trazo en que la luz alcanza la
        // etiqueta: el CSS la usa para rellenarla justo en ese instante.
        const estilo = {
          '--tono': `var(--${tono})`,
          '--i': i, '--largo': total, '--llega': (largo(hasta) / total).toFixed(2) }
        return (
          <g key={texto} className="ruta" data-ruta={ruta} style={estilo}>
            <path className="ruta-linea" d={trazo(camino)} />
            <path className="ruta-luz" d={trazo(camino)} />
            <g className="ruta-etiqueta">
              <rect x={x - w / 2} y={y - 14} width={w} height="28" rx="2" />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central">
                {texto.toUpperCase()}
              </text>
            </g>
          </g>
        )
      })}

      <g className="conexiones-nodo">
        <rect x={NODO.x} y={NODO.y} width={NODO.lado} height={NODO.lado} rx="6" />
        {/* La voluta mide 24 unidades; a 40 deja 16 de aire por lado. */}
        <path
          d={VOLUTA.d}
          transform={`translate(${NODO.x + 16} ${NODO.y + 16}) scale(${40 / 24})`}
          style={{ '--largo': VOLUTA.longitud }}
        />
      </g>
    </svg>
  )
}
