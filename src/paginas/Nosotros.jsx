import Pagina from '../components/Pagina.jsx'
import { Escena } from '../components/Portada.jsx'
import { OLA, trazoDe } from '../lib/logotipo.js'

/**
 * Quiénes somos. Hace el recorrido de la portada: abre bajo la misma nube, en
 * el mismo cielo (`Escena`), baja por el blanco y termina en la caída, con el
 * cierre y el pie de día (ver `cierre` en Pagina.jsx). Aquí la nube no es solo
 * el fondo: es el tema, porque Volutus es su nombre.
 *
 * Todo lo que dice se puede comprobar (DESIGN-BRIEF §3). Lo que viene de
 * afuera —la definición de la nube y los datos de la Morning Glory— lleva su
 * cita, que apunta a la lista de fuentes; la ola está en el código de la
 * marca (`lib/logotipo.js`), y la obra, en la portada con sus
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

// La raíz del nombre: el verbo latino y el rollo que salió de él.
const VOLVO = {
  id: 'volvo',
  autor: 'Charlton T. Lewis y Charles Short',
  titulo: 'volvo',
  medio: 'A Latin Dictionary, 1879. En línea en Perseus Digital Library, Universidad de Tufts',
  url: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.04.0059:entry=volvo',
}

const VOLUMEN = {
  id: 'volumen',
  autor: 'Charlton T. Lewis y Charles Short',
  titulo: 'volumen',
  medio: 'A Latin Dictionary, 1879. En línea en Perseus Digital Library, Universidad de Tufts',
  url: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.04.0059:entry=volumen',
}

const ALEJANDRIA = {
  id: 'alejandria',
  autor: 'Wikipedia',
  titulo: 'Biblioteca de Alejandría',
  medio: 'Wikipedia en español',
  url: 'https://es.wikipedia.org/wiki/Biblioteca_de_Alejandr%C3%ADa',
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
const FUENTES = [VOLVO, VOLUMEN, ALEJANDRIA, ATLAS, XCMAG]

// Las redes que enlaza cada socio, con su logo: la marca de cada una, en un
// solo color, y no un ícono de trazo de Icono.jsx. Al pasar el cursor, el logo
// toma el color de su marca.
const REDES = [
  {
    id: 'github',
    nombre: 'GitHub',
    color: '#8250df',
    logo: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  },
  {
    id: 'linkedin',
    nombre: 'LinkedIn',
    color: '#0a66c2',
    logo: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 4.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
]

// Los socios (decisiones 16 y 34 del brief). Las fotos son provisorias, y
// cada descripción dice solo lo que se puede comprobar en la portada.
// `fotoSrcSet` suma una versión más liviana cuando la foto tiene píxeles de
// sobra para el teléfono; la de Rodrigo no los tiene, y va sola.
const SOCIOS = [
  {
    nombre: 'Diego',
    apellidos: 'Peña y Lillo Luhrs',
    educacion: 'Ingeniero Informático con Especialidad en Inteligencia Artificial - DuocUC',
    rol: 'Socio co-fundador',
    foto: '/image/Diego.jpeg',
    fotoSrcSet: '/image/Diego-720.webp 720w, /image/Diego.jpeg 960w',
    perfiles: {
      github: 'https://github.com/DiegoPyLL',
      linkedin: 'https://www.linkedin.com/in/diegopyll/',
    },
    descripcion:
      'Me interesa entender las cosas, no solo usarlas. Esa necesidad me llevó a la programación, a la inteligencia artificial y a la filosofía, porque saber cómo funciona algo no sirve de mucho si no te preguntas para qué existe. La misma curiosidad me acompaña en los autos, que terminaron convirtiéndose en CarFlip, y otros retos personales. Resuelvo problemas sin apuro por la primera respuesta: los desarmo, pruebo y ajusto hasta que la solución tiene sentido. Hoy construyo Volutus junto a Rodrigo, con la idea de hacer soluciones que resuelvan problemas de fondo.',
  },
  {
    nombre: 'Rodrigo',
    apellidos: 'Martínez Becker',
    educacion: 'Ingeniero Informático con Especialidad en Inteligencia Artificial - DuocUC',
    rol: 'Socio co-fundador',
    foto: '/image/Rodrigo.jpeg',
    perfiles: {
      github: 'https://github.com/Marbeck-one',
      linkedin: 'https://www.linkedin.com/in/rodrigo-mart%C3%ADnez-becker-74b6ab241/',
    },
    descripcion:
      'Hoy el conocimiento llega al instante y casi cualquier solución está a un par de prompts. Yo prefiero no apurarme y disfrutar lo que nos hace humanos: el proceso. Si tenemos a mano toda la inteligencia reunida, lo mínimo es sacar de ella buenas ideas. Por eso quiero que cada producto que hago se note hecho a mano y no en serie. Si el camino A es el más rápido y rentable, y el B el que nos deja más lejos, tomo el B. Con esa paciencia gané el primer lugar en Cisco CyberGames Americas 2026, y hoy construyo Volutus junto a mi socio Diego.',
  },
]

// Los números de la Morning Glory, todos del artículo de Cross Country.
const CIFRAS = [
  { valor: '1.000 km', texto: 'De largo, como máximo.' },
  { valor: '80 km/h', texto: 'La velocidad a la que puede avanzar.' },
  { valor: '68 km', texto: 'Voló Jonny Durand junto a ella en ala delta, en 1\u00a0h\u00a045\u00a0min, en 2009.' },
]

// Las tres piezas de la marca que salen de la nube. La última se comprueba en
// la misma página: la nube y el mar los pinta la misma trama (nubes.js).
const MARCA = [
  { titulo: 'El símbolo', texto: '¿Qué más sencillo que una línea?' },
  { titulo: 'La palabra', texto: 'En latín, volutus es «enrollado»: la ola nace en la S y se enrolla en voluta.' },
  { titulo: 'Esta página', texto: 'La nube y el mar están hechos de los mismos puntos.' },
]

// Lo que la nube es para nosotros. Cada rasgo sale de una palabra de su
// definición, tal como la escribe el Atlas: primero lo que dice de la nube y
// después lo que dice de nosotros, con la marca del brief (A.1, A.3 y A.6).
const RASGOS = [
  {
    titulo: 'Única',
    nube: 'Va sola, separada de las demás nubes.',
    nosotros: 'Queremos lo mismo para lo que hacemos: identidad propia, que se reconozca sin ver la firma.',
  },
  {
    titulo: 'Simple',
    nube: 'Es una sola forma, de punta a punta.',
    nosotros:
      'Como nuestra marca, que es una sola ola. Antes de agregar algo, buscamos la forma más simple de resolver el problema.',
  },
  {
    titulo: 'Imponente',
    nube: 'La Morning Glory llega a medir 1.000 km y cruza el cielo sin hacer ruido.',
    fuente: XCMAG,
    nosotros: 'No buscamos llamar la atención, pero tampoco pasar desapercibidos.',
  },
  {
    titulo: 'Al mismo nivel',
    nube: 'Es una nube baja, que se extiende a lo ancho y no hacia arriba.',
    nosotros: 'Así conversamos: de cerca y sin jerga, hasta que entiendas lo mismo que nosotros.',
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

// La ola en su rejilla de 64 (lib/logotipo.js), centrada y con aire para la
// punta redonda del trazo.
const CAJA_DE_LA_OLA = '4 4 56 56'

/**
 * La ola del logotipo, sola y en grande, en blanco sobre el plano. Al asomar
 * se traza en el lienzo, con una estela de color (ola.js); el SVG es la ola
 * quieta.
 */
