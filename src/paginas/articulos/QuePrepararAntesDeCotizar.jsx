import Articulo from '../../components/Articulo.jsx'

export default function QuePrepararAntesDeCotizar({ ruta }) {
  return (
    <Articulo ruta={ruta}>
      <p>
        Para cotizar un proyecto de software no hace falta saber de tecnología. Lo que sí ayuda es tener claro el
        problema. Con estas seis respuestas, una empresa seria —nosotros incluidos— te puede decir alcance, precio y
        qué viene después, sin una ronda de reuniones de por medio.
      </p>

      <h2>1. El problema, en tus palabras</h2>
      <p>
        No la solución: el problema. «Pierdo pedidos porque llegan por tres canales distintos» dice más que «quiero
        una app». Puede que la mejor solución no sea la que imaginabas, y está bien.
      </p>

      <h2>2. Cómo lo resuelves hoy</h2>
      <p>
        Aunque sea en papel, en una planilla o de memoria. Saber cómo funciona hoy muestra qué datos existen, quién
        participa y dónde se pierde el tiempo.
      </p>

      <h2>3. Quién lo va a usar</h2>
      <p>
        Tus clientes, tu equipo o tú. Cuántas personas, desde qué dispositivo y con qué costumbres: no es lo mismo una
        app para vendedores en terreno que un panel para la oficina.
      </p>

      <h2>4. Qué sería un buen resultado</h2>
      <p>
        Algo que se pueda comprobar: responder en minutos y no en horas, saber el stock sin contar, dejar de copiar
        datos a mano. Sirve para decidir qué entra en la primera versión y qué puede esperar.
      </p>

      <h2>5. Con qué se tiene que conectar</h2>
      <p>
        Tu sitio actual, tu sistema de ventas, tu facturación, tus planillas o tu correo. Si hay algo que no se puede
        cambiar, dilo desde el principio.
      </p>

      <h2>6. Tus límites</h2>
      <p>
        Una fecha que de verdad importa —una temporada, un lanzamiento— y un rango de presupuesto, aunque sea
        aproximado. No es para cobrarte más: es para proponerte lo que cabe.
      </p>

      <h2>Una lista para copiar</h2>
      <ul>
        <li>El problema: …</li>
        <li>Hoy lo resolvemos así: …</li>
        <li>Lo van a usar: …</li>
        <li>Un buen resultado sería: …</li>
        <li>Se tiene que conectar con: …</li>
        <li>Fecha importante y presupuesto aproximado: …</li>
      </ul>
      <p className="destacado">
        Con eso basta para <a href="/#contacto">escribirnos</a>. Te mandamos alcance y precio en nuestra primera
        respuesta, en menos de 48 horas hábiles.
      </p>

      <h2>Lo que no hace falta</h2>
      <ul>
        <li>Saber qué tecnología usar: eso nos toca a nosotros.</li>
        <li>Tenerlo todo definido: el alcance se termina de afinar conversando.</li>
        <li>Un documento formal: un correo o el formulario sirven.</li>
      </ul>
    </Articulo>
  )
}
