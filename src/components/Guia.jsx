/**
 * La guía de una página de servicio: en S y M, al pie de la cabecera, las
 * partes de la página, `destinos` como `[id, nombre]`. Se va con la cabecera
 * al bajar, como la barra (Guia.css). Desde L no se ve.
 *
 * Son anclas a secciones que ya están en el HTML.
 */
export default function Guia({ destinos }) {
  return (
    <nav className="contenedor guia" aria-label="En esta página">
      <ul>
        {destinos.map(([id, nombre]) => (
          <li key={id}>
            <a href={`#${id}`}>{nombre}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
