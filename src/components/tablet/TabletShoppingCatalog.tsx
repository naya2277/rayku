import { useMemo, useState } from 'react'
import { CATALOGO_VISUAL, PRODUCTOS_BASE, claveProductoVisual, type ProductoVisual } from '../../lib/tabletCatalog'
import { useCustomProducts, type ProductoPersonal } from '../../lib/useCustomProducts'

type Props = {
 householdId?: string
 soloLectura: boolean
 onAgregar: (nombre: string, cantidad: string) => void
}
const CANTIDADES = ['1 unidad','2 unidades','6 unidades','12 unidades','250 g','500 g','1 kg','1 litro','1 paquete','2 paquetes']
const ico = (categoria: string) => CATALOGO_VISUAL.find(c=>c.nombre===categoria)?.emoji ?? '🛒'
const normalizar = (s:string) => s.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()

export default function TabletShoppingCatalog({householdId,soloLectura,onAgregar}:Props){
 const {productos,cargando,error,guardar,marcarFavorito,registrarUso,eliminar}=useCustomProducts(householdId)
 const [categoria,setCategoria]=useState<string|null>(null)
 const [subcategoria,setSubcategoria]=useState<string|null>(null)
 const [busqueda,setBusqueda]=useState('')
 const [seleccionado,setSeleccionado]=useState<ProductoVisual|null>(null)
 const [cantidad,setCantidad]=useState('1 unidad')
 const [editando,setEditando]=useState(false)
 const [nuevoNombre,setNuevoNombre]=useState('')
 const [nuevaCategoria,setNuevaCategoria]=useState('')
 const [nuevaSubcategoria,setNuevaSubcategoria]=useState('')
 const [nuevoEmoji,setNuevoEmoji]=useState('🛒')
 const [nuevaCantidad,setNuevaCantidad]=useState('1 unidad')
 const [mensaje,setMensaje]=useState('')
 const [guardando,setGuardando]=useState(false)
 const [mostrarFrecuentes,setMostrarFrecuentes]=useState(false)

 const items=useMemo(()=>{
  const unidos=new Map<string,ProductoVisual>()
  for(const p of PRODUCTOS_BASE) unidos.set(claveProductoVisual(p),p)
  for(const p of productos) unidos.set(claveProductoVisual(p),p)
  return [...unidos.values()]
 },[productos])
 const clave=(p:ProductoVisual)=>claveProductoVisual(p)
 const favorito=(p:ProductoVisual)=>productos.find(x=>clave(x)===clave(p))
 const frecuentes=useMemo(()=>productos.filter(p=>p.favorite||p.use_count>0)
   .sort((a,b)=>Number(b.favorite)-Number(a.favorite)||b.use_count-a.use_count||a.nombre.localeCompare(b.nombre,'es'))
   .slice(0,24),[productos])
 const categorias=useMemo(()=>{
  const nombres=new Set(items.map(p=>p.categoria))
  return [...nombres].sort((a,b)=>{
   const ia=CATALOGO_VISUAL.findIndex(c=>c.nombre===a),ib=CATALOGO_VISUAL.findIndex(c=>c.nombre===b)
   return (ia<0?999:ia)-(ib<0?999:ib)||a.localeCompare(b,'es')
  }).map(nombre=>({nombre,emoji:ico(nombre)}))
 },[items])
 const subcategorias=useMemo(()=>[...new Set(items.filter(p=>p.categoria===categoria).map(p=>p.subcategoria))]
  .map(nombre=>({
   nombre,
   emoji:CATALOGO_VISUAL.find(c=>c.nombre===categoria)?.subcategorias.find(x=>x.nombre===nombre)?.emoji
    ??items.find(x=>x.categoria===categoria&&x.subcategoria===nombre)?.emoji??'🛒'
  })),[items,categoria])
 const resultados=useMemo(()=>items.filter(p=>normalizar(p.nombre+' '+p.categoria+' '+p.subcategoria).includes(normalizar(busqueda)))
  .slice(0,90),[items,busqueda])
 const productosNivel=items.filter(p=>p.categoria===categoria&&p.subcategoria===subcategoria)
 const elegir=(p:ProductoVisual)=>{
  if(soloLectura)return
  setSeleccionado(p)
  setCantidad(favorito(p)?.default_quantity||'1 unidad')
  setMensaje('')
 }
 const confirmar=async()=>{
  if(!seleccionado||!cantidad.trim()||soloLectura||guardando)return
  setGuardando(true)
  try{
   onAgregar(seleccionado.nombre,cantidad.trim())
   setSeleccionado(null)
   setMensaje('✅ Añadido a la lista. Puedes seguir eligiendo productos.')
   await registrarUso(seleccionado)
  }catch(e){setMensaje('Producto añadido, pero no se pudo actualizar el historial: '+String(e))}
  finally{setGuardando(false)}
 }
 const cambiarFavorito=async(p:ProductoVisual)=>{
  if(soloLectura)return
  try{await marcarFavorito(p);setMensaje('⭐ Preferencias actualizadas.')}
  catch(e){setMensaje('No se pudo cambiar favorito: '+String(e))}
 }
 const crear=async()=>{
  if(!nuevoNombre.trim()||soloLectura||guardando)return
  setGuardando(true)
  try{
   const creado=await guardar({
    nombre:nuevoNombre.trim(),categoria:nuevaCategoria.trim()||categoria||'Otros',
    subcategoria:nuevaSubcategoria.trim()||subcategoria||'General',
    emoji:nuevoEmoji.trim()||'🛒',default_quantity:nuevaCantidad.trim()||'1 unidad',
    favorite:true,is_custom:true
   })
   setCategoria(creado.categoria);setSubcategoria(creado.subcategoria)
   setMostrarFrecuentes(false);setBusqueda('');setNuevoNombre('');setNuevoEmoji('🛒')
   setNuevaCategoria('');setNuevaSubcategoria('');setNuevaCantidad('1 unidad');setEditando(false)
   setMensaje('✅ Acceso personalizado guardado y marcado como favorito.')
  }catch(e){setMensaje('No se ha podido crear el botón: '+(e instanceof Error?e.message:String(e)))}
  finally{setGuardando(false)}
 }
 const borrarPersonal=async(p:ProductoPersonal)=>{
  if(!p.is_custom||soloLectura||!window.confirm('¿Eliminar el botón personalizado «'+p.nombre+'»? No se borrarán artículos ya añadidos a la compra.'))return
  try{await eliminar(p.id);setMensaje('Botón personalizado eliminado.')}
  catch(e){setMensaje('No se pudo eliminar: '+String(e))}
 }
 const tarjetaProducto=(p:ProductoVisual)=>{
  const custom=favorito(p)
  return <div className="tablet-product-card" key={clave(p)}>
   <button type="button" className="tablet-visual-card" disabled={soloLectura} onClick={()=>elegir(p)}>
    <span className="tablet-visual-emoji" aria-hidden="true">{p.emoji}</span>
    <strong>{p.nombre}</strong>
    {custom?.default_quantity&&<small>{custom.default_quantity}</small>}
   </button>
   <div className="tablet-product-actions">
    <button type="button" aria-label={(custom?.favorite?'Quitar de':'Añadir a')+' favoritos: '+p.nombre}
      title={custom?.favorite?'Quitar favorito':'Añadir favorito'} disabled={soloLectura} onClick={()=>{void cambiarFavorito(p)}}>
      {custom?.favorite?'⭐':'☆'}
    </button>
    {custom?.is_custom&&<button type="button" title="Eliminar acceso personalizado" aria-label={'Eliminar '+p.nombre}
      disabled={soloLectura} onClick={()=>{void borrarPersonal(custom)}}>🗑️</button>}
   </div>
  </div>
 }
 return <section className="tablet-catalog-panel" aria-label="Catálogo visual de compras">
  <div className="tablet-visual-top">
   <div>
    <h2>🛒 Compra visual</h2>
    <p>Elige una categoría, después el tipo de producto y la cantidad. Usa ⭐ para tus frecuentes.</p>
   </div>
   <button className="btn-principal" type="button" disabled={soloLectura}
    onClick={()=>{setEditando(true);setNuevaCategoria(categoria??'');setNuevaSubcategoria(subcategoria??'');setMensaje('')}}>＋ Crear botón</button>
  </div>
  <div className="tablet-search-row">
   <input type="search" aria-label="Buscar en todo el catálogo" placeholder="🔎 Buscar cualquier producto, marca o categoría…"
    value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
   <button type="button" className="btn-secundario" onClick={()=>{setMostrarFrecuentes(true);setBusqueda('');setCategoria(null);setSubcategoria(null)}}>⭐ Favoritos y frecuentes</button>
  </div>
  <nav className="tablet-breadcrumb" aria-label="Ruta del catálogo">
   <button type="button" onClick={()=>{setCategoria(null);setSubcategoria(null);setMostrarFrecuentes(false);setBusqueda('')}}>Todas las categorías</button>
   {categoria&&<><span>›</span><button type="button" onClick={()=>{setSubcategoria(null);setMostrarFrecuentes(false);setBusqueda('')}}>{categoria}</button></>}
   {subcategoria&&<><span>›</span><strong>{subcategoria}</strong></>}
   {mostrarFrecuentes&&<><span>›</span><strong>Favoritos</strong></>}
  </nav>
  {cargando&&<p role="status">Cargando vuestros botones compartidos…</p>}
  {error&&<p role="alert" className="tablet-catalog-error">{error}</p>}
  {mensaje&&<p role="status" className="tablet-catalog-status">{mensaje}</p>}
  {busqueda.trim() ? <>
   <h3>Resultados de búsqueda ({resultados.length})</h3>
   <div className="tablet-visual-grid tablet-product-grid">{resultados.map(tarjetaProducto)}</div>
   {!resultados.length&&<button type="button" className="btn-secundario" disabled={soloLectura}
    onClick={()=>{setNuevoNombre(busqueda.trim());setEditando(true)}}>＋ Crear «{busqueda.trim()}» como producto personalizado</button>}
  </> : mostrarFrecuentes ? <>
   <h3>⭐ Vuestros accesos rápidos</h3>
   <div className="tablet-visual-grid tablet-product-grid">{frecuentes.map(tarjetaProducto)}</div>
   {!frecuentes.length&&<p>Aún no hay favoritos. Marca ⭐ en cualquier producto o crea un botón propio.</p>}
  </> : !categoria ? <>
   {frecuentes.length>0&&<div className="tablet-featured">
    <h3>💜 A mano siempre</h3>
    <div className="tablet-visual-grid tablet-product-grid">{frecuentes.slice(0,6).map(tarjetaProducto)}</div>
   </div>}
   <h3>Explorar por secciones</h3>
   <div className="tablet-visual-grid">{categorias.map(c=>
    <button className="tablet-visual-card" type="button" key={c.nombre}
     onClick={()=>{setCategoria(c.nombre);setSubcategoria(null)}}>
     <span className="tablet-visual-emoji" aria-hidden="true">{c.emoji}</span>
     <strong>{c.nombre}</strong>
    </button>)}</div>
  </> : !subcategoria ? <>
   <h3>{ico(categoria)} {categoria} · ¿Qué tipo buscas?</h3>
   <div className="tablet-visual-grid">{subcategorias.map(s=>
    <button className="tablet-visual-card" key={s.nombre} type="button" onClick={()=>setSubcategoria(s.nombre)}>
     <span className="tablet-visual-emoji" aria-hidden="true">{s.emoji}</span>
     <strong>{s.nombre}</strong>
    </button>)}</div>
  </> : <>
   <h3>{subcategoria} · elegir producto</h3>
   <div className="tablet-visual-grid tablet-product-grid">{productosNivel.map(tarjetaProducto)}</div>
  </>}
  {editando&&<div className="tablet-overlay" role="dialog" aria-modal="true" aria-label="Crear producto o categoría personalizada">
   <form className="tablet-dialog tablet-custom-form" onSubmit={e=>{e.preventDefault();void crear()}}
     onTouchStart={e=>e.stopPropagation()} onTouchEnd={e=>e.stopPropagation()}>
    <h2>✨ Crear un botón personalizado</h2>
    <p>Por ejemplo: categoría «Bebidas», subcategoría «Vino», producto «Sangre de Judas». Se guardará para el hogar y aparecerá en Favoritos.</p>
    <label>Categoría<input required value={nuevaCategoria} maxLength={55} placeholder="Ej.: Bebidas" onChange={e=>setNuevaCategoria(e.target.value)}/></label>
    <label>Subcategoría<input required value={nuevaSubcategoria} maxLength={55} placeholder="Ej.: Vino" onChange={e=>setNuevaSubcategoria(e.target.value)}/></label>
    <label>Nombre del artículo<input required value={nuevoNombre} maxLength={120} placeholder="Ej.: Sangre de Judas" onChange={e=>setNuevoNombre(e.target.value)}/></label>
    <label>Dibujo / emoji del botón<input value={nuevoEmoji} maxLength={12} onChange={e=>setNuevoEmoji(e.target.value)}/></label>
    <label>Cantidad habitual<input value={nuevaCantidad} maxLength={50} placeholder="Ej.: 1 botella" onChange={e=>setNuevaCantidad(e.target.value)}/></label>
    <div className="tablet-form-actions">
     <button type="submit" className="btn-principal" disabled={guardando||soloLectura||!nuevoNombre.trim()||!nuevaCategoria.trim()||!nuevaSubcategoria.trim()}>{guardando?'Guardando…':'💜 Guardar botón'}</button>
     <button type="button" className="btn-secundario" onClick={()=>setEditando(false)}>Cancelar</button>
    </div>
   </form>
  </div>}
  {seleccionado&&<div className="tablet-overlay" role="dialog" aria-modal="true" aria-label={'Cantidad de '+seleccionado.nombre}>
   <div className="tablet-dialog" onTouchStart={e=>e.stopPropagation()} onTouchEnd={e=>e.stopPropagation()}>
    <div className="tablet-selected-heading"><span>{seleccionado.emoji}</span><h2>{seleccionado.nombre}</h2></div>
    <p>Selecciona una cantidad o escribe la que prefieras.</p>
    <div className="tablet-quantities">{CANTIDADES.map(c=>
     <button className={cantidad===c?'tablet-quantity-active':''} type="button" key={c} onClick={()=>setCantidad(c)}>{c}</button>)}</div>
    <label>Cantidad personalizada<input value={cantidad} onChange={e=>setCantidad(e.target.value)} placeholder="Ej.: 2 botellas"/></label>
    <div className="tablet-form-actions">
     <button className="btn-principal" type="button" disabled={guardando||!cantidad.trim()} onClick={()=>{void confirmar()}}>🛒 Añadir a la compra</button>
     <button className="btn-secundario" type="button" onClick={()=>setSeleccionado(null)}>Cancelar</button>
    </div>
   </div>
  </div>}
 </section>
}
