import { CARPETAS, ETIQUETA, OLA, PANTALLA, TELEFONO, VENTANA } from './Icono.jsx'

/**
 * La pieza de la cabecera de cada página de servicio: lo que hace el servicio,
 * dibujado. Es la card de la rueda en grande, en el color del servicio y con
 * su anillo blanco, y dentro, su escena, en el idioma de los iconos de las
 * cards: glifos macizos inclinados 10° (Icono.jsx), sin trazo, en blanco y
 * medio blanco, con un solo dato concreto en la letra de los titulares. Los
 * negocios y las cifras son de ejemplo, como el Café Luna de PonleNota: no son
 * clientes.
 *
 * Es decorativa: el texto de la página ya dice lo mismo, así que se esconde
 * del lector de pantalla. La repite, en chico, la card de su servicio en el
 * índice (/servicios).
 *
 * Se mueve en dos tiempos (Servicio.css). Al cargar cuenta su historia una
 * vez, cada parte con su retardo (`tras`), y se queda quieta. Con el cursor
 * encima se inclina como la card de la rueda (pieza.js), sus tres capas se
 * corren hacia él según su hondura y repite el gesto de su servicio: las
 * clases `pz-h-*`. Cada gesto va en un elemento distinto del que entra al
 * cargar, para que uno no corte ni repita al otro.
 */

// La inclinación del logotipo, desde el centro de la escena: tan(10°) × 180.
const ITALICA = 'translate(31.74 0) skewX(-10)'

function Italica({ children }) {
  return <g transform={ITALICA}>{children}</g>
}

// Una capa de la escena: `lejos`, `medio` o `cerca` del que mira.
function Capa({ hondo, children }) {
  return <g className={`pz-capa pz-${hondo}`}>{children}</g>
}

// El retardo de una animación, en ms.
const tras = (ms, estilo) => ({ style: { animationDelay: `${ms}ms`, ...estilo } })

