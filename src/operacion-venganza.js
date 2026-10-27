/**
 * Operación Venganza (paginas/OperacionVenganza.jsx): la pantalla de carga y
 * la escena de la página, la que diga su `data-escena`, con su guion:
 * lib/escena1.js, escena2.js, escena3.js, escena5.js, escena6.js,
 * escena9.js, escena10.js, escena11.js, escena13.js, escena14.js,
 * escena15.js o escena16.js. Las medidas de las tiras son las de la 1.
 *
 * Mientras duck-one camina (lo anima el CSS), se descargan las tiras de las
 * tomas y la barra se llena un bloque por paso, nunca más rápido que `PASO`:
 * con todo en caché la carga se alcanza a ver igual. Llena, empieza la escena.
 *
 * Cada toma se pinta en un lienzo de `LADO` × `ALTO` px, la franja del medio
 * de cada cuadro en 4:3, que el CSS agranda sin suavizar. Sus líneas pasan solas, al ritmo de lo que tarda leerlas, y
 * «Siguiente», Enter o la barra espaciadora pasan a la siguiente. Sin movimiento, cada toma queda en un solo cuadro.
 *
 * El navegador elige qué muestra la pantalla de la sala: con un puntero fino
 * que flota (ratón, trackpad) es un cursor, y si no, una huella.
 *
 * Si el guion trae `FINALES`, al acabar sus tomas (o al saltarlas) quien juega
 * elige uno con sus botones, y corren sus tomas. Su nombre queda en la sesión,
 * en la clave `FINAL` del guion, para /nosotros (src/flota.js).
 */

import * as escena1 from './lib/escena1.js'
import * as escena2 from './lib/escena2.js'
import * as escena3 from './lib/escena3.js'
import * as escena5 from './lib/escena5.js'
import * as escena6 from './lib/escena6.js'
import * as escena9 from './lib/escena9.js'
import * as escena10 from './lib/escena10.js'
import * as escena11 from './lib/escena11.js'
import * as escena13 from './lib/escena13.js'
import * as escena14 from './lib/escena14.js'
import * as escena15 from './lib/escena15.js'
import * as escena16 from './lib/escena16.js'
import { quieto } from './lib/movimiento.js'

const { ALTO, LADO, cuadrosDe, textoDe } = escena1
const GUIONES = { 1: escena1, 2: escena2, 3: escena3, 5: escena5, 6: escena6, 9: escena9, 10: escena10, 11: escena11, 13: escena13, 14: escena14, 15: escena15, 16: escena16 }
const PASO = 120
const leer = (texto) => Math.max(1100, 500 + texto.length * 40)

