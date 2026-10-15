import Articulo from '../../components/Articulo.jsx'

export default function SoftwareAMedidaOYaHecho({ ruta }) {
  return (
    <Articulo ruta={ruta}>
      <p>
        Antes de encargar software a medida, la primera pregunta es si de verdad hace falta. Muchas veces existe un
        producto que resuelve el problema por una suscripción mensual, y es lo más sensato. Otras veces, forzar un
        producto genérico cuesta más de lo que ahorra.
      </p>

      <h2>Lo bueno de un software ya hecho</h2>
      <ul>
        <li>Está listo hoy: te registras y empiezas.</li>
        <li>Cuesta menos al principio: pagas una suscripción, no un desarrollo.</li>
        <li>Otros lo mantienen, lo actualizan y lo protegen.</li>
      </ul>

      <h2>Y sus límites</h2>
      <ul>
        <li>Funciona como lo pensaron sus creadores para miles de negocios, no como trabajas tú.</li>
        <li>Pagas por usuario o por módulo, y el costo crece contigo.</li>
        <li>Tus datos viven en su plataforma, con sus reglas para sacarlos.</li>
        <li>Si no se conecta con tus otras herramientas, alguien copia la información a mano.</li>
      </ul>

      <h2>Cuándo conviene a medida</h2>
      <ul>
        <li>Tu forma de trabajar es tu ventaja y no quieres cambiarla para calzar con un producto.</li>
        <li>Pagas varias herramientas que no se hablan entre sí y alguien hace de puente copiando datos.</li>
        <li>El software es tu negocio: lo vas a vender o es lo que te diferencia.</li>
        <li>Necesitas que tus clientes usen una app con tu marca.</li>
      </ul>

      <h2>La respuesta suele ser una mezcla</h2>
      <p className="destacado">
        Pocas veces hay que construirlo todo. Lo habitual es usar productos hechos para lo estándar y construir a
        medida solo lo que es propio de tu negocio.
      </p>
      <p>
        La contabilidad, el correo o los pagos ya están resueltos por productos que funcionan bien. La parte que te
        diferencia es la que vale la pena construir, conectada con todo lo demás. Así pagas desarrollo solo donde
        aporta.
      </p>
      <p>
        PonleNota, uno de nuestros productos, está hecho así: el sitio, la app Android y el panel web son a medida,
        y la base de datos y las cuentas de usuario corren sobre Supabase, un servicio que ya existía.
      </p>

      <h2>Cinco preguntas para decidir</h2>
      <ol>
        <li>¿Cuántas personas lo van a usar, y para qué?</li>
        <li>¿Qué parte de tu proceso no calza con los productos que ya probaste?</li>
        <li>¿Cuánto tiempo se pierde hoy copiando datos o rodeando limitaciones?</li>
        <li>¿Qué pasa con tus datos si mañana quieres cambiarte?</li>
        <li>¿Lo necesitas completo, o basta una primera versión pequeña para probar?</li>
      </ol>
      <p>
        Si después de responderlas un producto del mercado alcanza, úsalo. Si no, una primera versión acotada,
        construida por entregas que puedes revisar, es la forma de bajar el riesgo. En{' '}
        <a href="/desarrollo-software-a-medida">software a medida</a> contamos cómo lo hacemos, y si lo que buscas es
        ordenar la operación, mira <a href="/sistemas-de-gestion">sistemas de gestión</a>.
      </p>
    </Articulo>
  )
}
