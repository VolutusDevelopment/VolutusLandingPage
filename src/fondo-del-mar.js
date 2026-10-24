// El fondo del documento al final de la página. `html` lleva el color de
// arriba (index.css), que es lo que se ve al rebotar el scroll; mientras el mar
// del pie está en pantalla toma su agua honda, así que al rebotar abajo sigue
// el mar y no asoma el cielo ni el color del servicio. Sin JavaScript queda el
// de arriba.

export default function initFondoDelMar() {
  const mar = document.querySelector('.pie-mar')
  if (!mar) return

  new IntersectionObserver(([{ isIntersecting }]) => {
    document.documentElement.classList.toggle('en-el-mar', isIntersecting)
  }).observe(mar)
}
