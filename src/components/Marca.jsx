import { espiralFibonacci } from '../lib/espiral.js'
import { LETRAS, TRAMAS } from '../lib/logotipo.js'

/**
 * La marca: la voluta más el wordmark.
 *
 * El símbolo es una sola línea que entra recta y se enrolla en cuatro cuartos
 * de circunferencia con radios 8, 5, 3 y 2 —la serie de Fibonacci—, así que
 * la razón entre arcos vecinos es ≈ φ. No hay un número dibujado a ojo: el
 * trazo lo calcula `espiralFibonacci`, y los empalmes no tienen esquina porque
 * cada centro está sobre el radio con que termina el arco anterior.
 *
 * Se queda en 8·5·3·2 a propósito. Los arcos 1 y 1 del final completan la
 * serie, pero a 16 px se empastan en una mancha; una vuelta completa se sigue
 * leyendo como una ola que rompe.
 *
 * Un solo trazo, un solo color, heredado de `currentColor`: quien la usa decide
 * el color con `color`.
 */

export const VOLUTA = espiralFibonacci([8, 5, 3, 2], { recta: 5 })

/**
 * El logotipo: la palabra y la ola en una sola pieza. La ola no va aparte,
 * nace en la S y rompe en voluta.
 *
 * Las letras toman `currentColor` y la trama también, a menos que quien lo usa
 * defina `--logotipo-puntos`; así funciona sobre cualquier zona sin conocerla.
 * `trama` elige el tamaño de punto: «gruesa» para la barra, «fina» en grande.
 *
 * `porLetra` pinta cada letra en su propio trazo con su orden en `--i`, y la
 * ola la última, porque nace en la S: es lo que deja al pie hacerlas caer de a
 * una. Sin él la palabra es un solo trazo, que es lo que pide la barra.
 */
export function Logotipo({ trama = 'fina', porLetra = false, className }) {
  const { viewBox, puntos } = TRAMAS[trama]
  return (
    <svg className={className} viewBox={viewBox} aria-hidden="true" focusable="false">
      <path
        className="logotipo-puntos"
        d={puntos}
        fill="var(--logotipo-puntos, currentColor)"
        style={porLetra ? { '--i': LETRAS.length } : undefined}
      />
      {porLetra ? (
        LETRAS.map((letra, i) => <path key={letra} d={letra} fill="currentColor" style={{ '--i': i }} />)
      ) : (
        <path d={LETRAS.join('')} fill="currentColor" />
      )}
    </svg>
  )
}

/**
 * La marca de la barra: el logotipo completo, en todos los tamaños.
 */
export default function Marca({ className }) {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <Logotipo trama="gruesa" className="marca-logotipo" />
    </span>
  )
}
