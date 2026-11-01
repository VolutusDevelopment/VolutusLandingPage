import Articulo from '../../../components/Articulo.jsx'

// Las fuentes, en el orden en que el texto las cita por primera vez: ese orden
// es su número en las notas del final.
const FUENTES = {
    hockenheim: {
    titulo: 'F1 Hockenheimring 1992 Nigel Mansell im Williams FW14B',
    idioma: 'de',
    medio: 'Auge=mit, Wikimedia Commons',
    licencia: { nombre: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
    url: 'https://commons.wikimedia.org/wiki/File:F1_Hockenheimring_1992_Nigel_Mansell_005.jpg',
  },
  hill: {
    titulo: 'Graham Hill: The Triple Crown',
    medio: '24h Le Mans',
    url: 'https://www.24h-lemans.com/en/news/graham-hill-the-triple-crown-12598',
  },
  monaco: {
    titulo: 'Grand Prix de Monaco, le virage de la gare de Monte-Carlo, en tête Williams sur Bugatti',
    idioma: 'fr',
    medio: 'Agence Rol, 1929. Bibliothèque nationale de France, en Wikimedia Commons, dominio público',
    url: 'https://commons.wikimedia.org/wiki/File:14-4-29,_Grand_Prix_(automobile)_de_Monaco,_le_virage_de_la_gare_de_Monte-Carlo,_en_t%C3%AAte_Williams_sur_Bugatti_-_btv1b532124779.jpg',
  },
  fw14b: {
    titulo: 'Patrick Head explains why the 1992 Williams FW14B was great',
    medio: 'Autosport',
    url: 'https://www.autosport.com/f1/news/patrick-head-explains-why-the-1992-williams-fw14b-was-great-4989593/4989593/',
  },
  eras: {
    titulo: 'The past six new F1 eras',
    medio: 'Mercedes-AMG F1',
    url: 'https://www.mercedesamgf1.com/news/the-past-six-new-f1-eras-what-changed-and-what-happened',
  },

  reglamento: {
    titulo: '2026 Regulations explained: F1’s new power units',
    medio: 'Formula1.com',
    url: 'https://www.formula1.com/en/latest/article/2026-regulations-explained-all-you-need-to-know-about-f1s-new-power-units.14jfv7a36905uDJDdNyfQd',
  },
  motores: {
    titulo: 'F1 2026’s new engine rules explained',
    medio: 'The Race',
    url: 'https://www.the-race.com/formula-1/f1-2026-new-power-unit-engine-rules-explained/',
  },
  combustible: {
    titulo: 'F1 2026’s fuel flow meters',
    medio: 'Raceteq',
    url: 'https://www.raceteq.com/articles/2026/03/f1-2026s-fuel-flow-meters',
  },
  ensayos: {
    titulo: 'How F1’s new sliding scale aero testing rules work',
    medio: 'Formula1.com',
    url: 'https://www.formula1.com/en/latest/article/how-f1s-new-sliding-scale-aero-testing-rules-work-and-what-impact-they-will.pn0sG8N4A0cjbNRbdYx8a',
  },
  cfd: {
    titulo: 'CFD Optimization of F1 Front Wing using PINNs',
    medio: 'arXiv',
    url: 'https://arxiv.org/abs/2509.01963',
  },
  neural: {
    titulo: 'How Neural Concept’s aerodynamic AI is shaping Formula 1',
    medio: 'TechCrunch',
    url: 'https://techcrunch.com/2024/04/14/how-neural-concepts-aerodynamic-ai-is-shaping-formula-one/',
  },
  analitica: {
    titulo: 'How machine learning is powering Formula 1 cars',
    medio: 'Institute of Analytics',
    url: 'https://ioaglobal.org/blog/how-machine-learning-is-powering-formula-1-cars/',
  },
  sesion: {
    titulo: 'How we use Dell Technologies’ AI Factory in session',
    medio: 'McLaren / Dell Technologies',
    url: 'https://www.mclaren.com/racing/partners/dell-technologies/how-we-use-dell-technologies-ai-factory-in-session/',
  },
  revolucion: {
    titulo: 'How AI is revolutionising F1',
    medio: 'McLaren / Dell Technologies',
    url: 'https://www.mclaren.com/racing/partners/dell-technologies/how-ai-is-revolutionising-f1-presented-by-dell-technologies/',
  },
  limites: {
    titulo: 'Exclusive: How the FIA will use AI to police one of F1’s most controversial subjects in 2026',
    medio: 'Motorsport.com',
    url: 'https://www.motorsport.com/f1/news/exclusive-how-the-fia-will-use-ai-to-police-one-of-f1s-most-controversial-subjects-in-2026/10800288/',
  },
  hamilton: {
    titulo: '600-metre lift-and-coast is not what racing is about',
    medio: 'RaceFans',
    url: 'https://www.racefans.net/2026/02/11/600-metre-lift-and-coast-is-not-what-racing-is-about-hamilton/',
  },
  correccion: {
    titulo: 'F1 agrees package of mid-season 2026 rule changes',
    medio: 'The Race',
    url: 'https://www.the-race.com/formula-1/f1-2026-mid-season-rule-changes/',
  },
  excel: {
    titulo: 'The shocking details behind an F1 team’s painful revolution',
    medio: 'The Race',
    url: 'https://www.the-race.com/formula-1/shocking-details-behind-painful-williams-f1-revolution/',
  },
  cadillac: {
    titulo: 'Team preview: Cadillac ahead of the 2026 F1 season',
    medio: 'Formula1.com',
    url: 'https://www.formula1.com/en/latest/article/team-preview-cadillac-all-you-need-to-know-about-the-team-ahead-of-the-2026.3k6okiCru5zLyXGD98jXTE',
  },
  premios: {
    titulo: 'F1 prize money: How much do GP teams and drivers really make?',
    medio: 'Motor Sport Magazine',
    url: 'https://www.motorsportmagazine.com/articles/single-seaters/f1/f1-prize-money-how-much-do-gp-teams-and-drivers-really-make/',
  },
  hypercar: {
    titulo: 'Ferrari announces top flight Le Mans return with hypercar',
    medio: 'Motorsport.com',
    url: 'https://www.motorsport.com/wec/news/ferrari-top-flight-le-mans-sportscars-return-/5479312/',
  },
  campus: {
    titulo: 'Aston Martin start work on new F1 factory and wind tunnel campus',
    medio: 'Formula1.com',
    url: 'https://www.formula1.com/en/latest/article/aston-martin-start-work-on-new-f1-factory-and-wind-tunnel-campus-at.4YqlraU3xlRgsVv5zqlZ9m',
  },
  tunel: {
    titulo: 'Aston Martin won the ‘World Championship for most updates’ last season',
    medio: 'Formula1.com',
    url: 'https://www.formula1.com/en/latest/article/aston-martin-won-the-world-championship-for-most-updates-last-season-as-new.64jbS60VhyHbBaZWP6p8OM',
  },
  amr25: {
    titulo: 'What’s going so wrong with Aston Martin’s 2025 F1 season',
    medio: 'The Race',
    url: 'https://www.the-race.com/formula-1/whats-going-wrong-aston-martin-2025-season/',
  },
  v8: {
    titulo: 'F1 will switch to V8s and ‘minimal’ electric power',
    medio: 'The Race',
    url: 'https://www.the-race.com/formula-1/f1-v8-engine-plan-2030-2031-fia-ben-sulayem/',
  },
  monaco2025: {
    titulo: 'Los coches de carreras de Fórmula 1 aceleran en una esquina',
    idioma: 'es',
    medio: 'Wyatt Simpson, Unsplash',
    licencia: { nombre: 'Licencia Unsplash', url: 'https://unsplash.com/license' },
    url: 'https://unsplash.com/es/fotos/los-coches-de-carreras-de-formula-1-aceleran-en-una-esquina-4GvTOGqNzu0',
  },
}

// La llamada a una nota: el número de la fuente, que lleva a ella al final.
// Una fuente citada dos veces repite su número.
function Nota({ fuente }) {
  const numero = Object.keys(FUENTES).indexOf(fuente) + 1
  return (
    <sup className="cita">
      <a href={`#nota-${numero}`} aria-label={`Nota ${numero}`}>
        {numero}
      </a>
    </sup>
  )
}

// Una foto, a lo ancho de la columna: debajo, quién la tomó y la nota que
// lleva a su archivo y su licencia. Cada una está en public/image a 800 px y a
// su ancho completo (`ancho`).
function Foto({ nombre, ancho, alto, alt, fuente, children }) {
  return (
    <figure>
      <img
        src={`/image/${nombre}-800.webp`}
        srcSet={`/image/${nombre}-800.webp 800w, /image/${nombre}-${ancho}.webp ${ancho}w`}
        sizes="(min-width: 824px) 776px, calc(100vw - 48px)"
        width={ancho}
        height={alto}
        alt={alt}
        loading="lazy"
        decoding="async"
      />
      <figcaption>
        {children}
        <Nota fuente={fuente} />
      </figcaption>
    </figure>
  )
}

export default function IaEnLaFormula1({ ruta }) {
  return (
    <Articulo ruta={ruta} portada="fw14b-1992">
      <h2>Una categoría que siempre negoció con la máquina</h2>
      <p>
        El Campeonato Mundial de Fórmula 1 arrancó en 1950, con un reglamento común para ordenar un automovilismo de
        posguerra donde cada carrera tenía sus propias reglas y los autos eran incomparables entre sí. Rápido se
        convirtió en la categoría reina, en parte por circuitos como Mónaco, cuyo Gran Premio se corre desde 1929.
      </p>
      <p>
        Mónaco es una de las tres carreras de la Triple Corona del automovilismo, junto a las 500 Millas de Indianápolis
        y las 24 Horas de Le Mans. Cada una mide algo distinto: velocidad pura en el óvalo, resistencia de piloto y
        máquina en Le Mans, y precisión milimétrica entre los muros del principado. En toda la historia, solo Graham
        Hill ganó las tres<Nota fuente="hill" />.
      </p>
      <Foto
        nombre="monaco-1929"
        ancho={1600}
        alto={1150}
        alt="Un Bugatti con el número 12 dobla en la curva de la estación de Monte Carlo, entre hoteles con público en los balcones, seguido por otros dos autos."
        fuente="monaco"
      >
        William Grover-Williams en la curva de la estación de Monte Carlo, en el primer Gran Premio de Mónaco, el 14 de
        abril de 1929. Foto: Agence Rol.
      </Foto>
      <p>
        Los computadores entraron primero como telemetría: sensores que le contaban al equipo lo que el piloto no
        alcanzaba a sentir. El gran salto llegó en 1992 con el Williams FW14B, diseñado por Patrick Head y Adrian
        Newey<Nota fuente="fw14b" />. Su suspensión activa, gobernada por software desarrollado por el propio equipo,
        mantenía la altura del auto y su plataforma aerodinámica estables curva tras curva. Nigel Mansell ganó 9 de 16
        carreras y se llevó su único título mundial.
      </p>
      <p>
        La respuesta de la categoría fue tajante. Para 1994 prohibió la suspensión activa, el control de tracción y el
        ABS<Nota fuente="eras" />. Hubo razones de costo, de velocidad y de política, pero una pesaba por sobre las
        demás: un auto que corrige solo le quita al piloto parte de lo que lo hace piloto.
      </p>


      <h2>El volante como centro de mando</h2>
      <p>
        Treinta y cuatro años después del FW14B, el piloto controla desde el volante el bloqueo del diferencial, el
        freno motor, el reparto de frenada, los mapas de energía y la radio con sus ingenieros. Es un puesto de mando,
        no solo una dirección.
      </p>      
  
      <p>
        En 2026 eso pesa más que nunca. La nueva unidad de potencia eliminó el MGU-H y casi triplicó la potencia del
        MGU-K, de 120 kW a 350 kW<Nota fuente="reglamento" />, hasta acercarse a un reparto 50/50 entre motor de
        combustión y parte eléctrica<Nota fuente="motores" />. Todo corre con combustible 100% sustentable, y el
        reglamento ahora limita la energía del combustible que entra al motor, no su masa<Nota fuente="combustible" />.
      </p>
      <p>
        Parte del trabajo ya lo hace la electrónica sola, como la gestión de la inyección y del flujo de combustible.
        Pero cuándo desplegar la energía eléctrica y cuándo recuperarla sigue siendo, en buena parte, una decisión del
        piloto. Ahí está hoy una de las grandes diferencias entre un buen piloto y uno excepcional.
      </p>

      <h2>Dónde trabaja la IA hoy</h2>
      <p>
        La IA no maneja el auto. Lo diseña, lo prepara y piensa la carrera por adelantado. Está en tres frentes.
      </p>
      <h3>Diseño aerodinámico (CFD)</h3>
      <p>
        La simulación de fluidos es la base del diseño de un F1, pero cada corrida de alta fidelidad cuesta miles de
        horas de cómputo, y el reglamento limita cuántas puede hacer cada equipo y cuánto túnel de viento puede
        usar<Nota fuente="ensayos" />. La salida han sido los modelos sustitutos: redes neuronales entrenadas con
        simulaciones anteriores<Nota fuente="cfd" /> que predicen el resultado de una geometría nueva en segundos.
        Neural Concept, una de las empresas que los vende, afirma que una corrida de una hora baja a unos 20
        segundos<Nota fuente="neural" />, y en 2024 ya trabajaba con cerca de 4 de los 10 equipos.
      </p>
      <h3>Estrategia</h3>
      <p>
        Antes de cada carrera, los equipos simulan decenas de miles de escenarios<Nota fuente="analitica" />: clima,
        temperatura de pista, tráfico en boxes, comportamiento de los rivales. Durante la carrera, los modelos
        recalculan en segundos cuando aparece un safety car o empieza a llover, y estiman cuándo abrir la ventana para
        un undercut.
      </p>
      <h3>La sesión en vivo</h3>
      <p>
        McLaren usa la plataforma de IA de Dell durante los fines de semana<Nota fuente="sesion" />. Las sesiones son
        25% más cortas que en 2020, y en práctica cada auto lleva entre 300 y 600 sensores. Con IA, el equipo estima la
        probabilidad de banderas rojas o amarillas, cruza el radar con datos satelitales para anticipar la lluvia y
        predice si el auto alcanzará a abrir vuelta antes de la bandera a cuadros. Según McLaren, varias veces los
        neumáticos ahorrados en la Q1 o la Q2 gracias a esas predicciones fueron los que le dieron la pole. Su primer
        científico de datos<Nota fuente="revolucion" /> lo resume así: «
        <span lang="en">Previously, we’ve collected data that we didn’t know what to do with.</span>»
      </p>
      <p>
        En los tres frentes la IA hace lo mismo: comprime tiempo. Lo que antes tomaba medio día de análisis ahora llega
        al muro de boxes en lo que dura una vuelta.
      </p>
      <Foto
        nombre="limites-de-pista"
        ancho={1200}
        alto={800}
        alt="Vista de una cámara de la pista: un McLaren y un auto azul van enmarcados en cajas de detección, con líneas que miden su distancia al borde, y la zona fuera de la pista está pintada de verde."
        fuente="limites"
      >
        El sistema de la FIA que vigila los límites de pista reconoce a cada auto y mide, en píxeles, cuánto le falta
        para cruzar la línea blanca. Foto: FIA.
      </Foto>

      <h2>Dónde está la línea</h2>
      <p>
        Nada de lo anterior es malo en sí. La F1 siempre fue una competencia entre ingenieros tanto como entre pilotos.
        Pero hay tres cosas que me preocupan, y ninguna tiene que ver con que la IA sea demasiado inteligente.
      </p>
      <p>
        La primera es un problema de base: el equilibrio energético. Con 350 kW eléctricos en juego, la batería se
        volvió el verdadero límite del auto. Cuando se agota, la potencia eléctrica cae y el auto pierde velocidad al
        final de las rectas aunque el piloto vaya a fondo. Hamilton llegó a describir 600 metros levantando el
        pie<Nota fuente="hamilton" /> en una vuelta de clasificación en Barcelona solo para recargar, y la FIA tuvo que
        corregir el reglamento a mitad de temporada<Nota fuente="correccion" />.
      </p>
      <p>
        Eso no es competencia, es contabilidad. Un F1 debería poder ir siempre al máximo. Mientras no pueda, gana quien
        mejor administra la escasez, y ese es justo el tipo de problema que una IA resuelve mejor que cualquier humano.
      </p>
      <p>
        La segunda es la infraestructura. El desarrollo depende de tres cosas que no se compran de un día para otro:
        instalaciones, ingenieros de primer nivel y, ahora, centros de datos. La IA no funciona en el vacío, rinde lo
        que rinde la infraestructura que la alimenta.
      </p>
      <p>
        Williams es el ejemplo más claro. Hasta 2024 armaba sus autos con una planilla de Excel de unas 20.000
        piezas<Nota fuente="excel" /> que su propio jefe, James Vowles, calificó de «una broma». Un equipo así no está
        en condiciones de exprimir modelos de IA y queda condenado a correr detrás. Cadillac, que debutó en
        2026<Nota fuente="cadillac" />, enfrenta el mismo riesgo desde cero: si la brecha de infraestructura se amplía,
        un equipo nuevo no tiene cómo cerrarla.
      </p>
      <p>
        La tercera es el dinero, que el límite presupuestario nunca logró sacar de la ecuación. Ferrari recibe un pago
        adicional solo por su historia en la categoría<Nota fuente="premios" />, y durante años fue el equipo con más
        ingresos. Cuando llegó el límite, tuvo que buscar dónde reubicar personal, y uno de los caminos fue volver a
        pelear Le Mans con un Hypercar en el WEC<Nota fuente="hypercar" />.
      </p>
      <p>
        En el otro extremo está Aston Martin, que levantó un campus de entre 150 y 200 millones de
        libras<Nota fuente="campus" /> con el túnel de viento más avanzado de la parrilla<Nota fuente="tunel" />, y aun
        así el AMR25 fue otro auto decepcionante<Nota fuente="amr25" />. El límite controla el gasto de cada año, pero
        no borra décadas de inversión acumulada. La F1 no debería premiar a quien gasta más, sino a quien desarrolla
        mejor.
      </p>
      <p>
        Por eso creo que hay que volver un poco a la naturalidad en la conducción. La FIA ya anunció que quiere volver a
        motores V8 con electrificación mínima en 2030, o en 2031 a más tardar<Nota fuente="v8" />. Un motor así no
        prohíbe la IA, pero le quita su terreno más fértil: la gestión de energía en tiempo real. Con autos más simples,
        la carrera vuelve a ser por encontrar mejoras minúsculas, donde el criterio de un ingeniero y el pie de un
        piloto pesan más.
      </p>
      <p>
        El contraargumento es fuerte: las mejoras minúsculas son justamente el juego donde la IA y los datos dominan, y
        un auto más simple no cierra la brecha por sí solo. Por eso el V8 tiene que venir acompañado de algo que la F1
        ya hace con el túnel de viento y el CFD, donde el que va último en el campeonato recibe más horas que el que va
        primero<Nota fuente="ensayos" />. El cómputo para entrenar modelos de IA debería entrar en esa misma cuenta.
      </p>

      <h2>Que el auto lo siga manejando alguien</h2>
      <p>
        La FIA no debería esperar a que un equipo encuentre el vacío reglamentario, como pasó con las ayudas
        electrónicas en los 90. Debería dejar escrito hoy que ninguna decisión de manejo en tiempo real puede venir de
        un sistema autónomo a bordo, y que la IA puede informar al piloto, pero no reemplazarlo. En el garaje, que gane
        el que piense mejor. En el cockpit, que gane el que maneje mejor.
      </p>
      <p>
        Mónaco sigue siendo la joya de la F1 por una razón: entre esos muros no hay simulación que te salve si fallas
        por diez centímetros. El día que eso deje de ser cierto, la F1 habrá ganado eficiencia y perdido lo único que la
        hacía distinta.
      </p>
      <Foto
        nombre="monaco-2025"
        ancho={1600}
        alto={1067}
        alt="Desde lo alto, un Ferrari y un McLaren doblan por una curva de Mónaco, entre rejas, carteles de Louis Vuitton y público bajo un quitasol."
        fuente="monaco2025"
      >
        Un Ferrari y un McLaren en el Gran Premio de Mónaco de 2025. Foto: Wyatt Simpson.
      </Foto>

      <h2>Notas</h2>
      <ol className="notas">
        {Object.values(FUENTES).map(({ titulo, idioma = 'en', medio, licencia, url }, i) => (
          <li key={url} id={`nota-${i + 1}`}>
            <a href={url} target="_blank" rel="noopener" lang={idioma}>
              {titulo}
            </a>
            , {medio}
            {licencia && (
              <>
                ,{' '}
                <a href={licencia.url} target="_blank" rel="noopener">
                  {licencia.nombre}
                </a>
              </>
            )}
          </li>
        ))}
      </ol>
    </Articulo>
  )
}
