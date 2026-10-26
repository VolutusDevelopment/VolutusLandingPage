// Los cuatro pilotos vistos desde dentro de la cabina de su caza: el piloto
// sentado con su tablero y sus mandos, a escala dentro del modelo real del
// caza, que tiene abierta la cabina bajo la cúpula. Las cámaras van dentro,
// en perspectiva, como la cámara de cabina de Top Gun: detrás se ven el lomo,
// las alas, el mar y el resto del escuadrón en formación.
//
//   node scripts/pilotos/cabinas.mjs <carpeta> <hoja.html>
//
// Escribe <carpeta>/project/V15-<piloto>-cabina.dc.html. Con PRUEBA=1 solo
// arma la hoja, con un cuadro por toma.

import { el, placa, tubo, pixel3d } from './tres.mjs'
import * as M from './modelos.mjs'
import { RAMPAS as C, hueso, disco, ambos } from './modelos.mjs'
import { PERSONAJES, cabina } from './cuerpos.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'

const [RAIZ, HOJA] = process.argv.slice(2)
const N = 72
const TAM = Number(process.env.TAM ?? 3)
const CUADROS_QUIETO = 8
const CUADROS_GESTO = 12

const sum = (a, b) => a.map((v, i) => v + b[i])
const esc = (a, k) => a.map((v) => v * k)
const uni = (a) => esc(a, 1 / Math.hypot(...a))

// ── Medidas comunes (unidades del piloto) ────────────────────────────────

const BASE = -1.3 // tapa de las consolas y arranque de la cúpula
const PALANCA = [1.15, -0.55, 0.1]
const ACELERADOR = [0.1, -0.5, -1.6]
const PANEL = { abajo: [1.6, -1.8], arriba: [2.0, -1.05] }
const TANGENTE = uni([PANEL.arriba[0] - PANEL.abajo[0], PANEL.arriba[1] - PANEL.abajo[1]])
const NORMAL = [-TANGENTE[1], TANGENTE[0], 0]

const caja = (x0, x1, ancho, alto, yc, zc, rampa, o) => tubo([[x0, ancho, alto, yc, 8, zc], [x1, ancho, alto, yc, 8, zc]], rampa, o)
const enPanel = (s, z) => [PANEL.abajo[0] + (PANEL.arriba[0] - PANEL.abajo[0]) * s, PANEL.abajo[1] + (PANEL.arriba[1] - PANEL.abajo[1]) * s, z]

// Panel inclinado hacia el piloto; pinta(s, z) da el color: s va de 0 (abajo) a 1 (arriba).
const panelInclinado = (z0, z1, pinta) =>
  placa([[PANEL.abajo[0], PANEL.abajo[1], z0], [PANEL.abajo[0], PANEL.abajo[1], z1], [PANEL.arriba[0], PANEL.arriba[1], z1], [PANEL.arriba[0], PANEL.arriba[1], z0]], 0.05, C.oscuro, { pinta: ([, y, z]) => pinta((y - PANEL.abajo[1]) / (PANEL.arriba[1] - PANEL.abajo[1]), z) })

// Reloj redondo con su aguja, apoyado en el panel.
const reloj = (s, z, r, ang) => {
  const c = sum(enPanel(s, z), esc(NORMAL, 0.04))
  return disco(c, NORMAL, r, 0.03, C.nube, {
    pinta: (p) => {
      const u = p[2] - c[2]
      const w = (p[0] - c[0]) * TANGENTE[0] + (p[1] - c[1]) * TANGENTE[1]
      if (Math.hypot(u, w) > r * 0.88) return '#16181c'
      const a = u * Math.cos(ang) + w * Math.sin(ang)
      const b = Math.abs(-u * Math.sin(ang) + w * Math.cos(ang))
      return a > -0.02 && a < r * 0.8 && b < 0.025 ? '#d8282c' : '#f4f4ec'
    },
  })
}

