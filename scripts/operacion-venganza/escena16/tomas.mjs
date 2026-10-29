// Las tomas de la escena 16, en 3D: qué se ve en el instante u ∈ [0, 1) y
// desde dónde, como las de la escena 15 (escena15/tomas.mjs), en la misma
// proa y al mismo atardecer. El guion, con sus líneas y sus dos finales, está
// en src/lib/escena16.js.
//
// El almirante va solo a la proa y le habla a quien juega. La cámara lo mira
// de frente, de espaldas y desde detrás de un caza estacionado, y él la
// descubre y la persigue. Después se va, y la proa queda vacía. Si quien
// juega hunde el barco, la cubierta es un caos, el almirante llora, el cursor
// o el dedo lo parte en dos y las mitades se hunden como el Titanic. Si los
// deja vivir, la flota se aleja hacia el sol hasta perderse en el horizonte.

import { el, transformar } from '../pilotos/tres.mjs'
import { RAMPAS as C } from '../pilotos/modelos.mjs'
import { figura, manosAndando } from '../pilotos/cuerpos.mjs'
import { MAR, SOL, colocar, destructor, navegando, poner, portaaviones } from '../escena1/lugares.mjs'
import { MANOS_ATRAS, OFICIOS, almiranteCabeza, almiranteTronco, corre, hablar, pAlmirante, silaba, suave } from '../escena1/personajes.mjs'
import { giroHacia, girar } from '../escena2/reunion.mjs'
import { K, SUELO, caza } from '../escena11/hangar.mjs'
import { objetivo } from '../escena6/visor.mjs'
import { alargar, proyectar } from '../tiras.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const esc = (a, k) => a.map((v) => v * k)
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const entre = (a, b, k) => a + (b - a) * k
const tramo = (u, a, b) => suave((u - a) / (b - a))
const fija = (ojo, mira, campo) => () => [ojo, mira, campo]
const vuelta = (u) => u * Math.PI * 2

const CUBIERTA = 20.8
const pato = (formas, donde) => colocar(formas, { k: K, ...donde })
const enCubierta = ([x, z]) => [x, CUBIERTA, z]

// El caza de duky, estacionado a estribor de la proa y ya sin armas: detrás
// de él se esconde la cámara.
const ESTACIONADO = [152, CUBIERTA - SUELO, 8]
const CAZA = poner(caza({ armas: false }), 200, ESTACIONADO)
const BARCO = [...portaaviones({ avion: false }), ...CAZA]

// ── El almirante ─────────────────────────────────────────────────────────

// La proa, de cara al sol, como en la escena 15; a su derecha, `A_LA_DERECHA`.
const AL_SOL = SOL
const A_LA_DERECHA = [-SOL[2], 0, SOL[0]]
const MIRA_AL_SOL = giroHacia([0, 0], [SOL[0], SOL[2]])
const BORDE = [164.3, CUBIERTA, 0]
const enLaProa = (lado, atras = 0) => sum(sum(BORDE, esc(A_LA_DERECHA, lado)), esc(AL_SOL, -atras))
const PROA = enLaProa(0, 1.4)

const alm = (cfg) => figura(pAlmirante, { sinSombra: true, ...cfg })
const tronco = ({ habla = 0, ...cabeza } = {}) => hablar(almiranteTronco(almiranteCabeza(cabeza)), habla)
// Respira: sube y baja apenas.
const respira = (u) => 0.015 * Math.sin(vuelta(u))
const quieto = (u, { inclina = 0, salto = respira(u), ...cabeza } = {}) => alm({ tronco: tronco(cabeza), manos: MANOS_ATRAS, salto, inclina })
// Habla con una mano adelante, como cuando pregunta en la sala.
const habla = (u, { inclina = 0, ceño = 0 } = {}) => {
  const g = suave(u / 0.2) * (1 - suave((u - 0.85) / 0.15))
  const mano = lerp(MANOS_ATRAS[1], [0.85, -0.45 + 0.06 * Math.sin(vuelta(u) * 3) * g, 0.9], g)
  return alm({ tronco: tronco({ habla: silaba(u) * 0.8, ceño }), manos: { 1: mano, [-1]: MANOS_ATRAS[-1] }, inclina: inclina - 3 * g })
}
const andando = (f) => alm({ tronco: tronco(), manos: MANOS_ATRAS, fase: f })
// Corre como puede: inclinado y braceando.
const corriendo = (f) => alm({ tronco: tronco({ ceño: 1 }), manos: manosAndando(pAlmirante, f), fase: f, inclina: -8 })
// Un paso cada medio metro andando y cada metro corriendo.
const pasos = (s, largo = 0.5) => (s / largo) % 1

