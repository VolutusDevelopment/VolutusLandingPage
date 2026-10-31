import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Una sola entrada, index.html, que hace de plantilla para todas las páginas.
  // No hay enrutador en el navegador: el prerender escribe un HTML por ruta
  // (scripts/prerender.mjs), que es lo que mantiene el JavaScript enviado en el
  // mínimo y hace que cada página sea indexable por sí misma.
  build: {
    target: 'es2022',
    // El polyfill sirve a los <link rel="modulepreload"> del HTML en
    // navegadores viejos, y ningún HTML lleva uno: era peso muerto. Quitarlo
    // descuenta parte del ayudante que Vite agrega por el `import()` del juego
    // de la 404 (src/client.js).
    modulePreload: { polyfill: false },
    // Un solo CSS, que el prerender incrusta en cada página y borra. Dividido,
    // Vite lo pediría también al cargar cada `import()` que comparte código
    // con la entrada (el combate, en Operación Venganza), y al no estar el
    // archivo, el `import()` fallaría.
    cssCodeSplit: false,
  },
  esbuild: {
    legalComments: 'none',
  },
})
