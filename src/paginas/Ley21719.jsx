import Pagina from '../components/Pagina.jsx'
import Icono from '../components/Icono.jsx'
import { PAGINAS } from '../lib/meta.js'

/**
 * La Ley 21.719 en simple, para quien tiene un negocio: qué cambia, cuánto
 * arriesga y qué tiene que hacer. Se llega desde el servicio «Ley de datos».
 *
 * Se recorre de un vistazo, no se lee de corrido: cada sección es una pieza
 * visual con el texto justo. Los colores dicen algo. El antes va en gris y el
 * ahora sobre el celeste de la marca; las multas suben de tono con la
 * gravedad, en una sola escala, la del rojo de error; cada frente de tareas
 * lleva el suyo (la tinta para lo que se ordena, la acción para lo que se
 * construye, que es lo que hacemos nosotros, y el aviso para lo que se
 * previene), y la pyme va en el verde de éxito, porque ahí están las buenas
 * noticias.
 *
 * **Cada punto lleva su artículo** (§3: lo que no se puede comprobar, no se
 * dice). Son artículos de la Ley 19.628 tal como queda con la 21.719, porque
 * así está escrita la reforma: su artículo primero reescribe la 19.628. El
 * «antes» sale de la 19.628 que rige hasta el 30 de noviembre de 2026.
 *
 * Empieza y termina en el cielo, como la portada: arriba, el celeste de su
 * mañana; abajo, la caída con el pie de día (ver `cierre` en Pagina.jsx).
 */

const ACTUALIZADO = '3 de octubre de 2026'

const FUENTE = 'https://www.bcn.cl/leychile/navegar?idNorma=1209272'

const CIFRAS = [
  { valor: '1 dic 2026', texto: 'Empieza a regir' },
  { valor: '20.000 UTM', texto: 'Multa máxima por infracción' },
  { valor: '30 días', texto: 'Para responder a quien pide sus datos' },
]

const BASICO = [
  {
    icono: 'documento',
    titulo: 'Qué es',
    texto: 'La reforma de la Ley 19.628, de 1999: cambia sus reglas y crea una agencia que las hace cumplir.',
  },
  {
    icono: 'negocio',
    titulo: 'A quién aplica',
    texto:
      'A toda empresa u organización que use o guarde datos de personas: clientes, trabajadores o proveedores. También a las extranjeras que venden en Chile.',
    articulos: 'Arts. 1 y 1 bis',
  },
  {
    icono: 'persona',
    titulo: 'Qué es un dato personal',
    texto: 'Todo lo que identifica a alguien: su nombre, su RUT, su correo, su teléfono o lo que te compró.',
    articulos: 'Art. 2',
  },
]

const CAMBIOS = [
  {
    tema: 'Quién vigila',
    antes: 'Ningún organismo: había que reclamar ante un juzgado civil.',
    ahora: 'La Agencia de Protección de Datos Personales fiscaliza, resuelve reclamos y multa.',
    articulos: 'Arts. 30 y 30 bis',
  },
  {
    tema: 'Multas',
    antes: 'De 1 a 50 UTM.',
    ahora: 'Hasta 20.000 UTM por infracción.',
    articulos: 'Art. 35',
  },
  {
    tema: 'Consentimiento',
    antes: 'Por escrito, pero con muchas excepciones.',
    ahora: 'Libre, informado y por cada finalidad. La persona lo retira cuando quiere.',
    articulos: 'Art. 12',
  },
  {
    tema: 'Derechos',
    antes: 'Acceso, rectificación, cancelación y bloqueo.',
    ahora: 'Se suman la oposición, la portabilidad y no quedar sujeto a decisiones automáticas.',
    articulos: 'Arts. 4 a 9',
  },
  {
    tema: 'Datos sensibles',
    antes: 'Salud, origen, ideas políticas, religión y vida sexual.',
    ahora:
      'Se suman, entre otros, los biométricos, la situación socioeconómica, la orientación sexual y la identidad de género.',
    articulos: 'Art. 2',
  },
  {
    tema: 'Datos de fuentes públicas',
    antes: 'Muchos se podían usar sin autorización.',
    ahora: 'También se rigen por la ley.',
    articulos: 'Art. 2',
  },
  {
    tema: 'Filtraciones',
    antes: 'Ninguna obligación de avisar.',
    ahora: 'Se reportan a la Agencia y, si hay datos sensibles, de niños o financieros, a cada afectado.',
    articulos: 'Art. 14 sexies',
  },
  {
    tema: 'Datos fuera de Chile',
    antes: 'Sin reglas propias.',
    ahora: 'Solo a países con protección adecuada o con garantías.',
    articulos: 'Arts. 27 y 28',
  },
]

