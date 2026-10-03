import Inicio from './Inicio.jsx'
import Ley21719 from './Ley21719.jsx'
import Nosotros from './Nosotros.jsx'
import Privacidad from './Privacidad.jsx'
import { CazaDePatos, ErrorDelServidor, NoEncontrada } from './PaginaDeError.jsx'

// Cada ruta declarada en PAGINAS (lib/meta.js) necesita su componente. El mapa
// se indexa por ruta y no por archivo para que la fuente de verdad siga siendo
// meta.js: si alguien añade una ruta allí y olvida el componente, el prerender
// falla al construir y no en producción. Lo usan el prerender y el modo dev.
export const COMPONENTES = {
  '/': Inicio,
  '/nosotros': Nosotros,
  '/privacidad': Privacidad,
  '/ley21719': Ley21719,
  '/404': NoEncontrada,
  '/500': ErrorDelServidor,
  '/patos': CazaDePatos,
}
