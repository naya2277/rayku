import { useEffect, useState } from 'react'
import { readFoodProfiles, saveFoodProfile, type FoodProfile } from '../../lib/foodProfiles'
import { listaTexto, cargarPerfilHogar } from '../../lib/perfilHogar'
import { useRaykuStore } from '../../store'
const blank = {display_name:'',allergies:[],intolerances:[],dislikes:[],favorites:[],diets:[]} satisfies Omit<FoodProfile,'user_id'>
export default function MyFoodProfile({householdId,userId,isOwner=false}:{householdId:string,userId:string,isOwner?:boolean}) {
  const [profile,setProfile]=useState<Omit<FoodProfile,'user_id'>>(blank)
  const [status,setStatus]=useState('')
  const [drafts,setDrafts]=useState<Record<string,string>>({})
  const [loaded,setLoaded]=useState(false)
  useEffect(()=>{
    let active=true
    setLoaded(false)
    readFoodProfiles(householdId).then(profiles=>{
      if(!active)return
      const mine=profiles.find(p=>p.user_id===userId)
      const legacy = isOwner ? cargarPerfilHogar().personas[0] : undefined
      const historicas = isOwner ? useRaykuStore.getState().preferenciasAlimentarias : undefined
      const initial: Omit<FoodProfile,'user_id'> = mine
        ? {display_name:mine.display_name,allergies:mine.allergies,intolerances:mine.intolerances,dislikes:mine.dislikes,favorites:mine.favorites,diets:mine.diets}
        : isOwner ? {
            display_name:legacy?.nombre?.startsWith('Persona ') ? '' : legacy?.nombre ?? '',
            allergies:[],
            intolerances:[],
            dislikes:[...new Set([...(legacy?.prohibidos??[]),...(legacy?.rechazadas??[]),...(historicas?.ingredientesProhibidos??[])])],
            favorites:[...new Set([...(legacy?.favoritos??[]),...(historicas?.ingredientesFavoritos??[])])],
            diets:legacy?.dietas??[],
          } : blank
      setProfile(initial)
      setDrafts(Object.fromEntries((['allergies','intolerances','dislikes','favorites','diets'] as const).map(key=>[key,initial[key].join(', ')])))
      setLoaded(true)
    }).catch(e=>{if(active)setStatus('No se pueden cargar los perfiles. Ejecuta la migración 006 en Supabase: '+String(e))})
    return()=>{active=false}
  },[householdId,userId,isOwner])
  const edit=(field: keyof typeof blank,value:string)=>{
    if(field==='display_name')setProfile(p=>({...p,display_name:value}))
    else setDrafts(p=>({...p,[field]:value}))
  }
  return <section style={{marginTop:16,padding:12,border:'1px solid #eddbe7',borderRadius:12}}>
    <h3>👤 Mi perfil alimentario</h3>
    <p>Solo tú puedes modificar tus restricciones. Los miembros de tu hogar pueden verlas para planificar sin riesgos.</p>
    {loaded && <form onSubmit={async e=>{e.preventDefault();setStatus('Guardando…');try{await saveFoodProfile({...profile,allergies:listaTexto(drafts.allergies??''),intolerances:listaTexto(drafts.intolerances??''),dislikes:listaTexto(drafts.dislikes??''),favorites:listaTexto(drafts.favorites??''),diets:listaTexto(drafts.diets??'')});setStatus('Perfil guardado')}catch(err){setStatus('Error al guardar: '+String(err))}}} style={{display:'grid',gap:10}}>
      <label>Nombre<input value={profile.display_name} onChange={e=>edit('display_name',e.target.value)}/></label>
      {([['allergies','Alergias (seguridad)'],['intolerances','Intolerancias'],['dislikes','Ingredientes que no me gustan'],['favorites','Ingredientes favoritos'],['diets','Dietas o pautas']] as const).map(([key,label])=><label key={key}>{label}<textarea rows={2} value={drafts[key]??''} onChange={e=>edit(key,e.target.value)} placeholder="Separa ingredientes con comas"/></label>)}
      <button type="submit" className="btn-principal">Guardar mis preferencias</button>
    </form>}
    {status && <p role="status">{status}</p>}
  </section>
}
