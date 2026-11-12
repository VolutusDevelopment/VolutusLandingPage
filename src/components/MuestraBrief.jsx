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
 * /brief-web: el CSS del sitio va dentro de cada página y esto no le sirve a
 * ninguna otra.
 */

// El logo de Cauce, el boceto tecnológico: curvas de nivel alrededor de un
// sensor. El mismo de public/brief/bocetos/cauce.html.
function Cauce() {
  return (
    <svg viewBox="0 0 32 32">
      <path d="M16 2.5c7.6 0 13.5 4.6 13.5 11.2S24 29.5 15.4 29.5 2.5 24.8 2.5 17 8.4 2.5 16 2.5zM16.4 8.6c4.4 0 7.4 2.6 7.4 6.6s-3.3 8.4-7.9 8.4-7.6-2.8-7.6-7.1 3.7-7.9 8.1-7.9z" />
      <circle cx="16" cy="16" r="3.2" />
    </svg>
  )
}

// El ensō a pincel de Kiri, el boceto zen: un círculo de un solo trazo que
// adelgaza y no se cierra. Y su kanji, 霧 (niebla), dibujado de Shippori
// Mincho (OFL) para no bajar la fuente japonesa. Los mismos de
// public/brief/bocetos/kiri.html.
const ENSO = 'M58.9 22.7L63.6 19.9L68.4 17.4L73.5 15.3L78.7 13.6L84 12.3L89.4 11.3L94.9 10.8L100.4 10.6L105.9 10.8L111.4 11.4L116.8 12.3L122.2 13.6L127.5 15.2L132.6 17.1L137.6 19.3L142.5 21.8L147.2 24.7L151.7 27.8L156 31.1L160.1 34.8L163.9 38.7L167.5 42.8L170.8 47.2L173.7 51.8L176.3 56.5L178.5 61.5L180.4 66.5L181.9 71.7L183.1 76.9L183.9 82.2L184.3 87.5L184.3 92.7L184.1 97.9L183.5 103.1L182.7 108.2L181.6 113.2L180.2 118.1L178.7 123L176.8 127.7L174.8 132.3L172.6 136.8L170.1 141.1L167.5 145.4L164.6 149.5L161.5 153.4L158.1 157.2L154.6 160.7L150.8 164.1L146.8 167.2L142.6 170L138.2 172.5L133.7 174.7L129 176.6L124.2 178.2L119.3 179.4L114.3 180.3L109.3 180.8L104.3 181L99.3 180.9L94.4 180.5L89.4 179.8L84.6 178.8L79.8 177.5L75.1 176L70.5 174.2L66 172.2L61.7 169.9L57.5 167.3L53.5 164.5L49.6 161.4L46 158.2L42.6 154.6L39.5 150.9L36.6 147L34 142.8L31.8 138.6L29.8 134.1L28.2 129.6L26.8 125L25.8 120.3L25.2 115.6L24.8 110.9L24.6 106.2L24.8 101.6L25.2 97L25.8 92.4L26.7 87.9L27.7 83.4L29 79L30.7 74.8A0.9 0.9 0 0 1 32.3 75.4L32.3 75.4L31.3 79.7L30.5 84L29.9 88.4L29.6 92.8L29.5 97.1L29.8 101.5L30.3 105.8L31 110L32 114.2L33.2 118.3L34.6 122.4L36.1 126.3L37.9 130.2L39.9 134L42 137.6L44.4 141.2L46.9 144.7L49.6 148L52.5 151.2L55.6 154.2L58.9 157L62.4 159.6L66 162L69.9 164.1L73.8 165.9L77.9 167.4L82.1 168.6L86.4 169.6L90.7 170.1L95.1 170.4L99.4 170.4L103.8 170.1L108 169.5L112.3 168.6L116.4 167.5L120.5 166.2L124.5 164.6L128.3 162.9L132.1 160.9L135.8 158.8L139.3 156.5L142.8 154L146.1 151.3L149.2 148.4L152.2 145.4L155 142.1L157.6 138.7L160 135.2L162.1 131.5L164 127.6L165.6 123.6L166.9 119.5L167.9 115.3L168.7 111.1L169.1 106.9L169.3 102.6L169.2 98.3L168.9 94.1L168.3 89.8L167.5 85.7L166.5 81.5L165.2 77.5L163.7 73.5L162.1 69.6L160.2 65.7L158.1 62L155.8 58.4L153.3 54.9L150.5 51.5L147.6 48.4L144.4 45.4L141.1 42.7L137.5 40.2L133.8 37.9L129.8 36L125.8 34.4L121.7 33L117.5 32L113.2 31.4L108.9 31L104.6 30.9L100.3 31.1L96.1 31.6L91.9 32.4L87.9 33.4L83.9 34.6L79.9 36L76.1 37.6L72.4 39.4L68.8 41.4A10.6 10.6 0 0 1 58.9 22.7Z'
const KIRI = 'M58 327Q58 313 67 301Q76 289 90 283Q115 270 130 240Q145 211 141 177L156 176Q161 189 167 213H459V149H315Q244 150 165 163L139 111Q194 117 272 119H727L748 90Q752 85 758 76Q765 68 769 64Q773 60 777 60Q783 60 804 76Q826 91 844 108Q863 126 863 133Q859 149 837 149H536V213H837L878 169Q915 204 930 222Q946 239 946 246Q946 250 936 252L919 254Q901 275 875 298Q849 322 827 338L815 331Q828 298 841 242H536V309L537 350Q538 395 541 437Q536 446 518 454Q499 462 472 462Q463 462 458 456Q452 450 452 442Q457 395 459 316V242H171L172 258Q172 293 159 318Q146 343 126 354Q112 362 97 362Q82 362 70 352Q58 343 58 327ZM264 332Q239 333 210 346L185 295Q223 301 277 303H320L334 283Q337 280 344 271Q350 262 356 262Q366 262 391 284Q416 305 416 316Q413 332 392 332ZM724 283Q727 279 734 270Q741 262 747 262Q757 262 782 284Q808 305 808 316Q805 332 784 332H649Q621 333 593 346L567 295Q607 301 663 303H709ZM838 532Q802 593 743 634Q826 661 946 671V683Q927 687 914 703Q902 719 897 743Q768 716 688 668Q646 689 618 698Q712 707 712 719Q712 723 703 728L686 737Q680 765 676 778H785L801 760Q804 757 812 749Q819 741 825 741Q831 741 848 754Q866 766 880 780Q895 795 895 802Q887 811 859 816Q854 876 842 910Q830 944 807 959Q775 980 722 980Q722 947 706 935Q692 922 635 912V896Q728 902 738 902Q757 902 767 896Q774 890 781 866Q788 843 792 807H664Q636 867 574 911Q511 955 399 981L392 966Q473 939 520 899Q568 859 591 807H550Q516 808 478 821L452 770Q495 776 554 778H602Q612 743 615 700Q542 725 444 741L439 726Q565 694 648 640Q598 603 568 555Q517 601 470 625L459 614Q475 598 475 598Q509 562 537 511Q565 460 574 418L586 421L564 378Q610 384 676 386H728L743 365Q746 361 753 352Q760 344 766 344Q776 344 804 366Q831 388 831 399Q827 415 806 415H730Q667 416 604 427Q672 446 672 457Q672 460 664 462L647 466Q634 486 619 502H809L827 476Q830 472 836 464Q841 457 845 453Q849 449 853 449Q859 449 878 463Q896 477 912 493Q928 509 928 516Q924 532 903 532ZM168 378Q212 384 274 386H324L339 366Q341 363 346 358Q350 352 354 349Q357 346 361 346Q371 346 397 367Q423 388 423 399Q419 415 398 415H326Q264 416 194 429ZM365 787 352 779Q376 732 395 670H325V887Q325 917 318 935Q312 953 292 965Q272 977 232 981Q230 948 217 935Q200 918 154 911V897Q225 902 240 902Q250 902 254 898Q257 894 257 885V745Q186 840 60 912L50 896Q161 808 224 670H174Q132 671 84 684L58 634Q113 640 191 642H283Q265 618 234 594Q202 569 172 555L180 545Q256 545 298 570Q325 548 360 509H264Q193 510 114 523L87 472Q142 478 220 480H372L391 458Q395 454 404 444Q412 435 418 435Q427 435 454 466Q482 498 482 509Q472 518 444 519Q405 548 320 586Q337 603 337 623Q337 634 331 642H393L410 621Q414 617 422 608Q429 600 435 600Q444 600 473 630Q502 660 502 671Q497 676 489 678Q481 680 465 681Q448 706 419 736Q390 767 365 787ZM754 532H592L584 541Q620 583 685 613Q729 577 754 532Z'

