import Articulo from '../../components/Articulo.jsx'

// La comparación, fila por fila: una tabla porque se lee de lado a lado.
const COMPARACION = [
  ['Para qué sirve', 'Presentar tu negocio y traer contactos', 'Vender sin una conversación de por medio'],
  ['Qué hace el cliente', 'Te conoce y te escribe', 'Elige, paga y espera su pedido'],
  ['Pagos en línea', 'No', 'Sí'],
  ['Qué administras', 'Textos e imágenes', 'Productos, precios, stock y pedidos'],
]

export default function PaginaWebOTiendaOnline({ ruta }) {
  return (
    <Articulo ruta={ruta}>
      <p>
        Las dos viven en internet y por fuera se parecen, pero hacen trabajos distintos. Elegir mal sale caro de las
        dos formas: una tienda que nadie necesitaba, o una página que te obliga a cerrar cada venta por mensaje.
      </p>

      <h2>La diferencia, en una frase</h2>
      <p className="destacado">
        Una página web presenta tu negocio y te trae contactos. Una tienda online, además, vende: el cliente elige,
        paga y tú recibes un pedido.
      </p>

      <div className="tabla">
        <table>
          <thead>
            <tr>
              <th scope="col">
                <span className="solo-lectores">Aspecto</span>
              </th>
              <th scope="col">Página web</th>
              <th scope="col">Tienda online</th>
            </tr>
          </thead>
          <tbody>
            {COMPARACION.map(([aspecto, web, tienda]) => (
              <tr key={aspecto}>
                <th scope="row">{aspecto}</th>
                <td>{web}</td>
                <td>{tienda}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Te basta una página web si…</h2>
      <ul>
        <li>Lo que vendes se cotiza o se conversa: servicios, proyectos o productos a pedido.</li>
        <li>El precio depende de cada caso.</li>
        <li>Lo que buscas es que te encuentren, te conozcan y te escriban.</li>
        <li>Vendes en un local y quieres que te ubiquen: horarios, dirección y cómo llegar.</li>
      </ul>

      <h2>Necesitas una tienda online si…</h2>
      <ul>
        <li>Tienes productos con precio fijo y stock.</li>
        <li>Respondes a mano todo el día preguntas de precio y disponibilidad.</li>
        <li>Quieres vender fuera de tu horario o fuera de tu ciudad.</li>
        <li>Tus clientes ya están dispuestos a pagar en línea.</li>
      </ul>

      <h2>¿Y si estás en medio?</h2>
      <p>
        Es lo más común. Muchos negocios parten con una página web y un catálogo que se cotiza por mensaje, y suman la
        tienda cuando las consultas lo justifican. Lo importante es que la página esté hecha para crecer: que la
        tienda se pueda sumar después sin rehacerlo todo.
      </p>
      <p>
        Otra opción es vender en un marketplace mientras tanto. Sirve para que te encuentren, pero vendes en la
        vitrina de otro, con sus reglas y sus comisiones. Tu tienda propia es la que hace que los clientes vuelvan a
        ti.
      </p>

      <h2>Lo que vale para las dos</h2>
      <ul>
        <li>Que abra rápido en el celular. Lo puedes medir gratis en PageSpeed Insights, de Google.</li>
        <li>Que Google la pueda leer: títulos claros, una descripción por página y texto real, no solo imágenes.</li>
        <li>Que sea tuya: el dominio, el código y los accesos a tu nombre.</li>
        <li>
          Que cumpla la <a href="/ley21719">Ley 21.719</a> si pides datos de tus clientes, aunque sea solo un
          formulario de contacto.
        </li>
      </ul>
      <p>
        Si ya sabes cuál necesitas, en <a href="/desarrollo-web">desarrollo web</a> y en{' '}
        <a href="/tiendas-online">tiendas online</a> contamos qué incluye cada una y qué te vamos a pedir.
      </p>
    </Articulo>
  )
}
