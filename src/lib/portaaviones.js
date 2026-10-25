/**
 * El portaaviones «Sitting Ducks» y su escolta, celda por celda, como el pato
 * (lib/pato.js) y en la misma `Celdas.jsx`. Es un Nimitz visto por estribor y
 * a contraluz del sol, que está a la derecha: casco oscuro y el 15 en la proa,
 * por los quince patos. Una letra por punto: g casco, s sombra del casco, i
 * isla, d cubierta, w marcas blancas, k ventanas, r franja de flotación y a
 * aviones en cubierta. El punto es vacío.
 */

export const COLORES_BARCO = {
  g: '#46515c',
  s: '#323b44',
  i: '#56626e',
  d: '#2b3239',
  w: '#b9a79a',
  k: '#1b2127',
  r: '#5a2622',
  a: '#5b6772',
}

export const BARCO = [
  '.......................................i............................................................',
  '....................................iiiiiii.........................................................',
  '......................................iii...........................................................',
  '..................................iii.iii..i........................................................',
  '..................................iiiiiiiiii........................................................',
  '..................................iiiiiiiiii........................................................',
  '.................................iiiiiiiiiiiii......................................................',
  '..................................ikkkkkkkkki.......................................................',
  '..................................iiiiiiiiiii.......................................................',
  '........aa.....aa.....aa..........iiikkkkkiii.....aa.....aa.....aa.....aa..............aa...........',
  '........aaaaaa.aaaaaa.aaaaaa......iiiiiiiiiii.....aaaaaa.aaaaaa.aaaaaa.aaaaaa..........aaaaaa.......',
  'ddddddddwwddwwddwwddwwddwwddwwddwwddwwddwwddwwddwwddwwddwwddwwddwwddwwddwwddwwddwwddwwddwwdddddddddd',
  'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  'ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss',
  '...gssssssssssssssggggggggiiiiiiiiggggggggggggggggggggggggggggggggggggiiiiiiiiggggggggwgwwwggggggg..',
  '...gggggggggggggggggggggggiiiiiiiiggggggggggggggggggggggggggggggggggggiiiiiiiigggggggwwgwgggggggg...',
  '...gggggggggggggggggggggggiiiiiiiiggggggggggggggggggggggggggggggggggggiiiiiiiiggggggggwgwwwggggg....',
  '...gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggwgggwgggg.....',
  '..ggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggwgwwwggg......',
  '..grrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr.......',
]

// Un destructor lejano de la escolta, en un solo tono: hundido en la bruma.
export const COLORES_ESCOLTA = { g: '#6f7d8c' }

export const ESCOLTA = [
  '.............g................',
  '...........ggggg..............',
  '...........ggggg..............',
  '......gggggggggggggg..ggg.....',
  'g.....gggggggggggggg..ggg..gg.',
  'ggggggggggggggggggggggggggggg.',
  'ggggggggggggggggggggggggggggg.',
  '.ggggggggggggggggggggggggggg..',
]
