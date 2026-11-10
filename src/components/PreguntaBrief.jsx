import MuestraBrief, { LogoDeMarca } from './MuestraBrief.jsx'
import { BOCETOS, rutaDeBoceto } from '../lib/brief/bocetos.js'
import {
  ERRORES_BRIEF,
  ESCALA,
  LIMITES_BRIEF,
  REACCIONES,
  campoBoceto,
  campoCelda,
  campoColor,
  campoEstrella,
  campoNotaBoceto,
  campoOtro,
  textoDeEscala,
} from '../lib/brief/reglas.js'

/**
 * Una pregunta del brief (paginas/Brief.jsx), dibujada según su `tipo` con
 * controles nativos: se marca, se escribe y se envía sin JavaScript. Cada
 * control lleva en `data-etiqueta` lo que significa en palabras, y de ahí
 * arma brief.js el resumen de la revisión sin repetir las preguntas en el
 * script.
 *
 * Los nombres de campo salen de lib/brief/reglas.js, los mismos que lee el
 * Worker.
 */

const idDe = (nombre) => `brief-${nombre}`

function Ejemplo({ texto }) {
  return (
    texto && (
      <p className="brief-ejemplo">
        <span className="brief-ejemplo-marca">Ejemplo</span> {texto}
      </p>
    )
  )
}

// Lo que se destaca junto a la pregunta: lo obligatorio, en coral, y lo que
// más nos sirve, en arena (Brief.css).
function Pastillas({ obligatorio, clave }) {
  return (
    <>
      {obligatorio && <span className="brief-pastilla brief-pastilla-obligatorio">Obligatorio</span>}
      {clave && <span className="brief-pastilla brief-pastilla-clave">Nos sirve mucho</span>}
    </>
  )
}

function Ayuda({ id, texto }) {
  return (
    texto && (
      <p className="brief-ayuda" id={`ayuda-${id}`}>
        {texto}
      </p>
    )
  )
}

// Comienzos de frase para el texto largo, para quien no sabe por dónde
// empezar: brief.js los suma al cuadro.
function Guias({ guias }) {
  return (
    guias && (
      <div className="brief-guias">
        {guias.map((guia) => (
          <button key={guia} type="button" className="brief-guia-frase" data-frase={guia}>
            {guia.trim()}…
          </button>
        ))}
      </div>
    )
  )
}

// Texto de una línea o de varias. Los tres de contacto reservan el hueco de su
// aviso, como en el formulario de contacto: aparecer no empuja nada.
function Campo({ pregunta }) {
  const { id, tipo, etiqueta, ayuda, ph, obligatorio, clave, autocompletar, ejemplo, filas, guias } = pregunta
  const contacto = ['nombre', 'correo', 'telefono'].includes(id)
  const comunes = {
    id: idDe(id),
    name: id,
    placeholder: ph,
    maxLength: LIMITES_BRIEF[id] ?? LIMITES_BRIEF[tipo],
    'data-etiqueta': etiqueta,
    'aria-describedby': [ayuda && `ayuda-${id}`, contacto && `error-${id}`].filter(Boolean).join(' ') || undefined,
  }
  return (
    <>
      <label htmlFor={idDe(id)}>
        {etiqueta}
        <Pastillas obligatorio={obligatorio} clave={clave} />
      </label>
      <Ayuda id={id} texto={ayuda} />
      <Guias guias={guias} />
      {tipo === 'parrafo' ? (
        <textarea {...comunes} rows={filas ?? 3} />
      ) : (
        <input
          {...comunes}
          type={{ correo: 'email', telefono: 'tel' }[tipo] ?? 'text'}
          inputMode={{ correo: 'email', telefono: 'tel' }[tipo]}
          autoComplete={autocompletar ?? 'off'}
          spellCheck={tipo === 'correo' ? 'false' : undefined}
          autoCapitalize={tipo === 'correo' ? 'off' : undefined}
          required={obligatorio}
        />
      )}
      {contacto && (
        <p className="campo-error" id={`error-${id}`} hidden>
          {id === 'nombre' ? ERRORES_BRIEF.nombre : ERRORES_BRIEF.contacto}
        </p>
      )}
      <Ejemplo texto={ejemplo} />
    </>
  )
}