function Enso() {
  return (
    <svg className="enso" viewBox="0 0 200 200">
      <path d={ENSO} />
    </svg>
  )
}

// La huella de Pelusa (lúdico): en su arte y en su sello.
const HUELLA = (
  <>
    <ellipse cx="12" cy="16.2" rx="5.6" ry="4.6" />
    <ellipse cx="5" cy="10" rx="2.2" ry="2.8" />
    <ellipse cx="9.3" cy="5.8" rx="2.3" ry="3" />
    <ellipse cx="14.7" cy="5.8" rx="2.3" ry="3" />
    <ellipse cx="19" cy="10" rx="2.2" ry="2.8" />
  </>
)

// El abanico de Bar Marfil (art déco) y el acento de Prensa Tilde
// (letterpress): los mismos de sus bocetos, en el arte y en el sello.
const ABANICO = 'M18 20L2 14.5A16 16 0 0 1 4.6 9zM18 20L5.4 7.9A16 16 0 0 1 9.4 4.4zM18 20L10.6 3.7A16 16 0 0 1 15.6 2.2zM18 20L17 2h2zM18 20L20.4 2.2A16 16 0 0 1 25.4 3.7zM18 20L26.6 4.4A16 16 0 0 1 30.6 7.9zM18 20L31.4 9A16 16 0 0 1 34 14.5z'
const ACENTO = 'M2 15L9 1H15L5 15Z'

