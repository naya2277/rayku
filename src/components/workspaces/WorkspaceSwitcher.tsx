import { useEffect, useState } from 'react'
import { listHouseholds, createHousehold, createHouseholdInvitation, acceptHouseholdInvitation, type Household } from '../../lib/workspaces'
import { useRaykuStore } from '../../store'
import { getWorkspaceRecord, saveSharedRecord } from '../../lib/workspaces'
import type { Receta } from '../../store/types'
import { descargarRecetas } from '../../lib/sync'
import { loadWorkspaceData, saveWorkspaceKind, type WorkspaceData } from '../../lib/workspaceData'
import './WorkspaceSwitcher.css'

function describirError(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const e = error as { message?: string; details?: string; hint?: string; code?: string }
    const partes = [e.message, e.details, e.hint, e.code && 'Código: ' + e.code].filter(Boolean)
    if (partes.length) return partes.join(' · ')
  }
  return 'Error desconocido. Revisa los permisos del hogar.'
}

type Props = { userId: string; selection: string; onSelect: (id: string) => Promise<void>; busy?: boolean }

/**
 * The shared board is live once migrations are applied; legacy pages remain personal.
 * Selecting a household does not switch the legacy planning or shopping data.
 */
export default function WorkspaceSwitcher({ userId, selection, onSelect, busy = false }: Props) {
  const [newName,setNewName] = useState('')
  const [copying,setCopying] = useState(false)
  const [recipeToCopy,setRecipeToCopy] = useState('')
  const [copyTarget,setCopyTarget] = useState('')
  const recipes = useRaykuStore(state => state.recetas)
  const [inviteEmail,setInviteEmail] = useState('')
  const [inviteToken,setInviteToken] = useState('')
  const [joinToken,setJoinToken] = useState(() => new URLSearchParams(window.location.search).get('invite') ?? '')
  const [message,setMessage] = useState('')
  const [households, setHouseholds] = useState<Household[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')

  useEffect(() => {
    let active = true
    setHouseholds([])
    setStatus('loading')
    listHouseholds()
      .then(items => {
        if (!active) return
        setHouseholds(items)
        setStatus('ready')
      })
      .catch(error => {
        if (active) { setStatus('unavailable'); setMessage(describirError(error)) }
      })
    return () => { active = false }
  }, [userId])

  const refresh = async () => { const items=await listHouseholds();setHouseholds(items);setStatus('ready') }
  const create = async () => {try {const h=await createHousehold(newName);await refresh();await onSelect(h.id);setNewName('');setMessage('Hogar creado. Ya puedes utilizar sus recetas, planning, inventario y compra.')}catch(e){setMessage(describirError(e))}}
  const invite = async () => {try {const token=await createHouseholdInvitation(selection,inviteEmail);setInviteToken(token);setMessage('Invitación creada. Comparte el enlace solo con su destinatario.')}catch(e){setMessage(describirError(e))}}
  const join = async () => {try {await acceptHouseholdInvitation(joinToken.includes('?invite=') ? new URL(joinToken).searchParams.get('invite') ?? '' : joinToken);await refresh();setJoinToken('');setMessage('Invitación aceptada. Selecciona el hogar para trabajar en conjunto.')}catch(e){setMessage(describirError(e))}}
  const copyRecipe = async () => {
    if (selection !== 'personal' || copying || !recipeToCopy || !copyTarget) return
    const recipe = recipes.find(item => item.id === recipeToCopy)
    if (!recipe) return
    setCopying(true)
    setMessage('')
    try {
      const workspace = { scope: 'household' as const, householdId: copyTarget }
      const record = await getWorkspaceRecord<Receta[]>(workspace, 'recipes')
      const existing = Array.isArray(record?.payload) ? record.payload : []
      if (existing.some(item => item.id === recipe.id)) {
        setMessage('La receta ya existe en Domus Infinita. No se ha duplicado.')
        return
      }
      await saveSharedRecord(copyTarget, 'recipes', [...existing, recipe], record?.version ?? 0)
      setRecipeToCopy('')
      setMessage('Receta copiada al hogar. La original sigue siendo privada y no se ha modificado.')
    } catch (error) {
      setMessage('No se ha copiado la receta: ' + describirError(error))
    } finally {
      setCopying(false)
    }
  }
  const copyAllRecipes = async () => {
    if (selection === 'personal' || copying) return
    setCopying(true)
    setMessage('')
    try {
      // Read the original personal cloud collection, never the currently selected household store.
      const personal = await descargarRecetas(userId)
      const source = Array.isArray(personal) ? personal : []
      if (!source.length) {
        setMessage('No hay recetas personales guardadas en la nube para importar.')
        return
      }
      const workspace = { scope: 'household' as const, householdId: selection }
      const record = await getWorkspaceRecord<Receta[]>(workspace, 'recipes')
      const existing = Array.isArray(record?.payload) ? record.payload : []
      const ids = new Set(existing.map(recipe => recipe.id))
      const missing = source.filter(recipe => !ids.has(recipe.id))
      if (!missing.length) {
        setMessage('Todas tus recetas personales ya están en este hogar.')
        return
      }
      await saveSharedRecord(selection, 'recipes', [...existing, ...missing], record?.version ?? 0)
      setMessage('Importadas ' + missing.length + ' recetas al hogar. Las originales siguen a salvo. Vuelve a abrir Rayku para verlas en la biblioteca compartida.')
    } catch (error) {
      setMessage('No se pudieron importar las recetas: ' + describirError(error))
    } finally {
      setCopying(false)
    }
  }
  const [migrating,setMigrating] = useState(false)
  const migrateAll = async () => {
    if (selection === 'personal' || migrating || busy) return
    setMigrating(true)
    setMessage('')
    try {
      const personal = await loadWorkspaceData({scope:'personal',userId})
      const shared = await loadWorkspaceData({scope:'household',householdId:selection})
      const kinds = ['recipes','planning','inventory','shopping_list'] as const
      const descriptions: string[] = []
      for (const kind of kinds) {
        if (kind === 'shopping_list') {
          const old = personal.data.shopping_list
          const current = shared.data.shopping_list
          const manualIds = new Set(current.compraManual.map(x=>x.id))
          const missing = old.compraManual.filter(x=>!manualIds.has(x.id))
          const checks = [...new Set([...current.checksCompra,...old.checksCompra])]
          if (missing.length || checks.length !== current.checksCompra.length) {
            const payload: WorkspaceData['shopping_list'] = {compraManual:[...current.compraManual,...missing],checksCompra:checks}
            shared.versions[kind] = await saveWorkspaceKind({scope:'household',householdId:selection},kind,payload,shared.versions[kind])
            descriptions.push('compra')
          }
        } else {
          const current = shared.data[kind]
          const ids = new Set(current.map(x=>x.id))
          const missing = personal.data[kind].filter(x=>!ids.has(x.id))
          if (!missing.length) continue
          if (kind === 'recipes') {
            shared.versions[kind] = await saveWorkspaceKind({scope:'household',householdId:selection},kind,[...current,...missing],shared.versions[kind])
          } else if (kind === 'planning') {
            const occupied = new Set(current.map(x=>x.fecha+'|'+x.tipoComida))
            const safe = missing.filter(x=>!occupied.has(x.fecha+'|'+x.tipoComida))
            if (!safe.length) continue
            shared.versions[kind] = await saveWorkspaceKind({scope:'household',householdId:selection},kind,[...current,...safe],shared.versions[kind])
            if (safe.length !== missing.length) descriptions.push('algunos días ya ocupados no se sustituyeron')
          } else {
            shared.versions[kind] = await saveWorkspaceKind({scope:'household',householdId:selection},kind,[...current,...missing],shared.versions[kind])
          }
          descriptions.push(kind+': '+missing.length)
        }
      }
      setMessage(descriptions.length
        ? 'Importación realizada ('+descriptions.join(', ')+'). Los originales se conservan. Recarga Rayku para ver los cambios.'
        : 'Todo lo que tenías guardado ya está en el hogar.')
    } catch(e) {
      setMessage('La importación se ha detenido. Lo ya copiado se conserva y puedes reintentar sin duplicados: '+describirError(e))
    } finally {setMigrating(false)}
  }
  const invitationUrl = inviteToken ? window.location.origin + '/?invite=' + encodeURIComponent(inviteToken) : ''
  return (
    <section className="workspace-switcher" aria-label="Espacios de Rayku">
      <label htmlFor="rayku-workspace">🏡 Hogar activo</label>
      <select
        id="rayku-workspace"
        value={selection}
        onChange={event => { void onSelect(event.target.value).catch(error => setMessage(describirError(error))) }}
        disabled={status !== 'ready' || busy}
      >
        <option value="personal">👤 Datos anteriores (solo para migración)</option>
        {households.map(household => (
          <option key={household.id} value={household.id}>
            🏡 {household.name}
          </option>
        ))}
      </select>
      <p className="workspace-switcher-note" role="status">
        {status === 'loading'
          ? 'Buscando hogares…'
          : status === 'unavailable'
            ? 'Espacios compartidos pendientes de activar en Supabase.'
            : selection === 'personal'
              ? 'Estás viendo los datos anteriores a la unificación. Selecciona tu hogar para utilizar Rayku.'
              : 'Recetas, planning, inventario y compra corresponden al hogar compartido.'}
      </p>
      <details>
        <summary>🏡 Crear hogar o invitar a alguien</summary>
        <div style={{display:'grid',gap:8,marginTop:12}}>
          <label>Nombre del hogar<input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nuestra casa"/></label>
          <button type="button" className="btn-secundario" disabled={!newName.trim() || status!=='ready'} onClick={create}>Crear hogar</button>
          {selection !== 'personal' && households.find(h=>h.id===selection)?.created_by===userId && <>
            <label>Correo de la persona invitada<input type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="correo@ejemplo.com"/></label>
            <button type="button" className="btn-secundario" disabled={!inviteEmail.includes('@')} onClick={invite}>Generar invitación</button>
            {inviteToken && <><input readOnly aria-label="Enlace de invitación" value={invitationUrl}/><button type="button" className="btn-secundario" onClick={()=>navigator.clipboard.writeText(invitationUrl)}>Copiar enlace</button></>}
          </>}
          <label>Aceptar invitación recibida<input value={joinToken} onChange={e=>setJoinToken(e.target.value)} placeholder="Código de invitación"/></label>
          <button type="button" className="btn-secundario" disabled={!joinToken.trim()} onClick={join}>Unirme al hogar</button>
          {message && <p role="status">{message}</p>}
        </div>
      </details>
      {selection !== 'personal' && (
        <div style={{marginTop:12,display:'grid',gap:8}}>
          <button type="button" className="btn-principal" disabled={migrating || busy} onClick={migrateAll}>
            {migrating ? 'Unificando datos…' : '🏡 Traer todos mis datos anteriores a este hogar'}
          </button>
          <p>Recetas, planning, inventario y compra. Conserva originales, evita duplicados por ID y no reemplaza días ya ocupados.</p>
        </div>
      )}
      {selection !== 'personal' && (
        <div style={{marginTop:12,display:'grid',gap:8}}>
          <button type="button" className="btn-secundario" disabled={copying || busy} onClick={copyAllRecipes}>
            {copying ? 'Importando recetas…' : '📚 Importar todas mis recetas personales al hogar'}
          </button>
          <p>Importa todas las recetas de tu cuenta de una vez, sin duplicados y sin borrar las originales.</p>
        </div>
      )}
      {selection === 'personal' && households.length > 0 && (
        <details>
          <summary>📖 Compartir una receta personal con este hogar</summary>
          <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
            <select aria-label="Hogar destinatario" value={copyTarget} onChange={event=>setCopyTarget(event.target.value)}>
              <option value="">Selecciona hogar</option>
              {households.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            <select aria-label="Receta personal para copiar" value={recipeToCopy} onChange={event=>setRecipeToCopy(event.target.value)}>
              <option value="">Elige una receta</option>
              {recipes.map(recipe=><option key={recipe.id} value={recipe.id}>{recipe.nombre}</option>)}
            </select>
            <button type="button" className="btn-secundario" disabled={!recipeToCopy || !copyTarget || copying} onClick={copyRecipe}>
              {copying ? 'Copiando…' : 'Copiar receta al hogar'}
            </button>
          </div>
          <p>Se crea una copia compartida sin mover ni modificar tu receta personal.</p>
        </details>
      )}


    </section>
  )
}
