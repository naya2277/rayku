import {
  useMemo,
} from 'react'

import {
  useRaykuStore,
} from '../store'

import {
  emojiIngrediente,
} from '../lib/ingredientes'

import {
  calcularDiasCaducidad,
} from '../lib/inventario'

import {
  obtenerIngredientesUrgentes,
  obtenerRecetasChefRayku,
} from '../lib/chefRayku'

type Props = {
  onAbrirReceta: (
    recetaId: string
  ) => void
}

function estrellas(valor: number) {
  if (!valor) return 'Sin valorar'

  return '★'.repeat(valor)
}

export default function ChefRayku({
  onAbrirReceta,
}: Props) {
  const {
    recetas,
    inventario,
  } = useRaykuStore()

  const recetasChef =
    useMemo(
      () =>
        obtenerRecetasChefRayku(
          recetas,
          inventario
        ),
      [recetas, inventario]
    )

  const puedesCocinar =
    recetasChef
      .filter((item) => item.tieneTodo)
      .slice(0, 5)

  const faltaPoco =
    recetasChef
      .filter(
        (item) =>
          item.faltan.length === 1
      )
      .slice(0, 5)

  const urgentes =
    useMemo(
      () =>
        obtenerIngredientesUrgentes(
          inventario
        ).slice(0, 5),
      [inventario]
    )

  const favoritas =
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

  return (
    <div>
      <div
        className="card"
        style={{
          marginBottom: 18,
          background:
            'linear-gradient(135deg, #fff0f6, #fffaf8)',
          borderColor: '#f5c8d8',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 18,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #f5bfd2',
              background: '#fff0f6',
              flexShrink: 0,
              boxShadow:
                '0 10px 24px rgba(180,120,150,0.15)',
            }}
          >
            <img
              src="/rayku-chef.png"
              alt="Chef Rayku"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 220,
            }}
          >
            <h1
              style={{
                margin: 0,
                color: '#c45b86',
                fontSize: '2.15rem',
                fontWeight: 900,
                letterSpacing: '0.4px',
                fontFamily:
                  "'Comic Sans MS', 'Trebuchet MS', cursive",
              }}
            >
              Chef Rayku
            </h1>

            <p
              style={{
                marginTop: 2,
                marginBottom: 8,
                color: '#c45b86',
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              Tu ayudante de cocina 💕
            </p>

            <p
              style={{
                color: 'var(--txt2)',
                fontWeight: 800,
                marginTop: 6,
                lineHeight: 1.5,
              }}
            >
              ¡Guau! Con lo que tienes en casa puedo ayudarte a decidir qué cocinar hoy 🐾
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
        <section
          className="card"
          style={{
            background:
              'linear-gradient(135deg, #fffafc, #f1f8e9)',
          }}
        >
          <h2
            style={{
              color: '#c45b86',
              fontSize: 18,
              marginBottom: 4,
            }}
          >
            ✨ Puedes cocinar ahora
          </h2>

          <p
            style={{
              color: 'var(--txt2)',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Recetas para las que tienes todos los ingredientes.
          </p>

          {puedesCocinar.length === 0 ? (
            <p
              style={{
                color: 'var(--txt2)',
                fontWeight: 700,
              }}
            >
              Ahora mismo no veo recetas completas con el inventario actual 🛒
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: 8,
              }}
            >
              {puedesCocinar.map(
                ({ receta }) => (
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
                      🍽️ {receta.nombre}
                    </span>

                    <span
                      style={{
                        color: '#5f9f5f',
                        fontWeight: 900,
                      }}
                    >
                      ✅ Todo
                    </span>
                  </button>
                )
              )}
            </div>
          )}
        </section>

        <section
          className="card"
          style={{
            background:
              'linear-gradient(135deg, #fff8ee, #fffafc)',
          }}
        >
          <h2
            style={{
              color: '#a07030',
              fontSize: 18,
              marginBottom: 4,
            }}
          >
            🛒 Te falta muy poco
          </h2>

          <p
            style={{
              color: 'var(--txt2)',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Recetas para las que solo falta un ingrediente.
          </p>

          {faltaPoco.length === 0 ? (
            <p
              style={{
                color: 'var(--txt2)',
                fontWeight: 700,
              }}
            >
              No hay recetas a un ingrediente de distancia ahora mismo 🌸
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: 8,
              }}
            >
              {faltaPoco.map(
                ({
                  receta,
                  faltan,
                }) => (
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
                      🍳 {receta.nombre}
                    </span>

                    <span
                      style={{
                        color: '#d46a37',
                        fontWeight: 900,
                      }}
                    >
                      Falta:{' '}
                      {faltan[0]}
                    </span>
                  </button>
                )
              )}
            </div>
          )}
        </section>

        <section
          className="card"
          style={{
            background:
              'linear-gradient(135deg, #f8f1ff, #fffafc)',
          }}
        >
          <h2
            style={{
              color: '#8a6ec7',
              fontSize: 18,
              marginBottom: 4,
            }}
          >
            🥬 Consumir antes de caducar
          </h2>

          <p
            style={{
              color: 'var(--txt2)',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Ingredientes que conviene gastar pronto.
          </p>

          {urgentes.length === 0 ? (
            <p
              style={{
                color: 'var(--txt2)',
                fontWeight: 700,
              }}
            >
              No hay nada urgente por caducidad ahora mismo 💕
            </p>
          ) : (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {urgentes.map((item) => {
                const dias =
                  calcularDiasCaducidad(
                    item.fechaCaducidad
                  )

                return (
                  <span
                    key={item.id}
                    className="pill pill-naranja"
                  >
                    {emojiIngrediente(
                      item.nombre
                    )}{' '}
                    {item.nombre} ·{' '}
                    {dias === 0
                      ? 'caduca hoy'
                      : dias === 1
                        ? 'mañana'
                        : `${dias} días`}
                  </span>
                )
              })}
            </div>
          )}
        </section>

        <section
          className="card"
          style={{
            background:
              'linear-gradient(135deg, #fff0f6, #fffaf8)',
          }}
        >
          <h2
            style={{
              color: '#c45b86',
              fontSize: 18,
              marginBottom: 4,
            }}
          >
            💜 Priorizadas para ti
          </h2>

          <p
            style={{
              color: 'var(--txt2)',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Basado en tus favoritas y valoraciones.
          </p>

          {favoritas.length === 0 ? (
            <p
              style={{
                color: 'var(--txt2)',
                fontWeight: 700,
              }}
            >
              Marca recetas favoritas o pon estrellas para que Rayku aprenda tus gustos 🐾
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: 8,
              }}
            >
              {favoritas.map(
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
                      {estrellas(
                        receta.valoracion
                      )}
                    </span>
                  </button>
                )
              )}
            </div>
          )}
        </section>

        <section
          className="card"
          style={{
            background:
              'linear-gradient(135deg, #fffaf8, #fff0f6)',
            borderColor: '#f5c8d8',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <img
              src="/rayku-chef.png"
              alt="Rayku"
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #f5bfd2',
                background: '#fff0f6',
              }}
            />

            <h2
              style={{
                color: '#c45b86',
                fontSize: 18,
                margin: 0,
                fontFamily:
                  "'Comic Sans MS', 'Trebuchet MS', cursive",
              }}
            >
              Consejo de Rayku
            </h2>
          </div>

          <p
            style={{
              color: 'var(--txt2)',
              fontWeight: 800,
              lineHeight: 1.5,
            }}
          >
            Planifica tus comidas, aprovecha lo que tienes y deja que Rayku te ayude a desperdiciar menos 💕
          </p>
        </section>
      </div>
    </div>
  )
}