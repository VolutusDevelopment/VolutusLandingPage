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
 * **Cubre lo que la ley pide publicar, y nada que no sea de datos.** Es el art.
 * 14 ter de la Ley 19.628, en la redacción que le da la 21.719 desde el 1 de
 * diciembre de 2026: responsable, canal de contacto, qué datos y de quién,
 * para qué y con qué base legal, a quién llegan y si salen del país, cuánto se
 * guardan, cómo se protegen, los derechos y el reclamo ante la Agencia. La
 * versión y la fecha van en el encabezado. Lo que no es de datos personales,
 * como los derechos sobre el contenido del sitio, no va aquí.
 */

const VERSION = 2
const ACTUALIZADO = '3 de octubre de 2026'

const CORREO = <a href={`mailto:${CORREO_DE_CONTACTO}`}>{CORREO_DE_CONTACTO}</a>

const APARTADOS = [
  {
    titulo: 'Quién responde por tus datos',
    contenido: (
      <>
        <p>
          El responsable es <strong>Volutus</strong>, empresa de desarrollo de software con
          domicilio en Chile. Para cualquier asunto sobre tus datos, incluido el ejercicio de tus
          derechos, escríbenos a {CORREO}.
        </p>
        <p>
          Esta política sigue la <strong>Ley N° 19.628</strong>, con las modificaciones de la{' '}
          <strong>Ley N° 21.719</strong> que rigen desde el 1 de diciembre de 2026. Qué cambia con
          ellas, <a href="/ley21719">lo explicamos en simple</a>.
        </p>
      </>
    ),
  },
  {
    titulo: 'Qué datos tratamos y para qué',
    contenido: (
      <>
        <p>Los de quienes nos escriben por el formulario de contacto, y solo estos:</p>
        <ul className="lista">
          <li>
            <strong>Tu nombre</strong>, para saber cómo dirigirnos a ti.
          </li>
          <li>
            <strong>Tu correo</strong>, para responderte.
          </li>
          <li>
            <strong>Lo que nos cuentas y los servicios que marcas</strong>, para darte una
            respuesta útil.
          </li>
        </ul>
        <p>
          Los usamos para responderte y, si te interesa, cotizar tu proyecto. La base legal es que
          tú nos pides esa respuesta: son gestiones previas a un posible contrato, hechas a tu
          solicitud (art. 13, letra c).
        </p>
      </>
    ),
  },
  {
    titulo: 'Lo que no hacemos con ellos',
    contenido: (
      <ul className="lista">
        <li>No los vendemos ni los cedemos a nadie.</li>
        <li>No te inscribimos en listas de correo ni te mandamos publicidad.</li>
        <li>No hacemos perfiles ni tomamos decisiones automatizadas sobre ti.</li>
        <li>
          No usamos tu mensaje para entrenar modelos de inteligencia artificial, ni propios ni de
          terceros.
        </li>
      </ul>
    ),
  },
  {
    titulo: 'Esta página no te rastrea',
    contenido: (
      <p>
        No hay analítica, ni píxeles de seguimiento, ni botones de redes sociales que informen de
        tu visita. No usamos <strong>ninguna cookie</strong>, así que no hay aviso que aceptar, y no
        guardamos nada en tu navegador. Nuestro proveedor de infraestructura conserva registros
        técnicos por seguridad, como cualquier servidor.
      </p>
    ),
  },
  {
    titulo: 'Con quién se comparten',
    contenido: (
      <>
        <p>Intervienen dos proveedores, que actúan por encargo nuestro y solo para eso:</p>
        <ul className="lista">
          <li>
            <strong>Cloudflare</strong>, que aloja este sitio y recibe el formulario.
          </li>
          <li>
            <strong>Resend</strong>, que convierte el envío en el correo que nos llega.
          </li>
        </ul>
        <p>
          Los dos operan fuera de Chile, así que enviar el formulario es una{' '}
          <strong>transferencia internacional</strong> de tus datos, amparada en las garantías
          contractuales que ambos ofrecen. Nadie más los recibe, salvo que una autoridad lo exija
          por ley.
        </p>
      </>
    ),
  },
  {
    titulo: 'Cuánto los conservamos',
    contenido: (
      <p>
        Mientras dure la conversación y hasta <strong>doce meses</strong> después del último
        contacto, por si retomas el proyecto. Después se eliminan. Si quieres que los borremos
        antes, pídelo y lo hacemos.
      </p>
    ),
  },
  {
    titulo: 'Tus derechos',
    contenido: (
      <>
        <p>Sobre tus datos puedes pedir, en cualquier momento:</p>
        <ul className="lista">
          <li>
            <strong>Acceso:</strong> saber qué tenemos tuyo y recibir una copia.
          </li>
          <li>
            <strong>Rectificación:</strong> corregirlo si está mal o incompleto.
          </li>
          <li>
            <strong>Supresión:</strong> que lo borremos.
          </li>
          <li>
            <strong>Oposición:</strong> que dejemos de tratarlo.
          </li>
          <li>
            <strong>Portabilidad:</strong> recibirlo en un formato que puedas llevarte.
          </li>
          <li>
            <strong>Bloqueo:</strong> que suspendamos su tratamiento mientras resolvemos tu
            solicitud.
          </li>
        </ul>
        <p>
          Escríbenos a {CORREO}. Respondemos en <strong>48 horas hábiles</strong> y no cobramos
          nada. Si no te respondemos o no estás de acuerdo con la respuesta, puedes reclamar ante
          la <strong>Agencia de Protección de Datos Personales</strong>.
        </p>
      </>
    ),
  },
  {
    titulo: 'Seguridad',
    contenido: (
      <p>
        El sitio y el formulario viajan cifrados hasta nuestro correo, y aplicamos medidas acordes a
        lo poco y poco sensible que tratamos. Si alguna vez una filtración afectara tus datos, la
        reportaríamos a la Agencia y te avisaríamos.
      </p>
    ),
  },
  {
    titulo: 'Cambios a este documento',
    contenido: (
      <p>
        Si algo cambia, publicamos una nueva versión con su fecha. A tu mensaje se le aplica la
        versión vigente el día que lo enviaste.
      </p>
    ),
  },
]

export default function Privacidad() {
  return (
    <DocumentoLegal ruta="/privacidad" version={VERSION} actualizado={ACTUALIZADO} apartados={APARTADOS} />
  )
}
