import { UF } from '../data/uf.js'
import { ESTIMADOS, VARIABLES, eleccionInicial, estimar, numero, textosDe, uf } from '../lib/precios.js'
import { SERVICIOS } from '../lib/servicios.js'

/**
 * El estimado de precio de un servicio: se marca lo que se necesita y una
 * boleta lo suma al momento (estimado.js), con la fórmula del estándar de
 * precios (lib/precios.js). En cada página de servicio va justo después de
 * «Qué incluye», y en la guía de la ley de datos, al final. La dirección se
 * eligió en el lienzo de Design (decisión 49 del brief).
 *
 * Es un estimado y lo dice junto al precio: lo que necesita cada persona
 * puede cambiar el precio final, que llega en la cotización.
 *
 * Las opciones van en pasos numerados, con las pastillas del formulario de
 * contacto, y cada una lleva su precio a la vista. La boleta dice cada cosa
 * marcada con lo que suma, el total, cómo se paga y lo que cuesta al mes.
 * Desde L acompaña al bajar, a un lado; en S y M va después de las opciones,
 * y mientras se marca, una barra fija abajo muestra el total.
 *
 * Sin JavaScript la boleta se queda en el punto de partida, pero cada opción
 * lleva su precio y se puede sumar a mano; los botones − y + de las
 * cantidades llegan ocultos, y el número se escribe en su campo. Los textos
 * que cambian tienen su alto reservado (Estimado.css): Safari no parte las
 * líneas donde Chromium.
 *
 * Cada bloque entra por su cuenta (`.entra`), no el formulario entero: en S
 * mide más que la pantalla, y entraría tan despacio que sus casillas seguirían
 * corridas y a medio aparecer al tocarlas.
 *
 * Lo que se puede elegir viaja en `data-estimado`: así el navegador recibe
 * solo lo de este servicio y no el catálogo entero.
 *
 * `contacto` es a dónde lleva «Pedir esta cotización». Si es el formulario de
 * la misma página, llega con lo marcado escrito en el mensaje; donde no hay
 * formulario, lleva al de la portada.
 */
export default function Estimado({ servicio, contacto = '#contacto' }) {
  const estimado = ESTIMADOS[servicio]
  const { bases, extras, cuotas, planes, terceros } = estimado
  const { nombre } = SERVICIOS.find((s) => s.id === servicio)
  const textos = textosDe(estimar(estimado, eleccionInicial(estimado)))
  const escribeElMensaje = contacto === '#contacto'
  let paso = 0

  return (
    <section id="estimado" className="seccion zona-cielo" aria-labelledby="estimado-titulo">
      <div className="contenedor">
        <p className="antetitulo entra">Precio</p>
        <h2 id="estimado-titulo" className="estimado-titulo titular entra">
          Calcula un estimado
        </h2>
        <p className="estimado-bajada entra">Marca lo que necesitas: la boleta se arma sola, con cada cosa y lo que cuesta.</p>

        <form className="estimado" data-estimado={JSON.stringify(estimado)} data-servicio={nombre}>
          <div className="estimado-opciones">
            {bases.length > 1 ? (
              <Grupo paso={++paso} titulo="Parte con">
                {bases.map(({ id, nombre, horas }, i) => (
                  <Pastilla key={id} tipo="radio" nombre="base" valor={id} marcada={i === 0} precio={enUF(horas)}>
                    {nombre}
                  </Pastilla>
                ))}
              </Grupo>
            ) : (
              <div className="estimado-grupo entra">
                <p className="estimado-leyenda">
                  <span className="estimado-paso">{++paso}</span>Parte con
                </p>
                <p className="estimado-base">
                  {bases[0].nombre}
                  <span className="estimado-precio">{enUF(bases[0].horas)}</span>
                </p>
              </div>
            )}

            <Grupo paso={++paso} titulo="Suma">
              {extras.map((extra) =>
                extra.cantidad ? (
                  <Cantidad key={extra.id} extra={extra} />
                ) : (
                  <Pastilla key={extra.id} tipo="checkbox" nombre={extra.id} valor="1" precio={precioDe(extra)}>
                    {extra.nombre}
                  </Pastilla>
                )
              )}
              <Pastilla tipo="checkbox" nombre="urgente" valor="1" precio={`+${numero((VARIABLES.f_urgencia - 1) * 100)} %`}>
                Con urgencia
              </Pastilla>
            </Grupo>

            {cuotas.length > 0 && (
              <Grupo paso={++paso} titulo="Cómo pagas">
                <Pastilla tipo="radio" nombre="plazo" valor="0" marcada>
                  Pago total
                </Pastilla>
                {cuotas.map((plazo) => (
                  <Pastilla key={plazo} tipo="radio" nombre="plazo" valor={plazo} precio={`+${numero(VARIABLES.recargo_mes * plazo * 100)} %`}>
                    {plazo} cuotas
                  </Pastilla>
                ))}
              </Grupo>
            )}

            {planes.length > 0 && (
              <Grupo paso={paso + 1} titulo="Mantención">
                <Pastilla tipo="radio" nombre="plan" valor="" marcada>
                  Sin mantención
                </Pastilla>
                {planes.map((plan) => (
                  <Pastilla
                    key={plan.id}
                    tipo="radio"
                    nombre="plan"
                    valor={plan.id}
                    precio={plan.uf ? `${uf(plan.uf)}/mes` : `${numero(plan.pct * 100)} %/mes`}
                  >
                    {plan.nombre}
                  </Pastilla>
                ))}
              </Grupo>
            )}

            {/* En S y M la boleta queda después de las opciones: mientras se
                marca, esta barra se pega abajo con el total. Al terminar las
                opciones se queda en su sitio, justo encima de la boleta. */}
            <div className="estimado-barra">
              <p className="estimado-barra-texto">
                <span className="servicio-rotulo">Tu estimado</span>
                <span className="estimado-barra-cifra">
                  <strong data-salida="total">{textos.total}</strong> UF <small>+ IVA</small>
                </span>
              </p>
              <a className="boton boton-primario" href="#boleta">
                Ver detalle
              </a>
            </div>
          </div>

          <aside id="boleta" className="estimado-boleta entra" aria-labelledby="boleta-titulo">
            <p id="boleta-titulo" className="estimado-boleta-cabeza">
              <span>Tu estimado</span>
              <span>{nombre}</span>
            </p>
            <div className="estimado-boleta-cuerpo">
              <ul className="estimado-lineas" data-lineas>
                {textos.lineas.map(({ nombre, monto }) => (
                  <li key={nombre}>
                    <span>{nombre}</span>
                    <span className="estimado-relleno" aria-hidden="true" />
                    <span className="estimado-monto">{monto}</span>
                  </li>
                ))}
              </ul>

              <div className="estimado-total" aria-live="polite">
                <p className="servicio-rotulo">Desarrollo</p>
                <p className="estimado-cifra">
                  <strong data-salida="total">{textos.total}</strong> <span>UF</span> <small>+ IVA</small>
                </p>
                <p className="estimado-pesos" data-salida="pesos">
                  {textos.pesos}
                </p>
                <p className="estimado-uf">
                  UF del {diaDeLaUF}: {valorDeLaUF}
                </p>
              </div>

              <dl className="estimado-detalle">
                <div>
                  <dt>Pago</dt>
                  <dd data-salida="pago">{textos.pago}</dd>
                </div>
                <div>
                  <dt>Al mes</dt>
                  <dd data-salida="mes">{textos.mes}</dd>
                </div>
              </dl>

              <p className="estimado-aviso">
                <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span>
                  <strong>Es un estimado.</strong> Tus necesidades pueden cambiar el precio final: te lo confirmamos en
                  la cotización, cuando entendemos tu proyecto. Valores sin IVA.
                  {terceros && ` ${terceros}`}
                </span>
              </p>

              <a className="boton boton-primario estimado-pedir" href={contacto} data-pedir={escribeElMensaje || undefined}>
                Pedir esta cotización
              </a>
              {escribeElMensaje && <p className="estimado-nota">Llega al formulario con lo que marcaste.</p>}
            </div>
          </aside>
        </form>
      </div>
    </section>
  )
}

