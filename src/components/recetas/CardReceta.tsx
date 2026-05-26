import type { Receta } from '../../store'

import {
  emojiIngrediente,
  claseIngrediente,
} from '../../lib/ingredientes'

type Props = {
  receta: Receta

  onEditar: (
    receta: Receta
  ) => void

  onEliminar: (
    id: string
  ) => void

  onToggleFavorita: (
    id: string
  ) => void

  onDuplicar: (
    id: string
  ) => void
}

export default function CardReceta({
  receta,
  onEditar,
  onEliminar,
  onToggleFavorita,
  onDuplicar,
}: Props) {
  const estrellas = (
    n: number
  ) =>
    Array.from(
      { length: 5 },
      (_, i) =>
        i < n ? '⭐' : '☆'
    ).join('')

  return (
    <div
      className="card"
      style={{
        overflow: 'hidden',
      }}
    >
      {receta.imagen && (
        <img
          src={receta.imagen}
          alt={receta.nombre}
          style={{
            width: '100%',

            height: '220px',

            objectFit: 'cover',

            borderRadius: '18px',

            marginBottom: '16px',
          }}
        />
      )}

      <div
        style={{
          display: 'flex',

          justifyContent:
            'space-between',

          alignItems: 'start',

          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <h2
            style={{
              marginBottom: 8,
            }}
          >
            {receta.nombre}
          </h2>

          <div
            style={{
              display: 'flex',

              gap: 8,

              flexWrap: 'wrap',

              marginBottom: 10,
            }}
          >
            {[
              ...receta.tiposComida,
              ...receta.ingredientesBase,
              ...receta.dietas,
              ...receta.caracteristicas,
            ].map((tag) => (
              <span
                key={tag}
                className="pill pill-malva"
              >
                {tag}
              </span>
            ))}
          </div>

          <div
            style={{
              display: 'flex',

              gap: 10,

              flexWrap: 'wrap',

              color: '#8f7080',

              marginBottom: 10,

              fontWeight: 700,
            }}
          >
            {receta.tiempo > 0 && (
              <span>
                ⏱️{' '}
                {receta.tiempo}{' '}
                min
              </span>
            )}

            <span>
              🍽️{' '}
              {receta.raciones}{' '}
              raciones
            </span>

            <span>
              {receta.dificultad ===
                'Fácil' && '🌸'}

              {receta.dificultad ===
                'Media' && '✨'}

              {receta.dificultad ===
                'Elaborada' &&
                '👑'}{' '}
              {receta.dificultad}
            </span>
          </div>

          <div
            style={{
              marginBottom: 10,
              fontSize: 18,
            }}
          >
            {estrellas(
              receta.valoracion
            )}
          </div>

          {receta.ingredientes
            .length > 0 && (
            <div
              style={{
                display: 'flex',

                gap: 8,

                flexWrap:
                  'wrap',

                marginBottom: 10,
              }}
            >
              {receta.ingredientes.map(
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
                  >
                    {emojiIngrediente(
                      ingrediente
                    )}{' '}
                    {
                      ingrediente
                    }
                  </span>
                )
              )}
            </div>
          )}

          {receta.pasos && (
            <details
              style={{
                marginBottom: 8,
              }}
            >
              <summary
                style={{
                  cursor:
                    'pointer',

                  color:
                    '#c45b86',

                  fontWeight: 800,
                }}
              >
                👩‍🍳 Ver
                preparación
              </summary>

              <p
                style={{
                  whiteSpace:
                    'pre-wrap',

                  color:
                    '#8f7080',

                  marginTop: 8,
                }}
              >
                {receta.pasos}
              </p>
            </details>
          )}

          <p
            style={{
              color: '#8f7080',
            }}
          >
            📝{' '}
            {receta.nota ||
              'Sin nota 💕'}
          </p>
        </div>

        <div
          style={{
            display: 'flex',

            flexDirection:
              'column',

            gap: 10,
          }}
        >
          <button
            type="button"
            className="btn-secundario"
            onClick={() =>
              onToggleFavorita(
                receta.id
              )
            }
            title="Favorita"
          >
            {receta.favorita
              ? '❤️'
              : '🤍'}
          </button>

          <button
            type="button"
            className="btn-secundario"
            onClick={() =>
              onEditar(receta)
            }
            title="Editar"
          >
            ✏️
          </button>

          <button
            type="button"
            className="btn-secundario"
            onClick={() =>
              onDuplicar(
                receta.id
              )
            }
            title="Duplicar"
          >
            📄
          </button>

          <button
            type="button"
            className="btn-secundario"
            onClick={() =>
              onEliminar(
                receta.id
              )
            }
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}