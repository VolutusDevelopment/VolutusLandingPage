import { SERVICIOS } from '../lib/servicios.js'
import Icono from './Icono.jsx'

/**
 * Servicios: seis paneles numerados, con la mecánica del acordeón de la
 * vitrina de vwlab.io (anima-vw.netlify.app, sección `.accd`). Es la segunda
 * hondura de la caída.
 *
 * - **En escritorio, paneles superpuestos.** Todos miden lo mismo y cada uno
 *   empieza una franja más a la derecha que el anterior, por debajo de él y
 *   con el canto derecho redondeado. Del elegido se ve todo; de los demás, solo
 *   la franja de su borde derecho, con el nombre y el número. Al elegir otro,
 *   los que van antes se corren a la izquierda hasta dejar asomar solo su
 *   franja. Como solo se mueve `transform`, el texto no se reacomoda mientras
 *   anima: llega con su ancho final desde el primer fotograma.
 * - **En el celular, el mismo apilado en vertical:** cada panel asoma bajo el
 *   canto redondeado del de arriba y el elegido se despliega.
 *
 * El patrón de accesibilidad es el del acordeón de ARIA: un botón dentro del
 * título que abre su región. Los atributos los pone `servicios.js` al
 * arrancar, porque sin JavaScript no hay nada que abrir: la hoja de
 * `<noscript>` enseña los seis servicios abiertos, uno debajo del otro.
 */

// Sin JavaScript no hay acordeón: los seis servicios se ven enteros, uno
// debajo del otro. Va en `<noscript>` y no al revés —el acordeón activado por
// una clase que pone el script— porque así la página no cambia de forma al
// arrancar: quien llega por /#servicios cae donde tiene que caer.
const SIN_SCRIPT = `
.paneles { display: grid !important; gap: var(--e-4); height: auto !important; overflow: visible !important; }
.servicio { position: static !important; width: auto !important; margin: 0 !important; padding: var(--e-6) !important; border-radius: var(--radio-panel) !important; transform: none !important; }
.servicio-boton { position: static !important; width: auto !important; flex-direction: row !important; padding: 0 !important; pointer-events: none; }
.servicio-nombre { writing-mode: horizontal-tb !important; }
.servicio-panel { display: block !important; position: static !important; padding: var(--e-4) 0 0 !important; visibility: visible !important; }
.servicio-cabecera { display: none !important; }
.servicio-boton .servicio-icono, .servicio-nombre { opacity: 1 !important; }
`

export default function Servicios() {
  return (
    <section id="servicios" className="seccion zona-plano hondura-2 servicios">
      <div className="contenedor">
        <h1 className="entra">Nuestros Servicios</h1>

        <ol className="paneles entra" style={{ '--n': SERVICIOS.length }}>
          {SERVICIOS.map((servicio, i) => (
            <li
              key={servicio.id}
              className={`servicio zona-plano${i === 0 ? ' activo' : ''}`}
              style={{ '--i': i }}
            >
              <h3 className="servicio-titulo">
                <button type="button" className="servicio-boton" id={`servicio-${servicio.id}-boton`}>
                  <Icono id={servicio.id} className="servicio-icono" />
                  <span className="servicio-nombre">{servicio.nombre}</span>
                  {/* El número es la marca del panel, no información: el
                      lector de pantalla ya anuncia la posición en la lista. */}
                  <span className="servicio-numero" aria-hidden="true">
                    {i + 1}
                  </span>
                </button>
              </h3>

              <div className="servicio-panel" id={`servicio-${servicio.id}`}>
                <div className="servicio-contenido">
                  {/* La cabecera del panel abierto en escritorio. El nombre ya
                      lo anuncia el botón; esto es solo lo que se ve. */}
                  <p className="servicio-cabecera" aria-hidden="true">
                    <Icono id={servicio.id} className="servicio-icono" />
                    {servicio.nombre}
                  </p>
                  <p className="servicio-texto">{servicio.texto}</p>
                  <ol className="servicio-puntos">
                    {servicio.puntos.map((punto) => (
                      <li key={punto}>{punto}</li>
                    ))}
                  </ol>
                  {servicio.enlace && (
                    <p className="servicio-enlace">
                      <a
                        className="boton boton-secundario"
                        href={servicio.enlace.href}
                        // Arrastrar el enlace lo sacaría de la página en vez
                        // de mover el panel.
                        draggable="false"
                        {...(servicio.enlace.href.startsWith('http') && { rel: 'noopener' })}
                      >
                        {servicio.enlace.texto}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <noscript>
          <style dangerouslySetInnerHTML={{ __html: SIN_SCRIPT }} />
        </noscript>
      </div>
    </section>
  )
}
