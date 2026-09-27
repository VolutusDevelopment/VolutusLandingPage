import { espiralFibonacci } from '../lib/espiral.js'

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
 * el color con `color`. El largo viaja como `--largo` para que la animación de
 * la barra no tenga que conocer la geometría.
 */

export const VOLUTA = espiralFibonacci([8, 5, 3, 2], { recta: 5 })

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
 * El lockup horizontal: símbolo + palabra, la versión de la barra y el pie.
 *
 * La palabra va en minúsculas, en 700 y con el tracking cerrado: se lee como un
 * nombre y no como un rótulo, y comparte la familia de titulares del sitio en
 * lugar de cargar una fuente propia.
 */
export default function Marca({ className }) {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <Onda size={26} />
      <span
        translate="no"
        style={{ fontWeight: 700, fontSize: '21px', letterSpacing: '-0.03em', lineHeight: 1 }}
      >
        volutus
      </span>
    </span>
  )
}
