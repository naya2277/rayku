import { useState } from 'react'

import { useRaykuStore } from '../store'

import {
  emojiIngrediente,
} from '../lib/ingredientes'

import {
  detectarCaducidad,
  SECCIONES_INVENTARIO,
} from '../lib/inventario'

import FormularioInventario from '../components/inventario/FormularioInventario'
import SeccionInventario from '../components/inventario/SeccionInventario'

export default function Inventario() {
  const {
    inventario,
    agregarItemInventario,
    editarItemInventario,
    eliminarItemInventario,
  } = useRaykuStore()

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false)

  const proximosACaducar =
    inventario.filter((item) => {
      const estado =
        detectarCaducidad(
          item.fechaCaducidad
        )

      return (
        estado?.texto.includes(
          '🔴'
        ) ||
        estado?.texto.includes(
          '🟠'
        )
      )
    })

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1>📦 Inventario</h1>

          <p
            style={{
              color: 'var(--txt2)',
              marginTop: '4px',
            }}
          >
            {inventario.length}{' '}
            productos guardados 💕
          </p>
        </div>

        <button
          className="btn-principal"
          onClick={() =>
            setMostrarFormulario(
              !mostrarFormulario
            )
          }
        >
          ➕ Añadir producto
        </button>
      </div>

      {proximosACaducar.length >
        0 && (
        <div
          className="notif-descongelar"
          style={{
            background: '#fff3f3',
            borderColor: '#ffb3b3',
          }}
        >
          <span className="notif-ico">
            ⚠️
          </span>

          <div>
            <div
              className="notif-titulo"
              style={{
                color: '#8b0000',
              }}
            >
              Productos a revisar
            </div>

            {proximosACaducar.map(
              (item) => (
                <div
                  key={item.id}
                  className="notif-sub"
                  style={{
                    color: '#c00000',
                  }}
                >
                  {emojiIngrediente(
                    item.nombre
                  )}{' '}
                  {item.nombre} —{' '}
                  {
                    detectarCaducidad(
                      item.fechaCaducidad
                    )?.texto
                  }
                </div>
              )
            )}
          </div>
        </div>
      )}

      {mostrarFormulario && (
        <FormularioInventario
          agregarItemInventario={
            agregarItemInventario
          }
          cerrarFormulario={() =>
            setMostrarFormulario(
              false
            )
          }
        />
      )}

      <div
        style={{
          display: 'grid',
          gap: '20px',
        }}
      >
        {SECCIONES_INVENTARIO.map(
          ({
            key,
            emoji,
            label,
            color,
          }) => {
            const items =
              inventario.filter(
                (i) =>
                  i.ubicacion === key
              )

            return (
              <SeccionInventario
                key={key}
                titulo={label}
                emoji={emoji}
                color={color}
                items={items}
                editarItemInventario={
                  editarItemInventario
                }
                eliminarItemInventario={
                  eliminarItemInventario
                }
              />
            )
          }
        )}
      </div>
    </div>
  )
}