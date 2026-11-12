// Rumbo: el letrero que sigue (rumbo.html). Va como módulo para no chocar
// con las constantes de barra.js.
//
// Al dejar la portada aparece, colgado en una esquina, un letrero con las
// secciones de la página. Cada fila apunta hacia donde queda su sección:
// abajo si falta llegar, arriba si ya se pasó; la sección que se está
// leyendo se marca «Estás aquí». Se guarda en la portada, que ya tiene su
// propio letrero, y al llegar al pie, que es la salida.

const letrero = document.querySelector('.sigue')
const filas = letrero ? [...letrero.querySelectorAll('a[href^="#"]')] : []
const secciones = filas.map((fila) => document.querySelector(fila.getAttribute('href')))
const portada = document.querySelector('#inicio')
const pie = document.querySelector('.pie')
let pedido = 0

function orientar() {
  pedido = 0
  // Se está en la última sección cuyo borde de arriba ya pasó el 40 % de
  // la pantalla.
  const linea = innerHeight * 0.4
  let aqui = -1
  secciones.forEach((seccion, i) => {
    if (seccion && seccion.getBoundingClientRect().top <= linea) aqui = i
  })
  filas.forEach((fila, i) => {
    const hacia = i < aqui ? 'arriba' : i === aqui ? 'aqui' : 'abajo'
    if (fila.dataset.hacia !== hacia) fila.dataset.hacia = hacia
    if (i === aqui) fila.setAttribute('aria-current', 'location')
    else fila.removeAttribute('aria-current')
  })
  const enPortada = portada && portada.getBoundingClientRect().bottom > innerHeight * 0.5
  const enSalida = pie && pie.getBoundingClientRect().top < innerHeight * 0.85
  letrero.classList.toggle('a-la-vista', !enPortada && !enSalida)
}

if (letrero) {
  const pedir = () => {
    if (!pedido) pedido = requestAnimationFrame(orientar)
  }
  addEventListener('scroll', pedir, { passive: true })
  addEventListener('resize', pedir)
  orientar()
}
