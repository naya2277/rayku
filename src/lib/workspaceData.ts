import { descargarCompra, descargarInventario, descargarPlanning, descargarRecetas, subirCompra, subirInventario, subirPlanning, subirRecetas } from './sync'
import { getWorkspaceRecord, saveSharedRecord, type Workspace, type WorkspaceKind } from './workspaces'
import type { ItemCompraManual, ItemInventario, ItemPlanning, Receta } from '../store/types'

/**
 * One data contract for the existing screens, regardless of who owns the data.
 * Personal reads stay on rayku_data to preserve all existing accounts.
 * Household writes use the version-checked RPC; never overwrite on conflict.
 * This module is not wired to autosave until switching can be made atomic.
 */
export type WorkspaceData = {
  recipes: Receta[]
  planning: ItemPlanning[]
  inventory: ItemInventario[]
  shopping_list: { compraManual: ItemCompraManual[]; checksCompra: string[] }
}
export type WorkspaceSnapshot = {
  data: WorkspaceData
  versions: Record<WorkspaceKind, number>
}
const empty = (): WorkspaceData => ({
  recipes: [], planning: [], inventory: [],
  shopping_list: { compraManual: [], checksCompra: [] },
})
const kinds: WorkspaceKind[] = ['recipes', 'planning', 'inventory', 'shopping_list']
const isArray = (value: unknown): value is unknown[] => Array.isArray(value)

export async function loadWorkspaceData(workspace: Workspace): Promise<WorkspaceSnapshot> {
  const data = empty()
  const versions: Record<WorkspaceKind, number> = {
    recipes: 0, planning: 0, inventory: 0, shopping_list: 0,
  }
  if (workspace.scope === 'personal') {
    const userId = workspace.userId
    const [recipes, planning, inventory, shopping] = await Promise.all([
      descargarRecetas(userId), descargarPlanning(userId),
      descargarInventario(userId), descargarCompra(userId),
    ])
    if (isArray(recipes)) data.recipes = recipes as Receta[]
    if (isArray(planning)) data.planning = planning as ItemPlanning[]
    if (isArray(inventory)) data.inventory = inventory as ItemInventario[]
    if (shopping) data.shopping_list = {
      compraManual: isArray(shopping.compraManual) ? shopping.compraManual : [],
      checksCompra: isArray(shopping.checksCompra) ? shopping.checksCompra.filter((x): x is string => typeof x === 'string') : [],
    }
    return { data, versions }
  }
  const records = await Promise.all(kinds.map(kind =>
    getWorkspaceRecord<unknown>(workspace, kind)
  ))
  records.forEach((record, index) => {
    if (!record) return
    const kind = kinds[index]
    versions[kind] = record.version
    if (kind === 'shopping_list') {
      const payload = record.payload as Partial<WorkspaceData['shopping_list']> | null
      // Legacy shared board stored {compra, calendario} in shopping_list.
      // Do not silently interpret or overwrite it as a generated shopping list.
      if (payload && ('compra' in payload || 'calendario' in payload)) {
        const legacy = payload as unknown as {
          compra?: { id: string; texto: string; hecho: boolean }[]
          calendario?: unknown[]
        }
        if (Array.isArray(legacy.calendario) && legacy.calendario.length) {
          throw new Error('Hay eventos del calendario provisional. Deben migrarse antes de activar el planning compartido.')
        }
        data.shopping_list = {
          compraManual: Array.isArray(legacy.compra) ? legacy.compra.map(item => ({
            id: item.id, nombre: item.texto, cantidad: null,
          })) : [],
          checksCompra: Array.isArray(legacy.compra)
            ? legacy.compra.filter(item => item.hecho).map(item => 'manual-' + item.id) : [],
        }
        return
      }
      data.shopping_list = {
        compraManual: isArray(payload?.compraManual) ? payload.compraManual : [],
        checksCompra: isArray(payload?.checksCompra) ? payload.checksCompra.filter((x): x is string => typeof x === 'string') : [],
      }
    } else if (isArray(record.payload)) {
      if (kind === 'recipes') data.recipes = record.payload as Receta[]
      if (kind === 'planning') data.planning = record.payload as ItemPlanning[]
      if (kind === 'inventory') data.inventory = record.payload as ItemInventario[]
    }
  })
  return { data, versions }
}

export async function saveWorkspaceKind<K extends WorkspaceKind>(
  workspace: Workspace,
  kind: K,
  payload: WorkspaceData[K],
  expectedVersion: number,
): Promise<number> {
  if (workspace.scope === 'personal') {
    const id = workspace.userId
    switch (kind) {
      case 'recipes': await subirRecetas(payload as Receta[], id); break
      case 'planning': await subirPlanning(payload as ItemPlanning[], id); break
      case 'inventory': await subirInventario(payload as ItemInventario[], id); break
      case 'shopping_list': {
        const shopping = payload as WorkspaceData['shopping_list']
        await subirCompra(shopping.compraManual, shopping.checksCompra, id)
        break
      }
    }
    return 0
  }
  const saved = await saveSharedRecord(workspace.householdId, kind, payload, expectedVersion)
  return saved.version
}
