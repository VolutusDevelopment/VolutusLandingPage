import Pagina from '../components/Pagina.jsx'
import { CORREO_DE_CONTACTO, RAZON_SOCIAL, RUT } from '../lib/contacto.js'
import { IAS } from '../data/ias.js'
import { ORIGEN, PAGINAS, canonicalDe, fechaDe, tituloCorto } from '../lib/meta.js'

/**
 * Política de privacidad y protección de datos. Abre en el cielo azul de las
 * cabeceras internas, como /ley21719, con el título en blanco y sin nube: aquí
 * lo primero es lo que dice. Después baja por el blanco y termina en la caída,
 * con el cierre de /nosotros y el pie de día. Primero lo esencial en cuatro
 * cifras, después la política punto por punto y al final a quién preguntar.
 *
 * **Se puede copiar entera para una IA.** El botón de la cabecera copia la
 * política en Markdown para pegarla en un chat y preguntarle lo que haga falta.
 * El Markdown sale de los mismos datos que la página, así que nunca dice otra
 * cosa: el texto se escribe con `**negrita**` y `[enlace](destino)`, que en la
 * página se vuelven etiquetas (`enLinea`) y en el Markdown quedan tal cual
 * (`enMarkdown`).
 *
 * **Y se puede comprobar.** El cierre lleva al código del sitio, que es
 * público, y su botón copia un encargo para que la IA de quien lee lo revise y
 * lo compare con la política (`INSPECCION`).
 *
 * **Describe lo que el sitio hace de verdad, no lo que suele decir una
 * política.** Volutus no vende por la web, no tiene cuentas, no perfila y no
 * mide nada: el único dato personal que entra es el del formulario, y la IP con
 * que Cloudflare frena a los robots, que también queda, con el lugar que se
 * deduce de ella, en el registro de cada petición que atiende el Worker: los
 * envíos y los videos (`observability` en wrangler.jsonc). Si quien escribe
 * elige WhatsApp, el formulario no envía nada: abre WhatsApp con el texto
 * (client.js), que viaja en el enlace. El brief para clientes (/brief-web), que se
 * manda por link, suma lo que identifica el envío y el logo que se sube, que
 * llega adjunto (worker/brief.js). En el
 * navegador se guardan el modo desbloqueado del juego de los patos
 * (lib/odio.js), el final elegido en Operación Venganza (lib/final.js) y, en
 * el brief, las respuestas a medio llenar, su número al azar y la marca de la
 * pestaña (lib/brief/reglas.js), y lo que se califica en los bocetos
 * (public/brief/bocetos/barra.js); también se dice, y cuánto dura cada uno.
 * Turnstile, Resend y los registros del Worker dicen qué guardan y cuánto, con
 * lo que publica cada proveedor.
 *
 * **Cubre lo que la ley pide publicar.** Es el art. 14 ter de la Ley 19.628,
 * en la redacción que le da la 21.719 desde el 1 de diciembre de 2026:
 * responsable, canal de contacto, qué datos y de quién, para qué y con qué
 * base legal, a quién llegan y si salen del país, cuánto se guardan, cómo se
 * protegen, los derechos y el reclamo ante la Agencia, con su fecha.
 */

const ACTUALIZADO = fechaDe('/privacidad')

const CORREO = `[${CORREO_DE_CONTACTO}](mailto:${CORREO_DE_CONTACTO})`

// El código de este sitio. Workers Builds publica lo que llega a `main`.
const REPOSITORIO = 'https://github.com/VolutusDevelopment/VolutusLandingPage'

