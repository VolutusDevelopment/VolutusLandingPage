/**
 * El pintor de las nubes, en un Web Worker.
 *
 * Todo el WebGL vive aquí y no en la página. La razón es medida: en un
 * navegador recién abierto, crear el primer contexto WebGL espera a que
 * arranque la GPU, y en el hilo principal eso era una tarea de más de un
 * segundo que bajaba Lighthouse a ~76. Aquí esa espera no bloquea a nadie.
 *
 * Qué dibuja: una rejilla de puntos en espacio de pantalla, como una trama de
 * imprenta. Cada lienzo dice qué mira:
 *
 *   - `cielo`: una volutus, la nube en rollo que da nombre a la marca: una
 *     sola nube física (lib/volutus.js), en volumen de verdad, que cada
 *     página mira con su cámara (`data-perspectiva`). Se forma en su frente,
 *     donde el aire sube, y se evapora detrás, donde baja: eso es lo que se
 *     ve rodar. El cursor, o el dedo, la empuja apenas donde pasa, y la nube
 *     se vuelve a cerrar sola.
 *   - `mar`: el agua bajo la nube, mirada desde muy cerca de ella. Las olas
 *     llegan de frente con su física de verdad, rompen y dejan espuma, el sol
 *     brilla en ellas, y las crestas que pasan la altura de los ojos asoman
 *     sobre el horizonte. Apenas el mar entra en pantalla sale a nadar un
 *     pato, que deja estela y de rato en rato se detiene a provocar a quien
 *     mira, en un globo: «¿A QUE NO ME CAZAS?». La física y su shader viven
 *     en lib/mar.js.
 *   - `ola`: la ola del logotipo, punto por punto (lib/ola.js), en el plano de
 *     la marca de /nosotros. Al asomar se dibuja: las tres líneas nacen en la
 *     S y se enrollan en voluta. Después el cursor es viento, como en el
 *     cielo, pero el aire es viscoso: la ola se estira en una curva ancha, sin
 *     abrirse, y vuelve a su forma en menos de un segundo.
 *
 * Los colores son `luz` y `sombra`, y el mar y la ola suman `borde` (la
 * espuma y los destellos del agua).
 *
 * Recibe de la página (nubes.js) los lienzos, sus medidas, sus colores, si
 * están a la vista, por dónde pasa el cursor en el cielo y en la ola, cuándo
 * sale el pato, la trama de la ola y cuándo asoma (`nace`), la cámara de cada
 * cielo y, en el juego de la 404, la forma del cielo; le devuelve `vivo` cuando un
 * lienzo ya tiene su primer fotograma y, en el mar, dónde va el pato.
 */

import {
  GLOBO, GLOBOS, MAR, NADO, OJOS, RASTRO, TRAMO_RASTRO, VAIVEN, alLienzo, camara, casco, flotar,
} from './lib/mar.js'
import { texturaDeLaOla } from './lib/ola.js'
import { FISICA, JUEGO, encuadrar, lapso, rollo } from './lib/volutus.js'
import { COLORES, FLOTACION, NADA } from './lib/pato.js'

// ~30 fps: las nubes se mueven lento y la mitad de fotogramas no se nota.
const INTERVALO = 33
// El instante que se congela con movimiento reducido: uno con nubes.
const QUIETO_EN = 4000
// El aire bajo la nube (ver `simular`). El paso de tiempo es fijo, el de un
// fotograma: con uno real, una pestaña que se atasca daría un salto enorme.
// Cada celda del fluido cubre 3×3 celdas de la trama. La presión se resuelve
// con 20 vueltas de Jacobi, que bastan para que el aire no se comprima a la
// vista. La viscosidad es una pasada de `DIFUSION` por ley: apaga los
// remolinos de una o dos celdas, que la rejilla no resuelve.
const DT = INTERVALO / 1000
const CELDAS_POR_AIRE = 3
const VUELTAS_DE_PRESION = 20
const VUELTAS_DE_VISCOSIDAD = 1
// En la ola cada punto lleva su celda de aire: con 3 por celda, como en el
// cielo, un remolino taparía tres puntos. Es espesa: dos pasos de `DIFUSION`
// por ley. Las tres líneas se dibujan en `DIBUJO` ms.
const CELDAS_POR_AIRE_EN_LA_OLA = 1
const VUELTAS_DE_VISCOSIDAD_EN_LA_OLA = 2
const DIBUJO = 2500
// El pato del mar nada a `NADO` m/s (lib/mar.js), con la línea de flotación al
// 45 % de la franja de agua, y sale a flote desde `HUNDIDO` m en `SALIDA` s,
// con una `GOTA` en el agua.
// Habla `HABLA` s seguidos, y antes de volver a hablar nada al menos `CALLA` s.
// Su cuerpo, en la línea de flotación, mide `LARGO` celdas, y de ancho, `ANCHO`
// de su largo.
const LARGO = 12
const ANCHO = 0.4
const HUNDIDO = 0.35
const GOTA = 0.05
const SALIDA = 0.9
const HABLA = 8
const CALLA = 10

const VERTICES = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

