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

      <h2>Cuándo basta una página web</h2>
      <p>
        Te basta una página web si lo que vendes se cotiza o se conversa, como servicios, proyectos o productos a
        pedido, y el precio depende de cada caso. También si lo que buscas es que te encuentren, te conozcan y te
        escriban, o si vendes en un local y quieres que te ubiquen: horarios, dirección y cómo llegar.
      </p>

      <h2>Cuándo necesitas una tienda online</h2>
      <p>
        Necesitas una tienda online si tienes productos con precio fijo y stock, y te pasas el día respondiendo a mano
        preguntas de precio y disponibilidad. También si quieres vender fuera de tu horario o fuera de tu ciudad, o si
        tus clientes ya están dispuestos a pagar en línea.
      </p>

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
      <p>
        Sea cual sea, tiene que abrir rápido en el celular. Lo puedes medir gratis en PageSpeed Insights, de Google.
        Google también la tiene que poder leer, y para eso necesita títulos claros, una descripción por página y texto
        real, no solo imágenes.
      </p>
      <p>
        Además, tiene que ser tuya: el dominio, el código y los accesos a tu nombre. Y si pides datos de tus clientes,
        aunque sea con un formulario de contacto, tiene que cumplir la <a href="/ley21719">Ley 21.719</a>.
      </p>
      <p>
        Si ya sabes cuál necesitas, en <a href="/servicios/desarrollo-web">desarrollo web</a> y en{' '}
        <a href="/servicios/tiendas-online">tiendas online</a> contamos qué incluye cada una y qué te vamos a pedir.
      </p>
    </Articulo>
  )
}
