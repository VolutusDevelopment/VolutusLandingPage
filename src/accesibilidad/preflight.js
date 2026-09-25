/**
 * El fragmento que aplica las preferencias ANTES del primer pintado.
 *
 * Tiene que ir inline en el <head>, antes de los estilos, y ejecutarse de forma
 * síncrona. Cualquier otra cosa —un `defer`, un archivo aparte, esperar al
 * bundle— produce el mismo defecto: la página se pinta con el tema del diseño
 * y salta al tema elegido un instante después. Para alguien que eligió el tema
 * oscuro por fotosensibilidad, ese salto es un fogonazo blanco en la cara.
 *
 * Se exporta como texto y lo inyecta el prerender (scripts/prerender.mjs) en
 * todas las páginas. Vive aquí, junto al widget que escribe esas mismas claves,
 * porque si cambian los nombres tienen que cambiar juntos.
 *
 * Va escrito a mano y no minificado por una herramienta: son seis líneas que se
 * leen, y meter un minificador en el camino por 60 bytes no compensa.
 */
export const PREFLIGHT = `try{var p=JSON.parse(localStorage.getItem('a11y-preferencias')||'{}'),r=document.documentElement;if(p.escala)r.style.setProperty('--escala',p.escala);if(p.tema&&p.tema!='auto')r.setAttribute('data-tema',p.tema);if(p.movimiento&&p.movimiento!='normal')r.setAttribute('data-movimiento',p.movimiento)}catch(e){}`
