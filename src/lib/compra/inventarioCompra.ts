import {
  redondearCantidad,
} from '../recetas/calcularIngredientesEscalados'

import type {
  IngredienteCompra,
  ItemInventarioListaCompra,
} from './types'

import {
  normalizarUnidadCompra,
  obtenerClaveIngredienteCompra,
} from './normalizacionCompra'

function claveDeIngredienteCompra(
  ingrediente:
    | string
    | IngredienteCompra
) {
  return typeof ingrediente === 'string'
    ? obtenerClaveIngredienteCompra(
        ingrediente
      )
    : ingrediente.clave
}

function coincidenIngredientesCompra(
  ingredienteA:
    | string
    | IngredienteCompra,
  ingredienteB: string
) {
  const a =
    claveDeIngredienteCompra(
      ingredienteA
    )

  const b =
    obtenerClaveIngredienteCompra(
      ingredienteB
    )

  if (!a || !b) {
    return false
  }

  return (
    a.includes(b) ||
    b.includes(a)
  )
}

function tieneStockDisponible(
  item: ItemInventarioListaCompra
) {
  return Number(item.cantidad || 0) > 0
}

export function ingredienteEnInventario(
  ingrediente: string,
  inventario: ItemInventarioListaCompra[]
) {
  return inventario.some(
    (item) =>
      tieneStockDisponible(item) &&
      coincidenIngredientesCompra(
        ingrediente,
        item.nombre
      )
  )
}

export function cantidadesInventario(
  ingrediente: string,
  inventario: ItemInventarioListaCompra[]
) {
  return inventario
    .filter(
      (item) =>
        tieneStockDisponible(item) &&
        coincidenIngredientesCompra(
          ingrediente,
          item.nombre
        )
    )
    .map(
      (item) =>
        `${item.cantidad}${item.unidad}`
    )
    .join(' + ')
}

function calcularDisponible(
  ingrediente: IngredienteCompra,
  inventario: ItemInventarioListaCompra[]
) {
  if (
    ingrediente.cantidad === null ||
    !ingrediente.unidad
  ) {
    return null
  }

  return inventario.reduce(
    (total, item) => {
      if (!tieneStockDisponible(item)) {
        return total
      }

      const coincide =
        coincidenIngredientesCompra(
          ingrediente,
          item.nombre
        )

      if (!coincide) {
        return total
      }

      if (
        normalizarUnidadCompra(
          item.unidad
        ) !==
        normalizarUnidadCompra(
          ingrediente.unidad
        )
      ) {
        return total
      }

      return (
        total +
        Number(item.cantidad || 0)
      )
    },
    0
  )
}

export function separarIngredientesPorInventario(
  ingredientes: IngredienteCompra[],
  inventario: ItemInventarioListaCompra[]
) {
  const paraComprar: IngredienteCompra[] =
    []

  const yaDisponibles: IngredienteCompra[] =
    []

  ingredientes.forEach(
    (ingrediente) => {
      const disponible =
        calcularDisponible(
          ingrediente,
          inventario
        )

      if (
        ingrediente.cantidad !== null &&
        ingrediente.unidad &&
        disponible !== null
      ) {
        const faltante =
          ingrediente.cantidad -
          disponible

        const ingredienteCalculado = {
          ...ingrediente,
          cantidadDisponible:
            disponible,
          cantidadFaltante:
            Math.max(
              0,
              redondearCantidad(
                faltante
              )
            ),
        }

        if (faltante > 0) {
          paraComprar.push(
            ingredienteCalculado
          )
        } else {
          yaDisponibles.push(
            ingredienteCalculado
          )
        }

        return
      }

      if (
        ingredienteEnInventario(
          ingrediente.nombre,
          inventario
        )
      ) {
        yaDisponibles.push(
          ingrediente
        )
      } else {
        paraComprar.push(
          ingrediente
        )
      }
    }
  )

  return {
    paraComprar,
    yaDisponibles,
  }
}