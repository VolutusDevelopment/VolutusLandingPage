import Articulo from '../../components/Articulo.jsx'

export default function PlanillaOSistemaDeGestion({ ruta }) {
  return (
    <Articulo ruta={ruta}>
      <p>
        Casi todo negocio parte ordenándose con una planilla, y con razón: es flexible, todos saben usarla y no cuesta
        nada. El problema es que sirve muy bien hasta el día en que deja de servir, y ese día rara vez se nota a
        tiempo.
      </p>

      <h2>Cinco señales de que ya no alcanza</h2>
      <ol>
        <li>
          <strong>Varias personas la editan.</strong> Aparecen copias —«ventas_final_v3»—, alguien pisa el cambio de
          otro y nadie sabe cuál es la versión buena.
        </li>
        <li>
          <strong>Solo una persona la entiende.</strong> Si esa persona se enferma o se va, la operación se detiene.
        </li>
        <li>
          <strong>Copias datos de una planilla a otra.</strong> El pedido se anota en una, el stock en otra y la
          factura en una tercera: cada traspaso es una oportunidad de error.
        </li>
        <li>
          <strong>Sacar un número toma una tarde.</strong> Saber cuánto vendiste el mes pasado o qué producto deja más
          no debería ser un proyecto.
        </li>
        <li>
          <strong>Una fórmula rota ya te costó plata.</strong> Una celda mal arrastrada no avisa: sigue mostrando un
          número, solo que equivocado.
        </li>
      </ol>

      <h2>Qué cambia con un sistema</h2>
      <ul>
        <li>Cada dato se escribe una vez y se ve en todas partes.</li>
        <li>Cada persona entra con su usuario y ve lo que le corresponde.</li>
        <li>Queda el historial de quién cambió qué y cuándo.</li>
        <li>Los números se calculan solos y están al día.</li>
        <li>Se usa desde el celular, la tablet o el computador.</li>
      </ul>

      <h2>Antes de cambiarte</h2>
      <p>No hace falta tirar la planilla de un día para otro. Lo sensato es ir por partes:</p>
      <ol>
        <li>Anota lo que la planilla hace hoy: qué se registra, quién lo registra y qué números se sacan de ahí.</li>
        <li>
          Separa lo estándar de lo que es propio de tu negocio. Para lo estándar, como la contabilidad, probablemente
          ya existe un producto.
        </li>
        <li>Empieza por el proceso que más duele, no por todo a la vez.</li>
        <li>Lleva tus datos actuales al sistema nuevo, para no empezar de cero.</li>
      </ol>

      <p className="destacado">
        Una planilla no es un error: es el primer sistema de casi todo negocio, y el mejor punto de partida para
        diseñar el siguiente, porque ya dice qué datos importan y cómo se usan.
      </p>
      <p>
        En <a href="/servicios/sistemas-de-gestion">sistemas de gestión</a> contamos qué incluye uno hecho a tu medida. Y si lo
        que más duele es copiar datos de un lado a otro, puede bastar con una{' '}
        <a href="/servicios/automatizacion-procesos">automatización</a>.
      </p>
    </Articulo>
  )
}
