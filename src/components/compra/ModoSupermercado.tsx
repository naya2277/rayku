import {
  emojiIngrediente,
} from '../../lib/ingredientes'

import {
  type IngredienteCompra,
} from '../../lib/generarListaCompra'

const TITULOS: Record<string, string> = {
  proteina: '🥩 Proteínas',
  carbohidrato: '🍚 Carbohidratos',
  grasa: '🧈 Grasas',
  salsa: '🥣 Salsas',
  verdura: '🥦 Verduras',
  fruta: '🍓 Frutas',
  otros: '✨ Otros',
}

type ItemManual = {
  id: string
  nombre: string
}

type ItemCompraParaInventario = {
  nombre: string
  cantidad: number | null
  unidad: string | null
}

type Props = {
  grupos: Record<
    string,
    IngredienteCompra[]
  >
  comprados: string[]
  compraManual: ItemManual[]
  onToggleComprado: (
    id: string,
    itemCompra?: ItemCompraParaInventario
  ) => void
}

function formatearCantidad(
  item: IngredienteCompra
) {
  if (
    item.cantidadFaltante !== null &&
    item.unidad
  ) {
    return `${item.cantidadFaltante}${item.unidad}`
  }

  if (
    item.cantidad !== null &&
    item.unidad
  ) {
    return `${item.cantidad}${item.unidad}`
  }

  return null
}

export default function ModoSupermercado({
  grupos,
  comprados,
  compraManual,
  onToggleComprado,
}: Props) {
  const entradas =
    Object.entries(grupos)

  const buscarManualPorNombre = (
    item: IngredienteCompra
  ) =>
    compraManual.find(
      (manual) =>
        item.clave ===
        `manual-${manual.id}`
    )

  if (entradas.length === 0) {
    return (
      <div className="card">
        <p
          style={{
            color: '#9e7d90',
            fontWeight: 800,
            textAlign: 'center',
          }}
        >
          No hay nada pendiente para comprar 💕
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: 18,
      }}
    >
      {entradas.map(
        ([
          categoria,
          items,
        ]) => (
          <section
            key={`supermercado-${categoria}`}
            className="card"
            style={{
              padding: 14,
            }}
          >
            <h2
              style={{
                marginBottom: 12,
                color: '#c45b86',
              }}
            >
              {TITULOS[categoria] ||
                '✨ Otros'}
            </h2>

            <div
              style={{
                display: 'grid',
                gap: 10,
              }}
            >
              {items.map((item) => {
                const manual =
                  buscarManualPorNombre(
                    item
                  )

                const idCheck =
                  manual
                    ? `manual-${manual.id}`
                    : item.nombre

                const comprado =
                  comprados.includes(
                    idCheck
                  )

                const cantidad =
                  formatearCantidad(
                    item
                  )

                return (
                  <button
                    key={
                      manual
                        ? manual.id
                        : item.nombre
                    }
                    type="button"
                    onClick={() =>
                      onToggleComprado(
                        idCheck,
                        {
                          nombre:
                            item.nombre,
                          cantidad:
                            item.cantidadFaltante ??
                            item.cantidad,
                          unidad:
                            item.unidad,
                        }
                      )
                    }
                    style={{
                      border:
                        comprado
                          ? '2px solid #b8d8b8'
                          : '2px solid #f5c8d8',
                      borderRadius: 16,
                      padding:
                        '14px 14px',
                      background:
                        comprado
                          ? '#f2fff4'
                          : '#fffafc',
                      display: 'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'space-between',
                      gap: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                      opacity:
                        comprado
                          ? 0.6
                          : 1,
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems:
                          'center',
                        gap: 10,
                        fontWeight: 900,
                        color:
                          comprado
                            ? '#6d9b6d'
                            : '#8f7080',
                        textDecoration:
                          comprado
                            ? 'line-through'
                            : 'none',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 22,
                        }}
                      >
                        {comprado
                          ? '✅'
                          : '☐'}
                      </span>

                      <span>
                        {emojiIngrediente(
                          item.nombre
                        )}{' '}
                        {item.nombre}
                        {manual && (
                          <span>
                            {' '}
                            ✍️
                          </span>
                        )}
                      </span>
                    </span>

                    {cantidad && (
                      <span
                        className="pill pill-naranja"
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {cantidad}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        )
      )}
    </div>
  )
}