import { useState } from 'react'
import type { ItemInventario } from '../../store'
import { detectarCategoriaIngrediente } from '../../lib/ingredientes'
import type { UbicacionInventario } from '../../lib/inventario'
import { UNIDADES_CATALOGO } from '../../lib/inventario/catalogoProductos'
import SelectorProducto from './SelectorProducto'

type Props = { agregar: (item: ItemInventario) => void }
type Entrada = {nombre:string;cantidad:number;unidad:string}
export default function EntradaRapida({ agregar }: Props) {
 const [nombre,setNombre] = useState('')
 const [cantidad,setCantidad] = useState('1')
 const [unidad,setUnidad] = useState('u.')
 const [ubicacion,setUbicacion] = useState<UbicacionInventario>('nevera')
 const [productos,setProductos] = useState<Entrada[]>([])
 const [mensaje,setMensaje] = useState('')
 const anadir = () => {
  const valor=Number(cantidad)
  if(!nombre || !Number.isFinite(valor) || valor<=0) return
  setProductos(actual=>[...actual,{nombre,cantidad:valor,unidad}])
  setNombre('')
  setCantidad('1')
  setMensaje('')
 }
 const guardar = () => {
  productos.forEach(p=>agregar({
   id:crypto.randomUUID(),nombre:p.nombre,cantidad:p.cantidad,unidad:p.unidad,
   categoria:detectarCategoriaIngrediente(p.nombre),ubicacion,fechaCaducidad:null,
   necesitaDescongelar:ubicacion==='congelador',
  }))
  setMensaje(productos.length+' productos añadidos. Puedes completar las caducidades después.')
  setProductos([])
 }
 return <section className="card" style={{marginBottom:18,display:'grid',gap:10}}>
  <h3>⚡ Añadir varios productos</h3>
  <p>Busca cada producto por su nombre fijo y añade la cantidad aparte. Puedes preparar una lista y guardarla de una vez.</p>
  <SelectorProducto value={nombre} onChange={setNombre}/>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <label style={{flex:'1 1 100px'}}>Cantidad
    <input type="number" min="0.01" step="any" value={cantidad} onChange={e=>setCantidad(e.target.value)}/>
   </label>
   <label style={{flex:'1 1 100px'}}>Unidad
    <select value={unidad} onChange={e=>setUnidad(e.target.value)}>
     {UNIDADES_CATALOGO.map(u=><option key={u} value={u}>{u}</option>)}
    </select>
   </label>
   <button type="button" className="btn-secundario" disabled={!nombre || !(Number(cantidad)>0)} onClick={anadir}>+ Añadir a la tanda</button>
  </div>
  {productos.length>0 && <div style={{display:'grid',gap:6}}>
   {productos.map((p,i)=><div key={i} style={{display:'flex',gap:8,justifyContent:'space-between',alignItems:'center'}}>
     <span>{p.nombre} · {p.cantidad} {p.unidad}</span>
     <button type="button" className="btn-secundario" onClick={()=>setProductos(x=>x.filter((_,j)=>j!==i))}>Quitar</button>
   </div>)}
  </div>}
  <label>¿Dónde están?
   <select value={ubicacion} onChange={e=>setUbicacion(e.target.value as UbicacionInventario)}>
    <option value="nevera">Nevera</option><option value="congelador">Congelador</option><option value="despensa">Despensa</option>
   </select>
  </label>
  <button className="btn-principal" type="button" disabled={!productos.length} onClick={guardar}>Guardar {productos.length} productos</button>
  {mensaje && <p role="status">{mensaje}</p>}
 </section>
}
