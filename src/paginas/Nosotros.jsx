import Pagina from '../components/Pagina.jsx'
import { Escena } from '../components/Portada.jsx'
import { VOLUTA } from '../components/Marca.jsx'

/**
 * Quiénes somos. Hace el recorrido de la portada: abre bajo la misma nube, en
 * el mismo cielo (`Escena`), baja por el blanco y termina en la caída, con el
 * cierre y el pie de día (ver `cierre` en Pagina.jsx). Aquí la nube no es solo
 * el fondo: es el tema, porque Volutus es su nombre.
 *
 * Todo lo que dice se puede comprobar (DESIGN-BRIEF §3). Lo que viene de
 * afuera —la definición de la nube y los datos de la Morning Glory— lleva su
 * cita, que apunta a la lista de fuentes; la construcción del símbolo está en
 * el código de la marca (`lib/espiral.js`), y la obra, en la portada con sus
 * enlaces. No hay fecha de fundación ni anécdota, porque no hay de dónde
 * sacarlas.
 */

const ATLAS = {
  id: 'atlas',
  autor: 'Organización Meteorológica Mundial',
  titulo: 'Volutus',
  medio: 'Atlas Internacional de Nubes, edición de 2017',
  url: 'https://cloudatlas.wmo.int/es/clouds-species-volutus.html',
}

// La foto de la sección es de este artículo, y su crédito también.
const XCMAG = {
  id: 'xcmag',
  autor: 'Ed Ewing',
  titulo: 'Sky Tsunami: Flying Australia’s Morning Glory',
  idioma: 'en',
  medio: 'Cross Country Magazine n.º 126, 2009. En línea desde el 6 de septiembre de 2024',
  url: 'https://xcmag.com/magazine-articles/adventure-and-inspiration/sky-tsunami-flying-the-morning-glory/',
}

// En el orden en que se citan: el número de cada una sale de aquí.
const FUENTES = [ATLAS, XCMAG]

// Los socios (decisión 16 del brief). Las fotos son provisorias, y cada
// descripción dice solo lo que se puede comprobar en la portada.
const SOCIOS = [
  {
    nombre: 'Diego Peña y Lillo Luhrs',
    rol: 'Socio',
    foto: '/image/Diego.jpeg',
    descripcion:
      'Me interesa entender las cosas, no solo usarlas. Esa necesidad me llevó a la programación, a la inteligencia artificial y a la filosofía, porque saber cómo funciona algo no sirve de mucho si no te preguntas para qué existe. La misma curiosidad me acompaña en los autos, que terminaron convirtiéndose en CarFlip, y en las plantas. Resuelvo problemas sin apuro por la primera respuesta: los desarmo, pruebo y ajusto hasta que la solución tiene sentido. Hoy construyo Volutus SpA junto a mi socio Rodrigo, con la idea de hacer tecnología que resuelva problemas de fondo.',
  },
  {
    nombre: 'Rodrigo Martínez Becker',
    rol: 'Socio',
    foto: '/image/Rodrigo.jpeg',
    descripcion:
      'Ganó el primer lugar en el Cisco CyberGames Americas 2026, un desafío de ciberseguridad de tres horas, frente a más de 1.000 estudiantes de 21 países.',
  },
]

// Los números de la Morning Glory, todos del artículo de Cross Country.
const CIFRAS = [
  { valor: '1.000 km', texto: 'De largo, como máximo.' },
  { valor: '80 km/h', texto: 'La velocidad a la que puede avanzar.' },
  { valor: '68 km', texto: 'Voló Jonny Durand junto a ella en ala delta, en 1\u00a0h\u00a045\u00a0min, en 2009.' },
]

// Las tres piezas de la marca que salen de la nube.
const MARCA = [
  {
    titulo: 'El símbolo',
    texto: 'Una sola línea que entra recta y se enrolla en cuatro cuartos de circunferencia, con radios 8, 5, 3 y 2: la serie de Fibonacci.',
  },
  { titulo: 'La palabra', texto: 'La ola nace en la S de VOLUTUS y rompe en voluta.' },
  { titulo: 'Esta página', texto: 'Empieza en la nube y termina en el mar.' },
]

