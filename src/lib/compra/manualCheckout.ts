import type { ItemCompraManual } from '../../store/types'
import type { ItemCompraParaInventario } from './compradosAPendientesInventario'

/**
 * Preserve manual quantities on checkout. Parse only unambiguous amounts;
 * keep free-text descriptions visible instead of silently replacing them with 1.
 */
export function compraManualParaInventario(
  manual: ItemCompraManual
): ItemCompraParaInventario {
  const texto = manual.cantidad?.trim() ?? ''
  if (!texto) return { nombre: manual.nombre, cantidad: null, unidad: null }
  const match = texto.match(/^(\d+(?:[.,]\d+)?)\s*(kg|kilos?|g|gr|gramos?|l|litros?|ml|mililitros?|u\.?|uds?\.?|unidades?)$/i)
  if (match) {
    const cantidad = Number(match[1].replace(',', '.'))
    const raw = match[2].toLowerCase().replace(/\.$/, '')
    const unidad = /^(kg|kilo)/.test(raw) ? 'kg'
      : /^(g|gr|gramo)/.test(raw) ? 'g'
      : /^(l|litro)/.test(raw) ? 'l'
      : /^(ml|mililitro)/.test(raw) ? 'ml' : 'u'
    if (Number.isFinite(cantidad) && cantidad > 0) {
      return { nombre: manual.nombre, cantidad, unidad }
    }
  }
  return { nombre: manual.nombre + ' (' + texto + ')', cantidad: null, unidad: null }
}