// El dado de Tablero (Memphis): su logo, con un punto de cada color.
const DADO = (
  <>
    <rect x="2" y="2" width="32" height="32" rx="8" fill="#111111" />
    <circle cx="11" cy="11" r="3.6" fill="#ffd23f" />
    <circle cx="25" cy="11" r="3.6" fill="#ff6fa8" />
    <circle cx="11" cy="25" r="3.6" fill="#2ec4b6" />
    <circle cx="25" cy="25" r="3.6" fill="#7b5cff" />
  </>
)

// El destello de Destello (Y2K), la estrella de ocho puntas de Cénit
// (futurista) y la flecha de Rumbo (suizo): los mismos de sus bocetos.
const CHISPA = 'M12 0C12.9 7.6 16.4 11.1 24 12C16.4 12.9 12.9 16.4 12 24C11.1 16.4 7.6 12.9 0 12C7.6 11.1 11.1 7.6 12 0Z'
const ESTRELLA = 'M12 0l1.6 7.2L20.5 3.5l-3.7 6.9L24 12l-7.2 1.6 3.7 6.9-6.9-3.7L12 24l-1.6-7.2-6.9 3.7 3.7-6.9L0 12l7.2-1.6L3.5 3.5l6.9 3.7z'
const FLECHA = 'M8 42h58L40 16l12-12 46 46-46 46-12-12 26-26H8z'

// La fecha naranja de Destello en siete segmentos, como la estampaban las
// cámaras: cada dígito enciende sus trazos.
const SEGMENTOS = { a: [2, 0, 6, 2], b: [8, 1.6, 2, 6.6], c: [8, 9.8, 2, 6.6], d: [2, 16, 6, 2], e: [0, 9.8, 2, 6.6], f: [0, 1.6, 2, 6.6], g: [2, 8, 6, 2] }
const DIGITOS = ['abcdef', 'bc', 'abged', 'abgcd', 'fgbc', 'afgcd', 'afgedc', 'abc', 'abcdefg', 'abcdfg']

function Fecha({ texto }) {
  let x = 0
  const trazos = []
  for (const [i, caracter] of [...texto].entries()) {
    if (caracter === "'") {
      trazos.push(<rect key={i} x={x + 0.5} y="0" width="1.8" height="5" />)
      x += 4
    } else if (caracter === ' ') {
      x += 5
    } else {
      for (const segmento of DIGITOS[caracter]) {
        const [sx, sy, ancho, alto] = SEGMENTOS[segmento]
        trazos.push(<rect key={`${i}${segmento}`} x={x + sx} y={sy} width={ancho} height={alto} />)
      }
      x += 13
    }
  }
  return (
    <svg className="fecha" viewBox={`0 0 ${x - 3} 18`}>
      {trazos}
    </svg>
  )
}

