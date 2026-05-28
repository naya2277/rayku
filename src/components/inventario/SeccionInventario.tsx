import type {
  ItemInventario as ItemInventarioType,
} from '../../store'

import ItemInventario from './ItemInventario'

type Props = {
  titulo: string
  emoji: string
  color: string
  items: ItemInventarioType[]

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
            (item, idx) => (
              <ItemInventario
                key={item.id}
                item={item}
                ultimo={
                  idx ===
                  items.length -
                    1
                }
                editarItemInventario={
                  editarItemInventario
                }
                eliminarItemInventario={
                  eliminarItemInventario
                }
              />
            )
          )
        )}
      </div>
    </div>
  )
}