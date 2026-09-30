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
 *     volumen de verdad. La cabeza, enorme y redonda, a la izquierda del
 *     centro; el cuerpo cruza el lienzo y sale por la derecha, rodando sobre
 *     su eje. El lomo da al sol, levanta bultos y torres y se dora en el filo;
 *     el vientre queda en sombra. El cursor es viento: la abre a su paso, deja
 *     remolinos detrás y la nube se vuelve a cerrar sola.
 *   - `mar`: el agua bajo la nube, con el horizonte arriba. Las olas ruedan
 *     hacia el frente, la espuma asoma en las crestas, la luz deja su reflejo
 *     al centro y las sombras de las nubes pasan por encima.
 *
 * Los colores son tres, y cada vista los usa a su modo: `luz`, `sombra` y
 * `borde` (el filo dorado en el cielo, la espuma en el mar).
 *
 * Recibe de la página (nubes.js) los lienzos, sus medidas, sus colores, si
 * están a la vista y por dónde pasa el cursor; le devuelve `vivo` cuando un lienzo ya tiene su primer
 * fotograma.
 */

// ~30 fps: las nubes se mueven lento y la mitad de fotogramas no se nota.
const INTERVALO = 33
// El instante que se congela con movimiento reducido: uno con nubes.
const QUIETO_EN = 4000
// El rastro del cursor: los últimos tramos que recorrió y cada cuánto entra
// uno nuevo. 12 tramos de 80 ms guardan un segundo de camino, y a esa edad el
// viento ya casi se calmó: el tramo que se pisa no deja un salto.
const TRAMOS = 12
const CADA_TRAMO = 80

const VERTICES = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

