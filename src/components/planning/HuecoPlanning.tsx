import {
  separarIngredientes,
  emojiIngrediente,
  claseIngrediente,
} from '../../lib/ingredientes'

import {
  type TipoComida,
} from '../../store'

import RacionesPlanning from './RacionesPlanning'

type Props = {
  fecha: string
  tipoComida: TipoComida
  clave: string

  hueco: any
  receta: any

  estaEditando: boolean
  hayContenido: boolean

  busqueda: string
  sugerencias: any[]

  onAbrirReceta: (
    recetaId: string
  ) => void

  activarEdicion: () => void
  cerrarEdicion: () => void

  setBusqueda: (
    valor: string
  ) => void

  guardarHueco: (
    datos: any
  ) => void

  limpiarHueco: () => void

  updateReceta: (
    recetaId: string,
    datos: any
  ) => void
}

export default function HuecoPlanning({
  fecha,
  tipoComida,
  hueco,
  receta,
  estaEditando,
  hayContenido,
  busqueda,
  sugerencias,
  onAbrirReceta,
  activarEdicion,
  cerrarEdicion,
  setBusqueda,
  guardarHueco,
  limpiarHueco,
  updateReceta,
}: Props) {
  const esComida =
    tipoComida ===
    'comida'

  const estrellas = (
    valoracion: number,
    recetaId: string
  ) => (
    <div
      style={{
        display: 'flex',
        gap: 3,
        marginTop: 6,
      }}
    >
      {Array.from(
        { length: 5 },
        (_, i) => (
          <span
            key={i}
            style={{
              cursor:
                'pointer',
              fontSize: 18,
              color:
                i <
                valoracion
                  ? '#ffb347'
                  : '#ddd',
            }}
            onClick={() =>
              updateReceta(
                recetaId,
                {
                  valoracion:
                    i + 1,
                }
              )
            }
          >
            ★
          </span>
        )
      )}
    </div>
  )

  const renderIngredientes = (
    texto: string
  ) => (
    <div
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginTop: 10,
      }}
    >
      {separarIngredientes(
        texto
      ).map(
        (
          ingrediente
        ) => (
          <span
            key={
              ingrediente
            }
            className={`pill ${claseIngrediente(
              ingrediente
            )}`}
            style={{
              fontSize: 15,
              padding:
                '8px 12px',
            }}
          >
            {emojiIngrediente(
              ingrediente
            )}{' '}
            {ingrediente}
          </span>
        )
      )}
    </div>
  )

  return (
    <div
      style={{
        background:
          esComida
            ? '#fffafc'
            : '#fbf7ff',

        borderRadius: 18,

        padding: 14,

        border:
          esComida
            ? '2px solid #f3bfd2'
            : '2px solid #d7c3f3',

        boxShadow:
          '0 8px 20px rgba(170, 120, 145, 0.08)',

        minHeight: 170,
      }}
    >
      <div
        style={{
          display: 'flex',

          justifyContent:
            'space-between',

          alignItems:
            'center',

          gap: 10,

          marginBottom: 10,
        }}
      >
        <strong
          style={{
            color:
              esComida
                ? '#c45b86'
                : '#8a6ec7',

            fontSize: 16,
          }}
        >
          {esComida
            ? '☀️ Comida'
            : '🌙 Cena'}
        </strong>

        {!hayContenido &&
          !estaEditando && (
            <button
              type="button"
              className="btn-secundario"
              onClick={
                activarEdicion
              }
            >
              ➕ Añadir
            </button>
          )}
      </div>

      {!hayContenido &&
        !estaEditando && (
          <div
            style={{
              color:
                '#9e7d90',

              fontWeight: 700,

              background:
                'rgba(255, 255, 255, 0.7)',

              borderRadius: 14,

              padding: 14,

              textAlign:
                'center',
            }}
          >
            Huequito libre 💕
          </div>
        )}

      {(!hayContenido ||
        estaEditando) && (
        <div
          style={{
            marginTop: 10,
          }}
        >
          <input
            placeholder="🔎 Buscar receta..."
            value={busqueda}
            onFocus={
              activarEdicion
            }
            onChange={(e) => {
              activarEdicion()

              setBusqueda(
                e.target.value
              )
            }}
          />

          {sugerencias.length >
            0 && (
            <div
              className="card"
              style={{
                marginTop: 8,
                padding: 10,
                display:
                  'grid',
                gap: 8,
                background:
                  '#fffaf8',
              }}
            >
              {sugerencias.map(
                (r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="btn-secundario"
                    style={{
                      justifyContent:
                        'flex-start',
                      width:
                        '100%',
                    }}
                    onClick={() => {
                      guardarHueco(
                        {
                          fecha,

                          tipoComida,

                          recetaId:
                            r.id,

                          comidaLibre:
                            hueco?.comidaLibre ||
                            '',

                          nota:
                            hueco?.nota ||
                            '',

                          racionesOverride:
                            hueco?.racionesOverride ??
                            r.raciones,
                        }
                      )

                      setBusqueda(
                        ''
                      )
                    }}
                  >
                    📖{' '}
                    {r.nombre}
                  </button>
                )
              )}
            </div>
          )}

          {receta && (
            <RacionesPlanning
              racionesReceta={
                receta.raciones
              }
              racionesOverride={
                hueco?.racionesOverride
              }
              onGuardar={(
                nuevasRaciones
              ) => {
                guardarHueco(
                  {
                    fecha,

                    tipoComida,

                    recetaId:
                      receta.id,

                    comidaLibre:
                      hueco?.comidaLibre ||
                      '',

                    nota:
                      hueco?.nota ||
                      '',

                    racionesOverride:
                      nuevasRaciones,
                  }
                )
              }}
            />
          )}

          <input
            placeholder="🥬 Ingredientes extra o comida rápida..."
            value={
              hueco?.comidaLibre ||
              ''
            }
            onFocus={
              activarEdicion
            }
            onChange={(e) => {
              activarEdicion()

              guardarHueco(
                {
                  fecha,

                  tipoComida,

                  recetaId:
                    hueco?.recetaId ||
                    null,

                  comidaLibre:
                    e.target
                      .value,

                  nota:
                    hueco?.nota ||
                    '',

                  racionesOverride:
                    hueco?.racionesOverride ??
                    null,
                }
              )
            }}
            style={{
              marginTop: 10,
            }}
          />

          <input
            placeholder="📝 Nota de esta comida..."
            value={
              hueco?.nota ||
              ''
            }
            onFocus={
              activarEdicion
            }
            onChange={(e) => {
              activarEdicion()

              guardarHueco(
                {
                  fecha,

                  tipoComida,

                  recetaId:
                    hueco?.recetaId ||
                    null,

                  comidaLibre:
                    hueco?.comidaLibre ||
                    '',

                  nota:
                    e.target
                      .value,

                  racionesOverride:
                    hueco?.racionesOverride ??
                    null,
                }
              )
            }}
            style={{
              marginTop: 10,
              color:
                '#8f7080',
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
            onClick={
              cerrarEdicion
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
              background:
                'white',

              border:
                '1.5px solid #f5dde8',

              borderRadius: 16,

              padding:
                '10px 12px',
            }}
          >
            <button
              type="button"
              onClick={() =>
                onAbrirReceta(
                  receta.id
                )
              }
              style={{
                border:
                  'none',

                background:
                  'transparent',

                padding: 0,

                cursor:
                  'pointer',

                textAlign:
                  'left',

                width:
                  '100%',
              }}
            >
              <span
                style={{
                  color:
                    '#c45b86',

                  fontWeight: 800,

                  fontSize: 16,

                  textDecoration:
                    'underline',

                  textUnderlineOffset: 3,
                }}
              >
                📖{' '}
                {
                  receta.nombre
                }
              </span>
            </button>

            <div
              style={{
                marginTop: 6,
                color:
                  '#9e7d90',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              🍽️{' '}
              {hueco?.racionesOverride ??
                receta.raciones}{' '}
              raciones
            </div>

            {estrellas(
              receta.valoracion,
              receta.id
            )}

            <input
              placeholder="📝 Nota de la receta..."
              value={
                receta.nota ||
                ''
              }
              onChange={(
                e
              ) =>
                updateReceta(
                  receta.id,
                  {
                    nota:
                      e.target
                        .value,
                  }
                )
              }
              style={{
                marginTop: 10,
                background:
                  '#fffafc',
                color:
                  '#8f7080',
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            />
          </div>
        </div>
      )}

      {hueco?.comidaLibre &&
        renderIngredientes(
          hueco.comidaLibre
        )}

      {hueco?.nota && (
        <p
          style={{
            marginTop: 10,

            color:
              '#8f7080',

            fontSize: 13,

            lineHeight: 1.45,

            fontWeight: 600,

            background:
              'rgba(255, 255, 255, 0.65)',

            borderRadius: 14,

            padding:
              '8px 10px',

            whiteSpace:
              'pre-wrap',
          }}
        >
          📝 {hueco.nota}
        </p>
      )}

      {hayContenido &&
        !estaEditando && (
          <div
            style={{
              display: 'flex',

              gap: 10,

              flexWrap:
                'wrap',

              marginTop: 12,
            }}
          >
            <button
              className="btn-secundario"
              onClick={
                activarEdicion
              }
            >
              ✏️ Editar
            </button>

            <button
              className="btn-secundario"
              onClick={
                limpiarHueco
              }
            >
              🧹 Limpiar
            </button>
          </div>
        )}
    </div>
  )
}