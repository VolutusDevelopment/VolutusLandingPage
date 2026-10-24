/**
 * El atardecer de /nosotros: su física, su cámara y sus shaders.
 *
 * En la costa de Chile el sol se pone en el mar. Aquí se pone detrás de la
 * cabecera y de los socios (Nosotros.jsx): el mar queda fijo y las tarjetas
 * pasan por delante, y mientras pasan el sol baja hasta hundirse. Lo pinta el
 * worker de las nubes (nubes-lienzo.js) en dos pasadas, como el cielo y el
 * mar del pie: `CAMPO` calcula una celda de la trama por texel —si es cielo o
 * agua, lo oscuro del agua y el brillo del sol en ella— y `TRAMA` dibuja los
 * puntos a resolución completa y, entre ellos, el cielo.
 *
 * Al abrir la página es de día: el sol está alto, el cielo es celeste y su
 * reflejo es un puñado de destellos dorados cerca de quien mira. Mientras
 * pasan los socios baja parejo, y con él el reflejo, que sube hacia el
 * horizonte y se angosta en estela; el cielo se enciende en la puesta. El sol
 * toca el mar recién con el último socio, y se hunde antes del fundido (ver
 * `sol`).
 *
 * La física, en metros y segundos:
 *
 *   - Doce trenes de olas de gravedad (`OLAS`), del largo al corto, con la
 *     misma pendiente cada uno, como la cola de un mar de viento, y rumbos
 *     repartidos alrededor del viento, que sopla hacia el horizonte: las
 *     crestas se cruzan y quedan cortas. La velocidad sale de la dispersión
 *     del agua honda, ω = √(g·k). Es un mar más simple que el del pie
 *     (lib/mar.js): aquí no rompe ni nada en él; solo refleja.
 *   - Cada punto mira un trozo de agua más grande cuanto más lejos está. Lo
 *     que el punto no alcanza a dibujar no se borra: su pendiente pasa a ser
 *     aspereza, que ensancha el brillo. Por eso el sol es un puñado de
 *     destellos cerca y una estela pareja al fondo.
 *   - La luz: Fresnel con el 2 % del agua, así que la cara que mira al ojo
 *     deja ver su azul hondo y la que se ve de canto refleja el cielo, más
 *     claro cuanto más bajo. La estela es el agua cuya normal manda el sol al
 *     ojo; inclinar una cara de lado apenas corre el reflejo en rasante, así
 *     que la estela es angosta al fondo y se abre hacia quien mira. Se apaga
 *     con el sol al hundirse.
 *   - El cielo va del oro del horizonte al coral, al lila y al azul de
 *     arriba, más encendido hacia el sol. Cerca del horizonte el aire achata
 *     el disco (la refracción, un 20 %) y lo enrojece.
 *   - El cursor, o el dedo, sopla ráfagas (`RAFAGAS`): en el agua donde pasa
 *     se levantan olas cortas que la oscurecen y abren la estela, y se van
 *     con el viento hasta apagarse.
 *
 * Quien mira está de pie en la orilla, con los ojos a `OJOS` del agua y el
 * horizonte al 62 % del alto, donde la cabecera deja su texto arriba, en el
 * cielo (ver `camara`).
 *
 * La paleta es una sola y va en el shader: no cambia por zona ni por página.
 * Cuando la escena se funde al final de su sección, va al blanco de la
 * página (`PAPEL`, el fondo de la zona cielo).
 */

// Gravedad, en m/s².
const G = 9.81

// La altura de los ojos sobre el agua, en m.
const OJOS = 2

// Dónde va el horizonte, en altos del lienzo desde arriba.
const HORIZONTE = 0.62

// El sol, 11° a la derecha de quien mira, y su altura, en radianes: de día
// (`DIA`), cuando su borde de abajo toca el mar (`TOCA`: cerca del horizonte
// el aire achata el disco, así que el borde queda bajo un radio) y ya puesto
// (`PUESTO`). El disco mide `RADIO` rad: más que el de verdad (0.0047), para
// que se lea en la trama.
const RUMBO_DEL_SOL = 0.2
const RADIO = 0.026
const DIA = 0.18
const TOCA = RADIO
const PUESTO = -RADIO

// Cuántas ráfagas del cursor recuerda el agua a la vez, y en cuántos
// segundos se apaga cada una.
export const RAFAGAS = 8
const CALMA = 1.6

// La sucesión de Park y Miller, con semilla fija: el mar es el mismo en cada
// visita.
function sucesion(semilla) {
  return () => (semilla = (semilla * 16807) % 2147483647) / 2147483647
}