// Una o varias de una lista. Sin explicación ni imagen, las opciones son
// pastillas, como en el contacto (las de una empresa, con su logotipo); con
// ellas, tarjetas; con `muestras`, cada
// opción se dibuja en su estilo o en su letra (MuestraBrief.jsx). Las tarjetas
// con `estrella` suman su casilla de «imprescindible», aparte de la de elegir:
// una etiqueta no puede ir dentro de otra.
function Opciones({ pregunta }) {
  const { id, tipo, opciones, otro, estrella, muestras } = pregunta
  const tarjetas = opciones.some((opcion) => opcion.d || opcion.img || opcion.muestra)
  const tipoDeCasilla = tipo === 'una' ? 'radio' : 'checkbox'
  const clase = muestras ? `brief-muestras brief-muestras-${muestras}` : tarjetas ? 'brief-tarjetas' : 'chips brief-chips'
  return (
    <>
      <div className={clase}>
        {opciones.map((opcion) => {
          const { v, l, d, img, muestra, marca } = opcion
          const casilla = <input type={tipoDeCasilla} name={id} value={v} data-etiqueta={l} />
          if (muestras) return <MuestraBrief key={v} muestras={muestras} casilla={casilla} opcion={opcion} />
          if (!tarjetas)
            return (
              <label key={v} className={marca ? `chip brief-marca chip-${v}` : 'chip'}>
                {casilla}
                {l}
                {marca && <LogoDeMarca marca={v} />}
              </label>
            )
          return (
            <div key={v} className={`brief-tarjeta${img ? ' con-imagen' : ''}`}>
              <label className="brief-opcion">
                {casilla}
                {img && <img src={`/image/brief/${img}.svg`} alt="" width="150" height="100" loading="lazy" decoding="async" />}
                {muestra && (
                  <span
                    className="brief-muestra-color"
                    style={{ background: `linear-gradient(90deg, ${muestra[0]} 0 34%, ${muestra[1]} 34% 67%, ${muestra[2]} 67%)` }}
                    aria-hidden="true"
                  />
                )}
                <span className="brief-opcion-texto">
                  <span className="brief-opcion-nombre">{l}</span>
                  {d && <span className="brief-opcion-detalle">{d}</span>}
                </span>
              </label>
              {estrella && (
                <label className="brief-estrella">
                  <input type="checkbox" name={campoEstrella(id)} value={v} data-etiqueta={`${l} (imprescindible)`} />
                  <span aria-hidden="true">★</span> Imprescindible
                  <span className="solo-lectores">: {l}</span>
                </label>
              )}
            </div>
          )
        })}
      </div>
      {otro && (
        <div className="brief-otro">
          <label htmlFor={idDe(campoOtro(id))}>Otro:</label>
          <input
            id={idDe(campoOtro(id))}
            name={campoOtro(id)}
            type="text"
            maxLength={LIMITES_BRIEF.texto}
            placeholder="¿Cuál?"
            data-etiqueta="Otro"
          />
        </div>
      )}
    </>
  )
}

