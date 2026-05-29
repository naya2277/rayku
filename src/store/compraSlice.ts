import type {
  ItemCompraManual,
  ItemInventario,
} from './types'

import {
  generarId,
} from './utils'

import {
  normalizarCompraManual,
  normalizarInventario,
} from './normalizers'

import {
  detectarCategoriaIngrediente,
  normalizarIngrediente,
} from '../lib/ingredientes'

import {
  guardarCompraManualLocal,
  guardarChecksCompraLocal,
  guardarInventarioLocal,
} from './storage'

type ItemCompraParaInventario = {
  nombre: string
  cantidad: number | null
  unidad: string | null
}

type StoreGet = () => {
  compraManual: ItemCompraManual[]
  checksCompra: string[]
  inventario: ItemInventario[]
}

type StoreSet = (
  data: Partial<{
    compraManual: ItemCompraManual[]
    checksCompra: string[]
    inventario: ItemInventario[]
  }>
) => void

export type CompraSlice = {
  compraManual: ItemCompraManual[]
  checksCompra: string[]

  agregarItemCompraManual: (
    item: ItemCompraManual
  ) => void

  agregarAgotadosACompra: () => void

  eliminarItemCompraManual: (
    id: string
  ) => void

  toggleCheckCompra: (
    id: string,
    itemCompra?: ItemCompraParaInventario
  ) => void

  limpiarChecksCompra: () => void

  finalizarCompra: () => void
}

function yaExistePendiente(
  inventario: ItemInventario[],
  itemCompra: ItemCompraParaInventario
) {
  return inventario.some(
    (item) =>
      item.ubicacion === 'pendiente' &&
      item.nombre === itemCompra.nombre &&
      item.unidad ===
        (itemCompra.unidad ?? 'u.') &&
      item.cantidad ===
        (itemCompra.cantidad ?? 1)
  )
}

function nombresCoinciden(
  a: string,
  b: string
) {
  return (
    normalizarIngrediente(a) ===
    normalizarIngrediente(b)
  )
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

  agregarAgotadosACompra:
    () => {
      const estado = get()

      const agotados =
        estado.inventario.filter(
          (item) =>
            item.cantidad <= 0 &&
            item.ubicacion !==
              'pendiente'
        )

      if (agotados.length === 0) {
        return
      }

      const nuevosManuales =
        agotados
          .filter(
            (agotado) =>
              !estado.compraManual.some(
                (manual) =>
                  nombresCoinciden(
                    manual.nombre,
                    agotado.nombre
                  )
              )
          )
          .map((item) =>
            normalizarCompraManual({
              id: generarId(),
              nombre: item.nombre,
              cantidad: null,
            })
          )

      const nuevaLista = [
        ...estado.compraManual,
        ...nuevosManuales,
      ]

      const nombresAgotados =
        agotados.map((item) =>
          normalizarIngrediente(
            item.nombre
          )
        )

      const nuevosChecks =
        estado.checksCompra.filter(
          (check) => {
            if (
              !check.startsWith(
                'manual-'
              )
            ) {
              return true
            }

            const manualId =
              check.replace(
                'manual-',
                ''
              )

            const manual =
              nuevaLista.find(
                (item) =>
                  item.id === manualId
              )

            if (!manual) {
              return true
            }

            return !nombresAgotados.includes(
              normalizarIngrediente(
                manual.nombre
              )
            )
          }
        )

      guardarCompraManualLocal(
        nuevaLista
      )

      guardarChecksCompraLocal(
        nuevosChecks
      )

      set({
        compraManual:
          nuevaLista,
        checksCompra:
          nuevosChecks,
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
    (
      id,
      itemCompra
    ) => {
      const estado = get()

      const estabaComprado =
        estado.checksCompra.includes(
          id
        )

      const nuevosChecks =
        estabaComprado
          ? estado.checksCompra.filter(
              (c) => c !== id
            )
          : [
              ...estado.checksCompra,
              id,
            ]

      guardarChecksCompraLocal(
        nuevosChecks
      )

      if (
        !estabaComprado &&
        itemCompra &&
        !yaExistePendiente(
          estado.inventario,
          itemCompra
        )
      ) {
        const nuevoItem =
          normalizarInventario({
            id: generarId(),
            nombre:
              itemCompra.nombre,
            cantidad:
              itemCompra.cantidad ??
              1,
            unidad:
              itemCompra.unidad ??
              'u.',
            categoria:
              detectarCategoriaIngrediente(
                itemCompra.nombre
              ),
            ubicacion:
              'pendiente',
            fechaCaducidad:
              null,
            fechaDescongelar:
              null,
            necesitaDescongelar:
              false,
          })

        const nuevoInventario =
          [
            ...estado.inventario,
            nuevoItem,
          ]

        guardarInventarioLocal(
          nuevoInventario
        )

        set({
          checksCompra:
            nuevosChecks,
          inventario:
            nuevoInventario,
        })

        return
      }

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

  finalizarCompra:
    () => {
      const estado = get()

      const compraManualPendiente =
        estado.compraManual.filter(
          (item) =>
            !estado.checksCompra.includes(
              `manual-${item.id}`
            )
        )

      guardarCompraManualLocal(
        compraManualPendiente
      )

      guardarChecksCompraLocal(
        []
      )

      set({
        compraManual:
          compraManualPendiente,
        checksCompra: [],
      })
    },
})