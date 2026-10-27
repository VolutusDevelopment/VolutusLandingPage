import Inicio from './Inicio.jsx'
import Ley21719 from './Ley21719.jsx'
import Nosotros from './Nosotros.jsx'
import OperacionVenganza from './OperacionVenganza.jsx'
import { CARGAS } from '../lib/cargas.js'
import Privacidad from './Privacidad.jsx'
import Servicio from './Servicio.jsx'
import IndiceDeServicios from './IndiceDeServicios.jsx'
import Articulos from './Articulos.jsx'
import QueEsUnAgenteDeIa from './articulos/QueEsUnAgenteDeIa.jsx'
import PaginaWebOTiendaOnline from './articulos/PaginaWebOTiendaOnline.jsx'
import SoftwareAMedidaOYaHecho from './articulos/SoftwareAMedidaOYaHecho.jsx'
import PlanillaOSistemaDeGestion from './articulos/PlanillaOSistemaDeGestion.jsx'
import QueAutomatizarPrimero from './articulos/QueAutomatizarPrimero.jsx'
import QuePrepararAntesDeCotizar from './articulos/QuePrepararAntesDeCotizar.jsx'
import DosFormasDeTrabajar from './articulos/DosFormasDeTrabajar.jsx'
import DatosDeTusClientesYLaLey from './articulos/DatosDeTusClientesYLaLey.jsx'
import PorQueNoTeSirvioLaHerramienta from './articulos/PorQueNoTeSirvioLaHerramienta.jsx'
import ConectarConLoQueYaUsas from './articulos/ConectarConLoQueYaUsas.jsx'
import BoletaFacturaYSii from './articulos/BoletaFacturaYSii.jsx'
import ComoSePagaEnLinea from './articulos/ComoSePagaEnLinea.jsx'
import CasosParaUnAgenteDeIa from './articulos/CasosParaUnAgenteDeIa.jsx'
import ComoTrabajamos from './articulos/ComoTrabajamos.jsx'
import { CazaDePatos, ErrorDelServidor, NoEncontrada } from './PaginaDeError.jsx'
import { SERVICIOS } from '../lib/servicios.js'
import { PAGINAS_DEL_INDICE, rutaDePagina } from '../lib/meta.js'

// Cada ruta declarada en PAGINAS (lib/meta.js) necesita su componente. El mapa
// se indexa por ruta y no por archivo para que la fuente de verdad siga siendo
// meta.js: si alguien añade una ruta allí y olvida el componente, el prerender
// falla al construir y no en producción. Lo usan el prerender y el modo dev,
// que le pasan a cada componente su `ruta`.
//
// Las páginas de servicio comparten su marco (Servicio.jsx): la ruta dice cuál
// pinta. Lo mismo las páginas del índice de artículos (Articulos.jsx).
export const COMPONENTES = {
  '/': Inicio,
  '/servicios': IndiceDeServicios,
  ...Object.fromEntries(SERVICIOS.filter(({ ruta }) => ruta).map(({ ruta }) => [ruta, Servicio])),
  ...Object.fromEntries(Array.from({ length: PAGINAS_DEL_INDICE }, (_, i) => [rutaDePagina(i + 1), Articulos])),
  '/articulos/que-es-un-agente-de-ia': QueEsUnAgenteDeIa,
  '/articulos/pagina-web-o-tienda-online': PaginaWebOTiendaOnline,
  '/articulos/software-a-medida-o-ya-hecho': SoftwareAMedidaOYaHecho,
  '/articulos/planilla-o-sistema-de-gestion': PlanillaOSistemaDeGestion,
  '/articulos/que-automatizar-primero': QueAutomatizarPrimero,
  '/articulos/que-preparar-antes-de-cotizar': QuePrepararAntesDeCotizar,
  '/articulos/dos-formas-de-trabajar': DosFormasDeTrabajar,
  '/articulos/datos-de-tus-clientes-y-la-ley': DatosDeTusClientesYLaLey,
  '/articulos/por-que-no-te-sirvio-la-herramienta': PorQueNoTeSirvioLaHerramienta,
  '/articulos/conectar-con-lo-que-ya-usas': ConectarConLoQueYaUsas,
  '/articulos/boleta-factura-y-sii': BoletaFacturaYSii,
  '/articulos/como-se-paga-en-linea': ComoSePagaEnLinea,
  '/articulos/casos-para-un-agente-de-ia': CasosParaUnAgenteDeIa,
  '/articulos/como-trabajamos': ComoTrabajamos,
  '/nosotros': Nosotros,
  '/operacion-venganza': OperacionVenganza,
  '/operacion-venganza/escena-2': OperacionVenganza,
  '/operacion-venganza/escena-3': OperacionVenganza,
  '/operacion-venganza/escena-5': OperacionVenganza,
  '/operacion-venganza/escena-6': OperacionVenganza,
  '/operacion-venganza/escena-9': OperacionVenganza,
  '/operacion-venganza/escena-10': OperacionVenganza,
  '/operacion-venganza/escena-11': OperacionVenganza,
  '/operacion-venganza/escena-13': OperacionVenganza,
  '/operacion-venganza/escena-14': OperacionVenganza,
  '/operacion-venganza/escena-15': OperacionVenganza,
  '/operacion-venganza/escena-16': OperacionVenganza,
  ...Object.fromEntries(Object.keys(CARGAS).map((ruta) => [ruta, OperacionVenganza])),
  '/privacidad': Privacidad,
  '/ley21719': Ley21719,
  '/404': NoEncontrada,
  '/500': ErrorDelServidor,
  '/patos': CazaDePatos,
}
