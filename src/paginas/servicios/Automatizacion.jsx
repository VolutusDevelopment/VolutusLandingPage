import { Incluye, ParaEmpezar, Preguntas } from './Bloques.jsx'

/**
 * Automatización de procesos: cada tarea que hoy se hace a mano, al lado de
 * cómo queda automatizada. Al bajar, la tarea de hoy se tacha, un paquete
 * cruza la flecha y se enciende su reemplazo (Automatizacion.css). Debajo, las
 * herramientas que se conectan.
 *
 * En S y M las dos columnas van lado a lado, como una tabla de antes y
 * después, y cada herramienta lleva su logo. Los logos son decoración: el
 * nombre ya está escrito, y desde L no se ven. Los de Gmail, Sheets y Google
 * son los trazos de Simple Icons (CC0); el de Microsoft, sus cuatro cuadrados.
 */
const LOGOS = {
  Correo: (
    <svg viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
      />
    </svg>
  ),
  Planillas: (
    <svg viewBox="0 0 24 24">
      <path
        fill="#34A853"
        d="M11.318 12.545H7.91v-1.909h3.41v1.91zM14.728 0v6h6l-6-6zm1.363 10.636h-3.41v1.91h3.41v-1.91zm0 3.273h-3.41v1.91h3.41v-1.91zM20.727 6.5v15.864c0 .904-.732 1.636-1.636 1.636H4.909a1.636 1.636 0 0 1-1.636-1.636V1.636C3.273.732 4.005 0 4.909 0h9.318v6.5h6.5zm-3.273 2.773H6.545v7.909h10.91v-7.91zm-6.136 4.636H7.91v1.91h3.41v-1.91z"
      />
    </svg>
  ),
  'Google Workspace': (
    <svg viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  ),
  'Microsoft 365': (
    <svg viewBox="0 0 23 23">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M12 1h10v10H12z" />
      <path fill="#00A4EF" d="M1 12h10v10H1z" />
      <path fill="#FFB900" d="M12 12h10v10H12z" />
    </svg>
  ),
}

// Lo que no es de nadie: el sistema propio del cliente.
const SISTEMA = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
  </svg>
)

export default function Automatizacion({ pagina, estimado }) {
  const { tareas, herramientas } = pagina.incluye

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
        <div className="automatizacion-siempre entra">
          <h3>{herramientas.titulo}</h3>
          <p>{herramientas.texto}</p>
          <ul className="automatizacion-herramientas">
            {herramientas.lista.map((herramienta) => (
              <li key={herramienta}>
                <span className="automatizacion-logo" aria-hidden="true">
                  {LOGOS[herramienta] ?? SISTEMA}
                </span>
                {herramienta}
              </li>
            ))}
          </ul>
        </div>
      </Incluye>
      {estimado}
      <ParaEmpezar pedimos={pagina.pedimos} />
      <Preguntas preguntas={pagina.preguntas} />
    </>
  )
}
