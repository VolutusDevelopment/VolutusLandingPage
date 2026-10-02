/**
 * El mar del pie: su física, su cámara y su shader.
 *
 * Lo pinta el worker de las nubes (nubes-lienzo.js) con la trama de la nube y
 * en dos pasadas: `MAR` calcula una celda por texel y `TRAMA` dibuja los
 * puntos. Aquí no hay WebGL: está la física, en metros y segundos de verdad, y
 * el shader que sale de ella. Lo que el worker necesita para el cursor y el
 * pato —dónde cae un píxel en el agua, dónde está algo que flota— sale de las
 * mismas cuentas, así que el pato flota en el agua que se dibuja.
 *
 * La física:
 *
 *   - Veinte trenes de olas de gravedad (`OLAS`), sacados de un espectro de
 *     mar de viento: su amplitud, de JONSWAP; su rumbo, repartido alrededor
 *     del viento, que sopla de izquierda a derecha frente a quien mira. Como
 *     no van paralelos, sus crestas se cruzan y quedan cortas, como en el mar,
 *     y no en filas de lado a lado. La velocidad no se elige: la da la
 *     dispersión del agua honda, ω = √(g·k), así que las olas largas corren
 *     más que las cortas. La velocidad de grupo es la mitad de la de fase, y
 *     las olas de longitud vecina forman grupos —las series— que las crestas
 *     atraviesan creciendo y apagándose. Nada de eso se programa: sale de
 *     sumar.
 *   - Cada tren es una ola de Gerstner, la trocoide de verdad: el agua gira en
 *     círculos del alto de la ola, así que la cresta es aguda y el valle ancho.
 *     Para saber la altura en un punto del mundo hay que deshacer ese
 *     desplazamiento horizontal: por tren es la ecuación de Kepler,
 *     θ = θ' + e·sen θ, que dos vueltas resuelven.
 *   - La espuma sale de la misma geometría. Donde el desplazamiento horizontal
 *     se pliega (su jacobiano baja de un umbral) la ola rompe, y la espuma
 *     queda en las partículas de agua que rompieron (`ESPUMA`): gira y sube
 *     con ellas y deriva con ellas, mientras la ola sigue de largo y deja la
 *     estela atrás. Mientras rompe es blanca y sólida; al envejecer se abre en
 *     encaje, una red de burbujas alrededor de agua limpia, hasta que solo
 *     quedan las venas.
 *   - Lo que toca el agua —el cursor, el dedo, el pato— deja anillos con la
 *     solución exacta del agua honda para un impulso, la de Cauchy y Poisson:
 *     a una edad τ y a una distancia r llega la ola de número k = g·τ²/(4r²),
 *     con fase g·τ²/(4r). Las largas llegan primero. Sumados a lo largo de un
 *     recorrido, los anillos forman la estela de Kelvin, la V de 19,47° de
 *     todo lo que avanza por el agua. Solo mueven la luz, no la silueta.
 *   - Las cortas no son iguales en todas partes (`PICADO`): en la cresta de
 *     la silueta el agua se comprime y ellas se empinan; en el valle se
 *     estiran y se calman. Las crestas quedan ásperas y con espuma, y los
 *     valles lisos. Como la rugosidad también se pica, la marejada se sigue
 *     leyendo lejos, en bandas de brillo, aunque las cortas ya no se vean.
 *   - Cada tren se apaga cuando su período en la pantalla, medido en su
 *     rumbo, baja de unas 3 celdas (`detalle`): más fino, daría muaré. El
 *     escorzo depende del rumbo: lo que viene de frente se aplasta contra el
 *     horizonte, pero lo que cruza tiene las crestas apuntando hacia él y
 *     sigue ancho mucho más lejos. Así la textura se va afinando con la
 *     distancia, tren por tren, en vez de acabarse en una franja. Lo que se
 *     apaga no desaparece de la luz: su pendiente pasa a ser rugosidad, que
 *     ensancha el reflejo del sol. Cerca, el sol es un puñado de destellos;
 *     lejos, un camino de luz.
 *
 * Quien mira flota: va en un bote, con los ojos a `OJOS` del agua, y el bote
 * sube y baja con la marejada (`casco`, el agua bajo él en promedio). El
 * horizonte está en el infinito y no se mueve con eso; el agua cercana sube y
 * baja con el bote, y las crestas lejanas tapan a ratos las que vienen detrás.
 *
 * La luz, en `MAR`: Fresnel con el 2 % del agua, así que la cara que mira de
 * frente es honda y el agua vista de canto refleja el cielo; el sol adelante a
 * la derecha, como el de la portada; transluz en las crestas a contraluz; la
 * espuma, mate, más clara en la cara que da al sol y gris en la que no, y
 * bruma hacia el horizonte. Todo da un tono de 0 a 1: el color del punto va de
 * `sombra` a `luz` y a `borde`, y su área crece con el tono. Entre los puntos,
 * el agua lleva el relleno de `sombra` (ver `TRAMA`).
 */

