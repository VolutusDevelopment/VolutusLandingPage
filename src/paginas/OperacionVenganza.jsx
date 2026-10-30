import { ALTO, ANCHO } from '../lib/escena1.js'
import { FINALES } from '../lib/escena16.js'
import { CARGAS } from '../lib/cargas.js'
import * as nivel1 from '../lib/nivel1.js'
import * as nivel2 from '../lib/nivel2.js'
import * as nivel3 from '../lib/nivel3.js'

// Cada escena tiene su página; la que termina eligiendo, sus `finales`. Entre
// ellas, en su lugar, van los niveles jugables. Es el orden del juego: al
// terminar cada página sigue la próxima de la lista.
const ESCENAS = {
  '/operacion-venganza': { numero: 1, nombre: 'El portaaviones' },
  '/operacion-venganza/escena-2': { numero: 2, nombre: 'Patoon-4' },
  '/operacion-venganza/escena-3': { numero: 3, nombre: 'Despegue' },
  '/operacion-venganza/nivel-1': { nivel: 1, nombre: 'Duck-One', guion: nivel1 },
  '/operacion-venganza/escena-5': { numero: 5, nombre: 'Regreso' },
  '/operacion-venganza/escena-6': { numero: 6, nombre: 'Entrada' },
  '/operacion-venganza/nivel-2': { nivel: 2, nombre: 'Moby-Duck y Duke SkyDucker', guion: nivel2 },
  '/operacion-venganza/escena-9': { numero: 9, nombre: 'Retirada' },
  '/operacion-venganza/escena-10': { numero: 10, nombre: 'La última opción' },
  '/operacion-venganza/escena-11': { numero: 11, nombre: 'Preparativos' },
  '/operacion-venganza/nivel-3': { nivel: 3, nombre: 'Duky', guion: nivel3 },
  '/operacion-venganza/escena-13': { numero: 13, nombre: 'La sala de mando' },
  '/operacion-venganza/escena-14': { numero: 14, nombre: 'Último ataque' },
  '/operacion-venganza/escena-15': { numero: 15, nombre: 'El regreso del fantasma' },
  '/operacion-venganza/escena-16': { numero: 16, nombre: 'Desolación', finales: FINALES },
}

const DUCK_ONE = '/operacion-venganza/carga-duck-one'
const INDICE = '/operacion-venganza/indice'

const ENLACES = Object.keys(ESCENAS)
const siguienteDe = (enlace) => ENLACES[ENLACES.indexOf(enlace) + 1]
const enlaceDe = (numero) => ENLACES.find((enlace) => ESCENAS[enlace].numero === numero)

// Las escenas tras las que va un nivel.
const ANTES_DE_UN_NIVEL = ENLACES.filter((enlace) => ESCENAS[siguienteDe(enlace)]?.nivel).map((enlace) => ESCENAS[enlace].numero)

// La pantalla de carga que abre la escena `numero` y las escenas que corren
// desde ella hasta el fin de su grupo (lib/cargas.js), o hasta la que lleva a
// un nivel; sin grupo, duck-one y la escena sola.
function tramoDe(numero) {
  const [ruta, { escenas }] = Object.entries(CARGAS).find(([, { escenas }]) => escenas?.includes(numero)) ?? [DUCK_ONE, { escenas: [numero] }]
  const desde = escenas.slice(escenas.indexOf(numero))
  const hasta = desde.findIndex((n) => ANTES_DE_UN_NIVEL.includes(n))
  return { carga: CARGAS[ruta], escenas: hasta < 0 ? desde : desde.slice(0, hasta + 1) }
}

/**
 * Operación Venganza, el juego al que lleva el portaaviones de /nosotros.
 * Abre en la pantalla de carga de su grupo y abajo se llena la barra mientras
 * bajan las tomas. Después corren la escena de la página y las que le siguen
 * en el grupo, y al final sigue la próxima página del juego (un nivel o la
 * escena siguiente), salvo tras la 16, que lleva a Nosotros: se juega entero
 * sin pasar por el índice. Todo lo mueve src/operacion-venganza.js, que lee la
 * escena en `data-escena`; aquí está el HTML que espera.
 *
 * Es una sola pantalla, sin barra ni pie: el juego ocupa la vista. La tira de
 * duck-one va además en el CSS, así que empieza a bajar con la página. Las pantallas
 * de carga (lib/cargas.js) tienen también su página, para verlas solas, y
 * desde ella se llega al índice de todo.
 */