// Pantallas de un tablero moderno: bordes oscuros, divisiones y un horizonte artificial al medio.
const pantallas = (z0, z1, { borde, fondo, linea, columnas }) => (s, z) => {
  const u = (z - z0) / (z1 - z0)
  const k = Math.min(columnas - 1, Math.floor(u * columnas))
  const uu = u * columnas - k
  if (u < 0 || u > 1 || s < 0.06 || s > 0.94 || uu < 0.03 || uu > 0.97) return borde
  if (columnas === 3 && k === 1) return s > 0.5 ? (Math.abs(s - 0.5) < 0.03 ? '#ffffff' : '#3d7be0') : '#7a5428'
  return Math.floor(s * 9) % 2 === 0 ? fondo : Math.floor(uu * 9) % 3 === 0 ? linea : '#14281f'
}

const mira = (c, n, r, marco, cristal) => [disco(c, n, r + 0.05, 0.03, marco), disco(sum(c, esc(n, 0.05)), n, r, 0.02, cristal)]

// ── Piezas comunes de cabina ─────────────────────────────────────────────

const asiento = (x, rampa) => [
  placa([[x, -2.3, -0.9], [x, -2.3, 0.9], [x, 0.5, 0.7], [x, 0.5, -0.7]], 0.3, rampa),
  el([x + 0.05, 0.95, 0], [0.22, 0.5, 0.55], rampa),
  placa([[x, -1.8, -0.85], [x + 1.9, -1.8, -0.85], [x + 1.9, -1.8, 0.85], [x, -1.8, 0.85]], 0.25, rampa),
  el([0.85, -1.7, 0], [0.06, 0.12, 0.25], C.rayas),
]

const piernas = (cadera, rampa) =>
  ambos((s) => [
    hueso([0.05, cadera, s * 0.42], [0.95, cadera - 0.05, s * 0.45], 0.1, rampa, { brilla: true }),
    hueso([0.95, cadera - 0.05, s * 0.45], [1.25, -2.4, s * 0.45], 0.09, rampa, { brilla: true }),
    el([1.4, -2.55, s * 0.45], [0.3, 0.07, 0.2], rampa, { brilla: true }),
  ]).flat()

// Mandos que se mueven con la mano: la palanca al centro y el acelerador a la izquierda.
const mandos = (palanca, acelerador) => [
  hueso([1.15, -1.5, 0.05], palanca, 0.06, C.oscuro),
  el(palanca, [0.1, 0.1, 0.1], C.oscuro),
  el(sum(palanca, [0.07, 0.03, 0.04]), [0.03, 0.03, 0.03], C.boca, { flat: '#d8282c' }),
  hueso([0.45, BASE, -1.72], acelerador, 0.05, C.oscuro),
  el(acelerador, [0.09, 0.09, 0.09], C.oscuro),
]

// ── Las cuatro cabinas ───────────────────────────────────────────────────

