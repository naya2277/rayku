import type {
  ItemInventario as ItemInventarioType,
} from '../../../store'

export function redondearCantidad(valor: number) {
  return Number(valor.toFixed(2))
}

export function obtenerPasoRapido(unidad: string) {
  const unidadNormalizada =
    unidad.toLowerCase()

  if (
    unidadNormalizada === 'u.' ||
    unidadNormalizada === 'u' ||
    unidadNormalizada === 'unidad' ||
    unidadNormalizada === 'lata' ||
    unidadNormalizada === 'paquete' ||
    unidadNormalizada === 'comida'
  ) {
    return 1
  }

  if (
    unidadNormalizada === 'kg' ||
    unidadNormalizada === 'l'
  ) {
    return 0.5
  }

  if (
    unidadNormalizada === 'g' ||
    unidadNormalizada === 'ml'
  ) {
    return 50
  }

  return 1
}

export function etiquetaUbicacion(
  ubicacion: ItemInventarioType['ubicacion']
) {
  if (ubicacion === 'nevera') {
    return '🧊 Nevera'
  }

  if (ubicacion === 'congelador') {
    return '❄️ Congelador'
  }

  if (ubicacion === 'despensa') {
    return '🗄️ Despensa'
  }

  return '🛍️ Pendiente'
}