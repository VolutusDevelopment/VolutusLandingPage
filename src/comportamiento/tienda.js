// Las fases de una compra en /servicios/tiendas-online (Tienda.jsx), en S y M.
// La que cruza el centro de la pantalla es la actual y las demás se apagan. La
// clase `tienda-guiada` enciende el resto (Tienda.css): sin JavaScript, todas
// las fases se ven enteras.

export default function initTienda() {
  const recorrido = document.querySelector('.tienda-recorrido')
  if (!recorrido || !matchMedia('(max-width: 1023px)').matches) return

  const fases = [...recorrido.querySelectorAll('.tienda-fase')]
  recorrido.classList.add('tienda-guiada')

  const observador = new IntersectionObserver(
    (entradas) => {
      const fase = entradas.findLast(({ isIntersecting }) => isIntersecting)?.target
      if (!fase) return
      fases.forEach((otra) => otra.classList.toggle('tienda-actual', otra === fase))
    },
    { rootMargin: '-50% 0px -50% 0px' }
  )
  fases.forEach((fase) => observador.observe(fase))
}
