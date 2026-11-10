import Pagina from '../components/Pagina.jsx'
import PreguntaBrief from '../components/PreguntaBrief.jsx'
import { BRIEF as brief } from '../lib/brief/preguntas.js'
import { CORREO_DE_CONTACTO } from '../lib/contacto.js'

/**
 * El brief para clientes (/brief): el cuestionario de marca y sitio web que
 * Volutus le manda a un cliente por link. No se enlaza desde el sitio ni se
 * indexa (lib/meta.js). Las preguntas viven en lib/brief/preguntas.js.
 *
 * El protagonista es el formulario: la página es blanca, la portada es solo
 * el título y sus datos, y lo propio está en el formulario. Las partes se
 * reparten en dos áreas, Marca y Diseño, cada una con su color y su figura
 * de puntos (círculo y cuadrado, como los puntos de la ola). El índice las
 * agrupa en dos cuadros con el nombre del área en el lomo.
 *
 * Es un solo `<form>` partido en pantallas: el recorrido (#inicio), una por
 * paso (#paso-1…) y la revisión (#revisar). Cada pantalla es un ancla, y la que
 * se ve es la del ancla de la dirección (`:target`, Brief.css): el «atrás» del
 * navegador retrocede un paso, un enlace puede llevar a cualquiera y nada de
 * eso necesita JavaScript. Sin `:has()` se ven todas, una tras otra.
 *
 * brief.js suma lo que el HTML no hace solo: guarda las respuestas en el
 * equipo y las recupera, pone el foco en cada paso, llena la barra con el
 * scroll de la parte, pide los dos datos obligatorios, trae lo calificado en
 * los bocetos, arma la revisión y envía.
 *
 * Las muestras de «Cómo se ve» (estilos, tipografías, portada de muestra y
 * bocetos) se dibujan con public/brief/muestras.css, que solo baja esta página.
 *
 * Solo el nombre y una forma de responder (correo o WhatsApp) son
 * obligatorios: lo demás se puede saltar y se conversa en la reunión.
 */

const AREAS = [
  { id: 'marca', nombre: 'Marca' },
  { id: 'diseno', nombre: 'Diseño' },
]
const nombreDeArea = (id) => AREAS.find((area) => area.id === id).nombre

