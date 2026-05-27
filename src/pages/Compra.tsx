import { useMemo } from 'react'

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
    limpiarChecksCompra,
  } = useRaykuStore()

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

  const itemsManualesComoCompra =
    useMemo<IngredienteCompra[]>(
      () =>
        compraManual.map(
          (item) => ({
            nombre: item.nombre,
            veces: 1,
            cantidad:
              item.cantidad,
            unidad: item.unidad,
            cantidadDisponible:
              null,
            cantidadFaltante:
              null,
          })
        ),
      [compraManual]
    )

  const paraComprarConManuales =
    useMemo(
      () => [
        ...itemsManualesComoCompra,
        ...paraComprar,
      ],
      [
        itemsManualesComoCompra,
        paraComprar,
      ]
    )

  const agrupadosComprar =
    useMemo(() => {
      return agruparIngredientesCompra(
        paraComprarConManuales
      )
    }, [paraComprarConManuales])

  const agrupadosDisponibles =
    useMemo(() => {
      return agruparIngredientesCompra(
        yaDisponibles
      )
    }, [yaDisponibles])

  const totalCompra =
    paraComprarConManuales.length

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
            + extras manuales
            💕
          </p>
        </div>

        <button
          className="btn-secundario"
          onClick={
            limpiarChecksCompra
          }
        >
          🧹 Limpiar checks
        </button>
      </div>

      <FormularioCompraManual
        onAgregar={
          agregarItemCompraManual
        }
      />

      <ResumenCompra
        total={
          totalCompra +
          yaDisponibles.length
        }
        paraComprar={
          totalCompra
        }
        yaDisponibles={
          yaDisponibles.length
        }
        manuales={
          compraManual.length
        }
      />

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
              ingredientes en el
              planning ni extras
              manuales 💕
            </p>
          </div>
        )}

      {(totalCompra > 0 ||
        yaDisponibles.length >
          0) && (
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
    </div>
  )
}