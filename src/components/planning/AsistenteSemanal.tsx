import {useMemo,useState} from 'react'
import type {ItemPlanning,Receta,ItemInventario,TipoComida} from '../../store/types'
import {calcularPresupuesto,preparacionesAnticipadas,sugerirSobras,type Precios,type PrecioUnitario} from '../../lib/planificacionInteligente'
import {sugerirAlternativasAhorro} from '../../lib/optimizarPresupuesto'

type Props={
 planning:ItemPlanning[];recetas:Receta[];inventario:ItemInventario[];
 desde:string;hasta:string;onAbrirReceta:(id:string)=>void;
 precios:Precios;estadoPrecios:'ready'|'loading'|'error';errorPrecios:string;
 onGuardarPrecio:(nombre:string,precio:PrecioUnitario)=>Promise<void>;
 onProponer:(recetaId:string,destino?:{fecha:string;tipoComida:TipoComida})=>void;
}
export default function AsistenteSemanal({planning,recetas,inventario,desde,hasta,onAbrirReceta,
 precios,estadoPrecios,errorPrecios,onGuardarPrecio,onProponer}:Props){
 const [nombre,setNombre]=useState('')
 const [precio,setPrecio]=useState('')
 const [cantidad,setCantidad]=useState('1')
 const [unidad,setUnidad]=useState('u')
 const [minutos,setMinutos]=useState(30)
 const [guardando,setGuardando]=useState(false)
 const [mensaje,setMensaje]=useState('')
 const presupuesto=useMemo(()=>calcularPresupuesto(planning,recetas,inventario,desde,hasta,precios),[planning,recetas,inventario,desde,hasta,precios])
 const preparaciones=useMemo(()=>preparacionesAnticipadas(planning,recetas,desde,hasta),[planning,recetas,desde,hasta])
 const sobras=useMemo(()=>sugerirSobras(inventario,recetas),[inventario,recetas])
 const ahorro=useMemo(()=>sugerirAlternativasAhorro(planning,recetas,inventario,precios,desde,hasta),[planning,recetas,inventario,precios,desde,hasta])
 const compatibles=useMemo(()=>recetas.filter(r=>r.tiempo>0 && r.tiempo<=minutos).sort((a,b)=>a.tiempo-b.tiempo).slice(0,6),[recetas,minutos])
 const guardarPrecio=async(e:React.FormEvent)=>{
  e.preventDefault()
  const p=Number(precio),c=Number(cantidad)
  if(!nombre.trim()||!Number.isFinite(p)||p<0||!Number.isFinite(c)||c<=0)return
  setGuardando(true);setMensaje('')
  try{
   await onGuardarPrecio(nombre,{precio:p,cantidad:c,unidad})
   setMensaje('✅ Precio de referencia guardado y compartido con el hogar.')
   setNombre('');setPrecio('')
  }catch(err){setMensaje('⚠️ No se pudo guardar el precio: '+(err instanceof Error?err.message:String(err)))}
  finally{setGuardando(false)}
 }
 return <section className="card planning-assistant" style={{marginBottom:20,padding:18}}>
  <h3>🧠 Asistente de la semana</h3>
  <p>Las propuestas no cambian el calendario hasta que confirmes. La compra se recalcula a partir del menú aprobado.</p>
  <details><summary>🥘 Aprovechar sobras ({sobras.length})</summary>
   {sobras.length===0?<p>No hay lotes cocinados vigentes en el inventario. Registra las raciones en Batch cooking.</p>:
   sobras.map(({item,recetas:opciones})=><div key={item.id} style={{padding:'10px 0',borderBottom:'1px solid var(--borde)'}}>
    <strong>{item.nombre} · {item.cantidad} {item.unidad}</strong>
    <span> · {item.ubicacion}{item.fechaCaducidad?' · Fecha registrada: '+item.fechaCaducidad:''}</span>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
     {opciones.length?opciones.map(r=><button key={r.id} type="button" className="btn-secundario"
      onClick={()=>onProponer(r.id)}>💡 Proponer {r.nombre}</button>):'Sin recetas guardadas coincidentes'}
    </div>
   </div>)}
   <p style={{fontSize:12}}>Verifica siempre el estado de las sobras y la conservación. Un ingrediente registrado no garantiza que sea seguro consumirlo.</p>
  </details>
  <details><summary>⏱️ Recetas según tiempo disponible</summary>
   <label>Tiempo máximo: {minutos} min<input type="range" min="10" max="120" step="5" value={minutos} onChange={e=>setMinutos(Number(e.target.value))}/></label>
   {compatibles.map(r=><button key={r.id} type="button" className="btn-secundario" onClick={()=>onAbrirReceta(r.id)}>{r.nombre} · {r.tiempo} min</button>)}
  </details>
  <details><summary>💶 Presupuesto y precios compartidos</summary>
   <p>Estimación parcial: <strong>{presupuesto.estimado.toFixed(2)} €</strong>. {presupuesto.sinPrecio} de {presupuesto.total} productos sin precio comparable.</p>
   <p>Precios orientativos introducidos por vosotros, no precios en tiempo real del supermercado.</p>
   {estadoPrecios==='loading'&&<p role="status">Cargando precios compartidos…</p>}
   {estadoPrecios==='error'&&<p role="alert">⚠️ No se han podido cargar los precios: {errorPrecios}</p>}
   <form onSubmit={e=>{void guardarPrecio(e)}} style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'end'}}>
    <label>Producto<input placeholder="Producto" value={nombre} onChange={e=>setNombre(e.target.value)} required/></label>
    <label>Precio €<input type="number" min="0" step="0.01" value={precio} onChange={e=>setPrecio(e.target.value)} required/></label>
    <label>Cantidad envase<input type="number" min="0.01" step="any" value={cantidad} onChange={e=>setCantidad(e.target.value)} required/></label>
    <label>Unidad<select value={unidad} onChange={e=>setUnidad(e.target.value)}>
     {['u','g','kg','ml','l','paquete','lata','bote'].map(u=><option key={u} value={u}>{u}</option>)}
    </select></label>
    <button className="btn-secundario" type="submit" disabled={guardando||estadoPrecios!=='ready'}>{guardando?'Guardando…':'Guardar precio'}</button>
   </form>
   {mensaje&&<p role="status">{mensaje}</p>}
   <h4 style={{marginTop:16}}>Alternativas con ahorro comprobable</h4>
   {ahorro.length===0?<p>No hay alternativas con precio completo suficiente para comparar. Registra precios para obtener propuestas.</p>:
    ahorro.map((a,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid var(--borde)'}}>
     <strong>{a.fecha} · {a.tipoComida}</strong> · {a.actual.nombre} → {a.alternativa.nombre}
     <span style={{marginLeft:8}}>Ahorro orientativo: {a.ahorro.toFixed(2)} €</span>
     <button type="button" className="btn-secundario" onClick={()=>onProponer(a.alternativa.id,{fecha:a.fecha,tipoComida:a.tipoComida})}>Revisar sustitución</button>
    </div>)}
   <p style={{fontSize:12}}>Las alternativas requieren confirmación y deben ajustarse a las restricciones de los dos perfiles.</p>
  </details>
  <details><summary>🧊 Preparación anticipada ({preparaciones.length})</summary>
   {preparaciones.length===0?<p>No hay tareas previstas para las recetas de esta semana.</p>:
     <ul>{preparaciones.map((t,i)=><li key={i}><strong>{t.fecha}</strong> · {t.receta}: {t.texto}</li>)}</ul>}
  </details>
 </section>
}
