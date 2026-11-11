/**
 * Las muestras de «Cómo se ve» en el brief (PreguntaBrief.jsx): cada dirección
 * de estilo se dibuja en su propio estilo, cada tipografía escribe la misma
 * palabra en su letra y cada tipo de logo se dibuja con el nombre del negocio.
 * Funcionan como el chip de WhatsApp del contacto: al marcarse (al estilo, con
 * «Me gusta»), el nombre se viste con la letra y los colores del estilo y
 * aparece su propia marca de elegido; al pasar el cursor, el arte se mueve.
 *
 * Las pastillas de una empresa (Google, Instagram…) hacen lo mismo en chico:
 * al marcarse toman sus colores y su letra y, en vez del ✓, su logotipo.
 *
 * Los dibujos y sus letras viven en public/brief/muestras.css, que solo baja
 * /brief: el CSS del sitio va dentro de cada página y esto no le sirve a
 * ninguna otra.
 */

// El arte de cada estilo y su marca de elegido. Todo es decorado: la tarjeta
// se llama por la leyenda de su estilo.
const ESTILOS = {
  minimalista: [<span className="rot">menos</span>, <Trazo d="M3 13l6 6L21 5" caja="0 0 24 24" />],
  tecnologico: [
    <>
      $ ./tu-marca --deploy<b>99,98% uptime</b>&gt; listo <i />
    </>,
    <span>[x]</span>,
  ],
  corporativo: [
    <>
      <span className="banda">
        <i />
        GRUPO TU MARCA
      </span>
      <span className="cols">
        {[25, 12, 3].map((n) => (
          <span key={n}>
            <b>{n}</b>
            <i />
            <i />
          </span>
        ))}
      </span>
    </>,
    <span>OK</span>,
  ],
  editorial: [
    <>
      <span className="folio">
        <span>Nº 07</span>
        <span>Otoño</span>
      </span>
      <span className="titular">La calma de lo bien hecho</span>
      <span className="parrafo">Hay oficios que se aprenden mirando. Este es uno de ellos.</span>
      <span className="parrafo">Treinta años detrás del mismo mesón, y cada día distinto.</span>
    </>,
    <span>Elegido</span>,
  ],
  calido: [
    <>
      <span className="bola b1" />
      <span className="bola b2" />
      <span className="bola b3" />
      <span className="rot">Pasa, estás en tu casa</span>
    </>,
    <span>♥</span>,
  ],
  premium: [<span className="rot">MAISON</span>, <span>✦</span>],
  audaz: [<span className="rot">SÍ.</span>, <span>!</span>],
  ludico: [
    <>
      <span className="p p1" />
      <span className="p p2" />
      <span className="p p3" />
      <span className="p p4" />
    </>,
    <span>¡Este!</span>,
  ],
  brutalista: [
    <>
      <b>Sin filtro</b>Lo que ves es lo que hay. <u>index.html</u>
    </>,
    <span>X</span>,
  ],
  retro: [
    <>
      <span className="sol" />
      <span className="rayas" />
      <span className="rot">Groovy</span>
    </>,
    <Trazo d="M15 0l2.6 9.7L26 4l-5.7 8.4L30 15l-9.7 2.6L26 26l-8.4-5.7L15 30l-2.6-9.7L4 26l5.7-8.4L0 15l9.7-2.6L4 4l8.4 5.7z" caja="0 0 30 30" />,
  ],
  suizo: [
    <>
      <span className="cua" />
      <span className="rot">Forma sigue a función</span>
      <span className="reg">Zürich 1957</span>
    </>,
    <span>+</span>,
  ],
  natural: [
    <>
      <span className="hoja" />
      <span className="hoja h2" />
      <span className="rot">
        de la tierra
        <br />a tu mesa
      </span>
    </>,
    <span />,
  ],
  futurista: [<span className="vidrio">NEXT/26</span>, <span />],
  artesanal: [
    <span className="etiqueta">
      <b>Hecho a mano</b>
      <small>Lote 014 · Valdivia</small>
    </span>,
    <span>Sí</span>,
  ],
  zen: [
    <>
      <Enso r={38} caja={100} />
      <span className="rojo" />
    </>,
    <Enso r={11} caja={30} />,
  ],
  industrial: [
    <>
      <span className="rot">
        TALLER
        <br />
        Nº 9
      </span>
      <span className="cinta" />
      <span className="remache r1" />
      <span className="remache r2" />
    </>,
    <span>OK</span>,
  ],
  artdeco: [
    <>
      <span className="abanico" />
      <span className="rot">MIRADOR</span>
    </>,
    <span />,
  ],
  bauhaus: [
    <>
      <i className="c" />
      <i className="q" />
      <i className="t" />
      <i className="b" />
    </>,
    <span />,
  ],
  memphis: [
    <>
      <i className="zz" />
      <i className="ci" />
      <i className="tr" />
      <i className="pi" />
    </>,
    <span />,
  ],
  y2k: [
    <>
      <span className="rot">brillo</span>
      <span className="chispa ch1">✦</span>
      <span className="chispa ch2">✦</span>
      <span className="chispa ch3">✦</span>
    </>,
    <span>✦</span>,
  ],
  andino: [
    <>
      <span className="greca" />
      <span className="rot">Telar</span>
      <span className="greca g2" />
    </>,
    <span />,
  ],
  letterpress: [
    <>
      <span className="rot">Valdés</span>
      <small>Impreso a mano</small>
    </>,
    <span>✓</span>,
  ],
  collage: [
    <>
      <b className="r1">SIN</b>
      <b className="r2">permiso</b>
      <b className="r3">RUIDO</b>
      <span className="cinta" />
    </>,
    <span />,
  ],
  clinico: [
    <>
      <svg viewBox="0 0 300 50" preserveAspectRatio="none">
        <path d="M0 25H110L122 8L136 44L148 18L156 25H300" />
      </svg>
      <span className="tarjeta">
        <i />
        Hora disponible · mañana 10:30
      </span>
    </>,
    <span>✓</span>,
  ],
}

