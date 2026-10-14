/**
 * El podio de los logros, en pixel art al estilo de los juegos de Nitrome: un
 * castillo de noche, con almenas, estandartes con el puesto y antorchas, y
 * debajo la tabla de honor, como la pantalla de puntajes de un juego.
 *
 * Los sprites son mapas de texto (un carácter por píxel) o rectángulos
 * calculados, que se convierten en `<rect>` al prerenderizar: no hay imágenes
 * que descargar y escalan nítidos a cualquier tamaño. Cada columna del podio
 * es una pestaña; el cartel de abajo cuenta el logro elegido, y la tabla elige
 * lo mismo al tocar una fila (src/podio.js). Sin JavaScript se ven todos los
 * carteles (ver SIN_SCRIPT) y el contenido sigue en el HTML para los
 * buscadores.
 */

const CONTORNO = '#2a1d3d'

// Una fila de píxeles iguales es un solo `<rect>`: el trofeo baja de ~200
// nodos a ~60.
function Sprite({ mapa, paleta, className }) {
  const rects = []
  mapa.forEach((fila, y) => {
    let x = 0
    while (x < fila.length) {
      const c = fila[x]
      let fin = x
      while (fila[fin + 1] === c) fin++
      if (paleta[c]) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={fin - x + 1} height={1} fill={paleta[c]} />)
      x = fin + 1
    }
  })
  const ancho = mapa[0].length
  return (
    <svg
      className={className}
      viewBox={`0 0 ${ancho} ${mapa.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ '--ancho': ancho }}
    >
      {rects}
    </svg>
  )
}

// Un lienzo de rectángulos: `r(x, y, ancho, alto, color)` agrega uno.
function lienzo() {
  const rects = []
  const r = (x, y, w, h, fill) => rects.push(<rect key={rects.length} x={x} y={y} width={w} height={h} fill={fill} />)
  return { rects, r }
}

const TROFEO = [
  '..oooooooooooo..',
  'ooowygggggggdooo',
  'o.owygggggggdo.o',
  'o.oyyggggggddo.o',
  '.ooyyggggggddoo.',
  '..oyyggggggddo..',
  '..ooyggggddoo...',
  '...ooyggggdoo...',
  '.....oyggdo.....',
  '......ogdo......',
  '......ogdo......',
  '.....oyggdo.....',
  '....oooooooo....',
  '....oyggggdo....',
  '...oppppppppo...',
  '...oooooooooo...',
]

const MEDALLA = [
  'ooo......ooo',
  'orbo....obro',
  '.orbo..obro.',
  '..orboobro..',
  '...orbbro...',
  '...oooooo...',
  '..owllllso..',
  '.owlllllsso.',
  '.ollllllsso.',
  '.ollllllsso.',
  '.ollllllsso.',
  '.ollllsssso.',
  '..olsssddo..',
  '...oooooo...',
]

const LUNA = [
  '...oooo...',
  '..owwwwo..',
  '.owwwwsso.',
  'owwwwwssso',
  'owwwwwwsso',
  'owwswwwwso',
  'owwwwwwwso',
  '.owwwwwso.',
  '..oossoo..',
  '...oooo...',
]

const SPRITES = {
  oro: {
    mapa: TROFEO,
    paleta: { o: CONTORNO, w: '#fffbe6', y: '#ffe066', g: '#f7b928', d: '#c9771a', p: '#7b4bc4' },
  },
  plata: {
    mapa: MEDALLA,
    paleta: { o: CONTORNO, r: '#ff4f6d', b: '#3d8bff', w: '#ffffff', l: '#e6ecf5', s: '#a9b6c9', d: '#6f7d96' },
  },
}

// Dígitos de 5×7: el puesto se pinta en el estandarte.
const DIGITOS = {
  1: ['..x..', '.xx..', '..x..', '..x..', '..x..', '..x..', '.xxx.'],
  2: ['.xxx.', 'x...x', '....x', '...x.', '..x..', '.x...', 'xxxxx'],
  3: ['xxxx.', '....x', '....x', '.xxx.', '....x', '....x', 'xxxx.'],
}

// El oro mide 34 de ancho y no 32: pisa un píxel de cada vecino, porque dos
// contornos juntos se leían como una raya el doble de gruesa.
const TORRES = {
  oro: { ancho: 34, alto: 33, tela: ['#ffcc33', '#e09a12', '#fff0a8'], largo: 20 },
  plata: { ancho: 32, alto: 24, tela: ['#c9d3e6', '#8a97b3', '#ffffff'], largo: 15 },
}

const PIEDRA = { luz: '#a3a9c2', cara: '#7a809b', sombra: '#555a75', junta: '#4b4f6b' }

/**
 * La torre de cada puesto: almenas arriba, piedra con juntas alternadas y un
 * estandarte del metal del puesto, con su número.
 */
function Torre({ metal, puesto }) {
  const t = TORRES[metal]
  const { rects, r } = lienzo()
  const w = t.ancho
  const top = 4

  for (let x = 0; x < w - 1; x += 8) {
    r(x, 0, 6, 5, CONTORNO)
    r(x + 1, 1, 4, 4, PIEDRA.luz)
  }
  r(0, top, w, t.alto, CONTORNO)
  r(1, top + 1, w - 2, t.alto - 1, PIEDRA.cara)
  r(1, top + 1, w - 2, 2, PIEDRA.luz)
  r(w - 3, top + 3, 2, t.alto - 3, PIEDRA.sombra)
  for (let y = top + 7, fila = 0; y < top + t.alto; y += 5, fila++) {
    r(1, y, w - 2, 1, PIEDRA.junta)
    for (let x = fila % 2 ? 5 : 10; x < w - 2; x += 10) r(x, y - 4, 1, 4, PIEDRA.junta)
  }

  // El estandarte, colgado de su vara, con la punta en V.
  const [tela, sombra, luz] = t.tela
  const bw = 11
  const bx = Math.floor((w - bw) / 2)
  const by = top + 3
  r(bx - 2, by - 2, bw + 4, 1, '#6b3d1c')
  r(bx - 1, by - 1, bw + 2, t.largo + 1, CONTORNO)
  r(bx, by, bw, t.largo, tela)
  r(bx, by, 1, t.largo, luz)
  r(bx + bw - 1, by, 1, t.largo, sombra)
  for (let i = 0; i < 4; i++) {
    r(bx + 1 + i, by + t.largo + i, bw - 2 - i * 2, 1, tela)
    r(bx + i, by + t.largo + i, 1, 1, CONTORNO)
    r(bx + bw - 1 - i, by + t.largo + i, 1, 1, CONTORNO)
  }
  r(bx + 4, by + t.largo + 3, 3, 1, CONTORNO)
  const glifo = DIGITOS[puesto] ?? DIGITOS[2]
  const gy = by + (metal === 'oro' ? 6 : 4)
  glifo.forEach((fila, y) => [...fila].forEach((c, x) => c === 'x' && r(bx + 3 + x, gy + y, 1, 1, CONTORNO)))

  return (
    <svg
      className="podio-bloque"
      viewBox={`0 0 ${w} ${top + t.alto}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ '--ancho': w }}
    >
      {rects}
    </svg>
  )
}

