/**
 * Conservación ORIENTATIVA para planificar una compra de frescos.
 * No sustituye la caducidad del envase ni garantiza seguridad alimentaria.
 */
export function normalizarConservacion(nombre: string): string {
 return nombre.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/\s+/g,' ').trim()
}
export function conservacionOrientativaDias(nombre: string): number | null {
 const n=normalizarConservacion(nombre)
 if (/ensalada|lechuga|canonigo|rucula|brotes|espinaca|fresa|frambuesa|mora|champinon|seta/.test(n)) return 2
 if (/pescado|salmon|bacalao|merluza|atun fresco|lubina|trucha|gamba|langostino|sepia|calamar|mejillon|marisco/.test(n)) return 1
 if (/pollo|pavo|carne picada|ternera|cerdo|cordero|solomillo|lomo|costilla|secreto|magro|entrecot|chuleta|alita/.test(n)) return 2
 if (/brocoli|esparrago|judia verde|berenjena|calabacin|coliflor/.test(n)) return 4
 if (/tomate|pepino|pimiento|zanahoria|manzana|pera|limon|naranja/.test(n)) return 6
 if (/yogur|queso fresco|nata fresca|leche fresca/.test(n)) return 4
 return null
}
export function aplazarCompraFresh(fechaUso: string, fechaHoy: string, dias: number|null):boolean {
 if(dias === null) return false
 const uso=new Date(fechaUso+'T12:00:00Z')
 const hoy=new Date(fechaHoy+'T12:00:00Z')
 if(Number.isNaN(uso.getTime()) || Number.isNaN(hoy.getTime())) return false
 const diff=Math.floor((uso.getTime()-hoy.getTime())/86400000)
 return diff>dias
}