// El shader viaja tal cual al navegador —el minificador no entra en el
// texto—, así que sus explicaciones van aquí y no dentro:
//
//   - `ruido`: ruido de valor en 2D, el del mar.
//   - `PUNTO`: un círculo con borde suavizado de 1.5 px en el centro de su
//     celda. Lo usan el mar y la trama del cielo.
//   - Cielo, en dos pasadas. La nube es un volumen y recorrerlo es caro, así
//     que no se calcula por píxel sino por celda: `CAMPO` pinta una textura
//     con un texel por celda (color y cobertura) y `TRAMA` dibuja con ella los
//     puntos a resolución completa. Todo va en altos del lienzo, para que la
//     cabeza sea redonda con cualquier proporción.
//   - `CAMPO`, la forma: `tubo` da, para cada x, lo que sobra de la cabeza,
//     la altura del eje y el radio. Es un tubo con cabeza semiesférica, de
//     radio 0.3 altos que crece un cuarto hacia la derecha —el cuerpo se
//     acerca y sale del cuadro—, con el eje al 55 % del alto. La cabeza queda
//     a un décimo del ancho de su borde: en un lienzo ancho la nube cubre casi
//     todo, como la base que es, y en uno angosto sigue entera. En
//     `densidad`, `base` es 1 en el eje y 0 en la superficie, y encima va
//     `borla`: ruido 3D con valor absoluto en cada octava —bultos redondos con
//     pliegues finos, la coliflor de un cúmulo—, que pesa en el lomo, más
//     donde se levantan `torres`, y se calma en la punta para que la cabeza se
//     lea redonda.
//   - `ruido3` lee una textura de ruido 2D que genera este worker: su canal G
//     es el R desplazado (37, 17) por cada capa en z, así que una sola lectura
//     trae dos capas y basta mezclarlas. Es varias veces más barato que
//     calcular el azar de las ocho esquinas.
//   - El movimiento: el ruido se muestrea en un marco que gira sobre el eje
//     (`giro`, una vuelta cada ~70 s), así que la superficie rueda; deriva
//     despacio a lo largo, y cada octava se corre un poco más que la anterior,
//     así que los bultos hierven en vez de ser una textura pegada.
//   - La luz: el rayo de cada celda entra de frente (cámara ortográfica) y
//     cruza la nube en 28 pasos, de adelante hacia atrás, hasta que casi no
//     queda transmitancia. En cada paso, tres muestras hacia el sol —arriba a
//     la derecha y al frente, donde está el sol de la portada— dan la
//     profundidad óptica y con ella la luz directa (Beer-Lambert); el término
//     de polvo oscurece los bordes finos, que es lo que le dibuja el relieve a
//     cada bulto. La luz ambiente es mayor en el lomo que en el vientre. El
//     brillo resultante va de `sombra` a `luz`, y donde la nube es fina y le
//     da el sol se dora con `borde` (`oro`). Hacia el borde de abajo la nube
//     se vuelve bruma: se aclara hacia `luz` y se desvanece, así que su base
//     se funde con el blanco de la página en vez de terminar en un vientre
//     oscuro. Hacia el de arriba solo se desvanece, para que el lienzo no
//     corte en seco las torres más altas.
//   - El viento del cursor: `tramos` son los últimos tramos que recorrió, en
//     px del lienzo, y `edades` su edad y lo que duraron. Cada tramo empuja la
//     nube en su dirección, la hace girar a cada lado —un par de remolinos que
//     se abren tras el cursor— y le quita densidad donde pasó (`hueco`). Es un
//     roce, no un golpe: la velocidad se satura (`v / (1 + |v|)`), así que un
//     gesto brusco no arrastra más que uno firme, el alcance es de unos pocos
//     centésimos del alto y la densidad baja a lo sumo a la mitad. Todo se
//     apaga con la edad y se ensancha, como aire que se aquieta. Depende
//     solo de la posición en pantalla, así que se calcula una vez por celda y
//     desplaza el rayo entero.
//   - `TRAMA`: cada píxel lee el texel de su celda y dibuja el punto, con el
//     área proporcional a la cobertura, como una trama de imprenta.
//   - Mar: `y` va de 0 en el horizonte (arriba) a 1 en el borde de abajo, y
//     cerca del horizonte todo se apaga. El plano está en perspectiva, con
//     la distancia `z` creciendo hacia el horizonte. A lo ancho, `x` se
//     comprime suave en los extremos, como una foto panorámica: el pie mide
//     5 o 6 veces su alto, y sin eso los costados se miran a más de 60°,
//     donde las olas que vienen de frente se ven de perfil y barren de lado.
//     En móvil casi no actúa; en los extremos de una pantalla ancha, las olas
//     salen el doble de anchas. `lejos` lleva un punto
//     del rayo a la escala de las olas y las agranda con la distancia: en el
//     borde de abajo no cambian y al fondo visible miden más del doble. Con
//     la perspectiva sola, el fondo quedaba en olas de pocos puntos que se
//     arrastraban a 2 o 3 px/s, y todo el movimiento se juntaba abajo y en
//     los costados; más largas, las del fondo se ven y, como su fase avanza
//     al mismo ritmo, corren más, como la mar de fondo. Es altamar, así que
//     manda la `marejada`: tres trenes de olas largas, cada uno con su rumbo,
//     que se cruzan y ruedan hacia el frente; los más largos van más lento,
//     como en agua honda. Cada tren es `1 - |sen|`, con la punta apenas
//     redondeada: cresta aguda y valle ancho, y donde dos crestas se cruzan
//     sale un pico.
//     Un seno tuerce el dominio para que las crestas no sean rectas. Sin más,
//     el dibujo solo se desplazaría y el ojo lo adivina; el mar no se repite.
//     Dos ruidos lentos lo impiden, y se leen una vez por punto, en `plano`
//     —donde el rayo tocaría el agua quieta—, no en cada paso de la marcha:
//     varían tan despacio que da igual. `desfase` corre la fase de cada tren
//     por su cuenta y con su propia deriva, así que las crestas se doblan, se
//     adelantan o se atrasan, y los picos nacen y se deshacen donde los trenes
//     se cruzan. `altura` va por grupos: tramos de mar más gruesa que avanzan
//     más lento que las crestas, que los atraviesan creciendo y apagándose.
//     Para que los picos tapen lo que tienen detrás, el rayo de cada punto se
//     marcha contra el relieve —16 pasos entre la altura de la cresta más alta
//     y el nivel del mar, `baja` es lo que el rayo desciende por unidad de
//     distancia— y el cruce se afina interpolando. `roce` es lo rasante que el
//     rayo pega en el agua, con la normal del relieve: la cara que mira de
//     frente refleja poco y queda honda; el lomo y el agua lejana, vistos de
//     canto, reflejan el cielo y se aclaran. Se mide como si cada columna
//     mirara al frente: con el rayo de verdad, los costados de una pantalla
//     ancha se ven tan de canto que el reflejo satura, todos los puntos salen
//     claros y la ola que pasa no los cambia. Encima va el picado del viento:
//     `ola` es una octava de crestas agudas con el dominio torcido por el
//     ruido para que no se lea como una rejilla, y `olas` suma tres, cada una
//     más fina, en dos trenes que avanzan con la marejada —si fueran uno
//     contra el otro, el agua temblaría en su sitio, como una piscina—. La
//     escala del picado es el doble de apretada en profundidad que a lo
//     ancho: vistas a ras, las olas son más anchas que altas, y es más fuerte
//     en las crestas que en los valles; la marejada lo arrastra adelante y
//     atrás al pasar, en vez de dejarlo deslizarse parejo. `cara` es su
//     pendiente hacia el horizonte y le da el grano a cada cara. La luz de
//     `roce` topa antes del blanco: el agua es azul y solo el picado sobre las
//     crestas llega a espuma. El reflejo es una franja central donde las
//     crestas brillan, y encima pasan, grandes y lentas, las sombras de las
//     nubes.
const PUNTO = `
float punto(vec2 px, vec2 c, float r) {
  return 1.0 - smoothstep(r - 0.75, r + 0.75, length(px - c));
}`

