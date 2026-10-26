/**
 * Operación Venganza (paginas/OperacionVenganza.jsx): la pantalla de carga y
 * la escena 1, «El portaaviones», con el guion de lib/escena1.js.
 *
 * Mientras duck-one camina (lo anima el CSS), se descargan las tiras de las
 * tomas y la barra se llena un bloque por paso, nunca más rápido que `PASO`:
 * con todo en caché la carga se alcanza a ver igual. Llena, empieza la escena.
 *
 * Cada toma se pinta en un lienzo de `LADO` × `ALTO` px, la franja del medio
 * de cada cuadro en 4:3, que el CSS agranda sin suavizar. Sus líneas pasan solas, al ritmo de lo que tarda leerlas, y
 * tocar la escena, «Siguiente», Enter o la barra espaciadora pasan a la
 * siguiente. Sin movimiento, cada toma queda en un solo cuadro.
 *
 * El navegador elige qué muestra la pantalla de la sala: con un puntero fino
 * que flota (ratón, trackpad) es un cursor, y si no, una huella.
 */

import { ALTO, LADO, TOMAS, cuadrosDe, rutaDeToma, textoDe } from './lib/escena1.js'
import { quieto } from './lib/movimiento.js'

const PASO = 120
const leer = (texto) => Math.max(1100, 500 + texto.length * 40)

export default function iniciar(raiz) {
  const modo = matchMedia('(hover: hover) and (pointer: fine)').matches ? 'cursor' : 'huella'
  const tiras = TOMAS.map((toma) => {
    const imagen = new Image()
    imagen.src = rutaDeToma(toma, modo)
    return imagen
  })
  cargar(raiz, tiras, () => escena(raiz, tiras, modo))
}

function cargar(raiz, tiras, listo) {
  const barra = raiz.querySelector('.carga-barra')
  const bloques = Number(getComputedStyle(barra).getPropertyValue('--bloques'))
  let listas = 0
  for (const imagen of tiras) imagen.decode().catch(() => {}).finally(() => listas++)

  let llenos = 0
  const reloj = setInterval(() => {
    const meta = Math.floor((listas / tiras.length) * bloques)
    if (llenos < meta) llenos++
    barra.style.setProperty('--llenos', llenos)
    barra.setAttribute('aria-valuenow', Math.round((llenos / bloques) * 100))
    if (llenos === bloques) {
      clearInterval(reloj)
      setTimeout(listo, PASO)
    }
  }, PASO)
}

function escena(raiz, tiras, modo) {
  const lienzo = raiz.querySelector('.escena-cuadro')
  const pincel = lienzo.getContext('2d')
  const quien = raiz.querySelector('.escena-quien')
  const texto = raiz.querySelector('.escena-texto')

  raiz.querySelector('.carga').hidden = true
  raiz.querySelector('.escena').hidden = false
  raiz.classList.add('en-escena')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(raiz).backgroundColor)

  let toma = -1
  let linea = 0
  let desde = 0
  let espera = 0
  let pintando = 0

  const dibujar = (ahora) => {
    const { ms, unaVez } = TOMAS[toma]
    const cuadros = cuadrosDe(TOMAS[toma])
    const paso = Math.floor((ahora - desde) / ms)
    const cuadro = quieto() ? (unaVez ? cuadros - 1 : cuadros / 2) : unaVez ? Math.min(paso, cuadros - 1) : paso % cuadros
    pincel.imageSmoothingEnabled = false
    if (tiras[toma].naturalWidth) pincel.drawImage(tiras[toma], cuadro * LADO, (LADO - ALTO) / 2, LADO, ALTO, 0, 0, LADO, ALTO)
    pintando = requestAnimationFrame(dibujar)
  }

  const decir = (l) => {
    quien.textContent = l?.quien ?? ''
    texto.textContent = l ? textoDe(l, modo) : ''
    texto.classList.toggle('acotacion', Boolean(l && !l.quien))
  }

  // Avanza una línea; sin más líneas, a la toma siguiente; sin más tomas, al fin.
  const avanzar = () => {
    clearTimeout(espera)
    const lineas = toma < 0 ? [] : TOMAS[toma].lineas
    if (toma >= 0 && linea < lineas.length - 1) linea++
    else if (toma < TOMAS.length - 1) {
      toma++
      linea = 0
      desde = performance.now()
    } else return terminar()
    const actual = TOMAS[toma].lineas[linea]
    decir(actual)
    espera = setTimeout(avanzar, actual ? leer(textoDe(actual, modo)) : cuadrosDe(TOMAS[toma]) * TOMAS[toma].ms + 200)
  }

  const terminar = () => {
    clearTimeout(espera)
    cancelAnimationFrame(pintando)
    raiz.querySelector('.escena').hidden = true
    raiz.querySelector('.fin').hidden = false
    raiz.querySelector('.fin a').focus()
  }

  raiz.querySelector('.escena-cuadro').addEventListener('click', avanzar)
  raiz.querySelector('.escena-siguiente').addEventListener('click', avanzar)
  raiz.querySelector('.escena-saltar').addEventListener('click', terminar)
  raiz.querySelector('.fin-otra-vez').addEventListener('click', () => {
    raiz.querySelector('.fin').hidden = true
    raiz.querySelector('.escena').hidden = false
    toma = -1
    avanzar()
    pintando = requestAnimationFrame(dibujar)
    raiz.querySelector('.escena-siguiente').focus()
  })

  avanzar()
  pintando = requestAnimationFrame(dibujar)
  raiz.querySelector('.escena-siguiente').focus()
}
