// Los cuatro pilotos vistos desde dentro de la cabina de su caza: el piloto
// sentado con su tablero y sus mandos, a escala dentro del modelo real del
// caza, que tiene abierta la cabina bajo la cúpula (interiores.mjs). Las
// cámaras van dentro, en perspectiva, como la cámara de cabina de Top Gun:
// detrás se ven el lomo, las alas, el mar y el resto del escuadrón en formación.
//
//   node scripts/operacion-venganza/pilotos/cabinas.mjs <carpeta> <hoja.html>
//
// Escribe <carpeta>/project/V15-<piloto>-cabina.dc.html. Con PRUEBA=1 solo
// arma la hoja, con un cuadro por toma.

import { el, pixel3d } from './tres.mjs'
import { RAMPAS as C } from './modelos.mjs'
import { PERSONAJES, cabina } from './cuerpos.mjs'
import { ACELERADOR, CABINAS, PALANCA, aCaza, avion, cabinaCon } from './interiores.mjs'
import { celda, fila, pagina } from './tablero.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'

const [RAIZ, HOJA] = process.argv.slice(2)
const N = 72
const TAM = Number(process.env.TAM ?? 3)
const LADO = N * TAM
const CUADROS_QUIETO = 8
const CUADROS_GESTO = 12

const sum = (a, b) => a.map((v, i) => v + b[i])

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

const escena = (cfg, pilote, palanca, acelerador) => [mar, ...nubes, ...cfg.escuadron, ...cabinaCon(cfg, pilote, palanca, acelerador)]

const TEXTOS = {
  'duck-one': ['Boeing F-15EX Eagle II, gris tradicional', 'Desde dentro de su F-15EX, con la cámara sobre el tablero: pantalla panorámica, dos retrovisores en el arco del parabrisas, de uno de los cuales cuelga una medalla, y detrás el escuadrón en formación sobre el mar.'],
  'moby-duck': ['Fairchild Republic A-10 Thunderbolt II, negro', 'Desde dentro del A-10, que le queda chico: relojes de aguja, un cenicero con colillas en el tablero y el humo del puro llenando la cúpula. Detrás vuelan los otros tres.'],
  duke: ['McDonnell Douglas F/A-18C Hornet, blanco y rosa', 'Desde dentro de su Hornet: consolas y arcos rosa, el HUD con el cristal rosa, las pantallas del Hornet en rosa con un corazón en la del medio, su trono de capitoné con corona y un espejo de belleza con bombillas colgado del parabrisas, para mirarse en pleno vuelo.'],
  duky: ['Lockheed Martin F-35A Lightning II, negro', 'Desde dentro del F-35, bajo la cúpula dorada: una sola pantalla panorámica y, sentado en su asiento eyectable, un pato de hule que no mira nada mientras el escuadrón lo sigue.'],
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
  const celdasQuieto = tomas.map(([nombre, t]) => celda(nombre, pinta(quieto, t), 'p8', 0.8, 2, LADO))
  const celdasGesto = gestos.flatMap((g) => tomasGesto(cfg, g.lado).map(([nombre, t]) => celda(`${g.nombre} · ${nombre}`, pinta(g.cuadros, t), 'g12', 1.8, 6, LADO)))
  const celdasHabla = tomas.map(([nombre, t]) => celda(nombre, pinta(habla, t), 'g12', 1.8, 3, LADO))
  const [modelo, detalle] = TEXTOS[p.archivo]
  const html = pagina({
    titulo: `${p.nombre}, en la cabina`,
    papel: p.papel,
    nombre: p.nombre,
    bajada: modelo,
    detalle,
    animaciones: `.p8{animation:cuadro8 .8s step-end infinite}
.g12{animation:cuadro12 1.8s step-end infinite}
@keyframes cuadro8{0%{opacity:1}12.5%{opacity:0}100%{opacity:0}}
@keyframes cuadro12{0%{opacity:1}8.333%{opacity:0}100%{opacity:0}}`,
    filas: [fila('Al mando', celdasQuieto), fila('Gesticulando', celdasGesto), fila('Hablando', celdasHabla)],
    alto: 1180,
  })
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
