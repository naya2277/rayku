import type {
  ItemPlanning,
  Receta,
} from '../../store/types'

import {
  calcularIngredientesEscalados,
  type IngredienteEscalado,
} from '../recetas/calcularIngredientesEscalados'

import {
  separarTextoIngredientes,
} from '../cantidadesIngredientes'

export type PreparacionCocinar = {
  ingredientes: IngredienteEscalado[]
  ingredientesOriginales: string[]
  origen: 'receta' | 'comida_libre' | 'mixto'
  recetaNombre: string | null
  raciones: number | null
}

export function prepararIngredientesCocinar(
  hueco: ItemPlanning,
  recetas: Receta[]
): PreparacionCocinar {
  const ingredientes: IngredienteEscalado[] = []
  const ingredientesOriginales: string[] = []

  let recetaNombre: string | null = null
  let raciones: number | null = null

  if (hueco.recetaId) {
    const receta =
      recetas.find(
        (r) =>
          r.id === hueco.recetaId
      )

    if (receta) {
      const racionesObjetivo =
        hueco.racionesOverride ??
        receta.raciones

      recetaNombre =
        receta.nombre

      raciones =
        racionesObjetivo

      ingredientesOriginales.push(
        ...receta.ingredientes
      )

      ingredientes.push(
        ...calcularIngredientesEscalados(
          receta,
          racionesObjetivo
        )
      )
    }
  }

  if (hueco.comidaLibre.trim()) {
    const ingredientesLibres =
      separarTextoIngredientes(
        hueco.comidaLibre
      )

    ingredientesOriginales.push(
      ...ingredientesLibres
    )

    ingredientes.push(
      ...calcularIngredientesEscalados(
        {
          ingredientes:
            ingredientesLibres,
          raciones: 1,
        },
        1
      )
    )
  }

  const tieneReceta =
    Boolean(hueco.recetaId)

  const tieneLibre =
    Boolean(hueco.comidaLibre.trim())

  const origen =
    tieneReceta && tieneLibre
      ? 'mixto'
      : tieneReceta
        ? 'receta'
        : 'comida_libre'

  return {
    ingredientes,
    ingredientesOriginales,
    origen,
    recetaNombre,
    raciones,
  }
}