// El trazado de rayos de pixel3d (tres.mjs) con la GPU: para cada celda del
// cuadro, un shader de WebGPU prueba el rayo contra todas las figuras y
// devuelve los cortes más cercanos. pixel3d después prueba de verdad solo
// esas figuras, con sus triángulos, y pinta como siempre: el cuadro sale
// igual que sin GPU, y mucho antes, porque probar cada rayo contra miles de
// figuras es lo que más tarda.
//
// La GPU se usa desde un Chromium sin ventana (el de Playwright), con
// WebGPU sobre Metal. Si no hay, candidatosGpu() devuelve undefined y
// pixel3d prueba todas las figuras, como antes.

import { chromium } from 'playwright'
import { camaraDe } from './tres.mjs'

// Los cortes que se guardan por celda, los más cercanos. Si el rayo corta
// más, lo que haya detrás del último no se sabe (ver pixel3d).
const K = 16
const ORIGEN = 'https://gpu.operacion-venganza'

const SHADER = /* wgsl */ `
struct Datos { elipsoides: u32, mallas: u32, celdas: u32, k: u32 }
@group(0) @binding(0) var<uniform> datos: Datos;
@group(0) @binding(1) var<storage, read> elipsoides: array<f32>;
@group(0) @binding(2) var<storage, read> triangulos: array<f32>;
@group(0) @binding(3) var<storage, read> mallas: array<f32>;
@group(0) @binding(4) var<storage, read> rayos: array<f32>;
@group(0) @binding(5) var<storage, read_write> salida: array<u32>;

const K = ${K}u;
// Holguras: la GPU calcula en 32 bits; mejor que sobre un candidato a que falte.
const HOLGURA = 1e-3;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) g: vec3u) {
  let celda = g.x;
  if (celda >= datos.celdas) { return; }
  // Todo va relativo al origen del rayo, que queda en 0.
  let d = vec3f(rayos[celda * 3u], rayos[celda * 3u + 1u], rayos[celda * 3u + 2u]);
  var ts: array<f32, K>;
  var ids: array<u32, K>;
  var n = 0u;
  var total = 0u;
  for (var e = 0u; e < datos.elipsoides; e++) {
    let b = e * 12u;
    let q = -vec3f(elipsoides[b], elipsoides[b + 1u], elipsoides[b + 2u]);
    let f0 = vec3f(elipsoides[b + 3u], elipsoides[b + 4u], elipsoides[b + 5u]);
    let f1 = vec3f(elipsoides[b + 6u], elipsoides[b + 7u], elipsoides[b + 8u]);
    let f2 = vec3f(elipsoides[b + 9u], elipsoides[b + 10u], elipsoides[b + 11u]);
    let lo = vec3f(dot(f0, q), dot(f1, q), dot(f2, q));
    let ld = vec3f(dot(f0, d), dot(f1, d), dot(f2, d));
    let a = dot(ld, ld);
    let bb = 2.0 * dot(lo, ld);
    let c = dot(lo, lo) - 1.0;
    let disc = bb * bb - 4.0 * a * c;
    if (disc < -HOLGURA * (bb * bb + abs(4.0 * a * c))) { continue; }
    let s = sqrt(max(disc, 0.0));
    let cerca = (-bb - s) / (2.0 * a);
    let lejos = (-bb + s) / (2.0 * a);
    if (lejos < -HOLGURA) { continue; }
    var t = select(lejos, cerca, cerca > 0.0);
    var id = e;
    total++;
    for (var i = 0u; i < K; i++) {
      if (i == n) { ts[i] = t; ids[i] = id; n++; break; }
      if (t < ts[i]) { let tt = ts[i]; let ii = ids[i]; ts[i] = t; ids[i] = id; t = tt; id = ii; }
    }
  }
  for (var m = 0u; m < datos.mallas; m++) {
    let b = m * 6u;
    let oc = -vec3f(mallas[b], mallas[b + 1u], mallas[b + 2u]);
    let radio = mallas[b + 3u] * 1.001 + 0.01;
    let bb = dot(oc, d);
    if (bb * bb - (dot(oc, oc) - radio * radio) < 0.0) { continue; }
    let desde = bitcast<u32>(mallas[b + 4u]);
    let hasta = desde + bitcast<u32>(mallas[b + 5u]);
    for (var k = desde; k < hasta; k++) {
      let p = k * 9u;
      let va = vec3f(triangulos[p], triangulos[p + 1u], triangulos[p + 2u]);
      let e1 = vec3f(triangulos[p + 3u], triangulos[p + 4u], triangulos[p + 5u]) - va;
      let e2 = vec3f(triangulos[p + 6u], triangulos[p + 7u], triangulos[p + 8u]) - va;
      let pv = cross(d, e2);
      let det = dot(e1, pv);
      if (abs(det) < 1e-20) { continue; }
      let sv = -va;
      let u = dot(sv, pv) / det;
      if (u < -HOLGURA || u > 1.0 + HOLGURA) { continue; }
      let qv = cross(sv, e1);
      let v = dot(d, qv) / det;
      if (v < -HOLGURA || u + v > 1.0 + HOLGURA) { continue; }
      var t = dot(e2, qv) / det;
      if (t < -HOLGURA) { continue; }
      var id = datos.elipsoides + k;
      total++;
      for (var i = 0u; i < K; i++) {
        if (i == n) { ts[i] = t; ids[i] = id; n++; break; }
        if (t < ts[i]) { let tt = ts[i]; let ii = ids[i]; ts[i] = t; ids[i] = id; t = tt; id = ii; }
      }
    }
  }
  let base = celda * (K + 2u);
  salida[base] = total;
  salida[base + 1u] = bitcast<u32>(ts[K - 1u]);
  for (var i = 0u; i < n; i++) { salida[base + 2u + i] = ids[i]; }
}
`

