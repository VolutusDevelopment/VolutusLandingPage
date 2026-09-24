import Barra from './components/Barra.jsx'
import Portada from './components/Portada.jsx'
import Proyectos from './components/Proyectos.jsx'
import Metricas from './components/Metricas.jsx'
import Proceso from './components/Proceso.jsx'
import Contacto from './components/Contacto.jsx'
import Pie from './components/Pie.jsx'

/**
 * La página, en el orden que fija DESIGN-BRIEF §4.
 *
 * El recorrido de color es el de A.4 y se lee en las clases de zona: la página
 * **abre en cielo** mientras promete, **baja a plano** cuando demuestra —índice
 * de obra y métricas— y **vuelve a cielo** para convertir. Dos cortes en toda
 * la página, ambos secos, ninguno degradado.
 *
 * Que el formulario quede en cielo no es casualidad: el descenso completo sin
 * retorno lo habría dejado sobre fondo oscuro, peor para conversión y más
 * frágil en accesibilidad. Se descartó por eso.
 *
 * Esta composición no tiene estado. React la convierte en HTML durante el build
 * y no viaja al navegador: lo que llega es el HTML ya pintado más el JavaScript
 * de `client.js`.
 */
export default function App() {
  return (
    <>
      <a className="salto" href="#contenido">
        Saltar al contenido
      </a>

      <Barra />

      <main id="contenido">
        <Portada />
        <Proyectos />
        <Metricas />
        <Proceso />
        <Contacto />
      </main>

      <Pie />
    </>
  )
}