export default function OperacionVenganza({ ruta }) {
  if (ruta === INDICE) return <Indice />
  const carga = CARGAS[ruta]
  if (carga) return <PantallaDeCarga ruta={ruta} {...carga} />
  return ESCENAS[ruta].nivel ? <Nivel ruta={ruta} /> : <Escena ruta={ruta} />
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

function Pato({ tira, quieto, paso, destellos }) {
  return (
    <div className={`carga-pato${quieto ? ' carga-quieto' : ''}`} style={{ '--tira': `url('${tira}')`, animationDuration: paso && `${paso}s` }}>
      {destellos?.map(([x, y], k) => (
        <span key={k} className="carga-destello" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `-${(k * 0.37).toFixed(2)}s` }} />
      ))}
    </div>
  )
}

// La escena de la página y las que le siguen en su grupo, en `data-escena`;
// si la última termina eligiendo, sus `finales`, y si no, en `data-sigue`, la
// página que viene después de ella, adonde se va al terminar.
function Escena({ ruta }) {
  const { numero, nombre } = ESCENAS[ruta]
  const { carga, escenas } = tramoDe(numero)
  const ultima = enlaceDe(escenas.at(-1))
  const { finales } = ESCENAS[ultima]
  const sigue = finales ? undefined : siguienteDe(ultima)
  return (
    <main id="contenido" className="venganza" data-escena={escenas.join(' ')} data-sigue={sigue}>
      <h1 className="venganza-titulo">{`Operación Venganza, escena ${numero}: ${nombre}`}</h1>

      <Carga titulo={`Cargando la escena ${numero}`}>
        <Pato {...carga} />
      </Carga>

      <section className="escena" aria-label={`Escena ${numero}: ${nombre}`} hidden>
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

    </main>
  )
}

/**
 * Un nivel jugable: el combate de src/combate.js con el guion de `data-nivel`.
 * Se llega desde las escenas que lo preceden y, al terminar, sigue la escena
 * que viene después (`data-sigue`); también se puede saltar. El cielo se
 * pinta en el lienzo y todo lo demás flota encima: la portada, los PV, el
 * diálogo y los paneles de pausa y derrota.
 */
function Nivel({ ruta }) {
  const { nivel, nombre, guion } = ESCENAS[ruta]
  const sigue = siguienteDe(ruta)
  const saltar = (
    <a className="escena-boton" href={sigue}>
      Saltar nivel
    </a>
  )
  return (
    <main id="contenido" className="venganza nivel" data-nivel={nivel} data-sigue={sigue}>
      <h1 className="venganza-titulo">{`Operación Venganza, nivel ${nivel}: ${nombre}`}</h1>
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

      <section className="nivel-panel nivel-portada" aria-labelledby="nivel-portada">
        <p className="nivel-antetitulo">Operación Venganza</p>
        <h2 id="nivel-portada">{`NIVEL ${nivel} — ${nombre.toUpperCase()}.`}</h2>
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
        <noscript>
          <p>El nivel necesita JavaScript.</p>
        </noscript>
      </section>

      <section className="nivel-panel nivel-pausado" aria-labelledby="nivel-pausado" hidden>
        <h2 id="nivel-pausado">En pausa.</h2>
        <p className="escena-mandos">
          <button className="boton boton-primario nivel-seguir" type="button">
            Seguir jugando
          </button>
          {saltar}
        </p>
      </section>

      <section className="nivel-panel nivel-derrota" aria-labelledby="nivel-derrota" hidden>
        <p className="nivel-antetitulo">{nombre}</p>
        <h2 id="nivel-derrota">{guion.TRIUNFO}</h2>
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
        {Object.entries(ESCENAS).map(([enlace, escena]) => (
          <a key={enlace} href={enlace} aria-current={enlace === ruta ? 'page' : undefined}>
            <span className="fin-escenas-numero">{escena.nivel ? `Nivel ${escena.nivel}` : `Escena ${escena.numero}`}</span> {escena.nombre}
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