// Va de `a` a `b` ([x, z]) con `k` de 0 a 1, mirando hacia donde va.
const deA = (a, b, k) => ({ en: enCubierta(lerp(a, b, k)), giro: giroHacia(a, b) })
const xz = ([x, , z]) => [x, z]

// ── La proa ──────────────────────────────────────────────────────────────

// Llega solo, desde la cubierta, con las manos atrás.
const DESDE = xz(enLaProa(-3, 11))
const LLEGA = 0.85
const seAcerca = (u) => {
  const k = Math.min(1, u / LLEGA)
  const largo = Math.hypot(...DESDE.map((v, i) => v - xz(PROA)[i]))
  const donde = deA(DESDE, xz(PROA), suave(k) * 0.4 + k * 0.6)
  if (u < LLEGA) return pato(andando(pasos(largo * (suave(k) * 0.4 + k * 0.6))), donde)
  return pato(quieto(u), { en: PROA, giro: girar(donde.giro, MIRA_AL_SOL, tramo(u, LLEGA, 1)) })
}

// Le habla al aire, de cara al sol: la cámara, de tres cuartos sobre el mar.
const DE_FRENTE = fija(sum(enLaProa(-4.5, -2.5), [0, 1.5, 0]), sum(PROA, [0, 0.95, 0]), 40)

// Una pausa antes de u = 0: respira hondo, el pecho se le infla y baja, y
// deja la pose de cuando hablaba. Después mira al cielo y, despacio, se da
// vuelta hacia la cámara y la mira.
const HACIA_LA_CAMARA = giroHacia(xz(PROA), xz(DE_FRENTE()[0]))
const PAUSA = -0.125
const laMira = (u) => {
  const respiro = Math.sin(Math.PI * Math.min(1, Math.max(0, (u - PAUSA) / -PAUSA)))
  const deja = 6 * (1 - tramo(u, PAUSA, 0))
  const sube = tramo(u, 0.05, 0.3) * (1 - tramo(u, 0.45, 0.6))
  return pato(quieto(u, { inclina: 12 * sube + deja + 4 * respiro, salto: respira(u) + 0.05 * respiro, abre: u > 0.7 ? 0.65 : 0.45, ceño: tramo(u, 0.7, 0.9) }), { en: PROA, giro: girar(MIRA_AL_SOL, HACIA_LA_CAMARA, tramo(u, 0.45, 0.85)) })
}

// La cámara cambia: detrás de él, sobre la cubierta, con el sol delante. Él,
// todavía vuelto hacia donde la miraba y con el ceño, regresa al sol; espera
// unos segundos, se da vuelta despacio y camina hacia ella. La toma corta a
// mitad de camino. En cuadros de su tira, de 57: regresa en 5, espera hasta el
// 27, gira en 10 y camina un 5 % del camino por cuadro.
const ATRAS = sum(enLaProa(0.3, 7.5), [0, 1.3, 0])
const DE_ESPALDAS = fija(ATRAS, sum(PROA, sum(esc(AL_SOL, 6), [0, 0.6, 0])), 44)
const A_LA_CAMARA = giroHacia(xz(PROA), xz(ATRAS))
const MITAD = lerp(xz(PROA), xz(ATRAS), 0.45)
const CUADRO = 1 / 57
const [REGRESA, ESPERA, GIRA] = [5 * CUADRO, 27 * CUADRO, 37 * CUADRO]
const seVuelve = (u) => {
  if (u < REGRESA) {
    const k = tramo(u, 0, REGRESA)
    return pato(quieto(u, { abre: 0.65 - 0.35 * k, ceño: 1 - k }), { en: PROA, giro: girar(HACIA_LA_CAMARA, MIRA_AL_SOL, k) })
  }
  if (u < ESPERA) return pato(quieto(u, { abre: 0.3 }), { en: PROA, giro: MIRA_AL_SOL })
  if (u < GIRA) return pato(quieto(u), { en: PROA, giro: girar(MIRA_AL_SOL, A_LA_CAMARA, tramo(u, ESPERA, GIRA)) })
  const k = (0.05 * (u - GIRA)) / CUADRO
  return pato(andando(pasos(k * 2.6)), deA(xz(PROA), MITAD, k))
}