import { NADA } from './pato.js'

// Gravedad, en m/s².
const G = 9.81

// El mar sale de un espectro, no de una tabla. Cuánta energía lleva cada
// frecuencia lo dice JONSWAP (Hasselmann et al., 1973), el del mar de viento
// que todavía crece: el de Pierson y Moskowitz con el pico afilado por
// `GAMMA`. `PICO` es la longitud de onda del pico y `ALFA`, la constante de
// Phillips: más alta que la de un mar hecho (0.0081), porque este todavía es
// joven y empinado. Juntas dan una altura significativa de 1.77 m, marejada. Se
// reparte en `CUANTAS` olas espaciadas en logaritmo, desde 0.75 del pico hasta
// la de `CORTA` m, cada una con la amplitud de su franja: a = √(2·S(ω)·Δω).
//
// El rumbo, alrededor del `VIENTO` (0 viene de frente; 90 cruza de izquierda
// a derecha), sigue la dispersión de Mitsuyasu, cos^(2s)(Δθ/2): s es alto en
// el pico —la marejada va casi con el viento— y bajo en las cortas, que van
// para cualquier lado. Cada ola toma su cuantil de la sucesión áurea, así que
// dos vecinas en frecuencia nunca salen paralelas y las crestas quedan cortas
// y cruzadas, como en el mar. La fase sale de la sucesión R2. Nada es al azar:
// el mar es el mismo en cada visita.
//
// En la cola, todas tienen el mismo empinamiento, k·a = √(2·α·Δω/ω) ≈ 0.055
// —la saturación de Phillips—, y entre todas suman 1.0. Como no van en fase
// ni en el mismo rumbo, el jacobiano no baja de 0.5: lejos del pliegue que
// daría lazos. Ordenadas de mayor a menor, las `EN_LA_MARCHA` primeras dan la
// silueta; el resto, la textura.
const PICO = 50
const ALFA = 0.0105
const GAMMA = 3.3
const CORTA = 0.3
const CUANTAS = 20
const VIENTO = 78
const DISPERSION = 10
const EN_LA_MARCHA = 4

const wPico = Math.sqrt((2 * Math.PI * G) / PICO)
const wDesde = 0.75 * wPico
const franja = Math.log(Math.sqrt((2 * Math.PI * G) / CORTA) / wDesde) / CUANTAS

function jonswap(w) {
  const sigma = w <= wPico ? 0.07 : 0.09
  const r = Math.exp(-((w - wPico) ** 2) / (2 * sigma ** 2 * wPico ** 2))
  return ALFA * G ** 2 * w ** -5 * Math.exp(-1.25 * (wPico / w) ** 4) * GAMMA ** r
}

