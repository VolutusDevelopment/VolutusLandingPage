/**
 * La pieza de la cabecera de cada página de servicio: lo que hace el servicio,
 * dibujado. Es lo que le da a cada página su identidad dentro del sistema: la
 * card de la rueda en grande, en el color del servicio y con su anillo
 * blanco, y dentro, su escena.
 *
 * Gráfica propia en SVG en línea (DESIGN-BRIEF §6): blanco sobre el color, y
 * en las piezas de interfaz, la tinta y el color del servicio
 * (`currentColor`). La trama de puntos de la marca hace de fondo. Los negocios
 * y las cifras son de ejemplo, como el Café Luna de PonleNota: no son clientes.
 *
 * Es decorativa: el texto de la página ya dice lo mismo, así que se esconde
 * del lector de pantalla. Las partes entran una tras otra al cargar
 * (`pz-entra`, con su orden en `--n`) y, donde hay datos que viajan, sus
 * líneas corren un rato y se quedan quietas (Servicio.css).
 */

const n = (orden) => ({ className: 'pz-entra', style: { '--n': orden } })

// La boleta termina en dientes, como el papel cortado.
const DIENTES = Array.from({ length: 16 }, (_, i) => `L${444 - (i * 2 + 1) * 6.5} 300L${444 - (i + 1) * 13} 292`).join('')