const MAR = `precision highp float;
uniform vec2 res;
uniform float t, celda, alfa;
uniform vec3 luz, sombra, borde;
${PUNTO}
float azar(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(azar(i), azar(i + vec2(1, 0)), f.x), mix(azar(i + vec2(0, 1)), azar(i + 1.0), f.x), f.y);
}
float ola(vec2 p, float picado) {
  p += 2.0 * ruido(p);
  vec2 v = 1.0 - abs(sin(p));
  v = mix(v, abs(cos(p)), v);
  return pow(1.0 - pow(v.x * v.y, 0.65), picado);
}
float olas(vec2 p, float avance) {
  float h = 0.0, w = 1.0, picado = 4.0;
  for (int i = 0; i < 3; i++) {
    h += w * (ola(p + avance * vec2(-0.3, 1.0), picado) + ola(p + avance * vec2(0.4, 1.4), picado));
    p = mat2(1.6, 1.2, -1.2, 1.6) * p;
    w *= 0.3;
    picado = mix(picado, 1.0, 0.2);
  }
  return h;
}
float marejada(vec2 q, float t, vec3 desfase) {
  q += 0.25 * sin(q.yx * vec2(2.1, 1.3) + t * 0.2);
  vec3 f = vec3(dot(q, vec2(0.5, 1.0)) * 5.0, dot(q, vec2(-0.6, 1.0)) * 6.5, dot(q, vec2(0.1, 1.0)) * 9.0) + t * vec3(0.8, 0.9, 1.1) + desfase;
  vec3 s = sin(f * 0.5);
  s = 1.0 - sqrt(s * s + 0.04);
  return dot(s * s, vec3(1.0, 0.8, 0.5)) / 2.3;
}
vec2 lejos(float x, float z) {
  return vec2(x, 1.6) * z * 1.54 / (1.0 + 0.6 * z);
}
void main() {
  vec2 px = vec2(gl_FragCoord.x, res.y - gl_FragCoord.y);
  vec2 c = (floor(px / celda) + 0.5) * celda;
  float y = c.y / res.y;
  float x = (c.x - res.x * 0.5) / res.y;
  x /= sqrt(1.0 + x * x / 12.25);
  float baja = y + 0.1;
  vec2 plano = lejos(x, 1.0 / baja);
  float altura = 0.38 * (0.75 + 0.55 * smoothstep(0.2, 0.8, ruido(0.4 * plano + vec2(0.016, 0.08) * t)));
  vec3 desfase = 4.5 * vec3(
    ruido(0.5 * plano + vec2(0.05, 0.11) * t),
    ruido(0.5 * plano + vec2(-0.09, 0.07) * t + 7.0),
    ruido(0.7 * plano + vec2(0.02, -0.08) * t + 13.0));
  float z = (1.0 - altura) / baja, paso = altura / baja / 16.0;
  float antes = 1.0 - baja * z - altura * marejada(lejos(x, z), t, desfase);
  for (int i = 0; i < 16; i++) {
    float d = 1.0 - baja * (z + paso) - altura * marejada(lejos(x, z + paso), t, desfase);
    if (d < 0.0) { z += paso * antes / (antes - d); break; }
    z += paso;
    antes = d;
  }
  vec2 q = lejos(x, z);
  float fondo = marejada(q, t, desfase);
  vec2 pendiente = altura * vec2(1.0, 1.6) * (vec2(marejada(q + vec2(0.02, 0.0), t, desfase), marejada(q + vec2(0.0, 0.02), t, desfase)) - fondo) / 0.02;
  float roce = 1.0 - dot(normalize(vec3(-pendiente.x, 1.0, -pendiente.y)), normalize(vec3(0.0, baja, -1.0)));
  vec2 p = q * vec2(7.0, 14.0) + vec2(0.0, 1.5 * fondo);
  float h = olas(p, t * 0.3);
  float cara = h - olas(p + vec2(0.0, 0.3), t * 0.3);
  float alto = clamp(0.15 + 0.57 * smoothstep(0.05, 0.6, roce) + mix(0.6, 1.0, fondo) * (0.25 * (h - 1.0) + 0.4 * cara), 0.0, 1.0);
  float nubada = smoothstep(0.55, 0.75, ruido(vec2(q.x * 0.6 + t * 0.12, q.y * 0.4)));
  float reflejo = (1.0 - smoothstep(0.0, 0.1 + 0.2 * y, abs(c.x / res.x - 0.5))) * (1.0 - nubada);
  vec3 color = mix(sombra, luz, smoothstep(0.2, 0.7, alto));
  color = mix(color, borde, max(smoothstep(0.78, 0.95, alto), reflejo * smoothstep(0.55, 0.8, alto)));
  color = mix(color, sombra, 0.6 * nubada);
  float r = celda * 0.5 * mix(0.15, 1.0, alto) * mix(0.5, 1.0, y) * (1.0 - 0.3 * nubada);
  float a = alfa * smoothstep(0.0, 0.2, y) * punto(px, c, r);
  gl_FragColor = vec4(color * a, a);
}`

