import {useCallback,useEffect,useState} from 'react'
import {supabase} from './supabase'
import {obtenerClaveIngredienteCompra} from './compra/normalizacionCompra'
import {TIENDAS,type Tienda,type PrecioTienda,type OfertaSupermercado,type ObjetivoCompra} from './comparadorSupermercados'

export type PreferenciaTienda={tiendas:Tienda[];objetivo:ObjetivoCompra;costeExtra:number}
const defaults:PreferenciaTienda={tiendas:['Consum','Mercadona','ALDI','Lidl'],objetivo:'equilibrio',costeExtra:4}
const localKey='rayku-supermercados-preferencias-v1'
export function useSupermercados(householdId?:string){
 const [precios,setPrecios]=useState<PrecioTienda[]>([])
 const [ofertas,setOfertas]=useState<OfertaSupermercado[]>([])
 const [preferencia,setPreferencia]=useState<PreferenciaTienda>(defaults)
 const [estado,setEstado]=useState<'loading'|'ready'|'error'>('loading')
 const [fuentes,setFuentes]=useState<{source:string;last_attempt:string|null;last_success:string|null;last_error:string|null;last_count:number}[]>([])
 const [error,setError]=useState('')
 const cargar=useCallback(async()=>{
  setEstado('loading')
  try{
   const fecha=new Date().toLocaleDateString('sv-SE')
   const [p,o,estadoFuentes,pref]=await Promise.all([
    householdId?supabase.from('rayku_supermarket_prices')
      .select('store,product_key,price,quantity,unit,sale_mode,observed_at').eq('household_id',householdId):
      Promise.resolve({data:[],error:null}),
    supabase.from('rayku_public_offers')
      .select('source,product_key,product_name,price,quantity,unit,valid_from,valid_until,requires_loyalty,source_url,fetched_at')
      .gte('valid_until',fecha),
    supabase.from('rayku_offers_refresh').select('source,last_attempt,last_success,last_error,last_count'),
    householdId?supabase.from('rayku_supermarket_preferences')
      .select('selected_stores,preference,extra_stop_cost').eq('household_id',householdId).maybeSingle():
      Promise.resolve({data:null,error:null}),
   ])
   if(p.error||o.error||estadoFuentes.error||pref.error)throw p.error??o.error??estadoFuentes.error??pref.error
   setPrecios((p.data??[]).map((x:any)=>({...x,price:Number(x.price),quantity:Number(x.quantity)})))
   setOfertas((o.data??[]).filter((x:any)=>x.quantity>0).map((x:any)=>({...x,product_key:obtenerClaveIngredienteCompra(x.product_key),price:Number(x.price),quantity:Number(x.quantity)})))
   setFuentes((['ALDI','Lidl'] as const).map(source => (estadoFuentes.data??[]).find((x:any)=>x.source===source) ?? {source,last_attempt:null,last_success:null,last_error:'Aún no hay ofertas verificadas de esta fuente.',last_count:0}) as typeof fuentes)
   let local:PreferenciaTienda=defaults
   try{local={...defaults,...JSON.parse(localStorage.getItem(localKey)??'{}')}}catch{/* defaults */}
   if(pref.data){
    const raw=pref.data
    setPreferencia({tiendas:(raw.selected_stores??defaults.tiendas).filter((x:string)=>TIENDAS.includes(x as Tienda)) as Tienda[],
      objetivo:raw.preference as ObjetivoCompra,costeExtra:Number(raw.extra_stop_cost)})
   }else setPreferencia(local)
   setError('');setEstado('ready')
  }catch(e){setError(e instanceof Error?e.message:String(e));setEstado('error')}
 },[householdId])
 useEffect(()=>{
  void cargar()
  const focus=()=>{void cargar()}
  window.addEventListener('focus',focus)
  const channel=householdId?supabase.channel('rayku-supermercados-'+householdId)
   .on('postgres_changes',{event:'*',schema:'public',table:'rayku_supermarket_prices',
    filter:'household_id=eq.'+householdId},()=>{void cargar()})
   .on('postgres_changes',{event:'*',schema:'public',table:'rayku_supermarket_preferences',
    filter:'household_id=eq.'+householdId},()=>{void cargar()})
   .subscribe():null
  return()=>{window.removeEventListener('focus',focus);if(channel)void supabase.removeChannel(channel)}
 },[cargar,householdId])
 const guardarPrecio=useCallback(async(store:Tienda,nombre:string,price:number,quantity:number,unit:string,saleMode:'envase'|'granel')=>{
  if(!householdId)throw new Error('Selecciona un hogar compartido.')
  const clave=obtenerClaveIngredienteCompra(nombre)
  if(!clave||!Number.isFinite(price)||price<0||!Number.isFinite(quantity)||quantity<=0||!['envase','granel'].includes(saleMode))
   throw new Error('Precio o cantidad inválidos.')
  const {data:{user},error:e}=await supabase.auth.getUser()
  if(e||!user)throw new Error('Inicia sesión de nuevo.')
  const {error:err}=await supabase.from('rayku_supermarket_prices').upsert({
   household_id:householdId,store,product_key:clave,price,quantity,unit,sale_mode:saleMode,updated_by:user.id,observed_at:new Date().toISOString(),
  },{onConflict:'household_id,store,product_key'})
  if(err)throw err
  await cargar()
 },[householdId,cargar])
 const guardarPreferencia=useCallback(async(next:PreferenciaTienda)=>{
  if(!next.tiendas.length)throw new Error('Selecciona al menos un supermercado.')
  if(!Number.isFinite(next.costeExtra)||next.costeExtra<0||next.costeExtra>100)throw new Error('Coste extra no válido.')
  if(!householdId){
   localStorage.setItem(localKey,JSON.stringify(next));setPreferencia(next);return
  }
  const {data:{user},error:e}=await supabase.auth.getUser()
  if(e||!user)throw new Error('Inicia sesión para guardar.')
  const {error:err}=await supabase.from('rayku_supermarket_preferences').upsert({
   household_id:householdId,selected_stores:next.tiendas,preference:next.objetivo,
   extra_stop_cost:next.costeExtra,updated_by:user.id,updated_at:new Date().toISOString(),
  },{onConflict:'household_id'})
  if(err)throw err
  setPreferencia(next)
 },[householdId])
 const actualizarOfertas=useCallback(async()=>{
  const {error:err}=await supabase.functions.invoke('rayku-ofertas',{body:{refresh:true}})
  if(err)throw err
  await cargar()
 },[cargar])
 return {precios,ofertas,fuentes,preferencia,estado,error,guardarPrecio,guardarPreferencia,actualizarOfertas,recargar:cargar}
}
