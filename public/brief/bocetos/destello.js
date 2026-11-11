/**
 * El disparador de la cámara de Destello (destello.html). Sin JavaScript, el
 * botón no aparece y la pantallita muestra su primera foto. Con él, cada
 * toque pasa a la foto siguiente: la que entra se revela de negra a nítida
 * (CSS, al tomar `actual`) y el flash crece y se apaga (`dispara`). Con el
 * movimiento reducido cambia la foto sin flash ni revelado.
 *
 * Las fotos que esperan su turno están fuera de la vista (`display: none`)
 * para no competir con la portada al cargar; se piden cuando la página
 * terminó de cargar, y así ya están al disparar.
 */

const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches

function montarDisparador() {
  const camara = document.querySelector('.camara')
  const boton = camara?.querySelector('.disparador')
  if (!boton) return
  const tomas = [...camara.querySelectorAll('.toma')]
  const contador = camara.querySelector('.contador')
  let actual = 0
  const pedirLasDemas = () => tomas.forEach((toma) => (toma.querySelector('img').loading = 'eager'))
  if (document.readyState === 'complete') pedirLasDemas()
  else addEventListener('load', pedirLasDemas, { once: true })

  boton.addEventListener('click', () => {
    tomas[actual].classList.remove('actual')
    actual = (actual + 1) % tomas.length
    tomas[actual].classList.add('actual')
    contador.textContent = `${actual + 1}/${tomas.length}`
    if (quieto) return
    camara.classList.remove('dispara')
    void camara.offsetWidth
    camara.classList.add('dispara')
  })
  camara.addEventListener('animationend', (evento) => {
    if (evento.animationName === 'destello-flash') camara.classList.remove('dispara')
  })
}

montarDisparador()
