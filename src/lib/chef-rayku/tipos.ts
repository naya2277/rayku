import type {
  ItemInventario,
  ItemPlanning,
  Receta,
  RegistroCocinado,
} from '../../store'

export type DatosContextoRayku = {
  recetas: Receta[]
  inventario: ItemInventario[]
  planning: ItemPlanning[]
  historialCocinado: RegistroCocinado[]
}

export type ContextoRayku = {
  resumen: string
  inventarioDisponible: string[]
  productosPendientes: string[]
  productosCaducanPronto: string[]
  recetasDisponibles: string[]
  planningActual: string[]
  historialReciente: string[]
}

export type TipoConsultaChefRayku =
  | 'cocinar'
  | 'gastar'
  | 'menu_keto'