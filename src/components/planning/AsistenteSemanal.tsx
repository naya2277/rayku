import { useMemo, useState } from 'react'
import type { ItemPlanning, Receta, ItemInventario } from '../../store/types'
import { calcularPresupuesto, preparacionesAnticipadas, sugerirSobras, type Precios } from '../../lib/planificacionInteligente'
import { obtenerClaveIngredienteCompra } from '../../lib/compra/normalizacionCompra'

type Props={planning:ItemPlanning[];recetas:Receta[];inventario:ItemInventario[];desde:string;hasta:string;onAbrirReceta:(id:string)=>void}
const KEY='rayku-precios-local-v1'
function leerPrecios():Precios {try{return JSON.parse(localStorage.getItem(KEY)??'{}') as Precios}catch{return {}}}
export default function AsistenteSemanal({planning,recetas,inventario,desde,hasta,onAbrirReceta}:Props){
 const [precios,setPrecios]=useState<Precios>(leerPrecios)
 const [nombre,setNombre]=useState('')
 const [precio,setPrecio]=useState('')
 const [cantidad,setCantidad]=useState('1')
 const [unidad,setUnidad]=useState('u')
 const [minutos,setMinutos]=useState(30)
 const presupuesto=useMemo(()=>calcularPresupuesto(planning,recetas,inventario,desde,hasta,precios),[planning,recetas,inventario,desde,hasta,precios])
 const preparaciones=useMemo(()=>preparacionesAnticipadas(planning,recetas,desde,hasta),[planning,recetas,desde,hasta])
 const sobras=useMemo(()=>sugerirSobras(inventario,recetas),[inventario,recetas])
 const compatibles=useMemo(()=>recetas.filter(r=>r.tiempo>0 && r.tiempo<=minutos).sort((a,b)=>a.tiempo-b.tiempo).slice(0,6),[recetas,minutos])
 const guardarPrecio=(e:React.FormEvent)=>{e.preventDefault();const p=Number(precio),c=Number(cantidad);if(!nombre.trim()||!Number.isFinite(p)||p<0||!Number.isFinite(c)||c<=0)return;const siguiente={...precios,[obtenerClaveIngredienteCompra(nombre)]:{precio:p,cantidad:c,unidad}};setPrecios(siguiente);localStorage.setItem(KEY,JSON.stringify(siguiente));setNombre('');setPrecio('')}
 return <section className="card" style={{marginBottom:20,padding:18}}>
  <h3>🧠 Asistente de la semana</h3>
  <p>Al cambiar una comida, la compra se recalcula automáticamente desde el planning y el inventario actual.</p>
  <details><summary>🥘 Aprovechar sobras ({sobras.length})</summary>
   {sobras.length===0?<p>Marca los alimentos cocinados como sobras en el inventario para recibir propuestas.</p>:sobras.map(({item,recetas:opciones})=><div key={item.id}><strong>{item.nombre} · {item.cantidad} {item.unidad}</strong>{item.fechaCaducidad&&<span> · Fecha indicada: {item.fechaCaducidad}</span>}<div>{opciones.length?opciones.map(r=><button key={r.id} type="button" className="btn-secundario" onClick={()=>onAbrirReceta(r.id)}>{r.nombre}</button>):' Sin recetas coincidentes todavía'}</div></div>)}
   <p>Comprueba siempre la conservación y el estado de las sobras antes de utilizarlas.</p>
  </details>
  <details><summary>⏱️ Recetas según tiempo disponible</summary>
   <label>Tiempo máximo de elaboración: {minutos} min<input type="range" min="10" max="120" step="5" value={minutos} onChange={e=>setMinutos(Number(e.target.value))}/></label>
   <p>El tiempo procede de cada receta; aún no incluye una estimación separada de limpieza.</p>
   {compatibles.map(r=><button key={r.id} type="button" className="btn-secundario" onClick={()=>onAbrirReceta(r.id)}>{r.nombre} · {r.tiempo} min</button>)}
  </details>
  <details><summary>💶 Presupuesto de compra</summary>
   <p>Estimación parcial: <strong>{presupuesto.estimado.toFixed(2)} €</strong>. {presupuesto.sinPrecio} de {presupuesto.total} productos sin precio comparable.</p>
   <p>Introduce precios de referencia; se guardan solo en este dispositivo. No son precios de supermercados en tiempo real.</p>
   <form onSubmit={guardarPrecio} style={{display:'flex',flexWrap:'wrap',gap:8}}>
    <input aria-label="Producto" placeholder="Producto" value={nombre} onChange={e=>setNombre(e.target.value)} required/>
    <input aria-label="Precio en euros" placeholder="€" type="number" min="0" step="0.01" value={precio} onChange={e=>setPrecio(e.target.value)} required/>
    <input aria-label="Cantidad del envase" type="number" min="0.01" step="any" value={cantidad} onChange={e=>setCantidad(e.target.value)} required/>
    <select aria-label="Unidad del envase" value={unidad} onChange={e=>setUnidad(e.target.value)}>{['u','g','kg','ml','l'].map(u=><option key={u} value={u}>{u}</option>)}</select>
    <button className="btn-secundario" type="submit">Guardar precio</button>
   </form>
  </details>
  <details><summary>🧊 Preparación anticipada ({preparaciones.length})</summary>
   {preparaciones.length===0?<p>No hay tareas detectadas para las recetas de esta semana.</p>:<ul>{preparaciones.map((t,i)=><li key={i}><strong>{t.fecha}</strong> · {t.receta}: {t.texto}</li>)}</ul>}
  </details>
 </section>
}
