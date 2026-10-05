/**
 * El ícono de un proyecto sobre su mancha: la forma orgánica que propone el
 * issue #33 para presentar los productos, pintada con el fondo del ícono de
 * cada uno (`fondoIcono` en data/proyectos.js).
 *
 * PonleNota lleva su símbolo tal como lo dibuja su propia web (PonleNota-WEB,
 * src/components/home/Logo.jsx): la burbuja en azul marino y los cinco puntos
 * de la nota en ámbar. Un proyecto sin símbolo propio lleva su inicial.
 *
 * Es decorativo: el nombre del proyecto va siempre al lado, en texto.
 */

// La geometría del símbolo de PonleNota: un círculo de radio 15 centrado en
// (24, 24), con el arco por abajo y los puntos repartidos en el hueco de arriba.
const PUNTOS = [
  [11.87, 15.18],
  [17.19, 10.63],
  [24, 9],
  [30.81, 10.63],
  [36.14, 15.18],
]

const SIMBOLOS = {
  ponlenota: (
    <svg viewBox="0 0 48 48" focusable="false">
      <path d="M9.06 22.69A15 15 0 1 0 38.94 22.69" fill="none" stroke="#172554" strokeWidth="5" strokeLinecap="round" />
      <path d="M11.28 31.95 6.02 41.37 15.61 36.44Z" fill="#172554" />
      {PUNTOS.map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="2.5" fill="#fbbf24" />
      ))}
    </svg>
  ),
}

export default function LogoProyecto({ proyecto }) {
  return (
    <span className="mancha" style={{ '--fondo-icono': proyecto.fondoIcono }} aria-hidden="true">
      {SIMBOLOS[proyecto.id] ?? <span className="mancha-inicial">{proyecto.nombre[0]}</span>}
    </span>
  )
}
