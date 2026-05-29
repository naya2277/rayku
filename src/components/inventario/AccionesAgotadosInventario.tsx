import type {
  ItemInventario,
  ItemCompraManual,
} from '../../store'

import {
  normalizarIngrediente,
} from '../../lib/ingredientes'

type Props = {
  productosAgotados: ItemInventario[]
  compraManual: ItemCompraManual[]
  onAgregarAgotadosACompra: () => void
}

export default function AccionesAgotadosInventario({
  productosAgotados,
  compraManual,
  onAgregarAgotadosACompra,
}: Props) {
  if (productosAgotados.length === 0) {
    return null
  }

  const todosEstanEnCompra =
    productosAgotados.every(
      (agotado) =>
        compraManual.some(
          (manual) =>
            normalizarIngrediente(
              manual.nombre
            ) ===
            normalizarIngrediente(
              agotado.nombre
            )
        )
    )

  return (
    <div
      className="card"
      style={{
        marginBottom: 18,
        background:
          'linear-gradient(135deg, #fff8ee, #fffafc)',
        borderColor: '#ffcc80',
      }}
    >
      <h2
        style={{
          color: '#a07030',
          fontSize: 18,
          marginBottom: 8,
        }}
      >
        🪫 Productos agotados
      </h2>

      <p
        style={{
          color: 'var(--txt2)',
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        Tienes {productosAgotados.length}{' '}
        producto
        {productosAgotados.length === 1
          ? ''
          : 's'}{' '}
        agotado
        {productosAgotados.length === 1
          ? ''
          : 's'}.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 12,
        }}
      >
        {productosAgotados.map(
          (item) => (
            <span
              key={item.id}
              className="pill pill-naranja"
            >
              🪫 {item.nombre}
            </span>
          )
        )}
      </div>

      {todosEstanEnCompra ? (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding:
              '10px 14px',
            borderRadius: 12,
            background:
              '#eefbf1',
            border:
              '1px solid #9ad8a5',
            color: '#2f7d32',
            fontWeight: 800,
          }}
        >
          ✅ Ya están en compra
        </div>
      ) : (
        <button
          type="button"
          className="btn-principal"
          onClick={
            onAgregarAgotadosACompra
          }
        >
          🛍️ Añadir agotados a compra
        </button>
      )}
    </div>
  )
}