type Props = {
  total: number
  paraComprar: number
  yaDisponibles: number
  manuales: number
  comprados: number
  onFinalizarCompra: () => void
}

export default function ResumenCompra({
  total,
  paraComprar,
  yaDisponibles,
  manuales,
  comprados,
  onFinalizarCompra,
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
          justifyContent:
            'space-between',
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

          {comprados > 0 && (
            <span className="pill pill-verde">
              ✅ Comprados: {comprados}
            </span>
          )}
        </div>

        <button
          type="button"
          className="btn-principal"
          onClick={
            onFinalizarCompra
          }
          disabled={
            comprados === 0
          }
          style={{
            opacity:
              comprados === 0
                ? 0.55
                : 1,
            cursor:
              comprados === 0
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          ✅ Compra hecha
        </button>
      </div>

      <p
        style={{
          marginTop: 12,
          color: '#8f7080',
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        Los productos marcados pasarán a Cocina, pendientes de asignar a nevera, congelador o despensa. Los no comprados seguirán en la lista.
      </p>
    </div>
  )
}