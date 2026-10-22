import { LETRAS, OLA_DEL_LOGOTIPO, VIEWBOX, trazoDe } from '../lib/logotipo.js'

/**
 * El logotipo: la palabra y la ola en una sola pieza. La ola no va aparte,
 * nace junto a la S y se enrolla en voluta.
 *
 * Todo toma `currentColor`, así funciona sobre cualquier zona sin conocerla.
 * Entra escribiéndose en el lienzo que va encima (`OlaLienzo`).
 */
export function Logotipo({ className }) {
  return (
    <svg className={className} viewBox={VIEWBOX} aria-hidden="true" focusable="false">
      <path
        className="ola-trazo"
        d={trazoDe(OLA_DEL_LOGOTIPO)}
        fill="none"
        stroke="currentColor"
        strokeWidth={OLA_DEL_LOGOTIPO.grosor}
        strokeLinecap="round"
      />
      <path d={LETRAS.join('')} fill="currentColor" />
    </svg>
  )
}

/**
 * El lienzo donde el logotipo se escribe (ola.js): la primera vez, las líneas
 * entran desde el borde de la pantalla, cruzan la palabra y las letras
 * aparecen a su paso; con el ratón encima, los colores pasan por la ola. Va
 * dentro de la misma caja que el logotipo, que tiene que estar posicionada:
 * mientras barre, el lienzo se estira desde ella hasta el borde izquierdo.
 */
export function OlaLienzo() {
  return <canvas className="ola-lienzo" data-ola="logotipo" aria-hidden="true" />
}

/**
 * La marca de la barra: el logotipo completo, en todos los tamaños.
 */
export default function Marca({ className }) {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
      <Logotipo className="marca-logotipo" />
      <OlaLienzo />
    </span>
  )
}
