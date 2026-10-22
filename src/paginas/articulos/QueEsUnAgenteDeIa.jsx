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
        Un agente de IA es un programa que usa un modelo de lenguaje para entender lo que se le pide y decidir qué
        hacer. Es la misma tecnología que hay detrás de ChatGPT, Gemini o Claude. A diferencia de un chat común, tiene
        herramientas: puede consultar tus sistemas y actuar sobre ellos, siempre dentro de lo que le permitas.
      </p>
      <p>
        Un ejemplo: alguien escribe a las once de la noche preguntando si hay hora para el viernes. Un chat genérico
        contestaría algo amable y vago. Un agente revisa tu agenda, ve que queda una hora a las 10:30, la ofrece y, si
        la persona acepta, la reserva y te deja el registro.
      </p>

      <h2>Chatbot, automatización y agente</h2>
      <p>
        Un chatbot de reglas sigue un árbol de opciones fijo. Sirve para preguntas muy acotadas, pero se pierde en
        cuanto alguien escribe algo que no estaba previsto. Una automatización ejecuta siempre los mismos pasos cuando
        pasa algo: llega un formulario, se guarda en la planilla y se avisa por correo. No interpreta nada.
      </p>
      <p>
        Un agente de IA, en cambio, entiende lenguaje natural, elige el siguiente paso y usa herramientas. Puede leer
        un correo desordenado, entender qué se pide y derivarlo a quien corresponde.
      </p>
      <p>
        No compiten entre sí. Muchas veces lo mejor es combinar dos: una{' '}
        <a href="/servicios/automatizacion-procesos">automatización</a> que mueve los datos y un agente que se encarga de la
        parte que hay que entender.
      </p>

      <h2>Qué puede hacer por un negocio</h2>
      <p>
        Lo más común es que responda preguntas frecuentes con tu información, como horarios, precios, stock o
        políticas. Puede agendar horas, tomar pedidos o preparar cotizaciones.
      </p>
      <p>
        Además, puede ordenar lo que llega: clasificar correos y solicitudes y mandarlos a la persona correcta, buscar
        en tus documentos y sistemas lo que tu equipo necesita, o resumir conversaciones, reclamos y reuniones.
      </p>
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
      <p>
        Si la tarea sigue siempre los mismos pasos, una automatización es más simple, más barata y más predecible.
        Tampoco conviene cuando un error es grave y nadie lo revisa: las decisiones de dinero, de salud o legales
        necesitan una persona que apruebe.
      </p>
      <p>
        Y no sirve si no hay de dónde sacar las respuestas. Un agente responde con lo que le das; si esa información
        no existe, primero hay que ordenarla.
      </p>

      <h2>Los riesgos, dichos de frente</h2>
      <p>
        Los modelos de lenguaje pueden equivocarse con total seguridad: es lo que se llama una alucinación. Se
        reduce, pero no desaparece.
      </p>
      <p>
        Por eso un agente serio responde con tu información y no con lo que el modelo cree saber. Tiene límites
        claros sobre qué resuelve solo y qué tiene que pasar por una persona. Y antes de publicarlo se prueba con
        preguntas reales, y cada respuesta queda registrada.
      </p>
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
        casos reales y crecer desde ahí. En <a href="/servicios/agentes-ia">Agentes de IA</a> contamos cómo lo hacemos y qué te
        vamos a pedir.
      </p>
    </Articulo>
  )
}
