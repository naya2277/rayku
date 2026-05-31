import {
  format,
} from 'date-fns'

import {
  es,
} from 'date-fns/locale'

import {
  useRaykuStore,
} from '../store'

import {
  emojiIngrediente,
} from '../lib/ingredientes'

import {
  calcularDiasCaducidad,
  detectarCaducidad,
} from '../lib/inventario'

import {
  generarIngredientesCompra,
  separarIngredientesPorInventario,
} from '../lib/generarListaCompra'

import type {
  TipoComida,
} from '../store/types'

type Props = {
  onAbrirReceta: (
    recetaId: string
  ) => void
}

function obtenerRecetaIds(
  hueco: any
) {
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

function tituloTipoComida(
  tipo: TipoComida
) {
  return tipo === 'comida'
    ? '🍲 Comida'
    : '🌙 Cena'
}

function DashboardCard({
  titulo,
  subtitulo,
  children,
  color = '#fffafc',
}: {
  titulo: string
  subtitulo?: string
  children: React.ReactNode
  color?: string
}) {
  return (
    <section
      className="card"
      style={{
        background: color,
        borderColor: '#f5c8d8',
      }}
    >
      <h2
        style={{
          color: '#c45b86',
          fontSize: 18,
          marginBottom: subtitulo ? 4 : 12,
        }}
      >
        {titulo}
      </h2>

      {subtitulo && (
        <p
          style={{
            color: 'var(--txt2)',
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          {subtitulo}
        </p>
      )}

      {children}
    </section>
  )
}

function EmptyState({
  texto,
}: {
  texto: string
}) {
  return (
    <p
      style={{
        color: 'var(--txt2)',
        fontWeight: 700,
        fontSize: 14,
      }}
    >
      {texto}
    </p>
  )
}

export default function Inicio({
  onAbrirReceta,
}: Props) {
  const {
    recetas,
    planning,
    inventario,
  } = useRaykuStore()

  const hoy =
    format(
      new Date(),
      'yyyy-MM-dd'
    )

  const nombreHoy =
    format(
      new Date(),
      "EEEE d 'de' MMMM",
      {
        locale: es,
      }
    )

  const huecosHoy =
    planning.filter(
      (h) => h.fecha === hoy
    )

  const comidasHoy =
    (['comida', 'cena'] as TipoComida[])
      .map((tipoComida) => {
        const hueco =
          huecosHoy.find(
            (h) =>
              h.tipoComida ===
              tipoComida
          )

        if (!hueco) {
          return null
        }

        const recetaIds =
          obtenerRecetaIds(hueco)

        const recetasHueco =
          recetas.filter(
            (receta) =>
              recetaIds.includes(
                receta.id
              )
          )

        const tieneContenido =
          recetasHueco.length > 0 ||
          Boolean(
            hueco.comidaLibre?.trim()
          ) ||
          Boolean(
            hueco.nota?.trim()
          )

        if (!tieneContenido) {
          return null
        }

        return {
          tipoComida,
          hueco,
          recetasHueco,
        }
      })
      .filter(Boolean) as {
        tipoComida: TipoComida
        hueco: any
        recetasHueco: typeof recetas
      }[]

  const productosDescongelar =
    inventario
      .filter(
        (item) =>
          item.necesitaDescongelar &&
          item.cantidad > 0
      )
      .slice(0, 5)

  const productosCaducan =
    inventario
      .filter((item) => {
        if (
          item.ubicacion === 'pendiente'
        ) {
          return false
        }

        if (item.cantidad <= 0) {
          return false
        }

        const dias =
          calcularDiasCaducidad(
            item.fechaCaducidad
          )

        return (
          dias !== null &&
          dias <= 3
        )
      })
      .sort((a, b) => {
        const diasA =
          calcularDiasCaducidad(
            a.fechaCaducidad
          ) ?? 999

        const diasB =
          calcularDiasCaducidad(
            b.fechaCaducidad
          ) ?? 999

        return diasA - diasB
      })
      .slice(0, 5)

  const ingredientesCompra =
    generarIngredientesCompra(
      planning,
      recetas
    )

  const {
    paraComprar,
  } =
    separarIngredientesPorInventario(
      ingredientesCompra,
      inventario
    )

  const favoritos =
    recetas
      .filter(
        (receta) =>
          receta.favorita ||
          receta.valoracion >= 4
      )
      .sort(
        (a, b) =>
          Number(b.valoracion || 0) -
          Number(a.valoracion || 0)
      )
      .slice(0, 5)

  const sugerencia =
    favoritos[0] ?? null

  return (
    <div>
      <div
        className="card"
        style={{
          marginBottom: 20,
          background:
            'linear-gradient(135deg, #fff0f6, #fffaf8)',
          borderColor: '#f5c8d8',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
        <div
  style={{
    width: 74,
    height: 74,
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid #f5bfd2',
    background: '#fff0f6',
    boxShadow:
      '0 8px 18px rgba(180,120,150,0.14)',
    flexShrink: 0,
  }}
>
  <img
    src="/rayku-buenosdias.png"
    alt="Rayku dando los buenos días"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center 40%',
      transform: 'scale(1.56)',
    }}
  />
</div>

          <div>
            <h1
              style={{
                margin: 0,
                color: '#c45b86',
                fontFamily:
                  "'Comic Sans MS', 'Trebuchet MS', cursive",
              }}
            >
              Buenos días 💕
            </h1>

            <p
              style={{
                color: 'var(--txt2)',
                fontWeight: 700,
                marginTop: 4,
                textTransform: 'capitalize',
              }}
            >
              {nombreHoy}
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 18,
        }}
      >
        <DashboardCard
          titulo="📅 Hoy tienes"
          subtitulo="Tu comida y cena planificadas para hoy."
          color="linear-gradient(135deg, #fffafc, #fff0f6)"
        >
          {comidasHoy.length === 0 ? (
            <EmptyState texto="Hoy todavía no tienes nada planificado 💕" />
          ) : (
            <div
              style={{
                display: 'grid',
                gap: 10,
              }}
            >
              {comidasHoy.map(
                ({
                  tipoComida,
                  hueco,
                  recetasHueco,
                }) => (
                  <div
                    key={tipoComida}
                    style={{
                      background:
                        'rgba(255,255,255,0.72)',
                      border:
                        '1px solid var(--borde)',
                      borderRadius: 16,
                      padding: '10px 12px',
                    }}
                  >
                    <strong
                      style={{
                        color: '#9b3f68',
                        fontSize: 15,
                      }}
                    >
                      {tituloTipoComida(
                        tipoComida
                      )}
                    </strong>

                    <div
                      style={{
                        display: 'grid',
                        gap: 6,
                        marginTop: 8,
                      }}
                    >
                      {recetasHueco.map(
                        (receta) => (
                          <button
                            key={receta.id}
                            type="button"
                            className="btn-secundario"
                            onClick={() =>
                              onAbrirReceta(
                                receta.id
                              )
                            }
                            style={{
                              justifyContent:
                                'flex-start',
                              textAlign: 'left',
                            }}
                          >
                            📖 {receta.nombre}
                          </button>
                        )
                      )}

                      {hueco.comidaLibre && (
                        <span className="pill pill-rosa">
                          🍽️{' '}
                          {hueco.comidaLibre}
                        </span>
                      )}

                      {hueco.cocinado && (
                        <span className="pill pill-teal">
                          ✅ Cocinado
                        </span>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          titulo="❄️ Recuerda descongelar"
          subtitulo="Productos marcados para descongelar."
          color="linear-gradient(135deg, #f8f1ff, #fffafc)"
        >
          {productosDescongelar.length === 0 ? (
            <EmptyState texto="No tienes nada marcado para descongelar ahora mismo ❄️" />
          ) : (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {productosDescongelar.map(
                (item) => (
                  <span
                    key={item.id}
                    className="pill pill-teal"
                  >
                    {emojiIngrediente(
                      item.nombre
                    )}{' '}
                    {item.nombre} ·{' '}
                    {item.cantidad}
                    {item.unidad}
                  </span>
                )
              )}
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          titulo="⚠️ Caducan pronto"
          subtitulo="Productos que conviene usar primero."
          color="linear-gradient(135deg, #fff8ee, #fffafc)"
        >
          {productosCaducan.length === 0 ? (
            <EmptyState texto="No hay productos urgentes por caducidad 🌸" />
          ) : (
            <div
              style={{
                display: 'grid',
                gap: 8,
              }}
            >
              {productosCaducan.map(
                (item) => {
                  const estado =
                    detectarCaducidad(
                      item.fechaCaducidad
                    )

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        alignItems:
                          'center',
                        flexWrap: 'wrap',
                        gap: 8,
                        background:
                          'rgba(255,255,255,0.72)',
                        border:
                          '1px solid var(--borde)',
                        borderRadius: 14,
                        padding: '9px 11px',
                      }}
                    >
                      <span className="pill pill-rosa">
                        {emojiIngrediente(
                          item.nombre
                        )}{' '}
                        {item.nombre}
                      </span>

                      <span
                        className="pill"
                        style={{
                          background:
                            estado?.fondo,
                          color:
                            estado?.color,
                          border: `1px solid ${estado?.color}`,
                        }}
                      >
                        {estado?.texto}
                      </span>

                      <span className="pill pill-malva">
                        📦 {item.cantidad}
                        {item.unidad}
                      </span>
                    </div>
                  )
                }
              )}
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          titulo="🛒 Faltan para esta semana"
          subtitulo="Ingredientes detectados desde el planning."
          color="linear-gradient(135deg, #fffaf8, #f1f8e9)"
        >
          {paraComprar.length === 0 ? (
            <EmptyState texto="No parece faltar nada para el planning actual ✅" />
          ) : (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {paraComprar
                .slice(0, 8)
                .map((item) => (
                  <span
                    key={item.clave}
                    className="pill pill-naranja"
                  >
                    {emojiIngrediente(
                      item.nombre
                    )}{' '}
                    {item.cantidadFaltante ??
                      item.cantidad ??
                      ''}{' '}
                    {item.unidad ?? ''}{' '}
                    {item.nombre}
                  </span>
                ))}

              {paraComprar.length > 8 && (
                <span className="pill pill-malva">
                  +{paraComprar.length - 8}{' '}
                  más
                </span>
              )}
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          titulo="💜 Tus recetas favoritas"
          subtitulo="Recetas que has marcado o valorado alto."
          color="linear-gradient(135deg, #fff0f6, #f8f1ff)"
        >
          {favoritos.length === 0 ? (
            <EmptyState texto="Todavía no tienes recetas favoritas o muy valoradas 💕" />
          ) : (
            <div
              style={{
                display: 'grid',
                gap: 8,
              }}
            >
              {favoritos.map(
                (receta) => (
                  <button
                    key={receta.id}
                    type="button"
                    className="btn-secundario"
                    onClick={() =>
                      onAbrirReceta(
                        receta.id
                      )
                    }
                    style={{
                      justifyContent:
                        'space-between',
                      gap: 10,
                      textAlign: 'left',
                    }}
                  >
                    <span>
                      ⭐ {receta.nombre}
                    </span>

                    <span>
                      {'★'.repeat(
                        receta.valoracion || 0
                      )}
                    </span>
                  </button>
                )
              )}
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          titulo="🔥 Sugerencia"
          subtitulo="Una idea basada en tus recetas favoritas."
          color="linear-gradient(135deg, #fff8ee, #ffeaf4)"
        >
          {sugerencia ? (
            <button
              type="button"
              className="btn-principal"
              onClick={() =>
                onAbrirReceta(
                  sugerencia.id
                )
              }
              style={{
                justifyContent:
                  'flex-start',
                textAlign: 'left',
              }}
            >
              ✨ Hoy podría apetecerte:{' '}
              {sugerencia.nombre}
            </button>
          ) : (
            <EmptyState texto="Cuando tengas recetas favoritas, Rayku podrá sugerirte una aquí 💕" />
          )}
        </DashboardCard>
      </div>
    </div>
  )
}