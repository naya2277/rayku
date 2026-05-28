import {
  detectarCategoriaIngrediente,
  normalizarIngrediente,
} from './ingredientes'

import {
  separarTextoIngredientes,
} from './cantidadesIngredientes'

import {
  calcularIngredientesEscalados,
  redondearCantidad,
  type IngredienteEscalado,
} from './recetas/calcularIngredientesEscalados'

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

export function generarIngredientesCompra(
  planning: HuecoPlanningListaCompra[],
  recetas: RecetaListaCompra[]
) {
  const mapa = new Map<
    string,
    IngredienteCompra
  >()

  const añadirIngrediente = (
    ingrediente: IngredienteEscalado
  ) => {
    const normalizado =
      normalizarIngrediente(
        ingrediente.nombre
      )

    if (!normalizado) {
      return
    }

    const existente =
      mapa.get(normalizado)

    if (existente) {
      existente.veces += 1

      if (
        ingrediente.cantidad !== null &&
        ingrediente.unidad &&
        unidadesCompatibles(
          existente.unidad,
          ingrediente.unidad
        )
      ) {
        existente.cantidad =
          redondearCantidad(
            (existente.cantidad ||
              0) +
              ingrediente.cantidad
          )
      }

      if (
        existente.cantidad === null &&
        ingrediente.cantidad !== null
      ) {
        existente.cantidad =
          ingrediente.cantidad

        existente.unidad =
          ingrediente.unidad
      }
    } else {
      mapa.set(normalizado, {
        nombre: normalizado,

        veces: 1,

        cantidad:
          ingrediente.cantidad,

        unidad:
          ingrediente.unidad,

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
        const racionesObjetivo =
          hueco.racionesOverride ||
          receta.raciones ||
          1

        calcularIngredientesEscalados(
          receta,
          racionesObjetivo
        ).forEach(
          añadirIngrediente
        )
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
      ).forEach(
        añadirIngrediente
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
                redondearCantidad(
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