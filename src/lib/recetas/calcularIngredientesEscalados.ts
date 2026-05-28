import {
  parsearIngredienteConCantidad,
} from '../cantidadesIngredientes'

type RecetaConIngredientes = {
  ingredientes: string[]
  raciones?: number | null
}

export type IngredienteEscalado = {
  ingredienteOriginal: string
  nombre: string
  cantidad: number | null
  unidad: string | null
  multiplicador: number
}

export function redondearCantidad(
  valor: number
) {
  return Number(
    valor.toFixed(2)
  )
}

export function calcularMultiplicadorRaciones(
  racionesBase?: number | null,
  racionesObjetivo?: number | null
) {
  const base =
    racionesBase && racionesBase > 0
      ? racionesBase
      : 1

  const objetivo =
    racionesObjetivo && racionesObjetivo > 0
      ? racionesObjetivo
      : base

  return objetivo / base
}

export function calcularIngredientesEscalados(
  receta: RecetaConIngredientes,
  racionesObjetivo?: number | null
): IngredienteEscalado[] {
  const multiplicador =
    calcularMultiplicadorRaciones(
      receta.raciones,
      racionesObjetivo
    )

  return receta.ingredientes.map(
    (ingrediente) => {
      const parseado =
        parsearIngredienteConCantidad(
          ingrediente
        )

      return {
        ingredienteOriginal:
          ingrediente,

        nombre:
          parseado.nombre,

        cantidad:
          parseado.cantidad !== null
            ? redondearCantidad(
                parseado.cantidad *
                  multiplicador
              )
            : null,

        unidad:
          parseado.unidad,

        multiplicador,
      }
    }
  )
}