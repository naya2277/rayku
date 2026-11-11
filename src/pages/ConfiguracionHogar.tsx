import { useState } from 'react'
import { APARATOS, DIETAS, cargarPerfilHogar, guardarPerfilHogar, listaTexto, type PerfilHogar, type PerfilPersona } from '../lib/perfilHogar'

export default function ConfiguracionHogar({ onTerminar, onInventario, sharedHousehold = false }: { onTerminar: () => void; onInventario: () => void; sharedHousehold?: boolean }) {
 const [perfil, setPerfil] = useState<PerfilHogar>(cargarPerfilHogar)
 const [otroAparato, setOtroAparato] = useState('')
 const agregarAparato = () => {
  const nombre = otroAparato.trim()
  if (!nombre) return
  setPerfil(p => ({...p,aparatos: p.aparatos.some(a => a.toLocaleLowerCase('es') === nombre.toLocaleLowerCase('es')) ? p.aparatos : [...p.aparatos,nombre]}))
  setOtroAparato('')
 }
 const editar = (id: string, cambios: Partial<PerfilPersona>) => setPerfil(p=>({...p,personas:p.personas.map(x=>x.id===id?{...x,...cambios}:x)}))
 const guardar = () => { guardarPerfilHogar({...perfil,configurado:true}); onTerminar() }
 return <section className="card" style={{display:'grid',gap:18}}>
  <div><h1>🏡 Tu hogar en Rayku</h1><p>{sharedHousehold ? 'Aquí puedes editar los utensilios y la organización de la cocina. Tu perfil alimentario único se edita arriba, en «Mi perfil alimentario».' : 'Configura una vez los gustos y utensilios. Podrás cambiarlos cuando quieras.'}</p></div>
  {!sharedHousehold && perfil.personas.slice(0,1).map((persona,i)=><div key={persona.id} style={{display:'grid',gap:9,borderTop:'1px solid var(--borde)',paddingTop:15}}>
   <h3>👤 Persona {i+1}</h3>
   <label>Nombre<input value={persona.nombre} onChange={e=>editar(persona.id,{nombre:e.target.value})}/></label>
   <strong>Alimentación</strong>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{DIETAS.map(d=><label key={d} style={{display:'flex',gap:5,alignItems:'center'}}><input style={{width:'auto'}} type="checkbox" checked={persona.dietas.includes(d)} onChange={e=>editar(persona.id,{dietas:e.target.checked?[...persona.dietas,d]:persona.dietas.filter(x=>x!==d)})}/>{d}</label>)}</div>
   <label>Ingredientes prohibidos o que no come<input placeholder="Ej.: cebolla, pimiento, pepino" defaultValue={persona.prohibidos.join(', ')} onBlur={e=>editar(persona.id,{prohibidos:listaTexto(e.target.value)})}/></label>
   <label>Ingredientes favoritos<input placeholder="Ej.: salmón, queso" defaultValue={persona.favoritos.join(', ')} onBlur={e=>editar(persona.id,{favoritos:listaTexto(e.target.value)})}/></label>

  </div>)}
  {!sharedHousehold && <p>Estas son las preferencias de tu configuración antigua. En un hogar compartido, cada cuenta tiene un único perfil alimentario editable.</p>}
  <h3>🍳 Aparatos disponibles</h3>
  <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>{APARATOS.map(a=><label key={a} style={{display:'flex',alignItems:'center',gap:5}}><input type="checkbox" style={{width:'auto'}} checked={perfil.aparatos.includes(a)} onChange={e=>setPerfil(p=>({...p,aparatos:e.target.checked?[...p.aparatos,a]:p.aparatos.filter(x=>x!==a)}))}/>{a}</label>)}</div>
  {perfil.aparatos.filter(a=>!APARATOS.includes(a)).length > 0 && <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{perfil.aparatos.filter(a=>!APARATOS.includes(a)).map(a=><button type="button" className="btn-secundario" key={a} onClick={()=>setPerfil(p=>({...p,aparatos:p.aparatos.filter(x=>x!==a)}))}>{a} ✕</button>)}</div>}
  <form onSubmit={e=>{e.preventDefault();agregarAparato()}} style={{display:'flex',gap:8,flexWrap:'wrap'}}>
    <input aria-label="Otro aparato de cocina" style={{flex:1,minWidth:180}} placeholder="¿Falta alguno? Escríbelo aquí" value={otroAparato} onChange={e=>setOtroAparato(e.target.value)}/>
    <button type="submit" className="btn-secundario" disabled={!otroAparato.trim()}>+ Añadir aparato</button>
  </form>
  <label style={{display:'flex',gap:8,alignItems:'center'}}><input type="checkbox" style={{width:'auto'}} checked={perfil.priorizarInventario} onChange={e=>setPerfil(p=>({...p,priorizarInventario:e.target.checked}))}/>Priorizar ingredientes que ya tengo</label>
  <button className="btn-principal" onClick={guardar}>{sharedHousehold ? "💜 Guardar utensilios y organización" : "💜 Guardar configuración"}</button>
  <button className="btn-secundario" onClick={()=>{guardarPerfilHogar({...perfil,configurado:true});onInventario()}}>📦 Guardar utensilios e ir al inventario</button>
 </section>
}
