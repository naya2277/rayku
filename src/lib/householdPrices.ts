import {useCallback,useEffect,useState} from 'react'
import {supabase} from './supabase'
import type {Precios,PrecioUnitario} from './planificacionInteligente'
import {obtenerClaveIngredienteCompra} from './compra/normalizacionCompra'
const KEY='rayku-precios-local-v1'
function leerLocales():Precios{try{return JSON.parse(localStorage.getItem(KEY)??'{}') as Precios}catch{return {}}}
export function usePreciosHogar(householdId?:string){
 const [precios,setPrecios]=useState<Precios>(leerLocales)
 const [estado,setEstado]=useState<'loading'|'ready'|'error'>(householdId?'loading':'ready')
 const [error,setError]=useState('')
 const cargar=useCallback(async()=>{
  if(!householdId){setPrecios(leerLocales());setEstado('ready');return}
  setEstado('loading')
  const {data,error:e}=await supabase.from('rayku_household_prices')
   .select('product_key,price,quantity,unit').eq('household_id',householdId)
  if(e){setError(e.message);setEstado('error');return}
  const nuevo:Precios={}
  for(const r of data??[])nuevo[r.product_key]={precio:Number(r.price),cantidad:Number(r.quantity),unidad:r.unit}
  setPrecios(nuevo)
  setError('')
  setEstado('ready')
 },[householdId])
 useEffect(()=>{
  void cargar()
  const onFocus=()=>{void cargar()}
  window.addEventListener('focus',onFocus)
  const channel=householdId?supabase.channel('rayku-precios-'+householdId)
   .on('postgres_changes',{event:'*',schema:'public',table:'rayku_household_prices',filter:'household_id=eq.'+householdId},()=>{void cargar()})
   .subscribe():null
  return()=>{window.removeEventListener('focus',onFocus);if(channel)void supabase.removeChannel(channel)}
 },[cargar,householdId])
 const guardar=useCallback(async(nombre:string,precio:PrecioUnitario)=>{
  const clave=obtenerClaveIngredienteCompra(nombre)
  if(!clave || !Number.isFinite(precio.precio) || precio.precio<0 ||
    !Number.isFinite(precio.cantidad) || precio.cantidad<=0)throw new Error('Precio o cantidad no válidos.')
  if(householdId){
   const {data:{user},error:e}=await supabase.auth.getUser()
   if(e || !user)throw new Error('Inicia sesión para guardar precios.')
   const {error:savedError}=await supabase.from('rayku_household_prices').upsert({
    household_id:householdId,product_key:clave,price:precio.precio,
    quantity:precio.cantidad,unit:precio.unidad,updated_by:user.id,updated_at:new Date().toISOString(),
   },{onConflict:'household_id,product_key'})
   if(savedError)throw new Error(savedError.message)
   await cargar()
  }else{
   const next={...leerLocales(),[clave]:precio}
   localStorage.setItem(KEY,JSON.stringify(next))
   setPrecios(next)
  }
 },[householdId,cargar])
 return {precios,estado,error,guardar,recargar:cargar}
}
