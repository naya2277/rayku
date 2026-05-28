import { useState } from 'react'

import { useRaykuStore } from '../store'

import {
  emojiIngrediente,
} from '../lib/ingredientes'

import {
  detectarCaducidad,
  calcularDiasCaducidad,
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

  const ordenarPorNombre = <
    T extends {
      nombre: string
    },
  >(
    items: T[]
  ) =>
    [...items].sort((a, b) =>
      a.nombre.localeCompare(
        b.nombre,
        'es',
        {
          sensitivity: 'base',
        }
      )
    )

  const productosUrgentes =
    inventario
      .filter((item) => {
        if (
          item.ubicacion ===
          'pendiente'
        ) {
          return false
        }

        const dias =
          calcularDiasCaducidad(
            item.fechaCaducidad
          )

        return (
          dias !== null &&
          dias <= 3
        )
      })
      .sort((a, b) => {
        const diasA =
          calcularDiasCaducidad(
            a.fechaCaducidad
          ) ?? 999

        const diasB =
          calcularDiasCaducidad(
            b.fechaCaducidad
          ) ?? 999

        if (diasA !== diasB) {
          return diasA - diasB
        }

        return a.nombre.localeCompare(
          b.nombre,
          'es',
          {
            sensitivity: 'base',
          }
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

      {productosUrgentes.length >
        0 && (
        <div
          className="card"
          style={{
            marginBottom: 18,
            background:
              'linear-gradient(135deg, #fff0f6, #fff8ee)',
            borderColor: '#f4a7b9',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 24,
              }}
            >
              ⚠️
            </span>

            <div>
              <h2
                style={{
                  color: '#c45b86',
                  fontSize: 18,
                }}
              >
                Usa esto pronto
              </h2>

              <p
                style={{
                  color: 'var(--txt2)',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Productos que caducan
                pronto o ya necesitan
                revisión.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: 8,
            }}
          >
            {productosUrgentes.map(
              (item) => {
                const estado =
                  detectarCaducidad(
                    item.fechaCaducidad
                  )

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'space-between',
                      gap: 8,
                      flexWrap: 'wrap',
                      background:
                        'rgba(255,255,255,0.72)',
                      border:
                        '1px solid var(--borde)',
                      borderRadius: 14,
                      padding:
                        '9px 11px',
                    }}
                  >
                    <span
                      className="pill pill-rosa"
                      style={{
                        fontSize: 14,
                        padding:
                          '8px 12px',
                      }}
                    >
                      {emojiIngrediente(
                        item.nombre
                      )}{' '}
                      {item.nombre}
                    </span>

                    <span
                      className="pill"
                      style={{
                        background:
                          estado?.fondo,
                        color:
                          estado?.color,
                        border: `1px solid ${estado?.color}`,
                        fontSize: 12,
                        padding:
                          '6px 10px',
                      }}
                    >
                      {estado?.texto}
                    </span>

                    <span className="pill pill-malva">
                      📦 {item.cantidad}
                      {item.unidad}
                    </span>
                  </div>
                )
              }
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
              ordenarPorNombre(
                inventario.filter(
                  (i) =>
                    i.ubicacion === key
                )
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