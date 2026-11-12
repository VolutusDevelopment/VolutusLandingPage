/**
 * Lo que mueve a Destello (destello.html).
 *
 * - La cámara de cromo del fondo: una compacta de los 2000 dibujada en WebGL
 *   propio, sin dependencias, con formas a distancia (raymarching): cuerpo,
 *   lente que sale con el zoom, flash, disparador y pantalla. Recorre la
 *   página con el scroll: cada sección le da una pose (dónde está, cuánto
 *   mide, hacia dónde mira y cuánto zoom tiene) y entre una y otra pasa con
 *   curva suave. Al entrar llega girando y dispara; en la galería vuelve a
 *   disparar, y también con el botón de la portada.
 * - El disparador de la portada: cada toque pasa a la foto siguiente en la
 *   pantallita, que se revela de negra a nítida, y dispara el flash.
 * - La pantallita de la cápsula de arriba dice en qué parte de la página vas.
 *
 * Arranca después de la carga y dibuja solo mientras la pestaña se ve y la
 * página no está en espera en el visor; si el navegador dibuja por software,
 * no se monta. Con el movimiento reducido, la cámara
 * queda quieta en su pose de portada y no hay flash. Sin WebGL no hay cámara
 * de fondo y la página se ve completa.
 */

const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches
const raiz = document.documentElement

// ---- El disparador de la portada ----

function montarDisparador(disparar) {
  const portada = document.querySelector('.portada')
  const boton = portada?.querySelector('.disparador')
  if (!boton) return
  const tomas = [...portada.querySelectorAll('.toma')]
  const contador = portada.querySelector('.contador')
  let actual = 0
  const pedirLasDemas = () => tomas.forEach((toma) => (toma.querySelector('img').loading = 'eager'))
  if (document.readyState === 'complete') pedirLasDemas()
  else addEventListener('load', pedirLasDemas, { once: true })

  boton.addEventListener('click', () => {
    tomas[actual].classList.remove('actual')
    actual = (actual + 1) % tomas.length
    tomas[actual].classList.add('actual')
    contador.textContent = `${actual + 1}/${tomas.length}`
    disparar()
  })
}

// El flash de la portada: un destello blanco que crece y se apaga.
function flashDePortada() {
  const portada = document.querySelector('.portada')
  if (!portada || quieto) return
  portada.classList.remove('dispara')
  void portada.offsetWidth
  portada.classList.add('dispara')
}

// ---- La pantallita de la cápsula: en qué parte vas ----

function montarCapitulos() {
  const pantalla = document.querySelector('[data-capitulo]')
  const secciones = document.querySelectorAll('[data-nombre]')
  if (!pantalla || !secciones.length || !('IntersectionObserver' in window)) return
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const { isIntersecting, target } of entradas) {
        if (isIntersecting) pantalla.textContent = target.dataset.nombre
      }
    },
    { rootMargin: '-48% 0px -48% 0px' }
  )
  secciones.forEach((seccion) => observador.observe(seccion))
}

// ---- La cámara de cromo ----

const VERTICES = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`

const FRAGMENTOS = `
precision highp float;
uniform vec2 uRes;
uniform vec3 uPos;
uniform float uEsc;
uniform mat3 uRot;
uniform float uZoom;
uniform float uFlash;
uniform float uTiempo;
const vec3 OJO = vec3(0.0, 0.0, 6.0);

