import { useState } from 'react'

import type { ItemInventario } from '../../store'

import {
  detectarCategoriaIngrediente,
} from '../../lib/ingredientes'

import {
  CATEGORIAS_INVENTARIO,
  type UbicacionInventario,
} from '../../lib/inventario'

type Props = {
  agregarItemInventario: (
    item: ItemInventario
  ) => void

  cerrarFormulario: () => void
}

export default function FormularioInventario({
  agregarItemInventario,
  cerrarFormulario,
}: Props) {
  const [
    ubicacionForm,
    setUbicacionForm,
  ] =
    useState<UbicacionInventario>(
      'nevera'
    )

  const [nombre, setNombre] =
    useState('')

  const [
    cantidad,
    setCantidad,
  ] = useState('')

  const [unidad, setUnidad] =
    useState('comida')

  const [
    categoria,
    setCategoria,
  ] = useState('otros')

  const [
    fechaCaducidad,
    setFechaCaducidad,
  ] = useState('')

  const [
    necesitaDescongelar,
    setNecesitaDescongelar,
  ] = useState(false)

  const [
    avisarStockBajo,
    setAvisarStockBajo,
  ] = useState(false)

  const guardar = () => {
    if (!nombre.trim()) return

    const cantidadLimpia =
      parseFloat(cantidad)

    agregarItemInventario({
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      cantidad:
        Number.isFinite(cantidadLimpia)
          ? cantidadLimpia
          : 1,
      unidad:
        cantidad.trim()
          ? unidad
          : 'comida',
      categoria,
      ubicacion: ubicacionForm,
      fechaCaducidad:
        fechaCaducidad || null,
      necesitaDescongelar,
      avisarStockBajo,
    })

    cerrarFormulario()
  }

  return (
    <div
      className="card"
      style={{
        marginBottom: '20px',
      }}
    >
      <h3
        style={{
          marginBottom: '14px',
        }}
      >
        ➕ Nuevo producto
      </h3>

      <div
        style={{
          display: 'grid',
          gap: '12px',
        }}
      >
        <input
          placeholder="🏷️ Nombre del producto"
          value={nombre}
          onChange={(e) => {
            const valor =
              e.target.value

            setNombre(valor)

            if (valor.trim()) {
              setCategoria(
                detectarCategoriaIngrediente(
                  valor
                )
              )
            }
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '1fr 1fr',
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
            onChange={(e) =>
              setCantidad(
                e.target.value
              )
            }
            style={{
              appearance: 'textfield',
            }}
          />

          <select
            value={unidad}
            onChange={(e) =>
              setUnidad(e.target.value)
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

        <p
          style={{
            color: '#9e7d90',
            fontSize: 12,
            fontWeight: 800,
            margin: 0,
          }}
        >
          Si no pones cantidad, Rayku lo guardará como 1 comida.
        </p>

        <select
          value={ubicacionForm}
          onChange={(e) =>
            setUbicacionForm(
              e.target
                .value as UbicacionInventario
            )
          }
        >
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

        <select
          value={categoria}
          onChange={(e) =>
            setCategoria(
              e.target.value
            )
          }
        >
          {CATEGORIAS_INVENTARIO.map(
            (cat) => (
              <option
                key={cat.value}
                value={cat.value}
              >
                {cat.label}
              </option>
            )
          )}
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
            📅 Fecha de caducidad
            opcional
          </label>

          <input
            type="date"
            value={fechaCaducidad}
            onChange={(e) =>
              setFechaCaducidad(
                e.target.value
              )
            }
          />
        </div>

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
            checked={avisarStockBajo}
            onChange={(e) =>
              setAvisarStockBajo(
                e.target.checked
              )
            }
            style={{
              width: 'auto',
            }}
          />
          🔔 Avisar cuando quede poco
        </label>

        {ubicacionForm ===
          'congelador' && (
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
              checked={
                necesitaDescongelar
              }
              onChange={(e) =>
                setNecesitaDescongelar(
                  e.target.checked
                )
              }
              style={{
                width: 'auto',
              }}
            />
            ❄️ Marcar para
            descongelar
          </label>
        )}

        <button
          className="btn-principal"
          onClick={guardar}
        >
          💕 Guardar producto
        </button>
      </div>
    </div>
  )
}