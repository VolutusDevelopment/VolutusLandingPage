/**
 * Las figuras de las dos áreas del brief, en una grilla de 40: un libro para
 * Marca y un lápiz para Diseño. Son de colores sólidos: cada trazado va en
 * `fuerte`, el color del área, o en `suave`, el mismo más claro, y se pintan
 * en orden. Las dibujan la página (paginas/Brief.jsx) y el PDF del correo
 * (worker/pdf-del-brief.js).
 *
 * El número de la parte va encima, en blanco: en la tapa del libro y en el
 * cuerpo del lápiz. `centro` es el punto donde cae.
 */
export const FIGURAS = {
  marca: {
    trazos: [
      ['suave', 'M11 30H32V36H11A3 3 0 0 1 11 30Z'],
      ['fuerte', 'M11 4H32V29H11A3 3 0 0 0 8 32V7A3 3 0 0 1 11 4Z'],
      ['suave', 'M25.5 4H29.5V12L27.5 10.5 25.5 12Z'],
    ],
    centro: [20, 18],
  },
  diseno: {
    trazos: [
      ['suave', 'M12 12 2 20 12 28Z'],
      ['fuerte', 'M2 20 6.4 16.5V23.5Z'],
      ['fuerte', 'M12 12H31V28H12Z'],
      ['suave', 'M31 12H34V28H31Z'],
      ['fuerte', 'M34 12H35A3 3 0 0 1 38 15V25A3 3 0 0 1 35 28H34Z'],
    ],
    centro: [21.5, 20],
  },
}
