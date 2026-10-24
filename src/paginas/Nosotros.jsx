import Celdas from '../components/Celdas.jsx'
import Pagina from '../components/Pagina.jsx'
import { SOCIOS } from '../data/socios.js'
import { ABAJO, ARRIBA, CAE, HERIDO } from '../lib/pato.js'
import { OLA, trazoDe } from '../lib/logotipo.js'

/**
 * Quiénes somos. Abre en la costa, de día, en una escena fija detrás del
 * titular y de las tarjetas de los socios, que pasan por delante mientras el
 * sol baja hasta ponerse en el mar, como en Chile (`data-vista="atardecer"`,
 * ver lib/atardecer.js). Apenas se deja el último socio, lejos, sobre el
 * horizonte, cruza una parvada que se puede cazar con el cursor o el dedo
 * (`Parvada`), y la escena queda sola. El sol se pone hasta la mitad y la
 * escena se recorta en una lámina que queda sobre el título de la sección
 * siguiente y se va con el texto, con el sol quieto y la parvada adentro. Después baja por el
 * blanco y termina en la caída, con el cierre y el pie de día (ver `cierre`
 * en Pagina.jsx). La nube es el tema del resto de la página, porque Volutus
 * es su nombre.
 *
 * Todo lo que dice se puede comprobar (DESIGN-BRIEF §3). Lo que viene de
 * afuera —la definición de la nube y los datos de la Morning Glory— lleva su
 * cita, que apunta a la lista de fuentes; la ola está en el código de la
 * marca (`lib/logotipo.js`), y la obra, en la portada con sus
 * enlaces. No hay anécdota de la fundación, porque no hay de dónde sacarla, y
 * la fecha de constitución va solo en el grafo (`lib/contacto.js`).
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

// Los números de la Morning Glory, todos del artículo de Cross Country.
const CIFRAS = [
  { valor: '1.000 km', texto: 'De largo, como máximo.' },
  { valor: '80 km/h', texto: 'La velocidad a la que puede avanzar.' },
  { valor: '68 km', texto: 'Voló Jonny Durand junto a ella en ala delta, en 1\u00a0h\u00a045\u00a0min, en 2009.' },
]

// Las tres piezas de la marca que salen de la nube: de dónde viene el nombre,
// la idea, y cómo se ve en esta misma página, donde la nube y el mar los pinta
// una trama de puntos (nubes.js) y la ola son tres líneas.
const MARCA = [
  { titulo: 'La palabra', texto: 'En latín, volutus es «enrollado»: la ola nace en la S y se enrolla en voluta.' },
  { titulo: 'La idea', texto: 'Buscamos la simpleza de las cosas, sin perder su complejidad.' },
  {
    titulo: 'Esta página',
    texto: 'Por eso la nube y el mar son una trama de puntos, y la ola, tres líneas: piezas simples que, juntas, dibujan algo complejo.',
  },
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

// La parvada: quince patos en V, el primero adelante y los demás en dos
// brazos abiertos hacia atrás, como la que se va al cielo siguiente en el
// juego de la 404 (src/patos.js). `fila` es su fila en la V, y `lado`, su
// brazo.
const PARVADA = Array.from({ length: 15 }, (_, i) => ({ fila: Math.ceil(i / 2), lado: i % 2 ? -1 : 1 }))

// Los cuadros del pato (lib/pato.js) en tira, uno cada 16 celdas: con el ala
// arriba, con el ala abajo, cazado y cayendo, que es más alto que ancho.
const CUADROS = [
  { filas: ARRIBA, x: 0, y: 2 },
  { filas: ABAJO, x: 16, y: 2 },
  { filas: HERIDO, x: 32, y: 2 },
  { filas: CAE, x: 49, y: 0 },
]

/**
 * La parvada que cruza lejos sobre el mar del atardecer. Va en el telón, en el
 * cielo que queda en la lámina: sale apenas se deja el último socio, y si la
 * escena se recorta mientras cruza, sigue adentro y se va con ella. La tira de
 * cuadros se define una vez y cada pato la usa entera y muestra el suyo; el
 * vuelo y la caída los lleva el CSS (Nosotros.css), y cuándo sale y quién cae,
 * src/parvada.js.
 */
