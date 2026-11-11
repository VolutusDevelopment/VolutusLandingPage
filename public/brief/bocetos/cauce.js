/**
 * Lo que se mueve o responde en Cauce (cauce.html). Sin JavaScript la página
 * se ve entera: las lecturas, el sensor y la gráfica quedan quietos en su
 * estado escrito y la calculadora muestra su ejemplo.
 *
 * - En el mapa de la portada, una barra de lectura cruza de lado a lado cada
 *   nueve segundos. Cuando pasa por un sensor, sus lecturas (`data-lectura`)
 *   se ponen al día con un seno lento desde su valor escrito, con su amplitud,
 *   su periodo y su fase, y su nota se marca un instante. Los textos tienen su
 *   ancho fijo en el CSS.
 * - El corte del riego sale de un modelo con el tiempo del riego de 0 a 1: el
 *   agua baja bajo cada gotero como un bulbo, más hondo que ancho, que crece
 *   con la raíz del agua entregada; la estaca la lee a 20, 40 y 60 cm cuando
 *   el bulbo del gotero vecino la alcanza. El tiempo sigue al scroll con un
 *   resorte, para que la rueda del mouse no lo mueva a tirones.
 * - El sensor 3D (`.escena`) gira al arrastrarlo o con las flechas. Llega a
 *   su ángulo frenando, sin saltos. Dentro del visor no se arrastra con el
 *   dedo: ahí el gesto lateral pasa de un boceto a otro.
 * - La gráfica lee la humedad del punto bajo el cursor (o el de las flechas).
 * - La calculadora estima el ahorro de agua mientras se escribe, también al
 *   agente que la use, con lo que se escriba pasado por las mismas reglas.
 *
 * Lo que corre solo se detiene con el movimiento reducido, con la pestaña
 * oculta, fuera de la pantalla y mientras el visor tiene la página en espera
 * (`.en-espera`). Con el movimiento reducido, el corte muestra el riego
 * terminado.
 */

const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches
const raiz = document.documentElement
const formatear = (decimales) => new Intl.NumberFormat('es-CL', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })
const limitar = (valor) => Math.min(1, Math.max(0, valor))
const suave = (valor) => {
  const t = limitar(valor)
  return t * t * (3 - 2 * t)
}
const enPausa = () => document.hidden || raiz.classList.contains('en-espera')

// Un bucle que corre solo mientras su elemento se ve y la página no espera.
function mientrasSeVe(elemento, cuadro) {
  let visible = false
  let pedido = 0
  const paso = (ahora) => {
    pedido = 0
    if (!visible || enPausa()) return
    if (cuadro(ahora) !== false) pedido = requestAnimationFrame(paso)
  }
  const despertar = () => {
    if (!pedido && visible && !enPausa()) pedido = requestAnimationFrame(paso)
  }
  new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting
    despertar()
  }).observe(elemento)
  document.addEventListener('visibilitychange', despertar)
  new MutationObserver(despertar).observe(raiz, { attributes: true, attributeFilter: ['class'] })
  return despertar
}

