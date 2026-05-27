import { useState } from 'react'

import type { ItemInventario } from '../../store'

import {
  emojiIngrediente,
  claseIngrediente,
} from '../../lib/ingredientes'

import { detectarCaducidad } from '../../lib/inventario'

type Props = {
  titulo: string
  emoji: string
  color: string
  items: ItemInventario[]

  editarItemInventario: (
    id: string,
    data: Partial<ItemInventario>
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
  const [
    itemConsumoActivo,
    setItemConsumoActivo,
  ] = useState<string | null>(null)

  const [
    cantidadConsumida,
    setCantidadConsumida,
  ] = useState('')

  const consumirProducto = (
    itemId: string,
    cantidadActual: number
  ) => {
    const cantidadRestar =
      parseFloat(
        cantidadConsumida
      )

    if (
      isNaN(cantidadRestar) ||
      cantidadRestar <= 0
    ) {
      return
    }

    const nuevaCantidad =
      Math.max(
        0,
        cantidadActual -
          cantidadRestar
      )

    editarItemInventario(
      itemId,
      {
        cantidad:
          nuevaCantidad,
      }
    )

    setCantidadConsumida('')
    setItemConsumoActivo(null)
  }

  return (
    <div>
      <div
        style={{
          background: color,
          borderRadius:
            '16px 16px 0 0',
          padding: '12px 18px',
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
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {emoji} {titulo}
        </div>

        <span
          style={{
            fontSize: '12px',
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
              padding: '20px',
              textAlign: 'center',
              color: 'var(--txt3)',
              fontSize: '13px',
              fontWeight: '700',
            }}
          >
            Vacío 🌸
          </div>
        ) : (
          items.map((item, idx) => {
            const estado =
              detectarCaducidad(
                item.fechaCaducidad
              )

            const consumoActivo =
              itemConsumoActivo ===
              item.id

            return (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr auto',
                  gap: '12px',
                  padding: '12px 18px',
                  borderBottom:
                    idx <
                    items.length - 1
                      ? '1px solid var(--borde)'
                      : 'none',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <span
                      className={`pill ${claseIngrediente(
                        item.nombre
                      )}`}
                    >
                      {emojiIngrediente(
                        item.nombre
                      )}{' '}
                      {item.nombre}
                    </span>

                    <span className="pill pill-rosa">
                      📦 {item.cantidad}
                      {item.unidad}
                    </span>

                    {item.necesitaDescongelar && (
                      <span className="pill pill-teal">
                        ❄️ Descongelar
                      </span>
                    )}

                    {estado && (
                      <span
                        className="pill"
                        style={{
                          background:
                            estado.fondo,
                          color:
                            estado.color,
                          border: `1px solid ${estado.color}`,
                        }}
                      >
                        {estado.texto}
                      </span>
                    )}
                  </div>

                  {item.fechaCaducidad && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--txt2)',
                        marginTop: '2px',
                      }}
                    >
                      Caduca:{' '}
                      {item.fechaCaducidad}
                    </div>
                  )}

                  {consumoActivo && (
                    <div
                      style={{
                        marginTop: '12px',
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        background: '#fff8fb',
                        border:
                          '1.5px solid #f5dde8',
                        borderRadius: '14px',
                        padding: '10px',
                      }}
                    >
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.1"
                        placeholder="Cantidad"
                        value={
                          cantidadConsumida
                        }
                        onChange={(e) =>
                          setCantidadConsumida(
                            e.target.value
                          )
                        }
                        style={{
                          width: '100px',
                        }}
                      />

                      <span className="pill pill-rosa">
                        {item.unidad}
                      </span>

                      <button
                        className="btn-principal"
                        onClick={() =>
                          consumirProducto(
                            item.id,
                            item.cantidad
                          )
                        }
                      >
                        💕 Aplicar
                      </button>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    justifyContent:
                      'flex-end',
                  }}
                >
                  <button
                    onClick={() =>
                      setItemConsumoActivo(
                        consumoActivo
                          ? null
                          : item.id
                      )
                    }
                    className="btn-secundario"
                  >
                    ➖ Consumir
                  </button>

                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    value={item.cantidad}
                    onChange={(e) =>
                      editarItemInventario(
                        item.id,
                        {
                          cantidad:
                            parseFloat(
                              e.target
                                .value
                            ) || 0,
                        }
                      )
                    }
                    style={{
                      width: '76px',
                      appearance:
                        'textfield',
                      textAlign: 'center',
                    }}
                  />

                  <select
                    value={item.unidad}
                    onChange={(e) =>
                      editarItemInventario(
                        item.id,
                        {
                          unidad:
                            e.target.value,
                        }
                      )
                    }
                    style={{
                      width: '95px',
                    }}
                  >
                    <option value="g">g</option>
                    <option value="kg">
                      kg
                    </option>
                    <option value="ml">
                      ml
                    </option>
                    <option value="l">l</option>
                    <option value="u.">
                      u.
                    </option>
                    <option value="paquete">
                      paquete
                    </option>
                    <option value="lata">
                      lata
                    </option>
                  </select>

                  <button
                    onClick={() =>
                      editarItemInventario(
                        item.id,
                        {
                          necesitaDescongelar:
                            !item.necesitaDescongelar,
                        }
                      )
                    }
                    className="btn-secundario"
                    title="Marcar/desmarcar descongelar"
                  >
                    {item.necesitaDescongelar
                      ? '❄️'
                      : '⬜'}
                  </button>

                  <button
                    onClick={() =>
                      eliminarItemInventario(
                        item.id
                      )
                    }
                    className="btn-secundario"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}