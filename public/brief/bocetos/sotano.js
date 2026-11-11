// Sótano: en la cartelera, el cursor es el proyector. Cada fila sabe dónde
// está la mano (`--x`) y el CSS pone ahí el haz de luz. Sin JavaScript, la
// fila igual se apaga y el haz queda al centro.
for (const fila of document.querySelectorAll('[data-luz]')) {
  fila.addEventListener('pointermove', (evento) => {
    if (evento.pointerType === 'touch') return
    const caja = fila.getBoundingClientRect()
    fila.style.setProperty('--x', `${Math.round(evento.clientX - caja.left)}px`)
  })
}
