import './styles/main.css'
import init from './client.js'

if (import.meta.env.DEV) {
  // En dev el root llega vacío: React renderiza la App en el navegador.
  // En producción el HTML ya viene prerenderizado y Vite elimina este
  // bloque del bundle, así que React nunca se envía al cliente.
  const { renderApp } = await import('./dev.jsx')
  renderApp()
}

// El arranque espera al primer pintado: `requestAnimationFrame` corre justo
// antes de pintar y el `setTimeout` de dentro, justo después. Si el script
// llega antes que el pintado —pasa a veces, depende de lo que tarde en leerse
// el HTML—, la primera medida que toma (la barra mide su posición) obliga al
// navegador a calcular estilos y maqueta de toda la página dentro de la misma
// tarea: 70 ms más de bloqueo en un móvil medio. Esperando un fotograma, ese
// trabajo lo hace el pintado, que lo iba a hacer igual.
requestAnimationFrame(() => setTimeout(init))