float caja(vec3 p, vec3 b, float r) { vec3 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r; }
float tuboZ(vec3 p, float r, float h) { vec2 d = abs(vec2(length(p.xy), p.z)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }
float tuboY(vec3 p, float r, float h) { vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }

// Devuelve la distancia y el material: 1 cromo, 2 vidrio, 3 flash, 4 rosa, 5 pantalla.
vec2 escena(vec3 p) {
  vec2 r = vec2(caja(p, vec3(0.84, 0.52, 0.2), 0.17), 1.0);
  vec3 l = p - vec3(0.24, -0.03, 0.0);
  float l1 = 0.05 + 0.15 * uZoom;
  float l2 = 0.045 + 0.13 * uZoom;
  float z1 = 0.24 + l1;
  float z2 = 0.24 + 2.0 * l1 + l2;
  float anillo = tuboZ(l - vec3(0.0, 0.0, 0.22), 0.37, 0.045) - 0.01;
  float tubo1 = tuboZ(l - vec3(0.0, 0.0, z1), 0.3, l1) - 0.01;
  float tubo2 = tuboZ(l - vec3(0.0, 0.0, z2), 0.23, l2) - 0.01;
  float lente = min(anillo, min(tubo1, tubo2));
  if (lente < r.x) r = vec2(lente, 1.0);
  float vidrio = tuboZ(l - vec3(0.0, 0.0, z2 + l2), 0.165, 0.012);
  if (vidrio < r.x) r = vec2(vidrio, 2.0);
  float flash = caja(p - vec3(-0.5, 0.3, 0.2), vec3(0.17, 0.075, 0.03), 0.02);
  if (flash < r.x) r = vec2(flash, 3.0);
  float visor = caja(p - vec3(-0.18, 0.32, 0.2), vec3(0.06, 0.045, 0.025), 0.01);
  if (visor < r.x) r = vec2(visor, 2.0);
  float boton = tuboY(p - vec3(-0.48, 0.55, 0.0), 0.1, 0.035) - 0.01;
  if (boton < r.x) r = vec2(boton, 4.0);
  float dial = tuboY(p - vec3(0.42, 0.55, 0.0), 0.14, 0.025) - 0.008;
  if (dial < r.x) r = vec2(dial, 1.0);
  float pantalla = caja(p - vec3(-0.12, 0.0, -0.2), vec3(0.5, 0.34, 0.025), 0.03);
  if (pantalla < r.x) r = vec2(pantalla, 5.0);
  return r;
}

vec3 aObjeto(vec3 p) { return ((p - uPos) / uEsc) * uRot; }
vec2 mapa(vec3 p) { vec2 d = escena(aObjeto(p)); return vec2(d.x * uEsc, d.y); }

vec3 normal(vec3 p) {
  const vec2 e = vec2(0.0015, -0.0015);
  return normalize(e.xyy * mapa(p + e.xyy).x + e.yyx * mapa(p + e.yyx).x + e.yxy * mapa(p + e.yxy).x + e.xxx * mapa(p + e.xxx).x);
}

// El estudio que se refleja en el cromo: cielo lila, horizonte blanco,
// piso de tinta y tres paneles de luz; hielo a un lado y rosa al otro.
vec3 estudio(vec3 d) {
  vec3 c = mix(vec3(1.0), vec3(0.86, 0.8, 1.0), smoothstep(0.02, 0.7, d.y));
  c = mix(c, vec3(0.13, 0.12, 0.2), smoothstep(0.0, -0.3, d.y));
  float paneles = smoothstep(0.9, 0.97, sin(atan(d.x, d.z) * 3.0 + 0.6)) * smoothstep(0.05, 0.25, d.y) * smoothstep(0.85, 0.55, d.y);
  c += paneles * 0.9;
  c = mix(c, vec3(0.62, 0.85, 1.0), 0.32 * smoothstep(0.2, 1.0, d.x));
  c = mix(c, vec3(1.0, 0.6, 0.84), 0.26 * smoothstep(0.2, 1.0, -d.x));
  return c;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
  vec3 rd = normalize(vec3(uv * 0.27, -1.0));
  vec3 color = vec3(0.0);
  float alfa = 0.0;

  // Solo se busca la cámara dentro de su esfera: lo demás es transparente.
  vec3 oc = OJO - uPos;
  float b = dot(oc, rd);
  float radio = 1.45 * uEsc;
  float h = b * b - dot(oc, oc) + radio * radio;
  if (h > 0.0) {
    h = sqrt(h);
    float t = max(-b - h, 0.0);
    float fin = -b + h;
    for (int i = 0; i < 80; i++) {
      vec3 p = OJO + rd * t;
      vec2 d = mapa(p);
      if (d.x < 0.0012) {
        vec3 n = normal(p);
        vec3 v = -rd;
        vec3 r = reflect(rd, n);
        float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
        vec3 luz = normalize(vec3(-0.5, 0.7, 0.6));
        float brillo = pow(max(dot(r, luz), 0.0), 70.0);
        float difusa = max(dot(n, luz), 0.0);
        if (d.y < 1.5) {
          color = estudio(r) * vec3(0.93, 0.93, 0.98);
          color = mix(color, vec3(1.0), fres * 0.35) + brillo * 0.8;
        } else if (d.y < 2.5) {
          color = vec3(0.05, 0.06, 0.12) + estudio(r) * (0.25 + fres * 0.5) + brillo;
        } else if (d.y < 3.5) {
          color = mix(vec3(0.86, 0.88, 0.94), estudio(r), 0.4) + uFlash * 2.5;
        } else if (d.y < 4.5) {
          color = vec3(1.0, 0.6, 0.84) * (0.55 + 0.5 * difusa) + estudio(r) * fres * 0.4 + brillo * 0.7;
        } else {
          float rayas = 0.04 * step(0.5, fract((aObjeto(p).y + uTiempo * 0.05) * 22.0));
          color = vec3(0.11, 0.13, 0.19) + vec3(0.62, 0.85, 1.0) * (0.12 + rayas) + estudio(r) * fres * 0.35 + brillo * 0.6;
        }
        alfa = 1.0;
        break;
      }
      t += d.x;
      if (t > fin) break;
    }
  }

  // El brillo del flash alrededor de la cámara.
  if (uFlash > 0.001) {
    vec3 donde = uPos + uRot * (vec3(-0.5, 0.3, 0.25) * uEsc);
    vec3 a = donde - OJO;
    float cerca = length(a - rd * dot(a, rd));
    float halo = uFlash * exp(-cerca * cerca * 3.0 / (uEsc * uEsc));
    color = color * alfa + vec3(1.0) * halo;
    alfa = min(1.0, alfa + halo);
  } else {
    color *= alfa;
  }
  gl_FragColor = vec4(color, alfa);
}`

// Las poses: x e y en la pantalla (de -1 a 1), el tamaño, los giros
// (alrededor de y, de x y de z, en radianes) y cuánto zoom sale la lente.
// En pantallas angostas no hay costados libres: después de la portada la
// cámara sale de cuadro y vuelve solo para disparar en la galería.
const POSES_ANCHAS = {
  inicio: { x: 0.5, y: 0.02, s: 1.0, giro: -0.6, cabeceo: 0.14, ladeo: -0.06, zoom: 0 },
  catalogo: { x: -0.66, y: 0.34, s: 0.66, giro: 0.95, cabeceo: 0.28, ladeo: 0.2, zoom: 1 },
  revision: { x: 0.62, y: -0.05, s: 0.82, giro: 2.65, cabeceo: -0.1, ladeo: 0.06, zoom: 0.4 },
  galeria: { x: 0.0, y: 0.42, s: 0.7, giro: 0.0, cabeceo: 0.05, ladeo: 0.0, zoom: 0.7 },
  garantia: { x: 0.64, y: 0.6, s: 0.5, giro: -0.95, cabeceo: 0.24, ladeo: -0.12, zoom: 0 },
  vender: { x: 1.02, y: 0.78, s: 0.6, giro: 3.05, cabeceo: 0.06, ladeo: 0.3, zoom: 0 },
  pie: { x: 0.0, y: -1.7, s: 0.6, giro: 6.2, cabeceo: 0.3, ladeo: 0.0, zoom: 0 },
}
const POSES_ANGOSTAS = {
  inicio: { x: 0.04, y: 0.36, s: 0.55, giro: -0.6, cabeceo: 0.14, ladeo: -0.08, zoom: 0 },
  catalogo: { x: 1.7, y: 0.5, s: 0.42, giro: 0.95, cabeceo: 0.28, ladeo: 0.2, zoom: 1 },
  revision: { x: 1.7, y: 0.3, s: 0.42, giro: 2.65, cabeceo: -0.1, ladeo: 0.06, zoom: 0.4 },
  galeria: { x: 0.0, y: 0.56, s: 0.46, giro: 0.0, cabeceo: 0.05, ladeo: 0.0, zoom: 0.7 },
  garantia: { x: -1.7, y: 0.4, s: 0.42, giro: -0.95, cabeceo: 0.24, ladeo: -0.12, zoom: 0 },
  vender: { x: -1.7, y: 0.4, s: 0.42, giro: 3.05, cabeceo: 0.06, ladeo: 0.04, zoom: 0 },
  pie: { x: 0.0, y: -1.7, s: 0.4, giro: 6.2, cabeceo: 0.3, ladeo: 0.0, zoom: 0 },
}
const POSES_MEDIAS = { ...POSES_ANGOSTAS, inicio: { ...POSES_ANGOSTAS.inicio, y: 0.46 } }
const CLAVES = ['x', 'y', 's', 'giro', 'cabeceo', 'ladeo', 'zoom']
const suave = (t) => t * t * t * (t * (t * 6 - 15) + 10)
const mezclar = (a, b, t) => Object.fromEntries(CLAVES.map((k) => [k, a[k] + (b[k] - a[k]) * t]))

function rotacion(giro, cabeceo, ladeo) {
  const [cy, sy, cx, sx, cz, sz] = [Math.cos(giro), Math.sin(giro), Math.cos(cabeceo), Math.sin(cabeceo), Math.cos(ladeo), Math.sin(ladeo)]
  // R = Rz · Rx · Ry, por columnas (como la espera WebGL).
  const ry = [cy, 0, -sy, 0, 1, 0, sy, 0, cy]
  const rx = [1, 0, 0, 0, cx, sx, 0, -sx, cx]
  const rz = [cz, sz, 0, -sz, cz, 0, 0, 0, 1]
  const por = (a, b) => {
    const c = new Array(9).fill(0)
    for (let col = 0; col < 3; col++) for (let fila = 0; fila < 3; fila++) for (let k = 0; k < 3; k++) c[col * 3 + fila] += a[k * 3 + fila] * b[col * 3 + k]
    return c
  }
  return por(rz, por(rx, ry))
}

function montarCamara() {
  const lienzo = document.querySelector('.escena-3d')
  const gl = lienzo?.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false })
  if (!gl) return null
  // Dibujada por software (sin tarjeta de video), la cámara costaría cada
  // cuadro: no se monta y la página queda completa sin ella.
  const info = gl.getExtension('WEBGL_debug_renderer_info')
  if (/swiftshader|llvmpipe|software|basic render/i.test(String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || ''))) return null
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
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) return null
  gl.useProgram(programa)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const lugar = gl.getAttribLocation(programa, 'p')
  gl.enableVertexAttribArray(lugar)
  gl.vertexAttribPointer(lugar, 2, gl.FLOAT, false, 0, 0)
  const u = Object.fromEntries(['uRes', 'uPos', 'uEsc', 'uRot', 'uZoom', 'uFlash', 'uTiempo'].map((n) => [n, gl.getUniformLocation(programa, n)]))

  // Dónde empieza cada sección, para repartir las poses por el scroll.
  let anclas = []
  let poses = POSES_ANCHAS
  let ancho = 1
  let alto = 1
  function medir() {
    const angosta = innerWidth < 900
    poses = innerWidth < 600 ? POSES_ANGOSTAS : angosta ? POSES_MEDIAS : POSES_ANCHAS
    const escala = Math.min(devicePixelRatio || 1, angosta ? 1.25 : 1.5) * (angosta ? 0.8 : 0.85)
    ancho = innerWidth
    alto = innerHeight
    lienzo.width = Math.round(ancho * escala)
    lienzo.height = Math.round(alto * escala)
    gl.viewport(0, 0, lienzo.width, lienzo.height)
    anclas = [...document.querySelectorAll('[data-pose]')].map((seccion) => ({
      y: seccion.getBoundingClientRect().top + scrollY - alto * 0.35,
      pose: seccion.dataset.pose,
    }))
  }

  function poseDelScroll() {
    const y = scrollY
    if (!anclas.length) return poses.inicio
    if (y <= anclas[0].y) return poses[anclas[0].pose]
    for (let i = 0; i < anclas.length - 1; i++) {
      const a = anclas[i]
      const b = anclas[i + 1]
      if (y < b.y) {
        // Se queda quieta un tramo en cada sección y viaja en el resto.
        const t = Math.min(1, Math.max(0, ((y - a.y) / (b.y - a.y) - 0.25) / 0.6))
        return mezclar(poses[a.pose], poses[b.pose], suave(t))
      }
    }
    return poses[anclas[anclas.length - 1].pose]
  }

  // El estado que se dibuja sigue a la pose del scroll con un resorte, así
  // nada salta aunque el scroll dé tirones.
  const estado = { ...poses.inicio, s: quieto ? poses.inicio.s : 0.05, giro: quieto ? poses.inicio.giro : poses.inicio.giro - 5 }
  const raton = [0, 0]
  const ratonSuave = [0, 0]
  let flash = 0
  let llegada = quieto ? 1 : 0
  const inicio = performance.now()
  let antes = 0
  let cuadro = 0
  let enGaleria = false

  function dibujar(ahora) {
    cuadro = 0
    const dt = Math.min(0.05, (ahora - (antes || ahora)) / 1000)
    antes = ahora
    const segundos = (ahora - inicio) / 1000
    const meta = quieto ? poses.inicio : poseDelScroll()
    if (!quieto) {
      llegada = Math.min(1, segundos / 1.8)
      const entrada = suave(llegada)
      const k = 1 - Math.exp(-dt * (llegada < 1 ? 3.2 : 6))
      for (const clave of CLAVES) estado[clave] += (meta[clave] - estado[clave]) * k
      if (llegada < 1) {
        estado.s = 0.05 + (meta.s - 0.05) * entrada
        estado.giro = meta.giro - 5 * (1 - entrada)
      }
      for (let i = 0; i < 2; i++) ratonSuave[i] += (raton[i] - ratonSuave[i]) * (1 - Math.exp(-dt * 5))
      flash = Math.max(0, flash - dt * 2.2)
    } else Object.assign(estado, meta)

    const flota = quieto ? 0 : Math.sin(segundos * 0.9) * 0.025
    const mitadAlto = 6 * 0.27
    const mitadAncho = mitadAlto * (ancho / alto)
    gl.uniform2f(u.uRes, lienzo.width, lienzo.height)
    gl.uniform3f(u.uPos, estado.x * mitadAncho, estado.y * mitadAlto + flota, 0)
    gl.uniform1f(u.uEsc, estado.s)
    const giro = estado.giro + (quieto ? 0 : Math.sin(segundos * 0.45) * 0.08 + ratonSuave[0] * 0.35)
    const cabeceo = estado.cabeceo + (quieto ? 0 : ratonSuave[1] * 0.2)
    gl.uniformMatrix3fv(u.uRot, false, rotacion(giro, cabeceo, estado.ladeo))
    gl.uniform1f(u.uZoom, Math.max(0, Math.min(1, estado.zoom)))
    gl.uniform1f(u.uFlash, flash * flash)
    gl.uniform1f(u.uTiempo, segundos)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    if (!quieto) pedir()
  }
  const puede = () => !document.hidden && !raiz.classList.contains('en-espera')
  function pedir() {
    if (!cuadro && puede()) cuadro = requestAnimationFrame(dibujar)
  }
  function seguir() {
    if (puede()) {
      antes = 0
      pedir()
    } else if (cuadro) {
      cancelAnimationFrame(cuadro)
      cuadro = 0
    }
  }

  addEventListener('pointermove', (evento) => {
    if (evento.pointerType !== 'mouse') return
    raton[0] = (evento.clientX / innerWidth) * 2 - 1
    raton[1] = (evento.clientY / innerHeight) * 2 - 1
  })
  addEventListener('resize', () => {
    medir()
    if (quieto) requestAnimationFrame(dibujar)
  })
  addEventListener('scroll', () => quieto && !cuadro && (cuadro = requestAnimationFrame(dibujar)), { passive: true })
  document.addEventListener('visibilitychange', seguir)
  new MutationObserver(seguir).observe(raiz, { attributes: true, attributeFilter: ['class'] })

  // La galería es oscura: al entrar, la cámara dispara.
  const galeria = document.querySelector('[data-pose="galeria"]')
  if (galeria && !quieto)
    new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting && !enGaleria) flash = 1
      enGaleria = entrada.isIntersecting
    }, { threshold: 0.35 }).observe(galeria)

  medir()
  new ResizeObserver(medir).observe(document.body)
  lienzo.classList.add('lista')
  requestAnimationFrame(dibujar)
  return {
    disparar() {
      if (quieto) return
      flash = 1
    },
  }
}

function empezar() {
  const camara = montarCamara()
  const disparar = () => {
    camara?.disparar()
    flashDePortada()
  }
  montarDisparador(disparar)
  montarCapitulos()
  // La entrada: la cámara llega girando y, al quedar en su sitio, dispara.
  if (!quieto) setTimeout(disparar, 1500)
}

// Arranca cuando la página ya cargó y el navegador está libre.
const enCalma = () => ('requestIdleCallback' in window ? requestIdleCallback(empezar, { timeout: 900 }) : setTimeout(empezar, 200))
if (document.readyState === 'complete') enCalma()
else addEventListener('load', enCalma, { once: true })
