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
} from '../store'

import DiaPlanning from '../components/planning/DiaPlanning'

const EMOJIS_DIA = [
  '🌸',
  '🧁',
  '💖',
  '🌿',
  '✨',
  '🩷',
  '🎀',
]

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
  onAbrirReceta: (
    recetaId: string
  ) => void
}

export default function Planning({
  onAbrirReceta,
}: Props) {
  const [
    semanaBase,
    setSemanaBase,
  ] = useState(new Date())

  const [
    busquedas,
    setBusquedas,
  ] = useState<
    Record<string, string>
  >({})

  const [
    editandoHuecos,
    setEditandoHuecos,
  ] = useState<
    Record<string, boolean>
  >({})

  const {
    recetas,
    planning,
    inventario,
    guardarHuecoPlanning,
    limpiarHuecoPlanning,
    toggleCocinadoPlanning,
    updateReceta,
  } = useRaykuStore()

  const inicioSemana =
    startOfWeek(
      semanaBase,
      {
        weekStartsOn: 1,
      }
    )

  const dias =
    Array.from(
      { length: 7 },
      (_, i) =>
        addDays(
          inicioSemana,
          i
        )
    )

  const hoy = format(
    new Date(),
    'yyyy-MM-dd'
  )

  const activarEdicion = (
    clave: string
  ) => {
    setEditandoHuecos(
      (actual) => ({
        ...actual,
        [clave]: true,
      })
    )
  }

  const cerrarEdicion = (
    clave: string
  ) => {
    setEditandoHuecos(
      (actual) => ({
        ...actual,
        [clave]: false,
      })
    )
  }

  const setBusqueda = (
    clave: string,
    valor: string
  ) => {
    setBusquedas(
      (actual) => ({
        ...actual,
        [clave]: valor,
      })
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems:
            'center',
          marginBottom:
            '20px',
          flexWrap:
            'wrap',
          gap: '12px',
        }}
      >
        <button
          className="btn-secundario"
          onClick={() =>
            setSemanaBase(
              subWeeks(
                semanaBase,
                1
              )
            )
          }
        >
          ← Semana anterior
        </button>

        <h2
          style={{
            fontSize:
              '20px',
            color:
              '#c77d95',
            textAlign:
              'center',
          }}
        >
          🗓️{' '}
          {format(
            inicioSemana,
            "'Semana del' d 'de' MMMM",
            {
              locale: es,
            }
          )}
        </h2>

        <button
          className="btn-secundario"
          onClick={() =>
            setSemanaBase(
              addWeeks(
                semanaBase,
                1
              )
            )
          }
        >
          Semana siguiente →
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '18px',
        }}
      >
        {dias.map(
          (dia, i) => {
            const fecha =
              format(
                dia,
                'yyyy-MM-dd'
              )

            return (
              <DiaPlanning
                key={fecha}
                dia={dia}
                indice={i}
                esHoy={
                  fecha === hoy
                }
                emojiDia={
                  EMOJIS_DIA[i]
                }
                colorDia={
                  COLORES_DIA[i]
                }
                recetas={recetas}
                planning={planning}
                inventario={inventario}
                busquedas={
                  busquedas
                }
                editandoHuecos={
                  editandoHuecos
                }
                onAbrirReceta={
                  onAbrirReceta
                }
                activarEdicion={
                  activarEdicion
                }
                cerrarEdicion={
                  cerrarEdicion
                }
                setBusqueda={
                  setBusqueda
                }
                guardarHuecoPlanning={
                  guardarHuecoPlanning
                }
                limpiarHuecoPlanning={
                  limpiarHuecoPlanning
                }
                toggleCocinadoPlanning={
                  toggleCocinadoPlanning
                }
                updateReceta={
                  updateReceta
                }
              />
            )
          }
        )}
      </div>
    </div>
  )
}