import Articulo from '../../components/Articulo.jsx'

export default function LoQueLaIaCambia({ ruta }) {
  return (
    <Articulo ruta={ruta}>
      <p>
        Hasta hace poco, escribir un programa pequeño tomaba una tarde. Hoy un modelo de lenguaje lo escribe en lo que
        tardo en describirlo. No lo digo con nostalgia: es de lo mejor que le ha pasado a mi oficio. Pero cada vez que
        algo se vuelve fácil, conviene preguntarse qué se volvió difícil en su lugar.
      </p>

      <h2>Lo que ya cambió</h2>
      <p>
        La inteligencia artificial dejó de ser una promesa de laboratorio y se volvió una herramienta de todos los días.
        Redacta correos, resume documentos, contesta preguntas de clientes y escribe buena parte del código que antes
        escribíamos a mano. Para un negocio pequeño, eso significa que tareas que antes exigían contratar a alguien hoy
        se pueden resolver con un sistema bien armado.
      </p>
      <p>
        También cambió lo que la gente espera. Quien le escribe a una tienda a las once de la noche ya no se conforma
        con un formulario y una respuesta al día siguiente. Espera que alguien, o algo, le conteste ahora y con
        información correcta.
      </p>

      <h2>Lo que se vuelve barato y lo que se vuelve escaso</h2>
      <p>
        Cuando producir algo cuesta casi nada, lo valioso pasa a ser otra cosa. Hoy cualquiera genera una página web, un
        logo o un texto en minutos, y por eso abundan las páginas que se parecen todas entre sí. Lo que escasea es el
        criterio: saber qué construir, para quién y por qué.
      </p>
      <p>
        Creo que en los próximos años la diferencia entre un buen software y uno mediocre no va a estar en cuánto código
        tiene, sino en cuánto entendió quien lo hizo el problema que resolvía. La IA acelera la respuesta, pero no elige
        la pregunta.
      </p>

      <h2>Entender antes de automatizar</h2>
      <p>
        Me interesa entender las cosas, no solo usarlas, y esa costumbre se vuelve más importante con la IA, no menos.
        Un agente que atiende clientes con datos equivocados no ahorra trabajo: lo multiplica. Una automatización encima
        de un proceso que nadie revisó solo hace más rápido el error.
      </p>
      <p>
        Por eso, antes de proponer un agente o un flujo automático, prefiero ver cómo se trabaja hoy: quién hace qué,
        dónde se pierde el tiempo y qué decisiones no deberían salir nunca de las manos de una persona. Casi siempre lo
        que más ayuda es más simple de lo que se esperaba.
      </p>

      <h2>Hacia dónde quiero que vayamos</h2>
      <p>
        Imagino un futuro cercano en que cada negocio pequeño tenga lo que hasta hace poco solo tenían las empresas
        grandes: alguien que conteste a cualquier hora, sistemas que se hablan entre sí y los números al día sin pasar
        una tarde frente a una planilla. No me parece ciencia ficción, porque buena parte ya se puede construir hoy.
      </p>
      <p>
        Lo que no quiero es que ese futuro se llene de herramientas que nadie entiende y que nadie sabe arreglar. En
        Volutus queremos hacer software que se pueda explicar en una conversación, que quede documentado y que siga
        siendo de quien lo usa. La IA es la mejor herramienta que hemos tenido, y sigue siendo una herramienta.
      </p>

      <p className="destacado">
        La inteligencia artificial hace más fácil construir. Lo que no hace es decidir qué vale la pena construir, y ahí
        todavía hacemos falta.
      </p>
    </Articulo>
  )
}
