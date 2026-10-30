/**
 * Operación Venganza (paginas/OperacionVenganza.jsx): la pantalla de carga y
 * las escenas de la página, las que diga su `data-escena`, una tras otra, con
 * sus guiones:
 * lib/escena1.js, escena2.js, escena3.js, escena5.js, escena6.js,
 * escena9.js, escena10.js, escena11.js, escena13.js, escena14.js,
 * escena15.js o escena16.js. Las medidas de las tiras son las de la 1.
 *
 * Mientras el pato de la carga camina (lo anima el CSS), se descargan las tiras
 * de las tomas de todas y la barra muestra cuántas ya están decodificadas, en
 * memoria, pero no se llena antes de `MINIMO`: con todo en caché la carga se
 * alcanza a ver igual. Llena, tras `PASO` empieza la primera, y «Saltar escena» pasa a la
 * siguiente, o desde la última a lo que sigue.
 *
 * Cada toma se pinta en un lienzo de `ANCHO` × `ALTO` px, en 21:9, que el CSS
 * agranda sin suavizar. Sus líneas pasan solas, al ritmo de lo que tarda leerlas (`leer`), y
 * «Siguiente», Enter o la barra espaciadora pasan a la siguiente. Sin movimiento, cada toma queda en un solo cuadro.
 *
 * El navegador elige qué muestra la pantalla de la sala: con un puntero fino
 * que flota (ratón, trackpad) es un cursor, y si no, una huella.
 *
 * Con ratón, el cursor de la página es la flecha del juego (`flecha`).
 *
 * En la página de una pantalla de carga (lib/cargas.js, `data-carga`) no hay
 * escena: la barra se llena con las tiras de sus escenas y queda llena hasta
 * que se pide el índice, y «Ver otra vez» vuelve a la carga.
 *
 * Al acabar las tomas de la última (o al saltarlas), la página sigue a
 * `data-sigue`: un nivel jugable o la escena siguiente, con su carga. Así el
 * juego corre entero sin volver al índice.
 *
 * Si el guion de la última trae `FINALES`, al acabar sus tomas (o al saltarlas) quien juega
 * elige uno con sus botones, y corren sus tomas. Su nombre queda en la sesión,
 * en la clave `FINAL` del guion, para /nosotros (src/flota.js), adonde se va
 * sola la página al terminarlas.
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
import { CARGAS } from './lib/cargas.js'
import { FLECHA, escalaDe } from './lib/flecha.js'

const { ALTO, ANCHO, cuadrosDe, textoDe } = escena1
const GUIONES = { 1: escena1, 2: escena2, 3: escena3, 5: escena5, 6: escena6, 9: escena9, 10: escena10, 11: escena11, 13: escena13, 14: escena14, 15: escena15, 16: escena16 }
const PASO = 120
const MINIMO = 3000
// Lo que tarda leer una línea: 250 palabras por minuto, más un segundo para
// encontrarla y ver quién habla. Cuenta las palabras como lib/lectura.js.
const leer = (texto) => Math.max(1500, 1000 + (texto.match(/\S*[\p{L}\p{N}]\S*/gu)?.length ?? 0) * 240)

// Lo que dura cada línea de `toma`. La toma dura lo que tardan en leerse sus
// líneas, y nunca menos que su tira, y las líneas se la reparten según su
// largo. Las tiras corren siempre a su `ms`: la que corre una vez lleva los
// cuadros que pida su texto, y nadie se queda quieto esperándolo.
function duracionesDe(toma, modo) {
  const lecturas = toma.lineas.map((l) => leer(textoDe(l, modo)))
  const lectura = lecturas.reduce((suma, ms) => suma + ms, 0)
  const dura = Math.max(lectura, cuadrosDe(toma) * toma.ms)
  return lecturas.map((l) => (dura * l) / lectura)
}

export default function iniciar(raiz) {
  flecha(raiz)
  if ('carga' in raiz.dataset) return pantallaDeCarga(raiz)
  const guiones = raiz.dataset.escena.split(' ').map((numero) => GUIONES[numero])
  const modo = modoDelPuntero()
  const tiras = tirasDe(guiones, modo)
  cargar(raiz, [...tiras.values()], () => escena(raiz, guiones, tiras, modo))
}

