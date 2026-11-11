import type { ItemInventario } from '../store/types'

/**
 * Conservative proposal filter only: never guarantees food safety.
 * For cooked refrigerated leftovers require a known preparation date and
 * use a cautious 2-day suggestion window, even if a later manual expiry exists.
 */
export function sobraProponible(item: ItemInventario, hoy: string): boolean {
 if (!item.esCocinado || !Number.isFinite(item.cantidad) || item.cantidad <= 0 ||
     item.ubicacion === 'pendiente') return false
 if (!item.fechaPreparacion || item.fechaPreparacion > hoy) return false
 if (item.fechaCaducidad && item.fechaCaducidad < hoy) return false
 if (item.ubicacion === 'congelador') return true
 if (item.ubicacion !== 'nevera') return false

 const preparada = new Date(item.fechaPreparacion + 'T12:00:00Z')
 const actual = new Date(hoy + 'T12:00:00Z')
 const dias = (actual.getTime() - preparada.getTime()) / 86400000
 return Number.isFinite(dias) && dias >= 0 && dias <= 2
}
