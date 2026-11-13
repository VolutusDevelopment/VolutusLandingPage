/*
 * El mapa en relieve de las caminatas de Parina: el altiplano de Putre como
 * una maqueta tejida, con WebGL propio y sin dependencias. El relieve sale de
 * una función (la meseta que sube desde Putre, los volcanes, el lago y el
 * salar), sus lados cortados muestran las franjas de un aguayo y, encima, las
 * cuatro rutas con sus paradas, dibujadas en SVG y llevadas a la pantalla
 * con la misma cámara. Al elegir una caminata, la cámara viaja hasta ella.
 *
 * Arranca después de la carga, dibuja solo mientras el mapa se ve y se
 * detiene con la pestaña oculta o la página en espera en el visor. Con el
 * movimiento reducido no gira y los cambios de ruta son directos. Sin WebGL,
 * o si se dibuja por software (sin tarjeta de video), el mapa queda oculto:
 * la información de cada ruta está en su ficha.
 */

const mapa = document.querySelector('[data-mapa]')
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches

// ---- El terreno: alturas en metros sobre el mar ----

const suave = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const mezcla = (a, b, t) => a + (b - a) * t
const azar = (x, z) => {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return s - Math.floor(s)
}
function ruido(x, z) {
  const ix = Math.floor(x)
  const iz = Math.floor(z)
  const fx = x - ix
  const fz = z - iz
  const ux = fx * fx * (3 - 2 * fx)
  const uz = fz * fz * (3 - 2 * fz)
  const a = mezcla(azar(ix, iz), azar(ix + 1, iz), ux)
  const b = mezcla(azar(ix, iz + 1), azar(ix + 1, iz + 1), ux)
  return mezcla(a, b, uz)
}
function capas(x, z) {
  let suma = 0
  let peso = 0.5
  for (let i = 0; i < 4; i++) {
    suma += peso * ruido(x, z)
    x *= 2.03
    z *= 2.03
    peso *= 0.5
  }
  return suma
}
const cono = (x, z, cx, cz, radio, alto, curva) => {
  const d = Math.hypot(x - cx, z - cz) / radio
  return d < 1 ? alto * (1 - d) ** curva : 0
}
const elipse = (x, z, cx, cz, rx, rz) => Math.hypot((x - cx) / rx, (z - cz) / rz)

// x crece al este y z al sur. Putre queda al oeste, en lo bajo.
function terreno(x, z) {
  const meseta = suave(-0.98, -0.3, x)
  let h = 3450 + 1050 * meseta
  h += (capas(x * 2.6 + 3, z * 2.6 + 7) - 0.48) * 380
  // Lomas y quebradas: un ruido de crestas, más marcado en la meseta.
  h += (0.5 - Math.abs(2 * capas(x * 4.2 - 5, z * 4.2 + 2) - 1)) * 420 * (0.4 + 0.6 * meseta)
  // La quebrada de Putre baja hacia el oeste.
  h -= 420 * Math.exp(-(((z + 0.05 + 0.12 * Math.sin(x * 5)) / 0.07) ** 2)) * (1 - suave(-0.5, -0.1, x))
  h += cono(x, z, 0.6, -0.4, 0.36, 1900, 1.55)
  h -= 90 * Math.exp(-((Math.hypot(x - 0.6, z + 0.4) / 0.035) ** 2))
  h += cono(x, z, 0.82, -0.68, 0.28, 1760, 1.55)
  h += cono(x, z, 0.04, 0.42, 0.32, 1000, 1.9)
  h += cono(x, z, -0.42, 0.6, 0.3, 520, 2)
  const lago = 1 - suave(0.84, 1.06, elipse(x, z, 0.5, 0.06, 0.2, 0.15))
  const sal = 1 - suave(0.82, 1.04, elipse(x, z, 0.56, 0.8, 0.25, 0.12))
  h = mezcla(h, 4517, lago)
  h = mezcla(h, 4255, sal)
  // Los bofedales: manchas húmedas en lo plano de la meseta y cerca del agua.
  const humedad = suave(0.55, 0.75, capas(x * 3.1 + 11, z * 3.1 - 4) + 0.35 * (1 - suave(1, 1.6, elipse(x, z, 0.5, 0.06, 0.2, 0.15)))) * suave(4200, 4400, h) * (1 - suave(4650, 4800, h))
  return { h, lago, sal, humedad }
}
const ESCALA = 0.11 / 1000
const alto = (h) => (h - 3400) * ESCALA

