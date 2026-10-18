import Pagina from '../components/Pagina.jsx'
import Contacto from '../components/Contacto.jsx'
import Estimado from '../components/Estimado.jsx'
import Pieza from '../components/Pieza.jsx'
import Guia from '../components/Guia.jsx'
import { ListaDeArticulos } from '../components/Sugerencias.jsx'
import { articulosDe } from '../lib/meta.js'
import { SERVICIOS } from '../lib/servicios.js'
import { PAGINAS_DE_SERVICIO } from '../data/paginas-de-servicio.js'
import { ESTIMADOS, desde, numero, pesos } from '../lib/precios.js'
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
 * todos. Cada uno pone el estimado de precio (Estimado.jsx) justo después de
 * «Qué incluye», y la cabecera lleva a él con el precio de partida a la vista
 * (decisión 49 del brief).
 *
 * En S y M, la guía (Guia.jsx) lleva a cada parte. Va al final del `main`
 * porque es fija: así no se mete entre la cabecera y la sección que continúa
 * su degradado.
 */
const INCLUYE = ['incluye', 'Incluye']
const PRECIO = ['estimado', 'Precio']
const PREGUNTAS = ['preguntas-titulo', 'Preguntas']
const CONTACTO = ['contacto', 'Contacto']

// Las partes, en el orden de la página: en la de agentes, las preguntas van
// primero (Agente.jsx).
const destinosDe = (id) => (id === 'agente' ? [PREGUNTAS, INCLUYE, PRECIO, CONTACTO] : [INCLUYE, PRECIO, PREGUNTAS, CONTACTO])

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
  const precio = desde(ESTIMADOS[servicio.id])

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
            <h1>{pagina.titular}</h1>
            <p className="entradilla servicio-entradilla">{pagina.entradilla}</p>
            <p className="servicio-acciones">
              <a className="boton boton-primario servicio-desde" href="#estimado">
                Calcula tu estimado
                <span className="servicio-desde-cifra">
                  desde <strong>{numero(precio)} UF</strong>
                </span>
              </a>
              <a className="boton boton-secundario" href="#contacto">
                Cuéntanos tu proyecto
              </a>
            </p>
            <p className="servicio-desde-nota">
              + IVA · {pesos(precio)} · Es un estimado: lo que necesites puede cambiar el precio final.
            </p>
          </div>
          <Pieza id={servicio.id} />
        </div>
      </section>

      <Cuerpo pagina={pagina} estimado={<Estimado servicio={servicio.id} />} />

      <section className="seccion zona-cielo" aria-labelledby="sigue-titulo">
        <div className="contenedor">
          <h2 id="sigue-titulo" className="titular entra">
            Sigue leyendo
          </h2>
          <ListaDeArticulos articulos={articulosDe(servicio.id)} />
        </div>
      </section>

      <Guia destinos={destinosDe(servicio.id)} />
    </Pagina>
  )
}