// El shader viaja tal cual al navegador —el minificador no entra en el
// texto—, así que sus explicaciones van aquí y no dentro:
//
//   - `PUNTO`: el punto, con borde suavizado de 1.5 px, en el centro de su
//     celda. En el cielo es un cuadrado redondeado (`CUADRADO`, que se define
//     al compilar: una superelipse de grado 4, entre el círculo y el cuadrado),
//     que llena el 93 % de su celda y dibuja mejor la textura; en el mar y en
//     la ola, un círculo. Lo usa `TRAMA`.
//   - Dos pasadas, en el cielo y en el mar. Recorrer la nube o el agua es
//     caro, así que no se calcula por píxel sino por celda: `CAMPO` (o `MAR`,
//     en lib/mar.js) pinta una textura con un texel por celda —color y
//     cobertura— y `TRAMA` dibuja con ella los puntos a resolución completa.
//   - `CAMPO`, la nube: el mundo va en metros y las medidas del rollo, en
//     `FISICA` (lib/volutus.js). Cada celda lanza un rayo desde la cámara de
//     su página (`ojo`, `frente`, `derecha`, `arriba` y `focal`), lo corta con
//     el cilindro elíptico que envuelve al rollo (`cilindro`) y lo recorre de
//     adelante hacia atrás, con pasos según el largo del tramo. Al entrar en
//     la nube busca su borde por bisección y sigue con pasos finos, así que
//     el borde no deja escalones. Lo lejano se ve chico porque está lejos, no
//     por una regla aparte: el eje fuga a su horizonte.
//   - `rollo`, la densidad: `base` es 1 en el eje y 0 en la superficie de la
//     sección, una elipse de 1,7 × 1,2 km, y encima va `borla`: ruido 3D con
//     valor absoluto suavizado en cada octava, bultos redondos con pliegues.
//     La textura sale del lado del rollo y no de la vista: en el frente
//     (`delante`), donde el aire sube parejo, vetas largas a lo largo del eje
//     y la base plana y nítida en el nivel de condensación (`NIVEL`); en la
//     cresta, bultos bajos de estratocúmulo, sin torres, porque la inversión
//     la aplana; detrás, donde el aire baja turbulento, bultos revueltos que
//     se deshacen en jirones al evaporarse.
//   - El detalle va según la distancia, como las olas del mar: `detalle` suma
//     octavas hasta que la más fina mide `GRANO` puntos, y la última entra con
//     un fundido que no cambia la densidad media. Más fino, daría muaré. Y
//     `borla` deja de sumar en cuanto el resultado ya es nube llena o aire
//     vacío: dentro de la nube no hace falta el detalle fino.
//   - `ruido3` lee una textura de ruido 2D que genera este worker: su canal G
//     es el R desplazado (37, 17) por cada capa en z, así que una sola lectura
//     trae dos capas y basta mezclarlas. Es varias veces más barato que
//     calcular el azar de las ocho esquinas.
//   - El movimiento, en el tiempo propio de la nube (`tiempo`), que va en
//     cámara rápida (`lapso` en lib/volutus.js): el ruido gira alrededor del
//     eje a la velocidad de la circulación (`VUELTA`), así que cada bulto nace
//     en el frente, sube, cruza la cresta y se deshace detrás; deriva a lo
//     largo del eje (`DERIVA`), y cada octava hierve un poco más que la
//     anterior (`HERVOR`).
//   - Los cúmulos, solo en el juego de la 404 (patos.js): la volutus se
//     deshace en hasta diez nubes, `cumulos`, cada una con su centro y su
//     radio en metros. `forma` dice cuánto va: en 0 el shader no las mira y en
//     1 no mira el rollo. Cada cúmulo es un elipsoide 1.6 veces más ancho que
//     alto, con la base aplanada; los vecinos se juntan (`junta`) en vez de
//     quedar como esferas sueltas, y el ruido es uno solo para todos, en
//     metros (`CUMULO`), sin costuras entre ellos. Mide la mitad de un cúmulo
//     mediano: más grande que ellos, los dejaba lisos. Hacia arriba el relieve
//     crece hasta `COLIFLOR`, en lóbulos y jirones, y la base queda plana.
//   - La luz: el sol va alto y detrás de quien mira, el mismo en todas las
//     páginas. En cada paso, dos muestras hacia el sol dan la profundidad
//     óptica, con la misma extinción (`SIGMA`) que la del rayo, y la luz
//     directa suma tres octavas de dispersión múltiple (Wrenninge, 2013), con
//     la fase de Henyey-Greenstein de las gotas (`fase`). Jugando, una tercera
//     muestra lejana deja que un cúmulo le dé sombra al de abajo. El relieve
//     de cada bulto sale de la densidad a un paso hacia el sol desde su borde,
//     y el término de polvo (Schneider y Vos, 2015) oscurece los bordes finos.
//     La luz del cielo es mayor arriba que en el vientre, pero el vientre
//     también recibe la del horizonte y el reflejo del mar (`SUELO`). El
//     brillo va de `sombra` a `luz` en línea recta: con una curva en S, la
//     sombra caía de golpe en una franja oscura.
//   - La bruma: el contraste cae con la distancia (Koschmieder, con la
//     visibilidad de `BRUMA`), así que lo lejano se aclara hacia `luz`. Aclara
//     el color y no achica los puntos: achicándolos, la volutus se deshacía en
//     puntos sueltos hacia el horizonte. Más allá de `LEJOS` no se mira.
//   - El viento: `CAMPO` lee en su celda el `estado` del aire (ver el fluido,
//     más abajo) y corre el rayo lo que el aire movió la nube; donde entró
//     aire seco, la adelgaza, con un ruido que le rompe el borde.
//   - El fluido: aire de verdad, en una rejilla chica, con *Stable Fluids*
//     (Stam, 1999) y *vorticity confinement* (Fedkiw, Stam y Jensen, 2001).
//     En el cielo se mide en px CSS: el cursor está en la pantalla, así que
//     soplar es igual en cualquier pantalla y en cualquier parte de la nube.
//     Cada paso es una ley:
//       · `FUERZA`: el cursor empuja el aire a lo largo del tramo que recorrió
//         en el fotograma, con `EMPUJE` de su rapidez y hasta `TOPE`.
//       · `ROTOR` y `CONFINA`: la vorticidad, y una fuerza que la devuelve a
//         los remolinos que la rejilla gruesa iría borrando. Solo pasado
//         `UMBRAL`: sin él avivaba el ruido de toda la rejilla.
//       · `DIFUSION`: la viscosidad. Reparte entre vecinas la velocidad y lo
//         que el aire corrió a la nube; apaga los remolinos de una o dos
//         celdas. En la ola es espesa: se estira en una curva ancha y lisa.
//       · `DIVERGENCIA`, `PRESION` y `GRADIENTE`: el aire no se comprime. Se
//         resuelve la presión y se le resta su gradiente a la velocidad: el
//         aire delante del cursor se aparta y lo rodea, y detrás se cierra.
//       · `ADVECCION`: el aire se lleva a sí mismo (semi-lagrangiana) y pierde
//         velocidad con `FRENO`, así que se calma solo.
//       · `ESTADO`: el aire se lleva lo que la nube guarda de él. En `rg` va
//         cuánto la movió el aire que pasa de `LEVE`, que se relaja hacia cero
//         porque el frente de la onda la vuelve a armar, y topa en `CORRE`. En
//         `b` va el aire seco que la turbulencia mezcla dentro (*entrainment*):
//         nace donde el rotor es fuerte y se evapora en `EVAPORA` s.
//   - La ola (`OLA`, que se define al compilar): el campo no es una nube sino
//     la textura de lib/ola.js, corrida por el aire y abierta por el aire seco
//     igual que el rollo. Mientras se dibuja, cada punto crece cuando `crece`
//     (de 0 a 1 en `DIBUJO` ms) pasa su orden, con un frente de una décima de
//     la ola. Su aire es más espeso que el del cielo (ver `AIRE`): casi sin
//     remolinos ni aire seco, se frena al soltar y la ola vuelve en medio
//     segundo. Los números salieron de un prototipo en el que se ajustaron a
//     la vista: vuelve entera en menos de 0.9 s.
//   - `TRAMA`: cada píxel lee el texel de su celda y dibuja el punto, con el
//     área proporcional a la cobertura, como una trama de imprenta. Ni
//     jugando cierra los huecos: entre punto y punto se adivina el pato que
//     pasa detrás de la nube.
//     En el mar (`relleno`) pinta además el agua entre los puntos, con
//     `sombra`: el alfa del campo dice si la celda es agua (desde 0.5) o no
//     (bajo 0.5), y encima el área a 0.249 por unidad (ver `MAR` en
//     lib/mar.js). El borde del agua se suaviza entre las cuatro celdas
//     vecinas, para que la silueta de una cresta contra el cielo no salga
//     escalonada.
const PUNTO = `
float punto(vec2 px, vec2 c, float r) {
#ifdef CUADRADO
  vec2 q = abs(px - c);
  q *= q;
  float d = sqrt(sqrt(dot(q, q)));
#else
  float d = length(px - c);
#endif
  return 1.0 - smoothstep(r - 0.75, r + 0.75, d);
}`

const RUIDO = `
uniform sampler2D ruido;
float ruido3(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  vec2 rg = texture2D(ruido, (i.xy + vec2(37.0, 17.0) * i.z + f.xy + 0.5) / 256.0).yx;
  return mix(rg.x, rg.y, f.z);
}`

