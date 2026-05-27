import type {
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
  guardarPlanningLocal,
} from './storage'

type StoreGet = () => {
  planning: ItemPlanning[]
}

type StoreSet = (
  data: Partial<{
    planning: ItemPlanning[]
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
})