// El área de búsqueda de la prospección, con la forma del cuadrilátero del
// oriente de Santiago: Lo Barnechea, El Arrayán, Macul y Barrio Italia. Los
// negocios son los puntos de una trama que caen dentro de ella; uno de cada
// cinco, hueco, no tiene sitio web.
const AREA = [
  [150, 50],
  [282, 86],
  [236, 316],
  [40, 214],
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

const NEGOCIOS = Array.from({ length: 15 * 16 }, (_, i) => [52 + (i % 15) * 16 + ((i / 15) & 1) * 8, 62 + Math.floor(i / 15) * 16])
  .filter(conAire)
  .map((punto, i) => ({ punto, sinWeb: (i * 7) % 5 === 0 }))

const ESCENAS = {
  // El sitio en su ventana y, delante, cómo aparece cuando lo buscan.
  web: (
    <>
      <defs>
        <pattern id="pz-trama" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="1.6" fill="#fff" fillOpacity=".6" />
        </pattern>
      </defs>
      <g {...n(0)}>
        <rect x="40" y="28" width="400" height="236" rx="14" fill="#fff" fillOpacity=".1" stroke="#fff" strokeWidth="2" />
        <path d="M40 62h400" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
        <circle cx="62" cy="45" r="4.5" fill="#fff" fillOpacity=".6" />
        <circle cx="78" cy="45" r="4.5" fill="#fff" fillOpacity=".6" />
        <circle cx="94" cy="45" r="4.5" fill="#fff" fillOpacity=".6" />
        <rect x="150" y="36" width="180" height="18" rx="9" fill="#fff" fillOpacity=".18" />
        <text x="240" y="49" textAnchor="middle" fontSize="11" fill="#fff" className="pz-mono">
          tunegocio.cl
        </text>
      </g>
      <g {...n(1)}>
        <rect x="68" y="86" width="196" height="16" rx="4" fill="#fff" />
        <rect x="68" y="108" width="140" height="16" rx="4" fill="#fff" />
        <rect x="292" y="86" width="120" height="106" rx="8" fill="url(#pz-trama)" />
      </g>
      <g {...n(2)}>
        <rect x="68" y="138" width="176" height="6" rx="3" fill="#fff" fillOpacity=".6" />
        <rect x="68" y="150" width="132" height="6" rx="3" fill="#fff" fillOpacity=".6" />
        <rect x="68" y="168" width="84" height="24" rx="4" fill="#fff" />
      </g>
      <g {...n(3)} fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2">
        <rect x="68" y="210" width="100" height="36" rx="6" />
        <rect x="180" y="210" width="100" height="36" rx="6" />
        <rect x="292" y="210" width="120" height="36" rx="6" />
      </g>
      <g {...n(4)}>
        <rect x="16" y="226" width="272" height="112" rx="12" fill="#fff" />
        <rect x="32" y="242" width="240" height="28" rx="14" fill="#eef3f7" />
        <circle cx="50" cy="255" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M54.5 259.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <text x="66" y="260.5" fontSize="13" fill="#0a1a2a">
          pastelería en ñuñoa
        </text>
        <text x="32" y="292" fontSize="11" fill="#47607a" className="pz-mono">
          tunegocio.cl
        </text>
        <text x="32" y="311" fontSize="14" fontWeight="800" fill="currentColor">
          Tortas por encargo en Ñuñoa
        </text>
        <rect x="32" y="322" width="200" height="5" rx="2.5" fill="#d6e2ec" />
      </g>
    </>
  ),

  // Un producto en su vitrina, el pedido que llega y su boleta.
  tienda: (
    <>
      <g {...n(0)}>
        <rect x="32" y="52" width="176" height="252" rx="14" fill="#fff" />
        <rect x="46" y="66" width="148" height="122" rx="8" fill="currentColor" fillOpacity=".14" />
        <path
          d="M101 98L84 107l7 15 8-4v38h42v-38l8 4 7-15-17-9c-2 6-8 10-19 10s-17-4-19-10z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <text x="46" y="212" fontSize="13" fontWeight="800" fill="#0a1a2a">
          Polera de algodón
        </text>
        <text x="46" y="232" fontSize="13" fill="currentColor" className="pz-mono">
          $12.990
        </text>
        <rect x="46" y="250" width="148" height="36" rx="6" fill="currentColor" />
        <text x="120" y="272.5" textAnchor="middle" fontSize="13" fill="#fff">
          Agregar al carro
        </text>
      </g>
      <g {...n(1)}>
        <path d={`M236 64H444V292${DIENTES}Z`} fill="#fff" />
        <text x="254" y="94" fontSize="14" fontWeight="800" fill="#0a1a2a">
          Pedido #1042
        </text>
        <g fontSize="11" fill="#47607a" className="pz-mono">
          <text x="254" y="124">Polera ×2</text>
          <text x="426" y="124" textAnchor="end">
            $25.980
          </text>
          <text x="254" y="144">Envío</text>
          <text x="426" y="144" textAnchor="end">
            $3.500
          </text>
        </g>
        <path d="M254 160H426" stroke="#d6e2ec" strokeWidth="1.5" strokeDasharray="4 4" />
        <g fontSize="12" fontWeight="800" fill="#0a1a2a" className="pz-mono">
          <text x="254" y="182">Total</text>
          <text x="426" y="182" textAnchor="end">
            $29.480
          </text>
        </g>
        <g transform="rotate(-8 340 238)">
          <rect x="288" y="220" width="104" height="36" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <text x="340" y="244" textAnchor="middle" fontSize="15" fontWeight="800" letterSpacing="2" fill="currentColor">
            PAGADO
          </text>
        </g>
      </g>
      <g {...n(2)}>
        <rect x="252" y="18" width="200" height="34" rx="17" fill="#fff" />
        <circle cx="272" cy="35" r="6" fill="currentColor" />
        <text x="286" y="39.5" fontSize="12" fill="#0a1a2a">
          Nuevo pedido · $29.480
        </text>
      </g>
    </>
  ),

  // La app, la web y el panel, los tres sobre una sola base de datos.
  app: (
    <>
      <g fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="2" strokeDasharray="6 8" className="pz-flujo">
        <path d="M82 206c0 40 60 46 102 46" />
        <path d="M240 140v92" />
        <path d="M394 150c0 46-58 52-98 52" />
      </g>
      <g {...n(0)}>
        <text x="82" y="44" textAnchor="middle" fontSize="11" fill="#fff" letterSpacing="1.5" className="pz-mono">
          APP
        </text>
        <rect x="40" y="56" width="84" height="150" rx="16" fill="#fff" fillOpacity=".12" stroke="#fff" strokeWidth="2" />
        <rect x="70" y="64" width="24" height="5" rx="2.5" fill="#fff" fillOpacity=".6" />
        <rect x="52" y="82" width="60" height="22" rx="5" fill="#fff" />
        <rect x="52" y="110" width="60" height="22" rx="5" fill="#fff" fillOpacity=".7" />
        <rect x="52" y="138" width="60" height="22" rx="5" fill="#fff" fillOpacity=".7" />
        <rect x="52" y="174" width="60" height="18" rx="9" fill="#fff" />
      </g>
      <g {...n(1)}>
        <text x="240" y="36" textAnchor="middle" fontSize="11" fill="#fff" letterSpacing="1.5" className="pz-mono">
          WEB
        </text>
        <rect x="172" y="48" width="136" height="92" rx="8" fill="#fff" fillOpacity=".12" stroke="#fff" strokeWidth="2" />
        <path d="M172 66h136" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
        <rect x="186" y="78" width="70" height="10" rx="3" fill="#fff" />
        <rect x="186" y="94" width="50" height="10" rx="3" fill="#fff" />
        <rect x="186" y="112" width="34" height="14" rx="3" fill="#fff" fillOpacity=".7" />
        <rect x="264" y="78" width="32" height="48" rx="4" fill="#fff" fillOpacity=".35" />
      </g>
      <g {...n(2)}>
        <text x="394" y="52" textAnchor="middle" fontSize="11" fill="#fff" letterSpacing="1.5" className="pz-mono">
          PANEL
        </text>
        <rect x="340" y="64" width="108" height="76" rx="6" fill="#fff" fillOpacity=".12" stroke="#fff" strokeWidth="2" />
        <path d="M328 140h132l-8 10H336z" fill="#fff" />
        <rect x="352" y="104" width="12" height="26" rx="2" fill="#fff" />
        <rect x="370" y="90" width="12" height="40" rx="2" fill="#fff" />
        <rect x="388" y="112" width="12" height="18" rx="2" fill="#fff" />
        <rect x="406" y="80" width="12" height="50" rx="2" fill="#fff" />
        <rect x="424" y="96" width="12" height="34" rx="2" fill="#fff" />
      </g>
      <g {...n(3)}>
        <path d="M182 246v52a58 14 0 0 0 116 0v-52" fill="#fff" fillOpacity=".14" stroke="#fff" strokeWidth="2" />
        <path d="M182 272a58 14 0 0 0 116 0" fill="none" stroke="#fff" strokeWidth="2" />
        <ellipse cx="240" cy="246" rx="58" ry="14" fill="#fff" />
        <text x="240" y="340" textAnchor="middle" fontSize="12" fill="#fff" letterSpacing="1.5" className="pz-mono">
          TUS DATOS
        </text>
      </g>
    </>
  ),

  // Una conversación: la pregunta, la consulta a la agenda y la respuesta.
  agente: (
    <>
      <g {...n(0)}>
        <rect x="56" y="20" width="368" height="320" rx="18" fill="#fff" />
        <circle cx="88" cy="52" r="15" fill="currentColor" />
        <path d="M88 42.5l2.6 6.9 6.9 2.6-6.9 2.6-2.6 6.9-2.6-6.9-6.9-2.6 6.9-2.6z" fill="#fff" />
        <text x="114" y="49" fontSize="13" fontWeight="800" fill="#0a1a2a">
          Asistente de Café Luna
        </text>
        <text x="114" y="65" fontSize="11" fill="#47607a">
          Responde con la agenda del local
        </text>
        <path d="M56 84h368" stroke="#d6e2ec" />
      </g>
      <g {...n(1)}>
        <rect x="190" y="100" width="214" height="50" rx="14" fill="currentColor" />
        <text fontSize="13" fill="#fff">
          <tspan x="206" y="121">
            ¿Tienen mesa para 4 el
          </tspan>
          <tspan x="206" y="139">
            viernes a las 21:00?
          </tspan>
        </text>
      </g>
      <g {...n(2)}>
        <rect x="76" y="166" width="168" height="26" rx="13" fill="#eef3f7" />
        <path d="M90 179l4 4 7-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="108" y="183" fontSize="11" fill="#47607a" className="pz-mono">
          Revisó la agenda
        </text>
      </g>
      <g {...n(3)}>
        <rect x="76" y="204" width="248" height="68" rx="14" fill="#eef3f7" />
        <text fontSize="13" fill="#0a1a2a">
          <tspan x="92" y="226">
            Sí: queda una mesa a las
          </tspan>
          <tspan x="92" y="244">
            21:00. ¿La reservo a tu
          </tspan>
          <tspan x="92" y="262">
            nombre?
          </tspan>
        </text>
      </g>
      <g {...n(4)} fontSize="12" textAnchor="middle" fill="currentColor">
        <rect x="76" y="288" width="116" height="30" rx="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text x="134" y="307.5">Sí, resérvala</text>
        <rect x="200" y="288" width="116" height="30" rx="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text x="258" y="307.5">Otra hora</text>
      </g>
    </>
  ),

  // Un pedido que pasa solo de un paso al siguiente, y lo que corre a su hora.
  automatizacion: (
    <>
      <g fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="2" strokeDasharray="6 8" className="pz-flujo">
        <path d="M226 88h28" />
        <path d="M360 120v84" />
        <path d="M254 244h-28" />
      </g>
      <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M248 82l6 6-6 6" />
        <path d="M354 198l6 6 6-6" />
        <path d="M232 238l-6 6 6 6" />
      </g>
      <text x="22" y="40" fontSize="11" fill="#fff" letterSpacing="1.5" className="pz-mono">
        CADA VEZ QUE ENTRA UN PEDIDO
      </text>
      {[
        { x: 22, y: 56, titulo: 'Llega un pedido', sub: 'formulario web', glifo: 'M-6-4h12M-6 0h12M-6 4h7' },
        { x: 256, y: 56, titulo: 'Pasa a la planilla', sub: 'Google Sheets', glifo: 'M-7-6h14v12h-14zM-7-1h14M-2-6v12' },
        { x: 256, y: 212, titulo: 'Avisa a tu equipo', sub: 'correo', glifo: 'M-7-5h14v10h-14zM-7-5l7 6 7-6' },
        { x: 22, y: 212, titulo: 'Queda registrado', sub: 'historial', glifo: 'M-6 0l4 4 8-8' },
      ].map(({ x, y, titulo, sub, glifo }, i) => (
        <g key={titulo} {...n(i)}>
          <rect x={x} y={y} width="204" height="64" rx="12" fill="#fff" />
          <circle cx={x + 30} cy={y + 32} r="16" fill="currentColor" />
          <path
            d={glifo}
            transform={`translate(${x + 30} ${y + 32})`}
            fill="none"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x={x + 56} y={y + 29} fontSize="13" fontWeight="800" fill="#0a1a2a">
            {titulo}
          </text>
          <text x={x + 56} y={y + 47} fontSize="10.5" fill="#47607a" className="pz-mono">
            {sub}
          </text>
        </g>
      ))}
      <g {...n(4)}>
        <rect x="104" y="306" width="272" height="32" rx="16" fill="#fff" fillOpacity=".14" stroke="#fff" strokeOpacity=".6" />
        <circle cx="126" cy="322" r="7" fill="none" stroke="#fff" strokeWidth="1.8" />
        <path d="M126 318v4l3 2" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        <text x="142" y="326" fontSize="11" fill="#fff" className="pz-mono">
          Lunes 08:00 · reporte enviado
        </text>
      </g>
    </>
  ),

  // El área marcada en el mapa, sus negocios dentro y lo que mide.
  prospeccion: (
    <>
      <g {...n(0)}>
        <path
          d={`M${AREA.join('L')}Z`}
          fill="#fff"
          fillOpacity=".1"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
      <g {...n(1)}>
        {NEGOCIOS.map(({ punto: [x, y], sinWeb }) =>
          sinWeb ? (
            <circle key={`${x},${y}`} cx={x} cy={y} r="3.2" fill="none" stroke="#fff" strokeWidth="1.5" />
          ) : (
            <circle key={`${x},${y}`} cx={x} cy={y} r="3.2" fill="#fff" />
          )
        )}
      </g>
      <g {...n(2)}>
        {AREA.map(([x, y]) => (
          <g key={x}>
            <circle cx={x} cy={y} r="9" fill="currentColor" stroke="#fff" strokeWidth="2.5" />
            <circle cx={x} cy={y} r="3" fill="#fff" />
          </g>
        ))}
        <g fontSize="9.5" fill="#fff" letterSpacing="1" className="pz-mono">
          <text x="150" y="30" textAnchor="middle">
            LO BARNECHEA
          </text>
          <text x="282" y="66" textAnchor="middle">
            EL ARRAYÁN
          </text>
          <text x="236" y="342" textAnchor="middle">
            MACUL
          </text>
          <text x="20" y="268">
            BARRIO ITALIA
          </text>
        </g>
      </g>
      <g {...n(3)}>
        <rect x="318" y="112" width="146" height="132" rx="12" fill="#fff" />
        <text x="332" y="136" fontSize="9" fill="#47607a" letterSpacing="1" className="pz-mono">
          ÁREA DE BÚSQUEDA
        </text>
        <text x="332" y="164" fontSize="18" fontWeight="800" fill="#0a1a2a" className="pz-mono">
          195,53 km²
        </text>
        <text x="332" y="184" fontSize="11" fill="#47607a">
          Perímetro 58,58 km
        </text>
        <path d="M332 198h118" stroke="#d6e2ec" />
        <circle cx="337" cy="216" r="3.2" fill="currentColor" />
        <text x="346" y="219.5" fontSize="10" fill="#0a1a2a">
          con web
        </text>
        <circle cx="337" cy="232" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text x="346" y="235.5" fontSize="10" fill="#0a1a2a">
          sin web
        </text>
      </g>
    </>
  ),

  // El panel de un negocio: sus cifras, su semana y lo que falta reponer.
  gestion: (
    <>
      <g {...n(0)}>
        <rect x="20" y="20" width="440" height="320" rx="16" fill="#fff" />
        <path d="M36 20h40v320H36a16 16 0 0 1-16-16V36a16 16 0 0 1 16-16z" fill="currentColor" />
        <rect x="40" y="44" width="16" height="16" rx="4" fill="#fff" />
        <rect x="40" y="76" width="16" height="16" rx="4" fill="#fff" fillOpacity=".55" />
        <rect x="40" y="108" width="16" height="16" rx="4" fill="#fff" fillOpacity=".55" />
        <rect x="40" y="140" width="16" height="16" rx="4" fill="#fff" fillOpacity=".55" />
      </g>
      {[
        { x: 96, etiqueta: 'VENTAS', valor: '$4,2 M' },
        { x: 218, etiqueta: 'PEDIDOS', valor: '318' },
        { x: 340, etiqueta: 'STOCK BAJO', valor: '6' },
      ].map(({ x, etiqueta, valor }) => (
        <g key={etiqueta} {...n(1)}>
          <rect x={x} y="40" width="106" height="58" rx="8" fill="#f6f9fc" stroke="#d6e2ec" />
          <text x={x + 12} y="60" fontSize="9.5" fill="#47607a" letterSpacing="1" className="pz-mono">
            {etiqueta}
          </text>
          <text x={x + 12} y="86" fontSize="18" fontWeight="800" fill="#0a1a2a" className="pz-mono">
            {valor}
          </text>
        </g>
      ))}
      <g {...n(2)}>
        <text x="96" y="132" fontSize="12" fontWeight="800" fill="#0a1a2a">
          Ventas de la semana
        </text>
        <path d="M96 228h232" stroke="#d6e2ec" />
        {[40, 62, 48, 76, 90, 70, 34].map((alto, i) => (
          <g key={i}>
            <rect
              className="pz-barra"
              style={{ '--n': i }}
              x={104 + i * 32}
              y={228 - alto}
              width="22"
              height={alto}
              rx="3"
              fill="currentColor"
            />
            <text x={115 + i * 32} y="244" textAnchor="middle" fontSize="10" fill="#47607a" className="pz-mono">
              {'LMMJVSD'[i]}
            </text>
          </g>
        ))}
      </g>
      <g {...n(3)}>
        <text x="344" y="132" fontSize="12" fontWeight="800" fill="#0a1a2a">
          Por reponer
        </text>
        {['Café en grano', 'Vasos 12 oz', 'Leche de avena'].map((producto, i) => (
          <g key={producto}>
            <circle cx="350" cy={156 + i * 26} r="4" fill="currentColor" />
            <text x="362" y={160 + i * 26} fontSize="11" fill="#0a1a2a">
              {producto}
            </text>
          </g>
        ))}
      </g>
      <g {...n(4)}>
        <path d="M96 262h352" stroke="#d6e2ec" />
        {[
          ['Pedido #1041', '$8.400', 'Listo'],
          ['Pedido #1042', '$29.480', 'Pagado'],
        ].map(([pedido, monto, estado], i) => (
          <g key={pedido} fontSize="11">
            <text x="96" y={286 + i * 28} fill="#0a1a2a">
              {pedido}
            </text>
            <text x="300" y={286 + i * 28} textAnchor="end" fill="#47607a" className="pz-mono">
              {monto}
            </text>
            <rect x="372" y={272 + i * 28} width="76" height="20" rx="10" fill="currentColor" fillOpacity=".14" />
            <text x="410" y={286 + i * 28} textAnchor="middle" fill="currentColor">
              {estado}
            </text>
          </g>
        ))}
      </g>
    </>
  ),
}

export default function Pieza({ id }) {
  return (
    <div className="pieza" aria-hidden="true">
      <svg viewBox="0 0 480 360" focusable="false">
        {ESCENAS[id]}
      </svg>
    </div>
  )
}