// Las respuestas del equipo en «Volutus entra a una sala» (DESIGN-BRIEF A.1),
// dichas en plural. La última es la regla de §3, que rige toda la página.
const RASGOS = [
  {
    titulo: 'Al mismo nivel',
    texto: 'Conversamos de cerca y sin jerga. Aterrizamos las ideas hasta que entiendas lo mismo que nosotros.',
  },
  { titulo: 'Opinamos, pero escuchamos', texto: 'Damos nuestra opinión cuando nos la piden, sin cerrarnos a la tuya.' },
  { titulo: 'Sin ruido', texto: 'No buscamos llamar la atención, pero tampoco pasar desapercibidos.' },
  {
    titulo: 'Todo se puede comprobar',
    texto: 'Lo que decimos va con su enlace, su número o su código, como las fuentes de esta página. Lo que no se puede comprobar, no lo decimos.',
  },
]

/** La llamada a una fuente: su número, que lleva a la lista de fuentes. */
function Cita({ fuente }) {
  const numero = FUENTES.indexOf(fuente) + 1
  return (
    <sup className="cita">
      <a href={`#fuente-${fuente.id}`} aria-label={`Fuente ${numero}`}>
        {numero}
      </a>
    </sup>
  )
}

/**
 * El símbolo con su construcción a la vista: cada cuarto de vuelta en su
 * cuadrado, con el radio que le toca. Son los números que `espiralFibonacci`
 * calcula para la marca, no un dibujo aparte: si la marca cambia, cambia esto.
 *
 * El cuadrado de cada arco tiene una esquina en el centro y dos en los extremos
 * del arco; la cuarta es la suma de los extremos menos el centro.
 */
function Construccion() {
  const tramos = VOLUTA.arcos.map(({ centro, serie }, k) => {
    const [inicio, fin] = VOLUTA.puntos.slice(k + 1, k + 3)
    const opuesta = [inicio[0] + fin[0] - centro[0], inicio[1] + fin[1] - centro[1]]
    const esquinas = [centro, inicio, opuesta, fin]
    const medio = [(centro[0] + opuesta[0]) / 2, (centro[1] + opuesta[1]) / 2]
    return { serie, puntos: esquinas.map((p) => p.join(',')).join(' '), medio }
  })

  return (
    <svg className="construccion" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      {tramos.map(({ serie, puntos, medio }) => (
        <g key={serie}>
          <polygon className="construccion-cuadrado" points={puntos} vectorEffect="non-scaling-stroke" />
          <text className="construccion-radio" x={medio[0]} y={medio[1]}>
            {serie}
          </text>
        </g>
      ))}
      {/* Sin `non-scaling-stroke`: con él, el navegador mide el guion en
          píxeles de pantalla, ignora `pathLength` y el trazo sale a tramos. */}
      <path className="construccion-voluta" d={VOLUTA.d} pathLength="1" />
    </svg>
  )
}

/**
 * El cierre, en la caída: el plano de la marca, con la construcción del
 * símbolo sobre su cuadrícula.
 */
function Cierre() {
  return (
    <section id="marca" className="seccion zona-cielo cierre" aria-labelledby="marca-titulo">
      <div className="contenedor">
        <div className="plano zona-plano entra">
          <div>
            <p className="antetitulo">La marca</p>
            <h2 id="marca-titulo" className="titular titular-menor">
              Una sola línea
            </h2>
            <ul className="plano-piezas">
              {MARCA.map(({ titulo, texto }) => (
                <li key={titulo}>
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </li>
              ))}
            </ul>
          </div>
          <Construccion />
        </div>
      </div>
    </section>
  )
}

