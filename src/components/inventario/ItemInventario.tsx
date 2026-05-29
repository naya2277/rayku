import { useState } from 'react'

import type {
  ItemInventario as ItemInventarioType,
} from '../../store'

import {
  emojiIngrediente,
  claseIngrediente,
} from '../../lib/ingredientes'

import {
  detectarCaducidad,
} from '../../lib/inventario'

type Props = {
  item: ItemInventarioType
  ultimo: boolean

  editarItemInventario: (
    id: string,
    data: Partial<ItemInventarioType>
  ) => void

  eliminarItemInventario: (
    id: string
  ) => void
}

export default function ItemInventario({
  item,
  ultimo,
  editarItemInventario,
  eliminarItemInventario,
}: Props) {
  const [
    consumoActivo,
    setConsumoActivo,
  ] = useState(false)

  const [
    cantidadConsumida,
    setCantidadConsumida,
  ] = useState('')

  const estado =
    detectarCaducidad(
      item.fechaCaducidad
    )

  const agotado =
    item.cantidad <= 0

  const consumirProducto = () => {
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
        item.cantidad -
          cantidadRestar
      )

    editarItemInventario(
      item.id,
      {
        cantidad:
          nuevaCantidad,
      }
    )

    setCantidadConsumida('')
    setConsumoActivo(false)
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          '1fr',
        gap: '10px',
        padding: '12px 14px',
        borderBottom: !ultimo
          ? '1px solid var(--borde)'
          : 'none',
        opacity: agotado ? 0.72 : 1,
        background: agotado
          ? '#fffaf8'
          : 'transparent',
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems:
              'center',
            marginBottom: '6px',
          }}
        >
          <span
            className={`pill ${claseIngrediente(
              item.nombre
            )}`}
            style={{
              fontSize: '16px',
              padding:
                '10px 16px',
              fontWeight: 800,
              borderRadius:
                '999px',
              textDecoration: agotado
                ? 'line-through'
                : 'none',
            }}
          >
            {emojiIngrediente(
              item.nombre
            )}{' '}
            {item.nombre}
          </span>

          <span
            className={
              agotado
                ? 'pill pill-naranja'
                : 'pill pill-rosa'
            }
            style={{
              fontSize: '13px',
              padding:
                '6px 10px',
              fontWeight: 900,
            }}
          >
            📦 {item.cantidad}
            {item.unidad}
          </span>

          {item.ubicacion ===
            'pendiente' && (
            <span className="pill pill-naranja">
              🛍️ Pendiente de
              guardar
            </span>
          )}

          {agotado && (
            <span className="pill pill-naranja">
              🪫 Agotado
            </span>
          )}

          {item.necesitaDescongelar && (
            <span className="pill pill-teal">
              ❄️ Descongelar
            </span>
          )}

          {estado && !agotado && (
            <span
              className="pill"
              style={{
                background:
                  estado.fondo,
                color:
                  estado.color,
                border: `1px solid ${estado.color}`,
                fontSize:
                  '13px',
                padding:
                  '6px 10px',
              }}
            >
              {estado.texto}
            </span>
          )}
        </div>

        {item.fechaCaducidad && (
          <div
            style={{
              fontSize: '12px',
              color:
                'var(--txt2)',
              marginTop: '3px',
              marginLeft: '6px',
            }}
          >
            📅 Caduca:{' '}
            {
              item.fechaCaducidad
            }
          </div>
        )}

        {consumoActivo && (
          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              alignItems:
                'center',
              background:
                '#fff8fb',
              border:
                '1.5px solid #f5dde8',
              borderRadius:
                '14px',
              padding: '8px',
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
                width: '72px',
                minHeight: 32,
                fontSize: 12,
                padding:
                  '5px 7px',
              }}
            />

            <span
              className="pill pill-rosa"
              style={{
                fontSize: '11px',
                padding:
                  '4px 7px',
              }}
            >
              {item.unidad}
            </span>

            <button
              className="btn-principal"
              onClick={
                consumirProducto
              }
              style={{
                minHeight: 32,
                fontSize: 11,
                padding:
                  '5px 9px',
              }}
            >
              💕 Aplicar
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems:
            'center',
          gap: '6px',
          flexWrap: 'wrap',
          justifyContent:
            'flex-start',
          background: '#fffafc',
          border:
            '1px solid #f5dde8',
          borderRadius: 14,
          padding: '6px',
        }}
      >
        <button
          onClick={() =>
            setConsumoActivo(
              !consumoActivo
            )
          }
          className="btn-secundario"
          style={{
            minHeight: 30,
            fontSize: 10.5,
            padding:
              '4px 8px',
          }}
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
                    e.target.value
                  ) || 0,
              }
            )
          }
          style={{
            width: '56px',
            minHeight: 30,
            appearance:
              'textfield',
            textAlign:
              'center',
            fontSize: 11,
            padding:
              '4px 6px',
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
            width: '68px',
            minHeight: 30,
            fontSize: 11,
            padding:
              '4px 6px',
          }}
        >
          <option value="g">
            g
          </option>

          <option value="kg">
            kg
          </option>

          <option value="ml">
            ml
          </option>

          <option value="l">
            l
          </option>

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

        <select
          value={item.ubicacion}
          onChange={(e) =>
            editarItemInventario(
              item.id,
              {
                ubicacion:
                  e.target
                    .value as ItemInventarioType['ubicacion'],
              }
            )
          }
          style={{
            minHeight: 30,
            fontSize: 11,
            padding:
              '4px 6px',
          }}
        >
          <option value="pendiente">
            🛍️ Pendiente
          </option>

          <option value="nevera">
            🧊 Nevera
          </option>

          <option value="congelador">
            ❄️ Congelador
          </option>

          <option value="despensa">
            🗄️ Despensa
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
          style={{
            minHeight: 30,
            fontSize: 11,
            padding:
              '4px 7px',
          }}
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
          style={{
            minHeight: 30,
            fontSize: 11,
            padding:
              '4px 7px',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}