import Pagina from '../components/Pagina.jsx'
import Portada from '../components/Portada.jsx'
import Proyectos from '../components/Proyectos.jsx'
import Servicios from '../components/Servicios.jsx'
import Contacto from '../components/Contacto.jsx'

/**
 * La página, en el orden de un razonamiento: qué hacemos (Servicios), qué
 * hemos hecho y cómo se mide (Proyectos y Métricas) y, al final, cuéntanos.
 *
 * El recorrido de color es una caída: la página empieza en la nube de la
 * portada y termina en el mar del pie, y nunca vuelve a subir. Sigue clara
 * mientras promete, muestra la obra y la mide; el paso a oscuro no es un corte
 * sino un solo degradado que arranca en Contacto y llega hasta el final del pie
 * (ver `cierre` en Pagina.jsx).
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
    <Pagina enHome cierre={<Contacto />}>
      <Portada />
      <Servicios />
      <Proyectos />
    </Pagina>
  )
}