// El desvío del viento, en radianes, en el cuantil `q` de cos^(2s)(Δθ/2): su
// distribución acumulada, sumada en 720 pasos y leída al revés.
function desvio(q, s) {
  const paso = (2 * Math.PI) / 720
  const acumulada = [0]
  for (let i = 0; i < 720; i++) acumulada.push(acumulada[i] + Math.cos((-Math.PI + (i + 0.5) * paso) / 2) ** (2 * s))
  const meta = q * acumulada[720]
  const i = acumulada.findIndex((valor) => valor >= meta)
  return -Math.PI + (i - 1 + (meta - acumulada[i - 1]) / (acumulada[i] - acumulada[i - 1])) * paso
}

const AUREA = (Math.sqrt(5) - 1) / 2
const R2 = 0.7548776662466927

export const OLAS = Array.from({ length: CUANTAS }, (_, i) => {
  const w = wDesde * Math.exp(franja * (i + 0.5))
  const k = (w * w) / G
  const alto = Math.sqrt(2 * jonswap(w) * w * franja)
  const s = DISPERSION * (w < wPico ? (w / wPico) ** 5 : (wPico / w) ** 2.5)
  const angulo = (VIENTO * Math.PI) / 180 + desvio(((i + 0.5) * AUREA) % 1, s)
  const fase = 2 * Math.PI * ((i * R2) % 1)
  return { largo: (2 * Math.PI) / k, alto, fase, k, w, e: k * alto, dx: Math.sin(angulo), dz: -Math.cos(angulo) }
}).sort((a, b) => b.alto - a.alto)

const SILUETA = OLAS.slice(0, EN_LA_MARCHA)

// La cámara: los ojos a `OJOS` m del agua bajo el bote —de pie en él—, y nada
// más cerca que la proa, a `PROA` m. `CRESTA` es la ola más alta posible:
// todos los trenes de la silueta a la vez. En 20 minutos de este mar, la
// cresta que más asomó sobre el horizonte subió 0.009 en tangente —unos 8 px
// en una pantalla de 1440—, y cabe holgada en el aire que deja `camara`. Si
// cambian las olas o los ojos, hay que volver a medirlo.
export const OJOS = 1.5
const PROA = 0.5
export const CRESTA = SILUETA.reduce((suma, ola) => suma + ola.alto, 0)
const LEJOS = 3000

// Lo que toca el agua: hasta `FUENTES` impulsos a la vez, cada uno con su
// lugar, su instante y su fuerza. Viven `VIDA` segundos y miden `RADIO` m.
export const FUENTES = 24
export const VIDA = 2.25
const RADIO = 0.15

// El sol: adelante, 17° a la derecha y 18° sobre el horizonte.
const SOL = [0.3, 0.34, 1].map((v, _, sol) => v / Math.hypot(...sol))

/**
 * La cámara de un lienzo de `ancho` × `alto` px. Estenopeica, con una focal de
 * 1.8 altos, salvo en pantallas anchas, donde crece para que el campo no pase
 * de unos 77°: más abierto, los costados se estiran. `ojos` es la altura de
 * los ojos sobre el agua en calma, que el worker pone en cada fotograma
 * (`casco`).
 *
 * El horizonte es lo que hace que el mar no tenga borde: va al 15 % del alto,
 * con un poco de aire arriba para que la bruma no quede pegada al canto.
 */
export function camara(ancho, alto) {
  const focal = Math.max(1.8 * alto, ancho / 1.6)
  return { ancho, alto, focal, horizonte: 0.15 * alto, ojos: OJOS }
}

// Cuánto sube o baja el bote: la altura media del agua bajo su casco, de unos
// 5 × 2 m. Así sigue la marejada y no el picado.
const CASCO = [
  [0, 0],
  [0, 2.5],
  [0, -2.5],
  [1, 0],
  [-1, 0],
]

export function casco(t) {
  return CASCO.reduce((suma, [x, z]) => suma + relieve(x, z, t, Infinity), 0) / CASCO.length
}

