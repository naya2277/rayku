export type Dificultad =
  | 'Fácil'
  | 'Media'
  | 'Elaborada'

export type TipoComida =
  | 'comida'
  | 'cena'

export type UbicacionInventario =
  | 'pendiente'
  | 'nevera'
  | 'congelador'
  | 'despensa'

export type PreferenciasAlimentarias = {
  ingredientesProhibidos: string[]
  ingredientesFavoritos: string[]
}

export type Receta = {
  id: string
  nombre: string
  imagen: string
  favorita: boolean
  ingredientes: string[]
  pasos: string
  tiposComida: string[]
  ingredientesBase: string[]
  dietas: string[]
  caracteristicas: string[]
  tiempo: number
  raciones: number
  dificultad: Dificultad
  requiereDescongelar: boolean
  valoracion: number
  nota: string
}

export type ItemPlanning = {
  id: string
  fecha: string
  tipoComida: TipoComida
  recetaId: string | null
  recetaIds: string[]
  comidaLibre: string
  nota: string
  racionesOverride?: number | null
  cocinado?: boolean
}

export type ItemCompraManual = {
  id: string
  nombre: string
  cantidad: string | null
}

export type ItemInventario = {
  id: string
  nombre: string
  cantidad: number
  unidad: string
  categoria: string
  ubicacion: UbicacionInventario
  fechaCaducidad: string | null
  fechaDescongelar?: string | null
  necesitaDescongelar: boolean
  avisarStockBajo?: boolean
}

export type CambioInventarioCocinado = {
  itemId: string
  nombre: string
  unidad: string
  cantidadAnterior: number
  cantidadNueva: number
}

export type RegistroCocinado = {
  id: string
  planningId: string
  fecha: string
  tipoComida: TipoComida
  origen: 'receta' | 'comida_libre' | 'mixto'
  recetaId: string | null
  recetaIds?: string[]
  recetaNombre: string | null
  recetaNombres?: string[]
  comidaLibre: string
  raciones: number | null
  ingredientesOriginales: string[]
  cambiosInventario: CambioInventarioCocinado[]
  creadoEn: string
}