import {
  type IngredienteCompra,
} from '../../lib/generarListaCompra'

import ItemCompra from './ItemCompra'

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

type Props = {
  titulo: string
  grupos: Record<
    string,
    IngredienteCompra[]
  >
  modo: 'comprar' | 'disponible'
  inventario: any[]
  comprados: string[]
  compraManual: ItemManual[]
  onToggleComprado: (
    id: string,
    itemCompra?: {
      nombre: string
      cantidad: number | null
      unidad: string | null
    }
  ) => void
  onEliminarManual: (
    id: string
  ) => void
}

export default function GrupoCompra({
  titulo,
  grupos,
  modo,
  inventario,
  comprados,
  compraManual,
  onToggleComprado,
  onEliminarManual,
}: Props) {
  const buscarManual = (
    item: IngredienteCompra
  ) =>
    compraManual.find(
      (manual) =>
        item.clave ===
        `manual-${manual.id}`
    )

  const entradas =
    Object.entries(grupos)

  if (entradas.length === 0) {
    return (
      <div className="card">
        <p
          style={{
            color: '#9e7d90',
          }}
        >
          {modo === 'comprar'
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
                marginBottom: '14px',
              }}
            >
              {TITULOS[categoria] ||
                '✨ Otros'}
            </h2>

            <div
              style={{
                display: 'grid',
                gap: '10px',
              }}
            >
              {items.map((item) => {
                const manual =
                  buscarManual(item)

                const idCheck =
                  manual
                    ? `manual-${manual.id}`
                    : item.nombre

                const cantidadPendiente =
                  item.cantidadFaltante ??
                  item.cantidad

                return (
                  <ItemCompra
                    key={
                      manual
                        ? manual.id
                        : item.nombre
                    }
                    item={item}
                    modo={modo}
                    inventario={
                      inventario
                    }
                    comprado={comprados.includes(
                      idCheck
                    )}
                    manual={manual}
                    onToggleComprado={() =>
                      onToggleComprado(
                        idCheck,
                        {
                          nombre:
                            manual?.nombre ??
                            item.nombre,
                          cantidad:
                            cantidadPendiente,
                          unidad:
                            item.unidad,
                        }
                      )
                    }
                    onEliminarManual={() => {
                      if (manual) {
                        onEliminarManual(
                          manual.id
                        )
                      }
                    }}
                  />
                )
              })}
            </div>
          </div>
        )
      )}
    </div>
  )
}