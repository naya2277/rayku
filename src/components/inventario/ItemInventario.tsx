import { useState } from 'react'

import type {
  ItemInventario as ItemInventarioType,
} from '../../store'

import {
  emojiIngrediente,
  claseIngrediente,
} from '../../lib/ingredientes'

import {
  normalizarIngredienteRayku,
} from '../../lib/ingredientes/normalizacion'

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

function redondearCantidad(valor: number) {
  return Number(valor.toFixed(2))
}

function obtenerPasoRapido(unidad: string) {
  const unidadNormalizada =
    unidad.toLowerCase()

  if (
    unidadNormalizada === 'u.' ||
    unidadNormalizada === 'u' ||
    unidadNormalizada === 'unidad' ||
    unidadNormalizada === 'lata' ||
    unidadNormalizada === 'paquete' ||
    unidadNormalizada === 'comida'
  ) {
    return 1
  }

  if (
    unidadNormalizada === 'kg' ||
    unidadNormalizada === 'l'
  ) {
    return 0.5
  }

  if (
    unidadNormalizada === 'g' ||
    unidadNormalizada === 'ml'
  ) {
    return 50
  }

  return 1
}

function etiquetaUbicacion(
  ubicacion: ItemInventarioType['ubicacion']
) {
  if (ubicacion === 'nevera') {
    return '🧊 Nevera'
  }

  if (ubicacion === 'congelador') {
    return '❄️ Congelador'
  }

  if (ubicacion === 'despensa') {
    return '🗄️ Despensa'
  }

  return '🛍️ Pendiente'
}

