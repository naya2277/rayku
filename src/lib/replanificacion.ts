import type { ItemInventario,ItemPlanning,Receta,TipoComida } from '../store/types'
import { generarIngredientesCompra } from './compra/generarIngredientesCompra'
import { obtenerClaveIngredienteCompra } from './compra/normalizacionCompra'

export type Replan = { origenId:string; nuevaFecha:string; nuevoTipo:TipoComida }
export function evaluarReplanificacion(
 planning:ItemPlanning[],recetas:Receta[],inventario:ItemInventario[],plan:Replan,hoy:string,
):{permitido:boolean;avisos:string[]} {
 const avisos:string[]=[]
 const origen=planning.find(p=>p.id===plan.origenId)
 if(!origen)return {permitido:false,avisos:['La comida original ya no existe.']}
 if(origen.cocinado)return {permitido:false,avisos:['Una comida ya cocinada no puede replanificarse.']}
 if(plan.nuevaFecha<hoy)return {permitido:false,avisos:['No se pueden trasladar comidas al pasado.']}
 if(plan.nuevaFecha===origen.fecha && plan.nuevoTipo===origen.tipoComida)return {permitido:false,avisos:['Selecciona otro hueco.']}
 if(planning.some(p=>p.id!==origen.id && p.fecha===plan.nuevaFecha && p.tipoComida===plan.nuevoTipo))
  return {permitido:false,avisos:['Ese hueco ya tiene un plato. No lo sobrescribiremos.']}
 const requerido=generarIngredientesCompra([origen],recetas)
 for(const ingrediente of requerido){
  const clave=obtenerClaveIngredienteCompra(ingrediente.nombre)
  const caducidades=inventario.filter(i=>i.cantidad>0 && i.ubicacion==='nevera' &&
   obtenerClaveIngredienteCompra(i.nombre)===clave && Boolean(i.fechaCaducidad))
  if(caducidades.length && caducidades.every(i=>(i.fechaCaducidad??'')<plan.nuevaFecha))
   avisos.push('⚠️ '+ingrediente.nombre+' caduca antes del nuevo día; revisa stock y compra.')
 }
 avisos.push('La lista de compra se recalculará para la nueva fecha al confirmar.')
 return {permitido:true,avisos}
}
export function resultadoReplanificacion(planning:ItemPlanning[],plan:Replan,hoy:string,recetas:Receta[],inventario:ItemInventario[]):ItemPlanning[] | null{
 const evaluacion=evaluarReplanificacion(planning,recetas,inventario,plan,hoy)
 if(!evaluacion.permitido)return null
 return planning.map(p=>p.id===plan.origenId?{...p,fecha:plan.nuevaFecha,tipoComida:plan.nuevoTipo}:p)
}
