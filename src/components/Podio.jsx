/**
 * El podio de los logros, en pixel art al estilo de los juegos de Nitrome: un
 * castillo de día sobre una isla que flota entre las nubes, con almenas,
 * estandartes con el puesto y dos torrecillas, y debajo la tabla de honor,
 * como la pantalla de puntajes de un juego.
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

const SOL = [
  '.......r.......',
  '.r.....r.....r.',
  '..r.........r..',
  '.....ooooo.....',
  '....owwwwyo....',
  '...owwwwwyyo...',
  'rr.owwwwwwyo.rr',
  '...owwwwwwyo...',
  '...oywwwwyyo...',
  '....oyyyyyo....',
  '.....ooooo.....',
  '..r.........r..',
  '.r.....r.....r.',
  '.......r.......',
]

const NUBE = [
  '.....oooo...........',
  '...oowwwwoo..oooo....',
  '..owwwwwwwwoowwwwoo..',
  '.owwwwwwwwwwwwwwwwwo.',
  'owwwwwwwwwwwwwwwwwwwo',
  'osswwwwwwwwwwwwwwssso',
  '.osssssssssssssssso..',
  '..oooooooooooooooo...',
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

// Piedra clara, para que se lea de día contra el cielo.
const PIEDRA = { luz: '#c7ccdd', cara: '#9aa1ba', sombra: '#727a96', junta: '#6b7290' }

/**
 * La torre de cada puesto: almenas arriba, piedra con juntas alternadas y un
 * estandarte del metal del puesto, con su número.
 */
function Torre({ metal, puesto }) {
  const t = TORRES[metal]
  const { rects, r } = lienzo()
  const w = t.ancho
  const top = 4

  // Cinco almenas repartidas de borde a borde, midan 32 o 34 de ancho: con un
  // paso fijo, la última se salía de la torre del oro.
  for (let k = 0; k < 5; k++) {
    const x = Math.round((k * (w - 6)) / 4)
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

// La isla bajo el castillo: capas de roca cada vez más angostas, hasta la
// punta. [x, ancho] de cada capa, de 3 píxeles de alto.
const ROCA = [[2, 116], [5, 110], [9, 102], [14, 92], [20, 80], [27, 66], [35, 50], [44, 32], [52, 16]]

// Las torrecillas de los extremos: techo cónico y banderín en la punta.
const TORRECILLAS = [
  { x: 2, techo: '#e8475f', sombra: '#b8304a' },
  { x: 108, techo: '#3d8bff', sombra: '#2a63c4' },
]

/**
 * El fondo: el cielo de día con el sol y las nubes, las dos torrecillas y la
 * isla de piedra que flota bajo el castillo. Mide 120 × 128 píxeles; las
 * torres se apoyan en el pasto, a 90 del borde de arriba. Si la escena es
 * más alta, arriba sigue el color del cielo.
 */
function Fondo() {
  const { rects, r } = lienzo()
  const base = 90
  const pintar = (mapa, paleta, ox, oy) =>
    mapa.forEach((fila, y) => [...fila].forEach((c, x) => paleta[c] && r(ox + x, oy + y, 1, 1, paleta[c])))

  ;['#7cc4f5', '#86c9f6', '#92cff8', '#9ed5f9', '#aadbfa', '#b6e1fb', '#c2e7fc', '#c8e9ff'].forEach((c, i) =>
    r(0, i * 16, 120, 17, c),
  )
  pintar(SOL, { o: '#f29a00', w: '#fff3a0', y: '#ffd23f', r: '#ffe45c' }, 100, 3)
  const nube = { o: '#9ccbe8', w: '#ffffff', s: '#dff1fc' }
  pintar(NUBE, nube, 4, 8)
  pintar(NUBE.slice(1), nube, 68, 20)
  pintar(NUBE, nube, -8, 112)
  pintar(NUBE, nube, 100, 106)

  // El pasto, con brotes claros.
  r(2, base, 116, 1, CONTORNO)
  r(2, base + 1, 116, 3, '#7ed957')
  r(2, base + 4, 116, 1, '#4caf3c')
  for (let x = 4; x < 116; x += 9) r(x, base + 1, 1, 1, '#b6f08f')

  // La roca, con una luz arriba de cada capa y grietas alternadas.
  ROCA.forEach(([x, w], i) => {
    const y = base + 5 + i * 3
    r(x - 1, y, w + 2, 3, CONTORNO)
    r(x, y, w, 3, i % 2 ? '#7a809b' : '#8b91ab')
    r(x, y, w, 1, i % 2 ? '#8b91ab' : '#a3a9c2')
    for (let k = x + 4 + (i % 2) * 5; k < x + w - 4; k += 10) r(k, y + 1, 1, 2, '#555a75')
  })
  r(59, base + 32, 2, 2, CONTORNO)

  // Enredaderas que cuelgan del borde.
  for (const [x, largo] of [[8, 5], [20, 8], [38, 10], [97, 7], [110, 4]]) {
    r(x, base + 5, 1, largo, '#4caf3c')
    r(x - 1, base + 4 + largo, 2, 1, '#7ed957')
  }

  for (const { x, techo, sombra } of TORRECILLAS) {
    r(x, base - 20, 10, 20, CONTORNO)
    r(x + 1, base - 19, 8, 19, '#b9bfd4')
    r(x + 1, base - 19, 8, 1, '#d3d8e8')
    r(x + 7, base - 18, 2, 18, PIEDRA.cara)
    for (let y = base - 14; y < base; y += 5) r(x + 1, y, 6, 1, '#a3a9c2')
    r(x + 3, base - 13, 3, 5, CONTORNO)
    r(x + 4, base - 12, 1, 3, '#3d6fb8')
    for (let i = 0; i < 6; i++) {
      const w = 12 - i * 2
      const y = base - 22 - i * 2
      r(x - 1 + i, y, w, 2, CONTORNO)
      if (w > 2) {
        r(x + i, y, w - 2, 2, techo)
        r(x + i + Math.ceil((w - 2) / 2), y, Math.floor((w - 2) / 2), 2, sombra)
      }
    }
    r(x + 4, base - 38, 1, 5, CONTORNO)
    for (let i = 0; i < 3; i++) r(x + 5, base - 38 + i, 4 - i, 1, techo)
  }

  return (
    <svg className="podio-fondo" viewBox="0 0 120 128" shapeRendering="crispEdges" aria-hidden="true">
      {rects}
    </svg>
  )
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
