import { Incluye, ParaEmpezar, Preguntas } from './Bloques.jsx'

/**
 * Software a medida: lo que incluye es un diagrama de lo que se construye. Las
 * caras donde se usa bajan a una sola base, la base se conecta con los
 * sistemas que ya usas y alrededor de todo va lo que lo cuida. Las líneas
 * punteadas son los datos, que corren todo el tiempo: en cada conexión una
 * baja y la otra sube (App.css).
 *
 * El rótulo de lo que lo cuida va en el borde del marco, pero en el HTML va
 * junto a sus puntos, para que el orden de lectura los agrupe.
 *
 * En S y M el diagrama se dibuja literal: un teléfono y un navegador con las
 * mismas filas —la tercera, viva en los dos a la vez—, la base como un
 * cilindro y cada sistema con su ícono. Los dibujos son decoración: el texto
 * ya dice lo mismo, y desde L no se ven.
 */

const Trazo = ({ children, vista = '0 0 24 24' }) => (
  <svg
    viewBox={vista}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
)

// Cuatro filas de una lista, como en la app: un punto y una barra. La tercera
// lleva su fondo, que late igual en el teléfono y en el navegador.
function Filas({ x, y, paso, ancho }) {
  return [0, 1, 2, 3].map((i) => (
    <g key={i} transform={`translate(${x} ${y + i * paso})`} stroke="none" fill="currentColor">
      {i === 2 && <rect className="app-fila-viva" x="-4" y="-7" width={ancho + 8} height="14" rx="3" fillOpacity=".22" />}
      <circle cx="4" r="4" opacity=".55" />
      <rect x="12" y="-3" width={ancho - 12 - (i % 2) * 10} height="6" rx="3" opacity=".3" />
    </g>
  ))
}

const PANTALLAS = [
  <Trazo key="telefono" vista="0 0 96 180">
    <rect x="3" y="3" width="90" height="174" rx="16" fill="var(--superficie)" strokeWidth="3" />
    <rect x="36" y="10" width="24" height="5" rx="2.5" fill="currentColor" stroke="none" opacity=".25" />
    <rect x="11" y="24" width="74" height="20" rx="5" fill="currentColor" stroke="none" />
    <Filas x={15} y={60} paso={24} ancho={66} />
    <path d="M30 160h8M44 160h8M58 160h8" opacity=".5" />
  </Trazo>,
  <Trazo key="navegador" vista="0 0 180 124">
    <rect x="3" y="3" width="174" height="118" rx="10" fill="var(--superficie)" strokeWidth="3" />
    <path d="M3 22h174" opacity=".25" />
    <g fill="currentColor" stroke="none">
      <circle cx="14" cy="12.5" r="2.5" />
      <circle cx="22" cy="12.5" r="2.5" />
      <circle cx="30" cy="12.5" r="2.5" />
      <rect x="44" y="8" width="96" height="9" rx="4.5" opacity=".15" />
      <rect x="11" y="30" width="34" height="83" rx="4" opacity=".12" />
    </g>
    <Filas x={56} y={44} paso={20} ancho={108} />
  </Trazo>,
]

const ICONOS_SISTEMAS = {
  Planillas: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18" />
    </>
  ),
  Ventas: <path d="M6 7h12l-1 13H7L6 7ZM9 7a3 3 0 0 1 6 0" />,
  Facturación: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6" />,
}
const ICONO_API = <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />

const ICONOS_CUIDA = [
  <Trazo key="usuarios">
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M17 14c2.2 0 4 1.8 4 4" />
  </Trazo>,
  <Trazo key="candado">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Trazo>,
]

/** Las conexiones de una fila del diagrama, una por columna. */
function Flujos({ columnas }) {
  return (
    <div className="app-flujos" style={{ '--columnas': columnas }} aria-hidden="true">
      {Array.from({ length: columnas }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  )
}

function Puntos({ className, puntos, dibujos }) {
  return (
    <ul className={className} style={{ '--columnas': puntos.length }}>
      {puntos.map(({ titulo, texto }, i) => (
        <li key={titulo} className="entra">
          {dibujos[i] && <span className="app-dibujo">{dibujos[i]}</span>}
          <h4>{titulo}</h4>
          <p>{texto}</p>
        </li>
      ))}
    </ul>
  )
}

export default function App({ pagina, estimado }) {
  const { caras, base, conectado, cuida } = pagina.incluye

  return (
    <>
      <Incluye className="app-incluye">
        <div className="app-marco">
          <h3 className="servicio-rotulo">{caras.titulo}</h3>
          <Puntos className="app-caras" puntos={caras.puntos} dibujos={PANTALLAS} />
          <Flujos columnas={caras.puntos.length} />
          <div className="app-base hora-dia">
            <span className="app-dibujo">
              <Trazo>
                <ellipse cx="12" cy="5" rx="8" ry="3" />
                <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
              </Trazo>
            </span>
            <h3>{base.titulo}</h3>
            <p>{base.texto}</p>
          </div>
          <h3 className="servicio-rotulo app-conectado">{conectado.titulo}</h3>
          <Flujos columnas={conectado.sistemas.length} />
          <ul className="app-sistemas" style={{ '--columnas': conectado.sistemas.length }}>
            {conectado.sistemas.map((sistema) => (
              <li key={sistema}>
                <span className="app-dibujo">
                  <Trazo>{ICONOS_SISTEMAS[sistema] ?? ICONO_API}</Trazo>
                </span>
                {sistema}
              </li>
            ))}
          </ul>
          <h3 className="servicio-rotulo app-marco-rotulo">{cuida.titulo}</h3>
          <Puntos className="app-cuida" puntos={cuida.puntos} dibujos={ICONOS_CUIDA} />
        </div>
      </Incluye>
      {estimado}
      <ParaEmpezar cuando={pagina.cuando} pedimos={pagina.pedimos} />
      <Preguntas preguntas={pagina.preguntas} />
    </>
  )
}
