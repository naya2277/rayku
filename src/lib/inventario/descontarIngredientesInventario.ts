import type {
  ItemInventario,
} from '../../store/types'

import {
  normalizarIngrediente,
} from '../ingredientes'

import {
  redondearCantidad,
  type IngredienteEscalado,
} from '../recetas/calcularIngredientesEscalados'

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

export function descontarIngredientesInventario(
  inventario: ItemInventario[],
  ingredientes: IngredienteEscalado[]
): ItemInventario[] {
  let nuevoInventario =
    [...inventario]

  ingredientes.forEach(
    (ingrediente) => {
      if (
        ingrediente.cantidad === null ||
        !ingrediente.unidad
      ) {
        return
      }

      let cantidadPendiente =
        ingrediente.cantidad

      nuevoInventario =
        nuevoInventario.map(
          (item) => {
            if (
              cantidadPendiente <= 0
            ) {
              return item
            }

            const coincide =
              coincideIngrediente(
                item.nombre,
                ingrediente.nombre
              )

            const unidadCompatible =
              item.unidad ===
              ingrediente.unidad

            if (
              !coincide ||
              !unidadCompatible
            ) {
              return item
            }

            const cantidadActual =
              Number(
                item.cantidad || 0
              )

            const cantidadADescontar =
              Math.min(
                cantidadActual,
                cantidadPendiente
              )

            cantidadPendiente =
              redondearCantidad(
                cantidadPendiente -
                  cantidadADescontar
              )

            return {
              ...item,
              cantidad:
                redondearCantidad(
                  cantidadActual -
                    cantidadADescontar
                ),
            }
          }
        )
    }
  )

  return nuevoInventario
}