import type {ItemInventario,ItemPlanning,Receta,TipoComida} from '../store/types'
import {calcularPresupuesto,type Precios} from './planificacionInteligente'
export type Ahorro={fecha:string;tipoComida:TipoComida;actual:Receta;alternativa:Receta;ahorro:number}
export function sugerirAlternativasAhorro(
 planning:ItemPlanning[],recetas:Receta[],inventario:ItemInventario[],precios:Precios,
 desde:string,hasta:string,
):Ahorro[]{
 const alternativas:Ahorro[]=[]
 const espacio=planning.filter(p=>p.fecha>=desde&&p.fecha<=hasta&&!p.cocinado)
 for(const hueco of espacio){
  const original=recetas.find(r=>r.id===hueco.recetaId)
  if(!original)continue
  const costeActual=calcularPresupuesto([hueco],recetas,inventario,hueco.fecha,hueco.fecha,precios)
  if(costeActual.sinPrecio!==0||costeActual.total===0)continue
  for(const r of recetas){
   if(r.id===original.id || !r.tiempo || (r.tiposComida.length &&
     !r.tiposComida.some(t=>t===hueco.tipoComida || t==='ambos')))continue
   const prueba={...hueco,recetaId:r.id,recetaIds:[r.id]}
   const coste=calcularPresupuesto([prueba],recetas,inventario,hueco.fecha,hueco.fecha,precios)
   if(coste.sinPrecio!==0 || coste.total===0)continue
   const ahorro=Math.round((costeActual.estimado-coste.estimado)*100)/100
   if(ahorro>=0.5)alternativas.push({fecha:hueco.fecha,tipoComida:hueco.tipoComida,actual:original,alternativa:r,ahorro})
  }
 }
 return alternativas.sort((a,b)=>b.ahorro-a.ahorro).slice(0,6)
}
