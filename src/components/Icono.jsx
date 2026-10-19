/**
 * Iconos en la misma rejilla de 24 que el símbolo.
 *
 * Los de los servicios (las cards de la rueda y la fila de servicios al pie de
 * cada página) son glifos macizos inclinados 10°, como el logotipo y el número
 * de la card: el dibujo se hace con el hueco y no con el trazo. Los de la guía
 * de la Ley 21.719 (/ley21719) son de trazo.
 *
 * Cada glifo de servicio tiene un gesto corto (Icono.css): la marea sube en la
 * ventana, la etiqueta se mece, las carpetas se archivan… Lo hace cuando lo
 * pide quien lo usa: la card de la rueda al quedar al frente y la fila de
 * servicios al pasar el cursor.
 *
 * Son decorativos siempre: el texto que acompañan ya dice lo mismo.
 */

// Las partes que comparten los glifos y las piezas de las páginas de servicio
// (Pieza.jsx), que los dibujan en grande.
export const VENTANA =
  'M4.5 4h15A2.5 2.5 0 0 1 22 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5v-11A2.5 2.5 0 0 1 4.5 4zM4.5 9h15v8.5h-15zM5.6 6.5a.9.9 0 1 0 1.8 0a.9.9 0 1 0-1.8 0zM8.1 6.5a.9.9 0 1 0 1.8 0a.9.9 0 1 0-1.8 0zM10.6 6.5a.9.9 0 1 0 1.8 0a.9.9 0 1 0-1.8 0z'
export const OLA = 'M4.5 17.5v-2.3c1.6 0 2.4-2.7 4.6-2.7 2.4 0 2.6 2.7 5.2 2.7 1.9 0 2.6-1.6 5.2-1.6v3.9z'
export const ETIQUETA =
  'M2.5 12L8.8 4.5h12.7v15H8.8zM7.5 12a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0zM13 9.6h6v1.8h-6zM13 13h4.2v1.8H13z'
export const TELEFONO =
  'M8.5 2h7A2.5 2.5 0 0 1 18 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 19.5v-15A2.5 2.5 0 0 1 8.5 2zM8 4.5h8V17H8zM11 19.5a1 1 0 1 0 2 0a1 1 0 1 0-2 0z'
export const PANTALLA = ['M9.5 6.5h5V11h-5z', 'M9.5 12.5H13v2H9.5z']
export const CARPETAS = ['M3 3h5l1 1.5h12V8H3z', 'M3 11h6l1-1.5h5l1 1.5h5v3.5H3z', 'M3 17.5h12l1-1.5h5v5H3z']

// Una parte que hace el gesto `tipo`, la `n`-ésima de su glifo. El grupo lo
// hace cuando lo pide quien usa el icono y el dibujo de adentro, al pasar el
// cursor: así uno no corta ni repite al otro.
function Gesto({ tipo, n = 0, d }) {
  return (
    <g className={`gesto gesto-${tipo}`} style={n ? { '--n': n } : undefined}>
      <path d={d} />
    </g>
  )
}

const GLIFOS = {
  web: (
    <>
      <path d={VENTANA} />
      <Gesto tipo="marea" n={1} d={OLA} />
    </>
  ),
  tienda: <Gesto tipo="mece" d={ETIQUETA} />,
  app: (
    <>
      <path d={TELEFONO} />
      {PANTALLA.map((d, i) => (
        <Gesto key={d} tipo="sube" n={i + 1} d={d} />
      ))}
    </>
  ),
  gestion: CARPETAS.map((d, i) => <Gesto key={d} tipo="archiva" n={i} d={d} />),
  agente: (
    <Gesto
      tipo="globo"
      d="M7 3.5h10a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-6.5L6 21v-4.7A4 4 0 0 1 3 12.5v-5a4 4 0 0 1 4-4zM6.6 10a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0-2.8 0zM10.6 10a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0-2.8 0zM14.6 10a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0-2.8 0z"
    />
  ),
  automatizacion: (
    <>
      <Gesto tipo="avanza" d="M2.5 5h4.6l7 7-7 7H2.5l7-7z" />
      <Gesto tipo="avanza" n={1} d="M10.5 5h4.6l7 7-7 7h-4.6l7-7z" />
    </>
  ),
  prospeccion: (
    <>
      <Gesto tipo="cae" d="M12 2.5a9.5 9.5 0 1 0 0 19a9.5 9.5 0 1 0 0-19zM12 5.3a6.7 6.7 0 1 1 0 13.4a6.7 6.7 0 1 1 0-13.4z" />
      <Gesto tipo="cae" n={2} d="M8.4 12a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0-7.2 0z" />
    </>
  ),
  datos: (
    <Gesto
      tipo="voltea"
      d="M4.5 5h15A2.5 2.5 0 0 1 22 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 16.5v-9A2.5 2.5 0 0 1 4.5 5zM5.8 10.2a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0-4.4 0zM4.6 16.6c.5-2 1.8-3.1 3.4-3.1s2.9 1.1 3.4 3.1zM13.5 9H19v1.8h-5.5zM13.5 12.6h4v1.8h-4z"
    />
  ),
  // No es un servicio: la hoja de una guía, para el artículo que habla de
  // todos (Articulos.jsx).
  guia: (
    <path d="M6.5 2H14l6 6v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2zM14.6 3.6v4.8h4.8zM7.5 12h9v1.8h-9zM7.5 15.6h6v1.8h-6z" />
  ),
}

const TRAZOS = {
  escudo: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8.2-7 9.5-4-1.3-7-5-7-9.5V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  documento: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </>
  ),
  negocio: (
    <>
      <path d="M4 10v10h16V10" />
      <path d="M3 10l2-6h14l2 6z" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  persona: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 16c.6-1.3 1.7-2 3-2s2.4.7 3 2M15 10h3M15 13.5h3" />
    </>
  ),
  alerta: (
    <>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
}

const MACIZO = { fill: 'currentColor', fillRule: 'evenodd' }
const TRAZO = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

// La inclinación del logotipo, desde el centro de la rejilla para que el glifo
// no se corra: tan(10°) × 12.
const ITALICA = 'translate(2.12 0) skewX(-10)'

export default function Icono({ id, className }) {
  const glifo = GLIFOS[id]
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...(glifo ? MACIZO : TRAZO)}>
      {glifo ? <g transform={ITALICA}>{glifo}</g> : TRAZOS[id]}
    </svg>
  )
}
