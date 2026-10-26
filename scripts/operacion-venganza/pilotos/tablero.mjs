// Lo común de las láminas animadas del lienzo de Design: celdas de cuadros
// apilados, filas de seis y la página del tablero con su cabecera.

export const mono = "font-family: 'Geist Mono', monospace; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase"

// Cuadros apilados; la clase de animación muestra uno a la vez.
const animacion = (cuadros, clase, duracion, quieto) =>
  cuadros
    .map((svg, k) => svg.replace('<svg style="display: block"', `<svg class="f ${clase}${k === quieto ? ' quieto' : ''}" style="position: absolute; left: 0; top: 0; animation-delay: -${(((cuadros.length - k) % cuadros.length) * duracion / cuadros.length).toFixed(3)}s"`))
    .join('')

export const celda = (titulo, cuadros, clase, duracion, quieto, lado) => `<div style="display: flex; flex-direction: column; gap: 8px"><div style="height: 232px; display: flex; align-items: center; justify-content: center; background: #5c94fc; border-radius: 12px"><div style="position: relative; width: ${lado}px; height: ${lado}px">${animacion(cuadros, clase, duracion, quieto)}</div></div><span style="${mono}; color: #47607a">${titulo}</span></div>`

export const fila = (titulo, celdas) => `<div style="display: flex; flex-direction: column; gap: 12px">
<h2 style="margin: 0; font-size: 18px; font-weight: 800">${titulo}</h2>
<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px">
${celdas.join('\n')}
</div>
</div>`

// `animaciones`: las clases de cada ritmo y sus keyframes, una por línea.
export const pagina = ({ titulo, papel, nombre, bajada, detalle, animaciones, filas, alto }) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${titulo}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@1,800&family=Geist:wght@400;800&family=Geist+Mono:wght@400&display=swap">
<style>
body{margin:0}
.f{opacity:0}
${animaciones}
@media (prefers-reduced-motion: reduce){.f{animation:none}.quieto{opacity:1}}
</style>
</helmet>
<div style="width: 1440px; height: ${alto}px; box-sizing: border-box; padding: 40px 56px; display: flex; flex-direction: column; gap: 32px; background: #f6f9fc; font-family: Geist, system-ui, sans-serif; color: #0a1a2a">
<div style="display: flex; gap: 48px; align-items: flex-end">
<div style="display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; width: 420px">
<span style="${mono}; color: #47607a">${papel}</span>
<h1 style="margin: 0; font-family: Archivo, sans-serif; font-style: italic; font-weight: 800; font-size: 34px; line-height: 1.05">${nombre}</h1>
<span style="font-size: 15px; line-height: 1.4">${bajada}</span>
</div>
<p style="margin: 0; font-size: 15px; line-height: 1.6; max-width: 760px">${detalle}</p>
</div>
${filas.join('\n')}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1440,"height":${alto}}}'>
class Component extends DCLogic {
renderVals() {
return {};
}
}
</script>
</body>
</html>
`
