import Articulo from '../../components/Articulo.jsx'

export default function CasosParaUnAgenteDeIa({ ruta }) {
  return (
    <Articulo ruta={ruta}>
      <p>
        Un agente de IA sirve donde hay preguntas que se repiten y respuestas que ya están escritas en algún lugar. No
        sirve igual donde cada caso es distinto o donde equivocarse cuesta caro. Estos son patrones típicos, no clientes
        ni resultados: sirven para pensar tu propio negocio.
      </p>

      <h2>Donde suele servir</h2>
      <p>
        En las consultas que se repiten y tienen una respuesta fija: horarios, precios vigentes, qué llevar a una cita
        o cómo llegar. También para agendar, si la agenda se puede consultar: el agente ofrece un horario libre y lo
        reserva sin que alguien lo tenga que hacer a mano.
      </p>
      <p>
        Sirve para registrar solicitudes, como un pedido, una reserva o un reclamo, que quedan con datos completos y
        con la fecha. Y para responder fuera de horario: atender a las once de la noche y dejar un registro para la
        mañana.
      </p>

      <h2>Donde conviene una persona</h2>
      <p>
        En los reclamos, las devoluciones y cualquier caso en que el cliente esté molesto. También en las decisiones de
        precio, descuentos o excepciones, y en temas de salud, legales o tributarios, donde una respuesta equivocada
        tiene consecuencias. Y en los casos nuevos, que no están en lo que el agente conoce.
      </p>

      <h2>Una pregunta para decidir</h2>
      <p>
        ¿La respuesta está escrita en algún lugar que el agente pueda leer? Si sí, probablemente sirve. Si la respuesta
        depende de un criterio que cambia cada vez, déjala para una persona, o define primero la regla.
      </p>

      <h2>Patrones por tipo de negocio</h2>
      <p>
        En una clínica con la recepción saturada, el agente confirma y reagenda horas, y deriva a recepción las dudas
        clínicas. En una academia que recibe consultas de noche, responde horarios y valores vigentes, y registra a
        quienes quieren inscribirse.
      </p>
      <p>
        En un hotel con reservas por varios canales, responde la disponibilidad y deja el registro, y una persona
        confirma los casos especiales. En un taller donde los clientes preguntan por su auto, informa el estado que ya
        está registrado, y el mecánico decide lo que sigue.
      </p>

      <h2>Lo que un agente no debería hacer</h2>
      <p>
        Inventar respuestas. Un buen diseño le dice qué puede responder, qué debe derivar y cuándo tiene que pasar la
        conversación a una persona. Esa frontera es parte del trabajo, no un detalle.
      </p>

      <p className="destacado">
        Si quieres saber cómo se vería un agente para tu negocio en concreto, cuéntanos qué preguntas te llegan más y
        cuáles te cuestan más tiempo.
      </p>

      <p>
        Lo explicamos en detalle en <a href="/articulos/que-es-un-agente-de-ia">qué es un agente de IA</a>, y lo
        servimos en la página de <a href="/servicios/agentes-ia">agentes de IA</a>.
      </p>
    </Articulo>
  )
}
