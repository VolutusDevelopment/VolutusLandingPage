// Remache (remache.html): la calculadora de detención y el panel de planta.
// Va como módulo para no chocar con las constantes de barra.js.
//
// La calculadora multiplica fallas al año, días de espera, horas detenidas por
// día y el costo de una hora, hoy y con la pieza en tres días, y escribe el
// resultado en sus `<output>`. Se recalcula al escribir y también justo antes
// de enviarse (en captura), para que barra.js le responda al agente con los
// números al día.
//
// En «La planta», el dibujo del panel negro sigue al paso que se está leyendo:
// el paso que cruza la mitad de la pantalla le pone su número al panel.

const pesos = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 })
const millones = (valor) => `$ ${pesos.format(Math.round(valor / 1e6))} millones`
const DIAS_REMACHE = 3

function montarCalculadora() {
  const form = document.querySelector('.calculadora')
  if (!form) return
  const leer = (nombre) => Math.max(0, Number(form.elements[nombre].value) || 0)
  const escribir = (nombre, texto) => {
    const salida = form.querySelector(`[data-sale="${nombre}"]`)
    if (salida) salida.value = texto
  }
  const calcular = () => {
    const porDia = leer('fallas') * leer('horas') * leer('costo')
    const hoy = porDia * leer('dias')
    const conRemache = porDia * Math.min(leer('dias'), DIAS_REMACHE)
    escribir('ahorro', millones(hoy - conRemache))
    escribir('hoy', millones(hoy))
    escribir('con', millones(conRemache))
    escribir('horas', `${pesos.format(leer('fallas') * leer('horas') * Math.max(0, leer('dias') - DIAS_REMACHE))} h`)
    form.querySelector('[data-sale="dias"]').value = `${leer('dias')} días`
  }
  form.addEventListener('input', calcular)
  document.addEventListener('submit', (evento) => evento.target === form && calcular(), true)
  calcular()
}

function montarPlanta() {
  const panel = document.querySelector('.planta-panel')
  const pasos = document.querySelectorAll('.planta-paso')
  if (!panel || !pasos.length || !('IntersectionObserver' in window)) return
  const vigia = new IntersectionObserver(
    (entradas) => {
      for (const { isIntersecting, target } of entradas) if (isIntersecting) panel.dataset.paso = target.dataset.paso
    },
    { rootMargin: '-48% 0px -48% 0px' }
  )
  pasos.forEach((paso) => vigia.observe(paso))
}

montarCalculadora()
montarPlanta()
