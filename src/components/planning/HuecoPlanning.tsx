import {
  separarIngredientes,
  emojiIngrediente,
  claseIngrediente,
} from '../../lib/ingredientes'

import {
  type TipoComida,
} from '../../store'

import RacionesPlanning from './RacionesPlanning'

type AvisoIngredientePlanning = {
  nombre: string
  cantidadNecesaria: number | null
  cantidadDisponible: number | null
  cantidadFaltante: number | null
  unidad: string | null
}

type Props = {
  fecha: string
  tipoComida: TipoComida
  clave: string
  hueco: any
  recetaIds: string[]
  recetasSeleccionadas: any[]
  estaEditando: boolean
  hayContenido: boolean
  toggleCocinado: () => void
  busqueda: string
  sugerencias: any[]
  avisosIngredientes: AvisoIngredientePlanning[]
  onAbrirReceta: (recetaId: string) => void
  activarEdicion: () => void
  cerrarEdicion: () => void
  setBusqueda: (valor: string) => void
  guardarHueco: (datos: any) => void
  limpiarHueco: () => void
  updateReceta: (recetaId: string, datos: any) => void
}

export default function HuecoPlanning({
  fecha,
  tipoComida,
  hueco,
  recetaIds,
  recetasSeleccionadas,
  estaEditando,
  hayContenido,
  busqueda,
  sugerencias,
  avisosIngredientes,
  onAbrirReceta,
  activarEdicion,
  cerrarEdicion,
  setBusqueda,
  guardarHueco,
  limpiarHueco,
  toggleCocinado,
  updateReceta,
}: Props) {
  const esComida = tipoComida === 'comida'

  const recetaPrincipal =
    recetasSeleccionadas[0] ?? null

  const guardarDatosHueco = (
    datos: {
      recetaIds?: string[]
      comidaLibre?: string
      nota?: string
      racionesOverride?: number | null
    }
  ) => {
    const nuevosRecetaIds =
      datos.recetaIds ?? recetaIds

    guardarHueco({
      fecha,
      tipoComida,
      recetaId:
        nuevosRecetaIds[0] ?? null,
      recetaIds:
        nuevosRecetaIds,
      comidaLibre:
        datos.comidaLibre ??
        hueco?.comidaLibre ??
        '',
      nota:
        datos.nota ??
        hueco?.nota ??
        '',
      racionesOverride:
        datos.racionesOverride ??
        hueco?.racionesOverride ??
        null,
    })
  }

  const agregarReceta = (
    recetaNueva: any
  ) => {
    const nuevosRecetaIds =
      recetaIds.includes(
        recetaNueva.id
      )
        ? recetaIds
        : [
            ...recetaIds,
            recetaNueva.id,
          ]

    guardarDatosHueco({
      recetaIds:
        nuevosRecetaIds,
      racionesOverride:
        hueco?.racionesOverride ??
        recetaNueva.raciones,
    })

    setBusqueda('')
  }

  const quitarReceta = (
    recetaId: string
  ) => {
    const nuevosRecetaIds =
      recetaIds.filter(
        (id) => id !== recetaId
      )

    guardarDatosHueco({
      recetaIds:
        nuevosRecetaIds,
      racionesOverride:
        nuevosRecetaIds.length === 0
          ? null
          : hueco?.racionesOverride ??
            null,
    })
  }

  const estrellas = (valoracion: number, recetaId: string) => (
    <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          style={{
            cursor: 'pointer',
            fontSize: 18,
            color: i < valoracion ? '#ffb347' : '#ddd',
          }}
          onClick={() =>
            updateReceta(recetaId, {
              valoracion: i + 1,
            })
          }
        >
          ★
        </span>
      ))}
    </div>
  )

  const renderIngredientes = (texto: string) => (
    <div
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginTop: 10,
      }}
    >
      {separarIngredientes(texto).map((ingrediente) => (
        <span
          key={ingrediente}
          className={`pill ${claseIngrediente(ingrediente)}`}
          style={{
            fontSize: 15,
            padding: '8px 12px',
          }}
        >
          {emojiIngrediente(ingrediente)} {ingrediente}
        </span>
      ))}
    </div>
  )

  const renderAvisosIngredientes = () => {
    if (
      avisosIngredientes.length === 0 ||
      hueco?.cocinado ||
      estaEditando
    ) {
      return null
    }

    return (
      <div
        style={{
          marginTop: 10,
          background: '#fff8ee',
          border: '1.5px solid #ffcc80',
          borderRadius: 14,
          padding: '10px 12px',
        }}
      >
        <strong
          style={{
            color: '#a07030',
            fontSize: 14,
          }}
        >
          ⚠️ Faltan ingredientes
        </strong>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 8,
          }}
        >
          {avisosIngredientes.slice(0, 4).map((aviso) => {
            const cantidad =
              aviso.cantidadFaltante !== null &&
              aviso.unidad
                ? `${aviso.cantidadFaltante}${aviso.unidad}`
                : 'sin stock'

            return (
              <span
                key={`${aviso.nombre}-${cantidad}`}
                className="pill pill-naranja"
                style={{
                  fontSize: 12,
                  padding: '6px 10px',
                  fontWeight: 900,
                }}
              >
                {emojiIngrediente(aviso.nombre)} {aviso.nombre} · {cantidad}
              </span>
            )
          })}

          {avisosIngredientes.length > 4 && (
            <span className="pill pill-malva">
              +{avisosIngredientes.length - 4} más
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        background: esComida ? '#fffafc' : '#fbf7ff',
        borderRadius: 18,
        padding: 14,
        border:
          avisosIngredientes.length > 0 && !hueco?.cocinado
            ? '2px solid #ffcc80'
            : esComida
              ? '2px solid #f3bfd2'
              : '2px solid #d7c3f3',
        boxShadow: '0 8px 20px rgba(170, 120, 145, 0.08)',
        minHeight: 170,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
        }}
      >
        <strong
          style={{
            color: esComida ? '#c45b86' : '#8a6ec7',
            fontSize: 16,
          }}
        >
          {esComida ? '☀️ Comida' : '🌙 Cena'}
        </strong>

        {!hayContenido && !estaEditando && (
          <button
            type="button"
            className="btn-secundario"
            onClick={activarEdicion}
          >
            ➕ Añadir
          </button>
        )}
      </div>

      {!hayContenido && !estaEditando && (
        <div
          style={{
            color: '#9e7d90',
            fontWeight: 700,
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: 14,
            padding: 14,
            textAlign: 'center',
          }}
        >
          Huequito libre 💕
        </div>
      )}

      {(!hayContenido || estaEditando) && (
        <div style={{ marginTop: 10 }}>
          <input
            placeholder={
              recetaIds.length > 0
                ? '➕ Buscar otra receta...'
                : '🔎 Buscar receta...'
            }
            value={busqueda}
            onFocus={activarEdicion}
            onChange={(e) => {
              activarEdicion()
              setBusqueda(e.target.value)
            }}
          />

          {sugerencias.length > 0 && (
            <div
              className="card"
              style={{
                marginTop: 8,
                padding: 10,
                display: 'grid',
                gap: 8,
                background: '#fffaf8',
              }}
            >
              {sugerencias.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="btn-secundario"
                  style={{
                    justifyContent: 'flex-start',
                    width: '100%',
                  }}
                  onClick={() =>
                    agregarReceta(r)
                  }
                >
                  ➕ 📖 {r.nombre}
                </button>
              ))}
            </div>
          )}

          {recetaPrincipal && (
            <RacionesPlanning
              racionesReceta={recetaPrincipal.raciones}
              racionesOverride={hueco?.racionesOverride}
              onGuardar={(nuevasRaciones) => {
                guardarDatosHueco({
                  racionesOverride:
                    nuevasRaciones,
                })
              }}
            />
          )}

          <input
            placeholder="🥬 Ingredientes extra o comida rápida..."
            value={hueco?.comidaLibre || ''}
            onFocus={activarEdicion}
            onChange={(e) => {
              activarEdicion()

              guardarDatosHueco({
                comidaLibre:
                  e.target.value,
              })
            }}
            style={{
              marginTop: 10,
            }}
          />

          <input
            placeholder="📝 Nota de esta comida..."
            value={hueco?.nota || ''}
            onFocus={activarEdicion}
            onChange={(e) => {
              activarEdicion()

              guardarDatosHueco({
                nota:
                  e.target.value,
              })
            }}
            style={{
              marginTop: 10,
              color: '#8f7080',
              fontSize: 13,
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          />

          <button
            className="btn-principal"
            style={{
              marginTop: 12,
            }}
            onClick={cerrarEdicion}
          >
            💕 Guardar
          </button>
        </div>
      )}

      {recetasSeleccionadas.length > 0 && (
        <div
          style={{
            marginTop: 10,
            display: 'grid',
            gap: 8,
          }}
        >
          {recetasSeleccionadas.map((receta) => (
            <div
              key={receta.id}
              style={{
                background: 'white',
                border: '1.5px solid #f5dde8',
                borderRadius: 16,
                padding: '10px 12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  gap: 8,
                  alignItems: 'flex-start',
                }}
              >
                <button
                  type="button"
                  onClick={() => onAbrirReceta(receta.id)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <span
                    style={{
                      color: '#c45b86',
                      fontWeight: 800,
                      fontSize: 16,
                      textDecoration: 'underline',
                      textUnderlineOffset: 3,
                    }}
                  >
                    📖 {receta.nombre}
                  </span>
                </button>

                {!hueco?.cocinado && (
                  <button
                    type="button"
                    className="btn-secundario"
                    onClick={() =>
                      quitarReceta(receta.id)
                    }
                    style={{
                      minHeight: 28,
                      fontSize: 11,
                      padding: '4px 8px',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div
                style={{
                  marginTop: 6,
                  color: '#9e7d90',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                🍽️ {hueco?.racionesOverride ?? receta.raciones} raciones
              </div>

              {estrellas(receta.valoracion, receta.id)}

              <input
                placeholder="📝 Nota de la receta..."
                value={receta.nota || ''}
                onChange={(e) =>
                  updateReceta(receta.id, {
                    nota: e.target.value,
                  })
                }
                style={{
                  marginTop: 10,
                  background: '#fffafc',
                  color: '#8f7080',
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {hueco?.comidaLibre && renderIngredientes(hueco.comidaLibre)}

      {renderAvisosIngredientes()}

      {hueco?.nota && (
        <p
          style={{
            marginTop: 10,
            color: '#8f7080',
            fontSize: 13,
            lineHeight: 1.45,
            fontWeight: 600,
            background: 'rgba(255, 255, 255, 0.65)',
            borderRadius: 14,
            padding: '8px 10px',
            whiteSpace: 'pre-wrap',
          }}
        >
          📝 {hueco.nota}
        </p>
      )}

      {hayContenido && !estaEditando && (
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            marginTop: 12,
          }}
        >
          <button className="btn-secundario" onClick={activarEdicion}>
            ✏️ Editar
          </button>

          <button className="btn-secundario" onClick={toggleCocinado}>
            {hueco?.cocinado ? '↩️ Deshacer cocinado' : '🍳 Hoy cocino'}
          </button>

          <button className="btn-secundario" onClick={limpiarHueco}>
            🧹 Limpiar
          </button>
        </div>
      )}
    </div>
  )
}