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
} from '../lib/generarListaCompra'

export default function Compra() {
  const {
    planning,
    recetas,
    inventario,
  } = useRaykuStore()

  const [
    comprados,
    setComprados,
  ] = useState<string[]>([])

  const ingredientes =
    useMemo(() => {
      return generarIngredientesCompra(
        planning,
        recetas
      )
    }, [planning, recetas])

  const agrupados =
    useMemo(() => {
      return agruparIngredientesCompra(
        ingredientes
      )
    }, [ingredientes])

  const toggleComprado =
    (
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
              i !==
              ingrediente
          )
        )
      } else {
        setComprados([
          ...comprados,
          ingrediente,
        ])
      }
    }

  const limpiarTodo =
    () => {
      setComprados([])
    }

  const TITULOS: Record<
    string,
    string
  > = {
    proteina:
      '🥩 Proteínas',

    carbohidrato:
      '🍚 Carbohidratos',

    grasa: '🧈 Grasas',

    salsa: '🥣 Salsas',

    verdura:
      '🥦 Verduras',

    fruta: '🍓 Frutas',

    otros: '✨ Otros',
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

          flexWrap:
            'wrap',

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
            Lista automática
            desde tu
            planning 💕
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
        }}
      >
        <strong>
          🛍️ Total
          ingredientes:
        </strong>{' '}
        {
          ingredientes.length
        }
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
            ingredientes en
            el planning 💕
          </p>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gap: '18px',
        }}
      >
        {Object.entries(
          agrupados
        ).map(
          ([
            categoria,
            items,
          ]) => (
            <div
              key={categoria}
              className="card"
            >
              <h2
                style={{
                  marginBottom:
                    '14px',
                }}
              >
                {
                  TITULOS[
                    categoria
                  ] ||
                  '✨ Otros'
                }
              </h2>

              <div
                style={{
                  display:
                    'grid',

                  gap: '10px',
                }}
              >
                {items.map(
                  (
                    item
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

                    return (
                      <div
                        key={
                          item.nombre
                        }
                        style={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          justifyContent:
                            'space-between',

                          gap: '10px',

                          flexWrap:
                            'wrap',

                          background:
                            '#fffaf8',

                          border:
                            '1.5px solid #f5dde8',

                          borderRadius:
                            '14px',

                          padding:
                            '10px 12px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            toggleComprado(
                              item.nombre
                            )
                          }
                          className={`pill ${claseIngrediente(
                            item.nombre
                          )}`}
                          style={{
                            opacity:
                              comprado
                                ? 0.45
                                : 1,

                            textDecoration:
                              comprado
                                ? 'line-through'
                                : 'none',

                            cursor:
                              'pointer',

                            border:
                              comprado
                                ? '2px solid #9e9e9e'
                                : undefined,
                          }}
                        >
                          {comprado
                            ? '✅'
                            : emojiIngrediente(
                                item.nombre
                              )}{' '}
                          {
                            item.nombre
                          }

                          {item.veces >
                            1 && (
                            <span>
                              {' '}
                              x
                              {
                                item.veces
                              }
                            </span>
                          )}
                        </button>

                        <div
                          style={{
                            display:
                              'flex',

                            gap: '8px',

                            flexWrap:
                              'wrap',
                          }}
                        >
                          {yaTienes && (
                            <span className="pill pill-verde">
                              📦
                              Tienes{' '}
                              {
                                cantidad
                              }
                            </span>
                          )}

                          {!comprado && (
                            <span className="pill pill-rosa">
                              🛒
                              Puedes
                              comprar
                              más
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}