import { useState } from 'react'

type Props = {
  onAgregar: (item: {
    id: string
    nombre: string
    cantidad: number | null
    unidad: string | null
  }) => void
}

export default function FormularioCompraManual({
  onAgregar,
}: Props) {
  const [nombre, setNombre] =
    useState('')

  const [cantidad, setCantidad] =
    useState('')

  const [unidad, setUnidad] =
    useState('')

  const agregar = () => {
    const nombreLimpio =
      nombre.trim()

    if (!nombreLimpio) {
      return
    }

    onAgregar({
      id: '',
      nombre: nombreLimpio,
      cantidad:
        cantidad.trim()
          ? Number(cantidad) || null
          : null,
      unidad:
        unidad.trim() || null,
    })

    setNombre('')
    setCantidad('')
    setUnidad('')
  }

  return (
    <div
      className="card"
      style={{
        marginBottom: 20,
        background:
          'linear-gradient(135deg, #ffe4ec 0%, #f6e9ff 100%)',
      }}
    >
      <h2
        style={{
          marginBottom: 12,
          color: '#c45b86',
        }}
      >
        ➕ Añadir al súper
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(180px, 1fr) 110px 110px auto',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <input
          placeholder="Producto..."
          value={nombre}
          onChange={(e) =>
            setNombre(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              agregar()
            }
          }}
        />

        <input
          placeholder="Cantidad"
          type="number"
          min={0}
          value={cantidad}
          onChange={(e) =>
            setCantidad(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              agregar()
            }
          }}
        />

        <input
          placeholder="Unidad"
          value={unidad}
          onChange={(e) =>
            setUnidad(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              agregar()
            }
          }}
        />

        <button
          className="btn-principal"
          onClick={agregar}
        >
          Añadir
        </button>
      </div>
    </div>
  )
}