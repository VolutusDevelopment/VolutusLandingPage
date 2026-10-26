// Pixel con volumen desde cualquier ángulo: cada figura es un modelo 3D de
// elipsoides y mallas; se lanza un rayo por celda (cámara ortográfica), se
// sombrea por tonos según la normal y se contornea con el tono más oscuro.

const sum = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const res = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const esc = (a, k) => [a[0] * k, a[1] * k, a[2] * k]
const pto = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const uni = (a) => esc(a, 1 / Math.hypot(...a))

const rad = (g) => (g * Math.PI) / 180
const rotX = (g) => [[1, 0, 0], [0, Math.cos(rad(g)), -Math.sin(rad(g))], [0, Math.sin(rad(g)), Math.cos(rad(g))]]
const rotY = (g) => [[Math.cos(rad(g)), 0, Math.sin(rad(g))], [0, 1, 0], [-Math.sin(rad(g)), 0, Math.cos(rad(g))]]
const rotZ = (g) => [[Math.cos(rad(g)), -Math.sin(rad(g)), 0], [Math.sin(rad(g)), Math.cos(rad(g)), 0], [0, 0, 1]]
const mm = (A, B) => A.map((f) => [0, 1, 2].map((j) => f[0] * B[0][j] + f[1] * B[1][j] + f[2] * B[2][j]))
const mv = (M, v) => M.map((f) => pto(f, v))
const tr = (M) => [0, 1, 2].map((j) => [M[0][j], M[1][j], M[2][j]])
export const rotacion = ([x = 0, y = 0, z = 0] = []) => mm(rotY(y), mm(rotZ(z), rotX(x)))

// Gira un grupo de formas en torno a `pivote` y lo desplaza, pintura y hueco incluidos.
export const transformar = (rot, pivote = [0, 0, 0], mas = [0, 0, 0]) => {
  const R = rotacion(rot)
  const Rt = tr(R)
  const ida = (p) => sum(sum(mv(R, res(p, pivote)), pivote), mas)
  const vuelta = (p) => sum(mv(Rt, res(res(p, mas), pivote)), pivote)
  const formas = (lista) =>
    lista.map((f) => {
      const g =
        f.k === 'e'
          ? { ...f, c: ida(f.c), M: mm(R, f.M) }
          : {
              ...f,
              centro: ida(f.centro),
              tris: f.tris.map((t) => ({ a: ida(t.a), b: ida(t.b), c: ida(t.c), ...(t.na ? { na: mv(R, t.na), nb: mv(R, t.nb), nc: mv(R, t.nc) } : {}) })),
            }
      if (f.pinta) g.pinta = (p, n) => f.pinta(vuelta(p), mv(Rt, n))
      if (f.hueco) g.hueco = (p) => f.hueco(vuelta(p))
      return g
    })
  return { formas, punto: ida }
}

// ── Primitivas ───────────────────────────────────────────────────────────

// Elipsoide. o.rot = [x, y, z] en grados; o.flat = color plano; o.vidrio deja
// ver lo que hay detrás; o.pinta(p) devuelve una rampa, un color o null.
export const el = (c, r, rampa, o = {}) => ({ k: 'e', c, r, M: rotacion(o.rot), rampa, ...o })

const malla = (tris, rampa, o) => {
  const vs = tris.flatMap((t) => [t.a, t.b, t.c])
  const c = esc(vs.reduce(sum, [0, 0, 0]), 1 / vs.length)
  return { k: 'm', tris, rampa, centro: c, radio: Math.max(...vs.map((v) => Math.hypot(...res(v, c)))), ...o }
}

// Placa: polígono convexo en 3D con grosor (alas, colas).
export const placa = (pts, grosor, rampa, o = {}) => {
  const n = uni(cruz(res(pts[1], pts[0]), res(pts[2], pts[0])))
  const arriba = pts.map((p) => sum(p, esc(n, grosor / 2)))
  const abajo = pts.map((p) => sum(p, esc(n, -grosor / 2)))
  const tris = []
  for (let i = 1; i < pts.length - 1; i++) {
    tris.push({ a: arriba[0], b: arriba[i], c: arriba[i + 1] })
    tris.push({ a: abajo[0], b: abajo[i + 1], c: abajo[i] })
  }
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length
    tris.push({ a: arriba[i], b: abajo[i], c: abajo[j] })
    tris.push({ a: arriba[i], b: abajo[j], c: arriba[j] })
  }
  return malla(tris, rampa, o)
}