// Lo esencial, para quien no va a leer más.
const RESUMEN = [
  { valor: '3 datos', texto: 'Para escribirnos: tu nombre, cómo responderte y tu mensaje. El brief pide más. Aparte, un registro técnico con tu IP que se borra en una semana.' },
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
      `El responsable es **${RAZON_SOCIAL}**, RUT ${RUT}, empresa de desarrollo de software con domicilio en Santiago, Chile. Para cualquier asunto sobre tus datos, incluido ejercer tus derechos, escríbenos a ${CORREO}.`,
      'Esta política sigue la **Ley 19.628**, con las modificaciones de la **Ley 21.719** que rigen desde el 1 de diciembre de 2026. Qué cambia con ellas, [lo explicamos en simple](/ley21719).',
    ],
  },
  {
    id: 'datos',
    titulo: 'Qué datos tratamos y para qué',
    cuerpo: [
      'Los que escribes en el formulario de contacto, cada uno para una cosa:',
      [
        '**Tu nombre**, para saber cómo dirigirnos a ti.',
        '**Tu correo**, para responderte.',
        '**Tu mensaje y los servicios que marcas**, para darte una respuesta útil y, si te interesa, cotizar tu proyecto.',
      ],
      'Si nos escribes por WhatsApp o llenas nuestro brief, se suma lo que explicamos en los dos puntos que siguen. Y al enviar cualquier formulario, Cloudflare revisa tu dirección IP para frenar a los robots, y queda el registro técnico que explicamos más abajo.',
      'La base legal es que tú nos pides esa respuesta: son gestiones previas a un posible contrato, hechas a tu solicitud (art. 13, letra c).',
    ],
  },
  {
    id: 'whatsapp',
    titulo: 'Si nos escribes por WhatsApp',
    cuerpo: [
      'En el formulario puedes elegir **WhatsApp** en vez del correo. Entonces el sitio no nos envía nada: abre WhatsApp con tu mensaje ya escrito, con tu nombre, tu correo si lo diste, los servicios que marcas y lo que nos cuentas, y eres tú quien decide enviarlo. El botón de WhatsApp del pie de página hace lo mismo, con un saludo.',
      'Ese texto va en el enlace que abre WhatsApp, así que **WhatsApp puede recibirlo apenas lo abres**, aunque no lo envíes. Si lo envías, además nos llega lo que WhatsApp muestra de ti: tu número de teléfono y lo que tengas visible en tu perfil.',
      'WhatsApp es un servicio de **Meta**, que opera fuera de Chile y trata lo que pasa por él según [su propia política de privacidad](https://www.whatsapp.com/legal/privacy-policy). Lo que nos llega por ahí lo tratamos igual que un correo: para lo mismo, con la misma base legal y por el mismo plazo.',
    ],
  },
  {
    id: 'brief',
    titulo: 'Si llenas nuestro brief',
    cuerpo: [
      'Si te mandamos el link del **brief**, el cuestionario de marca y sitio web, lo que respondes nos llega por correo, en un PDF: tu nombre y tu rol, el correo o el número de WhatsApp o teléfono que nos dejes, los datos de tu negocio y cada respuesta del cuestionario. Si lo pides, te llega una copia a ti. Lo usamos para preparar tu propuesta y la conversación.',
      'Para saber que lo envía una persona y no un robot, y reconocer un envío repetido, el correo que nos llega suma estos datos del envío, y ninguno más:',
      [
        '**Tu dirección IP**, y la ciudad, la región, el país y el proveedor de internet que Cloudflare deduce de ella.',
        '**Tu navegador**, como se identifica ante cualquier sitio, y **tu sistema**: cuál es y si usas celular o computador, cuando tu navegador lo informa.',
        '**Tu pantalla**: su medida y si es táctil.',
        '**Tu zona horaria y tu idioma**, los que tiene configurados tu navegador.',
        '**Un número al azar** que tu navegador crea la primera vez que envías un brief y guarda, para saber si dos briefs vienen del mismo equipo. No dice quién eres ni te sigue fuera de esta página.',
        '**Cuándo lo enviaste** y cuánto tardaste en llenarlo.',
        '**Su número de referencia**, el mismo que te mostramos al enviarlo.',
        '**Cómo llegó**: si pediste copia, si pasó la comprobación anti-robots y cuántos enlaces traen tus respuestas.',
      ],
      'Si subes **tu logo**, nos llega adjunto en ese mismo correo, con un nombre que le ponemos nosotros. No queda guardado en el sitio, y la copia que te llega no lo lleva.',
      'Mientras lo llenas, tus respuestas, lo que calificas en los bocetos, la parte en que ibas, cuándo empezaste y cuándo se guardó por última vez quedan **solo en tu navegador**, para que no se pierdan si cierras la página, y se borran de ahí al enviarlo o al tocar «Empezar de nuevo». El número al azar no se borra: queda para reconocer el próximo envío. El logo no se guarda ahí. La copia que te llega no lleva los datos del envío. La base legal es la misma del formulario, más nuestro interés legítimo en protegerlo de abusos.',
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
      'No hay analítica, ni píxeles de seguimiento, ni botones de redes sociales que informen de tu visita. **No usamos cookies**, así que no hay aviso que aceptar. Los enlaces a otros sitios son enlaces comunes: el sitio al que llegas solo sabe que vienes de volutus.cl.',
      'El único código de afuera es **Turnstile**, la comprobación anti-robots de Cloudflare. Se carga solo cuando tocas el formulario de contacto o el brief, aunque después elijas WhatsApp, y revisa tu IP, tu navegador y tu conexión para saber si eres una persona. Cloudflare dice en [la política de Turnstile](https://www.cloudflare.com/turnstile-privacy-policy/) que no lo usa para identificarte ni para hacer perfiles.',
      'En tu navegador se guarda esto, y nada más:',
      [
        'Si terminaste una partida de la [caza de patos](/patos), para desbloquear un modo del juego.',
        'El final que elegiste en [Operación Venganza](/operacion-venganza), para que la página Nosotros lo muestre. Se borra al cerrar la pestaña.',
        'Si llenas nuestro brief: tus respuestas mientras lo llenas, con la parte en que ibas y cuándo empezaste, su número al azar (ver arriba) y una marca de que lo abriste, para ofrecerte volver si lo dejas a medias. La marca se borra al cerrar la pestaña.',
        'Lo que calificas en los bocetos del brief, aunque los mires sin abrirlo, para que el brief lo muestre y lo envíe.',
      ],
      'Nada de eso sale de tu equipo, salvo lo del brief cuando lo envías: tus respuestas, tus calificaciones, cuánto tardaste y el número al azar. Las respuestas y las calificaciones se borran de ahí al enviarlo. El modo de los patos y el número al azar se quedan hasta que borres los datos de este sitio en tu navegador.',
      'Como cualquier servidor, Cloudflare registra datos técnicos de cada visita, como tu dirección IP, para frenar ataques.',
      'Además, guardamos un **registro técnico** cada vez que envías un formulario o tu navegador pide uno de los videos del sitio, como la nube y el mar de las cabeceras o los bocetos del brief. También puede quedar de otros pedidos que llegan a nuestro servidor, como los de robots que buscan direcciones que no existen. Nos sirve para saber si algo falla y para ver intentos de abuso. Cada registro lleva:',
      [
        '**Tu dirección IP**, y el país, la región, la ciudad, el código postal, la zona horaria y las coordenadas aproximadas que Cloudflare deduce de ella, además de tu proveedor de internet.',
        '**Tu navegador y tu sistema**, su idioma y la página desde la que llegaste.',
        '**Datos de tu conexión**, como el protocolo, el tipo de cifrado y cuánto demora en ir y volver.',
        '**Lo que se pidió**: la dirección, la fecha y la hora, y si el sitio respondió bien.',
      ],
      'No lleva lo que escribiste en el formulario. Lo guarda Cloudflare por encargo nuestro, solo lo vemos nosotros y se borra solo en una semana como máximo. La base legal es nuestro interés legítimo en mantener el sitio funcionando y protegido.',
    ],
  },
  {
    id: 'proveedores',
    titulo: 'Con quién se comparten',
    cuerpo: [
      'Con tres proveedores que actúan por encargo nuestro y solo para eso:',
      [
        '**Cloudflare**, que aloja este sitio, recibe el formulario, usa tu dirección IP para comprobar que lo envía una persona y no un robot, y guarda el registro técnico que explicamos arriba.',
        '**Resend**, que convierte el envío en el correo que nos llega. Guarda una copia de cada correo por 30 días y después la borra.',
        '**Zoho**, donde está nuestro correo y donde queda guardado tu mensaje.',
      ],
      'Y con **WhatsApp**, solo si lo eliges para escribirnos. No actúa por encargo nuestro: Meta recibe tu mensaje, tu número y lo que muestra tu perfil, y los trata según su propia política, como explicamos arriba. Ese mensaje no pasa por Resend ni por Zoho.',
      'Todos operan fuera de Chile, así que enviarnos tus datos es una **transferencia internacional**: con los tres proveedores, amparada en las garantías contractuales que ofrecen, y con WhatsApp, porque tú eliges escribirnos por ahí. Nadie más los recibe, salvo que una autoridad lo exija por ley.',
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

// Los bloques en Markdown, como en la página: un texto es un párrafo y una
// lista de textos, una lista.
const enBloques = (bloques) =>
  bloques
    .map((bloque) => (typeof bloque === 'string' ? bloque : bloque.map((punto) => `- ${punto}`).join('\n')))
    .join('\n\n')

/**
 * La política en Markdown, para pegarla en un chat de IA: el resumen y los
 * apartados, con la dirección y la versión arriba para que la IA sepa qué
 * está leyendo, y los enlaces completos.
 */
function enMarkdown() {
  return enBloques([
    `# ${tituloCorto(TITULO)}`,
    `Política de privacidad de Volutus, copiada de ${canonicalDe('/privacidad')}. Actualizada el ${ACTUALIZADO}.`,
    '## En resumen',
    RESUMEN.map(({ valor, texto }) => `**${valor}**: ${texto}`),
    ...APARTADOS.flatMap(({ titulo, cuerpo }, indice) => [`## ${indice + 1}. ${titulo}`, ...cuerpo]),
  ]).replaceAll('](/', `](${ORIGEN}/`)
}

const POLITICA = enMarkdown()

// El encargo que copia el botón del cierre, para que la IA de quien lee revise
// el código y lo compare con la política. No le dice dónde mirar, para que
// investigue sin guion, y le pide decir lo que no pudo abrir en vez de suponerlo.
const INSPECCION = enBloques([
  'Quiero saber si el sitio de Volutus hace lo que dice su política de privacidad. Su código es público:',
  [`Código: ${REPOSITORIO} (la rama main es la que está publicada)`, `Política: ${canonicalDe('/privacidad')}`],
  'Lee la política y después investiga el código por tu cuenta, sin dar nada por cierto: decide tú qué revisar y hasta dónde llegar. Busca lo que confirme cada promesa, lo que la contradiga y lo que el sitio haga con los datos de quien lo visita sin que la política lo diga.',
  'Si no puedes abrir el repositorio o algún archivo, dímelo en vez de suponer lo que contiene.',
  'Al final, entrégame un resumen ejecutivo en español y en lenguaje simple, para alguien que no programa:',
  [
    '**Veredicto**: en una o dos frases, si el sitio cumple su política.',
    '**Qué se cumple**: una lista con cada promesa de la política, si se cumple, no se cumple o no pudiste comprobarlo, y en qué archivo lo viste.',
    '**Lo que la política no dice**: lo que encontraste en el código y ella no menciona. Si no hay nada, dilo.',
  ],
])

// Van en un <script> sin escapar (ver abajo): un «<» podría cerrarlo antes de
// tiempo. Si alguna vez aparece uno, el build se detiene aquí.
if ([POLITICA, INSPECCION].some((texto) => texto.includes('<')))
  throw new Error('Privacidad: los textos para copiar no pueden llevar «<»')

// Lo que `enLinea` separa del texto: la negrita, los enlaces y el RUT.
const PARTES = new RegExp(`(\\*\\*.+?\\*\\*|\\[.+?\\]\\(.+?\\)|${RUT.replaceAll('.', '\\.')})`)

/**
 * Pasa `**negrita**` y `[enlace](destino)` a sus etiquetas. El RUT va en una
 * `.sin-corte`, para que la línea no lo parta en el guion.
 */
function enLinea(texto) {
  return texto.split(PARTES).map((parte, indice) => {
    if (parte === RUT)
      return (
        <span key={indice} className="sin-corte">
          {parte}
        </span>
      )
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
 * Copia el `<script>` de id `texto` (copiar.js). Las tres etiquetas comparten
 * celda, así que el botón mide lo que la más larga y no cambia de ancho al
 * confirmar. `hecho` concuerda con lo que se copia: la política, las
 * instrucciones.
 */
function BotonCopiar({ variante, texto, hecho }) {
  return (
    <button type="button" className={`boton ${variante} copiar`} data-copiar={texto}>
      <span>Copiar prompt para tu IA</span>
      <span>{hecho}</span>
      <span>No se pudo copiar</span>
    </button>
  )
}

// Los <symbol> de los íconos y, antes, todos sus degradados (ver data/ias.js).
const ICONOS_IA =
  `<defs>${IAS.map(({ degradados = '' }) => degradados).join('')}</defs>` +
  IAS.map(({ id, trazos }) => `<symbol id="ia-${id}" viewBox="0 0 24 24">${trazos}</symbol>`).join('')

// Cuántas veces va la lista en cada mitad de la banda: lo justo para que una
// mitad cubra la tarjeta más ancha (XL), que es lo que hace el giro continuo.
const VUELTAS = 2

// Cada IA abre su chat en otra pestaña, para pegar ahí lo que se copió.
const IA = Object.fromEntries(IAS.map((ia) => [ia.id, ia]))
const EnlaceIa = ({ id, children = IA[id].nombre, ...resto }) => (
  <a href={IA[id].url} target="_blank" rel="noopener" {...resto}>
    {children}
  </a>
)

/**
 * La banda de las IA, a lo ancho de la tarjeta: cada una abre su chat. Lleva
 * dos mitades iguales y avanza una (Privacidad.css), así que el final empalma
 * con el principio. Solo la primera vuelta se lee y se recorre con el teclado;
 * las copias son para el giro y quedan para el mouse y el dedo. Los trazos van
 * una vez, en `<symbol>`, y cada ícono los usa con `<use>`.
 */
function BandaDeIas() {
  return (
    <div className="privacidad-ias">
      <svg width="0" height="0" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: ICONOS_IA }} />
      <div className="privacidad-ias-pista">
        {Array.from({ length: VUELTAS * 2 }, (_, vuelta) =>
          IAS.map(({ id, nombre }) => (
            <EnlaceIa
              key={`${vuelta}-${id}`}
              id={id}
              className="privacidad-ia"
              {...(vuelta > 0 && { 'aria-hidden': true, tabIndex: -1 })}
            >
              <svg aria-hidden="true" focusable="false">
                <use href={`#ia-${id}`} />
              </svg>
              {nombre}
            </EnlaceIa>
          ))
        )}
      </div>
    </div>
  )
}

/**
 * La invitación final, en la caída: la tarjeta oscura del cierre de /nosotros.
 * Lleva al código del sitio, para comprobar lo que dice la política, y copia
 * las instrucciones para que una IA lo revise. Entre el texto y los botones,
 * la banda de las IA en que se pueden pegar.
 */
function Cierre() {
  return (
    <section className="seccion zona-cielo cierre" aria-labelledby="cierre-titulo">
      <div className="contenedor">
        <div className="cierre-tarjeta zona-plano cierre-invitacion entra">
          <h2 id="cierre-titulo" className="titular">
            No nos tienes que creer
          </h2>
          <p className="entradilla">
            El código de este sitio es público. En GitHub puedes comprobar que
            no hay analítica ni seguimiento, y qué pasa con lo que nos envías.
            O copia las instrucciones y tu IA lo revisa por ti.
          </p>
          <BandaDeIas />
          <p className="cierre-acciones">
            <a className="boton boton-primario" href={REPOSITORIO} target="_blank" rel="noopener">
              Ver el código
            </a>
            <BotonCopiar variante="boton-secundario" texto="privacidad-inspeccion" hecho="¡Copiadas!" />
          </p>
          <script type="text/markdown" id="privacidad-inspeccion" dangerouslySetInnerHTML={{ __html: INSPECCION }} />
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
            <BotonCopiar variante="boton-primario" texto="privacidad-texto" hecho="¡Copiado!" />
            {/* Lo que el botón confirma a la vista, dicho para el lector de
                pantalla. Lo comparte con el del cierre. */}
            <p className="copiar-aviso solo-lectores" role="status" />
          </div>
        </div>
      </section>

      <section id="resumen" className="seccion zona-cielo" aria-labelledby="resumen-titulo">
        <div className="contenedor">
          <div className="privacidad-resumen zona-plano entra">
            
            <h2 id="resumen-titulo" className="titular">
              Te pedimos lo justo
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
          {ACTUALIZADO}
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
          <script type="text/markdown" id="privacidad-texto" dangerouslySetInnerHTML={{ __html: POLITICA }} />
        </div>
      </section>
    </Pagina>
  )
}
