// La banda de las IA del cierre de /privacidad (Privacidad.jsx) gira con una
// animación CSS (Privacidad.css). Bajo el mouse se frena en una curva hasta
// quedar quieta, para que el enlace no se escape, y al salir acelera por la
// misma curva. Se cambia la velocidad de la animación y no su posición, así
// que nunca salta; si el mouse sale a medio frenar, sigue desde donde iba.
//
// Con el dedo no hace falta: el toque ya cae donde se ve. Con movimiento
// reducido, o con el foco del teclado adentro, la banda no gira y no hay
// animación que frenar.

// Lo que tarda en frenar del todo, y en volver a su velocidad.
const DURACION = 550

// Parte y termina sin quiebre: la velocidad cambia de a poco en los dos
// extremos.
const curva = (t) => t * t * (3 - 2 * t)

export default function initBandaDeIas() {
  const banda = document.querySelector('.privacidad-ias')
  const pista = banda?.querySelector('.privacidad-ias-pista')
  if (!pista) return

  // 1 es a toda velocidad y 0, quieta; `curva` lo pasa a velocidad.
  let avance = 1
  let destino = 1
  let anterior = null
  let cuadro = 0

  const avanzar = (ahora) => {
    const paso = anterior === null ? 0 : (ahora - anterior) / DURACION
    anterior = ahora
    avance = destino > avance ? Math.min(destino, avance + paso) : Math.max(destino, avance - paso)
    for (const animacion of pista.getAnimations()) animacion.playbackRate = curva(avance)

    if (avance === destino) {
      cuadro = 0
      anterior = null
    } else {
      cuadro = requestAnimationFrame(avanzar)
    }
  }

  const hacia = (valor) => (evento) => {
    if (evento.pointerType === 'touch') return
    destino = valor
    if (!cuadro) cuadro = requestAnimationFrame(avanzar)
  }

  banda.addEventListener('pointerenter', hacia(0))
  banda.addEventListener('pointerleave', hacia(1))
}
