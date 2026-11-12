import type {
  ItemInventario,
} from './types'

import {
  generarId,
} from './utils'

import {
  normalizarInventario,
} from './normalizers'
import { combinarEntradaInventario } from '../lib/inventario/combinarLotes'
import { quitarRegistrosPorId } from '../lib/borradoMasivo'

import {
  guardarInventarioLocal,
} from './storage'

type StoreGet = () => {
  inventario: ItemInventario[]
}

type StoreSet = (
  data: Partial<{
    inventario: ItemInventario[]
  }>
) => void

export type InventarioSlice = {
  inventario: ItemInventario[]

  agregarItemInventario: (
    item: ItemInventario
  ) => void

  editarItemInventario: (
    id: string,
    data: Partial<ItemInventario>
  ) => void

  eliminarItemInventario: (
    id: string
  ) => void

  eliminarItemsInventario: (ids: string[]) => number
}

export const crearInventarioSlice = (
  set: StoreSet,
  get: StoreGet
): InventarioSlice => ({
  inventario: [],

  agregarItemInventario:
    (item) => {
      const nuevoInventario = combinarEntradaInventario(
        get().inventario,
        normalizarInventario({
          ...item,
          id: item.id || generarId(),
        }),
      )

      guardarInventarioLocal(
        nuevoInventario
      )

      set({
        inventario:
          nuevoInventario,
      })
    },

  editarItemInventario:
    (
      id,
      data
    ) => {
      const nuevoInventario =
        get().inventario.map(
          (item) =>
            item.id === id
              ? normalizarInventario(
                  {
                    ...item,
                    ...data,
                    id: item.id,
                  }
                )
              : item
        )

      guardarInventarioLocal(
        nuevoInventario
      )

      set({
        inventario:
          nuevoInventario,
      })
    },

  eliminarItemsInventario: (ids) => {
    const anterior = get().inventario
    const nuevo = quitarRegistrosPorId(anterior, ids)
    const eliminados = anterior.length - nuevo.length
    if (eliminados > 0) {
      guardarInventarioLocal(nuevo)
      set({ inventario: nuevo })
    }
    return eliminados
  },

  eliminarItemInventario:
    (id) => {
      const nuevoInventario =
        get().inventario.filter(
          (item) =>
            item.id !== id
        )

      guardarInventarioLocal(
        nuevoInventario
      )

      set({
        inventario:
          nuevoInventario,
      })
    },
})