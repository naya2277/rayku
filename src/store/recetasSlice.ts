import type {
  Receta,
} from './types'

import {
  generarId,
} from './utils'

import {
  normalizarReceta,
} from './normalizers'

import {
  guardarRecetasLocal,
} from './storage'

type StoreGet = () => {
  recetas: Receta[]
}

type StoreSet = (
  data: Partial<{
    recetas: Receta[]
  }>
) => void

export type RecetasSlice = {
  recetas: Receta[]

  addReceta: (
    receta: Receta
  ) => void

  updateReceta: (
    id: string,
    data: Partial<Receta>
  ) => void

  deleteReceta: (
    id: string
  ) => void

  duplicarReceta: (
    id: string
  ) => void

  toggleFavorita: (
    id: string
  ) => void
}

export const crearRecetasSlice = (
  set: StoreSet,
  get: StoreGet
): RecetasSlice => ({
  recetas: [],

  addReceta: (
    receta
  ) => {
    const nuevaReceta =
      normalizarReceta({
        ...receta,
        id:
          receta.id ||
          generarId(),
      })

    const nuevas = [
      ...get().recetas,
      nuevaReceta,
    ]

    guardarRecetasLocal(
      nuevas
    )

    set({
      recetas: nuevas,
    })
  },

  updateReceta: (
    id,
    data
  ) => {
    const nuevas =
      get().recetas.map(
        (r) =>
          r.id === id
            ? normalizarReceta({
                ...r,
                ...data,
                id: r.id,
              })
            : r
      )

    guardarRecetasLocal(
      nuevas
    )

    set({
      recetas: nuevas,
    })
  },

  deleteReceta: (
    id
  ) => {
    const nuevas =
      get().recetas.filter(
        (r) => r.id !== id
      )

    guardarRecetasLocal(
      nuevas
    )

    set({
      recetas: nuevas,
    })
  },

  duplicarReceta: (
    id
  ) => {
    const receta =
      get().recetas.find(
        (r) => r.id === id
      )

    if (!receta) return

    const copia =
      normalizarReceta({
        ...receta,
        id: generarId(),
        nombre: `${receta.nombre} (copia)`,
        favorita: false,
      })

    const nuevas = [
      copia,
      ...get().recetas,
    ]

    guardarRecetasLocal(
      nuevas
    )

    set({
      recetas: nuevas,
    })
  },

  toggleFavorita: (
    id
  ) => {
    const nuevas =
      get().recetas.map(
        (r) =>
          r.id === id
            ? {
                ...r,
                favorita:
                  !r.favorita,
              }
            : r
      )

    guardarRecetasLocal(
      nuevas
    )

    set({
      recetas: nuevas,
    })
  },
})