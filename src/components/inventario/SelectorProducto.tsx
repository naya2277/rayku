import { useMemo, useState } from 'react'
import { CATALOGO_PRODUCTOS, normalizarNombreCatalogo } from '../../lib/inventario/catalogoProductos'
import { useCustomProducts } from '../../lib/useCustomProducts'

/** Catalog picker with a free-text escape hatch. Custom names can be saved
 * for the household and reused by both members without changing quantity fields.
 */
export default function SelectorProducto({value,onChange,householdId}:{
 value:string;onChange:(nombre:string)=>void;householdId?:string
}) {
 const [busqueda,setBusqueda]=useState('')
 const [modoManual,setModoManual]=useState(false)
 const [manual,setManual]=useState('')
 const [mensaje,setMensaje]=useState('')
 const [guardando,setGuardando]=useState(false)
 const {productos,guardar}=useCustomProducts(householdId)
 const personalizados=useMemo(()=>[...new Set(productos.filter(p=>p.is_custom).map(p=>p.nombre))], [productos])
 const categorias=useMemo(()=>Object.entries(CATALOGO_PRODUCTOS)
  .map(([categoria,productos])=>({
   categoria,
   productos: productos.filter(p=>normalizarNombreCatalogo(p).includes(normalizarNombreCatalogo(busqueda))),
  })).filter(g=>g.productos.length),[busqueda])
 const extras=personalizados.filter(p=>normalizarNombreCatalogo(p).includes(normalizarNombreCatalogo(busqueda)))
 const guardarManual=async()=>{
  const nombre=manual.trim()
  if(!nombre||guardando)return
  onChange(nombre)
  setGuardando(true);setMensaje('')
  try{
   await guardar({nombre,categoria:'Ingredientes personalizados',subcategoria:'Productos manuales',
    emoji:'🛒',default_quantity:'1 unidad',favorite:true,is_custom:true})
   setMensaje('✅ Producto añadido al catálogo compartido.')
  }catch(e){setMensaje('Puedes usar el producto igualmente, pero no se guardó en el catálogo: '+String(e))}
  finally{setGuardando(false)}
 }
 return <div className="rayku-product-picker" style={{display:'grid',gap:9}}>
  <label>Buscar producto en el catálogo
   <input type="search" value={busqueda} onChange={e=>setBusqueda(e.target.value)}
    placeholder="Ej.: lechuga, pollo, huevos…" aria-label="Filtrar catálogo de productos"/>
  </label>
  <label>Producto
   <select value={modoManual?'__manual__':value} onChange={e=>{
     if(e.target.value==='__manual__'){setModoManual(true);setManual(value||busqueda);return}
     setModoManual(false);onChange(e.target.value)
   }}>
    <option value="">Selecciona un producto</option>
    {categorias.map(grupo=><optgroup label={grupo.categoria} key={grupo.categoria}>
      {grupo.productos.map(nombre=><option key={nombre} value={nombre}>{nombre}</option>)}
    </optgroup>)}
    {extras.length>0&&<optgroup label="⭐ Productos personalizados">
      {extras.map(nombre=><option key={nombre} value={nombre}>{nombre}</option>)}
    </optgroup>}
    {value&&!modoManual&&!categorias.some(g=>g.productos.includes(value as never))&&!extras.includes(value)&&
      <option value={value}>{value} (seleccionado)</option>}
    <option value="__manual__">＋ Introducir un alimento manualmente…</option>
   </select>
  </label>
  {modoManual&&<div className="rayku-manual-product">
   <label>Nombre del producto no incluido en el catálogo
    <input type="text" value={manual} onChange={e=>{setManual(e.target.value);onChange(e.target.value.trim())}}
     placeholder="Escribe cualquier ingrediente o producto" maxLength={120}/>
   </label>
   <div className="rayku-manual-actions">
    <button type="button" className="btn-principal" disabled={!manual.trim()||guardando}
     onClick={()=>{void guardarManual()}}>{guardando?'Guardando…':'💜 Usar y guardar en mi catálogo'}</button>
    <button type="button" className="btn-secundario" onClick={()=>{setModoManual(false);onChange('');setMensaje('')}}>Cancelar</button>
   </div>
   {mensaje&&<p role="status">{mensaje}</p>}
  </div>}
  <p style={{fontSize:12,color:'var(--txt2)',margin:0}}>
   Cantidad y unidad se guardan aparte. Si falta un alimento, selecciona «Introducir manualmente».
  </p>
 </div>
}
