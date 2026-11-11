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

  const persist = useCallback(async () => {
    if (active.current.scope !== 'household' || !hydrated.current) return
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
        throw e
      }
    }
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

  const saveNow = useCallback(async () => {
    if (active.current.scope !== 'household') return false
    if (pending.current) { clearTimeout(pending.current); pending.current = null }
    await queue.current
    await persist()
    return true
  }, [persist])

  return { selection, busy, message, select, saveNow }
}
