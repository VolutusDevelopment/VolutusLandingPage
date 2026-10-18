// Las fases de una compra en /servicios/tiendas-online (Tienda.jsx), en S y M:
// una por pantalla. La que cruza el centro de la pantalla es la actual; su
// punto en el índice crece, los anteriores quedan llenos y la vía se llena
// hasta ella. La clase `tienda-guiada` enciende el resto (Tienda.css): sin
// JavaScript, todas las fases se ven enteras.

export default function initTienda() {
  const recorrido = document.querySelector('.tienda-recorrido')
  if (!recorrido || !matchMedia('(max-width: 1023px)').matches) return

  const fases = [...recorrido.querySelectorAll('.tienda-fase')]
  const pasos = [...recorrido.querySelectorAll('.tienda-indice li')]
  const via = recorrido.querySelector('.tienda-indice ol')
  recorrido.classList.add('tienda-guiada')

  const observador = new IntersectionObserver(
    (entradas) => {
      const fase = entradas.findLast(({ isIntersecting }) => isIntersecting)?.target
      if (!fase) return
      const actual = fases.indexOf(fase)
      fases.forEach((otra, i) => otra.classList.toggle('tienda-actual', i === actual))
      pasos.forEach((paso, i) => {
        paso.classList.toggle('tienda-paso-actual', i === actual)
        paso.classList.toggle('tienda-paso-hecho', i < actual)
      })
      via.style.setProperty('--avance', actual / (fases.length - 1))
    },
    { rootMargin: '-50% 0px -50% 0px' }
  )
  fases.forEach((fase) => observador.observe(fase))
}
