import { renderToString } from 'react-dom/server'

import Inicio from './paginas/Inicio.jsx'
import Nosotros from './paginas/Nosotros.jsx'
import Privacidad from './paginas/Privacidad.jsx'
import NoEncontrada from './paginas/NoEncontrada.jsx'

// Cada ruta declarada en PAGINAS (lib/meta.js) necesita su componente. El mapa
// se indexa por ruta y no por archivo para que la fuente de verdad siga siendo
// meta.js: si alguien añade una ruta allí y olvida el componente, el prerender
// falla al construir y no en producción.
const COMPONENTES = {
  '/': Inicio,
  '/nosotros': Nosotros,
  '/privacidad': Privacidad,
  '/404': NoEncontrada,
}

/** Punto de entrada del prerender en build (scripts/prerender.mjs). */
export function render(ruta) {
  const Pagina = COMPONENTES[ruta]
  if (!Pagina) throw new Error(`Ruta sin componente: ${ruta}`)

  return renderToString(<Pagina />)
}