function Parvada() {
  return (
    <div className="parvada" aria-hidden="true">
      <svg width="0" height="0" focusable="false">
        <defs>
          <g id="pato">
            {CUADROS.map(({ filas, x, y }) => (
              <g key={x} transform={`translate(${x} ${y})`}>
                <Celdas filas={filas} />
              </g>
            ))}
          </g>
        </defs>
      </svg>
      <div className="parvada-v">
        {PARVADA.map(({ fila, lado }, i) => (
          <span key={i} className="pato" style={{ '--fila': fila, '--lado': lado, '--i': i }}>
            <svg viewBox="0 0 64 16" shapeRendering="crispEdges" focusable="false">
              <use href="#pato" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  )
}

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
      <svg viewBox={CAJA_DE_LA_OLA} aria-hidden="true" focusable="false">
        <path className="ola-trazo" d={trazoDe(OLA)} strokeWidth={OLA.grosor} />
      </svg>
      <canvas className="ola-lienzo" aria-hidden="true" />
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
    <Pagina ruta="/nosotros" className="nosotros" cierre={<Cierre />}>
      {/* El atardecer va en su telón, fijo mientras dura la sección: arriba el
          titular, en el cielo, y después las tarjetas, sobre el mar. El sol
          baja del día mientras pasan los socios y toca el mar con la escena
          sola, en la pausa (`data-ocaso`), el mar abierto donde se pone
          hasta la mitad antes de que la escena se recorte en la lámina
          (Nosotros.css). */}
      <section className="seccion zona-cielo atardecer">
        <div className="atardecer-telon">
          <canvas className="nubes" data-vista="atardecer" data-ocaso=".atardecer-pausa" aria-hidden="true" />
          <Parvada />
        </div>
        <div className="contenedor atardecer-cabecera">
          <h1>¿Quiénes somos?</h1>
          <p className="entradilla">
            Hacemos software en Chile: páginas web, tiendas online, apps, agentes de IA y automatizaciones. Antes
            de hacerlo para otros, lo hicimos para nosotros.
          </p>
        </div>

        {/* Una tarjeta por socio, con la foto encima y en lados alternos,
            como el formulario de contacto sobre su tarjeta. */}
        <div className="contenedor">
          <ul className="socios">
            {/* `sizes` es el ancho al que se pinta la foto, no el de su hueco:
                con `object-fit: cover` se agranda hasta llenarlo, y en la
                tarjeta angosta y alta desde 640 px llega a unos 580 px.
                `fetchPriority` baja: la primera foto queda bajo la primera
                pantalla, y con prioridad alta le quitaba la red al texto de
                la cabecera, que es el LCP (2.3 s en vez de 1.6 s). */}
            {SOCIOS.map(({ id, nombre, apellidos, titulo, institucion, rol, foto, fotoSrcSet, perfiles, descripcion }) => (
              <li key={id} id={id} className="socio entra">
                <img
                  src={foto}
                  srcSet={fotoSrcSet}
                  sizes={fotoSrcSet && '(max-width: 639px) calc(100vw - 72px), 580px'}
                  alt=""
                  width={800}
                  height={1000}
                  loading="lazy"
                  fetchPriority="low"
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
                          <a href={perfiles[red.id]} target="_blank" rel="noopener" style={{ '--color-red': red.color }}>
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
                  <p className="socio-educacion">{`${titulo} - ${institucion.nombre}`}</p>
                  <p className="socio-rol">{rol}</p>
                  <p className="socio-descripcion">{descripcion}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="atardecer-pausa" />
      </section>

      {/* Primero lo que es la nube: su definición, como en un diccionario, y
          la más conocida, con su foto. Después, lo que es para nosotros. */}
      <section id="nombre" className="seccion zona-cielo" aria-labelledby="nombre-titulo">
        <div className="contenedor">
          {/* El hueco de la lámina: ahí queda el atardecer, recortado (ver
              `ponerSol` en nubes.js). */}
          <div className="lamina" />
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
                  <a href={url} target="_blank" rel="noopener">
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
