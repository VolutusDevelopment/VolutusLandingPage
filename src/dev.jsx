import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import Inicio from './paginas/Inicio.jsx'

// Solo se importa en dev (ver src/main.js). flushSync monta el DOM de forma
// síncrona para que client.js encuentre los nodos al inicializar.
export function renderApp() {
  flushSync(() => {
    createRoot(document.getElementById('root')).render(<Inicio />)
  })
}
