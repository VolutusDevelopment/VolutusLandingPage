/**
 * La vitrina de Quillay (quillay.html): el jabón elegido, en 3D, con WebGL y
 * sin dependencias. Es una barra de bordes redondeados con su sello hundido
 * en la cara de arriba (la hoja y «quillay», dibujados en un canvas), la
 * textura de cada receta (puntos de avena, grano de arcilla) y una luz
 * cálida de ventana. Flota y se balancea despacio, se inclina hacia el
 * cursor como con un resorte y, al cambiar de jabón, da una vuelta mientras
 * cambia de forma y de color.
 *
 * La forma no se vuelve a armar al cambiar de jabón: la malla es un cubo
 * subdividido y el shader lo redondea con el tamaño y el radio de cada uno,
 * así que pasar de uno a otro es interpolar cuatro números.
 *
 * Solo dibuja mientras la vitrina se ve, la pestaña está a la vista y la
 * página no espera en el visor del brief (`.en-espera`). Con el movimiento
 * reducido dibuja un cuadro sinMovimiento cada vez que algo cambia. Sin WebGL queda
 * la foto que trae la página.
 */

const JABONES = {
  avena: { medio: [1.0, 0.34, 0.62], radio: 0.2, color: [0.93, 0.87, 0.75], puntos: [0.5, 0.36, 0.22], densidad: 0.55, escala: 9, sello: 1 },
  maqui: { medio: [0.95, 0.38, 0.6], radio: 0.27, color: [0.63, 0.7, 0.57], puntos: [0.36, 0.43, 0.32], densidad: 0.8, escala: 22, sello: 0.96 },
  champu: { medio: [0.72, 0.42, 0.72], radio: 0.4, color: [0.76, 0.64, 0.5], puntos: [0.33, 0.37, 0.22], densidad: 0.45, escala: 14, sello: 0.55 },
}

const VERTICES = `
attribute vec3 aQ;
uniform vec3 uMedio;
uniform float uRadio;
uniform mat3 uGiro;
uniform vec3 uLugar;
uniform mat4 uProyeccion;
varying vec3 vObjeto;
varying vec3 vNormal;
varying vec3 vVista;
void main() {
  vec3 p = aQ * uMedio;
  vec3 dentro = clamp(p, -(uMedio - uRadio), uMedio - uRadio);
  vec3 n = normalize(p - dentro);
  vec3 objeto = dentro + n * uRadio;
  vObjeto = objeto;
  vNormal = n;
  vVista = uGiro * objeto + uLugar;
  gl_Position = uProyeccion * vec4(vVista, 1.0);
}`

const FRAGMENTOS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform mat3 uGiro;
uniform vec3 uColor;
uniform vec3 uPuntos;
uniform float uDensidad;
uniform float uEscala;
uniform sampler2D uSello;
uniform float uTamSello;
varying vec3 vObjeto;
varying vec3 vNormal;
varying vec3 vVista;

