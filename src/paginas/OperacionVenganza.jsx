import { ALTO, LADO } from '../lib/escena1.js'
import { FINALES } from '../lib/escena16.js'
import { CARGAS } from '../lib/cargas.js'

// Cada escena tiene su página; la que termina eligiendo, sus `finales`.
const ESCENAS = {
  '/operacion-venganza': { numero: 1, nombre: 'El portaaviones' },
  '/operacion-venganza/escena-2': { numero: 2, nombre: 'Patoon-4' },
  '/operacion-venganza/escena-3': { numero: 3, nombre: 'Despegue' },
  '/operacion-venganza/escena-5': { numero: 5, nombre: 'Regreso' },
  '/operacion-venganza/escena-6': { numero: 6, nombre: 'Entrada' },
  '/operacion-venganza/escena-9': { numero: 9, nombre: 'Retirada' },
  '/operacion-venganza/escena-10': { numero: 10, nombre: 'La última opción' },
  '/operacion-venganza/escena-11': { numero: 11, nombre: 'Preparativos' },
  '/operacion-venganza/escena-13': { numero: 13, nombre: 'La sala de mando' },
  '/operacion-venganza/escena-14': { numero: 14, nombre: 'Último ataque' },
  '/operacion-venganza/escena-15': { numero: 15, nombre: 'El regreso del fantasma' },
  '/operacion-venganza/escena-16': { numero: 16, nombre: 'Desolación', finales: FINALES },
}

/**
 * Operación Venganza, el juego al que lleva el portaaviones de /nosotros.
 * Abre en la pantalla de carga: duck-one camina de tres cuartos y abajo se
 * llena la barra mientras bajan las tomas. Después corre la escena de la
 * página, y al final están todas las escenas construidas, para saltar a
 * otra, y se puede volver a verla o volver a Nosotros. Todo lo
 * mueve src/operacion-venganza.js, que lee la escena en `data-escena`; aquí
 * está el HTML que espera.
 *
 * Es una sola pantalla, sin barra ni pie: el juego ocupa la vista. La tira de
 * duck-one va en el CSS, así que empieza a bajar con la página. Las pantallas
 * de carga (lib/cargas.js) tienen también su página, para verlas solas.
 */
export default function OperacionVenganza({ ruta }) {
  const carga = CARGAS[ruta]
  return carga ? <PantallaDeCarga ruta={ruta} {...carga} /> : <Escena ruta={ruta} />
}

/**
 * Una pantalla de carga sola, para verla desde el índice: la barra se llena
 * una y otra vez hasta que se pide el índice.
 * La tira va en `--tira`; los marineros, cada uno en su fila, cruzan la vista.
 */
function PantallaDeCarga({ ruta, nombre, tira, quieto, paso, destellos, corredores }) {
  return (
    <main id="contenido" className="venganza" data-carga={ruta}>
      <h1 className="venganza-titulo">{`Operación Venganza, pantalla de carga: ${nombre}`}</h1>
      <Carga
        titulo={`Pantalla de carga: ${nombre}`}
        salir={
          <button className="escena-boton carga-salir" type="button">
            Ver el índice
          </button>
        }
      >
        {corredores?.map(({ tira, alto, s, demora, derecha }, k) => (
          <div
            key={tira}
            className={`carga-pato carga-cruza${derecha ? '' : ' carga-izquierda'}`}
            style={{
              '--tira': `url('${tira}')`,
              '--columna': k / (corredores.length - 1),
              top: `${alto * 100}%`,
              animationDuration: `0.8s, ${s}s`,
              animationDelay: `0s, -${demora}s`,
            }}
            aria-hidden="true"
          />
        ))}
        {tira && (
          <div className={`carga-pato${quieto ? ' carga-quieto' : ''}`} style={{ '--tira': `url('${tira}')`, animationDuration: paso && `${paso}s` }}>
            {destellos?.map(([x, y], k) => (
              <span key={k} className="carga-destello" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `-${(k * 0.37).toFixed(2)}s` }} />
            ))}
          </div>
        )}
      </Carga>
      <Fin ruta={ruta} titulo="Fin de la pantalla de carga" />
    </main>
  )
}

function Escena({ ruta }) {
  const { numero, nombre, finales } = ESCENAS[ruta]
  return (
    <main id="contenido" className="venganza" data-escena={numero}>
      <h1 className="venganza-titulo">{`Operación Venganza, escena ${numero}: ${nombre}`}</h1>

      <Carga titulo={`Cargando la escena ${numero}`}>
        <div className="carga-pato" />
      </Carga>

      <section className="escena" aria-label={`Escena ${numero}: ${nombre}`} hidden>
        <canvas className="escena-cuadro" width={LADO} height={ALTO} aria-hidden="true" />
        <div className="escena-linea" aria-live="polite">
          <p className="escena-quien" />
          <p className="escena-texto" />
        </div>
        <p className="escena-mandos">
          <button className="escena-boton escena-siguiente" type="button">
            Siguiente
          </button>
          <button className="escena-boton escena-saltar" type="button">
            Saltar escena
          </button>
        </p>
        {finales && (
          <p className="escena-mandos escena-eleccion" hidden>
            {Object.entries(finales).map(([final, { boton }]) => (
              <button key={final} className="escena-boton" type="button" data-final={final}>
                {boton}
              </button>
            ))}
          </p>
        )}
      </section>

      <Fin ruta={ruta} titulo={`Fin de la escena ${numero}`} />
    </main>
  )
}

function Carga({ titulo, salir, children }) {
  return (
    <section className="carga" aria-label={titulo}>
      {children}
      <div className="carga-barra" role="progressbar" aria-label="Cargando la escena" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <div className="carga-llena" />
      </div>
      <p className="carga-texto">Cargando</p>
      {salir}
      <noscript>
        <p className="carga-texto">La escena necesita JavaScript.</p>
      </noscript>
    </section>
  )
}

// El fin: el índice de las escenas y, en un desplegable, el de las pantallas
// de carga, abierto cuando se viene de una.
function Fin({ ruta, titulo }) {
  return (
    <section className="fin" aria-label={titulo} hidden>
      <h2 className="titular">{titulo}</h2>
      <nav className="fin-escenas" aria-label="Escenas">
        {Object.entries(ESCENAS).map(([enlace, escena]) => (
          <a key={enlace} href={enlace} aria-current={enlace === ruta ? 'page' : undefined}>
            <span className="fin-escenas-numero">{`Escena ${escena.numero}`}</span> {escena.nombre}
          </a>
        ))}
        <details className="fin-cargas" open={ruta in CARGAS}>
          <summary>Pantallas de carga</summary>
          {Object.entries(CARGAS).map(([enlace, { nombre }]) => (
            <a key={enlace} href={enlace} aria-current={enlace === ruta ? 'page' : undefined}>
              {nombre}
            </a>
          ))}
        </details>
      </nav>
      <p className="escena-mandos">
        <a className="boton boton-primario" href="/nosotros">
          Volver a Nosotros
        </a>
        <button className="escena-boton fin-otra-vez" type="button">
          Ver otra vez
        </button>
      </p>
    </section>
  )
}
