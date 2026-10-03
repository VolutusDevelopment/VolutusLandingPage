/**
 * Textos del juego. Para agregar o cambiar uno, edita estas listas: cada
 * chiste es una lista de renglones. Se admiten tildes, Ñ y signos españoles;
 * las líneas largas se acomodan solas al ancho del globo.
 */

export const BURLAS = [
  ['¡JA, JA, JA!'],
  ['¡FALLASTE!'],
  ['¡NO ME DAS!'],
  ['¡QUÉ MALA PUNTERÍA!'],
]

// Se muestra uno por nivel, en este orden; al terminar la lista, vuelve al
// primero. Puedes reordenar o reemplazar los renglones sin tocar el pintor.
export const RECLAMOS = [
  ['LE VOY A', 'CONTAR A', 'TU MAMÁ…'],
  ['¡VAYA, SÍ QUE', 'ERES DEDICADO!'],
  ['¡FELICIDADES!', 'MATASTE A', 'TODA MI', 'FAMILIA.'],
  ['ESPERO QUE', 'DUERMAS', 'TRANQUILO…'],
  ['TODO ESTO', 'POR UNA', 'PÁGINA.'],
]

export const NIVELES = ['FÁCIL', 'MEDIO', 'DIFÍCIL', 'MUY DIFÍCIL', 'ODIO A LOS PATOS']
