// El visor de los bocetos del brief (el `<dialog>` de paginas/Brief.jsx): un
// mazo de cartas. Cada boceto es una carta casi a pantalla completa, en un
// iframe, que se recorre con el scroll y se decide arrastrándola: a la
// derecha, me gusta; a la izquierda, no. Hacia arriba sale la hoja para
// comentar: desde los botones, o al llegar al final del boceto y seguir
// empujando. Los botones y las flechas del teclado hacen lo mismo, y en un
// trackpad basta deslizar con dos dedos. Debajo espera el siguiente ya
// cargado, así que al decidir no hay pantalla en blanco.
//
// El recorrido es una cola: el boceto abierto y luego los que faltan por
// calificar, o todos si ya están todos. Al terminarla, el visor se cierra y
// vuelve al brief: no da la vuelta.
//
// Lo que se envía es lo de la tarjeta (PreguntaBrief.jsx): el visor lo copia
// ahí al decidir y al comentar, y avisa con el evento de siempre, así que
// guardar, contar y revisar siguen pasando por brief.js. Dentro del iframe, el
// boceto no repite su propia barra (public/brief/bocetos/barra.js).
//
// Sin `<dialog>` (Safari antes de 15.4) no se monta y el arte abre el boceto
// en otra pestaña, como sin JavaScript.

import { BOCETOS, rutaDeBoceto } from './lib/brief/bocetos.js'
import { campoBoceto, campoNotaBoceto } from './lib/brief/reglas.js'

// Al soltarla, la carta se va si pasó esta fracción de su ancho o si iba más
// rápido que esto (px/ms) hacia ese lado; si no, vuelve a su sitio.
const UMBRAL = 0.3
const TIRON = 0.5
// Lo que gira la carta al llegar al umbral (grados) y lo chica que espera la
// de abajo.
const GIRO = 5
const ESCALA_ABAJO = 0.95
const SUAVE = 'cubic-bezier(0.23, 1, 0.32, 1)'
const quieto = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const escribiendo = (elemento) => elemento?.closest?.('input, textarea, select, [contenteditable]')