// Fuselaje: secciones [x, ancho, alto, y, exponente, z] unidas en un tubo
// de normales suaves. Exponente 2 = elipse; menos de 2 = con aristas (F-35).
export const tubo = (secciones, rampa, o = {}) => {
  const K = 24
  const anillos = secciones.map(([x, w, h, y, e = 2, z = 0]) =>
    Array.from({ length: K }, (_, k) => {
      const a = (k / K) * Math.PI * 2
      const s = (v) => Math.sign(v) * Math.abs(v) ** (2 / e)
      return [x, y + (h / 2) * s(Math.sin(a)), z + (w / 2) * s(Math.cos(a))]
    }),
  )
  const normales = anillos.map((anillo, i) =>
    anillo.map((p, k) => {
      const a = anillos[Math.max(0, i - 1)][k]
      const b = anillos[Math.min(anillos.length - 1, i + 1)][k]
      const l = anillo[(k + 1) % K]
      const r = anillo[(k + K - 1) % K]
      return uni(cruz(res(l, r), res(b, a)))
    }),
  )
  const tris = []
  for (let i = 0; i < anillos.length - 1; i++)
    for (let k = 0; k < K; k++) {
      const j = (k + 1) % K
      const [p, q, r, s] = [anillos[i][k], anillos[i][j], anillos[i + 1][j], anillos[i + 1][k]]
      const [np, nq, nr, ns] = [normales[i][k], normales[i][j], normales[i + 1][j], normales[i + 1][k]]
      tris.push({ a: p, b: q, c: r, na: np, nb: nq, nc: nr }, { a: p, b: r, c: s, na: np, nb: nr, nc: ns })
    }
  for (const i of [0, anillos.length - 1]) {
    const c = esc(anillos[i].reduce(sum, [0, 0, 0]), 1 / K)
    for (let k = 0; k < K; k++) tris.push({ a: c, b: anillos[i][k], c: anillos[i][(k + 1) % K] })
  }
  return malla(tris, rampa, o)
}

// ── Intersección ─────────────────────────────────────────────────────────

const cortaElipsoide = (f, o, d) => {
  const Mt = tr(f.M)
  const lo = mv(Mt, res(o, f.c)).map((v, i) => v / f.r[i])
  const ld = mv(Mt, d).map((v, i) => v / f.r[i])
  const a = pto(ld, ld)
  const b = 2 * pto(lo, ld)
  const c = pto(lo, lo) - 1
  const disc = b * b - 4 * a * c
  if (disc < 0) return null
  const t = (-b - Math.sqrt(disc)) / (2 * a)
  if (t < 0) return null
  const h = sum(lo, esc(ld, t))
  return { t, n: uni(mv(f.M, h.map((v, i) => v / f.r[i]))) }
}

const cortaMalla = (f, o, d) => {
  const oc = res(o, f.centro)
  const b = pto(oc, d)
  if (b * b - (pto(oc, oc) - f.radio * f.radio) < 0) return null
  let mejor = null
  for (const tri of f.tris) {
    const e1 = res(tri.b, tri.a)
    const e2 = res(tri.c, tri.a)
    const p = cruz(d, e2)
    const det = pto(e1, p)
    if (Math.abs(det) < 1e-9) continue
    const s = res(o, tri.a)
    const u = pto(s, p) / det
    if (u < 0 || u > 1) continue
    const q = cruz(s, e1)
    const v = pto(d, q) / det
    if (v < 0 || u + v > 1) continue
    const t = pto(e2, q) / det
    if (t <= 0 || (mejor && t >= mejor.t)) continue
    if (f.hueco?.(sum(o, esc(d, t)))) continue
    const n = tri.na ? uni(sum(sum(esc(tri.na, 1 - u - v), esc(tri.nb, u)), esc(tri.nc, v))) : uni(cruz(e1, e2))
    mejor = { t, n: pto(n, d) > 0 ? esc(n, -1) : n }
  }
  return mejor
}

