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
 *   - Once trenes de olas de gravedad (`TRENES`): dos de marejada, seis de
 *     mar de viento y tres de rizos. Cada uno con su longitud de onda, su amplitud y su rumbo, todos
 *     hacia quien mira. La velocidad no se elige: la da la dispersión del agua
 *     honda, ω = √(g·k), así que las olas largas corren más que las cortas. La
 *     velocidad de grupo es la mitad de la de fase, y las dos marejadas, de
 *     longitud vecina, forman grupos —las series— que las crestas
 *     atraviesan creciendo y apagándose. Nada de eso se programa: sale de
 *     sumar.
 *   - Cada tren es una ola de Gerstner, la trocoide de verdad: el agua gira en
 *     círculos del alto de la ola, así que la cresta es aguda y el valle ancho.
 *     Para saber la altura en un punto del mundo hay que deshacer ese
 *     desplazamiento horizontal: por tren es la ecuación de Kepler,
 *     θ = θ' + e·sen θ, que dos vueltas resuelven. El empinamiento e = k·A ronda
 *     0.065: mar de brisa, lejos del de rotura.
 *   - La espuma sale de la misma geometría. Donde el desplazamiento horizontal
 *     se pliega (su jacobiano baja de un umbral) la ola rompe, y la espuma se
 *     queda en el agua donde rompió: el pliegue se mira también 0.6, 1.2 y
 *     1.8 s atrás, cada vez más tenue, así que la ola sigue y la mancha queda
 *     detrás. Su textura se lee en el punto de reposo del agua (`origen`), así
 *     que gira con ella.
 *   - Lo que toca el agua —el cursor, el dedo, el pato— deja anillos con la
 *     solución exacta del agua honda para un impulso, la de Cauchy y Poisson:
 *     a una edad τ y a una distancia r llega la ola de número k = g·τ²/(4r²),
 *     con fase g·τ²/(4r). Las largas llegan primero. Sumados a lo largo de un
 *     recorrido, los anillos forman la estela de Kelvin, la V de 19,47° de
 *     todo lo que avanza por el agua. Solo mueven la luz, no la silueta.
 *   - Cada tren se apaga cuando su período, visto a esa distancia y escorzado,
 *     baja de unas 3 celdas (`detalle`): más fino, daría muaré. Lo que se
 *     apaga no desaparece de la luz: su pendiente pasa a ser rugosidad, que
 *     ensancha el reflejo del sol. Cerca, el sol es un puñado de destellos;
 *     lejos, un camino de luz. Y el agua lejana queda pareja, que también es
 *     profundidad.
 *
 * Quien mira flota: va en un bote, con los ojos a `OJOS` del agua, y el bote
 * sube y baja con la marejada (`casco`, el agua bajo él en promedio). El
 * horizonte está en el infinito y no se mueve con eso; el agua cercana sube y
 * baja con el bote. Cuando el bote cae en un valle, la cresta que viene pasa
 * la altura de los ojos y asoma sobre el horizonte, como se ve el mar desde
 * un bote. Por eso el lienzo deja aire arriba del horizonte (ver `camara`).
 *
 * La luz, en `MAR`: Fresnel con el 2 % del agua, así que la cara que mira de
 * frente es honda y el agua vista de canto refleja el cielo; el sol adelante a
 * la derecha, como el de la portada; transluz en las crestas a contraluz, y
 * bruma hacia el horizonte. Todo da un tono de 0 a 1: el color del punto va de
 * `sombra` a `luz` y a `borde`, y su área crece con el tono. Entre los puntos,
 * el agua lleva el relleno de `sombra` (ver `TRAMA`).
 */

import { NADA } from './pato.js'

// Gravedad, en m/s².
const G = 9.81

// Los trenes, de mayor a menor: longitud de onda y amplitud en metros, rumbo
// en grados (0 viene de frente; positivo, cruzando hacia la derecha) y fase.
// Los primeros `EN_LA_MARCHA` dan la silueta; el resto, la textura.
const TRENES = [
  [38, 0.42, -8, 0],
  [31, 0.33, 7, 2.1],
  [17, 0.17, -24, 4.2],
  [10.5, 0.11, 28, 1.3],
  [6.4, 0.065, -40, 5],
  [4, 0.04, 16, 3.3],
  [2.5, 0.024, -55, 0.7],
  [1.6, 0.015, 42, 2.6],
  [1, 0.0095, -18, 4.4],
  [0.62, 0.006, 64, 1.9],
  [0.4, 0.0038, -72, 3.7],
]
const EN_LA_MARCHA = 4

export const OLAS = TRENES.map(([largo, alto, rumbo, fase]) => {
  const k = (2 * Math.PI) / largo
  const angulo = (rumbo * Math.PI) / 180
  return { largo, alto, fase, k, w: Math.sqrt(G * k), e: k * alto, dx: Math.sin(angulo), dz: -Math.cos(angulo) }
})

const SILUETA = OLAS.slice(0, EN_LA_MARCHA)

// La cámara: los ojos a `OJOS` m del agua bajo el bote, y nada más cerca que
// la proa, a `PROA` m. `CRESTA` es la ola más alta posible: todos los trenes
// de la silueta a la vez. `ASOMA` es cuánto puede subir una cresta sobre el
// horizonte, en tangente: en 20 minutos de este mar, la que más asomó llegó a
// 0.045 —a media marejada del bote, con el bote en el valle—, y se le deja el
// doble. Si cambian las olas o los ojos, hay que volver a medirla.
export const OJOS = 1.2
const PROA = 0.5
const ASOMA = 0.09
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
 * El horizonte es lo que hace que el mar no tenga borde: va lo bastante abajo
 * para que la cresta que más asome quepa en el aire de arriba (`ASOMA`), y
 * nunca más arriba del 15 % del alto.
 */