const CAMPO = `precision highp float;
uniform vec2 res, centro;
uniform float t, tiempo, celda, forma, lado, focal;
uniform vec3 luz, sombra, ojo, frente, derecha, arriba, sol;
uniform vec4 cumulos[10];
uniform sampler2D estado;
${RUIDO}
${FISICA}
const float SIGMA = 0.05, PASO = 40.0, SOLAR = 1.1, CIELO = 0.6, SUELO = 0.3, PISO = 0.15, TOPE = 1.5;
const float LISO = 0.35, TURBIO = 0.5, CRESTA = 0.3, ATRAS = -0.6, ENVUELVE = 1.5, GRANO = 2.5, MEDIA = 0.4;
const float HERVOR = 0.001, SECO = 40.0, LEJOS = 100000.0, COLIFLOR = 1.15, CUMULO = 160.0;
float altura;
float detalle(float puntos) {
  return clamp(log2(max(puntos, 1.0) / GRANO) / log2(2.03) + 1.0, 1.0, 5.0);
}
float borla(vec3 p, float octavas, float vacio, float lleno) {
  float v = 0.0, w = 0.5;
  for (int i = 0; i < 5; i++) {
    float parte = clamp(octavas - float(i), 0.0, 1.0);
    if (parte <= 0.0) break;
    float o = ruido3(p + vec3(0.0, 0.0, tiempo * HERVOR * float(i))) * 2.0 - 1.0;
    v += w * mix(MEDIA, sqrt(o * o + 0.01), parte);
    w *= 0.45;
    if (v >= lleno || v + w / 0.55 < vacio) return v;
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
  }
  return v + MEDIA * w / 0.55;
}
float rollo(vec3 p, float ppm, float tope) {
  vec2 s = vec2((p.y - EJE) / RY, p.z / RZ);
  float base = 1.0 - length(s);
  if (base < 1.0 - ENVUELVE) return 0.0;
  float arriba = smoothstep(0.1, 0.9, s.x);
  float delante = smoothstep(-0.6, 0.6, s.y);
  float lisa = delante * (1.0 - arriba);
  float a = VUELTA * tiempo;
  vec2 q = vec2(cos(a) * s.y + sin(a) * s.x, cos(a) * s.x - sin(a) * s.y);
  float ks = mix(3.0, 4.5, lisa);
  vec3 n = vec3(p.x / RY * mix(3.0, 1.2, lisa) + DERIVA * tiempo, q * ks);
  float nivel = mix(ATRAS + (delante < 1.0 ? 0.3 * (ruido3(n * 0.6 + 5.0) - 0.5) : 0.0), NIVEL, delante);
  altura = s.x;
  if (s.x < nivel) return 0.0;
  float relieve = mix(mix(TURBIO, LISO, delante), CRESTA, arriba);
  float firme = mix(5.0, 10.0, delante);
  float vacio = 0.35 - base / relieve, lleno = vacio + 1.0 / (firme * relieve);
  float rho = firme * (base + (borla(n, min(tope, detalle(RY / ks * ppm)), vacio, lleno) - 0.35) * relieve);
  return clamp(rho * smoothstep(nivel, nivel + mix(0.5, 0.03, delante), s.x), 0.0, 1.0);
}
float cumulo(vec3 p, float ppm, float tope) {
  float base = -1.0, mejor = -1.0;
  for (int i = 0; i < 10; i++) {
    vec4 c = cumulos[i];
    if (c.w <= 0.0) continue;
    vec3 local = (p - c.xyz) / c.w;
    float b = 1.0 - length(vec3(local.x / 1.6, local.y * (local.y < 0.0 ? 1.8 : 1.0), local.z / 1.6));
    float junta = max(0.4 - abs(b - base), 0.0) / 0.4;
    base = max(base, b) + 0.1 * junta * junta;
    if (b > mejor) {
      mejor = b;
      altura = local.y;
    }
  }
  if (base < 1.0 - ENVUELVE) return 0.0;
  float relieve = mix(0.5, COLIFLOR, smoothstep(-0.2, 0.8, altura));
  float vacio = 0.35 - base / relieve, lleno = vacio + 0.2 / relieve;
  return clamp(5.0 * (base + (borla(p / CUMULO, min(tope, detalle(CUMULO * ppm)), vacio, lleno) - 0.35) * relieve), 0.0, 1.0);
}
float densidad(vec3 p, float ppm, float tope) {
  float rho = 0.0;
  if (forma < 1.0) rho = rollo(p, ppm, tope) * (1.0 - smoothstep(0.1, 0.6, forma));
  if (forma > 0.0) rho = max(rho, cumulo(p, ppm, tope) * smoothstep(0.0, 0.3, forma));
  return rho;
}
float hg(float c, float g) {
  return (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * c, 1.5);
}
vec3 fase;
float delSol(float hondo) {
  return dot(fase, exp(-SIGMA * hondo * vec3(1.0, 0.25, 0.0625)));
}
vec2 cilindro(vec3 d) {
  vec2 o = vec2((ojo.y - EJE) / RY, ojo.z / RZ) / ENVUELVE, v = vec2(d.y / RY, d.z / RZ) / ENVUELVE;
  float a = dot(v, v), b = dot(o, v), h = b * b - a * (dot(o, o) - 1.0);
  if (h < 0.0 || a < 1e-14) return vec2(1e9, -1e9);
  h = sqrt(h);
  return vec2(-b - h, -b + h) / a;
}
vec2 esfera(vec3 d, vec4 c) {
  vec3 o = ojo - c.xyz;
  float b = dot(o, d), r = ENVUELVE * 1.6 * c.w, h = b * b - dot(o, o) + r * r;
  if (h < 0.0) return vec2(1e9, -1e9);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}
void main() {
  vec2 celdaXY = floor(gl_FragCoord.xy) + 0.5;
  vec2 px = celdaXY * celda;
  vec3 aire = texture2D(estado, px / res).xyz;
  px -= aire.xy * ${CELDAS_POR_AIRE}.0 * celda;
  float abre = exp(-3.0 * aire.z * (0.4 + ruido3(vec3(px / celda * lado / SECO, t * 0.5))));
  vec3 d = normalize(frente * focal + derecha * (px.x - centro.x) - arriba * (px.y - centro.y));
  vec2 tramo = forma < 1.0 ? cilindro(d) : vec2(1e9, -1e9);
  if (forma > 0.0) {
    for (int i = 0; i < 10; i++) {
      if (cumulos[i].w <= 0.0) continue;
      vec2 e = esfera(d, cumulos[i]);
      tramo = vec2(min(tramo.x, e.x), max(tramo.y, e.y));
    }
  }
  tramo.x = max(tramo.x, 1.0);
  if (d.y < 0.0) tramo.y = min(tramo.y, -ojo.y / d.y);
  tramo.y = min(tramo.y, LEJOS);
  if (tramo.y <= tramo.x) {
    gl_FragColor = vec4(0.0);
    return;
  }
  float ppm = focal / celda, c = dot(d, sol);
  fase = vec3(1.0, 0.5, 0.25) * vec3(mix(hg(c, 0.8), hg(c, -0.3), 0.3), mix(hg(c, 0.4), hg(c, -0.15), 0.3), mix(hg(c, 0.2), hg(c, -0.075), 0.3));
  float paso = clamp((tramo.y - tramo.x) / 28.0, 15.0, 400.0);
  float va = tramo.x, transmite = 1.0, solar = 0.0, celeste = 0.0, hondura = 0.0;
  bool fino = false;
  float relieve = -1.0, antes = 0.0;
  for (int i = 0; i < 48; i++) {
    if (va > tramo.y) break;
    vec3 p = ojo + d * va;
    float rho = densidad(p, ppm / va, 5.0) * abre;
    if (rho > 0.005) {
      if (!fino) {
        fino = true;
        float fuera = va - paso;
        for (int k = 0; k < 3; k++) {
          float medio = 0.5 * (fuera + va);
          if (densidad(ojo + d * medio, ppm / medio, 5.0) * abre > 0.005) va = medio;
          else fuera = medio;
        }
        va = fuera;
        paso *= 0.45;
        antes = 0.0;
        continue;
      }
      float ambiente = mix(SUELO, CIELO, smoothstep(-1.0, 1.0, altura));
      float dentro = 1.0;
      if (relieve < 0.0) {
        dentro = clamp((rho - 0.005) / max(rho - antes, 1e-3), 0.0, 1.0);
        float h = max(4.0, 4.0 * va / ppm);
        vec3 entrada = p + d * (h - paso * dentro);
        relieve = clamp(0.65 + 3.0 * (densidad(entrada, ppm / va, 5.0) - densidad(entrada + sol * h, ppm / va, 5.0)) * abre, 0.2, 1.1);
      }
      float hondo = (PASO * densidad(p + sol * PASO, ppm / va, 2.0) + 3.0 * PASO * densidad(p + sol * (4.0 * PASO), ppm / va, 1.0)) * abre;
      if (forma > 0.0) hondo += 440.0 * densidad(p + sol * 600.0, ppm / va, 1.0) * abre;
      float opacidad = 1.0 - exp(-SIGMA * rho * paso * dentro);
      float peso = transmite * opacidad;
      solar += peso * SOLAR * delSol(hondo) * relieve * (1.0 - exp(-6.0 * rho));
      celeste += peso * ambiente;
      hondura += peso * va;
      transmite *= 1.0 - opacidad;
      if (transmite < 0.05) break;
    }
    antes = rho;
    va += paso;
  }
  float cubre = 1.0 - transmite;
  if (cubre < 0.003) {
    gl_FragColor = vec4(0.0);
    return;
  }
  solar /= cubre;
  celeste /= cubre;
  float niebla = exp(-BRUMA * hondura / cubre);
  vec3 color = mix(mix(sombra, luz, clamp((solar + celeste - PISO) / (TOPE - PISO), 0.0, 1.0)), luz, 1.0 - niebla);
  gl_FragColor = vec4(color, cubre);
}`

