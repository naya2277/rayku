import { useState } from 'react'

import { useRaykuStore } from '../store'

import {
  emojiIngrediente,
  detectarCategoriaIngrediente,
} from '../lib/ingredientes'

import {
  detectarCaducidad,
  calcularDiasCaducidad,
  detectarStockBajo,
  SECCIONES_INVENTARIO,
} from '../lib/inventario'

import FormularioInventario from '../components/inventario/FormularioInventario'
import SeccionInventario from '../components/inventario/SeccionInventario'

type FiltroInventario =
  | 'todos'
  | 'pendiente'
  | 'nevera'
  | 'congelador'
  | 'despensa'
  | 'stockBajo'
  | 'caducan'
  | 'proteina'
  | 'verdura'
  | 'grasa'
  | 'carbohidrato'
  | 'salsa'
  | 'fruta'
  | 'otros'

const FILTROS: {
  key: FiltroInventario
  label: string
}[] = [
  {
    key: 'todos',
    label: '🌸 Todos',
  },
  {
    key: 'pendiente',
    label: '🛍️ Pendiente',
  },
  {
    key: 'nevera',
    label: '🧊 Nevera',
  },
  {
    key: 'congelador',
    label: '❄️ Congelador',
  },
  {
    key: 'despensa',
    label: '🗄️ Despensa',
  },
  {
    key: 'stockBajo',
    label: '🧺 Poco stock',
  },
  {
    key: 'caducan',
    label: '⚠️ Caducan',
  },
  {
    key: 'proteina',
    label: '🥩 Proteína',
  },
  {
    key: 'verdura',
    label: '🥦 Verdura',
  },
  {
    key: 'grasa',
    label: '🧈 Grasa',
  },
  {
    key: 'carbohidrato',
    label: '🍚 Carbohidrato',
  },
  {
    key: 'salsa',
    label: '🥣 Salsa',
  },
  {
    key: 'fruta',
    label: '🍓 Fruta',
  },
  {
    key: 'otros',
    label: '✨ Otros',
  },
]

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

  const [
    busqueda,
    setBusqueda,
  ] = useState('')

  const [
    filtroActivo,
    setFiltroActivo,
  ] = useState<FiltroInventario>('todos')

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

  const productosStockBajo =
    inventario
      .filter((item) => {
        if (
          item.ubicacion ===
          'pendiente'
        ) {
          return false
        }

        return Boolean(
          detectarStockBajo(
            item.cantidad,
            item.unidad
          )
        )
      })
      .sort((a, b) => {
        if (
          a.cantidad !== b.cantidad
        ) {
          return (
            a.cantidad - b.cantidad
          )
        }

        return a.nombre.localeCompare(
          b.nombre,
          'es',
          {
            sensitivity: 'base',
          }
        )
      })

  const hayFiltrosActivos =
    filtroActivo !== 'todos' ||
    busqueda.trim() !== ''

  const limpiarFiltros = () => {
    setFiltroActivo('todos')
    setBusqueda('')
  }

  const coincideFiltro = (
    item: typeof inventario[number]
  ) => {
    if (filtroActivo === 'todos') {
      return true
    }

    if (
      [
        'pendiente',
        'nevera',
        'congelador',
        'despensa',
      ].includes(filtroActivo)
    ) {
      return item.ubicacion === filtroActivo
    }

    if (filtroActivo === 'stockBajo') {
      return (
        item.ubicacion !== 'pendiente' &&
        Boolean(
          detectarStockBajo(
            item.cantidad,
            item.unidad
          )
        )
      )
    }

    if (filtroActivo === 'caducan') {
      const dias =
        calcularDiasCaducidad(
          item.fechaCaducidad
        )

      return (
        item.ubicacion !== 'pendiente' &&
        dias !== null &&
        dias <= 3
      )
    }

    return (
      detectarCategoriaIngrediente(
        item.nombre
      ) === filtroActivo
    )
  }

  const coincideBusqueda = (
    item: typeof inventario[number]
  ) => {
    const texto =
      [
        item.nombre,
        item.categoria,
        item.ubicacion,
        item.unidad,
      ]
        .join(' ')
        .toLowerCase()

    return texto.includes(
      busqueda
        .trim()
        .toLowerCase()
    )
  }

  const inventarioFiltrado =
    inventario.filter(
      (item) =>
        coincideFiltro(item) &&
        coincideBusqueda(item)
    )

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

      {productosStockBajo.length >
        0 && (
        <div
          className="card"
          style={{
            marginBottom: 18,
            background:
              'linear-gradient(135deg, #fff8ee, #f1f8e9)',
            borderColor: '#ffcc80',
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
              🧺
            </span>

            <div>
              <h2
                style={{
                  color: '#a07030',
                  fontSize: 18,
                }}
              >
                Queda poco
              </h2>

              <p
                style={{
                  color: 'var(--txt2)',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Productos que quizá
                conviene reponer
                pronto.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: 8,
            }}
          >
            {productosStockBajo.map(
              (item) => {
                const stock =
                  detectarStockBajo(
                    item.cantidad,
                    item.unidad
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

                    <span className="pill pill-naranja">
                      {stock?.texto}
                    </span>

                    <span className="pill pill-malva">
                      📍 {item.ubicacion}
                    </span>
                  </div>
                )
              }
            )}
          </div>
        </div>
      )}

      <div
        className="card"
        style={{
          marginBottom: 18,
          background:
            'linear-gradient(135deg, #fffaf8, #fff0f6)',
        }}
      >
        <input
          type="text"
          placeholder="🔎 Buscar producto..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(
              e.target.value
            )
          }
          style={{
            marginBottom: 12,
          }}
        />

        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {FILTROS.map((filtro) => (
            <button
              key={filtro.key}
              type="button"
              className={
                filtroActivo ===
                filtro.key
                  ? 'btn-principal'
                  : 'btn-secundario'
              }
              onClick={() =>
                setFiltroActivo(
                  filtro.key
                )
              }
              style={{
                minHeight: 34,
                fontSize: 12,
                padding:
                  '6px 10px',
              }}
            >
              {filtro.label}
            </button>
          ))}

          {hayFiltrosActivos && (
            <button
              type="button"
              className="btn-secundario"
              onClick={
                limpiarFiltros
              }
              style={{
                minHeight: 34,
                fontSize: 12,
                padding:
                  '6px 10px',
              }}
            >
              ✨ Limpiar
            </button>
          )}
        </div>

        {hayFiltrosActivos && (
          <p
            style={{
              marginTop: 10,
              color: 'var(--txt2)',
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Mostrando{' '}
            {inventarioFiltrado.length}{' '}
            de {inventario.length}{' '}
            productos
          </p>
        )}
      </div>

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
                inventarioFiltrado.filter(
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