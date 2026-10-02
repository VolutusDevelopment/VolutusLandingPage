/**
 * El juego de las páginas de error, la 404 y la de los 5xx: un Duck Hunt con
 * la nube.
 *
 * Al empezar, la volutus se deshace en cúmulos repartidos por el cielo, y los
 * patos salen de dentro de ellos, como los del original desde el pasto. Vuelan
 * por el cielo y, cazados, caen a través de las nubes. La nube no se imita: el
 * pato que cae le sopla su aire de verdad con el evento `soplo` de nubes.js,
 * con la misma física que el cursor, así que la corta a su paso y la nube se
 * vuelve a cerrar sola. Al terminar, los cúmulos se juntan otra vez en la
 * volutus.
 *
 * Los cúmulos son por el juego: el rollo es grueso a la izquierda y un hilo a
 * la derecha, y los patos quedaban todos de un lado. La transición la lleva
 * este archivo y no el pintor: en cada fotograma le dice a la nube, con el
 * evento `forma`, cuánto va (de 0 en la volutus a 1 en los cúmulos) y dónde
 * está cada cúmulo. Así el juego sabe siempre dónde están y no espera a que
 * lleguen: un pato puede salir de una nube que todavía viaja.
 *
 * Lo descarga «Jugar» (src/client.js), y el mismo botón lo termina. En /pato
 * empieza solo, en cuanto la nube pinta.
 *
 * Los patos (src/lib/pato.js) se dibujan con la trama de la nube: cada píxel
 * del sprite es un punto de su rejilla —la misma celda y el mismo origen—, así
 * que, dentro de ella, los puntos de la nube tapan justo los del pato y solo se
 * le ve donde se abre.
 *
 * El pato que se escapa después de que le dispararon se burla antes de irse:
 * vuela al claro del cielo más lejos de las nubes, se agranda y se ríe en un
 * globo, «JA JA JA». Es lo que en el original hace el perro.
 *
 * Al cazar 30 patos sale uno más a reclamar: vuela al claro y dice, en tres
 * líneas, «MATASTE A / TODA MI / FAMILIA». Después la partida sigue.
 *
 * Las medidas van en altos del lienzo de la nube, como todo lo de la nube: así
 * el juego cuesta lo mismo en cualquier pantalla.
 *
 * La partida no tiene fin: sigue hasta «Terminar». Con movimiento reducido no
 * se ofrece, y si se activa a mitad de partida, termina con el pato siguiente
 * y la volutus vuelve sin transición.
 */

import { DPR_MAXIMO } from './nubes.js'
import { quieto } from './lib/movimiento.js'
import { ABAJO, ARRIBA, CAE, COLORES, HERIDO } from './lib/pato.js'

// A ojo. Las velocidades van en altos por segundo y los tiempos en segundos.
const VELOCIDAD = 0.7
// Cada pato cazado vuela un poco más rápido que el anterior, hasta el doble.
const ACELERA = 1.06
const VIDA = 6
const PASMO = 0.35
const GRAVEDAD = 3
const ALETEO = 8
const VUELTA = 0.12
// Lo que tarda la volutus en deshacerse en cúmulos, o en volver a juntarse.
const TRANSICION = 1.6
// Hasta dónde baja a volar: por encima de «Jugar», que va abajo.
const SUELO = 0.8
// La tolerancia del disparo, en px. Con el dedo es el doble: tapa justo lo que
// apunta.
const MARGEN = 10
// La burla: lo que tarda en llegar al claro, lo que dura la risa, cuántas
// veces se agranda como mucho y desde qué holgura (ver `claro`) el cielo ya
// está despejado: el relieve de la nube pasa un poco su elipse.
const LLEGADA = 0.5
const RISA = 2
const GRANDE = 3
const LIBRE = 1.3
// Al cazar estos, sale el que reclama por su familia. Una sola vez por
// partida.
const META = 15
// Lo que dice el que reclama, en líneas para que el globo quepa en el cielo.
const RECLAMO = ['FELICIDADES,','MATASTE A', 'TODA MI', 'FAMILIA']

