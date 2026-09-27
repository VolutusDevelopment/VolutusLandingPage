/**
 * Los medidores se vuelven a llenar al tocarlos.
 *
 * Mismo trato que la construcción de la portada: la primera vez se llenan
 * solos al entrar en pantalla, y a partir de ahí responden. Pasar el puntero
 * por encima —o tocarlos con el dedo— los vacía y los vuelve a llenar.
 *
 * **Por qué en JavaScript y no en CSS.** Reiniciar una animación en `:hover`
 * es de los sitios donde CSS se pelea consigo mismo: hay que quitar la regla,
 * esperar a que el navegador lo note y volver a ponerla. Aquí no hay animación
 * que reiniciar sino una transición que se dispara, y eso son tres líneas:
 * dejar el anillo vacío sin transición, forzar el recálculo y devolverlo a su
 * valor con ella puesta.
 *
 * El primer llenado —el que va con el scroll— vive en `Metricas.css`. Al tocar
 * un medidor se apaga esa animación con `medidor-manual`, porque una animación
 * de CSS gana a un estilo en línea y si no se apagara, lo que escriba este
 * archivo no se vería.
 *
 * Nada de información vive detrás del gesto: los cuatro números son texto y
 * quien no interactúe los lee igual.
 */

const LLENADO = 900

export default function initMedidores() {
  const medidores = [...document.querySelectorAll('.medidor')]
  if (!medidores.length) return

  const quieto = () =>
    document.documentElement.dataset.movimiento === 'reducido' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches

  for (const medidor of medidores) {
    const relleno = medidor.querySelector('.medidor-relleno')
    if (!relleno) continue

    const estilo = getComputedStyle(relleno)
    const vuelta = estilo.getPropertyValue('--vuelta').trim()
    const resto = estilo.getPropertyValue('--resto').trim()
    if (!vuelta) continue

    let llenando = false

    function volverALlenar() {
      if (quieto() || llenando) return
      llenando = true

      // Apaga la animación del scroll: una animación de CSS gana a un estilo
      // en línea, así que sin esto lo de abajo no se vería.
      medidor.classList.add('medidor-manual')

      // Vaciar sin transición, para que el salto a cero no se vea.
      relleno.style.transition = 'none'
      relleno.style.strokeDashoffset = vuelta

      // Leer una medida obliga al navegador a aplicar lo anterior ahora. Sin
      // esta línea agrupa los dos cambios y el anillo nunca llega a vaciarse.
      void relleno.getBoundingClientRect()

      relleno.style.transition = ''
      relleno.style.strokeDashoffset = resto

      setTimeout(() => {
        llenando = false
      }, LLENADO)
    }

    // Con ratón o lápiz basta entrar en el medidor. Con el dedo no hay
    // «encima», así que ahí lo dispara el toque.
    medidor.addEventListener('pointerenter', (evento) => {
      if (evento.pointerType !== 'touch') volverALlenar()
    })
    medidor.addEventListener('pointerdown', volverALlenar)
  }
}
