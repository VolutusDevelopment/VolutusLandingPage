import { Fragment } from 'react'
import { PROYECTOS } from '../data/proyectos.js'
import LogoProyecto from './LogoProyecto.jsx'
import Podio from './Podio.jsx'

/**
 * Índice de obra (DESIGN-BRIEF §4, bloque 2). La página sigue en blanco y el
 * color vive en las tarjetas: los logros con jurado externo suben a un podio
 * en pixel art (Podio.jsx): es lo único validado por un tercero.
 *
 * Cada proyecto pinta solo los enlaces que tiene. Un proyecto sin ninguno no
 * llega hasta aquí: lo filtra el propio archivo de datos, donde está explicada
 * la regla y el estado verificado de cada uno.
 *
 * Cada proyecto es una lámina que enseña la obra sin pedir nada: su resumen,
 * el producto en sus pantallas reales y la dirección donde abrirlo, etiquetada
 * por lo que es («En línea» o «Código público»), que es la regla para estar
 * aquí. Un proyecto sin capturas no tiene más que enseñar: su lámina es una
 * fila.
 */

function Captura({ imagen, sizes, className }) {
  return (
    <img
      className={className}
      data-fondo=""
      src={imagen.src}
      srcSet={imagen.srcSet}
      sizes={sizes}
      width={imagen.ancho}
      height={imagen.alto}
      alt={imagen.alt}
      loading="lazy"
      decoding="async"
    />
  )
}

const TAMANO_TELEFONO = '(min-width: 1024px) 10rem, (min-width: 650px) 15vw, 26vw'

/**
 * El producto en la portada de la lámina: el sitio en su ventana, que es lo
 * que manda, y lo que ve el cliente y la app del negocio en dos teléfonos
 * enteros.
 *
 * Pasan bajo la barra con su luz propia, clara y oscura a trozos: la barra la
 * lee en cada punto (`data-fondo`, ver `initLectura` en barra.js).
 */
function Vitrina({ vistas, sitio }) {
  const imagenDe = (forma) => vistas.find((vista) => vista.forma === forma)?.imagen
  const pantalla = imagenDe('pantalla')
  const telefono = imagenDe('telefono')
  const app = imagenDe('app')
  return (
    <div className="vitrina">
      {pantalla && (
        <div className="vitrina-ventana">
          {sitio && (
            <span className="vitrina-direccion" aria-hidden="true">
              {new URL(sitio).host}
            </span>
          )}
          <Captura imagen={pantalla} sizes="(min-width: 1024px) 46rem, (min-width: 650px) 70vw, 80vw" />
        </div>
      )}
      {telefono && <Captura imagen={telefono} sizes={TAMANO_TELEFONO} className="vitrina-telefono" />}
      {app && (
        <div className="vitrina-app">
          <Captura imagen={app} sizes={TAMANO_TELEFONO} />
        </div>
      )}
    </div>
  )
}

// La dirección se lee sin el protocolo: `github.com/DiegoPyLL/CarFlip`. Si no
// cabe en la línea, se corta después de una barra y no a mitad de un nombre, y
// la flecha va pegada al último: nunca baja sola.
function Direccion({ url }) {
  const { host, pathname } = new URL(url)
  const partes = (host + pathname).replace(/\/$/, '').split('/')
  const ultima = partes.pop()
  return (
    <>
      {partes.map((parte, i) => (
        <Fragment key={i}>
          {parte}/<wbr />
        </Fragment>
      ))}
      <span className="obra-direccion-fin">
        {ultima}
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </span>
    </>
  )
}

const PRUEBAS = [
  ['sitio', 'En línea'],
  ['repositorio', 'Código público'],
]

/**
 * Dónde se abre la obra. El enlace al sitio es una línea de texto, pero su
 * `::after` se estira sobre la lámina entera (`obra-abrir`): tocarla en
 * cualquier punto abre el producto en otra pestaña.
 */
function Pruebas({ proyecto }) {
  return (
    <dl className="obra-pruebas">
      {PRUEBAS.filter(([clave]) => proyecto[clave]).map(([clave, etiqueta]) => (
        <div key={clave}>
          <dt>{etiqueta}</dt>
          <dd>
            <a
              href={proyecto[clave]}
              target="_blank"
              rel="noopener"
              className={`obra-direccion${clave === 'sitio' ? ' obra-abrir' : ''}`}
            >
              <Direccion url={proyecto[clave]} />
            </a>
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Obra({ proyecto }) {
  return (
    <li className={`obra zona-plano entra${proyecto.vistas ? ' obra-con-vitrina' : ''}`} id={proyecto.id}>
      <div className="obra-lamina">
        <div className="obra-texto">
          <div className="obra-nombre">
            <LogoProyecto proyecto={proyecto} />
            <h3>{proyecto.nombre}</h3>
          </div>
          <p className="obra-resumen">{proyecto.resumen}</p>
          <Pruebas proyecto={proyecto} />
        </div>
        {proyecto.vistas && <Vitrina vistas={proyecto.vistas} sitio={proyecto.sitio} />}
      </div>
    </li>
  )
}

export default function Proyectos() {
  const destacados = PROYECTOS.filter((p) => p.destacado)
  const obras = PROYECTOS.filter((p) => !p.destacado)

  return (
    <section id="proyectos" className="seccion zona-cielo proyectos">
      <div className="contenedor">
        <h2 className="titular entra">Proyectos y logros</h2>
        <ul className="obras">
          {obras.map((proyecto) => (
            <Obra key={proyecto.id} proyecto={proyecto} />
          ))}
        </ul>

        {/* Los logros con jurado externo suben al podio (Podio.jsx). */}
        <Podio logros={destacados} />
      </div>
    </section>
  )
}