// ---- Las rutas y los nombres ----

const RUTAS = {
  chungara: {
    camino: [[0.29, -0.15], [0.3, -0.03], [0.33, 0.09], [0.41, 0.2], [0.53, 0.25], [0.65, 0.24]],
    paradas: [[0, 'Mirador del Parinacota'], [2, 'Descanso: playa de las taguas'], [4, 'Almuerzo en la orilla sur']],
  },
  parinacota: {
    camino: [[-0.2, -0.02], [-0.12, -0.08], [-0.05, -0.06], [0.02, -0.13], [0.07, -0.17]],
    paradas: [[0, 'Bofedal de las vicuñas'], [2, 'Descanso: la vertiente'], [4, 'Iglesia de 1789']],
  },
  surire: {
    camino: [[0.3, 0.72], [0.4, 0.66], [0.52, 0.67], [0.64, 0.7], [0.76, 0.76]],
    paradas: [[0, 'Llegada en camioneta'], [2, 'Mirador de los flamencos'], [4, 'Termas de Polloquere']],
  },
  choquelimpie: {
    camino: [[-0.06, 0.1], [-0.02, 0.17], [0.0, 0.24], [0.05, 0.28], [0.03, 0.34]],
    paradas: [[0, 'La mina vieja'], [2, 'Descanso: abra de 4.600 m'], [4, 'Mirador, 4.800 m']],
  },
}
const NOMBRES = [
  [-0.84, -0.06, 'Putre · el lodge', 'casa'],
  [0.6, -0.4, 'Parinacota · 6.348 m', 'cima'],
  [0.82, -0.68, 'Pomerape · 6.282 m', 'cima'],
  [0.6, 0.12, 'Lago Chungará', 'agua'],
  [0.04, 0.42, 'Choquelimpie', ''],
  [0.56, 0.8, 'Salar de Surire', 'agua'],
]

// Catmull-Rom: el camino pasa suave por sus puntos.
function trazar(puntos, pasos = 14) {
  const salida = []
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[Math.max(0, i - 1)]
    const p1 = puntos[i]
    const p2 = puntos[i + 1]
    const p3 = puntos[Math.min(puntos.length - 1, i + 2)]
    for (let k = 0; k < pasos; k++) {
      const t = k / pasos
      const t2 = t * t
      const t3 = t2 * t
      const c = (a, b, c2, d) => 0.5 * (2 * b + (c2 - a) * t + (2 * a - 5 * b + 4 * c2 - d) * t2 + (3 * b - 3 * c2 + d - a) * t3)
      salida.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])])
    }
  }
  salida.push(puntos[puntos.length - 1])
  return salida.map(([x, z]) => [x, alto(terreno(x, z).h) + 0.012, z])
}
const punto3d = ([x, z], sobre = 0.012) => [x, alto(terreno(x, z).h) + sobre, z]

// ---- La malla: el relieve y sus cuatro lados tejidos ----

