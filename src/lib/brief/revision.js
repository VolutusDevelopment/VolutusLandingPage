/**
 * Lo que la revisión del brief (brief.js) señala como «no calza»: respuestas
 * que se contradicen o que dejan algo a medias. No son errores: la persona lo
 * arregla o lo deja así, y se conversa en la reunión.
 *
 * Cada regla recibe lo respondido (`r.todos(nombre)` da los valores de un
 * campo, sin los vacíos; `r.etiqueta(nombre, valor)`, lo que significa ese
 * valor en palabras) y devuelve su aviso o nada. `pregunta` es adonde lleva el
 * enlace para arreglarlo.
 */

import { BOCETOS } from './bocetos.js'
import { campoBoceto, campoColor } from './reglas.js'

const numero = (r, nombre) => Number(r.todos(nombre)[0] ?? 0)
const elegido = (r, nombre, valor) => r.todos(nombre).includes(valor)
const enLista = (nombres) => (nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}` : nombres[0])

// Un estilo es elegido si le gusta su boceto (bocetos.js).
const leGusta = (r, estilo) => elegido(r, campoBoceto(BOCETOS.find((boceto) => boceto.estilo === estilo).slug), 'si')

// Un estilo elegido junto a una escala que tira para el otro lado.
const estiloContraEscala = (estilo, escala, choca, titulo, texto) => ({
  pregunta: escala,
  revisar: (r) => leGusta(r, estilo) && choca(numero(r, escala)) && { titulo, texto },
})

export const INCOHERENCIAS = [
  {
    pregunta: 'familias_no',
    revisar(r) {
      const ambas = r.todos('familias_si').filter((familia) => elegido(r, 'familias_no', familia))
      return (
        ambas.length > 0 && {
          titulo: 'Un color está en las dos listas',
          texto: `Marcaste ${enLista(ambas.map((familia) => r.etiqueta('familias_si', familia)))} entre los colores que te atraen y también entre los que no quieres ver.`,
        }
      )
    },
  },
  estiloContraEscala(
    'minimalista',
    'densidad',
    (n) => n >= 4,
    'Minimalista, pero con mucha información',
    'Te gustó el estilo Minimalista y dejaste la cantidad de cosas en pantalla hacia «Completo». Puede funcionar, pero conviene conversarlo.'
  ),
  estiloContraEscala(
    'zen',
    'movimiento_escala',
    (n) => n >= 4,
    'Zen, pero con mucho movimiento',
    'Te gustó Zen / japonés, que es calma, y pediste animaciones protagonistas.'
  ),
  estiloContraEscala(
    'ludico',
    'actitud',
    (n) => n > 0 && n <= 2,
    'Lúdico, pero serio',
    'Te gustó el estilo Lúdico y dejaste la actitud hacia «Serio».'
  ),
  estiloContraEscala(
    'brutalista',
    'formas',
    (n) => n >= 4,
    'Brutalista, pero redondeado',
    'Te gustó Brutalista, que es de bordes duros, y pediste formas redondeadas.'
  ),
  {
    pregunta: 'movimiento',
    revisar: (r) =>
      elegido(r, 'movimiento', 'quieto') &&
      numero(r, 'movimiento_escala') >= 4 && {
        titulo: '¿Quieto o dinámico?',
        texto: 'En «Cómo se ve» pediste animaciones protagonistas, y en «Imágenes y estructura», un sitio quieto.',
      },
  },
  {
    pregunta: 'colores',
    revisar: (r) =>
      (elegido(r, 'tiene_colores', 'si') || elegido(r, 'tiene_colores', 'flexibles')) &&
      [1, 2, 3, 4].every((n) => !r.todos(campoColor('colores', n)).length) && {
        titulo: 'Tus colores, sin anotar',
        texto: 'Dijiste que tu marca ya tiene colores, pero no anotaste cuáles. Con el código o el nombre basta.',
      },
  },
  {
    pregunta: 'empresa',
    revisar: (r) =>
      (elegido(r, 'tiene_nombre', 'mantener') || elegido(r, 'tiene_nombre', 'abierto')) &&
      !r.todos('empresa').length && {
        titulo: 'Tu nombre de negocio, sin anotar',
        texto: 'Dijiste que tu negocio ya tiene nombre, pero no lo anotaste en la primera parte.',
      },
  },
  {
    pregunta: 'tipo_nombre',
    revisar: (r) =>
      elegido(r, 'tiene_nombre', 'mantener') &&
      r.todos('tipo_nombre').length > 0 && {
        titulo: '¿Nombre nuevo o el de siempre?',
        texto: 'Dijiste que mantienes tu nombre y también elegiste qué tipo de nombre nuevo te gusta.',
      },
  },
]

// Los avisos de lo respondido, en el orden de las reglas.
export const incoherencias = (r) => INCOHERENCIAS.map((regla) => ({ ...regla.revisar(r), pregunta: regla.pregunta })).filter(({ titulo }) => titulo)