// La figura de cada área, de puntos como la ola: círculo para Marca y
// cuadrado para Diseño. El trazo es de guiones de largo cero con punta
// redonda: cada guion es un punto.
function Figura({ area, className }) {
  return (
    <svg className={`brief-figura ${className ?? ''}`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      {area === 'marca' ? <circle cx="20" cy="20" r="16" /> : <rect x="5" y="5" width="30" height="30" />}
    </svg>
  )
}

function Navegacion({ anterior, siguiente, textoSiguiente = 'Siguiente' }) {
  return (
    <div className="brief-nav">
      <a className="boton boton-secundario" href={anterior} data-anterior>
        Anterior
      </a>
      <p className="brief-nav-nota">Puedes saltarte lo que no sepas y volver después.</p>
      <a className="boton boton-primario brief-siguiente" href={siguiente} data-siguiente>
        {textoSiguiente}
        <span aria-hidden="true">→</span>
      </a>
    </div>
  )
}

export default function Brief() {
  const { pasos, intro } = brief
  const total = pasos.length
  const anclaDe = (i) => (i < 0 ? '#inicio' : i >= total ? '#revisar' : `#paso-${i + 1}`)
  const numero = (i) => String(i + 1).padStart(2, '0')
  const pasosDe = (area) => pasos.map((paso, i) => [paso, i]).filter(([paso]) => paso.area === area)

  return (
    <Pagina className="brief-pagina">
      <section className="seccion zona-cielo brief-portada" aria-labelledby="brief-titulo">
        <div className="contenedor brief-contenedor">
          <p className="antetitulo">{brief.antetitulo}</p>
          <h1 id="brief-titulo">{brief.nombre}</h1>
          <ul className="brief-portada-datos">
            {intro.datos.map(([dato]) => (
              <li key={dato}>{dato}</li>
            ))}
            <li>Se guarda solo</li>
          </ul>
        </div>
      </section>

      <section className="seccion zona-cielo brief-seccion" aria-label="El formulario">
        <div className="contenedor brief-contenedor">
          {/* Lo que dice brief.js al recuperar respuestas guardadas. */}
          <div className="brief-aviso" role="status" hidden>
            <p className="brief-aviso-texto" />
            <div className="brief-aviso-acciones">
              <a className="boton boton-primario" href="#paso-1" data-seguir>
                Seguir
              </a>
              <button className="boton boton-secundario" type="button" data-borrar>
                Empezar de nuevo
              </button>
            </div>
          </div>

          <form
            className="brief"
            method="post"
            action="/api/brief"
            noValidate
            toolname={brief.toolname}
            tooldescription={brief.tooldescription}
          >
            {/* La guía. En S y M, una franja arriba: el área, la parte y su
                barra. Desde L, además, el índice entero, en un cuadro por
                área con su nombre en el lomo. */}
            <nav className="brief-guia" aria-label="Partes del brief">
              <div className="brief-avance">
                <div className="brief-guia-fila">
                  <p className="brief-donde" aria-hidden="true">
                    <span className="brief-donde-area" hidden />
                    <span className="brief-donde-texto">{intro.titulo}</span>
                  </p>
                  <p className="brief-guardado" aria-hidden="true">
                    Se guarda solo
                  </p>
                </div>
                <div className="brief-progreso" aria-hidden="true">
                  <span className="brief-progreso-relleno" />
                </div>
              </div>
              <div className="brief-indice">
                {AREAS.map((area) => (
                  <div key={area.id} className={`brief-grupo brief-area-${area.id}`}>
                    <p className="brief-grupo-lomo" aria-hidden="true">
                      <Figura area={area.id} />
                      <span>{area.nombre}</span>
                    </p>
                    <ol aria-label={area.nombre}>
                      {pasosDe(area.id).map(([paso, i]) => (
                        <li key={paso.corto}>
                          <a href={anclaDe(i)}>
                            <span className="brief-indice-marca" aria-hidden="true" />
                            <span>
                              {i + 1}. {paso.corto}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
                <a className="brief-indice-revisar" href="#revisar">
                  <span className="brief-indice-marca" aria-hidden="true" />
                  <span>Revisar y enviar</span>
                </a>
              </div>
              <p className="brief-guia-nota">Tus respuestas se guardan solas en este equipo, por si cierras la página.</p>
              {/* Lo que brief.js anuncia al cambiar de paso. */}
              <p className="solo-lectores brief-anuncio" aria-live="polite" />
            </nav>

            <div className="brief-pantallas">
              <section id="inicio" className="brief-pantalla" aria-labelledby="inicio-titulo">
                <header className="brief-pantalla-cabeza">
                  <p className="brief-pantalla-dato">El recorrido</p>
                  <h2 id="inicio-titulo" className="titular" tabIndex={-1}>
                    {intro.titulo}
                  </h2>
                  <p className="brief-pantalla-entrada">{intro.texto}</p>
                </header>
                {AREAS.map((area) => (
                  <div key={area.id} className={`brief-recorrido-area brief-area-${area.id}`}>
                    <p className="brief-recorrido-titulo">
                      <Figura area={area.id} />
                      {area.nombre}
                    </p>
                    <ol className="brief-recorrido">
                      {pasosDe(area.id).map(([paso, i]) => (
                        <li key={paso.corto}>
                          <a href={anclaDe(i)}>
                            <span className="brief-recorrido-n">{numero(i)}</span>
                            <span className="brief-recorrido-nombre">{paso.corto}</span>
                            <span className="brief-recorrido-resumen">{paso.resumen}</span>
                            <span className="brief-recorrido-tiempo">{paso.tiempo}</span>
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
                <p className="brief-empezar">
                  <a className="boton boton-primario brief-siguiente" href="#paso-1" data-comenzar>
                    Empezar por la parte 1<span aria-hidden="true">→</span>
                  </a>
                </p>
              </section>

              {pasos.map((paso, i) => (
                <section
                  key={paso.corto}
                  id={`paso-${i + 1}`}
                  className={`brief-pantalla brief-area-${paso.area}`}
                  data-area={paso.area}
                  aria-labelledby={`paso-${i + 1}-titulo`}
                >
                  <header className="brief-pantalla-cabeza">
                    <span className="brief-numero" aria-hidden="true">
                      <Figura area={paso.area} />
                      <span>{numero(i)}</span>
                    </span>
                    <p className="brief-pantalla-dato">
                      {nombreDeArea(paso.area)} · Parte {i + 1} de {total} · {paso.tiempo}
                    </p>
                    <h2 id={`paso-${i + 1}-titulo`} className="titular" tabIndex={-1}>
                      {paso.titulo}
                    </h2>
                    <p className="brief-pantalla-entrada">{paso.entrada}</p>
                  </header>
                  <div className="brief-preguntas">
                    {paso.preguntas.map((pregunta, j) => (
                      <PreguntaBrief key={pregunta.id ?? j} pregunta={pregunta} />
                    ))}
                  </div>
                  <Navegacion
                    anterior={anclaDe(i - 1)}
                    siguiente={anclaDe(i + 1)}
                    textoSiguiente={i === total - 1 ? 'Revisar' : 'Siguiente'}
                  />
                </section>
              ))}

              <section id="revisar" className="brief-pantalla" aria-labelledby="revisar-titulo">
                <header className="brief-pantalla-cabeza">
                  <p className="brief-pantalla-dato">Último paso</p>
                  <h2 id="revisar-titulo" className="titular" tabIndex={-1}>
                    Revisa y envía
                  </h2>
                  <p className="brief-pantalla-entrada">
                    Primero lo que falta en cada área, después lo que más nos sirve y lo que no calza entre tus respuestas.
                    Lo que quedó en blanco lo conversamos en la reunión.
                  </p>
                </header>

                {/* brief.js lo llena: el avance de cada área, lo que más nos
                    sirve y está vacío, lo que no calza y el resumen. */}
                <div className="brief-medidores" />
                <div className="brief-alertas" />
                <div className="brief-resumen" />

                <label className="brief-copia">
                  <input type="checkbox" name="copia" value="si" defaultChecked />
                  <span>
                    Enviarme una copia de mis respuestas a mi correo
                    <span className="brief-copia-detalle">Llega desde formulario@volutus.cl, con tu número de referencia.</span>
                  </span>
                </label>

                {/* Lo que identifica el envío (brief.js): el equipo, su
                    pantalla, su zona horaria y cuánto tardó en llenarlo. */}
                <input type="hidden" name="dispositivo" />
                <input type="hidden" name="pantalla" />
                <input type="hidden" name="zona" />
                <input type="hidden" name="idioma" />
                <input type="hidden" name="transcurrido" />

                {/* Trampa para robots, como la del contacto (Contacto.jsx). */}
                <div className="trampa" aria-hidden="true">
                  <label htmlFor="brief-hp_campo">No rellenes este campo</label>
                  <input id="brief-hp_campo" name="hp_campo" type="text" tabIndex={-1} autoComplete="new-password" />
                </div>

                <div className="turnstile" />

                <div className="brief-envio">
                  <a className="boton boton-secundario" href={anclaDe(total - 1)} data-anterior>
                    Anterior
                  </a>
                  <button className="boton boton-primario brief-enviar" type="submit">
                    Enviar brief
                  </button>
                </div>

                {/* El fallo del envío: las respuestas siguen aquí y en el
                    equipo, y hay dos salidas más. */}
                <div className="brief-fallo" role="alert" hidden>
                  <p className="brief-fallo-texto" />
                  <div className="brief-fallo-acciones">
                    <button className="boton boton-primario" type="submit">
                      Reintentar
                    </button>
                    <button className="boton boton-secundario" type="button" data-copiar>
                      Copiar mis respuestas
                    </button>
                  </div>
                  <p className="brief-fallo-correo">
                    O pégalas en un correo a <a href={`mailto:${CORREO_DE_CONTACTO}`}>{CORREO_DE_CONTACTO}</a>.
                  </p>
                </div>
              </section>
            </div>
          </form>

          <section className="brief-enviado" aria-labelledby="enviado-titulo" tabIndex={-1} hidden>
            <p className="brief-enviado-figuras" aria-hidden="true">
              <Figura area="marca" />
              <Figura area="diseno" />
            </p>
            <p className="antetitulo">Listo</p>
            <h2 id="enviado-titulo" className="titular">
              Recibimos tu brief
            </h2>
            <p className="brief-enviado-texto" />
            <p className="brief-enviado-siguiente">
              Lo leemos con calma y te escribimos para conversarlo. Si quieres sumar algo, responde al correo o escríbenos
              a <a href={`mailto:${CORREO_DE_CONTACTO}`}>{CORREO_DE_CONTACTO}</a>.
            </p>
          </section>
        </div>
      </section>
      {/* Las muestras de «Cómo se ve»: solo las usa esta página. */}
      <link rel="stylesheet" href="/brief/muestras.css" />
    </Pagina>
  )
}