const CABINAS = {
  'duck-one': {
    caza: M.CAZA_DUCK_ONE, cabeza: [5.0, 0.95], cabezaU: [0.15, 0.6], k: 0.28, alto: 1.1, arcos: [6.0], frente: 1.58,
    ancho: 2.4, marco: C.oscuro,
    consola: C.grisOscuro, tablero: C.grisOscuro, asiento: C.asiento, xAsiento: -1.05, pata: C.naranja, cadera: -1.45,
    panel: [-1.3, 1.3, { borde: '#0a0e14', fondo: '#1f4b3a', linea: '#7dffa0', columnas: 3 }],
    // Dos retrovisores en el arco delantero y una medalla colgando de él.
    delante: () => [
      ...ambos((s) => mira([3.7, 1.15, s * 0.75], uni([-0.9, -0.3, -s * 0.2]), 0.2, C.oscuro, C.vidrio)).flat(),
      hueso([3.7, 1.4, 0.3], [3.7, 0.9, 0.3], 0.02, C.blanco),
      el([3.7, 0.8, 0.3], [0.12, 0.12, 0.04], C.oro),
    ],
  },
  duke: {
    caza: M.CAZA_DUKE, cabeza: [5.0, 0.95], cabezaU: [0.15, 0.6], k: 0.28, alto: 1.1, arcos: [6.0], frente: 1.58,
    ancho: 2.4, marco: C.oro,
    consola: C.rosa, tablero: C.perla, asiento: C.rosa, xAsiento: -1.05, pata: C.pico, cadera: -1.45,
    panel: [-1.3, 1.3, { borde: '#7a2848', fondo: '#d8629a', linea: '#fff0f6', columnas: 3 }],
    // Un espejo de belleza con bombillas, de lado sobre el tablero, para mirarse.
    delante: () => [
      ...mira([3.7, 0.85, 0.75], uni([-1, -0.2, -0.35]), 0.36, C.oro, C.vidrio),
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => el([3.67, 0.85 + 0.44 * Math.sin((i / 8) * Math.PI * 2), 0.75 + 0.44 * Math.cos((i / 8) * Math.PI * 2)], [0.035, 0.035, 0.035], C.blanco, { flat: '#fff8d0', brilla: true })),
    ],
  },
  'moby-duck': {
    caza: M.CAZA_MOBY, cabeza: [4.9, 0.95], cabecita: [5.2, 0.95], izquierda: [0.3, 0.95, -1.5], cabezaU: [0.25, 0.5], k: 0.25, alto: 1.1, arcos: [5.6, 4.1], frente: 1.9,
    ancho: 2.8, marco: C.negro,
    consola: C.negro, tablero: C.negro, asiento: C.negro, xAsiento: -1.05, pata: C.naranja, cadera: -1.55,
    panel: [-1.9, 1.9, { borde: '#0a0a0c', fondo: '#26262c', linea: '#d8282c', columnas: 2 }],
    // Relojes de aguja y un cenicero con colillas. Su cámara izquierda va más atrás: el humo del puro sale por ese lado.
    delante: () => [
      ...[-1.55, -1.05, -0.55].flatMap((z, i) => [reloj(0.28, z, 0.2, 0.6 + i), reloj(0.72, z, 0.2, 2 + i)]),
      ...[0.55, 1.05, 1.55].flatMap((z, i) => [reloj(0.28, z, 0.2, 1.2 + i), reloj(0.72, z, 0.2, 3.4 + i)]),
      el([2.1, -0.95, -1.5], [0.28, 0.05, 0.22], C.negro),
      hueso([2.0, -0.9, -1.55], [2.2, -0.85, -1.4], 0.04, C.puro),
      hueso([2.15, -0.9, -1.35], [2.0, -0.85, -1.5], 0.04, C.puro),
      el([2.1, -0.82, -1.45], [0.06, 0.06, 0.06], C.naranja, { flat: '#ff7a2a', brilla: true }),
    ],
  },
  duky: {
    caza: M.CAZA_DUKY, cabeza: [4.3, 0.8], cabezaU: [0.35, 0.2], k: 0.28, alto: 0.88, arcos: [5.3], frente: 1.55,
    ancho: 2.4, marco: C.oscuro,
    consola: C.oscuro, tablero: C.oscuro, asiento: null, xAsiento: -1.35, pata: C.naranja, cadera: -1.8,
    panel: [-1.35, 1.35, { borde: '#0a0e14', fondo: '#1a2a4a', linea: '#f8cc1c', columnas: 1 }],
    // Una sola pantalla panorámica: el F-35 no lleva visor, lo proyecta el casco.
    delante: () => [],
  },
}

