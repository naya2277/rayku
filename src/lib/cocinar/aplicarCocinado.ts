import type {
  ItemInventario,
  ItemPlanning,
  RegistroCocinado,
} from '../../store/types'

import {
  generarId,
} from '../../store/utils'

import {
  descontarIngredientesInventario,
} from '../inventario/descontarIngredientesInventario'

import type {
  IngredienteEscalado,
} from '../recetas/calcularIngredientesEscalados'

export function aplicarCocinado(
  inventario: ItemInventario[],
  hueco: ItemPlanning,
  datos: {
    ingredientes: IngredienteEscalado[]
    ingredientesOriginales: string[]
    origen: RegistroCocinado['origen']
    recetaNombre: string | null
    raciones: number | null
  }
): {
  inventario: ItemInventario[]
  registro: RegistroCocinado
} {
  const nuevoInventario =
    descontarIngredientesInventario(
      inventario,
      datos.ingredientes
    )

  const cambiosInventario =
    nuevoInventario
      .map((itemNuevo) => {
        const itemAnterior =
          inventario.find(
            (item) =>
              item.id === itemNuevo.id
          )

        if (!itemAnterior) {
          return null
        }

        if (
          Number(itemAnterior.cantidad) ===
          Number(itemNuevo.cantidad)
        ) {
          return null
        }

        return {
          itemId: itemNuevo.id,
          nombre: itemNuevo.nombre,
          unidad: itemNuevo.unidad,
          cantidadAnterior:
            Number(itemAnterior.cantidad) || 0,
          cantidadNueva:
            Number(itemNuevo.cantidad) || 0,
        }
      })
      .filter(Boolean) as RegistroCocinado['cambiosInventario']

  const registro: RegistroCocinado = {
    id: generarId(),
    planningId: hueco.id,
    fecha: hueco.fecha,
    tipoComida: hueco.tipoComida,
    origen: datos.origen,
    recetaId: hueco.recetaId,
    recetaNombre: datos.recetaNombre,
    comidaLibre: hueco.comidaLibre,
    raciones: datos.raciones,
    ingredientesOriginales:
      datos.ingredientesOriginales,
    cambiosInventario,
    creadoEn: new Date().toISOString(),
  }

  return {
    inventario: nuevoInventario,
    registro,
  }
}