/**
 * El podio de los logros, en pixel art al estilo de los juegos de Nitrome: un
 * castillo de día sobre una isla que flota entre las nubes, con almenas,
 * estandartes con el puesto y dos torrecillas, y debajo la tabla de honor,
 * como la pantalla de puntajes de un juego.
 *
 * Los sprites son mapas de texto (un carácter por píxel) o rectángulos
 * calculados, que se convierten en un `<path>` por color al prerenderizar
 * (ver `lienzo`): no hay imágenes que descargar y escalan nítidos a
 * cualquier tamaño. Cada columna del podio
 * es una pestaña; el cartel de abajo cuenta el logro elegido, y la tabla elige
 * lo mismo al tocar una fila (src/podio.js). Sin JavaScript se ven todos los
 * carteles (ver SIN_SCRIPT) y el contenido sigue en el HTML para los
 * buscadores.
 */

const CONTORNO = '#2a1d3d'

/**
 * Un lienzo de píxeles: `r(x, y, ancho, alto, color)` pinta un rectángulo
 * encima de lo que haya, y `pintar()` entrega lo pintado como un `<path>` por
 * color, con un tramo por fila, y deja el lienzo vacío para la capa
 * siguiente. Un `<rect>` por tramo eran unos 900 nodos en la página, que el
 * navegador recorre en cada cálculo de estilos; así son unos pocos por pieza,
 * y se ve igual.
 */
function lienzo() {
  const pixeles = new Map()
  const r = (x, y, w, h, color) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) pixeles.set(`${i},${j}`, color)
  }
  const pintar = () => {
    // Los píxeles de cada color, agrupados por fila.
    const colores = new Map()
    for (const [punto, color] of pixeles) {
      const [x, y] = punto.split(',').map(Number)
      if (!colores.has(color)) colores.set(color, new Map())
      const filas = colores.get(color)
      if (!filas.has(y)) filas.set(y, [])
      filas.get(y).push(x)
    }
    pixeles.clear()

    return [...colores].map(([color, filas]) => {
      // Cada fila en tramos seguidos; un tramo igual al de la fila de arriba
      // la alarga hacia abajo, en vez de empezar otro.
      const bloques = new Map()
      const hechos = []
      for (const y of [...filas.keys()].sort((m, n) => m - n)) {
        const xs = filas.get(y).sort((m, n) => m - n)
        for (let i = 0; i < xs.length; ) {
          let fin = i
          while (xs[fin + 1] === xs[fin] + 1) fin++
          const clave = `${xs[i]},${fin - i + 1}`
          const abierto = bloques.get(clave)
          if (abierto && abierto.y + abierto.h === y) abierto.h++
          else {
            const bloque = { x: xs[i], y, w: fin - i + 1, h: 1 }
            bloques.set(clave, bloque)
            hechos.push(bloque)
          }
          i = fin + 1
        }
      }
      const d = hechos.map(({ x, y, w, h }) => `M${x} ${y}h${w}v${h}h-${w}z`).join('')
      return <path key={color} d={d} fill={color} />
    })
  }
  return { r, pintar }
}

