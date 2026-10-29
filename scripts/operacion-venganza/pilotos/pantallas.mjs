// Lo que muestran las pantallas del F-22 de duky (interiores.mjs), como las
// del real. Cada imagen recibe (u, v) de -1 a 1, con v hacia arriba, y
// devuelve un color.

const NEGRO = '#06090e'
const BISEL = '#1c2026'
const BOTON = '#aab2bc'
const CIAN = '#46c8ff'
const AZUL = '#2f6fd8'
const VERDE = '#4dff88'
const AMBAR = '#ffc23a'
const ROJO = '#ff4a3a'
const BLANCO = '#eef4ff'
const FONDO = '#081626'

// El bisel, con su fila de `botones` en cada lado; adentro, la imagen.
export const pantalla = (imagen, botones = 5) => (u, v) => {
  const [au, av] = [Math.abs(u), Math.abs(v)]
  if (au > 0.97 || av > 0.97) return BISEL
  if (au <= 0.84 && av <= 0.84) return imagen(u / 0.84, v / 0.84)
  const t = au > 0.84 && av < 0.72 ? v : av > 0.84 && au < 0.72 ? u : null
  if (t === null || Math.max(au, av) < 0.87 || Math.max(au, av) > 0.95) return BISEL
  const k = (((t + 0.72) / 1.44) * botones) % 1
  return k > 0.25 && k < 0.75 ? BOTON : BISEL
}

// Un renglón de letras chicas: palotes cortos desde u0, a la altura v0.
const texto = (u, v, u0, v0, largo, color) => (Math.abs(v - v0) < 0.035 && u > u0 && u < u0 + largo && (u * 14) % 1 < 0.6 ? color : null)
const enAnillo = (r, radio, grueso) => Math.abs(r - radio) < grueso

// La PMFD: la situación táctica. Anillos de distancia con la rosa de rumbos,
// el caza propio al centro abajo, un amigo en verde, el enemigo en rojo y uno
// sin identificar en ámbar.
export const tactica = (u, v) => {
  const [cu, cv] = [u, v + 0.35]
  const r = Math.hypot(cu, cv)
  const a = Math.atan2(cu, cv)
  if (Math.abs(cu) < 0.06 - cv * 0.3 && cv > -0.08 && cv < 0.1) return BLANCO
  if (Math.abs(cv) < 0.025 && Math.abs(cu) < 0.11) return BLANCO
  if (enAnillo(Math.hypot(u + 0.42, v - 0.38), 0.07, 0.02)) return VERDE
  if (v - 0.5 > -0.07 && v - 0.5 < 0.08 && Math.abs(u - 0.3) < (0.58 - v) * 0.75) return ROJO
  if (Math.max(Math.abs(u - 0.55), Math.abs(v - 0.05)) < 0.06 && Math.max(Math.abs(u - 0.55), Math.abs(v - 0.05)) > 0.035) return AMBAR
  if (enAnillo(r, 1.1, 0.025) && cv > 0) return Math.round(a * 12) % 2 === 0 ? CIAN : FONDO
  if (enAnillo(r, 0.55, 0.02) && cv > 0 && (a * 10) % 1 < 0.6) return AZUL
  if (r > 1.05 && r < 1.2 && cv > 0 && Math.abs(((a / Math.PI) * 18) % 1) < 0.15) return CIAN
  if (Math.abs(cu) < 0.012 && cv > 0.1 && cv < 1.0) return '#1e4a7a'
  return texto(u, v, -0.95, 0.92, 0.45, BLANCO) ?? texto(u, v, 0.5, 0.92, 0.45, BLANCO) ?? texto(u, v, -0.95, -0.92, 0.35, CIAN) ?? FONDO
}

// La SMFD izquierda: el anillo de actitud con la vertical de rumbo.
export const actitud = (u, v) => {
  const r = Math.hypot(u, v)
  if (enAnillo(r, 0.72, 0.035) || (Math.abs(u) < 0.025 && r < 0.72)) return AZUL
  if (Math.abs(v) < 0.025 && Math.abs(u) < 0.2) return VERDE
  if (r > 0.72 && r < 0.86 && Math.abs(((Math.atan2(u, v) / Math.PI) * 12) % 1) < 0.12) return AZUL
  return texto(u, v, -0.95, 0.9, 0.5, VERDE) ?? texto(u, v, -0.95, -0.9, 0.7, VERDE) ?? NEGRO
}

