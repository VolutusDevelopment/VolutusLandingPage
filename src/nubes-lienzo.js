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
 *   - `cielo`: una volutus, la nube en rollo que da nombre a la marca, en
 *     volumen de verdad y en perspectiva: entra enorme por la izquierda y se
 *     aleja en diagonal hacia el horizonte de la derecha, rodando sobre su
 *     eje. El lomo da al sol, levanta bultos y torres y se dora en el filo;
 *     el vientre queda en sombra. El cursor, o el dedo, es una flecha en el
 *     aire: la corta a su paso, deja una estela revuelta y la nube se vuelve a
 *     cerrar sola.
 *   - `mar`: el agua bajo la nube, mirada desde muy cerca de ella. Las olas
 *     llegan de frente con su física de verdad, rompen y dejan espuma, el sol
 *     brilla en ellas, y las crestas que pasan la altura de los ojos asoman
 *     sobre el horizonte. El cursor, o el dedo, toca el agua y deja anillos y
 *     estela, y al minuto sale a nadar un pato, que de rato en rato se
 *     detiene a provocar a quien mira, en un globo: «¿A QUE NO ME CAZAS?». La
 *     física y su shader viven en lib/mar.js.
 *
 * Los colores son tres, y cada vista los usa a su modo: `luz`, `sombra` y
 * `borde` (el filo dorado en el cielo, la espuma y los destellos en el mar).
 *
 * Recibe de la página (nubes.js) los lienzos, sus medidas, sus colores, si
 * están a la vista, por dónde pasa el cursor, cuándo sale el pato y, en el
 * juego de la 404, la forma del cielo; le devuelve `vivo` cuando un lienzo ya
 * tiene su primer fotograma y, en el mar, dónde va el pato.
 */

import { FUENTES, GLOBO, GLOBOS, MAR, OJOS, VAIVEN, VIDA, alAgua, alLienzo, camara, casco, flotar } from './lib/mar.js'
import { COLORES, FLOTACION, NADA } from './lib/pato.js'

// ~30 fps: las nubes se mueven lento y la mitad de fotogramas no se nota.
const INTERVALO = 33
// El instante que se congela con movimiento reducido: uno con nubes.
const QUIETO_EN = 4000
// El aire bajo la nube (ver `simular`). El paso de tiempo es fijo, el de un
// fotograma: con uno real, una pestaña que se atasca daría un salto enorme.
// Cada celda del fluido cubre 3×3 celdas de la trama. La presión se resuelve
// con 20 vueltas de Jacobi, que bastan para que el aire no se comprima a la
// vista. La ráfaga del cursor topa en `RAPIDEZ_MAXIMA` altos por segundo, así
// que un tirón brusco no revienta la simulación.
const DT = INTERVALO / 1000
const CELDAS_POR_AIRE = 3
const VUELTAS_DE_PRESION = 20
const RAPIDEZ_MAXIMA = 2
// Lo que toca el mar (ver lib/mar.js). El cursor deja un impulso cada
// `CADA_TOQUE` s mientras se mueve, y el pato uno cada `CADA_ESTELA` s, cada
// uno en su tramo de `fuentes`. Cada tramo dura lo que vive un anillo, así que
// un impulso nuevo solo pisa a uno que ya se apagó. La fuerza del cursor crece
// con su rapidez sobre el agua, hasta `RAPIDEZ_DEL_TOQUE` m/s; tocar sin
// arrastrar es una `GOTA`, y el pato al salir a flote, también. Más allá de
// `ALCANCE` m, los anillos no se verían.
const TOQUES = 18
const CADA_TOQUE = VIDA / TOQUES
const CADA_ESTELA = VIDA / (FUENTES - TOQUES)
const FUERZA_POR_RAPIDEZ = 0.01
const RAPIDEZ_DEL_TOQUE = 3
const GOTA = 0.05
const ESTELA = 0.005
const ALCANCE = 30
// El pato del mar nada a `NADO` m/s, con la línea de flotación al 45 % de la
// franja de agua, y sale a flote desde `HUNDIDO` m en `SALIDA` s. Habla
// `HABLA` s seguidos, y antes de volver a hablar nada al menos `CALLA` s.
const NADO = 0.3
const HUNDIDO = 0.35
const SALIDA = 0.9
const HABLA = 8
const CALLA = 10

