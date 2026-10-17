import { Incluye, ParaEmpezar, Preguntas, Prueba } from './Bloques.jsx'

/**
 * Sistemas de gestión: todos los módulos en un solo panel, separados por
 * líneas finas, como en el sistema. Los números van primero y en grande, y
 * los permisos cruzan el panel entero, porque valen para todos. Cada módulo
 * tiene su dibujo, que al bajar muestra el negocio funcionando: las ventas
 * suben, el stock avisa, la agenda se llena y las cotizaciones se cierran
 * (Gestion.css).
 *
 * Los dibujos son de ejemplo, sin cifras, y se esconden del lector de
 * pantalla: el texto de cada módulo ya dice lo mismo.
 */

// Las ventas de seis meses, como altos sobre la base del gráfico (y = 152):
// suben, con un tropiezo. La línea de la tendencia pasa 8 unidades encima.
const VENTAS = [50, 66, 58, 84, 104, 128]
const tendencia = VENTAS.map((alto, i) => `${25 + i * 50},${144 - alto}`)

// Una semana de la agenda, cinco días por tres horas: 1 es una hora tomada.
const AGENDA = [1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0]

const DIBUJOS = {
  numeros: (
    <svg className="gestion-grafico" viewBox="0 0 300 160" focusable="false">
      {VENTAS.map((alto, i) => (
        <rect key={i} className="gestion-columna" style={{ '--i': i }} x={9 + i * 50} y={152 - alto} width="32" height={alto} rx="4" />
      ))}
      <polyline className="gestion-tendencia" points={tendencia.join(' ')} />
      <circle className="gestion-punta" cx="275" cy={144 - VENTAS.at(-1)} r="5" />
    </svg>
  ),
  inventario: (
    <>
      <span className="gestion-stock" />
      <span className="gestion-alerta">Quedan pocas</span>
    </>
  ),
  clientes: [60, 72, 48].map((ancho) => (
    <span key={ancho} className="gestion-cliente">
      <span className="gestion-barra" style={{ width: `${ancho}%` }} />
    </span>
  )),
  agenda: (
    <span className="gestion-semana">
      {AGENDA.map((tomada, i) => (
        <span key={i} className={tomada ? 'gestion-tomada' : undefined} style={{ '--i': i }} />
      ))}
    </span>
  ),
  // Tres cerradas de cuatro.
  cotizaciones: [70, 55, 64, 40].map((ancho, i) => (
    <span key={ancho} className="gestion-cotizacion">
      <span className="gestion-barra" style={{ width: `${ancho}%` }} />
      <span className={i < 3 ? 'gestion-cerrada' : undefined} style={{ '--i': i }} />
    </span>
  )),
  roles: ['Dueño', 'Ventas', 'Bodega'].map((rol) => (
    <span key={rol} className="gestion-rol">
      {rol}
    </span>
  )),
}

export default function Gestion({ pagina, ruta }) {
  return (
    <>
      <Incluye className="gestion-incluye">
        <ul className="gestion-panel">
          {pagina.incluye.map(({ id, titulo, texto }) => (
            // Los números van en el color del servicio, como el cielo de la
            // cabecera, y la barra se pone en blanco al pasar por encima.
            <li key={id} className={`gestion-${id}${id === 'numeros' ? ' hora-dia' : ''}`}>
              <div className="entra">
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </div>
              <div className="gestion-dibujo" aria-hidden="true">
                {DIBUJOS[id]}
              </div>
            </li>
          ))}
        </ul>
      </Incluye>
      <Prueba prueba={pagina.prueba} ruta={ruta} />
      <ParaEmpezar cuando={pagina.cuando} pedimos={pagina.pedimos} />
      <Preguntas preguntas={pagina.preguntas} />
    </>
  )
}
