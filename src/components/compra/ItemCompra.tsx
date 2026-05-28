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

  const tieneCantidad =
    item.cantidad !== null &&
    Boolean(item.unidad)

  const cantidadNecesaria =
    tieneCantidad
      ? `${item.cantidad}${item.unidad}`
      : null

  const cantidadDisponible =
    item.cantidadDisponible !== null &&
    item.unidad
      ? `${item.cantidadDisponible}${item.unidad}`
      : null

  const cantidadFaltante =
    item.cantidadFaltante !== null &&
    item.unidad
      ? `${item.cantidadFaltante}${item.unidad}`
      : null

  const renderFaltantePrincipal = () => {
    if (!cantidadFaltante) {
      return null
    }

    if (
      item.cantidadFaltante !== null &&
      item.cantidadFaltante <= 0
    ) {
      return (
        <span
          className="pill pill-verde"
          style={{
            fontSize: 15,
            fontWeight: 900,
            padding: '10px 14px',
          }}
        >
          ✅ Completo
        </span>
      )
    }

    return (
      <span
        className="pill pill-naranja"
        style={{
          fontSize: 15,
          fontWeight: 900,
          padding: '10px 14px',
        }}
      >
        ⚠️ Faltan{' '}
        {cantidadFaltante}
      </span>
    )
  }

  const renderDisponible = () => {
    if (!cantidadDisponible) {
      return null
    }

    return (
      <span className="pill pill-verde">
        📦 Tienes{' '}
        {cantidadDisponible}
      </span>
    )
  }

  const renderNecesario = () => {
    if (!cantidadNecesaria) {
      return null
    }

    return (
      <span className="pill pill-rosa">
        🏷️ Necesitas{' '}
        {cantidadNecesaria}
      </span>
    )
  }

  const renderUso = () => {
    if (manual || item.veces <= 1) {
      return null
    }

    return (
      <span
        className="pill pill-malva"
        style={{
          fontSize: 12,
          opacity: 0.85,
          padding: '6px 10px',
        }}
      >
        🔁 usado en{' '}
        {item.veces}{' '}
        comidas
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
          textTransform: 'none',
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
      </button>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {renderFaltantePrincipal()}

        {renderDisponible()}

        {renderNecesario()}

        {renderUso()}

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