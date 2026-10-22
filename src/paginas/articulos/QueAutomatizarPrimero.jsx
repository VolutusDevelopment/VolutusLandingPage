import Articulo from '../../components/Articulo.jsx'

export default function QueAutomatizarPrimero({ ruta }) {
  return (
    <Articulo ruta={ruta}>
      <p>
        Casi todo negocio tiene tareas que alguien hace a mano porque siempre se han hecho así: copiar los datos de un
        formulario a una planilla, mandar el mismo correo de confirmación, armar el reporte del lunes. La pregunta no
        es si se pueden automatizar, porque casi todas se pueden, sino por cuál empezar.
      </p>

      <h2>Tres preguntas para cada tarea</h2>
      <ol>
        <li>
          <strong>¿Cada cuánto se repite?</strong> Lo que pasa varias veces al día devuelve más que lo que pasa una vez
          al mes.
        </li>
        <li>
          <strong>¿Cuánto tarda cada vez?</strong> Multiplica: diez minutos, veinte veces por semana, son más de tres
          horas semanales.
        </li>
        <li>
          <strong>¿Cuánto cuesta un error?</strong> Un dato mal copiado en una factura o un cobro olvidado pesan más que
          el tiempo.
        </li>
      </ol>
      <p className="destacado">
        Las mejores candidatas puntúan alto en las tres y siguen siempre los mismos pasos: nadie tiene que decidir nada
        en el camino.
      </p>

      <h2>Tareas que casi todo negocio puede soltar</h2>
      <p>
        Por ejemplo, pasar los datos de un formulario web a una planilla o a tu sistema. O mandar el correo que
        confirma una compra, una reserva o una solicitud, y avisarle a tu equipo cuando entra un pedido o escribe un
        cliente importante.
      </p>
      <p>
        Tampoco hace falta hacer a mano los recordatorios de cobros, renovaciones o controles, ni armar y enviar el
        reporte semanal de ventas. Respaldar archivos y planillas cada noche, o sacar los datos de las facturas y
        documentos que llegan por correo, también puede quedar automático.
      </p>

      <h2>Lo que conviene dejar para después</h2>
      <p>
        Los procesos que todavía cambian cada semana hay que estabilizarlos primero. Y lo que pasa una vez al año no
        vale la pena: automatizarlo cuesta más de lo que ahorra.
      </p>
      <p>
        Las tareas donde cada caso es distinto y alguien usa su criterio son otro tema. Ahí puede servir un{' '}
        <a href="/articulos/que-es-un-agente-de-ia">agente de IA</a>, con una persona revisando.
      </p>

      <h2>Cómo hacerlo bien</h2>
      <p>
        Conecta lo que ya usas antes de comprar algo nuevo. Haz que cada paso deje registro, para saber qué pasó y
        cuándo, y que avise cuando falla: una automatización que se cae en silencio es peor que no tener ninguna.
      </p>
      <p>Y empieza por una sola tarea. Mide cuánto tiempo devuelve y después sigue con la siguiente.</p>
      <p>
        En <a href="/servicios/automatizacion-procesos">automatización de procesos</a> contamos cómo lo hacemos y qué te vamos a
        pedir para empezar.
      </p>
    </Articulo>
  )
}