// En la página: el dispositivo y el pipeline se arman una vez; cada cuadro
// trae sus datos por fetch y devuelve los cortes por POST, en binario.
const PAGINA = `<!doctype html><script>
let gpu
const preparar = async () => {
  const adaptador = await navigator.gpu.requestAdapter()
  const device = await adaptador.requestDevice({ requiredLimits: { maxStorageBufferBindingSize: adaptador.limits.maxStorageBufferBindingSize, maxBufferSize: adaptador.limits.maxBufferSize } })
  const pipeline = device.createComputePipeline({ layout: 'auto', compute: { module: device.createShaderModule({ code: ${JSON.stringify(SHADER)} }), entryPoint: 'main' } })
  return { device, pipeline }
}
window.trazar = async () => {
  gpu ??= await preparar()
  const { device, pipeline } = gpu
  const datos = await (await fetch('/entrada')).arrayBuffer()
  const cabecera = new Uint32Array(datos, 0, 8)
  const [elipsoides, triangulos, mallas, celdas] = cabecera
  const tramos = [elipsoides * 12, triangulos * 9, mallas * 6, celdas * 3]
  let desde = 32
  const buffers = tramos.map((largo) => {
    const bytes = Math.max(16, largo * 4)
    const buffer = device.createBuffer({ size: bytes, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST })
    if (largo) device.queue.writeBuffer(buffer, 0, datos, desde, largo * 4)
    desde += largo * 4
    return buffer
  })
  const uniforme = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST })
  device.queue.writeBuffer(uniforme, 0, new Uint32Array([elipsoides, mallas, celdas, ${K}]))
  const largoSalida = celdas * ${K + 2} * 4
  const salida = device.createBuffer({ size: largoSalida, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC })
  const lectura = device.createBuffer({ size: largoSalida, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST })
  const grupo = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [uniforme, ...buffers, salida].map((buffer, binding) => ({ binding, resource: { buffer } })),
  })
  const orden = device.createCommandEncoder()
  const pase = orden.beginComputePass()
  pase.setPipeline(pipeline)
  pase.setBindGroup(0, grupo)
  pase.dispatchWorkgroups(Math.ceil(celdas / 64))
  pase.end()
  orden.copyBufferToBuffer(salida, 0, lectura, 0, largoSalida)
  device.queue.submit([orden.finish()])
  await lectura.mapAsync(GPUMapMode.READ)
  await fetch('/salida', { method: 'POST', body: lectura.getMappedRange().slice(0) })
  for (const b of [...buffers, uniforme, salida, lectura]) b.destroy()
}
</script>`

let abierta