function Grupo({ paso, titulo, children }) {
  return (
    <fieldset className="opciones estimado-grupo entra">
      <legend className="estimado-leyenda">
        <span className="estimado-paso">{paso}</span>
        {titulo}
      </legend>
      <div className="chips">{children}</div>
    </fieldset>
  )
}

function Pastilla({ tipo, nombre, valor, marcada = false, precio, children }) {
  return (
    <label className="chip">
      <input type={tipo} name={nombre} value={valor} defaultChecked={marcada} />
      {children}
      {precio && <span className="estimado-precio">{precio}</span>}
    </label>
  )
}

// Una cantidad: su campo, y los botones − y +, que estimado.js muestra y
// engancha. Sin JavaScript se escribe el número.
function Cantidad({ extra: { id, nombre, horas, inicial = 0, max } }) {
  const campo = `estimado-${id}`
  return (
    <div className="estimado-cantidad">
      <label htmlFor={campo}>
        {nombre}
        <span className="estimado-precio">{enUF(horas)} c/u</span>
      </label>
      <button type="button" className="estimado-paso-boton" data-paso="-1" aria-controls={campo} aria-label={`${nombre}: uno menos`} hidden>
        −
      </button>
      <input id={campo} type="number" name={id} inputMode="numeric" min="0" max={max} defaultValue={inicial} />
      <button type="button" className="estimado-paso-boton" data-paso="1" aria-controls={campo} aria-label={`${nombre}: uno más`} hidden>
        +
      </button>
    </div>
  )
}

// Lo que suma una casilla, dicho como se cobra.
function precioDe({ horas, recargo, porPagina, mensual }) {
  if (recargo) return `+${numero(recargo * 100)} %`
  if (mensual) return `+${uf(mensual)}/mes`
  return `+${enUF(horas)}${porPagina ? ' por página' : ''}`
}

// Las horas del catálogo, en UF.
const enUF = (horas) => uf(horas * VARIABLES.tarifa)

// La UF con que se pasan los montos a pesos, con su día y su valor: «17 de
// octubre de 2026» y «$41.173,33». Es la última que trajo scripts/uf.mjs: si
// un día el scrapeo falla, el archivo no cambia y aquí sigue la anterior, con
// su fecha, así que lo que se lee siempre dice de cuándo es.
const diaDeLaUF = new Intl.DateTimeFormat('es-CL', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(UF.fecha))
const valorDeLaUF = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 2 }).format(
  UF.valor
)
