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
export async function readFoodProfiles(householdId: string): Promise<FoodProfile[]> {
  const {data: members,error:memberError}=await supabase.from('household_members').select('user_id').eq('household_id',householdId)
  if(memberError) throw memberError
  const ids=(members??[]).map(m=>m.user_id)
  if(!ids.length) return []
  const {data,error}=await supabase.from('rayku_food_profiles').select(fields).in('user_id',ids)
  if(error) throw error
  return (data??[]) as FoodProfile[]
}
export async function saveFoodProfile(profile: Omit<FoodProfile,'user_id'>): Promise<void> {
  const {data:{user},error:authError}=await supabase.auth.getUser()
  if(authError || !user) throw authError ?? new Error('Inicia sesión')
  const {error}=await supabase.from('rayku_food_profiles').upsert({...profile,user_id:user.id,updated_at:new Date().toISOString()},{onConflict:'user_id'})
  if(error) throw error
  window.dispatchEvent(new Event('rayku-food-profiles-updated'))
}