// Los cúmulos, como en una foto de cielo de buen tiempo: grandes, medianos y
// jirones. Cada uno va en su franja del ancho, de izquierda a derecha, corrido
// un poco de su centro (`corre`, en franjas) y alternando alto y bajo (`v`, la
// fracción del alto). `peso` es su tamaño relativo: el de verdad sale de
// `repartir`. Tantos como `cumulos` en nubes-lienzo.js.
const CUMULOS = [
  { peso: 0.8, v: 0.55, corre: 0.1 },
  { peso: 0.45, v: 0.3, corre: -0.15 },
  { peso: 1, v: 0.5, corre: 0 },
  { peso: 0.4, v: 0.72, corre: 0.15 },
  { peso: 0.7, v: 0.4, corre: -0.1 },
  { peso: 0.5, v: 0.65, corre: 0.15 },
  { peso: 0.9, v: 0.48, corre: -0.05 },
  { peso: 0.35, v: 0.28, corre: 0.2 },
  { peso: 0.6, v: 0.62, corre: -0.15 },
  { peso: 0.45, v: 0.35, corre: 0.1 },
]
// Cuántos caben, por el ancho del cielo en px CSS: XL, L, M y S.
const POR_ANCHO = [
  [1280, 10],
  [1024, 8],
  [480, 6],
  [0, 4],
]
// El área de un cúmulo de radio 1: media elipse de 1.6 × 1 arriba y otra de
// 1.6 × 1/1.8 abajo, la base aplanada (ver `cumulo` en nubes-lienzo.js).
const AREA = (Math.PI * 1.6 * (1 + 1 / 1.8)) / 2

// Las letras del contador y de la burla, en 3×5 leídas por filas: el bit 14 es
// la esquina de arriba a la izquierda. Mayúsculas, como en el NES.
const GLIFOS = {
  0: 0x7b6f,
  1: 0x2c97,
  2: 0x73e7,
  3: 0x73cf,
  4: 0x5bc9,
  5: 0x79cf,
  6: 0x79ef,
  7: 0x7249,
  8: 0x7bef,
  9: 0x7bcf,
  A: 0x2bed,
  C: 0x3923,
  D: 0x6b6e,
  E: 0x79a7,
  F: 0x79a4,
  I: 0x7497,
  J: 0x126a,
  L: 0x4927,
  M: 0x5fed,
  O: 0x2b6a,
  S: 0x388e,
  T: 0x7492,
}

// Lo que se mide y se pinta. Se arma con el primer «Jugar».
let escena = null
let jugando = false
let pato = null
let cazados = 0
let espera = 0
let bucle = 0
let antes = 0

export function alternar(boton) {
  if (!escena) preparar(boton)
  if (jugando) terminar()
  else empezar()
}

function preparar(boton) {
  const cielo = boton.parentElement
  const lienzo = cielo.querySelector('.patos')
  escena = {
    boton,
    cielo,
    lienzo,
    ctx: lienzo.getContext('2d'),
    nube: cielo.querySelector('.nubes'),
    forma: { desde: 0, hasta: 0, t0: -Infinity, pendiente: false },
  }
  medir()
  new ResizeObserver(medir).observe(lienzo)
  lienzo.addEventListener('pointerdown', disparar)
}