// Del techo de la ley de 1999 a los tres de la nueva. Cada barra mide su multa
// sobre la mayor: la de 1999 casi no se ve, y ese es el dato.
const MULTAS = [
  { nivel: 'Ley de 1999', tono: 'antes', utm: 50, ejemplo: 'El techo de la ley anterior.' },
  {
    nivel: 'Leve',
    tono: 'leve',
    utm: 5000,
    ejemplo: 'No publicar tu política de datos o responder tarde.',
    articulos: 'Art. 34 bis',
  },
  {
    nivel: 'Grave',
    tono: 'grave',
    utm: 10000,
    ejemplo: 'Usar datos sin base legal o descuidar su seguridad.',
    articulos: 'Art. 34 ter',
  },
  {
    nivel: 'Gravísima',
    tono: 'gravisima',
    utm: 20000,
    ejemplo: 'Tratar datos con fraude u ocultar una filtración.',
    articulos: 'Art. 34 quáter',
  },
]

const MULTA_MAXIMA = 20000

// Entre la cifra y el «%» va un espacio que no se parte (` `).
const NOTAS = [
  {
    texto:
      'Si reincides, la multa puede triplicarse, y una empresa grande que reincide puede pagar hasta el 4 % de sus ingresos anuales.',
    articulos: 'Arts. 35 y 36',
  },
  {
    texto:
      'Las sanciones quedan cinco años en un registro público, y la persona afectada puede demandar una indemnización.',
    articulos: 'Arts. 39 y 47',
  },
]

const FRENTES = [
  {
    id: 'ordena',
    icono: 'documento',
    nombre: 'Ordena',
    bajada: 'Papeles y decisiones.',
    tareas: [
      { titulo: 'Haz un inventario de tus datos', texto: 'Qué datos tienes, para qué, dónde y por cuánto tiempo.' },
      {
        titulo: 'Define la base legal de cada uso',
        texto: 'Consentimiento, contrato, ley o interés legítimo.',
        articulos: 'Arts. 12 y 13',
      },
      { titulo: 'Publica tu política de datos', texto: 'En tu web, con fecha y versión.', articulos: 'Art. 14 ter' },
      {
        titulo: 'Firma contratos con tus proveedores',
        texto: 'Con quien trata datos por ti: hosting, correo, contador.',
        articulos: 'Art. 15 bis',
      },
      {
        titulo: 'Revisa qué datos salen de Chile',
        texto: 'Y que el destino tenga protección adecuada o garantías.',
        articulos: 'Arts. 27 y 28',
      },
    ],
  },
  {
    id: 'construye',
    icono: 'datos',
    nombre: 'Construye',
    bajada: 'Tus sistemas.',
    nota: 'Lo hacemos nosotros',
    tareas: [
      {
        titulo: 'Consentimiento claro',
        texto: 'Casillas sin marcar, una por finalidad, y fáciles de retirar.',
        articulos: 'Art. 12',
      },
      {
        titulo: 'Un canal para los derechos',
        texto: 'Un correo o un formulario, con respuesta en 30 días.',
        articulos: 'Arts. 10 y 11',
      },
      {
        titulo: 'Solo lo necesario',
        texto: 'Pedir lo justo y borrar cada dato cuando vence su plazo.',
        articulos: 'Arts. 3 y 14 quáter',
      },
      {
        titulo: 'Datos protegidos',
        texto: 'Cifrado, accesos por rol y respaldos que se puedan restaurar.',
        articulos: 'Art. 14 quinquies',
      },
    ],
  },
  {
    id: 'preven',
    icono: 'alerta',
    nombre: 'Prevén',
    bajada: 'Lo que puede salir mal.',
    tareas: [
      {
        titulo: 'Un plan para filtraciones',
        texto: 'Quién detecta, quién avisa y un registro de cada caso.',
        articulos: 'Art. 14 sexies',
      },
      {
        titulo: 'Evaluación de impacto',
        texto: 'Antes de perfilar personas, vigilar espacios públicos o tratar datos a gran escala.',
        articulos: 'Art. 15 ter',
      },
      {
        titulo: 'Modelo de prevención',
        texto: 'Opcional. Si la Agencia lo certifica, cuenta como atenuante.',
        articulos: 'Arts. 36 y 49 a 51',
      },
    ],
  },
]

