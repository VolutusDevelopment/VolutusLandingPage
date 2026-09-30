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
 *   - `cielo`: una volutus, la nube en rollo que da nombre a la marca. Un
 *     tubo largo en perspectiva: el extremo cercano entra enorme por el borde
 *     derecho y el resto se aleja hacia un punto de fuga a la izquierda,
 *     girando sobre su eje. El lomo da al sol, el vientre queda en sombra y
 *     deja colgar jirones; el filo iluminado se dora.
 *   - `mar`: el agua bajo la nube, con el horizonte arriba. Las olas ruedan
 *     hacia el frente, la espuma asoma en las crestas, la luz deja su reflejo
 *     al centro y las sombras de las nubes pasan por encima.
 *
 * Los colores son tres, y cada vista los usa a su modo: `luz`, `sombra` y
 * `borde` (el filo dorado en el cielo, la espuma en el mar).
 *
 * Recibe de la página (nubes.js) los lienzos, sus medidas, sus colores y si
 * están a la vista; le devuelve `vivo` cuando un lienzo ya tiene su primer
 * fotograma.
 */

// ~30 fps: las nubes se mueven lento y la mitad de fotogramas no se nota.
const INTERVALO = 33
// El instante que se congela con movimiento reducido: uno con nubes.
const QUIETO_EN = 4000

const VERTICES = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

// El shader viaja tal cual al navegador —el minificador no entra en el
// texto—, así que sus explicaciones van aquí y no dentro:
//
//   - `ruido` y `fbm`: ruido de valor y cinco octavas de él. La nube necesita
//     las cinco para que el borde se deshaga en jirones y no en una mancha.
//     Cada octava gira el dominio: sin el giro, las rejillas del ruido se
//     alinean y la nube se ve hecha de cuadrados.
//   - Cielo: un solo rollo, en perspectiva de verdad. `s` es su escala en
//     cada columna: 1 en el borde derecho y lineal hacia un punto de fuga que
//     queda fuera del lienzo por la izquierda, así que el lomo y el vientre son
//     rectas que convergen —lo que el ojo reconoce como un tubo que se aleja—.
//     El eje baja hacia el horizonte (72 % del alto) y el radio del extremo
//     cercano es el 42 % del alto: el borde lo corta, como algo más grande que
//     el cuadro. `largo` es la profundidad (1/s), así que la textura se
//     aprieta a lo lejos como en una foto. Solo la mitad de arriba ondula con
//     `lobulos`, los bultos redondos del borde de ataque. `v` es la altura
//     dentro del tubo, de -1 en el lomo a 1 en el vientre, y `asin(v)` el
//     ángulo sobre su sección: el ruido se muestrea en (largo, ángulo) y el
//     ángulo avanza con el tiempo, así que la textura rueda sobre el eje en vez
//     de desplazarse; fuera del tubo el ángulo sigue creciendo con `v`, sin
//     costura. La densidad es la sección del cilindro más el ruido, que casi no
//     toca el lomo —liso y redondo— y pesa en el vientre para que cuelguen
//     jirones. La luz (`sol`) suma dos cosas: la del cilindro con el sol
//     arriba y la del ruido, que resta la densidad un poco más hacia el sol
//     —si hay menos nube entre el punto y la luz, está iluminado—; con eso
//     cada bulto tiene su cara clara y su sombra. Donde la nube es fina y le
//     da el sol, el color se dora; a lo lejos se funde con `luz`, que es el
//     aire. El tamaño del punto sigue a la densidad y el extremo lejano se
//     apaga.
//   - Mar: `y` va de 0 en el horizonte (arriba) a 1 en el borde de abajo, y
//     cerca del horizonte todo se apaga. El plano está en perspectiva, con
//     la distancia `z` creciendo hacia el horizonte. La altura del agua suma
//     tres olas que ruedan hacia el frente y un ruido que se desplaza; la altura decide color y tamaño del punto, y
//     las crestas más altas se vuelven espuma. El reflejo es una franja
//     central donde las crestas brillan, y encima pasan, grandes y lentas, las
//     sombras de las nubes.
//   - El punto: un círculo con borde suavizado de 1.5 px en el centro de su
//     celda.
const FRAGMENTOS = `precision highp float;
uniform vec2 res;
uniform float t, celda, alfa, mar;
uniform vec3 luz, sombra, borde;
float azar(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(azar(i), azar(i + vec2(1, 0)), f.x), mix(azar(i + vec2(0, 1)), azar(i + 1.0), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, w = 0.5;
  for (int i = 0; i < 5; i++) { v += w * ruido(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 17.0; w *= 0.5; }
  return v;
}
void main() {
  vec2 px = vec2(gl_FragCoord.x, res.y - gl_FragCoord.y);
  vec2 c = (floor(px / celda) + 0.5) * celda;
  float r = 0.0, a = 0.0, y = 1.0;
  vec3 color = luz;
  if (mar < 0.5) {
    float u = c.x / res.x;
    float s = (u + 0.2) / 1.2;
    float largo = 1.4 / s + t * 0.02;
    float lobulos = 0.6 * ruido(vec2(largo * 1.2, 3.0)) + 0.4 * ruido(vec2(largo * 3.0, 9.0));
    float dy = c.y - (0.72 - 0.34 * s) * res.y;
    float v = dy / (0.42 * s * res.y * (dy < 0.0 ? 0.8 + 0.4 * lobulos : 1.0));
    if (abs(v) < 1.5) {
      float vc = clamp(v, -1.0, 1.0);
      float seccion = sqrt(1.0 - vc * vc);
      vec2 q = vec2(largo, (asin(vc) + v - vc) * 1.7 - t * 0.3);
      float n = fbm(q);
      float d = seccion + (n - 0.5) * mix(0.3, 1.0, smoothstep(0.0, 1.4, v)) - 0.12;
      if (d > 0.0) {
        float cuerpo = smoothstep(0.0, 0.45, d);
        float sol = smoothstep(-0.3, 1.0, 0.5 * seccion - 0.8 * vc + 1.8 * (n - fbm(q - vec2(0.0, 0.3))));
        color = mix(sombra, luz, sol);
        color = mix(color, borde, 0.9 * (1.0 - cuerpo) * smoothstep(0.3, 0.9, sol));
        color = mix(color, luz, 0.45 * (1.0 - s));
        r = celda * 0.5 * mix(0.1, 1.0, sqrt(cuerpo));
        a = alfa * smoothstep(0.0, 0.3, u);
      }
    }
  } else {
    y = c.y / res.y;
    float z = 1.0 / (y + 0.15);
    vec2 q = vec2((c.x - res.x * 0.5) / res.y * z, z * 1.6);
    float h = 0.55 * sin(q.y * 2.4 + 0.8 * sin(q.x * 0.6 + t * 0.25) + t * 1.8)
      + 0.3 * sin(q.y * 4.1 - q.x * 1.1 + t * 2.6)
      + 0.25 * sin(q.y * 3.3 + q.x * 1.7 + t * 2.2)
      + 0.5 * (ruido(q * vec2(2.5, 4.0) + vec2(t * 0.3, t * 0.9)) - 0.5);
    float alto = clamp(h * 0.4 + 0.5, 0.0, 1.0);
    float nubada = smoothstep(0.55, 0.75, ruido(vec2(q.x * 0.6 + t * 0.12, q.y * 0.4)));
    float reflejo = (1.0 - smoothstep(0.0, 0.1 + 0.2 * y, abs(c.x / res.x - 0.5))) * (1.0 - nubada);
    color = mix(sombra, luz, smoothstep(0.2, 0.7, alto));
    color = mix(color, borde, max(smoothstep(0.78, 0.95, alto), reflejo * smoothstep(0.55, 0.8, alto)));
    color = mix(color, sombra, 0.6 * nubada);
    r = celda * 0.5 * mix(0.15, 1.0, alto) * mix(0.5, 1.0, y) * (1.0 - 0.3 * nubada);
    a = alfa;
  }
  a *= smoothstep(0.0, 0.2, y) * (1.0 - smoothstep(r - 0.75, r + 0.75, length(px - c)));
  gl_FragColor = vec4(color * a, a);
}`

