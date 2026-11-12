import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { ProductoVisual } from './tabletCatalog'
import { claveProductoVisual } from './tabletCatalog'

export type ProductoPersonal = ProductoVisual & {
 id: string
 default_quantity: string
 favorite: boolean
 use_count: number
 is_custom: boolean
}
export type DatosProducto = ProductoVisual & {
 default_quantity?: string
 favorite?: boolean
 is_custom?: boolean
}
const LOCAL_KEY = 'rayku-catalogo-personal-v2'
const leerLocal = (): ProductoPersonal[] => {
 try {
  const valor = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]')
  return Array.isArray(valor) ? valor : []
 } catch { return [] }
}
const escribirLocal = (items: ProductoPersonal[]) => localStorage.setItem(LOCAL_KEY, JSON.stringify(items))
const idLocal = () => typeof crypto !== 'undefined' && crypto.randomUUID
 ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
function limpiar(input: DatosProducto): DatosProducto {
 const nombre = input.nombre.trim().slice(0,120)
 const categoria = input.categoria.trim().slice(0,55) || 'Otros'
 const subcategoria = input.subcategoria.trim().slice(0,55) || 'General'
 const emoji = Array.from(input.emoji.trim()).slice(0,5).join('') || '🛒'
 const default_quantity = (input.default_quantity ?? '1 unidad').trim().slice(0,50) || '1 unidad'
 if (!nombre) throw new Error('Indica el nombre del producto.')
 return {nombre,categoria,subcategoria,emoji,default_quantity,
  favorite: Boolean(input.favorite),is_custom:input.is_custom ?? true}
}
function normalizarFila(row: any): ProductoPersonal {
 return {
  id:String(row.id),nombre:String(row.name),categoria:String(row.category),
  subcategoria:String(row.subcategory),emoji:String(row.emoji || '🛒'),
  default_quantity:String(row.default_quantity || '1 unidad'),
  favorite:Boolean(row.favorite),use_count:Number(row.use_count) || 0,
  is_custom:Boolean(row.is_custom)
 }
}

/** Reusable shared shopping catalogue, scoped by Supabase household RLS.
 * Personal workspace remains local-only and never leaks into a different household.
 */
export function useCustomProducts(householdId?: string) {
 const [productos,setProductos] = useState<ProductoPersonal[]>([])
 const [cargando,setCargando] = useState(true)
 const [error,setError] = useState('')

 const cargar = useCallback(async () => {
  if (!householdId) {setProductos(leerLocal());setError('');setCargando(false);return}
  try {
   const {data,error:err} = await supabase.from('rayku_custom_products')
    .select('id,name,category,subcategory,emoji,default_quantity,favorite,use_count,is_custom')
    .eq('household_id',householdId).order('name')
   if(err) throw err
   setProductos((data??[]).map(normalizarFila));setError('')
  } catch (e) {
   setError('No se ha podido cargar el catálogo compartido: '+(e instanceof Error?e.message:String(e)))
  } finally {setCargando(false)}
 },[householdId])

 useEffect(()=>{
  setCargando(true);setProductos([]);void cargar()
  const focus=()=>{void cargar()}
  window.addEventListener('focus',focus)
  const channel = householdId ? supabase.channel('rayku-custom-products-'+householdId)
   .on('postgres_changes',{event:'*',schema:'public',table:'rayku_custom_products',
    filter:'household_id=eq.'+householdId},()=>{void cargar()}).subscribe() : null
  return()=>{window.removeEventListener('focus',focus);if(channel)void supabase.removeChannel(channel)}
 },[householdId,cargar])

 const guardar = useCallback(async(input:DatosProducto, usoInicial=0):Promise<ProductoPersonal>=>{
  const limpio=limpiar(input)
  const clave=claveProductoVisual(limpio)
  const existente=productos.find(p=>claveProductoVisual(p)===clave)
  if(existente)return existente
  if(!householdId){
   const item:ProductoPersonal={id:idLocal(),nombre:limpio.nombre,categoria:limpio.categoria,
    subcategoria:limpio.subcategoria,emoji:limpio.emoji,default_quantity:limpio.default_quantity!,
    favorite:Boolean(limpio.favorite),use_count:usoInicial,is_custom:Boolean(limpio.is_custom)}
   const next=[...leerLocal(),item];escribirLocal(next);setProductos(next);return item
  }
  const {data:{user},error:e}=await supabase.auth.getUser()
  if(e||!user)throw new Error('Inicia sesión para guardar productos compartidos.')
  const {data,error:err}=await supabase.from('rayku_custom_products').insert({
   household_id:householdId,name:limpio.nombre,category:limpio.categoria,
   subcategory:limpio.subcategoria,emoji:limpio.emoji,default_quantity:limpio.default_quantity,
   favorite:limpio.favorite,use_count:usoInicial,is_custom:limpio.is_custom,updated_by:user.id,
  }).select('id,name,category,subcategory,emoji,default_quantity,favorite,use_count,is_custom').single()
  if(err)throw err
  const saved=normalizarFila(data);setProductos(prev=>[...prev.filter(p=>p.id!==saved.id),saved])
  return saved
 },[householdId,productos])

 const actualizar = useCallback(async(id:string,cambios:Partial<Pick<ProductoPersonal,'favorite'|'use_count'|'default_quantity'>>)=>{
  const item=productos.find(p=>p.id===id);if(!item)return
  if(!householdId){
   const next=leerLocal().map(p=>p.id===id?{...p,...cambios}:p)
   escribirLocal(next);setProductos(next);return
  }
  const {data:{user},error:e}=await supabase.auth.getUser()
  if(e||!user)throw new Error('Inicia sesión para actualizar el catálogo.')
  const {error:err}=await supabase.from('rayku_custom_products')
   .update({...cambios,updated_by:user.id,updated_at:new Date().toISOString()})
   .eq('id',id).eq('household_id',householdId)
  if(err)throw err
  setProductos(prev=>prev.map(p=>p.id===id?{...p,...cambios}:p))
 },[householdId,productos])

 const marcarFavorito=useCallback(async(producto:ProductoVisual)=>{
  const existente=productos.find(p=>claveProductoVisual(p)===claveProductoVisual(producto))
  if(existente)await actualizar(existente.id,{favorite:!existente.favorite})
  else await guardar({...producto,favorite:true,is_custom:false})
 },[productos,guardar,actualizar])

 const registrarUso=useCallback(async(producto:ProductoVisual)=>{
  const existente=productos.find(p=>claveProductoVisual(p)===claveProductoVisual(producto))
  if(existente)await actualizar(existente.id,{use_count:existente.use_count+1})
  else await guardar({...producto,favorite:false,is_custom:false},1)
 },[productos,guardar,actualizar])

 const eliminar=useCallback(async(id:string)=>{
  if(!householdId){
   const next=leerLocal().filter(p=>p.id!==id)
   escribirLocal(next);setProductos(next);return
  }
  const {error:err}=await supabase.from('rayku_custom_products')
   .delete().eq('id',id).eq('household_id',householdId)
  if(err)throw err
  setProductos(prev=>prev.filter(p=>p.id!==id))
 },[householdId])

 return {productos,cargando,error,cargar,guardar,marcarFavorito,registrarUso,eliminar}
}