// La ola (ver arriba): `p` y `abre` como en `CAMPO`; la textura se lee en
// celdas, así que en reposo cada punto cae en el centro de su texel.
const OLA = `precision highp float;
uniform vec2 res, rejilla;
uniform float t, celda, crece;
uniform vec3 luz;
uniform sampler2D estado, ola;
${RUIDO}
void main() {
  vec2 p = (floor(gl_FragCoord.xy) + 0.5) * celda / res.y;
  vec3 aire = texture2D(estado, p * vec2(res.y / res.x, 1.0)).xyz;
  p -= aire.xy * celda / res.y;
  float abre = exp(-3.0 * aire.z * (0.4 + ruido3(vec3(p * 14.0, t * 0.5))));
  vec4 punto = texture2D(ola, p * res.y / (celda * rejilla));
  float aparece = smoothstep(punto.r, punto.r + 0.1, crece * 1.1);
  gl_FragColor = vec4(luz, punto.a * aparece * abre);
}`

const TRAMA = `precision highp float;
uniform vec2 res, rejilla;
uniform float celda, alfa, relleno;
uniform vec3 sombra;
uniform sampler2D campo;
${PUNTO}
vec4 celdaEn(vec2 xy) {
  return texture2D(campo, (xy + 0.5) / rejilla);
}
void main() {
  vec2 px = vec2(gl_FragCoord.x, res.y - gl_FragCoord.y);
  vec2 celdaXY = floor(px / celda);
  vec4 m = celdaEn(celdaXY);
  float area = m.a, agua = 0.0;
  if (relleno > 0.0) {
    area = (m.a - 0.5 * step(0.5, m.a)) / 0.249;
    vec2 q = px / celda - 0.5, i = floor(q), f = fract(q);
    vec4 mojadas = step(0.5, vec4(celdaEn(i).a, celdaEn(i + vec2(1.0, 0.0)).a, celdaEn(i + vec2(0.0, 1.0)).a, celdaEn(i + 1.0).a));
    agua = smoothstep(0.3, 0.7, mix(mix(mojadas.x, mojadas.y, f.x), mix(mojadas.z, mojadas.w, f.x), f.y));
  }
  float a = alfa * step(0.02, area) * punto(px, (celdaXY + 0.5) * celda, celda * 0.5 * sqrt(area));
  gl_FragColor = vec4(m.rgb * a + sombra * agua * (1.0 - a), a + agua * (1.0 - a));
}`

// El aire del cielo y el de la ola, que es viscoso (ver arriba). El del cielo
// se mide en px CSS, así que soplar es igual en cualquier pantalla y en
// cualquier parte de la nube: el cursor está en la pantalla, no a la distancia
// de la nube. El de la ola, en sus celdas, porque la ola es el logotipo y
// crece con su tarjeta. `pxPorAire` pasa de esas medidas a celdas del aire (en
// la ola vale 1). Las velocidades van en celdas por segundo y el rotor, en
// vueltas por segundo.
//
// `SOPLO` es el radio de la ráfaga; `TOPE`, la rapidez más alta que entra al
// aire, para que un tirón brusco no reviente la simulación; `EMPUJE`, cuánto
// de la rapidez del cursor toma el aire; `REMOLINO`, la
// fuerza de `CONFINA`, que no toca los rotores bajo `UMBRAL`: sin ese umbral
// avivaba el ruido de toda la rejilla, y la nube entera quedaba rizada por
// segundos; `VISCOSA`, cuánto reparte cada pasada de `DIFUSION`; `FRENO`, en
// cuántos segundos se calma; `SECADO`, cuánto aire seco mete el rotor, y
// `EVAPORA`, en cuántos segundos se va; `VUELVE`, en cuántos segundos se
// deshace lo que el aire corrió, y `CORRE`, hasta cuánto. Solo corre la nube
// el aire que pasa de `LEVE`: el que la presión reparte por todo el lienzo,
// casi quieto, la deformaba entera con un solo gesto.
const AIRE = `
uniform float pxPorAire;
#ifdef OLA
const float SOPLO = 2.0, TOPE = 52.0, EMPUJE = 0.4, REMOLINO = 1.2, UMBRAL = 0.0, VISCOSA = 0.2, FRENO = 0.26, SECADO = 0.0308, EVAPORA = 0.2, VUELVE = 0.5, CORRE = 2.08, LEVE = 0.0;
#else
const float SOPLO = 14.0, TOPE = 900.0, EMPUJE = 0.25, REMOLINO = 2.0, UMBRAL = 2.0, VISCOSA = 0.05, FRENO = 0.35, SECADO = 0.03, EVAPORA = 0.5, VUELVE = 0.7, CORRE = 20.0, LEVE = 15.0;
#endif`

// El fluido, una pasada por ley (ver arriba). `en` lee la celda vecina.
const MALLA = `precision highp float;
uniform vec2 malla;
uniform float dt;
uniform sampler2D uno, dos, tres;
${AIRE}
vec4 en(sampler2D s, float x, float y) {
  return texture2D(s, (gl_FragCoord.xy + vec2(x, y)) / malla);
}`

const FUERZA = `${MALLA}
uniform vec4 tramo;
uniform vec2 empuje;
void main() {
  vec2 p = gl_FragCoord.xy, a = tramo.xy, ab = tramo.zw - a;
  vec2 d = p - a - ab * clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  float r = SOPLO / pxPorAire;
  vec2 e = empuje * min(1.0, TOPE / (pxPorAire * length(empuje) + 1e-6));
  gl_FragColor = vec4(en(uno, 0.0, 0.0).xy + EMPUJE * e * exp(-dot(d, d) / (r * r)), 0.0, 1.0);
}`

const ROTOR = `${MALLA}
void main() {
  float w = en(uno, 1.0, 0.0).y - en(uno, -1.0, 0.0).y - en(uno, 0.0, 1.0).x + en(uno, 0.0, -1.0).x;
  gl_FragColor = vec4(0.5 * w, 0.0, 0.0, 1.0);
}`

const CONFINA = `${MALLA}
void main() {
  vec2 n = 0.5 * vec2(abs(en(dos, 0.0, 1.0).x) - abs(en(dos, 0.0, -1.0).x), abs(en(dos, 1.0, 0.0).x) - abs(en(dos, -1.0, 0.0).x));
  n /= length(n) + 1e-4;
  float w = en(dos, 0.0, 0.0).x;
  w *= clamp(abs(w) / max(UMBRAL, 1e-6) - 1.0, 0.0, 1.0);
  gl_FragColor = vec4(en(uno, 0.0, 0.0).xy + dt * REMOLINO * w * vec2(n.x, -n.y), 0.0, 1.0);
}`

