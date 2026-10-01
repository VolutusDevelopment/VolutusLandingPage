import { renderToString } from 'react-dom/server'

import { COMPONENTES } from './paginas/rutas.js'

/** Punto de entrada del prerender en build (scripts/prerender.mjs). */
export function render(ruta) {
  const Pagina = COMPONENTES[ruta]
  if (!Pagina) throw new Error(`Ruta sin componente: ${ruta}`)

  return renderToString(<Pagina />)
}
