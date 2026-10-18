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
 * su sombra, formándose en su frente y deshaciéndose detrás; el cursor la
 * mueve como viento (ver nubes-lienzo.js). En toda pantalla cruza la portada
 * en perspectiva, detrás del titular centrado, y es ella la que se impone. La
 * página baja por las horas del día hasta la noche del pie (DESIGN-BRIEF A.8).
 *
 * **Ninguna afirmación de aquí cuenta obra.** Es deliberado: contarla era lo
 * que obligaba a andar corrigiendo el plural cada vez que `carflip.cl` se cae.
 * La obra la enseña el índice que viene debajo, con sus enlaces, que es donde
 * §3 quiere que esté — cada afirmación con lo que la sostiene al lado. Los
 * logros con jurado externo sí van, porque no se caen, salen de
 * data/proyectos.js y llevan al podio donde está su prueba.
 */

import { Fragment } from 'react'

import { PROYECTOS } from '../data/proyectos.js'
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

const LOGROS = PROYECTOS.filter((proyecto) => proyecto.destacado)

/**
 * El cielo de la mañana con la volutus y el texto encima. Lo comparten la
 * portada y /nosotros, que abre bajo la misma nube.
 *
 * `perspectiva` cambia desde dónde se mira la nube: es una de las cámaras de
 * lib/volutus.js. Sin ella, la de la portada, desde el aire: el rollo entra
 * enorme por la izquierda y se aleja en diagonal. `costado` lo pone casi
 * paralelo a la pantalla, cruzando la cabecera, donde se ve subir su frente,
 * y le da a la escena su variante de layout (Portada.css).
 */
export function Escena({ id, perspectiva, children }) {
  return (
    <section id={id} className={`seccion zona-cielo hora-manana portada${perspectiva ? ` portada-${perspectiva}` : ''}`}>
      <div className="alba hora-dia" aria-hidden="true" />
      <div className="portada-escena">
        <div className="portada-cielo">
          <canvas className="nubes" data-vista="cielo" data-perspectiva={perspectiva} aria-hidden="true" />
        </div>

        <div className="contenedor portada-interior">
          <div className="portada-texto">{children}</div>
        </div>
      </div>
    </section>
  )
}

export default function Portada() {
  return (
    <Escena id="portada">
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

      {/* Lo que gana quien contrata, sin prometer ventas ni horas que no
          podemos mostrar (§3): que deja de hacerlo a mano y que el producto
          es suyo desde la entrega (decisión 44). */}
      <p className="entradilla portada-entradilla">
        Deja de hacerlo a mano: lo hacemos a tu medida y es tuyo desde la entrega.
      </p>

      <div className="portada-acciones">
        <a className="boton boton-primario" href="#contacto">
          Cuéntanos tu proyecto
        </a>
      </div>

      {/* El puesto se ve como «1°» y se lee como «Primer lugar en». */}
      <p className="portada-credenciales">
        Con jurado externo:{' '}
        <a href="#proyectos">
          {LOGROS.map(({ id, credencial }, i) => (
            <Fragment key={id}>
              {i > 0 && ' · '}
              <span>
                <strong aria-hidden="true">{credencial.puesto}</strong>
                <span className="solo-lectores">{credencial.titulo} en</span> {credencial.corto}
              </span>
            </Fragment>
          ))}
        </a>
      </p>
    </Escena>
  )
}
