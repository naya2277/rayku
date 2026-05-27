type Props = {
  total: number
  paraComprar: number
  yaDisponibles: number
  manuales: number
}

export default function ResumenCompra({
  total,
  paraComprar,
  yaDisponibles,
  manuales,
}: Props) {
  return (
    <div
      className="card"
      style={{
        marginBottom: 20,
        background:
          'linear-gradient(135deg, #ffe4ec 0%, #f6e9ff 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span className="pill pill-rosa">
          🛍️ Total: {total}
        </span>

        <span className="pill pill-naranja">
          🛒 Comprar: {paraComprar}
        </span>

        <span className="pill pill-verde">
          📦 Ya tienes: {yaDisponibles}
        </span>

        <span className="pill pill-malva">
          ✍️ Manual: {manuales}
        </span>
      </div>
    </div>
  )
}