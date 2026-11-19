/**
 * El podio de los logros (Podio.jsx): cada columna es una pestaña y el cartel
 * de abajo cuenta la elegida. La tabla de honor elige lo mismo al tocar una
 * fila. Con el teclado, las flechas recorren el podio de lado a lado, como en
 * el menú de un juego.
 */
export default function initPodio() {
  for (const podio of document.querySelectorAll('[data-podio]')) {
    const pestanas = [...podio.querySelectorAll('[role="tab"]')]
    const filas = [...podio.querySelectorAll('[data-elegir]')]

    const elegir = (elegida, enfocar) => {
      for (const pestana of pestanas) {
        const activa = pestana === elegida
        pestana.setAttribute('aria-selected', activa)
        pestana.tabIndex = activa ? 0 : -1
        document.getElementById(pestana.getAttribute('aria-controls')).hidden = !activa
      }
      for (const fila of filas) fila.classList.toggle('es-elegido', `podio-${fila.dataset.elegir}` === elegida.id)
      if (enfocar) elegida.focus()
    }

    for (const pestana of pestanas) {
      pestana.addEventListener('click', () => elegir(pestana))
      pestana.addEventListener('keydown', (e) => {
        const i = pestanas.indexOf(pestana)
        const destino = {
          ArrowLeft: pestanas[(i - 1 + pestanas.length) % pestanas.length],
          ArrowRight: pestanas[(i + 1) % pestanas.length],
          Home: pestanas[0],
          End: pestanas[pestanas.length - 1],
        }[e.key]
        if (!destino) return
        e.preventDefault()
        elegir(destino, true)
      })
    }

    for (const fila of filas) {
      fila.addEventListener('click', () => elegir(document.getElementById(`podio-${fila.dataset.elegir}`)))
    }
  }
}