function malla(n) {
  const datos = []
  const indices = []
  const celda = 2 / n
  const vertice = (x, y, z, nx, ny, nz, h, lago, sal, lado, humedad) => {
    datos.push(x, y, z, nx, ny, nz, h, lago, sal, lado, humedad)
    return datos.length / 11 - 1
  }
  // Primero las alturas de la grilla; las normales salen de las vecinas, con
  // el relieve exagerado para que la luz lea la forma.
  const grilla = []
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) grilla.push(terreno(-1 + i * celda, -1 + j * celda))
  const y = (i, j) => alto(grilla[Math.min(n, Math.max(0, j)) * (n + 1) + Math.min(n, Math.max(0, i))].h)
  for (let j = 0; j <= n; j++) {
    for (let i = 0; i <= n; i++) {
      const t = grilla[j * (n + 1) + i]
      const hx = 2.4 * (y(i + 1, j) - y(i - 1, j))
      const hz = 2.4 * (y(i, j + 1) - y(i, j - 1))
      const largo = Math.hypot(hx, 2 * celda, hz)
      vertice(-1 + i * celda, alto(t.h), -1 + j * celda, -hx / largo, (2 * celda) / largo, -hz / largo, t.h, t.lago, t.sal, 0, t.humedad)
    }
  }
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const a = j * (n + 1) + i
      indices.push(a, a + n + 1, a + 1, a + 1, a + n + 1, a + n + 2)
    }
  }
  // Los lados: de la base al borde del relieve, con su altura para las franjas.
  const base = -0.05
  const hBase = 3400 + base / ESCALA
  const lados = [
    [(k) => [-1 + k * celda, -1], [0, 0, -1]],
    [(k) => [1, -1 + k * celda], [1, 0, 0]],
    [(k) => [1 - k * celda, 1], [0, 0, 1]],
    [(k) => [-1, 1 - k * celda], [-1, 0, 0]],
  ]
  for (const [borde, [nx, ny, nz]] of lados) {
    for (let k = 0; k < n; k++) {
      const [x0, z0] = borde(k)
      const [x1, z1] = borde(k + 1)
      const h0 = terreno(x0, z0).h
      const h1 = terreno(x1, z1).h
      const a = vertice(x0, alto(h0), z0, nx, ny, nz, h0, 0, 0, 1, 0)
      const b = vertice(x1, alto(h1), z1, nx, ny, nz, h1, 0, 0, 1, 0)
      const c = vertice(x0, base, z0, nx, ny, nz, hBase, 0, 0, 1, 0)
      const d = vertice(x1, base, z1, nx, ny, nz, hBase, 0, 0, 1, 0)
      indices.push(a, c, b, b, c, d)
    }
  }
  return { datos: new Float32Array(datos), indices: new Uint32Array(indices) }
}

const VERTICES = `
attribute vec3 p; attribute vec3 n; attribute float h; attribute vec4 k;
uniform mat4 m;
varying vec3 vn; varying float vh; varying vec4 vk;
void main() { vn = n; vh = h; vk = k; gl_Position = m * vec4(p, 1.0); }`

const FRAGMENTOS = `
#extension GL_OES_standard_derivatives : enable
precision mediump float;
varying vec3 vn; varying float vh; varying vec4 vk;
const vec3 tierra = vec3(0.71, 0.27, 0.17);
const vec3 ocre = vec3(0.85, 0.61, 0.24);
const vec3 bofedal = vec3(0.36, 0.48, 0.29);
const vec3 lago = vec3(0.18, 0.36, 0.54);
const vec3 lana = vec3(0.95, 0.91, 0.83);
const vec3 roca = vec3(0.47, 0.37, 0.31);
const vec3 negro = vec3(0.1, 0.08, 0.07);
const vec3 luz = vec3(-0.62, 0.55, -0.45);
vec3 suelo(float h, float humedad) {
  vec3 c = mix(tierra * 0.95, ocre, smoothstep(3600.0, 4150.0, h));
  c = mix(c, mix(ocre, lana, 0.18), smoothstep(4350.0, 4550.0, h) * 0.6);
  c = mix(c, bofedal, humedad * 0.85);
  c = mix(c, roca, smoothstep(4750.0, 5100.0, h));
  c = mix(c, mix(roca, negro, 0.45), smoothstep(5250.0, 5500.0, h));
  return mix(c, lana, smoothstep(5600.0, 5720.0, h));
}
void main() {
  vec3 normal = normalize(vn);
  float sol = max(dot(normal, normalize(luz)), 0.0);
  vec3 c;
  if (vk.z > 0.5) {
    float franja = mod(floor((vh - 2800.0) / 230.0), 6.0);
    c = franja < 1.0 ? negro : franja < 2.0 ? tierra : franja < 3.0 ? ocre : franja < 4.0 ? lana : franja < 5.0 ? bofedal : lago;
    c *= 0.8 + 0.2 * sol;
  } else {
    c = suelo(vh, vk.w);
    c = mix(c, lana * 0.97, vk.y);
    c *= 0.36 + 0.85 * sol;
    float nivel = vh / 100.0;
    float ancho = fwidth(nivel);
    float linea = 1.0 - smoothstep(0.0, ancho * 1.3, min(fract(nivel), 1.0 - fract(nivel)));
    float mayor = step(0.5, 1.0 - abs(mod(floor(nivel + 0.5), 5.0)));
    c = mix(c, c * (0.62 - 0.12 * mayor), linea * (0.55 + 0.3 * mayor) * (1.0 - vk.x));
    c = mix(c, lago * (0.9 + 0.15 * sol), smoothstep(0.35, 0.65, vk.x));
  }
  gl_FragColor = vec4(c, 1.0);
}`