// Otra vez la cámara cambia: escondida detrás del caza. Él, desconcertado,
// mira a todos lados y al final la encuentra.
const ESCONDIDA = [ESTACIONADO[0] - 8, CUBIERTA + 1.6, ESTACIONADO[2] - 0.5]
const DETRAS_DEL_CAZA = fija(ESCONDIDA, sum(enCubierta(MITAD), [0, 0.6, 0]), 24)
const AL_CAZA = giroHacia(MITAD, xz(ESCONDIDA))
const busca = (u) => {
  const mira = A_LA_CAMARA + 70 * Math.sin(vuelta(tramo(u, 0.1, 0.65)) * 1.5) * (1 - tramo(u, 0.6, 0.7))
  const giro = u < 0.7 ? mira : girar(A_LA_CAMARA, AL_CAZA, tramo(u, 0.7, 0.85))
  return pato(quieto(u, { abre: u > 0.85 ? 0.7 : 0.45, ceño: tramo(u, 0.85, 0.95) }), { en: enCubierta(MITAD), giro })
}

// Corre hacia el caza, directo a la cámara.
const HASTA = lerp(MITAD, xz(ESCONDIDA), 0.55)
const laPersigue = (u) => pato(corriendo(pasos(u * 7, 1)), deA(MITAD, HASTA, u))
// La cámara, en primera persona, también corre: hacia atrás, sin dejar de
// mirarlo, tambaleándose a cada zancada. Antes de u = 0 sigue escondida,
// quieta, mientras él se le viene encima por el último tramo de la carrera.
// Él la sigue un trecho, se detiene jadeando y la cámara, ya parada, deja de
// tambalearse.
const LEJOS_DE_EL = ((d) => esc(d, 18 / Math.hypot(...d)))([ESCONDIDA[0] - MITAD[0], 0, ESCONDIDA[2] - MITAD[1]])
const HUIDA = sum(ESCONDIDA, LEJOS_DE_EL)
const enLaHuida = (u) => lerp(ESCONDIDA, HUIDA, u)
const ARRANCA = -0.125
const ANTES = lerp(HASTA, MITAD, 1.26 / Math.hypot(HASTA[0] - MITAD[0], HASTA[1] - MITAD[1]))
const llegando = (u) => deA(ANTES, HASTA, (u - ARRANCA) / -ARRANCA)
const huye = (u) => {
  if (u < 0) return pato(corriendo(pasos(1.26 * (u - ARRANCA) / -ARRANCA, 1)), llegando(u))
  const k = tramo(u, 0, 0.65)
  const donde = deA(HASTA, lerp(HASTA, xz(HUIDA), 0.4), k)
  const jadea = Math.abs(Math.sin(vuelta(u) * 5)) * tramo(u, 0.65, 0.75)
  return u < 0.65 ? pato(corriendo(pasos(k * 5, 1)), donde) : pato(quieto(u, { ceño: 1, inclina: -6 - 4 * jadea, salto: 0.04 * jadea }), { ...donde, giro: giroHacia(xz(donde.en), xz(enLaHuida(u))) })
}
const DONDE_SE_DETIENE = enCubierta(lerp(HASTA, xz(HUIDA), 0.4))
const corriendoConLaCamara = (u) => {
  const corre = u > 0 ? 1 - tramo(u, 0.9, 1.15) : 0
  const zancada = Math.abs(Math.sin(vuelta(u) * 6)) * corre
  const ojo = sum(enLaHuida(suave(u)), [0, 0.18 * zancada, 0])
  const ladeo = 0.06 * Math.sin(vuelta(u) * 3) * corre
  const mira = u < 0 ? llegando(u).en : lerp(enCubierta(HASTA), DONDE_SE_DETIENE, tramo(u, 0, 0.65))
  return [ojo, sum(mira, [0, 0.6, 0]), 34, [ladeo, 1, 0]]
}

