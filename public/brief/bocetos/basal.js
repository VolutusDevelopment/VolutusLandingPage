/**
 * Basal (basal.html): el ensayo del corte, el logo de la cabecera y la marca
 * de la sección que se está leyendo.
 *
 * El ensayo sale de un modelo, con su tiempo de 0 a 1: el suelo se mece con
 * una envolvente que empieza y termina con velocidad cero y se amortigua; el
 * edificio aislado se corre una décima de eso y los aisladores toman la
 * diferencia; la deformada punteada es el mismo edificio sin aislación, que
 * se dobla con el suelo. El registro se dibuja con el mismo modelo, así que
 * las plumas y el corte siempre dicen lo mismo. El tiempo sigue al scroll con
 * un resorte, para que la rueda del mouse no lo mueva a tirones.
 *
 * El logo se mueve con la velocidad del scroll: su suelo se corre, los
 * aisladores se inclinan y la losa queda quieta. Al soltar, vuelve frenando.
 *
 * Todo se detiene con la pestaña oculta o la página en espera en el visor del
 * brief (`.en-espera`). Con el movimiento reducido, el corte queda en reposo
 * y el registro, dibujado entero: solo corre la marca de la sección.
 */

const raiz = document.documentElement
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches
const telefono = matchMedia('(max-width: 899px)')
const limitar = (valor) => Math.min(1, Math.max(0, valor))
const seguir = (desde, hacia, dt, tiempo) => desde + (hacia - desde) * (1 - Math.exp(-dt / tiempo))

// ---- El modelo ----
const CICLOS = 6
const SUELO = 16 // desplazamiento del suelo en el pico, en unidades del dibujo
const CM = 22 / SUELO // el pico son 22 cm
const crudo = (t) => (t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t) ** 2 * Math.exp(-2.4 * t) * Math.sin(2 * Math.PI * CICLOS * t))
let pico = 0
for (let i = 1; i < 2000; i++) pico = Math.max(pico, Math.abs(crudo(i / 2000)))
const suelo = (t) => (SUELO * crudo(t)) / pico
const piso = (t) => 0.09 * suelo(t - 0.01)
const deriva = (t) => 1.1 * suelo(t - 0.025)
const fuerza = (t) => (t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t) ** 2 * Math.exp(-2.4 * t))
let fuerzaPico = 0
for (let i = 1; i < 200; i++) fuerzaPico = Math.max(fuerzaPico, fuerza(i / 200))

// ---- El corte y el registro ----
const corte = document.querySelector('.corte')
const pasos = document.querySelector('.pasos-ensayo')
const escena = document.querySelector('.escena')
const capaSuelo = corte.querySelector('.suelo')
const capaEdificio = corte.querySelector('.edificio')
const aisladores = corte.querySelectorAll('.aislador')
const deformada = corte.querySelector('.deformada-dibujo')
const [trazaSuelo, trazaPiso] = document.querySelectorAll('.traza path[pathLength]')
const [plumaSuelo, plumaPiso] = document.querySelectorAll('.pluma')
const lecturas = Object.fromEntries([...document.querySelectorAll('[data-lee]')].map((b) => [b.dataset.lee, b]))
const cifra = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const conSigno = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: 'exceptZero' })

const NIVELES = [292, 260, 220, 180, 140, 100, 60]
const COLUMNAS = [140, 210, 280, 350, 420]
const forma = (y) => Math.sin(((Math.PI / 2) * (292 - y)) / 232)

// El registro, muestreado: la línea, y cuánto de su largo hay hasta cada
// instante, para que el trazo dibujado termine justo bajo su pluma.
const MUESTRAS = 300
const alto = (desplazamiento) => 50 - (desplazamiento / SUELO) * 41.6
function muestrear(funcion) {
  const puntos = []
  const largos = [0]
  for (let i = 0; i <= MUESTRAS; i++) {
    const t = i / MUESTRAS
    puntos.push([600 * t, alto(funcion(t))])
    if (i) largos.push(largos[i - 1] + Math.hypot(puntos[i][0] - puntos[i - 1][0], puntos[i][1] - puntos[i - 1][1]))
  }
  const total = largos[MUESTRAS]
  return { d: `M${puntos.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}`, fraccion: largos.map((largo) => largo / total) }
}
const registroSuelo = muestrear(suelo)
const registroPiso = muestrear(piso)
const hasta = (registro, t) => {
  const i = t * MUESTRAS
  const a = Math.floor(i)
  const b = Math.min(MUESTRAS, a + 1)
  return registro.fraccion[a] + (registro.fraccion[b] - registro.fraccion[a]) * (i - a)
}