function Trazo({ d, caja }) {
  return (
    <svg viewBox={caja}>
      <path d={d} />
    </svg>
  )
}

// Un ensō: un círculo de un solo trazo que no se cierra.
function Enso({ r, caja }) {
  const centro = caja / 2
  return (
    <svg viewBox={`0 0 ${caja} ${caja}`}>
      <circle cx={centro} cy={centro} r={r} transform={`rotate(-70 ${centro} ${centro})`} />
    </svg>
  )
}

// La palabra de las tipografías: la misma en todas, para que se comparen solo
// por la letra. La expresiva mueve cada letra por separado.
const PALABRA = 'Tu marca'

function Especimen({ tipo }) {
  if (tipo !== 'expresiva') return <span>{PALABRA}</span>
  return (
    <span>
      {[...PALABRA].map((letra, i) => (
        <i key={i}>{letra === ' ' ? ' ' : letra}</i>
      ))}
    </span>
  )
}

// El arte de un estilo y su marca de elegido, para su tarjeta (los bocetos de
// PreguntaBrief.jsx).
export function muestraDeEstilo(estilo) {
  const [arte, sello] = ESTILOS[estilo]
  return { arte, sello }
}

// El nombre del negocio en las muestras de logo. Sin nombre, «Tu marca»:
// brief-logo.js pone el que se escribió en la primera parte, y sus iniciales
// donde van (`data-iniciales`, `data-inicial` y `data-resto`).
const Nombre = () => (
  <span className="nombre" data-nombre-marca>
    Tu marca
  </span>
)

// El dibujo de las muestras con símbolo: la cordillera con su sol.
const Cordillera = () => (
  <svg className="picto" viewBox="0 0 48 48">
    <circle className="sol" cx="33" cy="15" r="6" />
    <path className="cerro" d="M3 41L17 17l8 12 6-8 14 20z" />
  </svg>
)

// Cada tipo de logo, dibujado con el nombre del negocio.
const TIPOS_DE_LOGO = {
  nombre: <Nombre />,
  monograma: (
    <>
      <svg className="aro" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" />
      </svg>
      <span className="iniciales" data-iniciales>
        TM
      </span>
    </>
  ),
  simbolo: <Cordillera />,
  abstracto: (
    <span className="formas">
      <i />
      <i />
      <i />
    </span>
  ),
  'simbolo-y-nombre': (
    <>
      <Cordillera />
      <Nombre />
    </>
  ),
  fundidos: (
    <span className="fundido">
      <span className="inicial" data-inicial>
        T
      </span>
      <span data-resto>u marca</span>
    </span>
  ),
  emblema: (
    <span className="insignia">
      <small>Desde 2026</small>
      <Nombre />
      <small>★ ★ ★</small>
    </span>
  ),
  mascota: (
    <>
      <svg className="cara" viewBox="0 0 64 64">
        <circle className="oreja" cx="14" cy="16" r="8" />
        <circle className="oreja" cx="50" cy="16" r="8" />
        <circle className="cabeza" cx="32" cy="34" r="24" />
        <ellipse className="ojo" cx="23" cy="31" rx="3" ry="4" />
        <ellipse className="ojo guino" cx="41" cy="31" rx="3" ry="4" />
        <path className="boca" d="M23 42q9 8 18 0" />
      </svg>
      <Nombre />
    </>
  ),
  firma: (
    <>
      <Nombre />
      <svg className="subraya" viewBox="0 0 120 12" preserveAspectRatio="none">
        <path d="M3 9C35 3 80 2 117 6" />
      </svg>
    </>
  ),
  variable: (
    <span className="variantes">
      {['v1', 'v2', 'v3'].map((v) => (
        <span key={v} className={v} data-inicial>
          T
        </span>
      ))}
    </span>
  ),
}

