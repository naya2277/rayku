export type Dificultad =
  | 'Fácil'
  | 'Media'
  | 'Elaborada'

export type TipoComida =
  | 'comida'
  | 'cena'

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
  ubicacion:
    | 'nevera'
    | 'congelador'
    | 'despensa'
  fechaCaducidad: string | null
  fechaDescongelar?: string | null
  necesitaDescongelar: boolean
}