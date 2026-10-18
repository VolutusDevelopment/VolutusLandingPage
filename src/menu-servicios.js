// La lista de servicios de la barra (Barra.jsx), en S y M: «Servicios» la abre
// y la cierra en vez de ir a /servicios. Se cierra también al tocar fuera o con
// Escape, que devuelve el foco al enlace. Desde L el enlace vuelve a ser un
// enlace, y sin JavaScript siempre lo es.

export default function initMenuServicios() {
  const enlace = document.querySelector('.barra-enlaces a[href="/servicios"]')
  const lista = document.getElementById('menu-servicios')
  if (!enlace || !lista) return

  const movil = matchMedia('(max-width: 1023px)')
  const abrir = (si) => {
    lista.hidden = !si
    if (movil.matches) enlace.setAttribute('aria-expanded', String(si))
  }
  const ajustar = () => {
    abrir(false)
    if (movil.matches) enlace.setAttribute('aria-controls', lista.id)
    else ['aria-controls', 'aria-expanded'].forEach((atributo) => enlace.removeAttribute(atributo))
  }
  ajustar()
  movil.addEventListener('change', ajustar)

  enlace.addEventListener('click', (evento) => {
    if (!movil.matches) return
    evento.preventDefault()
    abrir(lista.hidden)
  })
  document.addEventListener('click', ({ target }) => {
    if (!lista.hidden && !lista.contains(target) && !enlace.contains(target)) abrir(false)
  })
  addEventListener('keydown', ({ key }) => {
    if (key !== 'Escape' || lista.hidden) return
    abrir(false)
    enlace.focus()
  })
}
