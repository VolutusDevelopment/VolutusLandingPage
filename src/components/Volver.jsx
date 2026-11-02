/**
 * La flecha con su «Volver» sobre el título de una página interna: la vuelta a su índice. La
 * usan los artículos (a las guías o a las opiniones) y los servicios (a
 * /servicios), así que se llega y se vuelve por el mismo camino.
 */
export default function Volver({ href, etiqueta }) {
  return (
    <p className="antetitulo">
      <a className="volver" href={href} aria-label={etiqueta}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        Volver
      </a>
    </p>
  )
}
