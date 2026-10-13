/**
 * El podio de los logros, en pixel art al estilo de los juegos de Nitrome:
 * contorno morado oscuro, colores saturados y cada píxel a la vista.
 *
 * Los sprites son mapas de texto (un carácter por píxel) que se convierten en
 * `<rect>` al prerenderizar: no hay imágenes que descargar y escalan nítidos a
 * cualquier tamaño. Cada columna del podio es una pestaña; el cartel de abajo
 * cuenta el logro elegido. Sin JavaScript se ven todos los carteles (ver
 * SIN_SCRIPT) y el contenido sigue en el HTML para los buscadores.
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

// Dígitos de 5×7: el puesto se pinta en la cara del bloque.
const DIGITOS = {
  1: ['..x..', '.xx..', '..x..', '..x..', '..x..', '..x..', '.xxx.'],
  2: ['.xxx.', 'x...x', '....x', '...x.', '..x..', '.x...', 'xxxxx'],
  3: ['xxxx.', '....x', '....x', '.xxx.', '....x', '....x', 'xxxx.'],
}

const BLOQUES = {
  oro: { alto: 32, tapa: '#ffe066', tapaSombra: '#f7b928', cara: '#ff9f1c', luz: '#ffc15e', sombra: '#d9720b', junta: '#c4650a' },
  plata: { alto: 24, tapa: '#e6ecf5', tapaSombra: '#a9b6c9', cara: '#5b8def', luz: '#86adf6', sombra: '#3f6bc7', junta: '#365db0' },
}

/**
 * El bloque del podio, de 32 píxeles de ancho: tapa clara, cara de ladrillos
 * con luz a la izquierda y sombra a la derecha, y el número al centro.
 */
function Bloque({ metal, puesto }) {
  const b = BLOQUES[metal]
  const ancho = 32
  const rects = []
  const r = (x, y, w, h, fill) => rects.push(<rect key={rects.length} x={x} y={y} width={w} height={h} fill={fill} />)

  r(0, 0, ancho, b.alto, CONTORNO)
  // Tapa
  r(1, 1, ancho - 2, 3, b.tapa)
  r(1, 4, ancho - 2, 1, b.tapaSombra)
  r(1, 5, ancho - 2, 1, CONTORNO)
  // Cara
  r(1, 6, ancho - 2, b.alto - 7, b.cara)
  r(1, 6, 2, b.alto - 7, b.luz)
  r(ancho - 3, 6, 2, b.alto - 7, b.sombra)
  // Juntas de ladrillo cada 6 filas, con las verticales alternadas
  for (let y = 11, fila = 0; y < b.alto - 1; y += 6, fila++) {
    r(3, y, ancho - 6, 1, b.junta)
    for (let x = fila % 2 ? 8 : 15; x < ancho - 3; x += 14) r(x, y - 5, 1, 5, b.junta)
  }

  // El número, a 2× y con sombra de un píxel
  const glifo = DIGITOS[puesto] ?? DIGITOS[2]
  const gx = (ancho - 10) / 2
  const gy = 6 + Math.round((b.alto - 7 - 14) / 2)
  glifo.forEach((fila, y) =>
    [...fila].forEach((c, x) => {
      if (c !== 'x') return
      r(gx + x * 2 + 1, gy + y * 2 + 1, 2, 2, CONTORNO)
      r(gx + x * 2, gy + y * 2, 2, 2, '#ffffff')
    }),
  )

  return (
    <svg className="podio-bloque" viewBox={`0 0 ${ancho} ${b.alto}`} shapeRendering="crispEdges" aria-hidden="true">
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

// El primero al centro y los demás a los lados, como en un podio de verdad.
function ordenar(logros) {
  const porPuesto = [...logros].sort((a, b) => parseInt(a.credencial.puesto) - parseInt(b.credencial.puesto))
  const orden = []
  porPuesto.forEach((logro, i) => (i % 2 ? orden.unshift(logro) : orden.push(logro)))
  return orden
}

// Sin JavaScript no hay pestañas que cambiar: se ven todos los carteles.
const SIN_SCRIPT = `
.podio-cartel[hidden] { display: block !important; }
.podio-cartel + .podio-cartel { margin-top: var(--e-6); }
`

export default function Podio({ logros }) {
  const columnas = ordenar(logros)
  const elegido = columnas.find((l) => l.credencial.metal === 'oro') ?? columnas[0]

  return (
    <div className="podio" data-podio>
      <div className="podio-escena" role="tablist" aria-label="Logros con jurado externo">
        {columnas.map((logro) => {
          const { metal, puesto, titulo, evento } = logro.credencial
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
              <Bloque metal={metal} puesto={parseInt(puesto)} />
              <span className="solo-lectores">
                {titulo}: {logro.nombre}, {evento}
              </span>
            </button>
          )
        })}
      </div>
      <div className="podio-suelo" aria-hidden="true" />

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