const PYME = [
  { texto: 'Lo que se te exige se ajusta a tu tamaño y a los datos que tratas.', articulos: 'Art. 14 septies' },
  {
    texto: 'Hasta noviembre de 2027, la Agencia puede amonestarte por escrito en vez de multarte.',
    articulos: 'Art. sexto transitorio',
  },
  { texto: 'Puedes asumir tú las tareas de delegado de protección de datos.', articulos: 'Art. 50' },
]

/** El artículo que respalda un punto, para buscarlo en el texto de la ley. */
function Articulo({ children }) {
  return children ? <span className="ley-articulo">{children}</span> : null
}

/**
 * La invitación final. Va en la caída, como el contacto de la portada: sobre
 * su degradado y con el pie de día debajo.
 */
function Cierre() {
  return (
    <section className="seccion zona-cielo cierre" aria-labelledby="cierre-titulo">
      <div className="contenedor">
        <div className="cierre-tarjeta">
          <p className="antetitulo">Cómo te ayudamos</p>
          <h2 id="cierre-titulo">¿Tu web o tu app tratan datos personales?</h2>
          <p className="ley-bajada">
            Hacemos la parte técnica: formularios con consentimiento, un canal para los derechos, borrado a tiempo y
            datos protegidos. Lo legal, mejor con tu abogado.
          </p>
          <p className="ley-acciones">
            <a className="boton boton-primario" href="/#contacto">
              Cuéntanos tu proyecto
            </a>
            <a className="boton boton-secundario" href="/privacidad">
              Ver nuestra política
            </a>
          </p>
          <p className="ley-nota">
            Resumen informativo, no asesoría legal: manda el{' '}
            <a href={FUENTE} rel="noopener">
              texto oficial de la Ley 21.719
            </a>{' '}
            y lo que dicte la Agencia. Los artículos son los de la Ley 19.628 tal como queda con la reforma.
            Actualizado el {ACTUALIZADO}.
          </p>
        </div>
      </div>
    </section>
  )
}