// La SMFD derecha: el radar, un anillo con el sector que barre y dos ecos.
export const radar = (u, v) => {
  const [cu, cv] = [u, v + 0.1]
  const r = Math.hypot(cu, cv)
  if (enAnillo(r, 0.75, 0.03)) return AZUL
  if ((Math.abs(cu) < 0.025 && Math.abs(cv) < 0.12) || (Math.abs(cv) < 0.025 && Math.abs(cu) < 0.12)) return VERDE
  if (r < 0.75 && Math.abs(Math.abs(Math.atan2(cu, cv)) - 0.75) < 0.04) return CIAN
  if (Math.hypot(u + 0.2, v - 0.35) < 0.05 || Math.hypot(u - 0.25, v - 0.25) < 0.05) return VERDE
  return texto(u, v, 0.3, 0.9, 0.6, VERDE) ?? texto(u, v, -0.95, -0.9, 0.5, CIAN) ?? NEGRO
}

// La SMFD de abajo: las armas. El F-22 visto desde arriba en cian, en
// metros del caza ([x, z]), con las bodegas cargadas: cada misil, un
// rectángulo blanco.
const PLANTA = [[9.45, 0], [6.5, 0.85], [4.6, 1.9], [1.9, 2.2], [-3.4, 6.8], [-4.3, 6.8], [-6.0, 2.9], [-7.6, 4.5], [-8.9, 4.5], [-9.5, 2.9], [-8.0, 1.2]]
const CONTORNO = [...PLANTA, ...PLANTA.slice(1).reverse().map(([x, z]) => [x, -z])]
const enLaPlanta = (x, z) => {
  let dentro = false
  for (let i = 0, j = CONTORNO.length - 1; i < CONTORNO.length; j = i++) {
    const [[xi, zi], [xj, zj]] = [CONTORNO[i], CONTORNO[j]]
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) dentro = !dentro
  }
  return dentro
}
export const armas = (u, v) => {
  const [x, z] = [v * 10.5, u * 10.5]
  if (enLaPlanta(x, z)) {
    const bodega = Math.abs(z) < 0.9 && x > -2.6 && x < 2.2 && Math.abs((((z + 0.9) / 0.6) % 1) - 0.5) < 0.3 && (x + 2.6) % 1.6 < 1.3
    const costado = Math.abs(Math.abs(z) - 1.45) < 0.22 && x > 0 && x < 2.4
    return bodega || costado ? BLANCO : '#0c2a3c'
  }
  if ([[0.18, 0], [-0.18, 0], [0, 0.18], [0, -0.18]].some(([dx, dz]) => enLaPlanta(x + dx, z + dz))) return CIAN
  return texto(u, v, -0.95, 0.9, 0.5, VERDE) ?? texto(u, v, 0.45, -0.9, 0.5, VERDE) ?? NEGRO
}

// Las UFD: negras, con renglones verdes.
export const ufd = (u, v) =>
  [0.9, 0.6, 1.2, 0.8, 0.5].reduce((color, largo, i) => color ?? texto(u, v, -0.85, 0.7 - i * 0.35, largo, VERDE), null) ?? NEGRO

// El ICP: el teclado de seis por tres, con su renglón de datos arriba.
export const icp = (u, v) => {
  const [cu, cv] = [((u + 1) / 2) * 6, ((v + 1) / 2) * 4]
  if (cv > 3.15) return Math.abs(u) < 0.7 && cv < 3.85 ? (texto(u, v, -0.6, 0.79, 1.2, VERDE) ?? NEGRO) : BISEL
  const [fu, fv] = [cu % 1, cv % 1]
  if (fu < 0.14 || fu > 0.86 || fv < 0.16 || fv > 0.84) return BISEL
  return fu > 0.35 && fu < 0.65 && Math.abs(fv - 0.5) < 0.07 ? '#30363e' : '#c2c8d0'
}
