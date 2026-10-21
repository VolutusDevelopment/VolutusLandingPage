import { renderToStaticMarkup, renderToString } from 'react-dom/server'

import Icono from './components/Icono.jsx'
import { COMPONENTES } from './paginas/rutas.js'

/** Punto de entrada del prerender en build (scripts/prerender.mjs). */
export function render(ruta) {
  const Pagina = COMPONENTES[ruta]
  if (!Pagina) throw new Error(`Ruta sin componente: ${ruta}`)

  return renderToString(<Pagina ruta={ruta} />)
}

/**
 * El favicon de una página de servicio: el glifo de su card, en blanco sobre
 * su color, en el mismo recuadro redondeado que el del sitio
 * (scripts/iconos.mjs).
 */
export function faviconDe({ id, color }) {
  return renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5.25" fill={color} />
      <g transform="translate(3 3) scale(0.75)" color="#fff">
        <Icono id={id} />
      </g>
    </svg>,
  )
}
