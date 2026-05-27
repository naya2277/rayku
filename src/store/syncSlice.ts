import {
  subirRecetas,
  descargarRecetas,

  subirInventario,
  descargarInventario,

  subirPlanning,
  descargarPlanning,
} from '../lib/sync'

import type {
  Receta,
  ItemInventario,
  ItemPlanning,
} from './types'

import {
  normalizarReceta,
  normalizarInventario,
  normalizarPlanning,
} from './normalizers'

import {
  guardarRecetasLocal,
  guardarInventarioLocal,
  guardarPlanningLocal,
} from './storage'

type StoreGet = () => {
  recetas: Receta[]
  inventario: ItemInventario[]
  planning: ItemPlanning[]
}

type StoreSet = (
  data: Partial<{
    recetas: Receta[]
    inventario: ItemInventario[]
    planning: ItemPlanning[]
  }>
) => void

export type SyncSlice = {
  sincronizarRecetasDesdeSupabase: (
    userId: string
  ) => Promise<void>

  guardarRecetasEnSupabase: (
    userId: string
  ) => Promise<void>

  sincronizarInventarioDesdeSupabase: (
    userId: string
  ) => Promise<void>

  guardarInventarioEnSupabase: (
    userId: string
  ) => Promise<void>

  sincronizarPlanningDesdeSupabase: (
    userId: string
  ) => Promise<void>

  guardarPlanningEnSupabase: (
    userId: string
  ) => Promise<void>
}

export const crearSyncSlice = (
  set: StoreSet,
  get: StoreGet
): SyncSlice => ({
  sincronizarRecetasDesdeSupabase:
    async (userId) => {
      const recetasSupabase =
        await descargarRecetas(userId)

      if (
        Array.isArray(
          recetasSupabase
        )
      ) {
        const recetasNormalizadas =
          recetasSupabase.map(
            normalizarReceta
          )

        guardarRecetasLocal(
          recetasNormalizadas
        )

        set({
          recetas:
            recetasNormalizadas,
        })
      }
    },

  guardarRecetasEnSupabase:
    async (userId) => {
      await subirRecetas(
        get().recetas,
        userId
      )
    },

  sincronizarInventarioDesdeSupabase:
    async (userId) => {
      const inventarioSupabase =
        await descargarInventario(
          userId
        )

      if (
        Array.isArray(
          inventarioSupabase
        )
      ) {
        const inventarioNormalizado =
          inventarioSupabase.map(
            normalizarInventario
          )

        guardarInventarioLocal(
          inventarioNormalizado
        )

        set({
          inventario:
            inventarioNormalizado,
        })
      }
    },

  guardarInventarioEnSupabase:
    async (userId) => {
      await subirInventario(
        get().inventario,
        userId
      )
    },

  sincronizarPlanningDesdeSupabase:
    async (userId) => {
      const planningSupabase =
        await descargarPlanning(
          userId
        )

      if (
        Array.isArray(
          planningSupabase
        )
      ) {
        const planningNormalizado =
          planningSupabase.map(
            normalizarPlanning
          )

        guardarPlanningLocal(
          planningNormalizado
        )

        set({
          planning:
            planningNormalizado,
        })
      }
    },

  guardarPlanningEnSupabase:
    async (userId) => {
      await subirPlanning(
        get().planning,
        userId
      )
    },
})