const modoDelPuntero = () => (matchMedia('(hover: hover) and (pointer: fine)').matches ? 'cursor' : 'huella')
const imagenDe = (ruta) => Object.assign(new Image(), { src: ruta })

// Con ratón, el cursor es la flecha del juego, en su lienzo encima de todo, y
// el CSS esconde el del sistema, también la mano de los botones: esa queda
// para los niveles. Sobre lo que se pulsa, la flecha se mece; al pulsar, se
// hunde. Aparece con el primer movimiento y se va si el ratón sale de la
// página: nunca se ven dos cursores, ni ninguno.
function flecha(raiz) {
  const lienzo = Object.assign(document.createElement('canvas'), { className: 'venganza-flecha', hidden: true })
  lienzo.width = Math.max(...FLECHA.map((fila) => fila.length))
  lienzo.height = FLECHA.length
  lienzo.setAttribute('aria-hidden', 'true')
  const pincel = lienzo.getContext('2d')
  FLECHA.forEach((fila, y) => {
    for (let x = 0; x < fila.length; x++) {
      if (fila[x] === ' ') continue
      pincel.fillStyle = fila[x] === 'X' ? '#0a1a2a' : '#ffffff'
      pincel.fillRect(x, y, 1, 1)
    }
  })
  raiz.append(lienzo)

  const medir = () => {
    const px = escalaDe(innerWidth, innerHeight)
    lienzo.style.setProperty('--px', `${px}px`)
    lienzo.style.width = `${lienzo.width * px}px`
  }
  const seguir = (e) => {
    const raton = e.pointerType !== 'touch'
    raiz.classList.toggle('con-flecha', raton)
    lienzo.hidden = !raton
    lienzo.style.translate = `${e.clientX}px ${e.clientY}px`
    lienzo.classList.toggle('sobre', Boolean(e.target.closest?.('a, button, summary')))
  }
  medir()
  addEventListener('resize', medir)
  document.addEventListener('pointermove', seguir)
  document.addEventListener('pointerdown', (e) => {
    seguir(e)
    lienzo.classList.add('hundida')
  })
  document.addEventListener('pointerup', () => lienzo.classList.remove('hundida'))
  document.addEventListener('pointerout', (e) => e.relatedTarget || (lienzo.hidden = true))
}

// La imagen de cada toma de `guiones`, incluidas las de sus finales.
const tirasDe = (guiones, modo) => new Map(guiones.flatMap(({ TOMAS, TODAS = TOMAS, rutaDeToma }) => TODAS.map((toma) => [toma, imagenDe(rutaDeToma(toma, modo))])))

function pantallaDeCarga(raiz) {
  const { tira, corredores = [], escenas = [] } = CARGAS[raiz.dataset.carga]
  const tiras = [
    ...[tira, ...corredores.map((c) => c.tira)].filter(Boolean).map(imagenDe),
    ...tirasDe(
      escenas.map((numero) => GUIONES[numero]),
      modoDelPuntero(),
    ).values(),
  ]
  const carga = raiz.querySelector('.carga')
  const fin = raiz.querySelector('.fin')
  let parar
  const mostrar = (verla) => {
    parar?.()
    carga.hidden = !verla
    fin.hidden = verla
    raiz.classList.toggle('en-escena', !verla)
    if (verla) parar = cargar(raiz, tiras)
    else fin.querySelector('.boton-primario').focus()
  }
  raiz.querySelector('.carga-salir').addEventListener('click', () => mostrar(false))
  raiz.querySelector('.fin-otra-vez').addEventListener('click', () => mostrar(true))
  mostrar(true)
}

// Cada tira decodificada llena su parte de la barra, sin adelantarse a lo que
// va de `MINIMO`; llena, `listo`. Una que falla cuenta igual: la toma queda en
// blanco, pero la escena sigue. Devuelve con qué pararla.
function cargar(raiz, tiras, listo) {
  const barra = raiz.querySelector('.carga-barra')
  const bloques = Number(getComputedStyle(barra).getPropertyValue('--bloques'))
  const desde = performance.now()
  let listas = 0
  for (const imagen of tiras) imagen.decode().catch(() => {}).finally(() => listas++)

  const reloj = setInterval(() => {
    const parte = Math.min(listas / tiras.length, (performance.now() - desde) / MINIMO)
    barra.style.setProperty('--llenos', Math.floor(parte * bloques))
    barra.setAttribute('aria-valuenow', Math.round(parte * 100))
    if (parte < 1) return
    clearInterval(reloj)
    if (listo) setTimeout(listo, PASO)
  }, PASO)
  return () => clearInterval(reloj)
}

