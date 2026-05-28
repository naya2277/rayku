import type {
  Receta,
  ItemInventario,
  ItemPlanning,
  TipoComida,
} from './types'

import {
  generarId,
} from './utils'

import {
  normalizarPlanning,
} from './normalizers'

import {
  guardarInventarioLocal,
  guardarPlanningLocal,
} from './storage'

import {
  calcularIngredientesEscalados,
  type IngredienteEscalado,
} from '../lib/recetas/calcularIngredientesEscalados'

import {
  separarTextoIngredientes,
} from '../lib/cantidadesIngredientes'

import {
  descontarIngredientesInventario,
} from '../lib/inventario/descontarIngredientesInventario'

type StoreGet = () => {
  planning: ItemPlanning[]
  recetas: Receta[]
  inventario: ItemInventario[]
}

type StoreSet = (
  data: Partial<{
    planning: ItemPlanning[]
    inventario: ItemInventario[]
  }>
) => void

export type PlanningSlice = {
  planning: ItemPlanning[]

  guardarHuecoPlanning: (
    item: Omit<
      ItemPlanning,
      'id'
    >
  ) => void

  limpiarHuecoPlanning: (
    fecha: string,
    tipoComida: TipoComida
  ) => void

  toggleCocinadoPlanning: (
    id: string
  ) => void
}

export const crearPlanningSlice = (
  set: StoreSet,
  get: StoreGet
): PlanningSlice => ({
  planning: [],

  guardarHuecoPlanning:
    (item) => {
      const actual =
        get().planning

      const existe =
        actual.find(
          (h) =>
            h.fecha ===
              item.fecha &&
            h.tipoComida ===
              item.tipoComida
        )

      const nuevoPlanning =
        existe
          ? actual.map(
              (h) =>
                h.id === existe.id
                  ? normalizarPlanning(
                      {
                        ...h,
                        ...item,
                        id: h.id,
                      }
                    )
                  : h
            )
          : [
              ...actual,
              normalizarPlanning(
                {
                  ...item,
                  id: generarId(),
                }
              ),
            ]

      guardarPlanningLocal(
        nuevoPlanning
      )

      set({
        planning:
          nuevoPlanning,
      })
    },

  limpiarHuecoPlanning:
    (
      fecha,
      tipoComida
    ) => {
      const nuevoPlanning =
        get().planning.filter(
          (h) =>
            !(
              h.fecha === fecha &&
              h.tipoComida ===
                tipoComida
            )
        )

      guardarPlanningLocal(
        nuevoPlanning
      )

      set({
        planning:
          nuevoPlanning,
      })
    },

  toggleCocinadoPlanning:
    (id) => {
      const estado =
        get()

      const hueco =
        estado.planning.find(
          (h) => h.id === id
        )

      if (!hueco) {
        return
      }

      const vaACocinar =
        !hueco.cocinado

      const nuevoPlanning =
        estado.planning.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  cocinado:
                    vaACocinar,
                }
              : item
        )

      if (!vaACocinar) {
        guardarPlanningLocal(
          nuevoPlanning
        )

        set({
          planning:
            nuevoPlanning,
        })

        return
      }

      const ingredientes: IngredienteEscalado[] =
        []

      if (hueco.recetaId) {
        const receta =
          estado.recetas.find(
            (r) =>
              r.id ===
              hueco.recetaId
          )

        if (receta) {
          ingredientes.push(
            ...calcularIngredientesEscalados(
              receta,
              hueco.racionesOverride ??
                receta.raciones
            )
          )
        }
      }

      if (hueco.comidaLibre) {
        ingredientes.push(
          ...calcularIngredientesEscalados(
            {
              ingredientes:
                separarTextoIngredientes(
                  hueco.comidaLibre
                ),
              raciones: 1,
            },
            1
          )
        )
      }

      const nuevoInventario =
        descontarIngredientesInventario(
          estado.inventario,
          ingredientes
        )

      guardarPlanningLocal(
        nuevoPlanning
      )

      guardarInventarioLocal(
        nuevoInventario
      )

      set({
        planning:
          nuevoPlanning,
        inventario:
          nuevoInventario,
      })
    },
})