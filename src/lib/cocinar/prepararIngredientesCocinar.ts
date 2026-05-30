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
  recetaNombres: string[]
  raciones: number | null
}

function obtenerRecetaIds(
  hueco: ItemPlanning
) {
  if (
    Array.isArray(hueco.recetaIds) &&
    hueco.recetaIds.length > 0
  ) {
    return hueco.recetaIds
  }

  return hueco.recetaId
    ? [hueco.recetaId]
    : []
}

export function prepararIngredientesCocinar(
  hueco: ItemPlanning,
  recetas: Receta[]
): PreparacionCocinar {
  const ingredientes: IngredienteEscalado[] = []
  const ingredientesOriginales: string[] = []
  const recetaNombres: string[] = []

  let raciones: number | null = null

  const recetaIds =
    obtenerRecetaIds(hueco)

  recetaIds.forEach((recetaId) => {
    const receta =
      recetas.find(
        (r) => r.id === recetaId
      )

    if (!receta) {
      return
    }

    const racionesObjetivo =
      hueco.racionesOverride ??
      receta.raciones

    raciones =
      racionesObjetivo

    recetaNombres.push(
      receta.nombre
    )

    ingredientesOriginales.push(
      ...receta.ingredientes
    )

    ingredientes.push(
      ...calcularIngredientesEscalados(
        receta,
        racionesObjetivo
      )
    )
  })

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
    recetaIds.length > 0

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
    recetaNombre:
      recetaNombres[0] ?? null,
    recetaNombres,
    raciones,
  }
}