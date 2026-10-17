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
      <ul>
        <li>
          <strong>Consultas repetidas con respuesta fija.</strong> Horarios, precios vigentes, qué llevar a una cita o
          cómo llegar.
        </li>
        <li>
          <strong>Agendar en una agenda que se puede consultar.</strong> Ofrecer un horario libre y reservarlo sin que
          alguien lo tenga que hacer a mano.
        </li>
        <li>
          <strong>Registrar solicitudes.</strong> Un pedido, una reserva o un reclamo que queda con datos completos y
          con la fecha.
        </li>
        <li>
          <strong>Responder fuera de horario.</strong> Atender a las once de la noche y dejar un registro para la mañana.
        </li>
      </ul>

      <h2>Donde conviene una persona</h2>
      <ul>
        <li>Reclamos, devoluciones y cualquier caso en que el cliente esté molesto.</li>
        <li>Decisiones de precio, descuentos o excepciones.</li>
        <li>Temas de salud, legales o tributarios, donde una respuesta equivocada tiene consecuencias.</li>
        <li>Casos nuevos que no están en lo que el agente conoce.</li>
      </ul>

      <h2>Una pregunta para decidir</h2>
      <p>
        ¿La respuesta está escrita en algún lugar que el agente pueda leer? Si sí, probablemente sirve. Si la respuesta
        depende de un criterio que cambia cada vez, déjala para una persona, o define primero la regla.
      </p>

      <h2>Patrones por tipo de negocio</h2>
      <ul>
        <li>
          Una clínica con la recepción saturada: el agente confirma y reagenda horas, y deriva a recepción las dudas
          clínicas.
        </li>
        <li>
          Una academia que recibe consultas de noche: el agente responde horarios y valores vigentes, y registra a
          quienes quieren inscribirse.
        </li>
        <li>
          Un hotel con reservas por varios canales: el agente responde disponibilidad y deja el registro, y una persona
          confirma los casos especiales.
        </li>
        <li>
          Un taller con clientes que preguntan por su auto: el agente informa el estado que ya está registrado, y el
          mecánico decide lo que sigue.
        </li>
      </ul>

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
