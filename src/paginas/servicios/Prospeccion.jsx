import { Incluye, ParaEmpezar, Preguntas } from './Bloques.jsx'

/**
 * Prospección de clientes: el trabajo, del mapa a la planilla. En el mapa, la
 * zona marcada, un radar que la recorre y los negocios que caen como pines;
 * los huecos no tienen web. En la planilla llegan uno por fila, con el correo
 * vacío cuando no lo publican, el aviso de pocas reseñas y la pestaña de los
 * que no tienen web (Prospeccion.css). Debajo, lo mismo en palabras.
 *
 * Mapa y planilla son de ejemplo y se esconden del lector de pantalla: las
 * celdas van en barras, sin nombres ni correos inventados.
 */

const CALLES = [
  [-10, 50, 330, 50],
  [-10, 130, 330, 130],
  [-10, 210, 330, 210],
  [60, -10, 60, 310],
  [150, -10, 150, 310],
  [240, -10, 240, 310],
  [0, 260, 320, 40],
]

// El área de búsqueda, con la forma de la de la pieza de la cabecera
// (Pieza.jsx), y un pin con la punta en su origen.
const ZONA = '80,70 255,92 232,238 64,205'
const PIN = 'M0 0 C -4 -6 -11 -11 -11 -19 A 11 11 0 1 1 11 -19 C 11 -11 4 -6 0 0 Z'

// Los negocios, en el orden en que caen: [x, y, sin web].
const NEGOCIOS = [
  [118, 118],
  [165, 112],
  [212, 128, true],
  [130, 160],
  [186, 166],
  [100, 196, true],
  [152, 205],
  [205, 200],
]

// Su fila en la planilla: el ancho de la barra de negocio, correo, nota,
// reseñas y web. `null` es la celda vacía, y sin web tampoco hay correo,
// porque sale de ahí. La cuarta es la nota alta con pocas reseñas.
const FILAS = [
  [80, 70, 60, 45, 75],
  [65, 82, 55, 55, 66],
  [74, null, 62, 40, null],
  [58, 76, 70, 12, 70],
  [86, 64, 58, 50, 62],
  [62, null, 50, 35, null],
  [70, null, 64, 48, 72],
  [78, 68, 56, 52, 64],
]
const POCAS = 3

const Dato = ({ ancho }) => <span className="prospeccion-dato" style={{ width: `${ancho}%` }} />

export default function Prospeccion({ pagina, estimado }) {
  return (
    <>
      <Incluye className="prospeccion-incluye">
        <div className="prospeccion-trabajo" aria-hidden="true">
          <div className="prospeccion-mapa">
            <span className="prospeccion-radar" />
            <svg viewBox="0 0 320 300" focusable="false">
              {CALLES.map(([x1, y1, x2, y2], i) => (
                <line key={i} className="prospeccion-calle" x1={x1} y1={y1} x2={x2} y2={y2} />
              ))}
              <polygon className="prospeccion-zona" points={ZONA} />
              {NEGOCIOS.map(([x, y, sinWeb], i) => (
                <g key={i} transform={`translate(${x} ${y})`}>
                  <g className={`prospeccion-pin${sinWeb ? ' prospeccion-pin-hueco' : ''}`} style={{ '--i': i }}>
                    <path d={PIN} />
                    <circle cy="-19" r="4" />
                  </g>
                </g>
              ))}
            </svg>
            <p className="prospeccion-rubros">
              <span>Restaurantes</span>
              <span>Peluquerías</span>
            </p>
            <p className="prospeccion-publicos">Solo datos públicos</p>
          </div>

          <span className="prospeccion-traslado" />

          <div className="prospeccion-hoja">
            <p className="prospeccion-archivo">
              <span>prospeccion-2026-10-16.xlsx</span>
              <span>Sheets · Excel</span>
            </p>
            <p className="prospeccion-fila prospeccion-cabecera">
              <span />
              <span>Negocio</span>
              <span>Correo</span>
              <span>Nota</span>
              <span>Reseñas</span>
              <span>Web</span>
            </p>
            {FILAS.map(([negocio, correo, nota, resenas, web], i) => (
              <p key={i} className="prospeccion-fila prospeccion-negocio" style={{ '--i': i }}>
                <span>{i + 1}</span>
                <span>
                  <Dato ancho={negocio} />
                </span>
                <span>{correo ? <Dato ancho={correo} /> : '—'}</span>
                <span>
                  <Dato ancho={nota} />
                </span>
                <span>
                  {i === POCAS && <span className="prospeccion-pocas" />}
                  <Dato ancho={resenas} />
                </span>
                <span>{web ? <Dato ancho={web} /> : <span className="prospeccion-sin-web">sin web</span>}</span>
              </p>
            ))}
            <p className="prospeccion-pestanas">
              <span>Negocios</span>
              <span>Sin web</span>
            </p>
          </div>
        </div>

        <ul className="prospeccion-leyenda">
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
      <Preguntas preguntas={pagina.preguntas} />
    </>
  )
}