const corta = (f, o, d) => (f.k === 'e' ? cortaElipsoide(f, o, d) : cortaMalla(f, o, d))

// ── Cámara y pintura ─────────────────────────────────────────────────────

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mezcla = (a, b, k) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * k).toString(16).padStart(2, '0')).join('')
const LUZ = uni([-0.5, 0.7, 0.55])
const tono = (d) => (d > 0.8 ? 0 : d > 0.3 ? 1 : d > -0.15 ? 2 : 3)

// Centro y radio de la figura, para que todas sus tomas tengan la misma escala.
// conEstela incluye las estelas en el encuadre; si no, quedan fuera y se cortan.
export function marco(figura, conEstela = false) {
  const pts = figura.filter((f) => conEstela || !f.luz).flatMap((f) => (f.k === 'e' ? [sum(f.c, [Math.max(...f.r), 0, 0]), res(f.c, [Math.max(...f.r), 0, 0]), sum(f.c, [0, Math.max(...f.r), 0]), res(f.c, [0, Math.max(...f.r), 0]), sum(f.c, [0, 0, Math.max(...f.r)]), res(f.c, [0, 0, Math.max(...f.r)])] : f.tris.flatMap((t) => [t.a, t.b, t.c])))
  const min = [0, 1, 2].map((i) => Math.min(...pts.map((p) => p[i])))
  const max = [0, 1, 2].map((i) => Math.max(...pts.map((p) => p[i])))
  const c = esc(sum(min, max), 0.5)
  return { c, radio: Math.max(...pts.map((p) => Math.hypot(...res(p, c)))) }
}

