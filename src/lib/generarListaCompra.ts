import {
  detectarCategoriaIngrediente,
  normalizarIngrediente,
} from './ingredientes'

import {
  parsearIngredienteConCantidad,
  separarTextoIngredientes,
} from './cantidadesIngredientes'

type RecetaListaCompra = {
  id: string
  ingredientes: string[]
  raciones?: number
}

type HuecoPlanningListaCompra = {
  recetaId?: string | null
  comidaLibre?: string
  racionesOverride?: number | null
}

type ItemInventarioListaCompra = {
  nombre: string
  cantidad: string | number
  unidad: string
}

export type IngredienteCompra = {
  nombre: string
  veces: number
  cantidad: number | null
  unidad: string | null
  cantidadDisponible: number | null
  cantidadFaltante: number | null
}

function unidadesCompatibles(
  unidadA: string | null,
  unidadB: string | null
) {
  if (!unidadA || !unidadB) {
    return false
  }

  return unidadA === unidadB
}

function redondear(
  valor: number
) {
  return Number(
    valor.toFixed(2)
  )
}

export function generarIngredientesCompra(
  planning: HuecoPlanningListaCompra[],
  recetas: RecetaListaCompra[]
) {
  const mapa = new Map<
    string,
    IngredienteCompra
  >()

  const añadirIngrediente = (
    ingrediente: string,
    multiplicador = 1
  ) => {
    const parseado =
      parsearIngredienteConCantidad(
        ingrediente
      )

    const normalizado =
      normalizarIngrediente(
        parseado.nombre
      )

    if (!normalizado) {
      return
    }

    const cantidadEscalada =
      parseado.cantidad !== null
        ? redondear(
            parseado.cantidad *
              multiplicador
          )
        : null

    const existente =
      mapa.get(normalizado)

    if (existente) {
      existente.veces += 1

      if (
        cantidadEscalada !== null &&
        parseado.unidad &&
        unidadesCompatibles(
          existente.unidad,
          parseado.unidad
        )
      ) {
        existente.cantidad =
          redondear(
            (existente.cantidad ||
              0) +
              cantidadEscalada
          )
      }

      if (
        existente.cantidad === null &&
        cantidadEscalada !== null
      ) {
        existente.cantidad =
          cantidadEscalada

        existente.unidad =
          parseado.unidad
      }
    } else {
      mapa.set(normalizado, {
        nombre: normalizado,

        veces: 1,

        cantidad:
          cantidadEscalada,

        unidad:
          parseado.unidad,

        cantidadDisponible:
          null,

        cantidadFaltante:
          null,
      })
    }
  }

  planning.forEach((hueco) => {
    if (hueco.recetaId) {
      const receta =
        recetas.find(
          (r) =>
            r.id ===
            hueco.recetaId
        )

      if (receta) {
        const racionesBase =
          receta.raciones || 1

        const racionesObjetivo =
          hueco.racionesOverride ||
          receta.raciones ||
          1

        const multiplicador =
          racionesObjetivo /
          racionesBase

        receta.ingredientes.forEach(
          (ingrediente) => {
            añadirIngrediente(
              ingrediente,
              multiplicador
            )
          }
        )
      }
    }

    if (hueco.comidaLibre) {
      separarTextoIngredientes(
        hueco.comidaLibre
      ).forEach(
        (ingrediente) => {
          añadirIngrediente(
            ingrediente
          )
        }
      )
    }
  })

  return Array.from(
    mapa.values()
  )
}

export function agruparIngredientesCompra(
  ingredientes: IngredienteCompra[]
) {
  return ingredientes.reduce(
    (acc, item) => {
      const categoria =
        detectarCategoriaIngrediente(
          item.nombre
        )

      if (!acc[categoria]) {
        acc[categoria] = []
      }

      acc[categoria].push(item)

      return acc
    },
    {} as Record<
      string,
      IngredienteCompra[]
    >
  )
}

export function ingredienteEnInventario(
  ingrediente: string,
  inventario: ItemInventarioListaCompra[]
) {
  const ingredienteNormalizado =
    normalizarIngrediente(
      ingrediente
    )

  return inventario.some(
    (item) => {
      const itemNormalizado =
        normalizarIngrediente(
          item.nombre
        )

      return (
        itemNormalizado.includes(
          ingredienteNormalizado
        ) ||
        ingredienteNormalizado.includes(
          itemNormalizado
        )
      )
    }
  )
}

export function cantidadesInventario(
  ingrediente: string,
  inventario: ItemInventarioListaCompra[]
) {
  const ingredienteNormalizado =
    normalizarIngrediente(
      ingrediente
    )

  return inventario
    .filter((item) => {
      const itemNormalizado =
        normalizarIngrediente(
          item.nombre
        )

      return (
        itemNormalizado.includes(
          ingredienteNormalizado
        ) ||
        ingredienteNormalizado.includes(
          itemNormalizado
        )
      )
    })
    .map(
      (item) =>
        `${item.cantidad}${item.unidad}`
    )
    .join(' + ')
}

function calcularDisponible(
  ingrediente: IngredienteCompra,
  inventario: ItemInventarioListaCompra[]
) {
  if (
    ingrediente.cantidad ===
      null ||
    !ingrediente.unidad
  ) {
    return null
  }

  const ingredienteNormalizado =
    normalizarIngrediente(
      ingrediente.nombre
    )

  return inventario.reduce(
    (total, item) => {
      const itemNormalizado =
        normalizarIngrediente(
          item.nombre
        )

      const coincide =
        itemNormalizado.includes(
          ingredienteNormalizado
        ) ||
        ingredienteNormalizado.includes(
          itemNormalizado
        )

      if (!coincide) {
        return total
      }

      if (
        item.unidad !==
        ingrediente.unidad
      ) {
        return total
      }

      return (
        total +
        Number(
          item.cantidad || 0
        )
      )
    },
    0
  )
}

export function separarIngredientesPorInventario(
  ingredientes: IngredienteCompra[],
  inventario: ItemInventarioListaCompra[]
) {
  const paraComprar: IngredienteCompra[] =
    []

  const yaDisponibles: IngredienteCompra[] =
    []

  ingredientes.forEach(
    (ingrediente) => {
      const disponible =
        calcularDisponible(
          ingrediente,
          inventario
        )

      if (
        ingrediente.cantidad !==
          null &&
        ingrediente.unidad &&
        disponible !== null
      ) {
        const faltante =
          ingrediente.cantidad -
          disponible

        const ingredienteCalculado =
          {
            ...ingrediente,

            cantidadDisponible:
              disponible,

            cantidadFaltante:
              Math.max(
                0,
                redondear(
                  faltante
                )
              ),
          }

        if (
          faltante > 0
        ) {
          paraComprar.push(
            ingredienteCalculado
          )
        } else {
          yaDisponibles.push(
            ingredienteCalculado
          )
        }

        return
      }

      if (
        ingredienteEnInventario(
          ingrediente.nombre,
          inventario
        )
      ) {
        yaDisponibles.push(
          ingrediente
        )
      } else {
        paraComprar.push(
          ingrediente
        )
      }
    }
  )

  return {
    paraComprar,
    yaDisponibles,
  }
}