// Se detiene, jadeando, y le habla a la cámara.
const HARARI = giroHacia(xz(DONDE_SE_DETIENE), xz(HUIDA))
const ANTE_EL = (lejos, campo) => {
  const a = (HARARI * Math.PI) / 180
  return fija(sum(DONDE_SE_DETIENE, [lejos * Math.cos(a), 1.0, -lejos * Math.sin(a)]), sum(DONDE_SE_DETIENE, [0, 0.75, 0]), campo)
}

// Vuelve a la proa, pensativo y cabizbajo, y le habla al sol. La cámara lo
// espera allá, de frente, sobre el mar.
const vuelve = (u) => {
  const largo = Math.hypot(...xz(DONDE_SE_DETIENE).map((v, i) => v - xz(PROA)[i]))
  if (u < 0.85) return pato(alm({ tronco: tronco({ abre: 0.3 }), manos: MANOS_ATRAS, fase: pasos(largo * (u / 0.85)), inclina: -6 }), deA(xz(DONDE_SE_DETIENE), xz(PROA), u / 0.85))
  return pato(quieto(u, { abre: 0.3 }), { en: PROA, giro: girar(giroHacia(xz(DONDE_SE_DETIENE), xz(PROA)), MIRA_AL_SOL, tramo(u, 0.85, 1)) })
}
const DE_COSTADO = fija(sum(enLaProa(-4, 13), [0, 3.2, 0]), enLaProa(5.5, -20), 44)
const A_SU_ENCUENTRO = fija(sum(enLaProa(-3, -6), [0, 2.4, 0]), sum(lerp(PROA, DONDE_SE_DETIENE, 0.4), [0, 0.6, 0]), 44)
const TRES_CUARTOS = fija(sum(enLaProa(-1, 4.4), [0, 1.3, 0]), sum(enLaProa(0.2, -2), [0, 0.9, 0]), 46)

// Se retira por donde vino, y la proa queda sola frente al sol.
const SALIDA = xz(enLaProa(-3, 20))
const seRetira = (u) => {
  if (u < 0.15) return pato(quieto(u, { abre: 0.3 }), { en: PROA, giro: girar(MIRA_AL_SOL, giroHacia(xz(PROA), SALIDA), tramo(u, 0, 0.15)) })
  const k = (u - 0.15) / 0.85
  return pato(andando(pasos(k * 18)), deA(xz(PROA), SALIDA, k))
}
const LA_PROA = fija(sum(enLaProa(-4.5, 10), [0, 3, 0]), sum(enLaProa(0.5, -10), [0, 0.5, 0]), 50)

// ── Hundir el Sitting Ducks ──────────────────────────────────────────────

// Los marineros corren de un lado a otro con las manos al aire, cada uno por
// su carril, lejos o a los lados del almirante, que no se mueve.
const CARRILES = [
  [OFICIOS.amarillo, -3.5, 4, 0],
  [OFICIOS.rojo, 3.8, 9, 0.35],
  [OFICIOS.morado, -4.5, 12, 0.6],
  [OFICIOS.verde, 3.5, 3, 0.15],
  [OFICIOS.amarillo, 0, 15, 0.8],
]
const panico = (u, carriles) =>
  carriles.flatMap(([oficio, lado, atras, desfase]) => {
    const ida = Math.sin(vuelta(u + desfase))
    const en = enLaProa(lado + 2.2 * ida, atras)
    const giro = MIRA_AL_SOL + (Math.cos(vuelta(u + desfase)) > 0 ? -90 : 90)
    return colocar(corre(oficio, (u * 4 + desfase) % 1), { k: K, giro, en })
  })