// La rejilla de la nube (nubes.js): la misma densidad de píxeles y la misma
// celda. Los dos lienzos calzan, así que también el origen. El `techo` es el
// borde de abajo de la barra, en puntos enteros: los patos no vuelan detrás
// de ella, donde el clic caería en el logo o en el menú.
function medir() {
  const { lienzo, cielo, boton } = escena
  const estilo = getComputedStyle(cielo)
  const dpr = Math.min(devicePixelRatio, DPR_MAXIMO)
  const celda = Math.round(parseFloat(estilo.getPropertyValue('--nubes-celda')) * dpr)
  lienzo.width = Math.round(lienzo.clientWidth * dpr)
  lienzo.height = Math.round(lienzo.clientHeight * dpr)
  if (celda !== escena.celda) {
    const [arriba, abajo, herido, cae] = [ARRIBA, ABAJO, HERIDO, CAE].map((filas) => pintarCuadro(filas, celda))
    const globo = pintarCuadro(filasDelGlobo(), celda)
    const globoFamilia = pintarCuadro(filasDelGlobo(RECLAMO), celda)
    Object.assign(escena, { celda, cuadros: { arriba, abajo, herido, cae }, grandes: [], globo, globoFamilia, contador: null })
  }
  escena.dpr = dpr
  escena.alto = lienzo.height
  escena.techo = Math.ceil((parseFloat(estilo.getPropertyValue('--barra-alto')) * dpr) / celda) * celda
  escena.derecha = (boton.offsetLeft + boton.offsetWidth) * dpr
  repartir()
  avisarForma(performance.now())
  if (!bucle) pintar()
}

// La volutus en la columna x, en altos: la altura de su eje, su radio y el
// área que cubre de 0 a x, que es la integral de su grosor. Es `tubo` en
// nubes-lienzo.js; si cambia allá, cambia aquí.
function rollo(x) {
  const f = Math.exp(-0.9 * Math.min(x, 2.1))
  const area = (0.8 / 0.9) * (1 - f) + 0.8 * f * Math.max(x - 2.1, 0)
  return { y: 0.3 + 0.28 * f, r: 0.4 * f, area }
}

// Dónde va cada cúmulo y de dónde sale. La volutus no pierde material: entre
// todos los cúmulos cubren la misma área que ella a la vista, así que el
// tamaño de cada uno depende de cuántos son. Cada uno nace del tramo de rollo
// de su franja, a la altura del eje y con su grosor, y al menos tan ancho como
// el tramo: los trozos lo cubren entero y no queda nada que se evapore.
function repartir() {
  const { lienzo, alto } = escena
  const aspecto = lienzo.width / alto
  const [, cuantos] = POR_ANCHO.find(([desde]) => lienzo.clientWidth >= desde)
  const elegidos = CUMULOS.slice(0, cuantos)
  const pesos = elegidos.reduce((suma, { peso }) => suma + peso ** 2, 0)
  const escala = Math.sqrt(rollo(aspecto).area / (AREA * pesos))
  const franja = aspecto / cuantos
  escena.cumulos = elegidos.map(({ peso, v, corre }, i) => {
    const x = (i + 0.5 + corre) * franja
    const { y, r } = rollo(x)
    return { x, desde: { y, r: Math.max(r, franja / 3.2) }, hasta: { y: v, r: peso * escala } }
  })
}

// Un cúmulo en este punto de la transición: su centro y su radio, en altos.
function cumulo({ x, desde, hasta }, valor) {
  return [x, desde.y + (hasta.y - desde.y) * valor, desde.r + (hasta.r - desde.r) * valor]
}

// La nube cambia de forma desde donde esté, aunque vaya a mitad de camino.
// Con movimiento reducido no hay transición: salta al final.
function cambiarForma(hasta) {
  const ahora = performance.now()
  escena.forma = { desde: valorForma(ahora), hasta, t0: quieto() ? -Infinity : ahora, pendiente: true }
  animar()
}

// Cuánto va la transición, con aceleración y frenado.
function valorForma(ahora) {
  const { desde, hasta, t0 } = escena.forma
  const s = Math.min(1, (ahora - t0) / 1000 / TRANSICION)
  const suave = s < 0.5 ? 4 * s ** 3 : 1 - (2 - 2 * s) ** 3 / 2
  return desde + (hasta - desde) * suave
}

function avisarForma(ahora) {
  const valor = valorForma(ahora)
  const cumulos = new Float32Array(3 * CUMULOS.length)
  escena.cumulos.forEach((c, i) => cumulos.set(cumulo(c, valor), 3 * i))
  escena.nube.dispatchEvent(new CustomEvent('forma', { detail: { valor, cumulos } }))
  escena.forma.pendiente = ahora - escena.forma.t0 < TRANSICION * 1000
}

