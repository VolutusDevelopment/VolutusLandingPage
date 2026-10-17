import { ParaEmpezar, Preguntas, Prueba } from './Bloques.jsx'

/**
 * Páginas web: lo que incluye, a todo el ancho y partido por una onda. Arriba,
 * en el claro de la página, lo que se ve; debajo de la onda, en el color del
 * servicio, lo que no se ve y la prueba, que es la única que se puede medir en
 * el momento: esta misma página. La franja de color se cierra con la misma
 * onda, volteada.
 *
 * Arma su propia sección, sin `Incluye`, porque ocupa todo el ancho y no el
 * del contenedor. La franja de color lleva `.hora-dia`, como el cielo de la
 * cabecera: sus tokens la pintan en blanco sobre el color, y la barra
 * (barra.js) se pone en blanco al pasar por encima.
 */

// Dos ondas de período 600, cuatro veces en 2400: el SVG mide el doble que la
// pantalla y correrlo la mitad lo deja igual que al empezar, así que el vaivén
// no tiene costura (Web.css). La de atrás va en contrafase.
const ONDA_ATRAS =
  'M0 24 C 100 42, 200 42, 300 24 S 500 6, 600 24 S 800 42, 900 24 S 1100 6, 1200 24 S 1400 42, 1500 24 S 1700 6, 1800 24 S 2000 42, 2100 24 S 2300 6, 2400 24 V 56 H 0 Z'
const ONDA_FRENTE =
  'M0 32 C 100 14, 200 14, 300 32 S 500 50, 600 32 S 800 14, 900 32 S 1100 50, 1200 32 S 1400 14, 1500 32 S 1700 50, 1800 32 S 2000 14, 2100 32 S 2300 50, 2400 32 V 56 H 0 Z'

// La misma onda abre la franja de color y, volteada, la cierra.
function Onda({ volteada = false }) {
  return (
    <div className={volteada ? 'web-onda web-onda-volteada' : 'web-onda'} aria-hidden="true">
      <svg className="web-onda-atras" viewBox="0 0 2400 56" preserveAspectRatio="none" focusable="false">
        <path d={ONDA_ATRAS} />
      </svg>
      <svg className="web-onda-frente" viewBox="0 0 2400 56" preserveAspectRatio="none" focusable="false">
        <path d={ONDA_FRENTE} />
      </svg>
    </div>
  )
}

function Grupo({ grupo, puntos }) {
  return (
    <>
      <h3 className="servicio-rotulo web-grupo">{grupo}</h3>
      <ul className="web-puntos">
        {puntos.map(({ titulo, texto }) => (
          <li key={titulo} className="entra">
            <h4>{titulo}</h4>
            <p>{texto}</p>
          </li>
        ))}
      </ul>
    </>
  )
}

export default function Web({ pagina, ruta }) {
  const [seVe, noSeVe] = pagina.incluye

  return (
    <>
      <section id="incluye" className="seccion zona-cielo web-incluye" aria-labelledby="incluye-titulo">
        <div className="web-superficie">
          <div className="contenedor">
            <h2 id="incluye-titulo" className="entra">
              Qué incluye
            </h2>
            <Grupo {...seVe} />
          </div>
        </div>
        <Onda />
        <div className="web-fondo hora-dia">
          <div className="contenedor">
            <Grupo {...noSeVe} />
          </div>
        </div>
      </section>
      <Prueba prueba={pagina.prueba} ruta={ruta} className="hora-dia" />
      <Onda volteada />
      <ParaEmpezar cuando={pagina.cuando} pedimos={pagina.pedimos} />
      <Preguntas preguntas={pagina.preguntas} />
    </>
  )
}