export default function iniciar(raiz) {
  const guion = GUIONES[raiz.dataset.escena]
  const { TOMAS, TODAS = TOMAS, rutaDeToma } = guion
  const modo = matchMedia('(hover: hover) and (pointer: fine)').matches ? 'cursor' : 'huella'
  const tiras = new Map(
    TODAS.map((toma) => {
      const imagen = new Image()
      imagen.src = rutaDeToma(toma, modo)
      return [toma, imagen]
    }),
  )
  cargar(raiz, [...tiras.values()], () => escena(raiz, guion, tiras, modo))
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

function escena(raiz, { TOMAS, FINALES, FINAL }, tiras, modo) {
  const lienzo = raiz.querySelector('.escena-cuadro')
  const pincel = lienzo.getContext('2d')
  const quien = raiz.querySelector('.escena-quien')
  const texto = raiz.querySelector('.escena-texto')
  const siguiente = raiz.querySelector('.escena-siguiente')
  const mandos = siguiente.parentElement
  const eleccion = raiz.querySelector('.escena-eleccion')

  raiz.querySelector('.carga').hidden = true
  raiz.querySelector('.escena').hidden = false
  raiz.classList.add('en-escena')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(raiz).backgroundColor)

  let tomas = TOMAS
  let toma = -1
  let linea = 0
  let desde = 0
  let espera = 0
  let pintando = 0

  const dibujar = (ahora) => {
    const { ms, unaVez } = tomas[toma]
    const cuadros = cuadrosDe(tomas[toma])
    const paso = Math.floor((ahora - desde) / ms)
    const cuadro = quieto() ? (unaVez ? cuadros - 1 : cuadros / 2) : unaVez ? Math.min(paso, cuadros - 1) : paso % cuadros
    pincel.imageSmoothingEnabled = false
    const tira = tiras.get(tomas[toma])
    if (tira.naturalWidth) pincel.drawImage(tira, cuadro * LADO, (LADO - ALTO) / 2, LADO, ALTO, 0, 0, LADO, ALTO)
    pintando = requestAnimationFrame(dibujar)
  }

  const decir = (l) => {
    quien.textContent = l?.quien ?? ''
    texto.textContent = l ? textoDe(l, modo) : ''
    texto.classList.toggle('acotacion', Boolean(l && !l.quien))
  }

  // Avanza una línea; sin más líneas, a la toma siguiente; sin más tomas, a
  // elegir el final, si hay que elegirlo, o al fin.
  const avanzar = () => {
    clearTimeout(espera)
    const lineas = toma < 0 ? [] : tomas[toma].lineas
    if (toma >= 0 && linea < lineas.length - 1) linea++
    else if (toma < tomas.length - 1) {
      toma++
      linea = 0
      desde = performance.now()
    } else return porElegir() ? elegir() : terminar()
    const actual = tomas[toma].lineas[linea]
    decir(actual)
    // La última línea espera, además, a que termine la tira.
    const resta = linea >= tomas[toma].lineas.length - 1 ? desde + cuadrosDe(tomas[toma]) * tomas[toma].ms + 200 - performance.now() : 0
    espera = setTimeout(avanzar, Math.max(actual ? leer(textoDe(actual, modo)) : 0, resta))
  }

  const porElegir = () => FINALES && tomas === TOMAS

  // La última toma queda en su último cuadro, con su última línea, y en vez de
  // «Siguiente» están los finales.
  const elegir = () => {
    clearTimeout(espera)
    toma = tomas.length - 1
    linea = tomas[toma].lineas.length - 1
    desde = performance.now() - cuadrosDe(tomas[toma]) * tomas[toma].ms
    decir(tomas[toma].lineas[linea])
    mandos.hidden = true
    eleccion.hidden = false
    eleccion.querySelector('button').focus()
  }

  const terminar = () => {
    if (porElegir()) return elegir()
    clearTimeout(espera)
    cancelAnimationFrame(pintando)
    raiz.querySelector('.escena').hidden = true
    raiz.querySelector('.fin').hidden = false
    raiz.querySelector('.fin .boton-primario').focus()
  }

  // Empieza de nuevo `lista`, desde su primera toma.
  const empezar = (lista) => {
    tomas = lista
    toma = -1
    avanzar()
    siguiente.focus()
  }

  siguiente.addEventListener('click', avanzar)
  raiz.querySelector('.escena-saltar').addEventListener('click', terminar)
  eleccion?.addEventListener('click', ({ target }) => {
    const { final } = target.closest('button')?.dataset ?? {}
    if (!FINALES?.[final]) return
    try {
      sessionStorage.setItem(FINAL, final)
    } catch {
      // Sin almacenamiento, /nosotros sigue como siempre.
    }
    eleccion.hidden = true
    mandos.hidden = false
    empezar(FINALES[final].tomas)
  })
  raiz.querySelector('.fin-otra-vez').addEventListener('click', () => {
    raiz.querySelector('.fin').hidden = true
    raiz.querySelector('.escena').hidden = false
    pintando = requestAnimationFrame(dibujar)
    empezar(TOMAS)
  })

  empezar(TOMAS)
  pintando = requestAnimationFrame(dibujar)
}