const circulo = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`

// El área de búsqueda de la prospección, con la forma del cuadrilátero del
// oriente de Santiago: Lo Barnechea, El Arrayán, Macul y Barrio Italia. Su
// borde se dibuja de esquina en esquina y cada una aparece cuando él llega.
const AREA = [
  [150, 50],
  [282, 86],
  [236, 316],
  [40, 214],
]
const AREA_D = `M${AREA.join('L')}Z`
const ESQUINAS = [100, 270, 570, 850]
const BARRIOS = [
  { nombre: 'LO BARNECHEA', x: 176, y: 30, centro: true },
  { nombre: 'EL ARRAYÁN', x: 316, y: 80 },
  { nombre: 'MACUL', x: 205, y: 346, centro: true },
  { nombre: 'BARRIO ITALIA', x: 8, y: 270 },
]

function dentro([x, y]) {
  let adentro = false
  for (let i = 0, j = AREA.length - 1; i < AREA.length; j = i++) {
    const [xi, yi] = AREA[i]
    const [xj, yj] = AREA[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) adentro = !adentro
  }
  return adentro
}

// Un punto entra si queda dentro con su aire: así ninguno pisa el borde.
const conAire = ([x, y]) => [-7, 7].every((d) => dentro([x + d, y]) && dentro([x, y + d]))

// Los negocios son los puntos de una trama que caen dentro del área. Caen en
// ocho franjas, de arriba abajo, cada una en un solo trazo.
const FRANJAS = Array(8).fill('')
Array.from({ length: 15 * 16 }, (_, i) => [52 + (i % 15) * 16 + ((i / 15) & 1) * 8, 62 + Math.floor(i / 15) * 16])
  .filter(conAire)
  .forEach(([x, y]) => {
    FRANJAS[Math.floor((y - 62) / 32)] += circulo(x, y, 4.2)
  })

// Los pasos de la automatización, de abajo arriba: su cuadro, su glifo en el
// color del servicio y su rótulo. El pedido llega a cada uno a los
// `LLEGADAS` ms de echar a andar (pz-ficha, en Servicio.css), y el paso late.
const PASOS = [
  { x: 40, y: 214, rotulo: [16, 318, 'FORMULARIO'], glifo: <path d="M20 24h44v8H20zM20 38h44v8H20zM20 52h28v8H20z" /> },
  {
    x: 148,
    y: 166,
    rotulo: [132, 270, 'PLANILLA'],
    glifo: (
      <path d="M20 20h12v12H20zM36 20h12v12H36zM52 20h12v12H52zM20 36h12v12H20zM36 36h12v12H36zM52 36h12v12H52zM20 52h12v12H20zM36 52h12v12H36zM52 52h12v12H52z" />
    ),
  },
  {
    x: 256,
    y: 118,
    rotulo: [249, 222, 'CORREO'],
    glifo: (
      <>
        <rect x="16" y="22" width="52" height="40" />
        <path d="M16 24l26 20 26-20" fill="none" stroke="#fff" strokeWidth="4" />
      </>
    ),
  },
  {
    x: 364,
    y: 70,
    rotulo: [365, 174, 'HISTORIAL'],
    glifo: <path className="pz-traza-66" {...tras(2600)} d="M18 44l14 14 32-32" fill="none" stroke="currentColor" strokeWidth="10" />,
  },
]
const SALIDA = 700
const LLEGADAS = [160, 700, 1300, 1900]

// Los pedidos de la semana, de lunes a domingo.
const SEMANA = [40, 62, 48, 76, 90, 70, 34]

const ESCENAS = {
  // El sitio en su ventana, la marea que lo llena y cómo lo encuentran.
  web: (
    <>
      <Capa hondo="lejos">
        <Italica>
          <g className="pz-entra">
            <g transform="translate(30 0) scale(12.0833)">
              <path d={VENTANA} />
              <g className="pz-crece" {...tras(300)}>
                <path className="pz-h-oleaje" d={OLA} />
              </g>
            </g>
          </g>
        </Italica>
      </Capa>
      <Capa hondo="medio">
        <Italica>
          <g className="pz-entra" {...tras(950)}>
            <rect x="150" y="272" width="290" height="54" rx="12" />
            <path
              fill="currentColor"
              d="M169 299a11 11 0 1 0 22 0a11 11 0 1 0-22 0zM173.5 299a6.5 6.5 0 1 1 13 0a6.5 6.5 0 1 1-13 0zM187.5 305.5l3-3 9 9-3 3z"
            />
          </g>
        </Italica>
        <text className="pz-mono pz-aparece" {...tras(850)} x="137" y="262" fontSize="12" letterSpacing="1.5">
          ASÍ TE ENCUENTRAN
        </text>
        <text className="pz-titular" x="184" y="307" fontSize="21" letterSpacing="0.5" fill="currentColor">
          <tspan className="pz-tinta" {...tras(1250)}>
            TORTAS
          </tspan>
          <tspan className="pz-tinta" {...tras(1400)}>
            {' EN'}
          </tspan>
          <tspan className="pz-tinta" {...tras(1550)}>
            {' ÑUÑOA'}
          </tspan>
        </text>
      </Capa>
      <Capa hondo="cerca">
        <Italica>
          <g className="pz-cursor" {...tras(500)}>
            <path className="pz-h-clic" d="M318 150v34l9-8 7 15 7-3-7-15h12z" />
          </g>
        </Italica>
      </Capa>
    </>
  ),

  // La etiqueta con su precio y el sello del pedido pagado.
  tienda: (
    <>
      <Capa hondo="lejos">
        <Italica>
          <g className="pz-columpio">
            <g className="pz-h-mece">
              <path transform="translate(20 6) scale(9.5833)" d={ETIQUETA} />
            </g>
          </g>
        </Italica>
      </Capa>
      <Capa hondo="medio">
        <text className="pz-titular pz-entra" {...tras(300)} x="30" y="272" fontSize="56">
          $12.990
        </text>
        <text className="pz-mono pz-aparece" {...tras(500)} x="26" y="302" fontSize="12" letterSpacing="1.5">
          POLERA DE ALGODÓN
        </text>
      </Capa>
      <Capa hondo="cerca">
        <g transform="rotate(-10 360 156)">
          <g className="pz-sello" {...tras(1100)}>
            <g className="pz-h-sello">
              <path d="M282 124h156v64H282zM288 130h144v52H288z" />
              <text className="pz-titular" x="360" y="166" textAnchor="middle" fontSize="27" letterSpacing="1">
                PAGADO
              </text>
            </g>
          </g>
        </g>
        <g className="pz-mono" fontSize="12" letterSpacing="1.5">
          <text className="pz-aparece" {...tras(1400)} x="316" y="236">
            PEDIDO #1042
          </text>
          <text className="pz-aparece" {...tras(1500)} x="316" y="256">
            TOTAL $29.480
          </text>
        </g>
      </Capa>
    </>
  ),

  // La app, la web y el panel, los tres sobre tus datos, y los datos que
  // corren entre ellos.
  app: (
    <>
      <Capa hondo="lejos">
        <Italica>
          <rect className="pz-entra" x="50" y="230" width="380" height="74" rx="12" />
        </Italica>
        <text
          className="pz-titular pz-entra"
          x="225"
          y="280"
          textAnchor="middle"
          fontSize="34"
          letterSpacing="2"
          fill="currentColor"
        >
          TUS DATOS
        </text>
      </Capa>
      <Capa hondo="medio">
        <Italica>
          <g className="pz-aparece" {...tras(900)}>
            <path
              className="pz-fluye"
              d="M106 166v60M245 152v74M377 168v58"
              fill="none"
              stroke="#fff"
              strokeOpacity=".75"
              strokeWidth="3"
              strokeDasharray="6 8"
            />
          </g>
        </Italica>
      </Capa>
      <Capa hondo="cerca">
        <Italica>
          <g className="pz-baja" {...tras(250)}>
            <g transform="translate(36 28) scale(5.8333)">
              <path d={TELEFONO} />
              {PANTALLA.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          </g>
          <g className="pz-baja" {...tras(400)}>
            <g transform="translate(170 14) scale(6.25)">
              <path d={VENTANA} />
              <path d={OLA} />
            </g>
          </g>
          <rect className="pz-baja" {...tras(550)} x="324" y="154" width="106" height="6" />
          {[38, 58, 30, 74, 50].map((alto, i) => (
            <rect key={i} className="pz-crece" {...tras(700 + i * 60)} x={330 + i * 20} y={150 - alto} width="14" height={alto} />
          ))}
        </Italica>
      </Capa>
    </>
  ),

  // La pregunta, el agente que escribe y revisa la agenda, y la respuesta.
  agente: (
    <>
      <Capa hondo="lejos">
        <Italica>
          <path
            className="pz-globo"
            style={{ transformOrigin: '94% 100%' }}
            fillOpacity=".28"
            d="M222 20h196a22 22 0 0 1 22 22v56a22 22 0 0 1-22 22h-6l14 30-44-30H222a22 22 0 0 1-22-22V42a22 22 0 0 1 22-22z"
          />
        </Italica>
        <g className="pz-titular pz-aparece" {...tras(150)} fontSize="24">
          <text x="242" y="64">
            ¿MESA PARA 4
          </text>
          <text x="236" y="96">
            EL VIERNES?
          </text>
        </g>
      </Capa>
      <Capa hondo="medio">
        <Italica>
          <g className="pz-tecleando" style={{ animationDelay: '450ms, 1450ms' }}>
            {[72, 94, 116].map((cx, i) => (
              <circle key={cx} className="pz-tecleo" {...tras(450 + i * 120)} cx={cx} cy="232" r="6" />
            ))}
          </g>
        </Italica>
        <path className="pz-traza-24" {...tras(1100)} d="M290 174l5 5 10-11" fill="none" stroke="#fff" strokeWidth="3" />
        <text className="pz-mono pz-aparece" {...tras(1150)} x="314" y="180" fontSize="12" letterSpacing="1.5">
          REVISÓ LA AGENDA
        </text>
      </Capa>
      <Capa hondo="cerca">
        <g className="pz-h-globo">
          <Italica>
            <path
              className="pz-globo"
              {...tras(1500, { transformOrigin: '5% 100%' })}
              d="M62 196h246a22 22 0 0 1 22 22v76a22 22 0 0 1-22 22H106l-52 30 16-30h-8a22 22 0 0 1-22-22v-76a22 22 0 0 1 22-22z"
            />
          </Italica>
          <g className="pz-titular" fontSize="27" fill="currentColor">
            <text className="pz-entra" {...tras(1650)} x="56" y="246">
              SÍ: QUEDA UNA
            </text>
            <text className="pz-entra" {...tras(1750)} x="50" y="282">
              A LAS 21:00.
            </text>
          </g>
        </g>
      </Capa>
    </>
  ),

  // Un pedido que sube solo de un paso al siguiente, y lo que corre a su hora.
  automatizacion: (
    <>
      <Capa hondo="lejos">
        <Italica>
          <path
            className="pz-aparece"
            d="M82 256L406 112"
            fill="none"
            stroke="#fff"
            strokeOpacity=".6"
            strokeWidth="3"
            strokeDasharray="6 8"
          />
        </Italica>
      </Capa>
      <Capa hondo="medio">
        <Italica>
          {PASOS.map(({ x, y, glifo }, i) => (
            <g key={x} className="pz-entra" {...tras(i * 150)}>
              <rect x={x} y={y} width="84" height="84" rx="14" />
              <g className="pz-pulso" {...tras(SALIDA + LLEGADAS[i])}>
                <g className="pz-h-paso" {...tras(LLEGADAS[i])}>
                  <g transform={`translate(${x} ${y})`} fill="currentColor">
                    {glifo}
                  </g>
                </g>
              </g>
            </g>
          ))}
        </Italica>
        <g className="pz-mono" fontSize="11" letterSpacing="1.2">
          <text className="pz-aparece" x="62" y="48" fontSize="12" letterSpacing="1.5">
            CADA VEZ QUE ENTRA UN PEDIDO
          </text>
          {PASOS.map(({ rotulo: [x, y, texto] }, i) => (
            <text key={texto} className="pz-aparece" {...tras(100 + i * 150)} x={x} y={y}>
              {texto}
            </text>
          ))}
          <text className="pz-aparece" {...tras(2800)} x="446" y="322" textAnchor="end" fontSize="12" letterSpacing="1.5">
            LUNES 08:00 · REPORTE ENVIADO
          </text>
        </g>
      </Capa>
      <Capa hondo="cerca">
        <Italica>
          <circle className="pz-ficha" {...tras(SALIDA)} cx="82" cy="256" r="10" fill="currentColor" stroke="#fff" strokeWidth="4" />
          <circle className="pz-h-ficha" cx="82" cy="256" r="10" fill="currentColor" stroke="#fff" strokeWidth="4" />
        </Italica>
      </Capa>
    </>
  ),

  // Las carpetas de la operación, los pedidos del mes y su semana.
  gestion: (
    <>
      <Capa hondo="lejos">
        <Italica>
          <g transform="translate(24 10) scale(8.3333)">
            {CARPETAS.map((d, i) => (
              <path key={d} className="pz-izq" {...tras(i * 120)} d={d} />
            ))}
          </g>
        </Italica>
      </Capa>
      <Capa hondo="medio">
        <text className="pz-mono pz-aparece" {...tras(350)} x="271" y="62" fontSize="12" letterSpacing="1.5">
          PEDIDOS ESTE MES
        </text>
        <text className="pz-titular pz-entra" {...tras(400)} x="258" y="152" fontSize="88">
          318
        </text>
      </Capa>
      <Capa hondo="cerca">
        <Italica>
          {SEMANA.map((alto, i) => (
            <g key={i} className="pz-crece" {...tras(650 + i * 60)}>
              <rect className="pz-h-barra" {...tras(i * 60)} x={60 + i * 56} y={300 - alto} width="34" height={alto} />
            </g>
          ))}
        </Italica>
        <g className="pz-mono pz-aparece" {...tras(650)} fontSize="11" textAnchor="middle">
          {[...'LMMJVSD'].map((dia, i) => (
            <text key={i} x={52 + i * 56} y="324">
              {dia}
            </text>
          ))}
        </g>
      </Capa>
    </>
  ),

  // El área marcada en el mapa, sus negocios dentro y lo que mide.
  prospeccion: (
    <>
      <Capa hondo="lejos">
        <Italica>
          <path className="pz-aparece" d={AREA_D} fillOpacity=".16" />
          <path
            className="pz-traza-790"
            {...tras(100)}
            d={AREA_D}
            fill="none"
            stroke="#fff"
            strokeOpacity=".7"
            strokeWidth="2"
          />
        </Italica>
      </Capa>
      <Capa hondo="medio">
        <Italica>
          {FRANJAS.map((franja, i) => (
            <path key={i} className="pz-cae" {...tras(1000 + i * 90)} d={franja} />
          ))}
          {AREA.map(([x, y], i) => (
            <path key={x} className="pz-pop" {...tras(ESQUINAS[i])} d={circulo(x, y, 9) + circulo(x, y, 3.5)} />
          ))}
        </Italica>
        <g className="pz-mono" fontSize="10" letterSpacing="1">
          {BARRIOS.map(({ nombre, x, y, centro }, i) => (
            <text key={nombre} className="pz-aparece" {...tras(ESQUINAS[i] + 50)} x={x} y={y} textAnchor={centro ? 'middle' : undefined}>
              {nombre}
            </text>
          ))}
        </g>
      </Capa>
      <Capa hondo="cerca">
        <text className="pz-mono pz-aparece" {...tras(1800)} x="276" y="236" fontSize="12" letterSpacing="1">
          ÁREA DE BÚSQUEDA EN KM²
        </text>
        <text className="pz-titular pz-entra" {...tras(1900)} x="272" y="284" fontSize="44">
          195,53
        </text>
        <text className="pz-mono pz-aparece" {...tras(2000)} x="268" y="308" fontSize="12" letterSpacing="1">
          PERÍMETRO 58,58 KM
        </text>
      </Capa>
    </>
  ),
}

export default function Pieza({ id }) {
  return (
    <div className="pieza" aria-hidden="true">
      <svg viewBox="0 0 480 360" fill="#fff" fillRule="evenodd" focusable="false">
        {ESCENAS[id]}
      </svg>
    </div>
  )
}
