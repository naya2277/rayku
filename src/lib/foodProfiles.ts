import { supabase } from './supabase'
export type FoodProfile = {
  user_id: string
  display_name: string
  allergies: string[]
  intolerances: string[]
  dislikes: string[]
  favorites: string[]
  diets: string[]
}
const fields = 'user_id,display_name,allergies,intolerances,dislikes,favorites,diets'
const cache = new Map<string,{expires:number;value:FoodProfile[]}>()
const inFlight = new Map<string,Promise<FoodProfile[]>>()
export function invalidateFoodProfilesCache(householdId?:string) {
  if(householdId) cache.delete(householdId)
  else cache.clear()
}

export async function readFoodProfiles(householdId: string): Promise<FoodProfile[]> {
  const cached = cache.get(householdId)
  if (cached && cached.expires > Date.now()) return cached.value
  const ongoing = inFlight.get(householdId)
  if (ongoing) return ongoing
  const request = (async () => {
    const {data: members,error:memberError}=await supabase.from('household_members').select('user_id').eq('household_id',householdId)
    if(memberError) throw memberError
    const ids=(members??[]).map(m=>m.user_id)
    if(!ids.length) return [] as FoodProfile[]
    const {data,error}=await supabase.from('rayku_food_profiles').select(fields).in('user_id',ids)
    if(error) throw error
    return (data??[]) as FoodProfile[]
  })()
  inFlight.set(householdId,request)
  try {
    const value=await request
    cache.set(householdId,{expires:Date.now()+15_000,value})
    return value
  } finally {
    inFlight.delete(householdId)
  }
}
export async function saveFoodProfile(profile: Omit<FoodProfile,'user_id'>): Promise<void> {
  const {data:{user},error:authError}=await supabase.auth.getUser()
  if(authError || !user) throw authError ?? new Error('Inicia sesión')
  const {data: saved,error}=await supabase
    .from('rayku_food_profiles')
    .upsert({...profile,user_id:user.id,updated_at:new Date().toISOString()},{onConflict:'user_id'})
    .select(fields)
    .single()
  if(error) throw new Error('No se pudo guardar el perfil en Supabase: '+error.message)
  if(!saved || saved.user_id!==user.id) throw new Error('Supabase no ha confirmado el guardado de tu perfil. No se ha marcado como guardado.')
  const {data: verified,error:verificationError}=await supabase.from('rayku_food_profiles').select('user_id').eq('user_id',user.id).maybeSingle()
  if(verificationError || !verified) throw new Error('No se pudo verificar el perfil después de guardarlo. Revisa la conexión e inténtalo de nuevo.')
  cache.clear()
  window.dispatchEvent(new Event('rayku-food-profiles-updated'))
}
