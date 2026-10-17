import Articulo from '../../components/Articulo.jsx'

export default function ComoTrabajamos({ ruta }) {
  return (
    <Articulo ruta={ruta}>
      <p>
        Antes de escribirnos conviene saber cómo trabajamos. Estas son las preguntas que más se repiten, con la
        respuesta directa.
      </p>

      <h2>Cuánto cuesta</h2>
      <p>
        Cada presupuesto es único. Depende del alcance del proyecto y de los indicadores (KPI) que quieras medir. Con
        eso definido, te mandamos alcance y precio, sin compromiso. Las dos formas de pagarlo están en{' '}
        <a href="/articulos/dos-formas-de-trabajar">comprar el producto o pagarlo en cuotas</a>.
      </p>

      <h2>Ver algo antes de contratar</h2>
      <p>
        Podemos mostrarte un mockup del diseño y de lo que necesitas resolver. Como estamos empezando, todavía no
        tenemos casos de clientes para mostrar, y no vamos a inventarlos.
      </p>

      <h2>Si no tienes internet</h2>
      <p>
        Cada solución es única. Si tu trabajo lo necesita, la diseñamos para que siga funcionando sin conexión. No
        partimos de una respuesta fija: primero entendemos dónde se trabaja.
      </p>

      <h2>Qué tecnologías usamos</h2>
      <p>
        No nos especializamos en una sola. Usamos las que el proyecto necesita y estamos abiertos a lo que tu negocio ya
        tiene. Lo que elegimos se explica en la propuesta, para que sepas por qué.
      </p>

      <h2>Después de la entrega</h2>
      <p>
        Dejamos la solución documentada y fácil de modificar, para que puedas cambiar algo sin ayuda externa. También
        puede operarla Volutus por ti, con un costo asociado. Lo detallamos en{' '}
        <a href="/articulos/dos-formas-de-trabajar">las dos formas de trabajar</a>.
      </p>

      <h2>Confidencialidad</h2>
      <p>
        Podemos firmar un acuerdo de confidencialidad si lo pides, antes de hablar de tu proyecto. Firmarlo no nos obliga
        a trabajar con esa persona ni con ese proyecto.
      </p>

      <h2>Dónde estamos</h2>
      <p>
        Residimos en Santiago de Chile. Las distancias no son un problema para nosotros, porque somos una empresa y no
        una oficina de atención. Si necesitas una reunión, preferimos que sea telemática; y si conviene conversar cara a
        cara, también nos damos el tiempo.
      </p>

      <p className="destacado">
        ¿Tienes una pregunta que no está aquí? <a href="/#contacto">Escríbenos</a> y te respondemos pronto.
      </p>
    </Articulo>
  )
}
