type IdeaChefRayku = {
  nombre?: string
  emoji?: string
  origen?: 'nueva' | 'guardada'
  motivo?: string
  ingredientes?: string[]
  pasos?: string
  raciones?: number
  tiempo?: number
  dificultad?: string
  dietas?: string[]
  caracteristicas?: string[]
  aprovecha?: string
  consejo?: string
}

type Props = {
  respuesta: string
  onGuardarReceta?: (
    idea: IdeaChefRayku
  ) => void
  recetasGuardadas?: string[]
}

type RespuestaChefRayku = {
  titulo?: string
  subtitulo?: string
  mensajeRayku?: string
  prioridad?: {
    titulo?: string
    texto?: string
  }
  ideas?: IdeaChefRayku[]
  notaFinal?: string
}

function limpiarJson(
  texto: string
) {
  return texto
    .trim()
    .replace(/^```json/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim()
}

function parsearRespuesta(
  respuesta: string
): RespuestaChefRayku | null {
  try {
    return JSON.parse(
      limpiarJson(respuesta)
    ) as RespuestaChefRayku
  } catch {
    return null
  }
}

function TextoFallback({
  respuesta,
}: {
  respuesta: string
}) {
  return (
    <div
      className="card"
      style={{
        marginTop: 14,
        background:
          'linear-gradient(135deg, #fffafc, #fff7fb)',
        borderColor: '#f5c8d8',
        whiteSpace: 'pre-wrap',
        color: '#70465b',
        lineHeight: 1.6,
        fontWeight: 700,
      }}
    >
      {respuesta}
    </div>
  )
}

function IngredienteChip({
  ingrediente,
}: {
  ingrediente: string
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 11px',
        borderRadius: 999,
        background:
          'linear-gradient(135deg, #fff0f6, #fffafc)',
        border: '1.5px solid #f5bfd2',
        color: '#b23f74',
        fontSize: 12,
        fontWeight: 950,
        boxShadow:
          '0 5px 12px rgba(196,91,134,0.08)',
      }}
    >
      🧺 {ingrediente}
    </span>
  )
}

function MiniBloque({
  icono,
  titulo,
  texto,
  fondo,
  borde,
  color,
}: {
  icono: string
  titulo: string
  texto?: string
  fondo: string
  borde: string
  color: string
}) {
  if (!texto) return null

  return (
    <div
      style={{
        background: fondo,
        border: `1.5px solid ${borde}`,
        borderRadius: 18,
        padding: '13px 14px',
        minHeight: 112,
        boxShadow:
          '0 8px 18px rgba(180,120,150,0.07)',
      }}
    >
      <div
        style={{
          color,
          fontSize: 14,
          fontWeight: 950,
          marginBottom: 7,
          fontFamily:
            "'Comic Sans MS', 'Trebuchet MS', cursive",
        }}
      >
        {icono} {titulo}
      </div>

      <p
        style={{
          margin: 0,
          color: '#5f3d50',
          fontWeight: 750,
          lineHeight: 1.55,
          fontSize: 14,
        }}
      >
        {texto}
      </p>
    </div>
  )
}

export default function ChefRaykuRespuesta({
  respuesta,
  onGuardarReceta,
  recetasGuardadas = [],
}: Props) {
  const datos =
    parsearRespuesta(respuesta)

  if (!datos) {
    return (
      <TextoFallback
        respuesta={respuesta}
      />
    )
  }

  const ideas =
    Array.isArray(datos.ideas)
      ? datos.ideas
      : []

  return (
    <div
      style={{
        marginTop: 18,
        borderRadius: 28,
        padding: '22px',
        position: 'relative',
        overflow: 'hidden',
        background:
          `
          radial-gradient(circle at 8% 5%, rgba(255, 180, 207, 0.32), transparent 18%),
          radial-gradient(circle at 96% 12%, rgba(255, 223, 150, 0.32), transparent 18%),
          linear-gradient(90deg, rgba(245, 191, 210, 0.18) 1px, transparent 1px),
          linear-gradient(rgba(245, 191, 210, 0.14) 1px, transparent 1px),
          linear-gradient(135deg, #fff8fb, #fffaf0)
          `,
        backgroundSize:
          'auto, auto, 28px 28px, 28px 28px, auto',
        border: '2px solid #f5bfd2',
        boxShadow:
          '0 18px 42px rgba(180,120,150,0.16)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 18,
          background:
            'repeating-linear-gradient(to bottom, #d6a06a 0 14px, #f6c68f 14px 24px)',
          opacity: 0.5,
        }}
      />

      <section
        style={{
          position: 'relative',
          marginLeft: 10,
          marginBottom: 18,
          display: 'grid',
          gridTemplateColumns:
            'minmax(90px, 120px) 1fr',
          gap: 18,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 112,
            height: 112,
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, #fff0f6, #ffe4ec)',
            border: '4px solid #f5bfd2',
            display: 'grid',
            placeItems: 'center',
            boxShadow:
              '0 12px 28px rgba(196,91,134,0.18)',
            overflow: 'hidden',
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

        <div>
          <h2
            style={{
              margin: 0,
              color: '#7b4a25',
              fontSize: 42,
              lineHeight: 1,
              fontFamily:
                "'Comic Sans MS', 'Trebuchet MS', cursive",
            }}
          >
            Chef{' '}
            <span
              style={{
                color: '#e25291',
              }}
            >
              Rayku
            </span>
          </h2>

          <div
            style={{
              display: 'inline-flex',
              marginTop: 10,
              padding: '8px 16px',
              borderRadius: 999,
              background:
                'linear-gradient(135deg, #ffd6e5, #fff0f6)',
              color: '#b23f74',
              border:
                '1.5px solid #f5bfd2',
              fontWeight: 950,
              fontSize: 14,
            }}
          >
            💕 tu ayudante de cocina keto 💕
          </div>

          {datos.subtitulo && (
            <p
              style={{
                marginTop: 12,
                color: '#70465b',
                fontWeight: 850,
                lineHeight: 1.45,
              }}
            >
              {datos.subtitulo}
            </p>
          )}
        </div>
      </section>

      {datos.mensajeRayku && (
        <section
          style={{
            position: 'relative',
            marginLeft: 10,
            marginBottom: 18,
            background:
              'rgba(255,255,255,0.78)',
            border:
              '1.8px solid #f5c8d8',
            borderRadius: 24,
            padding: '18px 20px',
            boxShadow:
              '0 10px 22px rgba(180,120,150,0.08)',
          }}
        >
          <h3
            style={{
              color: '#e25291',
              fontSize: 20,
              marginBottom: 8,
              fontFamily:
                "'Comic Sans MS', 'Trebuchet MS', cursive",
            }}
          >
            ¡Hola, corazón! 💕
          </h3>

          <p
            style={{
              color: '#5f3d50',
              fontWeight: 800,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {datos.mensajeRayku}
          </p>
        </section>
      )}

      {(datos.prioridad?.titulo ||
        datos.prioridad?.texto) && (
        <section
          style={{
            position: 'relative',
            marginLeft: 10,
            marginBottom: 20,
            background:
              'linear-gradient(135deg, #fff3d8, #fffaf0)',
            border:
              '2px dashed #f1b35d',
            borderRadius: 24,
            padding: '18px 20px',
            display: 'grid',
            gridTemplateColumns:
              '72px 1fr',
            gap: 16,
            alignItems: 'center',
            boxShadow:
              '0 12px 26px rgba(210,145,55,0.10)',
          }}
        >
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: 20,
              background:
                'linear-gradient(135deg, #ffe3a8, #fff8ee)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 38,
              boxShadow:
                '0 8px 18px rgba(210,145,55,0.12)',
            }}
          >
            🌟
          </div>

          <div>
            <div
              style={{
                color: '#d36a22',
                fontSize: 15,
                fontWeight: 950,
                marginBottom: 5,
              }}
            >
              PRIORIDAD DE HOY
            </div>

            <h3
              style={{
                margin: 0,
                color: '#7b4a25',
                fontSize: 22,
                lineHeight: 1.2,
                fontFamily:
                  "'Comic Sans MS', 'Trebuchet MS', cursive",
              }}
            >
              {datos.prioridad?.titulo}
            </h3>

            {datos.prioridad?.texto && (
              <p
                style={{
                  color: '#5f3d50',
                  fontWeight: 800,
                  lineHeight: 1.5,
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                {datos.prioridad.texto}
              </p>
            )}
          </div>
        </section>
      )}

      <div
        style={{
          position: 'relative',
          marginLeft: 10,
          display: 'grid',
          gap: 20,
        }}
      >
        {ideas.map((idea, index) => {
          const esNueva =
            idea.origen === 'nueva'

          const yaGuardada =
            Boolean(
              idea.nombre &&
                recetasGuardadas.includes(
                  idea.nombre
                )
            )

          return (
            <article
              key={`${idea.nombre}-${index}`}
              style={{
                position: 'relative',
                background:
                  index % 2 === 0
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.92), #fff0f6)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.92), #f8f1ff)',
                border:
                  index % 2 === 0
                    ? '2px solid #f5bfd2'
                    : '2px solid #d7c3f3',
                borderRadius: 26,
                padding: '22px',
                boxShadow:
                  '0 16px 34px rgba(180,120,150,0.13)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 16,
                  top: 14,
                  fontSize: 58,
                  opacity: 0.15,
                }}
              >
                {idea.emoji || '🍽️'}
              </div>

              <header
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '60px 1fr',
                  gap: 14,
                  alignItems: 'center',
                  marginBottom: 16,
                  paddingRight: 40,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg, #ffd6e5, #f4d7ff)',
                    border:
                      '2px solid rgba(255,255,255,0.85)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 30,
                    boxShadow:
                      '0 10px 22px rgba(196,91,134,0.17)',
                  }}
                >
                  {idea.emoji || '🍽️'}
                </div>

                <div>
                  <span
                    style={{
                      display: 'inline-flex',
                      background:
                        esNueva
                          ? '#e25291'
                          : '#9b6fd3',
                      color: 'white',
                      borderRadius: 999,
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 950,
                      marginBottom: 6,
                    }}
                  >
                    {esNueva
                      ? 'Idea nueva de Chef Rayku'
                      : 'Receta guardada'}
                  </span>

                  <h3
                    style={{
                      color:
                        index % 2 === 0
                          ? '#e25291'
                          : '#9b6fd3',
                      fontSize: 25,
                      margin: 0,
                      lineHeight: 1.12,
                      fontFamily:
                        "'Comic Sans MS', 'Trebuchet MS', cursive",
                    }}
                  >
                    {idea.nombre ||
                      'Idea rica de Rayku'}
                  </h3>
                </div>
              </header>

              <MiniBloque
                icono="💕"
                titulo="Por qué encaja"
                texto={idea.motivo}
                fondo="rgba(255,255,255,0.74)"
                borde="#f5c8d8"
                color="#e25291"
              />

              <div
                style={{
                  marginTop: 12,
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 12,
                }}
              >
                {Array.isArray(
                  idea.ingredientes
                ) &&
                  idea.ingredientes.length >
                    0 && (
                    <div
                      style={{
                        background:
                          'rgba(255,255,255,0.74)',
                        border:
                          '1.5px solid #f5c8d8',
                        borderRadius: 18,
                        padding: '13px 14px',
                        minHeight: 112,
                      }}
                    >
                      <div
                        style={{
                          color: '#e25291',
                          fontSize: 14,
                          fontWeight: 950,
                          marginBottom: 9,
                          fontFamily:
                            "'Comic Sans MS', 'Trebuchet MS', cursive",
                        }}
                      >
                        🧺 Ingredientes principales
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        {idea.ingredientes.map(
                          (ingrediente) => (
                            <IngredienteChip
                              key={ingrediente}
                              ingrediente={
                                ingrediente
                              }
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}

                <MiniBloque
                  icono="🌿"
                  titulo="Aprovecha"
                  texto={idea.aprovecha}
                  fondo="linear-gradient(135deg, #fbfff2, #ffffff)"
                  borde="#d9eab8"
                  color="#6f9f65"
                />

                <MiniBloque
                  icono="🐾"
                  titulo="Consejito de Rayku"
                  texto={idea.consejo}
                  fondo="linear-gradient(135deg, #fbf7ff, #ffffff)"
                  borde="#d7c3f3"
                  color="#8a6ec7"
                />
              </div>

              {esNueva && onGuardarReceta && (
                <button
                  type="button"
                  className={
                    yaGuardada
                      ? 'btn-secundario'
                      : 'btn-principal'
                  }
                  disabled={yaGuardada}
                  onClick={() =>
                    onGuardarReceta(idea)
                  }
                  style={{
                    marginTop: 16,
                    opacity: yaGuardada
                      ? 0.7
                      : 1,
                  }}
                >
                  {yaGuardada
                    ? '✅ Receta guardada'
                    : '💾 Guardar receta'}
                </button>
              )}
            </article>
          )
        })}
      </div>

      {datos.notaFinal && (
        <section
          style={{
            position: 'relative',
            marginLeft: 10,
            marginTop: 20,
            background:
              'rgba(255,255,255,0.8)',
            border:
              '1.8px solid #f5c8d8',
            borderRadius: 24,
            padding: '16px 20px',
            textAlign: 'center',
            boxShadow:
              '0 10px 22px rgba(180,120,150,0.08)',
          }}
        >
          <p
            style={{
              color: '#9b3f68',
              fontWeight: 950,
              lineHeight: 1.5,
              margin: 0,
              fontFamily:
                "'Comic Sans MS', 'Trebuchet MS', cursive",
            }}
          >
            💗 {datos.notaFinal}
          </p>
        </section>
      )}
    </div>
  )
}