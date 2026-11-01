import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { SERVICIOS } from './lib/servicios.js'
import { COMPONENTES } from './paginas/rutas.js'

// Solo se importa en dev (ver src/main.js). Vite responde index.html en toda
// ruta, así que la página se elige aquí por la dirección, igual que el
// prerender en build; lo que no está en el mapa es la 404. flushSync monta el
// DOM de forma síncrona para que client.js encuentre los nodos al inicializar.
// Lo que el prerender pone en <html>, el fondo del rebote en el color del
// servicio (`raiz` en scripts/prerender.mjs), también va aquí.
export function renderApp() {
  const ruta = location.pathname.replace(/\.html$|\/$/, '') || '/'
  const Pagina = COMPONENTES[ruta] ?? COMPONENTES['/404']
  const servicio = SERVICIOS.find((s) => s.ruta === ruta)
  if (servicio) document.documentElement.style.setProperty('--fondo-de-arriba', servicio.color)
  flushSync(() => {
    createRoot(document.getElementById('root')).render(<Pagina ruta={ruta} />)
  })
}
