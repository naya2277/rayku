import type {
  ItemInventario,
  ItemPlanning,
  Receta,
} from '../../store/types'

import {
  normalizarIngrediente,
} from '../ingredientes'

import {
  prepararIngredientesCocinar,
} from '../cocinar/prepararIngredientesCocinar'

import {
  redondearCantidad,
} from '../recetas/calcularIngredientesEscalados'

export type AvisoIngredientePlanning = {
  nombre: string
  cantidadNecesaria: number | null
  cantidadDisponible: number | null
  cantidadFaltante: number | null
  unidad: string | null
}

function coincideIngrediente(
  nombreInventario: string,
  nombreIngrediente: string
) {
  const inventarioNormalizado =
    normalizarIngrediente(
      nombreInventario
    )

  const ingredienteNormalizado =
    normalizarIngrediente(
      nombreIngrediente
    )

  if (
    !inventarioNormalizado ||
    !ingredienteNormalizado
  ) {
    return false
  }

  return (
    inventarioNormalizado.includes(
      ingredienteNormalizado
    ) ||
    ingredienteNormalizado.includes(
      inventarioNormalizado
    )
  )
}

function calcularDisponible(
  inventario: ItemInventario[],
  nombre: string,
  unidad: string | null
) {
  const items =
    inventario.filter((item) => {
      if (
        item.ubicacion ===
        'pendiente'
      ) {
        return false
      }

      const coincide =
        coincideIngrediente(
          item.nombre,
          nombre
        )

      if (!coincide) {
        return false
      }

      if (!unidad) {
        return item.cantidad > 0
      }

      return item.unidad === unidad
    })

  if (!unidad) {
    return items.length > 0 ? 1 : 0
  }

  return items.reduce(
    (total, item) =>
      total +
      Number(item.cantidad || 0),
    0
  )
}

export function calcularAvisosIngredientesPlanning(
  hueco: ItemPlanning | undefined,
  recetas: Receta[],
  inventario: ItemInventario[]
): AvisoIngredientePlanning[] {
  if (
    !hueco ||
    hueco.cocinado ||
    (!hueco.recetaId &&
      !hueco.comidaLibre.trim())
  ) {
    return []
  }

  const preparacion =
    prepararIngredientesCocinar(
      hueco,
      recetas
    )

  return preparacion.ingredientes
    .map((ingrediente) => {
      const disponible =
        calcularDisponible(
          inventario,
          ingrediente.nombre,
          ingrediente.unidad
        )

      if (
        ingrediente.cantidad === null ||
        !ingrediente.unidad
      ) {
        if (disponible > 0) {
          return null
        }

        return {
          nombre: ingrediente.nombre,
          cantidadNecesaria: null,
          cantidadDisponible: null,
          cantidadFaltante: null,
          unidad: null,
        }
      }

      const faltante =
        redondearCantidad(
          ingrediente.cantidad -
            disponible
        )

      if (faltante <= 0) {
        return null
      }

      return {
        nombre: ingrediente.nombre,
        cantidadNecesaria:
          ingrediente.cantidad,
        cantidadDisponible:
          redondearCantidad(
            disponible
          ),
        cantidadFaltante:
          faltante,
        unidad:
          ingrediente.unidad,
      }
    })
    .filter(Boolean) as AvisoIngredientePlanning[]
}