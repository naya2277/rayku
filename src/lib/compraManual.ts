export type ItemCompraManual = {
  id: string
  nombre: string
  cantidad: string | null
}

export const normalizarCompraManual = (
  item: any,
  generarId: () => string
): ItemCompraManual => ({
  id: item.id ?? generarId(),

  nombre: item.nombre ?? '',

  cantidad:
    item.cantidad?.toString?.() ??
    null,
})