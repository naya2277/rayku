import type {ItemPlanning,TipoComida} from '../store/types'
export type PlanMovimiento={origenId:string;nuevaFecha:string;nuevoTipo:TipoComida}
export function aplicarPlanMovimiento(planning:ItemPlanning[],cambio:PlanMovimiento,hoy:string):ItemPlanning[]|null{
 const origen=planning.find(p=>p.id===cambio.origenId)
 if(!origen||origen.cocinado||cambio.nuevaFecha<hoy ||
  (origen.fecha===cambio.nuevaFecha && origen.tipoComida===cambio.nuevoTipo) ||
  planning.some(p=>p.id!==origen.id && p.fecha===cambio.nuevaFecha && p.tipoComida===cambio.nuevoTipo))
  return null
 return planning.map(p=>p.id===origen.id?{...p,fecha:cambio.nuevaFecha,tipoComida:cambio.nuevoTipo}:p)
}