// Un paso de la viscosidad: `xy` se reparte con las cuatro vecinas, y `z`, el
// aire seco del estado, queda como estaba.
const DIFUSION = `${MALLA}
void main() {
  vec4 c = en(uno, 0.0, 0.0);
  vec2 vecinas = en(uno, 1.0, 0.0).xy + en(uno, -1.0, 0.0).xy + en(uno, 0.0, 1.0).xy + en(uno, 0.0, -1.0).xy;
  gl_FragColor = vec4(c.xy + VISCOSA * (vecinas - 4.0 * c.xy), c.z, 1.0);
}`

const DIVERGENCIA = `${MALLA}
void main() {
  float d = en(uno, 1.0, 0.0).x - en(uno, -1.0, 0.0).x + en(uno, 0.0, 1.0).y - en(uno, 0.0, -1.0).y;
  gl_FragColor = vec4(0.5 * d, 0.0, 0.0, 1.0);
}`

const PRESION = `${MALLA}
void main() {
  float vecinas = en(uno, 1.0, 0.0).x + en(uno, -1.0, 0.0).x + en(uno, 0.0, 1.0).x + en(uno, 0.0, -1.0).x;
  gl_FragColor = vec4(0.25 * (vecinas - en(dos, 0.0, 0.0).x), 0.0, 0.0, 1.0);
}`

const GRADIENTE = `${MALLA}
void main() {
  vec2 g = vec2(en(uno, 1.0, 0.0).x - en(uno, -1.0, 0.0).x, en(uno, 0.0, 1.0).x - en(uno, 0.0, -1.0).x);
  gl_FragColor = vec4(en(dos, 0.0, 0.0).xy - 0.5 * g, 0.0, 1.0);
}`

// `atras`: de dónde vino, hace un paso, el aire de esta celda.
const ATRAS = `${MALLA}
vec2 atras() {
  return (gl_FragCoord.xy - dt * en(uno, 0.0, 0.0).xy) / malla;
}`

const ADVECCION = `${ATRAS}
void main() {
  gl_FragColor = vec4(texture2D(uno, atras()).xy * exp(-dt / FRENO), 0.0, 1.0);
}`

const ESTADO = `${ATRAS}
void main() {
  vec3 antes = texture2D(dos, atras()).xyz;
  vec2 v = en(uno, 0.0, 0.0).xy;
  v *= clamp(pxPorAire * length(v) / max(LEVE, 1e-6) - 1.0, 0.0, 1.0);
  vec2 movio = (antes.xy + dt * v) * exp(-dt / VUELVE);
  movio *= min(1.0, CORRE / (pxPorAire * length(movio) + 1e-6));
  float seco = antes.z * exp(-dt / EVAPORA) + dt * SECADO * abs(en(tres, 0.0, 0.0).x);
  gl_FragColor = vec4(movio, min(seco, 1.0), 1.0);
}`

// `requestAnimationFrame` dentro de un worker es reciente; sin él, un reloj.
const cuadro = self.requestAnimationFrame ?? ((f) => setTimeout(() => f(performance.now()), 16))

const escenas = new Map()
let quieto = false
let marco = 0
let ultimo = 0
const inicio = performance.now()

// Todos los uniforms de todos los programas. El que un programa no tiene da
// una ubicación nula, y WebGL ignora en silencio lo que se fija en una nula:
// así cada mensaje se aplica igual a todos los programas de un lienzo.
const UNIFORMS = [
  'res', 'rejilla', 't', 'celda', 'alfa', 'luz', 'sombra', 'borde', 'campo', 'relleno',
  'estado', 'forma', 'cumulos', 'camara', 'escala', 'nado', 'gota', 'pato', 'globo', 'dice', 'rastro', 'cuerpo',
  'ola', 'crece', 'lado', 'tiempo', 'centro', 'focal', 'ojo', 'frente', 'derecha', 'arriba', 'sol',
]
const UNIFORMS_DEL_AIRE = ['malla', 'dt', 'uno', 'dos', 'tres', 'tramo', 'empuje', 'pxPorAire']

function compilar(gl, fragmentos, uniforms = UNIFORMS) {
  const programa = gl.createProgram()
  for (const [tipo, fuente] of [
    [gl.VERTEX_SHADER, VERTICES],
    [gl.FRAGMENT_SHADER, fragmentos],
  ]) {
    const shader = gl.createShader(tipo)
    gl.shaderSource(shader, fuente)
    gl.compileShader(shader)
    gl.attachShader(programa, shader)
  }
  gl.bindAttribLocation(programa, 0, 'p')
  gl.linkProgram(programa)
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) return null
  const u = { programa }
  for (const nombre of uniforms) u[nombre] = gl.getUniformLocation(programa, nombre)
  return u
}

// La textura de `ruido3` en el cielo y de la espuma en el mar, en la unidad 0.
// Con semilla fija, así que la nube es la misma en cada visita. El canal G es
// el R desplazado (37, 17).
function texturaDeRuido(gl) {
  const lado = 256
  const datos = new Uint8Array(lado * lado * 4)
  let semilla = 1
  for (let i = 0; i < lado * lado; i++) {
    semilla = (Math.imul(semilla, 1664525) + 1013904223) >>> 0
    datos[i * 4] = semilla >>> 24
  }
  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      datos[(y * lado + x) * 4 + 1] = datos[(((y - 17) & 255) * lado + ((x - 37) & 255)) * 4]
    }
  }
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, lado, lado, 0, gl.RGBA, gl.UNSIGNED_BYTE, datos)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
}

// Una textura con el framebuffer que escribe en ella, en la unidad activa. La
// del campo guarda bytes y no se filtra: una celda por texel. Las del aire
// guardan medio float y se leen interpoladas. El tamaño lo pone `medir`.
function lamina(gl, tipo, filtro) {
  const textura = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, textura)
  for (const [clave, valor] of [
    [gl.TEXTURE_MIN_FILTER, filtro],
    [gl.TEXTURE_MAG_FILTER, filtro],
    [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
  ]) {
    gl.texParameteri(gl.TEXTURE_2D, clave, valor)
  }
  const hoja = { textura, tipo, fbo: gl.createFramebuffer() }
  dimensionar(gl, hoja, 1, 1)
  gl.bindFramebuffer(gl.FRAMEBUFFER, hoja.fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textura, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return hoja
}

function dimensionar(gl, hoja, ancho, alto) {
  gl.bindTexture(gl.TEXTURE_2D, hoja.textura)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ancho, alto, 0, gl.RGBA, hoja.tipo, null)
}

// El aire: sus programas y sus láminas, en las unidades 2 a 4. Velocidad,
// presión y estado van en pares, porque una pasada no puede leer la lámina en
// la que escribe: se lee `[0]`, se escribe `[1]` y se dan vuelta. Sin texturas
// de medio float que se puedan filtrar y pintar, no hay viento: `CAMPO` lee
// entonces una unidad vacía, que da cero, y la nube se pinta igual.
function montarAire(gl, definiciones) {
  const medio = gl.getExtension('OES_texture_half_float')
  if (!medio || !gl.getExtension('OES_texture_half_float_linear')) return null
  gl.getExtension('EXT_color_buffer_half_float')
  gl.activeTexture(gl.TEXTURE2)
  const nueva = () => lamina(gl, medio.HALF_FLOAT_OES, gl.LINEAR)
  const prueba = nueva()
  gl.bindFramebuffer(gl.FRAMEBUFFER, prueba.fbo)
  const pinta = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  if (!pinta) return null

  const fuentes = { FUERZA, ROTOR, CONFINA, DIFUSION, DIVERGENCIA, PRESION, GRADIENTE, ADVECCION, ESTADO }
  const programas = {}
  for (const [nombre, fuente] of Object.entries(fuentes)) {
    const u = compilar(gl, definiciones + fuente, UNIFORMS_DEL_AIRE)
    if (!u) return null
    gl.useProgram(u.programa)
    gl.uniform1i(u.uno, 2)
    gl.uniform1i(u.dos, 3)
    gl.uniform1i(u.tres, 4)
    gl.uniform1f(u.dt, DT)
    programas[nombre] = u
  }
  return {
    programas,
    velocidad: [prueba, nueva()],
    presion: [nueva(), nueva()],
    estado: [nueva(), nueva()],
    rotor: nueva(),
    divergencia: nueva(),
  }
}