const CAMPO = `precision highp float;
uniform vec2 res;
uniform float t, celda;
uniform vec3 luz, sombra, borde;
uniform sampler2D ruido;
uniform vec4 tramos[${TRAMOS}];
uniform vec2 edades[${TRAMOS}];
float ancho, cabeza, torres;
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
  float k = clamp((x - cabeza) / (ancho - cabeza), 0.0, 1.0);
  return vec3(min(x - cabeza, 0.0), 0.55 - 0.05 * k, 0.3 + 0.075 * k);
}
float densidad(vec3 p, int octavas) {
  vec3 e = tubo(p.x);
  vec3 d = vec3(e.x, p.y - e.y, p.z) / e.z;
  float base = 1.0 - length(d);
  if (base < -0.9) return 0.0;
  vec3 q = vec3(p.x / 0.3 + t * 0.04, giro * d.yz) * 1.7;
  float relieve = mix(0.55, 1.1 * torres, smoothstep(0.2, -0.8, d.y)) * mix(0.5, 1.0, smoothstep(-1.0, -0.3, d.x));
  return clamp(2.0 * (base + (borla(q, octavas) - 0.35) * relieve), 0.0, 1.0);
}
void main() {
  vec2 p = (floor(gl_FragCoord.xy) + 0.5) * celda / res.y;
  ancho = res.x / res.y;
  cabeza = 0.3 + 0.1 * ancho;
  giro = mat2(cos(t * 0.09), sin(t * 0.09), -sin(t * 0.09), cos(t * 0.09));
  vec2 viento = vec2(0.0);
  float hueco = 0.0;
  for (int i = 0; i < ${TRAMOS}; i++) {
    vec2 edad = edades[i];
    if (edad.x > 3.0) continue;
    vec2 a = tramos[i].xy / res.y, ab = tramos[i].zw / res.y - a;
    vec2 v = ab / edad.y;
    v /= 1.0 + length(v);
    vec2 dp = p - a - ab * clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
    float alcance = 0.03 + 0.025 * edad.x;
    float g = exp(-dot(dp, dp) / (alcance * alcance) - edad.x / 0.5);
    viento += g * (0.04 * v + 0.03 * vec2(-dp.y, dp.x) * (dp.x * v.y - dp.y * v.x) / (alcance * alcance));
    hueco += g * 0.35 * length(v);
  }
  p -= viento;
  float abre = exp(-1.2 * hueco * (0.5 + ruido3(vec3(p * 14.0, t * 0.5))));
  vec3 e = tubo(p.x);
  vec2 d = vec2(e.x, p.y - e.y);
  float cuerda = 3.0 * e.z * e.z - dot(d, d);
  if (cuerda <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }
  torres = 0.6 + 0.8 * ruido3(vec3(p.x * 2.0 + t * 0.02, 4.0, 7.0));
  vec3 sol = normalize(vec3(0.55, -0.75, 0.25));
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
      float ambiente = mix(0.12, 0.45, smoothstep(0.4, -0.8, d.y / e.z));
      float opacidad = 1.0 - exp(-60.0 * rho * dz);
      brillo += transmite * opacidad * (ambiente + 1.3 * directa * (1.0 - exp(-6.0 * rho)));
      oro += transmite * opacidad * directa * (1.0 - smoothstep(0.0, 0.4, rho));
      transmite *= 1.0 - opacidad;
      if (transmite < 0.02) break;
    }
  }
  float cubre = max(1.0 - transmite, 1e-3);
  vec3 color = mix(sombra, luz, smoothstep(0.15, 1.3, brillo / cubre));
  color = mix(color, borde, 0.8 * clamp(oro / cubre, 0.0, 1.0) * (1.0 - smoothstep(0.2, 0.8, cubre)));
  color = mix(color, luz, 0.9 * smoothstep(0.55, 0.95, p.y));
  gl_FragColor = vec4(color, (1.0 - transmite) * smoothstep(0.0, 0.1, p.y) * (1.0 - smoothstep(0.7, 1.0, p.y)));
}`

