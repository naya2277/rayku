import type {
  ItemInventario,
} from './types'

import {
  generarId,
} from './utils'

import {
  normalizarInventario,
} from './normalizers'

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
}

export const crearInventarioSlice = (
  set: StoreSet,
  get: StoreGet
): InventarioSlice => ({
  inventario: [],

  agregarItemInventario:
    (item) => {
      const nuevoInventario =
        [
          ...get().inventario,

          normalizarInventario(
            {
              ...item,
              id:
                item.id ||
                generarId(),
            }
          ),
        ]

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