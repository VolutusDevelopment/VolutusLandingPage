import { Incluye, ParaEmpezar, Preguntas } from './Bloques.jsx'

/**
 * Tiendas online: lo que incluye son las fases de una compra, una por
 * pantalla, y cada scroll cae en una (Tienda.css). Desde L, al lado, un índice
 * del alto de la pantalla se queda a la vista y marca la que se está leyendo.
 * Cada fase tiene su escena: la tienda funcionando, con los tokens del sitio.
 *
 * Las escenas son de ejemplo y no dicen nada que el texto no diga, así que se
 * esconden del lector de pantalla.
 *
 * En S y M no hay índice: cada fase lleva su número, y tienda.js apaga las que
 * no están al centro. El número lo dice ya la lista ordenada al lector de
 * pantalla, así que va escondido de él.
 */

const ESCENAS = {
  catalogo: (
    <>
      <p className="tienda-chips">
        <span>Todo</span>
        <span>Poleras</span>
        <span>Tazas</span>
        <span>Láminas</span>
      </p>
      <span className="tienda-productos">
        {[
          [80, 40],
          [70, 35],
          [85, 45],
        ].map(([nombre, precio], i) => (
          <span key={i} className="tienda-producto tienda-sube" style={{ '--i': i }}>
            <span className="tienda-foto" />
            <span className="tienda-barra" style={{ width: `${nombre}%` }} />
            <span className="tienda-barra tienda-barra-tinte" style={{ width: `${precio}%` }} />
          </span>
        ))}
      </span>
    </>
  ),
  carrito: (
    <>
      {[
        [45, 1],
        [35, 2],
      ].map(([nombre, cantidad], i) => (
        <span key={i} className="tienda-linea tienda-sube" style={{ '--i': i }}>
          <span className="tienda-foto" />
          <span className="tienda-barra" style={{ width: `${nombre}%` }} />
          <span className="tienda-cantidad">− {cantidad} +</span>
        </span>
      ))}
      <span className="tienda-total">
        <span className="tienda-barra tienda-barra-tinte" style={{ width: '30%' }} />
        <span className="tienda-pagar tienda-sube" style={{ '--i': 2 }}>
          Pagar
        </span>
      </span>
    </>
  ),
  pago: (
    <span className="tienda-pago">
      <span className="tienda-tarjeta tienda-sube">
        <span className="tienda-chip-tarjeta" />
        <span className="tienda-digitos">•••• •••• ••••</span>
      </span>
      <span className="tienda-cobro">
        <span className="tienda-progreso" />
        <span className="tienda-pagado tienda-sube" style={{ '--i': 3 }}>
          ✓ Pagado
        </span>
      </span>
    </span>
  ),
  pedido: (
    <p className="tienda-estados">
      {['Pagado', 'Preparado', 'Enviado', 'Entregado'].map((estado, i) => (
        <span key={estado} style={{ '--i': i }}>
          {estado}
        </span>
      ))}
    </p>
  ),
  panel: (
    <span className="tienda-panel">
      <span className="tienda-barras">
        {[40, 55, 48, 70, 82, 96].map((alto, i) => (
          <span key={i} style={{ '--i': i, height: `${alto}%` }} />
        ))}
      </span>
      <span className="tienda-ajustes">
        {[60, 45, 52].map((ancho, i) => (
          <span key={i} className="tienda-ajuste tienda-sube" style={{ '--i': i + 1 }}>
            <span className="tienda-barra" style={{ width: `${ancho}%` }} />
            <span className="tienda-interruptor" />
          </span>
        ))}
      </span>
    </span>
  ),
}

export default function Tienda({ pagina, estimado }) {
  return (
    <>
      <Incluye className="tienda-incluye">
        <div className="tienda-recorrido">
          <nav className="tienda-indice" aria-label="Fases de la compra">
            <ol>
              {pagina.incluye.map(({ id, titulo }) => (
                <li key={id} className={`tienda-paso-${id}`}>
                  <a href={`#fase-${id}`}>
                    <span className="tienda-punto" aria-hidden="true" />
                    {titulo}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <ol className="tienda-fases">
            {pagina.incluye.map(({ id, titulo, texto }, i) => (
              <li key={id} id={`fase-${id}`} className={`tienda-fase tienda-fase-${id}`}>
                <div className="tienda-fase-texto entra">
                  <p className="servicio-rotulo tienda-numero" aria-hidden="true">
                    Paso {i + 1} de {pagina.incluye.length}
                  </p>
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </div>
                <div className="tienda-escena" aria-hidden="true">
                  {ESCENAS[id]}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Incluye>
      {estimado}
      <ParaEmpezar cuando={pagina.cuando} pedimos={pagina.pedimos} />
      <Preguntas preguntas={pagina.preguntas} />
    </>
  )
}
