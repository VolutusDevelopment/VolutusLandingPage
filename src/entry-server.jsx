import { renderToString } from 'react-dom/server'

import Inicio from './paginas/Inicio.jsx'
import Privacidad from './paginas/Privacidad.jsx'
import { PAGINAS } from './lib/meta.js'

// Cada ruta declarada en PAGINAS necesita su componente. El mapa se indexa por
// ruta y no por archivo para que la fuente de verdad siga siendo meta.js: si
// alguien añade una ruta allí y olvida el componente, el prerender falla al
// construir y no en producción.
const COMPONENTES = {
  '/': Inicio,
  '/privacidad': Privacidad,
}

/** Punto de entrada del prerender en build (scripts/prerender.mjs). */
export function render(ruta) {
  const Pagina = COMPONENTES[ruta]
  if (!Pagina) throw new Error(`Ruta sin componente: ${ruta}`)

  return renderToString(<Pagina />)
}

export { PAGINAS }