function empezar() {
  jugando = true
  cazados = 0
  escena.contador = null
  escena.reclamo = false
  escena.boton.lastElementChild.textContent = 'Terminar'
  escena.cielo.classList.add('cazando')
  cambiarForma(1)
  if (!pato) espera = setTimeout(soltar, 600)
}

function terminar() {
  jugando = false
  clearTimeout(espera)
  escena.reclamo = false
  escena.boton.lastElementChild.textContent = 'Jugar'
  escena.cielo.classList.remove('cazando')
  if (pato?.estado === 'vuela') pato.estado = 'huye'
  cambiarForma(0)
}

// Sale de un cúmulo cualquiera, donde esté ahora, aunque todavía viaje.
function soltar() {
  if (quieto()) return terminar()
  const { alto, cumulos } = escena
  const [x, y] = cumulo(cumulos[Math.floor(Math.random() * cumulos.length)], valorForma(performance.now()))
  const rumbo = -Math.PI / 2 + (Math.random() - 0.5) * 1.2
  pato = {
    x: x * alto,
    y: y * alto,
    rumbo,
    mira: Math.sign(Math.cos(rumbo)) || 1,
    estado: 'vuela',
    t: 0,
    // El primer giro espera a que haya salido de la nube.
    giro: 1 + Math.random() * 0.6,
    disparos: 0,
    escala: 1,
  }
  animar()
}

// El que reclama por su familia: sale de un cúmulo y va directo al claro a
// decirlo, como la burla. Si no hay un claro para su globo, sigue el juego.
function soltarReclamo() {
  const { alto, cumulos, globoFamilia, cielo } = escena
  const destino = claro(globoFamilia)
  if (!destino) {
    if (jugando) espera = setTimeout(soltar, 800)
    return
  }
  const [x, y] = cumulo(cumulos[Math.floor(Math.random() * cumulos.length)], valorForma(performance.now()))
  pato = {
    x: x * alto,
    y: y * alto,
    mira: 1,
    estado: 'burla',
    t: 0,
    disparos: 0,
    escala: 1,
    mensaje: 'familia',
    desde: { x: x * alto, y: y * alto },
    ...destino,
  }
  cielo.classList.add('burlando')
  animar()
}

function animar() {
  if (bucle) return
  antes = 0
  bucle = requestAnimationFrame(paso)
}

// Un fotograma, mientras haya un pato o la nube cambie de forma. El paso de
// tiempo topa en 50 ms: al volver de una pestaña oculta, el pato no salta.
function paso(ahora) {
  const dt = antes ? Math.min((ahora - antes) / 1000, 0.05) : 0
  antes = ahora
  if (pato) mover(dt)
  if (pato?.estado === 'cae') soplar()
  if (escena.forma.pendiente) avisarForma(ahora)
  pintar()
  bucle = pato || escena.forma.pendiente ? requestAnimationFrame(paso) : 0
}

