import { Logotipo } from './Marca.jsx'
import { CORREO_DE_CONTACTO } from './Contacto.jsx'
import { WHATSAPP_DE_CONTACTO, enlaceDeWhatsapp } from '../lib/contacto.js'

/**
 * Pie.
 *
 * Cierra la página en plano, oscuro, con el nombre a todo lo ancho: es lo
 * último que se ve y se queda como una firma. Debajo, centrado y en tres
 * niveles: el correo en grande, que es la acción principal del pie, con
 * WhatsApp bajo él como acción secundaria; los enlaces secundarios en una sola
 * línea, y la línea legal antes del mar. «Volver
 * arriba» cierra el recorrido: la página cae de la nube al mar, y desde el mar
 * se vuelve a la nube. Apunta a `#top`, que el estándar resuelve al principio
 * del documento en cualquier página, sin un id ni JavaScript.
 *
 * El logotipo grande es decoración: la marca ya enlaza a la portada desde la
 * barra, así que aquí no es un enlace y se esconde del lector de pantalla. La
 * palabra va en `content` del CSS y no en el HTML, para que no compita con el
 * titular como texto de la página.
 *
 * No lleva perfiles personales de GitHub ni LinkedIn: esos van en la tarjeta
 * de cada socio, en /nosotros (decisión 34 del brief).
 */

// Texto que llega ya escrito en el chat de WhatsApp.
const MENSAJE_DE_WHATSAPP = 'Hola, vi la página de Volutus y quiero conversar sobre un proyecto.'

// `dia` lo pone la home: ahí el pie cierra el espejo de la portada y es de día
// (ver `.caida` en Contacto.css). En las demás páginas sigue siendo la noche.
export default function Pie({ dia = false }) {
  return (
    <footer className={`pie ${dia ? 'zona-cielo hora-manana' : 'zona-plano hora-noche'}`}>
      <div className="contenedor">
        <div className="pie-logotipo" aria-hidden="true">
          <span className="pie-logotipo-cuerpo">
            <Logotipo className="pie-logotipo-svg" porLetra />
          </span>
        </div>

        <div className="pie-contacto">
          <p className="antetitulo">Contáctanos</p>
          <div className="pie-contacto-acciones">
            {WHATSAPP_DE_CONTACTO && (
              <a
                className="boton pie-whatsapp"
                href={enlaceDeWhatsapp(MENSAJE_DE_WHATSAPP)}
                target="_blank"
                rel="noopener"
                aria-label="Escribir por WhatsApp"
              >
                <img src="/image/whatsapp.webp" width="22" height="22" alt="" loading="lazy" />
                WhatsApp
              </a>
            )}
            <a className="pie-correo" href={`mailto:${CORREO_DE_CONTACTO}`}>
              {CORREO_DE_CONTACTO} <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <nav className="pie-enlaces" aria-label="Pie de página">
          <ul>
            <li>
              <a href="/nosotros">Quiénes somos</a>
            </li>
            <li>
              <a href="/articulos">Artículos</a>
            </li>
            <li>
              <a href="/privacidad">Privacidad</a>
            </li>
            <li>
              <a href="#top">
                Volver arriba <span aria-hidden="true">↑</span>
              </a>
            </li>
          </ul>
        </nav>

        <p className="pie-legal">© {new Date().getFullYear()} Volutus · Desarrollo de software · Chile</p>
      </div>

      {/* La página termina en el mar que hay bajo la nube de la portada: la
          base de la nube. */}
      <div className="pie-mar">
        <canvas className="nubes" data-vista="mar" aria-hidden="true" />
      </div>
    </footer>
  )
}