function Sprite({ mapa, paleta, className }) {
  const { r, pintar } = lienzo()
  mapa.forEach((fila, y) => [...fila].forEach((c, x) => paleta[c] && r(x, y, 1, 1, paleta[c])))
  const ancho = Math.max(...mapa.map((fila) => fila.length))
  return (
    <svg
      className={className}
      viewBox={`0 0 ${ancho} ${mapa.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ '--ancho': ancho }}
    >
      {pintar()}
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

const NUBE = [
  '..........oooooo................',
  '........oowwwwwwoo....oooo......',
  '.......owwwwwwwwwwo.oowwwwoo....',
  '......owwwwwwwwwwwwowwwwwwwwo...',
  '..oooowwwwwwwwwwwwwwwwwwwwwwwo..',
  '.owwwwwwwwwwwwwwwwwwwwwwwwwwwwo.',
  'owwwwwwwwwwwwwwwwwwwwwwwwwwwwwwo',
  'owwwwwwwwwwwwwwwwwwwwwwwwwwwwwwo',
  'osswwwwwwwwwwwwwwwwwwwwwwwwwssso',
  '.osssssswwwwwwwwwwwwwwwwsssssso.',
  '..osssssssssssssssssssssssssso..',
  '...oooooooooooooooooooooooooo...',
]

// La bandera de cada torrecilla, en dos cuadros que se alternan al flamear.
const BANDERA = [
  ['ffff..', 'fdffff', 'ffff..', 'f.....'],
  ['fff...', 'ffdfff', 'fffffd', 'ff....'],
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
  const { r, pintar } = lienzo()
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
      {pintar()}
    </svg>
  )
}

// La isla bajo el castillo: capas de roca cada vez más angostas, hasta la
// punta. [x, ancho] de cada capa, de 3 píxeles de alto.
const ROCA = [
  [2, 116],
  [5, 110],
  [9, 102],
  [14, 92],
  [20, 80],
  [27, 66],
  [35, 50],
  [44, 32],
  [52, 16],
]

// Las torrecillas de los extremos: techo cónico y banderín en la punta.
const TORRECILLAS = [
  { x: 2, techo: '#e8475f', sombra: '#b8304a' },
  { x: 108, techo: '#3d8bff', sombra: '#2a63c4' },
]

const PALETA_NUBE = { o: '#9ccbe8', w: '#ffffff', s: '#dff1fc' }

// Una nube por altura (y, en el fondo de 120 × 128): cruza todo el cielo y
// vuelve a entrar al salir, así que su franja nunca queda vacía. Las de
// arriba van juntas a la misma velocidad, separadas por un tercio del
// recorrido de 153 píxeles (ver Podio.css), en diagonal: no se amontonan
// nunca. Las de abajo, más cerca, van más rápido y a media vuelta. `x` es
// dónde está cada nube al cargar.
const NUBES = [
  { y: 2, x: 40, segundos: 100 },
  { y: 18, x: -11, segundos: 100 },
  { y: 34, x: 91, segundos: 100 },
  { y: 100, x: -6, segundos: 70 },
  { y: 114, x: 70, segundos: 70 },
]

/**
 * Las nubes van fuera del fondo para poder moverse (Podio.css): por delante
 * del cielo y por detrás del castillo.
 */
function Nubes() {
  return NUBES.map(({ x, y, segundos }) => (
    <span
      key={`${x}-${y}`}
      className="podio-nube"
      aria-hidden="true"
      style={{ '--x': x, '--abajo': 128 - y - NUBE.length, '--segundos': `${segundos}s` }}
    >
      <Sprite mapa={NUBE} paleta={PALETA_NUBE} />
    </span>
  ))
}

// Los dos cuadros de los rayos, [desde, hasta] contados desde el centro: en
// el segundo, los rayos crecen un píxel. Al alternarlos, el sol brilla
// (Podio.css).
const RAYOS = [
  [10, 11],
  [10, 12],
]

// Hacia dónde sale cada rayo: los cuatro rectos y los cuatro en diagonal.
const RECTOS = [
  [0, -1],
  [0, 1],
  [1, 0],
  [-1, 0],
]
const DIAGONALES = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
]

// La sonrisa: una línea con las puntas hacia arriba.
const SONRISA = [
  [12, 18],
  [13, 19],
  [14, 19],
  [15, 19],
  [16, 19],
  [17, 19],
  [18, 18],
]

/**
 * El sol, fuera del fondo para poder moverse: un brillo tenue, ocho rayos y el
 * disco con su carita, que pestañea de vez en cuando. Mide 31 × 31 píxeles,
 * con el centro en el 15, 15. Por detrás de las nubes.
 */
function Sol() {
  const { r, pintar } = lienzo()
  const centro = 15
  // Un círculo de píxeles, fila por fila.
  const circulo = (radio, color) => {
    for (let dy = -radio; dy <= radio; dy++) {
      const mitad = Math.floor(Math.sqrt(radio * radio - dy * dy))
      r(centro - mitad, centro + dy, mitad * 2 + 1, 1, color)
    }
  }

  circulo(10, '#fff8d6')
  const brillo = pintar()

  const rayos = RAYOS.map(([desde, hasta]) => {
    for (let d = desde; d <= hasta; d++) {
      for (const [x, y] of RECTOS) r(centro + x * d, centro + y * d, 1, 1, '#ffd23f')
      const e = Math.round(d * 0.75)
      for (const [x, y] of DIAGONALES) r(centro + x * e, centro + y * e, 1, 1, '#ffd23f')
    }
    return pintar()
  })

  circulo(7, '#f29a00')
  circulo(6, '#ffd23f')
  r(12, 10, 4, 1, '#fff3a0')
  for (const [x, y] of SONRISA) r(x, y, 1, 1, '#7a3d00')
  const cara = pintar()

  r(13, 13, 1, 2, '#7a3d00')
  r(17, 13, 1, 2, '#7a3d00')
  const ojos = pintar()

  return (
    <svg className="podio-sol" viewBox="0 0 31 31" shapeRendering="crispEdges" aria-hidden="true">
      <g fillOpacity={0.35}>{brillo}</g>
      {rayos.map((cuadro, i) => (
        <g key={i} className="podio-sol-rayos">
          {cuadro}
        </g>
      ))}
      {cara}
      <g className="podio-sol-ojos">{ojos}</g>
    </svg>
  )
}

/**
 * Las banderas de las torrecillas, fuera del fondo para poder flamear: los
 * dos cuadros van uno sobre otro y el CSS los alterna (Podio.css). Se cuelgan
 * del mástil que pinta el fondo.
 */
function Banderas() {
  const { r, pintar } = lienzo()
  return TORRECILLAS.map(({ x, techo, sombra }) => (
    <svg
      key={x}
      className="podio-bandera"
      viewBox="0 0 6 4"
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ '--x': x + 5 }}
    >
      {BANDERA.map((cuadro, i) => {
        cuadro.forEach((fila, y) =>
          [...fila].forEach((c, cx) => c !== '.' && r(cx, y, 1, 1, c === 'd' ? sombra : techo)),
        )
        return <g key={i}>{pintar()}</g>
      })}
    </svg>
  ))
}

/**
 * El fondo: el cielo de día, las dos torrecillas y la isla de
 * piedra que flota bajo el castillo. Mide 120 × 128 píxeles; las torres se
 * apoyan en el pasto, a 90 del borde de arriba. Si la escena es más alta,
 * arriba sigue el color del cielo.
 */
function Fondo() {
  const { r, pintar } = lienzo()
  const base = 90

  ;['#7cc4f5', '#86c9f6', '#92cff8', '#9ed5f9', '#aadbfa', '#b6e1fb', '#c2e7fc', '#c8e9ff'].forEach((c, i) =>
    r(0, i * 16, 120, 17, c),
  )

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
  for (const [x, largo] of [
    [8, 5],
    [20, 8],
    [38, 10],
    [97, 7],
    [110, 4],
  ]) {
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
  }

  return (
    <svg className="podio-fondo" viewBox="0 0 120 128" shapeRendering="crispEdges" aria-hidden="true">
      {pintar()}
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
      {/* El lienzo mide la escena: los píxeles de juego son 1/120 de su ancho
          (Podio.css). En escritorio va a la izquierda y el panel a la derecha. */}
      <div className="podio-lienzo">
        <div className="podio-marco">
          <Fondo />
          <Sol />
          <Nubes />
          <Banderas />
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
      </div>

      <div className="podio-panel">
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
          <div
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
          </div>
        ))}
      </div>
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: SIN_SCRIPT }} />
      </noscript>
    </div>
  )
}