// Interior de la cabina, en unidades del piloto: consolas, tablero, asiento y piernas.
const interior = (cfg) => {
  const a = cfg.ancho
  const [z0, z1, estilo] = cfg.panel
  return [
    ...ambos((s) => caja(-1.0, 1.9, 0.45, BASE + 2.7, (BASE - 2.7) / 2, s * (a - 0.23), cfg.consola)),
    caja(1.6, 3.0, 2 * (a - 0.46), 1.2, -2.4, 0, cfg.tablero),
    caja(2.0, 3.0, 2 * (a - 0.46), 0.8, -1.4, 0, cfg.tablero),
    placa([[2.0, -1.05, -a + 0.46], [3.0, -1.0, -a + 0.46], [3.0, -1.0, a - 0.46], [2.0, -1.05, a - 0.46]], 0.1, cfg.tablero),
    panelInclinado(z0, z1, pantallas(z0, z1, estilo)),
    ...(cfg.asiento ? asiento(cfg.xAsiento, cfg.asiento) : []),
    ...piernas(cfg.cadera, cfg.pata),
    ...cfg.delante(),
  ]
}

// Del piloto en unidades a metros del caza: escala k y origen en la cabina.
const origen = (cfg) => [cfg.cabeza[0] - cfg.cabezaU[0] * cfg.k, cfg.alto - cfg.cabezaU[1] * cfg.k, 0]
const aCaza = (cfg, p) => sum(origen(cfg), esc(p, cfg.k))
const escalar = (cfg, formas) => {
  const o = origen(cfg)
  const ida = (p) => aCaza(cfg, p)
  const vuelta = (p) => esc(p.map((v, i) => v - o[i]), 1 / cfg.k)
  return formas.map((f) => {
    const g =
      f.k === 'e'
        ? { ...f, c: ida(f.c), r: esc(f.r, cfg.k) }
        : { ...f, centro: ida(f.centro), radio: f.radio * cfg.k, tris: f.tris.map((tri) => ({ ...tri, a: ida(tri.a), b: ida(tri.b), c: ida(tri.c) })) }
    if (f.pinta) g.pinta = (p, n) => f.pinta(vuelta(p), n)
    return g
  })
}

// El caza sin la cabecita de piloto que traía (cabecita, si no está donde va el piloto), con los arcos de su cúpula.
const avion = (cfg) => {
  const cupula = cfg.caza.find((f) => f.vidrio)
  const [hx, hy] = cfg.cabecita ?? cfg.cabeza
  const arcoDe = (x) => {
    const s = Math.sqrt(Math.max(0, 1 - ((x - cupula.c[0]) / cupula.r[0]) ** 2))
    const p = (t) => [x, cupula.c[1] + cupula.r[1] * s * Math.sin(t), cupula.r[2] * s * Math.cos(t)]
    return Array.from({ length: 12 }, (_, i) => hueso(p((i * Math.PI) / 12), p(((i + 1) * Math.PI) / 12), 0.035, cfg.marco))
  }
  // La cabina es una abertura en el fuselaje, del tamaño de la cúpula vista desde arriba.
  const hueco = ([x, y, z]) => y > cupula.c[1] - 0.25 && ((x - cupula.c[0]) / cupula.r[0]) ** 2 + (z / cupula.r[2]) ** 2 < 0.92
  const sinCabecita = cfg.caza.filter((f) => f.vidrio || f.k !== 'e' || Math.hypot(f.c[0] - hx, f.c[1] - hy) > 0.5 || Math.abs(f.c[2]) > 0.3)
  return [...sinCabecita.map((f) => (f.k === 'm' && !f.luz ? { ...f, hueco } : f)), ...cfg.arcos.flatMap(arcoDe)]
}

const mover = (formas, d) =>
  formas.map((f) => {
    const g = f.k === 'e' ? { ...f, c: sum(f.c, d) } : { ...f, centro: sum(f.centro, d), tris: f.tris.map((tri) => ({ ...tri, a: sum(tri.a, d), b: sum(tri.b, d), c: sum(tri.c, d) })) }
    if (f.pinta) g.pinta = (p, n) => f.pinta(p.map((v, i) => v - d[i]), n)
    return g
  })

