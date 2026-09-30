/**
 * El pintor de las nubes, en un Web Worker.
 *
 * Todo el WebGL vive aquí y no en la página. La razón es medida: en un
 * navegador recién abierto, crear el primer contexto WebGL espera a que
 * arranque la GPU, y en el hilo principal eso era una tarea de más de un
 * segundo que bajaba Lighthouse a ~76. Aquí esa espera no bloquea a nadie.
 *
 * Qué dibuja: una rejilla de puntos en espacio de pantalla, como una trama de
 * imprenta, sobre un mismo campo de nubes que el viento arrastra. Cada lienzo
 * lo mira desde una cara:
 *
 *   - `cielo`: las nubes vistas desde abajo. Grandes arriba y apretadas contra
 *     el horizonte, que es el borde de abajo del lienzo.
 *   - `suelo`: las sombras que esas nubes dejan en el piso. El horizonte es el
 *     borde de arriba; el suelo al sol es una trama fina y la sombra la
 *     engrosa y la oscurece.
 *
 * Los dos usan el mismo reloj, el mismo viento y la misma perspectiva en
 * espejo, así que la sombra de cada nube cruza el suelo a la vez que la nube
 * cruza el cielo, corrida un poco por el sol.
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
//   - `ruido` y `nube`: ruido de valor y cuatro octavas de él. Con menos la
//     nube es una mancha; con más no se nota a este tamaño de punto.
//   - `y` va de 0 en el horizonte a 1 en el borde lejano del lienzo, y la
//     distancia `z` crece hacia el horizonte: por eso cerca del texto las
//     nubes y las sombras se ven chicas y apretadas.
//   - Las nubes viajan en profundidad, alejándose hacia el horizonte: el
//     campo avanza en `z` con el tiempo, y como la pantalla divide por `z`,
//     cada nube entra grande por el borde lejano y converge, achicándose,
//     hacia el punto de fuga —el centro del borde que da al texto—. La
//     sombra es el mismo campo corrido por el sol, con el borde más blando
//     que la nube.
//   - El punto: un círculo con borde suavizado de 1.5 px en el centro de su
//     celda.
const FRAGMENTOS = `precision highp float;
uniform vec2 res;
uniform float t, celda, alfa, cielo;
uniform vec3 cerca, lejos;
float azar(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(azar(i), azar(i + vec2(1, 0)), f.x), mix(azar(i + vec2(0, 1)), azar(i + 1.0), f.x), f.y);
}
float nube(vec2 p) {
  float v = 0.0, w = 0.5;
  for (int i = 0; i < 4; i++) { v += w * ruido(p); p = p * 2.03 + 17.0; w *= 0.5; }
  return v;
}
void main() {
  vec2 px = vec2(gl_FragCoord.x, res.y - gl_FragCoord.y);
  vec2 c = (floor(px / celda) + 0.5) * celda;
  float y = mix(c.y, res.y - c.y, cielo) / res.y, z = 1.0 / (y + 0.15);
  vec2 q = vec2((c.x - res.x * 0.5) / res.y * z, z * 1.6 - t * 0.2);
  float r, a;
  vec3 color;
  if (cielo > 0.5) {
    float cuerpo = smoothstep(0.4, 0.66, nube(q));
    r = celda * 0.5 * cuerpo * mix(0.5, 1.0, y);
    a = alfa * step(0.02, cuerpo);
    color = lejos;
  } else {
    float sombra = smoothstep(0.36, 0.72, nube(q + vec2(0.35, 0.2)));
    r = celda * 0.5 * mix(0.16, 1.0, sombra) * mix(0.45, 1.0, y);
    a = alfa;
    color = mix(lejos, cerca, sombra);
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

function montar(id, lienzo, cielo) {
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
  for (const nombre of ['res', 't', 'celda', 'alfa', 'cielo', 'cerca', 'lejos']) {
    u[nombre] = gl.getUniformLocation(programa, nombre)
  }
  gl.uniform1f(u.cielo, cielo ? 1 : 0)
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
  if (data.tipo === 'montar') montar(data.id, data.lienzo, data.cielo)
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
    gl.uniform3fv(u.cerca, data.cerca)
    gl.uniform3fv(u.lejos, data.lejos)
    gl.uniform1f(u.alfa, data.alfa)
  }
  if (escena && data.tipo === 'activa') escena.activa = data.valor

  // Cambiar el tamaño borra el lienzo, y quieto nadie más lo repinta: cualquier
  // mensaje despierta un fotograma.
  if (!marco) marco = cuadro(paso)
}
