import {
  emojiIngrediente,
  claseIngrediente,
} from '../../lib/ingredientes'

import {
  ingredienteEnInventario,
  cantidadesInventario,
  type IngredienteCompra,
} from '../../lib/generarListaCompra'

type ItemManual = {
  id: string
  nombre: string
}

type Props = {
  item: IngredienteCompra
  modo: 'comprar' | 'disponible'
  inventario: any[]
  comprado: boolean
  manual?: ItemManual
  onToggleComprado: () => void
  onEliminarManual?: () => void
}

export default function ItemCompra({
  item,
  modo,
  inventario,
  comprado,
  manual,
  onToggleComprado,
  onEliminarManual,
}: Props) {
  const yaTienes =
    ingredienteEnInventario(
      item.nombre,
      inventario
    )

  const cantidad =
    cantidadesInventario(
      item.nombre,
      inventario
    )

  const esDisponible =
    modo === 'disponible'

  const renderCantidad = () => {
    if (
      item.cantidad === null ||
      !item.unidad
    ) {
      return null
    }

    return (
      <span className="pill pill-rosa">
        📏 {item.cantidad}
        {item.unidad}
      </span>
    )
  }

  const renderDisponible = () => {
    if (
      item.cantidadDisponible ===
        null ||
      !item.unidad
    ) {
      return null
    }

    return (
      <span className="pill pill-verde">
        📦 Tienes{' '}
        {item.cantidadDisponible}
        {item.unidad}
      </span>
    )
  }

  const renderFaltante = () => {
    if (
      item.cantidadFaltante ===
        null ||
      !item.unidad
    ) {
      return null
    }

    if (
      item.cantidadFaltante <= 0
    ) {
      return (
        <span className="pill pill-verde">
          ✅ Completo
        </span>
      )
    }

    return (
      <span className="pill pill-naranja">
        ⚠️ Faltan{' '}
        {item.cantidadFaltante}
        {item.unidad}
      </span>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent:
          'space-between',
        gap: '10px',
        flexWrap: 'wrap',
        background: esDisponible
          ? '#f7fff8'
          : '#fffaf8',
        border: esDisponible
          ? '1.5px solid #cfead2'
          : '1.5px solid #f5dde8',
        borderRadius: '14px',
        padding: '10px 12px',
        opacity: esDisponible
          ? 0.9
          : 1,
      }}
    >
      <button
        type="button"
        onClick={() => {
          if (!esDisponible) {
            onToggleComprado()
          }
        }}
        className={`pill ${claseIngrediente(
          item.nombre
        )}`}
        style={{
          opacity: comprado
            ? 0.45
            : 1,
          textDecoration: comprado
            ? 'line-through'
            : 'none',
          cursor: esDisponible
            ? 'default'
            : 'pointer',
          border: comprado
            ? '2px solid #9e9e9e'
            : undefined,
          fontSize: 15,
          padding: '10px 14px',
        }}
      >
        {esDisponible
          ? '📦'
          : comprado
            ? '✅'
            : emojiIngrediente(
                item.nombre
              )}{' '}
        {item.nombre}

        {manual && (
          <span> ✍️</span>
        )}

        {item.veces > 1 && (
          <span> x{item.veces}</span>
        )}
      </button>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {renderCantidad()}

        {renderDisponible()}

        {renderFaltante()}

        {yaTienes &&
          item.cantidad === null && (
            <span className="pill pill-verde">
              📦 Tienes {cantidad}
            </span>
          )}

        {!esDisponible &&
          !comprado && (
            <span className="pill pill-rosa">
              🛒 Comprar
            </span>
          )}

        {comprado && (
          <span className="pill pill-verde">
            ✅ Comprado
          </span>
        )}

        {manual &&
          onEliminarManual && (
            <button
              type="button"
              className="btn-secundario"
              onClick={
                onEliminarManual
              }
            >
              🗑️
            </button>
          )}
      </div>
    </div>
  )
}