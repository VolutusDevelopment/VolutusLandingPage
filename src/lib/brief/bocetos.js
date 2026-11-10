/**
 * Los bocetos del brief (/brief/bocetos/<slug>.html, en public/): 24 landing
 * pages de marcas inventadas, una por dirección de estilo, para que el cliente
 * vea cada estilo puesto en una página entera y diga si le gusta.
 *
 * `estilo` es el valor de la opción de la pregunta `estilo` (preguntas.js).
 * `fondo`, `tinta` y `acento` dibujan su miniatura en el brief.
 *
 * Lo usan la página (la tarjeta de cada boceto), su script (la revisión) y el
 * Worker (el correo). La calificación que se hace en el boceto la guarda
 * public/brief/bocetos/barra.js, bajo `CLAVE_BOCETOS` de reglas.js.
 */

const b = (slug, nombre, rubro, estilo, fondo, tinta, acento) => ({ slug, nombre, rubro, estilo, fondo, tinta, acento })

export const BOCETOS = [
  b('alba', 'Alba Interiores', 'Estudio de interiorismo', 'minimalista', '#fafaf8', '#141414', '#141414'),
  b('nodo', 'Nodo', 'Software de despacho para pymes', 'tecnologico', '#06121b', '#e8fff6', '#2ee6a6'),
  b('roble', 'Roble & Asociados', 'Estudio contable y tributario', 'corporativo', '#f3f6fa', '#10284f', '#1d5fd1'),
  b('marea', 'Marea', 'Viajes por la costa chilena', 'editorial', '#f2ede3', '#1c2a2e', '#2e6b7a'),
  b('rosa', 'La Mesa de Rosa', 'Cocina casera y banquetería', 'calido', '#f6e4d0', '#4f2614', '#d0643a'),
  b('onix', 'Ónix', 'Joyería contemporánea de autor', 'premium', '#0b0a09', '#efe3c2', '#c9a24a'),
  b('golpe', 'Golpe', 'Club de boxeo', 'audaz', '#ffe14d', '#111111', '#111111'),
  b('pinpon', 'Pinpón', 'Heladería de barrio', 'ludico', '#ffe0ea', '#7a1f4b', '#ff6f91'),
  b('bloque', 'Bloque', 'Galería de arte independiente', 'brutalista', '#d9d9d4', '#000000', '#0000ee'),
  b('disco', 'Disco Sur', 'Tienda de vinilos', 'retro', '#f3e1bf', '#5a2410', '#d86a26'),
  b('grilla', 'Grilla', 'Escuela de diseño gráfico', 'suizo', '#ffffff', '#111111', '#e2231a'),
  b('raiz', 'Raíz', 'Vivero y paisajismo', 'natural', '#e9ecdf', '#23412b', '#6f9a5b'),
  b('helio', 'Helio', 'Energía solar para casas', 'futurista', '#0b0c1e', '#ffffff', '#7a5cff'),
  b('bruma', 'Bruma', 'Café de especialidad y tostaduría', 'artesanal', '#e9dcc4', '#4a2817', '#b4462b'),
  b('koen', 'Kōen', 'Yoga y casa de té', 'zen', '#f2efe8', '#23231f', '#b8342c'),
  b('galpon', 'Galpón 9', 'Cervecería y taller de metal', 'industrial', '#1b1d1f', '#e5e1d8', '#f2b705'),
  b('mirador', 'Hotel Mirador', 'Hotel boutique en Valparaíso', 'artdeco', '#0f1f1c', '#e9d7a5', '#d4af37'),
  b('forma', 'Forma', 'Mueblería de diseño', 'bauhaus', '#f1ead8', '#141414', '#d6312b'),
  b('garabato', 'Garabato', 'Papelería y regalos', 'memphis', '#ffffff', '#1a1a1a', '#ff5aa5'),
  b('brillo', 'Brillo', 'Accesorios y bisutería', 'y2k', '#e9dcff', '#2a1660', '#9b7bff'),
  b('telar', 'Telar', 'Textiles de alpaca del norte', 'andino', '#b5442b', '#fbf1e1', '#e2a33a'),
  b('valdes', 'Imprenta Valdés', 'Invitaciones y papelería fina', 'letterpress', '#f4efe6', '#2b2a6b', '#c0392b'),
  b('ruido', 'Ruido', 'Sello de música independiente', 'collage', '#e6e3dc', '#0d0d0d', '#ff3b1f'),
  b('andes', 'Andes Dental', 'Clínica dental', 'clinico', '#ffffff', '#0f2b3a', '#0f9b8e'),
]

// Dónde vive cada boceto. Con `.html`: así abre igual en `vite` (que sirve
// public/ tal cual) y en Cloudflare (que redirige a la ruta sin extensión).
export const rutaDeBoceto = (slug) => `/brief/bocetos/${slug}.html`
