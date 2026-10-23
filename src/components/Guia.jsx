/**
 * La guía de una página de servicio: en S y M, al dejar atrás la cabecera,
 * aparece bajo la barra con las partes de la página, `destinos` como
 * `[id, nombre]`. guia.js marca la que se está leyendo y le lleva la pastilla,
 * que viaja como la gota de la barra; la línea de abajo dice cuánto se lleva
 * leído (Guia.css). Desde L no se ve.
 *
 * Son anclas a secciones que ya están en el HTML: sin JavaScript, la guía
 * no aparece y nada se pierde.
 */
export default function Guia({ destinos }) {
  return (
    <nav className="guia" aria-label="En esta página">
      <div className="guia-carril">
        <span className="guia-pastilla" aria-hidden="true" />
        <ul>
          {destinos.map(([id, nombre]) => (
            <li key={id}>
              <a href={`#${id}`}>{nombre}</a>
            </li>
          ))}
        </ul>
      </div>
      <span className="guia-avance" aria-hidden="true" />
    </nav>
  )
}