// Del lienzo al agua en calma: dónde toca el mar el rayo del píxel (x, y), en
// metros. `null` sobre el horizonte.
export function alAgua({ ancho, focal, horizonte, ojos }, x, y) {
  if (y <= horizonte) return null
  const z = (focal * ojos) / (y - horizonte)
  return { x: ((x - ancho / 2) * z) / focal, z }
}

// Del agua al lienzo: dónde se ve el punto (x, y, z), en px.
export function alLienzo({ ancho, focal, horizonte, ojos }, { x, y, z }) {
  return [ancho / 2 + (focal * x) / z, horizonte + (focal * (ojos - y)) / z]
}

/**
 * Dónde está algo que flota y en reposo estaría en (x0, z0), en el instante
 * `t`. Gira con el agua (el desplazamiento de Gerstner de la silueta) y su
 * altura es la de la superficie que se dibuja. `escala` es la del detalle
 * (ver `detalle`).
 */
export function flotar(x0, z0, t, escala) {
  let x = x0
  let z = z0
  for (const ola of SILUETA) {
    const giro = ola.alto * Math.sin(ola.k * (ola.dx * x0 + ola.dz * z0) - ola.w * t + ola.fase)
    x -= ola.dx * giro
    z -= ola.dz * giro
  }
  return { x, z, y: relieve(x, z, t, escala) }
}

// La altura de la silueta en (x, z): la cuenta de `relieve` en el shader. Si
// cambia allá, cambia aquí.
function relieve(x, z, t, escala) {
  let h = 0
  for (const ola of SILUETA) {
    const d = detalle(ola, x, z, escala)
    const fase = ola.k * (ola.dx * x + ola.dz * z) - ola.w * t + ola.fase
    let th = fase + ola.e * d * Math.sin(fase)
    th = fase + ola.e * d * Math.sin(th)
    h += ola.alto * d * Math.cos(th)
  }
  return h
}

// Cuánto se ve un tren en (x, z): su período en celdas de la pantalla, medido
// en su rumbo. `escala` es focal × OJOS / celda. Por debajo de 2 celdas no se
// ve, y desde 4 se ve entero. La de `detalle` en el shader.
function detalle(ola, x, z, escala) {
  const celdas = (ola.largo * escala) / Math.abs(z * Math.hypot(ola.dx * OJOS, ola.dx * x + ola.dz * z))
  const s = Math.min(Math.max(celdas / 2 - 1, 0), 1)
  return s * s * (3 - 2 * s)
}

// Un número como literal de GLSL, que siempre lleva punto.
function num(numero) {
  const texto = String(Number(numero.toPrecision(7)))
  return /[.e]/.test(texto) ? texto : `${texto}.0`
}

const rumbo = (ola) => `vec2(${num(ola.dx)}, ${num(ola.dz)})`

// Un tren en el punto `p` y en el instante `cuando`: deja en `d` su detalle y
// en `th` su fase con el desplazamiento horizontal deshecho. `cuenta` es lo
// que se hace con él.
const tren = (ola, cuenta) => `
  d = detalle(${num(ola.largo)}, ${rumbo(ola)}, p);
  fase = dot(p, ${rumbo(ola)}) * ${num(ola.k)} - ${num(ola.w)} * cuando + ${num(ola.fase)};
  th = fase + ${num(ola.e)} * d * sin(fase);
  th = fase + ${num(ola.e)} * d * sin(th);
  ${cuenta}`

const sumar = (olas, cuenta) => olas.map((ola) => tren(ola, cuenta(ola))).join('')

// La altura de la silueta, para la marcha del rayo.
const RELIEVE = `
float relieve(vec2 p, float cuando) {
  float h = 0.0, d, fase, th;
  ${sumar(SILUETA, (ola) => `h += ${num(ola.alto)} * d * cos(th);`)}
  return h;
}`