// ---- Matrices ----

function perspectiva(fov, aspecto, cerca, lejos) {
  const f = 1 / Math.tan(fov / 2)
  const r = 1 / (cerca - lejos)
  return [f / aspecto, 0, 0, 0, 0, f, 0, 0, 0, 0, (lejos + cerca) * r, -1, 0, 0, 2 * lejos * cerca * r, 0]
}
function mirar(ojo, centro) {
  const resta = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
  const unidad = (v) => {
    const l = Math.hypot(...v)
    return [v[0] / l, v[1] / l, v[2] / l]
  }
  const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
  const punto = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  const z = unidad(resta(ojo, centro))
  const x = unidad(cruz([0, 1, 0], z))
  const y = cruz(z, x)
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -punto(x, ojo), -punto(y, ojo), -punto(z, ojo), 1]
}
function multiplicar(a, b) {
  const c = new Array(16).fill(0)
  for (let col = 0; col < 4; col++)
    for (let fila = 0; fila < 4; fila++)
      for (let k = 0; k < 4; k++) c[col * 4 + fila] += a[k * 4 + fila] * b[col * 4 + k]
  return c
}

// ---- El mapa ----

// Si el navegador dibuja sin tarjeta de video (por software), el relieve
// cuesta demasiado: el mapa no se monta y quedan las fichas de las rutas.
function dibujaSinTarjeta(gl) {
  const info = gl.getExtension('WEBGL_debug_renderer_info')
  const nombre = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '')
  return /swiftshader|llvmpipe|software|basic render/i.test(nombre)
}

