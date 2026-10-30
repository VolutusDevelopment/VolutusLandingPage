import { ALTO, ANCHO } from '../lib/escena1.js'
import { FINALES } from '../lib/escena16.js'
import { CARGAS } from '../lib/cargas.js'
import { NIVELES, PAGINAS, siguienteDe } from '../lib/juego.js'

const INDICE = '/operacion-venganza/indice'

// Los que caminan en la pantalla de carga del juego: uno al azar, que elige
// operacion-venganza.js.
const CAMINANTES = Object.values(CARGAS).filter(({ tira }) => tira)

/**
 * Operación Venganza, el juego al que lleva el portaaviones de /nosotros.
 * Cada escena y cada nivel (lib/juego.js) tiene su página, y en todas está el
 * juego entero, que empieza en ella: la pantalla de carga, con uno de los
 * personajes caminando mientras se llena la barra con todo lo del juego, las
 * escenas y los niveles. Ya cargado, corre de una página a otra sin volver a
 * cargar, hasta la 16, que lleva a Nosotros. Todo lo mueve
 * src/operacion-venganza.js, que empieza en `data-desde`; aquí está el HTML
 * que espera.
 *
 * Es una sola pantalla, sin barra ni pie: el juego ocupa la vista. Las
 * pantallas de carga (lib/cargas.js) tienen también su página, para verlas
 * solas, y desde ella se llega al índice de todo.
 */
export default function OperacionVenganza({ ruta }) {
  if (ruta === INDICE) return <Indice />
  const carga = CARGAS[ruta]
  if (carga) return <PantallaDeCarga ruta={ruta} {...carga} />
  return <Juego ruta={ruta} />
}

/**
 * Una pantalla de carga sola, para verla desde el índice: la barra se llena
 * con las tiras de sus escenas y queda llena hasta que se pide el índice.
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
        {tira && <Pato tira={tira} quieto={quieto} paso={paso} destellos={destellos} />}
      </Carga>
      <Fin ruta={ruta} titulo="Fin de la pantalla de carga" />
    </main>
  )
}

function Pato({ tira, quieto, paso, destellos, escondido }) {
  return (
    <div className={`carga-pato${quieto ? ' carga-quieto' : ''}`} style={{ '--tira': `url('${tira}')`, animationDuration: paso && `${paso}s` }} hidden={escondido}>
      {destellos?.map(([x, y], k) => (
        <span key={k} className="carga-destello" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `-${(k * 0.37).toFixed(2)}s` }} />
      ))}
    </div>
  )
}

// El juego desde `ruta`. En la carga están todos los que caminan, escondidos,
// en una caja de su tamaño: el JS muestra uno y nada se mueve. Después, la
// sección de las escenas y la de cada nivel, escondidas, se turnan.
function Juego({ ruta }) {
  const { numero, nivel, nombre } = PAGINAS[ruta]
  return (
    <main id="contenido" className="venganza" data-desde={ruta}>
      <h1 className="venganza-titulo">{`Operación Venganza, ${nivel ? `nivel ${nivel}` : `escena ${numero}`}: ${nombre}`}</h1>

      <Carga titulo="Cargando Operación Venganza">
        <div className="carga-caminantes">
          {CAMINANTES.map((carga) => (
            <Pato key={carga.tira} {...carga} escondido />
          ))}
        </div>
      </Carga>

      <Escenas />
      {Object.entries(PAGINAS)
        .filter(([, pagina]) => pagina.nivel)
        .map(([enlace, pagina]) => (
          <Nivel key={enlace} enlace={enlace} {...pagina} />
        ))}
    </main>
  )
}

// Las escenas, en un lienzo. Los finales de la 16, un menú sobre el cuadro.
function Escenas() {
  return (
    <section className="escena" aria-label="Escenas" hidden>
      <canvas className="escena-cuadro" width={ANCHO} height={ALTO} aria-hidden="true" />
      <div className="escena-linea" aria-live="polite">
        <p className="escena-quien" />
        <p className="escena-texto" />
      </div>
      <p className="escena-mandos">
        <button className="escena-boton escena-saltar" type="button">
          Saltar escena
        </button>
        <button className="escena-boton escena-siguiente" type="button">
          Siguiente
        </button>
      </p>
      <div className="escena-eleccion" role="group" aria-label="El destino del Sitting Ducks" hidden>
        {Object.entries(FINALES).map(([final, { boton }]) => (
          <button key={final} className="escena-opcion" type="button" data-final={final}>
            {boton}
          </button>
        ))}
      </div>
    </section>
  )
}

/**
 * Un nivel jugable: el combate de src/combate.js con el guion de `data-nivel`.
 * Llega desde las escenas que lo preceden y, al terminar, siguen las que vienen
 * después; también se puede saltar (sin JS, el enlace lleva a la página de la
 * escena siguiente). El cielo se pinta en el lienzo y todo lo demás flota
 * encima: la portada, los PV, el diálogo y los paneles de pausa y derrota.
 */
