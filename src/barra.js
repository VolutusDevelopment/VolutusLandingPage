/**
 * La barra toma la zona de lo que tiene debajo.
 *
 * El vidrio es translúcido, pero no basta: sobre la zona de plano un vidrio
 * claro se lee como una mancha blanca. Aquí solo se decide QUÉ zona hay bajo
 * la barra; el color lo resuelven los tokens de `.zona-cielo` y `.zona-plano`,
 * así que la barra no conoce ningún color.
 *
 * Se vigila una franja fina a la altura de la cápsula y no la sección entera:
 * lo que importa es qué hay detrás del vidrio, no qué ocupa la pantalla.
 */
export default function initBarra() {
  const barra = document.querySelector('.barra')
  const zonas = document.querySelectorAll('main > .seccion, .pie')
  if (!barra || !zonas.length) return

  const observador = new IntersectionObserver(
    (entradas) => {
      const debajo = entradas.find((e) => e.isIntersecting)?.target
      if (!debajo) return
      const plano = debajo.classList.contains('zona-plano')
      barra.classList.toggle('zona-plano', plano)
      barra.classList.toggle('zona-cielo', !plano)
    },
    { rootMargin: '-4% 0px -95% 0px' }
  )

  zonas.forEach((zona) => observador.observe(zona))
}