// toma = { giro, altura, alabeo, cabeceo }: giro alrededor de la figura (0 = de
// frente, -90 = su costado izquierdo), altura de la cámara (negativa = desde
// abajo), alabeo y cabeceo del propio modelo (un caza virando o picando).
export function pixel3d(figura, toma, n, tam, encuadre = marco(figura), llenado = 0.94) {
  const { giro = 0, altura = 0, alabeo = 0, cabeceo = 0 } = toma
  const M = mm(rotX(alabeo), rotZ(cabeceo))
  const Mt = tr(M)
  // toma.ojo y toma.mira: cámara en perspectiva puesta en ese punto, con
  // toma.campo grados de ángulo. Sin ojo, la cámara es ortográfica.
  const { ojo, mira, campo = 80 } = toma
  const dir = ojo ? uni(res(ojo, mira)) : [Math.cos(rad(altura)) * Math.cos(rad(giro)), Math.sin(rad(altura)), Math.cos(rad(altura)) * Math.sin(rad(giro))]
  const f = esc(dir, -1)
  const abre = Math.tan(rad(campo) / 2)
  const derecha = Math.abs(dir[1]) > 0.999 ? [0, 0, -1] : uni(cruz(f, [0, 1, 0]))
  const arriba = cruz(derecha, f)
  const paso = (2 * encuadre.radio) / (n * llenado)
  // toma.por: punto por el que pasa la cámara. Lo que quede entre ella y la figura se corta (la pared de una cabina, el tablero).
  // toma.cielo(rayo): el color de lo que no choca con nada; sin él, queda vacío.
  const distancia = toma.por ? pto(res(toma.por, encuadre.c), dir) : encuadre.radio * 4
  const celdas = []
  for (let j = 0; j < n; j++) {
    const fila = []
    for (let i = 0; i < n; i++) {
      const sx = (i + 0.5 - n / 2) * paso
      const sy = (n / 2 - j - 0.5) * paso
      const origenMundo = ojo ?? sum(sum(sum(encuadre.c, esc(dir, distancia)), esc(derecha, sx)), esc(arriba, sy))
      const o = sum(mv(Mt, res(origenMundo, encuadre.c)), encuadre.c)
      const rayo = ojo ? uni(sum(f, sum(esc(derecha, ((i + 0.5 - n / 2) / (n / 2)) * abre), esc(arriba, ((n / 2 - j - 0.5) / (n / 2)) * abre)))) : f
      const d = mv(Mt, rayo)
      const golpes = []
      for (const fig of figura) {
        const g = corta(fig, o, d)
        if (g) golpes.push({ ...g, fig })
      }
      golpes.sort((a, b) => a.t - b.t)
      const color = (g) => {
        const p = sum(o, esc(d, g.t))
        const pintado = g.fig.pinta?.(p, g.n)
        const nc = mv(M, g.n)
        const nCam = [pto(nc, derecha), pto(nc, arriba), pto(nc, dir)]
        const rampa = Array.isArray(pintado) ? pintado : g.fig.rampa
        const plano = typeof pintado === 'string' ? pintado : g.fig.flat
        return { plano, rampa, tono: tono(pto(nCam, LUZ)) }
      }
      // Las estelas (fig.luz) son translúcidas: se ve la de mayor nivel que
      // quede delante de lo sólido, mezclada con lo que hay detrás.
      const primero = golpes.find((g) => !g.fig.luz)
      let celda = null
      if (primero) {
        let c = color(primero)
        if (primero.fig.vidrio) {
          const atras = golpes.find((g) => !g.fig.vidrio && !g.fig.luz)
          const vidrio = primero.fig.rampa[c.tono]
          const fondo = atras ? color(atras) : null
          c = { plano: fondo ? mezcla(fondo.plano ?? fondo.rampa[fondo.tono], vidrio, 0.5) : vidrio, rampa: primero.fig.rampa, tono: c.tono }
        }
        celda = { ...c, t: primero.t, brilla: primero.fig.brilla }
      }
      const luces = golpes.filter((g) => g.fig.luz && (!primero || g.t < primero.t))
      if (luces.length) {
        const { luz } = luces.reduce((a, b) => (b.fig.luz.nivel > a.fig.luz.nivel ? b : a)).fig
        celda = celda
          ? { plano: mezcla(celda.plano ?? celda.rampa[celda.tono], luz.color, luz.alfa), t: celda.t }
          : { plano: luz.color, alfa: luz.alfa, t: luces[0].t, estela: true }
      }
      fila.push(celda ?? (toma.cielo ? { plano: toma.cielo(rayo), t: Infinity } : null))
    }
    celdas.push(fila)
  }
  const salto = encuadre.radio * 0.05
  const vacia = (i, j, t) => {
    if (i < 0 || j < 0 || i >= n || j >= n) return true
    const v = celdas[j][i]
    return !v || v.estela || (ojo ? v.t > t * 1.12 + 0.02 : v.t > t + salto)
  }
  const colores = celdas.map((fila, j) =>
    fila.map((v, i) => {
      if (!v) return null
      const borde = [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]].some(([a, b]) => vacia(a, b, v.t))
      if (v.estela) return `${v.plano}|${v.alfa}`
      if (v.plano) return v.plano
      return v.rampa[borde && !v.brilla ? 3 : v.tono]
    }),
  )
  return svgCeldas(colores, tam)
}

export function svgCeldas(celdas, tam) {
  const porColor = new Map()
  for (const [y, fila] of celdas.entries()) {
    let x = 0
    while (x < fila.length) {
      const c = fila[x]
      let fin = x + 1
      while (fin < fila.length && fila[fin] === c) fin++
      if (c) porColor.set(c, (porColor.get(c) ?? '') + `M${x} ${y}h${fin - x}v1h-${fin - x}z`)
      x = fin
    }
  }
  const alto = celdas.length
  const ancho = celdas[0].length
  return `<svg style="display: block" width="${ancho * tam}" height="${alto * tam}" viewBox="0 0 ${ancho} ${alto}" shape-rendering="crispEdges" aria-hidden="true">${[...porColor]
    .map(([c, d]) => {
      const [color, alfa] = c.split('|')
      return `<path fill="${color}"${alfa ? ` fill-opacity="${alfa}"` : ''} d="${d}"></path>`
    })
    .join('')}</svg>`
}