// Cinco puntos entre dos extremos. Cada punto es un radio: las flechas lo
// mueven y su nombre accesible dice qué significa.
function Escala({ pregunta }) {
  const { id, izquierda, derecha } = pregunta
  // La caja es un contenedor: según su ancho, los extremos van a los lados de
  // los puntos o encima (Brief.css).
  return (
    <div className="brief-escala">
      <div className="brief-escala-fila">
        <span className="brief-extremo">
          <span className="brief-extremo-nombre">{izquierda[0]}</span>
          <span className="brief-extremo-detalle">{izquierda[1]}</span>
        </span>
        <span className="brief-puntos">
          {ESCALA.map((n) => (
            <label key={n} className="brief-punto">
              <input type="radio" name={id} value={n} data-etiqueta={textoDeEscala(n, izquierda, derecha)} />
              <span className="solo-lectores">{textoDeEscala(n, izquierda, derecha)}</span>
            </label>
          ))}
        </span>
        <span className="brief-extremo brief-extremo-derecho">
          <span className="brief-extremo-nombre">{derecha[0]}</span>
          <span className="brief-extremo-detalle">{derecha[1]}</span>
        </span>
      </div>
    </div>
  )
}

// Filas numeradas con sus columnas. En S cada fila se apila (Brief.css).
function Tabla({ pregunta }) {
  const { id, filas, columnas } = pregunta
  return (
    <div className="brief-tabla" style={{ '--columnas': columnas.length }}>
      {columnas.length > 1 && (
        <div className="brief-tabla-cabeza" aria-hidden="true">
          <span />
          {columnas.map((columna) => (
            <span key={columna.id}>{columna.etiqueta}</span>
          ))}
        </div>
      )}
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className="brief-tabla-fila">
          <span className="brief-tabla-n" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          {columnas.map((columna) => (
            <input
              key={columna.id}
              name={campoCelda(id, i + 1, columna.id)}
              type="text"
              maxLength={LIMITES_BRIEF.celda}
              placeholder={columna.ph}
              aria-label={`${columna.etiqueta} ${i + 1}`}
              data-etiqueta={columna.etiqueta}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Una frase con huecos. Cada hueco lleva arriba lo que pide.
function Frase({ pregunta }) {
  return (
    <p className="brief-frase">
      {pregunta.partes.map((parte) =>
        typeof parte === 'string' ? (
          parte
        ) : (
          <label key={parte.id} className="brief-hueco">
            <span className="brief-hueco-nombre">{parte.etiqueta}</span>
            <input name={parte.id} type="text" maxLength={LIMITES_BRIEF.texto} placeholder={parte.ph} data-etiqueta={parte.etiqueta} />
          </label>
        )
      )}
    </p>
  )
}

// El código o el nombre de cada color. El selector no tiene `name`, así que
// no se envía: brief.js lo muestra y lo copia al texto, que es lo que viaja.
function Colores({ pregunta }) {
  const { id, espacios } = pregunta
  return (
    <div className="brief-colores">
      {espacios.map((espacio, i) => {
        const nombre = campoColor(id, i + 1)
        return (
          <div key={espacio} className="brief-color">
            <label htmlFor={idDe(nombre)}>{espacio}</label>
            <span className="brief-color-caja">
              <input type="color" aria-label={`Elegir el ${espacio.toLowerCase()} en una paleta`} data-color={idDe(nombre)} hidden />
              <input id={idDe(nombre)} name={nombre} type="text" maxLength={LIMITES_BRIEF.color} placeholder="#116492" data-etiqueta={espacio} />
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Los 24 bocetos (lib/brief/bocetos.js): cada uno abre su página en otra
// pestaña y se califica aquí o allá (public/brief/bocetos/barra.js); brief.js
// mantiene las dos cosas iguales. La miniatura toma los colores de su marca y
// la letra de su estilo (public/brief/muestras.css).
function Bocetos() {
  return (
    <div className="brief-bocetos">
      {BOCETOS.map(({ slug, nombre, rubro, estilo, fondo, tinta, acento }) => (
        <fieldset key={slug} className="brief-boceto" data-boceto={slug}>
          <legend className="solo-lectores">{nombre}</legend>
          <a
            className={`brief-boceto-miniatura estilo-${estilo}`}
            href={rutaDeBoceto(slug)}
            target="_blank"
            rel="noopener"
            style={{ '--fondo-boceto': fondo, '--tinta-boceto': tinta, '--acento-boceto': acento }}
          >
            <span className="brief-boceto-marca">{nombre}</span>
            <span className="brief-boceto-rubro">{rubro}</span>
            <span className="brief-boceto-abrir">
              Abrir boceto <span aria-hidden="true">↗</span>
              <span className="solo-lectores"> (se abre en otra pestaña)</span>
            </span>
          </a>
          <div className="brief-boceto-reacciones">
            {REACCIONES.map(([valor, texto, signo]) => (
              <label key={valor} className={`brief-reaccion brief-reaccion-${valor}`}>
                <input type="radio" name={campoBoceto(slug)} value={valor} data-etiqueta={texto} />
                <span aria-hidden="true">{signo}</span>
                {texto}
              </label>
            ))}
          </div>
          <input
            className="brief-boceto-nota"
            name={campoNotaBoceto(slug)}
            type="text"
            maxLength={LIMITES_BRIEF.nota}
            placeholder="¿Qué te gustó o qué no?"
            aria-label={`Qué te gustó o qué no de ${nombre}`}
            data-etiqueta="Nota"
          />
        </fieldset>
      ))}
    </div>
  )
}

// La portada de muestra de las escalas de «Cómo se ve». No hay nada que leer:
// la mueven, solo con CSS, los puntos marcados (public/brief/muestras.css).
// `data-d` es la densidad desde la que aparece cada pieza.
function Mockup() {
  return (
    <div className="brief-mockup" aria-hidden="true">
      <div className="brief-mockup-barra">
        <i />
        <i />
        <i />
        <span>tumarca.cl</span>
      </div>
      <div className="mk">
        <div className="mk-nav">
          <span className="mk-logo">
            <i />
            Tu marca
          </span>
          <span className="mk-links" data-d="3">
            <span>Servicios</span>
            <span>Nosotros</span>
            <span data-d="4">Casos</span>
            <span data-d="5">Blog</span>
          </span>
          <span className="mk-btn" data-d="4">
            Escríbenos
          </span>
        </div>
        <div className="mk-heroe">
          <div className="mk-texto">
            <span className="mk-sello" data-d="3">
              Desde 2019 · Ñuñoa
            </span>
            <span className="mk-h">
              <span className="t1">Asesoría seria para tu negocio.</span>
              <span className="t2">Tu negocio, en buenas manos.</span>
              <span className="t3">Tu negocio, en una frase clara.</span>
              <span className="t4">Tu negocio, con algo de chispa.</span>
              <span className="t5">¡Hola! Tu negocio, sonriendo.</span>
            </span>
            <span className="mk-p" data-d="2">
              Lo que haces y para quién, dicho en dos líneas que cualquiera entiende.
            </span>
            <span className="mk-acciones">
              <span className="mk-btn">Cotiza por WhatsApp</span>
              <span className="mk-btn mk-sec" data-d="3">
                Ver trabajos
              </span>
            </span>
            <span className="mk-cifras" data-d="5">
              <span>
                <b>+300</b>clientes
              </span>
              <span>
                <b>4,9</b>en Google
              </span>
              <span>
                <b>24 h</b>respuesta
              </span>
            </span>
          </div>
          <span className="mk-img" data-d="2" />
        </div>
        <div className="mk-tarjetas" data-d="4">
          {['uno', 'dos', 'tres'].map((n) => (
            <span key={n}>
              <b>Servicio {n}</b>
              <i />
              <i />
            </span>
          ))}
        </div>
        <span className="mk-sticker">
          ¡Recién
          <br />
          salido!
        </span>
        <i className="mk-forma f1" />
        <i className="mk-forma f2" />
        <i className="mk-forma f3" />
        <span className="mk-cinta">
          <span>Despacho gratis esta semana · Nuevo local en Ñuñoa · Despacho gratis esta semana · Nuevo local en Ñuñoa</span>
        </span>
      </div>
    </div>
  )
}

// Lo que el agente de IA lee de una pregunta cuando la etiqueta no basta.
function descripcionParaAgente({ tipo, max, izquierda, derecha, columnas, filas }) {
  if (tipo === 'escala') return `Del 1 (${izquierda[0]}) al 5 (${derecha[0]}); el 3 es equilibrado`
  if (tipo === 'tabla') return `Hasta ${filas} filas con: ${columnas.map((c) => c.etiqueta).join(', ')}`
  if (tipo === 'bocetos') return 'Para cada boceto: si (me gusta), medio o no, y una nota opcional de por qué'
  if (max) return `Hasta ${max} opciones`
}

const CONTENIDO = { una: Opciones, varias: Opciones, escala: Escala, tabla: Tabla, frase: Frase, colores: Colores, bocetos: Bocetos }

// Dos columnas por tema que crecen cada una por su lado (preguntas.js).
function Columnas({ columnas }) {
  return (
    <div className="brief-columnas">
      {columnas.map(({ titulo, pastilla, preguntas }, i) => (
        <div key={titulo ?? i} className="brief-columna">
          {titulo && (
            <p className="brief-columna-titulo">
              {titulo}
              {pastilla && <span className="brief-pastilla brief-pastilla-ayuda">{pastilla}</span>}
            </p>
          )}
          {preguntas.map((pregunta, j) => (
            <PreguntaBrief key={pregunta.id ?? j} pregunta={pregunta} />
          ))}
        </div>
      ))}
    </div>
  )
}

// Las escalas, con la portada de muestra al lado (desde L) o debajo.
function ConMockup({ preguntas }) {
  return (
    <div className="brief-escalas">
      <div className="brief-escalas-lista">
        {preguntas.map((pregunta) => (
          <PreguntaBrief key={pregunta.id} pregunta={pregunta} />
        ))}
      </div>
      <div className="brief-mockup-columna">
        <Mockup />
        <p className="brief-mockup-nota">Así se movería la portada de tu sitio. Es una referencia del rumbo, no un diseño final.</p>
      </div>
    </div>
  )
}

export default function PreguntaBrief({ pregunta }) {
  const { id, tipo, etiqueta, ayuda, ejemplo, max, clave } = pregunta

  if (tipo === 'columnas') return <Columnas columnas={pregunta.columnas} />
  if (tipo === 'mockup') return <ConMockup preguntas={pregunta.preguntas} />

  if (tipo === 'consejo')
    return (
      <p className="brief-consejo">
        <strong>{pregunta.titulo}</strong> {pregunta.texto}
      </p>
    )

  if (tipo === 'comparar')
    return (
      <table className="brief-comparar">
        <thead>
          <tr>
            <th scope="col">Así no</th>
            <th scope="col">Así sí</th>
          </tr>
        </thead>
        <tbody>
          {pregunta.filas.map(([no, si]) => (
            <tr key={no}>
              <td>{no}</td>
              <td>{si}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )

  const clase = `campo brief-pregunta${tipo === 'escala' ? ' brief-escala-campo' : ''}`
  const Contenido = CONTENIDO[tipo]
  if (!Contenido)
    return (
      <div className={clase} data-pregunta={id} data-clave={clave || undefined}>
        <Campo pregunta={pregunta} />
      </div>
    )

  return (
    <fieldset
      className={`${clase} opciones`}
      data-pregunta={id}
      data-max={max}
      data-clave={clave || undefined}
      aria-describedby={ayuda ? `ayuda-${id}` : undefined}
      toolparamdescription={descripcionParaAgente(pregunta)}
    >
      <legend>
        {etiqueta}
        <Pastillas clave={clave} />
        {max && (
          <span className="brief-pastilla brief-cuenta" aria-hidden="true">
            <span className="brief-cuenta-n">0</span> de {max}
          </span>
        )}
      </legend>
      <Ayuda id={id} texto={ayuda} />
      <Contenido pregunta={pregunta} />
      <Ejemplo texto={ejemplo} />
    </fieldset>
  )
}
