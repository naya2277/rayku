import type {
  ItemInventario,
  ItemPlanning,
  Receta,
  RegistroCocinado,
  PreferenciasAlimentarias,
} from '../../store'

export type DatosContextoRayku = {
  recetas: Receta[]
  inventario: ItemInventario[]
  planning: ItemPlanning[]
  historialCocinado: RegistroCocinado[]
  preferenciasAlimentarias: PreferenciasAlimentarias
}

export type ContextoRayku = {
  resumen: string
  inventarioDisponible: string[]
  productosPendientes: string[]
  productosCaducanPronto: string[]
  recetasDisponibles: string[]
  planningActual: string[]
  historialReciente: string[]
  ingredientesProhibidos: string[]
  ingredientesFavoritos: string[]
}

export type TipoConsultaChefRayku =
  | 'ideas_recetas'
  | 'cocinar_inventario'
  | 'menu_dieta'