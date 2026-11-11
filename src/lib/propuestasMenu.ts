import type { FoodProfile } from './foodProfiles'
import type { ItemPlanning, Receta, PreferenciasAlimentarias, ItemInventario } from '../store/types'
import type { PerfilHogar } from './perfilHogar'
import { generarMenuSemanal, recetaPermitida, recetaCompatible, recetaCompatibleHogar } from './generarMenuSemanal'

/**
 * Generate a draft without writing to the shared store.
 * Restrictions from every member are included for a shared meal.
 * This is a textual screening, not a clinical allergy verification.
 */
export function generarPropuestasHogar(
 fechas:string[], recetas:Receta[], planning:ItemPlanning[], inventario:ItemInventario[],
 perfiles:FoodProfile[], preferencias:PreferenciasAlimentarias, hogar:PerfilHogar,
 minutosMaximos:number, priorizarInventario:boolean, limitesPorFecha:Record<string,number>={},
) {
 const restricciones = perfiles.flatMap(p=>[...p.allergies,...p.intolerances,...p.dislikes])
 const favoritos = perfiles.flatMap(p=>p.favorites)
 const combinadas:PreferenciasAlimentarias = {
  ingredientesProhibidos:[...new Set([...preferencias.ingredientesProhibidos,...restricciones].map(x=>x.trim()).filter(Boolean))],
  ingredientesFavoritos:[...new Set([...preferencias.ingredientesFavoritos,...favoritos].map(x=>x.trim()).filter(Boolean))],
 }
 const elegibles=recetas.filter(r=>
  recetaPermitida(r,combinadas) && recetaCompatibleHogar(r,hogar))
 const propuestas:ReturnType<typeof generarMenuSemanal>['propuestas']=[]
 const sinCubrir:string[]=[]
 // Score each day against the current calendar plus earlier draft choices.
 // Calling the generator one day at a time lets families define busy days.
 for(const fecha of [...fechas].sort()){
  const limite=limitesPorFecha[fecha]??minutosMaximos
  const disponibles=elegibles.filter(r=>!r.tiempo || r.tiempo<=limite)
  const resultado=generarMenuSemanal([fecha],disponibles,
    [...planning,...propuestas.map(p=>({
      id:'borrador-'+p.fecha+'-'+p.tipoComida,fecha:p.fecha,tipoComida:p.tipoComida,
      recetaId:p.recetaId,recetaIds:[p.recetaId],comidaLibre:'',nota:'',cocinado:false,
    }))],combinadas,inventario,hogar,priorizarInventario)
  propuestas.push(...resultado.propuestas)
  sinCubrir.push(...resultado.sinCubrir)
 }
 return {propuestas,sinCubrir,elegibles,restricciones:combinadas}

}

export function validarPropuestaHogar(
 receta:Receta, tipo:'comida'|'cena', restricciones:PreferenciasAlimentarias,
 hogar:PerfilHogar, minutosMaximos:number,
):boolean {
 return (!receta.tiempo || receta.tiempo<=minutosMaximos) &&
  recetaPermitida(receta,restricciones) &&
  recetaCompatibleHogar(receta,hogar) &&
  recetaCompatible(receta,tipo)
}
