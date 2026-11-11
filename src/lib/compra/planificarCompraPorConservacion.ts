import { addDays, compareAsc, format, isAfter, parseISO, startOfDay, subDays } from 'date-fns'
import { generarIngredientesCompra } from './generarIngredientesCompra'
import { unidadesCompraCompatibles } from './normalizacionCompra'
import { conservacionOrientativaDias } from './conservacionCompra'
import type { IngredienteCompra, HuecoPlanningListaCompra, RecetaListaCompra } from './types'

export type HuecoCompraFechado = HuecoPlanningListaCompra & { fecha: string; cocinado?: boolean }
export type CompraProgramada = IngredienteCompra & {
  primeraUtilizacion: string
  fechasUso: string[]
  comprarDesde: string
  conservacionDias: number | null
}
type Resultado = { ahora: CompraProgramada[]; despues: CompraProgramada[] }


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