// El arte de cada estilo y su marca de elegido. Todo es decorado: la tarjeta
// se llama por la leyenda de su estilo.
const ESTILOS = {
  minimalista: [<span className="rot">menos</span>, <Trazo d="M3 13l6 6L21 5" caja="0 0 24 24" />],
  tecnologico: [
    <>
      <svg className="curvas" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice">
        <path d="M-10 128C50 106 92 138 150 120S250 84 310 106M-10 104C46 78 96 112 150 94S246 58 310 78M-10 80C50 52 100 88 152 68S242 34 310 52M168 58c22-14 62-12 74 6s-8 34-40 34-56-26-34-40zM186 64c12-7 34-6 40 4s-6 18-22 18-30-14-18-22z" />
      </svg>
      <span className="logo">
        <Cauce />
        cauce
      </span>
      <span className="sensor" />
      <span className="lectura">Humedad 31,4 %</span>
    </>,
    <span />,
  ],
  corporativo: [
    <>
      <span className="banda">
        <svg viewBox="0 0 34 26">
          <rect x="1" y="3" width="32" height="4" rx="1" />
          <rect className="hueco" x="6" y="10" width="7" height="8" rx="1.5" />
          <rect className="hueco" x="21" y="10" width="7" height="8" rx="1.5" />
          <rect x="1" y="21" width="32" height="2" />
        </svg>
        BASAL INGENIERÍA
      </span>
      <svg className="corte" viewBox="0 -8 240 112" preserveAspectRatio="xMidYMax meet">
        <g className="suelo">
          <path className="tierra" d="M-60 90H300V110H-60Z" />
          <path className="raya" d="M-60 90H300" />
        </g>
        <g className="edificio">
          <rect x="84" y="12" width="72" height="60" />
          <path d="M84 27H156M84 42H156M84 57H156M108 12V72M132 12V72" />
          <rect className="losa" x="78" y="72" width="84" height="5" />
          {[90, 120, 150].map((x) => (
            <rect key={x} className="ais" x={x - 7} y="77" width="14" height="13" rx="2" />
          ))}
        </g>
      </svg>
    </>,
    <svg viewBox="0 0 30 30">
      <rect x="5" y="6" width="20" height="3" />
      <rect className="goma" x="7" y="9" width="16" height="12" rx="2" />
      <rect x="5" y="21" width="20" height="3" />
    </svg>,
  ],
  editorial: [
    <>
      <span className="tapa">
        <b>LADERA</b>
        <span className="numero">
          <span>Nº 12</span>
          <span>Vendimia</span>
        </span>
        <svg className="cerros" viewBox="0 0 92 64" preserveAspectRatio="none">
          <path d="M0 30Q30 10 60 26T92 20V64H0Z" fill="#7a7a4a" />
          <path d="M0 44Q40 26 92 40V64H0Z" fill="#b4694a" />
          <path d="M0 54Q50 44 92 52V64H0Z" fill="#6b1f2a" />
        </svg>
        <i>Un año en la ladera</i>
      </span>
      <span className="sumario">
        {[
          ['p. 3', 'Carta'],
          ['p. 6', 'Reportaje'],
          ['p. 18', 'Los vinos'],
        ].map(([folio, titulo]) => (
          <span key={folio}>
            <small>{folio}</small>
            {titulo}
          </span>
        ))}
      </span>
    </>,
    <span>Nº 12</span>,
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
      <span className="f f1" />
      <span className="f f2" />
      <span className="f f3" />
      <svg className="huella" viewBox="0 0 24 24">
        {HUELLA}
      </svg>
      <span className="rot">pelusa</span>
    </>,
    <svg viewBox="0 0 24 24">{HUELLA}</svg>,
  ],
  brutalista: [
    <span className="cartel">
      <b>SÓTANO</b>
      <span className="fila">
        <span>VIE 21:00</span>
        <span>35MM</span>
      </span>
      <u>La batalla de Chile</u>
    </span>,
    <span>[x]</span>,
  ],
  retro: [
    <>
      <svg className="cinta" viewBox="0 0 300 150" preserveAspectRatio="none">
        {[0, 1, 2, 3].map((franja) => (
          <path key={franja} d="M-20 150C60 150 100 84 170 92S250 132 320 70" />
        ))}
      </svg>
      <span className="rot">Lucero</span>
      <span className="disco">
        <svg viewBox="0 0 40 34">
          <path className="bota" d="M11 3h10l1 15h8c3 0 5 2 5 5v3H9z" />
          <path className="cordon" d="M14 8h6M14 12h6" />
          <circle cx="14" cy="30" r="3.5" />
          <circle cx="30" cy="30" r="3.5" />
        </svg>
      </span>
    </>,
    <Trazo d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" caja="0 0 24 24" />,
  ],
  suizo: [
    <>
      <span className="cua" />
      <svg className="flecha" viewBox="0 0 100 100">
        <path d={FLECHA} />
      </svg>
      <span className="rot">Rumbo</span>
      <span className="reg">Que nadie se pierda</span>
    </>,
    <Trazo d={FLECHA} caja="0 0 100 100" />,
  ],
  natural: [
    <>
      <span className="tierra" />
      <svg className="rama" viewBox="0 0 120 130">
        <path d="M18 124C34 96 52 70 98 14" />
        {[
          [30, 104, -40],
          [30, 104, 200],
          [46, 82, -46],
          [46, 82, 206],
          [64, 58, -52],
          [64, 58, 212],
          [82, 36, -58],
          [82, 36, 216],
          [98, 14, -52],
        ].map(([x, y, giro]) => (
          <path key={`${x}${giro}`} d="M0 0Q9-7 19 0Q9 7 0 0ZM3 0H16" transform={`translate(${x} ${y}) rotate(${giro})`} />
        ))}
      </svg>
      <span className="jabon">
        <b>quillay</b>
      </span>
      <span className="rot">quillay</span>
    </>,
    <svg viewBox="0 0 30 30">
      <path d="M4 26C4 14 12 6 26 4C24 18 16 26 4 26Z" />
    </svg>,
  ],
  futurista: [
    <>
      <span className="estelas" />
      <svg className="cerros" viewBox="0 0 300 40" preserveAspectRatio="none">
        <path d="M0 30C40 22 70 12 110 16S170 34 210 28 270 8 300 14V40H0Z" />
      </svg>
      <span className="rot">CÉNIT</span>
    </>,
    <Trazo d={ESTRELLA} caja="0 0 24 24" />,
  ],
  artesanal: [
    <>
      <svg className="gotas" viewBox="0 0 240 64" preserveAspectRatio="xMidYMin slice">
        <path d="M0 0H240V12C200 16 160 10 120 14S40 16 0 13Z" />
        <path className="gota" d="M30 12V30a6 6 0 0 0 12 0V12Z" />
        <path className="gota" d="M74 12V44a7 7 0 0 0 14 0V12Z" />
        <path className="gota" d="M126 12V26a5 5 0 0 0 10 0V12Z" />
        <path className="gota" d="M170 12V40a7 7 0 0 0 14 0V12Z" />
        <path className="gota" d="M214 12V28a6 6 0 0 0 12 0V12Z" />
      </svg>
      <span className="libar">
        libar
        <small>Miel cruda · Curacautín</small>
      </span>
    </>,
    <svg viewBox="0 0 30 30">
      <path d="M15 2c5 7 9 11 9 17a9 9 0 0 1-18 0c0-6 4-10 9-17z" />
    </svg>,
  ],
  zen: [
    <>
      <Enso />
      <span className="nombre">
        <svg viewBox="0 0 1000 1000">
          <path d={KIRI} />
        </svg>
        <b>Kiri</b>
      </span>
    </>,
    <Enso />,
  ],
  industrial: [
    <>
      <span className="adentro" />
      <span className="cortina">
        <b>REMACHE</b>
      </span>
      {['r1', 'r2', 'r3', 'r4'].map((esquina) => (
        <span key={esquina} className={`remache ${esquina}`} />
      ))}
    </>,
    <span />,
  ],
  artdeco: [
    <>
      <svg className="abanico" viewBox="0 0 300 150" preserveAspectRatio="xMidYMax meet">
        <path className="izq" d="M125.3 150L7.3 111.6M127.5 145L20.1 83M130.7 140.6L38.5 57.6M134.7 137L61.8 36.6M139.4 134.2L89 21M144.6 132.6L118.8 11.3" />
        <path d="M150 132V8" />
        <path className="der" d="M155.4 132.6L181.2 11.3M160.6 134.2L211 21M165.3 137L238.2 36.6M169.3 140.6L261.5 57.6M172.5 145L279.9 83M174.7 150L292.7 111.6" />
      </svg>
      <span className="rot">MARFIL</span>
    </>,
    <svg viewBox="0 0 36 20">
      <path d={ABANICO} />
    </svg>,
  ],
  bauhaus: [
    <>
      <svg className="bisagra" viewBox="0 0 26 32">
        <rect x="2" y="1" width="7" height="30" rx="3.5" />
        <path className="hoja" d="M9.6 2.5h4.9a6.25 6.25 0 0 1 0 12.5H9.6z" />
        <path className="hoja" d="M9.6 16.5h6.4a7 7 0 0 1 0 14H9.6z" />
      </svg>
      <span className="rot">Bisagra</span>
    </>,
    <svg viewBox="0 0 26 32">
      <path d="M5.5 1a3.5 3.5 0 0 1 3.5 3.5v23a3.5 3.5 0 0 1-7 0v-23A3.5 3.5 0 0 1 5.5 1zM9.6 2.5h4.9a6.25 6.25 0 0 1 0 12.5H9.6zM9.6 16.5h6.4a7 7 0 0 1 0 14H9.6z" />
    </svg>,
  ],
  memphis: [
    <>
      <svg className="garabato" viewBox="0 0 100 50">
        <path d="M6 30c10-22 22-22 30 0s20 22 30 0 20-22 28-4" />
      </svg>
      <i className="pi" />
      <i className="tr" />
      <i className="ci" />
      <svg className="dado" viewBox="0 0 36 36">
        {DADO}
      </svg>
      <span className="rot">tablero</span>
    </>,
    <svg viewBox="0 0 36 36">{DADO}</svg>,
  ],
  y2k: [
    <>
      <span className="rot">destello</span>
      {['ch1', 'ch2', 'ch3'].map((chispa) => (
        <svg key={chispa} className={`chispa ${chispa}`} viewBox="0 0 24 24">
          <path d={CHISPA} />
        </svg>
      ))}
      <Fecha texto="'06 11 11" />
    </>,
    <Trazo d={CHISPA} caja="0 0 24 24" />,
  ],
  andino: [
    <>
      <span className="franja">
        {[1, 2, 3, 4, 5].map((fila) => (
          <i key={fila} />
        ))}
      </span>
      <span className="rot">
        <svg viewBox="0 0 40 56">
          <path d="M1.5 27.5 15.5 19 32 24.5 18 35.5zM27.6 4 31 .8 34.4 4 31 7.2z" />
          <path className="ala" d="M10 26.6 17.6 22.6 25.6 25.2 18.2 30.4z" />
          <path className="cuello" d="M27 24.5C34 21 35.5 14 30 11.2 24.6 8.6 25.2 3.4 30 3" />
          <path className="pico" d="M33.2 3.1 38.6 4.4 37.4 8.8 35 5.6z" />
          <path className="pata" d="M17.5 34V54M17.5 40.5 23 44.5 17.5 46.5M15 54h5" />
        </svg>
        Parina
      </span>
      <span className="franja f2">
        {[1, 2, 3, 4, 5].map((fila) => (
          <i key={fila} />
        ))}
      </span>
    </>,
    <span />,
  ],
  letterpress: [
    <>
      {['c1', 'c2', 'c3', 'c4'].map((esquina) => (
        <i key={esquina} className={`corte ${esquina}`} />
      ))}
      <span className="rot">
        Tilde
        <svg viewBox="0 0 16 16">
          <path d={ACENTO} />
        </svg>
      </span>
      <small>Prensa · tipos móviles</small>
    </>,
    <svg viewBox="0 0 16 16">
      <path d={ACENTO} />
    </svg>,
  ],
  collage: [
    <>
      <span className="rescate">
        {['R', 'A', 'M', 'P', 'A'].map((letra, orden) => (
          <b key={orden} className={`v${orden}`}>
            {letra}
          </b>
        ))}
      </span>
      <span className="cinta" />
      <span className="lema">caerse es la primera clase</span>
    </>,
    <span />,
  ],
  clinico: [
    <>
      <span className="marca">
        <i />
        Iris
      </span>
      <span className="tabla">
        <b className="f1">E</b>
        <b className="f2">F P</b>
        <b className="f3">T O Z</b>
      </span>
    </>,
    <span />,
  ],
}

function Trazo({ d, caja }) {
  return (
    <svg viewBox={caja}>
      <path d={d} />
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
