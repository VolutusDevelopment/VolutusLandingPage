import Pagina from '../components/Pagina.jsx'
import { CORREO_DE_CONTACTO } from '../components/Contacto.jsx'
import { ORIGEN, PAGINAS, canonicalDe, fechaDe, tituloCorto } from '../lib/meta.js'

/**
 * Política de privacidad y protección de datos. Abre en el cielo azul de las
 * cabeceras internas, como /ley21719, con el título en blanco y sin nube: aquí
 * lo primero es lo que dice. Después baja por el blanco y termina en la caída,
 * con el cierre de /nosotros y el pie de día. Primero lo esencial en cuatro
 * cifras, después la política punto por punto y al final a quién preguntar.
 *
 * **Se puede copiar entera para una IA.** El botón de la cabecera, y el del
 * cierre, copian la política en Markdown para pegarla en un chat y preguntarle
 * lo que haga falta. El Markdown sale de los mismos datos que la página, así
 * que nunca dice otra cosa: el texto se escribe con `**negrita**` y
 * `[enlace](destino)`, que en la página se vuelven etiquetas (`enLinea`) y en
 * el Markdown quedan tal cual (`enMarkdown`).
 *
 * **Describe lo que el sitio hace de verdad, no lo que suele decir una
 * política.** Volutus no vende por la web, no tiene cuentas, no perfila y no
 * mide nada: el único dato personal que entra es el del formulario, y la IP con
 * que Cloudflare frena a los robots. Lo único que se guarda en el navegador es
 * el modo desbloqueado del juego de los patos (lib/odio.js), y también se dice.
 *
 * **Cubre lo que la ley pide publicar.** Es el art. 14 ter de la Ley 19.628,
 * en la redacción que le da la 21.719 desde el 1 de diciembre de 2026:
 * responsable, canal de contacto, qué datos y de quién, para qué y con qué
 * base legal, a quién llegan y si salen del país, cuánto se guardan, cómo se
 * protegen, los derechos y el reclamo ante la Agencia, con versión y fecha.
 */

const VERSION = 3
const ACTUALIZADO = fechaDe('/privacidad')

const CORREO = `[${CORREO_DE_CONTACTO}](mailto:${CORREO_DE_CONTACTO})`

// Lo esencial, para quien no va a leer más.
const RESUMEN = [
  { valor: '3 datos', texto: 'Tu nombre, tu correo y tu mensaje, y solo si nos escribes.' },
  { valor: '0 cookies', texto: 'Ni analítica ni nada que te siga por internet.' },
  { valor: '12 meses', texto: 'Lo máximo que guardamos tus datos desde el último contacto.' },
  { valor: '48 horas', texto: 'Hábiles, para responderte cuando ejerces tus derechos.' },
]

