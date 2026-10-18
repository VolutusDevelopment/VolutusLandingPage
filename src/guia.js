// La guía de las páginas de servicio (components/Guia.jsx), en S y M.
//
// Aparece cuando la cabecera ya no llega a la raya de un tercio de pantalla, y
// se va cuando vuelve. La parte actual es la que cruza esa misma raya, como en
// la barra (barra.js); entre una parte y otra —«Te sirve si…», el estimado— la
// marca se queda en la última que pasó. La pastilla va hasta el enlace marcado.

export default function initGuia() {
  const guia = document.querySelector('.guia')
  const cabecera = document.querySelector('.servicio-cabecera')
  if (!guia || !cabecera || !matchMedia('(max-width: 1023px)').matches) return

  // La pantalla, sin su tercio de arriba: la cabecera deja de cruzarla cuando
  // su borde de abajo sube de la raya.
  new IntersectionObserver(
    ([{ isIntersecting, boundingClientRect }]) => {
      guia.classList.toggle('guia-visible', !isIntersecting && boundingClientRect.top < 0)
    },
    { rootMargin: '-33% 0px 0px 0px' }
  ).observe(cabecera)

  const pastilla = guia.querySelector('.guia-pastilla')
  const partes = new Map(
    [...guia.querySelectorAll('a')].map((enlace) => [document.getElementById(enlace.hash.slice(1))?.closest('section'), enlace])
  )
  partes.delete(undefined)
  let actual

  const llevar = () => {
    if (!actual) return
    pastilla.style.width = `${actual.offsetWidth}px`
    pastilla.style.transform = `translateX(${actual.offsetLeft}px)`
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      const parte = entradas.findLast(({ isIntersecting }) => isIntersecting)?.target
      const enlace = parte && partes.get(parte)
      if (!enlace || enlace === actual) return
      actual?.removeAttribute('aria-current')
      enlace.setAttribute('aria-current', 'location')
      actual = enlace
      guia.classList.add('guia-marcada')
      llevar()
    },
    { rootMargin: '-33% 0px -66% 0px' }
  )
  partes.forEach((_, parte) => observador.observe(parte))
  addEventListener('resize', llevar)
}