function mover(dt) {
  const { alto, lienzo, techo, cuadros } = escena
  const p = pato
  p.t += dt

  if (p.estado === 'herido') {
    if (p.t > PASMO) Object.assign(p, { estado: 'cae', t: 0, vy: 0 })
    return
  }
  if (p.estado === 'cae') {
    p.vy += GRAVEDAD * alto * dt
    p.y += p.vy * dt
    if (p.y > lienzo.height) fin()
    return
  }

  const rapidez = VELOCIDAD * Math.min(2, ACELERA ** cazados) * alto
  if (p.estado === 'huye') {
    p.y -= 1.5 * rapidez * dt
    if (p.y < -cuadros.arriba.height * p.escala) fin()
    return
  }
  // Se burla: va al claro mientras crece por saltos enteros, que no lo sacan
  // de la rejilla, se ríe y se va, grande.
  if (p.estado === 'burla') {
    const llegada = Math.min(1, p.t / LLEGADA)
    p.x = p.desde.x + (p.hasta.x - p.desde.x) * llegada
    p.y = p.desde.y + (p.hasta.y - p.desde.y) * llegada
    p.escala = Math.max(1, Math.ceil(llegada * p.grande))
    if (p.t > LLEGADA + RISA) Object.assign(p, { estado: 'huye', t: 0 })
    return
  }
  // Se acabó su tiempo. Si le dispararon y no le dieron, se burla antes de
  // irse: se acerca, por eso crece, y pasa delante de las nubes.
  if (p.t > VIDA) {
    const destino = p.disparos && claro()
    Object.assign(p, destino ? { estado: 'burla', t: 0, mira: 1, desde: { x: p.x, y: p.y }, ...destino } : { estado: 'huye' })
    escena.cielo.classList.toggle('burlando', Boolean(destino))
    return
  }

  // Vuela en diagonales, como los del original, y rebota en los costados, en
  // el suelo de vuelo y bajo la barra. Solo pasa detrás de ella al huir.
  if ((p.giro -= dt) < 0) {
    p.giro = 0.6 + Math.random() * 0.8
    p.rumbo = (Math.random() < 0.5 ? 0 : Math.PI) + (Math.random() - 0.5) * 1.6
  }
  const { width, height } = cuadros.arriba
  let vx = Math.cos(p.rumbo)
  let vy = Math.sin(p.rumbo)
  if ((p.x < width / 2 && vx < 0) || (p.x > lienzo.width - width / 2 && vx > 0)) vx = -vx
  if ((p.y < techo + height / 2 && vy < 0) || (p.y > SUELO * alto && vy > 0)) vy = -vy
  p.rumbo = Math.atan2(vy, vx)
  p.mira = Math.sign(vx) || p.mira
  p.x += vx * rapidez * dt
  p.y += vy * rapidez * dt
}

// El claro donde se burla: el lugar del pato grande con su globo al lado más
// lejos de toda nube. La distancia va en radios de cada nube, desde su centro
// hasta el punto más cercano de la caja, y desde `LIBRE` es cielo despejado.
// La caja va de la barra al borde de abajo del cielo, que suele ser lo más
// despejado, sin tocar los costados ni «Jugar». Prueba al triple y después al
// doble; si en ninguno hay cielo despejado, se queda con lo mejor que
// encontró.
function claro(globo = escena.globo) {
  const { lienzo, celda, techo, boton, dpr, alto, cuadros } = escena
  const forma = valorForma(performance.now())
  const nubes = escena.cumulos.map((c) => cumulo(c, forma).map((medida) => medida * alto))
  const aire = 4 * celda
  const jugar = [
    boton.offsetLeft * dpr - aire,
    boton.offsetTop * dpr - aire,
    (boton.offsetLeft + boton.offsetWidth) * dpr + aire,
    (boton.offsetTop + boton.offsetHeight) * dpr + aire,
  ]
  const entre = (valor, desde, hasta) => Math.min(Math.max(valor, desde), hasta)

  let mejor = null
  for (let grande = GRANDE; grande > 1 && !(mejor?.holgura >= LIBRE); grande--) {
    const [gx, gy] = globoJunto(0, 0, grande)
    const ancho = gx + globo.width
    const altoCaja = Math.max(cuadros.arriba.height * grande, gy + globo.height)
    for (let y = techo; y + altoCaja <= lienzo.height; y += aire) {
      for (let x = aire; x + ancho <= lienzo.width - aire; x += aire) {
        if (x < jugar[2] && x + ancho > jugar[0] && y < jugar[3] && y + altoCaja > jugar[1]) continue
        const holgura = Math.min(
          ...nubes.map(([cx, cy, r]) =>
            Math.hypot((entre(cx, x, x + ancho) - cx) / (1.6 * r), (entre(cy, y, y + altoCaja) - cy) / r),
          ),
        )
        if (!mejor || holgura > mejor.holgura) mejor = { holgura, grande, x, y }
      }
    }
  }
  if (!mejor) return null
  const { grande, x, y } = mejor
  const { width, height } = cuadros.arriba
  return { grande, hasta: { x: x + (width * grande) / 2, y: y + (height * grande) / 2 } }
}

