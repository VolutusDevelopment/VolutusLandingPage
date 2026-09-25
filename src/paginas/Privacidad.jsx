import DocumentoLegal from '../components/DocumentoLegal.jsx'
import { CORREO_DE_CONTACTO } from '../components/Contacto.jsx'

/**
 * Política de privacidad y protección de datos.
 *
 * **Describe lo que esta página hace de verdad, no lo que suele decir una
 * política.** Volutus no vende por la web, no tiene cuentas, no perfila y no
 * mide nada: el único dato personal que entra es el del formulario. Copiar una
 * plantilla con cláusulas de cookies publicitarias y perfilado habría sido
 * declarar tratamientos que no existen, y eso es tan incorrecto como omitir los
 * que sí.
 *
 * Lo que sí hay y casi ninguna política declara es el almacenamiento del widget
 * de accesibilidad: no es una cookie, no sale del navegador y no identifica a
 * nadie, pero es almacenamiento en el equipo de la persona y se dice.
 *
 * Sobre la ley aplicable: se nombran las dos. La 19.628 es la que rige hoy; la
 * 21.719 la reemplaza y crea la Agencia de Protección de Datos Personales.
 * Nombrar solo una dejaría el documento desactualizado en cuanto cambie el
 * calendario de entrada en vigor, y los derechos que se describen son los que
 * la 21.719 reconoce, que son más amplios.
 */

const ACTUALIZADO = '25 de septiembre de 2026'

