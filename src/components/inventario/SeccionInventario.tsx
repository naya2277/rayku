import type {
  ItemInventario as ItemInventarioType,
} from '../../store'

import ItemInventario from './ItemInventario'

type Props = {
  titulo: string
  emoji: string
  color: string
  items: ItemInventarioType[]

  seleccionables?: boolean
  seleccionados?: string[]

  onToggleSeleccion?: (
    id: string
  ) => void

  editarItemInventario: (
    id: string,
    data: Partial<ItemInventarioType>
  ) => void

  eliminarItemInventario: (
    id: string
  ) => void
}

export default function SeccionInventario({
  titulo,
  emoji,
  color,
  items,
  seleccionables = false,
  seleccionados = [],
  onToggleSeleccion,
  editarItemInventario,
  eliminarItemInventario,
}: Props) {
  return (
    <div>
      <div
        style={{
          background: color,
          borderRadius:
            '16px 16px 0 0',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'space-between',
          border:
            '1.5px solid var(--borde)',
          borderBottom: 'none',
        }}
      >
        <div
          style={{
            fontWeight: '800',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {emoji} {titulo}
        </div>

        <span
          style={{
            fontSize: '11px',
            color: 'var(--txt2)',
            fontWeight: '700',
          }}
        >
          {items.length} productos
        </span>
      </div>

      <div
        style={{
          background: 'var(--card)',
          border:
            '1.5px solid var(--borde)',
          borderTop: 'none',
          borderRadius:
            '0 0 16px 16px',
          overflow: 'hidden',
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              padding: '18px',
              textAlign: 'center',
              color: 'var(--txt3)',
              fontSize: '13px',
              fontWeight: '700',
            }}
          >
            Vacío 🌸
          </div>
        ) : (
          items.map(
            (item, idx) => {
              const seleccionado =
                seleccionados.includes(
                  item.id
                )

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      seleccionables
                        ? '44px 1fr'
                        : '1fr',
                    alignItems: 'stretch',
                    borderBottom:
                      idx ===
                      items.length - 1
                        ? 'none'
                        : '1px solid var(--borde)',
                  }}
                >
                  {seleccionables && (
                    <button
                      type="button"
                      onClick={() =>
                        onToggleSeleccion?.(
                          item.id
                        )
                      }
                      style={{
                        border: 'none',
                        borderRight:
                          '1px solid var(--borde)',
                        background:
                          seleccionado
                            ? '#f2fff4'
                            : '#fffafc',
                        cursor: 'pointer',
                        fontSize: 22,
                        fontWeight: 900,
                        color:
                          seleccionado
                            ? '#6d9b6d'
                            : '#c45b86',
                      }}
                      aria-label={
                        seleccionado
                          ? 'Quitar selección'
                          : 'Seleccionar producto'
                      }
                    >
                      {seleccionado
                        ? '✅'
                        : '☐'}
                    </button>
                  )}

                  <ItemInventario
                    item={item}
                    ultimo={true}
                    editarItemInventario={
                      editarItemInventario
                    }
                    eliminarItemInventario={
                      eliminarItemInventario
                    }
                  />
                </div>
              )
            }
          )
        )}
      </div>
    </div>
  )
}