export function camara(ancho, alto) {
  const focal = Math.max(1.8 * alto, ancho / 1.6)
  return { ancho, alto, focal, horizonte: Math.max(0.15 * alto, ASOMA * focal), ojos: OJOS }
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
    const d = detalle(ola.largo, x * x + z * z, escala)
    const fase = ola.k * (ola.dx * x + ola.dz * z) - ola.w * t + ola.fase
    let th = fase + ola.e * d * Math.sin(fase)
    th = fase + ola.e * d * Math.sin(th)
    h += ola.alto * d * Math.cos(th)
  }
  return h
}

// Cuánto se ve un tren a la distancia √r2: su período en celdas, escorzado
// por la perspectiva. `escala` es focal × OJOS / celda. Por debajo de 2
// celdas no se ve, y desde 4 se ve entero. La de `detalle` en el shader.
function detalle(largo, r2, escala) {
  const s = Math.min(Math.max((largo * escala) / r2 / 2 - 1, 0), 1)
  return s * s * (3 - 2 * s)
}

// Un número como literal de GLSL, que siempre lleva punto.
function num(numero) {
  const texto = String(Number(numero.toPrecision(7)))
  return /[.e]/.test(texto) ? texto : `${texto}.0`
}

// Un tren en el punto `p`, a la distancia `r` y en el instante `cuando`: deja
// en `d` su detalle y en `th` su fase con el desplazamiento horizontal
// deshecho. `cuenta` es lo que se hace con él.
const tren = (ola, cuenta) => `
  d = detalle(${num(ola.largo)}, r);
  fase = dot(p, vec2(${num(ola.dx)}, ${num(ola.dz)})) * ${num(ola.k)} - ${num(ola.w)} * cuando + ${num(ola.fase)};
  th = fase + ${num(ola.e)} * d * sin(fase);
  th = fase + ${num(ola.e)} * d * sin(th);
  ${cuenta}`

const sumar = (olas, cuenta) => olas.map((ola) => tren(ola, cuenta(ola))).join('')

const rumbo = (ola) => `vec2(${num(ola.dx)}, ${num(ola.dz)})`

// La altura de la silueta, para la marcha del rayo.
const RELIEVE = `
float relieve(vec2 p, float r, float cuando) {
  float h = 0.0, d, fase, th;
  ${sumar(SILUETA, (ola) => `h += ${num(ola.alto)} * d * cos(th);`)}
  return h;
}`

// El jacobiano del desplazamiento horizontal: 1 en el agua en calma, menos
// donde la superficie se comprime, y 0 donde se pliega.
const PLIEGUE = `
float pliegue(vec2 p, float r, float cuando) {
  vec3 m = vec3(0.0);
  float d, fase, th;
  ${sumar(OLAS, (ola) => `m += ${num(ola.e)} * d * cos(th) * vec3(${num(ola.dx ** 2)}, ${num(ola.dz ** 2)}, ${num(ola.dx * ola.dz)});`)}
  return (1.0 - m.x) * (1.0 - m.y) - m.z * m.z;
}`

// La superficie entera en `p`: su altura, su pendiente, el punto de reposo del
// agua que está ahí y la rugosidad de lo que no alcanza a verse.
const SUPERFICIE = `
float superficie(vec2 p, float r, float cuando, out vec2 pendiente, out vec2 origen, out float rugosidad) {
  float h = 0.0, d, fase, th, s, c;
  pendiente = vec2(0.0);
  origen = p;
  rugosidad = 2e-4;
  ${sumar(
    OLAS,
    (ola) => `s = sin(th);
  c = cos(th);
  h += ${num(ola.alto)} * d * c;
  pendiente -= ${num(ola.e)} * d * s / (1.0 - ${num(ola.e)} * d * c) * ${rumbo(ola)};
  origen += ${num(ola.alto)} * d * s * ${rumbo(ola)};
  rugosidad += (1.0 - d * d) * ${num(ola.e ** 2 / 2)};`,
  )}
  return h;
}`

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
const vec3 SOL = vec3(${SOL.map(num).join(', ')});
const vec2 PATO = vec2(${num(NADA[0].length)}, ${num(NADA.length)});
float detalle(float largo, float r) {
  return smoothstep(2.0, 4.0, largo * escala / (r * r));
}
${RELIEVE}
${PLIEGUE}
${SUPERFICIE}
${ONDAS}
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
    float antes = ojos - baja * r - relieve(rumbo * r, r, t);
    toca = antes <= 0.0;
    float paso = pow(hasta / desde, 1.0 / 32.0);
    for (int i = 0; i < 32; i++) {
      if (toca) break;
      float sigue = r * paso;
      float ahora = ojos - baja * sigue - relieve(rumbo * sigue, sigue, t);
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
    float h = superficie(p, r, t, pendiente, origen, rugosidad);
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
    float espuma = 0.0;
    for (int i = 0; i < 4; i++) {
      float atras = 0.6 * float(i);
      espuma = max(espuma, smoothstep(0.62, 0.45, pliegue(p, r, t - atras)) * exp(-atras / 1.2));
    }
    espuma *= smoothstep(0.35, 0.6, 0.65 * texture2D(ruido, origen / 100.0).r + 0.35 * texture2D(ruido, origen / 33.0).r);
    tono = mix(tono, 1.0, max(espuma, clamp(0.02 * sol, 0.0, 1.0)));
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