function pintarEnsayo(t) {
  const s = suelo(t)
  const p = piso(t)
  const d = deriva(t)
  capaSuelo.style.translate = `${s.toFixed(2)}px 0`
  capaEdificio.style.translate = `${p.toFixed(2)}px 0`
  const inclinacion = `skewX(${((Math.atan((s - p) / 22) * 180) / Math.PI).toFixed(2)}deg)`
  aisladores.forEach((aislador) => (aislador.style.transform = inclinacion))

  const corrido = NIVELES.map((y) => s + d * forma(y))
  const columnas = COLUMNAS.map((x) => `M${NIVELES.map((y, i) => `${(x + corrido[i]).toFixed(1)} ${y}`).join('L')}`)
  const losas = NIVELES.slice(1).map((y, i) => `M${(140 + corrido[i + 1]).toFixed(1)} ${y}H${(420 + corrido[i + 1]).toFixed(1)}`)
  deformada.setAttribute('d', columnas.join('') + losas.join(''))
  deformada.style.opacity = limitar((fuerza(t) / fuerzaPico) * 2.4).toFixed(3)

  trazaSuelo.style.strokeDashoffset = 1 - hasta(registroSuelo, t)
  trazaPiso.style.strokeDashoffset = 1 - hasta(registroPiso, t)
  const pluma = limitar(Math.min(t, 1 - t) * 30).toFixed(3)
  for (const [circulo, valor] of [
    [plumaSuelo, s],
    [plumaPiso, p],
  ]) {
    circulo.setAttribute('cx', (600 * t).toFixed(1))
    circulo.setAttribute('cy', alto(valor).toFixed(1))
    circulo.style.opacity = pluma
  }

  lecturas.t.textContent = cifra.format(30 * t)
  lecturas.suelo.textContent = conSigno.format(s * CM)
  lecturas.piso.textContent = conSigno.format(p * CM)
}

function progreso() {
  const pantalla = innerHeight
  if (telefono.matches) {
    const caja = escena.getBoundingClientRect()
    return limitar(((pantalla - caja.top) / (pantalla + caja.height) - 0.28) / 0.44)
  }
  const caja = pasos.getBoundingClientRect()
  return limitar((pantalla * 0.55 - caja.top) / caja.height / 0.85)
}

// ---- La cabecera ----
const cabecera = document.querySelector('.cabecera')
const logo = cabecera.querySelector('.logo-vivo')
const ALTO_AISLADOR = 8

let tiempo = 0
let pintado = -1
let corrimiento = 0
let metaCorrimiento = 0
let ultimoY = scrollY
let ultimoScroll = 0
let antes = 0
let corriendo = false

function cuadro(ahora) {
  if (document.hidden || raiz.classList.contains('en-espera')) {
    corriendo = false
    antes = 0
    return
  }
  const dt = antes ? Math.min(50, ahora - antes) : 16
  antes = ahora

  const meta = progreso()
  tiempo = Math.abs(meta - tiempo) < 1e-4 ? meta : seguir(tiempo, meta, dt, 140)
  if (tiempo !== pintado) {
    pintarEnsayo(tiempo)
    pintado = tiempo
  }

  if (ahora - ultimoScroll > 100) metaCorrimiento = 0
  corrimiento = seguir(corrimiento, metaCorrimiento, dt, 160)
  if (!metaCorrimiento && Math.abs(corrimiento) < 0.01) corrimiento = 0
  logo.style.setProperty('--suelo', corrimiento.toFixed(2))
  logo.style.setProperty('--inclina', ((Math.atan(corrimiento / ALTO_AISLADOR) * 180) / Math.PI).toFixed(2))

  if (tiempo !== meta || corrimiento) requestAnimationFrame(cuadro)
  else {
    corriendo = false
    antes = 0
  }
}

function despertar() {
  if (quieto || corriendo) return
  corriendo = true
  requestAnimationFrame(cuadro)
}

addEventListener(
  'scroll',
  () => {
    const ahora = performance.now()
    const velocidad = (scrollY - ultimoY) / Math.max(8, ahora - ultimoScroll)
    ultimoY = scrollY
    ultimoScroll = ahora
    metaCorrimiento = Math.max(-2.6, Math.min(2.6, -velocidad * 0.9))
    cabecera.classList.toggle('pegada', scrollY > 4)
    despertar()
  },
  { passive: true }
)
document.addEventListener('visibilitychange', despertar)
new MutationObserver(despertar).observe(raiz, { attributes: true, attributeFilter: ['class'] })
if (!quieto) {
  trazaSuelo.setAttribute('d', registroSuelo.d)
  trazaPiso.setAttribute('d', registroPiso.d)
  despertar()
}

// ---- La sección que se está leyendo ----
// Una franja fina a media pantalla: la sección que la cruza se marca en el
// menú, con su pestaña en marino.
const enlaces = [...cabecera.querySelectorAll('nav a')]
const secciones = enlaces.map((enlace) => document.querySelector(enlace.hash))
const cruzan = new Set()
function marcar() {
  const actual = enlaces[secciones.findIndex((seccion) => cruzan.has(seccion))]
  for (const enlace of enlaces) {
    if (enlace === actual) enlace.setAttribute('aria-current', 'location')
    else enlace.removeAttribute('aria-current')
  }
}
const vigia = new IntersectionObserver(
  (entradas) => {
    for (const { isIntersecting, target } of entradas) {
      if (isIntersecting) cruzan.add(target)
      else cruzan.delete(target)
    }
    marcar()
  },
  { rootMargin: '-45% 0px -50% 0px' }
)
secciones.forEach((seccion) => seccion && vigia.observe(seccion))
