import type {
  ItemInventario,
  RegistroCocinado,
} from '../../store/types'

export function revertirCocinado(
  inventario: ItemInventario[],
  registro: RegistroCocinado
): ItemInventario[] {
  return inventario.map(
    (item) => {
      const cambio =
        registro.cambiosInventario.find(
          (c) =>
            c.itemId === item.id
        )

      if (!cambio) {
        return item
      }

      return {
        ...item,
        cantidad:
          cambio.cantidadAnterior,
      }
    }
  )
}