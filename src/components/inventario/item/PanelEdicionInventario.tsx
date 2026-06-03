import type {
  ItemInventario as ItemInventarioType,
} from '../../../store'

type Props = {
  item: ItemInventarioType
  consumoActivo: boolean
  cantidadConsumida: string
  setConsumoActivo: (valor: boolean) => void
  setCantidadConsumida: (valor: string) => void
  editarItemInventario: (
    id: string,
    data: Partial<ItemInventarioType>
  ) => void
  eliminarItemInventario: (id: string) => void
  onNormalizarNombre: () => void
  onConsumirProducto: () => void
}

export default function PanelEdicionInventario({
  item,
  consumoActivo,
  cantidadConsumida,
  setConsumoActivo,
  setCantidadConsumida,
  editarItemInventario,
  eliminarItemInventario,
  onNormalizarNombre,
  onConsumirProducto,
}: Props) {
  return (
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
            onClick={onNormalizarNombre}
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
          <option value="g">g</option>
          <option value="kg">kg</option>
          <option value="ml">ml</option>
          <option value="l">l</option>
          <option value="u.">u.</option>
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
            value={cantidadConsumida}
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
            onClick={onConsumirProducto}
          >
            💕 Aplicar
          </button>
        </div>
      )}
    </div>
  )
}