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

import {
  useRaykuStore,
  type TipoComida,
} from '../store'

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

export default function CalendarioPlanning({
  onAbrirReceta,
}: Props) {
  const [fechaBase, setFechaBase] = useState(new Date())
  const [vista, setVista] = useState<'semana' | 'mes'>('mes')

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

    const partes = [receta?.nombre, ...extras].filter(Boolean)

    if (partes.length === 0) return null

    return {
      receta,
      texto: partes.join(' + '),
    }
  }

  const renderLinea = (fecha: string, tipoComida: TipoComida) => {
    const resumen = resumenComida(fecha, tipoComida)
    const esComida = tipoComida === 'comida'

    if (!resumen) return null

    const estilosBase = {
      width: '100%',
      textAlign: 'left' as const,
      color: '#8f7080',
      fontSize: 'clamp(6px, 1.7vw, 11px)',
      fontWeight: 800,
      lineHeight: 1.15,
      borderRadius: 7,
      padding: 'clamp(2px, 0.9vw, 6px)',
      background: esComida ? '#ffd1df' : '#e6d6ff',
      border: esComida ? '1px solid #f3a9c1' : '1px solid #cdb8f0',
      boxSizing: 'border-box' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'block',
      minWidth: 0,
    }

    const contenido = (
      <>
        <strong>{esComida ? '☀️ ' : '🌙 '}</strong>
        <span>{resumen.texto}</span>
      </>
    )

    if (resumen.receta && onAbrirReceta) {
      return (
        <button
          type="button"
          onClick={() => onAbrirReceta(resumen.receta!.id)}
          style={{
            ...estilosBase,
            cursor: 'pointer',
          }}
        >
          {contenido}
        </button>
      )
    }

    return <div style={estilosBase}>{contenido}</div>
  }

  const renderDiaMensual = (dia: Date, indice: number) => {
    const fecha = format(dia, 'yyyy-MM-dd')
    const esHoy = fecha === hoy
    const fueraDelMes = !isSameMonth(dia, fechaBase)

    return (
      <div
        key={fecha}
        style={{
          background: COLORES_DIA[indice % 7],
          borderRadius: 10,
          minHeight: 'clamp(58px, 14vw, 132px)',
          padding: 'clamp(3px, 1vw, 8px)',
          opacity: fueraDelMes ? 0.45 : 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(3px, 0.9vw, 7px)',
          border: esHoy ? '2px solid #c45b86' : '1px solid transparent',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 'clamp(8px, 2vw, 13px)',
              fontWeight: 900,
              color: '#8f7080',
            }}
          >
            {format(dia, 'd')}
          </span>

          {esHoy && (
            <span
              className="pill pill-rosa"
              style={{
                fontSize: 'clamp(6px, 1.5vw, 10px)',
                padding: '2px 4px',
              }}
            >
              Hoy
            </span>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gap: 'clamp(2px, 0.8vw, 6px)',
            minWidth: 0,
          }}
        >
          {renderLinea(fecha, 'comida')}
          {renderLinea(fecha, 'cena')}
        </div>
      </div>
    )
  }

  const renderDiaSemanal = (dia: Date, indice: number) => {
    const fecha = format(dia, 'yyyy-MM-dd')
    const esHoy = fecha === hoy

    return (
      <div
        key={fecha}
        className="card"
        style={{
          background: COLORES_DIA[indice % 7],
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div>
            <h3
              style={{
                color: '#8f7080',
                textTransform: 'capitalize',
              }}
            >
              {format(dia, 'EEEE', { locale: es })}
            </h3>

            <p
              style={{
                color: '#9e7d90',
                fontSize: 13,
              }}
            >
              {format(dia, "d 'de' MMMM", { locale: es })}
            </p>
          </div>

          {esHoy && <span className="pill pill-rosa">💕 Hoy</span>}
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
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

  const diasMes: Date[] = []
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
            Vista rápida de tus comidas 💕
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
              fontSize: 20,
              color: '#c77d95',
              textAlign: 'center',
              textTransform: 'capitalize',
            }}
          >
            {vista === 'semana'
              ? `🗓️ ${format(inicioSemana, "'Semana del' d 'de' MMMM", {
                  locale: es,
                })}`
              : format(fechaBase, 'MMMM yyyy', { locale: es })}
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
          {diasSemana.map((dia, i) => renderDiaSemanal(dia, i))}
        </div>
      )}

      {vista === 'mes' && (
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              gap: 'clamp(2px, 0.8vw, 8px)',
              marginBottom: 6,
            }}
          >
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia) => (
              <div
                key={dia}
                style={{
                  textAlign: 'center',
                  fontWeight: 800,
                  color: '#8f7080',
                  paddingBottom: 3,
                  fontSize: 'clamp(8px, 2vw, 13px)',
                }}
              >
                {dia}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              gap: 'clamp(2px, 0.8vw, 8px)',
            }}
          >
            {diasMes.map((dia, i) => renderDiaMensual(dia, i))}
          </div>
        </div>
      )}
    </div>
  )
}