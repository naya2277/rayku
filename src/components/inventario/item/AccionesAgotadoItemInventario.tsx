type Props = {
  onVolverAComprar: () => void
  onBorrar: () => void
}

export default function AccionesAgotadoItemInventario({
  onVolverAComprar,
  onBorrar,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        background:
          'rgba(255, 255, 255, 0.72)',
        border:
          '1.5px solid #ffcc80',
        borderRadius: 18,
        padding: 10,
      }}
    >
      <button
        type="button"
        className="btn-secundario"
        onClick={onVolverAComprar}
      >
        🔁 Volver a comprar
      </button>

      <button
        type="button"
        className="btn-secundario"
        onClick={onBorrar}
      >
        🗑️ Borrar definitivamente
      </button>
    </div>
  )
}