function Ola() {
  return (
    <div className="ola">
      <canvas aria-hidden="true" />
      <svg viewBox={CAJA_DE_LA_OLA} aria-hidden="true" focusable="false">
        <path d={trazoDe(OLA)} strokeWidth={OLA.grosor} />
      </svg>
    </div>
  )
}

/**
 * El cierre, en la caída: el plano de la marca, con la ola sobre su
 * cuadrícula.
 */
function Cierre() {
  return (
    <section id="marca" className="seccion zona-cielo cierre" aria-labelledby="marca-titulo">
      <div className="contenedor">
        <div className="plano zona-plano entra">
          <div>
            <p className="antetitulo">La marca</p>
            <h2 id="marca-titulo" className="titular">
              Tres líneas
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
          <Ola />
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

        {/* Una tarjeta por socio, con la foto encima y en lados alternos,
            como el formulario de contacto sobre su tarjeta. */}
        <ul className="socios">
          {/* `sizes` es el ancho al que se pinta la foto, no el de su hueco:
              con `object-fit: cover` se agranda hasta llenarlo, y en la
              tarjeta angosta y alta desde 640 px llega a unos 580 px. */}
          {SOCIOS.map(({ nombre, apellidos, educacion, rol, foto, fotoSrcSet, perfiles, descripcion }) => (
            <li key={nombre} className="socio entra">
              <img
                src={foto}
                srcSet={fotoSrcSet}
                sizes={fotoSrcSet && '(max-width: 639px) calc(100vw - 72px), 580px'}
                alt=""
                width={800}
                height={1000}
                loading="lazy"
                decoding="async"
              />
              <div className="socio-cuerpo">
                <div className="socio-nombre">
                  <h2>
                    {nombre} <span className="apellidos">{apellidos}</span>
                  </h2>
                  <ul className="socio-perfiles">
                    {REDES.map((red) => (
                      <li key={red.id}>
                        <a href={perfiles[red.id]} rel="noopener" style={{ '--color-red': red.color }}>
                          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d={red.logo} />
                          </svg>
                          <span className="solo-lectores">
                            {red.nombre} de {nombre} {apellidos}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="socio-educacion">{educacion}</p>
                <p className="socio-rol">{rol}</p>
                <p className="socio-descripcion">{descripcion}</p>
              </div>
            </li>
          ))}
        </ul>
      </Escena>

      {/* Primero lo que es la nube: su definición, como en un diccionario, y
          la más conocida, con su foto. Después, lo que es para nosotros. */}
      <section id="nombre" className="seccion zona-cielo" aria-labelledby="nombre-titulo">
        <div className="contenedor">
          <h2 id="nombre-titulo" className="titular entra">
            ¿De dónde viene <dfn>Volutus</dfn>?
          </h2>
          <p className="nosotros-etimologia entra">
            <span className="dato">vo·lu·tus</span> Del latín, «enrollado»: de <i lang="la">volvere</i>, «dar
            vuelta».
            <Cita fuente={VOLVO} />
          </p>

          {/* Por qué el nombre: lo que hace el verbo y lo que salió de él. */}
          <div className="nosotros-porque entra">
            <p>Eso queremos hacer con la forma en que hoy se hace software: darla vuelta.</p>
            <p>
              Del mismo verbo viene <i lang="la">volumen</i>, el rollo de papiro
              <Cita fuente={VOLUMEN} /> en que la Biblioteca de Alejandría guardaba el saber de su época.
              <Cita fuente={ALEJANDRIA} /> Ese conocimiento lleva siglos reunido, y hoy está a un prompt de
              distancia. Lo que falta no es información: es saber usarla.
            </p>
            <p>
              Mientras otros se apuran por llegar, nosotros cuidamos el camino. No para entregar más tarde, sino
              para no saltarnos los pasos que hacen que algo funcione.
            </p>
          </div>

          <figure className="nosotros-definicion entra">
            <blockquote cite={ATLAS.url}>
              <p>
                «Masa de nubes larga, habitualmente baja, horizontal, aislada y con forma de tubo que con frecuencia
                parece girar lentamente sobre un eje horizontal.»
                <Cita fuente={ATLAS} />
              </p>
            </blockquote>
            <figcaption>
              Así la define el Atlas Internacional de Nubes de la Organización Meteorológica Mundial, en su edición
              de 2017.
            </figcaption>
          </figure>

          <div className="nosotros-bloque">
            <h3 className="subtitulo entra" lang="en">
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

            <p className="nosotros-relato entra">
              En ciertas condiciones, de julio a noviembre, se forma sobre el golfo de Carpentaria y rueda por el
              cielo del norte de Queensland. De noche, el aire que baja de la península del Cabo York pasa bajo
              una capa de aire más tibio y levanta una onda que cruza el golfo: en su frente el aire sube y forma
              la nube, que por detrás se evapora. Dura hasta que el calor del día deshace esa capa.
              <Cita fuente={XCMAG} />
            </p>
          </div>

          <div className="nosotros-bloque">
            <h3 className="subtitulo entra">Para nosotros</h3>
            <p className="entradilla entra">Cuatro palabras de su definición dicen lo que queremos ser.</p>

            <ol className="numerada">
              {RASGOS.map(({ titulo, nube, fuente, nosotros }) => (
                <li key={titulo} className="entra">
                  <div>
                    <h4>{titulo}</h4>
                    <p>
                      {nube}
                      {fuente && <Cita fuente={fuente} />} {nosotros}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
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
      </section>
    </Pagina>
  )
}