// Dónde va el globo, a partir de la esquina del pato: a su derecha, con la
// punta de la cola (la fila `PUNTA`) junto al pico, que está en la quinta fila
// del cuadro.
function globoJunto(x, y, escala) {
  const { celda } = escena
  return [x + (ARRIBA[0].length * escala + 1) * celda, y + (5 * escala - PUNTA) * celda]
}

// El pato salió de la pantalla, por arriba o por abajo. Si se sigue jugando,
// sale otro. Al caer el de la meta, antes sale el que reclama por su familia.
function fin() {
  const eraFamilia = pato.mensaje === 'familia'
  const cayo = pato.estado === 'cae'
  if (cayo) soplar(true)
  escena.cielo.classList.remove('burlando')
  pato = null
  if (!jugando) {
    escena.reclamo = false
    return
  }
  if (escena.reclamo && cayo && !eraFamilia) {
    escena.reclamo = false
    soltarReclamo()
    return
  }
  espera = setTimeout(soltar, 800)
}

// El que se burló ya se escapó: aunque siga a la vista, no se le puede dar.
function disparar(evento) {
  if (!pato || evento.button) return
  pato.disparos++
  if ((pato.estado !== 'vuela' && pato.estado !== 'huye') || pato.escala > 1) return
  const { lienzo, dpr, cuadros } = escena
  const caja = lienzo.getBoundingClientRect()
  const margen = MARGEN * dpr * (evento.pointerType === 'touch' ? 2 : 1)
  const dx = Math.abs((evento.clientX - caja.left) * dpr - pato.x)
  const dy = Math.abs((evento.clientY - caja.top) * dpr - pato.y)
  if (dx > cuadros.arriba.width / 2 + margen || dy > cuadros.arriba.height / 2 + margen) return
  Object.assign(pato, { estado: 'herido', t: 0 })
  cazados++
  escena.contador = null
  if (cazados === META) escena.reclamo = true
}

// El aire que mueve el pato al caer, para la nube, en coordenadas de la
// ventana. `fuera` avisa que ya salió.
function soplar(fuera) {
  const { lienzo, dpr, nube } = escena
  const caja = lienzo.getBoundingClientRect()
  const detail = fuera ? { fuera } : { x: caja.left + pato.x / dpr, y: caja.top + pato.y / dpr }
  nube.dispatchEvent(new CustomEvent('soplo', { detail }))
}

function pintar() {
  const { ctx, lienzo } = escena
  ctx.clearRect(0, 0, lienzo.width, lienzo.height)
  if (jugando) pintarContador()
  if (pato) pintarPato()
}

function pintarPato() {
  const { ctx, cuadros, celda, lienzo, alto } = escena
  const p = pato
  const globo = p.mensaje === 'familia' ? escena.globoFamilia : escena.globo
  const { arriba, abajo } = p.escala > 1 ? agrandados(p.escala) : cuadros
  let cuadro = cuadros.herido
  let mira = p.mira
  if (p.estado === 'cae') {
    cuadro = cuadros.cae
    mira = Math.floor(p.t / VUELTA) % 2 ? -1 : 1
  } else if (p.estado !== 'herido') {
    cuadro = Math.floor(p.t * ALETEO) % 2 ? abajo : arriba
  }
  // La esquina va sobre la rejilla de la nube, y al caer se desvanece en el
  // último tramo, donde se acaba el cielo.
  const x = Math.round((p.x - cuadro.width / 2) / celda) * celda
  const y = Math.round((p.y - cuadro.height / 2) / celda) * celda
  ctx.globalAlpha = p.estado === 'cae' ? Math.min(1, (lienzo.height - p.y) / (0.15 * alto)) : 1
  ctx.setTransform(mira, 0, 0, 1, mira < 0 ? x + cuadro.width : x, y)
  ctx.drawImage(cuadro, 0, 0)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  if (p.estado === 'burla' && p.t > LLEGADA) ctx.drawImage(globo, ...globoJunto(x, y, p.escala))
}

