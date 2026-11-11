import { useEffect, useState } from 'react'
import { cargarPerfilHogar, type PerfilHogar } from '../../lib/perfilHogar'
import { normalizarIngrediente } from '../../lib/generarMenuSemanal'
import { useRaykuStore } from '../../store'
import { readFoodProfiles, type FoodProfile } from '../../lib/foodProfiles'
import type { ItemPlanning } from '../../store/types'

export default function AdvertenciasPersonales({item,householdId}: {item: ItemPlanning; householdId?: string}) {
  const [perfil,setPerfil] = useState<PerfilHogar>(cargarPerfilHogar)
  const recetas = useRaykuStore(s=>s.recetas)
  const [members,setMembers]=useState<FoodProfile[]>([])
  useEffect(()=>{
    const refresh=()=>setPerfil(cargarPerfilHogar())
    window.addEventListener('rayku-perfil-actualizado',refresh)
    return ()=>window.removeEventListener('rayku-perfil-actualizado',refresh)
  },[])
  useEffect(()=>{
    let active=true
    const load=async()=>{
      try {
        if(!householdId)return
        const people=await readFoodProfiles(householdId)
        if(active)setMembers(people)
      } catch(e){console.warn('No se han podido consultar las restricciones del hogar',e)}
    }
    void load()
    window.addEventListener('rayku-food-profiles-updated',load)
    return()=>{active=false;window.removeEventListener('rayku-food-profiles-updated',load)}
  },[householdId])
  const ids = [...new Set([...(item.recetaIds??[]),...(item.recetaId?[item.recetaId]:[]),...Object.values(item.platosPorPersona??{}).flatMap(p=>p.recetaId?[p.recetaId]:[])])]
  const textos = [
    item.comidaLibre,
    ...ids.flatMap(id=>{const r=recetas.find(x=>x.id===id);return r?[r.nombre,...r.ingredientes,...r.ingredientesBase]:[]}),
    ...Object.values(item.platosPorPersona??{}).map(p=>p.comidaLibre),
  ].map(normalizarIngrediente)
  const legacy = perfil.personas.flatMap(p=>p.prohibidos.filter(ingrediente=>{
    const clave=normalizarIngrediente(ingrediente)
    return clave.length>0 && textos.some(t=>t.includes(clave))
  }).map(ingrediente=>({nombre:p.nombre,ingrediente})))
  const personal = members.flatMap(p=>(
    [...p.allergies.map(ingrediente=>({ingrediente,tipo:'ALERGIA'})),
     ...p.intolerances.map(ingrediente=>({ingrediente,tipo:'Intolerancia'})),
     ...p.dislikes.map(ingrediente=>({ingrediente,tipo:'No le gusta'}))]
    .filter(a=>{const key=normalizarIngrediente(a.ingrediente);return key.length>0 && textos.some(t=>t.includes(key))})
    .map(a=>({nombre:p.display_name||'Miembro del hogar',...a}))
  ))
  const advertencias = [...personal,...legacy.map(a=>({...a,tipo:'Restricción anterior'}))]
  if (!advertencias.length) return null
  return <div role="status" style={{marginTop:10,padding:10,borderRadius:10,background:'#fff3d6',color:'#704b16'}}>
    <strong>⚠️ Atención: preferencias o restricciones alimentarias</strong>
    <ul style={{marginBottom:0}}>{advertencias.map((a,i)=><li key={i}>{a.tipo} · {a.nombre}: contiene «{a.ingrediente}»</li>)}</ul>
    <small>Revisa los ingredientes y posibles trazas. En caso de alergia comprueba etiquetas, ingredientes y trazas; la coincidencia por texto no garantiza detectar todos los alérgenos.</small>
  </div>
}
