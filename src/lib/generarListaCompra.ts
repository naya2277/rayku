import {
  detectarCategoriaIngrediente,
  normalizarIngrediente,
} from './ingredientes'

type RecetaListaCompra = {
  id: string
  ingredientes: string[]
}

type HuecoPlanningListaCompra = {
  recetaId?: string | null
  comidaLibre?: string
}

type ItemInventarioListaCompra = {
  nombre: string
  cantidad: string | number
  unidad: string
}

export type IngredienteCompra = {
  nombre: string
  veces: number
}

export function generarIngredientesCompra(
  planning: HuecoPlanningListaCompra[],
  recetas: RecetaListaCompra[]
) {
  const mapa = new Map<string, IngredienteCompra>()

  const añadirIngrediente = (ingrediente: string) => {
    const normalizado = normalizarIngrediente(ingrediente)

    if (!normalizado) return

    const existente = mapa.get(normalizado)

    if (existente) {
      existente.veces += 1
    } else {
      mapa.set(normalizado, {
        nombre: normalizado,
        veces: 1,
      })
    }
  }

  planning.forEach((hueco) => {
    if (hueco.recetaId) {
      const receta = recetas.find((r) => r.id === hueco.recetaId)

      receta?.ingredientes.forEach((ingrediente) => {
        añadirIngrediente(ingrediente)
      })
    }

    if (hueco.comidaLibre) {
      hueco.comidaLibre
        .split(/,|\+|\n/)
        .map((i) => i.trim())
        .filter(Boolean)
        .forEach((ingrediente) => {
          añadirIngrediente(ingrediente)
        })
    }
  })

  return Array.from(mapa.values())
}

export function agruparIngredientesCompra(
  ingredientes: IngredienteCompra[]
) {
  return ingredientes.reduce(
    (acc, item) => {
      const categoria = detectarCategoriaIngrediente(item.nombre)

      if (!acc[categoria]) {
        acc[categoria] = []
      }

      acc[categoria].push(item)

      return acc
    },
    {} as Record<string, IngredienteCompra[]>
  )
}

export function ingredienteEnInventario(
  ingrediente: string,
  inventario: ItemInventarioListaCompra[]
) {
  const ingredienteNormalizado = normalizarIngrediente(ingrediente)

  return inventario.some((item) => {
    const itemNormalizado = normalizarIngrediente(item.nombre)

    return (
      itemNormalizado.includes(ingredienteNormalizado) ||
      ingredienteNormalizado.includes(itemNormalizado)
    )
  })
}

export function cantidadesInventario(
  ingrediente: string,
  inventario: ItemInventarioListaCompra[]
) {
  const ingredienteNormalizado = normalizarIngrediente(ingrediente)

  return inventario
    .filter((item) => {
      const itemNormalizado = normalizarIngrediente(item.nombre)

      return (
        itemNormalizado.includes(ingredienteNormalizado) ||
        ingredienteNormalizado.includes(itemNormalizado)
      )
    })
    .map((item) => `${item.cantidad}${item.unidad}`)
    .join(' + ')
}