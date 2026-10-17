import { Incluye, ParaEmpezar, Preguntas, Prueba } from './Bloques.jsx'

/**
 * Automatización de procesos: cada tarea que hoy se hace a mano, al lado de
 * cómo queda automatizada. Al bajar, la tarea de hoy se tacha, un paquete
 * cruza la flecha y se enciende su reemplazo (Automatizacion.css). Debajo, lo
 * que va en todas: un registro que corre solo y las herramientas que se
 * conectan.
 */

// Un registro de ejemplo, que corre en bucle: por eso se pinta dos veces. La
// última línea no se pudo completar, y avisó.
const REGISTRO = [
  ['02:00', 'Respaldo de la noche completado'],
  ['08:00', 'Reporte del lunes enviado'],
  ['08:02', 'Pedido nuevo: aviso a bodega'],
  ['08:05', 'PDF leído: datos en la planilla'],
  ['08:11', 'Stock bajo: aviso a compras'],
  ['08:14', 'Correo sin datos: lo revisa ventas', true],
]

export default function Automatizacion({ pagina, ruta, estimado }) {
  const { tareas, registro, herramientas } = pagina.incluye

  return (
    <>
      <Incluye className="automatizacion-incluye">
        <p className="automatizacion-columnas" aria-hidden="true">
          <span className="servicio-rotulo">Hoy, a mano</span>
          <span className="servicio-rotulo">Automatizado</span>
        </p>
        <ul className="automatizacion-tareas">
          {tareas.map(({ antes, titulo, texto }) => (
            <li key={titulo} className="automatizacion-tarea">
              <p className="automatizacion-antes">
                <span className="solo-lectores">Hoy: </span>
                <span className="automatizacion-tachado">{antes}</span>
              </p>
              <span className="automatizacion-via" aria-hidden="true" />
              <div className="automatizacion-despues">
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="automatizacion-siempre">
          <div className="entra">
            <h3>{registro.titulo}</h3>
            <p>{registro.texto}</p>
            <div className="automatizacion-registro zona-plano" aria-hidden="true">
              <ul>
                {[...REGISTRO, ...REGISTRO].map(([hora, linea, aviso], i) => (
                  <li key={i} className={aviso ? 'automatizacion-aviso' : undefined}>
                    <span>{hora}</span> {linea}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="entra">
            <h3>{herramientas.titulo}</h3>
            <p>{herramientas.texto}</p>
            <ul className="automatizacion-herramientas">
              {herramientas.lista.map((herramienta) => (
                <li key={herramienta}>{herramienta}</li>
              ))}
            </ul>
          </div>
        </div>
      </Incluye>
      {estimado}
      <Prueba prueba={pagina.prueba} ruta={ruta} />
      <ParaEmpezar pedimos={pagina.pedimos} />
      <Preguntas preguntas={pagina.preguntas} />
    </>
  )
}
