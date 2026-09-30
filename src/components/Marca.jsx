import { VOLUTA } from '../lib/espiral.js'
import { LETRAS, TRAMAS } from '../lib/logotipo.js'

/**
 * La marca: la voluta más el wordmark.
 *
 * El símbolo es una sola línea que entra recta y se enrolla en cuatro cuartos
 * de circunferencia con radios 8, 5, 3 y 2 —la serie de Fibonacci—, así que
 * la razón entre arcos vecinos es ≈ φ. No hay un número dibujado a ojo: el
 * trazo lo calcula `espiralFibonacci` (ver `VOLUTA` en src/lib/espiral.js), y
 * los empalmes no tienen esquina porque cada centro está sobre el radio con
 * que termina el arco anterior.
 *
 * Un solo trazo, un solo color, heredado de `currentColor`: quien la usa decide
 * el color con `color`. El largo viaja como `--largo` para que la animación de
 * la barra no tenga que conocer la geometría.
 */

export function Onda({ size = 24, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={VOLUTA.d} style={{ '--largo': VOLUTA.longitud }} />
    </svg>
  )
}

/**
 * El logotipo: la palabra y la ola en una sola pieza. La ola no va aparte,
 * nace en la S y rompe en voluta.
 *
 * Las letras toman `currentColor` y la trama también, a menos que quien lo usa
 * defina `--logotipo-puntos`; así funciona sobre cualquier zona sin conocerla.
 * `trama` elige el tamaño de punto: «gruesa» para la barra, «fina» en grande.
 */
export function Logotipo({ trama = 'fina', className }) {
  const { viewBox, puntos } = TRAMAS[trama]
  return (
    <svg className={className} viewBox={viewBox} aria-hidden="true" focusable="false">
      <path className="logotipo-puntos" d={puntos} fill="var(--logotipo-puntos, currentColor)" />
      <path d={LETRAS} fill="currentColor" />
    </svg>
  )
}

/**
 * La marca de la barra y del pie.
 *
 * En M y más el logotipo completo. En S no cabe junto a los dos enlaces, así
 * que la barra muestra solo la onda (A.5, «símbolo solo»); las dos piezas
 * viajan en el HTML y el CSS decide cuál se ve, sin JavaScript.
 */
export default function Marca({ className }) {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <Logotipo trama="gruesa" className="marca-logotipo" />
      <Onda size={26} className="marca-onda" />
    </span>
  )
}
