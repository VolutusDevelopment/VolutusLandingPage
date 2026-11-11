/**
 * Lo que mueve a Bisagra (bisagra.html). El día y la noche, los colores del
 * configurador y la foto de cada lámpara cambian con CSS (`:has()`): sin
 * JavaScript todo funciona y se ve. Esto suma:
 *
 * - la hora de Santiago en la cabecera y, si allá es de noche, la página
 *   parte con la luz apagada y las lámparas encendidas;
 * - en la portada, de noche, la luz sigue al cursor con un resorte, como si
 *   se moviera el brazo de la lámpara;
 * - en el taller, la foto que se queda cambia con el paso que se lee;
 * - en el configurador, el brazo se dobla en sus tres bisagras.
 *
 * Al agente del configurador le responde barra.js (`data-consulta`), con el
 * texto de la ficha.
 */

const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches

function montarReloj() {
  const relojes = document.querySelectorAll('[data-reloj]')
  const formato = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  const hora = () => Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Santiago', hour: 'numeric', hourCycle: 'h23' }).format(new Date()))
  const poner = () => relojes.forEach((reloj) => (reloj.textContent = formato.format(new Date())))
  poner()
  setInterval(poner, 30000)
  const noche = document.getElementById('noche')
  const esDeNoche = hora() >= 20 || hora() < 7
  if (noche && esDeNoche) noche.checked = true
}

// La luz de la portada va hacia el cursor como un resorte amortiguado: llega
// en unos 150 ms, sin rebote y sin quedarse atrás.
function montarLuzDelCursor() {
  const foto = document.querySelector('[data-luz-cursor]')
  if (!foto || !matchMedia('(hover: hover) and (pointer: fine)').matches) return
  const estilo = getComputedStyle(foto)
  const inicio = [parseFloat(estilo.getPropertyValue('--px')), parseFloat(estilo.getPropertyValue('--py'))]
  const pos = [...inicio]
  const vel = [0, 0]
  let meta = [...inicio]
  let cuadro = 0
  let antes = 0
  const poner = () => {
    foto.style.setProperty('--px', `${pos[0].toFixed(2)}%`)
    foto.style.setProperty('--py', `${pos[1].toFixed(2)}%`)
  }
  const paso = (ahora) => {
    const dt = Math.min(0.032, (ahora - (antes || ahora)) / 1000 || 0.016)
    antes = ahora
    const rigidez = 420
    const freno = 2 * Math.sqrt(rigidez)
    let quieta = true
    for (let i = 0; i < 2; i++) {
      vel[i] += (rigidez * (meta[i] - pos[i]) - freno * vel[i]) * dt
      pos[i] += vel[i] * dt
      if (Math.abs(meta[i] - pos[i]) > 0.05 || Math.abs(vel[i]) > 0.05) quieta = false
    }
    poner()
    cuadro = quieta ? 0 : requestAnimationFrame(paso)
  }
  const mover = (nueva) => {
    meta = nueva
    if (quieto) {
      pos[0] = meta[0]
      pos[1] = meta[1]
      poner()
      return
    }
    if (!cuadro) {
      antes = 0
      cuadro = requestAnimationFrame(paso)
    }
  }
  foto.addEventListener('pointermove', (evento) => {
    const caja = foto.getBoundingClientRect()
    mover([((evento.clientX - caja.left) / caja.width) * 100, ((evento.clientY - caja.top) / caja.height) * 100])
  })
  foto.addEventListener('pointerleave', () => mover([...inicio]))
}

// El taller: el paso que cruza el centro de la pantalla es el activo, y su
// foto es la que se ve en la columna que se queda.
function montarPasos() {
  const taller = document.querySelector('[data-pasos]')
  if (!taller || !('IntersectionObserver' in window)) return
  const pasos = taller.querySelectorAll('[data-paso]')
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const { isIntersecting, target } of entradas) {
        if (!isIntersecting) continue
        taller.dataset.paso = target.dataset.paso
        pasos.forEach((paso) => paso.classList.toggle('activo', paso === target))
      }
    },
    { rootMargin: '-45% 0px -45% 0px' }
  )
  pasos.forEach((paso) => observador.observe(paso))
}

// El brazo de la Codo: el ángulo pedido se reparte entre sus tres bisagras,
// y la cabeza se corrige para que la pantalla siga mirando a la mesa.
function montarBrazo() {
  const medida = document.querySelector('.medida')
  const control = medida?.querySelector('[name="angulo"]')
  if (!control) return
  const textos = medida.querySelectorAll('[data-angulo-texto]')
  const radianes = (grados) => (grados * Math.PI) / 180
  const doblar = () => {
    const angulo = Math.min(70, Math.max(20, Number(control.value) || 40))
    const a1 = 4 + (angulo - 20) * 0.4
    const a2 = 40 + (angulo - 20) * 0.9
    const a3 = 15 - (a1 + a2)
    const codo = 140 + 140 * Math.sin(radianes(a1))
    const cabeza = codo + 140 * Math.sin(radianes(a1 + a2))
    medida.style.setProperty('--a1', `${a1}deg`)
    medida.style.setProperty('--a2', `${a2}deg`)
    medida.style.setProperty('--a3', `${a3}deg`)
    medida.style.setProperty('--charco', `${(cabeza - 250).toFixed(1)}px`)
    textos.forEach((texto) => (texto.textContent = String(angulo)))
  }
  control.addEventListener('input', doblar)
  doblar()
}

montarReloj()
montarLuzDelCursor()
montarPasos()
montarBrazo()