const MUESTRAS = {
  tipografia: (v) => ({ clase: `brief-muestra brief-tipo tipo-${v}`, arte: <Especimen tipo={v} />, sello: <span>✓</span> }),
  logo: (v) => ({ clase: `brief-muestra brief-logo logo-${v}`, arte: TIPOS_DE_LOGO[v], sello: <span>✓</span> }),
}

// Una opción de una pregunta con `muestras`: su casilla nativa cubre la
// tarjeta, como en las demás tarjetas del brief.
export default function MuestraBrief({ muestras, casilla, opcion }) {
  const { clase, arte, sello } = MUESTRAS[muestras](opcion.v)
  return (
    <label className={clase}>
      {casilla}
      <span className="brief-muestra-arte" aria-hidden="true">
        {arte}
      </span>
      <span className="brief-muestra-pie">
        <span className="brief-muestra-nombre">{opcion.l}</span>
        {opcion.d && <span className="brief-muestra-detalle">{opcion.d}</span>}
        <span className="brief-sello" aria-hidden="true">
          {sello}
        </span>
      </span>
    </label>
  )
}

// El dibujo de cada reacción a un estilo (reglas.js), en su círculo: el
// corazón, la onda del «más o menos» y la cruz. Al marcarse, el círculo se
// llena con su color (muestras.css).
export const TRAZOS_DE_REACCION = {
  si: 'M12 20.2s-7.6-4.6-7.6-10.4A4.1 4.1 0 0 1 12 7.3a4.1 4.1 0 0 1 7.6 2.5c0 5.8-7.6 10.4-7.6 10.4z',
  medio: 'M4.5 12.5c2.5-3.3 5-3.3 7.5 0s5 3.3 7.5 0',
  no: 'M7.5 7.5l9 9M16.5 7.5l-9 9',
}

export function IconoReaccion({ valor }) {
  return (
    <span className="brief-reaccion-icono" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d={TRAZOS_DE_REACCION[valor]} />
      </svg>
    </span>
  )
}

// El logotipo de cada empresa, en vez del ✓: el oficial, en sus colores. Los
// trazados son los de Simple Icons (CC0), salvo la G de Google, que es la de
// su botón «Acceder con Google» porque la de Simple Icons es de un color.
const LOGOS = {
  google: (
    <svg viewBox="0 0 48 48">
      <path fill="#ea4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285f4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#fbbc05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34a853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  ),
  // El ícono de la aplicación: la cámara blanca sobre su degradado.
  instagram: (
    <svg viewBox="0 0 24 24">
      <radialGradient id="degradado-instagram" cx="0.3" cy="1.07" r="1.5">
        <stop offset="0" stopColor="#fdf497" />
        <stop offset="0.05" stopColor="#fdf497" />
        <stop offset="0.45" stopColor="#fd5949" />
        <stop offset="0.6" stopColor="#d6249f" />
        <stop offset="0.9" stopColor="#285aeb" />
      </radialGradient>
      <rect width="24" height="24" rx="5.5" fill="url(#degradado-instagram)" />
      <path fill="#fff" transform="translate(4.5 4.5) scale(0.625)" d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24">
      <path fill="#fff" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  ),
  // La nota blanca con su cian y su rojo corridos, como en el logotipo.
  tiktok: (
    <svg viewBox="0 0 24 24">
      <path fill="#25f4ee" transform="translate(-0.6 -0.6)" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      <path fill="#fe2c55" transform="translate(0.6 0.6)" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      <path fill="#fff" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24">
      <path fill="#fff" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24">
      <path fill="#25d366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  ),
}

export function LogoDeMarca({ marca }) {
  return (
    <span className="logo-marca" aria-hidden="true">
      {LOGOS[marca]}
    </span>
  )
}