function laminasDelAire(aire) {
  return [...aire.velocidad, ...aire.presion, ...aire.estado, aire.rotor, aire.divergencia]
}

// Una textura de bytes que no cambia, en la unidad activa.
function subirTextura(gl, ancho, alto, datos, filtro) {
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ancho, alto, 0, gl.RGBA, gl.UNSIGNED_BYTE, datos)
  for (const [clave, valor] of [
    [gl.TEXTURE_MIN_FILTER, filtro],
    [gl.TEXTURE_MAG_FILTER, filtro],
    [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
  ]) {
    gl.texParameteri(gl.TEXTURE_2D, clave, valor)
  }
}

// Un cuadro —el pato que nada en el mar (lib/pato.js) o sus globos
// (lib/mar.js)— en la unidad activa: un texel por punto, transparente donde
// no hay nada.
function texturaDeCuadro(gl, filas) {
  const ancho = filas[0].length
  const datos = new Uint8Array(ancho * filas.length * 4)
  filas.forEach((fila, y) =>
    [...fila].forEach((letra, x) => {
      if (!COLORES[letra]) return
      const n = parseInt(COLORES[letra].slice(1), 16)
      datos.set([n >> 16, (n >> 8) & 255, n & 255, 255], (y * ancho + x) * 4)
    }),
  )
  subirTextura(gl, ancho, filas.length, datos, gl.NEAREST)
}

// Todo lo que la escena guarda en la GPU: sus programas, el triángulo, las
// texturas y las láminas. Se arma al montar, y otra vez cuando el navegador
// devuelve un contexto perdido, que vuelve vacío. Si un programa no compila,
// no hay escena.
function preparar(escena) {
  const { gl, mar, ola } = escena
  const definiciones = ola ? '#define OLA\n' : ''
  // El punto de la nube es un cuadrado redondeado (ver `PUNTO`); el del mar y
  // el de la ola, el círculo de siempre.
  const programas = [
    compilar(gl, mar ? MAR : definiciones + (ola ? OLA : CAMPO)),
    compilar(gl, (mar || ola ? '' : '#define CUADRADO\n') + TRAMA),
  ]
  if (programas.includes(null)) return false

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  // Un triángulo que cubre todo el lienzo: sin costura en la diagonal.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  const [campo, trama] = programas
  escena.programas = programas
  texturaDeRuido(gl)
  gl.activeTexture(gl.TEXTURE1)
  escena.campo = lamina(gl, gl.UNSIGNED_BYTE, gl.NEAREST)
  gl.useProgram(trama.programa)
  gl.uniform1i(trama.campo, 1)
  gl.uniform1f(trama.relleno, mar ? 1 : 0)
  gl.useProgram(campo.programa)
  if (mar) {
    gl.activeTexture(gl.TEXTURE2)
    texturaDeCuadro(gl, NADA)
    gl.activeTexture(gl.TEXTURE3)
    texturaDeCuadro(gl, GLOBOS)
    gl.uniform1i(campo.pato, 2)
    gl.uniform1i(campo.globo, 3)
  } else {
    gl.uniform1i(campo.estado, 2)
    // La ola, en la unidad 5, que el aire no toca. Se lee interpolada: cuando
    // el aire la corre, cada punto crece o se achica de a poco. Va antes del
    // aire, que deja en uso sus propios programas.
    if (ola) {
      gl.activeTexture(gl.TEXTURE5)
      subirTextura(gl, ola.celdas, ola.celdas, ola.datos, gl.LINEAR)
      gl.uniform1i(campo.ola, 5)
    }
    escena.aire = montarAire(gl, definiciones)
  }
  return true
}

function montar(id, lienzo, mar, perspectiva, ola) {
  // `failIfMajorPerformanceCaveat`: sin GPU de verdad el navegador pinta
  // WebGL por software y cada fotograma cuesta CPU que la persona necesita
  // para otra cosa. En ese caso no hay nubes: son decoración.
  const gl = lienzo.getContext('webgl', {
    antialias: false,
    powerPreference: 'low-power',
    failIfMajorPerformanceCaveat: true,
  })
  const escena = { id, gl, mar, perspectiva, tiempo: 0, activa: false, vivo: false, perdida: false, ultimos: {} }
  if (ola) escena.ola = { celdas: ola.celdas, datos: texturaDeLaOla(ola), nace: null }
  if (!gl || !preparar(escena)) return
  if (mar) {
    escena.rastro = new Float32Array(4 * RASTRO)
    escena.pato = null
  } else {
    escena.previo = null
    escena.tramo = null
  }

  // El navegador pierde los contextos de la página cuando reinicia su GPU: el
  // equipo duerme, la pestaña pasa un rato en segundo plano, se resetea el
  // driver. Solo los devuelve si se le pide (`preventDefault`), y vacíos: se
  // arma la escena de nuevo y se le repite lo último que dijo la página. Sin
  // esto, la nube y el mar quedaban en blanco hasta recargar. Mientras no
  // vuelve no se pinta, y el enlace del pato se oculta.
  lienzo.addEventListener('webglcontextlost', (evento) => {
    evento.preventDefault()
    escena.perdida = true
    if (escena.pato) postMessage({ tipo: 'pato', id, x: 0, y: 0, visible: false })
  })
  lienzo.addEventListener('webglcontextrestored', () => {
    if (!preparar(escena)) return
    escena.perdida = false
    Object.values(escena.ultimos).forEach((data) => aplicar(escena, data))
    if (!marco) marco = cuadro(paso)
  })
  escenas.set(id, escena)
}

function fijar(escena, poner) {
  for (const u of escena.programas) {
    escena.gl.useProgram(u.programa)
    poner(escena.gl, u)
  }
}

// Junta lo que el cursor recorrió desde el último fotograma: `simular` lo
// sopla de una vez, como un tramo.
function soplar(escena, { x, y, fuera }) {
  if (fuera || quieto) {
    escena.previo = null
    return
  }
  const punto = { x, y, t: performance.now() }
  if (escena.previo && !escena.tramo) escena.tramo = { desde: escena.previo }
  if (escena.tramo) escena.tramo.hasta = punto
  escena.previo = punto
}