// El mar a 120 m, más claro hacia el horizonte, y unas nubes altas.
const mar = el([0, -4120, 0], [6000, 4000, 6000], C.azul, {
  pinta: ([x, , z]) => {
    const lejos = Math.hypot(x, z)
    const ola = Math.sin(x / 9 + Math.sin(z / 23) * 2) > 0.85
    return lejos > 1400 ? '#8cb0ea' : lejos > 600 ? (ola ? '#86a8e2' : '#5f8ad6') : ola ? '#5c86d0' : '#3a68b8'
  },
})
const nubes = [
  el([-260, 40, -170], [90, 16, 60], C.nube),
  el([-320, 70, 160], [110, 18, 70], C.nube),
  el([-180, 18, 30], [40, 8, 30], C.nube),
  el([280, 50, -120], [100, 16, 60], C.nube),
  el([340, 30, 150], [90, 14, 60], C.nube),
]

// El resto del escuadrón vuela en formación detrás del caza de la cámara.
const FORMACION = [[-30, 4, -22], [-30, 4, 22], [-55, 9, 0]]
const escuadron = (archivo) =>
  Object.keys(CABINAS)
    .filter((a) => a !== archivo)
    .flatMap((a, i) => mover(CABINAS[a].caza, FORMACION[i]))

// ── Escenas y tomas ──────────────────────────────────────────────────────

const toma = (ojo, mira, campo = 80) => ({ ojo, mira, campo })
const tomasDe = (cfg) => {
  const P = (p) => aCaza(cfg, p)
  return [
    ['cámara del tablero', toma(P([3.4, 1.0, 0]), P([0, 0.1, 0]), 85)],
    ['tres cuartos', toma(P([2.8, 0.8, -1.2]), P([0, 0.1, 0.1]))],
    ['desde la izquierda', toma(P(cfg.izquierda ?? [1.6, 0.95, -1.5]), P([-0.3, 0.3, 0.3]), 95)],
    ['desde la derecha', toma(P([1.6, 0.95, 1.5]), P([-0.3, 0.3, -0.3]), 95)],
    ['sobre el hombro', toma(P([cfg.xAsiento + 0.35, 1.3, -0.85]), P([2.5, 0.0, 0.3]), 95)],
    ['desde abajo', toma(P([1.6, -0.9, 0.9]), P([0.1, 0.6, 0]))],
  ]
}
const tomasGesto = (cfg, lado) => [tomasDe(cfg)[0], ['tres cuartos', toma(aCaza(cfg, [2.8, 0.8, lado * 1.2]), aCaza(cfg, [0, 0.1, -lado * 0.1]))]]
const encuadreDe = (cfg) => ({ c: aCaza(cfg, [0.45, 0.1, 0]), radio: 2.2 * cfg.k })

const mono = "font-family: 'Geist Mono', monospace; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase"

const escena = (cfg, pilote, palanca = PALANCA, acelerador = ACELERADOR) => [mar, ...nubes, ...cfg.escuadron, ...cfg.avion, ...escalar(cfg, [...interior(cfg), ...pilote.filter((f) => !f.pata), ...mandos(palanca, acelerador)])]

const animacion = (cuadros, clase, duracion, quieto) =>
  cuadros.map((svg, k) => svg.replace('<svg style="display: block"', `<svg class="f ${clase}${k === quieto ? ' quieto' : ''}" style="position: absolute; left: 0; top: 0; animation-delay: -${(((cuadros.length - k) % cuadros.length) * duracion / cuadros.length).toFixed(3)}s"`)).join('')

