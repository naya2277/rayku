import type { ItemInventario } from '../store/types'
/**
 * Conservative proposal filter, not a judgment that food is safe to eat.
 * Unknown fridge age cannot be considered a valid available leftover.
 */
export function sobraProponible(item:ItemInventario,hoy:string):boolean{
 if(!item.esCocinado || item.cantidad<=0 || item.ubicacion==='pendiente')return false
 if(item.fechaCaducidad)return item.fechaCaducidad>=hoy
 if(!item.fechaPreparacion)return false
 if(item.fechaPreparacion>hoy)return false
 if(item.ubicacion==='congelador')return true
 const preparada=new Date(item.fechaPreparacion+'T12:00:00Z')
 const actual=new Date(hoy+'T12:00:00Z')
 const dias=(actual.getTime()-preparada.getTime())/86400000
 return Number.isFinite(dias) && dias>=0 && dias<=2
}
