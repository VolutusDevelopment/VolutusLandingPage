// El índice de los servicios de la portada (Servicios.jsx) marca el que cruza
// el centro de la pantalla, que es donde cae cada scroll (Servicios.css). Sin
// JavaScript queda marcado el primero.

export default function initServicios() {
  const marcas = [...document.querySelectorAll('.servicios-indice a')]
  if (!marcas.length) return

  const servicios = [...document.querySelectorAll('.servicios-lista > .servicio')]
  const vigia = new IntersectionObserver(
    (entradas) => {
      for (const { target, isIntersecting } of entradas) {
        if (!isIntersecting) continue
        const actual = servicios.indexOf(target)
        marcas.forEach((marca, i) => marca.classList.toggle('actual', i === actual))
      }
    },
    // Una línea al medio de la pantalla.
    { rootMargin: '-50% 0px -50% 0px' },
  )
  for (const servicio of servicios) vigia.observe(servicio)
}
