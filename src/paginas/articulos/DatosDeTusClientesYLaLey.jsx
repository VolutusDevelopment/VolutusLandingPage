import Articulo from '../../components/Articulo.jsx'

export default function DatosDeTusClientesYLaLey({ ruta }) {
  return (
    <Articulo ruta={ruta}>
      <p>
        Muchos negocios creen que los datos personales son una base de datos grande, de esas que tiene un banco. En
        realidad, cualquier formulario, chat o planilla que identifique a una persona ya cuenta. Es bueno saberlo antes
        de que la Ley 21.719 empiece a regir el 1 de diciembre de 2026.
      </p>

      <h2>Qué es un dato personal</h2>
      <p>
        Todo lo que identifica a alguien: su nombre, su RUT, su correo, su teléfono o lo que te compró. La ley lo define
        así en su artículo 2, y por eso aplica a clientes, trabajadores y proveedores.
      </p>

      <h2>Dónde suelen estar</h2>
      <p>
        En lugares que no parecen una base de datos: el formulario de contacto de tu sitio, los chats de WhatsApp con
        pedidos o consultas, o la planilla de clientes con sus teléfonos y direcciones. También en las carpetas de
        trabajadores, con contratos y certificados, y en las fotos o listas de asistencia que se comparten por correo.
      </p>

      <h2>Qué exige la ley</h2>
      <p>
        La ley te pide responder en un plazo de 30 días a quien pida sus datos, y pedir un consentimiento libre e
        informado para cada finalidad, que la persona puede retirar cuando quiera. Una agencia fiscaliza que se cumpla,
        y cada infracción puede costar hasta 20.000 UTM.
      </p>
      <p>
        El detalle completo está en nuestra <a href="/ley21719">página sobre la Ley 21.719</a>, con los artículos que
        citamos.
      </p>

      <h2>Qué pasa si no se cumple</h2>
      <p>
        Las multas tienen tres niveles: leve, grave y gravísima. La más alta llega a 20.000 UTM por infracción, y si
        una infracción se repite, la multa puede triplicarse. Una empresa grande que reincide puede pagar hasta el 4 %
        de sus ingresos anuales.
      </p>
      <p>
        Además, las sanciones quedan cinco años en un registro público, y la persona afectada puede pedir una
        indemnización. Si hay una filtración, se avisa a la Agencia; y si los datos son sensibles, de niños o
        financieros, también se avisa a cada persona afectada.
      </p>
      <p>Para el detalle y los artículos que lo respaldan, revisa la <a href="/ley21719">página sobre la Ley 21.719</a>.</p>

      <h2>Qué revisar esta semana</h2>
      <ul>
        <li>Enumera dónde guardas datos de personas, aunque sea en un celular.</li>
        <li>Para cada lugar, anota para qué los usas y quién tiene acceso.</li>
        <li>Quita lo que no necesitas. Lo que no existe, no hay que protegerlo.</li>
        <li>Pregunta a tu proveedor de sistemas dónde se guardan y cómo se respaldan.</li>
      </ul>

      <p className="destacado">
        Esto es orientación general, no asesoría legal. Para tu caso, consulta con tu abogado; y si tu negocio guarda
        datos de salud o de menores, la revisión conviene hacerla antes.
      </p>
    </Articulo>
  )
}
