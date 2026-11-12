import { useCallback, useEffect, useState } from 'react'
import { getWorkspaceRecord, saveSharedRecord } from '../../lib/workspaces'

type Entrada={id:string;texto:string;hecho:boolean}
type Evento={id:string;fecha:string;comida:string;nota:string}
type Datos={compra:Entrada[];calendario:Evento[]}
const VACIO:Datos={compra:[],calendario:[]}
const nuevoId=()=>crypto.randomUUID()
export default function HogarCompartido({householdId}:{householdId:string}){
 const [datos,setDatos]=useState<Datos>(VACIO)
 const [version,setVersion]=useState(0)
 const [cargando,setCargando]=useState(true)
 const [mensaje,setMensaje]=useState('')
 const [texto,setTexto]=useState('')
 const [fecha,setFecha]=useState('')
 const [comida,setComida]=useState('comida')
 const [nota,setNota]=useState('')
 const [ocupado,setOcupado]=useState(false)
 const [revision,setRevision]=useState(0)
 const cargar=useCallback(async()=>{
  const record=await getWorkspaceRecord<Datos>({scope:'household',householdId},'shopping_list')
  setDatos({compra:Array.isArray(record?.payload?.compra)?record.payload.compra:[],calendario:Array.isArray(record?.payload?.calendario)?record.payload.calendario:[]})
  setVersion(record?.version??0)
  setRevision(v=>v+1)
 },[householdId])
 useEffect(()=>{
  let activo=true
  setCargando(true)
  cargar().catch(e=>{if(activo)setMensaje('No se pudo cargar el hogar: '+String(e))}).finally(()=>{if(activo)setCargando(false)})
  return ()=>{activo=false}
 },[cargar])
 // Revalidar al volver a la aplicación; no sobrescribir ediciones pendientes.
 useEffect(()=>{
  const onVisible=()=>{if(document.visibilityState==='visible' && !ocupado) void cargar().catch(e=>setMensaje(String(e)))}
  document.addEventListener('visibilitychange',onVisible)
  return ()=>document.removeEventListener('visibilitychange',onVisible)
 },[cargar,ocupado])
 const guardar=async(next:Datos)=>{
  if(ocupado)return
  setOcupado(true);setMensaje('')
  try{
   const saved=await saveSharedRecord(householdId,'shopping_list',next,version)
   setDatos(next);setVersion(saved.version)
   setRevision(v=>v+1)
   setMensaje('Cambios guardados en el hogar.')
  }catch(e){
   setMensaje('No se han guardado los cambios. Puede haber cambios de otro móvil. Recarga antes de repetir: '+String(e))
  }finally{setOcupado(false)}
 }
 return <section className="card" style={{padding:18,display:'grid',gap:12}}>
  <h3>🏡 Tablero compartido</h3>
  <p>Este tablero es independiente de tus recetas y preferencias. Los cambios se guardan en el hogar y se pueden consultar desde la otra cuenta.</p>
  <small>Versión actualizada: {revision > 0 ? 'sí' : 'pendiente'}. Para ver cambios recientes pulsa actualizar o vuelve a abrir la aplicación.</small>
  <button type="button" className="btn-secundario" disabled={ocupado} onClick={()=>{setCargando(true);cargar().catch(e=>setMensaje(String(e))).finally(()=>setCargando(false))}}>🔄 Actualizar desde el otro móvil</button>
  {cargando?<p>Cargando datos del hogar…</p>:<>
   <h4>🛒 Lista compartida</h4>
   <form onSubmit={e=>{e.preventDefault();if(!texto.trim())return;void guardar({...datos,compra:[...datos.compra,{id:nuevoId(),texto:texto.trim(),hecho:false}]})}} style={{display:'flex',gap:8}}>
    <input aria-label="Añadir producto al hogar" placeholder="Producto y cantidad" value={texto} onChange={e=>setTexto(e.target.value)}/>
    <button className="btn-secundario" type="submit" disabled={ocupado||!texto.trim()}>Añadir</button>
   </form>
   {datos.compra.map(item=><div key={item.id} style={{display:'flex',gap:8,alignItems:'center'}}>
    <input type="checkbox" style={{width:'auto'}} checked={item.hecho} disabled={ocupado} onChange={()=>void guardar({...datos,compra:datos.compra.map(x=>x.id===item.id?{...x,hecho:!x.hecho}:x)})}/>
    <span style={{flex:1,textDecoration:item.hecho?'line-through':'none'}}>{item.texto}</span>
    <button className="btn-secundario" type="button" disabled={ocupado} onClick={()=>void guardar({...datos,compra:datos.compra.filter(x=>x.id!==item.id)})}>Eliminar</button>
   </div>)}
   <h4>📅 Calendario conjunto</h4>
   <form onSubmit={e=>{e.preventDefault();if(!fecha||!nota.trim())return;void guardar({...datos,calendario:[...datos.calendario,{id:nuevoId(),fecha,comida,nota:nota.trim()}]})}} style={{display:'flex',flexWrap:'wrap',gap:8}}>
    <input aria-label="Fecha compartida" type="date" value={fecha} onChange={e=>setFecha(e.target.value)} required/>
    <select aria-label="Momento del día" value={comida} onChange={e=>setComida(e.target.value)}><option value="comida">Comida</option><option value="cena">Cena</option></select>
    <input aria-label="Nota del calendario" placeholder="¿Qué comemos?" value={nota} onChange={e=>setNota(e.target.value)} required/>
    <button className="btn-secundario" type="submit" disabled={ocupado||!fecha||!nota.trim()}>Añadir</button>
   </form>
   {[...datos.calendario].sort((a,b)=>a.fecha.localeCompare(b.fecha)).map(ev=><div key={ev.id} style={{display:'flex',gap:8,alignItems:'center'}}><span style={{flex:1}}>{ev.fecha} · {ev.comida}: {ev.nota}</span><button type="button" className="btn-secundario" disabled={ocupado} onClick={()=>void guardar({...datos,calendario:datos.calendario.filter(x=>x.id!==ev.id)})}>Eliminar</button></div>)}
  </>}
  {mensaje&&<p role="status">{mensaje}</p>}
 </section>
}
