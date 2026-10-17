import Articulo from '../../components/Articulo.jsx'

export default function BoletaFacturaYSii({ ruta }) {
  return (
    <Articulo ruta={ruta}>
      <p>
        Cuando contratas una tienda o un sistema, una de las primeras preguntas debería ser cómo se emiten los
        documentos de tus ventas. Es un tema que suele aparecer tarde, cuando ya hay pedidos esperando.
      </p>

      <h2>Quién emite el documento</h2>
      <p>
        El documento tributario lo emite el negocio, no el software. El programa puede ayudar a generarlo o a enviarlo,
        pero la responsabilidad frente al SII es de quien vende. Por eso conviene saber, antes de contratar, qué parte
        del proceso cubre cada uno.
      </p>

      <h2>Preguntas para cualquier proveedor</h2>
      <ul>
        <li>¿Puede emitir boleta electrónica, factura o guía de despacho, o solo registra la venta?</li>
        <li>¿Se conecta con la facturación que ya usas, o hay que copiar los datos a mano?</li>
        <li>Si el SII cambia el formato, ¿quién lo actualiza, y en cuánto tiempo?</li>
        <li>¿Qué pasa con las boletas ya emitidas si cambias de sistema?</li>
        <li>¿Quién responde si un documento sale mal: el proveedor del software, o tu contador?</li>
      </ul>

      <h2>Qué mirar en la respuesta</h2>
      <p>
        Una respuesta vaga como «se puede integrar» no dice mucho. Pide que te muestren cómo queda un documento real, de
        principio a fin: desde que se confirma la venta hasta que el cliente lo recibe. Si el proveedor no puede
        mostrarlo, pregunta por qué.
      </p>

      <h2>Lo que hacemos nosotros</h2>
      <p>
        Cada proyecto que necesita documentos tributarios lo conversamos antes de cotizar. No damos por hecho una
        integración con tu facturación: la confirmamos con el sistema concreto que usas, y te decimos qué queda incluido
        y qué no.
      </p>

      <p className="destacado">
        Esto es información general, no asesoría tributaria. Para decisiones sobre tu facturación, tu contador es quien
        mejor sabe cómo funciona tu caso.
      </p>

      <p>
        Si estás armando una tienda, revisa la página de <a href="/servicios/tiendas-online">tiendas online</a>. Si
        necesitas un sistema de gestión que también factura, mira{' '}
        <a href="/servicios/sistemas-de-gestion">sistemas de gestión</a>.
      </p>
    </Articulo>
  )
}
