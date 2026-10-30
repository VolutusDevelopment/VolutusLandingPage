// Maniobras que comparten los guiones de los niveles (lib/nivel1.js y
// siguientes), con los métodos de cada caza de src/combate.js.

/**
 * Embestidas de `periodo` s: el caza `c` aparece en el horizonte, se acerca
 * de frente hacia donde está quien juega y se encabrita por encima de la
 * cámara. `desde` corre la primera (con 4,3 de 6 empieza encabritándose,
 * desde donde quedó tras el diálogo); `clave` guarda la vuelta en `s`, una
 * por caza. Con `tonel`, a media aproximación da una vuelta sobre su eje,
 * hacia un lado distinto cada vez. Devuelve en qué parte de la embestida va,
 * de 0 a 1.
 */
export function embestida(c, t, s, j, { periodo = 6, desde = 4.3, clave = 'vuelta', tonel = false } = {}) {
  const u = ((t + desde) % periodo) / periodo
  if (j.cruza(s, clave, u)) c.saltar(j.w * (0.3 + Math.random() * 0.4), j.h * 0.42, 1100)
  if (tonel && u > 0.35 && u < 0.44) c.tonel(Math.random() < 0.5 ? 1 : -1)
  if (u < 0.72) {
    const q = u / 0.72
    c.ir(j.w / 2 + (j.jugador.x - j.w / 2) * 0.45, j.h * 0.4, 80 + 1000 * (1 - q) ** 1.6, 7)
  } else {
    const q = (u - 0.72) / 0.28
    c.ir(c.meta[0], j.h * 0.4 - j.h * 1.5 * q * q, 80 - 30 * q, 7)
  }
  return u
}

// Un punto de un círculo a `alto` m por encima de la cámara, de `radio` m,
// centrado delante de ella (para la cámara que mira hacia arriba).
export const enCirculo = (ang, radio = 60, alto = 140) => [70 + radio * Math.cos(ang), alto, -26 + radio * Math.sin(ang)]
