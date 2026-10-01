/**
 * El juego de la 404: un Duck Hunt con la nube.
 *
 * Los patos salen de dentro de la nube, como los del original desde el pasto,
 * vuelan por el cielo y, cazados, caen a través de ella. La nube no se imita:
 * el pato que cae le sopla su aire de verdad con el evento `soplo` de
 * nubes.js, con la misma física que el cursor, así que la corta a su paso y la
 * nube se vuelve a cerrar sola.
 *
 * Lo descarga «Jugar» (src/client.js), y el mismo botón lo termina.
 *
 * Los patos (src/lib/pato.js) se dibujan con la trama de la nube: cada píxel
 * del sprite es un punto de su rejilla —la misma celda y el mismo origen—, así
 * que, dentro de ella, los puntos de la nube tapan justo los del pato y solo se
 * le ve donde se abre.
 *
 * Las medidas van en altos del lienzo de la nube, como todo lo de la nube: así
 * el juego cuesta lo mismo en cualquier pantalla.
 *
 * Qué NO hace: moverse sin que nadie mire. Si un pato se escapa sin un solo
 * disparo, el juego termina solo; con movimiento reducido no se ofrece, y si
 * se activa a mitad de partida, termina con el pato siguiente.
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
// Dónde sale: dentro del rollo, donde es grueso a cualquier ancho (ver `tubo`
// en nubes-lienzo.js). Y hasta dónde baja después a volar: hasta media nube,
// para que la roce.
const SALIDA = { desde: 0.1, hasta: 1.2, alto: 0.48 }
const SUELO = 0.5
// La tolerancia del disparo, en px. Con el dedo es el doble: tapa justo lo que
// apunta.
const MARGEN = 10

// Las cifras del contador, en 3×5 leídas por filas: el bit 14 es la esquina
// de arriba a la izquierda.
const CIFRAS = [0x7b6f, 0x2c97, 0x73e7, 0x73cf, 0x5bc9, 0x79cf, 0x79ef, 0x7249, 0x7bef, 0x7bcf]

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
  escena = { boton, cielo, lienzo, ctx: lienzo.getContext('2d'), nube: cielo.querySelector('.nubes') }
  medir()
  new ResizeObserver(medir).observe(lienzo)
  lienzo.addEventListener('pointerdown', disparar)
}

// La rejilla de la nube (nubes.js): la misma densidad de píxeles, la misma
// celda, y su origen en la esquina del lienzo de la nube, que empieza bajo la
// barra, `oy` más abajo que este.
function medir() {
  const { lienzo, cielo, boton } = escena
  const dpr = Math.min(devicePixelRatio, DPR_MAXIMO)
  const celda = Math.round(parseFloat(getComputedStyle(cielo).getPropertyValue('--nubes-celda')) * dpr)
  lienzo.width = Math.round(lienzo.clientWidth * dpr)
  lienzo.height = Math.round(lienzo.clientHeight * dpr)
  if (celda !== escena.celda) {
    const [arriba, abajo, herido, cae] = [ARRIBA, ABAJO, HERIDO, CAE].map((filas) => pintarCuadro(filas, celda))
    Object.assign(escena, { celda, cuadros: { arriba, abajo, herido, cae }, contador: null })
  }
  escena.dpr = dpr
  escena.alto = Math.round(cielo.clientHeight * dpr)
  escena.oy = lienzo.height - escena.alto
  escena.derecha = (boton.offsetLeft + boton.offsetWidth) * dpr
  if (!bucle) pintar()
}

function empezar() {
  jugando = true
  cazados = 0
  escena.contador = null
  escena.boton.lastElementChild.textContent = 'Terminar'
  escena.cielo.classList.add('cazando')
  if (!pato) espera = setTimeout(soltar, 600)
  if (!bucle) pintar()
}

function terminar() {
  jugando = false
  clearTimeout(espera)
  escena.boton.lastElementChild.textContent = 'Jugar'
  escena.cielo.classList.remove('cazando')
  if (pato?.estado === 'vuela') pato.estado = 'huye'
  if (!bucle) pintar()
}

function soltar() {
  if (quieto()) return terminar()
  const { alto, lienzo, oy } = escena
  const x = alto * (SALIDA.desde + Math.random() * (SALIDA.hasta - SALIDA.desde))
  const rumbo = -Math.PI / 2 + (Math.random() - 0.5) * 1.2
  pato = {
    x: Math.min(x, lienzo.width - alto * SALIDA.desde),
    y: oy + alto * SALIDA.alto,
    rumbo,
    mira: Math.sign(Math.cos(rumbo)) || 1,
    estado: 'vuela',
    t: 0,
    // El primer giro espera a que haya salido de la nube.
    giro: 1 + Math.random() * 0.6,
    disparos: 0,
  }
  antes = 0
  bucle = requestAnimationFrame(paso)
}

// Un fotograma. El paso de tiempo topa en 50 ms: al volver de una pestaña
// oculta, el pato no salta.
function paso(ahora) {
  const dt = antes ? Math.min((ahora - antes) / 1000, 0.05) : 0
  antes = ahora
  mover(dt)
  if (pato?.estado === 'cae') soplar()
  pintar()
  bucle = pato ? requestAnimationFrame(paso) : 0
}

function mover(dt) {
  const { alto, lienzo, oy, cuadros } = escena
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
    if (p.y < -cuadros.arriba.height) fin()
    return
  }
  if (p.t > VIDA) {
    Object.assign(p, { estado: 'huye', solo: true })
    return
  }

  // Vuela en diagonales, como los del original, y rebota en los costados, en
  // el suelo de vuelo y bajo la barra: detrás de ella, el clic que apunta al
  // pato caería en el logo o en el menú. Solo pasa por ahí al huir.
  if ((p.giro -= dt) < 0) {
    p.giro = 0.6 + Math.random() * 0.8
    p.rumbo = (Math.random() < 0.5 ? 0 : Math.PI) + (Math.random() - 0.5) * 1.6
  }
  const { width, height } = cuadros.arriba
  let vx = Math.cos(p.rumbo)
  let vy = Math.sin(p.rumbo)
  if ((p.x < width / 2 && vx < 0) || (p.x > lienzo.width - width / 2 && vx > 0)) vx = -vx
  if ((p.y < oy + height / 2 && vy < 0) || (p.y > oy + SUELO * alto && vy > 0)) vy = -vy
  p.rumbo = Math.atan2(vy, vx)
  p.mira = Math.sign(vx) || p.mira
  p.x += vx * rapidez * dt
  p.y += vy * rapidez * dt
}

// El pato salió de la pantalla, por arriba o por abajo. Si se fue solo, por
// tiempo, sin que nadie le disparara, no hay nadie jugando. El que huye porque
// se pulsó «Terminar» no cuenta: puede que ya haya otra partida.
function fin() {
  if (pato.estado === 'cae') soplar(true)
  const abandonado = pato.solo && !pato.disparos
  pato = null
  if (jugando && abandonado) terminar()
  else if (jugando) espera = setTimeout(soltar, 800)
}

function disparar(evento) {
  if (!pato || evento.button) return
  pato.disparos++
  if (pato.estado !== 'vuela' && pato.estado !== 'huye') return
  const { lienzo, dpr, cuadros } = escena
  const caja = lienzo.getBoundingClientRect()
  const margen = MARGEN * dpr * (evento.pointerType === 'touch' ? 2 : 1)
  const dx = Math.abs((evento.clientX - caja.left) * dpr - pato.x)
  const dy = Math.abs((evento.clientY - caja.top) * dpr - pato.y)
  if (dx > cuadros.arriba.width / 2 + margen || dy > cuadros.arriba.height / 2 + margen) return
  Object.assign(pato, { estado: 'herido', t: 0 })
  cazados++
  escena.contador = null
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
  const { ctx, cuadros, celda, oy, lienzo, alto } = escena
  const p = pato
  let cuadro = cuadros.herido
  let mira = p.mira
  if (p.estado === 'cae') {
    cuadro = cuadros.cae
    mira = Math.floor(p.t / VUELTA) % 2 ? -1 : 1
  } else if (p.estado !== 'herido') {
    cuadro = Math.floor(p.t * ALETEO) % 2 ? cuadros.abajo : cuadros.arriba
  }
  // La esquina va sobre la rejilla de la nube, y al caer se desvanece en el
  // último tramo, donde se acaba el cielo.
  const x = Math.round((p.x - cuadro.width / 2) / celda) * celda
  const y = oy + Math.round((p.y - oy - cuadro.height / 2) / celda) * celda
  ctx.globalAlpha = Math.min(1, (lienzo.height - p.y) / (0.15 * alto))
  ctx.setTransform(mira, 0, 0, 1, mira < 0 ? x + cuadro.width : x, y)
  ctx.drawImage(cuadro, 0, 0)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
}

// Arriba a la derecha, bajo la barra y alineado con el borde del botón.
function pintarContador() {
  const { ctx, celda, oy, derecha } = escena
  escena.contador ??= pintarCuadro(filasDelContador(cazados), celda)
  const { contador } = escena
  ctx.drawImage(contador, Math.round((derecha - contador.width) / celda) * celda, oy + 4 * celda)
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

// El contador como un cuadro más, en blanco: cada píxel de la cifra son 2×2
// puntos, con uno libre entre cifras.
function filasDelContador(n) {
  return Array.from({ length: 10 }, (_, y) =>
    [...String(n)]
      .map((cifra) => {
        let fila = ''
        for (let x = 0; x < 6; x++) fila += (CIFRAS[cifra] >> (14 - 3 * (y >> 1) - (x >> 1))) & 1 ? 'b' : '.'
        return fila
      })
      .join('..'),
  )
}
