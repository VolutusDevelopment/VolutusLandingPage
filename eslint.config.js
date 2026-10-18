// ESLint: las reglas recomendadas, con los globales de cada lugar donde corre
// el código. El sitio va en el navegador, salvo el pintor de las nubes, que
// es un Web Worker; el formulario, en un Worker de Cloudflare, y los scripts
// de compilación, en Node, aunque las funciones que le pasan a Playwright
// corren en la página.
import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'

export default defineConfig([
  globalIgnores(['dist', '.prerender', '.wrangler', '.claude']),
  js.configs.recommended,
  {
    files: ['**/*.jsx'],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['src/nubes-lienzo.js'],
    languageOptions: { globals: globals.worker },
  },
  {
    files: ['worker/**/*.js'],
    languageOptions: { globals: globals.serviceworker },
  },
  {
    files: ['scripts/**/*.{js,mjs}', '*.config.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
])
