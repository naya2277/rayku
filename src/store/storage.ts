import { guardar } from './utils'

import type {
  Receta,
  ItemInventario,
  ItemPlanning,
  ItemCompraManual,
  RegistroCocinado,
  PreferenciasAlimentarias,
} from './types'

// Shared workspace must never overwrite the legacy personal local cache.
let sharedWorkspaceActive = false
export function setSharedWorkspaceStorage(active: boolean) {
  sharedWorkspaceActive = active
}
function guardarSoloPersonal<T>(key: string, value: T) {
  if (!sharedWorkspaceActive) guardar(key, value)
}

export const STORAGE_KEYS = {
  recetas: 'rayku-recetas',
  inventario: 'rayku-inventario',
  planning: 'rayku-planning',
  compraManual: 'rayku-compra-manual',
  checksCompra: 'rayku-checks-compra',
  historialCocinado: 'rayku-historial-cocinado',
  preferenciasAlimentarias: 'rayku-preferencias-alimentarias',
}

export const guardarRecetasLocal = (
  recetas: Receta[]
) => {
  guardarSoloPersonal(
    STORAGE_KEYS.recetas,
    recetas
  )
}

export const guardarInventarioLocal = (
  inventario: ItemInventario[]
) => {
  guardarSoloPersonal(
    STORAGE_KEYS.inventario,
    inventario
  )
}

export const guardarPlanningLocal = (
  planning: ItemPlanning[]
) => {
  guardarSoloPersonal(
    STORAGE_KEYS.planning,
    planning
  )
}

export const guardarCompraManualLocal = (
  compraManual: ItemCompraManual[]
) => {
  guardarSoloPersonal(
    STORAGE_KEYS.compraManual,
    compraManual
  )
}

export const guardarChecksCompraLocal = (
  checks: string[]
) => {
  guardarSoloPersonal(
    STORAGE_KEYS.checksCompra,
    checks
  )
}

export const guardarHistorialCocinadoLocal = (
  historial: RegistroCocinado[]
) => {
  guardarSoloPersonal(
    STORAGE_KEYS.historialCocinado,
    historial
  )
}

export const guardarPreferenciasAlimentariasLocal = (
  preferencias: PreferenciasAlimentarias
) => {
  guardarSoloPersonal(
    STORAGE_KEYS.preferenciasAlimentarias,
    preferencias
  )
}