const ESTRELLAS = [
  [6, 6], [18, 20], [30, 8], [44, 26], [58, 4], [70, 18], [84, 30], [100, 24],
  [112, 10], [8, 40], [26, 34], [110, 44], [64, 36], [38, 48], [92, 52],
]

/**
 * El fondo: el cielo de noche con la luna, la muralla con sus ventanas
 * encendidas y dos antorchas. Mide 120 × 90 píxeles y se apoya en el suelo:
 * si la escena es más alta, arriba sigue el color del cielo.
 */
function Fondo() {
  const { rects, r } = lienzo()
  const base = 90
  ;['#120b26', '#170f31', '#1d143d', '#241a49', '#2c2156', '#352964'].forEach((c, i) => r(0, i * 15, 120, 16, c))
  ESTRELLAS.forEach(([x, y], i) => {
    r(x, y, 1, 1, i % 3 ? '#bfb3ff' : '#ffffff')
    if (i % 4 === 0) {
      r(x - 1, y, 1, 1, '#6c5fb0')
      r(x + 1, y, 1, 1, '#6c5fb0')
      r(x, y - 1, 1, 1, '#6c5fb0')
      r(x, y + 1, 1, 1, '#6c5fb0')
    }
  })
  const paletaLuna = { o: '#2c2156', w: '#fff6c9', s: '#e8d98a' }
  LUNA.forEach((fila, y) => [...fila].forEach((c, x) => paletaLuna[c] && r(98 + x, 6 + y, 1, 1, paletaLuna[c])))

  r(0, base - 18, 120, 18, '#1f1840')
  for (let x = 0; x < 120; x += 8) r(x, base - 22, 4, 4, '#1f1840')
  for (let x = 4; x < 120; x += 16) r(x, base - 12, 2, 3, '#ffcc33')

  for (const x of [4, 113]) {
    r(x, base - 14, 3, 14, CONTORNO)
    r(x + 1, base - 13, 1, 13, '#8a5a2b')
    r(x - 1, base - 16, 5, 3, CONTORNO)
    r(x, base - 16, 3, 2, '#5a3a20')
  }

  return (
    <svg className="podio-fondo" viewBox="0 0 120 90" shapeRendering="crispEdges" aria-hidden="true">
      {rects}
    </svg>
  )
}

const LLAMA = { mapa: ['.o.', 'oyo', 'ywy', 'oyo'], paleta: { o: '#ff6a1c', y: '#ffcc33', w: '#fff6c9' } }