// Un paso del pato del mar. Nada a lo ancho y da la vuelta antes de salir de
// cuadro, o cuando se le antoja, cada 10 a 20 s. Flota donde lo lleva el agua
// (`flotar`) y, la primera vez que se pinta, sale a flote desde abajo con una
// gota. Su `rastro` es su lugar de reposo, el de ahora y uno cada
// `TRAMO_RASTRO` m de camino, y su `cuerpo`, el largo de `LARGO` celdas a su
// distancia: así deja estela (ver `ESTELA` en lib/mar.js). Ya fuera, cada vez
// que lleva `CALLA` s callado y su globo cabe a su derecha, se detiene, mira
// hacia allá y dice el dicho que sigue. Quieto, su lugar de reposo no cambia,
// y el globo cabe aunque el agua lo corra de lado todo lo que puede
// (`VAIVEN`). Le dice al shader dónde va su esquina, en celdas, hacia dónde
// mira, a qué distancia está y qué dice (ver `MAR`), y a la página dónde va,
// para que su enlace lo siga.
function nadar(escena, t) {
  const { gl, pato, camara: vista, celda, programas } = escena
  const profundidad = (vista.focal * OJOS) / (0.45 * (vista.alto - vista.horizonte))
  const orilla = ((vista.ancho / 2 - 12 * celda) * profundidad) / vista.focal
  pato.nace ??= t
  const salida = Math.min((t - pato.nace) / SALIDA, 1)
  if (pato.desde !== null && t - pato.desde >= HABLA) {
    pato.desde = null
    pato.callo = t
    pato.dicho = (pato.dicho + 1) % GLOBO[2]
  }
  const reposo = vista.ancho / 2 + pato.lado * (vista.ancho / 2 - 12 * celda)
  const globo = (NADA[0].length - FLOTACION[0] + 1 + GLOBO[0]) * celda + (VAIVEN * vista.focal) / profundidad
  const cabe = reposo + globo <= vista.ancho
  if (salida === 1 && pato.desde === null && t - pato.callo >= CALLA && cabe) {
    pato.desde = t
    pato.mira = 1
  }
  if (salida === 1 && pato.desde === null) {
    pato.lado += (pato.mira * NADO * DT) / orilla
    if ((pato.vuelta -= DT) < 0 || pato.lado * pato.mira > 0.85) {
      pato.mira = -pato.mira
      pato.vuelta = 10 + 10 * Math.random()
    }
  }
  const lugar = flotar(pato.lado * orilla, profundidad, t, escena.escala)
  lugar.y -= HUNDIDO * (1 - salida) ** 3
  if (t === pato.nace) gl.uniform4f(programas[0].gota, lugar.x, lugar.z, t, GOTA)
  const { rastro } = escena
  const aqui = [pato.lado * orilla, profundidad]
  if (Math.hypot(aqui[0] - rastro[4], aqui[1] - rastro[5]) >= TRAMO_RASTRO) rastro.copyWithin(4, 0, rastro.length - 4)
  rastro.set([...aqui, t, 1])
  const semieje = (LARGO / 2) * celda * (profundidad / vista.focal)
  gl.uniform2f(programas[0].cuerpo, semieje, ANCHO * semieje)
  const [x, y] = alLienzo(vista, lugar)
  const esquina = [Math.round(x / celda) - FLOTACION[0], Math.round(y / celda) - FLOTACION[1]]
  gl.uniform4f(programas[0].nado, ...esquina, pato.mira, Math.hypot(lugar.x, lugar.z))
  gl.uniform1f(programas[0].dice, pato.desde === null ? 0 : pato.dicho + 1)
  postMessage({ tipo: 'pato', id: escena.id, x: esquina[0] * celda, y: esquina[1] * celda, visible: salida === 1 })
}

