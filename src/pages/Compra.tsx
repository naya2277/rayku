import { useMemo, useState } from 'react'

import { useRaykuStore } from '../store'

import {
  emojiIngrediente,
  claseIngrediente,
} from '../lib/ingredientes'

import {
  generarIngredientesCompra,
  agruparIngredientesCompra,
  ingredienteEnInventario,
  cantidadesInventario,
  separarIngredientesPorInventario,
  type IngredienteCompra,
} from '../lib/generarListaCompra'

const TITULOS: Record<string, string> = {
  proteina: '🥩 Proteínas',
  carbohidrato: '🍚 Carbohidratos',
  grasa: '🧈 Grasas',
  salsa: '🥣 Salsas',
  verdura: '🥦 Verduras',
  fruta: '🍓 Frutas',
  otros: '✨ Otros',
}

export default function Compra() {
  const {
    planning,
    recetas,
    inventario,
  } = useRaykuStore()

  const [comprados, setComprados] =
    useState<string[]>([])

  const ingredientes = useMemo(() => {
    return generarIngredientesCompra(
      planning,
      recetas
    )
  }, [planning, recetas])

  const {
    paraComprar,
    yaDisponibles,
  } = useMemo(() => {
    return separarIngredientesPorInventario(
      ingredientes,
      inventario
    )
  }, [ingredientes, inventario])

  const agrupadosComprar =
    useMemo(() => {
      return agruparIngredientesCompra(
        paraComprar
      )
    }, [paraComprar])

  const agrupadosDisponibles =
    useMemo(() => {
      return agruparIngredientesCompra(
        yaDisponibles
      )
    }, [yaDisponibles])

  const toggleComprado = (
    ingrediente: string
  ) => {
    if (
      comprados.includes(
        ingrediente
      )
    ) {
      setComprados(
        comprados.filter(
          (i) =>
            i !== ingrediente
        )
      )
    } else {
      setComprados([
        ...comprados,
        ingrediente,
      ])
    }
  }

  const limpiarTodo = () => {
    setComprados([])
  }

  const renderCantidad = (
    item: IngredienteCompra
  ) => {
    if (
      item.cantidad === null ||
      !item.unidad
    ) {
      return null
    }

    return (
      <span className="pill pill-rosa">
        📏 {item.cantidad}
        {item.unidad}
      </span>
    )
  }

  const renderFaltante = (
    item: IngredienteCompra
  ) => {
    if (
      item.cantidadFaltante ===
        null ||
      !item.unidad
    ) {
      return null
    }

    if (
      item.cantidadFaltante <= 0
    ) {
      return (
        <span className="pill pill-verde">
          ✅ Completo
        </span>
      )
    }

    return (
      <span className="pill pill-naranja">
        ⚠️ Faltan{' '}
        {item.cantidadFaltante}
        {item.unidad}
      </span>
    )
  }

  const renderDisponible = (
    item: IngredienteCompra
  ) => {
    if (
      item.cantidadDisponible ===
        null ||
      !item.unidad
    ) {
      return null
    }

    return (
      <span className="pill pill-verde">
        📦 Tienes{' '}
        {
          item.cantidadDisponible
        }
        {item.unidad}
      </span>
    )
  }

  const renderItem = (
    item: IngredienteCompra,
    modo:
      | 'comprar'
      | 'disponible'
  ) => {
    const comprado =
      comprados.includes(
        item.nombre
      )

    const yaTienes =
      ingredienteEnInventario(
        item.nombre,
        inventario
      )

    const cantidad =
      cantidadesInventario(
        item.nombre,
        inventario
      )

    const esDisponible =
      modo === 'disponible'

    return (
      <div
        key={item.nombre}
        style={{
          display: 'flex',
          alignItems:
            'center',
          justifyContent:
            'space-between',
          gap: '10px',
          flexWrap: 'wrap',
          background:
            esDisponible
              ? '#f7fff8'
              : '#fffaf8',
          border:
            esDisponible
              ? '1.5px solid #cfead2'
              : '1.5px solid #f5dde8',
          borderRadius:
            '14px',
          padding:
            '10px 12px',
          opacity:
            esDisponible
              ? 0.9
              : 1,
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (
              !esDisponible
            ) {
              toggleComprado(
                item.nombre
              )
            }
          }}
          className={`pill ${claseIngrediente(
            item.nombre
          )}`}
          style={{
            opacity: comprado
              ? 0.45
              : 1,

            textDecoration:
              comprado
                ? 'line-through'
                : 'none',

            cursor:
              esDisponible
                ? 'default'
                : 'pointer',

            border: comprado
              ? '2px solid #9e9e9e'
              : undefined,

            fontSize: 15,
            padding:
              '10px 14px',
          }}
        >
          {esDisponible
            ? '📦'
            : comprado
              ? '✅'
              : emojiIngrediente(
                  item.nombre
                )}{' '}
          {item.nombre}

          {item.veces > 1 && (
            <span>
              {' '}
              x{item.veces}
            </span>
          )}
        </button>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {renderCantidad(item)}

          {renderDisponible(
            item
          )}

          {renderFaltante(item)}

          {yaTienes &&
            item.cantidad ===
              null && (
              <span className="pill pill-verde">
                📦 Tienes{' '}
                {cantidad}
              </span>
            )}

          {!esDisponible &&
            !comprado && (
              <span className="pill pill-rosa">
                🛒 Comprar
              </span>
            )}

          {comprado && (
            <span className="pill pill-verde">
              ✅ Comprado
            </span>
          )}
        </div>
      </div>
    )
  }

  const renderGrupo = (
    titulo: string,
    grupos: Record<
      string,
      IngredienteCompra[]
    >,
    modo:
      | 'comprar'
      | 'disponible'
  ) => {
    const entradas =
      Object.entries(grupos)

    if (
      entradas.length === 0
    ) {
      return (
        <div className="card">
          <p
            style={{
              color:
                '#9e7d90',
            }}
          >
            {modo ===
            'comprar'
              ? 'No hay nada pendiente para comprar 💕'
              : 'No hay ingredientes cubiertos por inventario todavía 📦'}
          </p>
        </div>
      )
    }

    return (
      <div
        style={{
          display: 'grid',
          gap: '18px',
        }}
      >
        {entradas.map(
          ([
            categoria,
            items,
          ]) => (
            <div
              key={`${titulo}-${categoria}`}
              className="card"
            >
              <h2
                style={{
                  marginBottom:
                    '14px',
                }}
              >
                {TITULOS[
                  categoria
                ] || '✨ Otros'}
              </h2>

              <div
                style={{
                  display:
                    'grid',
                  gap: '10px',
                }}
              >
                {items.map(
                  (item) =>
                    renderItem(
                      item,
                      modo
                    )
                )}
              </div>
            </div>
          )
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems:
            'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom:
            '20px',
        }}
      >
        <div>
          <h1>
            🛒 Compra
          </h1>

          <p
            style={{
              color:
                '#9e7d90',
            }}
          >
            Lista inteligente
            desde tu planning
            💕
          </p>
        </div>

        <button
          className="btn-secundario"
          onClick={
            limpiarTodo
          }
        >
          🧹 Limpiar
          checks
        </button>
      </div>

      <div
        className="card"
        style={{
          marginBottom: 20,
          background:
            'linear-gradient(135deg, #ffe4ec 0%, #f6e9ff 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems:
              'center',
          }}
        >
          <span className="pill pill-rosa">
            🛍️ Total:{' '}
            {
              ingredientes.length
            }
          </span>

          <span className="pill pill-naranja">
            🛒 Comprar:{' '}
            {
              paraComprar.length
            }
          </span>

          <span className="pill pill-verde">
            📦 Ya tienes:{' '}
            {
              yaDisponibles.length
            }
          </span>
        </div>
      </div>

      {ingredientes.length ===
        0 && (
        <div className="card">
          <p
            style={{
              color:
                '#9e7d90',
            }}
          >
            Aún no hay
            ingredientes en el
            planning 💕
          </p>
        </div>
      )}

      {ingredientes.length >
        0 && (
        <div
          style={{
            display: 'grid',
            gap: 22,
          }}
        >
          <section>
            <h2
              style={{
                marginBottom: 14,
                color:
                  '#c45b86',
              }}
            >
              🛒 Necesitas
              comprar
            </h2>

            {renderGrupo(
              'comprar',
              agrupadosComprar,
              'comprar'
            )}
          </section>

          <section>
            <h2
              style={{
                marginBottom: 14,
                color:
                  '#8f7080',
              }}
            >
              📦 Ya tienes
              en inventario
            </h2>

            {renderGrupo(
              'disponible',
              agrupadosDisponibles,
              'disponible'
            )}
          </section>
        </div>
      )}
    </div>
  )
}