function montarMapa() {
  const lienzo = document.querySelector('.lienzo')
  const barrido = lienzo?.querySelector('.barrido')
  if (!barrido) return
  const sensores = [...lienzo.querySelectorAll('.sensor')].map((sensor) => ({
    x: parseFloat(sensor.style.getPropertyValue('--x')) / 100,
    nota: sensor.querySelector('.nota'),
    lecturas: [...sensor.querySelectorAll('[data-lectura]')].map((elemento) => {
      const { lectura, amplitud, periodo, fase, decimales = '1' } = elemento.dataset
      return { elemento, base: Number(lectura), amplitud: Number(amplitud), periodo: Number(periodo) * 1000, fase: Number(fase), formato: formatear(Number(decimales)) }
    }),
  }))
  if (quieto) {
    barrido.hidden = true
    return
  }
  const VUELTA = 9000
  let antes = -1
  mientrasSeVe(lienzo, (ahora) => {
    // De un poco antes del borde izquierdo a un poco después del derecho: el
    // salto de vuelta pasa fuera de la vista.
    const x = (ahora % VUELTA) / VUELTA * 1.3 - 0.12
    barrido.style.left = `${(x * 100).toFixed(2)}%`
    for (const { x: donde, nota, lecturas } of sensores) {
      if (!(antes < donde && donde <= x)) continue
      for (const { elemento, base, amplitud, periodo, fase, formato } of lecturas) {
        const onda = Math.sin(2 * Math.PI * (ahora / periodo + fase)) - Math.sin(2 * Math.PI * fase)
        elemento.textContent = formato.format(base + amplitud * onda)
      }
      nota.animate([{ borderColor: '#ff5b1f', color: '#eef0eb' }, {}], { duration: 1400, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' })
    }
    antes = x
  })
}

// ---- El riego ----
const GOTEROS_ESTACA = 40 // del gotero de 350 a la estaca, en unidades del dibujo
const ANCHO = 0.6 // el bulbo es más hondo que ancho
const SUPERFICIE = 96
const POR_CM = 6
const ABRE = 0.08
const CIERRA = 0.78
const HONDO_AL_CERRAR = 293
const HONDO_FINAL = 312
const PROFUNDIDADES = { 20: [21.2, 13.6], 40: [23.1, 8.9], 60: [25.4, 0] } // [antes, cuánto sube]

function hondo(t) {
  if (t <= ABRE) return 0
  if (t <= CIERRA) return HONDO_AL_CERRAR * Math.sqrt((t - ABRE) / (CIERRA - ABRE))
  return HONDO_AL_CERRAR + (HONDO_FINAL - HONDO_AL_CERRAR) * suave((t - CIERRA) / (1 - CIERRA))
}
// El bulbo alcanza la estaca a esa profundidad cuando
// (40 / ancho)² + (fondo / hondo)² ≤ 1, con el ancho a `ANCHO` del hondo.
const alcanza = (cm) => Math.hypot(GOTEROS_ESTACA / ANCHO, cm * POR_CM)
const minutos = (t) => {
  if (t <= ABRE) return 340 + (t / ABRE) * 20
  if (t <= CIERRA) return 360 + ((t - ABRE) / (CIERRA - ABRE)) * 200
  return 560 + ((t - CIERRA) / (1 - CIERRA)) * 40
}
const hora = (total) => `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(Math.floor(total % 60)).padStart(2, '0')}`

function montarRiego() {
  const bloque = document.querySelector('.riego-bloque')
  if (!bloque) return
  const pasos = bloque.querySelector('.riego-pasos')
  const corte = bloque.querySelector('.corte-suelo')
  const bulbos = [...corte.querySelectorAll('[data-gotero]')].map((grupo) => ({ x: Number(grupo.dataset.gotero), formas: grupo.querySelectorAll('path') }))
  const anillos = Object.fromEntries([...corte.querySelectorAll('[data-anillo]')].map((anillo) => [anillo.dataset.anillo, anillo]))
  const lecturas = Object.fromEntries([...bloque.querySelectorAll('[data-prof]')].map((lectura) => [lectura.dataset.prof, lectura]))
  const reloj = bloque.querySelector('[data-reloj]')
  const valvula = bloque.querySelector('[data-valvula]')
  const agua = bloque.querySelector('[data-agua]')
  const decimal = formatear(1)

  const media = (x, ancho, fondo) => `M${(x - ancho).toFixed(1)} ${SUPERFICIE}A${ancho.toFixed(1)} ${fondo.toFixed(1)} 0 0 0 ${(x + ancho).toFixed(1)} ${SUPERFICIE}Z`
  let pintado = -1
  const pintar = (t) => {
    if (t === pintado) return
    pintado = t
    const fondo = hondo(t)
    for (const { x, formas } of bulbos) {
      ;[1, 0.66, 0.36].forEach((parte, i) => formas[i].setAttribute('d', fondo ? media(x, ANCHO * fondo * parte, fondo * parte) : ''))
    }
    for (const [cm, [antes, sube]] of Object.entries(PROFUNDIDADES)) {
      const mojado = suave((fondo - alcanza(Number(cm))) / 70)
      lecturas[cm].textContent = decimal.format(antes + sube * mojado)
      anillos[cm].classList.toggle('mojado', sube > 0 && mojado > 0.5)
    }
    const abierta = t > ABRE && t < CIERRA
    bloque.classList.toggle('abierta', abierta)
    valvula.textContent = abierta ? 'Válvula abierta' : t >= CIERRA ? 'Válvula cerrada sola' : 'Válvula cerrada'
    reloj.textContent = hora(minutos(t))
    agua.textContent = decimal.format(8 * limitar((t - ABRE) / (CIERRA - ABRE)))
  }

  if (quieto) {
    pintar(1)
    return
  }
  const progreso = () => {
    const caja = pasos.getBoundingClientRect()
    return limitar(((innerHeight * 0.6 - caja.top) / caja.height - 0.04) / 0.86)
  }
  let tiempo = progreso()
  let antes = 0
  pintar(tiempo)
  const despertar = mientrasSeVe(bloque, (ahora) => {
    const dt = antes ? Math.min(50, ahora - antes) : 16
    antes = ahora
    const meta = progreso()
    tiempo = Math.abs(meta - tiempo) < 1e-4 ? meta : tiempo + (meta - tiempo) * (1 - Math.exp(-dt / 160))
    pintar(tiempo)
    if (tiempo === meta) antes = 0
    return tiempo !== meta
  })
  addEventListener('scroll', despertar, { passive: true })
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

montarMapa()
montarRiego()
montarGiro()
montarGrafica()
montarCalculadora()
