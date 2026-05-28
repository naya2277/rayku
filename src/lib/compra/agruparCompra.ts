import {
  detectarCategoriaIngrediente,
} from '../ingredientes'

import type {
  IngredienteCompra,
} from './types'

export function agruparIngredientesCompra(
  ingredientes: IngredienteCompra[]
) {
  return ingredientes.reduce(
    (acc, item) => {
      const categoria =
        detectarCategoriaIngrediente(
          item.nombre
        )

      if (!acc[categoria]) {
        acc[categoria] = []
      }

      acc[categoria].push(item)

      acc[categoria].sort(
        (a, b) =>
          a.nombre.localeCompare(
            b.nombre
          )
      )

      return acc
    },
    {} as Record<
      string,
      IngredienteCompra[]
    >
  )
}