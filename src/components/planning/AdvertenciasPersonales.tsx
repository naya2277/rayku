import { useEffect, useState } from 'react'
import { cargarPerfilHogar, type PerfilHogar } from '../../lib/perfilHogar'
import { normalizarIngrediente } from '../../lib/generarMenuSemanal'
import { useRaykuStore } from '../../store'
import type { ItemPlanning } from '../../store/types'

export default function AdvertenciasPersonales({item}: {item: ItemPlanning}) {
  const [perfil,setPerfil] = useState<PerfilHogar>(cargarPerfilHogar)
  const recetas = useRaykuStore(s=>s.recetas)
  useEffect(()=>{
    const refresh=()=>setPerfil(cargarPerfilHogar())
    window.addEventListener('rayku-perfil-actualizado',refresh)
    return ()=>window.removeEventListener('rayku-perfil-actualizado',refresh)
  },[])
  const ids = [...new Set([...(item.recetaIds??[]),...(item.recetaId?[item.recetaId]:[]),...Object.values(item.platosPorPersona??{}).flatMap(p=>p.recetaId?[p.recetaId]:[])])]
  const textos = [
    item.comidaLibre,
    ...ids.flatMap(id=>{const r=recetas.find(x=>x.id===id);return r?[r.nombre,...r.ingredientes,...r.ingredientesBase]:[]}),
    ...Object.values(item.platosPorPersona??{}).map(p=>p.comidaLibre),
  ].map(normalizarIngrediente)
  const advertencias = perfil.personas.flatMap(p=>p.prohibidos.filter(ingrediente=>{
    const clave=normalizarIngrediente(ingrediente)
    return clave.length>0 && textos.some(t=>t.includes(clave))
  }).map(ingrediente=>({nombre:p.nombre,ingrediente})))
  if (!advertencias.length) return null
  return <div role="status" style={{marginTop:10,padding:10,borderRadius:10,background:'#fff3d6',color:'#704b16'}}>
    <strong>⚠️ Atención: preferencias o restricciones alimentarias</strong>
    <ul style={{marginBottom:0}}>{advertencias.map((a,i)=><li key={i}>Contiene «{a.ingrediente}»: aviso para {a.nombre}</li>)}</ul>
    <small>Revisa los ingredientes y posibles trazas. Este aviso no sustituye la comprobación de alérgenos y no distingue aún alergias de alimentos que no gustan.</small>
  </div>
}
