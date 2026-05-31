type Props = {
  respuesta: string
}

function limpiarMarkdown(
  texto: string
) {
  return texto
    .replace(/^#{1,6}\s*/g, '')
    .replace(/\*\*/g, '')
    .replace(/^\*\s*/g, '')
    .trim()
}

function esTitulo(
  linea: string
) {
  return (
    linea.startsWith('###') ||
    linea.startsWith('##') ||
    linea.startsWith('#')
  )
}

function esRecetaNumerada(
  linea: string
) {
  return /^\d+\.\s/.test(
    linea.trim()
  )
}

function dividirRespuesta(
  respuesta: string
) {
  return respuesta
    .split('\n')
    .map((linea) =>
      linea.trim()
    )
    .filter(Boolean)
}

export default function ChefRaykuRespuesta({
  respuesta,
}: Props) {
  const lineas =
    dividirRespuesta(
      respuesta
    )

  if (lineas.length === 0) {
    return null
  }

  const intro: string[] = []
  const bloques: {
    titulo: string
    lineas: string[]
  }[] = []

  let bloqueActual:
    | {
        titulo: string
        lineas: string[]
      }
    | null = null

  lineas.forEach((linea) => {
    if (
      esTitulo(linea) ||
      esRecetaNumerada(linea)
    ) {
      if (bloqueActual) {
        bloques.push(
          bloqueActual
        )
      }

      bloqueActual = {
        titulo:
          limpiarMarkdown(
            linea
          ),
        lineas: [],
      }

      return
    }

    if (bloqueActual) {
      bloqueActual.lineas.push(
        limpiarMarkdown(linea)
      )
    } else {
      intro.push(
        limpiarMarkdown(linea)
      )
    }
  })

  if (bloqueActual) {
    bloques.push(
      bloqueActual
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
        marginTop: 14,
      }}
    >
      <div
        className="card"
        style={{
          background:
            'linear-gradient(135deg, #fff0f6, #fffafc)',
          borderColor: '#f5bfd2',
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start',
        }}
      >
        <img
          src="/rayku-chef.png"
          alt="Chef Rayku"
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid #f5bfd2',
            background: '#fff0f6',
            flexShrink: 0,
            boxShadow:
              '0 8px 18px rgba(180,120,150,0.14)',
          }}
        />

        <div>
          <h3
            style={{
              color: '#c45b86',
              fontSize: 22,
              marginBottom: 6,
              fontFamily:
                "'Comic Sans MS', 'Trebuchet MS', cursive",
            }}
          >
            Rayku al rescate ✨
          </h3>

          {intro.length > 0 ? (
            intro.map((linea) => (
              <p
                key={linea}
                style={{
                  color: '#70465b',
                  fontWeight: 800,
                  lineHeight: 1.55,
                  marginBottom: 6,
                }}
              >
                {linea}
              </p>
            ))
          ) : (
            <p
              style={{
                color: '#70465b',
                fontWeight: 800,
                lineHeight: 1.55,
              }}
            >
              Te dejo mis ideas más cuquis y útiles para hoy 💕
            </p>
          )}
        </div>
      </div>

      {bloques.map((bloque, index) => (
        <article
          key={`${bloque.titulo}-${index}`}
          className="card"
          style={{
            background:
              'linear-gradient(135deg, #ffffff, #fffafc)',
            borderColor: '#f5c8d8',
            boxShadow:
              '0 10px 24px rgba(180,120,150,0.10)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: 14,
              top: 12,
              opacity: 0.22,
              fontSize: 38,
            }}
          >
            💕
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg, #ff9ac2, #f5bfd2)',
                color: 'white',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
                fontSize: 18,
                flexShrink: 0,
                boxShadow:
                  '0 6px 14px rgba(196, 91, 134, 0.22)',
              }}
            >
              {index + 1}
            </span>

            <h3
              style={{
                color: '#d94f8d',
                fontSize: 20,
                margin: 0,
                lineHeight: 1.25,
                fontFamily:
                  "'Comic Sans MS', 'Trebuchet MS', cursive",
              }}
            >
              {bloque.titulo.replace(
                /^\d+\.\s*/,
                ''
              )}
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gap: 9,
            }}
          >
            {bloque.lineas.map(
              (linea, i) => (
                <div
                  key={`${linea}-${i}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '24px 1fr',
                    gap: 8,
                    alignItems:
                      'flex-start',
                    color: '#70465b',
                    fontWeight: 750,
                    lineHeight: 1.55,
                    fontSize: 15,
                  }}
                >
                  <span>
                    {linea
                      .toLowerCase()
                      .includes('ingrediente')
                      ? '🧺'
                      : linea
                            .toLowerCase()
                            .includes('caduca') ||
                          linea
                            .toLowerCase()
                            .includes('aprovecha')
                        ? '⚠️'
                        : linea
                              .toLowerCase()
                              .includes('tip')
                          ? '🐾'
                          : '💗'}
                  </span>

                  <span>
                    {linea}
                  </span>
                </div>
              )
            )}
          </div>
        </article>
      ))}
    </div>
  )
}