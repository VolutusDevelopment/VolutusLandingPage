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
 *   - `mar`: el agua bajo la nube, con el horizonte arriba. Las olas ruedan
 *     hacia el frente, la espuma asoma en las crestas, la luz deja su reflejo
 *     al centro y las sombras de las nubes pasan por encima.
 *
 * Los colores son tres, y cada vista los usa a su modo: `luz`, `sombra` y
 * `borde` (el filo dorado en el cielo, la espuma en el mar).
 *
 * Recibe de la página (nubes.js) los lienzos, sus medidas, sus colores, si
 * están a la vista, por dónde pasa el cursor y, en el juego de la 404, la
 * forma del cielo; le devuelve `vivo` cuando un lienzo ya tiene su primer
 * fotograma.
 */

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
//     sección sea redonda con cualquier proporción.
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

// `cercania`: la escala de profundidad del rollo en cada x, en altos. 1 en el
// borde izquierdo, y a partir de `FONDO` se queda en un 15 %.
const PERSPECTIVA = `
const float FONDO = 2.1;
float cercania(float x) {
  return exp(-0.9 * min(x, FONDO));
}`

const MAR = `precision highp float;
uniform vec2 res;
uniform float t, celda, alfa, agua;
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
  // agua rellena entre los puntos con el color hondo: el mar de día, que
  // si no dejaría ver el cielo por los huecos. De noche vale 0.
  gl_FragColor = vec4(color * a + sombra * agua * (1.0 - a), a + agua * (1.0 - a));
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
const UNIFORMS = ['res', 'rejilla', 't', 'celda', 'alfa', 'agua', 'luz', 'sombra', 'borde', 'campo', 'estado', 'forma', 'cumulos']
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
    const [campo, trama] = programas
    texturaDeRuido(gl)
    gl.activeTexture(gl.TEXTURE1)
    escena.campo = lamina(gl, gl.UNSIGNED_BYTE, gl.NEAREST)
    gl.useProgram(campo.programa)
    gl.uniform1i(campo.estado, 2)
    gl.useProgram(trama.programa)
    gl.uniform1i(trama.campo, 1)
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
  const { gl, programas } = escena
  if (escena.aire && !quieto) simular(escena)
  gl.useProgram(programas[0].programa)
  gl.uniform1f(programas[0].t, (ahora - inicio) / 1000)
  if (escena.campo) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, escena.campo.fbo)
    gl.viewport(0, 0, ...escena.rejilla)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.useProgram(programas[1].programa)
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
    if (escena.campo) {
      gl.activeTexture(gl.TEXTURE1)
      dimensionar(gl, escena.campo, ...escena.rejilla)
    }
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
    })
  }
  if (escena && data.tipo === 'colores') {
    fijar(escena, (gl, u) => {
      gl.uniform3fv(u.luz, data.luz)
      gl.uniform3fv(u.sombra, data.sombra)
      gl.uniform3fv(u.borde, data.borde)
      gl.uniform1f(u.alfa, data.alfa)
      gl.uniform1f(u.agua, data.agua)
    })
  }
  if (escena && data.tipo === 'forma') {
    fijar(escena, (gl, u) => {
      gl.uniform1f(u.forma, data.valor)
      gl.uniform3fv(u.cumulos, data.cumulos)
    })
  }
  if (escena && data.tipo === 'activa') escena.activa = data.valor
  if (escena?.campo && data.tipo === 'viento') {
    soplar(escena, data)
    return
  }

  // Cambiar el tamaño borra el lienzo, y quieto nadie más lo repinta: cualquier
  // mensaje despierta un fotograma.
  if (!marco) marco = cuadro(paso)
}
