import type {
  ItemCompraManual,
} from './types'

import {
  normalizarCompraManual,
} from './normalizers'

import {
  guardarCompraManualLocal,
  guardarChecksCompraLocal,
} from './storage'

type StoreGet = () => {
  compraManual: ItemCompraManual[]
  checksCompra: string[]
}

type StoreSet = (
  data: Partial<{
    compraManual: ItemCompraManual[]
    checksCompra: string[]
  }>
) => void

export type CompraSlice = {
  compraManual: ItemCompraManual[]
  checksCompra: string[]

  agregarItemCompraManual: (
    item: ItemCompraManual
  ) => void

  eliminarItemCompraManual: (
    id: string
  ) => void

  toggleCheckCompra: (
    id: string
  ) => void

  limpiarChecksCompra: () => void
}

export const crearCompraSlice = (
  set: StoreSet,
  get: StoreGet
): CompraSlice => ({
  compraManual: [],

  checksCompra: [],

  agregarItemCompraManual:
    (item) => {
      const nuevaLista = [
        ...get().compraManual,
        normalizarCompraManual(
          item
        ),
      ]

      guardarCompraManualLocal(
        nuevaLista
      )

      set({
        compraManual:
          nuevaLista,
      })
    },

  eliminarItemCompraManual:
    (id) => {
      const nuevaLista =
        get()
          .compraManual
          .filter(
            (item) =>
              item.id !== id
          )

      guardarCompraManualLocal(
        nuevaLista
      )

      set({
        compraManual:
          nuevaLista,
      })
    },

  toggleCheckCompra:
    (id) => {
      const checks =
        get().checksCompra

      const nuevosChecks =
        checks.includes(id)
          ? checks.filter(
              (c) => c !== id
            )
          : [
              ...checks,
              id,
            ]

      guardarChecksCompraLocal(
        nuevosChecks
      )

      set({
        checksCompra:
          nuevosChecks,
      })
    },

  limpiarChecksCompra:
    () => {
      guardarChecksCompraLocal(
        []
      )

      set({
        checksCompra: [],
      })
    },
})