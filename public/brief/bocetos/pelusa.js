/**
 * Pelusa (pelusa.html): el día de tu perro, contado con el scroll.
 *
 * - El momento que cruza la mitad de la pantalla se vuelve el actual: el día
 *   toma su hora (`data-hora`), con lo que el cielo, el sol y la casa pasan a
 *   sus colores (en el CSS); su tarjeta entra (`actual`) y el reloj de abajo
 *   lo marca.
 * - El encaje: mientras dura el día, cada scroll cae en un momento. Pasado un
 *   cuarto de pantalla dentro de la sección que sigue, la página se lee libre
 *   (`libre` en <html>), como en /nosotros (src/encaje.js): si no, la rueda
 *   del mouse la devolvería al último momento.
 *
 * Sin JavaScript, todo se ve: el cielo queda en la mañana y las tarjetas,
 * quietas y a la vista.
 */

const raiz = document.documentElement
const dia = document.querySelector('.dia')
const momentos = [...dia.querySelectorAll('[data-momento]')]
const enlaces = new Map([...dia.querySelectorAll('.reloj a')].map((enlace) => [enlace.hash.slice(1), enlace]))

function marcar(momento) {
  dia.dataset.hora = momento.dataset.momento
  for (const otro of momentos) otro.classList.toggle('actual', otro === momento)
  for (const [id, enlace] of enlaces) {
    if (id === momento.id) enlace.setAttribute('aria-current', 'step')
    else enlace.removeAttribute('aria-current')
  }
}

// Una línea a media pantalla: el momento que la cruza es el actual.
const centro = new IntersectionObserver(
  (entradas) => {
    for (const { isIntersecting, target } of entradas) if (isIntersecting) marcar(target)
  },
  { rootMargin: '-50% 0px -50% 0px' }
)
momentos.forEach((momento) => centro.observe(momento))

// Lo que sigue al día es un solo punto de encaje, más alto que la pantalla:
// adentro se puede bajar libre. Pero con la rueda del mouse Chrome encaja
// cada tick dentro de él, así que, pasado un cuarto de pantalla adentro, el
// encaje se apaga hasta el final (`libre`).
const despues = document.querySelector('.despues')
if (despues) {
  new IntersectionObserver(([{ intersectionRatio }]) => raiz.classList.toggle('libre', intersectionRatio < 1), {
    rootMargin: '25% 0px 100000px 0px',
    threshold: 1,
  }).observe(despues)
}
