import { LETRAS, OLA_DEL_LOGOTIPO, VIEWBOX, trazoDe } from '../lib/logotipo.js'

/**
 * El logotipo: la palabra y la ola en una sola pieza. La ola no va aparte,
 * nace junto a la S y se enrolla en voluta.
 *
 * Todo toma `currentColor`, así funciona sobre cualquier zona sin conocerla.
 *
 * `porLetra` pinta cada letra en su propio trazo con su orden en `--i`, y la
 * ola la última, porque nace en la S: es lo que deja al pie hacerlas caer de a
 * una. Sin él la palabra es un solo trazo, que es lo que pide la barra.
 */
export function Logotipo({ porLetra = false, className }) {
  return (
    <svg className={className} viewBox={VIEWBOX} aria-hidden="true" focusable="false">
      <path
        className="logotipo-ola"
        d={trazoDe(OLA_DEL_LOGOTIPO)}
        fill="none"
        stroke="currentColor"
        strokeWidth={OLA_DEL_LOGOTIPO.grosor}
        strokeLinecap="round"
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
      <Logotipo className="marca-logotipo" />
    </span>
  )
}
