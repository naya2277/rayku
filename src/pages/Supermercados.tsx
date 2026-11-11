import {useMemo,useState,useEffect} from 'react'
import {format,endOfWeek} from 'date-fns'
import {useRaykuStore} from '../store'
import {planificarCompraPorConservacion} from '../lib/compra/planificarCompraPorConservacion'
import {separarIngredientesPorInventario} from '../lib/generarListaCompra'
import {compararSupermercados,TIENDAS,type Tienda,type ObjetivoCompra} from '../lib/comparadorSupermercados'
import {useSupermercados,type PreferenciaTienda} from '../lib/useSupermercados'

type Props={householdId?:string}
const enlaces=[
 {nombre:'ALDI',url:'https://www.aldi.es/ofertas.html'},
 {nombre:'Lidl',url:'https://www.lidl.es/c/store/ofertas-semanales/a10089449'},
]
export default function Supermercados({householdId}:Props){
 const {planning,recetas,inventario,compraManual}=useRaykuStore()
 const datos=useSupermercados(householdId)
 const [tienda,setTienda]=useState<Tienda>('Consum')
 const [producto,setProducto]=useState('')
 const [precio,setPrecio]=useState('')
 const [cantidad,setCantidad]=useState('1')
 const [unidad,setUnidad]=useState('kg')
 const [modoVenta,setModoVenta]=useState<'envase'|'granel'>('envase')
 const [loyalty,setLoyalty]=useState(false)
 const [mensaje,setMensaje]=useState('')
 const [guardando,setGuardando]=useState(false)
 const [filtroOferta,setFiltroOferta]=useState('')
 const [editandoPreferencia,setEditandoPreferencia]=useState<PreferenciaTienda|null>(null)
 const [soloLista,setSoloLista]=useState(true)
 const hoy=format(new Date(),'yyyy-MM-dd')
 const fin=format(endOfWeek(new Date(),{weekStartsOn:1}),'yyyy-MM-dd')
 const planningFiltrado=useMemo(()=>planning.filter(p=>p.fecha>=hoy&&p.fecha<=fin&&!p.cocinado),[planning,hoy,fin])
 const compra=useMemo(()=>planificarCompraPorConservacion(planningFiltrado,recetas,new Date()),[planningFiltrado,recetas])
 const faltantes=useMemo(()=>separarIngredientesPorInventario(compra.ahora,inventario).paraComprar,[compra,inventario])
 const necesidades=faltantes.map(i=>({nombre:i.nombre,cantidad:i.cantidadFaltante??i.cantidad,unidad:i.unidad}))
 const manualesNoComparables=compraManual.map(i=>i.nombre)
 const ofertasVigentes=datos.ofertas.filter(o=>o.valid_from<=hoy&&o.valid_until>=hoy)
 const comparacion=compararSupermercados(necesidades,datos.precios,ofertasVigentes,
  datos.preferencia.tiendas,datos.preferencia.objetivo,hoy,loyalty,datos.preferencia.costeExtra)
 const clavesLista=new Set([...faltantes,...compra.despues].map(i=>i.clave))
 const visibles=ofertasVigentes.filter(o=>
  (!soloLista||clavesLista.has(o.product_key)) &&
  (o.product_name+' '+o.source).toLocaleLowerCase('es').includes(filtroOferta.toLocaleLowerCase('es')))
 useEffect(()=>{
  // Consultar automáticamente el servidor al abrir la pestaña. El servidor
  // aplica una caché de varias horas; nunca se piden folletos al usuario.
  let active=true
  const auto=async()=>{
   try{await datos.actualizarOfertas()}
   catch(e){if(active)setMensaje('Las ofertas no se han podido actualizar: '+(e instanceof Error?e.message:String(e)))}
  }
  void auto()
  return()=>{active=false}
 // Ejecutar una vez al cambiar el hogar; no repetir por cada cambio de datos.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[householdId])
 const guardarPrecio=async(e:React.FormEvent)=>{
  e.preventDefault();setGuardando(true);setMensaje('')
  try{
   await datos.guardarPrecio(tienda,producto,Number(precio),Number(cantidad),unidad,modoVenta)
   setMensaje('✅ Precio guardado para el hogar.');setProducto('');setPrecio('')
  }catch(e){setMensaje('⚠️ No se pudo guardar: '+(e instanceof Error?e.message:String(e)))}
  finally{setGuardando(false)}
 }
 const guardarPreferencias=async()=>{
  if(!editandoPreferencia)return
  setGuardando(true);setMensaje('')
  try{
   await datos.guardarPreferencia(editandoPreferencia)
   setEditandoPreferencia(null);setMensaje('✅ Preferencia de compra guardada para ambos.')
  }catch(e){setMensaje('⚠️ '+(e instanceof Error?e.message:String(e)))}
  finally{setGuardando(false)}
 }
 return <div className="supermercados-rayku" style={{display:'grid',gap:18,maxWidth:1050,margin:'0 auto'}}>
  <header className="card">
   <h1>🛒 Supermercados y ahorro</h1>
   <p>Rayku compara la lista de compra con los precios que conocemos y las promociones vigentes. Evitamos visitas adicionales cuando no compensan el tiempo y el desplazamiento.</p>
   <p style={{fontSize:13}}>Las promociones se consultan automáticamente al entrar. Si una fuente no permite extraer un precio con fiabilidad, no lo inventamos.</p>
   {datos.estado==='error'&&<p role="alert">⚠️ {datos.error}</p>}
  </header>
  <section className="card" style={{display:'grid',gap:12}}>
   <h2>💜 Cómo queréis hacer la compra</h2>
   <p>Preferencia: <strong>{datos.preferencia.objetivo==='equilibrio'?'Equilibrio entre ahorro y comodidad':datos.preferencia.objetivo==='ahorro'?'Máximo ahorro':'Mínimas paradas'}</strong>. {datos.preferencia.tiendas.join(', ')}</p>
   <button className="btn-secundario" type="button" onClick={()=>setEditandoPreferencia({...datos.preferencia,tiendas:[...datos.preferencia.tiendas]})}>⚙️ Ajustar supermercados y prioridades</button>
   {editandoPreferencia&&<div style={{display:'grid',gap:10,border:'1px solid #eadce7',padding:14,borderRadius:14}}>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
     {TIENDAS.map(t=><label key={t} style={{display:'flex',gap:6,alignItems:'center'}}>
      <input type="checkbox" checked={editandoPreferencia.tiendas.includes(t)} onChange={e=>setEditandoPreferencia(x=>x?{
       ...x,tiendas:e.target.checked?[...x.tiendas,t]:x.tiendas.filter(v=>v!==t)
      }:x)}/>{t}</label>)}
    </div>
    <label>Objetivo<select value={editandoPreferencia.objetivo} onChange={e=>setEditandoPreferencia(x=>x?{...x,objetivo:e.target.value as ObjetivoCompra}:x)}>
      <option value="equilibrio">Equilibrio entre ahorro y tiempo</option>
      <option value="comodidad">Comprar en menos sitios</option>
      <option value="ahorro">Máximo ahorro</option>
    </select></label>
    <label>Coste aproximado de una parada adicional (€)
      <input type="number" min="0" max="100" step="0.5" value={editandoPreferencia.costeExtra}
       onChange={e=>setEditandoPreferencia(x=>x?{...x,costeExtra:Number(e.target.value)}:x)}/>
    </label>
    <p style={{fontSize:12}}>Esta cifra representa tiempo, gasolina y esfuerzo, no un gasto cobrado por Rayku.</p>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
     <button type="button" className="btn-principal" disabled={guardando||!editandoPreferencia.tiendas.length} onClick={()=>{void guardarPreferencias()}}>Guardar preferencias</button>
     <button type="button" className="btn-secundario" onClick={()=>setEditandoPreferencia(null)}>Cancelar</button>
    </div>
   </div>}
  </section>
  <section className="card" style={{display:'grid',gap:12}}>
   <h2>💶 Comparación de vuestra compra</h2>
   <p>Compra necesaria entre {hoy} y {fin}: {necesidades.length} ingredientes. {compra.despues.length} frescos programados para comprarse más adelante.</p>
   {comparacion.totalConPrecio>0?<div style={{display:'grid',gap:10}}>
    <strong>Importe estimado de compra para artículos comparables: {comparacion.coste.toFixed(2)} €</strong>
    <p style={{fontSize:12}}>Para productos vendidos por envases cerrados se calcula el número de envases completos. En productos identificados como a granel, el precio es proporcional a la cantidad. Los precios reales pueden variar según el peso y disponibilidad.</p>
    <p>Propuesta: {comparacion.tiendas.join(' + ')} ({comparacion.tiendas.length} {comparacion.tiendas.length===1?'establecimiento':'establecimientos'}).</p>
    {comparacion.items.map((i,index)=><div key={index} style={{display:'flex',justifyContent:'space-between',gap:12,padding:'10px 0',borderBottom:'1px solid #eee'}}>
     <span>{i.producto} · {i.cantidad} {i.unidad} <small>({i.tienda}{i.oferta?' · Oferta':''}{i.requires_loyalty?' · Fidelización':''})</small></span>
     <strong>{i.coste.toFixed(2)} €</strong>
    </div>)}
   </div>:<p>No hay suficientes precios comparables todavía para recomendar una tienda. No se calculará un ahorro ficticio.</p>}
   {(comparacion.sinPrecio.length>0||manualesNoComparables.length>0)&&<p role="status">
     ⚠️ Compra incompleta: {comparacion.sinPrecio.length} ingredientes sin precio comparable y {manualesNoComparables.length} anotaciones manuales sin cantidad estructurada. El importe mostrado <strong>no es el total de la compra</strong>.
   </p>}
   <label style={{display:'flex',gap:8,alignItems:'center'}}>
    <input type="checkbox" checked={loyalty} onChange={e=>setLoyalty(e.target.checked)}/>
    Tengo acceso a ofertas de fidelización (por ejemplo Lidl Plus)
   </label>
  </section>
  <section className="card" style={{display:'grid',gap:12}}>
   <h2>🏷️ Ofertas semanales verificadas</h2>
   <p>Rayku solo utiliza ofertas con importe, unidad y vigencia identificados. Pueden variar por tienda y estar sujetas a existencias.</p>
   <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
    <input aria-label="Buscar oferta" placeholder="Buscar un producto…" value={filtroOferta} onChange={e=>setFiltroOferta(e.target.value)} style={{flex:'1 1 200px'}}/>
    <label style={{display:'flex',gap:6,alignItems:'center'}}>
     <input type="checkbox" checked={soloLista} onChange={e=>setSoloLista(e.target.checked)}/> Solo mi compra
    </label>
    <button type="button" className="btn-secundario" disabled={guardando}
      onClick={async()=>{setGuardando(true);try{await datos.actualizarOfertas();setMensaje('Consulta de ofertas finalizada.')}catch(e){setMensaje('No se pudo consultar: '+String(e))}finally{setGuardando(false)}}}>↻ Comprobar fuentes</button>
   </div>
   {datos.fuentes.map(f=><p key={f.source} style={{fontSize:12,margin:0}}>
    <strong>{f.source}:</strong> {f.last_success?'Última actualización '+new Date(f.last_success).toLocaleString('es-ES'):'Todavía sin importación verificada.'}
    {f.last_error?' · ⚠️ '+f.last_error:''}
   </p>)}
   {!visibles.length?<p role="status">No hay promociones contrastadas que coincidan con este filtro. Puedes seguir usando los precios habituales guardados; no necesitas revisar folletos para continuar.</p>:
    <div style={{display:'grid',gap:7}}>
     {visibles.map(o=><div key={o.source+o.product_key+o.valid_from} style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',borderBottom:'1px solid #eee',padding:9}}>
      <span><strong>{o.product_name}</strong> · {o.source} · {o.price.toFixed(2)} € / {o.quantity} {o.unit}
       <small style={{display:'block'}}>Válida del {o.valid_from} al {o.valid_until}{o.requires_loyalty?' · Requiere fidelización':''}</small></span>
      <a href={o.source_url} target="_blank" rel="noopener noreferrer">Ver fuente</a>
     </div>)}
    </div>}
   <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
    {enlaces.map(e=><a key={e.nombre} href={e.url} target="_blank" rel="noopener noreferrer">Ofertas oficiales {e.nombre}</a>)}
   </div>
  </section>
  <section className="card" style={{display:'grid',gap:12}}>
   <h2>📋 Precios habituales de cada supermercado</h2>
   <p>Son una referencia opcional. Si no hay un precio conocido, Rayku muestra la comparación como incompleta en lugar de pedirte rellenar una lista de 50 artículos.</p>
   <form onSubmit={e=>{void guardarPrecio(e)}} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:10}}>
    <label>Supermercado<select value={tienda} onChange={e=>setTienda(e.target.value as Tienda)}>
      {TIENDAS.map(t=><option key={t} value={t}>{t}</option>)}
    </select></label>
    <label>Producto<input required value={producto} onChange={e=>setProducto(e.target.value)} placeholder="Ej.: salmón"/></label>
    <label>Precio (€)<input type="number" required min="0" step="0.01" value={precio} onChange={e=>setPrecio(e.target.value)}/></label>
    <label>Cantidad del envase<input type="number" required min="0.001" step="any" value={cantidad} onChange={e=>setCantidad(e.target.value)}/></label>
    <label>Unidad<select value={unidad} onChange={e=>setUnidad(e.target.value)}>
      {['kg','g','l','ml','u','paquete','lata','bote'].map(u=><option key={u} value={u}>{u}</option>)}
    </select></label>
    <label>Forma de venta<select value={modoVenta} onChange={e=>setModoVenta(e.target.value as 'envase'|'granel')}>
      <option value="envase">Envase cerrado (se compra entero)</option>
      <option value="granel">A granel (pago por peso o volumen)</option>
    </select></label>
    <p style={{fontSize:12,gridColumn:'1 / -1'}}>Introduce el precio por la cantidad indicada. Para un kilo de manzanas a granel, por ejemplo, pon 1 kg y el precio por kilo; para una bandeja de carne, pon el peso y precio de la bandeja.</p>
    <button type="submit" className="btn-principal" disabled={guardando||!householdId}>{guardando?'Guardando…':'Guardar precio'}</button>
   </form>
   {datos.precios.length>0&&<details>
    <summary>Ver precios guardados ({datos.precios.length})</summary>
    <div style={{display:'grid',gap:8,marginTop:12}}>
      {datos.precios.map(p=><div key={p.store+p.product_key}>{p.store} · {p.product_key} · {p.price.toFixed(2)} € / {p.quantity} {p.unit} · {p.sale_mode==='granel'?'A granel':'Envase cerrado'}</div>)}
    </div>
   </details>}
   {!householdId&&<p>Selecciona Domus Infinita para guardar precios compartidos.</p>}
  </section>
  {mensaje&&<p className="card" role="status">{mensaje}</p>}
 </div>
}
