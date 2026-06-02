import {
  separarTextoIngredientes,
} from '../cantidadesIngredientes'

import {
  calcularIngredientesEscalados,
  redondearCantidad,
  type IngredienteEscalado,
} from '../recetas/calcularIngredientesEscalados'

import type {
  HuecoPlanningListaCompra,
  IngredienteCompra,
  RecetaListaCompra,
} from './types'

import {
  normalizarUnidadCompra,
  obtenerClaveIngredienteCompra,
  obtenerNombreVisualIngredienteCompra,
  unidadesCompraCompatibles,
} from './normalizacionCompra'

function crearIngredienteCompra(
  clave: string,
  nombre: string,
  cantidad: number | null,
  unidad: string | null
): IngredienteCompra {
  return {
    clave,
    nombre,
    veces: 1,
    cantidad,
    unidad:
      normalizarUnidadCompra(unidad),
    cantidadDisponible: null,
    cantidadFaltante: null,
  }
}

function obtenerRecetaIds(
  hueco: HuecoPlanningListaCompra
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

function asegurarCantidadComidaLibre(
  ingrediente: IngredienteEscalado
): IngredienteEscalado {
  if (ingrediente.cantidad !== null) {
    return ingrediente
  }

  return {
    ...ingrediente,
    cantidad: 1,
    unidad: 'comida',
  }
}

export function generarIngredientesCompra(
  planning: HuecoPlanningListaCompra[],
  recetas: RecetaListaCompra[]
) {
  const mapa =
    new Map<string, IngredienteCompra>()

  const añadirIngrediente = (
    ingrediente: IngredienteEscalado
  ) => {
    const clave =
      obtenerClaveIngredienteCompra(
        ingrediente.nombre
      )

    const nombreVisual =
      obtenerNombreVisualIngredienteCompra(
        ingrediente.nombre
      )

    if (!clave || !nombreVisual) {
      return
    }

    const unidad =
      normalizarUnidadCompra(
        ingrediente.unidad
      )

    const existente =
      mapa.get(clave)

    if (existente) {
      existente.veces += 1

      if (
        ingrediente.cantidad !== null &&
        unidad &&
        unidadesCompraCompatibles(
          existente.unidad,
          unidad
        )
      ) {
        existente.cantidad =
          redondearCantidad(
            (existente.cantidad || 0) +
              ingrediente.cantidad
          )
      }

      if (
        existente.cantidad === null &&
        ingrediente.cantidad !== null
      ) {
        existente.cantidad =
          ingrediente.cantidad

        existente.unidad = unidad
      }

      return
    }

    mapa.set(
      clave,
      crearIngredienteCompra(
        clave,
        nombreVisual,
        ingrediente.cantidad,
        unidad
      )
    )
  }

  planning.forEach((hueco) => {
    const recetaIds =
      obtenerRecetaIds(hueco)

    recetaIds.forEach((recetaId) => {
      const receta =
        recetas.find(
          (r) =>
            r.id === recetaId
        )

      if (!receta) {
        return
      }

      const racionesObjetivo =
        hueco.racionesOverride ||
        receta.raciones ||
        1

      calcularIngredientesEscalados(
        receta,
        racionesObjetivo
      ).forEach(añadirIngrediente)
    })

    if (hueco.comidaLibre) {
      calcularIngredientesEscalados(
        {
          ingredientes:
            separarTextoIngredientes(
              hueco.comidaLibre
            ),
          raciones: 1,
        },
        1
      )
        .map(asegurarCantidadComidaLibre)
        .forEach(añadirIngrediente)
    }
  })

  return Array.from(mapa.values())
}