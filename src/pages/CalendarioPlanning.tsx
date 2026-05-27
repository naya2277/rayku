import { useState } from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameMonth,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { useRaykuStore, type TipoComida } from '../store'
import { separarIngredientes } from '../lib/ingredientes'

type Props = {
  onAbrirReceta?: (recetaId: string) => void
}

const COLORES_DIA = [
  '#ffe4ec',
  '#fff0d9',
  '#efe3ff',
  '#e8f7ea',
  '#ffeaf4',
  '#fce4ec',
  '#e8f4ff',
]

const EMOJIS_DIA = ['🌸', '🧁', '💖', '🌿', '✨', '🩷', '🎀']

export default function CalendarioPlanning({ onAbrirReceta }: Props) {
  const [fechaBase, setFechaBase] = useState(new Date())
  const [vista, setVista] = useState<'semana' | 'mes'>('semana')

  const { recetas, planning } = useRaykuStore()

  const hoy = format(new Date(), 'yyyy-MM-dd')

  const obtenerHueco = (fecha: string, tipoComida: TipoComida) =>
    planning.find((h) => h.fecha === fecha && h.tipoComida === tipoComida)

  const resumenComida = (fecha: string, tipoComida: TipoComida) => {
    const hueco = obtenerHueco(fecha, tipoComida)

    if (!hueco) return null

    const receta = recetas.find((r) => r.id === hueco.recetaId)

    const extras = hueco.comidaLibre
      ? separarIngredientes(hueco.comidaLibre)
      : []

    const partes = [
      receta?.nombre,
      ...extras,
    ].filter(Boolean)

    if (partes.length === 0) return null

    return {
      receta,
      texto: partes.join(' + '),
    }
  }

  const renderLinea = (fecha: string, tipoComida: TipoComida) => {
    const resumen = resumenComida(fecha, tipoComida)

    const esComida = tipoComida === 'comida'

    if (!resumen) {
      return (
        <div
          style={{
            color: '#b99bad',
            fontSize: 13,
            fontWeight: 600,
            background: 'rgba(255, 255, 255, 0.55)',
            borderRadius: 12,
            padding: '8px 10px',
          }}
        >
          {esComida ? '☀️ Comida:' : '🌙 Cena:'} sin plan
        </div>
      )
    }

    const contenido = (
      <span>
        <strong style={{ color: esComida ? '#c45b86' : '#8a6ec7' }}>
          {esComida ? '☀️ Comida: ' : '🌙 Cena: '}
        </strong>
        {resumen.texto}
      </span>
    )

    if (resumen.receta && onAbrirReceta) {
      return (
        <button
          type="button"
          onClick={() => onAbrirReceta(resumen.receta!.id)}
          style={{
            width: '100%',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            color: '#8f7080',
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1.35,
            background: 'rgba(255, 255, 255, 0.72)',
            borderRadius: 12,
            padding: '8px 10px',
          }}
        >
          {contenido}
        </button>
      )
    }

    return (
      <div
        style={{
          color: '#8f7080',
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1.35,
          background: 'rgba(255, 255, 255, 0.72)',
          borderRadius: 12,
          padding: '8px 10px',
        }}
      >
        {contenido}
      </div>
    )
  }

  const renderDia = (dia: Date, indice: number, compacto = false) => {
    const fecha = format(dia, 'yyyy-MM-dd')
    const esHoy = fecha === hoy
    const fueraDelMes = vista === 'mes' && !isSameMonth(dia, fechaBase)

    return (
      <div
        key={fecha}
        className="card"
        style={{
          background: fueraDelMes ? '#fff8fb' : COLORES_DIA[indice % 7],
          opacity: fueraDelMes ? 0.55 : 1,
          padding: compacto ? 12 : 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: compacto ? 18 : 22 }}>
            {EMOJIS_DIA[indice % 7]}
          </span>

          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: compacto ? 14 : 17,
                color: '#8f7080',
                textTransform: 'capitalize',
              }}
            >
              {compacto
                ? format(dia, 'EEE d', { locale: es })
                : format(dia, 'EEEE', { locale: es })}
            </h3>

            {!compacto && (
              <p
                style={{
                  color: '#9e7d90',
                  fontSize: 13,
                }}
              >
                {format(dia, "d 'de' MMMM", { locale: es })}
              </p>
            )}
          </div>

          {esHoy && (
            <span className="pill pill-rosa">
              💕 Hoy
            </span>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gap: 8,
          }}
        >
          {renderLinea(fecha, 'comida')}
          {renderLinea(fecha, 'cena')}
        </div>
      </div>
    )
  }

  const inicioSemana = startOfWeek(fechaBase, { weekStartsOn: 1 })
  const diasSemana = Array.from({ length: 7 }, (_, i) =>
    addDays(inicioSemana, i)
  )

  const inicioMes = startOfWeek(startOfMonth(fechaBase), { weekStartsOn: 1 })
  const finMes = endOfWeek(endOfMonth(fechaBase), { weekStartsOn: 1 })

  const diasMes = []
  let diaActual = inicioMes

  while (diaActual <= finMes) {
    diasMes.push(diaActual)
    diaActual = addDays(diaActual, 1)
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1>📅 Calendario</h1>

          <p style={{ color: '#9e7d90' }}>
            Vista rápida de tus comidas y cenas 💕
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
            className={vista === 'semana' ? 'btn-principal' : 'btn-secundario'}
            onClick={() => setVista('semana')}
          >
            Semana
          </button>

          <button
            type="button"
            className={vista === 'mes' ? 'btn-principal' : 'btn-secundario'}
            onClick={() => setVista('mes')}
          >
            Mes
          </button>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginBottom: 18,
          background: 'linear-gradient(135deg, #ffe4ec 0%, #f6e9ff 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className="btn-secundario"
            onClick={() =>
              setFechaBase(
                vista === 'semana'
                  ? subWeeks(fechaBase, 1)
                  : subMonths(fechaBase, 1)
              )
            }
          >
            ← Anterior
          </button>

          <h2
            style={{
              fontSize: 19,
              color: '#c77d95',
              textAlign: 'center',
            }}
          >
            {vista === 'semana'
              ? `🗓️ ${format(inicioSemana, "'Semana del' d 'de' MMMM", {
                  locale: es,
                })}`
              : `🗓️ ${format(fechaBase, 'MMMM yyyy', { locale: es })}`}
          </h2>

          <button
            type="button"
            className="btn-secundario"
            onClick={() =>
              setFechaBase(
                vista === 'semana'
                  ? addWeeks(fechaBase, 1)
                  : addMonths(fechaBase, 1)
              )
            }
          >
            Siguiente →
          </button>
        </div>
      </div>

      {vista === 'semana' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 14,
          }}
        >
          {diasSemana.map((dia, i) => renderDia(dia, i))}
        </div>
      )}

      {vista === 'mes' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 12,
          }}
        >
          {diasMes.map((dia, i) => renderDia(dia, i, true))}
        </div>
      )}
    </div>
  )
}