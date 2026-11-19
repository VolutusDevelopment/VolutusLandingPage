// La bienvenida del home (Bienvenida.jsx). El CSS la sostiene y la retira;
// aquí solo se saca del documento cuando termina de irse, y con eso se detiene
// su ola, que repite mientras la bienvenida esté (ola.js). Si el script llegó
// cuando ya se había ido, se saca de una vez: si no, la ola pasaría sin que
// nadie la vea.
export default function initBienvenida() {
  const bienvenida = document.querySelector('.bienvenida')
  if (!bienvenida) return
  if (getComputedStyle(bienvenida).visibility === 'hidden') return bienvenida.remove()
  // Las letras también animan (su espera) y su fin sube hasta aquí.
  bienvenida.addEventListener('animationend', ({ target }) => target === bienvenida && bienvenida.remove())
}