const APARTADOS = [
  {
    titulo: 'Quién responde por tus datos',
    contenido: (
      <>
        <p>
          El responsable es <strong>Volutus</strong>, empresa de desarrollo de software con
          domicilio en Chile. Para cualquier asunto relacionado con tus datos personales, incluido
          el ejercicio de tus derechos, el canal es{' '}
          <a href={`mailto:${CORREO_DE_CONTACTO}`}>{CORREO_DE_CONTACTO}</a>.
        </p>
        <p>
          Este documento se rige por la ley chilena: la <strong>Ley N° 19.628</strong> sobre
          protección de la vida privada y la <strong>Ley N° 21.719</strong>, que la reemplaza y
          crea la Agencia de Protección de Datos Personales. Los derechos que se describen más
          abajo son los que reconoce la 21.719, que son los más amplios de las dos.
        </p>
      </>
    ),
  },
  {
    titulo: 'Qué datos tratamos, y son solo estos',
    contenido: (
      <>
        <p>
          Esta página tiene un único punto donde entran datos personales: el formulario de
          contacto. Cuando lo envías, tratamos tres cosas, que son las que tú escribes.
        </p>
        <ul className="lista">
          <li>
            <strong>Tu nombre</strong>, para saber cómo dirigirnos a ti.
          </li>
          <li>
            <strong>Tu correo</strong>, que es la única forma que tenemos de responderte.
          </li>
          <li>
            <strong>Lo que nos cuentas del proyecto</strong>, para poder contestarte algo útil y
            no un acuse de recibo.
          </li>
        </ul>
        <p>
          No hay más. No pedimos RUT, ni teléfono, ni datos de tu empresa, ni nada que no haga
          falta para responderte. El fundamento legal del tratamiento es tu propio envío: nos
          escribes para que te contestemos, y eso es lo único que hacemos con ello.
        </p>
      </>
    ),
  },
  {
    titulo: 'Para qué no los usamos',
    contenido: (
      <>
        <p>
          Este apartado existe porque lo que <em>no</em> hacemos es tan importante como lo que sí,
          y rara vez se escribe.
        </p>
        <ul className="lista">
          <li>No vendemos ni cedemos tus datos a nadie, bajo ninguna circunstancia.</li>
          <li>No te inscribimos en ninguna lista de correo ni te mandamos publicidad.</li>
          <li>No construimos perfiles ni tomamos decisiones automatizadas sobre ti.</li>
          <li>
            No usamos tu mensaje para entrenar modelos de inteligencia artificial, ni propios ni
            de terceros.
          </li>
        </ul>
      </>
    ),
  },
  {
    titulo: 'Esta página no te rastrea',
    contenido: (
      <>
        <p>
          No hay analítica, ni píxeles de seguimiento, ni cookies publicitarias, ni botones de
          redes sociales que informen de tu visita. No usamos <strong>ninguna cookie</strong>, y
          por eso tampoco verás un aviso pidiéndote que las aceptes: no habría nada que aceptar.
        </p>
        <p>
          Tampoco guardamos registros de navegación con fines de análisis. Nuestro proveedor de
          infraestructura conserva registros técnicos por seguridad y para que el sitio funcione,
          como hace cualquier servidor.
        </p>
      </>
    ),
  },
  {
    titulo: 'Lo único que tu navegador guarda',
    contenido: (
      <>
        <p>
          Si usas el panel de accesibilidad —el botón de la esquina— para cambiar el tamaño del
          texto, el tema o el movimiento, esas tres preferencias se guardan en el almacenamiento
          local de tu navegador para que no tengas que elegirlas otra vez en cada visita.
        </p>
        <p>
          <strong>Esa información no sale de tu equipo.</strong> No es una cookie, no viaja al
          servidor, no la recibimos nosotros y no identifica a nadie: son tres valores como
          «texto grande» y «tema oscuro». Puedes borrarla en cualquier momento pulsando
          «Restablecer» en el propio panel, o limpiando los datos del sitio desde tu navegador.
        </p>
      </>
    ),
  },
  {
    titulo: 'Con quién se comparten y dónde acaban',
    contenido: (
      <>
        <p>
          Tu mensaje llega a nuestro correo. Para que llegue intervienen dos proveedores, que
          actúan por encargo nuestro y solo para eso:
        </p>
        <ul className="lista">
          <li>
            <strong>Cloudflare</strong>, que aloja este sitio y recibe el envío del formulario.
          </li>
          <li>
            <strong>Resend</strong>, que es quien transforma ese envío en el correo que nos llega.
          </li>
        </ul>
        <p>
          Los dos operan servidores fuera de Chile, así que enviar el formulario implica una{' '}
          <strong>transferencia internacional</strong> de esos tres datos. Los dos ofrecen
          garantías contractuales de protección y tratan la información únicamente bajo nuestras
          instrucciones. Fuera de ellos, nadie más recibe nada, salvo que una autoridad
          competente nos lo exija por ley.
        </p>
      </>
    ),
  },
  {
    titulo: 'Cuánto los conservamos',
    contenido: (
      <p>
        Conservamos tu mensaje mientras dure la conversación y hasta{' '}
        <strong>doce meses</strong> después del último contacto, por si retomas el proyecto y hace
        falta el hilo. Pasado ese plazo se elimina. Si prefieres que lo borremos antes, basta con
        que lo pidas y se hace.
      </p>
    ),
  },
  {
    titulo: 'Tus derechos, y cómo ejercerlos de verdad',
    contenido: (
      <>
        <p>Sobre tus datos personales puedes ejercer, en cualquier momento:</p>
        <ul className="lista">
          <li>
            <strong>Acceso:</strong> saber qué tenemos tuyo y obtener una copia.
          </li>
          <li>
            <strong>Rectificación:</strong> corregirlo si está mal o incompleto.
          </li>
          <li>
            <strong>Supresión:</strong> pedir que lo borremos.
          </li>
          <li>
            <strong>Oposición:</strong> oponerte a que lo tratemos.
          </li>
          <li>
            <strong>Portabilidad:</strong> recibirlo en un formato que puedas llevarte.
          </li>
          <li>
            <strong>Bloqueo:</strong> pedir que se suspenda el tratamiento mientras se resuelve
            una discrepancia.
          </li>
        </ul>
        <p>
          Se ejercen escribiendo a <a href={`mailto:${CORREO_DE_CONTACTO}`}>{CORREO_DE_CONTACTO}</a>
          . No hay formulario que rellenar ni trámite: respondemos en el mismo plazo que
          prometemos para todo lo demás, <strong>48 horas hábiles</strong>. No cobramos por
          ejercer ninguno de estos derechos.
        </p>
        <p>
          Si crees que no te hemos respondido bien, puedes reclamar ante la{' '}
          <strong>Agencia de Protección de Datos Personales</strong>. Que exista esa vía no
          depende de que nosotros la mencionemos, pero conviene que sepas que está.
        </p>
      </>
    ),
  },
  {
    titulo: 'Seguridad',
    contenido: (
      <p>
        El sitio se sirve íntegramente por conexión cifrada y el formulario viaja cifrado hasta
        nuestro correo. Aplicamos las medidas técnicas razonables para el volumen y el tipo de
        datos que tratamos, que es poco y poco sensible. Ninguna medida es infalible: si alguna
        vez ocurriera una brecha que afecte a tus datos, te lo comunicaríamos y lo notificaríamos
        a la autoridad como exige la ley.
      </p>
    ),
  },
  {
    titulo: 'El contenido de este sitio',
    contenido: (
      <>
        <p>
          Los textos, el diseño y las piezas gráficas de esta página son de Volutus. El código de
          los proyectos que enlazamos se publica en repositorios con su propia licencia, y es esa
          licencia la que manda sobre cada uno, no este documento.
        </p>
        <p>
          La información de esta página es descriptiva y no constituye una oferta contractual.
          Alcance, plazos y precio de cualquier trabajo se acuerdan por escrito antes de empezar.
        </p>
      </>
    ),
  },
  {
    titulo: 'Cambios a este documento',
    contenido: (
      <p>
        Si cambia algo de lo anterior, se actualiza aquí y se cambia la fecha del encabezado. No
        hacemos cambios con efecto retroactivo sobre datos ya recogidos: lo que se aplicó a tu
        mensaje es lo que decía este documento el día que lo enviaste.
      </p>
    ),
  },
]

export default function Privacidad() {
  return <DocumentoLegal ruta="/privacidad" actualizado={ACTUALIZADO} apartados={APARTADOS} />
}
