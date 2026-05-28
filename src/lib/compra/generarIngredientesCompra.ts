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
  unidadesCompraCompatibles,
} from './normalizacionCompra'

function crearIngredienteCompra(
  nombre: string,
  cantidad: number | null,
  unidad: string | null
): IngredienteCompra {
  return {
    nombre,
    veces: 1,
    cantidad,
    unidad:
      normalizarUnidadCompra(unidad),
    cantidadDisponible: null,
    cantidadFaltante: null,
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

    if (!clave) {
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
        ingrediente.cantidad,
        unidad
      )
    )
  }

  planning.forEach((hueco) => {
    if (hueco.recetaId) {
      const receta =
        recetas.find(
          (r) =>
            r.id === hueco.recetaId
        )

      if (receta) {
        const racionesObjetivo =
          hueco.racionesOverride ||
          receta.raciones ||
          1

        calcularIngredientesEscalados(
          receta,
          racionesObjetivo
        ).forEach(añadirIngrediente)
      }
    }

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
      ).forEach(añadirIngrediente)
    }
  })

  return Array.from(mapa.values())
}