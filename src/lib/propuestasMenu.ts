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
 minutosMaximos:number, priorizarInventario:boolean,
) {
 const restricciones = perfiles.flatMap(p=>[...p.allergies,...p.intolerances,...p.dislikes])
 const favoritos = perfiles.flatMap(p=>p.favorites)
 const combinadas:PreferenciasAlimentarias = {
  ingredientesProhibidos:[...new Set([...preferencias.ingredientesProhibidos,...restricciones].map(x=>x.trim()).filter(Boolean))],
  ingredientesFavoritos:[...new Set([...preferencias.ingredientesFavoritos,...favoritos].map(x=>x.trim()).filter(Boolean))],
 }
 const elegibles=recetas.filter(r=>
  (!r.tiempo || r.tiempo<=minutosMaximos) &&
  recetaPermitida(r,combinadas) &&
  recetaCompatibleHogar(r,hogar))
 return {
  ...generarMenuSemanal(fechas,elegibles,planning,combinadas,inventario,hogar,priorizarInventario),
  elegibles,
  restricciones:combinadas,
 }
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
