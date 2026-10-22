/**
 * El mapa de un artículo: un punto por apartado, unidos por una línea, y los
 * minutos de lectura. Los `apartados` y los `minutos` los cuenta lib/lectura.js.
 *
 * El tramo que va de un punto al siguiente mide en proporción a las palabras
 * de ese apartado (`--peso`, su parte de todo lo que hay entre el primer
 * subtítulo y el último). Desde L, la línea va vertical al margen del texto,
 * con el título de cada apartado al lado de su punto; en S y M, es una barra
 * horizontal pegada bajo la del sitio, que muestra el título del apartado
 * actual (Mapa.css).
 *
 * Son anclas a los subtítulos: sin JavaScript, el mapa se ve entero y cada
 * punto lleva a su apartado. mapa.js marca el que se está leyendo.
 */
export default function Mapa({ apartados, minutos }) {
  const entreElPrimeroYElUltimo = apartados.slice(0, -1).reduce((suma, { palabras }) => suma + palabras, 0)

  return (
    <nav className="mapa" aria-label="En este artículo">
      <p className="mapa-rotulo" aria-hidden="true">
        En este artículo
      </p>
      <p className="mapa-actual" aria-hidden="true">
        En este artículo
      </p>
      <p className="mapa-minutos dato">
        {minutos} min<span className="mapa-largo"> de lectura</span>
      </p>
      <ol>
        {apartados.map(({ id, titulo, palabras }, i) => (
          <li key={id} style={{ '--peso': i < apartados.length - 1 ? (palabras / entreElPrimeroYElUltimo).toFixed(3) : 0 }}>
            <a href={`#${id}`}>
              <span className="mapa-titulo">{titulo}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
