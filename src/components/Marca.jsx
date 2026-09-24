/**
 * La marca: símbolo de onda más wordmark (DESIGN-BRIEF A.5).
 *
 * El símbolo es una sola línea continua que se enrolla sobre sí misma, y está
 * CONSTRUIDA, no dibujada: una recta tangente y dos semicircunferencias de
 * radio 7.5 y 3.75 —razón 1/2—, la primera por la derecha y la segunda por la
 * izquierda. Eso es lo que la hace una espiral real y no una curva a ojo, que
 * es el criterio de A.6.
 *
 * Los empalmes no tienen esquina porque en los tres puntos de unión el radio
 * es vertical y la tangente, por tanto, horizontal: la recta entra a nivel en
 * (3.75, 19.5) y los dos arcos se encadenan a nivel en (12.75, 4.5).
 *
 * **Son dos arcos y no tres a propósito.** Una vuelta más metía dos trazos en
 * el mismo lado separados por 1.3 px al tamaño del favicon, y A.6 descartó la
 * nube justamente por convertirse en una mancha a 16 px. Con razón 1/2 y lados
 * opuestos no hay nada anidado: a 16 px se sigue leyendo el rollo.
 *
 * Un solo trazo, un solo color, sin degradados ni sombras. El color lo hereda
 * de `currentColor`, así que la misma pieza sirve sobre cielo y sobre plano sin
 * una segunda versión: quien la usa decide el color con `color`.
 */

const TRAZO_DE_LA_ONDA = 'M3.75 19.5 H12.75 A7.5 7.5 0 0 0 12.75 4.5 A3.75 3.75 0 0 0 12.75 12'

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
      <path d={TRAZO_DE_LA_ONDA} />
    </svg>
  )
}

/**
 * El lockup horizontal: símbolo + palabra. Es la versión principal, la de la
 * barra y el pie.
 *
 * La palabra sale de la familia de titulares del sitio y no de una fuente
 * propia del logo (A.5): una familia menos que cargar. Va en 800 —el único peso
 * alto que A.7 permite— en mayúsculas y con tracking positivo amplio.
 */
export default function Marca({ className }) {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <Onda size={26} />
      <span
        style={{
          fontWeight: 800,
          fontSize: '18px',
          letterSpacing: '0.2em',
          /* El tracking abre un hueco a la derecha de la última letra que
             descuadra el lockup; se compensa recortándolo. */
          marginRight: '-0.2em',
          lineHeight: 1,
        }}
      >
        VOLUTUS
      </span>
    </span>
  )
}
