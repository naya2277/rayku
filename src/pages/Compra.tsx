import {
  useMemo,
  useState,
} from 'react'

import {
  endOfWeek,
  isWithinInterval,
  parseISO,
  startOfDay,
} from 'date-fns'

import { useRaykuStore } from '../store'

import {
  generarIngredientesCompra,
  agruparIngredientesCompra,
  separarIngredientesPorInventario,
  type IngredienteCompra,
} from '../lib/generarListaCompra'

import FormularioCompraManual from '../components/compra/FormularioCompraManual'
import ResumenCompra from '../components/compra/ResumenCompra'
import GrupoCompra from '../components/compra/GrupoCompra'
import ModoSupermercado from '../components/compra/ModoSupermercado'

function estaDesdeHoyHastaFinSemana(
  fecha: string
) {
  const hoy =
    startOfDay(new Date())

  const finSemana =
    endOfWeek(hoy, {
      weekStartsOn: 1,
    })

  const fechaPlanning =
    startOfDay(parseISO(fecha))

  return isWithinInterval(
    fechaPlanning,
    {
      start: hoy,
      end: finSemana,
    }
  )
}

export default function Compra() {
  const {
    planning,
    recetas,
    inventario,
    compraManual,
    agregarItemCompraManual,
    eliminarItemCompraManual,
    checksCompra,
    toggleCheckCompra,
    finalizarCompra,
  } = useRaykuStore()

  const [
    mostrarComprados,
    setMostrarComprados,
  ] = useState(false)

  const [
    modoSupermercado,
    setModoSupermercado,
  ] = useState(false)

  const planningDesdeHoy =
    useMemo(() => {
      return planning.filter(
        (item) =>
          estaDesdeHoyHastaFinSemana(
            item.fecha
          ) &&
          !item.cocinado
      )
    }, [planning])

  const ingredientes = useMemo(() => {
    return generarIngredientesCompra(
      planningDesdeHoy,
      recetas
    )
  }, [planningDesdeHoy, recetas])

  const itemsManualesComoCompra =
    useMemo<IngredienteCompra[]>(
      () =>
        compraManual.map(
          (item) => ({
            clave: `manual-${item.id}`,

            nombre:
              item.cantidad
                ? `${item.nombre} (${item.cantidad})`
                : item.nombre,

            veces: 1,

            cantidad: null,

            unidad: null,

            cantidadDisponible:
              null,

            cantidadFaltante:
              null,
          })
        ),
      [compraManual]
    )

  const ingredientesConManuales =
    useMemo(
      () => [
        ...ingredientes,
        ...itemsManualesComoCompra,
      ],
      [
        ingredientes,
        itemsManualesComoCompra,
      ]
    )

  const {
    paraComprar,
    yaDisponibles,
  } = useMemo(() => {
    return separarIngredientesPorInventario(
      ingredientesConManuales,
      inventario
    )
  }, [ingredientesConManuales, inventario])

  const esItemComprado = (
    item: IngredienteCompra
  ) => {
    const manual =
      compraManual.find(
        (manualItem) =>
          item.clave ===
          `manual-${manualItem.id}`
      )

    const idCheck =
      manual
        ? `manual-${manual.id}`
        : item.nombre

    return checksCompra.includes(
      idCheck
    )
  }

  const paraComprarVisibles =
    useMemo(() => {
      if (mostrarComprados) {
        return paraComprar
      }

      return paraComprar.filter(
        (item) =>
          !esItemComprado(item)
      )
    }, [
      paraComprar,
      mostrarComprados,
      checksCompra,
      compraManual,
    ])

  const compradosOcultos =
    paraComprar.length -
    paraComprarVisibles.length

  const agrupadosComprar =
    useMemo(() => {
      return agruparIngredientesCompra(
        paraComprarVisibles
      )
    }, [paraComprarVisibles])

  const agrupadosDisponibles =
    useMemo(() => {
      return agruparIngredientesCompra(
        yaDisponibles
      )
    }, [yaDisponibles])

  const totalCompra =
    paraComprarVisibles.length

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
            desde hoy hasta final
            de semana + extras
            manuales 💕
          </p>
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
            className={
              modoSupermercado
                ? 'btn-principal'
                : 'btn-secundario'
            }
            onClick={() =>
              setModoSupermercado(
                (actual) =>
                  !actual
              )
            }
          >
            {modoSupermercado
              ? '🛒 Vista normal'
              : '🛍️ Modo supermercado'}
          </button>

          <button
            type="button"
            className="btn-secundario"
            onClick={() =>
              setMostrarComprados(
                (actual) =>
                  !actual
              )
            }
          >
            {mostrarComprados
              ? '🙈 Ocultar comprados'
              : '👁️ Mostrar comprados'}
          </button>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginBottom: 18,
          background:
            'linear-gradient(135deg, #fffafc, #f7f0ff)',
          borderColor:
            '#f5dde8',
          color: '#8f7080',
          fontWeight: 800,
        }}
      >
        📅 Esta lista solo cuenta comidas y cenas
        pendientes desde hoy hasta final de semana.
        Las comidas ya cocinadas o de días anteriores
        no se incluyen.
      </div>

      {!modoSupermercado && (
        <FormularioCompraManual
          onAgregar={
            agregarItemCompraManual
          }
        />
      )}

      <ResumenCompra
        total={
          paraComprar.length +
          yaDisponibles.length
        }
        paraComprar={
          paraComprar.length
        }
        yaDisponibles={
          yaDisponibles.length
        }
        manuales={
          compraManual.length
        }
        comprados={
          checksCompra.length
        }
        onFinalizarCompra={
          finalizarCompra
        }
      />

      {modoSupermercado && (
        <div
          className="card"
          style={{
            marginBottom: 18,
            background:
              '#fffaf8',
            borderColor:
              '#f5dde8',
          }}
        >
          <p
            style={{
              color: '#8f7080',
              fontWeight: 800,
              marginBottom: 10,
            }}
          >
            🛍️ Modo supermercado:
            lista compacta por
            secciones, cantidades
            visibles y checks rápidos.
          </p>

          <button
            type="button"
            className="btn-secundario"
            onClick={() =>
              setModoSupermercado(
                false
              )
            }
          >
            ✍️ Añadir compra manual
          </button>
        </div>
      )}

      {compradosOcultos > 0 &&
        !mostrarComprados && (
          <div
            className="card"
            style={{
              marginBottom: 18,
              background:
                '#f7fff8',
              borderColor:
                '#cfead2',
              color:
                '#407040',
              fontWeight: 800,
              display: 'flex',
              justifyContent:
                'space-between',
              gap: 10,
              flexWrap: 'wrap',
              alignItems:
                'center',
            }}
          >
            <span>
              ✅ {compradosOcultos}{' '}
              comprado
              {compradosOcultos ===
              1
                ? ''
                : 's'}{' '}
              oculto
              {compradosOcultos ===
              1
                ? ''
                : 's'}
            </span>

            <button
              type="button"
              className="btn-secundario"
              onClick={() =>
                setMostrarComprados(
                  true
                )
              }
            >
              👁️ Ver
            </button>
          </div>
        )}

      {totalCompra === 0 &&
        yaDisponibles.length ===
          0 && (
          <div className="card">
            <p
              style={{
                color:
                  '#9e7d90',
              }}
            >
              Aún no hay
              ingredientes pendientes
              desde hoy hasta final
              de semana ni extras
              manuales 💕
            </p>
          </div>
        )}

      {totalCompra === 0 &&
        paraComprar.length > 0 &&
        compradosOcultos > 0 &&
        !mostrarComprados && (
          <div className="card">
            <p
              style={{
                color:
                  '#9e7d90',
                fontWeight: 800,
              }}
            >
              Todo lo pendiente
              está comprado y
              oculto ✅💕
            </p>
          </div>
        )}

      {(totalCompra > 0 ||
        yaDisponibles.length >
          0) && (
        <>
          {modoSupermercado ? (
            <ModoSupermercado
              grupos={
                agrupadosComprar
              }
              comprados={
                checksCompra
              }
              compraManual={
                compraManual
              }
              onToggleComprado={
                toggleCheckCompra
              }
            />
          ) : (
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

                <GrupoCompra
                  titulo="comprar"
                  grupos={
                    agrupadosComprar
                  }
                  modo="comprar"
                  inventario={
                    inventario
                  }
                  comprados={
                    checksCompra
                  }
                  compraManual={
                    compraManual
                  }
                  onToggleComprado={
                    toggleCheckCompra
                  }
                  onEliminarManual={
                    eliminarItemCompraManual
                  }
                />
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

                <GrupoCompra
                  titulo="disponible"
                  grupos={
                    agrupadosDisponibles
                  }
                  modo="disponible"
                  inventario={
                    inventario
                  }
                  comprados={
                    checksCompra
                  }
                  compraManual={
                    compraManual
                  }
                  onToggleComprado={
                    toggleCheckCompra
                  }
                  onEliminarManual={
                    eliminarItemCompraManual
                  }
                />
              </section>
            </div>
          )}
        </>
      )}
    </div>
  )
}