import { Incluye, ParaEmpezar, Preguntas, Prueba } from './Bloques.jsx'

/**
 * Software a medida: lo que incluye es un diagrama de lo que se construye. Las
 * caras donde se usa bajan a una sola base, la base se conecta con los
 * sistemas que ya usas y alrededor de todo va lo que lo cuida. Las líneas
 * punteadas son los datos, que corren todo el tiempo: en cada conexión una
 * baja y la otra sube (App.css).
 *
 * El rótulo de lo que lo cuida va en el borde del marco, pero en el HTML va
 * junto a sus puntos, para que el orden de lectura los agrupe.
 */

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

function Puntos({ className, puntos }) {
  return (
    <ul className={className} style={{ '--columnas': puntos.length }}>
      {puntos.map(({ titulo, texto }) => (
        <li key={titulo} className="entra">
          <h4>{titulo}</h4>
          <p>{texto}</p>
        </li>
      ))}
    </ul>
  )
}

export default function App({ pagina, ruta }) {
  const { caras, base, conectado, cuida } = pagina.incluye

  return (
    <>
      <Incluye className="app-incluye">
        <div className="app-marco">
          <h3 className="servicio-rotulo">{caras.titulo}</h3>
          <Puntos className="app-caras" puntos={caras.puntos} />
          <Flujos columnas={caras.puntos.length} />
          <div className="app-base hora-dia">
            <h3>{base.titulo}</h3>
            <p>{base.texto}</p>
          </div>
          <h3 className="servicio-rotulo app-conectado">{conectado.titulo}</h3>
          <Flujos columnas={conectado.sistemas.length} />
          <ul className="app-sistemas" style={{ '--columnas': conectado.sistemas.length }}>
            {conectado.sistemas.map((sistema) => (
              <li key={sistema}>{sistema}</li>
            ))}
          </ul>
          <h3 className="servicio-rotulo app-marco-rotulo">{cuida.titulo}</h3>
          <Puntos className="app-cuida" puntos={cuida.puntos} />
        </div>
      </Incluye>
      <Prueba prueba={pagina.prueba} ruta={ruta} />
      <ParaEmpezar cuando={pagina.cuando} pedimos={pagina.pedimos} pasos={pagina.pasos} />
      <Preguntas preguntas={pagina.preguntas} />
    </>
  )
}