function escena(raiz, guiones, tiras, modo) {
  const TOMAS = guiones.flatMap((guion) => guion.TOMAS)
  const { FINALES, FINAL } = guiones.at(-1)
  // Dónde empieza cada escena en TOMAS.
  const inicios = guiones.map((_, k) => guiones.slice(0, k).reduce((suma, guion) => suma + guion.TOMAS.length, 0))
  const lienzo = raiz.querySelector('.escena-cuadro')
  const pincel = lienzo.getContext('2d')
  const quien = raiz.querySelector('.escena-quien')
  const texto = raiz.querySelector('.escena-texto')
  const siguiente = raiz.querySelector('.escena-siguiente')
  const mandos = siguiente.parentElement
  const eleccion = raiz.querySelector('.escena-eleccion')
  const duraciones = new Map([...tiras.keys()].map((toma) => [toma, duracionesDe(toma, modo)]))

  raiz.querySelector('.carga').hidden = true
  raiz.querySelector('.escena').hidden = false
  raiz.classList.add('en-escena')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(raiz).backgroundColor)

  let tomas = TOMAS
  let toma = -1
  let linea = 0
  let desde = 0
  let espera = 0

  const dibujar = (ahora) => {
    const { unaVez, ms } = tomas[toma]
    const cuadros = cuadrosDe(tomas[toma])
    const paso = Math.floor((ahora - desde) / ms)
    const cuadro = quieto() ? (unaVez ? cuadros - 1 : cuadros / 2) : unaVez ? Math.min(paso, cuadros - 1) : paso % cuadros
    pincel.imageSmoothingEnabled = false
    const tira = tiras.get(tomas[toma])
    if (tira.naturalWidth) pincel.drawImage(tira, cuadro * ANCHO, 0, ANCHO, ALTO, 0, 0, ANCHO, ALTO)
    requestAnimationFrame(dibujar)
  }

  const decir = (l) => {
    quien.textContent = l?.quien ?? ''
    texto.textContent = l ? textoDe(l, modo) : ''
    texto.classList.toggle('acotacion', Boolean(l && !l.quien))
  }

  // Avanza una línea; sin más líneas, a la toma siguiente; sin más tomas, a
  // elegir el final, si hay que elegirlo, o a lo que sigue.
  const avanzar = () => {
    clearTimeout(espera)
    const lineas = toma < 0 ? [] : tomas[toma].lineas
    if (toma >= 0 && linea < lineas.length - 1) linea++
    else if (toma < tomas.length - 1) {
      toma++
      linea = 0
      desde = performance.now()
    } else return porElegir() ? elegir() : terminar()
    decir(tomas[toma].lineas[linea])
    const partes = duraciones.get(tomas[toma])
    // La última línea espera, además, a que termine la tira.
    const resta = linea >= tomas[toma].lineas.length - 1 ? desde + cuadrosDe(tomas[toma]) * tomas[toma].ms + 200 - performance.now() : 0
    espera = setTimeout(avanzar, Math.max(partes[linea] ?? 0, resta))
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

  const terminar = () => (porElegir() ? elegir() : location.assign(FINALES ? '/nosotros' : raiz.dataset.sigue))

  // Empieza de nuevo `lista`, desde su primera toma.
  const empezar = (lista) => {
    tomas = lista
    toma = -1
    avanzar()
    siguiente.focus()
  }

  // A la primera toma de la escena siguiente, si hay otra.
  const saltar = () => {
    const proxima = tomas === TOMAS ? inicios.find((inicio) => inicio > toma) : undefined
    if (proxima === undefined) return terminar()
    toma = proxima - 1
    linea = Infinity
    avanzar()
  }

  siguiente.addEventListener('click', avanzar)
  raiz.querySelector('.escena-saltar').addEventListener('click', saltar)
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

  empezar(TOMAS)
  requestAnimationFrame(dibujar)
}
