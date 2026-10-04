/**
 * El modo «Odio a los patos» se desbloquea al terminar una partida entera (ver
 * src/patos.js) y queda desbloqueado en las visitas siguientes. Sin
 * almacenamiento, como en una ventana privada, dura lo que la página.
 */

const CLAVE = 'patos-odio'

export function desbloqueado() {
  try {
    return localStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

export function desbloquear() {
  try {
    localStorage.setItem(CLAVE, '1')
  } catch {
    // Sin almacenamiento el botón se muestra igual, solo por esta visita.
  }
}