// Cada apartado es una lista de bloques: un texto es un párrafo y una lista
// de textos, una lista. El número lo pone el orden, no el texto.
const APARTADOS = [
  {
    id: 'responsable',
    titulo: 'Quién responde por tus datos',
    cuerpo: [
      `El responsable es **Volutus**, empresa de desarrollo de software con domicilio en Chile. Para cualquier asunto sobre tus datos, incluido ejercer tus derechos, escríbenos a ${CORREO}.`,
      'Esta política sigue la **Ley 19.628**, con las modificaciones de la **Ley 21.719** que rigen desde el 1 de diciembre de 2026. Qué cambia con ellas, [lo explicamos en simple](/ley21719).',
    ],
  },
  {
    id: 'datos',
    titulo: 'Qué datos tratamos y para qué',
    cuerpo: [
      'Solo los que escribes en el formulario de contacto, cada uno para una cosa:',
      [
        '**Tu nombre**, para saber cómo dirigirnos a ti.',
        '**Tu correo**, para responderte.',
        '**Tu mensaje y los servicios que marcas**, para darte una respuesta útil y, si te interesa, cotizar tu proyecto.',
      ],
      'La base legal es que tú nos pides esa respuesta: son gestiones previas a un posible contrato, hechas a tu solicitud (art. 13, letra c).',
    ],
  },
  {
    id: 'lo-que-no-hacemos',
    titulo: 'Lo que no hacemos con ellos',
    cuerpo: [
      [
        'No los vendemos ni los cedemos a nadie.',
        'No te inscribimos en listas de correo ni te mandamos publicidad.',
        'No hacemos perfiles ni tomamos decisiones automatizadas sobre ti.',
        'No usamos tu mensaje para entrenar modelos de inteligencia artificial, ni propios ni de terceros.',
      ],
    ],
  },
  {
    id: 'rastreo',
    titulo: 'Esta página no te rastrea',
    cuerpo: [
      'No hay analítica, ni píxeles de seguimiento, ni botones de redes sociales que informen de tu visita. **No usamos cookies**, así que no hay aviso que aceptar.',
      'Lo único que se guarda en tu navegador es si terminaste una partida de la [caza de patos](/patos), para desbloquear un modo del juego. No dice nada de ti y no sale de tu equipo.',
      'Como cualquier servidor, Cloudflare registra datos técnicos de cada visita, como tu dirección IP, por seguridad.',
    ],
  },
  {
    id: 'proveedores',
    titulo: 'Con quién se comparten',
    cuerpo: [
      'Con tres proveedores que actúan por encargo nuestro y solo para eso:',
      [
        '**Cloudflare**, que aloja este sitio, recibe el formulario y usa tu dirección IP para comprobar que lo envía una persona y no un robot.',
        '**Resend**, que convierte el envío en el correo que nos llega.',
        '**Zoho**, donde está nuestro correo y donde queda guardado tu mensaje.',
      ],
      'Los tres operan fuera de Chile, así que enviar el formulario es una **transferencia internacional** de tus datos, amparada en las garantías contractuales que ofrecen. Nadie más los recibe, salvo que una autoridad lo exija por ley.',
    ],
  },
  {
    id: 'plazo',
    titulo: 'Cuánto los guardamos',
    cuerpo: [
      'Mientras dure la conversación y hasta **doce meses** después del último contacto, por si retomas el proyecto. Después los borramos. Si quieres que los borremos antes, pídelo y lo hacemos.',
    ],
  },
  {
    id: 'seguridad',
    titulo: 'Cómo los protegemos',
    cuerpo: [
      'Viajan cifrados del formulario a nuestro correo, y aplicamos medidas acordes a lo poco y poco sensible que tratamos. Si alguna vez una filtración afectara tus datos, la reportaríamos a la Agencia de Protección de Datos Personales y te avisaríamos.',
    ],
  },
  {
    id: 'derechos',
    titulo: 'Tus derechos',
    cuerpo: [
      'Sobre tus datos puedes pedir, en cualquier momento:',
      [
        '**Acceso:** saber qué tenemos tuyo y recibir una copia.',
        '**Rectificación:** corregirlo si está mal o incompleto.',
        '**Supresión:** que lo borremos.',
        '**Oposición:** que dejemos de tratarlo.',
        '**Portabilidad:** recibirlo en un formato que puedas llevarte.',
        '**Bloqueo:** que suspendamos su tratamiento mientras resolvemos tu solicitud.',
      ],
      `Escríbenos a ${CORREO}. Te respondemos en **48 horas hábiles** y no cobramos nada. Si no te respondemos o no estás de acuerdo con la respuesta, puedes reclamar ante la **Agencia de Protección de Datos Personales**.`,
    ],
  },
  {
    id: 'cambios',
    titulo: 'Cambios a esta política',
    cuerpo: [
      'Si algo cambia, publicamos una nueva versión con su fecha. A tu mensaje se le aplica la versión vigente el día que lo enviaste.',
    ],
  },
]

const { titulo: TITULO, descripcion: DESCRIPCION } = PAGINAS['/privacidad']

/**
 * La política en Markdown, para pegarla en un chat de IA: el resumen y los
 * apartados, con la dirección y la versión arriba para que la IA sepa qué
 * está leyendo, y los enlaces completos.
 */
function enMarkdown() {
  const bloques = [
    `# ${tituloCorto(TITULO)}`,
    `Política de privacidad de Volutus, copiada de ${canonicalDe('/privacidad')}. Versión ${VERSION}, actualizada el ${ACTUALIZADO}.`,
    '## En resumen',
    RESUMEN.map(({ valor, texto }) => `- **${valor}**: ${texto}`).join('\n'),
    ...APARTADOS.flatMap(({ titulo, cuerpo }, indice) => [
      `## ${indice + 1}. ${titulo}`,
      ...cuerpo.map((bloque) => (typeof bloque === 'string' ? bloque : bloque.map((punto) => `- ${punto}`).join('\n'))),
    ]),
  ]
  return bloques.join('\n\n').replaceAll('](/', `](${ORIGEN}/`)
}

const TEXTO = enMarkdown()

// Va en un <script> sin escapar (ver abajo): un «<» podría cerrarlo antes de
// tiempo. Si alguna vez aparece uno, el build se detiene aquí.
if (TEXTO.includes('<')) throw new Error('Privacidad: el texto para copiar no puede llevar «<»')

