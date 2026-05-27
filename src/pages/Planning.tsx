import { useState } from 'react'
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  useRaykuStore,
  type TipoComida,
} from '../store'
import {
  separarIngredientes,
  emojiIngrediente,
  claseIngrediente,
} from '../lib/ingredientes'

const EMOJIS_DIA = ['🌸', '🧁', '💖', '🌿', '✨', '🩷', '🎀']

const COLORES_DIA = [
  '#ffe4ec',
  '#fff0d9',
  '#efe3ff',
  '#e8f7ea',
  '#ffeaf4',
  '#fce4ec',
  '#e8f4ff',
]

type Props = {
  onAbrirReceta: (recetaId: string) => void
}

export default function Planning({ onAbrirReceta }: Props) {
  const [semanaBase, setSemanaBase] = useState(new Date())
  const [busquedas, setBusquedas] = useState<Record<string, string>>({})
  const [editandoHuecos, setEditandoHuecos] = useState<
    Record<string, boolean>
  >({})

  const {
    recetas,
    planning,
    guardarHuecoPlanning,
    limpiarHuecoPlanning,
    updateReceta,
  } = useRaykuStore()

  const inicioSemana = startOfWeek(semanaBase, { weekStartsOn: 1 })
  const dias = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i))
  const hoy = format(new Date(), 'yyyy-MM-dd')

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
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
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

  const renderHueco = (fecha: string, tipoComida: TipoComida) => {
    const clave = `${fecha}-${tipoComida}`
    const estaEditando = editandoHuecos[clave] ?? false

    const hueco = planning.find(
      (h) => h.fecha === fecha && h.tipoComida === tipoComida
    )

    const receta = recetas.find((r) => r.id === hueco?.recetaId)

    const hayContenido = Boolean(
      hueco?.recetaId || hueco?.comidaLibre || hueco?.nota
    )

    const busqueda = busquedas[clave] ?? ''

    const sugerencias = busqueda.trim()
      ? recetas
          .filter((r) => {
            const texto = [
              r.nombre,
              r.ingredientes.join(' '),
              r.dietas.join(' '),
              r.ingredientesBase.join(' '),
              r.caracteristicas.join(' '),
            ]
              .join(' ')
              .toLowerCase()

            return texto.includes(busqueda.toLowerCase())
          })
          .slice(0, 5)
      : []

    const esComida = tipoComida === 'comida'

    return (
      <div
        style={{
          background: esComida ? '#fffafc' : '#fbf7ff',
          borderRadius: 18,
          padding: 14,
          border: esComida ? '2px solid #f3bfd2' : '2px solid #d7c3f3',
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
              onClick={() =>
                setEditandoHuecos({
                  ...editandoHuecos,
                  [clave]: true,
                })
              }
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
              placeholder="🔎 Buscar receta..."
              value={busqueda}
              onChange={(e) =>
                setBusquedas({
                  ...busquedas,
                  [clave]: e.target.value,
                })
              }
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
                    onClick={() => {
                      guardarHuecoPlanning({
                        fecha,
                        tipoComida,
                        recetaId: r.id,
                        comidaLibre: hueco?.comidaLibre || '',
                        nota: hueco?.nota || '',
                      })

                      setBusquedas({
                        ...busquedas,
                        [clave]: '',
                      })
                    }}
                  >
                    📖 {r.nombre}
                  </button>
                ))}
              </div>
            )}

            <input
              placeholder="🥬 Ingredientes extra o comida rápida..."
              value={hueco?.comidaLibre || ''}
              onChange={(e) =>
                guardarHuecoPlanning({
                  fecha,
                  tipoComida,
                  recetaId: hueco?.recetaId || null,
                  comidaLibre: e.target.value,
                  nota: hueco?.nota || '',
                })
              }
              style={{ marginTop: 10 }}
            />

            <input
              placeholder="📝 Nota de esta comida..."
              value={hueco?.nota || ''}
              onChange={(e) =>
                guardarHuecoPlanning({
                  fecha,
                  tipoComida,
                  recetaId: hueco?.recetaId || null,
                  comidaLibre: hueco?.comidaLibre || '',
                  nota: e.target.value,
                })
              }
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
              style={{ marginTop: 12 }}
              onClick={() =>
                setEditandoHuecos({
                  ...editandoHuecos,
                  [clave]: false,
                })
              }
            >
              💕 Guardar
            </button>
          </div>
        )}

        {receta && (
          <div
            style={{
              marginTop: 10,
              display: 'grid',
              gap: 8,
            }}
          >
            <div
              style={{
                background: 'white',
                border: '1.5px solid #f5dde8',
                borderRadius: 16,
                padding: '10px 12px',
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
          </div>
        )}

        {hueco?.comidaLibre && renderIngredientes(hueco.comidaLibre)}

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
            <button
              className="btn-secundario"
              onClick={() =>
                setEditandoHuecos({
                  ...editandoHuecos,
                  [clave]: true,
                })
              }
            >
              ✏️ Editar
            </button>

            <button
              className="btn-secundario"
              onClick={() => limpiarHuecoPlanning(fecha, tipoComida)}
            >
              🧹 Limpiar
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <button
          className="btn-secundario"
          onClick={() => setSemanaBase(subWeeks(semanaBase, 1))}
        >
          ← Semana anterior
        </button>

        <h2 style={{ fontSize: '20px', color: '#c77d95', textAlign: 'center' }}>
          🗓️ {format(inicioSemana, "'Semana del' d 'de' MMMM", { locale: es })}
        </h2>

        <button
          className="btn-secundario"
          onClick={() => setSemanaBase(addWeeks(semanaBase, 1))}
        >
          Semana siguiente →
        </button>
      </div>

      <div style={{ display: 'grid', gap: '18px' }}>
        {dias.map((dia, i) => {
          const fecha = format(dia, 'yyyy-MM-dd')
          const esHoy = fecha === hoy

          return (
            <div
              key={fecha}
              className="card"
              style={{
                background: COLORES_DIA[i],
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '14px',
                }}
              >
                <span style={{ fontSize: '24px' }}>{EMOJIS_DIA[i]}</span>

                <div>
                  <h3 style={{ fontSize: '18px' }}>
                    {format(dia, 'EEEE', { locale: es })}
                  </h3>

                  <p style={{ color: '#8f7080', fontSize: '14px' }}>
                    {format(dia, "d 'de' MMMM", { locale: es })}
                  </p>
                </div>

                {esHoy && (
                  <span className="pill pill-rosa" style={{ marginLeft: 'auto' }}>
                    💕 Hoy
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '14px',
                  alignItems: 'stretch',
                }}
              >
                {renderHueco(fecha, 'comida')}
                {renderHueco(fecha, 'cena')}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}