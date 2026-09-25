import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    rollupOptions: {
      // Una entrada por página. No hay enrutador en el navegador: cada ruta es
      // su propio HTML prerenderizado, que es lo que mantiene el JavaScript
      // enviado en el mínimo y hace que /privacidad sea indexable por sí misma.
      input: {
        index: 'index.html',
        privacidad: 'privacidad.html',
      },
    },
  },
  esbuild: {
    legalComments: 'none',
  },
})