export default function Nosotros() {
  return (
    <Pagina ruta="/nosotros" className="nosotros" hora="dia" cierre={<Cierre />}>
      {/* Los socios van en la escena, bajo el titular: el mismo cielo los
          lleva hasta el blanco de la sección siguiente, sin corte. */}
      <Escena perspectiva="costado">
        <h1>Quiénes somos</h1>

        <p className="entradilla portada-entradilla">
          Hacemos software en Chile: páginas web, tiendas online, apps, agentes de IA y automatizaciones. Antes
          de hacerlo para otros, lo hicimos para nosotros.
        </p>

        {/* Una tarjeta horizontal por socio, con la foto en lados alternos. */}
        <ul className="socios">
          {SOCIOS.map(({ nombre, rol, foto, descripcion }) => (
            <li key={nombre} className="socio entra">
              <img src={foto} alt="" width={800} height={1000} loading="lazy" decoding="async" />
              <div className="socio-nombre">
                <h2>{nombre}</h2>
                <p>{rol}</p>
              </div>
              <p className="socio-descripcion">{descripcion}</p>
            </li>
          ))}
        </ul>
      </Escena>

      <section id="como-trabajamos" className="seccion zona-cielo" aria-labelledby="como-titulo">
        <div className="contenedor">
          <h2 id="como-titulo" className="titular nosotros-como-titulo entra">
            Cómo trabajamos
          </h2>
          <ol className="numerada">
            {RASGOS.map(({ titulo, texto }) => (
              <li key={titulo} className="entra">
                <div>
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* La palabra, como en un diccionario: la nube y la empresa son sus dos
          acepciones. La nube más conocida viene después, con su foto. */}
      <section id="nombre" className="seccion zona-cielo" aria-labelledby="nombre-titulo">
        <div className="contenedor">
          <p className="antetitulo entra">De dónde viene el nombre</p>
          <h2 id="nombre-titulo" className="titular entra">
            <dfn>Volutus</dfn>
          </h2>
          <p className="nosotros-etimologia entra">
            <span className="dato">vo·lu·tus</span> Del latín, «enrollado».
          </p>

          <ol className="numerada">
            <li className="entra">
              <div>
                <p className="antetitulo">Meteorología</p>
                <blockquote className="nosotros-definicion" cite={ATLAS.url}>
                  <p>
                    «Masa de nubes larga, habitualmente baja, horizontal, aislada y con forma de tubo que con
                    frecuencia parece girar lentamente sobre un eje horizontal.»
                    <Cita fuente={ATLAS} />
                  </p>
                </blockquote>
                <p>
                  Así la define el Atlas Internacional de Nubes de la Organización Meteorológica Mundial, en su
                  edición de 2017.
                </p>
              </div>
            </li>
            <li className="entra">
              <div>
                <p className="antetitulo">Empresa</p>
                <p className="nosotros-definicion">
                  Desarrollo de software en Chile. Su marca es esa nube, dibujada con una sola línea que se
                  enrolla sobre sí misma.
                </p>
              </div>
            </li>
          </ol>

          <div className="nosotros-morning">
            <h3 className="titular titular-menor entra" lang="en">
             The Morning Glory
            </h3>

            {/* En S se recorta hacia el ala delta y el frente de la nube
                (Nosotros.css): de ahí el `sizes` mayor que el ancho. */}
            <figure className="nosotros-foto entra">
              <img
                src="/image/morning-glory-1280.webp"
                srcSet="/image/morning-glory-768.webp 768w, /image/morning-glory-1280.webp 1280w, /image/morning-glory-1920.webp 1920w"
                sizes="(min-width: 1200px) 1152px, (min-width: 640px) calc(100vw - 48px), calc((100vw - 48px) * 1.5)"
                width={1920}
                height={968}
                alt="Un ala delta vuela junto al frente de la Morning Glory, un rollo de nube blanca que se pierde en el horizonte."
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                Un ala delta junto a la Morning Glory, en el norte de Australia. Foto: Mark Watson / Red Bull
                Content Pool.
                <Cita fuente={XCMAG} />
              </figcaption>
            </figure>

            <ul className="cifras">
              {CIFRAS.map(({ valor, texto }) => (
                <li key={valor} className="entra">
                  <span className="cifra dato">{valor}</span>
                  {texto}
                  <Cita fuente={XCMAG} />
                </li>
              ))}
            </ul>

            <div className="nosotros-relato">
              <p className="entra">
                En ciertas condiciones, de julio a noviembre, se forma sobre el golfo de Carpentaria y rueda por
                el cielo del norte de Queensland. De noche, el aire que baja de la península del Cabo York pasa
                bajo una capa de aire más tibio y levanta una onda que cruza el golfo: en su frente el aire sube
                y forma la nube, que por detrás se evapora. Dura hasta que el calor del día deshace esa capa.
                <Cita fuente={XCMAG} />
              </p>
              <p className="entra">
                Los pilotos de ala delta y de planeador la vuelan como a una ola, y hay quienes la esperan
                semanas sin llegar a volarla. En parapente no se puede: no es lo bastante rápido y caería en el
                remolino que la nube deja detrás.
                <Cita fuente={XCMAG} />
              </p>
            </div>

            <div className="fuentes entra">
              <h3 className="antetitulo">Fuentes</h3>
              <ol>
                {FUENTES.map(({ id, autor, titulo, idioma, medio, url }) => (
                  <li key={id} id={`fuente-${id}`}>
                    {autor}.{' '}
                    <a href={url} rel="noopener">
                      <cite lang={idioma}>{titulo}</cite>
                    </a>
                    . {medio}.
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </Pagina>
  )
}
