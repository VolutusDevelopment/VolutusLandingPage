/**
 * Las fichas de los proyectos: un `<dialog>` por proyecto, ya en el HTML.
 *
 * El navegador hace casi todo. `showModal()` deja inerte el resto de la página,
 * lleva el foco adentro y lo devuelve a la tesela al cerrar, y Escape cierra.
 * El botón de cerrar es un `<form method="dialog">`, que no necesita script.
 * Aquí queda lo que el navegador no hace solo: abrir, cerrar al tocar el velo
 * y abrir la ficha que pida la dirección (/#ponlenota).
 */
export default function initFichas() {
  for (const boton of document.querySelectorAll('[data-ficha]')) {
    const ficha = document.getElementById(boton.dataset.ficha)

    boton.addEventListener('click', () => {
      // Cada vez se abre por arriba, no donde se dejó la vez anterior.
      ficha.scrollTop = 0
      ficha.showModal()
    })

    // El panel ocupa todo el `<dialog>`: un toque que llega al propio
    // `<dialog>` cayó fuera del panel, en el velo.
    ficha.addEventListener('click', (evento) => {
      if (evento.target === ficha) ficha.close()
    })
  }

  if (location.hash) {
    document.querySelector(`[data-ficha="ficha-${CSS.escape(location.hash.slice(1))}"]`)?.click()
  }
}