// Un paso del aire (ver el fluido, arriba). El cursor llega en px del lienzo
// y el aire se mide en sus celdas. La velocidad del gesto es su tramo sobre
// lo que tardó, entre 1/60 y 0.1 s: si el cursor estuvo quieto y de pronto se
// mueve, cuenta el movimiento y no la espera. Se gira al azar unos grados: un
// flujo perfectamente simétrico no desprende remolinos, y en el aire real
// nada lo es.
function simular(escena) {
  const { gl, aire, tramo } = escena
  const { programas: p, velocidad, presion, estado } = aire
  const pasada = (u, destino, ...entradas) => {
    gl.useProgram(u.programa)
    entradas.forEach((hoja, i) => {
      gl.activeTexture(gl.TEXTURE2 + i)
      gl.bindTexture(gl.TEXTURE_2D, hoja.textura)
    })
    gl.bindFramebuffer(gl.FRAMEBUFFER, destino.fbo)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  // La viscosidad: reparte un par de láminas entre vecinas.
  const vueltas = escena.ola ? VUELTAS_DE_VISCOSIDAD_EN_LA_OLA : VUELTAS_DE_VISCOSIDAD
  const espesar = (par) => {
    for (let i = 0; i < vueltas; i++) {
      pasada(p.DIFUSION, par[1], par[0])
      par.reverse()
    }
  }
  gl.viewport(0, 0, ...aire.malla)

  if (tramo?.hasta) {
    const { desde, hasta } = tramo
    const lado = gl.canvas.height / aire.malla[1]
    const segundos = Math.min(Math.max((hasta.t - desde.t) / 1000, 1 / 60), 0.1)
    const vx = (hasta.x - desde.x) / lado / segundos
    const vy = (hasta.y - desde.y) / lado / segundos
    const giro = (Math.random() - 0.5) * 0.3
    gl.useProgram(p.FUERZA.programa)
    gl.uniform4f(p.FUERZA.tramo, desde.x / lado, desde.y / lado, hasta.x / lado, hasta.y / lado)
    gl.uniform2f(
      p.FUERZA.empuje,
      vx * Math.cos(giro) - vy * Math.sin(giro),
      vx * Math.sin(giro) + vy * Math.cos(giro),
    )
    pasada(p.FUERZA, velocidad[1], velocidad[0])
    velocidad.reverse()
    escena.tramo = null
  }

  pasada(p.ROTOR, aire.rotor, velocidad[0])
  pasada(p.CONFINA, velocidad[1], velocidad[0], aire.rotor)
  velocidad.reverse()
  espesar(velocidad)
  pasada(p.DIVERGENCIA, aire.divergencia, velocidad[0])
  for (let i = 0; i < VUELTAS_DE_PRESION; i++) {
    pasada(p.PRESION, presion[1], presion[0], aire.divergencia)
    presion.reverse()
  }
  pasada(p.GRADIENTE, velocidad[1], presion[0], velocidad[0])
  velocidad.reverse()
  pasada(p.ADVECCION, velocidad[1], velocidad[0])
  velocidad.reverse()
  pasada(p.ESTADO, estado[1], velocidad[0], estado[0], aire.rotor)
  estado.reverse()
  espesar(estado)

  gl.activeTexture(gl.TEXTURE2)
  gl.bindTexture(gl.TEXTURE_2D, estado[0].textura)
}

function pintar(escena, ahora) {
  const { gl, programas: [campo, trama] } = escena
  const t = (ahora - inicio) / 1000
  if (escena.aire && !quieto) simular(escena)
  gl.useProgram(campo.programa)
  gl.uniform1f(campo.t, t)
  // El tiempo de la nube va en cámara rápida (`lapso`, lib/volutus.js) y se
  // acumula fotograma a fotograma: así, cambiar el tamaño no la hace saltar.
  // Suma el tiempo que de verdad pasó, hasta 0.1 s: un equipo que pierde
  // fotogramas no frena la nube, y una pestaña que vuelve no la hace saltar.
  if (escena.encuadre) {
    if (!quieto) escena.tiempo += Math.min((ahora - (escena.antes ?? ahora)) / 1000, 0.1) * escena.lapso
    escena.antes = ahora
    gl.uniform1f(campo.tiempo, quieto ? (QUIETO_EN / 1000) * escena.lapso : escena.tiempo)
  }
  // La ola se dibuja desde que asoma (`nace`); quieta, va entera.
  const { ola } = escena
  if (ola) gl.uniform1f(campo.crece, quieto ? 1 : ola.nace === null ? 0 : Math.min((ahora - ola.nace) / DIBUJO, 1))
  if (escena.mar) {
    // Quien mira va en un bote que sube y baja con la marejada (lib/mar.js).
    const vista = escena.camara
    vista.ojos = OJOS + casco(t)
    gl.uniform3f(campo.camara, vista.focal, vista.horizonte, vista.ojos)
    if (escena.pato) nadar(escena, t)
    gl.uniform4fv(campo.rastro, escena.rastro)
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, escena.campo.fbo)
  gl.viewport(0, 0, ...escena.rejilla)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.useProgram(trama.programa)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  if (!escena.vivo) {
    escena.vivo = true
    postMessage({ tipo: 'vivo', id: escena.id })
  }
}

function paso(ahora) {
  marco = 0
  const activas = [...escenas.values()].filter((e) => e.activa && !e.perdida)
  if (!activas.length) return
  if (quieto) {
    activas.forEach((e) => pintar(e, inicio + QUIETO_EN))
    return
  }
  marco = cuadro(paso)
  if (ahora - ultimo < INTERVALO) return
  ultimo = ahora
  activas.forEach((e) => pintar(e, ahora))
}

// Lo que la página fija en la GPU de cada escena: su medida, sus colores y, en
// el juego de la 404, la forma del cielo. Se guarda el último de cada uno para
// repetirlo cuando vuelve un contexto perdido.
function aplicar(escena, data) {
  escena.ultimos[data.tipo] = data
  const { gl } = escena
  if (data.tipo === 'medir') {
    gl.canvas.width = data.ancho
    gl.canvas.height = data.alto
    escena.rejilla = [Math.ceil(data.ancho / data.celda), Math.ceil(data.alto / data.celda)]
    gl.activeTexture(gl.TEXTURE1)
    dimensionar(gl, escena.campo, ...escena.rejilla)
    // El mar mira con una cámara a la medida del lienzo (lib/mar.js), que se
    // fija en cada fotograma. `escala` es la del detalle de las olas.
    const vista = escena.mar && camara(data.ancho, data.alto)
    if (vista) Object.assign(escena, { camara: vista, celda: data.celda, escala: (vista.focal * OJOS) / data.celda })
    // La nube, con la cámara de su página (lib/volutus.js).
    if (!escena.mar && !escena.ola) {
      const encuadre = encuadrar(escena.perspectiva, data.ancho, data.alto)
      Object.assign(escena, { encuadre, lapso: lapso(encuadre.focal, data.densidad) })
    }
    const { aire, encuadre } = escena
    if (aire) {
      // Celdas cuadradas: el ancho en celdas es el alto por la proporción.
      const porAire = escena.ola ? CELDAS_POR_AIRE_EN_LA_OLA : CELDAS_POR_AIRE
      const alto = Math.max(8, Math.round(escena.rejilla[1] / porAire))
      aire.malla = [Math.max(8, Math.round((alto * data.ancho) / data.alto)), alto]
      gl.activeTexture(gl.TEXTURE2)
      for (const hoja of laminasDelAire(aire)) dimensionar(gl, hoja, ...aire.malla)
      gl.bindTexture(gl.TEXTURE_2D, aire.estado[0].textura)
      // Cuántos px CSS mide cada celda del aire: el del cielo se mide en px
      // (ver `AIRE`) y el de la ola, en sus celdas.
      const pxPorAire = escena.ola ? 1 : data.alto / (aire.malla[1] * data.densidad)
      for (const u of Object.values(aire.programas)) {
        gl.useProgram(u.programa)
        gl.uniform2f(u.malla, ...aire.malla)
        gl.uniform1f(u.pxPorAire, pxPorAire)
      }
    }
    gl.viewport(0, 0, data.ancho, data.alto)
    fijar(escena, (gl, u) => {
      gl.uniform2f(u.res, data.ancho, data.alto)
      gl.uniform2f(u.rejilla, ...escena.rejilla)
      gl.uniform1f(u.celda, data.celda)
      gl.uniform1f(u.lado, data.lado ?? 1)
      if (vista) gl.uniform1f(u.escala, escena.escala)
      if (encuadre) {
        for (const eje of ['ojo', 'frente', 'derecha', 'arriba', 'sol']) gl.uniform3fv(u[eje], encuadre[eje])
        gl.uniform2fv(u.centro, encuadre.centro)
        gl.uniform1f(u.focal, encuadre.focal)
      }
    })
    // Los cúmulos de la 404 están donde estaba el rollo, que acaba de moverse.
    if (escena.ultimos.forma) aplicar(escena, escena.ultimos.forma)
  }
  if (data.tipo === 'colores') {
    fijar(escena, (gl, u) => {
      gl.uniform3fv(u.luz, data.luz)
      gl.uniform3fv(u.sombra, data.sombra)
      if (data.borde) gl.uniform3fv(u.borde, data.borde)
      gl.uniform1f(u.alfa, data.alfa)
    })
  }
  if (data.tipo === 'forma' && escena.encuadre) {
    const cumulos = cumulosEnElMundo(escena, data.cumulos, data.valor)
    fijar(escena, (gl, u) => {
      gl.uniform1f(u.forma, data.valor)
      gl.uniform4fv(u.cumulos, cumulos)
    })
  }
}

// Los cúmulos del juego de la 404 llegan como los ve patos.js: centro y radio,
// en altos del lienzo. Se condensan donde estaba el rollo, a la hondura de su
// eje en su columna, y van a jugar a no más de `JUEGO` m (lib/volutus.js): la
// hondura va de una a la otra con la `forma`. Así, al volver, cada cúmulo
// llega a la distancia del rollo, con su tamaño y su bruma, y se funde en él.
function cumulosEnElMundo({ encuadre, gl }, enPantalla, forma) {
  const { ojo, frente, derecha, arriba, focal, centro } = encuadre
  const cumulos = new Float32Array(4 * (enPantalla.length / 3))
  for (let i = 0; i < enPantalla.length / 3; i++) {
    const [x, y, r] = Array.from(enPantalla.subarray(3 * i, 3 * i + 3), (v) => v * gl.canvas.height)
    if (r <= 0) continue
    const enRollo = rollo(encuadre, x)?.hondura ?? JUEGO
    const hondura = enRollo + (Math.min(enRollo, JUEGO) - enRollo) * forma
    const k = hondura / focal
    const punto = [0, 1, 2].map((e) => ojo[e] + hondura * frente[e] + (x - centro[0]) * k * derecha[e] - (y - centro[1]) * k * arriba[e])
    cumulos.set([...punto, r * k], 4 * i)
  }
  return cumulos
}

onmessage = ({ data }) => {
  if (data.tipo === 'montar') montar(data.id, data.lienzo, data.mar, data.perspectiva, data.ola)
  if (data.tipo === 'quieto') quieto = data.valor

  const escena = escenas.get(data.id)
  if (escena && ['medir', 'colores', 'forma'].includes(data.tipo)) aplicar(escena, data)
  if (escena && data.tipo === 'activa') escena.activa = data.valor
  if (escena?.ola && data.tipo === 'nace') escena.ola.nace ??= performance.now()
  // Sale en la mitad izquierda mirando a la derecha: ahí su primer globo cabe,
  // y lo dice apenas sale a flote. `desde` es cuándo empezó a hablar (`null`
  // si calla), `callo` cuándo terminó y `dicho`, el que sigue.
  if (escena?.mar && data.tipo === 'pato') {
    escena.pato = {
      lado: -0.2 - 0.4 * Math.random(),
      mira: 1,
      vuelta: 15,
      nace: null,
      desde: null,
      callo: -Infinity,
      dicho: 0,
    }
  }
  // El cursor es viento en el cielo.
  if (escena && data.tipo === 'cursor') {
    soplar(escena, data)
    return
  }

  // Cambiar el tamaño borra el lienzo, y quieto nadie más lo repinta: cualquier
  // mensaje despierta un fotograma.
  if (!marco) marco = cuadro(paso)
}
