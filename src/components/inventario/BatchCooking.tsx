import {useState} from 'react'
import {format} from 'date-fns'
import type {ItemInventario,Receta} from '../../store/types'
import {crearLoteCocinado,validarPreparacionLote} from '../../lib/batchCooking'
type Props={recetas:Receta[];agregar:(item:ItemInventario)=>void}
export default function BatchCooking({recetas,agregar}:Props){
 const [recetaId,setRecetaId]=useState('')
 const [raciones,setRaciones]=useState(2)
 const [ubicacion,setUbicacion]=useState<'nevera'|'congelador'>('congelador')
 const [fecha,setFecha]=useState(format(new Date(),'yyyy-MM-dd'))
 const [caducidad,setCaducidad]=useState('')
 const [descongelar,setDescongelar]=useState('')
 const [mensaje,setMensaje]=useState('')
 const receta=recetas.find(r=>r.id===recetaId)
 const guardar=()=>{
  const lote={recetaNombre:receta?.nombre??'',raciones,ubicacion,fechaPreparacion:fecha,
   fechaCaducidad:caducidad||null,fechaDescongelar:ubicacion==='congelador'?descongelar||null:null}
  const error=validarPreparacionLote(lote)
  if(error){setMensaje(error);return}
  agregar(crearLoteCocinado(lote,crypto.randomUUID()))
  setMensaje('✅ '+raciones+' raciones guardadas como un lote independiente.')
  setRecetaId('');setCaducidad('');setDescongelar('')
 }
 return <details className="card" style={{marginBottom:18}}>
  <summary style={{cursor:'pointer',fontWeight:850}}>🧊 Batch cooking · Guardar raciones preparadas</summary>
  <div style={{display:'grid',gap:12,marginTop:14}}>
   <p>Registra una preparación ya cocinada y dónde la guardas. Conservamos cada lote con su propia fecha.</p>
   <label>Receta preparada<select value={recetaId} onChange={e=>setRecetaId(e.target.value)}>
     <option value="">Seleccionar receta</option>{recetas.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
    </select></label>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:10}}>
    <label>Raciones<input type="number" min="1" max="100" step="1" value={raciones} onChange={e=>setRaciones(Number(e.target.value))}/></label>
    <label>Ubicación<select value={ubicacion} onChange={e=>setUbicacion(e.target.value as 'nevera'|'congelador')}>
     <option value="nevera">🧊 Nevera</option><option value="congelador">❄️ Congelador</option>
    </select></label>
    <label>Preparado el<input type="date" value={fecha} onChange={e=>setFecha(e.target.value)}/></label>
    <label>Caducidad del lote (opcional)<input type="date" value={caducidad} onChange={e=>setCaducidad(e.target.value)}/></label>
    {ubicacion==='congelador'&&<label>Plan para descongelar (opcional)<input type="date" value={descongelar} onChange={e=>setDescongelar(e.target.value)}/></label>}
   </div>
   <p style={{fontSize:12}}>La aplicación no inventa una fecha segura de consumo: consigna la fecha real de conservación que corresponda. Descongela de forma segura en nevera.</p>
   <button type="button" className="btn-principal" disabled={!receta||!(raciones>0)} onClick={guardar}>📦 Registrar raciones</button>
   {mensaje&&<p role="status">{mensaje}</p>}
  </div>
 </details>
}
