/**
 * El portaaviones «Sitting Ducks» y su escolta, celda por celda, como el pato
 * (lib/pato.js) y en la misma `Celdas.jsx`. Es un Nimitz visto por estribor y
 * a contraluz del sol, que está a la derecha: casco oscuro, borde naranja por
 * el lado del sol y el 15 en la proa, por los quince patos. Una letra por
 * punto: g casco, s sombra del casco, i isla, d cubierta, w marcas blancas, k
 * ventanas, r franja de flotación, a aviones en cubierta y o el borde
 * naranja. El punto es vacío.
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
  o: '#ffa95e',
}

export const BARCO = [
  '.......................................o............................................................',
  '....................................oooiooo.........................................................',
  '......................................iio...........................................................',
  '..................................ooo.iio..o........................................................',
  '..................................iiioiiiooo........................................................',
  '..................................iiiiiiiiio........................................................',
  '.................................oiiiiiiiiiioo......................................................',
  '..................................ikkkkkkkkko.......................................................',
  '..................................iiiiiiiiiio.......................................................',
  '........oo.....oo.....oo..........iiikkkkkiio.....oo.....oo.....oo.....oo..............oo...........',
  '........aaoooo.aaoooo.aaoooo......iiiiiiiiiio.....aaoooo.aaoooo.aaoooo.aaoooo..........aaoooo.......',
  'oooooooowwddwwodwwddwoddwwddooooooddwwddwwddwoooooddwwddowddwwdowwddwwodwwddwoooooooooodwwdddooooooo',
  'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  'ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss',
  '...gssssssssssssssggggggggiiiiiiiiggggggggggggggggggggggggggggggggggggiiiiiiiiggggggggwgwwwggggggo..',
  '...gggggggggggggggggggggggiiiiiiiiggggggggggggggggggggggggggggggggggggiiiiiiiigggggggwwgwgggggggo...',
  '...gggggggggggggggggggggggiiiiiiiiggggggggggggggggggggggggggggggggggggiiiiiiiiggggggggwgwwwggggo....',
  '...gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggwgggwgggo.....',
  '..ogggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggwgwwwggo......',
  '..grrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrro.......',
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