const celda = (titulo, cuadros, clase, duracion, quieto) => `<div style="display: flex; flex-direction: column; gap: 8px"><div style="height: 232px; display: flex; align-items: center; justify-content: center; background: #5c94fc; border-radius: 12px"><div style="position: relative; width: ${N * TAM}px; height: ${N * TAM}px">${animacion(cuadros, clase, duracion, quieto)}</div></div><span style="${mono}; color: #47607a">${titulo}</span></div>`

const fila = (titulo, celdas) => `<div style="display: flex; flex-direction: column; gap: 12px">
<h2 style="margin: 0; font-size: 18px; font-weight: 800">${titulo}</h2>
<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px">
${celdas.join('\n')}
</div>
</div>`

const TEXTOS = {
  'duck-one': ['Boeing F-15EX Eagle II, gris tradicional', 'Desde dentro de su F-15EX, con la cámara sobre el tablero: pantalla panorámica, dos retrovisores en el arco del parabrisas, de uno de los cuales cuelga una medalla, y detrás el escuadrón en formación sobre el mar.'],
  'moby-duck': ['Fairchild Republic A-10 Thunderbolt II, negro', 'Desde dentro del A-10, que le queda chico: relojes de aguja, un cenicero con colillas en el tablero y el humo del puro llenando la cúpula. Detrás vuelan los otros tres.'],
  duke: ['Boeing F-15EX Eagle II, perla, oro y rosa', 'Desde dentro de su F-15EX perla: consolas rosa, arco dorado en el parabrisas y un espejo de belleza con bombillas colgado de él, para mirarse en pleno vuelo.'],
  duky: ['Lockheed Martin F-35A Lightning II, negro', 'Desde dentro del F-35, bajo la cúpula dorada: una sola pantalla panorámica y, atado a su asiento eyectable, un pato de hule que no mira nada mientras el escuadrón lo sigue.'],
}

