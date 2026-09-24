
/**
 * Portada (DESIGN-BRIEF §4, bloque 1). Tema cielo: aquí la página promete.
 *
 * Lo que tiene que ver quien no baja nada: el titular, una entradilla con la
 * prueba y el plazo, la acción principal con su secundaria, y la pieza
 * atmosférica **contenida**. La regla que manda: si la imagen empuja el titular
 * fuera de la pantalla en un móvil de 360 px, la imagen se reduce. El texto
 * gana siempre, porque es lo único que casi todos van a leer. Por eso en S la
 * foto va DEBAJO del bloque de texto y no detrás.
 *
 * La foto es la nube volutus real —cielo, luz rasante—, no una simulación en
 * CSS: §6 prohíbe el fotorrealismo simulado porque cuesta más pintar que la
 * foto que pretende evitar. Lleva `width` y `height` explícitos, así que el CLS
 * es 0 desde la primera pintura, y va sin `loading="lazy"` por estar sobre el
 * pliegue: es el LCP y diferirla sería retrasarlo.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * OJO CON LA ENTRADILLA. El brief propone «Dos productos en línea y un agente
 * de IA premiado». Verificado el 2026-09-24, `carflip.cl` responde 500, así que
 * productos en línea hay UNO. La regla de §3 es que cada afirmación va con su
 * enlace o no se hace, y esa regla pesa más que la redacción propuesta: se
 * escribe lo que hoy se sostiene. En cuanto CarFlip vuelva a responder, esta
 * frase recupera el plural y el titular no cambia.
 * ────────────────────────────────────────────────────────────────────────────
 */
export default function Portada() {
  return (
    <section id="portada" className="seccion zona-cielo portada">
      <div className="contenedor portada-interior">
        <div className="portada-texto">
          <h1>Construimos software que puedes abrir y revisar.</h1>

          <p className="entradilla portada-entradilla">
            Un producto en línea y un agente de IA premiado en una hackathon, cada uno con su
            enlace o su código a la vista. Cuéntanos qué necesitas y te respondemos en menos de 48
            horas hábiles.
          </p>

          <div className="portada-acciones">
            <a className="boton boton-primario" href="#contacto">
              Cuéntanos tu proyecto
            </a>
            <a className="boton boton-secundario" href="#proyectos">
              Ver proyectos
            </a>
          </div>
        </div>

        <figure className="portada-figura">
          <img
            src="/image/hero-volutus-1000.webp"
            width="1000"
            height="667"
            alt="Una nube volutus extendida sobre el horizonte al atardecer, con un avión cruzándola de lado."
            fetchPriority="high"
            decoding="async"
          />
        </figure>
      </div>
    </section>
  )
}