// El picado: en la cresta de la silueta el agua se comprime, y las olas
// cortas se aprietan y se empinan; en el valle se estiran y se calman
// (Longuet-Higgins y Stewart, 1960). La compresión es 1 − jacobiano de la
// silueta, y cada décima de compresión suma `PICADO` décimas a la fuerza de
// las cortas, entre 0.5 y 2.2: el valle se calma, pero no queda de vidrio.
// Con 3, el 1 % de la superficie más apretada llega a 1.4 y un 10 % empieza
// a hacer espuma (el umbral de 0.82 en `ESPUMA`).
const PICADO = 3
const PICAR = `float picado = clamp(1.0 + ${num(PICADO)} * (1.0 - jacobiano(m)), 0.5, 2.2);`
const TEXTURA = OLAS.slice(EN_LA_MARCHA)

// Lo que comprime un tren, con su fuerza: '' o 'picado * '.
const comprimir = (fuerza) => (ola) =>
  `m += ${fuerza}${num(ola.e)} * d * cos(th) * vec3(${num(ola.dx ** 2)}, ${num(ola.dz ** 2)}, ${num(ola.dx * ola.dz)});`

// Un tren en la partícula que en reposo está en `o`: Gerstner ya está escrita
// por partícula, así que su fase sale directa, sin deshacer nada. Su detalle
// viene hecho en `detalles`: la partícula no se aleja de donde se ve.
const enParticula = (olas, cuenta) =>
  olas
    .map(
      (ola) => `
  d = detalles[${OLAS.indexOf(ola)}];
  th = dot(o, ${rumbo(ola)}) * ${num(ola.k)} - ${num(ola.w)} * cuando + ${num(ola.fase)};
  ${cuenta(ola)}`,
    )
    .join('')

// El jacobiano del desplazamiento horizontal de la partícula `o`: 1 en el agua
// en calma, menos donde la superficie se comprime, y 0 donde se pliega. Las
// cortas entran picadas, así que la espuma nace en las crestas.
const PLIEGUE = `
float jacobiano(vec3 m) {
  return (1.0 - m.x) * (1.0 - m.y) - m.z * m.z;
}
float pliegue(vec2 o, float cuando, float detalles[${OLAS.length}]) {
  vec3 m = vec3(0.0);
  float d, th;
  ${enParticula(SILUETA, comprimir(''))}
  ${PICAR}
  ${enParticula(TEXTURA, comprimir('picado * '))}
  return jacobiano(m);
}`

// Lo que suma un tren a la superficie, con su fuerza: '' o 'picado * '.
const sumarA = (fuerza) => (ola) => `s = sin(th);
  c = cos(th);
  e = ${fuerza}${num(ola.e)} * d;
  h += ${num(ola.alto)} * d * c;
  pendiente -= e * s / (1.0 - e * c) * ${rumbo(ola)};
  origen += ${num(ola.alto)} * d * s * ${rumbo(ola)};
  rugosidad += (1.0 - d * d) * ${fuerza}${fuerza}${num(ola.e ** 2 / 2)};`

// La pendiente de los anillos de lo que tocó el agua.
const ONDAS = `
vec2 ondas(vec2 p, float r) {
  vec2 pendiente = vec2(0.0);
  for (int i = 0; i < ${FUENTES}; i++) {
    vec4 fuente = fuentes[i];
    float edad = t - fuente.z;
    if (fuente.w <= 0.0 || edad <= 0.0 || edad >= ${num(VIDA)}) continue;
    vec2 d = p - fuente.xy;
    float r2 = dot(d, d) + ${num(RADIO ** 2)};
    float lejos = sqrt(r2);
    float k = ${num(G / 4)} * edad * edad / r2;
    float alto = fuente.w * edad * edad / (r2 * lejos) * exp(${num(-(RADIO ** 2) / 4)} * k * k) * (1.0 - edad / ${num(VIDA)});
    pendiente -= alto * k * cos(k * lejos) * detalle(${num(2 * Math.PI)} / k, r) * d / lejos;
  }
  return pendiente;
}`

