// El mapa de un artículo (components/Mapa.jsx).
//
// Marca el apartado que se está leyendo: el último cuyo subtítulo ya subió de
// la raya, que va un poco más abajo de donde queda un subtítulo al saltar a él
// (`scroll-padding-top`, bajo la barra y, en S y M, bajo el mapa): así, al
// tocar un punto se marca ese y no el que sigue, aunque su apartado sea corto.
// Los anteriores quedan leídos. En S y M, el título del actual sube a la barra.
//
// La línea avanza al ritmo del scroll, sin saltos: el tramo del apartado
// actual se llena en la proporción que va leída de él (`--avance`), del
// momento en que su subtítulo cruza la raya hasta que la cruza el siguiente,
// cuando la línea llega justo a su punto (Mapa.css).
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
  let linea
  let tope
  let marcado
  let pendiente = false

  const marcar = (i) => {
    marcado = i
    puntos.forEach((punto, n) => {
      punto.classList.toggle('mapa-leido', n < i)
      punto.style.setProperty('--avance', n < i ? 1 : 0)
    })
    enlaces.forEach((enlace, n) => {
      if (n === i) enlace.setAttribute('aria-current', 'location')
      else enlace.removeAttribute('aria-current')
    })
    actual.textContent = i < 0 ? rotulo : subtitulos[i].textContent
  }

  // Primero se mide todo y después se escribe, para no forzar al navegador a
  // recalcular la página a mitad del fotograma.
  const actualizar = () => {
    pendiente = false
    const alturas = subtitulos.map((subtitulo) => subtitulo.getBoundingClientRect().top)
    const i = alturas.findLastIndex((altura) => altura < linea)
    const siguiente = alturas[i + 1]
    const avance = i < 0 || siguiente === undefined ? 0 : Math.min((linea - alturas[i]) / (siguiente - alturas[i]), 1)
    const pegada = mapa.getBoundingClientRect().top < tope + 1

    if (i !== marcado) marcar(i)
    if (i >= 0) puntos[i].style.setProperty('--avance', avance)
    mapa.classList.toggle('mapa-pegada', pegada)
  }

  // La raya y el `top` del mapa cambian con el alto de la barra, en M, y
  // con el mapa, que en L deja de estar arriba.
  const medir = () => {
    linea = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + HOLGURA
    tope = parseFloat(getComputedStyle(mapa).top)
    actualizar()
  }

  medir()
  for (const ancho of ['(min-width: 768px)', '(min-width: 1024px)']) {
    matchMedia(ancho).addEventListener('change', medir)
  }
  addEventListener(
    'scroll',
    () => {
      if (pendiente) return
      pendiente = true
      requestAnimationFrame(actualizar)
    },
    { passive: true }
  )
}
