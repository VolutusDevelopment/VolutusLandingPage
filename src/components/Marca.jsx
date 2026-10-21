import { LETRAS, OLA_DEL_LOGOTIPO, VIEWBOX, trazoDe } from '../lib/logotipo.js'

/**
 * El logotipo: la palabra y la ola en una sola pieza. La ola no va aparte,
 * nace junto a la S y se enrolla en voluta.
 *
 * Todo toma `currentColor`, así funciona sobre cualquier zona sin conocerla.
 *
 * `porLetra` pinta cada letra en su propio trazo con su orden en `--i`: es lo
 * que deja al pie hacerlas caer de a una. Sin él la palabra es un solo trazo,
 * que es lo que pide la barra. La ola no cae: entra con su estela de color,
 * en el lienzo que va encima (`OlaLienzo`).
 */
export function Logotipo({ porLetra = false, className }) {
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
      {porLetra ? (
        LETRAS.map((letra, i) => <path key={letra} d={letra} fill="currentColor" style={{ '--i': i }} />)
      ) : (
        <path d={LETRAS.join('')} fill="currentColor" />
      )}
    </svg>
  )
}

/**
 * El lienzo donde la ola del logotipo se traza con su estela (ola.js). Va
 * dentro de la misma caja que el logotipo, que tiene que estar posicionada.
 * `retraso` son los ms que espera la ola desde que asoma.
 */
export function OlaLienzo({ retraso }) {
  return <canvas className="ola-lienzo" data-ola="logotipo" data-retraso={retraso} aria-hidden="true" />
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