float azar(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float ruido(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(azar(i), azar(i + vec3(1, 0, 0)), f.x), mix(azar(i + vec3(0, 1, 0)), azar(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(azar(i + vec3(0, 0, 1)), azar(i + vec3(1, 0, 1)), f.x), mix(azar(i + vec3(0, 1, 1)), azar(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}

void main() {
  vec3 n = normalize(vNormal);
  vec3 albedo = uColor * (0.93 + 0.07 * ruido(vObjeto * 3.0) + 0.04 * ruido(vObjeto * 11.0));

  vec3 celda = floor(vObjeto * uEscala);
  vec3 dentro = fract(vObjeto * uEscala);
  vec3 centro = vec3(azar(celda + 1.3), azar(celda + 2.7), azar(celda + 5.1)) * 0.6 + 0.2;
  float punto = step(azar(celda), uDensidad) * (1.0 - smoothstep(0.07, 0.15, length(dentro - centro)));
  albedo = mix(albedo, uPuntos, punto * 0.85);

  if (n.y > 0.985) {
    vec2 uv = vec2(vObjeto.x / 1.3, vObjeto.z / 0.65) / uTamSello + 0.5;
    float h = texture2D(uSello, uv).r;
    float hx = texture2D(uSello, uv + vec2(0.003, 0.0)).r - texture2D(uSello, uv - vec2(0.003, 0.0)).r;
    float hz = texture2D(uSello, uv + vec2(0.0, 0.006)).r - texture2D(uSello, uv - vec2(0.0, 0.006)).r;
    n = normalize(vec3(hx * 2.2, 1.0, hz * 2.2));
    albedo *= 1.0 - 0.16 * h;
  }

  vec3 N = normalize(uGiro * n);
  vec3 V = normalize(-vVista);
  vec3 luz = normalize(vec3(-0.55, 0.85, 0.55));
  vec3 relleno = normalize(vec3(0.85, 0.25, 0.45));
  float clave = max((dot(N, luz) + 0.35) / 1.35, 0.0);
  float suave = max((dot(N, relleno) + 0.35) / 1.35, 0.0);
  float brillo = pow(max(dot(N, normalize(luz + V)), 0.0), 36.0) * 0.1;
  float borde = pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.18;
  vec3 ambiente = mix(vec3(0.5, 0.45, 0.38), vec3(0.86, 0.86, 0.8), N.y * 0.5 + 0.5) * 0.36;
  vec3 color = albedo * (ambiente + clave * vec3(1.0, 0.95, 0.86) * 0.82 + suave * vec3(0.55, 0.6, 0.62) * 0.3 + borde) + brillo;
  gl_FragColor = vec4(color, 1.0);
}`

const vitrina = document.querySelector('[data-vitrina]')
const lienzo = vitrina?.querySelector('canvas')
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches
const sinTresD = () => vitrina?.classList.add('sin-3d')
let gl = null

// El 3D arranca después de que la página cargó, para no competir con lo
// primero que se ve.
if (lienzo) {
  const empezar = () => setTimeout(iniciar, 200)
  if (document.readyState === 'complete') empezar()
  else addEventListener('load', empezar, { once: true })
}

function compilar(tipo, codigo) {
  const sh = gl.createShader(tipo)
  gl.shaderSource(sh, codigo)
  gl.compileShader(sh)
  return sh
}

// Espera a que el programa termine de compilarse sin detener la página: con
// KHR_parallel_shader_compile pregunta en cada cuadro; sin ella, espera uno.
function compilado(programa) {
  const paralelo = gl.getExtension('KHR_parallel_shader_compile')
  return new Promise((listo) => {
    const revisar = () => {
      if (paralelo && !gl.getProgramParameter(programa, paralelo.COMPLETION_STATUS_KHR)) return requestAnimationFrame(revisar)
      listo(gl.getProgramParameter(programa, gl.LINK_STATUS))
    }
    requestAnimationFrame(revisar)
  })
}

// Un cubo de lado 2 con cada cara subdividida en una grilla. Los puntos se
// juntan hacia los bordes (seno) para que el redondeo quede liso.
function malla(n) {
  const puntos = []
  const indices = []
  const caras = [
    [0, 1, 2, 1], [0, 1, 2, -1], [1, 2, 0, 1], [1, 2, 0, -1], [2, 0, 1, 1], [2, 0, 1, -1],
  ]
  for (const [a, b, c, s] of caras) {
    const base = puntos.length / 3
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        const q = [0, 0, 0]
        q[a] = Math.sin(((i / n) * 2 - 1) * (Math.PI / 2))
        q[b] = Math.sin(((j / n) * 2 - 1) * (Math.PI / 2))
        q[c] = s
        puntos.push(...q)
      }
    }
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const k = base + i * (n + 1) + j
        const cuadro = [k, k + n + 1, k + 1, k + 1, k + n + 1, k + n + 2]
        indices.push(...(s > 0 ? cuadro : [cuadro[0], cuadro[2], cuadro[1], cuadro[3], cuadro[5], cuadro[4]]))
      }
    }
  }
  return { puntos: new Float32Array(puntos), indices: new Uint16Array(indices) }
}

// El sello de la cara de arriba: la hoja y la palabra, en blanco sobre negro.
async function sello() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const x = c.getContext('2d')
  x.fillStyle = '#000'
  x.fillRect(0, 0, 512, 256)
  try {
    await document.fonts.load('400 92px "Young Serif"')
  } catch {
    // Sin la letra, el sello sale con la de respaldo.
  }
  x.fillStyle = '#fff'
  x.strokeStyle = '#fff'
  x.lineWidth = 7
  x.beginPath()
  x.ellipse(256, 128, 236, 110, 0, 0, Math.PI * 2)
  x.stroke()
  x.save()
  x.translate(118, 132)
  x.rotate(-0.7)
  x.beginPath()
  x.moveTo(-34, 0)
  x.quadraticCurveTo(0, -26, 34, 0)
  x.quadraticCurveTo(0, 26, -34, 0)
  x.fill()
  x.restore()
  x.font = '400 92px "Young Serif", Georgia, serif'
  x.textBaseline = 'middle'
  x.fillText('quillay', 168, 136)
  return c
}

async function iniciar() {
  gl = lienzo.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true })
  if (!gl) return sinTresD()
  const programa = gl.createProgram()
  gl.attachShader(programa, compilar(gl.VERTEX_SHADER, VERTICES))
  gl.attachShader(programa, compilar(gl.FRAGMENT_SHADER, FRAGMENTOS))
  gl.linkProgram(programa)
  const imagenDelSello = sello()
  if (!(await compilado(programa))) return sinTresD()
  gl.useProgram(programa)

  const { puntos, indices } = malla(40)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, puntos, gl.STATIC_DRAW)
  const aQ = gl.getAttribLocation(programa, 'aQ')
  gl.enableVertexAttribArray(aQ)
  gl.vertexAttribPointer(aQ, 3, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, await imagenDelSello)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  const u = {}
  for (const nombre of ['uMedio', 'uRadio', 'uGiro', 'uLugar', 'uProyeccion', 'uColor', 'uPuntos', 'uDensidad', 'uEscala', 'uSello', 'uTamSello']) {
    u[nombre] = gl.getUniformLocation(programa, nombre)
  }
  gl.uniform1i(u.uSello, 0)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  gl.clearColor(0, 0, 0, 0)

  // Lo que se anima: el jabón que se muestra (mezcla entre el de antes y el
  // elegido), la inclinación hacia el cursor y la vuelta del cambio.
  const elegido = vitrina.querySelector('input[name="jabon"]:checked')?.value ?? 'avena'
  let desde = JABONES[elegido]
  let hacia = desde
  let cambio = 1
  let inicioCambio = 0
  const cursor = { x: 0, y: 0, vx: 0, vy: 0, objetivoX: 0, objetivoY: 0 }
  let reloj = 0
  let antes = 0
  let cuadro = 0
  let visible = false

  const mezcla = (a, b, t) => a + (b - a) * t
  const suave = (t) => t * t * (3 - 2 * t)

  function medir() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5)
    const ancho = Math.round(lienzo.clientWidth * dpr)
    const alto = Math.round(lienzo.clientHeight * dpr)
    if (lienzo.width !== ancho || lienzo.height !== alto) {
      lienzo.width = ancho
      lienzo.height = alto
    }
    gl.viewport(0, 0, ancho, alto)
    const aspecto = ancho / Math.max(alto, 1)
    const f = 1 / Math.tan((26 * Math.PI) / 360)
    const cerca = 0.1
    const lejos = 50
    gl.uniformMatrix4fv(u.uProyeccion, false, new Float32Array([f / aspecto, 0, 0, 0, 0, f, 0, 0, 0, 0, (lejos + cerca) / (cerca - lejos), -1, 0, 0, (2 * lejos * cerca) / (cerca - lejos), 0]))
  }

  function dibujar(ahora) {
    const dt = Math.min((ahora - (antes || ahora)) / 1000, 0.05)
    antes = ahora
    if (!sinMovimiento) reloj += dt

    // El resorte del cursor: amortiguado justo, sin pasarse.
    const w = 12
    for (const [p, vel, obj] of [['x', 'vx', 'objetivoX'], ['y', 'vy', 'objetivoY']]) {
      const a = w * w * (cursor[obj] - cursor[p]) - 2 * w * cursor[vel]
      cursor[vel] += a * dt
      cursor[p] += cursor[vel] * dt
    }

    if (cambio < 1) cambio = sinMovimiento ? 1 : Math.min((ahora - inicioCambio) / 1100, 1)
    const t = suave(cambio)
    const vuelta = cambio < 1 ? t * Math.PI * 2 : 0
    const medio = desde.medio.map((m, i) => mezcla(m, hacia.medio[i], t))
    gl.uniform3fv(u.uMedio, medio)
    gl.uniform1f(u.uRadio, mezcla(desde.radio, hacia.radio, t))
    gl.uniform3fv(u.uColor, desde.color.map((c, i) => mezcla(c, hacia.color[i], t)))
    gl.uniform3fv(u.uPuntos, desde.puntos.map((c, i) => mezcla(c, hacia.puntos[i], t)))
    gl.uniform1f(u.uDensidad, mezcla(desde.densidad, hacia.densidad, t))
    gl.uniform1f(u.uEscala, t < 0.5 ? desde.escala : hacia.escala)
    gl.uniform1f(u.uTamSello, mezcla(desde.sello, hacia.sello, t))

    // Se balancea de ida y vuelta (9 s) y flota (7 s), con curvas seno: frena
    // en cada extremo.
    const vaiven = Math.sin((reloj / 9) * Math.PI * 2) * 0.42
    const altura = Math.sin((reloj / 7) * Math.PI * 2) * 0.06
    vitrina.style.setProperty('--altura', altura.toFixed(3))
    const yaw = -0.55 + vaiven + cursor.x * 0.4 + vuelta
    const pitch = 0.5 + cursor.y * 0.14
    const cy = Math.cos(yaw)
    const sy = Math.sin(yaw)
    const cp = Math.cos(pitch)
    const sp = Math.sin(pitch)
    // Primero gira en el eje vertical y después se inclina hacia la cámara.
    gl.uniformMatrix3fv(u.uGiro, false, new Float32Array([cy, sp * sy, -cp * sy, 0, cp, sp, sy, -sp * cy, cp * cy]))
    gl.uniform3fv(u.uLugar, [0, 0.22 + altura, -4.9])

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
    if (!vitrina.classList.contains('con-3d')) vitrina.classList.add('con-3d')

    cuadro = 0
    if (!sinMovimiento && andando()) cuadro = requestAnimationFrame(dibujar)
  }

  const andando = () => visible && !document.hidden && !document.documentElement.classList.contains('en-espera')
  const seguir = () => {
    if (!cuadro && (andando() || sinMovimiento)) {
      antes = 0
      cuadro = requestAnimationFrame(dibujar)
    }
  }

  medir()
  new ResizeObserver(() => {
    medir()
    seguir()
  }).observe(lienzo)
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    seguir()
  }).observe(vitrina)
  document.addEventListener('visibilitychange', seguir)
  new MutationObserver(seguir).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  vitrina.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return
    const caja = lienzo.getBoundingClientRect()
    cursor.objetivoX = Math.max(-1, Math.min(1, ((e.clientX - caja.left) / caja.width) * 2 - 1))
    cursor.objetivoY = Math.max(-1, Math.min(1, ((e.clientY - caja.top) / caja.height) * 2 - 1))
    seguir()
  })
  vitrina.addEventListener('pointerleave', () => {
    cursor.objetivoX = 0
    cursor.objetivoY = 0
  })

  for (const opcion of vitrina.querySelectorAll('input[name="jabon"]')) {
    opcion.addEventListener('change', () => {
      const t = suave(cambio)
      desde = {
        medio: desde.medio.map((m, i) => mezcla(m, hacia.medio[i], t)),
        radio: mezcla(desde.radio, hacia.radio, t),
        color: desde.color.map((c, i) => mezcla(c, hacia.color[i], t)),
        puntos: desde.puntos.map((c, i) => mezcla(c, hacia.puntos[i], t)),
        densidad: mezcla(desde.densidad, hacia.densidad, t),
        escala: t < 0.5 ? desde.escala : hacia.escala,
        sello: mezcla(desde.sello, hacia.sello, t),
      }
      hacia = JABONES[opcion.value]
      cambio = 0
      inicioCambio = performance.now()
      seguir()
    })
  }

  lienzo.addEventListener('webglcontextlost', () => {
    vitrina.classList.remove('con-3d')
    sinTresD()
  })
}

// «Agregar al pedido» deja el jabón elegido en el formulario de pedido.
for (const enlace of document.querySelectorAll('[data-pedir]')) {
  enlace.addEventListener('click', () => {
    const campo = document.querySelector('#pedido select[name="producto"]')
    if (campo) campo.value = enlace.dataset.pedir
  })
}
