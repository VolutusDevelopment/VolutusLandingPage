// El mapa de un artículo (components/Mapa.jsx).
//
// Marca el apartado que se está leyendo: el último cuyo subtítulo ya subió de
// la raya, que va un poco más abajo de donde queda un subtítulo al saltar a él
// (`scroll-padding-top`, bajo la barra y, en S y M, bajo el mapa): así, al
// tocar un punto se marca ese y no el que sigue, aunque su apartado sea corto.
// Los anteriores quedan leídos y la línea llega hasta él (Mapa.css). En S y M,
// el título del actual sube a la barra.
//
// En S y M avisa además cuándo la barra del mapa queda pegada bajo la del
// sitio, para que su fondo suba detrás de ella.
//
// Sin JavaScript, el mapa se ve entero y cada punto lleva a su apartado; solo
// falta la marca.

const HOLGURA = 24

export default function initMapa() {
  const mapa = document.querySelector('.mapa')
  if (!mapa) return

  const puntos = [...mapa.querySelectorAll('li')]
  const enlaces = puntos.map((punto) => punto.querySelector('a'))
  const subtitulos = enlaces.map((enlace) => document.getElementById(enlace.hash.slice(1)))
  const actual = mapa.querySelector('.mapa-actual')
  const rotulo = actual.textContent
  const pasados = new Set()

  const marcar = () => {
    const i = subtitulos.findLastIndex((subtitulo) => pasados.has(subtitulo))
    puntos.forEach((punto, n) => punto.classList.toggle('mapa-leido', n < i))
    enlaces.forEach((enlace, n) => {
      if (n === i) enlace.setAttribute('aria-current', 'location')
      else enlace.removeAttribute('aria-current')
    })
    actual.textContent = i < 0 ? rotulo : subtitulos[i].textContent
  }

  let raya
  let pegada
  const vigilar = () => {
    raya?.disconnect()
    pegada?.disconnect()
    pasados.clear()

    // La raíz va de la raya hasta mucho más abajo que la página. Un subtítulo
    // pasó cuando su borde de arriba subió de ella: con los dos umbrales, el
    // aviso llega al cruzarla en cualquier sentido, también al saltar con un
    // enlace del mapa sin pasar por la pantalla.
    const linea = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + HOLGURA
    raya = new IntersectionObserver(
      (entradas) => {
        entradas.forEach(({ target, boundingClientRect, rootBounds }) => {
          if (boundingClientRect.top < rootBounds.top) pasados.add(target)
          else pasados.delete(target)
        })
        marcar()
      },
      { rootMargin: `${-linea}px 0px ${document.documentElement.scrollHeight}px 0px`, threshold: [0, 1] }
    )
    subtitulos.forEach((subtitulo) => raya.observe(subtitulo))

    // Pegada, su borde de arriba se queda en `top`: con la raíz recortada un
    // píxel más abajo, ya no entra entera.
    const tope = parseFloat(getComputedStyle(mapa).top)
    pegada = new IntersectionObserver(
      ([{ boundingClientRect }]) => mapa.classList.toggle('mapa-pegada', boundingClientRect.top < tope + 1),
      { rootMargin: `${-tope - 1}px 0px 0px 0px`, threshold: 1 }
    )
    pegada.observe(mapa)
  }

  // La raya y el `top` del mapa cambian con el alto de la barra, en M, y
  // con el mapa, que en L deja de estar arriba.
  vigilar()
  for (const ancho of ['(min-width: 768px)', '(min-width: 1024px)']) {
    matchMedia(ancho).addEventListener('change', vigilar)
  }
}
