import { useState } from 'react'
import { useRaykuStore } from '../store'
import {
  emojiIngrediente,
  claseIngrediente,
  detectarCategoriaIngrediente,
} from '../lib/ingredientes'

type Ubicacion = 'nevera' | 'congelador' | 'despensa'

const SECCIONES: { key: Ubicacion; emoji: string; label: string; color: string }[] = [
  { key: 'nevera', emoji: '🧊', label: 'Nevera', color: '#e0f7f4' },
  { key: 'congelador', emoji: '❄️', label: 'Congelador', color: '#ede7f6' },
  { key: 'despensa', emoji: '🗄️', label: 'Despensa', color: '#fff8ee' },
]

const CATEGORIAS = [
  { value: 'proteina', label: '🥩 Proteína' },
  { value: 'carbohidrato', label: '🍚 Carbohidrato' },
  { value: 'grasa', label: '🧈 Grasa' },
  { value: 'salsa', label: '🥣 Salsa' },
  { value: 'verdura', label: '🥦 Verdura' },
  { value: 'fruta', label: '🍓 Fruta' },
  { value: 'otros', label: '✨ Otros' },
]

export default function Inventario() {
  const {
    inventario,
    agregarItemInventario,
    editarItemInventario,
    eliminarItemInventario,
  } = useRaykuStore()

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [ubicacionForm, setUbicacionForm] = useState<Ubicacion>('nevera')
  const [nombre, setNombre] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [unidad, setUnidad] = useState('g')
  const [categoria, setCategoria] = useState('otros')
  const [fechaCaducidad, setFechaCaducidad] = useState('')
  const [necesitaDescongelar, setNecesitaDescongelar] = useState(false)

  const guardar = () => {
    if (!nombre.trim()) return

    agregarItemInventario({
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      cantidad: parseFloat(cantidad) || 1,
      unidad,
      categoria,
      ubicacion: ubicacionForm,
      fechaCaducidad: fechaCaducidad || null,
      necesitaDescongelar,
    })

    setNombre('')
    setCantidad('')
    setUnidad('g')
    setCategoria('otros')
    setFechaCaducidad('')
    setNecesitaDescongelar(false)
    setMostrarFormulario(false)
  }

  const detectarCaducidad = (fecha: string | null) => {
    if (!fecha) return null

    const hoy = new Date()
    const caduca = new Date(fecha)
    const diff = Math.ceil(
      (caduca.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diff < 0) {
      return {
        texto: '🔴 Caducado',
        color: '#8b0000',
        fondo: '#ffe0e0',
      }
    }

    if (diff === 0) {
      return {
        texto: '🔴 Caduca hoy',
        color: '#8b0000',
        fondo: '#ffe0e0',
      }
    }

    if (diff <= 3) {
      return {
        texto: `🟠 Caduca en ${diff} día${diff === 1 ? '' : 's'}`,
        color: '#9a5a00',
        fondo: '#fff1d6',
      }
    }

    return {
      texto: '🟢 Bien',
      color: '#407040',
      fondo: '#f1f8e9',
    }
  }

  const proximosACaducar = inventario.filter((item) => {
    const estado = detectarCaducidad(item.fechaCaducidad)
    return estado?.texto.includes('🔴') || estado?.texto.includes('🟠')
  })

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1>📦 Inventario</h1>
          <p style={{ color: 'var(--txt2)', marginTop: '4px' }}>
            {inventario.length} productos guardados 💕
          </p>
        </div>

        <button
          className="btn-principal"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          ➕ Añadir producto
        </button>
      </div>

      {proximosACaducar.length > 0 && (
        <div
          className="notif-descongelar"
          style={{ background: '#fff3f3', borderColor: '#ffb3b3' }}
        >
          <span className="notif-ico">⚠️</span>
          <div>
            <div className="notif-titulo" style={{ color: '#8b0000' }}>
              Productos a revisar
            </div>

            {proximosACaducar.map((item) => (
              <div key={item.id} className="notif-sub" style={{ color: '#c00000' }}>
                {emojiIngrediente(item.nombre)} {item.nombre} —{' '}
                {detectarCaducidad(item.fechaCaducidad)?.texto}
              </div>
            ))}
          </div>
        </div>
      )}

      {mostrarFormulario && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '14px' }}>➕ Nuevo producto</h3>

          <div style={{ display: 'grid', gap: '12px' }}>
            <input
              placeholder="🏷️ Nombre del producto"
              value={nombre}
              onChange={(e) => {
                const valor = e.target.value
                setNombre(valor)

                if (valor.trim()) {
                  setCategoria(detectarCategoriaIngrediente(valor))
                }
              }}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
              }}
            >
              <input
                placeholder="Cantidad"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                style={{ appearance: 'textfield' }}
              />

              <select value={unidad} onChange={(e) => setUnidad(e.target.value)}>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
                <option value="u.">u.</option>
                <option value="paquete">paquete</option>
                <option value="lata">lata</option>
              </select>
            </div>

            <select
              value={ubicacionForm}
              onChange={(e) => setUbicacionForm(e.target.value as Ubicacion)}
            >
              <option value="nevera">🧊 Nevera</option>
              <option value="congelador">❄️ Congelador</option>
              <option value="despensa">🗄️ Despensa</option>
            </select>

            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {CATEGORIAS.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <div>
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'var(--txt2)',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                📅 Fecha de caducidad opcional
              </label>

              <input
                type="date"
                value={fechaCaducidad}
                onChange={(e) => setFechaCaducidad(e.target.value)}
              />
            </div>

            {ubicacionForm === 'congelador' && (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'var(--txt)',
                }}
              >
                <input
                  type="checkbox"
                  checked={necesitaDescongelar}
                  onChange={(e) => setNecesitaDescongelar(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                ❄️ Marcar para descongelar
              </label>
            )}

            <button className="btn-principal" onClick={guardar}>
              💕 Guardar producto
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '20px' }}>
        {SECCIONES.map(({ key, emoji, label, color }) => {
          const items = inventario.filter((i) => i.ubicacion === key)

          return (
            <div key={key}>
              <div
                style={{
                  background: color,
                  borderRadius: '16px 16px 0 0',
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1.5px solid var(--borde)',
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
                  {emoji} {label}
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
                  border: '1.5px solid var(--borde)',
                  borderTop: 'none',
                  borderRadius: '0 0 16px 16px',
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
                    const estado = detectarCaducidad(item.fechaCaducidad)

                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: '12px',
                          padding: '12px 18px',
                          borderBottom:
                            idx < items.length - 1
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
                            <span className={`pill ${claseIngrediente(item.nombre)}`}>
                              {emojiIngrediente(item.nombre)} {item.nombre}
                            </span>

                            {item.necesitaDescongelar && (
                              <span className="pill pill-teal">❄️ Descongelar</span>
                            )}

                            {estado && (
                              <span
                                className="pill"
                                style={{
                                  background: estado.fondo,
                                  color: estado.color,
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
                              Caduca: {item.fechaCaducidad}
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.1"
                            value={item.cantidad}
                            onChange={(e) =>
                              editarItemInventario(item.id, {
                                cantidad: parseFloat(e.target.value) || 0,
                              })
                            }
                            style={{
                              width: '76px',
                              appearance: 'textfield',
                              textAlign: 'center',
                            }}
                          />

                          <select
                            value={item.unidad}
                            onChange={(e) =>
                              editarItemInventario(item.id, {
                                unidad: e.target.value,
                              })
                            }
                            style={{ width: '95px' }}
                          >
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                            <option value="l">l</option>
                            <option value="u.">u.</option>
                            <option value="paquete">paquete</option>
                            <option value="lata">lata</option>
                          </select>

                          <button
                            onClick={() =>
                              editarItemInventario(item.id, {
                                necesitaDescongelar: !item.necesitaDescongelar,
                              })
                            }
                            className="btn-secundario"
                            title="Marcar/desmarcar descongelar"
                          >
                            {item.necesitaDescongelar ? '❄️' : '⬜'}
                          </button>

                          <button
                            onClick={() => eliminarItemInventario(item.id)}
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
        })}
      </div>
    </div>
  )
}