const azar = sucesion(7)
const TRENES = Array.from({ length: 12 }, (_, i) => {
  const k = (2 * Math.PI) / (16 * 0.72 ** i)
  const rumbo = (azar() - 0.5) * 2.4
  return { k, rumbo, fase: azar() * 2 * Math.PI }
})

// Cada tren como lo lee el shader: dirección por número de onda (kx, kz), su
// pendiente y ω; y su fase aparte.
export const OLAS = new Float32Array(TRENES.flatMap(({ k, rumbo }) => [k * Math.sin(rumbo), k * Math.cos(rumbo), 0.034, Math.sqrt(G * k)]))
export const FASES = new Float32Array(TRENES.map(({ fase }) => fase))

/**
 * La cámara de un lienzo de `ancho` × `alto` px del aparato, con `densidad`
 * px del aparato por px CSS: la focal, en esos px, y cuánto mira hacia arriba
 * (`mira`, rad) para que el horizonte caiga en `HORIZONTE`.
 */
export function camara(ancho, alto, densidad) {
  const focal = 0.9 * Math.max(ancho, alto)
  return { ancho, alto, densidad, focal, mira: Math.atan(((HORIZONTE - 0.5) * alto) / focal) }
}

/**
 * La dirección del sol en `t`: de 0 a 1 mientras pasan los socios, del día
 * hasta tocar el mar, y de 1 a 2 hasta el fundido, en que se hunde.
 */
export function sol(t) {
  const elevacion = t < 1 ? DIA + (TOCA - DIA) * Math.max(0, t) : TOCA + (PUESTO - TOCA) * Math.min(1, t - 1)
  const c = Math.cos(elevacion)
  return [Math.sin(RUMBO_DEL_SOL) * c, Math.sin(elevacion), Math.cos(RUMBO_DEL_SOL) * c]
}

/**
 * El punto del agua, en m, bajo el px `x`, `y` del lienzo, y a qué distancia
 * del ojo está. Sobre el horizonte no hay agua.
 */
function agua({ ancho, alto, focal, mira }, x, y) {
  const u = (alto / 2 - y) / focal
  const d = [(x - ancho / 2) / focal, Math.cos(mira) * u + Math.sin(mira), Math.cos(mira) - Math.sin(mira) * u]
  if (d[1] >= -0.001) return null
  const s = OJOS / -d[1]
  return { x: d[0] * s, z: d[2] * s, distancia: s }
}

/**
 * Una ráfaga del cursor que pasó por `desde` y llegó a `hasta` (px del
 * lienzo, con su `t` en ms): dónde sopla en el agua, de qué tamaño y hacia
 * dónde se la lleva el viento. Se mide en px CSS, así que soplar es igual en
 * cualquier pantalla: sopla desde 40 px/s, con toda su fuerza a 900, y abarca
 * unos 60 px alrededor del cursor.
 */
export function rafaga(vista, desde, hasta) {
  const dt = (hasta.t - desde.t) / 1000
  if (dt <= 0) return null
  const vx = (hasta.x - desde.x) / dt
  const rapidez = Math.hypot(vx, (hasta.y - desde.y) / dt) / vista.densidad
  const punto = rapidez > 40 && agua(vista, hasta.x, hasta.y)
  if (!punto) return null
  const { x, z, distancia } = punto
  return {
    x,
    z,
    radio: Math.max(1.2, (distancia * 60 * vista.densidad) / vista.focal),
    vx: ((vx * distancia) / vista.focal) * 0.35,
    vz: 0.6,
    fuerza: Math.min(1, rapidez / 900),
    t: hasta.t,
  }
}

/** Las ráfagas como las lee el shader en `ahora` (ms): centro, radio y fuerza. */
export function soplos(rafagas, ahora) {
  const datos = new Float32Array(4 * RAFAGAS)
  rafagas.forEach((r, i) => {
    const edad = (ahora - r.t) / 1000
    datos.set([r.x + r.vx * edad, r.z + r.vz * edad, r.radio, r.fuerza * Math.exp(-edad / CALMA)], 4 * i)
  })
  return datos
}

const num = (n) => (Number.isInteger(n) ? `${n}.0` : `${n}`)
const color = (hex) => `vec3(${[1, 3, 5].map((i) => num(+(parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(4))).join(', ')})`

