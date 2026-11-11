/**
 * Lo que se mueve o responde en Cauce (cauce.html). Sin JavaScript la página
 * se ve entera: las lecturas, el sensor y la gráfica quedan quietos en su
 * estado escrito y la calculadora muestra su ejemplo.
 *
 * - Las lecturas del mapa (`data-lectura`) oscilan con un seno lento desde su
 *   valor escrito, cada una con su amplitud, su periodo en segundos y su
 *   fase. Va en JavaScript porque WebKit no garantiza los contadores con
 *   decimales a partir de una propiedad animada. Escribe cuatro veces por
 *   segundo, solo cuando cambia el texto, que tiene su ancho fijo en el CSS.
 *   Se detienen con el movimiento reducido, con la pestaña oculta y mientras
 *   el visor tiene la página en espera (`.en-espera`).
 * - El sensor 3D (`.escena`) gira al arrastrarlo o con las flechas. Llega a
 *   su ángulo frenando, sin saltos. Dentro del visor no se arrastra con el
 *   dedo: ahí el gesto lateral pasa de un boceto a otro.
 * - La gráfica lee la humedad del punto bajo el cursor (o el de las flechas).
 * - La calculadora estima el ahorro de agua mientras se escribe, también al
 *   agente que la use, con lo que se escriba pasado por las mismas reglas.
 */

const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches
const raiz = document.documentElement
const formatear = (decimales) => new Intl.NumberFormat('es-CL', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })

function montarLecturas() {
  const lecturas = [...document.querySelectorAll('[data-lectura]')].map((elemento) => {
    const { lectura, amplitud, periodo, fase, decimales = '1' } = elemento.dataset
    return { elemento, base: Number(lectura), amplitud: Number(amplitud), periodo: Number(periodo) * 1000, fase: Number(fase), formato: formatear(Number(decimales)) }
  })
  if (quieto || !lecturas.length) return
  setInterval(() => {
    if (document.hidden || raiz.classList.contains('en-espera')) return
    const ahora = performance.now()
    for (const { elemento, base, amplitud, periodo, fase, formato } of lecturas) {
      const onda = Math.sin(2 * Math.PI * (ahora / periodo + fase)) - Math.sin(2 * Math.PI * fase)
      const texto = formato.format(base + amplitud * onda)
      if (elemento.textContent !== texto) elemento.textContent = texto
    }
  }, 250)
}

function montarGiro() {
  const escena = document.querySelector('.escena')
  const giro = escena?.querySelector('.giro')
  if (!giro) return
  const LIMITE = [-60, 25]
  const meta = { x: -24, y: -32 }
  const ahora = { ...meta }
  let cuadro = 0
  let arrastre = null

  const acotar = (x) => Math.min(LIMITE[1], Math.max(LIMITE[0], x))
  const pintar = () => {
    giro.style.setProperty('--gx', `${ahora.x.toFixed(2)}deg`)
    giro.style.setProperty('--gy', `${ahora.y.toFixed(2)}deg`)
  }
  // Se acerca a la meta una fracción por cuadro: arranca rápido y frena
  // hasta quedar quieto, sin pasarse.
  const seguir = () => {
    ahora.x += (meta.x - ahora.x) * 0.14
    ahora.y += (meta.y - ahora.y) * 0.14
    pintar()
    cuadro = Math.abs(meta.x - ahora.x) + Math.abs(meta.y - ahora.y) > 0.05 ? requestAnimationFrame(seguir) : 0
  }
  const mover = (dx, dy) => {
    meta.y += dx
    meta.x = acotar(meta.x + dy)
    if (quieto) {
      Object.assign(ahora, meta)
      pintar()
    } else if (!cuadro) cuadro = requestAnimationFrame(seguir)
  }

  escena.addEventListener('pointerdown', (evento) => {
    if (evento.pointerType !== 'mouse' && raiz.classList.contains('en-visor')) return
    arrastre = { x: evento.clientX, y: evento.clientY }
    escena.setPointerCapture(evento.pointerId)
    escena.classList.add('tomada')
  })
  escena.addEventListener('pointermove', (evento) => {
    if (!arrastre) return
    mover((evento.clientX - arrastre.x) * 0.45, -(evento.clientY - arrastre.y) * 0.3)
    arrastre = { x: evento.clientX, y: evento.clientY }
  })
  const soltar = () => {
    arrastre = null
    escena.classList.remove('tomada')
  }
  escena.addEventListener('pointerup', soltar)
  escena.addEventListener('pointercancel', soltar)
  escena.addEventListener('keydown', (evento) => {
    const paso = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, 10], ArrowDown: [0, -10] }[evento.key]
    if (!paso) return
    evento.preventDefault()
    mover(...paso)
  })
}

