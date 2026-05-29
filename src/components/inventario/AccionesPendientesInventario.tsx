import type {
  UbicacionInventario,
} from '../../store/types'

type Props = {
  totalPendientes: number
  seleccionados: string[]
  onMoverSeleccionados: (
    ubicacion: UbicacionInventario
  ) => void
  onLimpiarSeleccion: () => void
}

export default function AccionesPendientesInventario({
  totalPendientes,
  seleccionados,
  onMoverSeleccionados,
  onLimpiarSeleccion,
}: Props) {
  if (totalPendientes === 0) {
    return null
  }

  const haySeleccion =
    seleccionados.length > 0

  return (
    <div
      className="card"
      style={{
        marginBottom: 18,
        background:
          'linear-gradient(135deg, #fffaf8, #f7fff8)',
        borderColor: '#f5dde8',
      }}
    >
      <h2
        style={{
          color: '#c45b86',
          fontSize: 18,
          marginBottom: 8,
        }}
      >
        🛍️ Pendiente de guardar
      </h2>

      <p
        style={{
          color: 'var(--txt2)',
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        Selecciona varios productos pendientes y muévelos juntos a su sitio.
      </p>

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span className="pill pill-rosa">
          ☑️ {seleccionados.length} seleccionados
        </span>

        <button
          type="button"
          className="btn-secundario"
          disabled={!haySeleccion}
          onClick={() =>
            onMoverSeleccionados(
              'nevera'
            )
          }
          style={{
            opacity: haySeleccion
              ? 1
              : 0.5,
          }}
        >
          🧊 A nevera
        </button>

        <button
          type="button"
          className="btn-secundario"
          disabled={!haySeleccion}
          onClick={() =>
            onMoverSeleccionados(
              'congelador'
            )
          }
          style={{
            opacity: haySeleccion
              ? 1
              : 0.5,
          }}
        >
          ❄️ A congelador
        </button>

        <button
          type="button"
          className="btn-secundario"
          disabled={!haySeleccion}
          onClick={() =>
            onMoverSeleccionados(
              'despensa'
            )
          }
          style={{
            opacity: haySeleccion
              ? 1
              : 0.5,
          }}
        >
          🗄️ A despensa
        </button>

        {haySeleccion && (
          <button
            type="button"
            className="btn-secundario"
            onClick={
              onLimpiarSeleccion
            }
          >
            ✨ Limpiar selección
          </button>
        )}
      </div>
    </div>
  )
}