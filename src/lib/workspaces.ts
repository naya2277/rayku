import { supabase } from './supabase'

/**
 * Rayku 2.0 data access. This module is intentionally not connected to the
 * legacy Zustand store until the migration and offline strategy are tested.
 */
export type Workspace =
  | { scope: 'personal'; userId: string }
  | { scope: 'household'; householdId: string }

export type WorkspaceKind =
  | 'recipes'
  | 'inventory'
  | 'planning'
  | 'shopping_list'

export type Household = {
  id: string
  name: string
  created_by: string
  created_at: string
}

export type WorkspaceRecord<T = unknown> = {
  id: string
  owner_user_id: string | null
  household_id: string | null
  kind: WorkspaceKind
  payload: T
  version: number
  updated_at: string
  updated_by: string
}

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('Inicia sesión para acceder a Rayku.')
  return data.user.id
}

export async function listHouseholds(): Promise<Household[]> {
  await currentUserId()
  const { data, error } = await supabase
    .from('households')
    .select('id,name,created_by,created_at')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Household[]
}

export async function createHousehold(name: string): Promise<Household> {
  await currentUserId()
  const trimmed = name.trim()
  if (!trimmed) throw new Error('El hogar necesita un nombre.')
  const { data: id, error } = await supabase.rpc('rayku_create_household', { p_name: trimmed })
  if (error) throw error
  if (typeof id !== 'string') throw new Error('No se ha recibido el identificador del hogar.')
  const { data: household, error: readError } = await supabase
    .from('households')
    .select('id,name,created_by,created_at')
    .eq('id', id)
    .single()
  if (readError) throw readError
  return household as Household
}

export async function getWorkspaceRecord<T>(
  workspace: Workspace,
  kind: WorkspaceKind
): Promise<WorkspaceRecord<T> | null> {
  const signedInUser = await currentUserId()
  if (workspace.scope === 'personal' && workspace.userId !== signedInUser) {
    throw new Error('No puedes abrir el espacio personal de otra cuenta.')
  }

  const field = workspace.scope === 'personal'
    ? 'owner_user_id'
    : 'household_id'
  const id = workspace.scope === 'personal'
    ? workspace.userId
    : workspace.householdId

  const { data, error } = await supabase
    .from('workspace_records')
    .select('id,owner_user_id,household_id,kind,payload,version,updated_at,updated_by')
    .eq(field, id)
    .eq('kind', kind)
    .maybeSingle()

  if (error) throw error
  return data as WorkspaceRecord<T> | null
}

export async function createHouseholdInvitation(householdId: string, email: string): Promise<string> {
  await currentUserId()
  const { data, error } = await supabase.rpc('rayku_create_household_invitation', {p_household:householdId,p_email:email.trim()})
  if (error) throw error
  if (typeof data !== 'string') throw new Error('No se ha generado la invitación.')
  return data
}

export async function acceptHouseholdInvitation(token: string): Promise<string> {
  await currentUserId()
  const { data, error } = await supabase.rpc('rayku_accept_household_invitation', {p_token:token.trim()})
  if (error) throw error
  return String(data)
}

export async function saveSharedRecord<T>(householdId:string,kind:'planning'|'shopping_list'|'inventory',payload:T,expectedVersion:number):Promise<WorkspaceRecord<T>>{
 await currentUserId()
 const {data,error}=await supabase.rpc('rayku_save_workspace_record',{
  p_household:householdId,p_kind:kind,p_payload:payload,p_expected_version:expectedVersion
 })
 if(error)throw error
 return data as WorkspaceRecord<T>
}
