import type { ItemPlanning, Receta, ItemInventario } from '../store/types'
import { generarIngredientesCompra } from './compra/generarIngredientesCompra'
import { separarIngredientesPorInventario } from './compra/inventarioCompra'
import { obtenerClaveIngredienteCompra } from './compra/normalizacionCompra'
import { costeIngrediente } from './compra/costeIngrediente'
import { sobraProponible } from './sobrasSeguras'

export type PrecioUnitario = { precio: number; cantidad: number; unidad: string }
export type Precios = Record<string, PrecioUnitario>

export function calcularCompraActual(planning: ItemPlanning[], recetas: Receta[], inventario: ItemInventario[], desde: string, hasta: string) {
  const pendientes = planning.filter(p=>p.fecha>=desde && p.fecha<=hasta && !p.cocinado)
  return separarIngredientesPorInventario(generarIngredientesCompra(pendientes,recetas),inventario)
}

export function calcularPresupuesto(planning: ItemPlanning[], recetas: Receta[], inventario: ItemInventario[], desde: string, hasta: string, precios: Precios) {
  const compra = calcularCompraActual(planning,recetas,inventario,desde,hasta).paraComprar
  let estimado = 0
  let sinPrecio = 0
  for(const item of compra) {
    const precio = precios[obtenerClaveIngredienteCompra(item.nombre)]
    const coste = precio ? costeIngrediente(
      item.cantidadFaltante,item.unidad,precio.precio,precio.cantidad,precio.unidad
    ) : null
    if(coste === null) {
      sinPrecio++
      continue
    }
    estimado += coste
  }
  return {estimado:Math.round(estimado*100)/100,sinPrecio,total:compra.length}
}

export function preparacionesAnticipadas(planning:ItemPlanning[],recetas:Receta[],desde:string,hasta:string) {
  const tareas:{fecha:string;texto:string;receta:string}[]=[]
  for(const hueco of planning.filter(p=>!p.cocinado && p.fecha>=desde && p.fecha<=hasta)) {
    const ids=hueco.recetaIds?.length?hueco.recetaIds:hueco.recetaId?[hueco.recetaId]:[]
    for(const id of ids) {
      const receta=recetas.find(r=>r.id===id)
      if(!receta) continue
      if(receta.requiereDescongelar) {
        const fecha=new Date(hueco.fecha+'T12:00:00')
        fecha.setDate(fecha.getDate()-1)
        const previa=[fecha.getFullYear(),String(fecha.getMonth()+1).padStart(2,'0'),String(fecha.getDate()).padStart(2,'0')].join('-')
        tareas.push({fecha:previa,texto:'Revisar y pasar a la nevera lo que necesite descongelarse (según tamaño y seguridad alimentaria)',receta:receta.nombre})
      }
      if(receta.tiempo>45) tareas.push({fecha:hueco.fecha,texto:'Reservar '+receta.tiempo+' min de elaboración (estimación de la receta)',receta:receta.nombre})
    }
  }
  return tareas.sort((a,b)=>a.fecha.localeCompare(b.fecha))
}

export function sugerirSobras(inventario:ItemInventario[],recetas:Receta[],hoy=new Date().toISOString().slice(0,10)) {
  const sobras=inventario.filter(i=>sobraProponible(i,hoy))
  return sobras.map(item=>{
    const nombre=item.nombre.replace(/^Preparación:\s*/i,'')
    const clave=obtenerClaveIngredienteCompra(nombre)
    const candidatas=recetas.filter(r=>{
      const nombreReceta=obtenerClaveIngredienteCompra(r.nombre)
      if(nombreReceta===clave)return true
      return clave.length>=4 && r.ingredientes.some(ing=>{
        const ingrediente=obtenerClaveIngredienteCompra(ing)
        return ingrediente.length>=4 && (ingrediente===clave || ingrediente.includes(clave) || clave.includes(ingrediente))
      })
    }).slice(0,3)
    return {item,recetas:candidatas}
  }).sort((a,b)=>(a.item.fechaCaducidad??'9999').localeCompare(b.item.fechaCaducidad??'9999'))
}
