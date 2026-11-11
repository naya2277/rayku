import {useMemo,useState} from 'react'
import {addDays,format} from 'date-fns'
import type {ItemInventario,ItemPlanning,Receta,TipoComida} from '../../store/types'
import {evaluarReplanificacion,resultadoReplanificacion} from '../../lib/replanificacion'
type Props={planning:ItemPlanning[];recetas:Receta[];inventario:ItemInventario[];
 replanificar:(id:string,fecha:string,tipo:TipoComida)=>boolean}
export default function Replanificador({planning,recetas,inventario,replanificar}:Props){
 const [origenId,setOrigenId]=useState('')
 const [fecha,setFecha]=useState(format(addDays(new Date(),1),'yyyy-MM-dd'))
 const [tipo,setTipo]=useState<TipoComida>('comida')
 const [mensaje,setMensaje]=useState('')
 const hoy=format(new Date(),'yyyy-MM-dd')
 const origen=planning.find(p=>p.id===origenId)
 const propuestas=useMemo(()=>planning.filter(p=>!p.cocinado&&p.fecha>=hoy)
  .sort((a,b)=>a.fecha.localeCompare(b.fecha)).slice(0,35),[planning,hoy])
 const evaluacion=origen?evaluarReplanificacion(planning,recetas,inventario,
  {origenId,nuevaFecha:fecha,nuevoTipo:tipo},hoy):null
 const aplicar=()=>{
  if(!origen)return
  const cambio={origenId,nuevaFecha:fecha,nuevoTipo:tipo}
  if(!resultadoReplanificacion(planning,cambio,hoy,recetas,inventario)){
   setMensaje('Ya no se puede realizar el cambio: revisa si alguien ha ocupado el destino.');return
  }
  if(!window.confirm('¿Confirmas mover esta comida? Se recalcularán las necesidades de compra.'))return
  if(!replanificar(origen.id,fecha,tipo)){
   setMensaje('Alguien ha cambiado el calendario. Revisa el destino y vuelve a intentarlo.')
   return
  }
  setOrigenId('')
  setMensaje('✅ Comida trasladada. La lista de compra se adapta a su nueva fecha.')
 }
 return <details className="card" style={{marginBottom:16}}>
  <summary style={{cursor:'pointer',fontWeight:800}}>🔁 Replanificar una comida sin perderla</summary>
  <div style={{display:'grid',gap:12,marginTop:12}}>
   <p>Prueba otro día sin cambiar el calendario. No se sobrescriben comidas existentes ni platos ya cocinados.</p>
   <label>Comida que quieres mover<select value={origenId} onChange={e=>{setOrigenId(e.target.value);setMensaje('')}}>
    <option value="">Selecciona una comida planificada</option>
    {propuestas.map(p=><option key={p.id} value={p.id}>
      {p.fecha} · {p.tipoComida} · {p.recetaIds?.map(id=>recetas.find(r=>r.id===id)?.nombre).filter(Boolean).join(', ')||p.comidaLibre||'Plato sin receta'}
    </option>)}
   </select></label>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:12}}>
    <label>Nuevo día<input type="date" min={hoy} value={fecha} onChange={e=>setFecha(e.target.value)}/></label>
    <label>Turno<select value={tipo} onChange={e=>setTipo(e.target.value as TipoComida)}>
      <option value="comida">Comida</option><option value="cena">Cena</option>
    </select></label>
   </div>
   {evaluacion&&<div role="status" style={{display:'grid',gap:6}}>
    {evaluacion.avisos.map((aviso,i)=><p key={i}>{aviso}</p>)}
   </div>}
   <button type="button" className="btn-principal" disabled={!evaluacion?.permitido} onClick={aplicar}>Confirmar nueva fecha</button>
   {mensaje&&<p role="status">{mensaje}</p>}
  </div>
 </details>
}
