import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { readFoodProfiles, saveFoodProfile, type FoodProfile } from '../../lib/foodProfiles'
import { listaTexto } from '../../lib/perfilHogar'
const blank = {display_name:'',allergies:[],intolerances:[],dislikes:[],favorites:[],diets:[]} satisfies Omit<FoodProfile,'user_id'>
export default function MyFoodProfile({householdId,userId}:{householdId:string,userId:string}) {
  const [profile,setProfile]=useState<Omit<FoodProfile,'user_id'>>(blank)
  const [status,setStatus]=useState('')
  const [loaded,setLoaded]=useState(false)
  useEffect(()=>{
    let active=true
    setLoaded(false)
    readFoodProfiles(householdId).then(profiles=>{
      if(!active)return
      const mine=profiles.find(p=>p.user_id===userId)
      if(mine)setProfile({display_name:mine.display_name,allergies:mine.allergies,intolerances:mine.intolerances,dislikes:mine.dislikes,favorites:mine.favorites,diets:mine.diets})
      else setProfile(blank)
      setLoaded(true)
    }).catch(e=>{if(active)setStatus('No se pueden cargar los perfiles. Ejecuta la migración 006 en Supabase: '+String(e))})
    return()=>{active=false}
  },[householdId,userId])
  const edit=(field: keyof typeof blank,value:string)=>{
    if(field==='display_name')setProfile(p=>({...p,display_name:value}))
    else setProfile(p=>({...p,[field]:listaTexto(value)}))
  }
  return <section style={{marginTop:16,padding:12,border:'1px solid #eddbe7',borderRadius:12}}>
    <h3>👤 Mi perfil alimentario</h3>
    <p>Solo tú puedes modificar tus restricciones. Los miembros de tu hogar pueden verlas para planificar sin riesgos.</p>
    {loaded && <form onSubmit={async e=>{e.preventDefault();setStatus('Guardando…');try{await saveFoodProfile(profile);setStatus('Perfil guardado')}catch(err){setStatus('Error al guardar: '+String(err))}}} style={{display:'grid',gap:10}}>
      <label>Nombre<input value={profile.display_name} onChange={e=>edit('display_name',e.target.value)}/></label>
      {([['allergies','Alergias (seguridad)'],['intolerances','Intolerancias'],['dislikes','Ingredientes que no me gustan'],['favorites','Ingredientes favoritos'],['diets','Dietas o pautas']] as const).map(([key,label])=><label key={key}>{label}<textarea rows={2} value={profile[key].join(', ')} onChange={e=>edit(key,e.target.value)} placeholder="Separa ingredientes con comas"/></label>)}
      <button type="submit" className="btn-principal">Guardar mis preferencias</button>
    </form>}
    {status && <p role="status">{status}</p>}
  </section>
}