// La espuma flota: no es una mancha del mundo sino de la partícula de agua
// que rompió, y viaja con ella. Gira con la ola (su reposo es `origen`) y
// avanza con la deriva de Stokes, que en agua honda es a²·ω·k por tren, en su
// rumbo: unos 0.2 m/s. La partícula que ahora reposa en `origen` reposaba en
// `etiqueta + DERIVA·τ` en el instante τ, y es ahí donde se mira si rompió.
//
//   - Cuánta hay: crece mientras la partícula rompe —en `CRECE` s de rotura
//     llega a blanco pleno— y se apaga con una vida media de `DURA` s. Es la
//     suma de las roturas de los últimos `MEMORIA` × `PASO` segundos, cada una
//     apagada por su edad. Esos instantes van fijos en el reloj y no corridos
//     desde `t`: si se corrieran, cada fotograma atraparía roturas distintas y
//     la estela parpadearía.
//   - Cómo se ve: encaje, dos redes de Voronoi de 0.9 y 0.3 m pegadas a la
//     partícula. `red` es la distancia al borde de la celda (F2 − F1), y la
//     espuma cubre lo que está a menos de lo que queda de ella: donde rompe
//     ahora (`nucleo`) casi todo, con ojos de agua y el borde deshilachado;
//     fresca, venas gruesas; vieja, solo las venas finas. Cada vena se difumina en una celda de la pantalla
//     y, si es más fina que eso, se aclara en vez de salir a saltos. Lejos,
//     donde la red no cabe, queda su promedio: las aristas de un Voronoi suman
//     unas 2 veces su ancho en área.
//
// El azar de cada celda sale del `ruido`, leído justo en sus texels.
const PASO = 0.5
const MEMORIA = 14
const DURA = 3.5
const CRECE = 0.5
const DERIVA = OLAS.reduce(
  ([x, z], ola) => [x + ola.alto ** 2 * ola.w * ola.k * ola.dx, z + ola.alto ** 2 * ola.w * ola.k * ola.dz],
  [0, 0],
)

const ESPUMA = `
const vec2 DERIVA = vec2(${DERIVA.map(num).join(', ')});
float red(vec2 q) {
  vec2 i = floor(q), f = fract(q), d;
  float f1 = 9.0, f2 = 9.0, d2;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      d = vec2(float(x), float(y));
      d += texture2D(ruido, (i + d + 0.5) / 256.0).rg - f;
      d2 = dot(d, d);
      f2 = min(f2, max(f1, d2));
      f1 = min(f1, d2);
    }
  }
  return sqrt(f2) - sqrt(f1);
}
float encaje(vec2 q, float lado, float ancho, float r) {
  float pantalla = r * r / (lado * escala);
  float vena = (1.0 - smoothstep(ancho - pantalla, ancho + pantalla, red(q / lado))) * min(1.0, ancho / pantalla);
  return mix(min(1.0, 2.0 * ancho), vena, detalle(lado, r));
}
float rompe(vec2 etiqueta, float cuando, float detalles[${OLAS.length}]) {
  return 1.0 - smoothstep(0.6, 0.82, pliegue(etiqueta + DERIVA * cuando, cuando, detalles));
}
float espuma(vec2 p, vec2 origen, float r) {
  vec2 etiqueta = origen - DERIVA * t;
  float detalles[${OLAS.length}];
  ${OLAS.map((ola, i) => `detalles[${i}] = detalle(${num(ola.largo)}, ${rumbo(ola)}, p);`).join('\n  ')}
  float ultimo = floor(t / ${num(PASO)}) * ${num(PASO)}, cuando;
  float nucleo = rompe(etiqueta, t, detalles);
  float queda = nucleo * (t - ultimo) / ${num(CRECE)};
  for (int i = 0; i < ${MEMORIA}; i++) {
    cuando = ultimo - ${num(PASO)} * float(i);
    queda += rompe(etiqueta, cuando, detalles) * exp((cuando - t) / ${num(DURA)}) * ${num(PASO / CRECE)};
  }
  queda = min(queda, 1.0);
  if (queda + nucleo < 0.02) return 0.0;
  float gruesa = encaje(etiqueta, 0.9, 0.35 * queda + 0.65 * nucleo, r);
  float fina = encaje(etiqueta, 0.3, 0.15 * queda, r);
  return max(gruesa, fina);
}`