const lamina = (p) => {
  const cfg = { ...CABINAS[p.archivo] }
  cfg.avion = avion(cfg)
  cfg.escuadron = escuadron(p.archivo)
  cfg.encuadre = encuadreDe(cfg)
  const tomas = tomasDe(cfg)
  cabina.reposo = (s) => (s > 0 ? PALANCA : ACELERADOR)
  const quieto = Array.from({ length: CUADROS_QUIETO }, (_, k) => {
    const a = (k / CUADROS_QUIETO) * Math.PI * 2
    const palanca = sum(PALANCA, [0.12 * Math.sin(a), 0, 0.08 * Math.cos(a)])
    const acelerador = sum(ACELERADOR, [0.06 * Math.sin(a + 1), 0.02 * Math.cos(a), 0])
    return escena(cfg, p.sentado(k / CUADROS_QUIETO, { 1: palanca, [-1]: acelerador }), palanca, acelerador)
  })
  const habla = Array.from({ length: CUADROS_GESTO }, (_, k) => escena(cfg, p.hablando(k / CUADROS_GESTO)))
  const gestos = p.gestos.map((g) => ({ ...g, cuadros: Array.from({ length: CUADROS_GESTO }, (_, k) => escena(cfg, g.pose(k / CUADROS_GESTO))) }))
  cabina.reposo = null
  const pinta = (cuadros, t) => cuadros.map((f) => pixel3d(f, t, N, TAM, cfg.encuadre))
  const celdasQuieto = tomas.map(([nombre, t]) => celda(nombre, pinta(quieto, t), 'p8', 0.8, 2))
  const celdasGesto = gestos.flatMap((g) => tomasGesto(cfg, g.lado).map(([nombre, t]) => celda(`${g.nombre} · ${nombre}`, pinta(g.cuadros, t), 'g12', 1.8, 6)))
  const celdasHabla = tomas.map(([nombre, t]) => celda(nombre, pinta(habla, t), 'g12', 1.8, 3))
  const [modelo, detalle] = TEXTOS[p.archivo]
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${p.nombre}, en la cabina</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@1,800&family=Geist:wght@400;800&family=Geist+Mono:wght@400&display=swap">
<style>
body{margin:0}
.f{opacity:0}
.p8{animation:cuadro8 .8s step-end infinite}
.g12{animation:cuadro12 1.8s step-end infinite}
@keyframes cuadro8{0%{opacity:1}12.5%{opacity:0}100%{opacity:0}}
@keyframes cuadro12{0%{opacity:1}8.333%{opacity:0}100%{opacity:0}}
@media (prefers-reduced-motion: reduce){.f{animation:none}.quieto{opacity:1}}
</style>
</helmet>
<div style="width: 1440px; height: 1180px; box-sizing: border-box; padding: 40px 56px; display: flex; flex-direction: column; gap: 32px; background: #f6f9fc; font-family: Geist, system-ui, sans-serif; color: #0a1a2a">
<div style="display: flex; gap: 48px; align-items: flex-end">
<div style="display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; width: 420px">
<span style="${mono}; color: #47607a">${p.papel}</span>
<h1 style="margin: 0; font-family: Archivo, sans-serif; font-style: italic; font-weight: 800; font-size: 34px; line-height: 1.05">${p.nombre}</h1>
<span style="font-size: 15px; line-height: 1.4">${modelo}</span>
</div>
<p style="margin: 0; font-size: 15px; line-height: 1.6; max-width: 760px">${detalle}</p>
</div>
${fila('Al mando', celdasQuieto)}
${fila('Gesticulando', celdasGesto)}
${fila('Hablando', celdasHabla)}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1440,"height":1180}}'>
class Component extends DCLogic {
renderVals() {
return {};
}
}
</script>
</body>
</html>
`
  return { html, quieto, habla, gestos, tomas, encuadre: cfg.encuadre }
}

// PRUEBA=1: un cuadro por toma de cada piloto, en una hoja, sin láminas.
if (process.env.PRUEBA) {
  const filas = PERSONAJES.map((p) => {
    const cfg = { ...CABINAS[p.archivo] }
    cfg.avion = avion(cfg)
    cfg.escuadron = escuadron(p.archivo)
    cabina.reposo = (s) => (s > 0 ? PALANCA : ACELERADOR)
    const f = escena(cfg, p.sentado(0, { 1: PALANCA, [-1]: ACELERADOR }))
    const g = escena(cfg, p.gestos[0].pose(0.5))
    cabina.reposo = null
    const celdas = [...tomasDe(cfg).map(([, t]) => pixel3d(f, t, N, TAM, encuadreDe(cfg))), ...tomasGesto(cfg, p.gestos[0].lado).map(([, t]) => pixel3d(g, t, N, TAM, encuadreDe(cfg)))]
    return `<div style="display:flex;gap:4px;margin:4px">${celdas.map((s) => `<div style="background:#5c94fc">${s}</div>`).join('')}</div>`
  })
  writeFileSync(HOJA, `<html><body style="margin:0">${filas.join('')}</body></html>`)
  process.exit(0)
}

mkdirSync(`${RAIZ}/project`, { recursive: true })
const hoja = []
for (const p of PERSONAJES) {
  const { html, quieto, habla, gestos, tomas, encuadre } = lamina(p)
  writeFileSync(`${RAIZ}/project/V15-${p.archivo}-cabina.dc.html`, html)
  const tira = (cuadros, t) => `<div style="display:flex;gap:2px;margin:2px">${cuadros.slice(0, 6).map((f) => `<div style="background:#5c94fc">${pixel3d(f, t, N, 2, encuadre)}</div>`).join('')}</div>`
  hoja.push(`<h3 style="font:14px sans-serif;margin:6px">${p.nombre}</h3>`, ...tomas.map(([, t]) => tira(quieto, t)), tira(habla, tomas[0][1]), ...gestos.map((g) => tira(g.cuadros, tomas[1][1])))
}
writeFileSync(HOJA, `<html><body style="margin:0;background:#fff">${hoja.join('')}</body></html>`)
