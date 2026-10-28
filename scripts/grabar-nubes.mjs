// Graba los campos de la nube de la portada y del mar del pie
// (src/lib/campos.js): lo que el pintor calcula por celda, en video, para las
// pantallas cuya GPU no lo dibuja a tiempo.
//
//   pnpm grabar
//
// Se corre a mano cuando cambia la nube o el mar, y los videos se commitean.
// Necesita el Chromium de Playwright con GPU de verdad y ffmpeg con libx264
// (en Windows, `winget install Gyan.FFmpeg`). Cada cámara se graba en cada
// una de sus densidades (`filas`): en el lienzo de su `alto` en px CSS, con la
// densidad de píxeles que da justo esas filas de celdas de `CELDA` px.
//
// Se graba cuadro a cuadro con un reloj falso, a `CUADROS_POR_SEGUNDO`: aunque
// la máquina tarde, no se pierde ninguno. El pintor se parcha solo aquí, en el
// servidor de desarrollo, donde llega sin minificar: pinta cada cuadro
// (`INTERVALO`), no se cronometra (`MEDIR_CADA`) y, tras calcular su campo, lo
// manda a este script. El pato no sale: el mar grabado es solo agua.
//
// Con los colores en negro y blanco, el campo da su tono puro: en la nube, de
// `sombra` (0) a `luz` (1); en el mar, de `sombra` (0) a `luz` (0.6) y a
// `borde` (1). El alfa es la cobertura o, en el mar, 0.5 o más donde hay agua.
//
// Cada escena se graba un segundo más de lo que dura: ese segundo se funde
// con el primero, así el bucle no tiene costura. En el campo un fundido no se
// nota; en los puntos se vería doble.
//
// Queda, además, un original sin pérdida de cada uno (FFV1) en una carpeta
// temporal, para volver a codificar sin grabar de nuevo.
import { spawn } from 'node:child_process'
import { closeSync, mkdtempSync, openSync, readSync, rmSync, writeFileSync, writeSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'
import { createServer } from 'vite'

import { CAMPOS, CUADROS_POR_SEGUNDO, ENTRE_PLANOS, campoPara } from '../src/lib/campos.js'

const root = fileURLToPath(new URL('..', import.meta.url))
// La calidad de los videos: el factor de x264, donde 0 es sin pérdida. Con 16
// los puntos difieren de los en vivo casi lo mismo que con 8 (0,1 a 0,4 puntos
// más), y el video pesa la cuarta parte.
const CRF = 16
const SEGUNDOS = { vertical: 10, apaisado: 10, mar: 8 }
// La celda de la grabación, en px del lienzo (ver `densidad` en lib/campos.js).
const CELDA = 3
const SOFTWARE = /basic render|swiftshader|llvmpipe|softpipe|software/i

// El pintor, parchado solo aquí: cada cambio es un par [original, reemplazo]
// sobre su código, y tiene que estar una sola vez.
const CAMBIOS = [
  ['const INTERVALO = 33\n', 'const INTERVALO = 0\n'],
  ['const MEDIR_CADA = 2000\n', 'const MEDIR_CADA = Infinity\n'],
  [
    '  gl.drawArrays(gl.TRIANGLES, 0, 3)\n  gl.bindFramebuffer(gl.FRAMEBUFFER, null)\n',
    '  gl.drawArrays(gl.TRIANGLES, 0, 3)\n  self.grabarCampo?.(gl, escena)\n  gl.bindFramebuffer(gl.FRAMEBUFFER, null)\n',
  ],
]

// Va antes del pintor. El reloj avanza un cuadro en cada fotograma; mientras se
// graba, solo cuando este script recibió el anterior. `grabar` dice cuántos
// cuadros y de qué escena; `grabarCampo` lee el campo y manda sus dos planos.
const PRELUDIO = `{
  let reloj = 0
  let libres = Infinity
  let captura = null
  const real = self.requestAnimationFrame.bind(self)
  Object.defineProperty(performance, 'now', { value: () => reloj })
  self.requestAnimationFrame = (f) =>
    real(function tic() {
      if (!libres) return real(tic)
      libres--
      reloj += 1000 / ${CUADROS_POR_SEGUNDO}
      f(reloj)
    })
  addEventListener('message', (evento) => {
    const { tipo } = evento.data ?? {}
    if (tipo === 'pato' || tipo === 'grabar') evento.stopImmediatePropagation()
    if (tipo === 'grabar') {
      captura = { ...evento.data, n: 0 }
      libres = 1
    }
  })
  self.grabarCampo = (gl, escena) => {
    if (!captura || !escena.mar !== !captura.mar || captura.n === captura.cuadros) return
    const [ancho, alto] = escena.rejilla
    const pixeles = new Uint8Array(4 * ancho * alto)
    gl.readPixels(0, 0, ancho, alto, gl.RGBA, gl.UNSIGNED_BYTE, pixeles)
    const planos = new Uint8Array(2 * ancho * alto)
    for (let i = 0; i < ancho * alto; i++) {
      planos[i] = pixeles[4 * i]
      planos[ancho * alto + i] = pixeles[4 * i + 3]
    }
    const n = captura.n++
    const consulta = new URLSearchParams({ n, ancho, alto, reloj, tiempo: escena.tiempo })
    fetch('/__campo?' + consulta, { method: 'POST', body: planos }).then(() => {
      if (captura.n < captura.cuadros) libres++
    })
  }
}
`

// Lo que el pintor manda llega aquí, cuadro a cuadro (`recibir`).
let recibir = null
const receptor = {
  name: 'grabar-campo',
  configureServer(servidor) {
    servidor.middlewares.use('/__campo', (pedido, respuesta) => {
      const partes = []
      pedido.on('data', (parte) => partes.push(parte))
      pedido.on('end', () => {
        const consulta = Object.fromEntries(new URL(pedido.url, 'http://localhost').searchParams)
        recibir?.(consulta, Buffer.concat(partes))
        respuesta.end()
      })
    })
  },
}

function ffmpeg(argumentos, entrada) {
  return new Promise((resolver, fallar) => {
    const proceso = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...argumentos], {
      stdio: [entrada ? 'pipe' : 'ignore', 'inherit', 'inherit'],
    })
    proceso.on('error', fallar)
    proceso.on('close', (codigo) => (codigo ? fallar(new Error(`ffmpeg terminó con ${codigo}`)) : resolver()))
    entrada?.(proceso.stdin)
  })
}