// Las llamas van aparte del fondo para poder parpadear.
function Antorcha({ lado }) {
  return <Sprite className={`podio-llama podio-llama-${lado}`} {...LLAMA} />
}

function Destellos() {
  return (
    <span className="podio-destellos" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  )
}

function Enlace({ href, children, nombre }) {
  if (!href) return null
  return (
    <a href={href} rel="noopener" className="podio-boton">
      {children}
      <span className="solo-lectores"> de {nombre}</span>
    </a>
  )
}

const lugar = (logro) => parseInt(logro.credencial.puesto)

// El primero al centro y los demás a los lados, como en un podio de verdad.
function ordenar(porPuesto) {
  const orden = []
  porPuesto.forEach((logro, i) => (i % 2 ? orden.unshift(logro) : orden.push(logro)))
  return orden
}

// El año, si el evento o el nombre lo dicen. No se inventa: sin año, la
// columna queda vacía.
const anio = (logro) => (`${logro.credencial.evento} ${logro.nombre}`.match(/\b(19|20)\d{2}\b/) ?? [''])[0]

// Sin JavaScript no hay pestañas que cambiar: se ven todos los carteles.
const SIN_SCRIPT = `
.podio-cartel[hidden] { display: block !important; }
.podio-cartel + .podio-cartel { margin-top: var(--e-8); }
.podio-tabla li { cursor: default !important; }
`

export default function Podio({ logros }) {
  const porPuesto = [...logros].sort((a, b) => lugar(a) - lugar(b))
  const columnas = ordenar(porPuesto)
  const elegido = porPuesto[0]

  return (
    <div className="podio" data-podio>
      <div className="podio-marco">
        <Fondo />
        <Antorcha lado="izquierda" />
        <Antorcha lado="derecha" />
        <div className="podio-escena" role="tablist" aria-label="Logros con jurado externo">
          {columnas.map((logro) => {
            const { metal, titulo, evento } = logro.credencial
            const activo = logro === elegido
            return (
              <button
                key={logro.id}
                type="button"
                role="tab"
                id={`podio-${logro.id}`}
                className={`podio-columna podio-${metal}`}
                aria-selected={activo}
                aria-controls={`cartel-${logro.id}`}
                tabIndex={activo ? 0 : -1}
              >
                <span className="podio-flecha" aria-hidden="true" />
                <span className="podio-premio">
                  {metal === 'oro' && <Destellos />}
                  <Sprite className="podio-sprite" {...SPRITES[metal]} />
                </span>
                <Torre metal={metal} puesto={lugar(logro)} />
                <span className="solo-lectores">
                  {titulo}: {logro.nombre}, {evento}
                </span>
              </button>
            )
          })}
        </div>
        <div className="podio-suelo" aria-hidden="true" />
      </div>

      {/* La tabla repite lo que ya dicen las pestañas, así que se esconde a
          los lectores de pantalla: es un atajo para el dedo y el ratón. */}
      <div className="podio-honor" aria-hidden="true">
        <p className="podio-honor-titulo">TABLA DE HONOR</p>
        <ol className="podio-tabla">
          {porPuesto.map((logro) => (
            <li key={logro.id} data-elegir={logro.id} className={logro === elegido ? 'es-elegido' : undefined}>
              <span className="podio-tabla-cursor">▶</span>
              <span className={`podio-tabla-puesto podio-tabla-${logro.credencial.metal}`}>
                {lugar(logro)}
                <span className="podio-grado">°</span>
              </span>
              <span className="podio-tabla-nombre">{logro.credencial.corto ?? logro.nombre}</span>
              <span className="podio-tabla-anio">{anio(logro)}</span>
            </li>
          ))}
        </ol>
      </div>

      {columnas.map((logro) => (
        <article
          key={logro.id}
          id={`cartel-${logro.id}`}
          className={`podio-cartel podio-cartel-${logro.credencial.metal}`}
          role="tabpanel"
          aria-labelledby={`podio-${logro.id}`}
          hidden={logro !== elegido}
        >
          <p className="podio-puesto dato">
            <span className="podio-insignia">{logro.credencial.puesto}</span>
            {logro.credencial.titulo}
          </p>
          <h3>{logro.nombre}</h3>
          <p className="podio-evento dato">{logro.credencial.evento}</p>
          <p className="podio-resumen">{logro.resumen}</p>
          {(logro.repositorio || logro.publicacion || logro.sitio) && (
            <p className="podio-enlaces">
              <Enlace href={logro.sitio} nombre={logro.nombre}>
                Abrir el sitio
              </Enlace>
              <Enlace href={logro.repositorio} nombre={logro.nombre}>
                Ver el código
              </Enlace>
              <Enlace href={logro.publicacion} nombre={logro.nombre}>
                Ver la publicación
              </Enlace>
            </p>
          )}
        </article>
      ))}
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: SIN_SCRIPT }} />
      </noscript>
    </div>
  )
}
