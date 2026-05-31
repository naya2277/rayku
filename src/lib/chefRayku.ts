import type {
  ItemInventario,
  Receta,
} from '../store/types'

import {
  calcularIngredientesEscalados,
} from './recetas/calcularIngredientesEscalados'

import {
  normalizarIngrediente,
} from './ingredientes'

import {
  calcularDiasCaducidad,
} from './inventario'

function normalizarUnidad(
  unidad: string | null
) {
  if (!unidad) return null

  const limpia =
    unidad.toLowerCase().trim()

  if (
    ['g', 'gr', 'gramo', 'gramos'].includes(
      limpia
    )
  ) {
    return 'g'
  }

  if (
    ['kg', 'kilo', 'kilos'].includes(
      limpia
    )
  ) {
    return 'kg'
  }

  if (
    ['ml', 'mililitro', 'mililitros'].includes(
      limpia
    )
  ) {
    return 'ml'
  }

  if (
    ['l', 'litro', 'litros'].includes(
      limpia
    )
  ) {
    return 'l'
  }

  if (
    [
      'u',
      'u.',
      'ud',
      'uds',
      'unidad',
      'unidades',
    ].includes(limpia)
  ) {
    return 'u'
  }

  return limpia
}

function tokens(texto: string) {
  return normalizarIngrediente(texto)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
}

function coincidenNombres(
  nombreA: string,
  nombreB: string
) {
  const tokensA = tokens(nombreA)
  const tokensB = tokens(nombreB)

  if (
    tokensA.length === 0 ||
    tokensB.length === 0
  ) {
    return false
  }

  const claveA = tokensA.join(' ')
  const claveB = tokensB.join(' ')

  if (claveA === claveB) {
    return true
  }

  return tokensB.every(
    (token) =>
      token.length >= 4 &&
      tokensA.includes(token)
  )
}

function cantidadDisponible(
  nombre: string,
  unidad: string | null,
  inventario: ItemInventario[]
) {
  return inventario.reduce(
    (total, item) => {
      if (item.cantidad <= 0) {
        return total
      }

      if (
        !coincidenNombres(
          item.nombre,
          nombre
        )
      ) {
        return total
      }

      if (!unidad) {
        return total + Number(item.cantidad || 0)
      }

      if (
        normalizarUnidad(item.unidad) !==
        normalizarUnidad(unidad)
      ) {
        return total
      }

      return total + Number(item.cantidad || 0)
    },
    0
  )
}

export type RecetaChefRayku = {
  receta: Receta
  faltan: string[]
  tieneTodo: boolean
  puntuacion: number
}

export function obtenerRecetasChefRayku(
  recetas: Receta[],
  inventario: ItemInventario[]
) {
  const resultados: RecetaChefRayku[] =
    recetas.map((receta) => {
      const ingredientes =
        calcularIngredientesEscalados(
          receta,
          receta.raciones || 1
        )

      const faltan =
        ingredientes
          .filter((ingrediente) => {
            const disponible =
              cantidadDisponible(
                ingrediente.nombre,
                ingrediente.unidad,
                inventario
              )

            if (
              ingrediente.cantidad === null ||
              !ingrediente.unidad
            ) {
              return disponible <= 0
            }

            return (
              disponible <
              ingrediente.cantidad
            )
          })
          .map(
            (ingrediente) =>
              ingrediente.nombre
          )

      const bonusFavorita =
        receta.favorita ? 20 : 0

      const bonusValoracion =
        Number(receta.valoracion || 0) * 4

      const penalizacionFaltas =
        faltan.length * 10

      return {
        receta,
        faltan,
        tieneTodo:
          faltan.length === 0,
        puntuacion:
          bonusFavorita +
          bonusValoracion -
          penalizacionFaltas,
      }
    })

  return resultados.sort((a, b) => {
    if (
      a.faltan.length !==
      b.faltan.length
    ) {
      return (
        a.faltan.length -
        b.faltan.length
      )
    }

    return b.puntuacion - a.puntuacion
  })
}

export function obtenerIngredientesUrgentes(
  inventario: ItemInventario[]
) {
  return inventario
    .filter((item) => {
      if (
        item.ubicacion === 'pendiente' ||
        item.cantidad <= 0
      ) {
        return false
      }

      const dias =
        calcularDiasCaducidad(
          item.fechaCaducidad
        )

      return (
        dias !== null &&
        dias <= 3
      )
    })
    .sort((a, b) => {
      const diasA =
        calcularDiasCaducidad(
          a.fechaCaducidad
        ) ?? 999

      const diasB =
        calcularDiasCaducidad(
          b.fechaCaducidad
        ) ?? 999

      return diasA - diasB
    })
}