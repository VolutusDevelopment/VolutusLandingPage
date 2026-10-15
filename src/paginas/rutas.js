import Inicio from './Inicio.jsx'
import Ley21719 from './Ley21719.jsx'
import Nosotros from './Nosotros.jsx'
import Privacidad from './Privacidad.jsx'
import Servicio from './Servicio.jsx'
import Articulos from './Articulos.jsx'
import QueEsUnAgenteDeIa from './articulos/QueEsUnAgenteDeIa.jsx'
import PaginaWebOTiendaOnline from './articulos/PaginaWebOTiendaOnline.jsx'
import SoftwareAMedidaOYaHecho from './articulos/SoftwareAMedidaOYaHecho.jsx'
import PlanillaOSistemaDeGestion from './articulos/PlanillaOSistemaDeGestion.jsx'
import QueAutomatizarPrimero from './articulos/QueAutomatizarPrimero.jsx'
import QuePrepararAntesDeCotizar from './articulos/QuePrepararAntesDeCotizar.jsx'
import { CazaDePatos, ErrorDelServidor, NoEncontrada } from './PaginaDeError.jsx'
import { SERVICIOS } from '../lib/servicios.js'

// Cada ruta declarada en PAGINAS (lib/meta.js) necesita su componente. El mapa
// se indexa por ruta y no por archivo para que la fuente de verdad siga siendo
// meta.js: si alguien añade una ruta allí y olvida el componente, el prerender
// falla al construir y no en producción. Lo usan el prerender y el modo dev,
// que le pasan a cada componente su `ruta`.
//
// Las páginas de servicio son una sola plantilla: la ruta dice cuál pinta.
export const COMPONENTES = {
  '/': Inicio,
  ...Object.fromEntries(SERVICIOS.filter(({ ruta }) => ruta).map(({ ruta }) => [ruta, Servicio])),
  '/articulos': Articulos,
  '/articulos/que-es-un-agente-de-ia': QueEsUnAgenteDeIa,
  '/articulos/pagina-web-o-tienda-online': PaginaWebOTiendaOnline,
  '/articulos/software-a-medida-o-ya-hecho': SoftwareAMedidaOYaHecho,
  '/articulos/planilla-o-sistema-de-gestion': PlanillaOSistemaDeGestion,
  '/articulos/que-automatizar-primero': QueAutomatizarPrimero,
  '/articulos/que-preparar-antes-de-cotizar': QuePrepararAntesDeCotizar,
  '/nosotros': Nosotros,
  '/privacidad': Privacidad,
  '/ley21719': Ley21719,
  '/404': NoEncontrada,
  '/500': ErrorDelServidor,
  '/patos': CazaDePatos,
}
