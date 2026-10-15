import Articulo from '../../components/Articulo.jsx'
import { PROYECTOS } from '../../data/proyectos.js'

const HACKATHON = PROYECTOS.find(({ id }) => id === 'hackathon')

export default function QueEsUnAgenteDeIa({ ruta }) {
  return (
    <Articulo ruta={ruta}>
      <p>
        Un chatbot conversa. Un agente de IA, además, hace cosas: consulta tu agenda, revisa un pedido, completa un
        registro o le avisa a alguien de tu equipo. Para un negocio, esa es la diferencia que importa.
      </p>

      <h2>Qué es, en simple</h2>
      <p>
        Un agente de IA es un programa que usa un modelo de lenguaje —la misma tecnología de ChatGPT, Gemini o Claude—
        para entender lo que se le pide y decidir qué hacer. A diferencia de un chat común, tiene herramientas: puede
        consultar tus sistemas y actuar sobre ellos, siempre dentro de lo que le permitas.
      </p>
      <p>
        Un ejemplo: alguien escribe a las once de la noche preguntando si hay hora para el viernes. Un chat genérico
        contestaría algo amable y vago. Un agente revisa tu agenda, ve que queda una hora a las 10:30, la ofrece y, si
        la persona acepta, la reserva y te deja el registro.
      </p>

      <h2>Chatbot, automatización y agente</h2>
      <ul>
        <li>
          <strong>Un chatbot de reglas</strong> sigue un árbol de opciones fijo. Sirve para preguntas muy acotadas,
          pero se pierde en cuanto alguien escribe algo que no estaba previsto.
        </li>
        <li>
          <strong>Una automatización</strong> ejecuta siempre los mismos pasos cuando pasa algo: llega un formulario,
          se guarda en la planilla y se avisa por correo. No interpreta nada.
        </li>
        <li>
          <strong>Un agente de IA</strong> entiende lenguaje natural, elige el siguiente paso y usa herramientas.
          Puede leer un correo desordenado, entender qué se pide y derivarlo a quien corresponde.
        </li>
      </ul>
      <p>
        No compiten entre sí. Muchas veces lo mejor es combinar dos: una{' '}
        <a href="/automatizacion-procesos">automatización</a> que mueve los datos y un agente que se encarga de la
        parte que hay que entender.
      </p>

      <h2>Qué puede hacer por un negocio</h2>
      <ul>
        <li>Responder preguntas frecuentes con tu información: horarios, precios, stock o políticas.</li>
        <li>Agendar horas, tomar pedidos o preparar cotizaciones.</li>
        <li>Clasificar correos y solicitudes, y mandarlos a la persona correcta.</li>
        <li>Buscar en tus documentos y sistemas lo que tu equipo necesita.</li>
        <li>Resumir conversaciones, reclamos o reuniones.</li>
      </ul>
      <p>
        También sirve puertas adentro. El agente con que obtuvimos el {HACKATHON.credencial.titulo.toLowerCase()} en
        el {HACKATHON.credencial.evento} atiende alertas de infraestructura: junta el contexto de varios sistemas y
        propone un diagnóstico con su evidencia. Su{' '}
        <a href={HACKATHON.repositorio} rel="noopener">
          código es público
        </a>
        .
      </p>

      <h2>Cuándo no conviene</h2>
      <ul>
        <li>
          <strong>Cuando la tarea sigue siempre los mismos pasos.</strong> Una automatización es más simple, más
          barata y más predecible.
        </li>
        <li>
          <strong>Cuando un error es grave y nadie lo revisa.</strong> Decisiones de dinero, de salud o legales
          necesitan una persona que apruebe.
        </li>
        <li>
          <strong>Cuando no hay de dónde sacar las respuestas.</strong> Un agente responde con lo que le das; si esa
          información no existe, primero hay que ordenarla.
        </li>
      </ul>

      <h2>Los riesgos, dichos de frente</h2>
      <p>
        Los modelos de lenguaje pueden equivocarse con total seguridad: es lo que se llama una alucinación. Se
        reduce, pero no desaparece, y por eso un agente serio se construye con tres cuidados:
      </p>
      <ol>
        <li>Responde con tu información, no con lo que el modelo cree saber.</li>
        <li>Tiene límites claros: qué resuelve solo y qué tiene que pasar por una persona.</li>
        <li>Se prueba con preguntas reales antes de publicarlo, y cada respuesta queda registrada.</li>
      </ol>
      <p>
        Están también los datos: si el agente atiende a tus clientes, trata datos personales, y desde el 1 de
        diciembre de 2026 eso se rige por la <a href="/ley21719">Ley 21.719</a>.
      </p>

      <h2>Cómo empezar</h2>
      <p className="destacado">
        Elige una sola tarea que hoy te quite tiempo y cuyas respuestas estén escritas en alguna parte.
      </p>
      <p>
        Mide cuánto tarda y cuántas veces se repite. Con eso se puede diseñar un primer agente acotado, probarlo con
        casos reales y crecer desde ahí. En <a href="/agentes-ia">Agentes de IA</a> contamos cómo lo hacemos y qué te
        vamos a pedir.
      </p>
    </Articulo>
  )
}