// Graba una escena en una densidad: sus cuadros crudos, en orden, a `crudo`.
async function capturar(navegador, url, camara, filas, crudo) {
  const mar = camara === 'mar'
  const { alto: altoCss, proporcion } = CAMPOS[camara]
  const anchoCss = Math.round(altoCss * proporcion)
  const densidad = (CELDA * filas) / altoCss
  // Las celdas del campo, como las cuenta el pintor (`rejilla` en nubes.js).
  const ancho = Math.ceil(Math.round(anchoCss * densidad) / CELDA)
  const alto = Math.ceil(Math.round(altoCss * densidad) / CELDA)
  const cuadros = (SEGUNDOS[camara] + 1) * CUADROS_POR_SEGUNDO
  // La celda en px CSS, para que mida `CELDA` px del lienzo, y el lienzo del
  // mar con la proporción de su campo. Sin barras de scroll, que le quitan
  // ancho al lienzo.
  const lado = CELDA / densidad
  const css = mar
    ? `.pie-mar{--alto-mar:${altoCss}px!important;--nubes-celda:${lado}!important;--nubes-sombra:#000000!important;--nubes-luz:#999999!important;--nubes-borde:#ffffff!important}`
    : `.portada-cielo .nubes{--nubes-celda:${lado}!important;--nubes-sombra:#000000!important;--nubes-luz:#ffffff!important}`
  const contexto = await navegador.newContext({
    viewport: { width: anchoCss, height: mar ? 900 : altoCss },
    deviceScaleFactor: densidad,
    reducedMotion: 'no-preference',
  })
  await contexto.addInitScript((css) => {
    const Pintor = self.Worker
    self.Worker = class extends Pintor {
      constructor(...argumentos) {
        super(...argumentos)
        self.pintor = this
      }
    }
    addEventListener('DOMContentLoaded', () => {
      const estilo = document.createElement('style')
      estilo.textContent = `html{scrollbar-width:none}${css}`
      document.head.append(estilo)
    })
  }, css)
  const pagina = await contexto.newPage()
  let problema = null
  await pagina.route(
    (direccion) => direccion.pathname.endsWith('/src/nubes-lienzo.js'),
    async (ruta) => {
      const respuesta = await ruta.fetch()
      let cuerpo = (await respuesta.text()).replace(/\r\n/g, '\n')
      for (const [original, reemplazo] of CAMBIOS) {
        if (cuerpo.split(original).length !== 2) problema ??= `el pintor cambió: no está «${original.trim()}»`
        cuerpo = cuerpo.replace(original, reemplazo)
      }
      await ruta.fulfill({ response: respuesta, body: PRELUDIO + cuerpo })
    },
  )

  // Cada cuadro, en orden, y en qué instante de la nube y del mar va (`reloj`
  // en ms, `tiempo` en el de la nube): con eso se compara lo grabado con lo
  // que se calcula en vivo.
  const archivo = openSync(crudo, 'w')
  const instantes = []
  const listo = new Promise((resolver, fallar) => {
    recibir = ({ n, ancho: a, alto: b, reloj, tiempo }, planos) => {
      if (+a !== ancho || +b !== alto) return fallar(new Error(`${camara} ${filas}: el campo midió ${a}×${b} y no ${ancho}×${alto}`))
      writeSync(archivo, planos, 0, planos.length, n * planos.length)
      instantes[n] = { reloj: +reloj, tiempo: +tiempo }
      if (+n === cuadros - 1) resolver()
    }
  })
  // En desarrollo la página la arma React en el navegador: el pie existe
  // después de `load`. El mar se pinta mientras se ve.
  const lienzo = `${mar ? '.pie-mar' : '.portada-cielo'} canvas.nubes`
  const alPie = () => pagina.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
  await pagina.goto(url, { waitUntil: 'load' })
  await pagina.waitForSelector(lienzo, { state: 'attached' })
  if (mar) await alPie()
  const renderer = await pagina.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl')
    return gl?.getParameter(gl.getExtension('WEBGL_debug_renderer_info')?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER)
  })
  if (!renderer || SOFTWARE.test(renderer)) throw new Error(`sin GPU de verdad (${renderer}): la nube no se movería`)
  await pagina.waitForSelector(`${lienzo}.vivo`, { timeout: 60000 })
  if (problema) throw new Error(problema)
  // Un segundo andando antes de grabar, para que nada venga del arranque.
  await pagina.waitForTimeout(1000)
  if (mar) await alPie()
  await pagina.evaluate((datos) => self.pintor.postMessage(datos), { tipo: 'grabar', mar, cuadros })
  await listo
  closeSync(archivo)
  await contexto.close()
  writeFileSync(crudo.replace(/\.crudo$/, '.json'), JSON.stringify(instantes))
  return { ancho, alto, cuadros }
}