// El pato a `escala` puntos por punto, para la burla. Grande solo vuela, así
// que bastan las alas arriba y abajo.
function agrandados(escala) {
  const { grandes, celda } = escena
  grandes[escala] ??= {
    arriba: pintarCuadro(agrandar(ARRIBA, escala), celda),
    abajo: pintarCuadro(agrandar(ABAJO, escala), celda),
  }
  return grandes[escala]
}

function agrandar(filas, escala) {
  return filas.flatMap((fila) => Array(escala).fill([...fila].map((letra) => letra.repeat(escala)).join('')))
}

// Arriba a la derecha, bajo la barra y alineado con el borde del botón.
function pintarContador() {
  const { ctx, celda, techo, derecha } = escena
  escena.contador ??= pintarCuadro(filasDeTexto(String(cazados), 'b'), celda)
  const { contador } = escena
  ctx.drawImage(contador, Math.round((derecha - contador.width) / celda) * celda, techo + 4 * celda)
}

// Un cuadro como puntos de la trama, en un lienzo chico. El radio es media
// celda, como el de los puntos más densos de la nube.
function pintarCuadro(filas, celda) {
  const lienzo = document.createElement('canvas')
  lienzo.width = filas[0].length * celda
  lienzo.height = filas.length * celda
  const ctx = lienzo.getContext('2d')
  filas.forEach((fila, y) => {
    for (let x = 0; x < fila.length; x++) {
      if (!COLORES[fila[x]]) continue
      ctx.fillStyle = COLORES[fila[x]]
      ctx.beginPath()
      ctx.arc((x + 0.5) * celda, (y + 0.5) * celda, celda / 2, 0, 2 * Math.PI)
      ctx.fill()
    }
  })
  return lienzo
}

// Un texto como cuadro, en la letra de `GLIFOS` y del color dado: cada píxel
// de la letra son 2×2 puntos, con uno libre entre letras. El espacio es solo
// ese hueco, doble.
function filasDeTexto(texto, color) {
  return Array.from({ length: 10 }, (_, y) =>
    [...texto]
      .map((letra) => {
        if (letra === ' ') return ''
        let fila = ''
        for (let x = 0; x < 6; x++) fila += (GLIFOS[letra] >> (14 - 3 * (y >> 1) - (x >> 1))) & 1 ? color : '.'
        return fila
      })
      .join('..'),
  )
}

// El globo de la burla: una o varias líneas en negro sobre blanco, con borde
// y una cola a la izquierda que apunta al pico. La punta de la cola es la
// primera columna de la fila `PUNTA`, la del medio (ver `globoJunto`): cae en
// la primera línea, así que el reclamo de tres líneas lo apunta igual.
const PUNTA = 8

function filasDelGlobo(lineas = ['JA JA JA']) {
  const lineasLista = Array.isArray(lineas) ? lineas : [lineas]
  const ancha = Math.max(...lineasLista.map((linea) => filasDeTexto(linea, 'k')[0].length))
  const textos = lineasLista.map((linea) =>
    filasDeTexto(linea, 'k').map((fila) => `kbbb${fila.replaceAll('.', 'b')}${'b'.repeat(ancha - fila.length)}bbbk`),
  )
  const ancho = textos[0][0].length
  const aire = `k${'b'.repeat(ancho - 2)}k`
  const cuerpo = ['k'.repeat(ancho), aire, aire]
  textos.forEach((texto, i) => {
    if (i) cuerpo.push(aire, aire)
    cuerpo.push(...texto)
  })
  cuerpo.push(aire, aire, 'k'.repeat(ancho))
  const cola = { [PUNTA - 1]: '.kk', [PUNTA]: 'kbb', [PUNTA + 1]: '.kk' }
  return cuerpo.map((fila, y) => (cola[y] ? `${cola[y]}b${fila.slice(1)}` : `...${fila}`))
}
