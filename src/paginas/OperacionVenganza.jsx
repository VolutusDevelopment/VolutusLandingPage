import { ALTO, LADO } from '../lib/escena1.js'

// Cada escena tiene su página.
const ESCENAS = {
  '/operacion-venganza': { numero: 1, nombre: 'El portaaviones' },
  '/operacion-venganza/escena-2': { numero: 2, nombre: 'Patoon-4' },
  '/operacion-venganza/escena-3': { numero: 3, nombre: 'Despegue' },
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
 * duck-one va en el CSS, así que empieza a bajar con la página.
 */
export default function OperacionVenganza({ ruta }) {
  const { numero, nombre } = ESCENAS[ruta]
  return (
    <main id="contenido" className="venganza" data-escena={numero}>
      <h1 className="venganza-titulo">{`Operación Venganza, escena ${numero}: ${nombre}`}</h1>

      <section className="carga" aria-label={`Cargando la escena ${numero}`}>
        <div className="carga-pato" />
        <div className="carga-barra" role="progressbar" aria-label="Cargando la escena" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div className="carga-llena" />
        </div>
        <p className="carga-texto">Cargando</p>
        <noscript>
          <p className="carga-texto">La escena necesita JavaScript.</p>
        </noscript>
      </section>

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
      </section>

      <section className="fin" aria-label={`Fin de la escena ${numero}`} hidden>
        <h2 className="titular">{`Fin de la escena ${numero}`}</h2>
        <nav className="fin-escenas" aria-label="Escenas">
          {Object.entries(ESCENAS).map(([enlace, escena]) => (
            <a key={enlace} href={enlace} aria-current={enlace === ruta ? 'page' : undefined}>
              <span className="fin-escenas-numero">{`Escena ${escena.numero}`}</span> {escena.nombre}
            </a>
          ))}
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
    </main>
  )
}
