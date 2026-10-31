/**
 * La flecha sobre el título que vuelve al índice de /articulos: la llevan cada
 * artículo (Articulo.jsx) y la página de las opiniones (paginas/Opiniones.jsx).
 * Su forma, en Articulos.css.
 */
export default function Volver() {
  return (
    <p className="antetitulo">
      <a className="articulo-volver" href="/articulos" aria-label="Volver a los artículos">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
      </a>
    </p>
  )
}