const VERTICES = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

// El shader viaja tal cual al navegador —el minificador no entra en el
// texto—, así que sus explicaciones van aquí y no dentro:
//
//   - `PUNTO`: un círculo con borde suavizado de 1.5 px en el centro de su
//     celda. Lo usa `TRAMA`.
//   - Dos pasadas, en el cielo y en el mar. Recorrer la nube o el agua es
//     caro, así que no se calcula por píxel sino por celda: `CAMPO` (o `MAR`,
//     en lib/mar.js) pinta una textura con un texel por celda —color y
//     cobertura— y `TRAMA` dibuja con ella los puntos a resolución completa.
//     En el cielo todo va en altos del lienzo, para que la sección sea redonda
//     con cualquier proporción.
//   - `CAMPO`, la forma: un rollo en perspectiva. Entra enorme por la
//     izquierda, cerca de quien mira, y se aleja en diagonal hacia el
//     horizonte de la derecha, donde está el sol. `tubo` da, para cada x, la
//     distancia recorrida a lo largo del rollo, la altura del eje y el radio.
//     Radio y eje escalan con `f`, que es 1 en el borde izquierdo y se achica
//     hacia la derecha: el radio va de 0.4 altos a casi nada y el eje sube
//     hacia el 30 % del alto, así que todo converge como hacia un punto de
//     fuga. Pasados 2.1 altos (solo en pantallas muy anchas), `f` se queda en
//     un 15 %: más fino, el rollo sería un hilo y su ruido quedaría más apretado
//     que las celdas. La distancia a lo largo es la integral de 1/radio, así que los
//     bultos se achican con la lejanía igual que el grosor. En `densidad`,
//     `base` es 1 en el eje y 0 en la superficie, y encima va `borla`: ruido
//     3D con valor absoluto en cada octava —bultos redondos con pliegues
//     finos, la coliflor de un cúmulo—, que pesa en el lomo y más donde se
//     levantan `torres`.
//   - `ruido3` lee una textura de ruido 2D que genera este worker: su canal G
//     es el R desplazado (37, 17) por cada capa en z, así que una sola lectura
//     trae dos capas y basta mezclarlas. Es varias veces más barato que
//     calcular el azar de las ocho esquinas.
//   - El movimiento: el ruido se muestrea en un marco que gira sobre el eje
//     (`giro`, una vuelta cada ~70 s), así que la superficie rueda; deriva
//     despacio a lo largo, y cada octava se corre un poco más que la anterior,
//     así que los bultos hierven en vez de ser una textura pegada.
//   - Los cúmulos, solo en el juego de la 404 (patos.js): la volutus se
//     deshace en hasta diez nubes sueltas, `cumulos`, cada una con su centro
//     y su radio en altos. `forma` dice cuánto va: en 0 el shader no las mira
//     y en 1 no mira el rollo. En medio, el rollo se evapora mientras ellas se
//     condensan donde estaba y viajan a su lugar; el viaje lo lleva patos.js,
//     que le pasa las posiciones de cada fotograma. Cada cúmulo es un
//     elipsoide 1.6 veces más ancho que alto, con la base aplanada, y encima
//     la misma `borla` del rollo, con su propia semilla y corriendo en
//     profundidad: los bultos hierven en su sitio en vez de rodar. La luz es la
//     misma; lo que el rollo saca de su eje y su radio (`marco`), el cúmulo lo
//     saca de su centro y el suyo, así que la bruma aclara más a los chicos,
//     que se leen lejanos.
//   - La luz: el rayo de cada celda entra de frente (cámara ortográfica) y
//     cruza la nube en 28 pasos, de adelante hacia atrás, hasta que casi no
//     queda transmitancia. En cada paso, tres muestras hacia el sol —arriba a
//     la derecha y al frente, donde está el sol de la portada— dan la
//     profundidad óptica y con ella la luz directa (Beer-Lambert); el término
//     de polvo oscurece los bordes finos, que es lo que le dibuja el relieve a
//     cada bulto. La luz ambiente es mayor en el lomo que en el vientre. El
//     brillo resultante va de `sombra` a `luz`, y donde la nube es fina y le
//     da el sol se dora con `borde` (`oro`). Como la nube lejana se ve más
//     chica, las distancias hacia el sol y la opacidad de cada paso se miden
//     en su tamaño real (`escala`): si no, el tramo lejano saldría más
//     transparente y más oscuro. Además se aclara hacia `luz` con la
//     distancia, como la bruma del aire. La nube flota sola en el cielo,
//     así que termina donde termina: el vientre queda en su sombra, bien
//     definido. Los bordes del lienzo solo se desvanecen para no cortar en
//     seco una torre alta o un bulto que se asome.
//   - El viento: `CAMPO` lee en su celda el `estado` del aire (ver el fluido,
//     más abajo) y corre el rayo entero lo que el aire movió la nube; donde
//     entró aire seco, la adelgaza, con un ruido que le rompe el borde.
//   - El fluido: aire de verdad, en una rejilla chica, con *Stable Fluids*
//     (Stam, 1999) y *vorticity confinement* (Fedkiw, Stam y Jensen, 2001).
//     Las velocidades van en altos por segundo y las derivadas en celdas, que
//     da el mismo resultado salvo una escala, y la proyección no la ve. Cada
//     paso es una ley:
//       · `FUERZA`: el cursor empuja el aire a lo largo del tramo que recorrió
//         en el fotograma. El radio y la velocidad escalan con la `cercania`
//         de la nube bajo el cursor: el mismo soplo mueve remolinos grandes en
//         la parte cercana y chicos en la lejana, como visto de lejos.
//       · `ROTOR` y `CONFINA`: la vorticidad, y una fuerza que la devuelve a
//         los remolinos que la rejilla gruesa iría borrando. Así los bordes del
//         chorro se enrollan y un gesto rápido deja una estela turbulenta.
//       · `DIVERGENCIA`, `PRESION` y `GRADIENTE`: el aire no se comprime. Se
//         resuelve la presión y se le resta su gradiente a la velocidad: el
//         aire delante del cursor se aparta y lo rodea, y detrás se cierra.
//       · `ADVECCION`: el aire se lleva a sí mismo (semi-lagrangiana) y pierde
//         velocidad con la viscosidad, así que se calma solo.
//       · `ESTADO`: el aire se lleva lo que la nube guarda de él. En `rg` va
//         cuánto la movió, que se relaja hacia cero porque el frente de viento
//         que forma la volutus la vuelve a armar, y topa en 0.06 altos. En `b`
//         va el aire seco que la turbulencia mezcla dentro (*entrainment*):
//         nace donde el rotor es fuerte y se evapora en un segundo.
//   - `TRAMA`: cada píxel lee el texel de su celda y dibuja el punto, con el
//     área proporcional a la cobertura, como una trama de imprenta. En el mar
//     (`relleno`) pinta además el agua entre los puntos, con `sombra`: el alfa
//     del campo dice si la celda es agua (desde 0.5) o no (bajo 0.5), y encima
//     el área a 0.249 por unidad (ver `MAR` en lib/mar.js). El borde del agua
//     se suaviza entre las cuatro celdas vecinas, para que la silueta de una
//     cresta contra el cielo no salga escalonada.
const PUNTO = `
float punto(vec2 px, vec2 c, float r) {
  return 1.0 - smoothstep(r - 0.75, r + 0.75, length(px - c));
}`