const abrir = async () => {
  try {
    const navegador = await chromium.launch({ args: ['--enable-unsafe-webgpu', '--use-angle=metal', '--enable-gpu'] })
    const pagina = await navegador.newPage()
    const io = { entrada: null, salida: null }
    await pagina.route(`${ORIGEN}/**`, (ruta) => {
      const camino = new URL(ruta.request().url()).pathname
      if (camino === '/entrada') return ruta.fulfill({ body: io.entrada, contentType: 'application/octet-stream' })
      if (camino === '/salida') {
        io.salida = ruta.request().postDataBuffer()
        return ruta.fulfill({ body: '' })
      }
      return ruta.fulfill({ body: PAGINA, contentType: 'text/html' })
    })
    await pagina.goto(`${ORIGEN}/`)
    const hay = await pagina.evaluate(async () => Boolean(await navigator.gpu?.requestAdapter()))
    if (!hay) {
      await navegador.close()
      return null
    }
    return { navegador, pagina, io }
  } catch {
    return null
  }
}

// Las celdas de la toma, ya con los cortes de la GPU: una función que, por
// celda (j · n + i), da `figuras`, las que pueden cortar su rayo, cada una
// con sus triángulos (undefined en los elipsoides), y `hasta`: la distancia
// hasta donde se sabe que no corta nada más (Infinity si están todos). Solo
// para cámaras en perspectiva; sin GPU, undefined.
export const candidatosGpu = async (figura, toma, n, encuadre) => {
  if (!toma.ojo) return undefined
  abierta ??= abrir()
  const gpu = await abierta
  if (!gpu) return undefined

  const camara = camaraDe(toma, n, encuadre)
  const celdas = n * camara.filas
  const { o } = camara.rayo(0, 0)
  const desde = (p) => [p[0] - o[0], p[1] - o[1], p[2] - o[2]]
  const elipsoides = figura.filter((f) => f.k === 'e')
  const mallas = figura.filter((f) => f.k === 'm')
  const triangulos = mallas.flatMap((f) => f.tris.map((tri) => [f, tri]))

  const flotantes = new Float32Array(elipsoides.length * 12 + triangulos.length * 9 + mallas.length * 6 + celdas * 3)
  let k = 0
  const poner = (...valores) => {
    for (const v of valores) flotantes[k++] = v
  }
  // Cada elipsoide: su centro y las filas de la matriz que lleva el rayo a
  // la esfera unitaria (la inversa de su giro, dividida por sus radios).
  for (const f of elipsoides) {
    poner(...desde(f.c))
    for (let i = 0; i < 3; i++) poner(f.M[0][i] / f.r[i], f.M[1][i] / f.r[i], f.M[2][i] / f.r[i])
  }
  for (const [, tri] of triangulos) poner(...desde(tri.a), ...desde(tri.b), ...desde(tri.c))
  const enteros = new Uint32Array(flotantes.buffer)
  let primero = 0
  for (const f of mallas) {
    poner(...desde(f.centro), f.radio)
    enteros[k++] = primero
    enteros[k++] = f.tris.length
    primero += f.tris.length
  }
  for (let j = 0; j < camara.filas; j++) for (let i = 0; i < n; i++) poner(...camara.rayo(i, j).d)

  gpu.io.entrada = Buffer.concat([Buffer.from(new Uint32Array([elipsoides.length, triangulos.length, mallas.length, celdas, 0, 0, 0, 0]).buffer), Buffer.from(flotantes.buffer)])
  await gpu.pagina.evaluate(() => window.trazar())
  const salida = new Uint32Array(gpu.io.salida.buffer, gpu.io.salida.byteOffset, gpu.io.salida.byteLength / 4)
  const distancias = new Float32Array(salida.buffer, salida.byteOffset, salida.length)

  return (celda) => {
    const base = celda * (K + 2)
    const total = salida[base]
    // Con más cortes que K, el último guardado marca hasta dónde se sabe,
    // con un margen por los 32 bits de la GPU.
    const ultimo = distancias[base + 1]
    const hasta = total > K ? ultimo * (1 - 1e-4) - 1e-3 : Infinity
    const figuras = new Map()
    for (let i = 0; i < Math.min(total, K); i++) {
      const id = salida[base + 2 + i]
      if (id < elipsoides.length) figuras.set(elipsoides[id], undefined)
      else {
        const [f, tri] = triangulos[id - elipsoides.length]
        if (!figuras.has(f)) figuras.set(f, [])
        figuras.get(f).push(tri)
      }
    }
    return { figuras, hasta }
  }
}

export const cerrarGpu = async () => {
  const gpu = await abierta
  abierta = undefined
  await gpu?.navegador.close()
}