const TRAMA = `precision highp float;
uniform vec2 res, rejilla;
uniform float celda, alfa;
uniform sampler2D campo;
${PUNTO}
void main() {
  vec2 px = vec2(gl_FragCoord.x, res.y - gl_FragCoord.y);
  vec2 celdaXY = floor(px / celda);
  vec4 m = texture2D(campo, (celdaXY + 0.5) / rejilla);
  float a = alfa * step(0.02, m.a) * punto(px, (celdaXY + 0.5) * celda, celda * 0.5 * sqrt(m.a));
  gl_FragColor = vec4(m.rgb * a, a);
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
const UNIFORMS = ['res', 'rejilla', 't', 'celda', 'alfa', 'luz', 'sombra', 'borde', 'campo', 'tramos', 'edades']

function compilar(gl, fragmentos) {
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
  for (const nombre of UNIFORMS) u[nombre] = gl.getUniformLocation(programa, nombre)
  return u
}

// La textura de `ruido3`, en la unidad 0. Con semilla fija, así que la nube es
// la misma en cada visita. El canal G es el R desplazado (37, 17).
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

// La textura de una celda por texel, en la unidad 1, y el framebuffer que
// escribe en ella. Su tamaño lo pone `medir`.
function laminaDeCampo(gl) {
  const lamina = gl.createTexture()
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, lamina)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  for (const [clave, valor] of [
    [gl.TEXTURE_MIN_FILTER, gl.NEAREST],
    [gl.TEXTURE_MAG_FILTER, gl.NEAREST],
    [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
  ]) {
    gl.texParameteri(gl.TEXTURE_2D, clave, valor)
  }
  const fbo = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, lamina, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return fbo
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
  const programas = gl && (mar ? [compilar(gl, MAR)] : [compilar(gl, CAMPO), compilar(gl, TRAMA)])
  if (!programas || programas.includes(null)) return

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  // Un triángulo que cubre todo el lienzo: sin costura en la diagonal.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  const escena = { id, gl, programas, activa: false, vivo: false }
  if (!mar) {
    texturaDeRuido(gl)
    escena.fbo = laminaDeCampo(gl)
    gl.useProgram(programas[1].programa)
    gl.uniform1i(programas[1].campo, 1)
    // El rastro: cada tramo es (x0, y0, x1, y1), y cuándo nació y cuánto duró.
    // Nacidos hace mucho, al principio ninguno sopla.
    escena.tramos = new Float32Array(TRAMOS * 4)
    escena.nacidos = new Float64Array(TRAMOS).fill(-1e9)
    escena.duraciones = new Float32Array(TRAMOS).fill(1)
    escena.edades = new Float32Array(TRAMOS * 2)
    escena.siguiente = 0
    escena.previo = null
  }
  escenas.set(id, escena)
}

function fijar(escena, poner) {
  for (const u of escena.programas) {
    escena.gl.useProgram(u.programa)
    poner(escena.gl, u)
  }
}

// Un tramo nuevo cada `CADA_TRAMO`, del punto anterior al actual. La
// duración topa en 0.1 s: si el cursor estuvo quieto y de pronto se mueve, el
// tramo es ese movimiento y no la espera.
function soplar(escena, { x, y, fuera }) {
  const ahora = performance.now()
  const { previo } = escena
  if (fuera || quieto) {
    escena.previo = null
  } else if (!previo) {
    escena.previo = { x, y, t: ahora }
  } else if (ahora - previo.t >= CADA_TRAMO) {
    const i = escena.siguiente
    escena.tramos.set([previo.x, previo.y, x, y], i * 4)
    escena.nacidos[i] = ahora
    escena.duraciones[i] = Math.min((ahora - previo.t) / 1000, 0.1)
    escena.siguiente = (i + 1) % TRAMOS
    escena.previo = { x, y, t: ahora }
  }
}

function pintar(escena, ahora) {
  const { gl, programas } = escena
  const t = (ahora - inicio) / 1000
  gl.useProgram(programas[0].programa)
  gl.uniform1f(programas[0].t, t)
  if (escena.fbo) {
    const [campo, trama] = programas
    const reloj = performance.now()
    for (let i = 0; i < TRAMOS; i++) {
      escena.edades[i * 2] = (reloj - escena.nacidos[i]) / 1000
      escena.edades[i * 2 + 1] = escena.duraciones[i]
    }
    gl.uniform4fv(campo.tramos, escena.tramos)
    gl.uniform2fv(campo.edades, escena.edades)
    gl.bindFramebuffer(gl.FRAMEBUFFER, escena.fbo)
    gl.viewport(0, 0, ...escena.rejilla)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.useProgram(trama.programa)
  }
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
    if (escena.fbo) {
      gl.activeTexture(gl.TEXTURE1)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ...escena.rejilla, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    }
    gl.viewport(0, 0, data.ancho, data.alto)
    fijar(escena, (gl, u) => {
      gl.uniform2f(u.res, data.ancho, data.alto)
      gl.uniform2f(u.rejilla, ...escena.rejilla)
      gl.uniform1f(u.celda, data.celda)
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
  if (escena && data.tipo === 'activa') escena.activa = data.valor
  if (escena?.fbo && data.tipo === 'viento') {
    soplar(escena, data)
    return
  }

  // Cambiar el tamaño borra el lienzo, y quieto nadie más lo repinta: cualquier
  // mensaje despierta un fotograma.
  if (!marco) marco = cuadro(paso)
}
