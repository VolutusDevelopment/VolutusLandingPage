import { ALTO, LADO } from '../lib/escena1.js'

/**
 * Operación Venganza, el juego al que lleva el portaaviones de /nosotros.
 * Abre en la pantalla de carga: duck-one camina de tres cuartos y abajo se
 * llena la barra mientras bajan las tomas. Después corre la escena 1, «El
 * portaaviones», y al final se puede volver a verla o volver a Nosotros. Todo
 * lo mueve src/operacion-venganza.js; aquí está el HTML que espera.
 *
 * Es una sola pantalla, sin barra ni pie: el juego ocupa la vista. La tira de
 * duck-one va en el CSS, así que empieza a bajar con la página.
 */
export default function OperacionVenganza() {
  return (
    <main id="contenido" className="venganza">
      <h1 className="venganza-titulo">Operación Venganza</h1>

      <section className="carga" aria-label="Cargando la escena 1">
        <div className="carga-pato" />
        <div className="carga-barra" role="progressbar" aria-label="Cargando la escena" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div className="carga-llena" />
        </div>
        <p className="carga-texto">Cargando</p>
        <noscript>
          <p className="carga-texto">La escena necesita JavaScript.</p>
        </noscript>
      </section>

      <section className="escena" aria-label="Escena 1: El portaaviones" hidden>
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

      <section className="fin" aria-label="Fin de la escena 1" hidden>
        <h2 className="titular">Fin de la escena 1</h2>
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
