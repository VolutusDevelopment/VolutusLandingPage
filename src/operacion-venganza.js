/**
 * Operación Venganza (paginas/OperacionVenganza.jsx): el juego entero, en una
 * sola página, desde la escena o el nivel de su `data-desde` (lib/juego.js)
 * hasta el final. Las escenas, con sus guiones (lib/escena1.js, escena2.js,
 * escena3.js, escena5.js, escena6.js, escena9.js, escena10.js, escena11.js,
 * escena13.js, escena14.js, escena15.js y escena16.js; las medidas de las
 * tiras son las de la 1), corren seguidas como una sola, y entre ellas, en su
 * sección, los niveles (src/combate.js).
 *
 * Hay una sola pantalla de carga, al principio: camina uno de los personajes,
 * al azar (lo anima el CSS), y bajan las tiras de todas las escenas, las
 * hojas de los cazas y el código del combate. La barra muestra cuánto ya
 * está, pero no se llena antes de `MINIMO`: con todo en caché la carga se
 * alcanza a ver igual. Llena, tras `PASO` empieza el juego y ya no se
 * detiene: de una escena a un nivel, y de vuelta, las bandas negras pasan de
 * una sección a la otra sin cortes. Cada página que empieza queda en la barra
 * de direcciones, y al recargar el juego sigue desde ella.
 *
 * Cada toma se pinta en un lienzo de `ANCHO` × `ALTO` px, en 21:9, que el CSS
 * agranda sin suavizar; la tira de la siguiente se decodifica mientras corre.
 * Sus líneas pasan solas, al ritmo de lo que tarda leerlas (`leer`), y
 * «Siguiente», Enter o la barra espaciadora pasan a la siguiente. «Saltar
 * escena» pasa a la siguiente escena, o desde la última a lo que sigue. Sin
 * movimiento, cada toma queda en un solo cuadro.
 *
 * El navegador elige qué muestra la pantalla de la sala: con un puntero fino
 * que flota (ratón, trackpad) es un cursor, y si no, una huella.
 *
 * Con ratón, el cursor de las escenas es la flecha del juego (`flecha`); en
 * los niveles, quien juega.
 *
 * En la página de una pantalla de carga (lib/cargas.js, `data-carga`) no hay
 * juego: la barra se llena con las tiras de sus escenas y queda llena hasta
 * que se pide el índice, y «Ver otra vez» vuelve a la carga.
 *
 * Al acabar la 16 (o al saltarla), quien juega elige uno de sus `FINALES` en
 * el menú que aparece sobre el cuadro (con el ratón, el dedo o las flechas), y
 * corren sus tomas. Su nombre queda en la sesión, en la clave `FINAL` del
 * guion, para /nosotros (src/flota.js), adonde se va sola la página al
 * terminarlas.
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
import { rutaDeCaza, rutaDeRetratos } from './lib/cazas.js'
import { BORDE, FLECHA, escalaDe } from './lib/flecha.js'
import { NIVELES, PAGINAS, tramosDesde } from './lib/juego.js'

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
// cuadros que pida su texto, y nadie se queda quieto esperándolo. Si una
// línea sale en un `cuadro` de la tira, la de antes dura hasta ahí, y ella lo
// que tarde en leerse.
function duracionesDe(toma, modo) {
  const lecturas = toma.lineas.map((l) => leer(textoDe(l, modo)))
  const lectura = lecturas.reduce((suma, ms) => suma + ms, 0)
  const dura = Math.max(lectura, cuadrosDe(toma) * toma.ms)
  return lecturas.map((l, i) => {
    const sigue = toma.lineas[i + 1]?.cuadro
    if (sigue !== undefined) return (sigue - (toma.lineas[i].cuadro ?? 0)) * toma.ms
    return toma.lineas[i].cuadro === undefined ? (dura * l) / lectura : l
  })
}

export default function iniciar(raiz) {
  flecha(raiz)
  if ('carga' in raiz.dataset) return pantallaDeCarga(raiz)
  juego(raiz)
}

// Las hojas de los cazas de los niveles y la de los retratos de quien habla.
const HOJAS = [...new Set(Object.values(NIVELES).flatMap(({ CAZAS }) => Object.values(CAZAS).map(({ hoja }) => rutaDeCaza(hoja)))), rutaDeRetratos]

// Cuando ya bajó `imagen`: sin decodificarla, porque todas juntas no caben en
// la memoria de un teléfono; cada tira se decodifica antes de su toma.
const bajada = (imagen) =>
  imagen.complete && imagen.naturalWidth
    ? Promise.resolve()
    : new Promise((listo, falla) => {
        imagen.addEventListener('load', listo, { once: true })
        imagen.addEventListener('error', falla, { once: true })
      })

// La carga, y después cada tramo desde `data-desde`: las escenas seguidas, en
// su sección, y cada nivel en la suya, que al terminar le cede el lugar a lo
// que sigue.
function juego(raiz) {
  const modo = modoDelPuntero()
  const tiras = tirasDe(Object.values(GUIONES), modo)
  const combate = import('./combate.js')
  const caminantes = raiz.querySelectorAll('.carga-pato')
  caminantes[Math.floor(Math.random() * caminantes.length)].hidden = false
  // La letra de las ventanas del juego también, para que no cambie al verse.
  const letra = document.fonts.load("16px 'Press Start 2P'")
  cargar(raiz, [...[...tiras.values(), ...HOJAS.map(imagenDe)].map(bajada), combate, letra], () => {
    raiz.querySelector('.carga').hidden = true
    raiz.classList.add('en-escena')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(raiz).backgroundColor)
    const reproducir = reproductor(raiz, tiras, modo)
    const tramos = tramosDesde(raiz.dataset.desde)
    const seguir = (i) => {
      const { escenas, nivel, enlace } = tramos[i]
      if (escenas) return reproducir(escenas, () => seguir(i + 1))
      history.replaceState(null, '', enlace)
      const seccion = raiz.querySelector(`.nivel[data-nivel="${nivel}"]`)
      combate.then(({ default: jugar }) => {
        // En el nivel, el cursor es quien juega: la flecha se va hasta que vuelvan las escenas.
        raiz.classList.remove('con-flecha')
        raiz.querySelector('.venganza-flecha').hidden = true
        seccion.hidden = false
        jugar(seccion, () => {
          seccion.hidden = true
          seguir(i + 1)
        })
      })
    }
    seguir(0)
  })
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
      pincel.fillStyle = fila[x] === 'X' ? BORDE : '#ffffff'
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
    const raton = e.pointerType !== 'touch' && !e.target.closest?.('.nivel')
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

// Cada toma de `guiones`, incluidas las de sus finales, con la ruta de su tira.
const tomasDe = (guiones, modo) => guiones.flatMap(({ TOMAS, TODAS = TOMAS, rutaDeToma }) => TODAS.map((toma) => [toma, rutaDeToma(toma, modo)]))
const rutasDe = (guiones, modo) => tomasDe(guiones, modo).map(([, ruta]) => ruta)
// La imagen de cada una.
const tirasDe = (guiones, modo) => new Map(tomasDe(guiones, modo).map(([toma, ruta]) => [toma, imagenDe(ruta)]))

function pantallaDeCarga(raiz) {
  const { tira, corredores = [], escenas = [] } = CARGAS[raiz.dataset.carga]
  const tiras = [
    ...[tira, ...corredores.map((c) => c.tira)].filter(Boolean).map(imagenDe),
    ...rutasDe(
      escenas.map((numero) => GUIONES[numero]),
      modoDelPuntero(),
    ).map(imagenDe),
  ]
  const carga = raiz.querySelector('.carga')
  const fin = raiz.querySelector('.fin')
  let parar
  const mostrar = (verla) => {
    parar?.()
    carga.hidden = !verla
    fin.hidden = verla
    raiz.classList.toggle('en-escena', !verla)
    if (verla) parar = cargar(raiz, tiras.map((imagen) => imagen.decode()))
    else fin.querySelector('.boton-primario').focus()
  }
  raiz.querySelector('.carga-salir').addEventListener('click', () => mostrar(false))
  raiz.querySelector('.fin-otra-vez').addEventListener('click', () => mostrar(true))
  mostrar(true)
}

// Cada tira lista (cada promesa de `cargas` cumplida) llena su parte de la
// barra, sin adelantarse a lo que va de `MINIMO`; llena, `listo`. Una que
// falla cuenta igual: la toma queda en blanco, pero la escena sigue. Devuelve
// con qué pararla.
function cargar(raiz, cargas, listo) {
  const barra = raiz.querySelector('.carga-barra')
  const bloques = Number(getComputedStyle(barra).getPropertyValue('--bloques'))
  const desde = performance.now()
  let listas = 0
  for (const carga of cargas) carga.catch(() => {}).finally(() => listas++)

  const reloj = setInterval(() => {
    const parte = Math.min(listas / cargas.length, (performance.now() - desde) / MINIMO)
    barra.style.setProperty('--llenos', Math.floor(parte * bloques))
    barra.setAttribute('aria-valuenow', Math.round(parte * 100))
    if (parte < 1) return
    clearInterval(reloj)
    if (listo) setTimeout(listo, PASO)
  }, PASO)
  return () => clearInterval(reloj)
}

// Las escenas: devuelve con qué correr las de unos enlaces, una tras otra,
// como una sola, y al acabarlas (o al saltar la última) seguir con `despues`;
// tras la 16, quien juega elige el final. Los botones y el lienzo se preparan
// una vez: entre un tramo y otro, la sección espera escondida.
function reproductor(raiz, tiras, modo) {
  const seccion = raiz.querySelector('.escena')
  const lienzo = seccion.querySelector('.escena-cuadro')
  const pincel = lienzo.getContext('2d')
  const quien = seccion.querySelector('.escena-quien')
  const texto = seccion.querySelector('.escena-texto')
  const siguiente = seccion.querySelector('.escena-siguiente')
  const mandos = siguiente.parentElement
  const eleccion = seccion.querySelector('.escena-eleccion')
  const duraciones = new Map([...tiras.keys()].map((toma) => [toma, duracionesDe(toma, modo)]))

  let TOMAS = []
  let FINALES, FINAL, enlaces, inicios, despues
  let tomas = TOMAS
  let toma = -1
  let linea = 0
  let desde = 0
  let espera = 0

  const pintar = (ahora) => {
    const { unaVez, ms } = tomas[toma]
    const cuadros = cuadrosDe(tomas[toma])
    const paso = Math.floor((ahora - desde) / ms)
    const cuadro = quieto() ? (unaVez ? cuadros - 1 : cuadros / 2) : unaVez ? Math.min(paso, cuadros - 1) : paso % cuadros
    pincel.imageSmoothingEnabled = false
    const tira = tiras.get(tomas[toma])
    if (tira.naturalWidth) pincel.drawImage(tira, cuadro * ANCHO, 0, ANCHO, ALTO, 0, 0, ANCHO, ALTO)
  }
  const dibujar = (ahora) => {
    if (!seccion.hidden && toma >= 0) pintar(ahora)
    requestAnimationFrame(dibujar)
  }

  const decir = (l) => {
    quien.textContent = l?.quien ?? ''
    texto.textContent = l ? textoDe(l, modo) : ''
    texto.classList.toggle('acotacion', Boolean(l && !l.quien))
  }

  // Al empezar una escena, su página queda en la barra de direcciones; y la
  // tira de la toma que viene se decodifica mientras corre esta.
  const empiezaToma = () => {
    const escena = tomas === TOMAS ? inicios.indexOf(toma) : -1
    if (escena >= 0) history.replaceState(null, '', enlaces[escena])
    tiras.get(tomas[toma + 1])?.decode().catch(() => {})
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
      empiezaToma()
    } else return porElegir() ? elegir() : terminar()
    decir(tomas[toma].lineas[linea])
    const partes = duraciones.get(tomas[toma])
    // La última línea espera, además, a que termine la tira.
    const resta = linea >= tomas[toma].lineas.length - 1 ? desde + cuadrosDe(tomas[toma]) * tomas[toma].ms + 200 - performance.now() : 0
    espera = setTimeout(avanzar, Math.max(partes[linea] ?? 0, resta))
  }

  const porElegir = () => FINALES && tomas === TOMAS

  // La última toma queda en su último cuadro, con su última línea, y sobre él
  // aparece el menú de los finales; «Saltar escena» y «Siguiente» se van.
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

  // Sin más escenas: elegir el final, Nosotros tras él, o lo que sigue.
  const terminar = () => {
    if (porElegir()) return elegir()
    if (FINALES) return location.assign('/nosotros')
    clearTimeout(espera)
    seccion.hidden = true
    toma = -1
    despues()
  }

  // Empieza de nuevo `lista`, desde su primera toma, y la pinta al tiro: no
  // queda un cuadro de lo anterior.
  const empezar = (lista) => {
    tomas = lista
    toma = -1
    avanzar()
    pintar(performance.now())
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
  seccion.querySelector('.escena-saltar').addEventListener('click', saltar)
  // Como en un menú de juego, las flechas pasan de una opción a la otra.
  eleccion.addEventListener('keydown', (e) => {
    const paso = { ArrowDown: 1, ArrowUp: -1 }[e.key]
    if (!paso) return
    e.preventDefault()
    const opciones = [...eleccion.querySelectorAll('button')]
    opciones[(opciones.indexOf(document.activeElement) + paso + opciones.length) % opciones.length].focus()
  })
  eleccion.addEventListener('click', ({ target }) => {
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
  requestAnimationFrame(dibujar)

  return (lista, alTerminar) => {
    const guiones = lista.map((enlace) => GUIONES[PAGINAS[enlace].numero])
    TOMAS = guiones.flatMap((guion) => guion.TOMAS)
    ;({ FINALES, FINAL } = guiones.at(-1))
    // Dónde empieza cada escena en TOMAS.
    inicios = guiones.map((_, k) => guiones.slice(0, k).reduce((suma, guion) => suma + guion.TOMAS.length, 0))
    enlaces = lista
    despues = alTerminar
    seccion.hidden = false
    empezar(TOMAS)
  }
}
