import { useCallback, useEffect, useRef, useState } from 'react'
import { useRaykuStore } from '../store'
import { setSharedWorkspaceStorage } from '../store/storage'
import { loadWorkspaceData, saveWorkspaceKind, type WorkspaceData } from './workspaceData'
import type { Workspace, WorkspaceKind } from './workspaces'
import { normalizarCompraManual, normalizarInventario, normalizarPlanning, normalizarReceta } from '../store/normalizers'

const kinds: WorkspaceKind[] = ['recipes', 'planning', 'inventory', 'shopping_list']
const readStore = (): WorkspaceData => {
  const s = useRaykuStore.getState()
  return {
    recipes: s.recetas,
    planning: s.planning,
    inventory: s.inventario,
    shopping_list: { compraManual: s.compraManual, checksCompra: s.checksCompra },
  }
}
const signatures = (data: WorkspaceData) => Object.fromEntries(
  kinds.map(kind => [kind, JSON.stringify(data[kind])])
) as Record<WorkspaceKind, string>

export function useUnifiedWorkspace(userId: string) {
  const [selection, setSelection] = useState('personal')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const active = useRef<Workspace>({ scope: 'personal', userId })
  const personalCache = useRef<WorkspaceData | null>(null)
  const versions = useRef<Record<WorkspaceKind, number>>({
    recipes: 0, planning: 0, inventory: 0, shopping_list: 0,
  })
  const baseline = useRef<Record<WorkspaceKind, string>>(signatures(readStore()))
  const hydrated = useRef(true)
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null)
  const queue = useRef<Promise<void>>(Promise.resolve())
  const error = useRef<string | null>(null)
  const saving = useRef(false)
  const previousUserId = useRef(userId)

  // A logout/account switch must never retain another user's selected household.
  // Pause local persistence while clearing the in-memory workspace.
  useEffect(() => {
    // The first authenticated session must retain any existing local-only recipes.
    // Clear the store only when the authenticated account actually changes or logs out.
    if (previousUserId.current === userId) return
    if (!previousUserId.current && userId) {
      previousUserId.current = userId
      return
    }
    previousUserId.current = userId
    if (pending.current) {
      clearTimeout(pending.current)
      pending.current = null
    }
    setSharedWorkspaceStorage(true)
    hydrated.current = false
    active.current = { scope: 'personal', userId }
    personalCache.current = null
    versions.current = { recipes: 0, planning: 0, inventory: 0, shopping_list: 0 }
    error.current = null
    setSelection('personal')
    setMessage('')
    useRaykuStore.setState({
      recetas: [], planning: [], inventario: [],
      compraManual: [], checksCompra: [], historialCocinado: [],
    })
    baseline.current = signatures(readStore())
    hydrated.current = true
    setSharedWorkspaceStorage(false)
  }, [userId])

  const persist = useCallback(async () => {
    if (active.current.scope !== 'household' || !hydrated.current) return
    saving.current = true
    const workspace = active.current
    const snapshot = readStore()
    const next = signatures(snapshot)
    for (const kind of kinds) {
      if (next[kind] === baseline.current[kind]) continue
      // Serialize updates; optimistic version rejects simultaneous stale writes.
      const value = snapshot[kind]
      try {
        const newVersion = await saveWorkspaceKind(workspace, kind, value, versions.current[kind])
        versions.current[kind] = newVersion
        baseline.current[kind] = next[kind]
        error.current = null
        setMessage('☁️ Cambios del hogar guardados')
      } catch (e) {
        error.current = e instanceof Error ? e.message : JSON.stringify(e)
        setMessage('⚠️ No se ha guardado el hogar: ' + error.current + '. No cambies de espacio hasta resolverlo.')
        saving.current = false
        throw e
      }
    }
    saving.current = false
  }, [])

  const scheduleSave = useCallback(() => {
    if (active.current.scope !== 'household' || !hydrated.current) return
    if (pending.current) clearTimeout(pending.current)
    pending.current = setTimeout(() => {
      pending.current = null
      queue.current = queue.current.catch(() => {}).then(persist)
      void queue.current.catch(() => {})
    }, 850)
  }, [persist])

  useEffect(() => {
    const unsub = useRaykuStore.subscribe(scheduleSave)
    return () => {
      unsub()
      if (pending.current) clearTimeout(pending.current)
      setSharedWorkspaceStorage(false)
    }
  }, [scheduleSave])

  // Warn before a tab closes with edits that haven't reached the shared database.
  // Browser support varies, but this avoids silently discarding in-flight changes.
  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => {
      if (active.current.scope !== 'household') return
      const now = signatures(readStore())
      const dirty = saving.current || pending.current !== null ||
        kinds.some(kind => now[kind] !== baseline.current[kind])
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', protect)
    return () => window.removeEventListener('beforeunload', protect)
  }, [])

  const select = useCallback(async (id: string) => {
    if (id === selection || busy) return
    setBusy(true)
    setMessage('')
    try {
      if (pending.current) {
        clearTimeout(pending.current)
        pending.current = null
      }
      await queue.current
      if (active.current.scope === 'household') {
        await persist()
      } else {
        personalCache.current = readStore()
      }
      const target: Workspace = id === 'personal'
        ? { scope: 'personal', userId }
        : { scope: 'household', householdId: id }
      const snapshot = id === 'personal' && personalCache.current
        ? { data: personalCache.current, versions: {
          recipes: 0, planning: 0, inventory: 0, shopping_list: 0,
        } }
        : await loadWorkspaceData(target)
      hydrated.current = false
      setSharedWorkspaceStorage(target.scope === 'household')
      active.current = target
      versions.current = snapshot.versions
      const data = snapshot.data
      useRaykuStore.setState({
        recetas: data.recipes.map(normalizarReceta),
        planning: data.planning.map(normalizarPlanning),
        inventario: data.inventory.map(normalizarInventario),
        compraManual: data.shopping_list.compraManual.map(normalizarCompraManual),
        checksCompra: data.shopping_list.checksCompra,
        historialCocinado: [],
      })
      baseline.current = signatures(readStore())
      setSelection(id)
      error.current = null
      setMessage(id === 'personal' ? 'Espacio personal activo' : '🏡 Hogar compartido activo')
      hydrated.current = true
    } catch (e) {
      setMessage('⚠️ No se pudo cambiar de espacio: ' + (e instanceof Error ? e.message : JSON.stringify(e)))
      throw e
    } finally {
      setBusy(false)
    }
  }, [selection, busy, userId, persist])

  // Refresh shared data on other devices only when this device has no unsaved edits.
  // Never overwrite local changes with an incoming remote snapshot.
  useEffect(() => {
    if (selection === 'personal' || busy) return
    let cancelled = false
    let checking = false
    const refresh = async () => {
      if (checking || pending.current || active.current.scope !== 'household' ||
          active.current.householdId !== selection ||
          kinds.some(kind => signatures(readStore())[kind] !== baseline.current[kind])) return
      checking = true
      try {
        await queue.current
        const snapshot = await loadWorkspaceData({scope:'household',householdId:selection})
        if (cancelled || pending.current || active.current.scope !== 'household' ||
            active.current.householdId !== selection ||
            kinds.some(kind => signatures(readStore())[kind] !== baseline.current[kind])) return
        const changed = kinds.some(kind => snapshot.versions[kind] > versions.current[kind])
        if (!changed) return
        hydrated.current = false
        versions.current = snapshot.versions
        useRaykuStore.setState({
          recetas: snapshot.data.recipes.map(normalizarReceta),
          planning: snapshot.data.planning.map(normalizarPlanning),
          inventario: snapshot.data.inventory.map(normalizarInventario),
          compraManual: snapshot.data.shopping_list.compraManual.map(normalizarCompraManual),
          checksCompra: snapshot.data.shopping_list.checksCompra,
        })
        baseline.current = signatures(readStore())
        setMessage('🔄 Cambios del hogar actualizados desde la nube')
      } catch (e) {
        setMessage('⚠️ No se pudo actualizar el hogar: ' + (e instanceof Error ? e.message : String(e)))
      } finally {
        hydrated.current = true
        checking = false
      }
    }
    const timer = window.setInterval(() => { void refresh() }, 12000)
    const visible = () => { if (document.visibilityState === 'visible') void refresh() }
    document.addEventListener('visibilitychange',visible)
    return () => { cancelled = true; window.clearInterval(timer); document.removeEventListener('visibilitychange',visible) }
  }, [selection,busy])

  const saveNow = useCallback(async () => {
    if (active.current.scope !== 'household') return false
    if (pending.current) { clearTimeout(pending.current); pending.current = null }
    await queue.current
    await persist()
    return true
  }, [persist])

  return { selection, busy, message, select, saveNow }
}