function montar() {
  const lienzo = mapa.querySelector('canvas')
  const gl = lienzo.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true })
  if (!gl || dibujaSinTarjeta(gl) || !gl.getExtension('OES_element_index_uint') || !gl.getExtension('OES_standard_derivatives')) return
  const compilar = (tipo, fuente) => {
    const s = gl.createShader(tipo)
    gl.shaderSource(s, fuente)
    gl.compileShader(s)
    return s
  }
  const programa = gl.createProgram()
  gl.attachShader(programa, compilar(gl.VERTEX_SHADER, VERTICES))
  gl.attachShader(programa, compilar(gl.FRAGMENT_SHADER, FRAGMENTOS))
  gl.linkProgram(programa)
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) return
  gl.useProgram(programa)

  const { datos, indices } = malla(innerWidth < 600 ? 110 : 150)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, datos, gl.STATIC_DRAW)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
  for (const [nombre, tamano, desde] of [['p', 3, 0], ['n', 3, 3], ['h', 1, 6], ['k', 4, 7]]) {
    const lugar = gl.getAttribLocation(programa, nombre)
    gl.enableVertexAttribArray(lugar)
    gl.vertexAttribPointer(lugar, tamano, gl.FLOAT, false, 44, desde * 4)
  }
  const uMatriz = gl.getUniformLocation(programa, 'm')
  gl.enable(gl.DEPTH_TEST)
  gl.clearColor(0, 0, 0, 0)

  // Las capas de encima: las rutas en SVG y los nombres en HTML.
  const svg = mapa.querySelector('svg')
  const capa = mapa.querySelector('.mapa-nombres')
  const SVG = 'http://www.w3.org/2000/svg'
  const caminos = {}
  for (const [ruta, { camino }] of Object.entries(RUTAS)) {
    const trazo = document.createElementNS(SVG, 'path')
    trazo.setAttribute('pathLength', '1')
    trazo.dataset.ruta = ruta
    svg.append(trazo)
    caminos[ruta] = { trazo, puntos: trazar(camino) }
  }
  const etiqueta = (texto, clase) => {
    const span = document.createElement('span')
    span.className = clase
    span.textContent = texto
    capa.append(span)
    return span
  }
  const nombres = NOMBRES.map(([x, z, texto, clase]) => ({ en: punto3d([x, z], 0.02), span: etiqueta(texto, `mapa-nombre ${clase}`) }))
  let paradas = []

  // La cámara: gira alrededor de su centro y viaja entre encuadres. Va baja,
  // como quien está parado en el altiplano: mira al horizonte, con la ruta
  // en la mitad de abajo y los volcanes recortados contra el cielo.
  const ENCUADRE = { centro: [0.06, 0.1, 0.08], distancia: 3.6 }
  const camara = { giro: 0.5, inclinacion: 0.36, centro: [...ENCUADRE.centro], distancia: ENCUADRE.distancia }
  let viaje = null
  let elegida = null
  let matriz = null
  let ancho = 1
  let altoLienzo = 1

  function encuadrar(ruta) {
    const puntos = caminos[ruta].puntos
    const centro = [0, 0, 0]
    for (const p of puntos) for (let i = 0; i < 3; i++) centro[i] += p[i] / puntos.length
    let radio = 0
    for (const p of puntos) radio = Math.max(radio, Math.hypot(p[0] - centro[0], p[2] - centro[2]))
    return { centro, distancia: Math.max(1.55, radio * 6) }
  }

  function elegir(ruta) {
    if (!caminos[ruta] || ruta === elegida) return
    elegida = ruta
    for (const { trazo } of Object.values(caminos)) trazo.classList.toggle('elegida', trazo.dataset.ruta === ruta)
    for (const { span } of paradas) span.remove()
    paradas = RUTAS[ruta].paradas.map(([i, texto], n) => ({
      en: punto3d(RUTAS[ruta].camino[i], 0.02),
      span: etiqueta(texto, `mapa-parada${n === 0 ? ' inicio' : ''}`),
    }))
    const destino = encuadrar(ruta)
    if (quieto) {
      Object.assign(camara, { centro: destino.centro, distancia: destino.distancia })
      dibujar()
      return
    }
    viaje = { desde: { centro: [...camara.centro], distancia: camara.distancia }, hasta: destino, inicio: performance.now(), dura: 1700 }
    pedir()
  }

  function medir() {
    const dpr = Math.min(devicePixelRatio || 1, innerWidth < 600 ? 1.5 : 2)
    ancho = mapa.clientWidth
    altoLienzo = mapa.clientHeight
    lienzo.width = Math.round(ancho * dpr)
    lienzo.height = Math.round(altoLienzo * dpr)
    svg.setAttribute('viewBox', `0 0 ${ancho} ${altoLienzo}`)
    gl.viewport(0, 0, lienzo.width, lienzo.height)
  }

  function proyectar([x, y, z]) {
    const m = matriz
    const w = m[3] * x + m[7] * y + m[11] * z + m[15]
    if (w <= 0) return null
    return [((m[0] * x + m[4] * y + m[8] * z + m[12]) / w + 1) * 0.5 * ancho, (1 - (m[1] * x + m[5] * y + m[9] * z + m[13]) / w) * 0.5 * altoLienzo]
  }

  function dibujar() {
    const { giro, inclinacion, centro, distancia } = camara
    const ojo = [
      centro[0] + distancia * Math.cos(inclinacion) * Math.sin(giro),
      centro[1] + distancia * Math.sin(inclinacion),
      centro[2] + distancia * Math.cos(inclinacion) * Math.cos(giro),
    ]
    const aspecto = ancho / altoLienzo
    // Mira un poco más allá de la ruta, para que quede abajo y el horizonte
    // suba en el cuadro.
    const adelante = distancia * 0.3
    const objetivo = [centro[0] - Math.sin(giro) * adelante, centro[1], centro[2] - Math.cos(giro) * adelante]
    const fov = aspecto < 1.2 ? 0.78 : 0.56
    matriz = multiplicar(perspectiva(fov, aspecto, 0.05, 20), mirar(ojo, objetivo))
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.uniformMatrix4fv(uMatriz, false, matriz)
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0)

    for (const { trazo, puntos } of Object.values(caminos)) {
      let d = ''
      for (const p of puntos) {
        const s = proyectar(p)
        if (s) d += `${d ? 'L' : 'M'}${s[0].toFixed(1)} ${s[1].toFixed(1)}`
      }
      trazo.setAttribute('d', d)
    }
    // Ningún nombre se sale por los costados del mapa: los de lugares van
    // centrados en su punto y las paradas empiezan en él (muestras en
    // parina.html). Se miden todos antes de mover ninguno.
    const etiquetas = [...nombres, ...paradas]
    const anchos = etiquetas.map(({ span }) => span.offsetWidth)
    const limite = capa.clientWidth
    etiquetas.forEach(({ en, span }, i) => {
      const s = proyectar(en)
      span.hidden = !s
      if (!s) return
      const centrado = span.classList.contains('mapa-nombre')
      const desde = centrado ? anchos[i] / 2 : 8
      const hasta = limite - (centrado ? anchos[i] / 2 : anchos[i] - 8)
      const x = Math.max(desde, Math.min(hasta, s[0]))
      span.style.transform = `translate(${x.toFixed(1)}px, ${s[1].toFixed(1)}px)`
    })
  }

  // El bucle corre mientras el mapa se ve y algo se mueve.
  let visible = false
  let cuadro = 0
  let antes = 0
  let arrastre = null
  let pausaHasta = 0
  const puede = () => visible && !document.hidden && !document.documentElement.classList.contains('en-espera')
  const curva = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

  function paso(ahora) {
    cuadro = 0
    const dt = Math.min(0.05, (ahora - (antes || ahora)) / 1000)
    antes = ahora
    if (viaje) {
      const t = Math.min(1, Math.max(0, (ahora - viaje.inicio) / viaje.dura))
      const e = curva(t)
      for (let i = 0; i < 3; i++) camara.centro[i] = mezcla(viaje.desde.centro[i], viaje.hasta.centro[i], e)
      camara.distancia = mezcla(viaje.desde.distancia, viaje.hasta.distancia, e)
      if (t === 1) viaje = null
    }
    if (!quieto && !arrastre) {
      // El giro retoma de a poco después de soltarlo: sin arranques bruscos.
      const ritmo = suave(pausaHasta, pausaHasta + 1400, ahora)
      camara.giro += dt * 0.07 * ritmo
    }
    dibujar()
    if (!quieto || viaje) pedir()
  }
  function pedir() {
    if (!cuadro && puede()) cuadro = requestAnimationFrame(paso)
  }
  function seguir() {
    if (puede()) pedir()
    else if (cuadro) {
      cancelAnimationFrame(cuadro)
      cuadro = 0
      antes = 0
    }
  }

  // Con el mouse se puede girar el relieve. En pantallas táctiles, no: el
  // gesto lateral es del visor del brief.
  lienzo.addEventListener('pointerdown', (evento) => {
    if (evento.pointerType !== 'mouse') return
    arrastre = { x: evento.clientX, giro: camara.giro }
    lienzo.setPointerCapture(evento.pointerId)
    mapa.classList.add('girando')
  })
  lienzo.addEventListener('pointermove', (evento) => {
    if (!arrastre) return
    camara.giro = arrastre.giro - (evento.clientX - arrastre.x) * 0.006
    if (quieto) dibujar()
  })
  const soltar = () => {
    if (!arrastre) return
    arrastre = null
    pausaHasta = performance.now() + 1500
    mapa.classList.remove('girando')
  }
  lienzo.addEventListener('pointerup', soltar)
  lienzo.addEventListener('pointercancel', soltar)

  document.querySelectorAll('input[name="ruta"]').forEach((radio) => {
    radio.addEventListener('change', () => radio.checked && elegir(radio.value))
  })

  mapa.hidden = false
  medir()
  // Parte con todo el altiplano a la vista y, al verse, baja a la ruta elegida.
  elegir(document.querySelector('input[name="ruta"]:checked')?.value || 'chungara')
  if (viaje) viaje.dura = 2400
  dibujar()

  new ResizeObserver(() => {
    medir()
    dibujar()
  }).observe(mapa)
  let primeraVez = true
  new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting
    if (visible && primeraVez && viaje) viaje.inicio = performance.now() + 500
    if (visible) primeraVez = false
    seguir()
  }).observe(mapa)
  document.addEventListener('visibilitychange', seguir)
  new MutationObserver(seguir).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
}

if (mapa) {
  const empezar = () => ('requestIdleCallback' in window ? requestIdleCallback(montar, { timeout: 1500 }) : setTimeout(montar, 200))
  if (document.readyState === 'complete') empezar()
  else addEventListener('load', empezar, { once: true })
}