// Lo que comparten las dos pasadas: el rayo de cada px del lienzo.
const RAYO = `precision highp float;
uniform vec2 res, rejilla;
uniform float celda, focal, mira;
uniform vec3 sol;
const float OJOS = ${num(OJOS)};
vec3 rayo(vec2 px) {
  float u = (0.5 * res.y - px.y) / focal;
  return normalize(vec3((px.x - 0.5 * res.x) / focal, cos(mira) * u + sin(mira), cos(mira) - sin(mira) * u));
}
`

/**
 * El campo: una celda por fragmento. Sobre el horizonte, cielo (`b` = 1); bajo
 * él, en `r` lo oscuro del agua y en `g` el brillo del sol, de 0 a 1.
 *
 *   - `pendiente`: la de los doce trenes en un punto del agua, cada uno
 *     apagado según lo que mide la celda a esa distancia (`huella`), y lo
 *     apagado como aspereza. Las tres más cortas crecen con la ráfaga.
 *   - El tono: el cielo que refleja va de 0.96 en rasante a 0.46 al mirar
 *     alto, y el agua honda deja 0.14; Fresnel los mezcla.
 *   - El brillo: qué tanto apunta el reflejo al sol, con un ancho que suman
 *     el disco, la aspereza y la ráfaga, y que conserva la energía (`0.01 /
 *     ancho`): ancha y tenue lejos, fina e intensa cerca.
 */
export const CAMPO = `${RAYO}
uniform float t;
uniform vec4 olas[12], rafagas[${RAFAGAS}];
uniform float fases[12];

float rizo(vec2 p) {
  float r = 0.0;
  for (int i = 0; i < ${RAFAGAS}; i++) {
    vec4 g = rafagas[i];
    if (g.w <= 0.0) continue;
    vec2 e = (p - g.xy) / vec2(g.z, g.z * 1.6);
    r += g.w * exp(-dot(e, e));
  }
  return min(r, 1.4);
}

vec3 pendiente(vec2 p, float huella, float rizo) {
  vec2 g = vec2(0.0);
  float aspero = 0.0;
  for (int i = 0; i < 12; i++) {
    vec4 o = olas[i];
    float k = length(o.xy);
    float lod = exp(-huella * huella * k * k * 0.25);
    float s = o.z * (i > 8 ? 1.0 + rizo * 2.5 : 1.0);
    aspero += s * s * (1.0 - lod * lod) * 0.5;
    g += s * lod * cos(dot(o.xy, p) - o.w * t + fases[i]) * o.xy / k;
  }
  return vec3(g, aspero);
}

void main() {
  vec2 xy = floor(gl_FragCoord.xy);
  vec3 d = rayo((xy + 0.5) * celda);
  if (d.y >= 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 1.0, 0.0);
    return;
  }
  float distancia = OJOS / -d.y;
  vec2 p = d.xz * distancia;
  float r = rizo(p);
  vec3 s = pendiente(p, distancia * celda / focal, r);
  vec3 n = normalize(vec3(-s.x, 1.0, -s.y));
  float coseno = clamp(dot(-d, n), 0.002, 1.0);
  float espejo = 0.02 + 0.98 * pow(1.0 - coseno, 5.0);
  vec3 reflejo = reflect(d, n);
  float alto = max(reflejo.y, 0.0) / max(length(reflejo.xz), 0.001);
  float cielo = 0.96 - 0.5 * min(1.0, alto / 0.5);
  float oscuro = clamp(1.0 - espejo * cielo - (1.0 - espejo) * 0.14 + 0.1 * r, 0.0, 1.0);
  float ancho = 0.0005 + 4.0 * s.z * (1.0 + 6.0 * coseno) + 0.002 * r;
  float brillo = exp(-2.0 * (1.0 - dot(normalize(reflejo), sol)) / ancho) * min(1.0, 0.01 / ancho) * 1.6;
  brillo = min(1.0, brillo) * smoothstep(-${num(RADIO)}, 0.02, sol.y);
  gl_FragColor = vec4(oscuro, brillo, 0.0, 0.0);
}`

/**
 * La trama: en cada celda de agua, un punto. Su área es lo oscuro del agua,
 * en azul hondo, salvo donde brilla el sol: ahí el punto es del color del
 * reflejo y su área, el brillo. Entre los puntos, el reflejo del horizonte
 * que se aclara hacia quien mira. Sobre el horizonte, el cielo de cada px,
 * con el sol. `blanco` funde todo en el blanco de la página.
 *
 * Cada color tiene dos horas, el día y la puesta, y `tarde` va de una a la
 * otra según la altura del sol: el cielo sigue celeste mientras el sol está
 * alto y se enciende en los últimos grados. De día el sol lleva una corona
 * blanca y ceñida, y su reflejo es dorado; al bajar, la corona se abre en el
 * resplandor que tiñe el cielo bajo, y el reflejo se vuelve naranjo. Cerca
 * del horizonte el aire achata el disco.
 */
