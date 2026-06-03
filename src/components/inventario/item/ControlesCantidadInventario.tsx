import type {
  ItemInventario as ItemInventarioType,
} from '../../../store'

type Props = {
  item: ItemInventarioType
  pasoRapido: number
  onCambiarCantidad: (cambio: number) => void
}

export default function ControlesCantidadInventario({
  item,
  pasoRapido,
  onCambiarCantidad,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <button
        type="button"
        className="btn-secundario"
        onClick={() => onCambiarCantidad(-pasoRapido)}
        disabled={item.cantidad <= 0}
        style={{
          minHeight: 28,
          minWidth: 34,
          fontSize: 13,
          padding: '4px 8px',
          opacity: item.cantidad <= 0 ? 0.45 : 1,
        }}
      >
        −
      </button>

      <span
        style={{
          color: '#8f7080',
          fontSize: 12,
          fontWeight: 900,
          minWidth: 48,
          textAlign: 'center',
        }}
      >
        {pasoRapido} {item.unidad}
      </span>

      <button
        type="button"
        className="btn-secundario"
        onClick={() => onCambiarCantidad(pasoRapido)}
        style={{
          minHeight: 28,
          minWidth: 34,
          fontSize: 13,
          padding: '4px 8px',
        }}
      >
        +
      </button>
    </div>
  )
}