export default function montarVisor(form) {
  const visor = document.querySelector('.brief-visor')
  if (!visor?.showModal) return
  const raiz = document.documentElement

  const estilo = visor.querySelector('[data-visor-estilo]')
  const marca = visor.querySelector('[data-visor-marca]')
  const cuenta = visor.querySelector('[data-visor-cuenta]')
  const botones = visor.querySelector('.brief-visor-botones')
  const atras = visor.querySelector('[data-atras]')
  const comentar = visor.querySelector('[data-comentar]')
  const elegir = [...visor.querySelectorAll('[data-elegir]')]
  const nota = visor.querySelector('.brief-visor-nota')
  let [arriba, abajo] = visor.querySelectorAll('.brief-visor-carta')
  let cola = []
  let vistos = []
  let ocupado = false
  let abridor = null

  const total = BOCETOS.length
  const radiosDe = (i) => [...form.querySelectorAll(`input[name="${campoBoceto(BOCETOS[i].slug)}"]`)]
  const notaDe = (i) => form.elements.namedItem(campoNotaBoceto(BOCETOS[i].slug))
  const calificado = (i) => radiosDe(i).some(({ checked }) => checked)
  const avisar = (control, tipo) => control.dispatchEvent(new Event(tipo, { bubbles: true }))
  const ventanaDe = (carta) => carta.querySelector('iframe').contentWindow
  const cargada = (carta) => new Promise((listo) => carta.querySelector('iframe').addEventListener('load', listo, { once: true }))
  const conHoja = () => visor.classList.contains('con-hoja')

  // ---- Las cartas ----

  // Reemplaza lo que había en vez de navegar: el iframe no suma pasos al
  // historial y el «atrás» del navegador sigue siendo el del brief.
  function cargar(carta, i) {
    const { slug, nombre, rubro, titulo, fondo } = BOCETOS[i]
    carta.dataset.i = i
    carta.classList.add('cargando')
    carta.style.setProperty('--fondo-carta', fondo)
    carta.querySelector('iframe').title = `Boceto de ${titulo}: ${nombre}, ${rubro}`
    ventanaDe(carta).location.replace(rutaDeBoceto(slug))
  }

  // Sin siguiente, debajo de la última no hay carta (muestras.css).
  function vaciar(carta) {
    delete carta.dataset.i
    ventanaDe(carta).location.replace('about:blank')
  }

  // La carta de abajo espera con sus animaciones en pausa (barra.css): la
  // portada entra recién cuando empieza a verse.
  const esperar = (carta, si) => ventanaDe(carta).document?.documentElement.classList.toggle('en-espera', si)

  for (const carta of [arriba, abajo]) {
    carta.querySelector('iframe').addEventListener('load', () => {
      const ventana = ventanaDe(carta)
      if (ventana.location.href === 'about:blank') return
      carta.classList.remove('cargando')
      esperar(carta, carta !== arriba)
      ventana.addEventListener('touchstart', (evento) => tocar(evento, carta), { passive: true })
      ventana.addEventListener('touchmove', mientrasToca, { passive: true })
      ventana.addEventListener('touchend', soltarToque)
      ventana.addEventListener('touchcancel', soltarToque)
      ventana.addEventListener('wheel', (evento) => rodar(evento, carta), { passive: false })
      ventana.addEventListener('keydown', (evento) => teclear(evento, carta))
    })
  }

  // La de arriba se ve y se toca; la de abajo no recibe foco ni la leen los
  // lectores de pantalla.
  function ordenar() {
    arriba.classList.add('arriba')
    abajo.classList.remove('arriba')
    arriba.inert = false
    abajo.inert = true
    for (const carta of [arriba, abajo]) {
      carta.getAnimations().forEach((animacion) => animacion.cancel())
      carta.style.transform = ''
    }
    visor.style.setProperty('--avance', 0)
    dibujado = { x: 0, giro: 0 }
    esperar(arriba, false)
    esperar(abajo, true)
  }

  function presentar() {
    const i = cola[0]
    const { nombre, rubro, titulo, fondo } = BOCETOS[i]
    raiz.style.setProperty('--fondo-boceto', fondo)
    estilo.textContent = titulo
    marca.textContent = `${nombre} · ${rubro}`
    cuenta.textContent = `${i + 1} de ${total}`
    marcar(radiosDe(i).find(({ checked }) => checked)?.value)
    atras.disabled = !vistos.length
    if (cola.length < 2) vaciar(abajo)
    else if (Number(abajo.dataset.i) !== cola[1]) cargar(abajo, cola[1])
  }

  const marcar = (valor) => elegir.forEach((boton) => boton.setAttribute('aria-pressed', String(boton.dataset.elegir === valor)))

  // ---- El arrastre ----

  // Dónde está la carta dibujada: lo necesita el toque, que llega con
  // coordenadas de adentro del iframe, ya movido y girado.
  let dibujado = { x: 0, giro: 0 }
  let porDibujar = 0
  let cuadro = 0

  function mover(x) {
    const avance = x / (arriba.offsetWidth * UMBRAL)
    const giro = quieto() ? 0 : Math.max(-1.6, Math.min(1.6, avance)) * GIRO
    arriba.style.transform = `translateX(${x}px) rotate(${giro}deg)`
    abajo.style.transform = `scale(${ESCALA_ABAJO + (1 - ESCALA_ABAJO) * Math.min(1, Math.abs(avance))})`
    visor.style.setProperty('--avance', avance.toFixed(3))
    dibujado = { x, giro: (giro * Math.PI) / 180 }
  }

  function moverEnElCuadro(x) {
    porDibujar = x
    cuadro ||= requestAnimationFrame(() => {
      cuadro = 0
      mover(porDibujar)
    })
  }

  // Del iframe al mazo: deshace el giro (alrededor de su `transform-origin`,
  // muestras.css) y el corrimiento de la carta.
  function alMazo(x, y) {
    const ox = arriba.offsetWidth / 2
    const oy = arriba.offsetHeight * 0.9
    const cos = Math.cos(dibujado.giro)
    const sin = Math.sin(dibujado.giro)
    return {
      x: ox + (x - ox) * cos - (y - oy) * sin + dibujado.x,
      y: oy + (x - ox) * sin + (y - oy) * cos,
    }
  }

  function empezarArrastre() {
    visor.classList.add('arrastrando')
    esperar(abajo, false)
  }

  // La rapidez de los últimos 100 ms, en px/ms.
  function rapidez(rastro) {
    const [t1, x1] = rastro.at(-1) ?? [0, 0]
    const [t0, x0] = rastro.find(([t]) => t1 - t <= 100) ?? [t1, x1]
    return t1 > t0 ? (x1 - x0) / (t1 - t0) : 0
  }

  // Al soltar, la carta queda donde iba el dedo y desde ahí se va o vuelve.
  function soltar(x, v) {
    cancelAnimationFrame(cuadro)
    cuadro = 0
    mover(x)
    visor.classList.remove('arrastrando')
    const lado = Math.sign(x)
    const lejos = Math.abs(x) > arriba.offsetWidth * UMBRAL
    const lanzada = Math.sign(v) === lado && Math.abs(v) > TIRON
    if (lado && (lejos || lanzada)) decidir(lado > 0 ? 'si' : 'no', x, v)
    else volver()
  }

  // Con el dedo: de lado mueve la carta; en vertical, el boceto se desplaza
  // solo (barra.css le deja al navegador nada más que eso) y, si ya estaba al
  // final, seguir empujando hacia arriba abre la hoja.
  let toque = null

  function tocar(evento, carta) {
    toque = null
    if (carta !== arriba || ocupado || conHoja() || evento.touches.length > 1) return
    const { clientX, clientY, target } = evento.touches[0]
    if (escribiendo(target) || target.closest?.('[data-comparar-marco]')) return
    const ventana = ventanaDe(carta)
    const alFinal = ventana.scrollY + ventana.innerHeight >= ventana.document.documentElement.scrollHeight - 2
    toque = { x0: clientX, y0: clientY, eje: null, alFinal, rastro: [] }
  }

  function mientrasToca(evento) {
    if (!toque || evento.touches.length > 1) return
    const { clientX, clientY } = evento.touches[0]
    const { x, y } = alMazo(clientX, clientY)
    const dx = x - toque.x0
    const dy = y - toque.y0
    if (!toque.eje) {
      if (Math.hypot(dx, dy) < 10) return
      toque.eje = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      if (toque.eje === 'x') empezarArrastre()
    }
    if (toque.eje === 'y') {
      if (toque.alFinal && dy < -60) {
        toque = null
        abrirHoja()
      }
      return
    }
    toque.rastro.push([performance.now(), dx])
    moverEnElCuadro(dx)
  }

  function soltarToque() {
    if (toque?.eje === 'x') soltar(toque.rastro.at(-1)?.[1] ?? 0, rapidez(toque.rastro))
    toque = null
  }

  // Con dos dedos en un trackpad: el deslizamiento lateral mueve la carta
  // (y no lleva el navegador a la página anterior), y la carta sigue con la
  // inercia del sistema; cuando dejan de llegar, se suelta. Lo que llega
  // después de decidir se ignora hasta que se calma.
  let rueda = null
  let calma = 0

  function rodar(evento, carta) {
    const lateral = Math.abs(evento.deltaX) > Math.abs(evento.deltaY) && Math.abs(evento.deltaX) > 1
    if (carta !== arriba || (!rueda && !lateral)) return
    evento.preventDefault()
    const ahora = performance.now()
    if (ocupado || conHoja() || ahora < calma) {
      calma = ahora + 200
      return
    }
    if (!rueda) {
      rueda = { x: 0, rastro: [] }
      empezarArrastre()
    }
    rueda.x -= evento.deltaX * (evento.deltaMode === 1 ? 16 : 1)
    rueda.rastro.push([ahora, rueda.x])
    clearTimeout(rueda.fin)
    if (Math.abs(rueda.x) > arriba.offsetWidth * UMBRAL * 1.5) return soltarRueda()
    moverEnElCuadro(rueda.x)
    rueda.fin = setTimeout(soltarRueda, 160)
  }

  function soltarRueda() {
    const { x, rastro, fin } = rueda
    clearTimeout(fin)
    rueda = null
    calma = performance.now() + 200
    soltar(x, rapidez(rastro))
  }

  // ---- Decidir, volver y retroceder ----

  // La carta sale con la rapidez con que se soltó: la curva arranca con esa
  // pendiente. Desde los botones sale del reposo, acelerando. Con el
  // movimiento reducido, solo se desvanece.
  function lanzar(lado, x, v) {
    if (quieto()) return arriba.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' }).finished
    const destino = lado * (arriba.offsetWidth * 1.2 + 120)
    const distancia = Math.abs(destino - x)
    const duracion = Math.min(460, Math.max(260, distancia / Math.max(Math.abs(v), 1.4)))
    const pendiente = Math.min(1, (0.35 * Math.abs(v) * duracion) / distancia)
    const sale = { duration: duracion, easing: `cubic-bezier(0.35, ${pendiente.toFixed(3)}, 0.75, 0.75)`, fill: 'forwards' }
    const sube = { duration: duracion, easing: SUAVE, fill: 'forwards' }
    return Promise.all([
      arriba.animate([{ transform: arriba.style.transform || 'none' }, { transform: `translateX(${destino}px) rotate(${lado * GIRO * 2.4}deg)` }], sale).finished,
      abajo.animate([{ transform: abajo.style.transform || `scale(${ESCALA_ABAJO})` }, { transform: 'none' }], sube).finished,
    ])
  }

  async function decidir(valor, x = 0, v = 0) {
    if (ocupado || !cola.length) return
    ocupado = true
    visor.classList.remove('con-ayuda')
    const radios = radiosDe(cola[0])
    radios.forEach((opcion) => (opcion.checked = opcion.value === valor))
    avisar(radios[0], 'change')
    marcar(valor)
    const lado = valor === 'si' ? 1 : -1
    visor.style.setProperty('--avance', lado * 1.5)
    esperar(abajo, false)
    const desdeAdentro = document.activeElement === arriba.querySelector('iframe')
    await lanzar(lado, x, v)
    vistos.push({ i: cola.shift(), lado })
    if (!cola.length) return cerrar()
    ;[arriba, abajo] = [abajo, arriba]
    ordenar()
    presentar()
    if (desdeAdentro) elegir.find((boton) => boton.dataset.elegir === valor).focus()
    ocupado = false
  }

  // Sin llegar al umbral, la carta vuelve a su sitio sin pasarse.
  async function volver() {
    ocupado = true
    visor.style.setProperty('--avance', 0)
    const opciones = { duration: 380, easing: SUAVE }
    const animaciones = [
      arriba.animate([{ transform: arriba.style.transform || 'none' }, { transform: 'none' }], opciones),
      abajo.animate([{ transform: abajo.style.transform || 'none' }, { transform: `scale(${ESCALA_ABAJO})` }], opciones),
    ]
    arriba.style.transform = ''
    abajo.style.transform = ''
    dibujado = { x: 0, giro: 0 }
    await Promise.all(animaciones.map(({ finished }) => finished))
    ocupado = false
  }

  // La carta anterior vuelve por el lado por el que salió, sobre la actual.
  async function retroceder() {
    if (ocupado || !vistos.length) return
    ocupado = true
    visor.classList.remove('con-ayuda')
    const { i, lado } = vistos.pop()
    cola.unshift(i)
    const vuelve = abajo
    const lista = cargada(vuelve)
    cargar(vuelve, i)
    await lista
    ;[arriba, abajo] = [vuelve, arriba]
    ordenar()
    presentar()
    const opciones = { duration: 460, easing: SUAVE }
    const desde = `translateX(${lado * (arriba.offsetWidth * 1.2 + 120)}px) rotate(${lado * GIRO * 2.4}deg)`
    await Promise.all([
      quieto()
        ? arriba.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 }).finished
        : arriba.animate([{ transform: desde }, { transform: 'none' }], opciones).finished,
      abajo.animate([{ transform: 'none' }, { transform: `scale(${ESCALA_ABAJO})` }], opciones).finished,
    ])
    ocupado = false
  }

  // ---- La hoja del comentario ----

  function abrirHoja() {
    if (ocupado || !cola.length || conHoja()) return
    nota.value = notaDe(cola[0]).value
    visor.classList.add('con-hoja')
    comentar.setAttribute('aria-expanded', 'true')
    nota.focus({ preventScroll: true })
  }

  function cerrarHoja() {
    if (!conHoja()) return
    visor.classList.remove('con-hoja')
    comentar.setAttribute('aria-expanded', 'false')
    comentar.focus()
  }

  nota.addEventListener('input', () => {
    const enLaTarjeta = notaDe(cola[0])
    enLaTarjeta.value = nota.value
    avisar(enLaTarjeta, 'input')
  })
  nota.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Enter') return
    evento.preventDefault()
    cerrarHoja()
  })
  visor.querySelector('[data-listo]').addEventListener('click', cerrarHoja)

  // ---- Botones y teclado ----

  // Arrastrar los botones hacia arriba también abre la hoja; el toque que
  // termina ese arrastre no cuenta como clic.
  let alzar = null
  let sinClic = false
  botones.addEventListener('pointerdown', ({ clientY }) => {
    alzar = clientY
    sinClic = false
  })
  botones.addEventListener('pointermove', ({ clientY }) => {
    if (alzar === null || alzar - clientY < 30) return
    alzar = null
    sinClic = true
    abrirHoja()
  })
  botones.addEventListener(
    'click',
    (evento) => {
      if (sinClic) evento.stopPropagation()
      sinClic = false
    },
    true
  )
  addEventListener('pointerup', () => (alzar = null))

  for (const boton of elegir) boton.addEventListener('click', () => decidir(boton.dataset.elegir))
  comentar.addEventListener('click', () => (conHoja() ? cerrarHoja() : abrirHoja()))
  atras.addEventListener('click', retroceder)

  // Las flechas deciden, ↑ abre la hoja y borrar retrocede. Dentro del
  // boceto, ↑ sigue desplazando la página, y en sus campos nada cambia.
  function teclear(evento, carta) {
    const { key, target, altKey, ctrlKey, metaKey } = evento
    if ((carta && carta !== arriba) || escribiendo(target) || altKey || ctrlKey || metaKey || conHoja()) return
    const acciones = { ArrowLeft: () => decidir('no'), ArrowRight: () => decidir('si'), Backspace: retroceder }
    if (!carta) acciones.ArrowUp = abrirHoja
    if (!acciones[key]) return
    evento.preventDefault()
    acciones[key]()
  }
  visor.addEventListener('keydown', (evento) => teclear(evento, null))

  // ---- Abrir y cerrar ----

  function abrir(i, desde) {
    abridor = desde
    const faltan = BOCETOS.some((_, n) => !calificado(n))
    cola = BOCETOS.map((_, n) => (i + n) % total).filter((n) => n === i || !faltan || !calificado(n))
    vistos = []
    ocupado = false
    visor.classList.add('con-ayuda')
    ordenar()
    cargar(arriba, i)
    presentar()
    ubicar()
    visor.showModal()
  }

  // En teléfonos el visor no es fijo sino absoluto, donde está la página
  // (muestras.css): así el boceto se ve bajo la hora y la barra de Safari.
  // Si la pantalla gira, se vuelve a ubicar.
  const ubicar = () => visor.style.setProperty('--visor-y', `${scrollY}px`)
  addEventListener('resize', () => visor.open && ubicar())

  async function cerrar() {
    ocupado = true
    if (!quieto()) await visor.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-out', fill: 'forwards' }).finished
    visor.close()
  }

  // Escape cierra primero la hoja, y el visor con el mismo fundido que salir.
  visor.addEventListener('cancel', (evento) => {
    evento.preventDefault()
    if (conHoja()) cerrarHoja()
    else if (!ocupado) cerrar()
  })
  visor.querySelectorAll('[data-cerrar]').forEach((boton) => boton.addEventListener('click', cerrar))

  // Al cerrar, los iframes sueltan los bocetos y el foco vuelve adonde estaba.
  visor.addEventListener('close', () => {
    raiz.style.removeProperty('--fondo-boceto')
    visor.classList.remove('con-hoja')
    comentar.setAttribute('aria-expanded', 'false')
    visor.getAnimations().forEach((animacion) => animacion.cancel())
    vaciar(arriba)
    vaciar(abajo)
    ocupado = false
    abridor?.focus()
  })

  // El arte de cada tarjeta abre su boceto aquí y ya no en otra pestaña.
  for (const arte of form.querySelectorAll('[data-visor]')) {
    arte.setAttribute('aria-haspopup', 'dialog')
    arte.querySelector('[data-otra-pestana]')?.remove()
    arte.addEventListener('click', (evento) => {
      if (evento.metaKey || evento.ctrlKey || evento.shiftKey) return
      evento.preventDefault()
      abrir(
        BOCETOS.findIndex((boceto) => boceto.slug === arte.dataset.visor),
        arte
      )
    })
  }

  // La invitación a recorrerlos dice cuántos van y retoma donde se quedó.
  const recorrer = form.querySelector('.brief-recorrer')
  const llevas = recorrer.querySelector('[data-recorrer-cuenta]')
  const accion = recorrer.querySelector('[data-recorrer-texto]')

  function contar() {
    const n = BOCETOS.filter((_, i) => calificado(i)).length
    llevas.textContent = n === 0 ? `Son ${total}, y toma unos minutos` : n === total ? `Calificaste los ${total}` : `Llevas ${n} de ${total}: te faltan ${total - n}`
    accion.textContent = n === 0 ? 'Empezar el recorrido' : n === total ? 'Verlos de nuevo' : 'Seguir donde quedé'
  }

  recorrer.querySelector('[data-recorrer]').addEventListener('click', ({ currentTarget }) => {
    abrir(Math.max(0, BOCETOS.findIndex((_, i) => !calificado(i))), currentTarget)
  })
  form.addEventListener('change', contar)
  form.addEventListener('reset', () => setTimeout(contar))
  addEventListener('storage', contar)
  contar()
  recorrer.hidden = false
}
