import type {
  ItemInventario,
} from '../../store/types'

import {
  generarId,
} from '../../store/utils'

import {
  normalizarInventario,
} from '../../store/normalizers'

import {
  detectarCategoriaIngrediente,
} from '../ingredientes'

export type ItemCompraParaInventario = {
  nombre: string
  cantidad: number | null
  unidad: string | null
}

export function yaExistePendienteCompra(
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

export function convertirCompraAPendienteInventario(
  itemCompra: ItemCompraParaInventario
): ItemInventario {
  return normalizarInventario({
    id: generarId(),
    nombre: itemCompra.nombre,
    cantidad:
      itemCompra.cantidad ?? 1,
    unidad:
      itemCompra.unidad ?? 'u.',
    categoria:
      detectarCategoriaIngrediente(
        itemCompra.nombre
      ),
    ubicacion: 'pendiente',
    fechaCaducidad: null,
    fechaDescongelar: null,
    necesitaDescongelar: false,
    avisarStockBajo: false,
  })
}