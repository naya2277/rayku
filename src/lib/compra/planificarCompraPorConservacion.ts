import { addDays, compareAsc, format, isAfter, parseISO, startOfDay, subDays } from 'date-fns'
import { generarIngredientesCompra } from './generarIngredientesCompra'
import { obtenerClaveIngredienteCompra, unidadesCompraCompatibles } from './normalizacionCompra'
import type { IngredienteCompra, HuecoPlanningListaCompra, RecetaListaCompra } from './types'

export type HuecoCompraFechado = HuecoPlanningListaCompra & { fecha: string; cocinado?: boolean }
export type CompraProgramada = IngredienteCompra & {
  primeraUtilizacion: string
  fechasUso: string[]
  comprarDesde: string
  conservacionDias: number | null
}
type Resultado = { ahora: CompraProgramada[]; despues: CompraProgramada[] }

/**
 * Duraciones deliberadamente conservadoras para producto fresco sin abrir,
 * refrigerado correctamente. Son orientación para planificar la compra,
 * NUNCA una fecha de caducidad ni una garantía sanitaria.
 * La fecha del envase tiene prioridad.
 */
export function conservacionOrientativaDias(nombre: string): number | null {
 const n=obtenerClaveIngredienteCompra(nombre)
 if (/ensalada|lechuga|canonigo|rucula|brotes|espinaca|fresa|frambuesa|mora|champinon|seta/.test(n)) return 2
 if (/pescado|salmon|bacalao|merluza|atun fresco|lubina|trucha|gamba|langostino|sepia|calamar|mejillon|marisco/.test(n)) return 1
 if (/pollo|pavo|carne picada|ternera|cerdo|cordero|solomillo|lomo|costilla|secreto|magro|entrecot|chuleta|alita/.test(n)) return 2
 if (/brocoli|esparrago|judia verde|berenjena|calabacin|coliflor/.test(n)) return 4
 if (/tomate|pepino|pimiento|zanahoria|manzana|pera|limon|naranja/.test(n)) return 6
 if (/yogur|queso fresco|nata fresca|leche fresca/.test(n)) return 4
 // Conservas, congelados, especias, pasta, etc. depend on their packaging.
 return null
}

function agregar(mapa: Map<string,CompraProgramada>, item: IngredienteCompra, fecha: string, desde: string, dias: number|null) {
 const anterior=mapa.get(item.clave)
 if (!anterior) {
  mapa.set(item.clave,{...item, primeraUtilizacion:fecha, fechasUso:[fecha],comprarDesde:desde,conservacionDias:dias})
  return
 }
 anterior.veces+=item.veces
 if(item.cantidad!==null && anterior.cantidad!==null && unidadesCompraCompatibles(anterior.unidad,item.unidad)) {
   anterior.cantidad=Math.round((anterior.cantidad+item.cantidad)*100)/100
 } else {
   anterior.cantidad=null
   anterior.unidad=null
 }
 if(fecha<anterior.primeraUtilizacion) anterior.primeraUtilizacion=fecha
 if(desde<anterior.comprarDesde) anterior.comprarDesde=desde
 if(!anterior.fechasUso.includes(fecha)) anterior.fechasUso.push(fecha)
}

export function planificarCompraPorConservacion(
 planning: HuecoCompraFechado[], recetas: RecetaListaCompra[], hoy: Date
): Resultado {
 const ahora=new Map<string,CompraProgramada>(),despues=new Map<string,CompraProgramada>()
 const hoyDia=startOfDay(hoy)
 for(const hueco of [...planning].filter(x=>!x.cocinado).sort((a,b)=>a.fecha.localeCompare(b.fecha))) {
  const fecha=parseISO(hueco.fecha)
  if(Number.isNaN(fecha.getTime()) || compareAsc(startOfDay(fecha),hoyDia)<0) continue
  const ingredientes=generarIngredientesCompra([hueco],recetas)
  for(const item of ingredientes) {
    const dias=conservacionOrientativaDias(item.nombre)
    const desde=dias===null ? hoyDia : startOfDay(subDays(fecha,dias))
    const postergar=dias!==null && isAfter(desde,hoyDia)
    const destino=postergar?despues:ahora
    agregar(destino,item,hueco.fecha,format(desde,'yyyy-MM-dd'),dias)
  }
 }
 for(const item of [...ahora.values(),...despues.values()])item.fechasUso.sort()
 return {ahora:[...ahora.values()],despues:[...despues.values()].sort((a,b)=>a.comprarDesde.localeCompare(b.comprarDesde))}
}

export function fechaCompraRecomendada(fechaUso:string,dias:number):string {
 return format(addDays(parseISO(fechaUso),-dias),'yyyy-MM-dd')
}
