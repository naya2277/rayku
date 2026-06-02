import {
  format,
} from 'date-fns'

import { es } from 'date-fns/locale'

import {
  type TipoComida,
} from '../../store'

import HuecoPlanning from './HuecoPlanning'

import {
  calcularAvisosIngredientesPlanning,
} from '../../lib/planning/avisosIngredientesPlanning'

import {
  obtenerSugerenciasPlanning,
} from '../../lib/sugerencias/obtenerSugerenciasPlanning'

type Props = {
  dia: Date
  indice: number
  esHoy: boolean
  emojiDia: string
  colorDia: string
  recetas: any[]
  planning: any[]
  inventario: any[]
  busquedas: Record<string, string>
  editandoHuecos: Record<string, boolean>
  onAbrirReceta: (recetaId: string) => void
  activarEdicion: (clave: string) => void
  cerrarEdicion: (clave: string) => void
  setBusqueda: (clave: string, valor: string) => void
  guardarHuecoPlanning: (datos: any) => void
  limpiarHuecoPlanning: (fecha: string, tipoComida: TipoComida) => void
  toggleCocinadoPlanning: (id: string) => void
  updateReceta: (recetaId: string, datos: any) => void
}

function obtenerRecetaIds(hueco: any) {
  if (
    Array.isArray(hueco?.recetaIds) &&
    hueco.recetaIds.length > 0
  ) {
    return hueco.recetaIds
  }

  return hueco?.recetaId
    ? [hueco.recetaId]
    : []
}

export default function DiaPlanning({
  dia,
  esHoy,
  emojiDia,
  colorDia,
  recetas,
  planning,
  inventario,
  busquedas,
  editandoHuecos,
  onAbrirReceta,
  activarEdicion,
  cerrarEdicion,
  setBusqueda,
  guardarHuecoPlanning,
  limpiarHuecoPlanning,
  toggleCocinadoPlanning,
  updateReceta,
}: Props) {
  const fecha = format(dia, 'yyyy-MM-dd')

  const obtenerDatosHueco = (tipoComida: TipoComida) => {
    const clave = `${fecha}-${tipoComida}`

    const estaEditando = editandoHuecos[clave] ?? false

    const hueco = planning.find(
      (h) =>
        h.fecha === fecha &&
        h.tipoComida === tipoComida
    )

    const recetaIds =
      obtenerRecetaIds(hueco)

    const recetasSeleccionadas =
      recetas.filter((r) =>
        recetaIds.includes(r.id)
      )

    const hayContenido = Boolean(
      recetaIds.length > 0 ||
        hueco?.comidaLibre ||
        hueco?.nota
    )

    const busqueda = busquedas[clave] ?? ''

    const sugerencias = busqueda.trim()
      ? recetas
          .filter((r) => {
            if (recetaIds.includes(r.id)) {
              return false
            }

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

    const sugerenciasRayku =
      obtenerSugerenciasPlanning({
        recetas,
        inventario,
        tipoComida,
        recetaIdsActuales: recetaIds,
      })

    const avisosIngredientes =
      calcularAvisosIngredientesPlanning(
        hueco,
        recetas,
        inventario
      )

    return {
      clave,
      estaEditando,
      hueco,
      recetaIds,
      recetasSeleccionadas,
      hayContenido,
      busqueda,
      sugerencias,
      sugerenciasRayku,
      avisosIngredientes,
    }
  }

  const renderHueco = (tipoComida: TipoComida) => {
    const datos = obtenerDatosHueco(tipoComida)

    return (
      <HuecoPlanning
        key={datos.clave}
        fecha={fecha}
        tipoComida={tipoComida}
        clave={datos.clave}
        hueco={datos.hueco}
        recetaIds={datos.recetaIds}
        recetasSeleccionadas={datos.recetasSeleccionadas}
        estaEditando={datos.estaEditando}
        hayContenido={datos.hayContenido}
        busqueda={datos.busqueda}
        sugerencias={datos.sugerencias}
        sugerenciasRayku={datos.sugerenciasRayku}
        avisosIngredientes={datos.avisosIngredientes}
        onAbrirReceta={onAbrirReceta}
        activarEdicion={() => activarEdicion(datos.clave)}
        cerrarEdicion={() => cerrarEdicion(datos.clave)}
        setBusqueda={(valor) => setBusqueda(datos.clave, valor)}
        guardarHueco={guardarHuecoPlanning}
        limpiarHueco={() =>
          limpiarHuecoPlanning(fecha, tipoComida)
        }
        toggleCocinado={() => {
          if (datos.hueco?.id) {
            toggleCocinadoPlanning(datos.hueco.id)
          }
        }}
        updateReceta={updateReceta}
      />
    )
  }

  return (
    <div className="card" style={{ background: colorDia }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '14px',
        }}
      >
        <span style={{ fontSize: '24px' }}>{emojiDia}</span>

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
        {renderHueco('comida')}
        {renderHueco('cena')}
      </div>
    </div>
  )
}