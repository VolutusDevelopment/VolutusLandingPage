import { ParaEmpezar, Preguntas } from './Bloques.jsx'

/**
 * Páginas web: lo que incluye, a todo el ancho y partido por una onda. Arriba,
 * en el claro de la página, lo que se ve; debajo de la onda, en el color del
 * servicio, lo que no se ve. La franja de color se cierra con la misma onda,
 * volteada.
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

// El dibujo de cada punto, por su `icono` (data/paginas-de-servicio.js). Solo
// se ve en S y M (Web.css): el título ya dice lo mismo.
const ICONOS = {
  pantalla: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </>
  ),
  identidad: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.7 1.5-1.5 0-.5-.2-.9-.5-1.2-.3-.4-.5-.8-.5-1.3 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4-4-7.5-9-7.5Z" />
      <circle cx="7.5" cy="10.5" r="1" />
      <circle cx="12" cy="7.5" r="1" />
      <circle cx="16.5" cy="10.5" r="1" />
    </>
  ),
  correo: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  buscar: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  rayo: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  chispa: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
}

function Grupo({ grupo, puntos }) {
  return (
    <>
      <h3 className="servicio-rotulo web-grupo">{grupo}</h3>
      <ul className="web-puntos">
        {puntos.map(({ icono, titulo, texto }) => (
          <li key={titulo} className="entra">
            <span className="web-icono" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                focusable="false"
              >
                {ICONOS[icono]}
              </svg>
            </span>
            <h4>{titulo}</h4>
            <p>{texto}</p>
          </li>
        ))}
      </ul>
    </>
  )
}

export default function Web({ pagina, estimado }) {
  const [seVe, noSeVe] = pagina.incluye

  return (
    <>
      <section id="incluye" className="seccion zona-cielo web-incluye" aria-labelledby="incluye-titulo">
        <div className="web-superficie">
          <div className="contenedor">
            <h2 id="incluye-titulo" className="titular entra">
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
      <Onda volteada />
      {/* El estimado va después de la franja de color, que se cierra con la
          onda volteada: dentro de ella partiría la onda en dos. */}
      {estimado}
      <ParaEmpezar cuando={pagina.cuando} pedimos={pagina.pedimos} />
      <Preguntas preguntas={pagina.preguntas} />
    </>
  )
}
