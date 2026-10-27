// La clave de la sesión donde queda el final que se eligió en la escena 16
// de Operación Venganza (lib/escena16.js), y que /nosotros muestra
// (src/flota.js). Va sola para que el sitio no cargue el guion.
export const FINAL = 'operacion-venganza-final'

// El final elegido en esta sesión, o null.
export const elegido = () => {
  try {
    return sessionStorage.getItem(FINAL)
  } catch {
    return null
  }
}
