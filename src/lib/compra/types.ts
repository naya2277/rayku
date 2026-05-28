export type RecetaListaCompra = {
  id: string
  ingredientes: string[]
  raciones?: number
}

export type HuecoPlanningListaCompra = {
  recetaId?: string | null
  comidaLibre?: string
  racionesOverride?: number | null
}

export type ItemInventarioListaCompra = {
  nombre: string
  cantidad: string | number
  unidad: string
}

export type IngredienteCompra = {
  clave: string
  nombre: string
  veces: number
  cantidad: number | null
  unidad: string | null
  cantidadDisponible: number | null
  cantidadFaltante: number | null
}