// `requestAnimationFrame` dentro de un worker es reciente; sin él, un reloj.
const cuadro = self.requestAnimationFrame ?? ((f) => setTimeout(() => f(performance.now()), 16))

const escenas = new Map()
let quieto = false
let marco = 0
let ultimo = 0
const inicio = performance.now()

function compilar(gl) {
  const programa = gl.createProgram()
  for (const [tipo, fuente] of [
    [gl.VERTEX_SHADER, VERTICES],
    [gl.FRAGMENT_SHADER, FRAGMENTOS],
  ]) {
    const shader = gl.createShader(tipo)
    gl.shaderSource(shader, fuente)
    gl.compileShader(shader)
    gl.attachShader(programa, shader)
  }
  gl.bindAttribLocation(programa, 0, 'p')
  gl.linkProgram(programa)
  return gl.getProgramParameter(programa, gl.LINK_STATUS) ? programa : null
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
  const programa = gl && compilar(gl)
  if (!programa) return

  gl.useProgram(programa)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  // Un triángulo que cubre todo el lienzo: sin costura en la diagonal.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  const u = {}
  for (const nombre of ['res', 't', 'celda', 'alfa', 'mar', 'luz', 'sombra', 'borde']) {
    u[nombre] = gl.getUniformLocation(programa, nombre)
  }
  gl.uniform1f(u.mar, mar ? 1 : 0)
  escenas.set(id, { id, gl, u, activa: false, vivo: false })
}

function pintar(escena, ahora) {
  const { gl, u } = escena
  gl.uniform1f(u.t, (ahora - inicio) / 1000)
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
    const { gl, u } = escena
    gl.canvas.width = data.ancho
    gl.canvas.height = data.alto
    gl.viewport(0, 0, data.ancho, data.alto)
    gl.uniform2f(u.res, data.ancho, data.alto)
    gl.uniform1f(u.celda, data.celda)
  }
  if (escena && data.tipo === 'colores') {
    const { gl, u } = escena
    gl.uniform3fv(u.luz, data.luz)
    gl.uniform3fv(u.sombra, data.sombra)
    gl.uniform3fv(u.borde, data.borde)
    gl.uniform1f(u.alfa, data.alfa)
  }
  if (escena && data.tipo === 'activa') escena.activa = data.valor

  // Cambiar el tamaño borra el lienzo, y quieto nadie más lo repinta: cualquier
  // mensaje despierta un fotograma.
  if (!marco) marco = cuadro(paso)
}