export default function ItemInventario({
  item,
  ultimo,
  editarItemInventario,
  eliminarItemInventario,
}: Props) {
  const [
    panelEdicionAbierto,
    setPanelEdicionAbierto,
  ] = useState(false)

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

  const pasoRapido =
    obtenerPasoRapido(
      item.unidad
    )

  const cambiarCantidadRapida = (
    cambio: number
  ) => {
    const nuevaCantidad =
      Math.max(
        0,
        redondearCantidad(
          item.cantidad + cambio
        )
      )

    editarItemInventario(
      item.id,
      {
        cantidad:
          nuevaCantidad,
      }
    )
  }

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
        redondearCantidad(
          item.cantidad -
            cantidadRestar
        )
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

  const volverAComprar = () => {
    editarItemInventario(
      item.id,
      {
        cantidad: 1,
        ubicacion: 'pendiente',
      }
    )
  }

  const normalizarNombre = () => {
    const nombreNormalizado =
      normalizarIngredienteRayku(
        item.nombre
      )

    if (!nombreNormalizado) {
      return
    }

    editarItemInventario(
      item.id,
      {
        nombre:
          nombreNormalizado,
      }
    )
  }

  return (
    <div
      style={{
        padding: '12px',
        borderBottom: !ultimo
          ? '1px solid var(--borde)'
          : 'none',
        opacity: agotado ? 0.82 : 1,
      }}
    >
      <div
        style={{
          background: agotado
            ? 'linear-gradient(135deg, #fff8ee, #fffafc)'
            : 'linear-gradient(135deg, #fffafc, #fff7fb 45%, #f8f1ff)',
          border:
            agotado
              ? '1.5px solid #ffcc80'
              : '1.5px solid #f5c8d8',
          borderRadius: 22,
          padding: 14,
          boxShadow:
            '0 10px 24px rgba(180, 120, 150, 0.08)',
          display: 'grid',
          gap: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              display: 'grid',
              placeItems: 'center',
              background:
                'linear-gradient(135deg, #ffe4ec, #fff8ee)',
              border:
                '1.5px solid #f5c8d8',
              fontSize: 28,
              flexShrink: 0,
            }}
          >
            {emojiIngrediente(
              item.nombre
            )}
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <strong
              style={{
                display: 'block',
                fontSize: 18,
                color:
                  agotado
                    ? '#a07030'
                    : '#6f3f58',
                textDecoration:
                  agotado
                    ? 'line-through'
                    : 'none',
                marginBottom: 7,
              }}
            >
              {item.nombre}
            </strong>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
              }}
            >
              <span
                className={
                  agotado
                    ? 'pill pill-naranja'
                    : 'pill pill-rosa'
                }
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  padding:
                    '5px 9px',
                }}
              >
                📦 {item.cantidad}
                {item.unidad}
              </span>

              <span
                className={`pill ${claseIngrediente(
                  item.nombre
                )}`}
                style={{
                  fontSize: 11,
                  padding:
                    '5px 9px',
                }}
              >
                {etiquetaUbicacion(
                  item.ubicacion
                )}
              </span>

              {item.avisarStockBajo && (
                <span className="pill pill-malva">
                  🔔 Aviso stock
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
                    fontSize: 11,
                    padding:
                      '5px 9px',
                  }}
                >
                  {estado.texto}
                </span>
              )}
            </div>
          </div>
        </div>

        {item.fechaCaducidad && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--txt2)',
              fontWeight: 700,
              background:
                'rgba(255,255,255,0.7)',
              border:
                '1px solid #f5dde8',
              borderRadius: 12,
              padding: '7px 10px',
            }}
          >
            📅 Caduca:{' '}
            {item.fechaCaducidad}
          </div>
        )}

        {agotado ? (
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              background:
                'rgba(255, 255, 255, 0.72)',
              border:
                '1.5px solid #ffcc80',
              borderRadius: 18,
              padding: 10,
            }}
          >
            <button
              type="button"
              className="btn-secundario"
              onClick={volverAComprar}
            >
              🔁 Volver a comprar
            </button>

            <button
              type="button"
              className="btn-secundario"
              onClick={() =>
                eliminarItemInventario(
                  item.id
                )
              }
            >
              🗑️ Borrar definitivamente
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'auto 1fr auto',
              gap: 8,
              alignItems: 'center',
              background:
                'rgba(255, 255, 255, 0.72)',
              border:
                '1.5px solid #f5dde8',
              borderRadius: 18,
              padding: 8,
            }}
          >
            <button
              type="button"
              className="btn-secundario"
              onClick={() =>
                cambiarCantidadRapida(
                  -pasoRapido
                )
              }
              disabled={
                item.cantidad <= 0
              }
              style={{
                minHeight: 40,
                fontSize: 13,
                padding:
                  '8px 12px',
                opacity:
                  item.cantidad <= 0
                    ? 0.45
                    : 1,
              }}
            >
              − {pasoRapido}
            </button>

            <div
              style={{
                textAlign: 'center',
                fontWeight: 900,
                color: '#9b3f68',
                fontSize: 16,
              }}
            >
              {item.cantidad}
              {item.unidad}
            </div>

            <button
              type="button"
              className="btn-secundario"
              onClick={() =>
                cambiarCantidadRapida(
                  pasoRapido
                )
              }
              style={{
                minHeight: 40,
                fontSize: 13,
                padding:
                  '8px 12px',
              }}
            >
              + {pasoRapido}
            </button>
          </div>
        )}

        {!agotado && (
          <button
            type="button"
            className="btn-secundario"
            onClick={() =>
              setPanelEdicionAbierto(
                !panelEdicionAbierto
              )
            }
            style={{
              justifySelf: 'start',
              minHeight: 34,
              fontSize: 12,
              padding: '7px 12px',
            }}
          >
            {panelEdicionAbierto
              ? '🌸 Ocultar ajustes'
              : '⚙️ Editar ajustes'}
          </button>
        )}

        {!agotado && panelEdicionAbierto && (
          <div
            style={{
              display: 'grid',
              gap: 10,
              background:
                'rgba(255,255,255,0.72)',
              border:
                '1px solid #f5dde8',
              borderRadius: 18,
              padding: 10,
            }}
          >
            <div
              style={{
                display: 'grid',
                gap: 6,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--txt2)',
                }}
              >
                🏷️ Nombre del producto
              </label>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <input
                  type="text"
                  value={item.nombre}
                  onChange={(e) =>
                    editarItemInventario(
                      item.id,
                      {
                        nombre:
                          e.target.value,
                      }
                    )
                  }
                  style={{
                    flex: 1,
                    minWidth: 180,
                  }}
                />

                <button
                  type="button"
                  className="btn-secundario"
                  onClick={normalizarNombre}
                >
                  ✨ Normalizar
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 90px 100px',
                gap: 8,
              }}
            >
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
              >
                <option value="comida">
                  comida
                </option>
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
            </div>

            <div
              style={{
                display: 'grid',
                gap: 6,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--txt2)',
                }}
              >
                📅 Fecha de caducidad
              </label>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <input
                  type="date"
                  value={
                    item.fechaCaducidad || ''
                  }
                  onChange={(e) =>
                    editarItemInventario(
                      item.id,
                      {
                        fechaCaducidad:
                          e.target.value || null,
                      }
                    )
                  }
                />

                {item.fechaCaducidad && (
                  <button
                    type="button"
                    className="btn-secundario"
                    onClick={() =>
                      editarItemInventario(
                        item.id,
                        {
                          fechaCaducidad:
                            null,
                        }
                      )
                    }
                  >
                    ❌ Quitar fecha
                  </button>
                )}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() =>
                  editarItemInventario(
                    item.id,
                    {
                      avisarStockBajo:
                        !item.avisarStockBajo,
                    }
                  )
                }
                className="btn-secundario"
              >
                {item.avisarStockBajo
                  ? '🔔 Aviso stock activado'
                  : '🔕 No avisar stock'}
              </button>

              <button
                type="button"
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
              >
                {item.necesitaDescongelar
                  ? '❄️ Descongelar activado'
                  : '⬜ Sin aviso descongelar'}
              </button>

              <button
                type="button"
                onClick={() =>
                  setConsumoActivo(
                    !consumoActivo
                  )
                }
                className="btn-secundario"
              >
                ✏️ Ajustar cantidad exacta
              </button>

              <button
                type="button"
                onClick={() =>
                  eliminarItemInventario(
                    item.id
                  )
                }
                className="btn-secundario"
              >
                🗑️ Eliminar
              </button>
            </div>

            {consumoActivo && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  background:
                    'linear-gradient(135deg, #fff8fb, #fffaf8)',
                  border:
                    '1.5px solid #f5dde8',
                  borderRadius: 16,
                  padding: 10,
                }}
              >
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  placeholder="Cantidad usada"
                  value={
                    cantidadConsumida
                  }
                  onChange={(e) =>
                    setCantidadConsumida(
                      e.target.value
                    )
                  }
                />

                <span className="pill pill-rosa">
                  {item.unidad}
                </span>

                <button
                  className="btn-principal"
                  onClick={
                    consumirProducto
                  }
                >
                  💕 Aplicar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}