function montarGrafica() {
  const svg = document.querySelector('svg[data-humedad]')
  const cursor = svg?.querySelector('[data-cursor]')
  const texto = document.querySelector('[data-cursor-texto]')
  if (!cursor || !texto) return
  const valores = svg.dataset.humedad.split(' ').map(Number)
  const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom', 'Lun']
  const X0 = 44
  const X1 = 592
  const porcentaje = formatear(1)
  let actual = valores.length - 2

  const mostrar = (i) => {
    actual = Math.min(valores.length - 1, Math.max(0, i))
    const x = X0 + ((X1 - X0) * actual) / (valores.length - 1)
    cursor.setAttribute('transform', `translate(${x.toFixed(1)} 0)`)
    cursor.querySelector('circle').setAttribute('cy', (220 - (valores[actual] - 20) * 10).toFixed(1))
    const hora = String((actual % 8) * 3).padStart(2, '0')
    texto.textContent = `${DIAS[Math.floor(actual / 8)]} ${hora}:00 · ${porcentaje.format(valores[actual])} %`
  }
  svg.addEventListener('pointermove', (evento) => {
    const caja = svg.getBoundingClientRect()
    const x = ((evento.clientX - caja.left) / caja.width) * 600
    mostrar(Math.round(((x - X0) / (X1 - X0)) * (valores.length - 1)))
  })
  svg.addEventListener('keydown', (evento) => {
    const paso = { ArrowLeft: -1, ArrowRight: 1 }[evento.key]
    if (!paso) return
    evento.preventDefault()
    mostrar(actual + paso)
  })
  mostrar(actual)
}

// El consumo de una temporada por hectárea, en m³, y lo que ahorran en
// promedio los campos de Cauce. Son datos inventados para el boceto.
const CULTIVOS = { vid: ['vid vinífera', 4500], cerezo: ['cerezos', 7000], nogal: ['nogales', 9000], palto: ['paltos', 8500] }
const AHORRO = 0.28
const PESOS_POR_M3 = 120

function montarCalculadora() {
  const form = document.querySelector('form.calculadora')
  if (!form) return
  const agua = form.querySelector('[data-ahorro-agua]')
  const pesos = form.querySelector('[data-ahorro-pesos]')
  const entero = formatear(0)

  // Lo que se calcula pasa por las mismas reglas venga de una persona o de
  // un agente: hectáreas enteras entre 1 y 5.000 y un cultivo conocido.
  const calcular = () => {
    const hectareas = Math.round(Number(form.elements.hectareas.value))
    const cultivo = CULTIVOS[form.elements.cultivo.value]
    if (!cultivo || !Number.isFinite(hectareas) || hectareas < 1 || hectareas > 5000) return null
    const m3 = Math.round(hectareas * cultivo[1] * AHORRO)
    agua.textContent = entero.format(m3)
    pesos.textContent = `menos por temporada: $${entero.format(m3 * PESOS_POR_M3)} en bombeo`
    return { hectareas, cultivo: cultivo[0], m3 }
  }
  form.addEventListener('input', calcular)
  form.addEventListener('submit', (evento) => {
    evento.preventDefault()
    const listo = calcular()
    if (evento.agentInvoked)
      evento.respondWith(
        Promise.resolve(
          listo
            ? `Con ${entero.format(listo.hectareas)} ha de ${listo.cultivo}, unos ${entero.format(listo.m3)} m³ menos por temporada, cerca de $${entero.format(listo.m3 * PESOS_POR_M3)} en bombeo. Es una estimación de un boceto: Cauce es una marca inventada por Volutus.`
            : 'Faltan datos: las hectáreas van de 1 a 5.000 y el cultivo es vid, cerezo, nogal o palto.'
        )
      )
  })
}

montarLecturas()
montarGiro()
montarGrafica()
montarCalculadora()
