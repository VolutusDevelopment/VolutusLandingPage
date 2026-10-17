import Articulo from '../../components/Articulo.jsx'

export default function DosFormasDeTrabajar({ ruta }) {
  return (
    <Articulo ruta={ruta}>
      <p>
        Un proyecto de software no siempre se paga de una vez, y no todos los negocios tienen ese presupuesto hoy. Por
        eso trabajamos de dos formas. Las dos te dejan un producto que funciona; cambia cuándo lo pagas y quién se
        encarga de mantenerlo.
      </p>

      <h2>Propiedad total</h2>
      <p>
        El producto es tuyo desde la entrega. Puedes seguir usándolo, cambiarlo con quien quieras o dejarlo en manos
        de otro equipo.
      </p>
      <p>
        Dejamos la solución documentada y fácil de modificar, para que puedas cambiar algo sin ayuda externa. Si
        prefieres, también puede operarla Volutus por ti, con un costo asociado.
      </p>
      <p>Después de la entrega puedes elegir si nos encargamos de la mantención. Es opcional, y así funciona:</p>
      <ul>
        <li>Los errores de nuestra autoría los corregimos a nuestro costo.</li>
        <li>Los cambios y mejoras entran en el plan de mantención.</li>
        <li>
          Si un tercero cambia algo que el producto usa (una plataforma de pagos, un correo, un sistema de tu
          proveedor), esa corrección no está incluida sin un plan aparte.
        </li>
        <li>
          Si prefieres hacerte cargo de todo tú, los costos de mantención pasan a ser tuyos desde ese momento.
        </li>
      </ul>

      <h2>Suscripción</h2>
      <p>
        Está pensada para quien no tiene el presupuesto completo ahora. Pagas en cuotas y, al terminar, el producto
        pasa a ser tuyo. Hay un costo mayor que en la propiedad total, porque se reparte en el tiempo.
      </p>
      <p>
        El contrato define qué pasa si no se paga a tiempo. Lo acordamos en conjunto antes de empezar, con cláusulas
        de mutuo acuerdo, y no con sorpresas.
      </p>

      <h2>Cuál conviene</h2>
      <ul>
        <li>
          Si tienes el presupuesto y quieres ser dueño desde el primer día, la <strong>propiedad total</strong> suele
          salir más barata en el total.
        </li>
        <li>
          Si necesitas empezar ahora y pagar de a poco, la <strong>suscripción</strong> te deja avanzar sin esperar a
          juntar todo el monto.
        </li>
        <li>
          En los dos casos, el alcance se conversa antes de cotizar. Ninguna opción cambia lo que el producto hace;
          cambian las condiciones de pago y de mantención.
        </li>
      </ul>

      <h2>Qué pasa después de la entrega</h2>
      <p>
        Con propiedad total, la mantención es una decisión tuya: puedes contratarla con nosotros o no. Con suscripción,
        el producto ya es tuyo al terminar de pagar, y la mantención se acuerda en el mismo contrato. En ambos casos
        sabes desde el principio qué cubre cada plan.
      </p>

      <p className="destacado">
        Si no sabes cuál te conviene, cuéntanos tu situación y te lo decimos <a href="/#contacto">por escrito</a>.
      </p>
    </Articulo>
  )
}
