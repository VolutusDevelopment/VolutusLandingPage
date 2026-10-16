import Pagina from '../components/Pagina.jsx'
import Contacto from '../components/Contacto.jsx'
import Pieza from '../components/Pieza.jsx'
import { FilaDeServicios, ListaDeArticulos } from '../components/Sugerencias.jsx'
import { articulosDe } from '../lib/meta.js'
import { SERVICIOS } from '../lib/servicios.js'
import { PAGINAS_DE_SERVICIO } from '../data/paginas-de-servicio.js'
import Web from './servicios/Web.jsx'
import Tienda from './servicios/Tienda.jsx'
import App from './servicios/App.jsx'
import Agente from './servicios/Agente.jsx'
import Automatizacion from './servicios/Automatizacion.jsx'
import Gestion from './servicios/Gestion.jsx'
import Prospeccion from './servicios/Prospeccion.jsx'

/**
 * La página propia de un servicio, que la ruta elige (paginas/rutas.js).
 *
 * El marco es el mismo para todos: la card de su servicio abierta. Su color
 * tiñe el cielo de la cabecera y la barra (`tinte`, ver Pagina.jsx), y una
 * pieza propia (Pieza.jsx) dibuja en él lo que hace el servicio. Al final, el
 * recorrido de las páginas internas: otras lecturas y la caída con el
 * formulario —con el servicio ya marcado— y el pie de día.
 *
 * Lo de en medio es de cada servicio (servicios/): cuenta lo que incluye con
 * la forma de lo que entrega y ordena a su manera las piezas que comparten
 * todos. El precio no se publica (§3), pero la pregunta se responde igual.
 */
const CUERPOS = {
  web: Web,
  tienda: Tienda,
  app: App,
  agente: Agente,
  automatizacion: Automatizacion,
  gestion: Gestion,
  prospeccion: Prospeccion,
}

export default function Servicio({ ruta }) {
  const servicio = SERVICIOS.find((s) => s.ruta === ruta)
  const pagina = PAGINAS_DE_SERVICIO[servicio.id]
  const Cuerpo = CUERPOS[servicio.id]

  return (
    <Pagina
      ruta={ruta}
      hora="dia"
      tinte={servicio.color}
      contactoAqui
      className="servicio-pagina"
      cierre={<Contacto marcado={servicio.opcion} />}
    >
      <section className="seccion zona-cielo hora-dia cabecera-cielo servicio-cabecera">
        <div className="contenedor servicio-portada">
          <div>
            <p className="antetitulo">{pagina.antetitulo}</p>
            <h1>{pagina.titular}</h1>
            <p className="entradilla servicio-entradilla">{pagina.entradilla}</p>
            <p className="servicio-acciones">
              <a className="boton boton-primario" href="#contacto">
                Cuéntanos tu proyecto
              </a>
              <a className="boton boton-secundario" href="#incluye">
                Qué incluye
              </a>
            </p>
          </div>
          <Pieza id={servicio.id} />
        </div>
      </section>

      <Cuerpo pagina={pagina} ruta={ruta} />

      <section className="seccion zona-cielo" aria-labelledby="sigue-titulo">
        <div className="contenedor">
          <h2 id="sigue-titulo" className="entra">
            Sigue leyendo
          </h2>
          <ListaDeArticulos articulos={articulosDe(servicio.id)} />
          <h3 className="servicio-otros-titulo entra">Otros servicios</h3>
          <FilaDeServicios servicios={SERVICIOS.filter((s) => s.ruta && s !== servicio)} />
        </div>
      </section>
    </Pagina>
  )
}
