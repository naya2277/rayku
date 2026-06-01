import { guardar } from './utils'

import type {
  Receta,
  ItemInventario,
  ItemPlanning,
  ItemCompraManual,
  RegistroCocinado,
  PreferenciasAlimentarias,
} from './types'

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
  guardar(
    STORAGE_KEYS.recetas,
    recetas
  )
}

export const guardarInventarioLocal = (
  inventario: ItemInventario[]
) => {
  guardar(
    STORAGE_KEYS.inventario,
    inventario
  )
}

export const guardarPlanningLocal = (
  planning: ItemPlanning[]
) => {
  guardar(
    STORAGE_KEYS.planning,
    planning
  )
}

export const guardarCompraManualLocal = (
  compraManual: ItemCompraManual[]
) => {
  guardar(
    STORAGE_KEYS.compraManual,
    compraManual
  )
}

export const guardarChecksCompraLocal = (
  checks: string[]
) => {
  guardar(
    STORAGE_KEYS.checksCompra,
    checks
  )
}

export const guardarHistorialCocinadoLocal = (
  historial: RegistroCocinado[]
) => {
  guardar(
    STORAGE_KEYS.historialCocinado,
    historial
  )
}

export const guardarPreferenciasAlimentariasLocal = (
  preferencias: PreferenciasAlimentarias
) => {
  guardar(
    STORAGE_KEYS.preferenciasAlimentarias,
    preferencias
  )
}