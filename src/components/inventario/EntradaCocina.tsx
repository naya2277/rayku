import { useState } from 'react'
import { addDays, format, parseISO } from 'date-fns'
import type { ItemInventario, UbicacionInventario } from '../../store/types'

type Props = {
  pendientes: ItemInventario[]
  onGuardar: (id: string, data: Partial<ItemInventario>) => void
}

type Destino = Exclude<UbicacionInventario, 'pendiente'>

function fechaHoy() {
  return format(new Date(), 'yyyy-MM-dd')
}

function Entrada({ item, onGuardar }: {
  item: ItemInventario
  onGuardar: Props['onGuardar']
}) {
  const [ubicacion, setUbicacion] = useState<Destino>('nevera')
  const [cantidad, setCantidad] = useState(String(item.cantidad))
  const [caducidad, setCaducidad] = useState(item.fechaCaducidad ?? '')
  const [cocinado, setCocinado] = useState(item.esCocinado ?? false)
  const [fechaPreparacion, setFechaPreparacion] = useState(item.fechaPreparacion ?? fechaHoy())

  const sugerida = cocinado && ubicacion === 'nevera' && fechaPreparacion
    ? format(addDays(parseISO(fechaPreparacion), 2), 'yyyy-MM-dd')
    : null

  function guardar() {
    const numero = Number(cantidad)
    if (!Number.isFinite(numero) || numero <= 0) return
    onGuardar(item.id, {
      ubicacion,
      cantidad: numero,
      fechaCaducidad: caducidad || null,
      esCocinado: cocinado,
      fechaPreparacion: cocinado ? fechaPreparacion : null,
      fechaConsumoSugerida: sugerida,
    })
  }

  return (
    <div className="card" style={{ display: 'grid', gap: 10 }}>
      <strong>{item.nombre}</strong>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label>Ubicación
          <select value={ubicacion} onChange={e => setUbicacion(e.target.value as Destino)}>
            <option value="nevera">🧊 Nevera</option>
            <option value="congelador">❄️ Congelador</option>
            <option value="despensa">🗄️ Despensa</option>
          </select>
        </label>
        <label>Cantidad ({item.unidad})
          <input type="number" min="0.01" step="any" value={cantidad}
            onChange={e => setCantidad(e.target.value)} />
        </label>
      </div>
      <label>Fecha de caducidad (opcional)
        <input type="date" value={caducidad} onChange={e => setCaducidad(e.target.value)} />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" style={{ width: 'auto' }} checked={cocinado}
          onChange={e => setCocinado(e.target.checked)} />
        Ya está cocinado
      </label>
      {cocinado && (
        <label>Fecha de preparación
          <input type="date" value={fechaPreparacion}
            onChange={e => setFechaPreparacion(e.target.value)} />
        </label>
      )}
      {sugerida && (
        <p style={{ fontSize: 13, color: 'var(--txt2)' }}>
          💡 Recordatorio orientativo: consumir hacia el {sugerida}. No sustituye la
          fecha de caducidad ni garantiza la seguridad alimentaria.
        </p>
      )}
      <button type="button" className="btn-principal"
        disabled={!Number.isFinite(Number(cantidad)) || Number(cantidad) <= 0 || (cocinado && !fechaPreparacion)}
        onClick={guardar}>📦 Guardar en Cocina</button>
    </div>
  )
}

export default function EntradaCocina({ pendientes, onGuardar }: Props) {
  if (!pendientes.length) return null
  return (
    <section style={{ marginBottom: 20, display: 'grid', gap: 12 }}>
      <h2>🛍️ Por colocar ({pendientes.length})</h2>
      <p style={{ color: 'var(--txt2)', fontSize: 13 }}>
        Elige dónde guardar cada compra. Puedes corregir la cantidad y añadir fechas.
      </p>
      {pendientes.map(item => (
        <Entrada key={item.id} item={item} onGuardar={onGuardar} />
      ))}
    </section>
  )
}