export const TRAMA = `${RAYO}
uniform sampler2D campo;
uniform float blanco;
const vec3 CENIT = ${color('#5b8fd6')}, MEDIO = ${color('#a79fd2')}, BAJO = ${color('#f2967e')};
const vec3 HORIZONTE = ${color('#ffad5c')}, AGUA = ${color('#123f6b')}, ESTELA = ${color('#ff8f3a')};
const vec3 CENIT_DE_DIA = ${color('#6fa8e6')}, MEDIO_DE_DIA = ${color('#a3c9ef')}, BAJO_DE_DIA = ${color('#cfe2f3')};
const vec3 HORIZONTE_DE_DIA = ${color('#e7eef4')}, AGUA_DE_DIA = ${color('#1b5a92')}, ESTELA_DE_DIA = ${color('#ffc642')};
const vec3 FONDO = ${color('#edeef0')}, PAPEL = ${color('#f6f9fc')};
const vec3 CORONA = ${color('#fffbea')}, RESPLANDOR = ${color('#ffb86b')}, DISCO = ${color('#fff5dc')}, DISCO_BAJO = ${color('#ffbd73')};

float tarde;
vec3 hora(vec3 dia, vec3 puesta) {
  return mix(dia, puesta, tarde);
}

vec3 cielo(vec3 d) {
  vec3 c = mix(hora(HORIZONTE_DE_DIA, HORIZONTE), hora(BAJO_DE_DIA, BAJO), smoothstep(0.0, 0.07, d.y));
  c = mix(c, hora(MEDIO_DE_DIA, MEDIO), smoothstep(0.04, 0.24, d.y));
  c = mix(c, hora(CENIT_DE_DIA, CENIT), smoothstep(0.16, 0.62, d.y));
  float a = acos(clamp(dot(d, sol), -1.0, 1.0));
  float bajo = 1.0 - smoothstep(-0.03, 0.4, sol.y);
  float resplandor = (0.5 * exp(-a / 0.3) + 0.35 * exp(-a / 0.07)) * bajo * (1.0 - smoothstep(0.0, 0.5, d.y));
  float corona = 0.45 * exp(-a / 0.05) + 0.2 * exp(-a / 0.25);
  c = mix(c, hora(CORONA, RESPLANDOR), mix(corona, resplandor, tarde));
  float elevacion = asin(sol.y);
  float achatado = 1.0 + 0.22 * (1.0 - smoothstep(0.0, 0.1, sol.y));
  vec2 lejos = vec2((atan(d.x, d.z) - atan(sol.x, sol.z)) * cos(elevacion), (asin(d.y) - elevacion) * achatado);
  vec3 disco = mix(DISCO, DISCO_BAJO, smoothstep(0.06, -0.02, sol.y));
  return mix(c, disco, smoothstep(${num(RADIO + 0.004)}, ${num(RADIO - 0.002)}, length(lejos)));
}

void main() {
  tarde = 1.0 - smoothstep(0.03, ${num(DIA)}, sol.y);
  vec2 px = vec2(gl_FragCoord.x, res.y - gl_FragCoord.y);
  vec2 xy = floor(px / celda);
  vec4 m = texture2D(campo, (xy + 0.5) / rejilla);
  vec3 d = rayo(px);
  vec3 c;
  if (m.b > 0.5) {
    c = cielo(d);
  } else {
    float b = -d.y / length(d.xz);
    vec3 fondo = mix(hora(HORIZONTE_DE_DIA, HORIZONTE) * 0.97 + 0.03, FONDO, smoothstep(-0.02, 0.22, b));
    float lado = 0.62 * celda;
    float oscuro = lado * sqrt(m.r * (1.0 - m.g));
    float brillo = lado * sqrt(m.g);
    float radio = max(oscuro, brillo);
    float punto = smoothstep(radio + 0.8, radio - 0.8, length(px - (xy + 0.5) * celda));
    c = mix(fondo, brillo > oscuro ? hora(ESTELA_DE_DIA, ESTELA) : hora(AGUA_DE_DIA, AGUA), punto);
  }
  gl_FragColor = vec4(mix(c, PAPEL, blanco), 1.0);
}`
