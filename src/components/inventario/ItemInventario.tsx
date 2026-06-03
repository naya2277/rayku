import { useState } from 'react'

import type {
  ItemInventario as ItemInventarioType,
} from '../../store'

import {
  normalizarIngredienteRayku,
} from '../../lib/ingredientes/normalizacion'

import {
  detectarCaducidad,
} from '../../lib/inventario'

import CabeceraItemInventario from './item/CabeceraItemInventario'
import ControlesCantidadInventario from './item/ControlesCantidadInventario'
import AccionesAgotadoItemInventario from './item/AccionesAgotadoItemInventario'
import PanelEdicionInventario from './item/PanelEdicionInventario'

import {
  obtenerPasoRapido,
  redondearCantidad,
} from './item/utilsInventario'

type Props = {
  item: ItemInventarioType
  ultimo: boolean

  editarItemInventario: (
    id: string,
    data: Partial<ItemInventarioType>
  ) => void

  eliminarItemInventario: (
    id: string
  ) => void
}

export default function ItemInventario({
  item,
  ultimo,
  editarItemInventario,
  eliminarItemInventario,
}: Props) {
  const [
    panelEdicionAbierto,
    setPanelEdicionAbierto,
  ] = useState(false)

  const [
    consumoActivo,
    setConsumoActivo,
  ] = useState(false)

  const [
    cantidadConsumida,
    setCantidadConsumida,
  ] = useState('')

  const estado =
    detectarCaducidad(
      item.fechaCaducidad
    )

  const agotado =
    item.cantidad <= 0

  const pasoRapido =
    obtenerPasoRapido(
      item.unidad
    )

  const cambiarCantidadRapida = (
    cambio: number
  ) => {
    const nuevaCantidad =
      Math.max(
        0,
        redondearCantidad(
          item.cantidad + cambio
        )
      )

    editarItemInventario(
      item.id,
      {
        cantidad: nuevaCantidad,
      }
    )
  }

  const consumirProducto = () => {
    const cantidadRestar =
      parseFloat(
        cantidadConsumida
      )

    if (
      isNaN(cantidadRestar) ||
      cantidadRestar <= 0
    ) {
      return
    }

    const nuevaCantidad =
      Math.max(
        0,
        redondearCantidad(
          item.cantidad -
            cantidadRestar
        )
      )

    editarItemInventario(
      item.id,
      {
        cantidad: nuevaCantidad,
      }
    )

    setCantidadConsumida('')
    setConsumoActivo(false)
  }

  const volverAComprar = () => {
    editarItemInventario(
      item.id,
      {
        cantidad: 1,
        ubicacion: 'pendiente',
      }
    )
  }

  const normalizarNombre = () => {
    const nombreNormalizado =
      normalizarIngredienteRayku(
        item.nombre
      )

    if (!nombreNormalizado) {
      return
    }

    editarItemInventario(
      item.id,
      {
        nombre: nombreNormalizado,
      }
    )
  }

  return (
    <div
      style={{
        padding: '3px 6px',
        borderBottom: !ultimo
          ? '1px solid var(--borde)'
          : 'none',
        opacity: agotado ? 0.82 : 1,
      }}
    >
      <div
        style={{
          background: agotado
            ? 'linear-gradient(135deg, #fff8ee, #fffafc)'
            : 'rgba(255,255,255,0.72)',
          border: agotado
            ? '1.5px solid #ffcc80'
            : '1px solid #f5dde8',
          borderRadius: 12,
          padding: '6px 8px',
          display: 'grid',
          gap: 5,
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: 4,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              minWidth: 0,
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <CabeceraItemInventario
                item={item}
                agotado={agotado}
              />
            </div>

            <div
              style={{
                color: agotado ? '#a07030' : '#9b3f68',
                fontWeight: 900,
                fontSize: 14,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {item.cantidad} {item.unidad}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              paddingLeft: 34,
            }}
          >
            {!agotado && (
              <button
                type="button"
                className="btn-secundario"
                onClick={() =>
                  setPanelEdicionAbierto(
                    !panelEdicionAbierto
                  )
                }
                style={{
                  minHeight: 26,
                  minWidth: 32,
                  fontSize: 11,
                  padding: '3px 7px',
                  flexShrink: 0,
                }}
              >
                {panelEdicionAbierto ? '▲' : '⚙️'}
              </button>
            )}

            {agotado ? (
              <span
                className="pill pill-naranja"
                style={{
                  fontSize: 10,
                  padding: '4px 7px',
                  whiteSpace: 'nowrap',
                  marginLeft: 'auto',
                }}
              >
                🪫 Agotado
              </span>
            ) : (
              <ControlesCantidadInventario
                item={item}
                pasoRapido={pasoRapido}
                onCambiarCantidad={cambiarCantidadRapida}
              />
            )}
          </div>
        </div>

        {estado && !agotado && (
          <div
            style={{
              fontSize: 10,
              color: estado.color,
              fontWeight: 800,
              paddingLeft: 34,
              lineHeight: 1.15,
            }}
          >
            📅 {estado.texto}
          </div>
        )}

        {agotado && (
          <AccionesAgotadoItemInventario
            onVolverAComprar={volverAComprar}
            onBorrar={() =>
              eliminarItemInventario(
                item.id
              )
            }
          />
        )}

        {!agotado && panelEdicionAbierto && (
          <PanelEdicionInventario
            item={item}
            consumoActivo={consumoActivo}
            cantidadConsumida={cantidadConsumida}
            setConsumoActivo={setConsumoActivo}
            setCantidadConsumida={setCantidadConsumida}
            editarItemInventario={editarItemInventario}
            eliminarItemInventario={eliminarItemInventario}
            onNormalizarNombre={normalizarNombre}
            onConsumirProducto={consumirProducto}
          />
        )}
      </div>
    </div>
  )
}