export default function Ley21719() {
  // La entradilla es la meta description, como en /nosotros: un resumen,
  // escrito una vez.
  const { descripcion } = PAGINAS['/ley21719']

  return (
    <Pagina hora="dia" cierre={<Cierre />}>
      <section className="seccion zona-cielo hora-dia cabecera-cielo ley-portada">
        <div className="contenedor">
          <p className="antetitulo">Protección de datos</p>
          <h1>La Ley 21.719, en simple</h1>
          <p className="entradilla ley-entradilla">{descripcion}</p>
          <ul className="ley-cifras">
            {CIFRAS.map(({ valor, texto }) => (
              <li key={valor}>
                <span className="ley-cifra dato">{valor}</span>
                {texto}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="seccion zona-cielo" aria-labelledby="basico-titulo">
        <div className="contenedor">
          <h2 id="basico-titulo">Lo básico</h2>
          <ul className="ley-basico">
            {BASICO.map(({ icono, titulo, texto, articulos }) => (
              <li key={titulo} className="entra">
                <Icono id={icono} className="ley-icono" />
                <h3>{titulo}</h3>
                <p>
                  {texto} <Articulo>{articulos}</Articulo>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="seccion zona-cielo" aria-labelledby="cambios-titulo">
        <div className="contenedor">
          <h2 id="cambios-titulo">Qué cambia</h2>
          <p className="ley-bajada">La ley de 1999 al lado de la nueva, punto por punto.</p>
          <ul className="ley-cambios">
            {CAMBIOS.map(({ tema, antes, ahora, articulos }) => (
              <li key={tema} className="ley-cambio entra">
                <h3>{tema}</h3>
                <p className="ley-antes">
                  <span className="ley-etiqueta">Antes</span> {antes}
                </p>
                <p className="ley-ahora">
                  <span className="ley-etiqueta">Ahora</span> {ahora} <Articulo>{articulos}</Articulo>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="seccion zona-cielo" aria-labelledby="multas-titulo">
        <div className="contenedor">
          <h2 id="multas-titulo">Cuánto arriesgas</h2>
          <p className="ley-bajada">La multa máxima de cada tipo de infracción, al lado de la que había.</p>
          <ul className="ley-multas">
            {MULTAS.map(({ nivel, tono, utm, ejemplo, articulos }) => (
              <li key={nivel} className={`ley-multa ley-multa-${tono}`} style={{ '--valor': utm / MULTA_MAXIMA }}>
                <span className="ley-multa-nivel">{nivel}</span>
                <span className="ley-multa-pista">
                  <span className="ley-multa-barra" />
                  <span className="ley-multa-valor dato">{utm.toLocaleString('es-CL')} UTM</span>
                </span>
                <span className="ley-multa-ejemplo">
                  {ejemplo} <Articulo>{articulos}</Articulo>
                </span>
              </li>
            ))}
          </ul>
          <ul className="ley-notas">
            {NOTAS.map(({ texto, articulos }) => (
              <li key={texto}>
                {texto} <Articulo>{articulos}</Articulo>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="seccion zona-cielo" aria-labelledby="tareas-titulo">
        <div className="contenedor">
          <h2 id="tareas-titulo">Qué tiene que hacer tu negocio</h2>
          <p className="ley-bajada">Doce tareas, en tres frentes.</p>
          <div className="ley-frentes">
            {FRENTES.map(({ id, icono, nombre, bajada, nota, tareas }, indice) => (
              <div key={id} className={`ley-frente ley-frente-${id} entra`}>
                <h3>
                  <Icono id={icono} className="ley-icono" />
                  {nombre}
                </h3>
                <p className="ley-frente-bajada">{bajada}</p>
                {nota && <p className="ley-frente-nota">{nota}</p>}
                {/* La numeración sigue de un frente al otro: son doce tareas,
                    no tres listas que empiezan en uno. */}
                <ol
                  className="ley-tareas"
                  start={FRENTES.slice(0, indice).reduce((n, frente) => n + frente.tareas.length, 1)}
                >
                  {tareas.map(({ titulo, texto, articulos }) => (
                    <li key={titulo}>
                      <strong>{titulo}.</strong> {texto} <Articulo>{articulos}</Articulo>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="seccion zona-cielo" aria-labelledby="pyme-titulo">
        <div className="contenedor">
          <div className="ley-pyme entra">
            <div>
              <Icono id="negocio" className="ley-icono" />
              <h2 id="pyme-titulo">¿Tu empresa es pyme?</h2>
              <p className="ley-bajada">Micro, pequeña o mediana: hasta 100.000 UF de ventas al año.</p>
            </div>
            <div>
              <ul className="ley-pyme-lista">
                {PYME.map(({ texto, articulos }) => (
                  <li key={texto}>
                    {texto} <Articulo>{articulos}</Articulo>
                  </li>
                ))}
              </ul>
              <p className="ley-pyme-cierre">
                Ser pyme no te exime: cambia cuánto se te exige, no si tienes que cumplir.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Pagina>
  )
}
