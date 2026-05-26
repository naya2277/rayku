import { useState } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRaykuStore, type TipoComida } from '../store'
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
  const [editandoHuecos, setEditandoHuecos] = useState<Record<string, boolean>>({})

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
    <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
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
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
      {separarIngredientes(texto).map((ingrediente) => (
        <span key={ingrediente} className={`pill ${claseIngrediente(ingrediente)}`}>
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
    const hayContenido = Boolean(hueco?.recetaId || hueco?.comidaLibre || hueco?.nota)
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

    return (
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '14px',
          border:
            tipoComida === 'comida'
              ? '2px dashed #f2bdd0'
              : '2px dashed #d8c5f4',
        }}
      >
        <strong>{tipoComida === 'comida' ? '☀️ Comida' : '🌙 Cena'}</strong>

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
              placeholder="🥬 Ingredientes extra o comida rápida: pollo + brócoli..."
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
              placeholder="📝 Nota opcional..."
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
              style={{ marginTop: 10 }}
            />

            {hayContenido && (
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
            )}
          </div>
        )}

        {receta && (
          <div
            style={{
              marginTop: 12,
              background: '#fff5f8',
              border: '1.5px solid #f5dde8',
              borderRadius: 16,
              padding: 12,
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
              }}
            >
              <h3
                style={{
                  fontSize: 16,
                  color: '#c45b86',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                📖 {receta.nombre}
              </h3>
            </button>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {receta.dietas.slice(0, 3).map((dieta) => (
                <span key={dieta} className="pill pill-naranja">
                  {dieta}
                </span>
              ))}

              {receta.requiereDescongelar && (
                <span className="pill pill-teal">❄️ Descongelar</span>
              )}
            </div>

            {receta.ingredientes.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {receta.ingredientes.map((ingrediente) => (
                  <span
                    key={ingrediente}
                    className={`pill ${claseIngrediente(ingrediente)}`}
                  >
                    {emojiIngrediente(ingrediente)} {ingrediente}
                  </span>
                ))}
              </div>
            )}

            {estrellas(receta.valoracion, receta.id)}
          </div>
        )}

        {hueco?.comidaLibre && renderIngredientes(hueco.comidaLibre)}

        {hueco?.nota && (
          <p style={{ marginTop: 10, color: '#8f7080' }}>📝 {hueco.nota}</p>
        )}

        {hayContenido && !estaEditando && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
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
              style={{ background: COLORES_DIA[i] }}
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

              <div style={{ display: 'grid', gap: '12px' }}>
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