function Nivel({ enlace, nivel, nombre }) {
  const guion = NIVELES[nivel]
  const id = (parte) => `nivel-${nivel}-${parte}`
  const saltar = (
    <a className="escena-boton" href={siguienteDe(enlace)}>
      Saltar nivel
    </a>
  )
  return (
    <section className="nivel" data-nivel={nivel} aria-label={`Nivel ${nivel}: ${nombre}`} hidden>
      <canvas className="nivel-cielo" aria-hidden="true" />
      <div className="banda banda-arriba" aria-hidden="true" />
      <div className="banda banda-abajo" aria-hidden="true" />

      <header className="nivel-arriba">
        <p className="nivel-nombre">{`Nivel ${nivel} · ${nombre}`}</p>
        <button className="escena-boton nivel-pausa" type="button" aria-pressed="false">
          Pausa
        </button>
      </header>
      <p className="nivel-rotulo" aria-live="polite" />
      <p className="nivel-pv" hidden>
        PV
        <span className="nivel-pv-barra">
          <span className="nivel-pv-lleno" />
        </span>
        <span className="nivel-pv-numero" />
      </p>

      <button className="nivel-dialogo" type="button" hidden>
        <span className="nivel-quien" />
        <span className="nivel-texto">
          <span className="nivel-dicho" />
          <span className="nivel-falta" />
        </span>
        <span className="nivel-pista">Seguir ▸</span>
      </button>
      <p className="venganza-titulo nivel-leido" aria-live="polite" />
      <canvas className="nivel-jugador" width="9" height="15" aria-hidden="true" hidden />

      <section className="nivel-panel nivel-portada" aria-labelledby={id('portada')}>
        <p className="nivel-antetitulo">Operación Venganza</p>
        <h2 id={id('portada')}>{`NIVEL ${nivel} — ${nombre.toUpperCase()}.`}</h2>
        <p className="nivel-lema">{guion.LEMA}</p>
        <p>{guion.INTRO}</p>
        <p className="nivel-controles">
          Ratón: mueve el cursor
          <br />
          Pantalla táctil: arrastra en cualquier parte
          <br />
          Teclado: flechas · Esc para pausar
        </p>
        <p className="escena-mandos">
          <button className="boton boton-primario nivel-jugar" type="button">
            Jugar
          </button>
          {saltar}
        </p>
      </section>

      <section className="nivel-panel nivel-pausado" aria-labelledby={id('pausado')} hidden>
        <h2 id={id('pausado')}>En pausa.</h2>
        <p className="escena-mandos">
          <button className="boton boton-primario nivel-seguir" type="button">
            Seguir jugando
          </button>
          {saltar}
        </p>
      </section>

      <section className="nivel-panel nivel-derrota" aria-labelledby={id('derrota')} hidden>
        <p className="nivel-antetitulo">{nombre}</p>
        <h2 id={id('derrota')}>{guion.TRIUNFO}</h2>
        <p>
          Te derribaron en la vista «<span className="nivel-derrota-vista" />».
        </p>
        <p className="escena-mandos">
          <button className="boton boton-primario nivel-reintentar" type="button">
            Reintentar esta vista
          </button>
          <button className="escena-boton nivel-principio" type="button">
            Desde el principio
          </button>
          {saltar}
        </p>
      </section>
    </section>
  )
}

function Carga({ titulo, salir, children }) {
  return (
    <section className="carga" aria-label={titulo}>
      {children}
      <div className="carga-barra" role="progressbar" aria-label="Cargando el juego" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <div className="carga-llena" />
      </div>
      <p className="carga-texto">Cargando</p>
      {salir}
      <noscript>
        <p className="carga-texto">El juego necesita JavaScript.</p>
      </noscript>
    </section>
  )
}

// El índice en su propia página, para entrar a cualquier escena, nivel o
// pantalla de carga sin jugar desde el principio. `data-indice` le dice a
// client.js que aquí no baja el juego.
function Indice() {
  return (
    <main id="contenido" className="venganza" data-indice>
      <h1 className="venganza-titulo">Operación Venganza: índice</h1>
      <Fin titulo="Índice" visible />
    </main>
  )
}

// El fin: el índice de las escenas y, en un desplegable, el de las pantallas
// de carga, abierto cuando se viene de una. `visible` es el de la página del
// índice, que se ve de entrada y no tiene nada que ver otra vez.
function Fin({ ruta, titulo, visible }) {
  return (
    <section className="fin" aria-label={titulo} hidden={!visible}>
      <h2 className="titular">{titulo}</h2>
      <nav className="fin-escenas" aria-label="Escenas">
        {Object.entries(PAGINAS).map(([enlace, pagina]) => (
          <a key={enlace} href={enlace} aria-current={enlace === ruta ? 'page' : undefined}>
            <span className="fin-escenas-numero">{pagina.nivel ? `Nivel ${pagina.nivel}` : `Escena ${pagina.numero}`}</span> {pagina.nombre}
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
        {!visible && (
          <button className="escena-boton fin-otra-vez" type="button">
            Ver otra vez
          </button>
        )}
      </p>
    </section>
  )
}
