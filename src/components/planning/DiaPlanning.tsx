import {
  format,
} from 'date-fns'

import { es } from 'date-fns/locale'

import {
  type TipoComida,
} from '../../store'

import HuecoPlanning from './HuecoPlanning'

type Props = {
  dia: Date
  indice: number
  esHoy: boolean

  emojiDia: string
  colorDia: string

  recetas: any[]
  planning: any[]

  busquedas: Record<
    string,
    string
  >

  editandoHuecos: Record<
    string,
    boolean
  >

  onAbrirReceta: (
    recetaId: string
  ) => void

  activarEdicion: (
    clave: string
  ) => void

  cerrarEdicion: (
    clave: string
  ) => void

  setBusqueda: (
    clave: string,
    valor: string
  ) => void

  guardarHuecoPlanning: (
    datos: any
  ) => void

  limpiarHuecoPlanning: (
    fecha: string,
    tipoComida: TipoComida
  ) => void

  updateReceta: (
    recetaId: string,
    datos: any
  ) => void
}

export default function DiaPlanning({
  dia,
  esHoy,
  emojiDia,
  colorDia,
  recetas,
  planning,
  busquedas,
  editandoHuecos,
  onAbrirReceta,
  activarEdicion,
  cerrarEdicion,
  setBusqueda,
  guardarHuecoPlanning,
  limpiarHuecoPlanning,
  updateReceta,
}: Props) {
  const fecha =
    format(
      dia,
      'yyyy-MM-dd'
    )

  const obtenerDatosHueco = (
    tipoComida: TipoComida
  ) => {
    const clave = `${fecha}-${tipoComida}`

    const estaEditando =
      editandoHuecos[
        clave
      ] ?? false

    const hueco =
      planning.find(
        (h) =>
          h.fecha ===
            fecha &&
          h.tipoComida ===
            tipoComida
      )

    const receta =
      recetas.find(
        (r) =>
          r.id ===
          hueco?.recetaId
      )

    const hayContenido =
      Boolean(
        hueco?.recetaId ||
          hueco?.comidaLibre ||
          hueco?.nota
      )

    const busqueda =
      busquedas[
        clave
      ] ?? ''

    const sugerencias =
      busqueda.trim()
        ? recetas
            .filter((r) => {
              const texto =
                [
                  r.nombre,
                  r.ingredientes.join(
                    ' '
                  ),
                  r.dietas.join(
                    ' '
                  ),
                  r.ingredientesBase.join(
                    ' '
                  ),
                  r.caracteristicas.join(
                    ' '
                  ),
                ]
                  .join(' ')
                  .toLowerCase()

              return texto.includes(
                busqueda.toLowerCase()
              )
            })
            .slice(0, 5)
        : []

    return {
      clave,
      estaEditando,
      hueco,
      receta,
      hayContenido,
      busqueda,
      sugerencias,
    }
  }

  const renderHueco = (
    tipoComida: TipoComida
  ) => {
    const datos =
      obtenerDatosHueco(
        tipoComida
      )

    return (
      <HuecoPlanning
        key={
          datos.clave
        }
        fecha={fecha}
        tipoComida={
          tipoComida
        }
        clave={
          datos.clave
        }
        hueco={
          datos.hueco
        }
        receta={
          datos.receta
        }
        estaEditando={
          datos.estaEditando
        }
        hayContenido={
          datos.hayContenido
        }
        busqueda={
          datos.busqueda
        }
        sugerencias={
          datos.sugerencias
        }
        onAbrirReceta={
          onAbrirReceta
        }
        activarEdicion={() =>
          activarEdicion(
            datos.clave
          )
        }
        cerrarEdicion={() =>
          cerrarEdicion(
            datos.clave
          )
        }
        setBusqueda={(
          valor
        ) =>
          setBusqueda(
            datos.clave,
            valor
          )
        }
        guardarHueco={
          guardarHuecoPlanning
        }
        limpiarHueco={() =>
          limpiarHuecoPlanning(
            fecha,
            tipoComida
          )
        }
        updateReceta={
          updateReceta
        }
      />
    )
  }

  return (
    <div
      className="card"
      style={{
        background:
          colorDia,
      }}
    >
      <div
        style={{
          display: 'flex',

          alignItems:
            'center',

          gap: '10px',

          marginBottom:
            '14px',
        }}
      >
        <span
          style={{
            fontSize: '24px',
          }}
        >
          {emojiDia}
        </span>

        <div>
          <h3
            style={{
              fontSize: '18px',
            }}
          >
            {format(
              dia,
              'EEEE',
              {
                locale: es,
              }
            )}
          </h3>

          <p
            style={{
              color:
                '#8f7080',

              fontSize:
                '14px',
            }}
          >
            {format(
              dia,
              "d 'de' MMMM",
              {
                locale: es,
              }
            )}
          </p>
        </div>

        {esHoy && (
          <span
            className="pill pill-rosa"
            style={{
              marginLeft:
                'auto',
            }}
          >
            💕 Hoy
          </span>
        )}
      </div>

      <div
        style={{
          display: 'grid',

          gridTemplateColumns:
            'repeat(auto-fit, minmax(260px, 1fr))',

          gap: '14px',

          alignItems:
            'stretch',
        }}
      >
        {renderHueco(
          'comida'
        )}

        {renderHueco(
          'cena'
        )}
      </div>
    </div>
  )
}