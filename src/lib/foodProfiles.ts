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
  const {error}=await supabase.from('rayku_food_profiles').upsert({...profile,user_id:user.id,updated_at:new Date().toISOString()},{onConflict:'user_id'})
  if(error) throw error
  cache.clear()
  window.dispatchEvent(new Event('rayku-food-profiles-updated'))
}