// Le cae una lágrima: del ojo, por la mejilla.
const lagrima = (k) => (k <= 0 || k >= 1 ? [] : [el([0.86, 0.6 - 0.55 * k, 0.34], [0.07, 0.11, 0.07], C.vidrio, { flat: '#7ac8f4', brilla: true })])
const llora = (u) => alm({ tronco: tronco({ abre: 0.3 }), manos: MANOS_ATRAS, salto: respira(u), extra: lagrima(tramo(u, 0.15, 0.95)) })
const QUIETO = { en: enLaProa(0, 8), giro: MIRA_AL_SOL + 180 }
const caos = (u) => [MAR, ...BARCO, ...pato(quieto(u, { abre: 0.3 }), QUIETO), ...panico(u, CARRILES)]
const SOBRE_EL_CAOS = fija(sum(enLaProa(-11, 16), [0, 6, 0]), sum(enLaProa(-0.5, 7), [0, 0.3, 0]), 46)
const lloroso = (u) => [MAR, ...BARCO, ...pato(llora(u), QUIETO), ...panico(u, [CARRILES[2], CARRILES[4]])]
const SU_CARA = fija(sum(enLaProa(-0.6, 10.2), [0, 1.0, 0]), sum(enLaProa(0, 8), [0, 0.95, 0]), 36)

// El barco, partido por la cuaderna `CORTE` en un borde irregular: cada
// mitad es el barco entero con la otra hueca, y gira en torno a su quiebre.
const CORTE = 5
const quiebre = ([x, y, z]) => x - CORTE - 2.5 * Math.sin(y * 0.9 + z * 0.4)
const ENTERO = portaaviones({ avion: false })
const mitad = (lado) =>
  ENTERO.filter((f) => f.k !== 'e' || Math.sign(f.c[0] - CORTE) === lado).map((f) => (f.k === 'e' ? f : { ...f, hueco: (p) => Math.sign(quiebre(p)) !== lado }))
const POPA = mitad(-1)
const PROA_DEL_BARCO = [...mitad(1), ...CAZA]
const PIVOTE = [CORTE, -2, 0]
// Cada mitad, girada `giro` grados (positivo, la punta sube) y hundida `baja` metros.
const partido = ({ popa = [0, 0], proa = [0, 0] }) => [
  MAR,
  ...transformar([0, 0, -popa[0]], PIVOTE, [0, -popa[1], 0]).formas(POPA),
  ...transformar([0, 0, proa[0]], PIVOTE, [0, -proa[1], 0]).formas(PROA_DEL_BARCO),
]

// Desde el mar, a contraluz: el sol detrás de la proa y el barco de tres cuartos.
const DIR = [Math.cos(0.66), 0, Math.sin(0.66)]
const DESDE_EL_MAR = fija(sum([0, 30, 0], esc(DIR, -400)), [10, 55, 0], 42)

// El cursor o el dedo baja del cielo hasta el medio del barco y lo golpea: se
// abre una V, el quiebre se hunde y las puntas suben.
const GOLPE = 0.4
const abre = (u) => tramo(u, GOLPE, 1)
const ataque = (u) => partido({ popa: [8 * abre(u), 9 * abre(u)], proa: [8 * abre(u), 9 * abre(u)] })
const DONDE_GOLPEA = proyectar(DESDE_EL_MAR(), [CORTE, CUBIERTA, 0])
const golpea = (celdas, u, modo) => {
  if (u > 0.75) return
  const [x, y] = DONDE_GOLPEA
  const baja = u < GOLPE ? suave(u / GOLPE) : 1 - tramo(u, 0.55, 0.75)
  objetivo(celdas, u, modo, [Math.round(x), Math.round(entre(-20, y, baja))])
}