// La superficie entera en `p`: su altura, su pendiente, el punto de reposo del
// agua que está ahí y la rugosidad de lo que no alcanza a verse. Primero la
// silueta, que da el picado; después las cortas, picadas.
const SUPERFICIE = `
float superficie(vec2 p, float cuando, out vec2 pendiente, out vec2 origen, out float rugosidad) {
  float h = 0.0, d, fase, th, s, c, e;
  vec3 m = vec3(0.0);
  pendiente = vec2(0.0);
  origen = p;
  rugosidad = 2e-4;
  ${sumar(SILUETA, (ola) => `${sumarA('')(ola)}\n  ${comprimir('')(ola)}`)}
  ${PICAR}
  ${sumar(TEXTURA, sumarA('picado * '))}
  return h;
}`

/**
 * El shader del campo: una celda por fragmento. `camara` lleva la focal y el
 * horizonte en px y la altura de los ojos en m; `escala`, la del detalle;
 * `nado`, la
 * celda de la esquina del pato, hacia dónde mira (0 si no hay pato) y su
 * distancia; `fuentes`, lo que tocó el agua.
 *
 *   - La marcha: el rayo de la celda baja `baja` metros por metro de avance.
 *     Solo puede tocar agua entre la proa y donde pasa por debajo del valle
 *     más hondo o, sobre el horizonte, hasta donde supera la cresta más
 *     alta. Ese tramo se recorre en 32 pasos geométricos, como la
 *     perspectiva, y el cruce se afina interpolando. Sin cruce sobre el
 *     horizonte, la celda es cielo; bajo él, más allá de `LEJOS`, el agua
 *     lejana, que ya es plana.
 *   - El pato tapa el agua que está detrás de él, y el agua que está más cerca
 *     lo tapa a él: así se dibuja sola su línea de flotación, y la ola que
 *     pasa delante lo esconde.
 *   - La salida, para `TRAMA`: el color del punto y, en el alfa, su área. Si
 *     la celda es agua, el alfa va de 0.5 a 1; si no —el pato contra el
 *     cielo—, de 0 a 0.498. El cielo vacío es 0.
 */
