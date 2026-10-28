/**
 * Portada (DESIGN-BRIEF §4, bloque 1). Tema cielo: aquí la página promete.
 *
 * Lo que tiene que ver quien no baja nada: el titular, una entradilla corta, la
 * acción principal con su secundaria, la credencial del jurado y la pieza de
 * marca. La regla que manda: si la pieza visual empuja el titular fuera de la
 * pantalla en un móvil de 360 px, la pieza se reduce. El texto gana siempre,
 * porque es lo único que casi todos van a leer.
 *
 * **La primera pantalla es la mañana: una volutus y un mensaje.** La nube en
 * rollo que da nombre a la marca, en volumen y de puntos finos, con su luz y
 * su sombra, formándose en su frente y deshaciéndose detrás. El cursor no la
 * mueve: su aire está en calma (`data-calma`, ver nubes-lienzo.js), porque
 * simular el viento en cada fotograma costaba. En toda pantalla cruza la
 * portada en perspectiva, detrás del titular centrado, y es ella la que se
 * impone. La página baja por las horas del día hasta la noche del pie
 * (DESIGN-BRIEF A.8).
 *
 * **Ninguna afirmación de aquí cuenta obra.** Es deliberado: contarla era lo
 * que obligaba a andar corrigiendo el plural cada vez que `carflip.cl` se cae.
 * La obra la enseña el índice que viene debajo, con sus enlaces, que es donde
 * §3 quiere que esté — cada afirmación con lo que la sostiene al lado.
 */

import { SERVICIOS } from '../lib/servicios.js'

// Las frases que rotan en el titular y el servicio de cada una, del que toman
// el color de su card. Cada una cabe en una línea a 360 px: por eso «sistemas»
// y no «sistemas de gestión», y «automatización» y no «automatizaciones».
const ROTATIVO = [
  ['páginas web', 'web'],
  ['tiendas online', 'tienda'],
  ['apps', 'app'],
  ['sistemas', 'gestion'],
  ['agentes de IA', 'agente'],
  ['automatización', 'automatizacion'],
].map(([palabra, id]) => ({ palabra, color: SERVICIOS.find((servicio) => servicio.id === id).color }))

/**
 * El cielo de la mañana con la volutus y el texto encima. La nube se mira
 * desde el aire (lib/volutus.js): el rollo entra enorme por la izquierda y se
 * aleja en diagonal, y queda pegada detrás de la página hasta que la tapa
 * Proyectos (`data-recorrido`, ver nubes.js). Va antes de la portada y no
 * dentro de ella, para quedarse pegada también mientras pasan los servicios
 * (Portada.css).
 */
export default function Portada() {
  return (
    <>
      <div className="portada-cielo hora-manana">
        {/* El cielo va en un SVG y no de fondo: Safari en iOS pinta la franja
            de la hora y la de su barra con el fondo de lo que va pegado, aunque
            Proyectos lo tape, y no ve un SVG (Portada.css). */}
        <svg className="portada-degradado" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
          <linearGradient id="cielo-de-la-manana" x2="0" y2="1">
            <stop stopColor="#1976cc" />
            <stop offset="0.45" stopColor="#3088d9" />
            <stop offset="1" stopColor="#61abed" />
          </linearGradient>
          <rect width="1" height="1" fill="url(#cielo-de-la-manana)" />
        </svg>
        <canvas className="nubes" data-vista="cielo" data-recorrido="#proyectos" data-calma aria-hidden="true" />
      </div>
      <section id="portada" className="seccion zona-cielo hora-manana portada" data-barra="hora-dia">
        <div className="alba hora-dia" aria-hidden="true" />
        <div className="portada-escena">
          <div className="contenedor portada-interior">
            <div className="portada-texto">
              {/* El gancho va de antetítulo y el titular dice lo que hacemos,
                  sin que haya que pensarlo: «Creamos» y el servicio. Rotan los
                  de `lib/servicios.js` (`ROTATIVO`, menos la prospección y la ley
                  de datos, que no son algo que se cree).

                  Buscadores y lectores de pantalla leen la lista entera y fija,
                  con los nombres que la gente busca («aplicaciones», «agentes de
                  inteligencia artificial»); el rotativo es solo para la vista.
                  Ocupa siempre una línea, así que el titular no salta al cambiar. */}
              <p className="antetitulo">
                ¿Qué estás <span>resolviendo a mano?</span>
              </p>
              <h1>
                Creamos{' '}
                <span className="solo-lectores">
                  páginas web, tiendas online, aplicaciones, sistemas de gestión, agentes de inteligencia artificial y
                  automatizaciones{' '}
                </span>
                <span
                  className="rotativo"
                  aria-hidden="true"
                  data-palabras={ROTATIVO.map(({ palabra }) => palabra).join('|')}
                  data-colores={ROTATIVO.map(({ color }) => color).join('|')}
                >
                  <span className="rotativo-palabra" style={{ '--servicio': ROTATIVO[0].color }}>
                    {ROTATIVO[0].palabra}
                  </span>
                </span>{' '}
                para tu negocio
              </h1>

              {/* El reparto del trabajo, sin prometer ventas ni horas que no podemos
                  mostrar (§3), y la respuesta corta a «¿qué tengo que entregar yo?»
                  (§2). «Lo resolvemos» y no «la solución», que el glosario descarta
                  (§5). La segunda frase no se parte: en S, la línea cae en el punto. */}
              <p className="entradilla portada-entradilla">
                Tú pones el problema. <span>Nosotros lo resolvemos.</span>
              </p>

              <div className="portada-acciones">
                <a className="boton boton-primario" href="#contacto">
                  Cuéntanos tu proyecto
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
