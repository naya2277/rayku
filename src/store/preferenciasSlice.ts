import type {
  PreferenciasAlimentarias,
} from './types'

import {
  normalizarPreferenciasAlimentarias,
} from './normalizers'

import {
  guardarPreferenciasAlimentariasLocal,
} from './storage'

type StoreGet = () => {
  preferenciasAlimentarias: PreferenciasAlimentarias
}

type StoreSet = (
  data: Partial<{
    preferenciasAlimentarias: PreferenciasAlimentarias
  }>
) => void

export type PreferenciasSlice = {
  preferenciasAlimentarias: PreferenciasAlimentarias

  actualizarPreferenciasAlimentarias: (
    data: Partial<PreferenciasAlimentarias>
  ) => void

  agregarIngredienteProhibido: (
    ingrediente: string
  ) => void

  eliminarIngredienteProhibido: (
    ingrediente: string
  ) => void

  agregarIngredienteFavorito: (
    ingrediente: string
  ) => void

  eliminarIngredienteFavorito: (
    ingrediente: string
  ) => void
}

function limpiarIngrediente(
  ingrediente: string
) {
  return ingrediente
    .trim()
    .toLowerCase()
}

function agregarUnico(
  lista: string[],
  valor: string
) {
  const limpio =
    limpiarIngrediente(valor)

  if (!limpio) {
    return lista
  }

  if (
    lista.some(
      (item) =>
        limpiarIngrediente(item) ===
        limpio
    )
  ) {
    return lista
  }

  return [
    ...lista,
    limpio,
  ]
}

function eliminarDeLista(
  lista: string[],
  valor: string
) {
  const limpio =
    limpiarIngrediente(valor)

  return lista.filter(
    (item) =>
      limpiarIngrediente(item) !==
      limpio
  )
}

export const crearPreferenciasSlice = (
  set: StoreSet,
  get: StoreGet
): PreferenciasSlice => ({
  preferenciasAlimentarias: {
    ingredientesProhibidos: [],
    ingredientesFavoritos: [],
  },

  actualizarPreferenciasAlimentarias:
    (data) => {
      const nuevas =
        normalizarPreferenciasAlimentarias({
          ...get()
            .preferenciasAlimentarias,
          ...data,
        })

      guardarPreferenciasAlimentariasLocal(
        nuevas
      )

      set({
        preferenciasAlimentarias:
          nuevas,
      })
    },

  agregarIngredienteProhibido:
    (ingrediente) => {
      const actuales =
        get()
          .preferenciasAlimentarias

      const nuevas =
        normalizarPreferenciasAlimentarias({
          ...actuales,
          ingredientesProhibidos:
            agregarUnico(
              actuales
                .ingredientesProhibidos,
              ingrediente
            ),
        })

      guardarPreferenciasAlimentariasLocal(
        nuevas
      )

      set({
        preferenciasAlimentarias:
          nuevas,
      })
    },

  eliminarIngredienteProhibido:
    (ingrediente) => {
      const actuales =
        get()
          .preferenciasAlimentarias

      const nuevas =
        normalizarPreferenciasAlimentarias({
          ...actuales,
          ingredientesProhibidos:
            eliminarDeLista(
              actuales
                .ingredientesProhibidos,
              ingrediente
            ),
        })

      guardarPreferenciasAlimentariasLocal(
        nuevas
      )

      set({
        preferenciasAlimentarias:
          nuevas,
      })
    },

  agregarIngredienteFavorito:
    (ingrediente) => {
      const actuales =
        get()
          .preferenciasAlimentarias

      const nuevas =
        normalizarPreferenciasAlimentarias({
          ...actuales,
          ingredientesFavoritos:
            agregarUnico(
              actuales
                .ingredientesFavoritos,
              ingrediente
            ),
        })

      guardarPreferenciasAlimentariasLocal(
        nuevas
      )

      set({
        preferenciasAlimentarias:
          nuevas,
      })
    },

  eliminarIngredienteFavorito:
    (ingrediente) => {
      const actuales =
        get()
          .preferenciasAlimentarias

      const nuevas =
        normalizarPreferenciasAlimentarias({
          ...actuales,
          ingredientesFavoritos:
            eliminarDeLista(
              actuales
                .ingredientesFavoritos,
              ingrediente
            ),
        })

      guardarPreferenciasAlimentariasLocal(
        nuevas
      )

      set({
        preferenciasAlimentarias:
          nuevas,
      })
    },
})