// `cercania`: la escala de profundidad del rollo en cada x, en altos. 1 en el
// borde izquierdo, y a partir de `FONDO` se queda en un 15 %.
const PERSPECTIVA = `
const float FONDO = 2.1;
float cercania(float x) {
  return exp(-0.9 * min(x, FONDO));
}`

const CAMPO = `precision highp float;
uniform vec2 res;
uniform float t, celda, forma;
uniform vec3 luz, sombra, borde, cumulos[10];
uniform sampler2D ruido, estado;
${PERSPECTIVA}
float torres;
mat2 giro;
float ruido3(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  vec2 rg = texture2D(ruido, (i.xy + vec2(37.0, 17.0) * i.z + f.xy + 0.5) / 256.0).yx;
  return mix(rg.x, rg.y, f.z);
}
float borla(vec3 p, int octavas) {
  float v = 0.0, w = 0.5;
  for (int i = 0; i < 4; i++) {
    if (i == octavas) break;
    v += w * abs(ruido3(p + vec3(0.0, 0.0, t * 0.04 * float(i))) * 2.0 - 1.0);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    w *= 0.45;
  }
  return v;
}
vec3 tubo(float x) {
  float f = cercania(x);
  return vec3((1.0 / f - 1.0) / 0.36 + max(x - FONDO, 0.0) / (0.4 * f), 0.3 + 0.28 * f, 0.4 * f);
}
float rollo(vec3 p, int octavas) {
  vec3 e = tubo(p.x);
  vec2 d = vec2(p.y - e.y, p.z) / e.z;
  float base = 1.0 - length(d);
  if (base < -0.9) return 0.0;
  vec3 q = vec3(e.x + t * 0.04, giro * d) * 1.7;
  float relieve = mix(0.55, 1.1 * torres, smoothstep(0.2, -0.8, d.x));
  return clamp(2.0 * (base + (borla(q, octavas) - 0.35) * relieve), 0.0, 1.0);
}
float cumulo(vec3 p, int octavas) {
  float base = -1.0, semilla = 0.0;
  vec3 cerca = vec3(0.0);
  for (int i = 0; i < 10; i++) {
    vec3 c = cumulos[i];
    if (c.z <= 0.0) continue;
    vec3 local = vec3(p.xy - c.xy, p.z) / c.z;
    float b = 1.0 - length(vec3(local.x / 1.6, local.y * (local.y > 0.0 ? 1.8 : 1.0), local.z));
    if (b > base) {
      base = b;
      cerca = local;
      semilla = float(i);
    }
  }
  if (base < -0.9) return 0.0;
  vec3 q = cerca * 1.7 + vec3(semilla * 7.3, semilla * 3.1, t * 0.04);
  float relieve = mix(0.55, 1.1 * torres, smoothstep(0.2, -0.8, cerca.y));
  return clamp(2.0 * (base + (borla(q, octavas) - 0.35) * relieve), 0.0, 1.0);
}
float densidad(vec3 p, int octavas) {
  float rho = 0.0;
  if (forma < 1.0) rho = rollo(p, octavas) * (1.0 - smoothstep(0.1, 0.6, forma));
  if (forma > 0.0) rho = max(rho, cumulo(p, octavas) * smoothstep(0.0, 0.3, forma));
  return rho;
}
void main() {
  vec2 p = (floor(gl_FragCoord.xy) + 0.5) * celda / res.y;
  giro = mat2(cos(t * 0.09), sin(t * 0.09), -sin(t * 0.09), cos(t * 0.09));
  vec3 aire = texture2D(estado, p * vec2(res.y / res.x, 1.0)).xyz;
  p -= aire.xy;
  float abre = exp(-3.0 * aire.z * (0.4 + ruido3(vec3(p * 14.0, t * 0.5))));
  vec3 e = tubo(p.x);
  vec2 marco = vec2(p.y - e.y, e.z);
  float cuerda = forma < 1.0 ? 3.0 * e.z * e.z - marco.x * marco.x : 0.0;
  if (forma > 0.0) {
    vec2 nube = marco;
    float mejor = -1e9;
    for (int i = 0; i < 10; i++) {
      vec3 c = cumulos[i];
      if (c.z <= 0.0) continue;
      vec2 d = vec2((p.x - c.x) / 1.6, p.y - c.y);
      float suya = 3.0 * c.z * c.z - dot(d, d);
      cuerda = max(cuerda, suya);
      if (suya / (c.z * c.z) > mejor) {
        mejor = suya / (c.z * c.z);
        nube = vec2(p.y - c.y, c.z);
      }
    }
    marco = mix(marco, nube, forma);
  }
  if (cuerda <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }
  torres = 0.6 + 0.8 * ruido3(vec3(e.x * 0.6 + t * 0.02, 4.0, 7.0));
  float escala = marco.y / 0.3;
  vec3 sol = normalize(vec3(0.55, -0.75, 0.25)) * escala;
  float z = sqrt(cuerda), dz = 2.0 * z / 28.0;
  float transmite = 1.0, brillo = 0.0, oro = 0.0;
  for (int i = 0; i < 28; i++) {
    vec3 muestra = vec3(p, z - (float(i) + 0.5) * dz);
    float rho = densidad(muestra, 4) * abre;
    if (rho > 0.01) {
      float hondo = 0.0, lejos = 0.04, tramo = 0.04;
      for (int j = 0; j < 3; j++) {
        hondo += tramo * densidad(muestra + sol * lejos, 2) * abre;
        tramo = 2.0 * lejos;
        lejos *= 3.0;
      }
      float directa = exp(-18.0 * hondo);
      float ambiente = mix(0.12, 0.45, smoothstep(0.4, -0.8, marco.x / marco.y));
      float opacidad = 1.0 - exp(-60.0 * rho * dz / escala);
      brillo += transmite * opacidad * (ambiente + 1.3 * directa * (1.0 - exp(-6.0 * rho)));
      oro += transmite * opacidad * directa * (1.0 - smoothstep(0.0, 0.4, rho));
      transmite *= 1.0 - opacidad;
      if (transmite < 0.02) break;
    }
  }
  float cubre = max(1.0 - transmite, 1e-3);
  vec3 color = mix(sombra, luz, smoothstep(0.15, 1.3, brillo / cubre));
  color = mix(color, borde, 0.8 * clamp(oro / cubre, 0.0, 1.0) * (1.0 - smoothstep(0.2, 0.8, cubre)));
  color = mix(color, luz, 0.35 * (1.0 - marco.y / 0.4));
  gl_FragColor = vec4(color, (1.0 - transmite) * smoothstep(0.0, 0.1, p.y) * (1.0 - smoothstep(0.93, 1.0, p.y)));
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

// El fluido, una pasada por ley (ver arriba). `en` lee la celda vecina.
const MALLA = `precision highp float;
uniform vec2 malla;
uniform float dt;
uniform sampler2D uno, dos, tres;
vec4 en(sampler2D s, float x, float y) {
  return texture2D(s, (gl_FragCoord.xy + vec2(x, y)) / malla);
}`

const FUERZA = `${MALLA}
${PERSPECTIVA}
uniform vec4 tramo;
uniform vec2 empuje;
void main() {
  vec2 p = gl_FragCoord.xy / malla.y, a = tramo.xy, ab = tramo.zw - a;
  vec2 d = p - a - ab * clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  float f = cercania(tramo.z), r = max(0.03 * f, 1.5 / malla.y);
  gl_FragColor = vec4(en(uno, 0.0, 0.0).xy + 0.4 * f * empuje * exp(-dot(d, d) / (r * r)), 0.0, 1.0);
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
  gl_FragColor = vec4(en(uno, 0.0, 0.0).xy + dt * 6.0 * en(dos, 0.0, 0.0).x * vec2(n.x, -n.y), 0.0, 1.0);
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

// `atras`: de dónde vino, hace un paso, el aire de esta celda. Las velocidades
// van en altos por segundo y la textura mide `malla.x / malla.y` altos de ancho.
const ATRAS = `${MALLA}
vec2 atras() {
  return gl_FragCoord.xy / malla - dt * en(uno, 0.0, 0.0).xy * malla.y / malla;
}`

const ADVECCION = `${ATRAS}
void main() {
  gl_FragColor = vec4(texture2D(uno, atras()).xy * exp(-dt / 0.8), 0.0, 1.0);
}`

const ESTADO = `${ATRAS}
void main() {
  vec3 antes = texture2D(dos, atras()).xyz;
  vec2 movio = (antes.xy + dt * en(uno, 0.0, 0.0).xy) * exp(-dt / 2.5);
  movio *= min(1.0, 0.06 / (length(movio) + 1e-6));
  float seco = antes.z * exp(-dt) + dt * 4.0 * abs(en(tres, 0.0, 0.0).x);
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
  'estado', 'forma', 'cumulos', 'camara', 'escala', 'nado', 'fuentes', 'pato', 'globo', 'dice',
]
const UNIFORMS_DEL_AIRE = ['malla', 'dt', 'uno', 'dos', 'tres', 'tramo', 'empuje']

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
function montarAire(gl) {
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

  const fuentes = { FUERZA, ROTOR, CONFINA, DIVERGENCIA, PRESION, GRADIENTE, ADVECCION, ESTADO }
  const programas = {}
  for (const [nombre, fuente] of Object.entries(fuentes)) {
    const u = compilar(gl, fuente, UNIFORMS_DEL_AIRE)
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
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ancho, filas.length, 0, gl.RGBA, gl.UNSIGNED_BYTE, datos)
  for (const [clave, valor] of [
    [gl.TEXTURE_MIN_FILTER, gl.NEAREST],
    [gl.TEXTURE_MAG_FILTER, gl.NEAREST],
    [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
  ]) {
    gl.texParameteri(gl.TEXTURE_2D, clave, valor)
  }
}

function montar(id, lienzo, mar) {
  // `failIfMajorPerformanceCaveat`: sin GPU de verdad el navegador pinta
  // WebGL por software y cada fotograma cuesta CPU que la persona necesita
  // para otra cosa. En ese caso no hay nubes: son decoración.
  const gl = lienzo.getContext('webgl', {
    antialias: false,
    powerPreference: 'low-power',
    failIfMajorPerformanceCaveat: true,
  })
  const programas = gl && [compilar(gl, mar ? MAR : CAMPO), compilar(gl, TRAMA)]
  if (!programas || programas.includes(null)) return

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  // Un triángulo que cubre todo el lienzo: sin costura en la diagonal.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  const [campo, trama] = programas
  texturaDeRuido(gl)
  gl.activeTexture(gl.TEXTURE1)
  const escena = { id, gl, programas, mar, activa: false, vivo: false, campo: lamina(gl, gl.UNSIGNED_BYTE, gl.NEAREST) }
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
    escena.fuentes = new Float32Array(4 * FUENTES)
    escena.toques = { desde: 0, cuantos: TOQUES, siguiente: 0, ultimo: null }
    escena.estela = { desde: TOQUES, cuantos: FUENTES - TOQUES, siguiente: 0 }
    escena.pato = null
  } else {
    gl.uniform1i(campo.estado, 2)
    escena.aire = montarAire(gl)
    escena.previo = null
    escena.tramo = null
  }
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

// Los segundos del reloj de los shaders, el `t` de cada fotograma.
const reloj = () => (performance.now() - inicio) / 1000

// Un impulso en el agua, en el lugar que le toca dentro de su tramo de
// `fuentes`.
function impulso(escena, tramo, { x, z }, fuerza, t) {
  escena.fuentes.set([x, z, t, fuerza], 4 * (tramo.desde + tramo.siguiente))
  tramo.siguiente = (tramo.siguiente + 1) % tramo.cuantos
}

// El cursor sobre el mar: donde su rayo toca el agua deja un impulso cada
// `CADA_TOQUE` s mientras se mueve, con la fuerza de su rapidez, y una gota al
// tocar. Quieto, no mueve nada.
function tocar(escena, { x, y, fuera, gota }) {
  const { toques } = escena
  const punto = !fuera && !quieto && escena.camara && alAgua(escena.camara, x, y)
  if (!punto || Math.hypot(punto.x, punto.z) > ALCANCE) {
    toques.ultimo = null
    return
  }
  const t = reloj()
  if (gota) impulso(escena, toques, punto, GOTA, t)
  const { ultimo } = toques
  if (ultimo && t - ultimo.t < CADA_TOQUE) return
  if (ultimo) {
    const rapidez = Math.hypot(punto.x - ultimo.x, punto.z - ultimo.z) / (t - ultimo.t)
    impulso(escena, toques, punto, FUERZA_POR_RAPIDEZ * Math.min(rapidez, RAPIDEZ_DEL_TOQUE), t)
  }
  toques.ultimo = { ...punto, t }
}

// Un paso del pato del mar. Nada a lo ancho y da la vuelta antes de salir de
// cuadro, o cuando se le antoja, cada 10 a 20 s. Flota donde lo lleva el agua
// (`flotar`) y, la primera vez que se pinta, sale a flote desde abajo con una
// gota. Ya fuera, cada vez que lleva `CALLA` s callado y su globo cabe a su
// derecha, se detiene, mira hacia allá y dice el dicho que sigue. Quieto, su
// lugar de reposo no cambia, y el globo cabe aunque el agua lo corra de lado
// todo lo que puede (`VAIVEN`). Le dice al shader dónde va su esquina, en
// celdas, hacia dónde mira, a qué distancia está y qué dice (ver `MAR`), y a
// la página dónde va, para que su enlace lo siga.
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
  if (t === pato.nace || t - pato.estela >= CADA_ESTELA) {
    impulso(escena, escena.estela, lugar, t === pato.nace ? GOTA : ESTELA, t)
    pato.estela = t
  }
  const [x, y] = alLienzo(vista, lugar)
  const esquina = [Math.round(x / celda) - FLOTACION[0], Math.round(y / celda) - FLOTACION[1]]
  gl.uniform4f(programas[0].nado, ...esquina, pato.mira, Math.hypot(lugar.x, lugar.z))
  gl.uniform1f(programas[0].dice, pato.desde === null ? 0 : pato.dicho + 1)
  postMessage({ tipo: 'pato', id: escena.id, x: esquina[0] * celda, y: esquina[1] * celda, visible: salida === 1 })
}

// Un paso del aire (ver el fluido, arriba). La velocidad del gesto es su
// tramo sobre lo que tardó, entre 1/60 y 0.1 s: si el cursor estuvo quieto y
// de pronto se mueve, cuenta el movimiento y no la espera. Se gira al azar
// unos grados: un flujo perfectamente simétrico no desprende remolinos, y en
// el aire real nada lo es.
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
  gl.viewport(0, 0, ...aire.malla)

  if (tramo?.hasta) {
    const { desde, hasta } = tramo
    const alto = gl.canvas.height
    const segundos = Math.min(Math.max((hasta.t - desde.t) / 1000, 1 / 60), 0.1)
    const vx = (hasta.x - desde.x) / alto / segundos
    const vy = (hasta.y - desde.y) / alto / segundos
    const tope = Math.min(1, RAPIDEZ_MAXIMA / (Math.hypot(vx, vy) || 1))
    const giro = (Math.random() - 0.5) * 0.3
    gl.useProgram(p.FUERZA.programa)
    gl.uniform4f(p.FUERZA.tramo, desde.x / alto, desde.y / alto, hasta.x / alto, hasta.y / alto)
    gl.uniform2f(
      p.FUERZA.empuje,
      tope * (vx * Math.cos(giro) - vy * Math.sin(giro)),
      tope * (vx * Math.sin(giro) + vy * Math.cos(giro)),
    )
    pasada(p.FUERZA, velocidad[1], velocidad[0])
    velocidad.reverse()
    escena.tramo = null
  }

  pasada(p.ROTOR, aire.rotor, velocidad[0])
  pasada(p.CONFINA, velocidad[1], velocidad[0], aire.rotor)
  velocidad.reverse()
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

  gl.activeTexture(gl.TEXTURE2)
  gl.bindTexture(gl.TEXTURE_2D, estado[0].textura)
}

function pintar(escena, ahora) {
  const { gl, programas: [campo, trama] } = escena
  const t = (ahora - inicio) / 1000
  if (escena.aire && !quieto) simular(escena)
  gl.useProgram(campo.programa)
  gl.uniform1f(campo.t, t)
  if (escena.mar) {
    // Quien mira va en un bote que sube y baja con la marejada (lib/mar.js).
    const vista = escena.camara
    vista.ojos = OJOS + casco(t)
    gl.uniform3f(campo.camara, vista.focal, vista.horizonte, vista.ojos)
    if (escena.pato) nadar(escena, t)
    gl.uniform4fv(campo.fuentes, escena.fuentes)
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
  const activas = [...escenas.values()].filter((e) => e.activa)
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

onmessage = ({ data }) => {
  if (data.tipo === 'montar') montar(data.id, data.lienzo, data.mar)
  if (data.tipo === 'quieto') quieto = data.valor

  const escena = escenas.get(data.id)
  if (escena && data.tipo === 'medir') {
    const { gl } = escena
    gl.canvas.width = data.ancho
    gl.canvas.height = data.alto
    escena.rejilla = [Math.ceil(data.ancho / data.celda), Math.ceil(data.alto / data.celda)]
    gl.activeTexture(gl.TEXTURE1)
    dimensionar(gl, escena.campo, ...escena.rejilla)
    // El mar mira con una cámara a la medida del lienzo (lib/mar.js), que se
    // fija en cada fotograma. `escala` es la del detalle de las olas.
    const vista = escena.mar && camara(data.ancho, data.alto)
    if (vista) Object.assign(escena, { camara: vista, celda: data.celda, escala: (vista.focal * OJOS) / data.celda })
    const { aire } = escena
    if (aire) {
      // Celdas cuadradas: el ancho en celdas es el alto por la proporción.
      const alto = Math.max(8, Math.round(escena.rejilla[1] / CELDAS_POR_AIRE))
      aire.malla = [Math.max(8, Math.round((alto * data.ancho) / data.alto)), alto]
      gl.activeTexture(gl.TEXTURE2)
      for (const hoja of laminasDelAire(aire)) dimensionar(gl, hoja, ...aire.malla)
      gl.bindTexture(gl.TEXTURE_2D, aire.estado[0].textura)
      for (const u of Object.values(aire.programas)) {
        gl.useProgram(u.programa)
        gl.uniform2f(u.malla, ...aire.malla)
      }
    }
    gl.viewport(0, 0, data.ancho, data.alto)
    fijar(escena, (gl, u) => {
      gl.uniform2f(u.res, data.ancho, data.alto)
      gl.uniform2f(u.rejilla, ...escena.rejilla)
      gl.uniform1f(u.celda, data.celda)
      if (vista) gl.uniform1f(u.escala, escena.escala)
    })
  }
  if (escena && data.tipo === 'colores') {
    fijar(escena, (gl, u) => {
      gl.uniform3fv(u.luz, data.luz)
      gl.uniform3fv(u.sombra, data.sombra)
      gl.uniform3fv(u.borde, data.borde)
      gl.uniform1f(u.alfa, data.alfa)
    })
  }
  if (escena && data.tipo === 'forma') {
    fijar(escena, (gl, u) => {
      gl.uniform1f(u.forma, data.valor)
      gl.uniform3fv(u.cumulos, data.cumulos)
    })
  }
  if (escena && data.tipo === 'activa') escena.activa = data.valor
  // Sale en la mitad izquierda mirando a la derecha: ahí su primer globo cabe,
  // y lo dice apenas sale a flote. `desde` es cuándo empezó a hablar (`null`
  // si calla), `callo` cuándo terminó y `dicho`, el que sigue.
  if (escena?.mar && data.tipo === 'pato') {
    escena.pato = {
      lado: -0.2 - 0.4 * Math.random(),
      mira: 1,
      vuelta: 15,
      nace: null,
      estela: 0,
      desde: null,
      callo: -Infinity,
      dicho: 0,
    }
  }
  // El cursor es viento en el cielo, y en el mar toca el agua.
  if (escena && data.tipo === 'cursor') {
    if (escena.mar) tocar(escena, data)
    else soplar(escena, data)
    return
  }

  // Cambiar el tamaño borra el lienzo, y quieto nadie más lo repinta: cualquier
  // mensaje despierta un fotograma.
  if (!marco) marco = cuadro(paso)
}
