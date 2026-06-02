import {
  normalizarIngredienteRayku,
} from '../ingredientes/normalizacion'

export function normalizarIngrediente(
  ingrediente: string
) {
  return normalizarIngredienteRayku(
    ingrediente
  )
}

export function normalizarListaIngredientes(
  ingredientes: string[]
) {
  return ingredientes.map(
    normalizarIngrediente
  )
}