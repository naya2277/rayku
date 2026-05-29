import type {
  Receta,
  ItemInventario,
  ItemPlanning,
  TipoComida,
  RegistroCocinado,
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
  guardarHistorialCocinadoLocal,
} from './storage'

import {
  prepararIngredientesCocinar,
} from '../lib/cocinar/prepararIngredientesCocinar'

import {
  aplicarCocinado,
} from '../lib/cocinar/aplicarCocinado'

import {
  revertirCocinado,
} from '../lib/cocinar/revertirCocinado'

type StoreGet = () => {
  planning: ItemPlanning[]
  recetas: Receta[]
  inventario: ItemInventario[]
  historialCocinado: RegistroCocinado[]
}

type StoreSet = (
  data: Partial<{
    planning: ItemPlanning[]
    inventario: ItemInventario[]
    historialCocinado: RegistroCocinado[]
  }>
) => void

export type PlanningSlice = {
  planning: ItemPlanning[]
  historialCocinado: RegistroCocinado[]

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
  historialCocinado: [],

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

      if (!vaACocinar) {
        const registro =
          [...estado.historialCocinado]
            .reverse()
            .find(
              (r) =>
                r.planningId === id
            )

        const nuevoInventario =
          registro
            ? revertirCocinado(
                estado.inventario,
                registro
              )
            : estado.inventario

        const nuevoHistorial =
          registro
            ? estado.historialCocinado.filter(
                (r) =>
                  r.id !==
                  registro.id
              )
            : estado.historialCocinado

        const nuevoPlanning =
          estado.planning.map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    cocinado: false,
                  }
                : item
          )

        guardarPlanningLocal(
          nuevoPlanning
        )

        guardarInventarioLocal(
          nuevoInventario
        )

        guardarHistorialCocinadoLocal(
          nuevoHistorial
        )

        set({
          planning:
            nuevoPlanning,
          inventario:
            nuevoInventario,
          historialCocinado:
            nuevoHistorial,
        })

        return
      }

      const datosCocinado =
        prepararIngredientesCocinar(
          hueco,
          estado.recetas
        )

      const resultado =
        aplicarCocinado(
          estado.inventario,
          hueco,
          datosCocinado
        )

      const nuevoPlanning =
        estado.planning.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  cocinado: true,
                }
              : item
        )

      const nuevoHistorial =
        [
          ...estado.historialCocinado,
          resultado.registro,
        ]

      guardarPlanningLocal(
        nuevoPlanning
      )

      guardarInventarioLocal(
        resultado.inventario
      )

      guardarHistorialCocinadoLocal(
        nuevoHistorial
      )

      set({
        planning:
          nuevoPlanning,
        inventario:
          resultado.inventario,
        historialCocinado:
          nuevoHistorial,
      })
    },
})