export const MAR = `precision highp float;
uniform vec2 res;
uniform vec3 camara, luz, sombra, borde;
uniform float t, celda, escala;
uniform vec4 nado, fuentes[${FUENTES}];
uniform sampler2D ruido, pato;
const float PROA = ${num(PROA)};
const float CRESTA = ${num(CRESTA)};
const float LEJOS = ${num(LEJOS)};
const float OJOS = ${num(OJOS)};
const vec3 SOL = vec3(${SOL.map(num).join(', ')});
const vec2 PATO = vec2(${num(NADA[0].length)}, ${num(NADA.length)});
float detalle(float largo, float r) {
  return smoothstep(2.0, 4.0, largo * escala / (r * r));
}
float detalle(float largo, vec2 rumbo, vec2 p) {
  return smoothstep(2.0, 4.0, largo * escala / abs(p.y * length(vec2(rumbo.x * OJOS, dot(p, rumbo)))));
}
${RELIEVE}
${PLIEGUE}
${ONDAS}
${SUPERFICIE}
${ESPUMA}
void main() {
  vec2 celdaXY = floor(gl_FragCoord.xy);
  vec2 uv = (celdaXY + 0.5) * celda - vec2(0.5 * res.x, camara.y);
  float l = length(vec2(uv.x, camara.x));
  vec2 rumbo = vec2(uv.x, camara.x) / l;
  float baja = uv.y / l;
  vec3 rayo = vec3(rumbo.x, -baja, rumbo.y) / sqrt(1.0 + baja * baja);

  float ojos = camara.z, desde = PROA * l / camara.x, hasta = 0.0;
  if (baja > 0.0) {
    desde = max(desde, (ojos - CRESTA) / baja);
    hasta = min(LEJOS, (ojos + CRESTA) / baja);
  } else if (ojos < CRESTA) {
    hasta = min(LEJOS, (CRESTA - ojos) / max(-baja, 1e-6));
  }
  bool toca = false;
  float r = desde;
  if (desde < hasta) {
    float antes = ojos - baja * r - relieve(rumbo * r, t);
    toca = antes <= 0.0;
    float paso = pow(hasta / desde, 1.0 / 32.0);
    for (int i = 0; i < 32; i++) {
      if (toca) break;
      float sigue = r * paso;
      float ahora = ojos - baja * sigue - relieve(rumbo * sigue, t);
      if (ahora <= 0.0) {
        r += (sigue - r) * antes / (antes - ahora);
        toca = true;
      } else {
        r = sigue;
        antes = ahora;
      }
    }
    toca = toca || baja > 0.0;
  }

  vec3 color = vec3(0.0);
  float area = 0.0;
  if (toca) {
    vec2 p = rumbo * r, pendiente, origen;
    float rugosidad;
    float h = superficie(p, t, pendiente, origen, rugosidad);
    pendiente += ondas(p, r);
    vec3 normal = normalize(vec3(-pendiente.x, 1.0, -pendiente.y));
    float fresnel = 0.02 + 0.98 * pow(1.0 - max(dot(normal, -rayo), 0.0), 5.0);
    float cielo = mix(0.75, 0.42, smoothstep(0.0, 0.35, reflect(rayo, normal).y));
    vec3 medio = normalize(SOL - rayo);
    float c2 = max(dot(normal, medio), 0.05);
    c2 *= c2;
    float sol = (0.02 + 0.98 * pow(1.0 - max(dot(medio, -rayo), 0.0), 5.0))
      * exp((c2 - 1.0) / (c2 * 2.0 * rugosidad)) / (2.0 * rugosidad * c2 * c2);
    float transluz = smoothstep(0.1, 0.7, h) * max(dot(rayo, SOL), 0.0);
    float tono = mix(0.1 + 0.4 * transluz, cielo, fresnel);
    float blanco = 0.72 + 0.28 * smoothstep(0.0, 0.45, dot(normal, SOL));
    tono = mix(tono, blanco, espuma(p, origen, r));
    tono = mix(tono, 1.0, clamp(0.02 * sol, 0.0, 1.0));
    tono = mix(tono, 0.68, 1.0 - exp(-r / 900.0));
    area = smoothstep(0.07, 0.6, tono);
    color = tono < 0.6 ? mix(sombra, luz, tono / 0.6) : mix(luz, borde, (tono - 0.6) / 0.4);
  }

  if (nado.z != 0.0) {
    vec2 d = celdaXY - nado.xy;
    if (d.x >= 0.0 && d.y >= 0.0 && d.x < PATO.x && d.y < PATO.y) {
      if (nado.z < 0.0) d.x = PATO.x - 1.0 - d.x;
      vec4 punto = texture2D(pato, (d + 0.5) / PATO);
      if (punto.a > 0.5 && !(toca && r < nado.w)) {
        color = punto.rgb;
        area = 1.0;
      }
    }
  }
  gl_FragColor = vec4(color, toca ? 0.5 + 0.5 * area : 0.498 * area);
}`
