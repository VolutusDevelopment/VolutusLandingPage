/**
 * La paleta de las cards, en orden: la costa —mar hondo, roca, coral,
 * atardecer, arena quemada, alga, huiro y ola—, colores hondos para contrastar
 * con el cielo y sin morado (DESIGN-BRIEF, A.2). El blanco encima da 5.5:1 o
 * más. El color va con el lugar y no con el servicio: el primero lleva siempre
 * el mar hondo, y si cambia el orden cada uno toma el color de su lugar nuevo.
 *
 * Va aparte de lib/servicios.js para que el navegador, que solo la quiere para
 * la estela de la ola (ola.js), no cargue también los textos de los servicios.
 */
export const PALETA = ['#007192', '#405f74', '#b8342c', '#af4000', '#905500', '#005d37', '#007156', '#00588d']