/** Pasa `**negrita**` y `[enlace](destino)` a sus etiquetas. */
function enLinea(texto) {
  return texto.split(/(\*\*.+?\*\*|\[.+?\]\(.+?\))/).map((parte, indice) => {
    const negrita = parte.match(/^\*\*(.+)\*\*$/)
    if (negrita) return <strong key={indice}>{negrita[1]}</strong>
    const enlace = parte.match(/^\[(.+)\]\((.+)\)$/)
    if (enlace)
      return (
        <a key={indice} href={enlace[2]}>
          {enlace[1]}
        </a>
      )
    return parte
  })
}

/**
 * Copia `TEXTO` (copiar.js). Las tres etiquetas comparten celda, así que el
 * botón mide lo que la más larga y no cambia de ancho al confirmar.
 */
function BotonCopiar({ variante }) {
  return (
    <button type="button" className={`boton ${variante} copiar`} data-copiar="privacidad-texto">
      <span>Copiar para tu IA</span>
      <span>¡Copiada!</span>
      <span>No se pudo copiar</span>
    </button>
  )
}

/**
 * La invitación final, en la caída: la tarjeta oscura del cierre de /nosotros,
 * con el correo y, para quien leyó hasta aquí, otra vez el botón de copiar.
 */
function Cierre() {
  return (
    <section className="seccion zona-cielo cierre" aria-labelledby="cierre-titulo">
      <div className="contenedor">
        <div className="cierre-tarjeta zona-plano cierre-invitacion entra">
          <h2 id="cierre-titulo" className="titular titular-menor">
            ¿Te queda una duda?
          </h2>
          <p className="entradilla">
            Escríbenos y una persona te responde pronto. O copia la política y
            pregúntale a tu IA.
          </p>
          <p className="cierre-acciones">
            <a className="boton boton-primario" href={`mailto:${CORREO_DE_CONTACTO}`}>
              Escríbenos
            </a>
            <BotonCopiar variante="boton-secundario" />
          </p>
        </div>
      </div>
    </section>
  )
}

export default function Privacidad() {
  return (
    <Pagina hora="dia" cierre={<Cierre />}>
      <section className="seccion zona-cielo hora-dia cabecera-cielo">
        <div className="contenedor">
          <p className="antetitulo">Privacidad</p>
          <h1>
            Tus datos, <br />
            sin letra chica
          </h1>
          {/* La entradilla es la meta description, como en /nosotros. */}
          <p className="entradilla privacidad-entradilla">{DESCRIPCION}</p>
          <div className="privacidad-copiar">
            <BotonCopiar variante="boton-primario" />
            <p className="privacidad-pista">
              En texto, para pegarla en ChatGPT, Claude o Gemini y preguntarle lo que quieras.
            </p>
            {/* Lo que el botón confirma a la vista, dicho para el lector de
                pantalla. Lo comparten los dos botones. */}
            <p className="copiar-aviso solo-lectores" role="status" />
          </div>
        </div>
      </section>

      <section id="resumen" className="seccion zona-cielo" aria-labelledby="resumen-titulo">
        <div className="contenedor">
          <div className="privacidad-resumen zona-plano entra">
            <p className="antetitulo">En resumen</p>
            <h2 id="resumen-titulo" className="titular titular-menor">
              Pedimos lo justo
            </h2>
            <ul className="cifras privacidad-cifras">
              {RESUMEN.map(({ valor, texto }) => (
                <li key={valor}>
                  <span className="cifra dato">{valor}</span>
                  {texto}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="politica" className="seccion zona-cielo" aria-labelledby="politica-titulo">
        <div className="contenedor">
          <p className="antetitulo entra">La política completa</p>
          <h2 id="politica-titulo" className="titular entra">
            Punto por punto
          </h2>
          <p className="privacidad-version dato entra">
            Versión {VERSION}, del {ACTUALIZADO}
          </p>

          <ol className="numerada privacidad-apartados">
            {APARTADOS.map(({ id, titulo, cuerpo }) => (
              <li key={id} id={id} className="entra">
                <div className="privacidad-apartado">
                  <h3>{titulo}</h3>
                  <div className="privacidad-cuerpo">
                    {cuerpo.map((bloque, indice) =>
                      typeof bloque === 'string' ? (
                        <p key={indice}>{enLinea(bloque)}</p>
                      ) : (
                        <ul key={indice}>
                          {bloque.map((punto) => (
                            <li key={punto}>{enLinea(punto)}</li>
                          ))}
                        </ul>
                      )
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {/* El texto que copian los botones. Es un bloque de datos, como el
              JSON-LD: el navegador no lo ejecuta, y su contenido sale de este
              archivo, sin nada que llegue de afuera. */}
          <script type="text/markdown" id="privacidad-texto" dangerouslySetInnerHTML={{ __html: TEXTO }} />
        </div>
      </section>
    </Pagina>
  )
}
