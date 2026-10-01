import Pagina from '../components/Pagina.jsx'
import Portada from '../components/Portada.jsx'
import Proyectos from '../components/Proyectos.jsx'
import Metricas from '../components/Metricas.jsx'
import Servicios from '../components/Servicios.jsx'
import Contacto from '../components/Contacto.jsx'

/**
 * La página, en el orden que fija DESIGN-BRIEF §4.
 *
 * El recorrido de color es una caída: la página empieza en la nube de la
 * portada y termina en el mar del pie, y nunca vuelve a subir. Sigue clara
 * mientras promete y muestra la obra; cuando empieza a demostrar —las métricas—
 * cruza un solo corte, que las tarjetas de cifras tapan a caballo, y desde ahí
 * cada sección es un poco más honda que la anterior (`hondura-*`) hasta llegar
 * al mar.
 *
 * El formulario queda abajo, en lo hondo, pero dentro de una tarjeta clara: es
 * lo que A.4 temía del «descenso sin retorno», un formulario sobre fondo oscuro,
 * y la tarjeta lo resuelve sin romper la caída.
 *
 * Esta composición no tiene estado. React la convierte en HTML durante el build
 * y no viaja al navegador: lo que llega es el HTML ya pintado más el JavaScript
 * de `client.js`.
 */
export default function Inicio() {
  return (
    <Pagina enHome>
      <Portada />
      <Proyectos />
      <Metricas />
      <Servicios />
      <Contacto />
    </Pagina>
  )
}
