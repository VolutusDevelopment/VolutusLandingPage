import Articulo from '../../components/Articulo.jsx'

export default function ConectarConLoQueYaUsas({ ruta }) {
  return (
    <Articulo ruta={ruta}>
      <p>
        Un sistema nuevo solo ahorra tiempo si habla con lo que ya usas. Si al final del día alguien copia los pedidos
        del correo a la planilla y de la planilla a la facturación, el sistema nuevo no resolvió nada.
      </p>

      <h2>Tres tipos de conexión</h2>
      <p>
        Un sistema puede leer datos de otro, como un pedido que llega al correo o un cliente de la planilla. Puede
        escribir un dato donde corresponde, como una factura en tu facturación o un registro en la planilla. Y puede
        avisarle a alguien cuando algo cambia, como un stock bajo o una cita.
      </p>
      <p>Cada una tiene distinto riesgo. Leer es lo más fácil de revertir; escribir en tu facturación exige más cuidado.</p>

      <h2>Antes de pedir una conexión</h2>
      <ul>
        <li>Haz la lista de los sistemas que usas hoy, aunque sea de memoria.</li>
        <li>Para cada uno, pregunta si permite exportar datos y si tiene una forma oficial de conectarse.</li>
        <li>Anota qué pasa si el proveedor de ese sistema cambia algo, y quién avisa.</li>
        <li>Decide qué datos deben viajar y cuáles no: no todo tiene que pasar de un lado a otro.</li>
      </ul>

      <h2>Lo que no conviene dar por hecho</h2>
      <p>
        No todos los sistemas permiten conectarse de la misma manera, y algunos cobran por hacerlo. Que una herramienta
        «se pueda integrar» no garantiza que la integración sea simple, ni que siga funcionando si el proveedor la
        cambia. Por eso lo confirmamos sistema por sistema, antes de cotizar.
      </p>

      <h2>Dónde suele empezar</h2>
      <p>
        Las conexiones más pedidas son las de correo, planilla y facturación. Si quieres ver cómo se ordenan en un flujo
        completo, revisa la página de{' '}
        <a href="/servicios/automatizacion-procesos">automatización de procesos</a>, o la de{' '}
        <a href="/servicios/sistemas-de-gestion">sistemas de gestión</a> si el problema es que nada está en un solo
        lugar.
      </p>

      <p className="destacado">
        ¿Tienes una lista de sistemas y no sabes por dónde empezar? Escríbenos con esa lista y te respondemos qué se
        puede conectar y qué conviene revisar antes.
      </p>
    </Articulo>
  )
}
