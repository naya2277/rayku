import type {
  ItemInventario as ItemInventarioType,
} from '../../../store'

import {
  emojiIngrediente,
} from '../../../lib/ingredientes'

type Props = {
  item: ItemInventarioType
  agotado: boolean
}

export default function CabeceraItemInventario({
  item,
  agotado,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: 24,
          flexShrink: 0,
        }}
      >
        {emojiIngrediente(item.nombre)}
      </span>

      <strong
        style={{
          color: agotado ? '#a07030' : '#6f3f58',
          textDecoration: agotado ? 'line-through' : 'none',
          fontSize: 15,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {item.nombre}
      </strong>
    </div>
  )
}