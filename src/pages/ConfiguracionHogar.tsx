import { useState } from 'react'
import { APARATOS, DIETAS, cargarPerfilHogar, guardarPerfilHogar, listaTexto, type PerfilHogar, type PerfilPersona } from '../lib/perfilHogar'

export default function ConfiguracionHogar({ onTerminar, onInventario }: { onTerminar: () => void; onInventario: () => void }) {
 const [perfil, setPerfil] = useState<PerfilHogar>(cargarPerfilHogar)
 const editar = (id: string, cambios: Partial<PerfilPersona>) => setPerfil(p=>({...p,personas:p.personas.map(x=>x.id===id?{...x,...cambios}:x)}))
 const guardar = () => { guardarPerfilHogar({...perfil,configurado:true}); onTerminar() }
 return <section className="card" style={{display:'grid',gap:18}}>
  <div><h1>🏡 Tu hogar en Rayku</h1><p>Configura una vez los gustos y utensilios. Podrás cambiarlos cuando quieras.</p></div>
  {perfil.personas.map((persona,i)=><div key={persona.id} style={{display:'grid',gap:9,borderTop:'1px solid var(--borde)',paddingTop:15}}>
   <h3>👤 Persona {i+1}</h3>
   <label>Nombre<input value={persona.nombre} onChange={e=>editar(persona.id,{nombre:e.target.value})}/></label>
   <strong>Alimentación</strong>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{DIETAS.map(d=><label key={d} style={{display:'flex',gap:5,alignItems:'center'}}><input style={{width:'auto'}} type="checkbox" checked={persona.dietas.includes(d)} onChange={e=>editar(persona.id,{dietas:e.target.checked?[...persona.dietas,d]:persona.dietas.filter(x=>x!==d)})}/>{d}</label>)}</div>
   <label>Ingredientes prohibidos o que no come<input placeholder="Ej.: cebolla, pimiento, pepino" defaultValue={persona.prohibidos.join(', ')} onBlur={e=>editar(persona.id,{prohibidos:listaTexto(e.target.value)})}/></label>
   <label>Ingredientes favoritos<input placeholder="Ej.: salmón, queso" defaultValue={persona.favoritos.join(', ')} onBlur={e=>editar(persona.id,{favoritos:listaTexto(e.target.value)})}/></label>
   <button className="btn-secundario" onClick={()=>setPerfil(p=>({...p,personas:p.personas.filter(x=>x.id!==persona.id)}))} disabled={perfil.personas.length===1}>Eliminar persona</button>
  </div>)}
  <button className="btn-secundario" onClick={()=>setPerfil(p=>({...p,personas:[...p.personas,{id:crypto.randomUUID(),nombre:'',dietas:[],prohibidos:[],favoritos:[],rechazadas:[]}]}))}>+ Añadir persona</button>
  <h3>🍳 Aparatos disponibles</h3>
  <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>{APARATOS.map(a=><label key={a} style={{display:'flex',alignItems:'center',gap:5}}><input type="checkbox" style={{width:'auto'}} checked={perfil.aparatos.includes(a)} onChange={e=>setPerfil(p=>({...p,aparatos:e.target.checked?[...p.aparatos,a]:p.aparatos.filter(x=>x!==a)}))}/>{a}</label>)}</div>
  <label style={{display:'flex',gap:8,alignItems:'center'}}><input type="checkbox" style={{width:'auto'}} checked={perfil.priorizarInventario} onChange={e=>setPerfil(p=>({...p,priorizarInventario:e.target.checked}))}/>Priorizar ingredientes que ya tengo</label>
  <button className="btn-principal" onClick={guardar}>💜 Guardar configuración</button>
  <button className="btn-secundario" onClick={()=>{guardarPerfilHogar({...perfil,configurado:true});onInventario()}}>📦 Guardar e introducir mi despensa</button>
 </section>
}