// Del crudo al original sin pérdida: el último segundo fundido con el primero
// y los dos planos lado a lado, separados por `ENTRE_PLANOS` px que repiten
// su borde.
async function fundir(crudo, { ancho, alto, cuadros }, original) {
  const fundido = CUADROS_POR_SEGUNDO
  const largo = cuadros - fundido
  const bytes = 2 * ancho * alto
  const total = 2 * ancho + ENTRE_PLANOS
  const archivo = openSync(crudo, 'r')
  const leer = (n) => {
    const cuadro = Buffer.alloc(bytes)
    readSync(archivo, cuadro, 0, bytes, n * bytes)
    return cuadro
  }
  const formato = ['-f', 'rawvideo', '-pix_fmt', 'gray', '-s', `${total}x${alto}`, '-r', `${CUADROS_POR_SEGUNDO}`]
  await ffmpeg(
    [...formato, '-i', '-', '-c:v', 'ffv1', '-level', '3', original],
    async (entrada) => {
      for (let n = 0; n < largo; n++) {
        let planos = leer(n)
        if (n < fundido) {
          const cola = leer(largo + n)
          const peso = (n + 1) / (fundido + 1)
          planos = planos.map((valor, i) => Math.round(cola[i] + (valor - cola[i]) * peso))
        }
        const cuadro = Buffer.alloc(total * alto)
        for (let y = 0; y < alto; y++) {
          const fila = y * total
          planos.copy(cuadro, fila, y * ancho, (y + 1) * ancho)
          planos.copy(cuadro, fila + ancho + ENTRE_PLANOS, ancho * alto + y * ancho, ancho * alto + (y + 1) * ancho)
          cuadro.fill(planos[(y + 1) * ancho - 1], fila + ancho, fila + ancho + ENTRE_PLANOS / 2)
          cuadro.fill(planos[ancho * alto + y * ancho], fila + ancho + ENTRE_PLANOS / 2, fila + ancho + ENTRE_PLANOS)
        }
        if (!entrada.write(cuadro)) await new Promise((seguir) => entrada.once('drain', seguir))
      }
      entrada.end()
    },
  )
  closeSync(archivo)
  return largo
}

// El video que va al sitio: H.264 en 4:2:0, que reproduce todo navegador, con
// el gris en la luma, un solo cuadro clave y el índice al principio para que
// empiece a reproducirse sin bajarlo entero.
function codificar(original, largo, destino) {
  return ffmpeg([
    '-i', original, '-an', '-vf', 'scale=in_range=pc:out_range=tv,format=yuv420p', '-r', `${CUADROS_POR_SEGUNDO}`,
    '-c:v', 'libx264', '-preset', 'veryslow', '-crf', `${CRF}`,
    '-g', `${largo}`, '-keyint_min', `${largo}`, '-sc_threshold', '0',
    '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'iec61966-2-1',
    '-movflags', '+faststart', destino,
  ])
}

const carpeta = mkdtempSync(join(tmpdir(), 'grabar-nubes-'))
const servidor = await createServer({ root, plugins: [receptor], logLevel: 'error' })
await servidor.listen()
const url = servidor.resolvedUrls.local[0]
const navegador = await chromium.launch({ channel: 'chromium' })
try {
  for (const [camara, { filas }] of Object.entries(CAMPOS)) {
    for (const nivel of filas) {
      const crudo = join(carpeta, `${camara}-${nivel}.crudo`)
      const original = join(carpeta, `${camara}-${nivel}.mkv`)
      const medida = await capturar(navegador, url, camara, nivel, crudo)
      const largo = await fundir(crudo, medida, original)
      rmSync(crudo)
      const src = campoPara(camara, nivel)
      await codificar(original, largo, join(root, 'public', src))
      console.log(`grabar: ${src}, ${medida.ancho}×${medida.alto} celdas, ${largo} cuadros`)
    }
  }
  console.log(`grabar: los originales sin pérdida quedan en ${carpeta}`)
} finally {
  await navegador.close()
  await servidor.close()
}
