// El almacenamiento del navegador puede no estar (modo privado, cookies
// bloqueadas) o negarse a escribir: nada de esto debe romper la página.
// `almacen` queda en el equipo; `sesion`, lo que dure la pestaña.
const envolver = (nombre) => ({
  leer(clave) {
    try {
      return window[nombre].getItem(clave)
    } catch {
      return null
    }
  },
  escribir(clave, valor) {
    try {
      window[nombre].setItem(clave, valor)
      return true
    } catch {
      return false
    }
  },
  borrar(clave) {
    try {
      window[nombre].removeItem(clave)
    } catch {
      // Sin almacenamiento no hay nada que borrar.
    }
  },
})

export const almacen = envolver('localStorage')
export const sesion = envolver('sessionStorage')