// Como el Titanic: la proa se va de punta al fondo y la popa se levanta
// hasta quedar vertical; después se desliza hacia abajo y el mar queda solo.
const hundimiento = (u) =>
  partido({
    popa: [entre(8, 84, tramo(u, 0.05, 0.55)), 9 + 260 * tramo(u, 0.55, 1) ** 1.4],
    proa: [entre(8, -30, tramo(u, 0, 0.5)), 9 + 140 * tramo(u, 0.25, 0.75)],
  })

// ── Dejarlos vivir ───────────────────────────────────────────────────────

// La flota se aleja hacia el sol y, del otro lado del horizonte, se pierde.
// El mar es plano: ya lejos, chicos, bajan como tras la curva de la Tierra.
const RUMBO = MIRA_AL_SOL
const FLOTA = [
  [portaaviones({ avion: false }), [0, 0], 0],
  [portaaviones({ avion: false }), [-260, -190], 0.08],
  [portaaviones({ avion: false }), [-380, 170], 0.04],
  [destructor(), [-120, -300], 0.12],
  [destructor(), [-60, 280], 0.1],
  [destructor(), [-520, 40], 0.16],
]
const seAlejan = (u) => [
  MAR,
  ...FLOTA.flatMap(([formas, [x, z], tarda]) => {
    const s = 4600 * Math.max(0, u - tarda) ** 1.8
    const en = sum([x, 0, z], esc(AL_SOL, s))
    return navegando(formas, RUMBO, sum(en, [0, -(Math.max(0, s - 2000) ** 2) / 20000, 0]))
  }),
]
const TRAS_LA_FLOTA = fija(sum([0, 45, 0], esc(AL_SOL, -650)), sum([0, 20, 0], esc(AL_SOL, 1500)), 44)

const conMar = (escena) => (u) => [MAR, ...BARCO, ...escena(u)]

export const TOMAS_3D = {
  // Desde atrás, de costado y en alto: llega solo a la proa.
  llega: { escena: conMar(seAcerca), camara: DE_COSTADO },
  aire: { escena: conMar((u) => pato(habla(u, { inclina: 6 }), { en: PROA, giro: MIRA_AL_SOL })), camara: DE_FRENTE },
  // La pausa antes, y dos cuadros más mirando fijo.
  mira: alargar({ escena: conMar(laMira), camara: DE_FRENTE }, PAUSA, 42 / 40),
  espalda: { escena: conMar(seVuelve), camara: DE_ESPALDAS },
  caza: { escena: conMar(busca), camara: DETRAS_DEL_CAZA },
  persigue: { escena: conMar(laPersigue), camara: DETRAS_DEL_CAZA },
  huye: alargar({ escena: conMar(huye), camara: corriendoConLaCamara }, ARRANCA, 38 / 32),
  harari: { escena: conMar((u) => pato(habla(u, { ceño: 1 }), { en: DONDE_SE_DETIENE, giro: HARARI })), camara: ANTE_EL(2.4, 40) },
  vuelve: { escena: conMar(vuelve), camara: A_SU_ENCUENTRO },
  dios: { escena: conMar((u) => pato(habla(u, { inclina: 4 }), { en: PROA, giro: MIRA_AL_SOL })), camara: TRES_CUARTOS },
  retira: { escena: conMar(seRetira), camara: LA_PROA },
  destino: { escena: () => [MAR, ...BARCO], camara: LA_PROA },

  caos: { escena: caos, camara: SOBRE_EL_CAOS },
  // Un cuadro más, quieto, después de la lágrima.
  lagrima: alargar({ escena: lloroso, camara: SU_CARA }, 0, 33 / 32),
  ataque: { escena: ataque, camara: DESDE_EL_MAR, encima: golpea },
  hundimiento: { escena: hundimiento, camara: DESDE_EL_MAR },

  alejan: { escena: seAlejan, camara: TRAS_LA_FLOTA },
}
