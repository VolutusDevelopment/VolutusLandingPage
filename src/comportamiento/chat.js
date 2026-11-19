// La hora de los mensajes del chat de preguntas en /servicios/agentes-ia
// (Agente.jsx). Cada burbuja toma la hora del visitante cuando asoma en la
// pantalla y se la queda: volver a pasar por ella no la cambia, y al salir de
// la página se pierde. La pinta el CSS desde `data-hora` (Agente.css), así que
// no entra en el texto de la pregunta ni de la respuesta. Sin JavaScript no
// hay hora.

/** La hora local, como «23:41». */
const horaActual = () => new Date().toTimeString().slice(0, 5)

export default function initChat() {
  const burbujas = document.querySelectorAll('.agente-chat dt, .agente-chat p')
  if (!burbujas.length) return

  const observador = new IntersectionObserver((entradas) => {
    for (const { isIntersecting, target } of entradas) {
      if (!isIntersecting) continue
      target.dataset.hora = horaActual()
      observador.unobserve(target)
    }
  })
  burbujas.forEach((burbuja) => observador.observe(burbuja))
}
