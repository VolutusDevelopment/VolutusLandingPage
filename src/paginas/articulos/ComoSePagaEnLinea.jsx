import Articulo from '../../components/Articulo.jsx'

export default function ComoSePagaEnLinea({ ruta }) {
  return (
    <Articulo ruta={ruta}>
      <p>
        Cuando alguien paga en tu tienda, el dinero no llega de inmediato a tu cuenta. Pasa por un procesador de pagos,
        que cobra una comisión y deposita después, en un plazo que depende de cada proveedor. Entender ese camino ayuda
        a elegir mejor.
      </p>

      <h2>Tres formas de cobrar</h2>
      <ul>
        <li>
          <strong>Pasarelas de tarjeta.</strong> El cliente paga con tarjeta de crédito o débito en una página segura.
          En Chile se usan, entre otras, Webpay, Flow y Mercado Pago.
        </li>
        <li>
          <strong>Transferencias con confirmación.</strong> El cliente paga desde su banco y el sistema confirma la
          operación sin que tengas que revisar la cartola. Un ejemplo es Khipu.
        </li>
        <li>
          <strong>Billeteras y cuotas.</strong> Algunas opciones dejan pagar en cuotas o con saldo de una billetera. Son
          útiles para ciertos rubros y no para todos.
        </li>
      </ul>
      <p>
        Los nombres son ejemplos de uso frecuente, no una recomendación. Cada negocio tiene necesidades distintas, y la
        opción adecuada se elige con él.
      </p>

      <h2>Qué mirar antes de elegir</h2>
      <ul>
        <li>
          <strong>La comisión.</strong> Cambia con frecuencia y depende del medio de pago. Revísala en la web oficial del
          proveedor, no en una tabla de terceros, y considera el IVA que se suma.
        </li>
        <li>
          <strong>El plazo de abono.</strong> Cuánto tarda el dinero en llegar a tu cuenta, y si cambia según el tipo de
          pago.
        </li>
        <li>
          <strong>Las devoluciones.</strong> Cómo se devuelve un pago y quién asume la comisión cuando eso pasa.
        </li>
        <li>
          <strong>La integración.</strong> Si se conecta con tu tienda y con tu facturación, o si obliga a revisar a
          mano cada pago.
        </li>
      </ul>

      <h2>Lo que suele pedir un proveedor</h2>
      <p>
        Casi siempre necesitas una cuenta a tu nombre o al de tu empresa, con RUT y una cuenta bancaria. Algunos piden
        una revisión antes de activar los cobros. Si el negocio es nuevo, conviene preguntarlo antes de armar la tienda,
        para que el plazo de activación no retrase el lanzamiento.
      </p>

      <h2>Por qué no publicamos comisiones aquí</h2>
      <p>
        Las tarifas cambian, y una cifra escrita hoy puede estar desactualizada mañana. Preferimos mandarte a la fuente
        oficial y decirte qué mirar.
      </p>

      <p className="destacado">
        Si estás decidiendo cómo cobrar en tu tienda, cuéntanos qué vendes y cómo lo despachas. Te decimos qué opciones
        se conectan con tu caso, y cuáles conviene evitar.
      </p>
    </Articulo>
  )
}
