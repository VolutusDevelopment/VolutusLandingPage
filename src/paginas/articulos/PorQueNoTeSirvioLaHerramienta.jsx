import Articulo from '../../components/Articulo.jsx'

export default function PorQueNoTeSirvioLaHerramienta({ ruta }) {
  return (
    <Articulo ruta={ruta}>
      <p>
        Probaste un programa, una app o una plantilla, y no te resolvió nada. Antes de elegir la siguiente, conviene
        entender por qué no funcionó. Casi siempre el problema no era la herramienta, sino lo que se esperaba de ella.
      </p>

      <h2>Las causas más comunes</h2>
      <ul>
        <li>
          <strong>Resolvía otro problema.</strong> Sirve para facturar, pero tú necesitabas controlar el stock.
        </li>
        <li>
          <strong>Te obligaba a cambiar tu forma de trabajar.</strong> Si tienes que hacer tres pasos más para lo mismo,
          vuelves a la planilla.
        </li>
        <li>
          <strong>No se conectaba con nada.</strong> Terminaste copiando datos a mano, que era justo lo que querías
          evitar.
        </li>
        <li>
          <strong>Cobraba por lo que no usabas.</strong> Pagabas por usuarios, módulos o funciones que nadie tocaba.
        </li>
        <li>
          <strong>Nadie la usó.</strong> Si el equipo no la adoptó en la primera semana, la herramienta no falló: no tuvo
          quién la sostuviera.
        </li>
      </ul>

      <h2>Cinco preguntas antes de la próxima</h2>
      <ol>
        <li>¿Qué tarea concreta debe hacer, y cuántas veces al día?</li>
        <li>¿Quién la va a usar, y desde qué dispositivo? Un celular en terreno no es una oficina.</li>
        <li>¿Con qué otras cosas tiene que hablar: correo, planillas, facturación?</li>
        <li>¿Qué pasa si se cae internet, o si el proveedor cambia algo?</li>
        <li>¿Quién la mantiene después de contratarla, y cuánto cuesta eso al año?</li>
      </ol>

      <h2>Cuándo conviene algo a medida</h2>
      <p>
        Si la herramienta que probaste calza con tu proceso solo a medias, y ajustar tu negocio te cuesta más que
        ajustar el software, puede que lo que necesitas sea uno hecho para ti. Lo vemos en{' '}
        <a href="/articulos/software-a-medida-o-ya-hecho">software a medida o uno ya hecho</a>, y en las páginas de{' '}
        <a href="/servicios/sistemas-de-gestion">sistemas de gestión</a> y{' '}
        <a href="/servicios/automatizacion-procesos">automatización de procesos</a>.
      </p>

      <p className="destacado">
        Antes de comprar la siguiente, prueba a escribir tus cinco respuestas en una hoja. Con eso ya sabes más que al
        contratar a ciegas.
      </p>
    </Articulo>
  )
}
